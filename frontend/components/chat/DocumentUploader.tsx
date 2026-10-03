"use client";

import type { ChangeEvent, DragEvent } from "react";

export function DocumentUploader({ disabled, onUpload }: { disabled?: boolean; onUpload: (file: File) => void }) {
  function uploadFile(file?: File) {
    if (!file || disabled) return;
    onUpload(file);
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    uploadFile(file);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    uploadFile(event.dataTransfer.files?.[0]);
  }

  function onDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
  }

  return (
    // Khung ngoài: kính trắng đục giống nút "Attach PDF" (glass-button-secondary).
    <label
      onDrop={onDrop}
      onDragOver={onDragOver}
      className="glass-button-secondary group w-full cursor-pointer flex-col rounded-3xl p-2 text-center has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-90"
    >
      {/* Khung trong: thêm lớp trắng đục + viền nét đứt */}
      <span className="block w-full rounded-[1.25rem] border border-dashed border-white/60 bg-white/25 p-5 transition-colors group-hover:border-white/85 group-hover:bg-white/30">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-white/50 bg-white/35 text-2xl text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
          ⇧
        </span>
        <span className="mt-4 block text-sm font-semibold text-white">Tap to select a PDF file</span>
        <span className="mt-2 block text-xs leading-5 text-white/95">
          Drag and drop lecture slides, notes, or textbook PDFs here.
        </span>
        <span className="mt-3 block font-mono text-[11px] text-white/85">
          Max 10MB · First 30 pages will be read
        </span>
        <input
          className="sr-only"
          type="file"
          accept="application/pdf,.pdf"
          disabled={disabled}
          onChange={onChange}
        />
      </span>
    </label>
  );
}