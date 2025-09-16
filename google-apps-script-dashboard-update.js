// ============================================
// DASHBOARD DATA FUNCTIONS - ADD AT END OF YOUR EXISTING GOOGLE APPS SCRIPT FILE
// ============================================

function getAgencyDashboardData(data) {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName('Submissions');

    if (!sheet) {
      return createResponse('success', 'No submissions yet', {
        submissions: [],
        stats: {
          total: 0,
          thisMonth: 0,
          thisWeek: 0,
          completionRate: 0
        }
      });
    }

    const allData = sheet.getDataRange().getValues();
    if (allData.length <= 1) {
      return createResponse('success', 'No submissions yet', {
        submissions: [],
        stats: {
          total: 0,
          thisMonth: 0,
          thisWeek: 0,
          completionRate: 0
        }
      });
    }

    const headers = allData[0];

    // Find column indices (based on your existing headers)
    const agencyNameIndex = headers.indexOf('Agency Name');
    const timestampIndex = headers.indexOf('Timestamp');
    const confirmationIndex = headers.indexOf('Confirmation #');
    const customerNameIndex = headers.indexOf('Insured Name');
    const policyNumberIndex = headers.indexOf('Policy Number');
    const hasSignatureIndex = headers.indexOf('Has Signature');
    const agentNameIndex = headers.indexOf('Agent Name');

    // Filter by agency name
    const agencyRows = allData.filter((row, index) => {
      if (index === 0) return false; // Skip header
      return row[agencyNameIndex] === data.agencyName;
    });

    // Get current date info
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Calculate statistics
    let thisMonthCount = 0;
    let thisWeekCount = 0;
    let completedCount = 0;

    agencyRows.forEach(row => {
      const submissionDate = new Date(row[timestampIndex]);

      // Count this month
      if (submissionDate.getMonth() === currentMonth &&
          submissionDate.getFullYear() === currentYear) {
        thisMonthCount++;
      }

      // Count this week
      if (submissionDate >= weekAgo) {
        thisWeekCount++;
      }

      // Count completed (has signature)
      if (row[hasSignatureIndex] === 'Yes') {
        completedCount++;
      }
    });

    // Calculate completion rate
    const completionRate = agencyRows.length > 0
      ? Math.round((completedCount / agencyRows.length) * 100)
      : 0;

    // Get last 10 submissions for the table
    const recentSubmissions = agencyRows
      .slice(-10)
      .reverse()
      .map(row => ({
        timestamp: row[timestampIndex],
        confirmationNumber: row[confirmationIndex] || 'N/A',
        customerName: row[customerNameIndex] || 'Unknown',
        policyNumber: row[policyNumberIndex] || 'N/A',
        agentName: row[agentNameIndex] || 'N/A',
        status: row[hasSignatureIndex] === 'Yes' ? 'Completed' : 'Pending'
      }));

    // Return dashboard data
    return createResponse('success', 'Dashboard data retrieved', {
      submissions: recentSubmissions,
      stats: {
        total: agencyRows.length,
        thisMonth: thisMonthCount,
        thisWeek: thisWeekCount,
        completionRate: completionRate
      }
    });

  } catch (error) {
    console.error('Dashboard data error:', error);
    return createResponse('error', 'Failed to retrieve dashboard data: ' + error.toString());
  }
}

// ============================================
// UPDATE YOUR EXISTING doPost FUNCTION
// ============================================
// IMPORTANT: Find your existing doPost function and ADD this case
// Do NOT replace the entire function, just add this IF statement

// In your existing doPost function, look for where it handles different actions.
// It should look something like this:
/*
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.action === 'create_agency') {
      return handleAgencyCreation(data);
    } else if (data.action === 'test_connection') {
      return handleTestConnection();
    }
    // ADD THE NEW IF STATEMENT HERE:
    else if (data.action === 'get_dashboard_data') {
      return getAgencyDashboardData(data);
    }
    else {
      return handleFormSubmission(data);
    }
  } catch (error) {
    // existing error handling
  }
}
*/

// SPECIFICALLY, add this code block to your doPost function:
// else if (data.action === 'get_dashboard_data') {
//   return getAgencyDashboardData(data);
// }