// ============================================
// ULTRA COMPACT PDF - GUARANTEED ONE PAGE
// Replace only the generateCompletePDF function with this version
// ============================================

function generateCompletePDF(data, confirmationNumber) {
  try {
    // Get customer name
    const customerName = data.insuredName || data.customerName || data.name || 'Customer';

    // Use the INSURANCE AGENCY name (not the insurance company)
    const agencyName = data.agencyName && data.agencyName !== 'Direct Submission'
      ? data.agencyName.toUpperCase()
      : 'NOLOSSFORM.COM';

    const agencyPhone = data.agencyPhone || '';
    const agencyEmail = data.agencyEmail || '';
    const agencyAddress = data.agencyAddress || '';

    console.log('=== GENERATING PDF ===');
    console.log('Customer:', customerName);
    console.log('Agency:', agencyName);
    console.log('Confirmation:', confirmationNumber);

    // Create document
    const doc = DocumentApp.create(`NoLoss_${confirmationNumber}_${customerName.replace(/[^a-zA-Z0-9]/g, '_')}`);
    const body = doc.getBody();

    // Clear and set MINIMAL margins for maximum space
    body.clear();
    body.setMarginTop(15);  // Further reduced
    body.setMarginBottom(15);  // Further reduced
    body.setMarginLeft(30);  // Further reduced
    body.setMarginRight(30);  // Further reduced

    // ===== ULTRA COMPACT HEADER WITH AGENCY INFO =====
    const header = body.appendParagraph(agencyName);
    header.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    header.setFontSize(11);  // Reduced from 12
    header.setBold(true);
    header.setForegroundColor('#1e3c72');
    header.setSpacingAfter(2);  // Minimal spacing

    // Add agency contact info right in header if available
    if (agencyPhone || agencyEmail) {
      const agencyContact = body.appendParagraph(
        [agencyPhone, agencyEmail].filter(Boolean).join(' | ')
      );
      agencyContact.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      agencyContact.setFontSize(8);  // Small font
      agencyContact.setForegroundColor('#666666');
      agencyContact.setSpacingAfter(2);
    }

    // Title on same line as confirmation
    const titleAndConfirm = body.appendParagraph('STATEMENT OF NO LOSS - REINSTATEMENT REQUEST | Confirmation #: ' + confirmationNumber);
    titleAndConfirm.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    titleAndConfirm.setFontSize(9);  // Reduced from 10
    titleAndConfirm.setBold(true);
    titleAndConfirm.setSpacingAfter(4);  // Minimal spacing

    // Single thin line
    body.appendHorizontalRule();

    // ===== ULTRA COMPACT INFO TABLE =====
    const infoTable = body.appendTable();

    // Row 1: Insured Name and Policy Number
    const row1 = infoTable.appendTableRow();
    row1.appendTableCell('INSURED:').getChild(0).asParagraph().setBold(true).setFontSize(8);
    row1.appendTableCell(customerName.toUpperCase()).getChild(0).asParagraph().setFontSize(8);
    row1.appendTableCell('POLICY:').getChild(0).asParagraph().setBold(true).setFontSize(8);
    row1.appendTableCell(data.policyNumber || 'N/A').getChild(0).asParagraph().setFontSize(8);

    // Row 2: Company and Type
    const row2 = infoTable.appendTableRow();
    row2.appendTableCell('CARRIER:').getChild(0).asParagraph().setBold(true).setFontSize(8);
    row2.appendTableCell(data.insuranceCompany || 'N/A').getChild(0).asParagraph().setFontSize(8);
    row2.appendTableCell('TYPE:').getChild(0).asParagraph().setBold(true).setFontSize(8);
    row2.appendTableCell(data.policyType || 'Auto').getChild(0).asParagraph().setFontSize(8);

    // Row 3: Dates
    const row3 = infoTable.appendTableRow();
    row3.appendTableCell('LAPSE:').getChild(0).asParagraph().setBold(true).setFontSize(8);
    row3.appendTableCell(formatDate(data.cancellationDate || data.lapseStartDate)).getChild(0).asParagraph().setFontSize(8);
    row3.appendTableCell('REINSTATE:').getChild(0).asParagraph().setBold(true).setFontSize(8);
    row3.appendTableCell(formatDate(data.reinstatementDate || data.lapseEndDate)).getChild(0).asParagraph().setFontSize(8);

    // Row 4: Contact Info - FIXED to show phone and email
    const row4 = infoTable.appendTableRow();
    row4.appendTableCell('PHONE:').getChild(0).asParagraph().setBold(true).setFontSize(8);
    row4.appendTableCell(data.phone || data.customerPhone || 'N/A').getChild(0).asParagraph().setFontSize(8);
    row4.appendTableCell('EMAIL:').getChild(0).asParagraph().setBold(true).setFontSize(8);
    row4.appendTableCell(data.email || data.customerEmail || 'N/A').getChild(0).asParagraph().setFontSize(8);

    // Remove table borders
    const tableAttr = infoTable.getAttributes();
    tableAttr[DocumentApp.Attribute.BORDER_WIDTH] = 0;
    infoTable.setAttributes(tableAttr);

    // Tiny spacing
    body.appendParagraph('').setFontSize(3);
    body.appendHorizontalRule();

    // ===== ULTRA COMPACT STATEMENT =====
    const statementTitle = body.appendParagraph('STATEMENT OF NO LOSS');
    statementTitle.setBold(true);
    statementTitle.setFontSize(9);  // Reduced from 10
    statementTitle.setForegroundColor('#1e3c72');
    statementTitle.setSpacingBefore(3);
    statementTitle.setSpacingAfter(3);

    // ULTRA CONDENSED legal text - even smaller font
    const legalText = body.appendParagraph(
      `I, ${customerName.toUpperCase()}, state that neither I nor any other person covered by this policy has had a claim or loss or been involved in an accident ` +
      `since the cancellation or expiration of the policy (the "no loss period") wherein this policy may apply. ` +
      `For auto/motorcycle/RV policies, I certify I have disclosed the current garaging location and use of all vehicles, including delivery/rideshare use, ` +
      `and all household members age 14+ and regular drivers. I understand the insurance company is relying solely upon this Statement of No Loss ` +
      `to reinstate my policy with no lapse in coverage. If a claim/loss/accident occurred during the no loss period, or if I failed to disclose ` +
      `required information, the reinstatement is null and void and no coverage shall exist. If my payment is not honored, the reinstatement is null and void. ` +
      `I agree to pay reinstatement and late fees in addition to premium. ` +
      `It is a crime to knowingly provide false information to an insurance company. Penalties include imprisonment, fines, and denial of benefits.`
    );
    legalText.setFontSize(7);  // Even smaller font
    legalText.setSpacingAfter(4);

    // Agreement on same line as signature label to save space
    const agreementText = body.appendParagraph('☑ I agree to all terms above | ELECTRONIC SIGNATURE:');
    agreementText.setFontSize(8);
    agreementText.setBold(true);
    agreementText.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    agreementText.setSpacingAfter(4);

    // ===== ULTRA COMPACT SIGNATURE =====
    // Insert signature image if available - SMALLER
    if ((data.signature || data.signatureUrl) && (data.signature || data.signatureUrl).startsWith('data:image')) {
      try {
        const signatureData = data.signature || data.signatureUrl;
        const base64Data = signatureData.split(',')[1];
        const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), 'image/png', 'signature.png');
        const image = body.appendImage(blob);
        image.setHeight(30);  // Even smaller
        image.setWidth(120);  // Even smaller
        const parent = image.getParent();
        parent.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      } catch (e) {
        console.error('Signature image error:', e);
        const sigLine = body.appendParagraph('[Electronic Signature on File]');
        sigLine.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        sigLine.setItalic(true);
        sigLine.setFontSize(8);
      }
    } else {
      const sigLine = body.appendParagraph('[Electronic Signature on File]');
      sigLine.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      sigLine.setItalic(true);
      sigLine.setFontSize(8);
    }

    // Signature info on ONE line to prevent page break
    const sigInfo = body.appendParagraph(`${customerName} | Signed: ${data.timestamp || new Date().toLocaleDateString()} | NoLossForm.com`);
    sigInfo.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    sigInfo.setFontSize(7);  // Very small
    sigInfo.setItalic(true);

    // Save and convert to PDF
    doc.saveAndClose();

    // Convert to PDF
    const pdfBlob = DriveApp.getFileById(doc.getId()).getAs('application/pdf');

    // Save to folder
    const folder = DriveApp.getFolderById(CONFIG.PDF_FOLDER_ID);
    const pdfFile = folder.createFile(pdfBlob);

    // Name the file
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