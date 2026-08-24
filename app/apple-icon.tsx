import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#e63946',
          borderRadius: '38px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '18px',
            left: '18px',
            width: '20px',
            height: '20px',
            borderRadius: '6px',
            background: 'rgba(255,255,255,0.7)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            width: '20px',
            height: '20px',
            borderRadius: '6px',
            background: 'rgba(255,255,255,0.7)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '18px',
            left: '18px',
            width: '20px',
            height: '20px',
            borderRadius: '6px',
            background: 'rgba(255,255,255,0.7)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '18px',
            right: '18px',
            width: '20px',
            height: '20px',
            borderRadius: '6px',
            background: 'rgba(255,255,255,0.7)',
          }}
        />

        <svg
          width="88"
          height="88"
          viewBox="0 0 24 24"
          fill="white"
          style={{ marginLeft: '8px' }}
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}