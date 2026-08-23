'use client';

import { useRef, useState, useEffect } from 'react';
import { getImageUrl } from '@/lib/utils';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  posterPath: string | null;
  rating?: number;
  year?: string;
  type?: 'movie' | 'tv';
}

export default function ShareCardModal({
  isOpen,
  onClose,
  title,
  posterPath,
  rating,
  year,
  type = 'movie',
}: ShareCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);
  const [cardDataUrl, setCardDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCardDataUrl(null);
      return;
    }

    const drawCard = async () => {
      setGenerating(true);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // الأبعاد القياسية للستوري (Story 9:16 Aspect Ratio)
      canvas.width = 1080;
      canvas.height = 1920;

      // خلفية متدرجة سينمائية
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
      bgGrad.addColorStop(0, '#0a0a12');
      bgGrad.addColorStop(0.5, '#12121e');
      bgGrad.addColorStop(1, '#050508');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // رسم الشعار في الأعلى
      ctx.fillStyle = '#e63946';
      ctx.font = 'bold 50px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CINEMAY', 540, 160);

      ctx.fillStyle = '#9ca3af';
      ctx.font = '30px sans-serif';
      ctx.fillText('Watch Movies & Series Online', 540, 215);

      // رسم بوستر العمل
      if (posterPath) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = getImageUrl(posterPath, 'w780');

          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });

          // حواف مستديرة للبوستر
          const x = 140;
          const y = 300;
          const w = 800;
          const h = 1120;
          const radius = 36;

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + w - radius, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
          ctx.lineTo(x + w, y + h - radius);
          ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
          ctx.lineTo(x + radius, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
          ctx.clip();

          ctx.drawImage(img, x, y, w, h);
          ctx.restore();

          // تأثير الظل الخارجي للبوستر
          ctx.strokeStyle = 'rgba(255,255,255,0.1)';
          ctx.lineWidth = 4;
          ctx.stroke();
        } catch {
          // في حال فشل تحميل الصورة يكمل الرسم
        }
      }

      // شارة النوع والسنة (Badge)
      const badgeText = `${type.toUpperCase()} • ${year ?? '2026'}`;
      ctx.fillStyle = 'rgba(230, 57, 70, 0.9)';
      ctx.beginPath();
      ctx.roundRect(540 - 140, 1460, 280, 56, 28);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(badgeText, 540, 1498);

      // عنوان الفيلم/المسلسل
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 56px sans-serif';
      ctx.textAlign = 'center';
      const cleanTitle = title.length > 28 ? title.slice(0, 28) + '...' : title;
      ctx.fillText(cleanTitle, 540, 1590);

      // التقييم إذا وجد
      if (rating) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 40px sans-serif';
        ctx.fillText(`★ ${rating.toFixed(1)} / 10`, 540, 1660);
      }

      // رابط الموقع في الأسفل
      ctx.fillStyle = '#6b7280';
      ctx.font = '32px sans-serif';
      ctx.fillText('cinemay.online', 540, 1790);

      const url = canvas.toDataURL('image/png');
      setCardDataUrl(url);
      setGenerating(false);
    };

    drawCard();
  }, [isOpen, title, posterPath, rating, year, type]);

  const handleDownload = () => {
    if (!cardDataUrl) return;
    const link = document.createElement('a');
    link.download = `${title.replace(/\s+/g, '_')}_CineMay_Card.png`;
    link.href = cardDataUrl;
    link.click();
  };

  const handleShare = async () => {
    if (!cardDataUrl) return;
    if (navigator.share) {
      try {
        const blob = await (await fetch(cardDataUrl)).blob();
        const file = new File([blob], `${title}_card.png`, { type: 'image/png' });
        await navigator.share({
          title: `Watch ${title} on CineMay`,
          files: [file],
        });
      } catch {
        handleDownload();
      }
    } else {
      handleDownload();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#12121a] border border-white/10 rounded-2xl max-w-sm w-full p-5 relative shadow-2xl flex flex-col items-center">
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
        >
          ✕
        </button>

        <h3 className="text-white font-bold text-lg mb-3">Share Story Card</h3>

        {/* مخفي: Canvas الحقيقي للرسم بجودة فائقة */}
        <canvas ref={canvasRef} className="hidden" />

        {/* المعاينة المصغرة */}
        <div className="relative w-full aspect-[9/16] bg-[#0a0a0f] rounded-xl overflow-hidden border border-white/5 flex items-center justify-center mb-4">
          {generating || !cardDataUrl ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-[#e63946] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-500">Generating HD Card...</span>
            </div>
          ) : (
            <img src={cardDataUrl} alt="Preview" className="w-full h-full object-contain" />
          )}
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex gap-2 w-full">
          <button
            onClick={handleDownload}
            disabled={generating || !cardDataUrl}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#1a1a24] hover:bg-[#252535] text-white border border-white/10 transition-colors disabled:opacity-40"
          >
            Download Card
          </button>
          <button
            onClick={handleShare}
            disabled={generating || !cardDataUrl}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#e63946] hover:bg-[#c1121f] text-white transition-colors disabled:opacity-40"
          >
            Share / Story
          </button>
        </div>
      </div>
    </div>
  );
}