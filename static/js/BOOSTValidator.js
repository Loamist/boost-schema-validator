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

        // Field table filter
        document.getElementById('showErrorsOnly').addEventListener('change', (e) => {
            this.fieldTableRenderer.filterErrorsOnly(e.target.checked);
        });

        // Editor change detection
        document.getElementById('jsonEditor').addEventListener('input', () => {
            this.uiController.updateValidateButton();
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
    handleEntityChange(entityName) {
        this.uiController.handleEntityChange(entityName);
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
            this.fieldTableRenderer.showPlaceholder('❌ Could not generate field table: Invalid JSON');
        }
    }

    /**
     * Display validation results in both summary and table views
     */
    displayValidationResults(result, testData) {
        // Update summary view
        this.uiController.displaySummaryResults(result);
        
        // Update field table view
        this.fieldTableRenderer.renderFieldTable(testData, result);
    }
}