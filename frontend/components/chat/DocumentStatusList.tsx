import type { DocumentRead } from "@/lib/types";

const statusStyles: Record<DocumentRead["status"], string> = {
  pending: "border-white/30 bg-white/15 text-white/90",
  processing: "border-white/45 bg-white/25 text-white",
  ready: "border-emerald-200/50 bg-emerald-300/25 text-emerald-50",
  failed: "border-red-200/50 bg-red-400/25 text-red-50",
};

export function DocumentStatusList({ documents }: { documents: DocumentRead[] }) {
  if (documents.length === 0) {
    return (
      // Text bọc trong <span> để nằm trên lớp ánh sáng của .glass
      <div className="glass rounded-2xl p-4">
        <span className="block text-xs leading-5 text-white/85">
          No documents attached yet. Uploaded PDFs will appear here as session files.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {documents.map((document) => (
        <div key={document.id} className="glass rounded-2xl p-3.5">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/30 bg-white/15 text-sm text-white">
              PDF
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="truncate text-sm font-medium text-white">{document.name}</p>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase ${statusStyles[document.status]}`}>
                  {document.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-white/75">
                {document.page_count ? `${document.page_count} pages indexed` : "Page count pending"}
              </p>
              {document.error_message ? (
                <p className="mt-2 text-xs leading-5 text-red-100">{document.error_message}</p>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}