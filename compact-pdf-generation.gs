// ============================================
// COMPACT PDF GENERATION - FITS ON ONE PAGE
// Replace the generateCompletePDF function with this version
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