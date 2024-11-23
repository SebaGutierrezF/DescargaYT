import ytdl from 'ytdl-core';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url);
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Manejar preflight OPTIONS
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (url.pathname === '/info') {
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

    if (url.pathname === '/download') {
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

    return new Response('Not Found', { status: 404 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
} 