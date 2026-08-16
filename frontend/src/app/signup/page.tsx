import type { Metadata } from 'next';
import SignupPageContent from '@/components/SignupPageContent';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a free Property On Set account to save listings, contact agents, and list your own property.',
  robots: { index: false },
};

export default function SignupPage() {
  return <SignupPageContent />;
}
