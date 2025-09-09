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
}

// Initialize the validator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BOOSTValidator();
});