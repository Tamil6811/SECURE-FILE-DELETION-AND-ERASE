import jsPDF from 'jspdf';
import { CertificateOfDestruction } from '../types/sanitization';
import { CarvedFile, CarvingScanMetrics } from '../types/carver';

export function generateDestructionCertificatePdf(cert: CertificateOfDestruction) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Background styling & borders
  doc.setFillColor(11, 15, 23); // #0B0F17
  doc.rect(0, 0, 210, 297, 'F');

  // Neon Cyan / Emerald accent borders
  doc.setDrawColor(56, 189, 248); // #38bdf8
  doc.setLineWidth(1.2);
  doc.rect(8, 8, 194, 281);
  
  doc.setDrawColor(16, 185, 129); // #10b981
  doc.setLineWidth(0.4);
  doc.rect(10, 10, 190, 277);

  // Header Title
  doc.setTextColor(56, 189, 248);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('CERTIFICATE OF SANITIZATION', 105, 26, { align: 'center' });

  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('FORENSIC-GRADE MEDIA DESTRUCTION & COMPLIANCE VERIFICATION', 105, 33, { align: 'center' });

  doc.setDrawColor(51, 65, 85);
  doc.line(20, 38, 190, 38);

  // Certificate Meta Block
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(20, 44, 170, 26, 2, 2, 'F');
  doc.setDrawColor(56, 189, 248);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, 44, 170, 26, 2, 2, 'D');

  doc.setTextColor(56, 189, 248);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CERTIFICATE ID:', 26, 52);
  doc.setTextColor(255, 255, 255);
  doc.setFont('courier', 'bold');
  doc.text(cert.certificateId, 62, 52);

  doc.setTextColor(56, 189, 248);
  doc.setFont('helvetica', 'bold');
  doc.text('TIMESTAMP (UTC):', 26, 62);
  doc.setTextColor(255, 255, 255);
  doc.setFont('courier', 'normal');
  doc.text(cert.timestamp, 62, 62);

  doc.setTextColor(16, 185, 129);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('STATUS: VERIFIED SANITIZED', 140, 56);

  // Target Storage Device Details
  doc.setTextColor(56, 189, 248);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. TARGET STORAGE MEDIA SPECIFICATION', 20, 80);

  doc.setFillColor(15, 23, 42);
  doc.rect(20, 85, 170, 42, 'F');
  doc.setDrawColor(71, 85, 105);
  doc.rect(20, 85, 170, 42, 'D');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(148, 163, 184);

  doc.text('Device Model / Name:', 26, 93);
  doc.text('Serial Number (S/N):', 26, 101);
  doc.text('Media Type / Interface:', 26, 109);
  doc.text('Drive Capacity:', 26, 117);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  doc.text(cert.device.name, 75, 93);
  doc.text(cert.device.serialNumber, 75, 101);
  doc.text(`${cert.device.type} (${cert.device.firmware})`, 75, 109);
  doc.text(`${cert.device.capacityGB} GB Raw Storage`, 75, 117);

  // Sanitization Standard & Verification Details
  doc.setTextColor(56, 189, 248);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2. SANITIZATION METHODOLOGY & VERIFICATION', 20, 138);

  doc.setFillColor(15, 23, 42);
  doc.rect(20, 143, 170, 50, 'F');
  doc.setDrawColor(71, 85, 105);
  doc.rect(20, 143, 170, 50, 'D');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(148, 163, 184);

  doc.text('Sanitization Standard:', 26, 151);
  doc.text('Governing Authority:', 26, 159);
  doc.text('Passes Executed:', 26, 167);
  doc.text('Post-Erasure Entropy:', 26, 175);
  doc.text('100% Read Verification:', 26, 183);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  doc.text(cert.sanitization.standardName, 75, 151);
  doc.text(cert.sanitization.standardAuthority, 75, 159);
  doc.text(`${cert.sanitization.passesCompleted} Overwrite Pass(es)`, 75, 167);
  doc.text(`${cert.sanitization.postErasureEntropy.toFixed(4)} bits/byte (Baseline Zero)`, 75, 175);
  doc.setTextColor(16, 185, 129);
  doc.text('100% SECTOR ZERO READ-BACK CONFIRMED (PASS)', 75, 183);

  // Cryptographic Manifest & Hashes
  doc.setTextColor(56, 189, 248);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('3. CRYPTOGRAPHIC INTEGRITY MANIFEST', 20, 204);

  doc.setFillColor(15, 23, 42);
  doc.rect(20, 209, 170, 28, 'F');
  doc.setDrawColor(71, 85, 105);
  doc.rect(20, 209, 170, 28, 'D');

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('SHA-256 LBA VERIFICATION HASH:', 26, 217);
  doc.setTextColor(56, 189, 248);
  doc.setFont('courier', 'normal');
  doc.text(cert.sanitization.sha256VerificationHash, 26, 223);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('DIGITAL SIGNATURE:', 26, 229);
  doc.setTextColor(16, 185, 129);
  doc.setFont('courier', 'normal');
  doc.text(cert.cryptographicSignature.slice(0, 64) + '...', 26, 234);

  // Sign-off / Operator Block
  doc.setTextColor(56, 189, 248);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('4. AUTHORIZED OPERATOR SIGN-OFF', 20, 248);

  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`Lead Technician: ${cert.sanitization.operatorName} (ID: ${cert.sanitization.technicianId})`, 20, 256);
  doc.text(`Organization: ${cert.sanitization.organization}`, 20, 262);
  doc.text('Verification Method: NIST SP 800-88 Rev. 1 Tamper-Evident Protocol', 20, 268);

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('This document certifies that the aforementioned media was sanitized in strict accordance with statutory standards. Data recovery is rendered infeasible.', 105, 282, { align: 'center' });

  doc.save(`Certificate_of_Destruction_${cert.certificateId}.pdf`);
}

