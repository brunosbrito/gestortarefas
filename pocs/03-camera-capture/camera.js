// POC 3: Captura de Foto via Câmera - GML Logística

let stream = null;
let currentFacingMode = 'environment'; // 'user' (frontal) ou 'environment' (traseira)
let photos = [];
let permissionGranted = false;
let permissionAttempts = 0;

// Estatísticas
let stats = {
  total: 0,
  legible: 0,
  totalSize: 0,
  permissionAttempts: 0,
  permissionGranted: 0,
};

// Iniciar câmera
async function startCamera() {
  log('📷 Solicitando permissão de câmera...', 'info');
  updateStatusBar('requesting', 'Solicitando permissão...');

  stats.permissionAttempts++;

  try {
    // Solicitar permissão
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: currentFacingMode,
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    });

    // Permissão concedida
    permissionGranted = true;
    stats.permissionGranted++;
    log('✅ Permissão de câmera concedida', 'success');
    updateStatusBar('granted', 'Câmera ativa');

    // Conectar stream ao elemento de vídeo
    const video = document.getElementById('videoElement');
    video.srcObject = stream;

    // Habilitar botões
    document.getElementById('startCameraBtn').disabled = true;
    document.getElementById('captureBtn').disabled = false;
    document.getElementById('switchCameraBtn').disabled = false;
    document.getElementById('stopCameraBtn').disabled = false;

    log(`📹 Câmera ativa (modo: ${currentFacingMode === 'environment' ? 'traseira' : 'frontal'})`, 'success');
  } catch (error) {
    log(`❌ Permissão de câmera NEGADA: ${error.message}`, 'error');
    updateStatusBar('no-permission', 'Permissão negada - Veja instruções abaixo');

    // Exibir tutorial
    alert(
      '⚠️ Permissão de Câmera Negada\n\n' +
        'Para usar a câmera, você precisa permitir o acesso:\n\n' +
        'Chrome/Edge: Clique no ícone 🔒 ao lado da URL → Câmera → Permitir\n' +
        'Safari iOS: Ajustes → Safari → Câmera → Permitir\n' +
        'Chrome Android: Configurações → Sites → Câmera → Permitir\n\n' +
        'Depois, recarregue a página e tente novamente.'
    );
  }

  updateStats();
}

// Parar câmera
function stopCamera() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;

    const video = document.getElementById('videoElement');
    video.srcObject = null;

    log('⏹️ Câmera desligada', 'info');
    updateStatusBar('', 'Câmera parada');

    // Desabilitar botões
    document.getElementById('startCameraBtn').disabled = false;
    document.getElementById('captureBtn').disabled = true;
    document.getElementById('switchCameraBtn').disabled = true;
    document.getElementById('stopCameraBtn').disabled = true;
  }
}

// Trocar câmera (frontal/traseira)
async function switchCamera() {
  // Parar stream atual
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }

  // Alternar modo
  currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';

  // Reiniciar câmera
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: currentFacingMode,
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    });

    const video = document.getElementById('videoElement');
    video.srcObject = stream;

    log(`🔄 Câmera trocada para ${currentFacingMode === 'environment' ? 'traseira' : 'frontal'}`, 'success');
  } catch (error) {
    log(`❌ Erro ao trocar câmera: ${error.message}`, 'error');
  }
}

// Capturar foto
function capturePhoto() {
  const video = document.getElementById('videoElement');
  const canvas = document.getElementById('canvasElement');
  const context = canvas.getContext('2d');

  // Definir tamanho do canvas igual ao vídeo
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Desenhar frame atual do vídeo no canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Converter para imagem comprimida (JPEG 80% quality)
  canvas.toBlob(
    (blob) => {
      // Calcular tamanho
      const sizeKB = (blob.size / 1024).toFixed(2);

      // Criar URL da imagem
      const imageUrl = URL.createObjectURL(blob);

      // Adicionar à lista de fotos
      const photo = {
        id: Date.now(),
        url: imageUrl,
        blob: blob,
        size: sizeKB,
        timestamp: new Date().toISOString(),
        legible: null, // Usuário marcará manualmente
      };

      photos.push(photo);

      log(`📸 Foto capturada (${sizeKB} KB)`, 'success');

      // Renderizar galeria
      renderPhotos();
      updateStats();

      // Prompt para verificar legibilidade
      setTimeout(() => {
        const isLegible = confirm(
          `🔍 A foto capturada está LEGÍVEL?\n\n` + `(Você consegue ler textos/identificar danos claramente?)\n\n` + `Tamanho: ${sizeKB} KB`
        );

        photo.legible = isLegible;
        if (isLegible) {
          stats.legible++;
          log(`✅ Foto #${photo.id} marcada como LEGÍVEL`, 'success');
        } else {
          log(`⚠️ Foto #${photo.id} marcada como NÃO LEGÍVEL`, 'warning');
        }

        renderPhotos();
        updateStats();
      }, 500);
    },
    'image/jpeg',
    0.8 // 80% quality
  );
}

// Upload da galeria
function uploadFromGallery() {
  document.getElementById('fileInput').click();
}

