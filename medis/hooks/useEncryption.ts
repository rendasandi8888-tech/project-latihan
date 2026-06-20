import { useState } from 'react';
import { 
  NJCSParams, 
  generateRandomNJCSParams, 
  computeLyapunovExponents, 
  encryptPatientMetadata, 
  njcsEncryptFile,
  njcsDecryptFile,
  computeFileHash,
  verifyFileIntegrity
} from '@/lib/encryption/njcs';
import { 
  createKeyEnvelope, 
  encryptKeyEnvelope,
  decryptKeyEnvelope,
  KeyEnvelope
} from '@/lib/encryption/key-envelope';
import { ProgressStep } from '@/components/encryption/EncryptionProgress';

export function useEncryption() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<ProgressStep[]>([]);
  const [lyapunovExponents, setLyapunovExponents] = useState<number[] | null>(null);

  const addStep = (step: ProgressStep) => {
    setSteps(prev => [...prev, step]);
  };

  const updateStep = (id: string, updates: Partial<ProgressStep>) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const encryptAndUpload = async (
    file: File, 
    metadata: { patientName: string, patientId: string, birthDate: string },
    departmentKey: string
  ) => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setSteps([]);

    try {
      // 1. Generate random NJCSParams
      const step1Id = 'step-generate-params';
      addStep({ id: step1Id, label: 'Generate NJCS hyperchaotic parameters', status: 'in-progress' });
      const njcsParams = generateRandomNJCSParams();
      updateStep(step1Id, { 
        status: 'completed', 
        subDetails: [`x₀=${njcsParams.x0.toFixed(4)} y₀=${njcsParams.y0.toFixed(4)} z₀=${njcsParams.z0.toFixed(4)} w₀=${njcsParams.w0.toFixed(4)}`]
      });

      // 2. Compute Lyapunov exponents
      const step2Id = 'step-lyapunov';
      addStep({ id: step2Id, label: 'Compute Lyapunov exponents', status: 'in-progress' });
      const exponents = computeLyapunovExponents(njcsParams);
      setLyapunovExponents(exponents);
      updateStep(step2Id, {
        status: 'completed',
        subDetails: [`λ1=+${exponents[0]} λ2=+${exponents[1]} (hyperchaotic confirmed)`]
      });

      // 3. Encrypt metadata
      const step3Id = 'step-encrypt-meta';
      addStep({ id: step3Id, label: 'Encrypt patient metadata with NJCS', status: 'in-progress' });
      const encryptedMetadata = encryptPatientMetadata(metadata, njcsParams);
      updateStep(step3Id, { status: 'completed' });

      // 4. Encrypt file with NJCS
      const step4Id = 'step-encrypt-file';
      addStep({ id: step4Id, label: 'Encrypt file with NJCS stream cipher', status: 'in-progress' });
      const arrayBuffer = await file.arrayBuffer();
      const fileSizeMB = (arrayBuffer.byteLength / (1024 * 1024)).toFixed(2);
      
      const encryptedBuffer = await njcsEncryptFile(arrayBuffer, njcsParams, (pct) => {
        setProgress(pct);
      });
      updateStep(step4Id, { 
        status: 'completed',
        details: `${fileSizeMB}MB → ${fileSizeMB}MB` 
      });

      // 5. Compute SHA-256 hash file asli
      const fileHash = await computeFileHash(arrayBuffer);

      // 6. Create key envelope & encrypt
      const step5Id = 'step-envelope';
      addStep({ id: step5Id, label: 'Create key envelope', status: 'in-progress' });
      const envelope = createKeyEnvelope(njcsParams, fileHash, departmentKey, exponents);
      const encryptedEnvelopeStr = encryptKeyEnvelope(envelope, departmentKey);
      
      // Convert encrypted string to Blob for upload
      const envelopeBlob = new Blob([encryptedEnvelopeStr], { type: 'text/plain' });
      updateStep(step5Id, { status: 'completed' });

      // 7 & 8. Upload to IPFS via API Route
      const step6Id = 'step-upload-ipfs';
      addStep({ id: step6Id, label: 'Upload to IPFS', status: 'in-progress' });
      
      // Upload File
      const fileFormData = new FormData();
      fileFormData.append('file', new Blob([encryptedBuffer]));
      const fileUploadRes = await fetch('/api/ipfs/upload', {
        method: 'POST',
        body: fileFormData
      });
      const fileUploadData = await fileUploadRes.json();

      // Upload Envelope
      const envFormData = new FormData();
      envFormData.append('file', envelopeBlob);
      const envUploadRes = await fetch('/api/ipfs/upload', {
        method: 'POST',
        body: envFormData
      });
      const envUploadData = await envUploadRes.json();

      updateStep(step6Id, { 
        status: 'completed',
        subDetails: [`File CID: ${fileUploadData.cid}`, `Envelope CID: ${envUploadData.cid}`]
      });

      setProgress(100);
      setIsProcessing(false);

      return {
        dicomCID: fileUploadData.cid,
        keyEnvelopeCID: envUploadData.cid,
        fileHash,
        njcsParams,
        lyapunovExponents: exponents,
        encryptedMetadata
      };

    } catch (err: any) {
      setError(err.message || "An error occurred during encryption");
      setIsProcessing(false);
      throw err;
    }
  };

  const decryptAndDownload = async (
    dicomCID: string,
    keyEnvelopeCID: string,
    departmentKey: string,
    fileName: string = "decrypted.dcm"
  ) => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setSteps([]);

    try {
      // 1 & 2. Download and Decrypt Key Envelope
      const step1Id = 'step-dl-env';
      addStep({ id: step1Id, label: 'Download & Decrypt Key Envelope', status: 'in-progress' });
      
      const envDownloadRes = await fetch('/api/ipfs/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cid: keyEnvelopeCID })
      });
      const envBuffer = await envDownloadRes.arrayBuffer();
      const encryptedEnvelopeStr = new TextDecoder().decode(envBuffer);
      const envelope = decryptKeyEnvelope(encryptedEnvelopeStr, departmentKey);
      
      updateStep(step1Id, { status: 'completed' });

      // 3. Download encrypted DICOM
      const step2Id = 'step-dl-file';
      addStep({ id: step2Id, label: 'Download Encrypted DICOM', status: 'in-progress' });
      
      const fileDownloadRes = await fetch('/api/ipfs/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cid: dicomCID })
      });
      const encryptedBuffer = await fileDownloadRes.arrayBuffer();
      
      updateStep(step2Id, { status: 'completed' });

      // 4. Decrypt file with NJCS
      const step3Id = 'step-decrypt-file';
      addStep({ id: step3Id, label: 'Decrypt DICOM File', status: 'in-progress' });
      
      const decryptedBuffer = await njcsDecryptFile(encryptedBuffer, envelope.njcsParams, (pct) => {
        setProgress(pct);
      });
      
      updateStep(step3Id, { status: 'completed' });

      // 5. Verify SHA-256 hash
      const step4Id = 'step-verify';
      addStep({ id: step4Id, label: 'Verify Integrity', status: 'in-progress' });
      
      const isValid = await verifyFileIntegrity(decryptedBuffer, envelope.fileHash);
      if (!isValid) {
        throw new Error("File integrity check failed. The file may be tampered.");
      }
      
      updateStep(step4Id, { status: 'completed' });

      // 6. Trigger download
      const blob = new Blob([decryptedBuffer], { type: 'application/dicom' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      setIsProcessing(false);

      return true;
    } catch (err: any) {
      setError(err.message || "An error occurred during decryption");
      setIsProcessing(false);
      throw err;
    }
  };

  return {
    isProcessing,
    progress,
    steps,
    error,
    lyapunovExponents,
    encryptAndUpload,
    decryptAndDownload
  };
}
