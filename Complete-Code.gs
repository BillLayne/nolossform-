// ============================================
// NoLossForm.com - Complete Google Apps Script
// VERSION: 3.2 - COMPACT PDF & ALL FIXES
// PLATFORM: NoLossForm.com
// LAST UPDATED: January 2025
// ============================================

// Configuration - WITH YOUR ACTUAL IDs
const CONFIG = {
  SPREADSHEET_ID: '1d03OMLbbTYc5ZvxYJ6GT9Ect_cWtD0DjCwkacXhgzBU',
  PDF_FOLDER_ID: '1r0k8FCgjPq28lz9KfKPIGYgo2y3JQM_N', // NO LOSS FORM STATEMENTS folder
  MASTER_FOLDER_ID: '1JVOhQg5gtPttV3qFy3lz3EguKRqOfH9O', // NO LOSS FORM MASTER folder
  SYSTEM_EMAIL: 'system@nolossform.com',
  SUPPORT_EMAIL: 'support@nolossform.com',
  BACKUP_EMAIL: 'Save@BillLayneInsurance.com', // Your backup email
  DEFAULT_TIMEZONE: 'America/New_York',
  PLATFORM_NAME: 'NoLossForm.com',
  PLATFORM_URL: 'https://nolossform.com'
};

// ============================================
// MAIN ENTRY POINT
// ============================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    console.log('=== INCOMING SUBMISSION ===');
    console.log('Customer Name:', data.insuredName);
    console.log('Agency:', data.agencyName || 'Direct Submission');
    console.log('Policy:', data.policyNumber);

    // Route based on action
    if (data.action === 'create_agency') {
      return handleAgencyCreation(data);
    } else if (data.action === 'test_connection') {
      return handleTestConnection();
    } else {
      return handleFormSubmission(data);
    }

  } catch (error) {
    console.error('doPost error:', error);
    return createResponse('error', 'Submission failed: ' + error.toString());
  }
}

// ============================================
// FORM SUBMISSION HANDLER
// ============================================

function handleFormSubmission(data) {
  try {
    const result = processSubmission(data);
    return createResponse('success', 'Form submitted successfully', {
      confirmationNumber: result.confirmationNumber,
      agencyName: result.agencyName,
      pdfUrl: result.pdfUrl
    });
  } catch (error) {
    console.error('Form submission error:', error);
    return createResponse('error', 'Failed to process submission: ' + error.toString());
  }
}

function processSubmission(data) {
  try {
    const confirmationNumber = generateConfirmationNumber();

    // FIXED: Properly handle field names
    const submissionData = {
      ...data,
      // Fix field name consistency
      insuredName: data.insuredName || data.customerName || data.name || '',
      agencyName: data.agencyName || data.hiddenAgencyName || data.agencyNameHidden || 'Direct Submission',
      agencyEmail: data.agencyEmail || data.hiddenAgencyEmail || '',
      agencyPhone: data.agencyPhone || data.hiddenAgencyPhone || '',
      agencyAddress: data.agencyAddress || data.hiddenAgencyAddress || '',
      agentName: data.agentName || data.hiddenAgentName || '',
      agentEmail: data.agentEmail || data.hiddenAgentEmail || '',
      confirmationNumber: confirmationNumber,
      submittedAt: new Date().toISOString(),
      timestamp: new Date().toLocaleString('en-US', {timeZone: CONFIG.DEFAULT_TIMEZONE})
    };

    console.log('Processing for:', submissionData.insuredName);
    console.log('Agency:', submissionData.agencyName);

    // Save to spreadsheet
    saveToSheet(submissionData, confirmationNumber);

    // Generate PDF - ALWAYS for signed statements
    let pdfUrl = '';
    if (data.signature || data.signatureUrl || data.noLossConfirmation || data.agreeTerms) {
      pdfUrl = generateCompletePDF(submissionData, confirmationNumber);
      console.log('PDF Generated:', pdfUrl);
    } else {
      console.log('No signature found, skipping PDF generation');
    }

    // Send notifications with PDF
    if (pdfUrl) {
      sendNotifications(submissionData, confirmationNumber, pdfUrl);
    } else {
      console.log('No PDF URL, sending notifications without attachment');
      sendNotifications(submissionData, confirmationNumber, '');
    }

    // Update analytics
    updateAnalytics(submissionData);

    return {
      confirmationNumber: confirmationNumber,
      agencyName: submissionData.agencyName,
      pdfUrl: pdfUrl
    };

  } catch (error) {
    console.error('Process submission error:', error);
    throw error;
  }
}

