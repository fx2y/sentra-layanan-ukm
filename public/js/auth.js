class Auth {
    static login(username, password) {
        localStorage.setItem('auth', btoa(`${username}:${password}`));
    }

    static getAuthHeader() {
        const auth = localStorage.getItem('auth');
        return auth ? `Basic ${auth}` : null;
    }

    static isLoggedIn() {
        return !!localStorage.getItem('auth');
    }

    static logout() {
        localStorage.removeItem('auth');
    }
}

// Check login status and redirect if needed
if (!Auth.isLoggedIn()) {
    const username = prompt('Username:');
    const password = prompt('Password:');
    if (username && password) {
        Auth.login(username, password);
    }
}