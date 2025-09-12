/**
 * JourneyMapRenderer - Creates visual journey maps for TraceableUnit entities
 * Shows the path from harvest to current location with clean, demo-ready visuals
 */
import { MapRenderer } from './MapRenderer.js';

export class JourneyMapRenderer {
    constructor() {
        this.mockGeographicData = this.initializeMockData();
        this.mapRenderer = new MapRenderer();
        this.mapCounter = 0;
    }

    /**
     * Initialize mock geographic data for examples (Phase 1 approach)
     */
    initializeMockData() {
        return {
            'GEO-FOREST-OLYMPIC-07A': {
                coordinates: [-123.456789, 41.234567],
                description: 'Olympic Forest Site 07A',
                type: 'harvest_site',
                elevation: 1280,
                region: 'Olympic National Forest, WA'
            },
            'GEO-MILL-PACIFIC-001': {
                coordinates: [-124.123456, 40.987654],
                description: 'Pacific Mill Entrance',
                type: 'processing_location', 
                elevation: 150,
                region: 'Humboldt County, CA'
            },
            'GEO-HARVEST-SITE-CA-001': {
                coordinates: [-123.789012, 41.567890],
                description: 'Klamath Ridge Harvest Site',
                type: 'harvest_site',
                elevation: 1450,
                region: 'Northern California'
            },
            'GEO-STORAGE-YARD-001': {
                coordinates: [-123.654321, 41.123456],
                description: 'Central Storage Yard',
                type: 'storage_location',
                elevation: 890,
                region: 'Redwood County, CA'
            }
        };
    }

    /**
     * Render journey map for TraceableUnit data
     */
    renderJourneyMap(traceableUnitData, includeInteractiveMap = false) {
        const harvestGeoId = traceableUnitData.harvestGeographicDataId;
        const currentGeoId = traceableUnitData.currentGeographicDataId;

        // Try to resolve geographic data
        const harvestLocation = this.resolveGeographicData(harvestGeoId);
        const currentLocation = this.resolveGeographicData(currentGeoId);

        if (!harvestLocation && !currentLocation) {
            return this.renderNoDataFallback(harvestGeoId, currentGeoId);
        }

        return this.renderFullJourneyMap(
            harvestLocation || { id: harvestGeoId },
            currentLocation || { id: currentGeoId },
            traceableUnitData,
            includeInteractiveMap
        );
    }

    /**
     * Resolve geographic data from mock database
     */
    resolveGeographicData(geoId) {
        if (!geoId) return null;
        return this.mockGeographicData[geoId] || null;
    }

    /**
     * Render full journey map with coordinates and details
     */
    renderFullJourneyMap(harvestLocation, currentLocation, traceableUnitData, includeInteractiveMap = false) {
        const distance = this.calculateDistance(harvestLocation, currentLocation);
        const elevationChange = this.calculateElevationChange(harvestLocation, currentLocation);
        
        // Generate unique map container ID if needed
        const mapContainerId = includeInteractiveMap ? `journey-map-${++this.mapCounter}` : null;
        
        let interactiveMapHtml = '';
        if (includeInteractiveMap && (harvestLocation?.coordinates || currentLocation?.coordinates)) {
            interactiveMapHtml = this.mapRenderer.renderJourneyMap(
                harvestLocation, 
                currentLocation, 
                traceableUnitData, 
                mapContainerId
            );
        }
        
        return `
            <div class="journey-map">
                <div class="journey-header">
                    <h4>🗺️ Timber Journey ${includeInteractiveMap ? 'Interactive Map' : 'Overview'}</h4>
                    <div class="journey-stats">
                        <span class="stat">${distance}</span>
                        <span class="stat">${elevationChange}</span>
                    </div>
                </div>
                
                ${includeInteractiveMap ? interactiveMapHtml : `
                    <div class="journey-path">
                        ${this.renderLocationCard(harvestLocation, 'harvest', '🌲')}
                        ${this.renderJourneyLine(harvestLocation, currentLocation)}
                        ${this.renderLocationCard(currentLocation, 'current', '🏭')}
                    </div>
                `}
                
                <div class="journey-details">
                    ${this.renderJourneyMetadata(traceableUnitData)}
                </div>
            </div>
        `;
    }