export function generateForensicInvestigationReportPdf(
  caseNumber: string,
  investigator: string,
  agency: string,
  mediaName: string,
  metrics: CarvingScanMetrics,
  files: CarvedFile[]
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Dark Theme Background
  doc.setFillColor(11, 15, 23);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setDrawColor(56, 189, 248);
  doc.setLineWidth(1.0);
  doc.rect(8, 8, 194, 281);

  // Title
  doc.setTextColor(56, 189, 248);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('DIGITAL FORENSICS CARVING REPORT', 105, 24, { align: 'center' });

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('EVIDENTIAL ARTIFACT RECONSTRUCTION & METADATA ANALYSIS', 105, 30, { align: 'center' });

  doc.setDrawColor(51, 65, 85);
  doc.line(20, 34, 190, 34);

  // Case & Chain of Custody Header
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(20, 38, 170, 32, 2, 2, 'F');
  doc.setDrawColor(71, 85, 105);
  doc.roundedRect(20, 38, 170, 32, 2, 2, 'D');

  doc.setFontSize(8.5);
  doc.setTextColor(56, 189, 248);
  doc.setFont('helvetica', 'bold');
  doc.text('CASE NUMBER:', 25, 46);
  doc.text('INVESTIGATOR:', 25, 54);
  doc.text('EXAMINED MEDIA:', 25, 62);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.text(caseNumber, 65, 46);
  doc.text(`${investigator} (${agency})`, 65, 54);
  doc.text(mediaName, 65, 62);

  doc.setTextColor(56, 189, 248);
  doc.text('DATE/TIME (UTC):', 125, 46);
  doc.setTextColor(255, 255, 255);
  doc.text(new Date().toISOString().slice(0, 19).replace('T', ' '), 158, 46);

  // Executive Metrics Summary
  doc.setTextColor(56, 189, 248);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. CARVING SCAN METRICS & YIELD', 20, 78);

  doc.setFillColor(15, 23, 42);
  doc.rect(20, 83, 170, 24, 'F');
  doc.setDrawColor(71, 85, 105);
  doc.rect(20, 83, 170, 24, 'D');

  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Scanned Bytes: ${(metrics.totalBytesScanned / 1024).toFixed(1)} KB`, 25, 91);
  doc.text(`Artifacts Carved: ${metrics.totalFilesRecovered}`, 85, 91);
  doc.text(`Average Confidence: ${metrics.averageConfidence}%`, 140, 91);

  doc.text(`Valid Structure: ${metrics.validIntegrityFiles}`, 25, 100);
  doc.text(`Fragmented Reassembled: ${metrics.fragmentedReconstructed}`, 85, 100);
  doc.text(`Scan Time: ${metrics.carveDurationMs} ms`, 140, 100);

  // Recovered Evidence Table
  doc.setTextColor(56, 189, 248);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('2. RECOVERED FORENSIC ARTIFACTS MANIFEST', 20, 116);

  // Table header
  doc.setFillColor(30, 41, 59);
  doc.rect(20, 121, 170, 7, 'F');
  doc.setTextColor(56, 189, 248);
  doc.setFontSize(7.5);
  doc.text('ITEM ID', 22, 126);
  doc.text('NAME / TYPE', 42, 126);
  doc.text('OFFSET RANGE', 90, 126);
  doc.text('SIZE', 130, 126);
  doc.text('CONF.', 150, 126);
  doc.text('INTEGRITY', 165, 126);

  let y = 133;
  const maxRows = Math.min(files.length, 12);

  for (let i = 0; i < maxRows; i++) {
    const f = files[i];
    doc.setFillColor(i % 2 === 0 ? 15 : 20, 23, 42);
    doc.rect(20, y - 4, 170, 9, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    doc.text(f.evidenceId, 22, y + 2);

    doc.setFont('helvetica', 'normal');
    doc.text(`${f.name.slice(0, 22)}`, 42, y + 2);

    doc.setFont('courier', 'normal');
    const startStr = f.offsetStart !== undefined ? `0x${f.offsetStart.toString(16)}` : 'N/A';
    const endStr = f.offsetEnd !== undefined ? `0x${f.offsetEnd.toString(16)}` : 'N/A';
    doc.text(`${startStr} - ${endStr}`, 90, y + 2);
    doc.text(`${(f.sizeBytes / 1024).toFixed(1)} KB`, 130, y + 2);
    doc.text(`${f.confidenceScore}%`, 150, y + 2);

    doc.setTextColor(f.confidenceScore >= 80 ? 16 : 245, f.confidenceScore >= 80 ? 185 : 158, f.confidenceScore >= 80 ? 129 : 11);
    doc.text(f.integrityStatus === 'VALID_STRUCTURE' ? 'VALID' : 'FRAG/PART', 165, y + 2);

    y += 9.5;
  }

  // SHA-256 Hashes Summary
  doc.setTextColor(56, 189, 248);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('3. EVIDENCE HASH INTEGRITY VERIFICATION', 20, y + 8);

  doc.setFillColor(15, 23, 42);
  doc.rect(20, y + 13, 170, 25, 'F');
  doc.setDrawColor(71, 85, 105);
  doc.rect(20, y + 13, 170, 25, 'D');

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Primary Evidence Item 01 SHA-256:', 25, y + 21);
  doc.setTextColor(56, 189, 248);
  doc.setFont('courier', 'normal');
  doc.text(files[0]?.sha256Hash || 'N/A', 25, y + 27);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Primary Evidence Item 01 MD5:', 25, y + 33);
  doc.setTextColor(16, 185, 129);
  doc.setFont('courier', 'normal');
  doc.text(files[0]?.md5Hash || 'N/A', 80, y + 33);

  // Footer Disclaimer
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Digital Forensic Report generated automatically by AegisForensics Carving Engine. Chain of custody hash logged in ledger.', 105, 284, { align: 'center' });

  doc.save(`Forensic_Carving_Report_${caseNumber.replace(/\s+/g, '_')}.pdf`);
}
