// Aplicação Principal - PWA Offline Sync POC

let stats = {
  total: 0,
  synced: 0,
  pending: 0,
  failed: 0,
};

// Inicializar aplicação
async function initApp() {
  log('🚀 Inicializando aplicação POC PWA + Offline Sync', 'info');

  // Inicializar IndexedDB
  await initDB();
  log('✅ IndexedDB inicializado', 'success');

  // Carregar check-lists existentes
  await renderChecklists();
  updateStats();

  // Atualizar status bar
  updateStatusBar();

  log('✅ Aplicação pronta para uso', 'success');

  // Registrar Service Worker (se suportado)
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js');
      log('✅ Service Worker registrado', 'success');
    } catch (error) {
      log(`⚠️ Falha ao registrar Service Worker: ${error.message}`, 'warning');
    }
  }
}

// Criar novo check-list
async function createChecklist(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const checklist = {
    uuid: generateUUID(),
    veiculo: formData.get('veiculo'),
    motorista: formData.get('motorista'),
    km_inicial: parseInt(formData.get('km_inicial')),
    combustivel: formData.get('combustivel'),
    observacoes: formData.get('observacoes') || '',
    sync_status: isOnline ? 'pending' : 'pending',
    created_at: new Date().toISOString(),
  };

  log(`Criando check-list para veículo ${checklist.veiculo}...`, 'info');

  try {
    // Salvar no IndexedDB
    const id = await addChecklist(checklist);
    log(`✅ Check-list ${checklist.uuid} salvo localmente (ID: ${id})`, 'success');

    // Tentar sincronizar imediatamente se online
    if (isOnline) {
      const checklistWithId = { ...checklist, id };
      try {
        await syncWithRetry(checklistWithId);
      } catch (error) {
        // Erro já logado pelo syncWithRetry
      }
    } else {
      log(`📴 Offline - check-list será sincronizado quando conectar`, 'warning');
    }

    // Atualizar UI
    await renderChecklists();
    updateStats();

    // Limpar form
    event.target.reset();
  } catch (error) {
    log(`❌ Erro ao criar check-list: ${error.message}`, 'error');
  }
}

// Renderizar lista de check-lists
async function renderChecklists() {
  const checklists = await getAllChecklists();
  const tbody = document.getElementById('checklistsTableBody');

  if (checklists.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem; color: #64748b;">
          Nenhum check-list criado ainda
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = checklists
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(
      (c) => `
    <tr>
      <td>${c.uuid.substring(0, 8)}</td>
      <td>${c.veiculo}</td>
      <td>${c.motorista}</td>
      <td>${c.km_inicial} km</td>
      <td>
        <span class="badge badge-${c.sync_status === 'synced' ? 'success' : c.sync_status === 'pending' ? 'warning' : 'error'}">
          ${c.sync_status === 'synced' ? '✅ Sincronizado' : c.sync_status === 'pending' ? '⏳ Pendente' : '❌ Erro'}
        </span>
      </td>
      <td>
        <button onclick="deleteChecklistById(${c.id})" class="btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.875rem;">
          🗑️ Deletar
        </button>
      </td>
    </tr>
  `
    )
    .join('');
}

// Deletar check-list
async function deleteChecklistById(id) {
  if (!confirm('Tem certeza que deseja deletar este check-list?')) {
    return;
  }

  try {
    await deleteChecklist(id);
    log(`🗑️ Check-list deletado (ID: ${id})`, 'info');
    await renderChecklists();
    updateStats();
  } catch (error) {
    log(`❌ Erro ao deletar check-list: ${error.message}`, 'error');
  }
}

// Atualizar estatísticas
async function updateStats() {
  const checklists = await getAllChecklists();

  stats.total = checklists.length;
  stats.synced = checklists.filter((c) => c.sync_status === 'synced').length;
  stats.pending = checklists.filter((c) => c.sync_status === 'pending').length;
  stats.failed = checklists.filter((c) => c.sync_status === 'error').length;

  const successRate = stats.total > 0 ? ((stats.synced / stats.total) * 100).toFixed(1) : 0;

  document.getElementById('statsTotal').textContent = stats.total;
  document.getElementById('statsSynced').textContent = stats.synced;
  document.getElementById('statsPending').textContent = stats.pending;
  document.getElementById('statsFailed').textContent = stats.failed;
  document.getElementById('statsSuccessRate').textContent = `${successRate}%`;

  // Atualizar contador de pendentes na status bar
  document.getElementById('pendingCount').textContent = `${stats.pending} pendentes de sincronização`;
}

// Logger de eventos
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
  logEntry.style.cssText = `
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    background: ${colors[type]}15;
    border-left: 3px solid ${colors[type]};
    border-radius: 4px;
    font-size: 0.875rem;
  `;
  logEntry.innerHTML = `
    <span style="color: #64748b;">[${timestamp}]</span>
    <span style="color: ${colors[type]}; font-weight: 500;">${message}</span>
  `;

  logContainer.insertBefore(logEntry, logContainer.firstChild);

  // Limitar a 50 entradas
  while (logContainer.children.length > 50) {
    logContainer.removeChild(logContainer.lastChild);
  }
}

