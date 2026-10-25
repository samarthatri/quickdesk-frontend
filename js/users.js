// ==========================================================================
// USERS.JS - User Management for Admins (User Lists & RBAC)
// ==========================================================================

let allUsers = [];
let currentUser = null;

// Initialize the User Management Page
function initUsersPage() {
    // Only Admin is allowed here!
    currentUser = requireAuth(['Admin']);
    if (!currentUser) return;

    setupUserEventListeners();
    loadAndRenderUsers();
}

// Setup Event Listeners
function setupUserEventListeners() {
    const userForm = document.getElementById('user-form');
    if (userForm) {
        userForm.addEventListener('submit', handleUserFormSubmit);
    }

    const searchInput = document.getElementById('user-search');
    const roleFilter = document.getElementById('user-role-filter');

    if (searchInput) searchInput.addEventListener('input', filterUsers);
    if (roleFilter) roleFilter.addEventListener('change', filterUsers);
}

// Load users from storage and update table
function loadAndRenderUsers() {
    allUsers = getUsers();
    filterUsers();
}

// Filter users list based on search and role
function filterUsers() {
    const searchInput = document.getElementById('user-search');
    const roleFilter = document.getElementById('user-role-filter');

    const searchKeyword = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedRole = roleFilter ? roleFilter.value : 'ALL';

    const filtered = allUsers.filter(user => {
        const matchesKeyword =
            user.fullName.toLowerCase().includes(searchKeyword) ||
            user.email.toLowerCase().includes(searchKeyword) ||
            (user.phone && user.phone.toLowerCase().includes(searchKeyword));

        const matchesRole = (selectedRole === 'ALL' || user.role === selectedRole);

        return matchesKeyword && matchesRole;
    });

    renderUsersTable(filtered);
}

