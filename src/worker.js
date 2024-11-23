import ytdl from 'ytdl-core';

const corsHeaders = {
  'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS,
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
};

class YouTubeAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async getVideoInfo(videoId) {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${this.apiKey}`
    );
    return response.json();
  }
}

export default {
  async fetch(request, env) {
    const youtubeAPI = new YouTubeAPI(env.YOUTUBE_API_KEY);
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    try {
      switch (url.pathname) {
        case '/info':
          return await handleVideoInfo(url, youtubeAPI, corsHeaders);
        case '/download':
          return await handleDownload(url, env.DOWNLOAD_SERVER, corsHeaders);
        default:
          return new Response('Not Found', { status: 404, headers: corsHeaders });
      }
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }
  }
}; 