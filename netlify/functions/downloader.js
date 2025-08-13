exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { url } = JSON.parse(event.body || '{}');
    if (!url) return { statusCode: 400, body: 'Missing url' };
    const provider = detectProvider(url);
    if (provider === 'youtube') {
      const key = process.env.RAPIDAPI_KEY;
      if (!key) return { statusCode: 500, body: 'Missing RAPIDAPI_KEY' };
      const endpoint = 'https://youtube-video-download-api1.p.rapidapi.com/';
      const target = endpoint + '?url=' + encodeURIComponent(url);
      const res = await fetch(target, { headers: { 'x-rapidapi-key': key, 'x-rapidapi-host': 'youtube-video-download-api1.p.rapidapi.com' } });
      if (!res.ok) return { statusCode: res.status, body: await res.text() };
      const data = await res.json().catch(()=>({}));
      const streams = extractStreams(data);
      return json({ streams });
    }
    if (provider === 'facebook') {
      return json({ streams: [], note: 'Facebook support requires implementing a proxy with a supported API.' });
    }
    return json({ streams: [], note: 'Unsupported provider' });
  } catch (e) {
    return { statusCode: 500, body: String(e?.message || e) };
  }
};

function json(bodyObj) {
  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyObj) };
}

function detectProvider(rawUrl) {
  try {
    const u = new URL(rawUrl);
    const h = u.hostname.toLowerCase();
    if (h.includes('youtube.com') || h === 'youtu.be' || h.includes('yewtu.be')) return 'youtube';
    if (h.includes('facebook.com') || h.includes('fb.watch')) return 'facebook';
    return 'unknown';
  } catch { return 'unknown'; }
}

function extractStreams(data) {
  const streams = [];
  try {
    const flat = JSON.stringify(data);
    const urlRegex = /(https?:\\/\\/[^"\s]+)/g;
    const urls = new Set();
    let m;
    while ((m = urlRegex.exec(flat)) !== null) {
      const u = m[1].replace(/\\\//g, '/');
      if (u.includes('googlevideo.com') || u.includes('youtube.com') || u.includes('ytimg.com')) {
        urls.add(u);
      }
    }
    for (const u of urls) streams.push({ url: u });
  } catch {}
  return streams;
}