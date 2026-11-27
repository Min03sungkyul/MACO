import { NextRequest } from 'next/server';
import { handlers } from '@/auth';

// When the server listens on 0.0.0.0 (so a phone on the same Wi-Fi can reach it),
// Next.js gives Auth.js "0.0.0.0" as the host and the login would redirect there.
// Rebuild the request URL from the Host header the phone actually used.
async function withRealHost(req: NextRequest) {
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  if (!host) return req;
  const url = new URL(req.url);
  if (url.host === host) return req;
  url.host = host;
  const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.text();
  return new NextRequest(url, { method: req.method, headers: req.headers, body });
}

export async function GET(req: NextRequest) {
  return handlers.GET(await withRealHost(req));
}

export async function POST(req: NextRequest) {
  return handlers.POST(await withRealHost(req));
}
