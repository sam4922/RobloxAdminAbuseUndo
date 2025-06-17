const noblox = require('noblox.js');

// --- Configuration ---
const groupId = 33444525;
const personDoingTheAbuse = 3795958810;
const iterations = 100; // Increased iterations just in case
const cutoffDateString = "2021-04-10T12:00:00.000Z"; // Use YYYY-MM-DD format for safety
const logsPerPage = 50;
const requestDelayMs = 150;
const pageFetchDelayMs = 250;
const PRINT_DETAILED_LOGS = true; // Keep detailed logging enabled

// --- Calculate cutoffTime and VALIDATE ---
const cutoffTime = new Date(cutoffDateString).getTime();
console.log(`[DEBUG] Initial cutoffTime value (ms since epoch): ${cutoffTime}`); // Log the value
if (isNaN(cutoffTime)) {
    console.error(`\n❌ FATAL ERROR: The cutoffDateString "${cutoffDateString}" is invalid.`);
    console.error("   Please ensure it follows the format: YYYY-MM-DDTHH:mm:ss.sssZ");
    process.exit(1); // Exit immediately if date is bad
}
// --- End Validation ---


// --- State ---
let nextCursor = '';
let toDo = [];
let fetchedLogsCount = 0;

// Suppress deprecation warnings globally
noblox.setOptions({ show_deprecation_warnings: false });

/**
 * ===== Authenticate Account =====
 */
async function authenticateAccount() {
    console.log("=====\nAuthenticating...");
    try {
        await noblox.setCookie('COOKIE HERE'); // Your cookie here
        console.log("Logged in!");
        console.log("Authentication completed.\n");
    } catch (error) {
        console.log("Unable to log in!", error);
        console.error("❌ Authentication failed:", error.message);
        console.error("Check if the ROBLOX_COOKIE is valid and correctly formatted.");
        process.exit(1);
    }
}

// Helper function for delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * ===== Fetch Audit Logs =====
 */
async function fetchAuditLogs() {
    console.log(" =====\n");
    // *** CORRECTED TYPO BELOW ***
    console.log(`Workspaceing audit logs for group ${groupId}, user ${personDoingTheAbuse}, action 'ChangeRank'.`);
    console.log(`Will stop after ${iterations} pages or when logs end.`);
    // This line is now safe because we validated cutoffTime earlier
    console.log(`Filtering logs created after: ${new Date(cutoffTime).toISOString()}`);
    if (PRINT_DETAILED_LOGS) {
        console.log("Detailed log printing is ENABLED.");
    }
    console.log(" -----\n");

    let currentIteration = 0;

    while (currentIteration < iterations) {
        const pageNum = currentIteration + 1;
        console.log(`Iteration ${pageNum} fetching logs... (Cursor: ${nextCursor || 'None'})`);

        try {
            if (currentIteration > 0 && pageFetchDelayMs > 0) {
                await delay(pageFetchDelayMs);
            }

            console.log(`   Calling noblox.getAuditLog with limit=${logsPerPage}, cursor='${nextCursor}'`);
            const response = await noblox.getAuditLog(groupId, 'ChangeRank', personDoingTheAbuse, 'Asc', logsPerPage, nextCursor);
            const logs = response.data || [];
            fetchedLogsCount += logs.length;
            console.log(`✅ Retrieved ${logs.length} log entries this iteration.`);

            if (PRINT_DETAILED_LOGS && logs.length > 0) {
                console.log(`\n   --- Fetched Log Details (Page ${pageNum}) ---`);
                logs.forEach((log, index) => {
                    console.log(`\n   [Log ${index + 1}/${logs.length} on Page ${pageNum}]`);
                    console.dir(log, { depth: null });
                });
                console.log(`   --- End of Log Details (Page ${pageNum}) ---\n`);
            } else if (logs.length === 0) {
                 console.log("   No log entries returned in this response.");
            }

            let addedCount = 0;
            logs.forEach(log => {
                // Ensure log.created is valid before parsing
                if (!log.created) {
                     console.warn(`   ⚠️ Skipping log entry due to missing 'created' timestamp: ${JSON.stringify(log)}`);
                     return; // Skip this log entry
                }
                const logTime = new Date(log.created).getTime();
                 if (isNaN(logTime)) {
                     console.warn(`   ⚠️ Skipping log entry due to invalid 'created' timestamp (${log.created}): ${JSON.stringify(log)}`);
                     return; // Skip this log entry
                 }

                if (logTime > cutoffTime) {
                    if (log.description && log.description.TargetId != null && log.description.OldRoleSetId != null) {
                        const entry = {
                            id: log.description.TargetId,
                            name: log.description.TargetName || `ID: ${log.description.TargetId}`,
                            oldRole: log.description.OldRoleSetId,
                            oldRoleName: log.description.OldRoleSetName || `ID: ${log.description.OldRoleSetId}`,
                            date: log.created
                        };
                        toDo.push(entry);
                        addedCount++;
                    } else {
                        console.warn(`   ⚠️ Skipping log entry due to missing description data: ${JSON.stringify(log.description)}`);
                    }
                }
            });
            if(addedCount > 0) {
                console.log(`   Added ${addedCount} entries from this page to the revert list.`);
            }

            const previousCursor = nextCursor;
            nextCursor = response.nextPageCursor;
            console.log(`   Received next cursor: ${nextCursor || 'None'}`);

            if (!nextCursor) {
                console.log(`   No next cursor provided. Reached end of audit log pages after page ${pageNum}.`);
                break;
            }

            if (nextCursor === previousCursor && nextCursor != null) {
                 console.warn(`   ⚠️ Next cursor is the same as the previous one ('${nextCursor}'). Stopping to prevent potential infinite loop.`);
                 break;
            }

            currentIteration++;

        } catch (error) {
            console.error(`❌ Error fetching logs during iteration ${pageNum}:`, error.message);
            console.error(`   Cursor used for failed request: '${nextCursor}'`); // This might be misleading if error is before setting next cursor

            console.error('\n   --- Full Error Object ---');
            console.error(error);
            console.error('   --- End of Full Error Object ---\n');

            if (error.response) {
                console.error(`   Error Response Status: ${error.response.status}`);
                console.error(`   Error Response Data:`, error.response.data);
            } else if (error.request) {
                console.error('   Error: The request was made but no response was received.');
            } else {
                 console.error('   Error: Issue setting up the request:', error.message);
            }

            if (error.message && error.message.toLowerCase().includes('pagination')) {
                 console.error("   Interpretation: Likely a pagination error from Roblox API. Stopping log fetch.");
            } else if (error.message && error.message.includes('Authentication')) {
                 console.error("   Interpretation: Authentication error. Cookie might be invalid/expired. Exiting.");
                 process.exit(1);
            } else {
                 console.error("   Interpretation: An unexpected error occurred. Stopping log fetch.");
            }
            break;
        }
    }
    console.log(`\n-Audit Log Fetch Completed. Fetched ${fetchedLogsCount} total logs across ${currentIteration} successful page requests.`);
    console.log(`-Total Entries matching criteria (after ${new Date(cutoffTime).toISOString()}) to Revert: ${toDo.length}\n`);
}