// ============================================
// SAVE TO GOOGLE SHEETS
// ============================================

function saveToSheet(data, confirmationNumber) {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName('Submissions');

    if (!sheet) {
      sheet = spreadsheet.insertSheet('Submissions');
      const headers = [
        'Timestamp', 'Confirmation #', 'Insured Name', 'Policy Number',
        'Insurance Company', 'Policy Type', 'Property Address', 'City',
        'State', 'ZIP', 'Email', 'Phone', 'Cancellation Date',
        'Reinstatement Date', 'Amount Paid', 'No Loss Confirmed',
        'Understands Terms', 'Comments', 'Signature Date', 'Has Signature',
        'Agency Name', 'Agency Email', 'Agency Phone', 'Agency Address',
        'Agent Name', 'Agent Email', 'IP Address', 'Browser Info'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    const row = [
      data.timestamp,
      confirmationNumber,
      data.insuredName || '',
      data.policyNumber || '',
      data.insuranceCompany || '',
      data.policyType || '',
      data.propertyAddress || '',
      data.city || '',
      data.state || '',
      data.zipCode || '',
      data.email || '',
      data.phone || '',
      data.cancellationDate || data.lapseStartDate || '',
      data.reinstatementDate || data.lapseEndDate || '',
      data.amountPaid || '',
      data.noLossConfirmation ? 'Yes' : 'No',
      data.understandReinstatement || data.agreeTerms || data.noLossConfirmation ? 'Yes' : 'No',
      data.additionalComments || '',
      data.signatureDate || new Date().toLocaleDateString(),
      (data.signature || data.signatureUrl) ? 'Yes' : 'No',
      data.agencyName || 'Direct Submission',
      data.agencyEmail || '',
      data.agencyPhone || '',
      data.agencyAddress || '',
      data.agentName || '',
      data.agentEmail || '',
      data.ipAddress || '',
      data.browserInfo || ''
    ];

    sheet.appendRow(row);
    console.log('✓ Saved to sheet for:', data.insuredName);

  } catch (error) {
    console.error('Save to sheet error:', error);
    throw error;
  }
}

// ============================================
// COMPACT PDF GENERATION - FITS ON ONE PAGE
// ============================================

function generateCompletePDF(data, confirmationNumber) {
  try {
    // Get customer name
    const customerName = data.insuredName || data.customerName || data.name || 'Customer';

    // FIXED: Use the INSURANCE AGENCY name (not the insurance company)
    const agencyName = data.agencyName && data.agencyName !== 'Direct Submission'
      ? data.agencyName.toUpperCase()
      : 'NOLOSSFORM.COM';

    const agencyPhone = data.agencyPhone || '';
    const agencyEmail = data.agencyEmail || '';

    console.log('=== GENERATING PDF ===');
    console.log('Customer:', customerName);
    console.log('Agency:', agencyName);
    console.log('Confirmation:', confirmationNumber);

    // Create document
    const doc = DocumentApp.create(`NoLoss_${confirmationNumber}_${customerName.replace(/[^a-zA-Z0-9]/g, '_')}`);
    const body = doc.getBody();

    // Clear and set SMALLER margins for compact layout
    body.clear();
    body.setMarginTop(20);
    body.setMarginBottom(20);
    body.setMarginLeft(36);
    body.setMarginRight(36);

    // ===== COMPACT HEADER =====
    const header = body.appendParagraph(agencyName);
    header.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    header.setFontSize(12);  // Reduced from 14
    header.setBold(true);
    header.setForegroundColor('#1e3c72');
    header.setSpacingAfter(4);  // Reduced spacing

    // Title
    const title = body.appendParagraph('STATEMENT OF NO LOSS - REINSTATEMENT REQUEST');
    title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    title.setFontSize(10);  // Reduced from 12
    title.setBold(true);
    title.setSpacingAfter(2);

    // Confirmation Number
    const confirmText = body.appendParagraph(`Confirmation #: ${confirmationNumber}`);
    confirmText.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    confirmText.setFontSize(9);  // Reduced from 11
    confirmText.setBold(true);
    confirmText.setForegroundColor('#0066cc');
    confirmText.setSpacingAfter(6);  // Reduced spacing

    // Divider line
    body.appendHorizontalRule();

    // ===== COMBINED INFORMATION TABLE =====
    // Combine Policy and Insured info into one compact table
    const infoTable = body.appendTable();

    // Row 1: Insured Name and Policy Number
    const row1 = infoTable.appendTableRow();
    const cell1a = row1.appendTableCell('INSURED:');
    cell1a.getChild(0).asParagraph().setBold(true).setFontSize(9);
    const cell1b = row1.appendTableCell(customerName.toUpperCase());
    cell1b.getChild(0).asParagraph().setFontSize(9);
    const cell1c = row1.appendTableCell('POLICY #:');
    cell1c.getChild(0).asParagraph().setBold(true).setFontSize(9);
    const cell1d = row1.appendTableCell(data.policyNumber || 'N/A');
    cell1d.getChild(0).asParagraph().setFontSize(9);

    // Row 2: Insurance Company and Policy Type
    const row2 = infoTable.appendTableRow();
    const cell2a = row2.appendTableCell('CARRIER:');
    cell2a.getChild(0).asParagraph().setBold(true).setFontSize(9);
    const cell2b = row2.appendTableCell(data.insuranceCompany || 'N/A');
    cell2b.getChild(0).asParagraph().setFontSize(9);
    const cell2c = row2.appendTableCell('TYPE:');
    cell2c.getChild(0).asParagraph().setBold(true).setFontSize(9);
    const cell2d = row2.appendTableCell(data.policyType || 'Auto');
    cell2d.getChild(0).asParagraph().setFontSize(9);

    // Row 3: Dates
    const row3 = infoTable.appendTableRow();
    const cell3a = row3.appendTableCell('LAPSE DATE:');
    cell3a.getChild(0).asParagraph().setBold(true).setFontSize(9);
    const cell3b = row3.appendTableCell(formatDate(data.cancellationDate || data.lapseStartDate));
    cell3b.getChild(0).asParagraph().setFontSize(9);
    const cell3c = row3.appendTableCell('REINSTATE:');
    cell3c.getChild(0).asParagraph().setBold(true).setFontSize(9);
    const cell3d = row3.appendTableCell(formatDate(data.reinstatementDate || data.lapseEndDate));
    cell3d.getChild(0).asParagraph().setFontSize(9);

    // Row 4: Contact Info
    const row4 = infoTable.appendTableRow();
    const cell4a = row4.appendTableCell('PHONE:');
    cell4a.getChild(0).asParagraph().setBold(true).setFontSize(9);
    const cell4b = row4.appendTableCell(data.phone || 'N/A');
    cell4b.getChild(0).asParagraph().setFontSize(9);
    const cell4c = row4.appendTableCell('EMAIL:');
    cell4c.getChild(0).asParagraph().setBold(true).setFontSize(9);
    const cell4d = row4.appendTableCell(data.email || 'N/A');
    cell4d.getChild(0).asParagraph().setFontSize(9);

    // Remove table borders
    const tableAttr = infoTable.getAttributes();
    tableAttr[DocumentApp.Attribute.BORDER_WIDTH] = 0;
    infoTable.setAttributes(tableAttr);

    // Small spacing after table
    body.appendParagraph('').setFontSize(6);

    // Divider
    body.appendHorizontalRule();

    // ===== COMPACT STATEMENT OF NO LOSS =====
    const statementTitle = body.appendParagraph('STATEMENT OF NO LOSS');
    statementTitle.setBold(true);
    statementTitle.setFontSize(10);  // Reduced from 11
    statementTitle.setForegroundColor('#1e3c72');
    statementTitle.setSpacingBefore(6);
    statementTitle.setSpacingAfter(4);

    // CONDENSED legal text - same content but smaller font
    const legalText = body.appendParagraph(
      `I, ${customerName.toUpperCase()}, state that neither I nor any other person covered by this policy has had a claim or loss or been involved in an accident ` +
      `since the cancellation or expiration of the policy (otherwise known as the "no loss period") wherein this policy, including any and all coverages endorsed upon or made part of the policy may apply. ` +
      `In addition, if this reinstatement is for a personal or commercial auto, motorcycle, or RV policy, I certify that I have disclosed the current garaging location and use of all insured vehicles ` +
      `including if any such vehicle is used to deliver food or goods, to transport people for compensation, or for any other business purpose. I have also disclosed household members who are age 14 or older, ` +
      `and all persons who regularly drive any vehicle insured under this policy. I understand that this insurance company is relying solely upon this Statement of No Loss all of which is material, ` +
      `as an inducement to reinstate my policy with no lapse in coverage. I further understand that if a claim, loss, or accident has occurred during the no loss period, or if I failed to disclose ` +
      `the current garaging location and primary use of all vehicles insured under this policy, all persons who regularly drive these vehicles, and all members of my household who are age 14 or older, ` +
      `the reinstatement is null and void, my policy remains cancelled and no insurance coverage shall be provided. I agree that if my check or other payment for this reinstatement is not honored for any reason, ` +
      `the reinstatement is null and void and no coverage shall exist under this policy. I agree to pay a reinstatement fee and late fee (if applicable) in addition to the premium required to reinstate my policy. ` +
      `My payment will be applied first to the reinstatement and late fee and the remainder to the premium. It is a crime to knowingly provide false, incomplete, or misleading information to an insurance ` +
      `company for the purpose of defrauding the company. Penalties include imprisonment, fines, and denial of insurance benefits.`
    );
    legalText.setFontSize(8);  // Smaller font size
    legalText.setSpacingAfter(8);

    // Agreement checkbox representation
    const agreementText = body.appendParagraph('☑ I understand and agree to all statements, terms, and conditions above.');
    agreementText.setFontSize(9);
    agreementText.setBold(true);
    agreementText.setSpacingAfter(8);

    // ===== COMPACT SIGNATURE SECTION =====
    body.appendHorizontalRule();

    // Signature title
    const sigTitle = body.appendParagraph('ELECTRONIC SIGNATURE');
    sigTitle.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    sigTitle.setBold(true);
    sigTitle.setFontSize(10);  // Reduced from 11
    sigTitle.setForegroundColor('#1e3c72');
    sigTitle.setSpacingBefore(6);
    sigTitle.setSpacingAfter(6);

    // Insert signature image if available
    if ((data.signature || data.signatureUrl) && (data.signature || data.signatureUrl).startsWith('data:image')) {
      try {
        const signatureData = data.signature || data.signatureUrl;
        const base64Data = signatureData.split(',')[1];
        const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), 'image/png', 'signature.png');
        const image = body.appendImage(blob);
        image.setHeight(40);  // Smaller signature
        image.setWidth(150);  // Smaller signature
        const parent = image.getParent();
        parent.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      } catch (e) {
        console.error('Signature image error:', e);
        const sigLine = body.appendParagraph('[Electronic Signature on File]');
        sigLine.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        sigLine.setItalic(true);
        sigLine.setFontSize(9);
      }
    } else {
      const sigLine = body.appendParagraph('[Electronic Signature on File]');
      sigLine.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      sigLine.setItalic(true);
      sigLine.setFontSize(9);
    }

    // Signature line with name and date on same line
    const sigInfo = body.appendParagraph(`${customerName} - Signed electronically on ${data.timestamp || new Date().toLocaleDateString()}`);
    sigInfo.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    sigInfo.setFontSize(8);
    sigInfo.setItalic(true);
    sigInfo.setSpacingAfter(8);

    // ===== FOOTER =====
    body.appendHorizontalRule();

    // Agency contact info at bottom
    if (agencyPhone || agencyEmail) {
      const footerText = body.appendParagraph(
        `${agencyName} | ${agencyPhone} | ${agencyEmail}`
      );
      footerText.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      footerText.setFontSize(8);
      footerText.setForegroundColor('#666666');
    }

    // Platform credit
    const creditText = body.appendParagraph('Generated via NoLossForm.com');
    creditText.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    creditText.setFontSize(7);
    creditText.setForegroundColor('#999999');

    // Save and convert to PDF
    doc.saveAndClose();

    // Convert to PDF
    const pdfBlob = DriveApp.getFileById(doc.getId()).getAs('application/pdf');

    // Save to folder
    const folder = DriveApp.getFolderById(CONFIG.PDF_FOLDER_ID);
    const pdfFile = folder.createFile(pdfBlob);

    // Name the file
    const safeAgencyName = agencyName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    const safeCustomerName = customerName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    const fileName = `NoLoss_${confirmationNumber}_${safeCustomerName}.pdf`;
    pdfFile.setName(fileName);

    // Make sure file is shared properly
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Delete temporary doc
    DriveApp.getFileById(doc.getId()).setTrashed(true);

    const pdfUrl = pdfFile.getUrl();
    console.log('✓ PDF created successfully');
    console.log('✓ PDF URL:', pdfUrl);
    console.log('✓ File name:', fileName);

    return pdfUrl;

  } catch (error) {
    console.error('PDF generation error:', error);
    console.error('Error details:', error.toString());
    console.error('Stack trace:', error.stack);
    console.error('Data received:', JSON.stringify(data));
    return '';
  }
}

