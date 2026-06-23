export interface NJCSParams {
  x0: number
  y0: number
  z0: number
  w0: number
  a: number
  b: number
  c: number
  d: number
  dt: number
}

export interface NJCSState {
  x: number
  y: number
  z: number
  w: number
}

// Fungsi 1: Generate parameter NJCS secara fully random
export function generateRandomNJCSParams(): NJCSParams {
  return {
    x0: Math.random(),
    y0: Math.random(),
    z0: Math.random(),
    w0: Math.random(),
    a: 0.6,
    b: 0.3,
    c: 1.0,
    d: 0.1,
    dt: 0.01
  }
}

// Persamaan diferensial untuk New Jerk Chaotic System (Hyperchaotic 4D)
function dx(y: number): number {
  return y;
}

function dy(z: number): number {
  return z;
}

function dz(x: number, y: number, z: number, a: number, b: number, c: number): number {
  // dz/dt = -az - by - x + cÂ·sin(x)
  return -a * z - b * y - x + c * Math.sin(x);
}

function dw(x: number, z: number, w: number, d: number): number {
  // dw/dt = xÂ·z - dÂ·w
  return x * z - d * w;
}

// Fungsi 2: Satu langkah iterasi NJCS menggunakan RK4
export function njcsStep(state: NJCSState, params: NJCSParams): NJCSState {
  const { x, y, z, w } = state;
  const { a, b, c, d, dt } = params;

  // RK4 k1
  const k1x = dx(y);
  const k1y = dy(z);
  const k1z = dz(x, y, z, a, b, c);
  const k1w = dw(x, z, w, d);

  // RK4 k2
  const x2 = x + 0.5 * dt * k1x;
  const y2 = y + 0.5 * dt * k1y;
  const z2 = z + 0.5 * dt * k1z;
  const w2 = w + 0.5 * dt * k1w;
  
  const k2x = dx(y2);
  const k2y = dy(z2);
  const k2z = dz(x2, y2, z2, a, b, c);
  const k2w = dw(x2, z2, w2, d);

  // RK4 k3
  const x3 = x + 0.5 * dt * k2x;
  const y3 = y + 0.5 * dt * k2y;
  const z3 = z + 0.5 * dt * k2z;
  const w3 = w + 0.5 * dt * k2w;

  const k3x = dx(y3);
  const k3y = dy(z3);
  const k3z = dz(x3, y3, z3, a, b, c);
  const k3w = dw(x3, z3, w3, d);

  // RK4 k4
  const x4 = x + dt * k3x;
  const y4 = y + dt * k3y;
  const z4 = z + dt * k3z;
  const w4 = w + dt * k3w;

  const k4x = dx(y4);
  const k4y = dy(z4);
  const k4z = dz(x4, y4, z4, a, b, c);
  const k4w = dw(x4, z4, w4, d);

  // Combine RK4 steps
  return {
    x: x + (dt / 6.0) * (k1x + 2 * k2x + 2 * k3x + k4x),
    y: y + (dt / 6.0) * (k1y + 2 * k2y + 2 * k3y + k4y),
    z: z + (dt / 6.0) * (k1z + 2 * k2z + 2 * k3z + k4z),
    w: w + (dt / 6.0) * (k1w + 2 * k2w + 2 * k3w + k4w),
  };
}

// Fungsi 3: Generate keystream dari NJCS
export function generateKeystream(params: NJCSParams, length: number): Uint8Array {
  let state: NJCSState = {
    x: params.x0,
    y: params.y0,
    z: params.z0,
    w: params.w0
  };

  // Burn transient period (1000 iterasi)
  for (let i = 0; i < 1000; i++) {
    state = njcsStep(state, params);
  }

  const keystream = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    state = njcsStep(state, params);
    // Kombinasi x, y, z, w lebih kuat karena mengikat keempat state dinamis
    // dari hyperchaotic system ke dalam satu byte, meningkatkan entropi dan 
    // menyulitkan state reconstruction attacks dari output sequence tunggal.
    const combined = Math.abs(state.x + state.y + state.z + state.w);
    keystream[i] = Math.floor((combined * 1000000) % 256);
  }

  return keystream;
}

// Fungsi pembantu untuk konversi string <-> Uint8Array
function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Fungsi 4: Enkripsi string dengan NJCS XOR stream cipher
export function njcsEncrypt(plaintext: string, params: NJCSParams): string {
  const plainBytes = stringToBytes(plaintext);
  const keystream = generateKeystream(params, plainBytes.length);
  const cipherBytes = new Uint8Array(plainBytes.length);
  
  for (let i = 0; i < plainBytes.length; i++) {
    cipherBytes[i] = plainBytes[i] ^ keystream[i];
  }
  
  return bytesToHex(cipherBytes);
}

// Fungsi 5: Dekripsi string dengan NJCS
export function njcsDecrypt(ciphertext: string, params: NJCSParams): string {
  const cipherBytes = hexToBytes(ciphertext);
  const keystream = generateKeystream(params, cipherBytes.length);
  const plainBytes = new Uint8Array(cipherBytes.length);
  
  for (let i = 0; i < cipherBytes.length; i++) {
    plainBytes[i] = cipherBytes[i] ^ keystream[i];
  }
  
  return bytesToString(plainBytes);
}

