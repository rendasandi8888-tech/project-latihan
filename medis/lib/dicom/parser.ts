// @ts-ignore - dcmjs doesn't have good type definitions
import * as dcmjs from 'dcmjs';

export interface DicomMetadata {
  patientName?: string
  patientId?: string
  birthDate?: string
  studyDate?: string
  modality?: string
  bodyPartExamined?: string
  institutionName?: string
  studyDescription?: string
  numberOfFrames?: number
}

// Fungsi 1: Extract metadata dari file DICOM
export async function extractDicomMetadata(file: File): Promise<DicomMetadata> {
  const arrayBuffer = await file.arrayBuffer();
  
  try {
    const dicomDict = dcmjs.data.DicomMessage.readFile(arrayBuffer);
    const meta = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomDict.dict);
    
    return {
      patientName: meta.PatientName?.Alphabetic || meta.PatientName,
      patientId: meta.PatientID,
      birthDate: meta.PatientBirthDate,
      studyDate: meta.StudyDate,
      modality: meta.Modality,
      bodyPartExamined: meta.BodyPartExamined,
      institutionName: meta.InstitutionName,
      studyDescription: meta.StudyDescription,
      numberOfFrames: meta.NumberOfFrames ? Number(meta.NumberOfFrames) : 1
    };
  } catch (error) {
    console.error("Failed to parse DICOM metadata", error);
    return {};
  }
}

// Fungsi 2: Generate thumbnail dari frame pertama DICOM
export async function generateDicomThumbnail(file: File): Promise<string> {
  // Dalam realisasi browser environment, biasanya menggunakan library seperti 
  // cornerstone.js, dicom-parser, atau dcmjs untuk merender piksel ke canvas,
  // lalu diubah jadi base64. 
  // Karena dcmjs basic tidak langsung render tanpa setup DOM/canvas extra, 
  // di sini disimulasikan returning base64 placeholder atau logic ekstrasi frame sederhana.
  
  return new Promise((resolve) => {
    // Simulasi ekstraksi dan konversi ke base64 (mock)
    // Untuk app nyata, kita akan decode PixelData, draw ke canvas 2D, lalu canvas.toDataURL()
    setTimeout(() => {
      resolve("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=");
    }, 500);
  });
}

// Fungsi 3: Normalisasi modality
export function normalizeModality(dicomModality: string): 'CT' | 'XRAY' {
  if (dicomModality === 'CT') {
    return 'CT';
  }
  // DX = Digital Radiography, CR = Computed Radiography, RG = Radiographic imaging
  if (['CR', 'DX', 'RG'].includes(dicomModality)) {
    return 'XRAY';
  }
  // Default fallback if unknown but need to pick one
  return 'XRAY';
}

// Fungsi 4: Format tanggal DICOM YYYYMMDD ke DD MMM YYYY
export function formatDicomDate(dicomDate: string): string {
  if (!dicomDate || dicomDate.length !== 8) return dicomDate || '';
  
  const year = dicomDate.substring(0, 4);
  const monthStr = dicomDate.substring(4, 6);
  const day = dicomDate.substring(6, 8);
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[parseInt(monthStr, 10) - 1] || monthStr;
  
  return `${day} ${month} ${year}`;
}
