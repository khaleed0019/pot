import { ImageResponse } from 'next/og';

export const alt = 'Property On Set — Buy, Rent, Sell, and Invest in Real Estate';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontWeight: 800,
              color: 'white',
            }}
          >
            P
          </div>
          <div style={{ fontSize: 44, fontWeight: 800, color: 'white' }}>Property On Set</div>
        </div>
        <div
          style={{
            fontSize: 30,
            color: '#cbd5e1',
            textAlign: 'center',
            maxWidth: 820,
            display: 'flex',
          }}
        >
          Buy, Rent, Sell, and Invest in Real Estate Across the USA
        </div>
      </div>
    ),
    { ...size }
  );
}
