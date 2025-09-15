// DEBUG TEST FUNCTION
// Add this to your Google Apps Script to see what data is being received

function debugIncomingData() {
  // This simulates what your form sends
  const testData = {
    // These come from the form directly
    insuredName: 'John Smith',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    propertyAddress: '456 Oak Street',
    city: 'Charlotte',
    state: 'NC',
    zipCode: '28205',

    // These come from hidden fields
    agencyName: 'Bill Layne Insurance Agency',
    agencyAddress: '123 Main St, Elkin NC 28621',
    agencyEmail: 'Save@BillLayneInsurance.com',
    agencyPhone: '(336) 555-1234',

    // Policy info
    policyNumber: 'TEST-12345',
    insuranceCompany: 'Test Insurance Co',
    policyType: 'Auto',
    amountPaid: '$250.00',
    cancellationDate: '2025-01-01',
    reinstatementDate: '2025-01-15',

    // Signature
    signature: 'data:image/png;base64,test',
    noLossConfirmation: true
  };

  console.log('=== DEBUG: Checking what data contains ===');
  console.log('Customer Address Fields:');
  console.log('- propertyAddress:', testData.propertyAddress);
  console.log('- city:', testData.city);
  console.log('- state:', testData.state);
  console.log('- zipCode:', testData.zipCode);

  console.log('\nAgency Fields:');
  console.log('- agencyName:', testData.agencyName);
  console.log('- agencyAddress:', testData.agencyAddress);
  console.log('- agencyEmail:', testData.agencyEmail);
  console.log('- agencyPhone:', testData.agencyPhone);

  // Test the PDF generation with this data
  const confirmationNumber = 'DEBUG-' + Date.now();

  try {
    // Add the signature time
    testData.signatureTime = new Date();

    const pdfUrl = generateCompletePDF(testData, confirmationNumber);
    console.log('\n=== PDF Generated Successfully ===');
    console.log('PDF URL:', pdfUrl);

    // Open the PDF and check if address appears
    console.log('\nCheck the PDF to see if the customer address appears in Row 2 of the table');
    console.log('Expected to see: ADDRESS: 456 Oak Street, Charlotte NC 28205');

    return pdfUrl;
  } catch (error) {
    console.error('PDF Generation Failed:', error);
    return 'Error: ' + error.toString();
  }
}

// Function to test with actual form submission data
function testActualFormData(e) {
  // This would be called by doPost to debug real submissions
  const data = JSON.parse(e.postData.contents);

  console.log('=== ACTUAL FORM DATA RECEIVED ===');
  console.log('Full data object:', JSON.stringify(data, null, 2));

  console.log('\n=== Checking Address Fields ===');
  console.log('propertyAddress:', data.propertyAddress || 'NOT FOUND');
  console.log('city:', data.city || 'NOT FOUND');
  console.log('state:', data.state || 'NOT FOUND');
  console.log('zipCode:', data.zipCode || 'NOT FOUND');

  if (!data.propertyAddress && !data.city && !data.state && !data.zipCode) {
    console.log('\n⚠️ WARNING: No address fields found in submission!');
    console.log('Make sure the form is sending these fields.');
  }

  return data;
}

// Add this modified doPost to debug incoming data
function doPostDebug(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Log everything we receive
    console.log('=== DEBUG: Raw POST Data ===');
    console.log(JSON.stringify(data, null, 2));

    // Check specifically for address fields
    console.log('\n=== Address Fields Check ===');
    const addressFields = ['propertyAddress', 'city', 'state', 'zipCode'];
    addressFields.forEach(field => {
      if (data[field]) {
        console.log(`✓ ${field}: ${data[field]}`);
      } else {
        console.log(`✗ ${field}: MISSING`);
      }
    });

    // Process normally
    return handleFormSubmission(data);

  } catch (error) {
    console.error('Debug doPost error:', error);
    return createResponse('error', 'Submission failed: ' + error.toString());
  }
}