// Handle file upload
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Verificar se é imagem
  if (!file.type.startsWith('image/')) {
    alert('⚠️ Por favor, selecione um arquivo de imagem');
    return;
  }

  log(`📁 Upload de arquivo: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`, 'info');

  // Ler arquivo
  const reader = new FileReader();
  reader.onload = (e) => {
    // Criar imagem
    const img = new Image();
    img.onload = () => {
      // Comprimir imagem
      const canvas = document.getElementById('canvasElement');
      const context = canvas.getContext('2d');

      // Redimensionar se necessário (max 1920x1080)
      let width = img.width;
      let height = img.height;

      if (width > 1920 || height > 1080) {
        const ratio = Math.min(1920 / width, 1080 / height);
        width = width * ratio;
        height = height * ratio;
      }

      canvas.width = width;
      canvas.height = height;
      context.drawImage(img, 0, 0, width, height);

      // Converter para blob comprimido
      canvas.toBlob(
        (blob) => {
          const sizeKB = (blob.size / 1024).toFixed(2);
          const imageUrl = URL.createObjectURL(blob);

          const photo = {
            id: Date.now(),
            url: imageUrl,
            blob: blob,
            size: sizeKB,
            timestamp: new Date().toISOString(),
            legible: null,
            source: 'gallery',
          };

          photos.push(photo);

          log(`✅ Imagem importada e comprimida (${sizeKB} KB)`, 'success');

          renderPhotos();
          updateStats();

          // Prompt legibilidade
          setTimeout(() => {
            const isLegible = confirm(`🔍 A imagem importada está LEGÍVEL?\n\nTamanho após compressão: ${sizeKB} KB`);

            photo.legible = isLegible;
            if (isLegible) {
              stats.legible++;
              log(`✅ Imagem #${photo.id} marcada como LEGÍVEL`, 'success');
            } else {
              log(`⚠️ Imagem #${photo.id} marcada como NÃO LEGÍVEL`, 'warning');
            }

            renderPhotos();
            updateStats();
          }, 500);
        },
        'image/jpeg',
        0.8
      );
    };

    img.src = e.target.result;
  };

  reader.readAsDataURL(file);

  // Limpar input
  event.target.value = '';
}

// Renderizar galeria de fotos
function renderPhotos() {
  const grid = document.getElementById('photosGrid');

  if (photos.length === 0) {
    grid.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">Nenhuma foto capturada ainda</p>';
    return;
  }

  grid.innerHTML = photos
    .reverse()
    .map(
      (photo) => `
    <div class="photo-item">
      <img src="${photo.url}" alt="Foto ${photo.id}">
      <div class="photo-info">
        <div class="size">📊 ${photo.size} KB</div>
        <div>⏱️ ${new Date(photo.timestamp).toLocaleTimeString('pt-BR')}</div>
        <div>
          ${photo.legible === true ? '✅ Legível' : photo.legible === false ? '❌ Não Legível' : '⏳ Aguardando avaliação'}
        </div>
        ${photo.source === 'gallery' ? '<div>📁 Galeria</div>' : '<div>📷 Câmera</div>'}
      </div>
      <div class="photo-actions">
        <button onclick="downloadPhoto(${photo.id})" style="background: #3b82f6; color: white;">
          💾 Baixar
        </button>
        <button onclick="deletePhoto(${photo.id})" style="background: #ef4444; color: white;">
          🗑️ Deletar
        </button>
        <button onclick="toggleLegible(${photo.id})" style="background: #10b981; color: white;">
          ${photo.legible === true ? '❌ Não Legível' : '✅ Legível'}
        </button>
      </div>
    </div>
  `
    )
    .join('');

  photos.reverse(); // Reverter de volta para manter ordem original

  // Atualizar contador
  document.getElementById('photoCount').textContent = `${photos.length} fotos capturadas`;
  document.getElementById('photoCountDisplay').textContent = photos.length;
}

// Toggle legibilidade
function toggleLegible(photoId) {
  const photo = photos.find((p) => p.id === photoId);
  if (!photo) return;

  if (photo.legible === true) {
    photo.legible = false;
    stats.legible--;
    log(`⚠️ Foto #${photoId} marcada como NÃO LEGÍVEL`, 'warning');
  } else {
    photo.legible = true;
    stats.legible++;
    log(`✅ Foto #${photoId} marcada como LEGÍVEL`, 'success');
  }

  renderPhotos();
  updateStats();
}

// Deletar foto
function deletePhoto(photoId) {
  if (!confirm('Tem certeza que deseja deletar esta foto?')) {
    return;
  }

  const photo = photos.find((p) => p.id === photoId);
  if (photo && photo.legible) {
    stats.legible--;
  }

  photos = photos.filter((p) => p.id !== photoId);

  log(`🗑️ Foto #${photoId} deletada`, 'info');

  renderPhotos();
  updateStats();
}

// Download foto
function downloadPhoto(photoId) {
  const photo = photos.find((p) => p.id === photoId);
  if (!photo) return;

  const a = document.createElement('a');
  a.href = photo.url;
  a.download = `foto-${photoId}.jpg`;
  a.click();

  log(`💾 Foto #${photoId} baixada`, 'success');
}

