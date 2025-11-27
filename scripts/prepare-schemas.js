#!/usr/bin/env node

/**
 * Schema Preparation Script
 *
 * Prepares BOOST schemas for the static React app by:
 * 1. Copying schemas from the BOOST repository
 * 2. Generating an index.json with entity list
 * 3. Converting dictionary .md files to .json format
 * 4. Organizing examples
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
  statSync,
  rmSync
} from 'fs'
import { join, basename } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Possible schema source locations
const SCHEMA_SOURCES = [
  join(__dirname, '../../BOOST/schema'),
  join(__dirname, '../schema'),
  '/app/schema' // Docker
]

// Output directory
const OUTPUT_DIR = join(__dirname, '../public/schemas')

/**
 * Find the schema source directory
 */
function findSchemaSource() {
  for (const source of SCHEMA_SOURCES) {
    if (existsSync(source)) {
      console.log(`📁 Found schema source: ${source}`)
      return source
    }
  }
  throw new Error('Schema source not found. Checked: ' + SCHEMA_SOURCES.join(', '))
}

/**
 * Convert snake_case to PascalCase
 */
function toPascalCase(str) {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

/**
 * Format example filename to user-friendly name
 */
function formatExampleName(filename, entityPrefix) {
  // Remove entity prefix
  let name = filename.replace(`${entityPrefix}_`, '')

  // Special formatting for known suffixes
  const nameMap = {
    'example': 'Standard Example',
    'carb_minimal': 'CARB Minimal (Required Fields Only)',
    'afp_example': 'AFP Submission Example',
    'marathon_q2_2025': 'Marathon Q2 2025'
  }

  return nameMap[name] || name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

/**
 * Parse dictionary markdown into JSON
 */
function parseDictionaryMarkdown(content) {
  const lines = content.split('\n')
  let overview = ''
  let inOverview = false
  const fields = {}
  let inTable = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Extract overview section
    if (line.trim() === '### Overview') {
      inOverview = true
      continue
    } else if (line.startsWith('###') && inOverview) {
      inOverview = false
    } else if (inOverview && line.trim()) {
      overview += line.trim() + ' '
    }

    // Parse field table
    if (line.includes('<table class="data">')) {
      inTable = true
      continue
    } else if (line.includes('</table>')) {
      inTable = false
      continue
    }

    if (inTable && line.trim().startsWith('<tr>')) {
      // Parse table row
      const fieldData = []
      let j = i + 1
      while (j < lines.length && !lines[j].trim().startsWith('</tr>')) {
        const cellMatch = lines[j].match(/<td>([^<]+)/)
        if (cellMatch) {
          let cellContent = cellMatch[1].trim()
          // Remove markdown backticks
          cellContent = cellContent.replace(/`/g, '')
          fieldData.push(cellContent)
        }
        j++
      }

      // Store field information if we have enough data
      if (fieldData.length >= 4) {
        const fieldName = fieldData[0]
        fields[fieldName] = {
          type: fieldData[1],
          required: ['yes', 'required', 'true'].includes(fieldData[2].toLowerCase()),
          description: fieldData[3],
          examples: fieldData[4] || ''
        }
      }
    }
  }

  return {
    overview: overview.trim(),
    fields
  }
}

/**
 * Process a single entity directory
 */
function processEntity(sourceDir, entityDir, outputDir) {
  const entityPath = join(sourceDir, entityDir)
  const entityOutputPath = join(outputDir, entityDir)
  const examplesOutputPath = join(entityOutputPath, 'examples')

  // Create output directories
  mkdirSync(entityOutputPath, { recursive: true })
  mkdirSync(examplesOutputPath, { recursive: true })

  const files = readdirSync(entityPath)
  const examples = []

  for (const file of files) {
    const filePath = join(entityPath, file)
    const stat = statSync(filePath)

    if (!stat.isFile()) continue

    if (file === 'validation_schema.json') {
      // Copy schema file
      copyFileSync(filePath, join(entityOutputPath, file))
    } else if (file.endsWith('_dictionary.md')) {
      // Convert dictionary to JSON
      try {
        const content = readFileSync(filePath, 'utf-8')
        const dictionary = parseDictionaryMarkdown(content)
        writeFileSync(
          join(entityOutputPath, 'dictionary.json'),
          JSON.stringify(dictionary, null, 2)
        )
      } catch (e) {
        console.warn(`  ⚠️  Could not parse dictionary: ${file}`)
      }
    } else if (file.endsWith('.json') && file !== 'validation_schema.json') {
      // Copy example file
      const exampleName = basename(file, '.json')
      copyFileSync(filePath, join(examplesOutputPath, file))
      examples.push({
        name: formatExampleName(exampleName, entityDir),
        filename: exampleName
      })
    }
  }

  // Write examples index
  if (examples.length > 0) {
    writeFileSync(
      join(examplesOutputPath, 'index.json'),
      JSON.stringify(examples, null, 2)
    )
  }

  return toPascalCase(entityDir)
}

/**
 * Main function
 */
function main() {
  console.log('🚀 Preparing schemas for static build...\n')

  // Find schema source
  const sourceDir = findSchemaSource()

  // Clear and create output directory
  if (existsSync(OUTPUT_DIR)) {
    console.log('🧹 Cleaning existing schemas directory...')
    rmSync(OUTPUT_DIR, { recursive: true, force: true })
  }
  mkdirSync(OUTPUT_DIR, { recursive: true })

  // Get all entity directories
  const items = readdirSync(sourceDir)
  const entities = []

  for (const item of items) {
    const itemPath = join(sourceDir, item)
    const stat = statSync(itemPath)

    if (stat.isDirectory()) {
      // Check if it has a validation_schema.json
      if (existsSync(join(itemPath, 'validation_schema.json'))) {
        console.log(`📋 Processing: ${item}`)
        const entityName = processEntity(sourceDir, item, OUTPUT_DIR)
        entities.push(entityName)
      }
    }
  }

  // Sort entities alphabetically
  entities.sort()

  // Write entity index
  writeFileSync(
    join(OUTPUT_DIR, 'index.json'),
    JSON.stringify({ entities }, null, 2)
  )

  console.log(`\n✅ Prepared ${entities.length} entities`)
  console.log(`📁 Output directory: ${OUTPUT_DIR}`)
}

// Run
main()
