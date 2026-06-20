import { NJCSParams, njcsEncrypt, njcsDecrypt } from './njcs';

export interface KeyEnvelope {
  version: '2.0'
  algorithm: 'NJCS-Hyperchaotic'
  njcsParams: NJCSParams
  fileHash: string
  createdAt: number
  authorizedDepartment: string
  lyapunovExponents?: number[]
}

// Fungsi 1: Buat key envelope
export function createKeyEnvelope(
  njcsParams: NJCSParams,
  fileHash: string,
  authorizedDepartment: string,
  lyapunovExponents?: number[]
): KeyEnvelope {
  return {
    version: '2.0',
    algorithm: 'NJCS-Hyperchaotic',
    njcsParams,
    fileHash,
    createdAt: Date.now(),
    authorizedDepartment,
    lyapunovExponents
  };
}

// Fungsi 2: Serialize ke JSON string
export function serializeKeyEnvelope(envelope: KeyEnvelope): string {
  return JSON.stringify(envelope);
}

// Fungsi 3: Deserialize dari JSON string
export function deserializeKeyEnvelope(json: string): KeyEnvelope {
  return JSON.parse(json) as KeyEnvelope;
}

// Derive parameter NJCS statik dari string (departmentKey) untuk mengenkripsi Key Envelope
function deriveParamsFromKey(key: string): NJCSParams {
  // Simple hash function to derive seeds
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0, ch; i < key.length; i++) {
    ch = key.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  
  // Normalisasi ke range 0..1
  const seed1 = (h1 >>> 0) / 4294967296;
  const seed2 = (h2 >>> 0) / 4294967296;
  const seed3 = ((h1 ^ h2) >>> 0) / 4294967296;
  const seed4 = ((h1 + h2) >>> 0) / 4294967296;

  return {
    x0: seed1 || 0.1,
    y0: seed2 || 0.2,
    z0: seed3 || 0.3,
    w0: seed4 || 0.4,
    a: 0.6,
    b: 0.3,
    c: 1.0,
    d: 0.1,
    dt: 0.01
  };
}

// Fungsi 4: Enkripsi key envelope dengan NJCS
export function encryptKeyEnvelope(
  envelope: KeyEnvelope,
  departmentKey: string
): string {
  const jsonStr = serializeKeyEnvelope(envelope);
  const derivedParams = deriveParamsFromKey(departmentKey);
  return njcsEncrypt(jsonStr, derivedParams);
}

// Fungsi 5: Dekripsi key envelope
export function decryptKeyEnvelope(
  encryptedEnvelope: string,
  departmentKey: string
): KeyEnvelope {
  const derivedParams = deriveParamsFromKey(departmentKey);
  const jsonStr = njcsDecrypt(encryptedEnvelope, derivedParams);
  return deserializeKeyEnvelope(jsonStr);
}
