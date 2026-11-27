'use client';

import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { Spinner } from './Spinner';

/**
 * 데이터 화면의 로딩·에러·빈 상태를 한 번에 (frontend/AGENTS.md 화면 규칙).
 * <QueryView query={q} isEmpty={(d) => d.length === 0} empty={{ title: '...' }}>{(data) => ...}</QueryView>
 */
export function QueryView<T>({ query, children, isEmpty, empty }: {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
  isEmpty?: (data: T) => boolean;
  empty?: { title: string; description?: string; action?: ReactNode };
}) {
  if (query.isPending) return <Spinner />;
  if (query.isError) return <ErrorState message={query.error.message} onRetry={() => query.refetch()} />;
  if (isEmpty?.(query.data)) return <EmptyState title={empty?.title ?? '아직 없어요'} description={empty?.description} action={empty?.action} />;
  return <>{children(query.data)}</>;
}
