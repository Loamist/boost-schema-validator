/**
 * MapRenderer - Creates interactive maps for journey visualization
 * Uses Leaflet.js to show timber journey from harvest to current location
 */

export class MapRenderer {
    constructor() {
        this.currentMap = null;
        this.mapContainer = null;
    }

    /**
     * Render interactive journey map
     */
    renderJourneyMap(harvestLocation, currentLocation, traceableUnitData, containerId) {
        // Create map container HTML
        const mapHtml = `
            <div class="journey-map-container">
                <div class="map-header">
                    <h4>🗺️ Interactive Journey Map</h4>
                    <div class="map-controls">
                        <button class="map-btn" onclick="this.parentElement.parentElement.parentElement.querySelector('.leaflet-container').requestFullscreen().catch(e => console.log(e))">
                            🔍 Fullscreen
                        </button>
                    </div>
                </div>
                <div id="${containerId}" class="journey-map-leaflet"></div>
                <div class="map-legend">
                    <div class="legend-item">
                        <span class="legend-icon harvest">🌲</span>
                        <span>Harvest Origin</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-icon current">🏭</span>
                        <span>Current Location</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-line"></span>
                        <span>Supply Chain Path</span>
                    </div>
                </div>
            </div>
        `;

        // Initialize map after DOM is updated
        setTimeout(() => {
            this.initializeLeafletMap(harvestLocation, currentLocation, traceableUnitData, containerId);
        }, 100);

        return mapHtml;
    }

    /**
     * Initialize the Leaflet map
     */
    initializeLeafletMap(harvestLocation, currentLocation, traceableUnitData, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Clean up existing map
        if (this.currentMap) {
            this.currentMap.remove();
        }

        // Check if we have valid coordinates
        const hasHarvestCoords = harvestLocation?.coordinates && harvestLocation.coordinates.length >= 2;
        const hasCurrentCoords = currentLocation?.coordinates && currentLocation.coordinates.length >= 2;

        if (!hasHarvestCoords && !hasCurrentCoords) {
            container.innerHTML = `
                <div class="map-placeholder">
                    <p>🗺️ Interactive map requires coordinate data</p>
                    <p>Available in demo mode with example data</p>
                </div>
            `;
            return;
        }

        // Create the map
        const map = L.map(containerId, {
            zoomControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            touchZoom: true
        });

        this.currentMap = map;

        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(map);

        const markers = [];
        const bounds = L.latLngBounds();

        // Add harvest location marker
        if (hasHarvestCoords) {
            const [harvestLon, harvestLat] = harvestLocation.coordinates;
            const harvestLatLng = L.latLng(harvestLat, harvestLon);
            
            const harvestMarker = L.marker(harvestLatLng, {
                icon: this.createCustomIcon('🌲', '#22c55e')
            }).addTo(map);

            harvestMarker.bindPopup(this.createPopupContent(
                '🌲 Harvest Origin',
                harvestLocation,
                traceableUnitData,
                'harvest'
            ));

            markers.push(harvestMarker);
            bounds.extend(harvestLatLng);
        }

        // Add current location marker
        if (hasCurrentCoords) {
            const [currentLon, currentLat] = currentLocation.coordinates;
            const currentLatLng = L.latLng(currentLat, currentLon);
            
            const currentMarker = L.marker(currentLatLng, {
                icon: this.createCustomIcon('🏭', '#3b82f6')
            }).addTo(map);

            currentMarker.bindPopup(this.createPopupContent(
                '🏭 Current Location',
                currentLocation,
                traceableUnitData,
                'current'
            ));

            markers.push(currentMarker);
            bounds.extend(currentLatLng);
        }

        // Draw path between locations if both exist
        if (hasHarvestCoords && hasCurrentCoords) {
            const [harvestLon, harvestLat] = harvestLocation.coordinates;
            const [currentLon, currentLat] = currentLocation.coordinates;
            
            const pathLine = L.polyline([
                [harvestLat, harvestLon],
                [currentLat, currentLon]
            ], {
                color: '#8b5cf6',
                weight: 4,
                opacity: 0.8,
                dashArray: '10, 10'
            }).addTo(map);

            // Add distance label
            const midLat = (harvestLat + currentLat) / 2;
            const midLon = (harvestLon + currentLon) / 2;
            const distance = this.calculateDistance(harvestLat, harvestLon, currentLat, currentLon);
            
            L.marker([midLat, midLon], {
                icon: L.divIcon({
                    className: 'distance-label',
                    html: `<div class="distance-text">~${Math.round(distance)} km</div>`,
                    iconSize: [80, 20],
                    iconAnchor: [40, 10]
                })
            }).addTo(map);
        }

        // Fit map to show all markers with padding
        if (markers.length > 0) {
            map.fitBounds(bounds, {
                padding: [20, 20],
                maxZoom: 10
            });
        }

        // Add scale control
        L.control.scale().addTo(map);
    }

    /**
     * Create custom icon for markers
     */
    createCustomIcon(emoji, color) {
        return L.divIcon({
            className: 'custom-marker',
            html: `
                <div class="marker-icon" style="background-color: ${color};">
                    <span class="marker-emoji">${emoji}</span>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });
    }

    /**
     * Create popup content for markers
     */
    createPopupContent(title, location, traceableUnitData, type) {
        const coordinates = location.coordinates ? 
            `${location.coordinates[1].toFixed(4)}°N, ${Math.abs(location.coordinates[0]).toFixed(4)}°W` : 
            'Coordinates not available';

        let additionalInfo = '';
        if (type === 'harvest' && traceableUnitData.materialTypeId) {
            const materialType = traceableUnitData.materialTypeId
                .replace(/^MAT-/, '')
                .replace(/-/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
            additionalInfo += `<div><strong>Material:</strong> ${materialType}</div>`;
        }

        if (traceableUnitData.totalVolumeM3) {
            additionalInfo += `<div><strong>Volume:</strong> ${traceableUnitData.totalVolumeM3} m³</div>`;
        }

        if (location.elevation) {
            additionalInfo += `<div><strong>Elevation:</strong> ${location.elevation}m</div>`;
        }

        return `
            <div class="map-popup">
                <h5>${title}</h5>
                <div><strong>Location:</strong> ${location.description || location.id}</div>
                <div><strong>Coordinates:</strong> ${coordinates}</div>
                ${location.region ? `<div><strong>Region:</strong> ${location.region}</div>` : ''}
                ${additionalInfo}
            </div>
        `;
    }

    /**
     * Calculate distance between two points in kilometers
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    /**
     * Convert degrees to radians
     */
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Clean up map resources
     */
    cleanup() {
        if (this.currentMap) {
            this.currentMap.remove();
            this.currentMap = null;
        }
    }
}