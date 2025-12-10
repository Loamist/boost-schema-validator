import { useState, useEffect } from 'react'
import { loadEntityExamples, loadEntitySchema } from '../services/schemaLoader'
import { EntityExample } from '../types'

interface EntitySelectorProps {
  entities: string[]
  currentEntity: string
  onEntityChange: (entity: string) => void
  onJsonLoad: (json: string) => void
}

export default function EntitySelector({
  entities,
  currentEntity,
  onEntityChange,
  onJsonLoad
}: EntitySelectorProps) {
  const [examples, setExamples] = useState<EntityExample[]>([])
  const [showSchemaModal, setShowSchemaModal] = useState(false)
  const [schemaContent, setSchemaContent] = useState<string>('')

  // Load examples when entity changes
  useEffect(() => {
    if (!currentEntity) {
      setExamples([])
      return
    }

    const loadExamples = async () => {
      try {
        const exampleList = await loadEntityExamples(currentEntity)
        setExamples(exampleList)
      } catch {
        setExamples([])
      }
    }
    loadExamples()
  }, [currentEntity])

  const handleEntityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onEntityChange(e.target.value)
  }

  const handleExampleLoad = (example: EntityExample) => {
    onJsonLoad(JSON.stringify(example.data, null, 2))
  }

  const handleViewSchema = async () => {
    if (!currentEntity) return

    try {
      const fullSchema = await loadEntitySchema(currentEntity)
      setSchemaContent(JSON.stringify(fullSchema.schema || fullSchema, null, 2))
      setShowSchemaModal(true)
    } catch (error) {
      console.error('Failed to load schema:', error)
    }
  }

  return (
    <>
      <div className="card bg-base-100 shadow-xl border-l-4 border-primary">
        <div className="card-body">
          <h2 className="card-title text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Select Entity
          </h2>

          <div className="form-control w-full">
            <label className="label" htmlFor="entitySelect">
              <span className="label-text font-semibold">Choose a BOOST entity to validate:</span>
            </label>
            <select
              id="entitySelect"
              className="select select-bordered select-primary w-full"
              value={currentEntity}
              onChange={handleEntityChange}
            >
              <option value="">Select an entity...</option>
              {entities.map((entity) => (
                <option key={entity} value={entity}>
                  {entity}
                </option>
              ))}
            </select>
          </div>

          <div className="card-actions justify-end mt-4 gap-2">
            {/* Example Dropdown */}
            <div className="dropdown dropdown-top">
              <label
                tabIndex={0}
                className={`btn btn-outline btn-primary ${!currentEntity || examples.length === 0 ? 'btn-disabled' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Load Example
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </label>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-72 max-h-96 overflow-y-auto absolute z-50 bottom-full mb-2">
                {examples.map((example) => (
                  <li key={example.filename}>
                    <button onClick={() => handleExampleLoad(example)}>
                      {example.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* View Schema Button */}
            <button
              className={`btn btn-outline btn-primary ${!currentEntity ? 'btn-disabled' : ''}`}
              onClick={handleViewSchema}
              disabled={!currentEntity}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Schema
            </button>
          </div>
        </div>
      </div>

      {/* Schema Modal */}
      <dialog id="schemaModal" className={`modal ${showSchemaModal ? 'modal-open' : ''}`}>
        <div className="modal-box max-w-4xl">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => setShowSchemaModal(false)}
          >
            ✕
          </button>
          <h3 className="font-bold text-lg text-primary mb-4">{currentEntity} Schema</h3>
          <div className="modal-body">
            <pre className="bg-base-200 p-4 rounded-lg overflow-x-auto text-sm max-h-96">
              {schemaContent}
            </pre>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setShowSchemaModal(false)}>close</button>
        </form>
      </dialog>
    </>
  )
}
