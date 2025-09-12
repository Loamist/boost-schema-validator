/**
 * BOOST Schema Validator - Main Application Class
 * Orchestrates all components and services for the BOOST validator interface
 */
import { ValidationService } from './services/ValidationService.js';
import { UIController } from './components/UIController.js';
import { FieldTableRenderer } from './components/FieldTableRenderer.js';

export class BOOSTValidator {
    constructor() {
        this.validationService = new ValidationService();
        this.uiController = new UIController();
        this.fieldTableRenderer = new FieldTableRenderer('fieldTableContainer');
        this.currentEntityDictionary = null;
        
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

        // Editor change detection
        document.getElementById('jsonEditor').addEventListener('input', () => {
            this.uiController.updateValidateButton();
            // Hide field analysis section when user starts editing
            this.hideFieldAnalysisSection();
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
        
        // Show the enhanced field analysis section
        this.showFieldAnalysisSection();
        
        // Render enhanced table with dictionary data
        this.fieldTableRenderer.renderEnhancedTable(result, testData, this.currentEntityDictionary);
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
}