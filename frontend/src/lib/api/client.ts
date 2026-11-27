/**
 * 서버 호출은 모두 이 api() 로만 한다 (담당: 박민하, docs/01 1-1).
 * - 토큰 첨부, { data } / { error: { code, message } } 처리, 실패는 ApiError
 * - NEXT_PUBLIC_API_MOCK=true 이면 서버 없이 lib/api/mock 의 프로토타입 데이터로 응답한다
 */
import { clearToken, getToken } from '../auth';
import { mockApi } from './mock';

const BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080') + '/api/v1';
export const IS_MOCK = process.env.NEXT_PUBLIC_API_MOCK === 'true';

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiOptions = {
  method?: Method;
  /** JSON 본문 */
  body?: unknown;
  /** 파일 업로드 (multipart) */
  form?: FormData;
};

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const method = opts.method ?? (opts.body || opts.form ? 'POST' : 'GET');
  if (IS_MOCK) {
    return mockApi<T>(method, path, opts.body ?? opts.form);
  }
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';

  let res: Response;
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: opts.form ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined),
    });
  } catch {
    throw new ApiError('NETWORK_ERROR', '서버에 연결하지 못했어요. 인터넷을 확인해 주세요', 0);
  }

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401) clearToken();
    const err = json?.error;
    throw new ApiError(err?.code ?? 'INTERNAL_ERROR', err?.message ?? '잠시 후 다시 시도해 주세요', res.status);
  }
  return json?.data as T;
}
