// ============================================
// SIMPLE TEST - Add this to your Google Apps Script
// Run each function one by one to identify the issue
// ============================================

// Test 1: Basic function test
function test1_BasicTest() {
  console.log('Test 1: Basic function works');
  return 'Success';
}

// Test 2: Spreadsheet access
function test2_SpreadsheetAccess() {
  try {
    const sheet = SpreadsheetApp.openById('1d03OMLbbTYc5ZvxYJ6GT9Ect_cWtD0DjCwkacXhgzBU');
    console.log('✓ Spreadsheet accessed: ' + sheet.getName());
    return 'Spreadsheet OK';
  } catch (error) {
    console.error('✗ Spreadsheet error:', error.toString());
    return 'Spreadsheet Error: ' + error.toString();
  }
}

// Test 3: Drive folder access
function test3_FolderAccess() {
  try {
    const folder = DriveApp.getFolderById('1r0k8FCgjPq28lz9KfKPIGYgo2y3JQM_N');
    console.log('✓ Folder accessed: ' + folder.getName());
    return 'Folder OK';
  } catch (error) {
    console.error('✗ Folder error:', error.toString());
    return 'Folder Error: ' + error.toString();
  }
}

// Test 4: Document creation
function test4_DocumentCreation() {
  try {
    const doc = DocumentApp.create('Test_Doc_' + new Date().getTime());
    const docId = doc.getId();
    console.log('✓ Document created: ' + docId);

    // Clean up
    DriveApp.getFileById(docId).setTrashed(true);
    return 'Document Creation OK';
  } catch (error) {
    console.error('✗ Document error:', error.toString());
    return 'Document Error: ' + error.toString();
  }
}

// Test 5: Email capability
function test5_EmailTest() {
  try {
    // This will show if email service is available but won't send
    const remaining = MailApp.getRemainingDailyQuota();
    console.log('✓ Email quota remaining: ' + remaining);
    return 'Email OK - Quota: ' + remaining;
  } catch (error) {
    console.error('✗ Email error:', error.toString());
    return 'Email Error: ' + error.toString();
  }
}

// Test 6: Full PDF test with error handling
function test6_FullPDFTest() {
  try {
    console.log('Starting full PDF test...');

    // Step 1: Create document
    console.log('Step 1: Creating document...');
    const doc = DocumentApp.create('Test_PDF_' + new Date().getTime());
    const body = doc.getBody();
    body.appendParagraph('TEST DOCUMENT');
    body.appendParagraph('Created: ' + new Date().toString());
    doc.saveAndClose();
    const docId = doc.getId();
    console.log('✓ Document created: ' + docId);

    // Step 2: Get as PDF
    console.log('Step 2: Converting to PDF...');
    const file = DriveApp.getFileById(docId);
    const pdfBlob = file.getAs('application/pdf');
    console.log('✓ PDF blob created');

    // Step 3: Save to folder
    console.log('Step 3: Saving to folder...');
    const folder = DriveApp.getFolderById('1r0k8FCgjPq28lz9KfKPIGYgo2y3JQM_N');
    const pdfFile = folder.createFile(pdfBlob);
    pdfFile.setName('Test_PDF_' + new Date().getTime() + '.pdf');
    const pdfUrl = pdfFile.getUrl();
    console.log('✓ PDF saved: ' + pdfUrl);

    // Step 4: Set sharing
    console.log('Step 4: Setting sharing...');
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    console.log('✓ Sharing set');

    // Clean up
    file.setTrashed(true);

    console.log('=== SUCCESS ===');
    console.log('PDF URL: ' + pdfUrl);
    return 'Success! PDF URL: ' + pdfUrl;

  } catch (error) {
    console.error('=== ERROR ===');
    console.error('Error message:', error.toString());
    console.error('Error stack:', error.stack);
    return 'Error: ' + error.toString();
  }
}

// Run all tests in sequence
function runAllTests() {
  console.log('=== RUNNING ALL TESTS ===\n');

  const results = [];

  results.push('Test 1 (Basic): ' + test1_BasicTest());
  results.push('Test 2 (Spreadsheet): ' + test2_SpreadsheetAccess());
  results.push('Test 3 (Folder): ' + test3_FolderAccess());
  results.push('Test 4 (Document): ' + test4_DocumentCreation());
  results.push('Test 5 (Email): ' + test5_EmailTest());
  results.push('Test 6 (Full PDF): ' + test6_FullPDFTest());

  console.log('\n=== TEST RESULTS ===');
  results.forEach(result => console.log(result));

  return results.join('\n');
}