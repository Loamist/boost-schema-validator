interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
  onValidate: () => void
  onClear: () => void
  onFormat: () => void
  isValidating: boolean
  canValidate: boolean
}

export default function JsonEditor({
  value,
  onChange,
  onValidate,
  onClear,
  onFormat,
  isValidating,
  canValidate
}: JsonEditorProps) {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body p-0">
        {/* Editor Header */}
        <div className="bg-base-200 px-6 py-3 border-b border-base-300 flex justify-between items-center">
          <h3 className="text-base font-semibold text-primary flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Entity JSON Data
          </h3>
          <div className="flex items-center gap-2">
            <button
              className={`btn btn-primary btn-sm gap-1.5 px-4 h-10 min-h-10 ${!canValidate ? 'btn-disabled' : ''}`}
              onClick={onValidate}
              disabled={!canValidate || isValidating}
            >
              {isValidating ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>Validate</span>
            </button>
            <button
              className="btn btn-ghost btn-sm px-3 h-10 min-h-10"
              onClick={onClear}
            >
              Clear
            </button>
            <button
              className="btn btn-ghost btn-sm px-3 h-10 min-h-10"
              onClick={onFormat}
            >
              Format JSON
            </button>
          </div>
        </div>

        {/* Editor Textarea */}
        <textarea
          className="textarea w-full h-96 font-mono text-sm leading-relaxed rounded-none border-none focus:outline-none resize-none bg-base-100 p-4"
          placeholder="Select an entity and load an example, or paste your JSON data here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}
