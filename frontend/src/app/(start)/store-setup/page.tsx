'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Card, EmptyState, PageHeader, QueryView, Spinner } from '@/components/ui';
import { updateSettings, useMe } from '@/lib/api/common';
import { getPracticeStores, registerStore, searchPlaces } from '@/lib/api/store';

/**
 * S3 가게 등록 / 연습 가게 선택 (화면: 주승준, 검색 API: 강민국).
 * TODO(주승준): prototype/app/(onboarding)/store/page.tsx 화면 다듬기
 */
export default function StoreSetupPage() {
  const me = useMe();
  if (me.isPending) return <Spinner />;
  return (
    <main className="flex flex-col gap-5">
      <PageHeader />
      {me.data?.mode === 'LEARNING' ? <PracticePick /> : <StoreSearch />}
    </main>
  );
}

function StoreSearch() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const results = useQuery({ queryKey: ['store', 'search', query], queryFn: () => searchPlaces(query), enabled: query.length > 0 });
  const reg = useMutation({ mutationFn: registerStore, onSuccess: () => router.push('/placement') });
  return (
    <>
      <h1 className="text-2xl font-bold">우리 가게를 찾아 주세요</h1>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); setQuery(q.trim()); }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="가게 이름" aria-label="가게 이름"
          className="flex-1 rounded-option border border-line px-4 py-3 outline-none focus:border-accent" />
        <Button type="submit" full={false}>찾기</Button>
      </form>
      {query && (
        <QueryView query={results} isEmpty={(d) => d.length === 0} empty={{ title: '찾은 가게가 없어요', description: '가게 이름을 다시 확인해 주세요' }}>
          {(list) => (
            <ul className="flex flex-col gap-2">
              {list.map((p) => (
                <li key={`${p.name}-${p.roadAddress}`}>
                  <button type="button" onClick={() => reg.mutate(p)} disabled={reg.isPending} className="w-full rounded-option border border-line p-3 text-left">
                    <b>{p.name}</b>
                    <p className="text-sm text-sub">{p.category} · {p.roadAddress ?? p.address}</p>
                    {p.demo && <p className="text-xs text-accent">시연용 결과</p>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </QueryView>
      )}
    </>
  );
}

function PracticePick() {
  const router = useRouter();
  const stores = useQuery({ queryKey: ['store', 'practice'], queryFn: getPracticeStores });
  const pick = useMutation({ mutationFn: (storeType: string) => updateSettings({ storeType }), onSuccess: () => router.push('/placement') });
  return (
    <>
      <h1 className="text-2xl font-bold">연습 가게를 골라 주세요</h1>
      <QueryView query={stores} isEmpty={(d) => d.length === 0} empty={{ title: '연습 가게가 아직 없어요' }}>
        {(list) => (
          <div className="flex flex-col gap-2">
            {list.map((s) => (
              <Card key={s.id}>
                <b>{s.name}</b>
                <Button className="mt-3" variant="secondary" onClick={() => pick.mutate(s.storeType)}>이 가게로 연습하기</Button>
              </Card>
            ))}
          </div>
        )}
      </QueryView>
      {stores.data?.length === 0 && <EmptyState title="준비 중" />}
    </>
  );
}
