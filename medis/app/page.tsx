'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Link, Lock, FileImage } from 'lucide-react';
import { ConnectButton, useActiveAccount } from 'thirdweb/react';
import { client, monadTestnet } from '@/lib/blockchain/client';
import { getUserRole } from '@/lib/blockchain/contracts';

export default function LandingPage() {
  const account = useActiveAccount();
  const router = useRouter();

  useEffect(() => {
    async function checkRoleAndRedirect() {
      if (account?.address) {
        try {
          const roleId = await getUserRole(account.address);
          switch (roleId) {
            case 1:
              router.push('/admin');
              break;
            case 2:
              router.push('/doctor');
              break;
            case 3:
              router.push('/staff');
              break;
            case 4:
              router.push('/patient');
              break;
            default:
              router.push('/access-denied');
          }
        } catch (error) {
          console.error("Failed to check role", error);
          router.push('/access-denied');
        }
      }
    }

    checkRoleAndRedirect();
  }, [account, router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-[#F0F7FF]">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#185FA5] flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-none">MediChain Radiology</p>
            <p className="text-xs text-gray-500 leading-none mt-0.5">Blockchain-Secured Medical Imaging</p>
          </div>
        </div>
        <a
          href="/verify"
          className="text-sm text-[#185FA5] hover:underline"
        >
          Verify a Record
        </a>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-[#185FA5]/10 text-[#185FA5] rounded-full px-4 py-1.5 text-xs font-medium mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse" />
          Live on Monad Testnet · Chain ID 10143
        </div>

        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-4">
          Blockchain-Secured<br />
          <span className="text-[#185FA5]">Medical Imaging</span>
        </h1>

        <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
          Protect patient privacy with chaos theory encryption on Monad Testnet.
          Every DICOM record immutably stored and verifiable.
        </p>

        <div className="flex items-center justify-center gap-4">
          <ConnectButton
            client={client}
            chain={monadTestnet}
            connectButton={{
              label: "Connect Wallet",
              className: "bg-[#185FA5] !text-white px-8 py-3 rounded-lg font-medium hover:bg-[#164f8a] transition-colors"
            }}
          />
          <a
            href="/verify"
            className="border border-gray-200 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center"
          >
            Verify a Record
          </a>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-4xl mx-auto px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-[#185FA5]/10 flex items-center justify-center mb-4">
              <Link className="w-5 h-5 text-[#185FA5]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Blockchain Secured</h3>
            <p className="text-sm text-gray-500">
              Every record immutably stored on Monad Testnet with on-chain verification.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-[#1D9E75]/10 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5 text-[#1D9E75]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Chaos Encryption</h3>
            <p className="text-sm text-gray-500">
              New Jerk Chaotic System protects sensitive patient data with NJCS + AES-256-GCM.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-[#BA7517]/10 flex items-center justify-center mb-4">
              <FileImage className="w-5 h-5 text-[#BA7517]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">DICOM Native</h3>
            <p className="text-sm text-gray-500">
              Full support for CT Scan and X-Ray DICOM format with metadata extraction.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-8 py-4">
          <p className="text-center text-xs text-gray-400 font-mono">
            Live on Monad Testnet · Chain ID 10143 · AES-256-GCM + NJCS Encryption · IPFS Storage
          </p>
        </div>
      </section>
    </main>
  );
}
