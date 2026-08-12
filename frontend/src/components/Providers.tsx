'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import EnvGuard from '@/components/EnvGuard';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <EnvGuard>{children}</EnvGuard>
    </AuthProvider>
  );
}
