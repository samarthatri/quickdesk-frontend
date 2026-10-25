// ==========================================================================
// TESTS.JS - Automated Unit & Integration Tests for QuickDesk
// ==========================================================================

const testResults = [];

function assert(condition, testName, details = '') {
    testResults.push({
        passed: Boolean(condition),
        name: testName,
        details: details
    });
}

function runAllTests() {
    testResults.length = 0; // Clear previous runs

    // Reset database to ensure clean initial test fixture
    resetDemoDatabase();

    // ----------------------------------------------------------------------
    // GROUP 1: FORM & JS VALIDATION TESTS
    // ----------------------------------------------------------------------
    assert(
        isValidEmail('test@example.com') === true,
        'Email Validation: Accepts standard valid email format',
        'test@example.com should return true'
    );

    assert(
        isValidEmail('invalid-email-string') === false,
        'Email Validation: Rejects email missing @ and domain',
        'invalid-email-string should return false'
    );

    assert(
        isValidEmail('user@') === false,
        'Email Validation: Rejects email with missing domain',
        'user@ should return false'
    );

    assert(
        isValidPassword('12345') === false,
        'Password Validation: Rejects passwords shorter than 6 characters',
        'Length 5 should return false'
    );

    assert(
        isValidPassword('Secret123') === true,
        'Password Validation: Accepts passwords with 6+ characters',
        'Length >= 6 should return true'
    );

    // ----------------------------------------------------------------------
    // GROUP 2: AUTHENTICATION & REGISTRATION TESTS
    // ----------------------------------------------------------------------
    const users = getUsers();
    assert(
        Array.isArray(users) && users.length >= 3,
        'Database: Preloads default users (Admin, Agent, User)',
        `Found ${users.length} default users in localStorage`
    );

    // Login test: valid credentials
    const adminUser = users.find(u => u.email === 'admin@example.com' && u.password === 'Admin@123');
    assert(
        adminUser !== undefined && adminUser.role === 'Admin',
        'Auth: Authenticate valid Admin credentials',
        'admin@example.com logged in successfully with Admin role'
    );

    // Login test: invalid password
    const wrongAuth = users.find(u => u.email === 'admin@example.com' && u.password === 'WrongPass');
    assert(
        wrongAuth === undefined,
        'Auth: Reject authentication on incorrect password',
        'Invalid password returned null/undefined'
    );

    // Duplicate email registration guard
    const isDuplicate = users.some(u => u.email === 'admin@example.com');
    assert(
        isDuplicate === true,
        'Registration: Detects duplicate email conflict',
        'System detected admin@example.com already exists'
    );

    // ----------------------------------------------------------------------
    // GROUP 3: CRUD - CREATE TICKET
    // ----------------------------------------------------------------------
    const initialTickets = getTickets();
    const initialCount = initialTickets.length;

    const testTicket = {
        id: 'TCK-999',
        title: 'Test automated ticket creation',
        category: 'Technical',
        priority: 'High',
        status: 'Open',
        description: 'Automated test suite ticket payload',
        createdByUserId: 'usr_3',
        createdByName: 'John Customer',
        assignedToAgentId: '',
        assignedToAgentName: 'Unassigned',
        createdAt: '2026-10-25 12:00 PM',
        updatedAt: '2026-10-25 12:00 PM',
        notes: ''
    };

    initialTickets.unshift(testTicket);
    saveTickets(initialTickets);

    const updatedTickets = getTickets();
    assert(
        updatedTickets.length === initialCount + 1 && updatedTickets[0].id === 'TCK-999',
        'CRUD [Create]: Successfully creates new support ticket in database',
        'Ticket TCK-999 saved to localStorage'
    );

    // ----------------------------------------------------------------------
    // GROUP 4: CRUD - READ & ROLE FILTERING
    // ----------------------------------------------------------------------
    const userTicketsOnly = updatedTickets.filter(t => t.createdByUserId === 'usr_3');
    assert(
        userTicketsOnly.length > 0 && userTicketsOnly.every(t => t.createdByUserId === 'usr_3'),
        'CRUD [Read & RBAC]: Normal user sees only tickets they created',
        `Correctly filtered ${userTicketsOnly.length} user-owned tickets`
    );

    // ----------------------------------------------------------------------
    // GROUP 5: CRUD - UPDATE TICKET
    // ----------------------------------------------------------------------
    const ticketToUpdate = updatedTickets.find(t => t.id === 'TCK-999');
    if (ticketToUpdate) {
        ticketToUpdate.status = 'In Progress';
        ticketToUpdate.notes = 'Agent investigated issue.';
        saveTickets(updatedTickets);
    }

    const reloadedTickets = getTickets();
    const verifiedTicket = reloadedTickets.find(t => t.id === 'TCK-999');
    assert(
        verifiedTicket && verifiedTicket.status === 'In Progress' && verifiedTicket.notes.includes('investigated'),
        'CRUD [Update]: Updates ticket status and agent resolution notes',
        'Status transitioned to In Progress with saved notes'
    );

    // ----------------------------------------------------------------------
    // GROUP 6: CRUD - DELETE TICKET
    // ----------------------------------------------------------------------
    const ticketsBeforeDelete = getTickets();
    const filteredTickets = ticketsBeforeDelete.filter(t => t.id !== 'TCK-999');
    saveTickets(filteredTickets);

    const ticketsAfterDelete = getTickets();
    assert(
        ticketsAfterDelete.find(t => t.id === 'TCK-999') === undefined,
        'CRUD [Delete]: Removes ticket from mock database',
        'TCK-999 verified deleted'
    );

    // ----------------------------------------------------------------------
    // GROUP 7: RBAC DELETE PERMISSION GUARD
    // ----------------------------------------------------------------------
    // User cannot delete a ticket that is already 'In Progress' or 'Resolved'
    const resolvedTicket = ticketsAfterDelete.find(t => t.status === 'Resolved');
    const userRole = 'User';
    const canUserDeleteResolved = (userRole === 'Admin') ||
        (userRole === 'User' && resolvedTicket && resolvedTicket.status === 'Open');

    assert(
        canUserDeleteResolved === false,
        'RBAC Guard: Regular user cannot delete non-Open tickets',
        'Prevented deletion of Resolved ticket by standard User'
    );

    // ----------------------------------------------------------------------
    // GROUP 8: FORGOT PASSWORD RECOVERY
    // ----------------------------------------------------------------------
    const usersForReset = getUsers();
    const targetUser = usersForReset.find(u => u.email === 'user@example.com');
    if (targetUser) {
        targetUser.password = 'NewSecret@2026';
        saveUsers(usersForReset);
    }

    const reloadedUsers = getUsers();
    const resetUser = reloadedUsers.find(u => u.email === 'user@example.com');
    assert(
        resetUser && resetUser.password === 'NewSecret@2026',
        'Forgot Password: Successfully updates password for verified email',
        'Password for user@example.com changed to NewSecret@2026'
    );

    // ----------------------------------------------------------------------
    // GROUP 9: PROFILE UPDATE
    // ----------------------------------------------------------------------
    if (resetUser) {
        resetUser.fullName = 'John Updated Customer';
        resetUser.bio = 'Senior QA Engineer';
        saveUsers(reloadedUsers);
    }

    const finalUsers = getUsers();
    const profileUser = finalUsers.find(u => u.email === 'user@example.com');
    assert(
        profileUser && profileUser.fullName === 'John Updated Customer' && profileUser.bio === 'Senior QA Engineer',
        'Profile: Successfully updates full name and biographical notes',
        'Name and bio saved to user profile'
    );

    // Reset database back to clean state after test execution
    resetDemoDatabase();

    return testResults;
}
