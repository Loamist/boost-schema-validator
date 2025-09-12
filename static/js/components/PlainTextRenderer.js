/**
 * PlainTextRenderer - Converts JSON to plain English descriptions
 * Removes technical jargon and makes data accessible to non-technical users
 */

export class PlainTextRenderer {
    constructor() {
        this.fieldTranslations = this.initializeFieldTranslations();
        this.valueFormatters = this.initializeValueFormatters();
    }

    /**
     * Initialize field name translations from technical to plain English
     */
    initializeFieldTranslations() {
        return {
            // TraceableUnit specific translations
            'traceableUnitId': 'Unit ID',
            'unitType': 'Unit Type',
            'uniqueIdentifier': 'Primary Identifier',
            'identificationMethodId': 'Identification Method',
            'identificationConfidence': 'Identification Confidence',
            'secondaryIdentifiers': 'Backup Identifiers',
            'methodReadinessLevel': 'Technology Readiness Level',
            'totalVolumeM3': 'Total Volume',
            'currentGeographicDataId': 'Current Location',
            'harvestGeographicDataId': 'Harvest Location',
            'createdTimestamp': 'Created Date',
            'harvesterId': 'Harvester',
            'operatorId': 'Operator',
            'materialTypeId': 'Material Type',
            'productClassification': 'Product Classification',
            'qualityGrade': 'Quality Grade',
            'physicalArrangement': 'Physical Arrangement',
            'alternativeFateMetrics': 'Alternative Fate Metrics',
            'isMultiSpecies': 'Multi-Species',
            'attachedInformation': 'Attached Information',
            'processingHistory': 'Processing History',
            'currentStatus': 'Status',
            'sustainabilityCertification': 'Sustainability Certification',
            'lastUpdated': 'Last Updated',
            
            // Common fields across entities
            '@context': 'Context',
            '@type': 'Type',
            '@id': 'Global ID'
        };
    }

    /**
     * Initialize value formatters for different data types
     */
    initializeValueFormatters() {
        return {
            // Volume formatting
            'totalVolumeM3': (value) => `${value} cubic meters`,
            
            // Confidence as percentage
            'identificationConfidence': (value) => `${value}%`,
            
            // Technology readiness level
            'methodReadinessLevel': (value) => `Level ${value} (Scale 1-9)`,
            
            // Boolean formatting
            'isMultiSpecies': (value) => value ? 'Yes' : 'No',
            'groundContact': (value) => value ? 'Yes' : 'No',
            
            // Date formatting
            'createdTimestamp': (value) => this.formatDate(value),
            'lastUpdated': (value) => this.formatDate(value),
            'harvestDate': (value) => this.formatDate(value),
            
            // Unit type enum translations
            'unitType': (value) => this.formatUnitType(value),
            
            // Status translations
            'currentStatus': (value) => this.capitalizeFirst(value),
            
            // Array formatting
            'attachedInformation': (value) => Array.isArray(value) ? value.join(', ') : value,
            'processingHistory': (value) => Array.isArray(value) ? `${value.length} processing steps` : value,
            
            // Secondary identifiers
            'secondaryIdentifiers': (value) => this.formatSecondaryIdentifiers(value)
        };
    }

    /**
     * Convert JSON data to plain text representation
     */
    convertToPlainText(jsonData, entityName = null) {
        if (!jsonData || typeof jsonData !== 'object') {
            return 'No data to display';
        }

        const plainTextLines = [];
        
        // Add entity header if provided
        if (entityName) {
            plainTextLines.push(`=== ${entityName} ===\n`);
        }

        // Process each field
        Object.entries(jsonData).forEach(([key, value]) => {
            if (this.shouldSkipField(key, value)) {
                return;
            }

            const translatedKey = this.translateFieldName(key);
            const formattedValue = this.formatValue(key, value);
            
            plainTextLines.push(`${translatedKey}: ${formattedValue}`);
        });

        return plainTextLines.join('\n');
    }

    /**
     * Determine if a field should be skipped in plain text view
     */
    shouldSkipField(key, value) {
        // Skip context fields that are too technical
        if (key === '@context') return true;
        
        // Skip null or undefined values
        if (value === null || value === undefined) return true;
        
        // Skip empty arrays
        if (Array.isArray(value) && value.length === 0) return true;
        
        // Skip empty strings
        if (typeof value === 'string' && value.trim() === '') return true;
        
        return false;
    }

    /**
     * Translate technical field names to plain English
     */
    translateFieldName(fieldName) {
        return this.fieldTranslations[fieldName] || this.humanizeFieldName(fieldName);
    }

