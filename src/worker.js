import ytdl from 'ytdl-core';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
};

function handleError(error) {
  return new Response(JSON.stringify({ error: error.message }), {
    status: 500,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}

function handleOptions(request) {
  return new Response(null, {
    headers: {
      ...corsHeaders,
      'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers'),
    }
  });
}

async function handleVideoInfo(url) {
  const videoUrl = url.searchParams.get('url');
  const info = await ytdl.getInfo(videoUrl);
  
  const qualities = info.formats
    .filter(format => format.hasVideo && format.hasAudio)
    .map(({ itag, qualityLabel, container }) => ({
      itag,
      qualityLabel,
      container
    }));

  return new Response(JSON.stringify({
    title: info.videoDetails.title,
    thumbnail: info.videoDetails.thumbnails[0].url,
    qualities
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}

async function handleDownload(url) {
  const videoUrl = url.searchParams.get('url');
  const quality = url.searchParams.get('quality');
  const format = url.searchParams.get('format');

  const info = await ytdl.getInfo(videoUrl);
  const stream = ytdl(videoUrl, {
    quality: quality || 'highest',
    filter: format === 'mp3' ? 'audioonly' : 'audioandvideo'
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      'Content-Type': format === 'mp3' ? 'audio/mpeg' : 'video/mp4',
      'Content-Disposition': `attachment; filename="${info.videoDetails.title}.${format}"`
    }
  });
}

async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }

  const url = new URL(request.url);

  try {
    switch (url.pathname) {
      case '/info':
        return await handleVideoInfo(url);
      case '/download':
        return await handleDownload(url);
      default:
        return new Response('Not Found', { 
          status: 404,
          headers: corsHeaders
        });
    }
  } catch (error) {
    return handleError(error);
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
}); 