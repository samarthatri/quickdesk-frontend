// ==========================================================================
// AUTH.JS - Authentication, Session Management & Form Validation
// ==========================================================================

// Get currently logged-in user from localStorage
function getCurrentUser() {
    const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!userJson) return null;
    try {
        return JSON.parse(userJson);
    } catch (e) {
        return null;
    }
}

// Set current logged-in user into localStorage
function setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

// Log out user and redirect to login page
function logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    window.location.href = 'login.html';
}

// Check route protection: Call this on protected pages!
// allowedRoles is an optional array, e.g. ['Admin'], ['Admin', 'Agent']
function requireAuth(allowedRoles = null) {
    const user = getCurrentUser();
    if (!user) {
        // Not logged in -> redirect to login
        alert('You must be logged in to view this page.');
        window.location.href = 'login.html';
        return null;
    }

    if (allowedRoles && Array.isArray(allowedRoles) && !allowedRoles.includes(user.role)) {
        alert('Access Denied: Your role (' + user.role + ') does not have permission to view this page.');
        window.location.href = 'dashboard.html';
        return null;
    }

    return user;
}

// Redirect already logged-in users away from login/register
function redirectIfLoggedIn() {
    const user = getCurrentUser();
    if (user) {
        window.location.href = 'dashboard.html';
    }
}

// ==========================================================================
// VALIDATION HELPERS
// ==========================================================================

// Simple email format check using standard Regex
function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

// Password validation: minimum 6 characters
function isValidPassword(password) {
    if (!password || typeof password !== 'string') return false;
    return password.length >= 6;
}

// Display error message below an input
function showError(inputElement, errorElement, message) {
    if (inputElement) {
        inputElement.classList.add('input-error');
    }
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// Clear error message below an input
function clearError(inputElement, errorElement) {
    if (inputElement) {
        inputElement.classList.remove('input-error');
    }
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

// ==========================================================================
// NAVBAR DYNAMIC SETUP
// ==========================================================================

// Updates navigation items based on user login status and role
function setupNavbar() {
    const navRight = document.getElementById('nav-user-area');
    if (!navRight) return;

    const user = getCurrentUser();

    if (user) {
        // Logged in: show user badge, profile link, admin link if admin, logout button
        let adminLink = '';
        if (user.role === 'Admin') {
            adminLink = '<li class="nav-item"><a class="nav-link" href="users.html">Manage Users</a></li>';
        }

        navRight.innerHTML = `
            ${adminLink}
            <li class="nav-item"><a class="nav-link" href="dashboard.html">Tickets</a></li>
            <li class="nav-item"><a class="nav-link" href="profile.html">Profile</a></li>
            <li class="nav-item">
                <span class="user-badge badge-${user.role.toLowerCase()}">${user.role}</span>
                <span class="nav-username">${user.fullName}</span>
            </li>
            <li class="nav-item">
                <button class="btn btn-outline-danger btn-sm" onclick="logout()">Logout</button>
            </li>
        `;
    } else {
        // Not logged in: show Login and Register links
        navRight.innerHTML = `
            <li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>
            <li class="nav-item"><a class="btn btn-primary btn-sm" href="register.html">Sign Up</a></li>
        `;
    }
}

// Auto-run navbar setup when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        setupNavbar();
    });
}
