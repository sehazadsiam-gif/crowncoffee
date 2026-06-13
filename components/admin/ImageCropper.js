"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImageBlob from "./cropImage";

export default function ImageCropper({ file, aspect = 4 / 3, onCancel, onUploaded }) {
  const [prevFile, setPrevFile] = useState(file);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Reset crop state whenever a new file is handed in (render-time adjustment,
  // avoids calling setState from inside an effect).
  if (file !== prevFile) {
    setPrevFile(file);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setError("");
    setUploading(false);
  }

  const imageSrc = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    if (!imageSrc) return undefined;
    return () => URL.revokeObjectURL(imageSrc);
  }, [imageSrc]);

  const onCropComplete = useCallback((_area, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  async function handleSave() {
    if (!imageSrc || !croppedAreaPixels) return;
    setUploading(true);
    setError("");

    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      const formData = new FormData();
      formData.append("file", blob, "menu-item.jpg");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed. Try again.");
        setUploading(false);
        return;
      }

      onUploaded(data.url);
    } catch {
      setError("Upload failed. Try again.");
      setUploading(false);
    }
  }

  if (!file || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/60 p-4">
      <div className="flex w-full max-w-lg flex-col gap-4 rounded-2xl bg-[var(--card)] p-5 shadow-2xl">
        <div>
          <h3 className="font-display text-lg">Crop photo</h3>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            Drag to reposition, use the slider to zoom. This crop is exactly how it will appear on the site.
          </p>
        </div>

        <div className="relative h-72 w-full overflow-hidden rounded-xl bg-[var(--ink)]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold tracking-[0.2em] text-[var(--mute)] uppercase">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="flex-1 accent-[var(--accent)]"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={uploading}
            className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--accent)] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={uploading}
            className="rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-[var(--paper)] transition hover:bg-[var(--accent)] disabled:opacity-60"
          >
            {uploading ? "Uploading\u2026" : "Use photo"}
          </button>
        </div>
      </div>
    </div>
  );
}
