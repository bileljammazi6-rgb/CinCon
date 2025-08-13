export type Provider = 'pixeldrain' | 'youtube' | 'facebook' | 'unknown';

export type StreamInfo = {
  url: string;
  quality?: string;
  mime?: string;
  size?: string;
  audioOnly?: boolean;
};

// If deploying on Netlify, set RAPIDAPI_KEY in Netlify env, and use this function route.
const PROXY_ENDPOINT = (import.meta as any).env?.VITE_DOWNLOADER_ENDPOINT as string | undefined || '/.netlify/functions/downloader';

const PIPED_INSTANCES = [
  'https://piped.video',
  'https://pipedapi.kavin.rocks',
  'https://piped.video.hostux.net',
  'https://piped.garudalinux.org'
];

export function detectProvider(rawUrl: string): Provider {
  try {
    const u = new URL(rawUrl);
    const h = u.hostname.toLowerCase();
    if (h.includes('pixeldrain.com')) return 'pixeldrain';
    if (h.includes('youtube.com') || h === 'youtu.be' || h.includes('yewtu.be')) return 'youtube';
    if (h.includes('facebook.com') || h.includes('fb.watch')) return 'facebook';
    return 'unknown';
  } catch { return 'unknown'; }
}

export async function getPixeldrainInfo(rawUrl: string): Promise<{ name?: string; size?: number; downloadUrl: string }> {
  const m = rawUrl.match(/pixeldrain\.com\/(?:u|api\/file|file)\/([a-zA-Z0-9]+)/);
  const id = m?.[1];
  if (!id) return { downloadUrl: rawUrl };
  try {
    const infoRes = await fetch(`https://pixeldrain.com/api/file/${id}/info`);
    if (!infoRes.ok) throw new Error('Pixeldrain info error');
    const info = await infoRes.json();
    return { name: info?.name, size: info?.size, downloadUrl: `https://pixeldrain.com/api/file/${id}/download` };
  } catch {
    return { downloadUrl: `https://pixeldrain.com/api/file/${id}/download` };
  }
}

function extractYouTubeId(url: string): string | undefined {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1);
    if (u.searchParams.get('v')) return u.searchParams.get('v') || undefined;
    const m1 = u.pathname.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
    if (m1) return m1[1];
    const m2 = u.pathname.match(/\/watch\/([a-zA-Z0-9_-]+)/);
    if (m2) return m2[1];
  } catch {}
  return undefined;
}

export async function getYouTubeStreams(rawUrl: string): Promise<StreamInfo[]> {
  const id = extractYouTubeId(rawUrl);
  if (!id) throw new Error('Invalid YouTube URL');
  let lastErr: any;
  for (const base of PIPED_INSTANCES) {
    try {
      const res = await fetch(`${base}/api/v1/streams/${id}`);
      if (!res.ok) throw new Error(`Failed on ${base}`);
      const data = await res.json();
      const combine = (arr: any[] | undefined, audioOnly = false) => (arr || []).map((s: any) => ({
        url: s.url,
        quality: s.quality || s.qualityLabel,
        mime: s.mimeType || s.type,
        size: s.size ? String(s.size) : undefined,
        audioOnly
      } as StreamInfo));
      const out = [
        ...combine(data?.videoStreams, false),
        ...combine(data?.audioStreams, true)
      ];
      if (out.length) return out;
    } catch (e) { lastErr = e; continue; }
  }
  throw new Error(lastErr?.message || 'Failed to fetch streams');
}

export async function getViaProxy(rawUrl: string): Promise<StreamInfo[]> {
  const endpoint = PROXY_ENDPOINT;
  const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: rawUrl }) });
  if (!res.ok) throw new Error('Proxy error');
  const data = await res.json();
  const streams: StreamInfo[] = (data?.streams || []).map((s: any) => ({ url: s.url, quality: s.quality, mime: s.mime, size: s.size, audioOnly: !!s.audioOnly }));
  return streams;
}