    /**
     * Render location card for each stop in the journey
     */
    renderLocationCard(location, type, icon) {
        if (!location) return '';
        
        const hasCoordinates = location.coordinates && location.coordinates.length >= 2;
        
        return `
            <div class="location-card ${type}">
                <div class="location-icon">${icon}</div>
                <div class="location-info">
                    <div class="location-title">
                        ${type === 'harvest' ? 'Harvest Origin' : 'Current Location'}
                    </div>
                    <div class="location-name">
                        ${location.description || location.id}
                    </div>
                    ${hasCoordinates ? `
                        <div class="location-coords">
                            ${this.formatCoordinates(location.coordinates)}
                        </div>
                    ` : ''}
                    ${location.elevation ? `
                        <div class="location-elevation">
                            📏 ${location.elevation}m elevation
                        </div>
                    ` : ''}
                    ${location.region ? `
                        <div class="location-region">
                            📍 ${location.region}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render the connecting line between locations
     */
    renderJourneyLine(harvestLocation, currentLocation) {
        const hasFullData = harvestLocation?.coordinates && currentLocation?.coordinates;
        
        return `
            <div class="journey-line">
                <div class="journey-arrow">
                    <div class="arrow-line ${hasFullData ? 'animated' : 'simple'}"></div>
                    <div class="arrow-head">→</div>
                </div>
                <div class="journey-label">
                    ${hasFullData ? 'Supply Chain Path' : 'Journey Path'}
                </div>
            </div>
        `;
    }

    /**
     * Render journey metadata section
     */
    renderJourneyMetadata(data) {
        const metadata = [];
        
        if (data.totalVolumeM3) {
            metadata.push(`📦 Volume: ${data.totalVolumeM3} cubic meters`);
        }
        
        if (data.materialTypeId) {
            metadata.push(`🌳 Material: ${this.formatMaterialType(data.materialTypeId)}`);
        }
        
        if (data.productClassification) {
            metadata.push(`📋 Type: ${this.capitalizeFirst(data.productClassification)}`);
        }

        if (data.createdTimestamp) {
            const daysSince = this.calculateDaysSince(data.createdTimestamp);
            metadata.push(`⏱️ Journey started ${daysSince} days ago`);
        }

        return metadata.length > 0 ? `
            <div class="metadata-grid">
                ${metadata.map(item => `<div class="metadata-item">${item}</div>`).join('')}
            </div>
        ` : '';
    }

    /**
     * Calculate distance between two points (simplified for demo)
     */
    calculateDistance(location1, location2) {
        if (!location1?.coordinates || !location2?.coordinates) {
            return '~ Distance unknown';
        }
        
        // Simple distance calculation (not precise, for demo purposes)
        const [lon1, lat1] = location1.coordinates;
        const [lon2, lat2] = location2.coordinates;
        
        const deltaLat = Math.abs(lat2 - lat1);
        const deltaLon = Math.abs(lon2 - lon1);
        
        // Rough conversion to km (simplified)
        const distance = Math.sqrt(deltaLat * deltaLat + deltaLon * deltaLon) * 111;
        
        return `📏 ~${Math.round(distance)} km journey`;
    }

    /**
     * Calculate elevation change between locations
     */
    calculateElevationChange(location1, location2) {
        if (!location1?.elevation || !location2?.elevation) {
            return '';
        }
        
        const change = location2.elevation - location1.elevation;
        const direction = change > 0 ? '⬆️' : '⬇️';
        
        return `${direction} ${Math.abs(change)}m elevation change`;
    }

    /**
     * Format coordinates for display
     */
    formatCoordinates(coords) {
        if (!coords || coords.length < 2) return '';
        
        const [lon, lat] = coords;
        return `${lat.toFixed(3)}°N, ${Math.abs(lon).toFixed(3)}°W`;
    }

    /**
     * Format material type ID to readable text
     */
    formatMaterialType(materialTypeId) {
        if (!materialTypeId) return '';
        
        return materialTypeId
            .replace(/^MAT-/, '')
            .replace(/-/g, ' ')
            .split(' ')
            .map(word => this.capitalizeFirst(word))
            .join(' ');
    }

    /**
     * Calculate days since a timestamp
     */
    calculateDaysSince(timestamp) {
        try {
            const past = new Date(timestamp);
            const now = new Date();
            const diffTime = Math.abs(now - past);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        } catch {
            return 0;
        }
    }

    /**
     * Capitalize first letter of string
     */
    capitalizeFirst(str) {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    /**
     * Render fallback when no geographic data is available
     */
    renderNoDataFallback(harvestGeoId, currentGeoId) {
        return `
            <div class="journey-map no-data">
                <div class="journey-header">
                    <h4>🗺️ Journey Information</h4>
                    <div class="demo-note">
                        Geographic coordinates available in demo mode
                    </div>
                </div>
                
                <div class="journey-path-simple">
                    <div class="location-reference">
                        <div class="ref-icon">🌲</div>
                        <div class="ref-info">
                            <div class="ref-label">Harvest Location</div>
                            <div class="ref-id">${harvestGeoId || 'Not specified'}</div>
                        </div>
                    </div>
                    
                    <div class="simple-arrow">→</div>
                    
                    <div class="location-reference">
                        <div class="ref-icon">🏭</div>
                        <div class="ref-info">
                            <div class="ref-label">Current Location</div>
                            <div class="ref-id">${currentGeoId || 'Not specified'}</div>
                        </div>
                    </div>
                </div>
                
                <div class="fallback-note">
                    <p>📍 Full journey map with coordinates and details available when geographic data is resolved</p>
                </div>
            </div>
        `;
    }
}