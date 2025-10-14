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
                <div class="table-placeholder">
                    <p>❌ Could not generate field table: ${escapeHtml(error.message)}</p>
                </div>
            `;
        }
    }

    /**
     * Filter the table to show only error rows
     */
    filterErrorsOnly(showErrorsOnly) {
        const rows = this.container.querySelectorAll('.field-table tbody tr');
        
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
     * Render the summary statistics
     */
    _renderSummary(stats) {
        return `
            <div class="field-summary">
                <span class="field-count">📊 ${stats.total} fields total</span>
                <span class="valid-count">✅ ${stats.valid} valid</span>
                <span class="error-count">❌ ${stats.errors} errors</span>
            </div>
        `;
    }

    /**
     * Render the complete table HTML
     */
    _renderTable(summaryHtml, tableRows) {
        return `
            ${summaryHtml}
            <table class="field-table">
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Field Name</th>
                        <th>Value</th>
                        <th>Errors</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows.join('')}
                </tbody>
            </table>
        `;
    }

    /**
     * Update summary after filtering
     */
    _updateSummaryAfterFilter(showErrorsOnly) {
        const rows = Array.from(this.container.querySelectorAll('.field-table tbody tr'));
        const visibleRows = rows.filter(row => row.style.display !== 'none');
        const errorRows = visibleRows.filter(row => row.classList.contains('error-row'));
        
        const summary = this.container.querySelector('.field-summary');
        if (summary) {
            const fieldCount = showErrorsOnly ? errorRows.length : visibleRows.length;
            summary.innerHTML = `
                <span class="field-count">📊 ${fieldCount} fields ${showErrorsOnly ? '(errors only)' : 'total'}</span>
                <span class="valid-count">✅ ${visibleRows.length - errorRows.length} valid</span>
                <span class="error-count">❌ ${errorRows.length} errors</span>
            `;
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
                <div class="table-loading">
                    <p>❌ Could not generate enhanced field table: ${escapeHtml(error.message)}</p>
                </div>
            `;
        }
    }

    /**
     * Render enhanced table row with dictionary information
     */
    _renderEnhancedTableRow(field, errorMap, dictionaryData) {
        const hasError = errorMap[field.path] && errorMap[field.path].length > 0;
        const fieldInfo = this._getFieldDictionaryInfo(field.name, dictionaryData);
        
        const statusIcon = hasError 
            ? '<span class="status-icon error">❌</span>'
            : '<span class="status-icon valid">✅</span>';

        const requiredStatus = fieldInfo.required 
            ? '<span class="required-badge">Required</span>'
            : '<span class="optional-badge">Optional</span>';

        const rowClass = hasError ? 'error-row' : '';
        
        const fieldErrors = hasError 
            ? errorMap[field.path].map(error => 
                `<div class="enhanced-error-message">${escapeHtml(error)}</div>`
              ).join('')
            : '';

        const description = this._renderFieldDescription(fieldInfo);

        return `
            <tr class="${rowClass}" data-field-path="${field.path}">
                <td class="field-status">${statusIcon}</td>
                <td class="field-name">${escapeHtml(field.displayName)}</td>
                <td class="field-required">${requiredStatus}</td>
                <td class="field-value ${field.valueClass}">${escapeHtml(field.displayValue)}</td>
                <td class="field-description">${description}</td>
                <td class="field-errors">${fieldErrors}</td>
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
     * Render field description with examples
     */
    _renderFieldDescription(fieldInfo) {
        if (!fieldInfo.description && !fieldInfo.examples) {
            return '<span style="color: #999; font-style: italic;">No description available</span>';
        }
        
        let html = '';
        
        if (fieldInfo.description) {
            html += `<div class="description-text">${escapeHtml(fieldInfo.description)}</div>`;
        }
        
        if (fieldInfo.examples) {
            html += `
                <div class="field-examples">
                    <strong>Examples:</strong> ${escapeHtml(fieldInfo.examples)}
                </div>
            `;
        }
        
        return html;
    }

    /**
     * Render the enhanced table HTML structure
     */
    _renderEnhancedTable(summaryHtml, tableRows) {
        return `
            ${summaryHtml}
            <table class="enhanced-field-table">
                <thead>
                    <tr>
                        <th style="width: 50px;">Status</th>
                        <th style="width: 180px;">Field Name</th>
                        <th style="width: 90px;">Required</th>
                        <th style="width: 160px;">Value</th>
                        <th style="width: 350px;">Description & Examples</th>
                        <th style="width: 220px;">Validation Errors</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows.join('')}
                </tbody>
            </table>
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
     * Show placeholder when no data available
     */
    showPlaceholder(message = '📊 Field table will appear after validation') {
        this.container.innerHTML = `
            <div class="table-placeholder">
                <p>${message}</p>
            </div>
        `;
    }
}