// Render Users Table
function renderUsersTable(usersToDisplay) {
    const tbody = document.getElementById('users-tbody');
    const emptyState = document.getElementById('users-empty-state');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (usersToDisplay.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    usersToDisplay.forEach(user => {
        const tr = document.createElement('tr');

        // Badge color by role
        let roleBadgeClass = 'badge-user';
        if (user.role === 'Admin') roleBadgeClass = 'badge-admin';
        if (user.role === 'Agent') roleBadgeClass = 'badge-agent';

        // Check if row is the currently logged-in Admin
        const isCurrentSelf = (user.id === currentUser.id);

        let actionButtons = `
            <button class="btn btn-sm btn-outline-primary" onclick="openEditUserModal('${user.id}')">Edit</button>
        `;

        if (isCurrentSelf) {
            actionButtons += ` <span class="badge badge-secondary">Current You</span>`;
        } else {
            actionButtons += ` <button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${user.id}')">Delete</button>`;
        }

        tr.innerHTML = `
            <td>
                <div class="user-avatar-text">${escapeHTML(user.fullName.charAt(0).toUpperCase())}</div>
                <strong>${escapeHTML(user.fullName)}</strong>
            </td>
            <td>${escapeHTML(user.email)}</td>
            <td><span class="user-badge ${roleBadgeClass}">${user.role}</span></td>
            <td>${escapeHTML(user.phone || 'N/A')}</td>
            <td><small class="text-muted">${user.createdAt || 'N/A'}</small></td>
            <td class="action-cell">${actionButtons}</td>
        `;

        tbody.appendChild(tr);
    });
}

// Handle Add/Edit User Form Submission
function handleUserFormSubmit(event) {
    event.preventDefault();

    const userIdInput = document.getElementById('user-id');
    const fullNameInput = document.getElementById('user-fullname');
    const emailInput = document.getElementById('user-email');
    const roleInput = document.getElementById('user-role');
    const phoneInput = document.getElementById('user-phone');
    const passwordInput = document.getElementById('user-password');

    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const role = roleInput.value;
    const phone = phoneInput.value.trim();
    const password = passwordInput.value;
    const isEditing = userIdInput.value !== '';

    // Validation
    if (!fullName) {
        alert('Please enter a full name.');
        fullNameInput.focus();
        return;
    }

    if (!isValidEmail(email)) {
        alert('Please enter a valid email address.');
        emailInput.focus();
        return;
    }

    // Check duplicate email
    const users = getUsers();
    const existing = users.find(u => u.email === email && (!isEditing || u.id !== userIdInput.value));
    if (existing) {
        alert('A user with this email address already exists!');
        emailInput.focus();
        return;
    }

    if (isEditing) {
        // Update user
        const userIndex = users.findIndex(u => u.id === userIdInput.value);
        if (userIndex === -1) {
            alert('User not found.');
            return;
        }

        users[userIndex].fullName = fullName;
        users[userIndex].email = email;
        users[userIndex].role = role;
        users[userIndex].phone = phone;

        // If password entered, update it
        if (password) {
            if (!isValidPassword(password)) {
                alert('Password must be at least 6 characters long.');
                return;
            }
            users[userIndex].password = password;
        }

        // If updated self, update current session
        if (users[userIndex].id === currentUser.id) {
            setCurrentUser(users[userIndex]);
        }

        saveUsers(users);
        alert('User updated successfully!');
    } else {
        // Create new user
        if (!isValidPassword(password)) {
            alert('Password is required and must be at least 6 characters long.');
            passwordInput.focus();
            return;
        }

        const newUser = {
            id: 'usr_' + Date.now(),
            fullName: fullName,
            email: email,
            password: password,
            role: role,
            phone: phone,
            bio: 'New team member',
            createdAt: new Date().toISOString().slice(0, 10)
        };

        users.push(newUser);
        saveUsers(users);
        alert('New user created successfully!');
    }

    closeUserModal();
    loadAndRenderUsers();
}

// Delete User
function deleteUser(userId) {
    if (userId === currentUser.id) {
        alert('Security rule: You cannot delete your own account!');
        return;
    }

    const users = getUsers();
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    if (!confirm(`Are you sure you want to delete user "${targetUser.fullName}" (${targetUser.email})?`)) {
        return;
    }

    const updatedUsers = users.filter(u => u.id !== userId);
    saveUsers(updatedUsers);
    alert('User deleted.');
    loadAndRenderUsers();
}

// Modal controls
function openAddUserModal() {
    const modal = document.getElementById('user-modal');
    const form = document.getElementById('user-form');
    const modalTitle = document.getElementById('user-modal-title');
    const passwordHelp = document.getElementById('password-help');

    if (!modal || !form) return;

    form.reset();
    document.getElementById('user-id').value = '';
    modalTitle.textContent = 'Add New User';
    if (passwordHelp) passwordHelp.textContent = 'Required (at least 6 characters)';

    modal.style.display = 'flex';
}

function openEditUserModal(userId) {
    const modal = document.getElementById('user-modal');
    const form = document.getElementById('user-form');
    const modalTitle = document.getElementById('user-modal-title');
    const passwordHelp = document.getElementById('password-help');

    if (!modal || !form) return;

    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return;

    document.getElementById('user-id').value = user.id;
    document.getElementById('user-fullname').value = user.fullName;
    document.getElementById('user-email').value = user.email;
    document.getElementById('user-role').value = user.role;
    document.getElementById('user-phone').value = user.phone || '';
    document.getElementById('user-password').value = '';

    modalTitle.textContent = `Edit User: ${user.fullName}`;
    if (passwordHelp) passwordHelp.textContent = 'Leave blank to keep existing password';

    modal.style.display = 'flex';
}

function closeUserModal() {
    const modal = document.getElementById('user-modal');
    if (modal) modal.style.display = 'none';
}

// Helper: Escape HTML
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Auto-run if on users page
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('users-tbody')) {
            initUsersPage();
        }
    });
}
