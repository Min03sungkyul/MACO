'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button, Card, PageHeader, QueryView, useXpToast } from '@/components/ui';
import { updateSettings, useMe } from '@/lib/api/common';
import { resetDemo, skipDays } from '@/lib/api/me';
import { clearToken } from '@/lib/auth';

/**
 * S26 설정: 모드 전환, 목표, 시연 도구(날짜 넘기기·4주 넘기기·초기화) (담당: 박민하).
 * TODO(박민하): 공개 범위·리그 끄기·습관 고리 바꾸기, 시연 도구는 숨김 메뉴로
 */
export default function SettingsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useXpToast();
  const me = useMe();
  const refresh = () => qc.invalidateQueries();
  const mode = useMutation({ mutationFn: updateSettings, onSuccess: () => { refresh(); toast('바꿨어요'); } });
  const skip = useMutation({ mutationFn: skipDays, onSuccess: (r) => { refresh(); toast(`오늘은 ${r.today}`); } });
  const reset = useMutation({ mutationFn: resetDemo, onSuccess: () => { refresh(); toast('시연 계정을 처음으로 돌렸어요'); } });
  return (
    <main className="flex flex-col gap-4">
      <PageHeader title="설정" />
      <QueryView query={me}>
        {(m) => (
          <>
            <Card className="flex flex-col gap-2">
              <h2 className="font-bold">모드</h2>
              <Button variant="secondary" disabled={mode.isPending} onClick={() => mode.mutate({ mode: m.mode === 'STORE' ? 'LEARNING' : 'STORE' })}>
                {m.mode === 'STORE' ? '학습 모드로 바꾸기' : '내 가게 모드로 바꾸기'}
              </Button>
            </Card>
            <Card className="flex flex-col gap-2">
              <h2 className="font-bold">하루 목표</h2>
              <div className="grid grid-cols-3 gap-2">
                {[30, 60, 120].map((g) => (
                  <Button key={g} variant={m.dailyGoalXp === g ? 'primary' : 'secondary'} onClick={() => mode.mutate({ dailyGoalXp: g })}>{g} XP</Button>
                ))}
              </div>
            </Card>
            {m.demo && (
              <Card className="flex flex-col gap-2">
                <h2 className="font-bold">시연 도구</h2>
                <p className="text-xs text-sub">오늘 {m.today}</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="secondary" disabled={skip.isPending} onClick={() => skip.mutate(1)}>하루 넘기기</Button>
                  <Button variant="secondary" disabled={skip.isPending} onClick={() => skip.mutate(28)}>4주 넘기기</Button>
                </div>
                <Button variant="ghost" disabled={reset.isPending} onClick={() => reset.mutate()}>처음 상태로</Button>
              </Card>
            )}
            <Button variant="ghost" onClick={() => { clearToken(); qc.clear(); router.replace('/login'); }}>로그아웃</Button>
          </>
        )}
      </QueryView>
    </main>
  );
}
