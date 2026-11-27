/**
 * 로그인 토큰 보관 (담당: 박민하). 브라우저 저장소가 막혀 있어도 앱이 죽지 않게 try/catch.
 */
const KEY = 'maco.token';

export function getToken(): string | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  try {
    window.localStorage.setItem(KEY, token);
  } catch {
    /* 저장이 막혀 있으면 이번 탭에서만 로그인 */
  }
}

export function clearToken() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* 무시 */
  }
}
