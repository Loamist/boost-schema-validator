/**
 * BOOST Schema Validator - Main Application Class
 * Orchestrates all components and services for the BOOST validator interface
 */
import { ValidationService } from './services/ValidationService.js';
import { UIController } from './components/UIController.js';
import { FieldTableRenderer } from './components/FieldTableRenderer.js';
import { PlainTextRenderer } from './components/PlainTextRenderer.js';
import { JourneyMapRenderer } from './components/JourneyMapRenderer.js';

export class BOOSTValidator {
    constructor() {
        this.validationService = new ValidationService();
        this.uiController = new UIController();
        this.fieldTableRenderer = new FieldTableRenderer('fieldTableContainer');
        this.plainTextRenderer = new PlainTextRenderer();
        this.journeyMapRenderer = new JourneyMapRenderer();
        this.currentEntityDictionary = null;
        this.currentJsonData = null;
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        this.setupEventListeners();
        await this.loadEntities();
    }

    /**
     * Set up event listeners for the main application
     */
    setupEventListeners() {
        // Entity selector
        document.getElementById('entitySelect').addEventListener('change', (e) => {
            this.handleEntityChange(e.target.value);
        });

        // Action buttons
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
            this.uiController.clearEditor();
        });

        document.getElementById('formatBtn').addEventListener('click', () => {
            this.uiController.formatJSON();
        });

        // Field table filter - now in the bottom section
        document.getElementById('showErrorsOnly').addEventListener('change', (e) => {
            this.fieldTableRenderer.filterErrorsOnly(e.target.checked);
        });

        // Expand all descriptions button
        document.getElementById('expandAllBtn').addEventListener('click', () => {
            this.fieldTableRenderer.toggleAllDescriptions();
        });

        // Entity representation view toggle buttons
        document.getElementById('plainTextBtn').addEventListener('click', () => {
            this.switchToPlainTextRepresentation();
        });

        document.getElementById('visualJourneyBtn').addEventListener('click', () => {
            this.switchToVisualJourneyRepresentation();
        });

        // Editor change detection
        document.getElementById('jsonEditor').addEventListener('input', () => {
            this.uiController.updateValidateButton();
            // Hide analysis sections when user starts editing
            this.hideFieldAnalysisSection();
            this.hideEntityRepresentationSection();
            // Update current JSON data
            this.updateCurrentJsonData();
        });
    }

    /**
     * Load available entities from the server
     */
    async loadEntities() {
        try {
            const entities = await this.validationService.getEntities();
            this.uiController.populateEntitySelect(entities);
        } catch (error) {
            this.uiController.showError(error.message);
        }
    }

    /**
     * Handle entity selection change
     */
    async handleEntityChange(entityName) {
        this.uiController.handleEntityChange(entityName);
        
        // Load dictionary data for the new entity
        if (entityName) {
            try {
                this.currentEntityDictionary = await this.validationService.getEntityDictionary(entityName);
                console.log('Loaded dictionary for', entityName, this.currentEntityDictionary);
            } catch (error) {
                console.warn('Could not load dictionary for', entityName, error);
                this.currentEntityDictionary = null;
            }
        } else {
            this.currentEntityDictionary = null;
        }
    }

    /**
     * Load example data for the selected entity
     */
    async loadExample() {
        const entityName = this.uiController.getCurrentEntity();
        if (!entityName) return;

        try {
            this.uiController.setStatus('loading', 'Loading example...');
            
            const exampleData = await this.validationService.getEntityExample(entityName);
            
            this.uiController.setEditorContent(exampleData);
            this.updateCurrentJsonData();
            this.uiController.setStatus('ready', 'Example loaded - ready to validate');
            
        } catch (error) {
            this.uiController.showError(error.message);
            this.uiController.setStatus('ready', 'Ready to validate');
        }
    }

    /**
     * Show schema for the selected entity
     */
    async showSchema() {
        const entityName = this.uiController.getCurrentEntity();
        if (!entityName) return;

        try {
            const schema = await this.validationService.getEntitySchema(entityName);
            this.uiController.showSchemaModal(entityName, schema);
        } catch (error) {
            this.uiController.showError(error.message);
        }
    }

    /**
     * Validate the current JSON data
     */
    async validateData() {
        const entityName = this.uiController.getCurrentEntity();
        if (!entityName) return;

        try {
            // Get and validate JSON data
            const testData = this.uiController.getEditorData();
            
            this.uiController.setStatus('validating', 'Validating...');
            
            // Perform validation
            const result = await this.validationService.validateEntity(entityName, testData);
            
            // Display results in both views
            this.displayValidationResults(result, testData);
            
            // Update status
            this.uiController.setStatus(
                result.valid ? 'valid' : 'invalid', 
                result.valid ? 'Validation passed!' : 'Validation failed'
            );
            
        } catch (error) {
            this.uiController.showError(error.message);
            this.uiController.setStatus('ready', 'Ready to validate');
            this.hideFieldAnalysisSection();
        }
    }

    /**
     * Display validation results in both summary and table views
     */
    displayValidationResults(result, testData) {
        // Update summary view
        this.uiController.displaySummaryResults(result);
        
        // Show the entity representation section
        this.showEntityRepresentationSection();
        
        // Show the enhanced field analysis section
        this.showFieldAnalysisSection();
        
        // Render enhanced table with dictionary data
        this.fieldTableRenderer.renderEnhancedTable(result, testData, this.currentEntityDictionary);
        
        // Update entity representation content
        this.updateEntityRepresentationContent();
    }

    /**
     * Show the enhanced field analysis section
     */
    showFieldAnalysisSection() {
        const section = document.getElementById('fieldAnalysisSection');
        if (section) {
            section.style.display = 'block';
            
            // Smooth scroll to the field analysis section
            setTimeout(() => {
                section.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 300);
        }
    }

    /**
     * Hide the enhanced field analysis section
     */
    hideFieldAnalysisSection() {
        const section = document.getElementById('fieldAnalysisSection');
        if (section) {
            section.style.display = 'none';
        }
    }

    /**
     * Switch to Plain Text representation
     */
    switchToPlainTextRepresentation() {
        document.getElementById('plainTextRepresentation').style.display = 'block';
        document.getElementById('visualJourneyRepresentation').style.display = 'none';
        document.getElementById('plainTextBtn').classList.add('active');
        document.getElementById('visualJourneyBtn').classList.remove('active');
        
        document.getElementById('plainTextRepresentation').classList.add('active');
        document.getElementById('visualJourneyRepresentation').classList.remove('active');
    }

    /**
     * Switch to Visual Journey representation
     */
    switchToVisualJourneyRepresentation() {
        document.getElementById('plainTextRepresentation').style.display = 'none';
        document.getElementById('visualJourneyRepresentation').style.display = 'block';
        document.getElementById('plainTextBtn').classList.remove('active');
        document.getElementById('visualJourneyBtn').classList.add('active');
        
        document.getElementById('plainTextRepresentation').classList.remove('active');
        document.getElementById('visualJourneyRepresentation').classList.add('active');
    }

    /**
     * Update current JSON data from editor
     */
    updateCurrentJsonData() {
        try {
            const editorContent = document.getElementById('jsonEditor').value.trim();
            if (editorContent) {
                this.currentJsonData = JSON.parse(editorContent);
            } else {
                this.currentJsonData = null;
            }
        } catch (error) {
            // Invalid JSON, keep current data
            console.warn('Invalid JSON in editor:', error);
        }
    }

    /**
     * Show the entity representation section
     */
    showEntityRepresentationSection() {
        const section = document.getElementById('entityRepresentationSection');
        if (section) {
            section.style.display = 'block';
            
            // Smooth scroll to the section
            setTimeout(() => {
                section.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 300);
        }
    }

    /**
     * Hide the entity representation section
     */
    hideEntityRepresentationSection() {
        const section = document.getElementById('entityRepresentationSection');
        if (section) {
            section.style.display = 'none';
        }
    }

    /**
     * Update entity representation content
     */
    updateEntityRepresentationContent() {
        if (!this.currentJsonData) return;
        
        const entityName = this.uiController.getCurrentEntity();
        
        // Update plain text representation
        this.updatePlainTextRepresentation();
        
        // Update visual journey representation
        this.updateVisualJourneyRepresentation();
    }

    /**
     * Update plain text representation content
     */
    updatePlainTextRepresentation() {
        const container = document.getElementById('plainTextContent');
        
        if (!this.currentJsonData) {
            container.innerHTML = `
                <div class="placeholder">
                    <p>📄 Validation results will show human-readable format here</p>
                </div>
            `;
            return;
        }

        const entityName = this.uiController.getCurrentEntity();
        const plainText = this.plainTextRenderer.convertToPlainText(this.currentJsonData, entityName);
        
        container.innerHTML = `
            <div class="plain-text-formatted">
                <h3>${entityName || 'Entity Data'}</h3>
                <pre>${this.formatPlainTextOutput(plainText)}</pre>
            </div>
        `;
    }

    /**
     * Update visual journey representation content
     */
    updateVisualJourneyRepresentation() {
        const container = document.getElementById('visualJourneyContent');
        
        if (!this.currentJsonData) {
            container.innerHTML = `
                <div class="placeholder">
                    <p>🗺️ Journey map and visual representation will appear here</p>
                </div>
            `;
            return;
        }

        const entityName = this.uiController.getCurrentEntity();
        
        if (this.shouldShowJourneyMap(entityName)) {
            // Use interactive map for Visual Journey view
            const journeyMapHtml = this.journeyMapRenderer.renderJourneyMap(this.currentJsonData, true);
            container.innerHTML = journeyMapHtml;
        } else {
            container.innerHTML = `
                <div class="placeholder">
                    <p>🗺️ Visual representation not available for ${entityName}</p>
                    <p style="margin-top: 0.5rem; font-size: 0.9rem;">Journey maps are currently available for TraceableUnit entities.</p>
                </div>
            `;
        }
    }

    /**
     * Format plain text output with enhanced styling
     */
    formatPlainTextOutput(plainText) {
        return plainText
            .split('\n')
            .map(line => {
                if (!line.trim()) return '';
                
                const [key, ...valueParts] = line.split(':');
                const value = valueParts.join(':').trim();
                
                if (key && value) {
                    let styledValue = this.escapeHtml(value);
                    
                    // Apply special styling based on content
                    if (value.includes('TRU-') || value.includes('GEO-') || value.includes('ORG-')) {
                        styledValue = `<span class="plain-text-value-id">${styledValue}</span>`;
                    } else if (value.includes('cubic meters')) {
                        styledValue = `<span class="plain-text-value-volume">${styledValue}</span>`;
                    } else if (value.includes('%')) {
                        styledValue = `<span class="plain-text-value-percentage">${styledValue}</span>`;
                    } else if (value.toLowerCase() === 'active' || value.toLowerCase() === 'inactive') {
                        styledValue = `<span class="plain-text-value-status ${value.toLowerCase()}">${styledValue}</span>`;
                    } else if (value.match(/\d{4}/)) {
                        styledValue = `<span class="plain-text-value-date">${styledValue}</span>`;
                    }
                    
                    return `<div class="plain-text-field"><strong>${this.escapeHtml(key.trim())}:</strong> <span>${styledValue}</span></div>`;
                }
                return this.escapeHtml(line);
            })
            .join('\n');
    }

    /**
     * Escape HTML characters
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Determine if journey map should be shown for this entity
     */
    shouldShowJourneyMap(entityName) {
        const journeyMapEntities = ['TraceableUnit'];
        return journeyMapEntities.includes(entityName);
    }
}