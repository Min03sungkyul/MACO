'use client';

import { useMutation } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge, Button, Card, ImageUploader, LinkButton, PageHeader, QueryView, useXpToast } from '@/components/ui';
import { submitMission, useMissions } from '@/lib/api/store';
import type { MissionFeedback } from '@/lib/types/store';

/**
 * S19 실전 미션 제출·첨삭 (통과 +50 XP, 담당: 강민국). 마코는 대신 써 주지 않고 첨삭만 한다.
 * TODO(강민국): prototype/app/(flow)/shop/mission/[id]/page.tsx
 */
export default function MissionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showXp } = useXpToast();
  const missions = useMissions();
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fb, setFb] = useState<MissionFeedback | null>(null);
  const submit = useMutation({
    mutationFn: () => submitMission(Number(id), { text, file: file ?? undefined }),
    onSuccess: (r) => { setFb(r); showXp(r.xp); },
  });
  return (
    <main className="flex flex-col gap-4">
      <PageHeader title="실전 미션" close onBack={() => router.push('/store')} />
      <QueryView query={missions} isEmpty={(l) => !l.some((m) => m.id === Number(id))} empty={{ title: '미션을 찾을 수 없어요' }}>
        {(list) => {
          const m = list.find((x) => x.id === Number(id))!;
          return (
            <>
              <h1 className="text-xl font-bold">{m.title}</h1>
              <p className="text-sm text-sub">{m.description}</p>
              {m.submitType === 'PHOTO' ? (
                <ImageUploader onSelect={setFile} label="사진 고르기" disabled={submit.isPending} />
              ) : (
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} maxLength={500} placeholder="리뷰에 달 답글을 직접 써 보세요" aria-label="답글"
                  className="rounded-option border border-line p-3 outline-none focus:border-accent" />
              )}
              {!fb && <Button variant="accent" disabled={submit.isPending || (m.submitType === 'PHOTO' ? !file : text.trim().length < 8)} onClick={() => submit.mutate()}>첨삭 받기</Button>}
              {submit.isError && <p role="alert" className="text-sm text-bad">{submit.error.message}</p>}
              {fb && (
                <Card className={fb.feedback.pass ? 'bg-good-soft' : 'bg-bad-soft'}>
                  <h2 className="font-bold">{fb.feedback.pass ? '첨삭 통과! 🎉' : '한 번만 다시 해 봐요'}</h2>
                  <ul className="my-2 flex flex-wrap gap-2">{fb.feedback.checks.map((c) => <li key={c.key}><Badge tone={c.ok ? 'good' : 'neutral'}>{c.ok ? '✓' : '·'} {c.label}</Badge></li>)}</ul>
                  <p className="text-[15px]"><b>잘한 점</b> {fb.feedback.good}</p>
                  {fb.feedback.fix && <p className="text-[15px]"><b>고칠 점</b> {fb.feedback.fix}</p>}
                  <div className="mt-3">{fb.feedback.pass ? <LinkButton href="/store">내 가게로</LinkButton> : <Button variant="secondary" onClick={() => setFb(null)}>다시 하기</Button>}</div>
                </Card>
              )}
            </>
          );
        }}
      </QueryView>
    </main>
  );
}
