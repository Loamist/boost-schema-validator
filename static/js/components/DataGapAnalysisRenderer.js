/**
 * Data Gap Analysis Renderer
 * Displays side-by-side comparison of AFP (current LCFS) vs BOOST requirements
 * Shows what fields are provided vs missing, categorized by collection complexity
 */

export class DataGapAnalysisRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentEntityType = null;

        // Entity-specific configurations
        this.entityConfigs = {
            'LCFSPathway': {
                title: 'LCFS Pathway - AFP vs BOOST',
                subtitle: 'Comparison: Current AFP Pathway Submission vs BOOST Requirements',
                carbLabel: 'Standard LCFS/AFP Fields',
                carbDescription: 'Fields already collected in current AFP portal submissions',
                // Fields required by CARB for pathway certification
                carbRequiredFields: [
                    'pathwayId',
                    'pathwayType',
                    'feedstockCategory',
                    'fuelProduct',
                    'facilityLocation',
                    'carbonIntensity',
                    'energyEconomyRatio',
                    'certificationDate',
                    'verificationStatus',
                    'caGreetVersion'
                ],
                // BOOST enhancement fields by collection complexity
                fieldComplexity: {
                    reasonable: [
                        'facilityCapacity',
                        'geographicScope',
                        'expirationDate'
                    ],
                    robust: [
                        'processDescription',
                        'lastUpdated'
                    ]
                },
                // Field descriptions and collection methods
                fieldMetadata: {
                    facilityCapacity: {
                        description: 'Annual production capacity in gallons',
                        collectionMethod: 'Facility operations data (self-reported)',
                        source: 'Facility Operations'
                    },
                    geographicScope: {
                        description: 'Geographic applicability of pathway',
                        collectionMethod: 'Based on feedstock sourcing region',
                        source: 'Supply Chain Analysis'
                    },
                    expirationDate: {
                        description: 'Pathway certification expiration date',
                        collectionMethod: 'CARB certification tracking',
                        source: 'CARB Records'
                    },
                    processDescription: {
                        description: 'Detailed production process description',
                        collectionMethod: 'Engineering documentation and technical review',
                        source: 'Engineering Documentation',
                        openQuestion: 'How detailed must this be? Attestation vs technical review?'
                    },
                    lastUpdated: {
                        description: 'Timestamp of most recent pathway data update',
                        collectionMethod: 'Automated system timestamp',
                        source: 'System Generated',
                        openQuestion: 'What triggers an update? Any field change or only material changes?'
                    }
                }
            },
            'LCFSReporting': {
                title: 'LCFS Reporting - CARB Required vs BOOST Enhanced',
                subtitle: 'Comparison: CARB Quarterly Reporting Requirements vs BOOST Enhancements',
                carbLabel: 'CARB-Required Fields',
                carbDescription: 'Fields mandated by Cal. Code Regs. Tit. 17, § 95491 for quarterly reporting',
                // Fields required by CARB § 95491 for quarterly reporting
                carbRequiredFields: [
                    'regulatedEntityId',
                    'reportingPeriod',
                    'totalFuelVolume',
                    'totalCreditsGenerated',
                    'totalDeficitsIncurred',
                    'netPosition',
                    'complianceStatus',
                    'submissionDate',
                    'pathwaySummary'
                ],
                // BOOST enhancement fields by collection complexity
                fieldComplexity: {
                    reasonable: [
                        'reportingId',
                        'verificationRequired',
                        'reportingDeadline',
                        'calculationParameters'
                    ],
                    robust: [
                        'verificationDate',
                        'VerificationStatementId',
                        'transactionIds',
                        'complianceMetrics',
                        'lastUpdated'
                    ]
                },
                // Field descriptions and collection methods
                fieldMetadata: {
                    reportingId: {
                        description: 'Internal unique identifier for the quarterly report',
                        collectionMethod: 'Auto-generated by BOOST system',
                        source: 'System Generated'
                    },
                    verificationDate: {
                        description: 'Date when third-party verification was completed',
                        collectionMethod: 'Third-party verifier submission',
                        source: 'Verification Provider',
                        openQuestion: 'Should this be automatically captured or manually entered?'
                    },
                    verificationRequired: {
                        description: 'Flag indicating if third-party verification is required',
                        collectionMethod: 'Based on entity size/volume thresholds',
                        source: 'Business Logic'
                    },
                    VerificationStatementId: {
                        description: 'Reference to VerificationStatement entity',
                        collectionMethod: 'Link to verification documentation in BOOST',
                        source: 'BOOST Supply Chain',
                        openQuestion: 'How to integrate with external verification systems?'
                    },
                    reportingDeadline: {
                        description: 'CARB deadline for report submission',
                        collectionMethod: 'Calculated as 30 days after quarter end',
                        source: 'System Calculated'
                    },
                    transactionIds: {
                        description: 'Array of Transaction entity IDs included in this report',
                        collectionMethod: 'Aggregated from Transaction entities',
                        source: 'BOOST Data Lineage',
                        openQuestion: 'Should we validate all transactions are within the reporting period?'
                    },
                    calculationParameters: {
                        description: 'Parameters used for credit calculations (conversion factors, benchmarks)',
                        collectionMethod: 'Regulatory parameters from CARB guidance',
                        source: 'CARB Regulations'
                    },
                    complianceMetrics: {
                        description: 'Business intelligence metrics (credit value, environmental impact)',
                        collectionMethod: 'Calculated from credits and market data',
                        source: 'Business Analytics',
                        openQuestion: 'What credit price source should be used for valuations?'
                    },
                    lastUpdated: {
                        description: 'Timestamp of most recent report update',
                        collectionMethod: 'Automated system timestamp',
                        source: 'System Generated'
                    }
                }
            }
        };
    }

    /**
     * Main render method - displays gap analysis for validation result
     */
    renderGapAnalysis(validationResult, jsonData, schema) {
        if (!this.container) {
            console.error('Gap analysis container not found');
            return;
        }

        // Detect entity type from JSON data
        this.currentEntityType = jsonData['@type'] || 'LCFSPathway';

        // Check if we have config for this entity type
        if (!this.entityConfigs[this.currentEntityType]) {
            console.warn(`No gap analysis config for entity type: ${this.currentEntityType}`);
            this.container.innerHTML = `
                <div class="alert alert-info">
                    <svg class="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                    </svg>
                    <span>Gap analysis not available for entity type: ${this.currentEntityType}</span>
                </div>
            `;
            return;
        }

        // Analyze the data
        const analysis = this.analyzeDataGaps(jsonData, schema);

        // Generate HTML
        const html = this.generateGapAnalysisHTML(analysis, validationResult);

        this.container.innerHTML = html;
    }

    /**
     * Analyze which fields are provided vs missing
     */
    analyzeDataGaps(jsonData, schema) {
        const config = this.entityConfigs[this.currentEntityType];
        const provided = [];
        const missing = [];
        const allFields = Object.keys(schema.properties || {});

        allFields.forEach(field => {
            // Skip only @context (but include @type and @id as BOOST standard fields)
            if (field === '@context') {
                return;
            }

            const hasValue = jsonData.hasOwnProperty(field) &&
                           jsonData[field] !== null &&
                           jsonData[field] !== undefined;

            if (hasValue) {
                provided.push({
                    field,
                    value: jsonData[field],
                    inCARB: config.carbRequiredFields.includes(field),
                    required: this.isRequired(field, schema)
                });
            } else {
                missing.push({
                    field,
                    required: this.isRequired(field, schema),
                    complexity: this.getFieldComplexity(field),
                    metadata: config.fieldMetadata[field]
                });
            }
        });

        return {
            provided,
            missing,
            carbProvided: provided.filter(f => f.inCARB),
            boostOnly: provided.filter(f => !f.inCARB),
            missingReasonable: missing.filter(f => f.complexity === 'reasonable'),
            missingRobust: missing.filter(f => f.complexity === 'robust'),
            totalFields: allFields.length - 1, // Exclude only @context
            providedCount: provided.length,
            missingCount: missing.length
        };
    }

    /**
     * Check if field is required by schema
     */
    isRequired(field, schema) {
        return schema.required && schema.required.includes(field);
    }

    /**
     * Get collection complexity for a field
     */
    getFieldComplexity(field) {
        const config = this.entityConfigs[this.currentEntityType];
        if (config.fieldComplexity.reasonable.includes(field)) {
            return 'reasonable';
        } else if (config.fieldComplexity.robust.includes(field)) {
            return 'robust';
        }
        return 'unknown';
    }

    /**
     * Generate complete gap analysis HTML (DaisyUI styled)
     */
    generateGapAnalysisHTML(analysis, validationResult) {
        const completeness = Math.round((analysis.providedCount / analysis.totalFields) * 100);

        return `
            <div class="space-y-6">
                ${this.generateSummarySection(analysis, completeness, validationResult)}
                ${this.generateProvidedDataSection(analysis)}
                ${this.generateMissingDataSection(analysis)}
            </div>
        `;
    }

    /**
     * Generate summary statistics section (DaisyUI stats)
     */
    generateSummarySection(analysis, completeness, validationResult) {
        const config = this.entityConfigs[this.currentEntityType];
        const statusBadge = validationResult.valid
            ? '<span class="badge badge-success gap-1"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg> Validation Passed</span>'
            : '<span class="badge badge-warning gap-1"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg> Has Validation Errors</span>';

        const completenessColor = completeness >= 80 ? 'text-success' : completeness >= 50 ? 'text-warning' : 'text-error';

        return `
            <div class="mb-6">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h3 class="text-2xl font-bold flex items-center gap-2">
                            <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                            ${config.title}
                        </h3>
                        <p class="text-base-content/70 mt-1">${config.subtitle}</p>
                    </div>
                    ${statusBadge}
                </div>

                <div class="stats stats-horizontal shadow w-full bg-base-100">
                    <div class="stat">
                        <div class="stat-figure text-success">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div class="stat-title">Fields Provided</div>
                        <div class="stat-value text-success">${analysis.providedCount}</div>
                        <div class="stat-desc">Currently in submission</div>
                    </div>

                    <div class="stat">
                        <div class="stat-figure text-warning">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                        </div>
                        <div class="stat-title">Additional Required</div>
                        <div class="stat-value text-warning">${analysis.missingCount}</div>
                        <div class="stat-desc">For BOOST compliance</div>
                    </div>

                    <div class="stat">
                        <div class="stat-figure ${completenessColor}">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                            </svg>
                        </div>
                        <div class="stat-title">Completeness</div>
                        <div class="stat-value ${completenessColor}">${completeness}%</div>
                        <div class="stat-desc">
                            <div class="w-full bg-base-300 rounded-full h-2 mt-1">
                                <div class="bg-${completeness >= 80 ? 'success' : completeness >= 50 ? 'warning' : 'error'} h-2 rounded-full" style="width: ${completeness}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate provided data section (DaisyUI cards and tables)
     */
    generateProvidedDataSection(analysis) {
        const config = this.entityConfigs[this.currentEntityType];

        if (analysis.provided.length === 0) {
            return '';
        }

        const carbRows = analysis.carbProvided.map(f => this.generateProvidedRow(f, true)).join('');
        const boostRows = analysis.boostOnly.map(f => this.generateProvidedRow(f, false)).join('');

        return `
            <div class="mb-6">
                <div class="alert alert-success shadow-lg mb-4">
                    <svg class="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span class="font-semibold">Currently Provided Data</span>
                </div>

                ${analysis.carbProvided.length > 0 ? `
                    <div class="card bg-base-100 shadow-lg border border-success/20 mb-4">
                        <div class="card-body">
                            <h5 class="card-title text-success flex items-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                ${config.carbLabel}
                                <span class="badge badge-success badge-sm">${analysis.carbProvided.length}</span>
                            </h5>
                            <p class="text-sm text-base-content/70 mb-3">${config.carbDescription}</p>
                            <div class="overflow-x-auto">
                                <table class="table table-zebra table-sm">
                                    <thead class="bg-success/10">
                                        <tr>
                                            <th>Field</th>
                                            <th>Value</th>
                                            <th class="text-center">LCFS Required</th>
                                            <th class="text-center">BOOST Required</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${carbRows}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ` : ''}

                ${analysis.boostOnly.length > 0 ? `
                    <div class="card bg-base-100 shadow-lg border border-primary/20">
                        <div class="card-body">
                            <h5 class="card-title text-primary flex items-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                                BOOST Enhancement Fields
                                <span class="badge badge-primary badge-sm">${analysis.boostOnly.length}</span>
                            </h5>
                            <p class="text-sm text-base-content/70 mb-3">Additional fields provided beyond ${this.currentEntityType === 'LCFSPathway' ? 'standard AFP' : 'CARB compliance'} requirements</p>
                            <div class="overflow-x-auto">
                                <table class="table table-zebra table-sm">
                                    <thead class="bg-primary/10">
                                        <tr>
                                            <th>Field</th>
                                            <th>Value</th>
                                            <th class="text-center">LCFS Required</th>
                                            <th class="text-center">BOOST Required</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${boostRows}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Generate row for provided field (DaisyUI styled)
     */
    generateProvidedRow(fieldData, isCARB) {
        const value = this.formatValue(fieldData.value);

        // First column: LCFS/CARB Required (regulatory requirement)
        const lcfsRequiredBadge = isCARB
            ? '<span class="badge badge-success badge-sm">Yes</span>'
            : '<span class="badge badge-ghost badge-sm">No</span>';

        // Second column: BOOST Required (schema validation requirement)
        const boostRequiredBadge = fieldData.required
            ? '<span class="badge badge-warning badge-sm">Yes</span>'
            : '<span class="badge badge-ghost badge-sm">Optional</span>';

        return `
            <tr class="hover:bg-base-200">
                <td><code class="text-sm font-mono font-semibold">${fieldData.field}</code></td>
                <td class="text-sm">${value}</td>
                <td class="text-center">${lcfsRequiredBadge}</td>
                <td class="text-center">${boostRequiredBadge}</td>
            </tr>
        `;
    }

    /**
     * Generate missing data section (DaisyUI cards)
     */
    generateMissingDataSection(analysis) {
        if (analysis.missing.length === 0) {
            return `
                <div class="alert alert-success shadow-lg">
                    <svg class="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <div>
                        <h4 class="font-bold">All BOOST fields provided!</h4>
                        <p class="text-sm">No data gaps detected - submission is complete</p>
                    </div>
                </div>
            `;
        }

        const reasonableRows = analysis.missingReasonable.map(f => this.generateMissingRow(f)).join('');
        const robustRows = analysis.missingRobust.map(f => this.generateMissingRow(f)).join('');

        return `
            <div class="mb-6">
                <div class="alert alert-warning shadow-lg mb-4">
                    <svg class="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    <span class="font-semibold">Additional BOOST Requirements (Not in Current AFP Submission)</span>
                </div>

                ${analysis.missingReasonable.length > 0 ? `
                    <div class="card bg-base-100 shadow-lg border border-info/20 mb-4">
                        <div class="card-body">
                            <h5 class="card-title text-info flex items-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                                </svg>
                                Reasonable to Collect
                                <span class="badge badge-info badge-sm">${analysis.missingReasonable.length}</span>
                            </h5>
                            <p class="text-sm text-base-content/70 mb-3">
                                Fields that can be collected with existing data sources and minimal additional effort.
                            </p>
                            <div class="overflow-x-auto">
                                <table class="table table-zebra table-sm">
                                    <thead class="bg-info/10">
                                        <tr>
                                            <th>Field</th>
                                            <th>Description</th>
                                            <th>Collection Method</th>
                                            <th>Data Source</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${reasonableRows}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ` : ''}

                ${analysis.missingRobust.length > 0 ? `
                    <div class="card bg-base-100 shadow-lg border border-warning/20">
                        <div class="card-body">
                            <h5 class="card-title text-warning flex items-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                </svg>
                                Requires More Effort
                                <span class="badge badge-warning badge-sm">${analysis.missingRobust.length}</span>
                            </h5>
                            <p class="text-sm text-base-content/70 mb-3">
                                Fields requiring additional documentation, technical analysis, or third-party input.
                            </p>
                            <div class="overflow-x-auto">
                                <table class="table table-zebra table-sm">
                                    <thead class="bg-warning/10">
                                        <tr>
                                            <th>Field</th>
                                            <th>Description</th>
                                            <th>Collection Method</th>
                                            <th>Open Questions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${robustRows}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Generate row for missing field (DaisyUI styled)
     */
    generateMissingRow(fieldData) {
        const metadata = fieldData.metadata || {};
        const description = metadata.description || 'No description available';
        const collectionMethod = metadata.collectionMethod || 'To be determined';
        const source = metadata.source || 'Unknown';
        const openQuestion = metadata.openQuestion;

        if (openQuestion) {
            return `
                <tr class="hover:bg-base-200">
                    <td><code class="text-sm font-mono font-semibold">${fieldData.field}</code></td>
                    <td class="text-sm">${description}</td>
                    <td class="text-sm">${collectionMethod}</td>
                    <td>
                        <div class="alert alert-info py-2 px-3">
                            <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
                            </svg>
                            <span class="text-xs">${openQuestion}</span>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            return `
                <tr class="hover:bg-base-200">
                    <td><code class="text-sm font-mono font-semibold">${fieldData.field}</code></td>
                    <td class="text-sm">${description}</td>
                    <td class="text-sm">${collectionMethod}</td>
                    <td class="text-sm">${source}</td>
                </tr>
            `;
        }
    }

    /**
     * Format field value for display
     */
    formatValue(value) {
        if (value === null || value === undefined) {
            return '<em>null</em>';
        }

        if (typeof value === 'string') {
            // Truncate long strings
            if (value.length > 50) {
                return `${this.escapeHtml(value.substring(0, 50))}...`;
            }
            return this.escapeHtml(value);
        }

        if (typeof value === 'number') {
            return value.toString();
        }

        if (typeof value === 'boolean') {
            return value ? '✓ true' : '✗ false';
        }

        if (Array.isArray(value)) {
            // Handle arrays - show actual content
            if (value.length === 0) {
                return '<em>empty array</em>';
            }

            // For arrays of objects, format each object
            if (typeof value[0] === 'object') {
                return this.formatArrayOfObjects(value);
            }

            // For arrays of primitives, show truncated list
            const preview = value.slice(0, 3).map(v => this.escapeHtml(String(v))).join(', ');
            return value.length > 3 ? `${preview}... (${value.length} total)` : preview;
        }

        if (typeof value === 'object') {
            // Handle objects - show truncated JSON
            const json = JSON.stringify(value);
            if (json.length > 50) {
                return `<span class="badge badge-ghost badge-sm">object</span>`;
            }
            return this.escapeHtml(json);
        }

        return String(value);
    }

    /**
     * Format array of objects for display in table
     */
    formatArrayOfObjects(arr) {
        if (arr.length === 0) return '<em>empty</em>';

        // Create a compact list format with key details
        const items = arr.map((obj, idx) => {
            // Get the most relevant fields (first 3 non-null fields)
            const entries = Object.entries(obj)
                .filter(([k, v]) => v !== null && v !== undefined)
                .slice(0, 3);

            const details = entries
                .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
                .join(', ');

            return `<div class="text-xs mb-1"><strong>[${idx + 1}]</strong> ${this.escapeHtml(details)}</div>`;
        }).join('');

        return `<div class="max-h-24 overflow-y-auto">${items}</div>`;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
