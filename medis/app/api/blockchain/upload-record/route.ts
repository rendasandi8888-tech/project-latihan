import { NextRequest, NextResponse } from 'next/server'
import { privateKeyToAccount } from 'thirdweb/wallets'
import { prepareContractCall, sendTransaction, waitForReceipt, getContract } from 'thirdweb'
import { client, monadTestnet } from '@/lib/blockchain/client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const privateKey = process.env.SYSTEM_WALLET_PRIVATE_KEY
    if (!privateKey) {
      return NextResponse.json({ error: 'System wallet not configured' }, { status: 500 })
    }

    const account = privateKeyToAccount({ client, privateKey: privateKey as `0x${string}` })

    const medicalRecordContract = getContract({
      client,
      chain: monadTestnet,
      address: process.env.NEXT_PUBLIC_MEDICAL_RECORD_ADDRESS!,
    })

    const transaction = prepareContractCall({
      contract: medicalRecordContract,
      method: 'function uploadRecord((address patientAddress, string encryptedPatientName, string encryptedPatientId, string encryptedBirthDate, string modality, string bodyPart, uint256 studyDate, string department, string dicomCID, string keyEnvelopeCID, string fileHash) params) returns (uint256 recordId)',
      params: [{
        patientAddress: body.patientAddress,
        encryptedPatientName: body.encryptedPatientName,
        encryptedPatientId: body.encryptedPatientId,
        encryptedBirthDate: body.encryptedBirthDate,
        modality: body.modality,
        bodyPart: body.bodyPart,
        studyDate: BigInt(body.studyDate),
        department: body.department,
        dicomCID: body.dicomCID,
        keyEnvelopeCID: body.keyEnvelopeCID,
        fileHash: body.fileHash,
      }],
    })

    const { transactionHash } = await sendTransaction({ transaction, account })
    await waitForReceipt({ client, chain: monadTestnet, transactionHash })

    const { readContract } = await import('thirdweb')
    const total = await readContract({
      contract: medicalRecordContract,
      method: 'function totalRecords() view returns (uint256)',
      params: [],
    })

    return NextResponse.json({ txHash: transactionHash, recordId: Number(total) })
  } catch (error: any) {
    console.error('Upload record error:', error)
    return NextResponse.json({ error: error.message || 'Transaction failed' }, { status: 500 })
  }
}
