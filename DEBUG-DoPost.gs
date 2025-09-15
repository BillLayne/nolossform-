// TEMPORARY DEBUG VERSION OF doPost
// Replace your current doPost function with this temporarily to see what data is coming from the form

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // ===== DEBUG LOGGING =====
    console.log('=== INCOMING SUBMISSION (DEBUG) ===');
    console.log('RAW DATA RECEIVED:', JSON.stringify(data, null, 2));

    console.log('\n=== CHECKING CRITICAL FIELDS ===');

    // Check customer info
    console.log('CUSTOMER INFO:');
    console.log('- insuredName:', data.insuredName || 'MISSING');
    console.log('- email:', data.email || 'MISSING');
    console.log('- phone:', data.phone || 'MISSING');

    // Check address fields specifically
    console.log('\nCUSTOMER ADDRESS:');
    console.log('- propertyAddress:', data.propertyAddress || 'MISSING');
    console.log('- city:', data.city || 'MISSING');
    console.log('- state:', data.state || 'MISSING');
    console.log('- zipCode:', data.zipCode || 'MISSING');

    // Check if ANY address field exists
    const hasAnyAddress = data.propertyAddress || data.city || data.state || data.zipCode;
    if (!hasAnyAddress) {
      console.log('⚠️ WARNING: NO ADDRESS FIELDS FOUND IN SUBMISSION!');
    } else {
      console.log('✓ Address fields found');
    }

    // Check agency info
    console.log('\nAGENCY INFO:');
    console.log('- agencyName:', data.agencyName || 'MISSING');
    console.log('- agencyAddress:', data.agencyAddress || 'MISSING');
    console.log('- agencyEmail:', data.agencyEmail || 'MISSING');
    console.log('- agencyPhone:', data.agencyPhone || 'MISSING');

    // Check policy info
    console.log('\nPOLICY INFO:');
    console.log('- policyNumber:', data.policyNumber || 'MISSING');
    console.log('- insuranceCompany:', data.insuranceCompany || 'MISSING');
    console.log('- policyType:', data.policyType || 'MISSING');

    console.log('\n=== END DEBUG INFO ===\n');
    // ===== END DEBUG LOGGING =====

    // Route based on action (normal processing)
    if (data.action === 'create_agency') {
      return handleAgencyCreation(data);
    } else if (data.action === 'test_connection') {
      return handleTestConnection();
    } else {
      // Before processing, let's make sure we have the address
      console.log('Processing submission with address check...');

      // Log what processSubmission will receive
      console.log('Data being sent to processSubmission:');
      console.log('- Has propertyAddress?', !!data.propertyAddress);
      console.log('- Has city?', !!data.city);
      console.log('- Has state?', !!data.state);
      console.log('- Has zipCode?', !!data.zipCode);

      return handleFormSubmission(data);
    }

  } catch (error) {
    console.error('doPost error:', error);
    return createResponse('error', 'Submission failed: ' + error.toString());
  }
}

// Also add this function to test a manual submission
function testManualSubmission() {
  // This simulates exactly what the form should send
  const simulatedFormData = {
    // Customer fields (from form inputs)
    insuredName: 'Test Customer',
    email: 'test@example.com',
    phone: '(555) 123-4567',
    propertyAddress: '789 Test Avenue',  // THIS SHOULD BE SENT
    city: 'Raleigh',                     // THIS SHOULD BE SENT
    state: 'NC',                          // THIS SHOULD BE SENT
    zipCode: '27601',                     // THIS SHOULD BE SENT

    // Policy fields
    policyNumber: 'POL-123456',
    insuranceCompany: 'Test Insurance',
    policyType: 'Auto',
    amountPaid: '$300.00',
    cancellationDate: '2025-01-10',
    reinstatementDate: '2025-01-20',

    // Agency fields (from hidden inputs)
    agencyName: 'Bill Layne Insurance Agency',
    agencyAddress: '456 Agency St, Elkin NC 28621',
    agencyEmail: 'Save@BillLayneInsurance.com',
    agencyPhone: '(336) 555-1234',

    // Other required fields
    signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    noLossConfirmation: true,
    submittedAt: new Date().toISOString(),
    ipAddress: 'Test IP',
    browserInfo: 'Test Browser'
  };

  console.log('=== TESTING MANUAL SUBMISSION ===');
  console.log('Sending data with all address fields...');

  // Create a mock event object
  const mockEvent = {
    postData: {
      contents: JSON.stringify(simulatedFormData)
    }
  };

  // Call doPost with the mock data
  const result = doPost(mockEvent);

  console.log('Result:', result.getContent());

  return 'Check logs for details';
}