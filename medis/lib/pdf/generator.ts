import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

interface VerificationResult {
  txHash: string
  modality: string
  date: string
  department: string
  uploadedBy: string
  blockNumber: number
  timestamp: string
}

export function generateVerificationCertificate(result: VerificationResult) {
  const doc = new jsPDF()

  // Title
  doc.setFontSize(22)
  doc.setTextColor(24, 95, 165) // #185FA5
  doc.text('Certificate of Authenticity', 105, 20, { align: 'center' })

  // Subtitle
  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100)
  doc.text('Blockchain-Verified Medical Record', 105, 28, { align: 'center' })

  // Date issued
  doc.setFontSize(10)
  doc.text(`Issued on: ${new Date().toLocaleDateString()}`, 105, 36, { align: 'center' })

  // Data Table
  const tableData = [
    ['Transaction Hash', result.txHash],
    ['Block Number', result.blockNumber.toString()],
    ['Timestamp', result.timestamp],
    ['Modality', result.modality],
    ['Study Date', result.date],
    ['Department', result.department],
    ['Uploaded By', result.uploadedBy],
  ]

  ;(doc as any).autoTable({
    startY: 50,
    head: [['Property', 'Value']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [24, 95, 165] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 130 }
    }
  })

  // Footer statement
  const finalY = (doc as any).lastAutoTable.finalY || 100
  doc.setFontSize(11)
  doc.setTextColor(50, 50, 50)
  const statement = "This certificate confirms that the medical record identified by the transaction hash above is authentic and has been verified on the Monad Blockchain."
  doc.text(statement, 15, finalY + 15, { maxWidth: 180 })

  // Bottom footer
  doc.setFontSize(9)
  doc.setTextColor(150, 150, 150)
  doc.text('MediChain Radiology · Powered by Monad Testnet · Secured by NJCS + AES-256-GCM', 105, 280, { align: 'center' })

  doc.save(`MediChain_Certificate_${result.txHash.substring(0, 8)}.pdf`)
}

export function generatePatientReport(patientData: any, records: any[]) {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.setTextColor(24, 95, 165)
  doc.text('MediChain Radiology', 15, 20)
  doc.setFontSize(14)
  doc.setTextColor(50, 50, 50)
  doc.text('Comprehensive Patient Report', 15, 30)

  // Patient Info
  doc.setFontSize(11)
  doc.text(`Patient Name: ${patientData.name || 'Confidential'}`, 15, 45)
  doc.text(`Patient ID: ${patientData.id ? patientData.id.replace(/.(?=.{4})/g, '*') : '****'}`, 15, 52)
  doc.text(`Date of Birth: ${patientData.dob || 'N/A'}`, 15, 59)

  // Records Table
  const tableData = records.map(r => [
    r.date || 'Unknown',
    r.modality || 'Unknown',
    r.bodyPart || 'Unknown',
    r.department || 'Unknown',
    r.txHash ? `${r.txHash.substring(0, 8)}...` : 'Pending'
  ])

  ;(doc as any).autoTable({
    startY: 70,
    head: [['Date', 'Modality', 'Body Part', 'Department', 'Tx Hash']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [29, 158, 117] }, // #1D9E75
  })

  const finalY = (doc as any).lastAutoTable.finalY || 100
  doc.text(`Total Examinations: ${records.length}`, 15, finalY + 10)

  // Watermark / Footer
  doc.setTextColor(200, 200, 200)
  doc.setFontSize(40)
  doc.text('CONFIDENTIAL', 105, 150, { align: 'center', angle: -45 })

  doc.save(`Patient_Report_${patientData.id || 'export'}.pdf`)
}
