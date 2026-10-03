import type { ChatSession } from "@/lib/types";

import { ChatAccountCard } from "./ChatAccountCard";
import { ChatHistoryCard } from "./ChatHistoryCard";

type ChatSidebarProps = {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, title: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onNewSession: () => void;
  onToggleCollapse: () => void;
  isCollapsed: boolean;
  newSessionDisabled: boolean;
  account: {
    initials: string;
    label: string;
    subtitle: string;
  };
};

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onRenameSession,
  onDeleteSession,
  onNewSession,
  onToggleCollapse,
  isCollapsed,
  newSessionDisabled,
  account,
}: ChatSidebarProps) {
  return (
    <aside
      className={`sticky top-0 hidden h-screen self-start overflow-hidden border-r border-white/[0.12] bg-[rgba(8,12,25,0.62)] p-3 shadow-[8px_0_35px_rgba(20,15,60,0.18)] backdrop-blur-[38px] backdrop-saturate-[155%] transition-[padding] duration-300 lg:flex lg:flex-col ${
        isCollapsed ? "items-center px-2" : "p-4"
      }`}
    >
      {/* Ambient light inside the glass sidebar */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-24 -top-20 size-72 rounded-full bg-blue-700/[0.16] blur-[90px]" />
<div className="absolute -right-28 top-[38%] size-80 rounded-full bg-cyan-400/[0.09] blur-[100px]" />
<div className="absolute bottom-[-120px] left-[20%] size-72 rounded-full bg-blue-600/[0.12] blur-[100px]" />

        {/* Subtle glass highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-white/[0.10]" />
      </div>

      {/* Keep sidebar content above ambient glow */}
      <div className="relative z-10 flex h-full min-h-0 w-full flex-col">
        {/* AIO account / brand card */}
        <div
          className={`w-full rounded-3xl border border-white/[0.14] bg-[linear-gradient(135deg,rgba(255,255,255,0.09),rgba(255,255,255,0.035))] shadow-[inset_0_1px_1px_rgba(255,255,255,0.10),0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur-[24px] backdrop-saturate-[150%] transition-[padding,gap] duration-300 ${
            isCollapsed
              ? "flex flex-col items-center gap-3 p-2.5"
              : "p-3"
          }`}
        >
          {isCollapsed ? (
            <>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.13] bg-white/[0.07] text-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.10)]">
                🎓
              </div>

              <button
                type="button"
                onClick={onToggleCollapse}
                className="flex size-9 items-center justify-center rounded-2xl border border-white/[0.12] bg-white/[0.045] text-muted-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.07)] transition hover:border-white/[0.25] hover:bg-white/[0.10] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4 shrink-0"
                >
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
            </>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.13] bg-white/[0.07] text-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.10)]">
                  🎓
                </div>

                <div className="min-w-0">
                  <p className="text-base font-semibold tracking-[-0.03em]">
                    AIO
                  </p>
                  <p className="text-xs text-muted-foreground">AI Tutor</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleCollapse}
                className="flex size-9 shrink-0 items-center justify-center rounded-2xl border border-white/[0.12] bg-white/[0.035] text-muted-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.07)] transition hover:border-white/[0.25] hover:bg-white/[0.09] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4 shrink-0"
                >
                  <path d="m15 6-6 6 6 6" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* New Session */}
        <button
          type="button"
          onClick={onNewSession}
          disabled={newSessionDisabled}
          className={`mt-3 flex items-center justify-center rounded-2xl border border-white/[0.09] bg-[rgba(255,255,255,0.055)] text-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.07),0_6px_20px_rgba(0,0,0,0.08)] backdrop-blur-[20px] transition hover:border-white/[0.18] hover:bg-[rgba(255,255,255,0.10)] hover:text-white disabled:cursor-not-allowed disabled:opacity-65 ${
            isCollapsed
              ? "size-11"
              : "w-full gap-2 px-4 py-3 text-sm font-semibold"
          }`}
          aria-label="New Session"
          title="New Session"
        >
          <span>＋</span>
          {!isCollapsed ? <span>New Session</span> : null}
        </button>

        {/* History */}
        <section
          className={`mt-6 flex min-h-0 flex-1 flex-col ${
            isCollapsed ? "w-full items-center" : ""
          }`}
        >
          {!isCollapsed ? (
            <>
              <p className="px-1 font-mono text-[11px] tracking-[0.2em] text-white/50 uppercase">
                History
              </p>

              <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto rounded-2xl border border-white/[0.10] bg-[rgba(255,255,255,0.035)] p-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-[22px]">
                {sessions.map((chatSession) => (
                  <ChatHistoryCard
                    key={chatSession.id}
                    sessionTitle={chatSession.title ?? "(untitled)"}
                    sessionIdLabel={chatSession.id.slice(0, 8)}
                    isActive={chatSession.id === activeSessionId}
                    onClick={() => onSelectSession(chatSession.id)}
                    onRename={(title) =>
                      onRenameSession(chatSession.id, title)
                    }
                    onDelete={() => onDeleteSession(chatSession.id)}
                    disabled={newSessionDisabled}
                  />
                ))}

                <p className="px-1 pt-1 text-xs leading-5 text-white/45">
                  Saved sessions stay local to this browser in this pass.
                </p>
              </div>
            </>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col items-center gap-2 overflow-y-auto rounded-3xl border border-white/[0.10] bg-[rgba(255,255,255,0.035)] px-2 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-[22px]">
              {sessions.map((chatSession) => {
                const isActive = chatSession.id === activeSessionId;

                return (
                  <button
                    key={chatSession.id}
                    type="button"
                    onClick={() => onSelectSession(chatSession.id)}
                    disabled={newSessionDisabled}
                    className={`inline-flex size-10 items-center justify-center rounded-2xl border text-[11px] font-mono shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] backdrop-blur-[18px] transition disabled:cursor-not-allowed disabled:opacity-65 ${
                      isActive
                        ? "border-accent/50 bg-accent/[0.16] text-accent hover:bg-accent/[0.22]"
                        : "border-white/[0.10] bg-white/[0.045] text-muted-foreground hover:border-white/[0.20] hover:bg-white/[0.09] hover:text-foreground"
                    }`}
                    aria-label={chatSession.title ?? "(untitle)"}
                    title={
                      chatSession.title ?? chatSession.id.slice(0, 8)
                    }
                  >
                    {chatSession.id.slice(0, 2)}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Account */}
        <div className={`mt-5 ${isCollapsed ? "flex justify-center" : ""}`}>
          {isCollapsed ? (
            <button
              type="button"
              className="flex size-11 items-center justify-center rounded-2xl border border-white/[0.12] bg-white/[0.055] text-sm font-semibold text-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-[20px] transition hover:border-white/[0.22] hover:bg-white/[0.10] hover:text-white"
              aria-label={account.label}
              title={`${account.label} · ${account.subtitle}`}
            >
              {account.initials}
            </button>
          ) : (
            <ChatAccountCard
              initials={account.initials}
              label={account.label}
              subtitle={account.subtitle}
            />
          )}
        </div>
      </div>
    </aside>
  );
}