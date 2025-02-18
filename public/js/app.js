// UI Controller
class App {
    static init() {
        // Navigation
        document.querySelectorAll('.nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.dataset.page;
                this.showPage(page);
            });
        });

        // Form submissions
        this.setupFormHandler('transportation-form', 
            data => data.id ? Api.updateTransportationMode(data.id, data) : Api.createTransportationMode(data),
            () => this.loadTransportationModes()
        );
        
        this.setupFormHandler('cargo-form',
            data => data.id ? Api.updateCargoType(data.id, data) : Api.createCargoType(data),
            () => this.loadCargoTypes()
        );
        
        this.setupFormHandler('facilities-form',
            data => data.id ? Api.updateFacility(data.id, data) : Api.createFacility(data),
            () => this.loadFacilities()
        );

        // Initial load
        this.showPage('transportation');
    }

    static setupFormHandler(formId, apiCall, reloadData) {
        const form = document.getElementById(formId);
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            try {
                await apiCall(data);
                form.reset();
                await reloadData();
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });
    }

    static showPage(page) {
        // Hide all pages
        document.querySelectorAll('#transportation-page, #cargo-page, #facilities-page')
            .forEach(el => el.classList.add('hidden'));
        
        // Show selected page
        document.getElementById(`${page}-page`).classList.remove('hidden');
        
        // Load data
        switch (page) {
            case 'transportation':
                this.loadTransportationModes();
                break;
            case 'cargo':
                this.loadCargoTypes();
                break;
            case 'facilities':
                this.loadFacilities();
                break;
        }
    }

    static async loadTransportationModes() {
        const list = document.getElementById('transportation-list');
        try {
            const modes = await Api.getTransportationModes();
            list.innerHTML = modes.map(mode => `
                <tr>
                    <td>${mode.mode_name}</td>
                    <td>${mode.capacity_kg}</td>
                    <td>${mode.base_price}</td>
                    <td>${mode.price_per_km}</td>
                    <td>
                        <button onclick="App.editTransportationMode(${mode.mode_id})">Edit</button>
                        <button onclick="App.deleteTransportationMode(${mode.mode_id})">Delete</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            list.innerHTML = '<tr><td colspan="5">Error loading data</td></tr>';
        }
    }

    static async loadCargoTypes() {
        const list = document.getElementById('cargo-list');
        try {
            const types = await Api.getCargoTypes();
            list.innerHTML = types.map(type => `
                <tr>
                    <td>${type.type_name}</td>
                    <td>${type.description || ''}</td>
                    <td>${type.price_multiplier}</td>
                    <td>
                        <button onclick="App.editCargoType(${type.cargo_type_id})">Edit</button>
                        <button onclick="App.deleteCargoType(${type.cargo_type_id})">Delete</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            list.innerHTML = '<tr><td colspan="4">Error loading data</td></tr>';
        }
    }

    static async loadFacilities() {
        const list = document.getElementById('facilities-list');
        try {
            const facilities = await Api.getFacilities();
            list.innerHTML = facilities.map(facility => `
                <tr>
                    <td>${facility.name}</td>
                    <td>${facility.description || ''}</td>
                    <td>
                        <button onclick="App.editFacility(${facility.facility_id})">Edit</button>
                        <button onclick="App.deleteFacility(${facility.facility_id})">Delete</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            list.innerHTML = '<tr><td colspan="3">Error loading data</td></tr>';
        }
    }

    static async deleteTransportationMode(id) {
        if (confirm('Are you sure you want to delete this transportation mode?')) {
            try {
                await Api.deleteTransportationMode(id);
                this.loadTransportationModes();
            } catch (error) {
                alert('Error deleting transportation mode');
            }
        }
    }

    static async deleteCargoType(id) {
        if (confirm('Are you sure you want to delete this cargo type?')) {
            try {
                await Api.deleteCargoType(id);
                this.loadCargoTypes();
            } catch (error) {
                alert('Error deleting cargo type');
            }
        }
    }

    static async deleteFacility(id) {
        if (confirm('Are you sure you want to delete this facility?')) {
            try {
                await Api.deleteFacility(id);
                this.loadFacilities();
            } catch (error) {
                alert('Error deleting facility');
            }
        }
    }

    static fillForm(formId, data) {
        const form = document.getElementById(formId);
        Object.entries(data).forEach(([key, value]) => {
            const input = form.elements[key];
            if (input) {
                input.value = value;
            }
        });
    }

    static async editTransportationMode(id) {
        try {
            const mode = await Api.getTransportationMode(id);
            this.fillForm('transportation-form', mode);
        } catch (error) {
            alert('Error loading transportation mode');
        }
    }

    static async editCargoType(id) {
        try {
            const type = await Api.getCargoType(id);
            this.fillForm('cargo-form', type);
        } catch (error) {
            alert('Error loading cargo type');
        }
    }

    static async editFacility(id) {
        try {
            const facility = await Api.getFacility(id);
            this.fillForm('facilities-form', facility);
        } catch (error) {
            alert('Error loading facility');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => App.init());