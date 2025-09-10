/**
 * Field Formatting Utilities
 * Handles formatting and display of field values and types
 */

/**
 * Get the display type of a field value
 */
export function getFieldType(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return `array[${value.length}]`;
    if (typeof value === 'object') return 'object';
    if (typeof value === 'string') {
        if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) return 'datetime';
        if (value.match(/^[A-Z]+-[A-Z0-9-]+$/)) return 'id';
        return 'string';
    }
    return typeof value;
}

/**
 * Format a field value for display in the table
 */
export function formatFieldValue(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') {
        if (value.length > 100) return value.substring(0, 97) + '...';
        return `"${value}"`;
    }
    if (Array.isArray(value)) {
        if (value.length === 0) return '[]';
        if (value.length <= 3) {
            return JSON.stringify(value);
        }
        return `[${value.length} items]`;
    }
    if (typeof value === 'object') {
        const keys = Object.keys(value);
        if (keys.length <= 3) {
            return JSON.stringify(value, null, 2);
        }
        return `{${keys.length} properties}`;
    }
    return String(value);
}

/**
 * Get CSS class for value styling based on type
 */
export function getValueClass(value) {
    const type = typeof value;
    if (value === null) return 'null';
    if (Array.isArray(value) || (type === 'object' && value !== null)) return 'complex';
    return type; // 'string', 'number', 'boolean'
}

/**
 * Get a user-friendly display name for a field
 */
export function getDisplayName(fieldName, fieldPath) {
    // If it's a top-level field, just use the name
    if (!fieldPath.includes('.')) {
        return fieldName;
    }
    
    // For nested fields, show the path with proper formatting
    const pathParts = fieldPath.split('.');
    
    // Special handling for common nested patterns
    if (pathParts.length === 2) {
        const parent = pathParts[0];
        const child = pathParts[1];
        
        // Make nested field names more readable
        const parentMap = {
            'physicalArrangement': 'Physical',
            'alternativeFateMetrics': 'Fate',
            'carbonImpact': 'Carbon',
            'secondaryIdentifiers': 'Secondary'
        };
        
        const shortParent = parentMap[parent] || parent;
        return `${shortParent}.${child}`;
    }
    
    // For deeper nesting, show the full path but abbreviated
    if (pathParts.length > 2) {
        const lastTwo = pathParts.slice(-2);
        return `...${lastTwo[0]}.${lastTwo[1]}`;
    }
    
    return fieldPath;
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}