// =============================================
// TESTES AUTOMATIZADOS
// =============================================

// Teste 1: Criar offline, sincronizar quando voltar online
async function runTest1() {
  log('🧪 TESTE 1: Criar offline, sincronizar quando voltar online', 'info');

  // Ir offline
  goOffline();
  await delay(500);

  // Criar check-list
  const checklist = {
    uuid: generateUUID(),
    veiculo: 'TESTE-001',
    motorista: 'Teste Automatizado',
    km_inicial: 10000,
    combustivel: 'cheio',
    observacoes: 'Teste 1 - Offline',
    sync_status: 'pending',
    created_at: new Date().toISOString(),
  };

  const id = await addChecklist(checklist);
  log(`✅ Check-list criado offline (ID: ${id})`, 'success');
  await renderChecklists();
  updateStats();

  await delay(2000);

  // Voltar online
  goOnline();
  await delay(3000);

  // Verificar sincronização
  const updated = await getAllChecklists();
  const synced = updated.find((c) => c.id === id && c.sync_status === 'synced');

  if (synced) {
    log('✅ TESTE 1 PASSOU: Check-list sincronizado com sucesso', 'success');
  } else {
    log('❌ TESTE 1 FALHOU: Check-list não foi sincronizado', 'error');
  }
}

// Teste 2: Criar com API retornando erro 500, verificar retry
async function runTest2() {
  log('🧪 TESTE 2: Criar com API retornando erro 500, verificar retry', 'info');

  // Ativar simulação de erro
  simulateApiError();
  await delay(500);

  // Criar check-list
  const checklist = {
    uuid: generateUUID(),
    veiculo: 'TESTE-002',
    motorista: 'Teste Automatizado',
    km_inicial: 20000,
    combustivel: '3/4',
    observacoes: 'Teste 2 - API Error',
    sync_status: 'pending',
    created_at: new Date().toISOString(),
  };

  const id = await addChecklist(checklist);
  log(`✅ Check-list criado (ID: ${id})`, 'success');
  await renderChecklists();
  updateStats();

  // Tentar sincronizar (vai falhar algumas vezes)
  const checklistWithId = { ...checklist, id };
  try {
    await syncWithRetry(checklistWithId);
    log('✅ TESTE 2 PASSOU: Retry funcionou após erros 500', 'success');
  } catch (error) {
    log('❌ TESTE 2 FALHOU: Retry não conseguiu recuperar após 5 tentativas', 'error');
  }

  // Desativar simulação
  simulateApiError();
  await renderChecklists();
  updateStats();
}

// Teste 3: Slow 3G - verificar tempo de sincronização
async function runTest3() {
  log('🧪 TESTE 3: Slow 3G - verificar tempo de sincronização', 'info');

  // Ativar slow network
  simulateSlowNetwork();
  await delay(500);

  // Criar check-list
  const checklist = {
    uuid: generateUUID(),
    veiculo: 'TESTE-003',
    motorista: 'Teste Automatizado',
    km_inicial: 30000,
    combustivel: '1/2',
    observacoes: 'Teste 3 - Slow 3G',
    sync_status: 'pending',
    created_at: new Date().toISOString(),
  };

  const id = await addChecklist(checklist);
  await renderChecklists();
  updateStats();

  const startTime = Date.now();

  // Sincronizar
  const checklistWithId = { ...checklist, id };
  try {
    await syncWithRetry(checklistWithId);
    const duration = Date.now() - startTime;
    log(`✅ TESTE 3 PASSOU: Sincronizado em ${duration}ms (esperado: ~3500ms)`, 'success');
  } catch (error) {
    log('❌ TESTE 3 FALHOU: Não sincronizou em slow 3G', 'error');
  }

  // Desativar slow network
  simulateSlowNetwork();
  await renderChecklists();
  updateStats();
}

