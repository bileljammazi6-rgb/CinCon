export type Provider = 'pixeldrain' | 'youtube' | 'facebook' | 'unknown';

export type StreamInfo = {
  url: string;
  quality?: string;
  mime?: string;
  size?: string;
  audioOnly?: boolean;
};

const PROXY_ENDPOINT = (import.meta as any).env?.VITE_DOWNLOADER_ENDPOINT as string | undefined;

export function detectProvider(rawUrl: string): Provider {
  try {
    const u = new URL(rawUrl);
    const h = u.hostname.toLowerCase();
    if (h.includes('pixeldrain.com')) return 'pixeldrain';
    if (h.includes('youtube.com') || h === 'youtu.be') return 'youtube';
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
    const m = u.pathname.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
    if (m) return m[1];
  } catch {}
  return undefined;
}

export async function getYouTubeStreams(rawUrl: string): Promise<StreamInfo[]> {
  const id = extractYouTubeId(rawUrl);
  if (!id) throw new Error('Invalid YouTube URL');
  const base = 'https://piped.video';
  const res = await fetch(`${base}/api/v1/streams/${id}`);
  if (!res.ok) throw new Error('Failed to fetch streams');
  const data = await res.json();
  const combine = (arr: any[] | undefined, audioOnly = false) => (arr || []).map((s: any) => ({
    url: s.url,
    quality: s.quality || s.qualityLabel,
    mime: s.mimeType || s.type,
    size: s.size ? String(s.size) : undefined,
    audioOnly
  } as StreamInfo));
  return [
    ...combine(data?.videoStreams, false),
    ...combine(data?.audioStreams, true)
  ];
}

export async function getViaProxy(rawUrl: string): Promise<StreamInfo[]> {
  if (!PROXY_ENDPOINT) throw new Error('No proxy endpoint configured');
  const res = await fetch(PROXY_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: rawUrl }) });
  if (!res.ok) throw new Error('Proxy error');
  const data = await res.json();
  const streams: StreamInfo[] = (data?.streams || []).map((s: any) => ({ url: s.url, quality: s.quality, mime: s.mime, size: s.size, audioOnly: !!s.audioOnly }));
  return streams;
}