// ============================================
// TEST FUNCTION - Add this to your Google Apps Script
// ============================================

function testPDFGeneration() {
  console.log('=== STARTING PDF TEST ===');

  // Test data
  const testData = {
    insuredName: 'TEST CUSTOMER',
    policyNumber: 'TEST123456',
    insuranceCompany: 'Test Insurance Co',
    policyType: 'Auto',
    amountPaid: '$500.00',
    cancellationDate: '2025-01-01',
    reinstatementDate: '2025-01-15',
    phone: '(555) 123-4567',
    email: 'test@example.com',
    agencyName: 'Test Agency',
    agencyEmail: 'Save@BillLayneInsurance.com', // Your email for testing
    signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    noLossConfirmation: true
  };

  try {
    // Test 1: Check folder access
    console.log('Test 1: Checking folder access...');
    const folder = DriveApp.getFolderById('1r0k8FCgjPq28lz9KfKPIGYgo2y3JQM_N');
    console.log('✓ Folder accessed: ' + folder.getName());

    // Test 2: Create a simple test document
    console.log('Test 2: Creating test document...');
    const doc = DocumentApp.create('TEST_DOCUMENT_' + new Date().getTime());
    doc.getBody().appendParagraph('This is a test document');
    doc.saveAndClose();
    console.log('✓ Document created: ' + doc.getId());

    // Test 3: Convert to PDF
    console.log('Test 3: Converting to PDF...');
    const pdfBlob = DriveApp.getFileById(doc.getId()).getAs('application/pdf');
    console.log('✓ PDF blob created');

    // Test 4: Save PDF to folder
    console.log('Test 4: Saving PDF to folder...');
    const pdfFile = folder.createFile(pdfBlob);
    pdfFile.setName('TEST_PDF_' + new Date().getTime() + '.pdf');
    console.log('✓ PDF saved: ' + pdfFile.getUrl());

    // Test 5: Set sharing permissions
    console.log('Test 5: Setting sharing permissions...');
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    console.log('✓ Sharing set');

    // Clean up test document
    DriveApp.getFileById(doc.getId()).setTrashed(true);

    // Test 6: Send test email
    console.log('Test 6: Sending test email...');
    MailApp.sendEmail({
      to: 'Save@BillLayneInsurance.com',
      subject: 'TEST - PDF Generation Working',
      body: 'PDF was successfully created. URL: ' + pdfFile.getUrl(),
      htmlBody: '<h2>PDF Test Successful!</h2><p>PDF URL: <a href="' + pdfFile.getUrl() + '">Click here to view</a></p>'
    });
    console.log('✓ Email sent');

    console.log('=== ALL TESTS PASSED ===');
    console.log('PDF URL: ' + pdfFile.getUrl());

    // Now test the actual PDF generation function
    console.log('\n=== TESTING ACTUAL PDF GENERATION ===');
    const confirmationNumber = 'TEST-' + new Date().getTime();
    const pdfUrl = generateCompletePDF(testData, confirmationNumber);
    console.log('Generated PDF URL: ' + pdfUrl);

    return 'Success! PDF URL: ' + pdfUrl;

  } catch (error) {
    console.error('TEST FAILED:', error);
    console.error('Error details:', error.toString());
    console.error('Stack trace:', error.stack);
    return 'Error: ' + error.toString();
  }
}

// ============================================
// DEBUG VERSION OF PROCESS SUBMISSION
// ============================================

function debugProcessSubmission() {
  const testData = {
    insuredName: 'VIRGINIA COLE',
    policyNumber: '2027656164',
    insuranceCompany: 'National General',
    policyType: 'Auto',
    amountPaid: '$235.62',
    cancellationDate: '2025-09-07',
    reinstatementDate: '2025-09-12',
    phone: '(910) 635-9588',
    email: 'COLEDESIGNS4U@GMAIL.COM',
    agencyName: 'Bill Layne Insurance Agency',
    agencyEmail: 'Save@BillLayneInsurance.com',
    signature: 'data:image/png;base64,test',
    noLossConfirmation: true
  };

  console.log('=== DEBUG: Starting Process ===');

  try {
    // Step 1: Generate confirmation number
    const confirmationNumber = generateConfirmationNumber();
    console.log('✓ Confirmation number:', confirmationNumber);

    // Step 2: Save to sheet
    console.log('Attempting to save to sheet...');
    saveToSheet(testData, confirmationNumber);
    console.log('✓ Saved to sheet');

    // Step 3: Generate PDF
    console.log('Attempting to generate PDF...');
    const pdfUrl = generateCompletePDF(testData, confirmationNumber);
    if (pdfUrl) {
      console.log('✓ PDF generated:', pdfUrl);
    } else {
      console.log('✗ PDF generation returned empty URL');
    }

    // Step 4: Send notifications
    console.log('Attempting to send notifications...');
    sendNotifications(testData, confirmationNumber, pdfUrl);
    console.log('✓ Notifications sent');

    console.log('=== DEBUG: Process Complete ===');
    return {
      success: true,
      confirmationNumber: confirmationNumber,
      pdfUrl: pdfUrl
    };

  } catch (error) {
    console.error('=== DEBUG: Process Failed ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    return {
      success: false,
      error: error.toString()
    };
  }
}