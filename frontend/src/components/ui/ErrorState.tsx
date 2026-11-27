import { Button } from './Button';

/** 에러 상태: 서버가 준 한국어 메시지 + 다시 시도 */
export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <p className="text-base font-semibold text-ink">문제가 생겼어요</p>
      <p className="text-sm text-sub">{message ?? '잠시 후 다시 시도해 주세요'}</p>
      {onRetry && <Button variant="secondary" onClick={onRetry}>다시 시도</Button>}
    </div>
  );
}
