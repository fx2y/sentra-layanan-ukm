// UI Controller
class App {
    static isDev = window.location.hostname === 'localhost';
    static errorHandler(error, context) {
        if (this.isDev) {
            console.error(`Error in ${context}:`, error);
        }
        return `Error: ${error.message || 'An unexpected error occurred'}`;
    }

    static init() {
        window.onerror = (msg, url, line) => {
            if (this.isDev) {
                console.error('Global error:', { msg, url, line });
            }
            return false;
        };

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

        this.showPage('transportation');
    }

    static async setupFormHandler(formId, apiCall, reloadData) {
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
                alert(this.errorHandler(error, `${formId} submission`));
            }
        });
    }

    static showPage(page) {
        document.querySelectorAll('#transportation-page, #cargo-page, #facilities-page')
            .forEach(el => el.classList.add('hidden'));
        
        document.getElementById(`${page}-page`).classList.remove('hidden');
        
        const loaders = {
            transportation: this.loadTransportationModes,
            cargo: this.loadCargoTypes,
            facilities: this.loadFacilities
        };

        if (loaders[page]) {
            loaders[page].call(this);
        }
    }

    static async renderList(elementId, getData, rowRenderer) {
        const list = document.getElementById(elementId);
        try {
            const items = await getData();
            list.innerHTML = items.length ? 
                items.map(rowRenderer).join('') : 
                `<tr><td colspan="5">No items found</td></tr>`;
        } catch (error) {
            list.innerHTML = `<tr><td colspan="5">${this.errorHandler(error, `Loading ${elementId}`)}</td></tr>`;
        }
    }

    static async loadTransportationModes() {
        await this.renderList(
            'transportation-list',
            Api.getTransportationModes,
            mode => `
                <tr>
                    <td>${this.escapeHtml(mode.mode_name)}</td>
                    <td>${mode.capacity_kg}</td>
                    <td>${mode.base_price}</td>
                    <td>${mode.price_per_km}</td>
                    <td>
                        <button onclick="App.editTransportationMode(${mode.mode_id})">Edit</button>
                        <button onclick="App.deleteTransportationMode(${mode.mode_id})">Delete</button>
                    </td>
                </tr>
            `
        );
    }

    static async loadCargoTypes() {
        await this.renderList(
            'cargo-list',
            Api.getCargoTypes,
            type => `
                <tr>
                    <td>${this.escapeHtml(type.type_name)}</td>
                    <td>${this.escapeHtml(type.description || '')}</td>
                    <td>${type.price_multiplier}</td>
                    <td>
                        <button onclick="App.editCargoType(${type.cargo_type_id})">Edit</button>
                        <button onclick="App.deleteCargoType(${type.cargo_type_id})">Delete</button>
                    </td>
                </tr>
            `
        );
    }

    static async loadFacilities() {
        await this.renderList(
            'facilities-list',
            Api.getFacilities,
            facility => `
                <tr>
                    <td>${this.escapeHtml(facility.name)}</td>
                    <td>${this.escapeHtml(facility.description || '')}</td>
                    <td>
                        <button onclick="App.editFacility(${facility.facility_id})">Edit</button>
                        <button onclick="App.deleteFacility(${facility.facility_id})">Delete</button>
                    </td>
                </tr>
            `
        );
    }

    static async deleteItem(id, apiCall, confirmMessage, reloadData) {
        if (confirm(confirmMessage)) {
            try {
                await apiCall(id);
                await reloadData();
            } catch (error) {
                alert(this.errorHandler(error, 'Deleting item'));
            }
        }
    }

    static deleteTransportationMode(id) {
        return this.deleteItem(
            id, 
            Api.deleteTransportationMode,
            'Are you sure you want to delete this transportation mode?',
            () => this.loadTransportationModes()
        );
    }

    static deleteCargoType(id) {
        return this.deleteItem(
            id,
            Api.deleteCargoType,
            'Are you sure you want to delete this cargo type?',
            () => this.loadCargoTypes()
        );
    }

    static deleteFacility(id) {
        return this.deleteItem(
            id,
            Api.deleteFacility,
            'Are you sure you want to delete this facility?',
            () => this.loadFacilities()
        );
    }

    static fillForm(formId, data) {
        const form = document.getElementById(formId);
        Object.entries(data).forEach(([key, value]) => {
            const input = form.elements[key];
            if (input) input.value = value;
        });
    }

    static async editItem(id, apiCall, formId) {
        try {
            const item = await apiCall(id);
            this.fillForm(formId, item);
        } catch (error) {
            alert(this.errorHandler(error, `Loading item for edit`));
        }
    }

    static editTransportationMode(id) {
        return this.editItem(id, Api.getTransportationMode, 'transportation-form');
    }

    static editCargoType(id) {
        return this.editItem(id, Api.getCargoType, 'cargo-form');
    }

    static editFacility(id) {
        return this.editItem(id, Api.getFacility, 'facilities-form');
    }

    static escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

document.addEventListener('DOMContentLoaded', () => App.init());