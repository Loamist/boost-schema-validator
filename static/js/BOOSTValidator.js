/**
 * BOOST Schema Validator - Main Application Class
 * Orchestrates all components and services for the BOOST validator interface
 */
import { ValidationService } from './services/ValidationService.js';
import { UIController } from './components/UIController.js';
import { FieldTableRenderer } from './components/FieldTableRenderer.js';
import { PlainTextRenderer } from './components/PlainTextRenderer.js';
import { JourneyMapRenderer } from './components/JourneyMapRenderer.js';
import { DataGapAnalysisRenderer } from './components/DataGapAnalysisRenderer.js';

export class BOOSTValidator {
    constructor() {
        this.validationService = new ValidationService();
        this.uiController = new UIController();
        this.fieldTableRenderer = new FieldTableRenderer('fieldTableContainer');
        this.plainTextRenderer = new PlainTextRenderer();
        this.journeyMapRenderer = new JourneyMapRenderer();
        this.dataGapRenderer = new DataGapAnalysisRenderer('gapAnalysisContainer');
        this.currentEntityDictionary = null;
        this.currentJsonData = null;
        this.currentSchema = null;

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
        // Note: Load Example is now handled by dropdown click handlers in updateExampleSelector()

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
            this.hideGapAnalysisSection();
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

            // Load available examples and update UI
            try {
                console.log('Fetching examples for entity:', entityName);
                const examples = await this.validationService.getEntityExamples(entityName);
                console.log('Received examples response:', examples);
                this.updateExampleSelector(examples);
            } catch (error) {
                console.error('ERROR loading examples list:', error);
                console.error('Error details:', error.message, error.stack);
            }
        } else {
            this.currentEntityDictionary = null;
        }
    }

    /**
     * Update example selector based on available examples
     */
    updateExampleSelector(examples) {
        console.log('updateExampleSelector called with:', examples);
        const dropdownBtn = document.getElementById('exampleDropdownBtn');
        const dropdownMenu = document.getElementById('exampleDropdownMenu');

        console.log('Dropdown elements:', { dropdownBtn, dropdownMenu });

        if (!examples || examples.length === 0) {
            // No examples available - disable dropdown
            console.log('No examples available, disabling dropdown');
            dropdownBtn.disabled = true;
            dropdownMenu.innerHTML = '<li><a class="disabled">No examples available</a></li>';
            return;
        }

        // Enable dropdown and populate with all available examples
        console.log('Populating dropdown with', examples.length, 'examples');
        dropdownBtn.disabled = false;

        dropdownMenu.innerHTML = examples.map(example => `
            <li>
                <a href="#" class="flex flex-col items-start gap-1" data-example="${example.filename}">
                    <span class="font-semibold">${this.escapeHtml(example.name)}</span>
                    <span class="text-xs text-base-content/60">${example.filename}</span>
                </a>
            </li>
        `).join('');

        console.log('Dropdown HTML updated:', dropdownMenu.innerHTML);

        // Initially hide the dropdown menu
        dropdownMenu.classList.add('hidden');

        // Add toggle handler to the dropdown button
        const toggleDropdown = (e) => {
            e.stopPropagation();
            console.log('Dropdown button clicked, toggling menu');
            dropdownMenu.classList.toggle('hidden');
        };

        // Remove any existing listeners and add new one
        const newBtn = dropdownBtn.cloneNode(true);
        dropdownBtn.parentNode.replaceChild(newBtn, dropdownBtn);
        newBtn.addEventListener('click', toggleDropdown);

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!newBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.add('hidden');
            }
        });

        // Add click handlers to menu items
        dropdownMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const exampleName = e.currentTarget.dataset.example;
                console.log('Example clicked:', exampleName);
                dropdownMenu.classList.add('hidden'); // Close dropdown
                await this.loadSpecificExample(exampleName);
            });
        });

        console.log('Click handlers added to', dropdownMenu.querySelectorAll('a').length, 'links');
    }

    /**
     * Load a specific example by filename
     */
    async loadSpecificExample(exampleFilename) {
        const entityName = this.uiController.getCurrentEntity();
        if (!entityName) return;

        try {
            this.uiController.setStatus('loading', `Loading ${exampleFilename}...`);

            const exampleData = await this.validationService.getSpecificExample(entityName, exampleFilename);

            this.uiController.setEditorContent(exampleData);
            this.updateCurrentJsonData();
            this.uiController.setStatus('ready', 'Example loaded - ready to validate');

        } catch (error) {
            this.uiController.showError(error.message);
            this.uiController.setStatus('ready', 'Ready to validate');
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

            // Load schema and perform validation in parallel
            const [result, schema] = await Promise.all([
                this.validationService.validateEntity(entityName, testData),
                this.validationService.getEntitySchema(entityName)
            ]);

            // Store schema for use in gap analysis
            this.currentSchema = schema;

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
            this.hideGapAnalysisSection();
        }
    }

    /**
     * Display validation results - auto-detect LCFS entities for gap analysis
     */
    displayValidationResults(result, testData) {
        const entityName = this.uiController.getCurrentEntity();

        // Update summary view
        this.uiController.displaySummaryResults(result);

        // Show the entity representation section
        this.showEntityRepresentationSection();

        // Auto-detect LCFS entities for gap analysis
        if (this.isLcfsEntity(entityName)) {
            // Show gap analysis for LCFS entities
            this.showGapAnalysisSection();
            this.hideFieldAnalysisSection();
            this.dataGapRenderer.renderGapAnalysis(result, testData, this.currentSchema);
        } else {
            // Show field analysis for other entities
            this.showFieldAnalysisSection();
            this.hideGapAnalysisSection();
            this.fieldTableRenderer.renderEnhancedTable(result, testData, this.currentEntityDictionary);
        }

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
        // Show/hide content divs
        document.getElementById('plainTextRepresentation').classList.remove('hidden');
        document.getElementById('visualJourneyRepresentation').classList.add('hidden');

        // Update tab active states (DaisyUI tabs)
        document.getElementById('plainTextBtn').classList.add('tab-active');
        document.getElementById('visualJourneyBtn').classList.remove('tab-active');
    }

    /**
     * Switch to Visual Journey representation
     */
    switchToVisualJourneyRepresentation() {
        // Show/hide content divs
        document.getElementById('plainTextRepresentation').classList.add('hidden');
        document.getElementById('visualJourneyRepresentation').classList.remove('hidden');

        // Update tab active states (DaisyUI tabs)
        document.getElementById('plainTextBtn').classList.remove('tab-active');
        document.getElementById('visualJourneyBtn').classList.add('tab-active');
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
     * Update plain text representation content with DaisyUI styling
     */
    updatePlainTextRepresentation() {
        const container = document.getElementById('plainTextContent');

        if (!this.currentJsonData) {
            container.innerHTML = `
                <div class="alert alert-info">
                    <svg class="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span>Validation results will show in human-readable format here</span>
                </div>
            `;
            return;
        }

        const entityName = this.uiController.getCurrentEntity();
        const plainText = this.plainTextRenderer.convertToPlainText(this.currentJsonData, entityName);

        // Parse plain text into structured data
        const lines = plainText.split('\n').filter(line => line.trim());
        const formattedFields = lines.map(line => {
            if (line.startsWith('===')) {
                return null; // Skip header line
            }
            return this.formatPlainTextField(line);
        }).filter(Boolean);

        container.innerHTML = `
            <div class="card bg-base-100 shadow-lg border border-base-300">
                <div class="card-body p-6">
                    <h3 class="card-title text-primary flex items-center gap-2 mb-4">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        ${entityName || 'Entity Data'}
                    </h3>
                    <div class="divider my-2"></div>
                    <div class="space-y-3">
                        ${formattedFields.join('')}
                    </div>
                </div>
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
     * Format a single plain text field with DaisyUI styling
     */
    formatPlainTextField(line) {
        if (!line.trim()) return '';

        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();

        if (!key || !value) return '';

        // Determine badge/styling based on content
        let valueBadge = '';
        let valueClass = 'text-base-content';

        if (value.includes('TRU-') || value.includes('GEO-') || value.includes('ORG-') ||
            value.includes('MAT-') || value.includes('OP-') || value.includes('IM-')) {
            // Foreign key reference
            valueBadge = '<span class="badge badge-primary badge-sm mr-2">Reference</span>';
            valueClass = 'font-mono text-sm';
        } else if (value.includes('cubic meters') || value.match(/\d+\s*(m3|gallons|liters)/i)) {
            // Volume/measurement
            valueBadge = '<span class="badge badge-info badge-sm mr-2">Measurement</span>';
        } else if (value.includes('%') || value.includes('confidence') || value.includes('Level')) {
            // Percentage or level
            valueBadge = '<span class="badge badge-accent badge-sm mr-2">Metric</span>';
        } else if (value.toLowerCase() === 'active' || value.toLowerCase() === 'inactive') {
            // Status
            const badgeColor = value.toLowerCase() === 'active' ? 'badge-success' : 'badge-ghost';
            valueBadge = `<span class="badge ${badgeColor} badge-sm mr-2">Status</span>`;
        } else if (value.match(/\d{4}-\d{2}-\d{2}/) || value.match(/\d{1,2}\/\d{1,2}\/\d{4}/) ||
                   value.match(/(January|February|March|April|May|June|July|August|September|October|November|December)/)) {
            // Date
            valueBadge = '<span class="badge badge-outline badge-sm mr-2">Date</span>';
        } else if (value.match(/^https?:\/\//)) {
            // URL
            valueBadge = '<span class="badge badge-secondary badge-sm mr-2">Link</span>';
            valueClass = 'break-all';
        }

        // Truncate very long values
        let displayValue = this.escapeHtml(value);
        if (value.length > 120) {
            const truncated = value.substring(0, 120);
            const remaining = value.substring(120);
            const uniqueId = `expand-${Math.random().toString(36).substr(2, 9)}`;
            displayValue = `
                <span id="${uniqueId}-truncated">${this.escapeHtml(truncated)}</span>
                <span class="text-base-content/50" id="${uniqueId}-ellipsis">...
                    <button class="btn btn-xs btn-ghost" onclick="document.getElementById('${uniqueId}-ellipsis').classList.add('hidden'); document.getElementById('${uniqueId}-full').classList.remove('hidden')">
                        Show more
                    </button>
                </span>
                <span class="hidden" id="${uniqueId}-full">${this.escapeHtml(remaining)}
                    <button class="btn btn-xs btn-ghost" onclick="document.getElementById('${uniqueId}-full').classList.add('hidden'); document.getElementById('${uniqueId}-ellipsis').classList.remove('hidden')">
                        Show less
                    </button>
                </span>
            `;
        }

        return `
            <div class="flex flex-col sm:flex-row py-2 px-3 rounded-lg hover:bg-base-200/50 transition-colors border-l-2 border-primary/30">
                <div class="font-semibold text-base-content/80 min-w-[200px] mb-1 sm:mb-0">
                    ${this.escapeHtml(key.trim())}:
                </div>
                <div class="${valueClass} flex-1">
                    ${valueBadge}${displayValue}
                </div>
            </div>
        `;
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

    /**
     * Check if entity is an LCFS entity that should use gap analysis
     */
    isLcfsEntity(entityName) {
        const lcfsEntities = ['LcfsPathway', 'LcfsReporting'];
        return lcfsEntities.includes(entityName);
    }

    /**
     * Show the gap analysis section
     */
    showGapAnalysisSection() {
        const section = document.getElementById('gapAnalysisSection');
        if (section) {
            section.style.display = 'block';
        }
    }

    /**
     * Hide the gap analysis section
     */
    hideGapAnalysisSection() {
        const section = document.getElementById('gapAnalysisSection');
        if (section) {
            section.style.display = 'none';
        }
    }
}