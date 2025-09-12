/**
 * ValidationService - Handles all API communication with the BOOST validator backend
 */
export class ValidationService {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
    }

    /**
     * Get list of available entities from the backend
     */
    async getEntities() {
        try {
            const response = await fetch('/api/entities');
            const data = await response.json();
            
            if (data.entities) {
                return data.entities;
            } else {
                throw new Error(data.error || 'Failed to load entities');
            }
        } catch (error) {
            throw new Error('Failed to connect to server: ' + error.message);
        }
    }

    /**
     * Get schema for a specific entity
     */
    async getEntitySchema(entityName) {
        try {
            const response = await fetch(`/api/entity/${entityName}/schema`);
            const data = await response.json();
            
            if (data.error) {
                throw new Error('Failed to load schema: ' + data.error);
            }
            
            return data;
        } catch (error) {
            throw new Error('Failed to load schema: ' + error.message);
        }
    }

    /**
     * Get example data for a specific entity
     */
    async getEntityExample(entityName) {
        try {
            const response = await fetch(`/api/entity/${entityName}/example`);
            const data = await response.json();
            
            if (data.error) {
                throw new Error('No example available: ' + data.error);
            }
            
            return data;
        } catch (error) {
            throw new Error('Failed to load example: ' + error.message);
        }
    }

    /**
     * Get dictionary data for a specific entity
     */
    async getEntityDictionary(entityName) {
        try {
            const response = await fetch(`/api/entity/${entityName}/dictionary`);
            const data = await response.json();
            
            if (data.error) {
                throw new Error('No dictionary available: ' + data.error);
            }
            
            return data;
        } catch (error) {
            throw new Error('Failed to load dictionary: ' + error.message);
        }
    }

    /**
     * Validate entity data against schema
     */
    async validateEntity(entityName, testData) {
        try {
            const response = await fetch('/api/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    entity_name: entityName,
                    test_data: testData
                })
            });

            const result = await response.json();
            
            if (result.error) {
                throw new Error('Validation error: ' + result.error);
            }

            return result;
        } catch (error) {
            throw new Error('Failed to validate: ' + error.message);
        }
    }
}