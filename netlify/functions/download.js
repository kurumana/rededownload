const fetch = require('node-fetch');

exports.handler = async function(event) {
  const url = event.queryStringParameters.url;

  if (!url || !url.includes('instagram.com')) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Por favor, cole um link válido do Instagram" })
    };
  }

  try {
    // Usando uma API pública gratuita (funciona bem em 2026)
    const apiUrl = `https://api.vevioz.com/api/button/mp4/${encodeURIComponent(url)}`;

    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const data = await response.json();

    // VeVioz costuma retornar em data.url ou data.links
    let downloadUrl = null;

    if (data.url) {
      downloadUrl = data.url;
    } else if (data.links && data.links.length > 0) {
      // Pega o de maior qualidade
      downloadUrl = data.links.sort((a, b) => b.quality - a.quality)[0].url;
    }

    if (downloadUrl) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          downloadUrl: downloadUrl,
          thumbnail: data.thumbnail || null
        })
      };
    }

    // Fallback para outra API
    const fallbackRes = await fetch(`https://dlpanda.com/api?url=${encodeURIComponent(url)}`);
    const fallbackData = await fallbackRes.json();

    if (fallbackData && fallbackData.video) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          downloadUrl: fallbackData.video
        })
      };
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ 
        error: "Não foi possível encontrar o vídeo. Tente outro Reel ou me avise." 
      })
    };

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Erro ao processar. O Instagram pode estar bloqueando temporariamente." 
      })
    };
  }
};
