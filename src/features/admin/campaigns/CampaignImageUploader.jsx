import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { cn } from '../../../lib/utils';
import { uploadCampaignImage } from './useAdminCampaigns';

/**
 * Çoklu görsel yükleyici.
 * `value` → mevcut URL dizisi, `onChange(nextUrls)` ile değişiklikleri bildirir.
 */
export default function CampaignImageUploader({ value = [], onChange }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setProgress(0);
    try {
      const uploaded = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name}: sadece görsel dosyaları yüklenebilir.`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name}: maksimum 5 MB olmalı.`);
          continue;
        }
        // eslint-disable-next-line no-await-in-loop
        const { url } = await uploadCampaignImage(file, {
          onProgress: (p) =>
            setProgress(Math.round(((i + p / 100) / files.length) * 100)),
        });
        uploaded.push(url);
      }
      if (uploaded.length > 0) {
        onChange([...value, ...uploaded]);
        toast.success(`${uploaded.length} görsel yüklendi.`);
      }
    } catch (err) {
      toast.error(`Yükleme hatası: ${err.message}`);
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeAt = (index) => {
    const next = [...value];
    next.splice(index, 1);
    onChange(next);
  };

  const move = (from, to) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {value.map((url, idx) => (
          <div
            key={url + idx}
            className="group relative aspect-video overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container"
          >
            <img src={url} alt="" className="h-full w-full object-cover" />
            {idx === 0 && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-on-primary">
                Kapak
              </span>
            )}
            <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => move(idx, idx - 1)}
                disabled={idx === 0}
                className="rounded-lg bg-white/90 p-1.5 text-gray-700 disabled:opacity-30"
                title="Sola taşı"
              >
                <span className="material-symbols-outlined text-[16px]">
                  arrow_back
                </span>
              </button>
              <button
                type="button"
                onClick={() => move(idx, idx + 1)}
                disabled={idx === value.length - 1}
                className="rounded-lg bg-white/90 p-1.5 text-gray-700 disabled:opacity-30"
                title="Sağa taşı"
              >
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
              </button>
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="rounded-lg bg-error p-1.5 text-on-error"
                title="Sil"
              >
                <span className="material-symbols-outlined text-[16px]">
                  delete
                </span>
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            'flex aspect-video flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-outline-variant/50 bg-surface-container-low text-on-surface-variant transition-colors',
            !uploading && 'hover:border-primary hover:text-primary',
            uploading && 'cursor-not-allowed opacity-60',
          )}
        >
          {uploading ? (
            <>
              <span className="material-symbols-outlined animate-pulse">
                cloud_upload
              </span>
              <span className="text-xs">Yükleniyor… %{progress}</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">add_photo_alternate</span>
              <span className="text-xs">Görsel Ekle</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <p className="text-xs text-on-surface-variant/80">
        İlk görsel kapak olarak kullanılır. Max 5 MB / görsel. PNG, JPG, WebP.
      </p>
    </div>
  );
}
