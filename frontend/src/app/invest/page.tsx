import type { Metadata } from 'next';
import InvestPageContent from '@/components/InvestPageContent';

export const metadata: Metadata = {
  title: 'Real Estate Investment',
  description: 'Explore high-ROI real estate investment opportunities across the USA, with market trend data and rental yield estimates.',
};

export default function InvestPage() {
  return <InvestPageContent />;
}
