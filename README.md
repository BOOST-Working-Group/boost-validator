# BOOST Validator

A web application for validating BOOST entity schemas with LCFS compliance tracking.

> **Provenance.** This tool began as [Loamist/boost-schema-validator](https://github.com/Loamist/boost-schema-validator) (MIT) and is maintained here by the BOOST Working Group. Continued development of the validation infrastructure — file upload, a server-side validation API, and regulatory sufficiency checks — is funded by the California Board of Forestry Joint Institute grant. See [BOOST_ATTRIBUTION.md](BOOST_ATTRIBUTION.md).

## Features

- **Entity Selection**: Choose from 36 BOOST entities with example data
- **Real-time Validation**: Instant JSON Schema validation with detailed error reporting
- **LCFS Compliance**: Dual status display showing LCFS (CARB) compliance vs BOOST schema validity
- **Data Gap Analysis**: Side-by-side comparison of AFP requirements vs BOOST enhancements
- **Multiple Views**: Field table, plain text summary, and raw JSON views

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173

## Build for Production

```bash
npm run build
```

Output goes to `dist/` folder - ready for static hosting.

## Project Structure

```
├── src/
│   ├── components/       # React components
│   ├── services/         # Schema loading & validation
│   ├── utils/            # Formatting & helper functions
│   └── types/            # TypeScript definitions
├── schema/               # BOOST schemas (fetched from GitHub)
├── public/schemas/       # Processed schemas (generated at build)
├── scripts/              # Build scripts
└── index.html            # Entry point
```

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + DaisyUI
- Ajv (JSON Schema validation)

## Schema Management

The `schema/` directory contains a local copy of the BOOST schemas from [BOOST-Working-Group/BOOST](https://github.com/BOOST-Working-Group/BOOST), pinned to a published release tag (currently `v3.4.2`). This copy is committed to the repository so no external dependencies are required at build time, and pinning to a tag keeps the validator stable while upstream `main` continues to evolve.

### Updating Schemas

To re-fetch the pinned release schemas from GitHub:

```bash
npm run fetch-schema           # fetches the default pinned tag (v3.4.2)
npm run fetch-schema -- --ref v3.4.3   # or pin to a different release
```

This downloads schemas from `BOOST-Working-Group/BOOST` at the given release tag (path: `drafts/current/schema`) and saves them to `./schema/`. To move the default pin, edit `DEFAULT_REF` in `scripts/fetch-schema.js`.

To update and rebuild in one step:

```bash
npm run update-schema
```

### How It Works

1. `npm run fetch-schema` - Downloads schemas from GitHub → `./schema/`
2. `npm run prepare-schemas` - Processes `./schema/` → `./public/schemas/` (runs automatically on dev/build)
3. The app loads schemas from `./public/schemas/` at runtime

## License

See [LICENSE](LICENSE) and [BOOST_ATTRIBUTION.md](BOOST_ATTRIBUTION.md).
