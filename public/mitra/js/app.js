// Authentication
const auth = {
    username: 'mitra_admin',
    password: 'password'
};

const headers = {
    'Authorization': `Basic ${btoa(`${auth.username}:${auth.password}`)}`,
    'Content-Type': 'application/json'
};

// Tab Navigation
document.querySelectorAll('.tab-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').slice(1);
        
        // Update active tab
        document.querySelectorAll('.tab-link').forEach(l => {
            l.classList.remove('border-indigo-500', 'text-indigo-600');
            l.classList.add('border-transparent', 'text-gray-500');
        });
        e.target.classList.remove('border-transparent', 'text-gray-500');
        e.target.classList.add('border-indigo-500', 'text-indigo-600');

        // Show target content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(`${targetId}-tab`).classList.remove('hidden');

        // Load content
        switch(targetId) {
            case 'profile':
                loadProfile();
                break;
            case 'services':
                loadServices();
                break;
            case 'drivers':
                loadDrivers();
                break;
            case 'orders':
                loadOrders();
                break;
        }
    });
});

// Profile Management
async function loadProfile() {
    const response = await fetch('/mitra/profile', { headers });
    const profile = await response.json();

    if (profile.error) return;

    document.querySelector('#mitraName').textContent = profile.name;
    const form = document.querySelector('#profile-form');
    form.name.value = profile.name;
    form.address.value = profile.address;
    
    const contactInfo = JSON.parse(profile.contact_info);
    form.phone.value = contactInfo.phone;
    form.email.value = contactInfo.email;
}

document.querySelector('#profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    
    const data = {
        name: form.name.value,
        address: form.address.value,
        contact_info: JSON.stringify({
            phone: form.phone.value,
            email: form.email.value
        })
    };

    await fetch('/mitra/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
    });

    document.querySelector('#mitraName').textContent = data.name;
});

// Service Instance Management
async function loadServices() {
    const response = await fetch('/mitra/service-instances', { headers });
    const services = await response.json();

    const serviceList = document.querySelector('#service-list');
    serviceList.innerHTML = services.map(service => `
        <div class="bg-gray-50 p-4 rounded-lg">
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="text-lg font-medium">${service.template_name}</h4>
                    <div class="mt-1 text-sm text-gray-600">
                        ${formatServiceConfig(service.config)}
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button onclick="editService(${service.id})" class="text-indigo-600 hover:text-indigo-900">Edit</button>
                    <button onclick="deleteService(${service.id})" class="text-red-600 hover:text-red-900">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function formatServiceConfig(configStr) {
    const config = JSON.parse(configStr);
    return `
        Service Area: ${config.service_area.join(', ')}<br>
        Operating Hours: ${config.operating_hours}<br>
        Vehicle Types: ${config.vehicle_types.join(', ')}
    `;
}

// Driver Management
async function loadDrivers() {
    const response = await fetch('/mitra/service-instances', { headers });
    const services = await response.json();

    for (const service of services) {
        const driversResponse = await fetch(`/mitra/service-instances/${service.id}/drivers`, { headers });
        const drivers = await driversResponse.json();

        const driverList = document.querySelector('#driver-list');
        driverList.innerHTML += drivers.map(driver => `
            <div class="bg-gray-50 p-4 rounded-lg">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="text-lg font-medium">${driver.name}</h4>
                        <div class="mt-1 text-sm text-gray-600">
                            Phone: ${driver.phone}<br>
                            Vehicle: ${formatVehicleInfo(driver.vehicle_info)}
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="editDriver(${driver.id})" class="text-indigo-600 hover:text-indigo-900">Edit</button>
                        <button onclick="deleteDriver(${driver.id})" class="text-red-600 hover:text-red-900">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function formatVehicleInfo(infoStr) {
    const info = JSON.parse(infoStr);
    return `${info.type} - ${info.model} (${info.plate})`;
}

// Order Management
async function loadOrders() {
    const response = await fetch('/mitra/orders', { headers });
    const orders = await response.json();

    const orderList = document.querySelector('#order-list');
    orderList.innerHTML = orders.map(order => `
        <div class="bg-gray-50 p-4 rounded-lg">
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="text-lg font-medium">Order #${order.id}</h4>
                    <div class="mt-1 text-sm text-gray-600">
                        Status: ${order.status}<br>
                        Driver: ${order.driver_name || 'Unassigned'}<br>
                        Pickup: ${order.pickup_address}<br>
                        Delivery: ${order.delivery_address}<br>
                        Cargo Type: ${order.cargo_type}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Initial load
loadProfile(); 