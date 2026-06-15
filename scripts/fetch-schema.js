#!/usr/bin/env node

/**
 * Schema Fetch Script
 *
 * Downloads the BOOST schema from GitHub and saves it locally.
 * This creates a local copy that can be committed to the repository,
 * removing the need for external dependencies at build time.
 *
 * Usage: node scripts/fetch-schema.js [--ref <tag>]
 *
 * Options:
 *   --ref <tag>  The release tag to fetch from (default: v3.4.2).
 *                Alias: --tag. Pin to a published release, not a
 *                moving branch (ADR-001 decision 5).
 */

import { createWriteStream, createReadStream, existsSync, mkdirSync, rmSync, readdirSync, cpSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { pipeline } from 'stream/promises'
import { createGunzip } from 'zlib'
import { extract } from 'tar'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuration
const GITHUB_REPO = 'BOOST-Working-Group/BOOST'
// Pin to a published release tag (ADR-001 decision 5) so the validator
// ships against a frozen schema while upstream main keeps moving. This
// is what makes the Sep 1–Nov 30 schema freeze enforceable in code.
const DEFAULT_REF = 'v3.4.2'
const SCHEMA_PATH = 'drafts/current/schema'
const OUTPUT_DIR = join(__dirname, '../schema')
const TEMP_DIR = join(__dirname, '../.schema-temp')

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2)
  let ref = DEFAULT_REF

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--ref' || args[i] === '--tag') && args[i + 1]) {
      ref = args[i + 1]
      i++
    }
  }

  return { ref }
}

/**
 * Download file from URL
 */
async function downloadFile(url, destPath) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'boost-schema-validator'
    },
    redirect: 'follow'
  })

  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`)
  }

  const fileStream = createWriteStream(destPath)
  await pipeline(response.body, fileStream)
}

/**
 * Extract tarball and get schema directory
 */
async function extractSchema(tarballPath, ref) {
  const extractDir = join(TEMP_DIR, 'extracted')

  // Create extraction subdirectory
  if (existsSync(extractDir)) {
    rmSync(extractDir, { recursive: true, force: true })
  }
  mkdirSync(extractDir, { recursive: true })

  // Extract the tarball
  await pipeline(
    createReadStream(tarballPath),
    createGunzip(),
    extract({
      cwd: extractDir,
      filter: (path) => {
        // Only extract files from the schema directory
        // Tarball structure: BOOST-<ref>/drafts/current/schema/...
        const parts = path.split('/')
        // Allow the path if it starts with the schema path (after repo root dir)
        const pathAfterRoot = parts.slice(1).join('/')
        return pathAfterRoot.startsWith(SCHEMA_PATH) || pathAfterRoot === '' ||
               SCHEMA_PATH.startsWith(pathAfterRoot.replace(/\/$/, ''))
      }
    })
  )

  // Find the extracted directory (BOOST-<ref>, e.g. BOOST-3.4.2)
  const extractedDirs = readdirSync(extractDir)

  if (extractedDirs.length === 0) {
    throw new Error('No files extracted from the repository')
  }

  const repoDir = extractedDirs[0]
  const extractedSchemaPath = join(extractDir, repoDir, SCHEMA_PATH)

  if (!existsSync(extractedSchemaPath)) {
    throw new Error(`Schema directory not found at ${extractedSchemaPath}`)
  }

  return extractedSchemaPath
}

/**
 * Copy directory recursively
 */
function copyDirectory(src, dest) {
  cpSync(src, dest, { recursive: true })
}

/**
 * Main function
 */
async function main() {
  const { ref } = parseArgs()
  const tarballUrl = `https://github.com/${GITHUB_REPO}/archive/refs/tags/${ref}.tar.gz`
  const tarballPath = join(TEMP_DIR, 'boost.tar.gz')

  console.log('🚀 Fetching BOOST schema from GitHub...\n')
  console.log(`   Repository: ${GITHUB_REPO}`)
  console.log(`   Ref (tag): ${ref}`)
  console.log(`   Schema path: ${SCHEMA_PATH}`)
  console.log(`   URL: ${tarballUrl}\n`)

  try {
    // Create temp directory
    if (existsSync(TEMP_DIR)) {
      rmSync(TEMP_DIR, { recursive: true, force: true })
    }
    mkdirSync(TEMP_DIR, { recursive: true })

    // Download tarball
    console.log('📥 Downloading repository archive...')
    await downloadFile(tarballUrl, tarballPath)
    console.log('   ✓ Download complete\n')

    // Extract schema
    console.log('📦 Extracting schema directory...')
    const extractedSchemaPath = await extractSchema(tarballPath, ref)
    console.log('   ✓ Extraction complete\n')

    // Clear existing schema directory
    if (existsSync(OUTPUT_DIR)) {
      console.log('🧹 Clearing existing schema directory...')
      rmSync(OUTPUT_DIR, { recursive: true, force: true })
    }

    // Copy schema to output directory
    console.log('📋 Copying schema to project...')
    await copyDirectory(extractedSchemaPath, OUTPUT_DIR)
    console.log(`   ✓ Schema saved to: ${OUTPUT_DIR}\n`)

    // Cleanup temp directory
    rmSync(TEMP_DIR, { recursive: true, force: true })

    console.log('✅ Schema fetch complete!')
    console.log('\nNext steps:')
    console.log('   1. Run "npm run prepare-schemas" to generate the React app schemas')
    console.log('   2. Commit the schema directory to version control')

  } catch (error) {
    // Cleanup on error
    if (existsSync(TEMP_DIR)) {
      rmSync(TEMP_DIR, { recursive: true, force: true })
    }
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

// Run
main()
