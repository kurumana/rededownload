const fetch = require('node-fetch');

exports.handler = async function(event) {
  const url = event.queryStringParameters.url;

  if (!url || !url.includes('instagram.com')) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Link inválido" })
    };
  }

  try {
    // Método mais estável atualmente: usar cabeçalhos bons e tentar extrair
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9'
      }
    });

    const html = await response.text();

    // Tenta encontrar links de vídeo no HTML (método comum)
    const videoRegex = /"video_url":"([^"]+)"/;
    const match = html.match(videoRegex);

    if (match && match[1]) {
      const videoUrl = match[1].replace(/\\/g, '');
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          downloadUrl: videoUrl,
          type: "video"
        })
      };
    }

    // Fallback: tentar outros padrões
    const altRegex = /"content_url":"([^"]+)"|"url":"(https:\/\/[^"]+\.mp4[^"]*)"/g;
    const altMatch = [...html.matchAll(altRegex)];

    if (altMatch.length > 0) {
      const videoUrl = altMatch[0][1] || altMatch[0][2];
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          downloadUrl: videoUrl.replace(/\\/g, ''),
          type: "video"
        })
      };
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ 
        error: "Não foi possível extrair o vídeo. Instagram mudou o layout." 
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro interno: " + error.message })
    };
  }
};