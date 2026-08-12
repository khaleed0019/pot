'use client';

import PropertiesMap from '@/components/PropertiesMap';
import { useProperties } from '@/lib/useProperties';

/** Client wrapper so the server-rendered homepage can show the for-sale map. */
export default function HomeSaleMap() {
  const { properties, loading, error } = useProperties('SALE');
  return <PropertiesMap properties={properties} loading={loading} error={error} height="550px" />;
}
