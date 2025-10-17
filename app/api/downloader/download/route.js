import { NextResponse } from 'next/server';

// Rate limiting storage (in-memory, you might want to use Redis in production)
const downloadQueue = new Map();
const RATE_LIMIT_DELAY = 1500; // 1.5 seconds between downloads to be more respectful
const MAX_RETRIES = 3;

// Helper to get OAuth token
async function getOAuthToken() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth`);
    if (!res.ok) {
      throw new Error('Failed to get OAuth token');
    }
    const data = await res.json();
    return data.access_token;
  } catch (error) {
    console.error('OAuth token error:', error);
    throw error;
  }
}

// Download from osu! official mirror
async function downloadFromOsu(beatmapsetId, token) {
  const url = `https://osu.ppy.sh/beatmapsets/${beatmapsetId}/download`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'Mozilla/5.0'
    },
    redirect: 'follow'
  });

  if (response.ok) {
    return await response.blob();
  }
  
  throw new Error(`osu! official: ${response.status} ${response.statusText}`);
}

// Download from Beatconnect mirror (alternative source)
async function downloadFromBeatconnect(beatmapsetId) {
  const url = `https://beatconnect.io/b/${beatmapsetId}`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    },
    redirect: 'follow'
  });

  if (response.ok) {
    return await response.blob();
  }
  
  throw new Error(`Beatconnect: ${response.status} ${response.statusText}`);
}

// Download from Chimu.moe mirror (alternative source)
async function downloadFromChimu(beatmapsetId) {
  const url = `https://api.chimu.moe/v1/download/${beatmapsetId}?n=1`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    },
    redirect: 'follow'
  });

  if (response.ok) {
    return await response.blob();
  }
  
  throw new Error(`Chimu: ${response.status} ${response.statusText}`);
}

// Download from Nerinyan mirror (alternative source)
async function downloadFromNerinyan(beatmapsetId) {
  const url = `https://api.nerinyan.moe/d/${beatmapsetId}`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    },
    redirect: 'follow'
  });

  if (response.ok) {
    return await response.blob();
  }
  
  throw new Error(`Nerinyan: ${response.status} ${response.statusText}`);
}

// Download from Catboy.best mirror (alternative source)
async function downloadFromCatboy(beatmapsetId) {
  const url = `https://catboy.best/d/${beatmapsetId}`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    },
    redirect: 'follow'
  });

  if (response.ok) {
    return await response.blob();
  }
  
  throw new Error(`Catboy: ${response.status} ${response.statusText}`);
}

// Try downloading from multiple sources
async function downloadBeatmapWithFallback(beatmapsetId, token, preferredMirror = 'bancho') {
  // Build sources list based on preferred mirror
  let sources = [];
  
  if (preferredMirror === 'catboy') {
    sources = [
      { name: 'Catboy', fn: () => downloadFromCatboy(beatmapsetId) },
      { name: 'Nerinyan', fn: () => downloadFromNerinyan(beatmapsetId) },
      { name: 'Chimu', fn: () => downloadFromChimu(beatmapsetId) },
      { name: 'Beatconnect', fn: () => downloadFromBeatconnect(beatmapsetId) },
      { name: 'osu!', fn: () => downloadFromOsu(beatmapsetId, token) }
    ];
  } else {
    sources = [
      { name: 'osu!', fn: () => downloadFromOsu(beatmapsetId, token) },
      { name: 'Nerinyan', fn: () => downloadFromNerinyan(beatmapsetId) },
      { name: 'Chimu', fn: () => downloadFromChimu(beatmapsetId) },
      { name: 'Beatconnect', fn: () => downloadFromBeatconnect(beatmapsetId) },
      { name: 'Catboy', fn: () => downloadFromCatboy(beatmapsetId) }
    ];
  }

  let lastError = null;

  for (const source of sources) {
    try {
      console.log(`Trying to download ${beatmapsetId} from ${source.name}...`);
      const blob = await source.fn();
      console.log(`Successfully downloaded ${beatmapsetId} from ${source.name}`);
      return { blob, source: source.name };
    } catch (error) {
      console.error(`Failed to download from ${source.name}:`, error.message);
      lastError = error;
      // Continue to next source
    }
  }

  // If all sources failed, throw the last error
  throw lastError || new Error('All download sources failed');
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { beatmapsetId, mirror = 'bancho' } = body;

    if (!beatmapsetId) {
      return NextResponse.json({ error: 'beatmapsetId is required' }, { status: 400 });
    }

    // Simple rate limiting check
    const now = Date.now();
    const lastDownload = downloadQueue.get('last') || 0;
    
    if (now - lastDownload < RATE_LIMIT_DELAY) {
      const waitTime = RATE_LIMIT_DELAY - (now - lastDownload);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    downloadQueue.set('last', Date.now());

    // Get OAuth token
    const token = await getOAuthToken();

    // Try to download from multiple sources with fallback
    const { blob, source } = await downloadBeatmapWithFallback(beatmapsetId, token, mirror);

    // Return the blob as a downloadable file
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-osu-beatmap-archive',
        'Content-Disposition': `attachment; filename="${beatmapsetId}.osz"`,
        'X-Download-Source': source
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    
    // Check if it's a rate limit error
    if (error.message.includes('429')) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded. Please wait before downloading more beatmaps.',
        retryAfter: 60
      }, { status: 429 });
    }

    // Check if it's a not found error
    if (error.message.includes('404')) {
      return NextResponse.json({ 
        error: 'Beatmap not found or unavailable for download'
      }, { status: 404 });
    }

    return NextResponse.json({ 
      error: 'Failed to download beatmap',
      message: error.message 
    }, { status: 500 });
  }
}