// Fungsi 6: Enkripsi file besar
export async function njcsEncryptFile(
  fileBuffer: ArrayBuffer,
  params: NJCSParams,
  onProgress?: (percent: number) => void
): Promise<ArrayBuffer> {
  const CHUNK_SIZE = 1024 * 1024; // 1MB
  const view = new Uint8Array(fileBuffer);
  const length = view.length;
  const encryptedView = new Uint8Array(length);
  
  let state: NJCSState = { x: params.x0, y: params.y0, z: params.z0, w: params.w0 };
  for (let i = 0; i < 1000; i++) state = njcsStep(state, params);
  
  for (let offset = 0; offset < length; offset += CHUNK_SIZE) {
    const end = Math.min(offset + CHUNK_SIZE, length);
    
    for (let i = offset; i < end; i++) {
      state = njcsStep(state, params);
      const combined = Math.abs(state.x + state.y + state.z + state.w);
      const keyByte = Math.floor((combined * 1000000) % 256);
      encryptedView[i] = view[i] ^ keyByte;
    }
    
    if (onProgress) {
      await new Promise(resolve => setTimeout(resolve, 0));
      onProgress(Math.round((end / length) * 100));
    }
  }
  
  return encryptedView.buffer;
}

// Fungsi 7: Dekripsi file besar
export async function njcsDecryptFile(
  encryptedBuffer: ArrayBuffer,
  params: NJCSParams,
  onProgress?: (percent: number) => void
): Promise<ArrayBuffer> {
  return njcsEncryptFile(encryptedBuffer, params, onProgress);
}

// Fungsi 8: Enkripsi metadata pasien
export function encryptPatientMetadata(metadata: {
  patientName: string
  patientId: string
  birthDate: string
}, params: NJCSParams): {
  encryptedPatientName: string
  encryptedPatientId: string
  encryptedBirthDate: string
} {
  return {
    encryptedPatientName: njcsEncrypt(metadata.patientName, params),
    encryptedPatientId: njcsEncrypt(metadata.patientId, params),
    encryptedBirthDate: njcsEncrypt(metadata.birthDate, params)
  };
}

// Fungsi 9: Dekripsi metadata pasien
export function decryptPatientMetadata(encrypted: {
  encryptedPatientName: string
  encryptedPatientId: string
  encryptedBirthDate: string
}, params: NJCSParams): {
  patientName: string
  patientId: string
  birthDate: string
} {
  return {
    patientName: njcsDecrypt(encrypted.encryptedPatientName, params),
    patientId: njcsDecrypt(encrypted.encryptedPatientId, params),
    birthDate: njcsDecrypt(encrypted.encryptedBirthDate, params)
  };
}

// Fungsi 10: Generate trajectory
export function generateAttractorTrajectory(
  params: NJCSParams,
  iterations: number
): NJCSState[] {
  const trajectory: NJCSState[] = [];
  let state: NJCSState = { x: params.x0, y: params.y0, z: params.z0, w: params.w0 };
  
  for (let i = 0; i < 1000; i++) state = njcsStep(state, params);
  
  for (let i = 0; i < iterations; i++) {
    state = njcsStep(state, params);
    trajectory.push({ ...state });
  }
  
  return trajectory;
}

// Fungsi 11: Compute Lyapunov exponents
export function computeLyapunovExponents(params: NJCSParams): number[] {
  const N = 2000
  const dt = params.dt
  const eps = 1e-6
  let s = { x: params.x0, y: params.y0, z: params.z0, w: params.w0 }
  let d = [
    { x: params.x0 + eps, y: params.y0, z: params.z0, w: params.w0 },
    { x: params.x0, y: params.y0 + eps, z: params.z0, w: params.w0 },
    { x: params.x0, y: params.y0, z: params.z0 + eps, w: params.w0 },
    { x: params.x0, y: params.y0, z: params.z0, w: params.w0 + eps },
  ]
  const lyap = [0, 0, 0, 0]
  for (let i = 0; i < N; i++) {
    s = njcsStep(s, params)
    d = d.map(di => njcsStep(di, params))
    for (let j = 0; j < 4; j++) {
      const dx = d[j].x - s.x, dy = d[j].y - s.y
      const dz = d[j].z - s.z, dw = d[j].w - s.w
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz + dw*dw)
      if (dist > 0) {
        lyap[j] += Math.log(dist / eps)
        const scale = eps / dist
        d[j] = { x: s.x + dx*scale, y: s.y + dy*scale, z: s.z + dz*scale, w: s.w + dw*scale }
      }
    }
  }
  return lyap.map(l => parseFloat((l / (N * dt)).toFixed(4)))
}

// Fungsi 12: Hash file
export async function computeFileHash(fileBuffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Fungsi 13: Verifikasi file
export async function verifyFileIntegrity(
  fileBuffer: ArrayBuffer,
  expectedHash: string
): Promise<boolean> {
  const hash = await computeFileHash(fileBuffer);
  return hash === expectedHash;
}

export function generateAESKeyFromNJCS(params: NJCSParams): Uint8Array {
  return generateKeystream(params, 32);
}

