import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { txHash } = await request.json();

    if (!txHash) {
      return NextResponse.json(
        { error: 'No transaction hash provided' },
        { status: 400 }
      );
    }

    // Simulasi verifikasi transaksi di Monad Testnet
    // Pada realisasinya kita akan memanggil RPC node dengan ethers/viem
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return NextResponse.json({ 
      verified: true,
      network: "Monad Testnet",
      txHash: txHash,
      timestamp: Date.now(),
      status: "SUCCESS",
      blockNumber: Math.floor(Math.random() * 1000000) + 5000000
    });

  } catch (error: any) {
    console.error('Verify TX Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
