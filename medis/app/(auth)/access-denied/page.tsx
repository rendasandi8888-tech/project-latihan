export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 rounded-full bg-[#A32D2D]/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🔒</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Access Restricted</h1>
        <p className="text-gray-500 mb-8">
          Your wallet is not registered in this system. Please contact the administrator.
        </p>
        <a
          href="/"
          className="bg-[#185FA5] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#164f8a] transition-colors"
        >
          Back to Home
        </a>
      </div>
    </div>
  )
}