/**
 * ===== Revert Ranks =====
 */
// (Keep the revertRanks function exactly as it was in the previous version)
async function revertRanks() {
    console.log(" =====\n");

    if (toDo.length === 0) {
        console.log("No ranks matching criteria found to revert. Exiting rank reversion step.\n");
        return;
    }

    console.log(`Starting rank reversion process for ${toDo.length} entries...`);
    console.log(`   Delay between requests: ${requestDelayMs}ms`);
    console.log(" -----\n");


    const revertPromises = toDo.map((item, index) => {
        return new Promise(resolve => {
            setTimeout(async () => {
                const logPrefix = `[${index + 1}/${toDo.length}]`;
                console.log(`${logPrefix} Attempting revert: User ${item.name} (ID: ${item.id}) to Role ${item.oldRoleName} (ID: ${item.oldRole})`);
                try {
                    await noblox.setRank(groupId, item.id, item.oldRole);
                    console.log(`   ✅ ${logPrefix} Success: ${item.name} reverted.`);
                    resolve({ status: 'fulfilled', user: item.name });
                } catch (error) {
                    console.error(`   ❌ ${logPrefix} Failed for ${item.name}: ${error.message}`);
                    // Log more details if available
                    if (error.response) {
                        console.error(`      Status: ${error.response.status}, Data:`, error.response.data);
                    } else {
                         console.error('      Full error object:', error);
                    }
                    resolve({ status: 'rejected', user: item.name, reason: error.message });
                }
            }, index * requestDelayMs);
        });
    });

    const results = await Promise.allSettled(revertPromises);

    const successes = results.filter(r => r.status === 'fulfilled').length;
    const failures = results.filter(r => r.status === 'rejected').length;
    console.log(`\n -----\nRank reversion process finished. Successes: ${successes}, Failures: ${failures}.\n`);
}


/**
 * ========================
 * Starting Script...
 * ========================
 */
(async () => {
    console.log('\n========================');
    console.log('Starting Script...');
    console.log('========================\n');

    await authenticateAccount();
    await fetchAuditLogs();
    await revertRanks();

    console.log('\n========================');
    console.log('Script Completed.');
    console.log('========================\n');
})();