    /**
     * Convert camelCase/snake_case to human readable format
     */
    humanizeFieldName(fieldName) {
        return fieldName
            .replace(/([A-Z])/g, ' $1') // Add space before capitals
            .replace(/_/g, ' ') // Replace underscores with spaces
            .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
            .trim();
    }

    /**
     * Format values based on their field type
     */
    formatValue(fieldName, value) {
        // Use custom formatter if available
        if (this.valueFormatters[fieldName]) {
            return this.valueFormatters[fieldName](value);
        }

        // Handle different value types
        if (typeof value === 'object' && value !== null) {
            return this.formatObjectValue(value);
        }

        if (Array.isArray(value)) {
            return this.formatArrayValue(value);
        }

        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }

        if (typeof value === 'string') {
            return this.formatStringValue(value);
        }

        return String(value);
    }

    /**
     * Format object values
     */
    formatObjectValue(obj) {
        if (obj.arrangementType) {
            // Physical arrangement object
            const parts = [];
            if (obj.arrangementType) parts.push(`Type: ${this.capitalizeFirst(obj.arrangementType)}`);
            if (obj.exposureConditions) parts.push(`Conditions: ${obj.exposureConditions}`);
            if (obj.groundContact !== undefined) parts.push(`Ground contact: ${obj.groundContact ? 'Yes' : 'No'}`);
            return parts.join(', ');
        }

        if (obj.identifierType) {
            // Secondary identifier object
            return `${obj.identifierType.toUpperCase()}: ${obj.identifierValue} (${obj.confidence}% confidence)`;
        }

        // Generic object formatting
        const pairs = Object.entries(obj)
            .filter(([k, v]) => v !== null && v !== undefined)
            .map(([k, v]) => `${this.humanizeFieldName(k)}: ${v}`)
            .slice(0, 3); // Limit to first 3 properties
        
        return pairs.join(', ');
    }

    /**
     * Format array values
     */
    formatArrayValue(arr) {
        if (arr.length === 0) return 'None';
        
        if (arr.length === 1) {
            return typeof arr[0] === 'object' ? this.formatObjectValue(arr[0]) : String(arr[0]);
        }
        
        if (arr.every(item => typeof item === 'string')) {
            return arr.join(', ');
        }
        
        return `${arr.length} items`;
    }

    /**
     * Format string values
     */
    formatStringValue(value) {
        // Handle foreign key references - these need special formatting
        if (this.isForeignKeyReference(value)) {
            return this.formatForeignKeyReference(value);
        }

        // Format enum-like values (with underscores)
        if (value.includes('_')) {
            return value.split('_').map(word => this.capitalizeFirst(word)).join(' ');
        }

        return value;
    }

    /**
     * Check if a value is a foreign key reference
     */
    isForeignKeyReference(value) {
        const foreignKeyPrefixes = [
            'GEO-', 'ORG-', 'MAT-', 'OP-', 'IM-', 'CERT-', 'TXN-', 'PH-'
        ];
        return foreignKeyPrefixes.some(prefix => value.startsWith(prefix));
    }

    /**
     * Format foreign key references with context
     */
    formatForeignKeyReference(value) {
        const referenceTypes = {
            'GEO-': 'Location',
            'ORG-': 'Organization', 
            'MAT-': 'Material Type',
            'OP-': 'Operator',
            'IM-': 'ID Method',
            'CERT-': 'Certificate',
            'TXN-': 'Transaction',
            'PH-': 'Process'
        };

        for (const [prefix, type] of Object.entries(referenceTypes)) {
            if (value.startsWith(prefix)) {
                const cleanValue = value.replace(prefix, '').replace(/-/g, ' ');
                return `${cleanValue} (${type} Reference: ${value})`;
            }
        }

        return value;
    }

    /**
     * Format unit type enums
     */
    formatUnitType(value) {
        const typeMap = {
            'individual_log': 'Individual Log',
            'pile': 'Pile',
            'volume_aggregation': 'Volume Aggregation', 
            'processed_batch': 'Processed Batch'
        };
        return typeMap[value] || this.capitalizeFirst(value.replace('_', ' '));
    }

    /**
     * Format secondary identifiers array
     */
    formatSecondaryIdentifiers(identifiers) {
        if (!Array.isArray(identifiers) || identifiers.length === 0) {
            return 'None';
        }
        
        return identifiers
            .map(id => `${id.identifierType.toUpperCase()}: ${id.identifierValue} (${id.confidence}%)`)
            .join(', ');
    }

    /**
     * Format date strings
     */
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    }

    /**
     * Capitalize first letter of a string
     */
    capitalizeFirst(str) {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
}