// Atualizar status bar
function updateStatusBar(status, text) {
  const statusBar = document.getElementById('statusBar');
  const statusText = document.getElementById('statusText');

  statusBar.className = 'status-bar';

  if (status === 'granted') {
    statusBar.classList.add('granted');
  } else if (status === 'no-permission') {
    statusBar.classList.add('no-permission');
  } else if (status === 'requesting') {
    statusBar.classList.add('requesting');
  }

  statusText.innerHTML = `<strong>${status === 'granted' ? 'Câmera Ativa' : status === 'requesting' ? 'Solicitando' : status === 'no-permission' ? 'Permissão Negada' : 'Aguardando'}</strong> - ${text}`;
}

// Atualizar estatísticas
function updateStats() {
  stats.total = photos.length;
  stats.totalSize = photos.reduce((sum, p) => sum + parseFloat(p.size), 0);

  const avgSize = stats.total > 0 ? (stats.totalSize / stats.total).toFixed(2) : 0;
  const permissionRate = stats.permissionAttempts > 0 ? ((stats.permissionGranted / stats.permissionAttempts) * 100).toFixed(0) : 0;

  document.getElementById('statsTotal').textContent = stats.total;
  document.getElementById('statsLegible').textContent = stats.legible;
  document.getElementById('statsAvgSize').textContent = `${avgSize} KB`;
  document.getElementById('statsPermissionRate').textContent = `${permissionRate}%`;
}

// Logger
function log(message, type = 'info') {
  const logContainer = document.getElementById('eventLog');
  const timestamp = new Date().toLocaleTimeString('pt-BR');

  const colors = {
    info: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  };

  const logEntry = document.createElement('div');
  logEntry.className = `log-entry ${type}`;
  logEntry.innerHTML = `
    <span style="color: #94a3b8;">[${timestamp}]</span>
    <span>${message}</span>
  `;

  logContainer.insertBefore(logEntry, logContainer.firstChild);

  // Limitar a 50 entradas
  while (logContainer.children.length > 50) {
    logContainer.removeChild(logContainer.lastChild);
  }
}

// ==========================================
// TESTES AUTOMATIZADOS
// ==========================================

async function runAllTests() {
  log('🧪 INICIANDO BATERIA DE TESTES AUTOMÁTICOS', 'info');

  // Teste 1: Verificar suporte a getUserMedia
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    log('❌ TESTE FALHOU: navegador não suporta getUserMedia', 'error');
    alert('⚠️ Seu navegador não suporta captura de câmera via getUserMedia');
    return;
  } else {
    log('✅ TESTE 1 PASSOU: getUserMedia disponível', 'success');
  }

  // Teste 2: Verificar permissão
  try {
    const permission = await navigator.permissions.query({ name: 'camera' });
    log(`📋 Permissão de câmera: ${permission.state}`, 'info');

    if (permission.state === 'granted') {
      log('✅ TESTE 2 PASSOU: Permissão já concedida', 'success');
    } else if (permission.state === 'prompt') {
      log('⚠️ TESTE 2: Permissão será solicitada ao usuário', 'warning');
    } else {
      log('❌ TESTE 2 FALHOU: Permissão negada', 'error');
    }
  } catch (error) {
    log('⚠️ TESTE 2: Não foi possível verificar permissão (API não suportada)', 'warning');
  }

  // Teste 3: Simular captura (se câmera já estiver ativa)
  if (stream) {
    log('🧪 TESTE 3: Simulando captura de foto...', 'info');
    capturePhoto();
    await delay(2000);

    if (photos.length > 0) {
      const lastPhoto = photos[photos.length - 1];
      if (parseFloat(lastPhoto.size) < 500) {
        log('✅ TESTE 3 PASSOU: Foto capturada e comprimida (< 500KB)', 'success');
      } else {
        log(`⚠️ TESTE 3: Foto maior que esperado (${lastPhoto.size} KB)`, 'warning');
      }
    }
  } else {
    log('⏸️ TESTE 3: Câmera não está ativa - inicie manualmente para testar', 'warning');
  }

  // Teste 4: Verificar dispositivos de vídeo disponíveis
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((d) => d.kind === 'videoinput');

    log(`📹 Encontrados ${videoDevices.length} dispositivos de vídeo`, 'info');

    if (videoDevices.length === 0) {
      log('❌ TESTE 4 FALHOU: Nenhum dispositivo de vídeo encontrado', 'error');
    } else if (videoDevices.length === 1) {
      log('⚠️ TESTE 4: Apenas 1 câmera disponível (trocar câmera não funcionará)', 'warning');
    } else {
      log('✅ TESTE 4 PASSOU: Múltiplas câmeras disponíveis (pode trocar)', 'success');
    }
  } catch (error) {
    log(`❌ TESTE 4 FALHOU: ${error.message}`, 'error');
  }

  log('🎉 BATERIA DE TESTES CONCLUÍDA', 'success');
  log('📊 Verifique os resultados acima e preencha o RESULTADO.md', 'info');
}

// Utilitário
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  log('🚀 POC 3: Captura de Foto via Câmera - Pronto para uso', 'info');
  updateStats();
});