// ============================================
// EMAIL NOTIFICATIONS
// ============================================

function sendNotifications(data, confirmationNumber, pdfUrl) {
  try {
    const customerName = data.insuredName || data.customerName || 'Customer';
    const agencyName = data.agencyName && data.agencyName !== 'Direct Submission'
      ? data.agencyName
      : CONFIG.PLATFORM_NAME;

    const agencyEmail = data.agencyEmail || data.agentEmail || '';
    const agencyPhone = data.agencyPhone || '';

    console.log('=== SENDING NOTIFICATIONS ===');
    console.log('Customer:', customerName);
    console.log('Agency:', agencyName);
    console.log('Agency Email:', agencyEmail);
    console.log('PDF URL:', pdfUrl);

    // Send to agency/agent if email provided
    if (agencyEmail) {
      sendAgencyNotification(data, confirmationNumber, pdfUrl, agencyName, agencyEmail, customerName);
    }

    // Send system backup
    sendSystemNotification(data, confirmationNumber, pdfUrl, agencyName, customerName);

    // Send to customer if email provided
    if (data.email) {
      sendCustomerNotification(data, confirmationNumber, pdfUrl, agencyName, agencyPhone, customerName);
    }

    // Send to your backup email for ALL submissions
    if (CONFIG.BACKUP_EMAIL) {
      sendBackupCopy(data, confirmationNumber, pdfUrl, agencyName, customerName);
    }

  } catch (error) {
    console.error('Email notification error:', error);
  }
}

