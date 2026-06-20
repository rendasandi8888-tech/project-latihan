export async function uploadToIPFS(file: Blob, filename?: string): Promise<string> {
  // Dalam realisasi ini dipanggil dari API route app/api/ipfs/upload/route.ts
  // karena Thirdweb SDK butuh secret key yang hanya boleh di server-side.
  
  const formData = new FormData();
  if (filename) {
    formData.append('file', file, filename);
  } else {
    formData.append('file', file);
  }
  
  const response = await fetch('/api/ipfs/upload', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`Failed to upload to IPFS: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.cid;
}

export async function downloadFromIPFS(cid: string): Promise<ArrayBuffer> {
  // Dipanggil melalui API route untuk proxy download atau direct
  const response = await fetch('/api/ipfs/download', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ cid })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to download from IPFS: ${response.statusText}`);
  }
  
  return await response.arrayBuffer();
}

export function getIPFSUrl(cid: string): string {
  // Menggunakan default public gateway jika tidak via API
  const cleanCid = cid.replace('ipfs://', '');
  return `https://ipfs.io/ipfs/${cleanCid}`;
}
