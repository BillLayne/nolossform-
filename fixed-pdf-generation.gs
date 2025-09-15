// ============================================
// FIXED PDF GENERATION FUNCTION
// Replace the generateCompletePDF function in your Google Apps Script with this
// ============================================

function generateCompletePDF(data, confirmationNumber) {
  try {
    // FIXED: Ensure we have the customer name
    const customerName = data.insuredName || data.customerName || data.name || 'Customer';

    // Get agency information or use platform info for direct submissions
    const agencyName = data.agencyName && data.agencyName !== 'Direct Submission'
      ? data.agencyName.toUpperCase()
      : 'NOLOSSFORM.COM';

    const agencyAddress = data.agencyAddress || '';
    const agencyPhone = data.agencyPhone || '';
    const agencyEmail = data.agencyEmail || '';

    console.log('=== GENERATING PDF ===');
    console.log('Customer:', customerName);
    console.log('Agency:', agencyName);
    console.log('Confirmation:', confirmationNumber);

    // Create document
    const doc = DocumentApp.create(`NoLoss_${confirmationNumber}_${customerName.replace(/[^a-zA-Z0-9]/g, '_')}`);
    const body = doc.getBody();

    // Clear and set margins
    body.clear();
    body.setMarginTop(36);
    body.setMarginBottom(36);
    body.setMarginLeft(48);
    body.setMarginRight(48);

    // ===== HEADER - AGENCY BRANDING =====
    const header = body.appendParagraph(agencyName);
    header.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    header.setFontSize(14);
    header.setBold(true);
    header.setForegroundColor('#1e3c72');

    // Title
    const title = body.appendParagraph('REINSTATEMENT REQUEST - STATEMENT OF NO LOSS');
    title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    title.setFontSize(12);
    title.setBold(true);

    // Confirmation Number
    const confirmText = body.appendParagraph(`Confirmation #: ${confirmationNumber}`);
    confirmText.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    confirmText.setFontSize(11);
    confirmText.setBold(true);
    confirmText.setForegroundColor('#0066cc');

    // Agency Contact Info
    if (agencyAddress || agencyPhone || agencyEmail) {
      const contactLine = body.appendParagraph(
        [agencyAddress, agencyPhone, agencyEmail].filter(Boolean).join(' | ')
      );
      contactLine.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      contactLine.setFontSize(10);
      contactLine.setSpacingAfter(12);
    }

    // Divider line
    body.appendHorizontalRule();

    // ===== POLICY INFORMATION SECTION =====
    const policyTitle = body.appendParagraph('POLICY INFORMATION');
    policyTitle.setBold(true);
    policyTitle.setFontSize(11);
    policyTitle.setForegroundColor('#1e3c72');
    policyTitle.setSpacingBefore(12);
    policyTitle.setSpacingAfter(8);

    // Create two-column layout for policy info
    const policyTable = body.appendTable();
    // REMOVED: policyTable.setBorderWidth(0);

    // Row 1: Insurance Company and Policy Number
    const row1 = policyTable.appendTableRow();
    const cell1a = row1.appendTableCell('Insurance Company:');
    cell1a.getChild(0).asParagraph().setBold(true).setFontSize(10);
    const cell1b = row1.appendTableCell(data.insuranceCompany || 'N/A');
    cell1b.getChild(0).asParagraph().setFontSize(10);
    const cell1c = row1.appendTableCell('Policy Number:');
    cell1c.getChild(0).asParagraph().setBold(true).setFontSize(10);
    const cell1d = row1.appendTableCell(data.policyNumber || 'N/A');
    cell1d.getChild(0).asParagraph().setFontSize(10);

    // Row 2: Policy Type and Amount Paid
    const row2 = policyTable.appendTableRow();
    const cell2a = row2.appendTableCell('Policy Type:');
    cell2a.getChild(0).asParagraph().setBold(true).setFontSize(10);
    const cell2b = row2.appendTableCell(data.policyType || 'Auto');
    cell2b.getChild(0).asParagraph().setFontSize(10);
    const cell2c = row2.appendTableCell('Amount Paid:');
    cell2c.getChild(0).asParagraph().setBold(true).setFontSize(10);
    const cell2d = row2.appendTableCell(data.amountPaid || 'N/A');
    cell2d.getChild(0).asParagraph().setFontSize(10);

    // Row 3: Cancellation Date and Reinstatement Date
    const row3 = policyTable.appendTableRow();
    const cell3a = row3.appendTableCell('Cancellation Date:');
    cell3a.getChild(0).asParagraph().setBold(true).setFontSize(10);
    const cell3b = row3.appendTableCell(formatDate(data.cancellationDate || data.lapseStartDate));
    cell3b.getChild(0).asParagraph().setFontSize(10);
    const cell3c = row3.appendTableCell('Reinstatement Date:');
    cell3c.getChild(0).asParagraph().setBold(true).setFontSize(10);
    const cell3d = row3.appendTableCell(formatDate(data.reinstatementDate || data.lapseEndDate));
    cell3d.getChild(0).asParagraph().setFontSize(10);

    // Style the table (without using setBorderWidth)
    const policyTableAttr = policyTable.getAttributes();
    policyTableAttr[DocumentApp.Attribute.BORDER_WIDTH] = 0;
    policyTable.setAttributes(policyTableAttr);

    // ===== INSURED INFORMATION SECTION =====
    const insuredTitle = body.appendParagraph('INSURED INFORMATION');
    insuredTitle.setBold(true);
    insuredTitle.setFontSize(11);
    insuredTitle.setForegroundColor('#1e3c72');
    insuredTitle.setSpacingBefore(12);
    insuredTitle.setSpacingAfter(8);

    const insuredTable = body.appendTable();

    // Insured info rows
    const insRow1 = insuredTable.appendTableRow();
    const insCell1a = insRow1.appendTableCell('Insured Name:');
    insCell1a.getChild(0).asParagraph().setBold(true).setFontSize(10);
    const insCell1b = insRow1.appendTableCell(customerName.toUpperCase());
    insCell1b.getChild(0).asParagraph().setFontSize(10);
    const insCell1c = insRow1.appendTableCell('Phone:');
    insCell1c.getChild(0).asParagraph().setBold(true).setFontSize(10);
    const insCell1d = insRow1.appendTableCell(data.phone || 'N/A');
    insCell1d.getChild(0).asParagraph().setFontSize(10);

    const insRow2 = insuredTable.appendTableRow();
    const insCell2a = insRow2.appendTableCell('Email:');
    insCell2a.getChild(0).asParagraph().setBold(true).setFontSize(10);
    const insCell2b = insRow2.appendTableCell(data.email || 'N/A');
    insCell2b.getChild(0).asParagraph().setFontSize(10).setForegroundColor('#0066cc');
    const insCell2c = insRow2.appendTableCell('Date:');
    insCell2c.getChild(0).asParagraph().setBold(true).setFontSize(10);
    const insCell2d = insRow2.appendTableCell(data.timestamp || new Date().toLocaleString());
    insCell2d.getChild(0).asParagraph().setFontSize(10);

    // Add property address if provided
    if (data.propertyAddress) {
      const insRow3 = insuredTable.appendTableRow();
      const insCell3a = insRow3.appendTableCell('Property Address:');
      insCell3a.getChild(0).asParagraph().setBold(true).setFontSize(10);
      const addressText = [
        data.propertyAddress,
        data.city && data.state && data.zipCode ? `${data.city}, ${data.state} ${data.zipCode}` : ''
      ].filter(Boolean).join(', ');
      const insCell3b = insRow3.appendTableCell(addressText || 'N/A');
      insCell3b.getChild(0).asParagraph().setFontSize(10);
      // Set column span (merged cells effect)
      insCell3b.merge();
      insCell3b.merge();
    }

    // Style the table (without using setBorderWidth)
    const insuredTableAttr = insuredTable.getAttributes();
    insuredTableAttr[DocumentApp.Attribute.BORDER_WIDTH] = 0;
    insuredTable.setAttributes(insuredTableAttr);

    // Divider
    body.appendHorizontalRule();

    // ===== STATEMENT OF NO LOSS - ONE PARAGRAPH AS REQUIRED =====
    const statementTitle = body.appendParagraph('STATEMENT OF NO LOSS');
    statementTitle.setBold(true);
    statementTitle.setFontSize(11);
    statementTitle.setForegroundColor('#1e3c72');
    statementTitle.setSpacingBefore(12);
    statementTitle.setSpacingAfter(8);

    // Complete legal text in ONE paragraph
    const legalText = body.appendParagraph(
      `I, ${customerName.toUpperCase()}, state that neither I nor any other person covered by this policy has had a claim or loss or been involved in an accident ` +
      `since the cancellation or expiration of the policy (otherwise known as the "no loss period") wherein this policy, including any and all ` +
      `coverages endorsed upon or made part of the policy may apply. In addition, if this reinstatement is for a personal or commercial auto, motorcycle, or RV policy, I certify that I have disclosed the current ` +
      `garaging location and use of all insured vehicles including if any such vehicle is used to deliver food or goods, to transport people for ` +
      `compensation, or for any other business purpose. I have also disclosed household members who are age 14 or older, and all persons who ` +
      `regularly drive any vehicle insured under this policy. I understand that this insurance company is relying solely upon this Statement of No Loss all of which is material, as an inducement to ` +
      `reinstate my policy with no lapse in coverage. I further understand that if a claim, loss, or accident has occurred during the no loss period, or ` +
      `if I failed to disclose the current garaging location and primary use of all vehicles insured under this policy, all persons who regularly drive ` +
      `these vehicles, and all members of my household who are age 14 or older, the reinstatement is null and void, my policy remains cancelled ` +
      `and no insurance coverage shall be provided. I agree that if my check or other payment for this reinstatement is not honored for any reason, the reinstatement is null and void and no ` +
      `coverage shall exist under this policy. I agree to pay a reinstatement fee and late fee (if applicable) in addition to the premium required to ` +
      `reinstate my policy. My payment will be applied first to the reinstatement and late fee and the remainder to the premium. It is a crime to knowingly provide false, incomplete, or misleading information to an insurance company for the purpose of defrauding the ` +
      `company. Penalties include imprisonment, fines, and denial of insurance benefits.`
    );
    legalText.setFontSize(10);
    legalText.setSpacingAfter(12);

    // Agreement question
    const agreementQ = body.appendParagraph('Do you understand and agree to these statements, terms, and conditions?');
    agreementQ.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    agreementQ.setFontSize(11);
    agreementQ.setBold(true);
    agreementQ.setSpacingAfter(12);

    // ===== ELECTRONIC SIGNATURE SECTION =====
    const sigTitle = body.appendParagraph('ELECTRONIC SIGNATURE');
    sigTitle.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    sigTitle.setBold(true);
    sigTitle.setFontSize(11);
    sigTitle.setForegroundColor('#1e3c72');
    sigTitle.setSpacingAfter(12);

    // Insert signature image if available
    if ((data.signature || data.signatureUrl) && (data.signature || data.signatureUrl).startsWith('data:image')) {
      try {
        const signatureData = data.signature || data.signatureUrl;
        const base64Data = signatureData.split(',')[1];
        const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), 'image/png', 'signature.png');
        const image = body.appendImage(blob);
        image.setHeight(60);
        image.setWidth(200);
        const parent = image.getParent();
        parent.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      } catch (e) {
        console.error('Signature image error:', e);
        const sigLine = body.appendParagraph('[Electronic Signature on File]');
        sigLine.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        sigLine.setItalic(true);
        sigLine.setFontSize(10);
      }
    } else {
      const sigLine = body.appendParagraph('[Electronic Signature on File]');
      sigLine.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      sigLine.setItalic(true);
      sigLine.setFontSize(10);
    }

    // Signature timestamp
    const sigDate = body.appendParagraph(`Signed electronically on ${data.timestamp || new Date().toLocaleString()}`);
    sigDate.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    sigDate.setFontSize(10);
    sigDate.setItalic(true);

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
    const fileName = `NoLoss_${confirmationNumber}_${safeAgencyName}_${safeCustomerName}.pdf`;
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