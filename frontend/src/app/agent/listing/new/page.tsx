'use client';

import PropertyWizard from '@/components/PropertyWizard';
import { LayoutDashboard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewListingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <Link 
              href="/agent/dashboard" 
              className="inline-flex items-center gap-2 text-gray-500 hover:text-primary font-bold mb-4 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" /> Back to Dashboard
            </Link>
            <h1 className="text-4xl font-extrabold text-secondary">Create New Listing</h1>
            <p className="text-gray-500 mt-2">Follow the steps below to create a premium property listing.</p>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold text-secondary uppercase tracking-wider">Agent Wizard v1.0</span>
          </div>
        </div>

        <PropertyWizard />
      </div>
    </div>
  );
}
