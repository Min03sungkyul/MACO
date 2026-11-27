'use client';

import { useState } from 'react';

/** 상황극 입력칸 */
export function ChatInput({ onSend, disabled, placeholder = '사장님 답을 써 보세요' }: { onSend: (text: string) => void; disabled?: boolean; placeholder?: string }) {
  const [text, setText] = useState('');
  const send = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText('');
  };
  return (
    <div className="flex gap-2 border-t border-line bg-bg p-3">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} maxLength={500} disabled={disabled} placeholder={placeholder}
        aria-label="답 쓰기" className="flex-1 resize-none rounded-option border border-line px-3 py-2 outline-none focus:border-accent" />
      <button type="button" onClick={send} disabled={disabled || !text.trim()} className="rounded-option bg-accent px-4 font-semibold text-bg disabled:bg-off">보내기</button>
    </div>
  );
}
