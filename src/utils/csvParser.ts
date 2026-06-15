// Minimal CSV parser for the upload walking skeleton. Handles quoted
// fields, embedded commas, and escaped double-quotes ("") per RFC 4180,
// and lightly coerces numbers/booleans so loaded records validate
// sensibly against typed schemas.
//
// Robust ingestion (large/streaming files, delimiter sniffing, nested
// objects, per-field type mapping) belongs in the server-side /validate
// API (ADR-001 decision 2), not in this client-side helper.

export interface CsvParseResult {
  records: Record<string, unknown>[]
  headers: string[]
}

export function parseCsv(text: string): CsvParseResult {
  const rows = splitRows(text)
  if (rows.length === 0) return { records: [], headers: [] }

  const headers = rows[0].map((h) => h.trim())
  const records = rows
    .slice(1)
    .filter((cells) => cells.some((cell) => cell.trim() !== '')) // skip blank lines
    .map((cells) => {
      const obj: Record<string, unknown> = {}
      headers.forEach((h, i) => {
        obj[h] = coerce(cells[i] ?? '')
      })
      return obj
    })

  return { records, headers }
}

// Field-state machine: walks the text once, respecting quoted regions.
function splitRows(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\r') {
      // ignore; newline handled on \n
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += c
    }
  }

  // Flush the trailing field/row when the file has no final newline.
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows
}

function coerce(raw: string): unknown {
  const t = raw.trim()
  if (t === '') return ''
  if (t === 'true') return true
  if (t === 'false') return false
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t)
  return raw
}
