import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const TW_SECRET_KEY = process.env.TW_SECRET_KEY;
    if (!TW_SECRET_KEY) {
      // Untuk tujuan demo jika tidak ada secret key, return fake CID
      console.warn("TW_SECRET_KEY not set, returning mock CID");
      return NextResponse.json({ 
        cid: "ipfs://QmMockCID" + Math.random().toString(36).substring(7),
        url: "https://ipfs.io/ipfs/QmMockCID" 
      });
    }

    // Menggunakan fetch langsung ke Thirdweb Storage API
    const thirdwebFormData = new FormData();
    thirdwebFormData.append('file', file);

    const uploadRes = await fetch('https://storage.thirdweb.com/ipfs/upload', {
      method: 'POST',
      headers: {
        'x-secret-key': TW_SECRET_KEY
      },
      body: thirdwebFormData
    });

    if (!uploadRes.ok) {
      throw new Error(`Thirdweb upload failed: ${uploadRes.statusText}`);
    }

    const data = await uploadRes.json();
    const cid = data.IpfsHash || data.cid || data[0]?.IpfsHash;

    if (!cid) {
      throw new Error("Failed to get CID from Thirdweb response");
    }

    const ipfsCid = cid.startsWith('ipfs://') ? cid : `ipfs://${cid}`;

    return NextResponse.json({ 
      cid: ipfsCid,
      url: `https://ipfs.io/ipfs/${cid.replace('ipfs://', '')}`
    });

  } catch (error: any) {
    console.error('IPFS Upload Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
