// Lógica de sincronização com retry e exponential backoff
const MOCK_API_URL = 'https://mock-api.gml.local/api/checklists';
const MAX_RETRIES = 5;
const BASE_DELAY = 1000; // 1 segundo

let isOnline = navigator.onLine;
let apiShouldFail = false;
let slowNetwork = false;
let intermittentMode = false;
let intermittentInterval = null;

// Sincronizar check-list com a API (mock)
async function syncChecklist(checklist, retryCount = 0) {
  // Simular delay de rede
  if (slowNetwork) {
    await delay(3000); // 3 segundos em slow 3G
  }

  // Simular API não disponível
  if (!isOnline) {
    throw new Error('Sem conexão com a internet');
  }

  // Simular erro 500
  if (apiShouldFail && Math.random() < 0.5) {
    throw new Error('Erro 500: Internal Server Error');
  }

  // Simular chamada de API
  log(`Sincronizando check-list ${checklist.uuid}...`, 'info');

  await delay(500 + Math.random() * 1000); // Simular latência

  // Mock: sempre sucesso se chegar aqui
  return {
    success: true,
    id: checklist.uuid,
    synced_at: new Date().toISOString()
  };
}

// Sincronizar todos os check-lists pendentes
async function syncAllPending() {
  const pending = await getPendingChecklists();

  if (pending.length === 0) {
    log('Nenhum check-list pendente para sincronizar', 'info');
    return;
  }

  log(`Iniciando sincronização de ${pending.length} check-lists pendentes`, 'info');

  let successCount = 0;
  let failCount = 0;

  for (const checklist of pending) {
    try {
      await syncWithRetry(checklist);
      successCount++;
    } catch (error) {
      log(`Falha ao sincronizar ${checklist.uuid}: ${error.message}`, 'error');
      failCount++;
      await updateSyncStatus(checklist.id, 'error', error.message);
    }
  }

  log(`Sincronização concluída: ${successCount} sucesso, ${failCount} falhas`, successCount > 0 ? 'success' : 'warning');
  await renderChecklists();
  updateStats();
}

// Sincronizar com retry e exponential backoff
async function syncWithRetry(checklist, retryCount = 0) {
  try {
    const result = await syncChecklist(checklist, retryCount);
    await updateSyncStatus(checklist.id, 'synced');
    log(`✅ Check-list ${checklist.uuid} sincronizado com sucesso`, 'success');
    return result;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      const delayMs = BASE_DELAY * Math.pow(2, retryCount);
      log(`Tentativa ${retryCount + 1} falhou. Tentando novamente em ${delayMs}ms...`, 'warning');
      await delay(delayMs);
      return syncWithRetry(checklist, retryCount + 1);
    } else {
      log(`❌ Falha definitiva após ${MAX_RETRIES} tentativas`, 'error');
      throw error;
    }
  }
}

// Background sync automático ao voltar online
window.addEventListener('online', async () => {
  isOnline = true;
  updateStatusBar();
  log('🟢 Conexão restaurada - iniciando sincronização automática', 'success');
  await syncAllPending();
});

window.addEventListener('offline', () => {
  isOnline = false;
  updateStatusBar();
  log('🔴 Conexão perdida - modo offline ativado', 'warning');
});

// Forçar sincronização manual
async function forceSync() {
  if (!isOnline) {
    alert('⚠️ Não é possível sincronizar em modo offline');
    return;
  }

  log('🔄 Sincronização manual iniciada', 'info');
  await syncAllPending();
}

// Utilitários
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Controles de simulação
function goOffline() {
  isOnline = false;
  updateStatusBar();
  log('📴 Modo offline ativado (simulação)', 'warning');
}

function goOnline() {
  isOnline = true;
  updateStatusBar();
  log('✅ Modo online ativado (simulação)', 'success');

  // Tentar sincronizar automaticamente
  setTimeout(() => syncAllPending(), 1000);
}

function simulateSlowNetwork() {
  slowNetwork = !slowNetwork;
  log(`🐢 Slow 3G ${slowNetwork ? 'ATIVADO' : 'DESATIVADO'}`, 'warning');
}

function simulateIntermittent() {
  intermittentMode = !intermittentMode;

  if (intermittentMode) {
    log('📶 Modo intermitente ATIVADO (2s online, 3s offline)', 'warning');
    intermittentInterval = setInterval(() => {
      isOnline = !isOnline;
      updateStatusBar();
      log(`Conexão: ${isOnline ? 'ONLINE' : 'OFFLINE'}`, 'info');
    }, 2500);
  } else {
    log('📶 Modo intermitente DESATIVADO', 'info');
    if (intermittentInterval) {
      clearInterval(intermittentInterval);
      intermittentInterval = null;
    }
    isOnline = true;
    updateStatusBar();
  }
}

function simulateApiError() {
  apiShouldFail = !apiShouldFail;
  log(`❌ Simulação de erro 500: ${apiShouldFail ? 'ATIVADO' : 'DESATIVADO'}`, apiShouldFail ? 'error' : 'info');
}

// Atualizar barra de status
function updateStatusBar() {
  const statusBar = document.getElementById('statusBar');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');

  if (isOnline) {
    statusBar.className = 'status-bar';
    statusDot.className = 'status-dot';
    statusText.innerHTML = '<strong>Online</strong> - Conectado à API';
  } else {
    statusBar.className = 'status-bar offline';
    statusDot.className = 'status-dot offline';
    statusText.innerHTML = '<strong>Offline</strong> - Dados salvos localmente';
  }
}

// Sincronização periódica (a cada 30s se houver pendentes)
setInterval(async () => {
  if (isOnline) {
    const pending = await getPendingChecklists();
    if (pending.length > 0) {
      log(`🔄 Sincronização automática (${pending.length} pendentes)`, 'info');
      await syncAllPending();
    }
  }
}, 30000);
