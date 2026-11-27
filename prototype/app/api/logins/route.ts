import { enabledLogins } from '@/auth';

/** Tells the sign-up sheet which login buttons are connected. */
export function GET() {
  return Response.json(enabledLogins);
}
