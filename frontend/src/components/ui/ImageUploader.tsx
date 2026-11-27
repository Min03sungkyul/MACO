'use client';

import { useEffect, useState } from 'react';

/** 캡처·미션 사진 올리기 (미리보기). 용량 줄이기는 서버가 한다 (긴 변 1568px) */
export function ImageUploader({ onSelect, label = '사진 고르기', disabled }: { onSelect: (file: File) => void; label?: string; disabled?: boolean }) {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  return (
    <label className={`flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-line bg-soft p-4 text-sub ${disabled ? 'opacity-50' : ''}`}>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="고른 사진 미리보기" className="max-h-64 rounded-option object-contain" />
      ) : (
        <span className="text-sm">{label} (JPG·PNG, 10MB 이하)</span>
      )}
      <input type="file" accept="image/jpeg,image/png" className="sr-only" disabled={disabled}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setPreview(URL.createObjectURL(f));
          onSelect(f);
        }} />
    </label>
  );
}
