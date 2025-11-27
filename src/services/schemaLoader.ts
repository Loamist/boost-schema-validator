import { EntityExample, EntityDictionary, FullSchema } from '../types'

const BASE_URL = import.meta.env.BASE_URL || '/'

// Cache for loaded data
const schemaCache = new Map<string, FullSchema>()
const examplesCache = new Map<string, EntityExample[]>()
const dictionaryCache = new Map<string, EntityDictionary>()
let entityListCache: string[] | null = null

/**
 * Convert PascalCase entity name to snake_case directory name
 */
function toSnakeCase(entityName: string): string {
  return entityName
    .replace(/([A-Z])/g, (_match, p1, offset) =>
      offset > 0 ? '_' + p1.toLowerCase() : p1.toLowerCase()
    )
}

/**
 * Get list of available entities
 */
export async function getEntityList(): Promise<string[]> {
  if (entityListCache) {
    return entityListCache
  }

  const response = await fetch(`${BASE_URL}schemas/index.json`)
  if (!response.ok) {
    throw new Error('Failed to load entity list')
  }

  const data = await response.json()
  entityListCache = data.entities
  return entityListCache!
}

/**
 * Load schema for a specific entity
 */
export async function loadEntitySchema(entityName: string): Promise<FullSchema> {
  const cached = schemaCache.get(entityName)
  if (cached) {
    return cached
  }

  const dirName = toSnakeCase(entityName)
  const response = await fetch(`${BASE_URL}schemas/${dirName}/validation_schema.json`)

  if (!response.ok) {
    throw new Error(`Failed to load schema for ${entityName}`)
  }

  const schema = await response.json()
  schemaCache.set(entityName, schema)
  return schema
}

/**
 * Load all examples for a specific entity
 */
export async function loadEntityExamples(entityName: string): Promise<EntityExample[]> {
  const cached = examplesCache.get(entityName)
  if (cached) {
    return cached
  }

  const dirName = toSnakeCase(entityName)

  try {
    // Load the examples index for this entity
    const response = await fetch(`${BASE_URL}schemas/${dirName}/examples/index.json`)

    if (!response.ok) {
      // No examples available
      return []
    }

    const examplesList: { name: string; filename: string }[] = await response.json()

    // Load each example
    const examples: EntityExample[] = await Promise.all(
      examplesList.map(async (ex) => {
        const exResponse = await fetch(`${BASE_URL}schemas/${dirName}/examples/${ex.filename}.json`)
        const data = await exResponse.json()
        return {
          name: ex.name,
          filename: ex.filename,
          data
        }
      })
    )

    examplesCache.set(entityName, examples)
    return examples
  } catch {
    return []
  }
}

/**
 * Load dictionary for a specific entity
 */
export async function loadEntityDictionary(entityName: string): Promise<EntityDictionary> {
  const cached = dictionaryCache.get(entityName)
  if (cached) {
    return cached
  }

  const dirName = toSnakeCase(entityName)

  try {
    const response = await fetch(`${BASE_URL}schemas/${dirName}/dictionary.json`)

    if (!response.ok) {
      return { overview: '', fields: {}, error: 'Dictionary not found' }
    }

    const dictionary = await response.json()
    dictionaryCache.set(entityName, dictionary)
    return dictionary
  } catch {
    return { overview: '', fields: {}, error: 'Failed to load dictionary' }
  }
}

/**
 * Clear all caches (useful for development)
 */
export function clearSchemaCache(): void {
  schemaCache.clear()
  examplesCache.clear()
  dictionaryCache.clear()
  entityListCache = null
}
