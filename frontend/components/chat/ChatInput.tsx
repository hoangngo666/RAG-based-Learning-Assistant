"use client";

import { FormEvent, KeyboardEvent, useState } from "react";

type ChatInputProps = {
  disabled?: boolean;
  sendDisabled?: boolean;
  onSend: (message: string) => void;
};

export function ChatInput({ disabled, sendDisabled, onSend }: ChatInputProps) {
  const [value, setValue] = useState("");

  function submit() {
    const message = value.trim();
    if (!message || disabled || sendDisabled) return;
    setValue("");
    onSend(message);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="shrink-0 border-t border-white/10 bg-transparent px-4 py-4"
    >
      <div className="mx-auto max-w-4xl rounded-[1.7rem] glass p-3 transition-colors">
        <textarea
          aria-label="Chat message"
          className="min-h-16 w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          placeholder={
            sendDisabled
              ? "Upload a ready PDF before asking..."
              : "Ask AIO anything... (Shift+Enter for a new line)"
          }
          value={value}
          rows={2}
          disabled={disabled}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
        />

        <div className="mt-2 flex items-center justify-between gap-3 border-t border-white/10 px-2 pt-3">
          {/* Attach PDF */}
          <button
            type="button"
            disabled
            className="glass-button-secondary rounded-full px-3 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-55"
            aria-label="Attach PDF unavailable"
          >
            <span aria-hidden="true">📎</span>
            <span>Attach PDF</span>
          </button>

          {/* Send */}
          <button
            type="submit"
            disabled={disabled || sendDisabled || !value.trim()}
            className="glass-button-primary rounded-full px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed"
          >
            <span>Send</span>
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>

      <p className="mx-auto mt-3 max-w-4xl text-center text-[11px] text-muted-foreground">
        AIO can make mistakes. Please verify important information.
      </p>
    </form>
  );
}