// ==========================================================================
// TICKETS.JS - Full CRUD Operations for Tickets (Create, Read, Update, Delete)
// ==========================================================================

let activeTickets = [];
let currentUser = null;

// Initialize the Tickets Dashboard
function initTicketsPage() {
    currentUser = requireAuth();
    if (!currentUser) return;

    // Set page welcome message
    const welcomeEl = document.getElementById('user-welcome-msg');
    if (welcomeEl) {
        welcomeEl.textContent = `Welcome back, ${currentUser.fullName} (${currentUser.role})`;
    }

    // Populate agent dropdown for Admins when creating/editing tickets
    populateAgentDropdowns();

    // Setup Event Listeners
    setupTicketEventListeners();

    // Render tickets list
    loadAndRenderTickets();
}

// Populate the Agent select box (used in ticket assignment)
function populateAgentDropdowns() {
    const agentSelect = document.getElementById('ticket-assigned-agent');
    if (!agentSelect) return;

    const users = getUsers();
    const agents = users.filter(u => u.role === 'Agent' || u.role === 'Admin');

    let options = '<option value="">-- Unassigned --</option>';
    agents.forEach(agent => {
        options += `<option value="${agent.id}">${agent.fullName} (${agent.role})</option>`;
    });
    agentSelect.innerHTML = options;
}

// Setup Event Listeners
function setupTicketEventListeners() {
    // Ticket Form Submit (Create or Update)
    const ticketForm = document.getElementById('ticket-form');
    if (ticketForm) {
        ticketForm.addEventListener('submit', handleTicketFormSubmit);
    }

    // Filter Controls
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('filter-status');
    const priorityFilter = document.getElementById('filter-priority');

    if (searchInput) searchInput.addEventListener('input', filterTickets);
    if (statusFilter) statusFilter.addEventListener('change', filterTickets);
    if (priorityFilter) priorityFilter.addEventListener('change', filterTickets);
}

// Load tickets and update statistics
function loadAndRenderTickets() {
    const allTickets = getTickets();

    // Filter tickets based on current role permissions
    if (currentUser.role === 'User') {
        // Normal User only sees tickets they submitted
        activeTickets = allTickets.filter(t => t.createdByUserId === currentUser.id);
    } else if (currentUser.role === 'Agent') {
        // Agent sees all tickets or assigned tickets
        activeTickets = allTickets;
    } else {
        // Admin sees all tickets
        activeTickets = allTickets;
    }

    // Update Stats Badges
    updateDashboardStats(activeTickets);

    // Render table
    filterTickets();
}

// Update KPI / Summary Stats Badges
function updateDashboardStats(tickets) {
    const totalCount = tickets.length;
    const openCount = tickets.filter(t => t.status === 'Open').length;
    const inProgressCount = tickets.filter(t => t.status === 'In Progress').length;
    const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;

    const totalEl = document.getElementById('stat-total');
    const openEl = document.getElementById('stat-open');
    const inProgressEl = document.getElementById('stat-in-progress');
    const resolvedEl = document.getElementById('stat-resolved');

    if (totalEl) totalEl.textContent = totalCount;
    if (openEl) openEl.textContent = openCount;
    if (inProgressEl) inProgressEl.textContent = inProgressCount;
    if (resolvedEl) resolvedEl.textContent = resolvedCount;
}

// Filter and Search tickets in real-time
function filterTickets() {
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('filter-status');
    const priorityFilter = document.getElementById('filter-priority');

    const searchKeyword = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedStatus = statusFilter ? statusFilter.value : 'ALL';
    const selectedPriority = priorityFilter ? priorityFilter.value : 'ALL';

    const filtered = activeTickets.filter(ticket => {
        const matchesKeyword =
            ticket.title.toLowerCase().includes(searchKeyword) ||
            ticket.id.toLowerCase().includes(searchKeyword) ||
            ticket.description.toLowerCase().includes(searchKeyword) ||
            ticket.createdByName.toLowerCase().includes(searchKeyword);

        const matchesStatus = (selectedStatus === 'ALL' || ticket.status === selectedStatus);
        const matchesPriority = (selectedPriority === 'ALL' || ticket.priority === selectedPriority);

        return matchesKeyword && matchesStatus && matchesPriority;
    });

    renderTicketsTable(filtered);
}