function sendAgencyNotification(data, confirmationNumber, pdfUrl, agencyName, agencyEmail, customerName) {
  try {
    const subject = `New Statement of No Loss - ${customerName} - ${confirmationNumber}`;

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e3c72; color: white; padding: 20px; text-align: center;">
          <h2>${agencyName}</h2>
          <p>New Statement of No Loss Submitted</p>
          <p style="font-size: 18px;">Confirmation #${confirmationNumber}</p>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h3 style="color: #1e3c72;">POLICY INFORMATION</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; width: 40%;"><strong>Insurance Company:</strong></td><td>${data.insuranceCompany || 'N/A'}</td></tr>
            <tr><td style="padding: 8px;"><strong>Policy Number:</strong></td><td>${data.policyNumber || 'N/A'}</td></tr>
            <tr><td style="padding: 8px;"><strong>Policy Type:</strong></td><td>${data.policyType || 'Auto'}</td></tr>
            <tr><td style="padding: 8px;"><strong>Amount Paid:</strong></td><td>${data.amountPaid || 'N/A'}</td></tr>
            <tr><td style="padding: 8px;"><strong>Cancellation Date:</strong></td><td>${formatDate(data.cancellationDate || data.lapseStartDate)}</td></tr>
            <tr><td style="padding: 8px;"><strong>Reinstatement Date:</strong></td><td>${formatDate(data.reinstatementDate || data.lapseEndDate)}</td></tr>
          </table>

          <h3 style="color: #1e3c72; margin-top: 20px;">INSURED INFORMATION</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; width: 40%;"><strong>Insured Name:</strong></td><td>${customerName}</td></tr>
            <tr><td style="padding: 8px;"><strong>Phone:</strong></td><td>${data.phone || 'N/A'}</td></tr>
            <tr><td style="padding: 8px;"><strong>Email:</strong></td><td>${data.email || 'N/A'}</td></tr>
            ${data.propertyAddress ? `<tr><td style="padding: 8px;"><strong>Property Address:</strong></td><td>${data.propertyAddress}</td></tr>` : ''}
            ${data.city ? `<tr><td style="padding: 8px;"><strong>City, State ZIP:</strong></td><td>${data.city}, ${data.state} ${data.zipCode}</td></tr>` : ''}
          </table>

          ${pdfUrl ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${pdfUrl}" style="background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px; font-weight: bold;">📄 View PDF Document</a>
          </div>
          ` : ''}

          ${data.agentName ? `<p style="margin-top: 20px;"><strong>Submitted by Agent:</strong> ${data.agentName}</p>` : ''}
          <p style="color: #666; font-size: 12px; margin-top: 20px;">Submitted: ${data.timestamp || new Date().toLocaleString()}</p>
        </div>
        <div style="padding: 15px; text-align: center; background: #333; color: white;">
          <p style="margin: 0; font-size: 12px;">Powered by ${CONFIG.PLATFORM_NAME}</p>
        </div>
      </body>
      </html>
    `;

    // Send with PDF attachment if available
    if (pdfUrl) {
      try {
        const pdfFile = DriveApp.getFileById(getFileIdFromUrl(pdfUrl));
        MailApp.sendEmail({
          to: agencyEmail,
          subject: subject,
          htmlBody: htmlBody,
          attachments: [pdfFile.getBlob()]
        });
      } catch (e) {
        console.error('Error attaching PDF:', e);
        MailApp.sendEmail({
          to: agencyEmail,
          subject: subject,
          htmlBody: htmlBody
        });
      }
    } else {
      MailApp.sendEmail({
        to: agencyEmail,
        subject: subject,
        htmlBody: htmlBody
      });
    }

    console.log('✓ Agency notification sent to:', agencyEmail);

  } catch (error) {
    console.error('Agency email error:', error);
  }
}

function sendCustomerNotification(data, confirmationNumber, pdfUrl, agencyName, agencyPhone, customerName) {
  try {
    const subject = `${agencyName} - Statement of No Loss Confirmation`;

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e3c72; color: white; padding: 20px; text-align: center;">
          <h2>${agencyName}</h2>
          <p>Statement of No Loss - Confirmation</p>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <p>Dear ${customerName},</p>

          <p>We have successfully received your Statement of No Loss.</p>

          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4CAF50;">
            <h3 style="margin-top: 0; color: #1e3c72;">Confirmation Details</h3>
            <p><strong>Confirmation Number:</strong> ${confirmationNumber}</p>
            <p><strong>Policy Number:</strong> ${data.policyNumber || 'N/A'}</p>
            <p><strong>Insurance Company:</strong> ${data.insuranceCompany || 'N/A'}</p>
            <p><strong>Date Submitted:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <p>This statement confirms that no loss, damage, or claim occurred during your coverage lapse period from <strong>${formatDate(data.cancellationDate || data.lapseStartDate)}</strong> to <strong>${formatDate(data.reinstatementDate || data.lapseEndDate)}</strong>.</p>

          <p>Your insurance carrier will review this statement for policy reinstatement.</p>

          ${pdfUrl ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${pdfUrl}" style="background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px; font-weight: bold;">📄 Download Your Statement</a>
          </div>
          ` : ''}

          <p style="margin-top: 30px;">If you have any questions, please contact ${agencyPhone ? `us at <strong>${agencyPhone}</strong>` : 'your agent'}.</p>

          <p>Thank you,<br>
          <strong>${agencyName}</strong></p>
        </div>
        <div style="padding: 15px; text-align: center; background: #333; color: white;">
          <p style="margin: 0; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `;

    MailApp.sendEmail({
      to: data.email,
      subject: subject,
      htmlBody: htmlBody
    });

    console.log('✓ Customer notification sent to:', data.email);

  } catch (error) {
    console.error('Customer email error:', error);
  }
}

function sendSystemNotification(data, confirmationNumber, pdfUrl, agencyName, customerName) {
  try {
    const subject = `[SYSTEM] NoLoss - ${agencyName} - ${confirmationNumber}`;
    const body = `
      === SYSTEM NOTIFICATION ===
      Agency: ${agencyName}
      Confirmation: ${confirmationNumber}
      Customer: ${customerName}
      Policy: ${data.policyNumber}
      Insurance: ${data.insuranceCompany || 'N/A'}
      PDF URL: ${pdfUrl || 'Not generated'}
      Timestamp: ${new Date().toISOString()}
      ==========================
    `;

    if (CONFIG.SYSTEM_EMAIL) {
      MailApp.sendEmail({
        to: CONFIG.SYSTEM_EMAIL,
        subject: subject,
        body: body
      });
    }
  } catch (error) {
    console.error('System notification error:', error);
  }
}

function sendBackupCopy(data, confirmationNumber, pdfUrl, agencyName, customerName) {
  try {
    const subject = `[BACKUP] Statement of No Loss - ${confirmationNumber} - ${agencyName}`;

    // Send with PDF attachment if available
    if (pdfUrl) {
      try {
        const pdfFile = DriveApp.getFileById(getFileIdFromUrl(pdfUrl));
        MailApp.sendEmail({
          to: CONFIG.BACKUP_EMAIL,
          subject: subject,
          body: `Backup copy of Statement of No Loss\n\nAgency: ${agencyName}\nCustomer: ${customerName}\nPolicy: ${data.policyNumber}\nPDF: ${pdfUrl}`,
          attachments: [pdfFile.getBlob()]
        });
      } catch (e) {
        MailApp.sendEmail({
          to: CONFIG.BACKUP_EMAIL,
          subject: subject,
          body: `Backup copy of Statement of No Loss\n\nAgency: ${agencyName}\nCustomer: ${customerName}\nPolicy: ${data.policyNumber}\nPDF: ${pdfUrl}`
        });
      }
    } else {
      MailApp.sendEmail({
        to: CONFIG.BACKUP_EMAIL,
        subject: subject,
        body: `Backup copy of Statement of No Loss\n\nAgency: ${agencyName}\nCustomer: ${customerName}\nPolicy: ${data.policyNumber}\nNo PDF generated`
      });
    }

    console.log('✓ Backup sent to:', CONFIG.BACKUP_EMAIL);

  } catch (error) {
    console.error('Backup email error:', error);
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateConfirmationNumber() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `NOL-${year}${month}${day}-${random}`;
}

function generateAgencyId() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `AGC-${dateStr}-${random}`;
}

function generateApiKey(agencyName) {
  const prefix = agencyName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}-API-${random}`;
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
  } catch (e) {
    return dateString;
  }
}

function getFileIdFromUrl(url) {
  try {
    const match = url.match(/[-\w]{25,}/);
    return match ? match[0] : null;
  } catch (e) {
    return null;
  }
}

function createResponse(status, message, data = {}) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: status,
      message: message,
      ...data
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

function updateAnalytics(data) {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName('Analytics');

    if (!sheet) {
      sheet = spreadsheet.insertSheet('Analytics');
      const headers = ['Date', 'Time', 'Agency', 'Customer', 'Policy', 'Confirmation'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      new Date().toLocaleDateString(),
      new Date().toLocaleTimeString(),
      data.agencyName || 'Direct',
      data.insuredName || '',
      data.policyNumber || '',
      data.confirmationNumber || ''
    ]);

  } catch (error) {
    console.error('Analytics update error:', error);
  }
}

function handleAgencyCreation(data) {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName('Agencies');

    if (!sheet) {
      sheet = spreadsheet.insertSheet('Agencies');
      const headers = [
        'Agency ID', 'Agency Name', 'Contact Name', 'Contact Email',
        'Contact Phone', 'Website', 'Address', 'Plan', 'Status',
        'Trial Ends', 'Created Date', 'API Key'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    const agencyId = generateAgencyId();
    const apiKey = generateApiKey(data.agencyName);
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    const row = [
      agencyId,
      data.agencyName,
      data.contactName,
      data.contactEmail,
      data.contactPhone,
      data.website || '',
      data.address || '',
      data.plan || 'TRIAL',
      'ACTIVE',
      trialEndDate.toLocaleDateString(),
      new Date().toLocaleDateString(),
      apiKey
    ];

    sheet.appendRow(row);

    return createResponse('success', 'Agency created successfully', {
      agencyId: agencyId,
      apiKey: apiKey
    });

  } catch (error) {
    console.error('Agency creation error:', error);
    return createResponse('error', 'Failed to create agency');
  }
}

function handleTestConnection() {
  return createResponse('success', 'Connection successful', {
    timestamp: new Date().toISOString(),
    version: '3.2',
    platform: CONFIG.PLATFORM_NAME
  });
}

// ============================================
// TEST FUNCTIONS
// ============================================

// Quick test to verify script is working
function quickTest() {
  console.log('Script is loaded and working!');
  console.log('Spreadsheet ID:', CONFIG.SPREADSHEET_ID);
  console.log('PDF Folder ID:', CONFIG.PDF_FOLDER_ID);
  console.log('Backup Email:', CONFIG.BACKUP_EMAIL);
  return 'Configuration verified!';
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
    agencyName: 'Bill Layne Insurance Agency',
    agencyPhone: '(336) 555-1234',
    agencyEmail: 'Save@BillLayneInsurance.com',
    signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
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