// Teste 4: Criar múltiplos check-lists offline, sincronizar todos
async function runTest4() {
  log('🧪 TESTE 4: Criar 5 check-lists offline, sincronizar todos', 'info');

  // Ir offline
  goOffline();
  await delay(500);

  // Criar 5 check-lists
  const ids = [];
  for (let i = 1; i <= 5; i++) {
    const checklist = {
      uuid: generateUUID(),
      veiculo: `TESTE-00${i}`,
      motorista: `Motorista ${i}`,
      km_inicial: 10000 * i,
      combustivel: 'cheio',
      observacoes: `Teste 4 - Batch ${i}`,
      sync_status: 'pending',
      created_at: new Date().toISOString(),
    };

    const id = await addChecklist(checklist);
    ids.push(id);
  }

  log(`✅ 5 check-lists criados offline (IDs: ${ids.join(', ')})`, 'success');
  await renderChecklists();
  updateStats();

  await delay(2000);

  // Voltar online
  goOnline();
  await delay(5000); // Dar tempo para sincronizar todos

  // Verificar sincronização
  const updated = await getAllChecklists();
  const syncedCount = updated.filter((c) => ids.includes(c.id) && c.sync_status === 'synced').length;

  if (syncedCount === 5) {
    log('✅ TESTE 4 PASSOU: Todos os 5 check-lists sincronizados', 'success');
  } else {
    log(`❌ TESTE 4 FALHOU: Apenas ${syncedCount}/5 sincronizados`, 'error');
  }
}

// Teste 5: Conexão intermitente
async function runTest5() {
  log('🧪 TESTE 5: Criar com conexão intermitente', 'info');

  // Ativar modo intermitente
  simulateIntermittent();
  await delay(500);

  // Criar check-list
  const checklist = {
    uuid: generateUUID(),
    veiculo: 'TESTE-005',
    motorista: 'Teste Automatizado',
    km_inicial: 50000,
    combustivel: 'reserva',
    observacoes: 'Teste 5 - Intermitente',
    sync_status: 'pending',
    created_at: new Date().toISOString(),
  };

  const id = await addChecklist(checklist);
  log(`✅ Check-list criado (ID: ${id})`, 'success');
  await renderChecklists();
  updateStats();

  // Aguardar 15 segundos (tempo suficiente para várias alternâncias)
  await delay(15000);

  // Desativar intermitente e garantir que está online
  simulateIntermittent();
  goOnline();
  await delay(3000);

  // Verificar sincronização
  const updated = await getAllChecklists();
  const synced = updated.find((c) => c.id === id && c.sync_status === 'synced');

  if (synced) {
    log('✅ TESTE 5 PASSOU: Check-list sincronizado apesar de conexão intermitente', 'success');
  } else {
    log('❌ TESTE 5 FALHOU: Check-list não sincronizou', 'error');
  }
}

// Executar TODOS os testes em sequência
async function runAllTests() {
  log('🎯 INICIANDO BATERIA COMPLETA DE TESTES', 'info');
  log('⏱️ Tempo estimado: ~40 segundos', 'info');

  await runTest1();
  await delay(2000);

  await runTest2();
  await delay(2000);

  await runTest3();
  await delay(2000);

  await runTest4();
  await delay(2000);

  await runTest5();

  log('🎉 BATERIA DE TESTES CONCLUÍDA', 'success');
  log('📊 Verifique os resultados acima e as estatísticas', 'info');
}

// Limpar todos os dados
async function clearAllData() {
  if (!confirm('⚠️ Isso vai deletar TODOS os check-lists. Confirma?')) {
    return;
  }

  await clearChecklists();
  log('🗑️ Todos os check-lists deletados', 'info');
  await renderChecklists();
  updateStats();
}

// Inicializar quando página carregar
window.addEventListener('DOMContentLoaded', initApp);
