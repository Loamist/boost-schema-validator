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
        // Modal close - DaisyUI modals handle closing via native dialog behavior
        // The close button is in a <form method="dialog"> which auto-closes the dialog
        // No explicit event listeners needed for DaisyUI modal closing
    }

    /**
     * Show the schema modal (DaisyUI dialog)
     */
    showSchemaModal(entityName, schema) {
        console.log('showSchemaModal called with:', entityName);

        const titleEl = document.getElementById('schemaModalTitle');
        const contentEl = document.getElementById('schemaContent');
        const modal = document.getElementById('schemaModal');

        if (!titleEl) {
            console.error('schemaModalTitle element not found');
            return;
        }
        if (!contentEl) {
            console.error('schemaContent element not found');
            return;
        }
        if (!modal) {
            console.error('schemaModal element not found');
            return;
        }

        titleEl.textContent = `${entityName} Schema`;
        contentEl.textContent = JSON.stringify(schema, null, 2);

        // Use DaisyUI dialog API
        if (typeof modal.showModal === 'function') {
            console.log('Opening modal...');
            modal.showModal();

            // Verify it opened
            setTimeout(() => {
                console.log('Modal open attribute:', modal.hasAttribute('open'));
                console.log('Modal display:', window.getComputedStyle(modal).display);
                console.log('Modal z-index:', window.getComputedStyle(modal).zIndex);
            }, 100);
        } else {
            console.error('modal.showModal is not a function');
        }
    }

    /**
     * Close the schema modal (DaisyUI dialog)
     */
    closeModal() {
        const modal = document.getElementById('schemaModal');
        if (modal && typeof modal.close === 'function') {
            modal.close();
        }
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

        document.getElementById('exampleDropdownBtn').disabled = !hasEntity;
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
     * Set the validation status indicator (DaisyUI badge)
     */
    setStatus(type, message) {
        const statusBadge = document.getElementById('validationStatus');
        const statusText = document.getElementById('statusText');
        const loadingIcon = document.getElementById('statusLoadingIcon');

        if (!statusBadge || !statusText) return; // Guard against missing elements

        // Reset badge classes
        statusBadge.className = 'badge badge-lg';

        // Update based on type
        switch(type) {
            case 'loading':
            case 'validating':
                statusBadge.classList.add('badge-warning');
                if (loadingIcon) loadingIcon.classList.remove('hidden');
                break;
            case 'valid':
                statusBadge.classList.add('badge-success');
                if (loadingIcon) loadingIcon.classList.add('hidden');
                break;
            case 'invalid':
                statusBadge.classList.add('badge-error');
                if (loadingIcon) loadingIcon.classList.add('hidden');
                break;
            case 'ready':
            default:
                statusBadge.classList.add('badge-ghost');
                if (loadingIcon) loadingIcon.classList.add('hidden');
                break;
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
     * Display validation results in the summary view (DaisyUI styled)
     */
    displaySummaryResults(result) {
        const container = document.getElementById('summaryView');

        const resultHtml = `
            <div class="space-y-4">
                <!-- Summary Alert -->
                <div class="alert ${result.valid ? 'alert-success' : 'alert-error'} shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        ${result.valid
                            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />'
                            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />'
                        }
                    </svg>
                    <span class="font-semibold">${result.message}</span>
                </div>

                <!-- Validation Stats - Compact Grid -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="card bg-base-100 shadow border-l-4 ${result.schema_valid ? 'border-success' : 'border-error'}">
                        <div class="card-body p-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="text-sm font-medium text-base-content/60">Schema</h4>
                                    <p class="text-xl font-bold ${result.schema_valid ? 'text-success' : 'text-error'}">
                                        ${result.schema_valid ? 'Valid' : 'Invalid'}
                                    </p>
                                </div>
                                <div class="${result.schema_valid ? 'text-success' : 'text-error'}">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        ${result.schema_valid
                                            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />'
                                            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />'
                                        }
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card bg-base-100 shadow border-l-4 ${result.business_rules_valid ? 'border-success' : 'border-error'}">
                        <div class="card-body p-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="text-sm font-medium text-base-content/60">Business Rules</h4>
                                    <p class="text-xl font-bold ${result.business_rules_valid ? 'text-success' : 'text-error'}">
                                        ${result.business_rules_valid ? 'Valid' : 'Invalid'}
                                    </p>
                                </div>
                                <div class="${result.business_rules_valid ? 'text-success' : 'text-error'}">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        ${result.business_rules_valid
                                            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />'
                                            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />'
                                        }
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    ${result.errors && result.errors.length > 0 ? `
                    <div class="card bg-base-100 shadow border-l-4 border-error">
                        <div class="card-body p-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="text-sm font-medium text-base-content/60">Errors</h4>
                                    <p class="text-xl font-bold text-error">${result.errors.length}</p>
                                </div>
                                <div class="text-error">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                </div>

                <!-- Error Details -->
                ${result.errors && result.errors.length > 0 ? `
                    <div class="card bg-base-100 border border-error/20">
                        <div class="card-body">
                            <h3 class="card-title text-error flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Validation Errors (${result.errors.length})
                            </h3>
                            ${this._renderErrorTabs(result)}
                        </div>
                    </div>
                ` : ''}
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

        // Render DaisyUI tabs
        const tabButtons = availableTabs.map((config, index) => {
            const count = errorsByType[config.key].length;
            const isActive = index === 0 ? 'tab-active' : '';
            return `
                <button class="tab tab-lifted ${isActive}"
                        data-tab-target="${tabsId}-${config.key}"
                        onclick="window.boostValidator.uiController.switchErrorTab('${tabsId}', '${config.key}')">
                    <span class="mr-1">${config.icon}</span>
                    <span>${config.label}</span>
                    <span class="badge badge-sm badge-error ml-2">${count}</span>
                </button>
            `;
        }).join('');

        // Render tab contents
        const tabContents = availableTabs.map((config, index) => {
            const isActive = index === 0 ? '' : 'hidden';
            const errors = errorsByType[config.key];
            return `
                <div id="${tabsId}-${config.key}" class="mt-4 space-y-3 ${isActive}">
                    ${errors.map(error => this._formatErrorMessage(error)).join('')}
                </div>
            `;
        }).join('');

        return `
            <div class="error-tabs-container" data-tabs-id="${tabsId}">
                <div class="tabs tabs-boxed bg-base-200 p-1">
                    ${tabButtons}
                </div>
                <div class="error-tabs-content">
                    ${tabContents}
                </div>
            </div>
        `;
    }

    /**
     * Switch between error tabs (DaisyUI style)
     */
    switchErrorTab(tabsId, tabKey) {
        const container = document.querySelector(`[data-tabs-id="${tabsId}"]`);
        if (!container) return;

        // Update tab button states (DaisyUI tab-active class)
        const buttons = container.querySelectorAll('.tab');
        buttons.forEach(btn => {
            if (btn.dataset.tabTarget === `${tabsId}-${tabKey}`) {
                btn.classList.add('tab-active');
            } else {
                btn.classList.remove('tab-active');
            }
        });

        // Update content visibility (use hidden class)
        const contents = container.querySelectorAll('[id^="' + tabsId + '-"]');
        contents.forEach(content => {
            if (content.id === `${tabsId}-${tabKey}`) {
                content.classList.remove('hidden');
            } else {
                content.classList.add('hidden');
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
                <div class="alert alert-error shadow-sm">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-lg">${typeConfig.icon}</span>
                            <code class="text-sm font-semibold bg-error/10 px-2 py-0.5 rounded">${escapeHtml(fieldName)}</code>
                            <span class="badge badge-sm badge-outline">${typeConfig.label}</span>
                        </div>
                        <p class="text-sm text-base-content/90">${escapeHtml(this._cleanErrorMessage(message, fieldName))}</p>
                        ${extraInfo ? `<div class="mt-2 text-xs text-base-content/70">${extraInfo}</div>` : ''}
                    </div>
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