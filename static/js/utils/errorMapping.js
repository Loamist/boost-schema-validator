/**
 * Error Mapping Utilities
 * Extracts field names from validation error messages and maps them to fields
 */

/**
 * Extract field name from validation error message
 */
export function extractFieldFromError(errorMessage) {
    // Try to extract field names from common error patterns
    const patterns = [
        /property '([^']+)'/i,
        /field '([^']+)'/i,
        /Required field '([^']+)'/i,
        /'([^']+)' is missing/i,
        /\$\.([a-zA-Z_][a-zA-Z0-9_]*)/,
        /property "([^"]+)"/i
    ];

    for (const pattern of patterns) {
        const match = errorMessage.match(pattern);
        if (match) return match[1];
    }

    return null;
}

/**
 * Create a map of field paths to their validation errors
 */
export function createErrorMap(errors) {
    const errorMap = {};
    
    errors.forEach(error => {
        const fieldPath = extractFieldFromError(error);
        if (fieldPath) {
            if (!errorMap[fieldPath]) errorMap[fieldPath] = [];
            errorMap[fieldPath].push(error);
        }
    });

    return errorMap;
}