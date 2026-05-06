const fetch = require('node-fetch');

exports.handler = async function(event) {
  const url = event.queryStringParameters.url;

  if (!url || !url.includes('instagram.com')) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Link do Instagram inválido" })
    };
  }

  const apis = [
    // 1. DLPanda (muito usado e estável)
    `https://dlpanda.com/api?url=${encodeURIComponent(url)}`,

    // 2. Outra API pública comum
    `https://api.vevioz.com/api/button/mp4/${encodeURIComponent(url)}`,

    // 3. Fallback simples (pode retornar HTML, mas tentamos extrair)
    url
  ];

  for (let apiUrl of apis) {
    try {
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/html'
        },
        timeout: 15000
      });

      const contentType = response.headers.get('content-type') || '';
      let data;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const html = await response.text();
        // Tenta extrair link de vídeo do HTML (método reserva)
        const videoMatch = html.match(/"(https?:\/\/[^"]+\.mp4[^"]*)"/i) || 
                          html.match(/(https?:\/\/[^\s"']+\.mp4[^\s"']*)/i);
        
        if (videoMatch) {
          return {
            statusCode: 200,
            body: JSON.stringify({
              success: true,
              downloadUrl: videoMatch[1] || videoMatch[0],
              source: "html-extract"
            })
          };
        }
        continue;
      }

      // Tratamento para DLPanda e similares
      if (data && (data.video || data.url || data.download || data.links)) {
        const downloadUrl = data.video || data.url || 
                          (data.links && data.links[0] && data.links[0].url) ||
                          (Array.isArray(data) && data[0]?.url);

        if (downloadUrl) {
          return {
            statusCode: 200,
            body: JSON.stringify({
              success: true,
              downloadUrl: downloadUrl,
              thumbnail: data.thumbnail || data.image || null,
              source: "dlpanda/vevioz"
            })
          };
        }
      }
    } catch (e) {
      console.log("API falhou, tentando próxima...");
    }
  }

  // Último recurso: redirecionar para um site confiável
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: false,
      fallback: true,
      message: "Use um destes sites confiáveis:",
      links: [
        `https://snapinsta.to/?url=${encodeURIComponent(url)}`,
        `https://dlpanda.com/instagram?url=${encodeURIComponent(url)}`,
        `https://saveinsta.to/?url=${encodeURIComponent(url)}`
      ]
    })
  };
};