// Render the Ticket Rows in the HTML Table
function renderTicketsTable(ticketsToDisplay) {
    const tbody = document.getElementById('tickets-tbody');
    const emptyState = document.getElementById('empty-state');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (ticketsToDisplay.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    ticketsToDisplay.forEach(ticket => {
        const tr = document.createElement('tr');

        // Status badge color class
        let statusBadgeClass = 'badge-secondary';
        if (ticket.status === 'Open') statusBadgeClass = 'badge-warning';
        if (ticket.status === 'In Progress') statusBadgeClass = 'badge-info';
        if (ticket.status === 'Resolved') statusBadgeClass = 'badge-success';

        // Priority badge color class
        let priorityBadgeClass = 'badge-low';
        if (ticket.priority === 'Medium') priorityBadgeClass = 'badge-medium';
        if (ticket.priority === 'High') priorityBadgeClass = 'badge-high';

        // Build Action buttons based on Role
        let actionButtons = `
            <button class="btn btn-sm btn-info" onclick="viewTicketModal('${ticket.id}')">View</button>
        `;

        // Check if user has permission to Edit
        const canEdit = (currentUser.role === 'Admin') ||
                        (currentUser.role === 'Agent') ||
                        (currentUser.role === 'User' && ticket.createdByUserId === currentUser.id);

        if (canEdit) {
            actionButtons += ` <button class="btn btn-sm btn-outline-primary" onclick="openEditModal('${ticket.id}')">Edit</button>`;
        }

        // Check if user has permission to Delete
        // Admin can delete any ticket. Normal user can only delete their own "Open" ticket.
        const canDelete = (currentUser.role === 'Admin') ||
                          (currentUser.role === 'User' && ticket.createdByUserId === currentUser.id && ticket.status === 'Open');

        if (canDelete) {
            actionButtons += ` <button class="btn btn-sm btn-outline-danger" onclick="deleteTicket('${ticket.id}')">Delete</button>`;
        }

        tr.innerHTML = `
            <td><strong>${ticket.id}</strong></td>
            <td>
                <div class="ticket-table-title">${escapeHTML(ticket.title)}</div>
                <small class="text-muted">${ticket.category} &bull; By ${escapeHTML(ticket.createdByName)}</small>
            </td>
            <td><span class="badge ${priorityBadgeClass}">${ticket.priority}</span></td>
            <td><span class="badge ${statusBadgeClass}">${ticket.status}</span></td>
            <td>${ticket.assignedToAgentName || 'Unassigned'}</td>
            <td><small class="text-muted">${ticket.createdAt}</small></td>
            <td class="action-cell">${actionButtons}</td>
        `;

        tbody.appendChild(tr);
    });
}

// ==========================================================================
// CRUD OPERATIONS
// ==========================================================================

// [C] CREATE & [U] UPDATE: Form Submit Handler
function handleTicketFormSubmit(event) {
    event.preventDefault();

    const ticketIdInput = document.getElementById('ticket-id');
    const titleInput = document.getElementById('ticket-title');
    const categoryInput = document.getElementById('ticket-category');
    const priorityInput = document.getElementById('ticket-priority');
    const statusInput = document.getElementById('ticket-status');
    const descriptionInput = document.getElementById('ticket-description');
    const assignedAgentInput = document.getElementById('ticket-assigned-agent');
    const notesInput = document.getElementById('ticket-notes');

    // Validation
    const title = titleInput.value.trim();
    const category = categoryInput.value;
    const priority = priorityInput.value;
    const description = descriptionInput.value.trim();

    if (!title) {
        alert('Please enter a ticket title.');
        titleInput.focus();
        return;
    }
    if (!description) {
        alert('Please enter a ticket description.');
        descriptionInput.focus();
        return;
    }

    const allTickets = getTickets();
    const isEditing = ticketIdInput.value !== '';

    if (isEditing) {
        // --- UPDATE EXISTING TICKET ---
        const ticketIndex = allTickets.findIndex(t => t.id === ticketIdInput.value);
        if (ticketIndex === -1) {
            alert('Ticket not found.');
            return;
        }

        const ticket = allTickets[ticketIndex];

        // Permission check
        if (currentUser.role === 'User' && ticket.createdByUserId !== currentUser.id) {
            alert('Permission denied: You cannot edit tickets created by others.');
            return;
        }

        // Apply updates
        ticket.title = title;
        ticket.category = category;
        ticket.priority = priority;
        ticket.description = description;
        ticket.updatedAt = new Date().toLocaleString();

        // Agents and Admins can update status and notes
        if (currentUser.role === 'Admin' || currentUser.role === 'Agent') {
            if (statusInput) ticket.status = statusInput.value;
            if (notesInput) ticket.notes = notesInput.value.trim();
        }

        // Admins can reassign tickets
        if (currentUser.role === 'Admin' && assignedAgentInput) {
            ticket.assignedToAgentId = assignedAgentInput.value;
            const users = getUsers();
            const assignedAgent = users.find(u => u.id === assignedAgentInput.value);
            ticket.assignedToAgentName = assignedAgent ? assignedAgent.fullName : 'Unassigned';
        }

        allTickets[ticketIndex] = ticket;
        saveTickets(allTickets);
        alert('Ticket updated successfully!');
    } else {
        // --- CREATE NEW TICKET ---
        const newTicketId = 'TCK-' + Math.floor(100 + Math.random() * 900);
        let assignedAgentId = '';
        let assignedAgentName = 'Unassigned';

        if (currentUser.role === 'Admin' && assignedAgentInput && assignedAgentInput.value) {
            assignedAgentId = assignedAgentInput.value;
            const users = getUsers();
            const agent = users.find(u => u.id === assignedAgentId);
            if (agent) assignedAgentName = agent.fullName;
        }

        const newTicket = {
            id: newTicketId,
            title: title,
            category: category,
            priority: priority,
            status: 'Open',
            description: description,
            createdByUserId: currentUser.id,
            createdByName: currentUser.fullName,
            assignedToAgentId: assignedAgentId,
            assignedToAgentName: assignedAgentName,
            createdAt: new Date().toLocaleString(),
            updatedAt: new Date().toLocaleString(),
            notes: ''
        };

        allTickets.unshift(newTicket);
        saveTickets(allTickets);
        alert('Ticket created successfully with ID ' + newTicketId);
    }

    closeTicketModal();
    loadAndRenderTickets();
}

// [D] DELETE: Delete ticket
function deleteTicket(ticketId) {
    const allTickets = getTickets();
    const ticket = allTickets.find(t => t.id === ticketId);

    if (!ticket) {
        alert('Ticket not found.');
        return;
    }

    // Role permission check
    if (currentUser.role === 'User') {
        if (ticket.createdByUserId !== currentUser.id) {
            alert('You can only delete your own tickets.');
            return;
        }
        if (ticket.status !== 'Open') {
            alert('You can only delete tickets that are currently in "Open" status.');
            return;
        }
    } else if (currentUser.role === 'Agent') {
        alert('Agents are not permitted to delete tickets. Please contact an Administrator.');
        return;
    }

    if (!confirm(`Are you sure you want to delete ticket ${ticketId}: "${ticket.title}"?`)) {
        return;
    }

    const updatedTickets = allTickets.filter(t => t.id !== ticketId);
    saveTickets(updatedTickets);
    alert('Ticket deleted successfully.');
    loadAndRenderTickets();
}

// ==========================================================================
// MODAL CONTROLS (Create, Edit, View)
// ==========================================================================

// Open Modal to Create New Ticket
function openCreateModal() {
    const modal = document.getElementById('ticket-modal');
    const form = document.getElementById('ticket-form');
    const modalTitle = document.getElementById('modal-title');
    const submitBtn = document.getElementById('modal-submit-btn');

    if (!modal || !form) return;

    form.reset();
    document.getElementById('ticket-id').value = '';
    modalTitle.textContent = 'Create New Support Ticket';
    submitBtn.textContent = 'Create Ticket';
    submitBtn.style.display = 'inline-block';

    // Status and Notes are default for new tickets
    const statusGroup = document.getElementById('group-status');
    const notesGroup = document.getElementById('group-notes');
    const assignGroup = document.getElementById('group-assign');

    if (statusGroup) statusGroup.style.display = 'none';
    if (notesGroup) notesGroup.style.display = 'none';

    // Only Admin can assign on creation
    if (assignGroup) {
        assignGroup.style.display = (currentUser.role === 'Admin') ? 'block' : 'none';
    }

    // Enable inputs
    setFormDisabledState(form, false);

    modal.style.display = 'flex';
}

// Open Modal to Edit Ticket
function openEditModal(ticketId) {
    const modal = document.getElementById('ticket-modal');
    const form = document.getElementById('ticket-form');
    const modalTitle = document.getElementById('modal-title');
    const submitBtn = document.getElementById('modal-submit-btn');

    if (!modal || !form) return;

    const allTickets = getTickets();
    const ticket = allTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    // Set values
    document.getElementById('ticket-id').value = ticket.id;
    document.getElementById('ticket-title').value = ticket.title;
    document.getElementById('ticket-category').value = ticket.category;
    document.getElementById('ticket-priority').value = ticket.priority;
    document.getElementById('ticket-description').value = ticket.description;

    const statusGroup = document.getElementById('group-status');
    const notesGroup = document.getElementById('group-notes');
    const assignGroup = document.getElementById('group-assign');

    if (statusGroup) {
        // Show status only to Agent and Admin
        statusGroup.style.display = (currentUser.role === 'Admin' || currentUser.role === 'Agent') ? 'block' : 'none';
        document.getElementById('ticket-status').value = ticket.status;
    }

    if (notesGroup) {
        notesGroup.style.display = (currentUser.role === 'Admin' || currentUser.role === 'Agent') ? 'block' : 'none';
        document.getElementById('ticket-notes').value = ticket.notes || '';
    }

    if (assignGroup) {
        assignGroup.style.display = (currentUser.role === 'Admin') ? 'block' : 'none';
        document.getElementById('ticket-assigned-agent').value = ticket.assignedToAgentId || '';
    }

    modalTitle.textContent = `Edit Ticket (${ticket.id})`;
    submitBtn.textContent = 'Save Changes';
    submitBtn.style.display = 'inline-block';

    setFormDisabledState(form, false);

    // If User is editing an In Progress or Resolved ticket, make fields read-only
    if (currentUser.role === 'User' && ticket.status !== 'Open') {
        alert('This ticket is already being handled and cannot be edited. You can only view it.');
        viewTicketModal(ticketId);
        return;
    }

    modal.style.display = 'flex';
}

// Open Modal in Read-Only View mode
function viewTicketModal(ticketId) {
    const modal = document.getElementById('ticket-modal');
    const form = document.getElementById('ticket-form');
    const modalTitle = document.getElementById('modal-title');
    const submitBtn = document.getElementById('modal-submit-btn');

    if (!modal || !form) return;

    const allTickets = getTickets();
    const ticket = allTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    document.getElementById('ticket-id').value = ticket.id;
    document.getElementById('ticket-title').value = ticket.title;
    document.getElementById('ticket-category').value = ticket.category;
    document.getElementById('ticket-priority').value = ticket.priority;
    document.getElementById('ticket-description').value = ticket.description;

    const statusGroup = document.getElementById('group-status');
    const notesGroup = document.getElementById('group-notes');
    const assignGroup = document.getElementById('group-assign');

    if (statusGroup) {
        statusGroup.style.display = 'block';
        document.getElementById('ticket-status').value = ticket.status;
    }

    if (notesGroup) {
        notesGroup.style.display = 'block';
        document.getElementById('ticket-notes').value = ticket.notes || 'No notes yet.';
    }

    if (assignGroup) {
        assignGroup.style.display = 'block';
        document.getElementById('ticket-assigned-agent').value = ticket.assignedToAgentId || '';
    }

    modalTitle.textContent = `Ticket Details - ${ticket.id}`;
    submitBtn.style.display = 'none'; // Hide submit button for viewing

    setFormDisabledState(form, true);

    modal.style.display = 'flex';
}

// Enable or disable form fields
function setFormDisabledState(form, isDisabled) {
    const elements = form.elements;
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].id !== 'modal-close-btn') {
            elements[i].disabled = isDisabled;
        }
    }
}

// Close Ticket Modal
function closeTicketModal() {
    const modal = document.getElementById('ticket-modal');
    if (modal) modal.style.display = 'none';
}

// Helper: Escape HTML to prevent XSS
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

// Auto init if on tickets/dashboard page
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('tickets-tbody')) {
            initTicketsPage();
        }
    });
}
