/**
 * UIController - Manages UI interactions, tabs, modals, and form controls
 */
import { escapeHtml } from '../utils/fieldFormatting.js';

export class UIController {
    constructor() {
        this.setupEventListeners();
        this.currentEntity = null;
    }

    /**
     * Set up all UI event listeners
     */
    setupEventListeners() {
        // Tab switching
        document.getElementById('summaryTab').addEventListener('click', () => {
            this.switchTab('summary');
        });

        document.getElementById('tableTab').addEventListener('click', () => {
            this.switchTab('table');
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
    }

    /**
     * Switch between Summary and Field Table tabs
     */
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

    /**
     * Show the schema modal
     */
    showSchemaModal(entityName, schema) {
        document.getElementById('schemaModalTitle').textContent = `${entityName} Schema`;
        document.getElementById('schemaContent').textContent = JSON.stringify(schema, null, 2);
        document.getElementById('schemaModal').style.display = 'block';
    }

    /**
     * Close the schema modal
     */
    closeModal() {
        document.getElementById('schemaModal').style.display = 'none';
    }

    /**
     * Populate the entity selector dropdown
     */
    populateEntitySelect(entities) {
        const select = document.getElementById('entitySelect');
        select.innerHTML = '<option value="">Select an entity...</option>';
        
        entities.forEach(entity => {
            const option = document.createElement('option');
            option.value = entity;
            option.textContent = entity;
            select.appendChild(option);
        });
    }

    /**
     * Handle entity selection change
     */
    handleEntityChange(entityName) {
        this.currentEntity = entityName;
        const hasEntity = entityName !== '';
        
        document.getElementById('loadExampleBtn').disabled = !hasEntity;
        document.getElementById('loadSchemaBtn').disabled = !hasEntity;
        
        this.updateValidateButton();
        this.clearResults();
    }

    /**
     * Update the validate button state
     */
    updateValidateButton() {
        const hasEntity = !!this.currentEntity;
        const hasData = document.getElementById('jsonEditor').value.trim() !== '';
        document.getElementById('validateBtn').disabled = !hasEntity || !hasData;
    }

    /**
     * Set the validation status indicator
     */
    setStatus(type, message) {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-text');
        
        statusDot.className = 'status-dot';
        if (type !== 'ready') {
            statusDot.classList.add(type);
        }
        
        statusText.textContent = message;
    }

    /**
     * Clear the editor
     */
    clearEditor() {
        document.getElementById('jsonEditor').value = '';
        this.updateValidateButton();
        this.clearResults();
        this.setStatus('ready', 'Ready to validate');
    }

    /**
     * Format JSON in the editor
     */
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

    /**
     * Clear validation results
     */
    clearResults() {
        const container = document.getElementById('resultsContainer');
        container.innerHTML = `
            <div class="placeholder">
                <p>🧪 Select an entity and click "Validate" to see results</p>
            </div>
        `;
    }

    /**
     * Display validation results in the summary view
     */
    displaySummaryResults(result) {
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
                                ${result.errors.map(error => `<li>${escapeHtml(error)}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        container.innerHTML = resultHtml;
    }

    /**
     * Show error message in results
     */
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
                            <li>${escapeHtml(message)}</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get current entity
     */
    getCurrentEntity() {
        return this.currentEntity;
    }

    /**
     * Get JSON data from editor
     */
    getEditorData() {
        const editor = document.getElementById('jsonEditor');
        const jsonText = editor.value.trim();
        
        if (!jsonText) {
            throw new Error('Please enter JSON data to validate');
        }

        try {
            return JSON.parse(jsonText);
        } catch (error) {
            throw new Error('Invalid JSON format: ' + error.message);
        }
    }

    /**
     * Set editor content
     */
    setEditorContent(content) {
        document.getElementById('jsonEditor').value = typeof content === 'string' 
            ? content 
            : JSON.stringify(content, null, 2);
        this.updateValidateButton();
    }
}