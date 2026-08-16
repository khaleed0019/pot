import type { Metadata } from 'next';
import LoginPageContent from '@/components/LoginPageContent';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Property On Set account.',
  robots: { index: false },
};

export default function LoginPage() {
  return <LoginPageContent />;
}
