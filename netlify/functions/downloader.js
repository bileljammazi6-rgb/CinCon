exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { url } = JSON.parse(event.body || '{}');
    if (!url) return { statusCode: 400, body: 'Missing url' };
    const provider = detectProvider(url);

    // Prefer RapidAPI YouTube shortcut when configured
    if (provider === 'youtube' && process.env.RAPIDAPI_KEY) {
      const res = await rapidApiYouTube(url);
      if (res) return json(res);
    }

    // Universal fallback via Apify Actor when configured
    if (process.env.APIFY_TOKEN) {
      const result = await apifyExtract(url);
      return json(result);
    }

    // If still nothing, fallback to RapidAPI if configured
    if (provider === 'youtube' && process.env.RAPIDAPI_KEY) {
      const res = await rapidApiYouTube(url);
      if (res) return json(res);
    }

    // Unsupported
    return json({ streams: [], note: 'Configure APIFY_TOKEN (recommended) or RAPIDAPI_KEY to enable universal downloading.' });
  } catch (e) {
    return { statusCode: 500, body: String(e?.message || e) };
  }
};

async function rapidApiYouTube(url) {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) return null;
  const endpoint = 'https://youtube-video-download-api1.p.rapidapi.com/';
  const target = endpoint + '?url=' + encodeURIComponent(url);
  const res = await fetch(target, { headers: { 'x-rapidapi-key': key, 'x-rapidapi-host': 'youtube-video-download-api1.p.rapidapi.com' } });
  if (!res.ok) return null;
  const data = await res.json().catch(()=>({}));
  const streams = extractStreamsFromObject(data);
  return { streams, provider: 'youtube', raw: data };
}

async function apifyExtract(url) {
  const token = process.env.APIFY_TOKEN;
  const actor = process.env.APIFY_ACTOR || 'andryerica/all-video-downloader';
  // Start run
  const startRes = await fetch(`https://api.apify.com/v2/acts/${encodeURIComponent(actor)}/runs?token=${encodeURIComponent(token)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url })
  });
  if (!startRes.ok) throw new Error('Apify start failed');
  const start = await startRes.json();
  const runId = start?.data?.id;
  if (!runId) throw new Error('Apify run id missing');
  // Poll
  let status = start?.data?.status || 'RUNNING';
  let datasetId = start?.data?.defaultDatasetId;
  const begin = Date.now();
  while (!['SUCCEEDED','FAILED','ABORTED','TIMED-OUT'].includes(status)) {
    if (Date.now() - begin > 60000) break;
    await new Promise(r => setTimeout(r, 1500));
    const sRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${encodeURIComponent(token)}`);
    const s = await sRes.json().catch(()=>({}));
    status = s?.data?.status || status;
    datasetId = s?.data?.defaultDatasetId || datasetId;
  }
  // Fetch items
  let items = [];
  if (datasetId) {
    const dRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${encodeURIComponent(token)}&clean=true&format=json`);
    if (dRes.ok) items = await dRes.json().catch(()=>[]);
  }
  const streams = extractStreamsFromList(items);
  return { streams, items, provider: 'apify', status };
}

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

function extractStreamsFromObject(obj) {
  const streams = [];
  try {
    const flat = JSON.stringify(obj);
    const urlRegex = /(https?:\\/\\/[^"\s]+)/g;
    const urls = new Set();
    let m;
    while ((m = urlRegex.exec(flat)) !== null) {
      const u = m[1].replace(/\\\//g, '/');
      if (u.includes('googlevideo.com') || u.includes('cdn') || u.includes('mp4') || u.includes('m3u8')) {
        urls.add(u);
      }
    }
    for (const u of urls) streams.push({ url: u });
  } catch {}
  return streams;
}

function extractStreamsFromList(items) {
  const streams = [];
  for (const it of Array.isArray(items) ? items : []) {
    // Common fields observed in many downloaders
    if (it.url) streams.push({ url: it.url, quality: it.quality || it.label, mime: it.mime });
    if (Array.isArray(it.downloads)) {
      for (const d of it.downloads) streams.push({ url: d.url || d.link, quality: d.quality || d.label, mime: d.type || d.mime });
    }
    // Fallback: scrape any URLs from JSON
    const more = extractStreamsFromObject(it);
    for (const s of more) streams.push(s);
  }
  // Deduplicate
  const seen = new Set();
  return streams.filter(s => { if (seen.has(s.url)) return false; seen.add(s.url); return true; });
}