'use client';

export default function ForgotPage() {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full">
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 p-12">
          <h1 className="text-3xl font-extrabold text-secondary mb-4">Forgot Password</h1>
          <p className="text-gray-600 mb-6">
            Password reset is not implemented yet. Please contact support or implement a reset flow.
          </p>
          <div className="flex">
            <a
              href="/login"
              className="bg-primary text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all"
            >
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

