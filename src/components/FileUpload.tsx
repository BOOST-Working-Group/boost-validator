import { useRef, useState } from 'react'
import { parseCsv } from '../utils/csvParser'

interface FileUploadProps {
  // Receives a pretty-printed JSON string ready for the editor + validator.
  onLoad: (json: string) => void
}

type Status = { kind: 'info' | 'error'; text: string }

export default function FileUpload({ onLoad }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [status, setStatus] = useState<Status | null>(null)

  const handleFile = async (file: File) => {
    setStatus(null)
    const name = file.name.toLowerCase()

    let text: string
    try {
      text = await file.text()
    } catch {
      setStatus({ kind: 'error', text: `Could not read ${file.name}.` })
      return
    }

    if (name.endsWith('.json')) {
      try {
        const parsed = JSON.parse(text)
        onLoad(JSON.stringify(parsed, null, 2))
        setStatus({ kind: 'info', text: `Loaded ${file.name}.` })
      } catch {
        setStatus({ kind: 'error', text: `${file.name} is not valid JSON.` })
      }
      return
    }

    if (name.endsWith('.csv')) {
      const { records } = parseCsv(text)
      if (records.length === 0) {
        setStatus({ kind: 'error', text: `No data rows found in ${file.name}.` })
        return
      }
      onLoad(JSON.stringify(records[0], null, 2))
      setStatus({
        kind: 'info',
        text:
          records.length > 1
            ? `Loaded record 1 of ${records.length} from ${file.name}. Validating one record at a time for now — multi-record batch validation is handled by the validation API in a later phase.`
            : `Loaded 1 record from ${file.name}.`,
      })
      return
    }

    setStatus({ kind: 'error', text: 'Unsupported file type. Upload a .json or .csv file.' })
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="card bg-base-100 shadow-xl border-l-4 border-primary">
      <div className="card-body">
        <h2 className="card-title text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          Upload Data
        </h2>

        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-primary bg-primary/5' : 'border-base-300 hover:border-primary'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h10a4 4 0 004-4M7 10l5-5m0 0l5 5m-5-5v12" />
          </svg>
          <p className="font-medium">Drag a file here, or click to browse</p>
          <p className="text-sm text-base-content/60">Accepts a single .json or .csv file</p>
          <input
            ref={inputRef}
            type="file"
            accept=".json,.csv,application/json,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
              e.target.value = '' // allow re-selecting the same file
            }}
          />
        </div>

        {status && (
          <div className={`alert ${status.kind === 'error' ? 'alert-error' : 'alert-info'} mt-3 py-2 text-sm`}>
            <span>{status.text}</span>
          </div>
        )}
      </div>
    </div>
  )
}
