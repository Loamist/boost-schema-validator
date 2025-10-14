/**
 * FieldParser - Parses JSON objects into field definitions for table display
 */
import { getFieldType, formatFieldValue, getValueClass, getDisplayName } from '../utils/fieldFormatting.js';
import { getFieldImportance } from '../utils/fieldImportance.js';

export class FieldParser {
    /**
     * Parse a JSON object into an array of field definitions
     */
    static parseJsonFields(obj, prefix = '', fields = []) {
        for (const [key, value] of Object.entries(obj)) {
            const fieldPath = prefix ? `${prefix}.${key}` : key;

            // Skip @context nested properties - treat @context as a single field
            if (key === '@context' && typeof value === 'object') {
                const field = {
                    name: key,
                    path: fieldPath,
                    displayName: getDisplayName(key, fieldPath),
                    value: value,
                    type: getFieldType(value),
                    displayValue: formatFieldValue(value, key),
                    valueClass: getValueClass(value),
                    importance: getFieldImportance(key, prefix)
                };
                fields.push(field);
                continue; // Skip recursive parsing for @context
            }

            const field = {
                name: key,
                path: fieldPath,
                displayName: getDisplayName(key, fieldPath),
                value: value,
                type: getFieldType(value),
                displayValue: formatFieldValue(value, key),
                valueClass: getValueClass(value),
                importance: getFieldImportance(key, prefix)
            };

            fields.push(field);

            // Recursively parse nested objects (but not arrays for simplicity)
            // Skip @context and other JSON-LD metadata fields
            if (value && typeof value === 'object' && !Array.isArray(value) && key !== '@context') {
                FieldParser.parseJsonFields(value, fieldPath, fields);
            }
        }
        
        // Sort fields by importance (higher numbers first), then by display name
        return fields.sort((a, b) => {
            if (a.importance !== b.importance) {
                return b.importance - a.importance; // Higher importance first
            }
            return a.displayName.localeCompare(b.displayName); // Alphabetical for same importance
        });
    }

    /**
     * Get field statistics from parsed fields
     */
    static getFieldStats(fields, errorMap = {}) {
        let errorCount = 0;
        let validCount = 0;

        fields.forEach(field => {
            const hasError = errorMap[field.path] && errorMap[field.path].length > 0;
            if (hasError) {
                errorCount++;
            } else {
                validCount++;
            }
        });

        return {
            total: fields.length,
            valid: validCount,
            errors: errorCount
        };
    }
}