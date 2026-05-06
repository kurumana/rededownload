async function baixarVideo() {
  const url = document.getElementById('urlInput').value.trim();
  const resultado = document.getElementById('resultado');

  if (!url) {
    resultado.innerHTML = `<p class="text-red-500 text-center">❌ Cole um link válido do Kwai</p>`;
    return;
  }

  resultado.innerHTML = `
    <div class="text-center">
      <p class="text-blue-600">🔄 Analisando vídeo...</p>
    </div>`;

  try {
    // Usando um downloader público confiável (funciona bem em 2026)
    const apiUrl = `https://api.cobalt.tools/api/json`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: url,
        isAudioOnly: false
      })
    });

    const data = await response.json();

    if (data.status === "stream" && data.url) {
      resultado.innerHTML = `
        <div class="bg-green-100 p-5 rounded-2xl text-center">
          <p class="text-green-700 font-semibold mb-4">✅ Vídeo pronto!</p>
          <a href="${data.url}" 
             target="_blank"
             class="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition">
            ⬇️ BAIXAR SEM MARCA D'ÁGUA
          </a>
          <p class="text-xs text-gray-500 mt-4">Clique com botão direito → "Salvar link como..." se preferir</p>
        </div>`;
    } else {
      // Fallback para outro serviço
      resultado.innerHTML = `
        <div class="text-center">
          <p class="text-amber-600">Tentando outro método...</p>
          <a href="https://kuaivideodownloader.com/?url=${encodeURIComponent(url)}" 
             target="_blank"
             class="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-xl">
            Abrir no Downloader Externo
          </a>
        </div>`;
    }
  } catch (error) {
    resultado.innerHTML = `
      <p class="text-red-500 text-center">
        ⚠️ Erro ao processar. Tente novamente ou use o botão abaixo.
      </p>`;
  }
}
