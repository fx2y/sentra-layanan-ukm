class MitraApp {
    static isDev = window.location.hostname === 'localhost';
    static headers = {
        'Authorization': `Basic ${btoa('mitra_admin:password')}`,
        'Content-Type': 'application/json'
    };

    static errorHandler(error, context) {
        if (this.isDev) {
            console.error(`Error in ${context}:`, error);
        }
        return `Error: ${error.message || 'An unexpected error occurred'}`;
    }

    static async apiRequest(endpoint, options = {}) {
        try {
            const response = await fetch(endpoint, {
                ...options,
                headers: this.headers
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            throw new Error(this.errorHandler(error, `API request to ${endpoint}`));
        }
    }

    static init() {
        window.onerror = (msg, url, line) => {
            if (this.isDev) {
                console.error('Global error:', { msg, url, line });
            }
            return false;
        };

        this.setupTabNavigation();
        this.setupProfileForm();
        this.loadProfile();
    }

    static setupTabNavigation() {
        document.querySelectorAll('.tab-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = e.target.getAttribute('href').slice(1);
                
                this.updateTabUI(e.target);
                this.loadTabContent(targetId);
            });
        });
    }

    static updateTabUI(selectedTab) {
        document.querySelectorAll('.tab-link').forEach(link => {
            link.classList.remove('border-indigo-500', 'text-indigo-600');
            link.classList.add('border-transparent', 'text-gray-500');
        });
        selectedTab.classList.remove('border-transparent', 'text-gray-500');
        selectedTab.classList.add('border-indigo-500', 'text-indigo-600');

        const targetId = selectedTab.getAttribute('href').slice(1);
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(`${targetId}-tab`).classList.remove('hidden');
    }

    static loadTabContent(targetId) {
        const loaders = {
            profile: () => this.loadProfile(),
            services: () => this.loadServices(),
            drivers: () => this.loadDrivers(),
            orders: () => this.loadOrders()
        };

        if (loaders[targetId]) {
            loaders[targetId]();
        }
    }

    static async loadProfile() {
        try {
            const profile = await this.apiRequest('/mitra/profile');
            document.querySelector('#mitraName').textContent = this.escapeHtml(profile.name);
            
            const form = document.querySelector('#profile-form');
            form.name.value = profile.name;
            form.address.value = profile.address;
            
            const contactInfo = JSON.parse(profile.contact_info);
            form.phone.value = contactInfo.phone;
            form.email.value = contactInfo.email;
        } catch (error) {
            alert(error.message);
        }
    }

    static setupProfileForm() {
        document.querySelector('#profile-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            
            try {
                const data = {
                    name: form.name.value.trim(),
                    address: form.address.value.trim(),
                    contact_info: JSON.stringify({
                        phone: form.phone.value.trim(),
                        email: form.email.value.trim()
                    })
                };

                await this.apiRequest('/mitra/profile', {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });

                document.querySelector('#mitraName').textContent = this.escapeHtml(data.name);
                alert('Profile updated successfully');
            } catch (error) {
                alert(error.message);
            }
        });
    }

    static async loadServices() {
        try {
            const services = await this.apiRequest('/mitra/service-instances');
            const serviceList = document.querySelector('#service-list');
            
            if (!services.length) {
                serviceList.innerHTML = '<div class="p-4 text-gray-500">No services found</div>';
                return;
            }

            serviceList.innerHTML = services.map(service => `
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="text-lg font-medium">${this.escapeHtml(service.template_name)}</h4>
                            <div class="mt-1 text-sm text-gray-600">
                                ${this.formatServiceConfig(service.config)}
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="MitraApp.editService(${service.id})" class="text-indigo-600 hover:text-indigo-900">Edit</button>
                            <button onclick="MitraApp.deleteService(${service.id})" class="text-red-600 hover:text-red-900">Delete</button>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            document.querySelector('#service-list').innerHTML = 
                `<div class="p-4 text-red-500">${error.message}</div>`;
        }
    }

    static formatServiceConfig(configStr) {
        try {
            const config = JSON.parse(configStr);
            return `
                Service Area: ${this.escapeHtml(config.service_area.join(', '))}<br>
                Operating Hours: ${this.escapeHtml(config.operating_hours)}<br>
                Vehicle Types: ${this.escapeHtml(config.vehicle_types.join(', '))}
            `;
        } catch {
            return 'Invalid configuration';
        }
    }

    static async loadDrivers() {
        try {
            const services = await this.apiRequest('/mitra/service-instances');
            const driverList = document.querySelector('#driver-list');
            driverList.innerHTML = '';

            if (!services.length) {
                driverList.innerHTML = '<div class="p-4 text-gray-500">No services found</div>';
                return;
            }

            for (const service of services) {
                const drivers = await this.apiRequest(`/mitra/service-instances/${service.id}/drivers`);
                if (drivers.length) {
                    driverList.innerHTML += drivers.map(driver => `
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h4 class="text-lg font-medium">${this.escapeHtml(driver.name)}</h4>
                                    <div class="mt-1 text-sm text-gray-600">
                                        Phone: ${this.escapeHtml(driver.phone)}<br>
                                        Vehicle: ${this.formatVehicleInfo(driver.vehicle_info)}
                                    </div>
                                </div>
                                <div class="flex space-x-2">
                                    <button onclick="MitraApp.editDriver(${driver.id})" class="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    <button onclick="MitraApp.deleteDriver(${driver.id})" class="text-red-600 hover:text-red-900">Delete</button>
                                </div>
                            </div>
                        </div>
                    `).join('');
                }
            }

            if (!driverList.innerHTML) {
                driverList.innerHTML = '<div class="p-4 text-gray-500">No drivers found</div>';
            }
        } catch (error) {
            document.querySelector('#driver-list').innerHTML = 
                `<div class="p-4 text-red-500">${error.message}</div>`;
        }
    }

    static formatVehicleInfo(infoStr) {
        try {
            const info = JSON.parse(infoStr);
            return this.escapeHtml(`${info.type} - ${info.model} (${info.plate})`);
        } catch {
            return 'Invalid vehicle information';
        }
    }

    static async loadOrders() {
        try {
            const orders = await this.apiRequest('/mitra/orders');
            const orderList = document.querySelector('#order-list');

            if (!orders.length) {
                orderList.innerHTML = '<div class="p-4 text-gray-500">No orders found</div>';
                return;
            }

            orderList.innerHTML = orders.map(order => `
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="text-lg font-medium">Order #${order.id}</h4>
                            <div class="mt-1 text-sm text-gray-600">
                                Status: ${this.escapeHtml(order.status)}<br>
                                Driver: ${this.escapeHtml(order.driver_name || 'Unassigned')}<br>
                                Pickup: ${this.escapeHtml(order.pickup_address)}<br>
                                Delivery: ${this.escapeHtml(order.delivery_address)}<br>
                                Cargo Type: ${this.escapeHtml(order.cargo_type)}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            document.querySelector('#order-list').innerHTML = 
                `<div class="p-4 text-red-500">${error.message}</div>`;
        }
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

    static async deleteService(id) {
        if (confirm('Are you sure you want to delete this service?')) {
            try {
                await this.apiRequest(`/mitra/service-instances/${id}`, { method: 'DELETE' });
                this.loadServices();
            } catch (error) {
                alert(error.message);
            }
        }
    }

    static async deleteDriver(id) {
        if (confirm('Are you sure you want to delete this driver?')) {
            try {
                await this.apiRequest(`/mitra/drivers/${id}`, { method: 'DELETE' });
                this.loadDrivers();
            } catch (error) {
                alert(error.message);
            }
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => MitraApp.init());