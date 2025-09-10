// BOOST Schema Validator JavaScript
class BOOSTValidator {
    constructor() {
        this.baseUrl = '';
        this.entities = [];
        this.currentEntity = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadEntities();
    }

    setupEventListeners() {
        // Entity selector
        document.getElementById('entitySelect').addEventListener('change', (e) => {
            this.handleEntityChange(e.target.value);
        });

        // Buttons
        document.getElementById('loadExampleBtn').addEventListener('click', () => {
            this.loadExample();
        });

        document.getElementById('loadSchemaBtn').addEventListener('click', () => {
            this.showSchema();
        });

        document.getElementById('validateBtn').addEventListener('click', () => {
            this.validateData();
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearEditor();
        });

        document.getElementById('formatBtn').addEventListener('click', () => {
            this.formatJSON();
        });

        // Modal close
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('schemaModal')) {
                this.closeModal();
            }
        });

        // Auto-resize textarea
        const editor = document.getElementById('jsonEditor');
        editor.addEventListener('input', () => {
            this.updateValidateButton();
        });

        // Tab switching
        document.getElementById('summaryTab').addEventListener('click', () => {
            this.switchTab('summary');
        });

        document.getElementById('tableTab').addEventListener('click', () => {
            this.switchTab('table');
        });

        // Show errors only filter
        document.getElementById('showErrorsOnly').addEventListener('change', () => {
            this.filterFieldTable();
        });
    }

    async loadEntities() {
        try {
            const response = await fetch('/api/entities');
            const data = await response.json();
            
            if (data.entities) {
                this.entities = data.entities;
                this.populateEntitySelect();
            } else {
                this.showError('Failed to load entities: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            this.showError('Failed to connect to server: ' + error.message);
        }
    }

    populateEntitySelect() {
        const select = document.getElementById('entitySelect');
        select.innerHTML = '<option value="">Select an entity...</option>';
        
        this.entities.forEach(entity => {
            const option = document.createElement('option');
            option.value = entity;
            option.textContent = entity;
            select.appendChild(option);
        });
    }

    handleEntityChange(entityName) {
        this.currentEntity = entityName;
        const hasEntity = entityName !== '';
        
        document.getElementById('loadExampleBtn').disabled = !hasEntity;
        document.getElementById('loadSchemaBtn').disabled = !hasEntity;
        
        this.updateValidateButton();
        this.clearResults();
    }

    async loadExample() {
        if (!this.currentEntity) return;

        try {
            this.setStatus('loading', 'Loading example...');
            const response = await fetch(`/api/entity/${this.currentEntity}/example`);
            const data = await response.json();
            
            if (data.error) {
                this.showError('No example available: ' + data.error);
                this.setStatus('ready', 'Ready to validate');
                return;
            }

            const editor = document.getElementById('jsonEditor');
            editor.value = JSON.stringify(data, null, 2);
            this.updateValidateButton();
            this.setStatus('ready', 'Example loaded - ready to validate');
            
        } catch (error) {
            this.showError('Failed to load example: ' + error.message);
            this.setStatus('ready', 'Ready to validate');
        }
    }

    async showSchema() {
        if (!this.currentEntity) return;

        try {
            const response = await fetch(`/api/entity/${this.currentEntity}/schema`);
            const data = await response.json();
            
            if (data.error) {
                this.showError('Failed to load schema: ' + data.error);
                return;
            }

            document.getElementById('schemaModalTitle').textContent = `${this.currentEntity} Schema`;
            document.getElementById('schemaContent').textContent = JSON.stringify(data, null, 2);
            document.getElementById('schemaModal').style.display = 'block';
            
        } catch (error) {
            this.showError('Failed to load schema: ' + error.message);
        }
    }

    closeModal() {
        document.getElementById('schemaModal').style.display = 'none';
    }

    async validateData() {
        if (!this.currentEntity) return;

        const editor = document.getElementById('jsonEditor');
        const jsonText = editor.value.trim();
        
        if (!jsonText) {
            this.showError('Please enter JSON data to validate');
            return;
        }

        let testData;
        try {
            testData = JSON.parse(jsonText);
        } catch (error) {
            this.showError('Invalid JSON format: ' + error.message);
            return;
        }

        try {
            this.setStatus('validating', 'Validating...');
            
            const response = await fetch('/api/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    entity_name: this.currentEntity,
                    test_data: testData
                })
            });

            const result = await response.json();
            
            if (result.error) {
                this.showError('Validation error: ' + result.error);
                this.setStatus('ready', 'Ready to validate');
                return;
            }

            this.displayResults(result);
            this.setStatus(result.valid ? 'valid' : 'invalid', 
                          result.valid ? 'Validation passed!' : 'Validation failed');
            
        } catch (error) {
            this.showError('Failed to validate: ' + error.message);
            this.setStatus('ready', 'Ready to validate');
        }
    }

    displayResults(result) {
        const container = document.getElementById('resultsContainer');
        
        const resultHtml = `
            <div class="validation-result">
                <div class="result-summary ${result.valid ? 'success' : 'error'}">
                    <span class="result-icon">${result.valid ? '✅' : '❌'}</span>
                    <span>${result.message}</span>
                </div>
                
                <div class="result-details">
                    <div class="result-section">
                        <h4>Schema Validation</h4>
                        <div class="status-item ${result.schema_valid ? 'success' : 'error'}">
                            ${result.schema_valid ? '✅ Valid' : '❌ Invalid'}
                        </div>
                    </div>
                    
                    <div class="result-section">
                        <h4>Business Rules</h4>
                        <div class="status-item ${result.business_rules_valid ? 'success' : 'error'}">
                            ${result.business_rules_valid ? '✅ Valid' : '❌ Invalid'}
                        </div>
                    </div>
                    
                    ${result.errors && result.errors.length > 0 ? `
                        <div class="result-section">
                            <h4>Errors (${result.errors.length})</h4>
                            <ul class="error-list">
                                ${result.errors.map(error => `<li>${this.escapeHtml(error)}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        container.innerHTML = resultHtml;
    }

    clearEditor() {
        document.getElementById('jsonEditor').value = '';
        this.updateValidateButton();
        this.clearResults();
        this.setStatus('ready', 'Ready to validate');
    }

    formatJSON() {
        const editor = document.getElementById('jsonEditor');
        const jsonText = editor.value.trim();
        
        if (!jsonText) return;

        try {
            const parsed = JSON.parse(jsonText);
            editor.value = JSON.stringify(parsed, null, 2);
        } catch (error) {
            this.showError('Cannot format invalid JSON: ' + error.message);
        }
    }

    clearResults() {
        const container = document.getElementById('resultsContainer');
        container.innerHTML = `
            <div class="placeholder">
                <p>🧪 Select an entity and click "Validate" to see results</p>
            </div>
        `;
    }

    updateValidateButton() {
        const hasEntity = !!this.currentEntity;
        const hasData = document.getElementById('jsonEditor').value.trim() !== '';
        document.getElementById('validateBtn').disabled = !hasEntity || !hasData;
    }

    setStatus(type, message) {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-text');
        
        statusDot.className = 'status-dot';
        if (type !== 'ready') {
            statusDot.classList.add(type);
        }
        
        statusText.textContent = message;
    }

    showError(message) {
        const container = document.getElementById('resultsContainer');
        container.innerHTML = `
            <div class="validation-result">
                <div class="result-summary error">
                    <span class="result-icon">❌</span>
                    <span>Error</span>
                </div>
                <div class="result-details">
                    <div class="result-section">
                        <ul class="error-list">
                            <li>${this.escapeHtml(message)}</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========================================= //
    // NEW FEATURE: Field Table Functionality   //
    // ========================================= //

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(tabName + 'Tab').classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName + 'View').classList.add('active');
    }

    generateFieldTable(jsonData, validationResult, schema = null) {
        const fields = this.parseJsonFields(jsonData, '', []);
        const errorMap = this.createErrorMap(validationResult.errors || []);
        const requiredFields = schema?.required || [];
        
        let errorCount = 0;
        let validCount = 0;

        const tableRows = fields.map(field => {
            const hasError = errorMap[field.path] && errorMap[field.path].length > 0;
            const isRequired = requiredFields.includes(field.name);
            
            if (hasError) errorCount++;
            else validCount++;

            const statusIcon = hasError 
                ? '<span class="status-icon error">❌</span>'
                : '<span class="status-icon valid">✅</span>';

            const fieldNameClass = isRequired ? 'field-name required' : 'field-name';
            const rowClass = hasError ? 'error-row' : '';

            const fieldErrors = hasError 
                ? errorMap[field.path].map(error => 
                    `<div class="error-message">${this.escapeHtml(error)}</div>`
                  ).join('')
                : '';

            return `
                <tr class="${rowClass}" data-field-path="${field.path}">
                    <td class="field-status">${statusIcon}</td>
                    <td class="${fieldNameClass}">${this.escapeHtml(field.displayName)}</td>
                    <td class="field-value ${field.valueClass}">${this.escapeHtml(field.displayValue)}</td>
                    <td class="field-type">${field.type}</td>
                    <td class="field-errors">${fieldErrors}</td>
                </tr>
            `;
        }).join('');

        const summaryHtml = `
            <div class="field-summary">
                <span class="field-count">📊 ${fields.length} fields total</span>
                <span class="valid-count">✅ ${validCount} valid</span>
                <span class="error-count">❌ ${errorCount} errors</span>
            </div>
        `;

        const tableHtml = `
            ${summaryHtml}
            <table class="field-table">
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Field Name</th>
                        <th>Value</th>
                        <th>Type</th>
                        <th>Errors</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        `;

        document.getElementById('fieldTableContainer').innerHTML = tableHtml;
        this.currentFieldData = { fields, errorMap };
    }

    parseJsonFields(obj, prefix = '', fields = []) {
        for (const [key, value] of Object.entries(obj)) {
            const fieldPath = prefix ? `${prefix}.${key}` : key;
            const field = {
                name: key,
                path: fieldPath,
                displayName: this.getDisplayName(key, fieldPath),
                value: value,
                type: this.getFieldType(value),
                displayValue: this.formatFieldValue(value),
                valueClass: this.getValueClass(value),
                importance: this.getFieldImportance(key, prefix)
            };
            
            fields.push(field);

            // Recursively parse nested objects (but not arrays for simplicity)
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                this.parseJsonFields(value, fieldPath, fields);
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

    getDisplayName(fieldName, fieldPath) {
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

    getFieldImportance(fieldName, prefix = '') {
        // Define importance levels (1-10, 10 being most important)
        const importanceMap = {
            // Critical identification fields (10)
            '@type': 10,
            '@id': 10,
            'traceableUnitId': 10,
            'organizationId': 10,
            
            // Core business identifiers (9)
            'uniqueIdentifier': 9,
            'harvesterId': 9,
            'materialTypeId': 9,
            'identificationMethodId': 9,
            
            // Key operational fields (8)
            'unitType': 8,
            'totalVolumeM3': 8,
            'createdTimestamp': 8,
            'identificationConfidence': 8,
            
            // Geographic and tracking (7)
            'harvestGeographicDataId': 7,
            'currentGeographicDataId': 7,
            'operatorId': 7,
            'currentStatus': 7,
            
            // Business classification (6)
            'productClassification': 6,
            'qualityGrade': 6,
            'isMultiSpecies': 6,
            'methodReadinessLevel': 6,
            
            // Processing and history (5)
            'processingHistory': 5,
            'parentTraceableUnitId': 5,
            'childTraceableUnitIds': 5,
            'sustainabilityCertification': 5,
            
            // Context fields (4)
            '@context': 4,
            'organizationName': 4,
            'organizationType': 4,
            'certificateId': 4,
            
            // Secondary identifiers (3)
            'secondaryIdentifiers': 3,
            'attachedInformation': 3,
            'mediaBreakFlags': 3,
            
            // Detailed metadata (2)
            'physicalArrangement': 2,
            'alternativeFateMetrics': 2,
            'lastUpdated': 2,
            
            // Nested object fields get lower priority (1)
            'arrangementType': 1,
            'arrangementDate': 1,
            'exposureConditions': 1,
            'groundContact': 1,
            'baselineScenario': 1,
            'annualDecayRate': 1,
            'collectionEfficiency': 1,
            'carbonImpact': 1,
            'soilCarbonChange': 1,
            'emissionsAvoided': 1,
            'identifierType': 1,
            'identifierValue': 1,
            'confidence': 1
        };
        
        // Check for exact field name match
        if (importanceMap[fieldName] !== undefined) {
            return importanceMap[fieldName];
        }
        
        // Check for pattern-based importance
        if (fieldName.endsWith('Id')) return 8; // ID fields are generally important
        if (fieldName.endsWith('Timestamp') || fieldName.endsWith('Date')) return 6;
        if (fieldName.includes('Geographic') || fieldName.includes('Location')) return 7;
        if (fieldName.includes('Certificate') || fieldName.includes('Certification')) return 5;
        if (fieldName.includes('Error') || fieldName.includes('Issue')) return 9; // Errors are high priority
        
        // Nested fields get lower priority
        if (prefix) return 2;
        
        // Default priority for unknown fields
        return 3;
    }

    getFieldType(value) {
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

    formatFieldValue(value) {
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

    getValueClass(value) {
        const type = typeof value;
        if (value === null) return 'null';
        if (Array.isArray(value) || (type === 'object' && value !== null)) return 'complex';
        return type; // 'string', 'number', 'boolean'
    }

    createErrorMap(errors) {
        const errorMap = {};
        
        errors.forEach(error => {
            const fieldPath = this.extractFieldFromError(error);
            if (fieldPath) {
                if (!errorMap[fieldPath]) errorMap[fieldPath] = [];
                errorMap[fieldPath].push(error);
            }
        });

        return errorMap;
    }

    extractFieldFromError(errorMessage) {
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

    filterFieldTable() {
        const showErrorsOnly = document.getElementById('showErrorsOnly').checked;
        const rows = document.querySelectorAll('.field-table tbody tr');
        
        rows.forEach(row => {
            const hasError = row.classList.contains('error-row');
            row.style.display = (showErrorsOnly && !hasError) ? 'none' : '';
        });

        // Update summary
        const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none');
        const errorRows = visibleRows.filter(row => row.classList.contains('error-row'));
        
        const summary = document.querySelector('.field-summary');
        if (summary) {
            const fieldCount = showErrorsOnly ? errorRows.length : visibleRows.length;
            summary.innerHTML = `
                <span class="field-count">📊 ${fieldCount} fields ${showErrorsOnly ? '(errors only)' : 'total'}</span>
                <span class="valid-count">✅ ${visibleRows.length - errorRows.length} valid</span>
                <span class="error-count">❌ ${errorRows.length} errors</span>
            `;
        }
    }

    // Override displayResults to also generate field table
    displayResults(result) {
        // Call original summary display
        const container = document.getElementById('resultsContainer');
        
        const resultHtml = `
            <div class="validation-result">
                <div class="result-summary ${result.valid ? 'success' : 'error'}">
                    <span class="result-icon">${result.valid ? '✅' : '❌'}</span>
                    <span>${result.message}</span>
                </div>
                
                <div class="result-details">
                    <div class="result-section">
                        <h4>Schema Validation</h4>
                        <div class="status-item ${result.schema_valid ? 'success' : 'error'}">
                            ${result.schema_valid ? '✅ Valid' : '❌ Invalid'}
                        </div>
                    </div>
                    
                    <div class="result-section">
                        <h4>Business Rules</h4>
                        <div class="status-item ${result.business_rules_valid ? 'success' : 'error'}">
                            ${result.business_rules_valid ? '✅ Valid' : '❌ Invalid'}
                        </div>
                    </div>
                    
                    ${result.errors && result.errors.length > 0 ? `
                        <div class="result-section">
                            <h4>Errors (${result.errors.length})</h4>
                            <ul class="error-list">
                                ${result.errors.map(error => `<li>${this.escapeHtml(error)}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        container.innerHTML = resultHtml;

        // Generate field table
        try {
            const editor = document.getElementById('jsonEditor');
            const jsonText = editor.value.trim();
            if (jsonText) {
                const jsonData = JSON.parse(jsonText);
                this.generateFieldTable(jsonData, result);
            }
        } catch (error) {
            console.error('Error generating field table:', error);
            document.getElementById('fieldTableContainer').innerHTML = `
                <div class="table-placeholder">
                    <p>❌ Could not generate field table: Invalid JSON</p>
                </div>
            `;
        }
    }
}

// Initialize the validator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BOOSTValidator();
});