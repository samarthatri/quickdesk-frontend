/**
 * test-node.js - CLI Test Runner for QuickDesk
 * 
 * Allows running the test suite directly from terminal:
 * node test-node.js
 * or
 * npm test
 */

const fs = require('fs');
const path = require('path');

// 1. In-memory Mock LocalStorage for Node environment
const storage = {};
global.localStorage = {
    getItem: (key) => storage[key] || null,
    setItem: (key, val) => { storage[key] = String(val); },
    removeItem: (key) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

// 2. Load the project's core modules
const basePath = __dirname;
eval(fs.readFileSync(path.join(basePath, 'js', 'data.js'), 'utf8'));
eval(fs.readFileSync(path.join(basePath, 'js', 'auth.js'), 'utf8'));
eval(fs.readFileSync(path.join(basePath, 'js', 'tests.js'), 'utf8'));

console.log('\n========================================');
console.log('🧪 RUNNING QUICKDESK AUTOMATED TEST SUITE');
console.log('========================================\n');

// 3. Execute all tests
const results = runAllTests();

let passedCount = 0;
let failedCount = 0;

results.forEach((test, index) => {
    const num = String(index + 1).padStart(2, '0');
    if (test.passed) {
        passedCount++;
        console.log(` \x1b[32m✔ [PASS]\x1b[0m #${num}: ${test.name}`);
        if (test.details) {
            console.log(`          \x1b[90m↳ ${test.details}\x1b[0m`);
        }
    } else {
        failedCount++;
        console.log(` \x1b[31m✖ [FAIL]\x1b[0m #${num}: ${test.name}`);
        if (test.details) {
            console.log(`          \x1b[31m↳ ${test.details}\x1b[0m`);
        }
    }
});

console.log('\n----------------------------------------');
console.log(`Total: ${results.length} | Passed: \x1b[32m${passedCount}\x1b[0m | Failed: \x1b[${failedCount > 0 ? '31' : '32'}m${failedCount}\x1b[0m`);
console.log('========================================\n');

if (failedCount > 0) {
    process.exit(1);
} else {
    console.log('\x1b[32m🎉 All automated tests passed successfully!\x1b[0m\n');
    process.exit(0);
}
