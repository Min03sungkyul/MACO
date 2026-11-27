'use client';

import { useState } from 'react';
import { ItemStep } from '@/components/training/ItemStep';
import { Card, LinkButton, PageHeader, QueryView } from '@/components/ui';
import { useWrongNotes } from '@/lib/api/exam';

/** S13 오답 노트: 틀린 문제 다시 풀기 (담당: 이동성). TODO(이동성): prototype/app/(flow)/test/notes/page.tsx */
export default function NotesPage() {
  const notes = useWrongNotes();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <main className="flex flex-col gap-4">
      <PageHeader title="오답 노트" />
      <QueryView query={notes} isEmpty={(d) => d.length === 0}
        empty={{ title: '오답이 없어요', description: '틀린 문제는 여기 모였다가 1일 → 3일 → 7일 뒤에 다시 나와요', action: <LinkButton href="/exam/quiz">쪽지시험 풀기</LinkButton> }}>
        {(list) => {
          const current = list.find((n) => n.item.id === open);
          if (current) {
            return <ItemStep item={current.item} context="WRONG_NOTE" nextLabel="목록으로" onDone={() => setOpen(null)} />;
          }
          return (
            <ul className="flex flex-col gap-2">
              {list.map((n) => (
                <li key={n.item.id}>
                  <Card as="div">
                    <p className="line-clamp-2 whitespace-pre-line font-semibold">{n.item.prompt}</p>
                    <p className="mt-1 text-xs text-sub">틀린 횟수 {n.wrongCount} · 다음 복습 {n.nextReviewDate}</p>
                    <button type="button" className="mt-2 text-sm font-semibold text-accent" onClick={() => setOpen(n.item.id)}>다시 풀기</button>
                  </Card>
                </li>
              ))}
            </ul>
          );
        }}
      </QueryView>
    </main>
  );
}
