// ==========================================================================
// DATA.JS - Mock Database using LocalStorage
// ==========================================================================
// This file acts as our "Fake Backend" database.
// When the app starts, it checks if data exists in localStorage.
// If not, it populates it with starter demo data.

// Keys used in localStorage
const STORAGE_KEYS = {
    USERS: 'quickdesk_users',
    TICKETS: 'quickdesk_tickets',
    CURRENT_USER: 'quickdesk_currentUser'
};

// Initial default users (Passwords are stored as plain text for beginner simplicity)
const DEFAULT_USERS = [
    {
        id: 'usr_1',
        fullName: 'Alex Admin',
        email: 'admin@example.com',
        password: 'Admin@123',
        role: 'Admin',
        phone: '+1 555-0101',
        bio: 'Head of Customer Support & System Administrator',
        createdAt: '2026-01-10'
    },
    {
        id: 'usr_2',
        fullName: 'Sarah Agent',
        email: 'agent@example.com',
        password: 'Agent@123',
        role: 'Agent',
        phone: '+1 555-0102',
        bio: 'Senior Technical Support Specialist',
        createdAt: '2026-01-15'
    },
    {
        id: 'usr_3',
        fullName: 'John Customer',
        email: 'user@example.com',
        password: 'User@123',
        role: 'User',
        phone: '+1 555-0103',
        bio: 'Product Designer and regular client',
        createdAt: '2026-02-01'
    }
];

// Initial default support tickets
const DEFAULT_TICKETS = [
    {
        id: 'TCK-101',
        title: 'Unable to download monthly invoice PDF',
        category: 'Billing',
        priority: 'High',
        status: 'In Progress', // 'Open', 'In Progress', 'Resolved', 'Closed'
        description: 'When I click on "Download Invoice" under settings, the page shows a 404 error.',
        createdByUserId: 'usr_3',
        createdByName: 'John Customer',
        assignedToAgentId: 'usr_2',
        assignedToAgentName: 'Sarah Agent',
        createdAt: '2026-02-10 10:30 AM',
        updatedAt: '2026-02-11 02:15 PM',
        notes: 'Checking cloud storage permissions.'
    },
    {
        id: 'TCK-102',
        title: 'Dark mode theme resets after logout',
        category: 'UI/UX',
        priority: 'Medium',
        status: 'Open',
        description: 'Every time I log out and log back in, the theme preference is forgotten.',
        createdByUserId: 'usr_3',
        createdByName: 'John Customer',
        assignedToAgentId: '',
        assignedToAgentName: 'Unassigned',
        createdAt: '2026-02-12 04:00 PM',
        updatedAt: '2026-02-12 04:00 PM',
        notes: ''
    },
    {
        id: 'TCK-103',
        title: 'Request for API key integration documentation',
        category: 'Integration',
        priority: 'Low',
        status: 'Resolved',
        description: 'Need documentation on how to connect webhook notifications.',
        createdByUserId: 'usr_3',
        createdByName: 'John Customer',
        assignedToAgentId: 'usr_2',
        assignedToAgentName: 'Sarah Agent',
        createdAt: '2026-02-05 09:00 AM',
        updatedAt: '2026-02-08 11:00 AM',
        notes: 'Sent API v2 guide link to client email.'
    }
];

// Initialize database in localStorage if not already present
function initDatabase() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
        localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(DEFAULT_TICKETS));
    }
}

// Helper: Get all users from localStorage
function getUsers() {
    initDatabase();
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
}

// Helper: Save users array to localStorage
function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

// Helper: Get all tickets from localStorage
function getTickets() {
    initDatabase();
    const data = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return data ? JSON.parse(data) : [];
}

// Helper: Save tickets array to localStorage
function saveTickets(tickets) {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
}

// Helper: Reset database to factory demo defaults
function resetDemoDatabase() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(DEFAULT_TICKETS));
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// Run initialization immediately when script loads
initDatabase();
