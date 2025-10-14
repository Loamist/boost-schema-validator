/**
 * UIController - Manages UI interactions, modals, and form controls
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
        const container = document.getElementById('summaryView');
        container.innerHTML = `
            <div class="placeholder">
                <p>🧪 Select an entity and click "Validate" to see results</p>
            </div>
        `;
        
        // Also hide the field analysis section
        const fieldSection = document.getElementById('fieldAnalysisSection');
        if (fieldSection) {
            fieldSection.style.display = 'none';
        }
    }

    /**
     * Display validation results in the summary view
     */
    displaySummaryResults(result) {
        const container = document.getElementById('summaryView');
        
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
                            ${this._renderErrorTabs(result)}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        container.innerHTML = resultHtml;
    }

    /**
     * Render error tabs with categorized errors
     */
    _renderErrorTabs(result) {
        const errorsByType = result.errors_by_type || {};

        // Define error type priority and configuration
        const errorTypeConfig = [
            { key: 'required', label: 'Missing Fields', icon: '⚠️' },
            { key: 'format', label: 'Format Errors', icon: '✍️' },
            { key: 'pattern', label: 'Pattern Errors', icon: '🔍' },
            { key: 'enum', label: 'Invalid Values', icon: '📋' },
            { key: 'type', label: 'Type Errors', icon: '🔤' },
            { key: 'constraint', label: 'Constraints', icon: '📏' },
            { key: 'other', label: 'Other', icon: '❌' }
        ];

        // Filter to only show tabs with errors
        const availableTabs = errorTypeConfig.filter(config =>
            errorsByType[config.key] && errorsByType[config.key].length > 0
        );

        if (availableTabs.length === 0) {
            // Fallback to showing all errors in a list (old behavior)
            return `
                <div class="error-list">
                    ${result.errors.map(error => this._formatErrorMessage(error)).join('')}
                </div>
            `;
        }

        // Generate unique ID for this error tabs instance
        const tabsId = 'error-tabs-' + Date.now();

        // Render tabs
        const tabButtons = availableTabs.map((config, index) => {
            const count = errorsByType[config.key].length;
            const isActive = index === 0 ? 'active' : '';
            return `
                <button class="error-tab-button ${isActive}"
                        data-tab-target="${tabsId}-${config.key}"
                        onclick="window.boostValidator.uiController.switchErrorTab('${tabsId}', '${config.key}')">
                    <span class="error-tab-icon">${config.icon}</span>
                    <span class="error-tab-label">${config.label}</span>
                    <span class="error-tab-count">${count}</span>
                </button>
            `;
        }).join('');

        // Render tab contents
        const tabContents = availableTabs.map((config, index) => {
            const isActive = index === 0 ? 'active' : '';
            const errors = errorsByType[config.key];
            return `
                <div id="${tabsId}-${config.key}" class="error-tab-content ${isActive}">
                    <div class="error-list">
                        ${errors.map(error => this._formatErrorMessage(error)).join('')}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="error-tabs-container" data-tabs-id="${tabsId}">
                <div class="error-tabs">
                    ${tabButtons}
                </div>
                <div class="error-tabs-content">
                    ${tabContents}
                </div>
            </div>
        `;
    }

    /**
     * Switch between error tabs
     */
    switchErrorTab(tabsId, tabKey) {
        const container = document.querySelector(`[data-tabs-id="${tabsId}"]`);
        if (!container) return;

        // Update button states
        const buttons = container.querySelectorAll('.error-tab-button');
        buttons.forEach(btn => {
            if (btn.dataset.tabTarget === `${tabsId}-${tabKey}`) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update content visibility
        const contents = container.querySelectorAll('.error-tab-content');
        contents.forEach(content => {
            if (content.id === `${tabsId}-${tabKey}`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }

    /**
     * Format an individual error message for better readability
     */
    _formatErrorMessage(error) {
        // Handle both string errors (legacy) and object errors (new format)
        if (typeof error === 'string') {
            return this._formatLegacyErrorMessage(error);
        }

        // New format with error type
        const errorType = error.type || 'other';
        const fieldName = error.field;
        const message = error.message;

        // Get type-specific icons and styles
        const typeConfig = this._getErrorTypeConfig(errorType);

        if (fieldName) {
            let extraInfo = '';

            // Add extra information based on error type
            if (errorType === 'enum' && error.allowed_values) {
                const values = error.allowed_values.map(v => `<code>${escapeHtml(v)}</code>`).join(', ');
                let actualValueDisplay = '';
                if (error.actual_value !== undefined && error.actual_value !== null) {
                    const actualValueStr = typeof error.actual_value === 'string'
                        ? error.actual_value
                        : JSON.stringify(error.actual_value);
                    actualValueDisplay = `<div class="error-actual-value">Current value: <code class="error-actual">${escapeHtml(actualValueStr)}</code></div>`;
                }
                extraInfo = `
                    <div class="error-hint">Allowed values: ${values}</div>
                    ${actualValueDisplay}
                `;
            } else if (errorType === 'pattern' && error.pattern) {
                let actualValueDisplay = '';
                if (error.actual_value !== undefined && error.actual_value !== null) {
                    const actualValueStr = typeof error.actual_value === 'string'
                        ? error.actual_value
                        : JSON.stringify(error.actual_value);
                    actualValueDisplay = `<div class="error-actual-value">Current value: <code class="error-actual">${escapeHtml(actualValueStr)}</code></div>`;
                }
                extraInfo = `
                    <div class="error-hint">Expected pattern: <code>${escapeHtml(error.pattern)}</code></div>
                    ${actualValueDisplay}
                `;
            } else if (errorType === 'type' && error.expected) {
                extraInfo = `<div class="error-hint">Expected type: <code>${escapeHtml(error.expected)}</code></div>`;
            } else if (errorType === 'format' && error.expected_format) {
                extraInfo = `<div class="error-hint">Expected format: <code>${escapeHtml(error.expected_format)}</code></div>`;
            }

            return `
                <div class="error-item error-type-${errorType}">
                    <div class="error-field">
                        <span class="error-field-icon">${typeConfig.icon}</span>
                        <strong>${escapeHtml(fieldName)}</strong>
                        <span class="error-badge">${typeConfig.label}</span>
                    </div>
                    <div class="error-message">${escapeHtml(this._cleanErrorMessage(message, fieldName))}</div>
                    ${extraInfo}
                </div>
            `;
        } else {
            return `
                <div class="error-item error-type-${errorType}">
                    <div class="error-message">
                        <span class="error-icon">${typeConfig.icon}</span>
                        ${escapeHtml(message)}
                    </div>
                </div>
            `;
        }
    }

    /**
     * Get configuration for each error type
     */
    _getErrorTypeConfig(type) {
        const configs = {
            'required': {
                icon: '⚠️',
                label: 'Missing Field'
            },
            'type': {
                icon: '🔤',
                label: 'Wrong Type'
            },
            'enum': {
                icon: '📋',
                label: 'Invalid Value'
            },
            'pattern': {
                icon: '🔍',
                label: 'Format Error'
            },
            'constraint': {
                icon: '📏',
                label: 'Out of Range'
            },
            'format': {
                icon: '✍️',
                label: 'Format Error'
            },
            'other': {
                icon: '❌',
                label: 'Validation Error'
            }
        };
        return configs[type] || configs['other'];
    }

    /**
     * Clean error message by removing field name prefix
     */
    _cleanErrorMessage(message, fieldName) {
        // Remove "Field 'xxx':" prefix
        let cleaned = message.replace(/Field\s+'[^']+'\s*:\s*/, '');
        // Remove "Missing required field: 'xxx'" and just keep description
        cleaned = cleaned.replace(/Missing required field:\s+'[^']+'\s*(in\s+[^']+)?/, 'This field is required');
        return cleaned;
    }

    /**
     * Format legacy string error messages (fallback)
     */
    _formatLegacyErrorMessage(error) {
        // Parse the error to extract field name if present
        const fieldMatch = error.match(/(?:Field|field)\s+'([^']+)'/);
        const missingFieldMatch = error.match(/Missing required field:\s+'([^']+)'/);

        let fieldName = null;
        let message = error;

        if (fieldMatch) {
            fieldName = fieldMatch[1];
            message = error.replace(/Field\s+'[^']+'\s*:\s*/, '');
        } else if (missingFieldMatch) {
            fieldName = missingFieldMatch[1];
            message = 'This field is required';
        }

        if (fieldName) {
            return `
                <div class="error-item">
                    <div class="error-field">
                        <span class="error-field-icon">📍</span>
                        <strong>${escapeHtml(fieldName)}</strong>
                    </div>
                    <div class="error-message">${escapeHtml(message)}</div>
                </div>
            `;
        } else {
            return `
                <div class="error-item">
                    <div class="error-message">
                        <span class="error-icon">⚠️</span>
                        ${escapeHtml(message)}
                    </div>
                </div>
            `;
        }
    }

    /**
     * Show error message in results
     */
    showError(message) {
        const container = document.getElementById('summaryView');
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