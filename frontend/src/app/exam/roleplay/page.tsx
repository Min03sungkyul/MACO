'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge, Button, Card, ChatBubble, ChatInput, LinkButton, PageHeader, QueryView, useXpToast } from '@/components/ui';
import { finishRoleplay, getScenarios, sendRoleplayTurn, startRoleplay } from '@/lib/api/exam';
import type { RoleplayFinishResponse, RoleplayTurn } from '@/lib/types/exam';

/**
 * S14 AI 손님 상황극: 3턴 대화 → 루브릭 리포트 (담당: 이동성, AI는 강민국의 AiClient).
 * AI가 FALLBACK이어도(규칙 대본) 끝까지 동작한다.
 * TODO(이동성): prototype/app/(flow)/test/roleplay/page.tsx (리포트 연출, 고칠 문장 다시 써 보기)
 */
export default function RoleplayPage() {
  const router = useRouter();
  const { showXp } = useXpToast();
  const scenarios = useQuery({ queryKey: ['exam', 'scenarios'], queryFn: getScenarios });
  const [session, setSession] = useState<{ id: number; notice: string } | null>(null);
  const [turns, setTurns] = useState<RoleplayTurn[]>([]);
  const [ended, setEnded] = useState(false);
  const [report, setReport] = useState<RoleplayFinishResponse | null>(null);

  const start = useMutation({
    mutationFn: startRoleplay,
    onSuccess: (s) => { setSession({ id: s.sessionId, notice: s.notice }); setTurns(s.turns); },
  });
  const send = useMutation({
    mutationFn: (text: string) => sendRoleplayTurn(session!.id, text),
    onMutate: (text) => setTurns((t) => [...t, { role: 'owner', text }]),
    onSuccess: (r) => {
      if (r.customerText) setTurns((t) => [...t, { role: 'customer', text: r.customerText! }]);
      if (r.last) setEnded(true);
    },
  });
  const finish = useMutation({ mutationFn: () => finishRoleplay(session!.id), onSuccess: (r) => { setReport(r); showXp(r.xp); } });

  return (
    <main className="flex min-h-dvh flex-col gap-4">
      <PageHeader title="상황극" close onBack={() => router.push('/exam')} />
      <QueryView query={scenarios} isEmpty={(d) => d.length === 0} empty={{ title: '상황극이 아직 없어요' }}>
        {(list) => {
          if (!session) {
            const s = list[0];
            return (
              <Card className="flex flex-col gap-3">
                <h2 className="text-lg font-bold">{s.title}</h2>
                <p className="text-sm text-sub">{s.persona}</p>
                <Button variant="accent" disabled={start.isPending} onClick={() => start.mutate(s.id)}>대화 시작</Button>
              </Card>
            );
          }
          if (report) {
            return (
              <Card className="flex flex-col gap-3">
                <p className="text-4xl font-black text-accent">{report.report.score}점</p>
                <ul className="flex flex-wrap gap-2">{report.report.checks.map((c) => <li key={c.key}><Badge tone={c.ok ? 'good' : 'neutral'}>{c.ok ? '✓' : '·'} {c.label}</Badge></li>)}</ul>
                <p><b>잘한 점</b> {report.report.good}</p>
                {report.report.lines.map((l, i) => (
                  <div key={i} className="rounded-option bg-soft p-3 text-sm"><p className="text-sub">{l.turn}번째 답: {l.text}</p><p className="mt-1"><b>고칠 점</b> {l.fix}</p></div>
                ))}
                <LinkButton href="/exam" variant="secondary">시험 홈으로</LinkButton>
              </Card>
            );
          }
          return (
            <>
              <p className="rounded-option bg-accent-soft px-3 py-2 text-xs text-accent">{session.notice}</p>
              <div className="flex flex-1 flex-col gap-3">{turns.map((t, i) => <ChatBubble key={i} role={t.role} text={t.text} />)}</div>
              {ended ? (
                <Button variant="accent" disabled={finish.isPending} onClick={() => finish.mutate()}>리포트 받기</Button>
              ) : (
                <ChatInput disabled={send.isPending} onSend={(t) => send.mutate(t)} />
              )}
              {(send.isError || finish.isError) && <p role="alert" className="text-sm text-bad">{(send.error ?? finish.error)?.message}</p>}
            </>
          );
        }}
      </QueryView>
    </main>
  );
}
