import { CitationPill } from "./CitationPill";

import { parseCitations } from "@/lib/citations";
import type { ChatMessage } from "@/lib/types";

/*
 * Lục giác bo góc (đỉnh hướng lên) để ôm theo logo HCMUT.
 */
const HEX_POLYGON =
  "polygon(38.74% 5.63%,41.56% 4.40%,44.37% 3.52%,47.19% 2.99%,50.00% 2.81%,52.81% 2.99%,55.63% 3.52%,58.44% 4.40%,61.26% 5.63%,88.74% 19.37%,91.38% 20.87%,93.67% 22.54%,95.60% 24.38%,97.19% 26.41%,98.42% 28.61%,99.30% 30.98%,99.82% 33.53%,100.00% 36.26%,100.00% 63.74%,99.82% 66.47%,99.30% 69.02%,98.42% 71.39%,97.19% 73.59%,95.60% 75.62%,93.67% 77.46%,91.38% 79.13%,88.74% 80.63%,61.26% 94.37%,58.44% 95.60%,55.63% 96.48%,52.81% 97.01%,50.00% 97.19%,47.19% 97.01%,44.37% 96.48%,41.56% 95.60%,38.74% 94.37%,11.26% 80.63%,8.62% 79.13%,6.33% 77.46%,4.40% 75.62%,2.81% 73.59%,1.58% 71.39%,0.70% 69.02%,0.18% 66.47%,0.00% 63.74%,0.00% 36.26%,0.18% 33.53%,0.70% 30.98%,1.58% 28.61%,2.81% 26.41%,4.40% 24.38%,6.33% 22.54%,8.62% 20.87%,11.26% 19.37%)";

function HcmutLogo() {
  return (
    <div
      className="relative mx-auto"
      style={{ width: "11rem", height: "12.7rem" }}
    >
      {/* Bóng đổ mềm phía sau */}
      <div
        aria-hidden="true"
        className="absolute inset-x-5 top-7 bottom-0 rounded-full bg-indigo-900/35 blur-2xl"
      />

      {/* Viền sáng của kính */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-white/75 via-white/20 to-white/55"
        style={{ clipPath: HEX_POLYGON }}
      />

      {/* Mặt kính liquid glass */}
      <div className="absolute inset-[2px]">
        <div
          className="glass h-full w-full"
          style={{ clipPath: HEX_POLYGON }}
        />
      </div>

      {/* Logo: phóng to để bù phần trong suốt thừa của file ảnh.
          Chỉnh vị trí bằng -translate-x / -translate-y bên dưới. */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src="/hcmut-logo.png"
          alt="HCMUT"
          className="w-[120%] max-w-none -translate-x-[5%] object-contain drop-shadow-[0_4px_10px_rgba(20,40,140,0.4)]"
        />
      </div>
    </div>
  );
}

function AioMark() {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-muted text-sm text-accent">
      ✦
    </span>
  );
}

function AssistantText({ message }: { message: ChatMessage }) {
  const citationsByIndex = new Map(
    (message.citations ?? []).map((citation) => [citation.index, citation]),
  );

  return (
    <p className="whitespace-pre-wrap text-[15px] leading-7 text-foreground/90">
      {parseCitations(message.content).map((part, index) =>
        part.type === "text" ? (
          <span key={index}>{part.text}</span>
        ) : (
          <CitationPill
            key={index}
            citation={citationsByIndex.get(part.index)}
          />
        ),
      )}

      {message.isStreaming ? (
        <span className="ml-1 text-accent">▋</span>
      ) : null}
    </p>
  );
}

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  if (messages.length === 0) {
    return (
      <div className="flex min-h-full items-center justify-center px-6 py-12 text-center">
        <div className="mx-auto max-w-xl">
          <HcmutLogo />

          <h2 className="mt-7 text-3xl font-semibold tracking-[-0.04em] text-white">
            Upload your study material to begin 🎓
          </h2>

          <p className="mt-3 text-sm leading-6 text-white/85">
            AIO reads PDFs like lecture slides, textbooks, and notes so every
            answer can stay grounded in your study material.
          </p>

          {/* Ô xanh dương đậm (không phải glass) */}
          <div className="mt-7 rounded-3xl border border-white/20 bg-gradient-to-br from-[#1d4ed8] to-[#1e3a8a] p-5 text-left shadow-[0_20px_50px_rgba(20,30,120,0.35),inset_0_1px_0_rgba(255,255,255,0.25)]">
            <p className="text-sm font-medium text-white">
              Or type your question directly below
            </p>

            <p className="mt-2 text-xs leading-5 text-white/85">
              Ask AIO to summarize concepts, explain confusing sections, or
              generate study prompts once a PDF is ready.
            </p>

            <p className="mt-4 text-xs text-white/75">
              ✦ Generate flashcards from your document to review later
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-6 py-8">
      {messages.map((message) =>
        message.role === "assistant" ? (
          <article key={message.id} className="flex items-start gap-4">
            <AioMark />

            <div className="min-w-0 flex-1 pt-1">
              <AssistantText message={message} />
            </div>
          </article>
        ) : (
          <article key={message.id} className="flex justify-end">
            <p className="max-w-[75%] whitespace-pre-wrap rounded-[1.6rem] rounded-br-md bg-accent px-5 py-3 text-sm leading-6 text-white">
              {message.content}
            </p>
          </article>
        ),
      )}
    </div>
  );
}