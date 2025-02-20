class Auth {
    static login(username, password) {
        try {
            if (!username || !password) {
                throw new Error('Username and password are required');
            }
            localStorage.setItem('auth', btoa(`${username}:${password}`));
            return true;
        } catch (error) {
            if (window.location.hostname === 'localhost') {
                console.error('Login failed:', error.message);
            }
            return false;
        }
    }

    static getAuthHeader() {
        try {
            const auth = localStorage.getItem('auth');
            if (!auth) return null;
            // Validate stored auth format
            const decoded = atob(auth);
            if (!decoded.includes(':')) {
                this.logout();
                return null;
            }
            return `Basic ${auth}`;
        } catch {
            this.logout();
            return null;
        }
    }

    static isLoggedIn() {
        return !!this.getAuthHeader();
    }

    static logout() {
        localStorage.removeItem('auth');
        window.location.reload();
    }
}

// Handle login flow
if (!Auth.isLoggedIn()) {
    const username = prompt('Username:');
    const password = prompt('Password:');
    if (!Auth.login(username, password)) {
        alert('Invalid credentials. Please try again.');
        window.location.reload();
    }
}