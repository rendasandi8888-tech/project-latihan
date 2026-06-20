import React from 'react';

export interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  details?: string;
  subDetails?: string[];
}

interface EncryptionProgressProps {
  steps: ProgressStep[];
}

export default function EncryptionProgress({ steps }: EncryptionProgressProps) {
  return (
    <div className="w-full bg-[#0a0a14] p-6 rounded-xl border border-gray-800 font-mono text-sm">
      <div className="mb-4 text-gray-400 text-xs tracking-wider uppercase">
        Encryption Process Log
      </div>
      <div className="space-y-4">
        {steps.map((step, index) => {
          
          let icon = (
            <div className="w-5 h-5 rounded-full border border-gray-600 flex items-center justify-center flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-transparent"></span>
            </div>
          );
          let textColor = "text-gray-500";
          
          if (step.status === 'completed') {
            icon = (
              <div className="w-5 h-5 rounded-full bg-[#1D9E75]/20 border border-[#1D9E75] flex items-center justify-center flex-shrink-0 text-[#1D9E75]">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
            );
            textColor = "text-white";
          } else if (step.status === 'in-progress') {
            icon = (
              <div className="w-5 h-5 rounded-full border-2 border-t-[#378ADD] border-r-transparent border-b-[#378ADD] border-l-transparent animate-spin flex-shrink-0">
              </div>
            );
            textColor = "text-[#378ADD]";
          } else if (step.status === 'error') {
            icon = (
              <div className="w-5 h-5 rounded-full bg-red-900/30 border border-red-500 flex items-center justify-center flex-shrink-0 text-red-500">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </div>
            );
            textColor = "text-red-400";
          }

          return (
            <div key={step.id} className="flex flex-col">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{icon}</div>
                <div className="flex flex-col flex-1">
                  <div className={`${textColor}`}>
                    {step.label}
                    {step.details && <span className="ml-2 text-gray-500">· {step.details}</span>}
                  </div>
                  {step.subDetails && step.subDetails.length > 0 && (
                    <div className="mt-1 ml-2 pl-3 border-l border-gray-700 space-y-1">
                      {step.subDetails.map((sub, idx) => (
                        <div key={idx} className="text-gray-400 text-xs">
                          {sub}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Vertical connector line (except for last item) */}
              {index < steps.length - 1 && (
                <div className="ml-2.5 w-px h-4 bg-gray-800 my-1"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
