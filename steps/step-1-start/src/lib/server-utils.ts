import 'server-only';
import { getAddress } from 'viem';
import { z } from 'zod';

const cookieSchema = z.object({
  refresh_token: z.string(),
  access_token: z.string(),
  profile: z.object({
    iss: z.string(),
  }),
});

const responseSchema = z.object({
  sub: z.string(),
  eoa: z.string().transform(arg => getAddress(arg)),
  custodian: z.string(),
  chainId: z.number(),
  futurepass: z.string().transform(arg => getAddress(arg)),
});

function parseCookies(cookies?: string | null) {
  if (!cookies) return undefined;
  const key = `fv.user`;
  const cookie = cookies.split('; ').find(x => x.startsWith(key));
  if (!cookie) return undefined;
  const cookieValue = decodeURIComponent(cookie.split('=')[1] ?? '');
  const result = cookieSchema.safeParse(JSON.parse(cookieValue));
  if (!result.success) return undefined;
  return result.data;
}

export async function auth(cookies?: string | null) {
  const parsed = parseCookies(cookies);
  if (!parsed) return null;
  const res = await fetch(`${parsed.profile.iss}/me`, {
    headers: { authorization: `Bearer ${parsed.access_token}` },
  });
  if (!res.ok) return null;
  const json = (await res.json()) as unknown;
  const user = responseSchema.safeParse(json);
  if (!user.success) return null;
  return user.data;
}
