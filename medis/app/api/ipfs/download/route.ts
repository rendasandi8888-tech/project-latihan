import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { cid } = await request.json();

    if (!cid) {
      return NextResponse.json(
        { error: 'No CID provided' },
        { status: 400 }
      );
    }

    const cleanCid = cid.replace('ipfs://', '');
    const TW_SECRET_KEY = process.env.TW_SECRET_KEY;
    const clientId = process.env.NEXT_PUBLIC_TW_CLIENT_ID;

    let downloadUrl = `https://ipfs.io/ipfs/${cleanCid}`;
    
    if (clientId) {
      downloadUrl = `https://${clientId}.ipfscdn.io/ipfs/${cleanCid}`;
    }

    const res = await fetch(downloadUrl);
    
    if (!res.ok) {
      throw new Error(`Failed to download from IPFS Gateway: ${res.statusText}`);
    }

    const arrayBuffer = await res.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${cleanCid}"`,
      },
    });

  } catch (error: any) {
    console.error('IPFS Download Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
