import React from 'react';

interface BeforeAfterDisplayProps {
  original: {
    patientName: string
    patientId: string
    birthDate: string
  }
  encrypted: {
    encryptedPatientName: string
    encryptedPatientId: string
    encryptedBirthDate: string
  }
}

export default function BeforeAfterDisplay({ original, encrypted }: BeforeAfterDisplayProps) {
  return (
    <div className="flex flex-col space-y-4 w-full">
      <div className="flex flex-col md:flex-row gap-4">
        
        {/* Left Column - Plaintext */}
        <div className="flex-1 rounded-xl overflow-hidden border border-gray-200">
          <div className="bg-[#EAF3DE] p-3 border-b border-gray-200 font-semibold text-gray-800">
            PLAINTEXT
          </div>
          <div className="bg-white p-4 space-y-3">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Patient Name</div>
              <div className="text-gray-900 font-medium">{original.patientName || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Patient ID</div>
              <div className="text-gray-900 font-medium">{original.patientId || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Birth Date</div>
              <div className="text-gray-900 font-medium">{original.birthDate || '-'}</div>
            </div>
          </div>
        </div>

        {/* Right Column - Ciphertext */}
        <div className="flex-1 rounded-xl overflow-hidden border border-gray-800">
          <div className="bg-[#1a1a3a] p-3 border-b border-gray-800 font-mono text-sm text-[#378ADD] font-semibold flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            NJCS CIPHERTEXT
          </div>
          <div className="bg-[#0d0d1a] p-4 space-y-3 font-mono text-sm">
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Encrypted Name</div>
              <div className="text-[#378ADD] break-all leading-relaxed">
                {encrypted.encryptedPatientName || '-'}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Encrypted ID</div>
              <div className="text-[#378ADD] break-all leading-relaxed">
                {encrypted.encryptedPatientId || '-'}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Encrypted Date</div>
              <div className="text-[#378ADD] break-all leading-relaxed">
                {encrypted.encryptedBirthDate || '-'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs text-gray-600 flex flex-col space-y-1">
        <div><span className="font-semibold text-gray-700">Algorithm:</span> New Jerk Hyperchaotic System (4D)</div>
        <div><span className="font-semibold text-gray-700">Keystream:</span> 4-dimensional chaotic orbit</div>
      </div>
    </div>
  );
}
