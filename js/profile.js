// ==========================================================================
// PROFILE.JS - View and Update Current User Profile & Password
// ==========================================================================

let currentUser = null;

function initProfilePage() {
    currentUser = requireAuth();
    if (!currentUser) return;

    loadProfileData();
    setupProfileEventListeners();
}

function loadProfileData() {
    // Fill header card info
    document.getElementById('profile-name-display').textContent = currentUser.fullName;
    document.getElementById('profile-role-badge').textContent = currentUser.role;
    document.getElementById('profile-role-badge').className = `user-badge badge-${currentUser.role.toLowerCase()}`;
    document.getElementById('profile-email-display').textContent = currentUser.email;
    document.getElementById('profile-avatar-letter').textContent = currentUser.fullName.charAt(0).toUpperCase();

    // Fill form inputs
    document.getElementById('profile-fullname').value = currentUser.fullName;
    document.getElementById('profile-email').value = currentUser.email;
    document.getElementById('profile-phone').value = currentUser.phone || '';
    document.getElementById('profile-bio').value = currentUser.bio || '';
    document.getElementById('profile-created').value = currentUser.createdAt || 'N/A';
}

function setupProfileEventListeners() {
    const profileForm = document.getElementById('profile-info-form');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }

    const passwordForm = document.getElementById('password-change-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }
}

// Handle Profile Info Update
function handleProfileUpdate(event) {
    event.preventDefault();

    const fullName = document.getElementById('profile-fullname').value.trim();
    const phone = document.getElementById('profile-phone').value.trim();
    const bio = document.getElementById('profile-bio').value.trim();

    if (!fullName) {
        alert('Full name cannot be empty.');
        return;
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) {
        alert('User record not found.');
        return;
    }

    // Update in users array
    users[userIndex].fullName = fullName;
    users[userIndex].phone = phone;
    users[userIndex].bio = bio;

    // Update current session
    currentUser = users[userIndex];
    saveUsers(users);
    setCurrentUser(currentUser);

    // Also update any tickets created by this user so the author name reflects the change
    const tickets = getTickets();
    let ticketsUpdated = false;
    tickets.forEach(t => {
        if (t.createdByUserId === currentUser.id) {
            t.createdByName = fullName;
            ticketsUpdated = true;
        }
        if (t.assignedToAgentId === currentUser.id) {
            t.assignedToAgentName = fullName;
            ticketsUpdated = true;
        }
    });
    if (ticketsUpdated) {
        saveTickets(tickets);
    }

    alert('Profile updated successfully!');
    loadProfileData();
    setupNavbar();
}

// Handle Password Change
function handlePasswordChange(event) {
    event.preventDefault();

    const currentPass = document.getElementById('current-password').value;
    const newPass = document.getElementById('new-password').value;
    const confirmPass = document.getElementById('confirm-new-password').value;

    const users = getUsers();
    const freshUser = users.find(u => u.id === currentUser.id);

    if (!freshUser) {
        alert('User not found.');
        return;
    }

    // Check current password
    if (freshUser.password !== currentPass) {
        alert('Incorrect current password.');
        document.getElementById('current-password').focus();
        return;
    }

    // Validate new password length
    if (!isValidPassword(newPass)) {
        alert('New password must be at least 6 characters long.');
        document.getElementById('new-password').focus();
        return;
    }

    // Check confirmation match
    if (newPass !== confirmPass) {
        alert('New password and confirmation do not match.');
        document.getElementById('confirm-new-password').focus();
        return;
    }

    // Update password
    freshUser.password = newPass;
    saveUsers(users);
    setCurrentUser(freshUser);

    document.getElementById('password-change-form').reset();
    alert('Password changed successfully!');
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('profile-info-form')) {
            initProfilePage();
        }
    });
}
