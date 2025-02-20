class Api {
    static async request(endpoint, options = {}) {
        const headers = {
            'Authorization': Auth.getAuthHeader(),
            'Content-Type': 'application/json'
        };

        const isDev = window.location.hostname === 'localhost';
        
        try {
            const response = await fetch(`/api${endpoint}`, {
                ...options,
                headers
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            // Only log in development
            if (isDev) {
                console.error(`API Error (${endpoint}):`, error.message);
            }
            throw error;
        }
    }

    // Transportation Modes
    static async getTransportationModes() {
        return this.request('/transportation-modes');
    }

    static async createTransportationMode(data) {
        return this.request('/transportation-modes', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async updateTransportationMode(id, data) {
        return this.request(`/transportation-modes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async deleteTransportationMode(id) {
        return this.request(`/transportation-modes/${id}`, {
            method: 'DELETE'
        });
    }

    // Cargo Types
    static async getCargoTypes() {
        return this.request('/cargo-types');
    }

    static async createCargoType(data) {
        return this.request('/cargo-types', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async updateCargoType(id, data) {
        return this.request(`/cargo-types/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async deleteCargoType(id) {
        return this.request(`/cargo-types/${id}`, {
            method: 'DELETE'
        });
    }

    // Facilities
    static async getFacilities() {
        return this.request('/facilities');
    }

    static async createFacility(data) {
        return this.request('/facilities', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async updateFacility(id, data) {
        return this.request(`/facilities/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async deleteFacility(id) {
        return this.request(`/facilities/${id}`, {
            method: 'DELETE'
        });
    }

    static async getFacilitiesForMode(modeId) {
        return this.request(`/facilities/mode/${modeId}`);
    }

    static async addFacilityToMode(modeId, facilityId) {
        return this.request(`/facilities/mode/${modeId}/facility/${facilityId}`, {
            method: 'POST'
        });
    }

    static async removeFacilityFromMode(modeId, facilityId) {
        return this.request(`/facilities/mode/${modeId}/facility/${facilityId}`, {
            method: 'DELETE'
        });
    }
}