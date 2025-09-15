// ============================================
// TEST FUNCTION WITH DATA
// Add this to your Google Apps Script and run it
// ============================================

function testPDFWithData() {
  console.log('=== Testing PDF Generation with Data ===');

  // Test data that mimics what comes from the form
  const testData = {
    insuredName: 'John Smith',
    customerName: 'John Smith',
    policyNumber: 'TEST-123456',
    insuranceCompany: 'Progressive',
    policyType: 'Auto',
    amountPaid: '$500.00',
    cancellationDate: '2025-01-01',
    reinstatementDate: '2025-01-15',
    phone: '(336) 555-1234',
    email: 'Save@BillLayneInsurance.com',
    propertyAddress: '123 Main Street',
    city: 'Elkin',
    state: 'NC',
    zipCode: '28621',
    agencyName: 'Bill Layne Insurance Agency',
    agencyEmail: 'Save@BillLayneInsurance.com',
    agencyPhone: '(336) 555-1234',
    agencyAddress: '123 Agency St, Elkin NC 28621',
    agentName: 'Test Agent',
    agentEmail: 'agent@test.com',
    signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    noLossConfirmation: true,
    timestamp: new Date().toLocaleString()
  };

  try {
    // Generate confirmation number
    const confirmationNumber = 'TEST-' + Date.now();
    console.log('Confirmation Number:', confirmationNumber);

    // Test PDF generation
    console.log('Generating PDF...');
    const pdfUrl = generateCompletePDF(testData, confirmationNumber);

    if (pdfUrl) {
      console.log('✅ SUCCESS! PDF created:', pdfUrl);

      // Test email sending
      console.log('Sending test email...');
      sendNotifications(testData, confirmationNumber, pdfUrl);
      console.log('✅ Email sent!');

      return 'Success! Check your email and this PDF: ' + pdfUrl;
    } else {
      console.log('❌ PDF generation returned empty URL');
      return 'Failed - PDF not created';
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.toString());
    console.error('Stack:', error.stack);
    return 'Error: ' + error.toString();
  }
}

// Test just the PDF generation without email
function testJustPDF() {
  console.log('=== Testing ONLY PDF Generation ===');

  const testData = {
    insuredName: 'Test Customer',
    policyNumber: 'POL-999999',
    insuranceCompany: 'National General',
    policyType: 'Auto',
    amountPaid: '$235.62',
    cancellationDate: '2025-01-07',
    reinstatementDate: '2025-01-12',
    phone: '(910) 635-9588',
    email: 'test@example.com',
    agencyName: 'Test Agency',
    signature: 'data:image/png;base64,test',
    noLossConfirmation: true
  };

  const confirmationNumber = 'TEST-' + Date.now();

  try {
    const pdfUrl = generateCompletePDF(testData, confirmationNumber);
    console.log('PDF URL:', pdfUrl || 'FAILED');
    return pdfUrl || 'Failed to generate PDF';
  } catch (error) {
    console.error('Error:', error);
    return 'Error: ' + error.toString();
  }
}

// Test the complete submission process
function testCompleteSubmission() {
  console.log('=== Testing Complete Submission Process ===');

  // This mimics what the form sends
  const formData = {
    insuredName: 'Virginia Cole',
    policyNumber: '2027656164',
    insuranceCompany: 'National General',
    policyType: 'Auto',
    amountPaid: '$235.62',
    cancellationDate: '2025-09-07',
    reinstatementDate: '2025-09-12',
    phone: '(910) 635-9588',
    email: 'Save@BillLayneInsurance.com',
    propertyAddress: '123 Test Street',
    city: 'Elkin',
    state: 'NC',
    zipCode: '28621',
    agencyName: 'Bill Layne Insurance Agency',
    agencyEmail: 'Save@BillLayneInsurance.com',
    agencyPhone: '(336) 555-1234',
    agentName: 'Bill Layne',
    agentEmail: 'Save@BillLayneInsurance.com',
    signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    noLossConfirmation: true,
    agreeTerms: true
  };

  try {
    // Process the submission
    const result = processSubmission(formData);

    console.log('=== RESULTS ===');
    console.log('Confirmation:', result.confirmationNumber);
    console.log('Agency:', result.agencyName);
    console.log('PDF URL:', result.pdfUrl);

    if (result.pdfUrl) {
      console.log('✅ SUCCESS! Everything worked!');
      console.log('Check your email and view PDF at:', result.pdfUrl);
      return 'Success! PDF: ' + result.pdfUrl;
    } else {
      console.log('❌ PDF was not generated');
      return 'Failed - No PDF generated';
    }

  } catch (error) {
    console.error('❌ Complete submission failed:', error);
    return 'Error: ' + error.toString();
  }
}

// Quick test to verify script is working
function quickTest() {
  console.log('Script is loaded and working!');
  console.log('Spreadsheet ID:', CONFIG.SPREADSHEET_ID);
  console.log('PDF Folder ID:', CONFIG.PDF_FOLDER_ID);
  console.log('Backup Email:', CONFIG.BACKUP_EMAIL);
  return 'Configuration verified!';
}