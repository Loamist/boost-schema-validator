import { useState, useEffect } from 'react'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import EntitySelector from './components/EntitySelector'
import JsonEditor from './components/JsonEditor'
import ValidationResults from './components/ValidationResults'
import EntityRepresentation from './components/EntityRepresentation'
import DataGapAnalysis from './components/DataGapAnalysis'
import FieldTable from './components/FieldTable'
import { getEntityList, loadEntitySchema, loadEntityDictionary } from './services/schemaLoader'
import { ValidationResult, EntitySchema, EntityDictionary } from './types'

function App() {
  const [entities, setEntities] = useState<string[]>([])
  const [currentEntity, setCurrentEntity] = useState<string>('')
  const [jsonData, setJsonData] = useState<string>('')
  const [parsedData, setParsedData] = useState<Record<string, unknown> | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [currentSchema, setCurrentSchema] = useState<EntitySchema | null>(null)
  const [currentDictionary, setCurrentDictionary] = useState<EntityDictionary | null>(null)

  // Load entities on mount
  useEffect(() => {
    const loadEntities = async () => {
      try {
        const entityList = await getEntityList()
        setEntities(entityList)
      } catch (error) {
        console.error('Failed to load entities:', error)
      }
    }
    loadEntities()
  }, [])

  // Check if current entity is an LCFS entity (for gap analysis)
  const isLcfsEntity = currentEntity.toLowerCase().includes('lcfs')

  const handleValidate = async () => {
    if (!currentEntity || !jsonData) return

    setIsValidating(true)
    try {
      // Parse JSON first
      const parsed = JSON.parse(jsonData)
      setParsedData(parsed)

      // Load schema and dictionary in parallel
      const [fullSchema, dictionary] = await Promise.all([
        loadEntitySchema(currentEntity),
        loadEntityDictionary(currentEntity)
      ])
      setCurrentSchema(fullSchema.schema)
      setCurrentDictionary(dictionary)

      // Import validator dynamically to keep initial bundle small
      const { validateEntity } = await import('./services/validator')
      const result = await validateEntity(currentEntity, parsed)
      setValidationResult(result)
    } catch (error) {
      if (error instanceof SyntaxError) {
        setValidationResult({
          valid: false,
          schema_valid: false,
          business_rules_valid: false,
          errors: [{ type: 'other', field: 'root', message: `Invalid JSON: ${error.message}` }],
          errors_by_type: { other: [{ type: 'other', field: 'root', message: `Invalid JSON: ${error.message}` }] },
          message: 'JSON parsing failed'
        })
      } else {
        console.error('Validation error:', error)
      }
    } finally {
      setIsValidating(false)
    }
  }

  const handleClear = () => {
    setJsonData('')
    setParsedData(null)
    setValidationResult(null)
    setCurrentSchema(null)
    setCurrentDictionary(null)
  }

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonData)
      setJsonData(JSON.stringify(parsed, null, 2))
    } catch {
      // Invalid JSON, can't format
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Header />

      <main className="space-y-6">
        {/* Entity Selector */}
        <EntitySelector
          entities={entities}
          currentEntity={currentEntity}
          onEntityChange={setCurrentEntity}
          onJsonLoad={setJsonData}
        />

        {/* Grid Layout for Editor and Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* JSON Editor */}
          <JsonEditor
            value={jsonData}
            onChange={setJsonData}
            onValidate={handleValidate}
            onClear={handleClear}
            onFormat={handleFormat}
            isValidating={isValidating}
            canValidate={!!currentEntity && !!jsonData}
          />

          {/* Validation Results */}
          <ValidationResults
            result={validationResult}
            isValidating={isValidating}
            entityName={currentEntity}
            parsedData={parsedData}
          />
        </div>

        {/* Entity Representation (shown after validation) */}
        {validationResult && parsedData && (
          <EntityRepresentation
            entityName={currentEntity}
            data={parsedData}
          />
        )}

        {/* Field Analysis Table (shown after validation) */}
        {validationResult && parsedData && (
          <section className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Field Analysis
              </h3>
              <FieldTable
                data={parsedData}
                validationResult={validationResult}
                dictionary={currentDictionary || undefined}
                schema={currentSchema ? {
                  required: currentSchema.required,
                  properties: currentSchema.properties as Record<string, unknown>
                } : undefined}
              />
            </div>
          </section>
        )}

        {/* Gap Analysis for LCFS entities */}
        {validationResult && parsedData && isLcfsEntity && (
          <DataGapAnalysis
            entityName={currentEntity}
            data={parsedData}
            validationResult={validationResult}
            schema={currentSchema ? {
              required: currentSchema.required,
              properties: currentSchema.properties as Record<string, unknown>
            } : undefined}
          />
        )}
      </main>

      <Footer />
    </div>
  )
}

export default App
