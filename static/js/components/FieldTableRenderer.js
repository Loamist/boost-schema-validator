/**
 * FieldTableRenderer - Renders the field analysis table with error highlighting
 */
import { FieldParser } from './FieldParser.js';
import { createErrorMap } from '../utils/errorMapping.js';
import { escapeHtml } from '../utils/fieldFormatting.js';

export class FieldTableRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentFieldData = null;
    }

    /**
     * Generate and render the field table
     */
    renderFieldTable(jsonData, validationResult, schema = null) {
        try {
            const fields = FieldParser.parseJsonFields(jsonData, '', []);
            const errorMap = createErrorMap(validationResult.errors || []);
            const requiredFields = schema?.required || [];
            const stats = FieldParser.getFieldStats(fields, errorMap);

            this.currentFieldData = { fields, errorMap };

            const tableRows = fields.map(field => this._renderTableRow(field, errorMap, requiredFields));
            const summaryHtml = this._renderSummary(stats);
            const tableHtml = this._renderTable(summaryHtml, tableRows);

            this.container.innerHTML = tableHtml;
        } catch (error) {
            console.error('Error generating field table:', error);
            this.container.innerHTML = `
                <div class="alert alert-error shadow-lg">
                    <svg class="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    <span>Could not generate field table: ${escapeHtml(error.message)}</span>
                </div>
            `;
        }
    }

    /**
     * Filter the table to show only error rows
     */
    filterErrorsOnly(showErrorsOnly) {
        // Support both regular and enhanced tables
        const rows = this.container.querySelectorAll('.field-table tbody tr, .enhanced-field-table tbody tr');

        rows.forEach(row => {
            const hasError = row.classList.contains('error-row');
            row.style.display = (showErrorsOnly && !hasError) ? 'none' : '';
        });

        this._updateSummaryAfterFilter(showErrorsOnly);
    }

    /**
     * Render a single table row
     */
    _renderTableRow(field, errorMap, requiredFields) {
        const hasError = errorMap[field.path] && errorMap[field.path].length > 0;
        const isRequired = requiredFields.includes(field.name);
        
        const statusIcon = hasError 
            ? '<span class="status-icon error">❌</span>'
            : '<span class="status-icon valid">✅</span>';

        const fieldNameClass = isRequired ? 'field-name required' : 'field-name';
        const rowClass = hasError ? 'error-row' : '';

        const fieldErrors = hasError 
            ? errorMap[field.path].map(error => 
                `<div class="error-message">${escapeHtml(error)}</div>`
              ).join('')
            : '';

        return `
            <tr class="${rowClass}" data-field-path="${field.path}">
                <td class="field-status">${statusIcon}</td>
                <td class="${fieldNameClass}">${escapeHtml(field.displayName)}</td>
                <td class="field-value ${field.valueClass}">${escapeHtml(field.displayValue)}</td>
                <td class="field-type">${field.type}</td>
                <td class="field-errors">${fieldErrors}</td>
            </tr>
        `;
    }

    /**
     * Render the summary statistics with DaisyUI stats component
     */
    _renderSummary(stats) {
        return `
            <div class="stats stats-horizontal shadow mb-4 w-full">
                <div class="stat bg-base-100">
                    <div class="stat-figure text-primary">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    </div>
                    <div class="stat-title">Total Fields</div>
                    <div class="stat-value text-primary">${stats.total}</div>
                </div>

                <div class="stat bg-base-100">
                    <div class="stat-figure text-success">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div class="stat-title">Valid</div>
                    <div class="stat-value text-success">${stats.valid}</div>
                </div>

                <div class="stat bg-base-100">
                    <div class="stat-figure text-error">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div class="stat-title">Errors</div>
                    <div class="stat-value text-error">${stats.errors}</div>
                </div>
            </div>
        `;
    }

    /**
     * Render the complete table HTML (DaisyUI table)
     */
    _renderTable(summaryHtml, tableRows) {
        return `
            ${summaryHtml}
            <div class="overflow-x-auto rounded-lg border border-base-300 shadow-sm">
                <table class="table table-zebra table-sm">
                    <thead class="bg-base-200 text-base-content">
                        <tr>
                            <th class="text-center">Status</th>
                            <th>Field Name</th>
                            <th>Value</th>
                            <th>Errors</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows.join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Update summary after filtering (DaisyUI stats)
     */
    _updateSummaryAfterFilter(showErrorsOnly) {
        // Support both regular and enhanced tables
        const rows = Array.from(this.container.querySelectorAll('tbody tr'));
        const errorRows = rows.filter(row => row.classList.contains('error-row') || row.classList.contains('bg-error/5'));

        const statsContainer = this.container.querySelector('.stats');
        if (statsContainer) {
            const fieldCount = showErrorsOnly ? errorRows.length : rows.length;
            const validCount = rows.length - errorRows.length;

            // Update stat values
            const statValues = statsContainer.querySelectorAll('.stat-value');
            if (statValues.length >= 3) {
                statValues[0].textContent = fieldCount;
                statValues[1].textContent = validCount;
                statValues[2].textContent = errorRows.length;
            }

            // Update title to show filter status
            const firstStatTitle = statsContainer.querySelector('.stat-title');
            if (firstStatTitle && showErrorsOnly) {
                firstStatTitle.textContent = 'Filtered Fields';
            } else if (firstStatTitle) {
                firstStatTitle.textContent = 'Total Fields';
            }
        }
    }

    /**
     * Enhanced table rendering with dictionary integration
     */
    renderEnhancedTable(validationResult, jsonData, dictionaryData = null) {
        try {
            const fields = FieldParser.parseJsonFields(jsonData, '', []);
            const errorMap = createErrorMap(validationResult.errors || []);
            const stats = FieldParser.getFieldStats(fields, errorMap);
            
            // Sort fields: required fields first, then by importance
            const sortedFields = this._sortFieldsByPriority(fields, dictionaryData);
            
            this.currentFieldData = { fields: sortedFields, errorMap, dictionaryData };
            
            const tableRows = sortedFields.map(field => this._renderEnhancedTableRow(field, errorMap, dictionaryData));
            const summaryHtml = this._renderSummary(stats);
            const enhancedTableHtml = this._renderEnhancedTable(summaryHtml, tableRows);
            
            this.container.innerHTML = enhancedTableHtml;
        } catch (error) {
            console.error('Error generating enhanced field table:', error);
            this.container.innerHTML = `
                <div class="alert alert-error shadow-lg">
                    <svg class="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    <span>Could not generate enhanced field table: ${escapeHtml(error.message)}</span>
                </div>
            `;
        }
    }

    /**
     * Render enhanced table row with dictionary information (DaisyUI styled)
     */
    _renderEnhancedTableRow(field, errorMap, dictionaryData) {
        const hasError = errorMap[field.path] && errorMap[field.path].length > 0;
        const fieldInfo = this._getFieldDictionaryInfo(field.name, dictionaryData);

        // DaisyUI badge for status
        const statusIcon = hasError
            ? '<span class="badge badge-error badge-sm gap-1"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg> Error</span>'
            : '<span class="badge badge-success badge-sm gap-1"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg> Valid</span>';

        // DaisyUI badge for required status
        const requiredStatus = fieldInfo.required
            ? '<span class="badge badge-error badge-sm">Required</span>'
            : '<span class="badge badge-ghost badge-sm">Optional</span>';

        const rowClass = hasError ? 'bg-error/5 hover:bg-error/10' : 'hover:bg-base-200';

        // Format errors as DaisyUI alerts
        const fieldErrors = hasError
            ? errorMap[field.path].map(error =>
                `<div class="alert alert-error py-2 px-3 mt-1">
                    <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-xs">${escapeHtml(error)}</span>
                </div>`
              ).join('')
            : '<span class="text-success text-sm">✓ No errors</span>';

        const description = this._renderFieldDescription(fieldInfo);

        return `
            <tr class="${rowClass}" data-field-path="${field.path}">
                <td class="text-center">${statusIcon}</td>
                <td class="font-mono text-sm font-semibold">${escapeHtml(field.displayName)}</td>
                <td class="text-center">${requiredStatus}</td>
                <td class="font-mono text-sm ${hasError ? 'text-error' : 'text-base-content/80'}">${escapeHtml(field.displayValue)}</td>
                <td class="text-sm text-base-content/70">${description}</td>
                <td>${fieldErrors}</td>
            </tr>
        `;
    }

    /**
     * Get field information from dictionary data
     */
    _getFieldDictionaryInfo(fieldName, dictionaryData) {
        if (!dictionaryData || !dictionaryData.fields) {
            return { required: false, description: '', examples: '', type: '' };
        }
        
        // Direct match first
        if (dictionaryData.fields[fieldName]) {
            return dictionaryData.fields[fieldName];
        }
        
        // Try partial matches for nested fields
        const keys = Object.keys(dictionaryData.fields);
        const partialMatch = keys.find(key => 
            fieldName.toLowerCase().includes(key.toLowerCase()) ||
            key.toLowerCase().includes(fieldName.toLowerCase())
        );
        
        if (partialMatch) {
            return dictionaryData.fields[partialMatch];
        }
        
        return { required: false, description: '', examples: '', type: '' };
    }

    /**
     * Render field description with examples (DaisyUI collapse component)
     */
    _renderFieldDescription(fieldInfo) {
        if (!fieldInfo.description && !fieldInfo.examples) {
            return '<span class="text-base-content/40 italic text-xs">No description available</span>';
        }

        let html = '';

        if (fieldInfo.description) {
            // Truncate long descriptions
            const desc = fieldInfo.description;
            if (desc.length > 100 && fieldInfo.examples) {
                // Use collapsible for long descriptions with examples
                const truncated = desc.substring(0, 100) + '...';
                html += `
                    <div class="collapse collapse-arrow bg-base-200/50 rounded-lg">
                        <input type="checkbox" />
                        <div class="collapse-title text-xs font-medium py-2 px-3">
                            ${escapeHtml(truncated)}
                        </div>
                        <div class="collapse-content text-xs px-3">
                            <p class="mb-2">${escapeHtml(desc)}</p>
                            ${fieldInfo.examples ? `<div class="badge badge-outline badge-sm">Examples: ${escapeHtml(fieldInfo.examples)}</div>` : ''}
                        </div>
                    </div>
                `;
            } else {
                // Short description, show inline
                html += `<div class="text-xs">${escapeHtml(desc)}</div>`;
                if (fieldInfo.examples) {
                    html += `<div class="badge badge-outline badge-sm mt-1">Ex: ${escapeHtml(fieldInfo.examples)}</div>`;
                }
            }
        } else if (fieldInfo.examples) {
            html += `<div class="badge badge-outline badge-sm">Examples: ${escapeHtml(fieldInfo.examples)}</div>`;
        }

        return html;
    }

    /**
     * Render the enhanced table HTML structure (DaisyUI table)
     */
    _renderEnhancedTable(summaryHtml, tableRows) {
        return `
            ${summaryHtml}
            <div class="overflow-x-auto rounded-lg border border-base-300 shadow-sm">
                <table class="table table-zebra table-sm">
                    <thead class="bg-base-200 text-base-content">
                        <tr>
                            <th class="text-center">Status</th>
                            <th>Field Name</th>
                            <th class="text-center">Required</th>
                            <th>Value</th>
                            <th>Description & Examples</th>
                            <th>Validation Errors</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows.join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Sort fields by priority: required first, then by field importance
     */
    _sortFieldsByPriority(fields, dictionaryData) {
        return fields.sort((a, b) => {
            const aInfo = this._getFieldDictionaryInfo(a.name, dictionaryData);
            const bInfo = this._getFieldDictionaryInfo(b.name, dictionaryData);
            
            // Required fields first
            if (aInfo.required && !bInfo.required) return -1;
            if (!aInfo.required && bInfo.required) return 1;
            
            // Within each group, sort by field importance
            const aImportance = this._getFieldImportanceScore(a.name);
            const bImportance = this._getFieldImportanceScore(b.name);
            
            if (aImportance !== bImportance) {
                return bImportance - aImportance; // Higher importance first
            }
            
            // Finally, sort alphabetically
            return a.displayName.localeCompare(b.displayName);
        });
    }

    /**
     * Get importance score for a field (higher = more important)
     */
    _getFieldImportanceScore(fieldName) {
        const fieldLower = fieldName.toLowerCase();
        
        // Critical BOOST fields
        if (fieldLower.includes('traceableunitid')) return 100;
        if (fieldLower.includes('organizationid')) return 95;
        if (fieldLower.includes('@id')) return 90;
        if (fieldLower.includes('@type')) return 85;
        if (fieldLower.includes('uniqueidentifier')) return 80;
        
        // Important identification fields
        if (fieldLower.includes('identificationmethod')) return 75;
        if (fieldLower.includes('identificationconfidence')) return 70;
        if (fieldLower.includes('harvester')) return 65;
        if (fieldLower.includes('operator')) return 60;
        
        // Material and geographic fields
        if (fieldLower.includes('materialtype')) return 55;
        if (fieldLower.includes('geographic') || fieldLower.includes('location')) return 50;
        if (fieldLower.includes('unittype')) return 45;
        if (fieldLower.includes('timestamp') || fieldLower.includes('date')) return 40;
        
        // Default importance
        return 10;
    }

    /**
     * Toggle all field descriptions expanded/collapsed
     */
    toggleAllDescriptions() {
        const button = document.getElementById('expandAllBtn');
        const descriptions = this.container.querySelectorAll('.field-description');
        
        const isExpanded = button.textContent.includes('Collapse');
        
        descriptions.forEach(desc => {
            const examples = desc.querySelector('.field-examples');
            if (examples) {
                examples.style.display = isExpanded ? 'none' : 'block';
            }
        });
        
        button.textContent = isExpanded ? 'Expand All Descriptions' : 'Collapse All Descriptions';
    }

    /**
     * Show placeholder when no data available (DaisyUI alert)
     */
    showPlaceholder(message = 'Field analysis table will appear after validation') {
        this.container.innerHTML = `
            <div class="alert alert-info shadow-lg">
                <svg class="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>${message}</span>
            </div>
        `;
    }
}