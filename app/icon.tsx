import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: '7px',
          position: 'relative',
        }}
      >
        {/* Film-strip punch holes */}
        <div
          style={{
            position: 'absolute',
            top: '3px',
            left: '3px',
            width: '4px',
            height: '4px',
            borderRadius: '1px',
            background: 'rgba(255,255,255,0.7)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '3px',
            right: '3px',
            width: '4px',
            height: '4px',
            borderRadius: '1px',
            background: 'rgba(255,255,255,0.7)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '3px',
            left: '3px',
            width: '4px',
            height: '4px',
            borderRadius: '1px',
            background: 'rgba(255,255,255,0.7)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '3px',
            right: '3px',
            width: '4px',
            height: '4px',
            borderRadius: '1px',
            background: 'rgba(255,255,255,0.7)',
          }}
        />

        {/* Play triangle */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="white"
          style={{ marginLeft: '2px' }}
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