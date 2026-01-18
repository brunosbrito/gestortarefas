// IndexedDB wrapper para armazenamento offline
const DB_NAME = 'GMLLogisticaDB';
const DB_VERSION = 1;
const STORE_NAME = 'checklists';

let db = null;

// Inicializar IndexedDB
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Falha ao abrir IndexedDB'));
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      log('IndexedDB inicializado com sucesso', 'success');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;

      // Criar object store se não existir
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });

        // Criar índices
        objectStore.createIndex('uuid', 'uuid', { unique: true });
        objectStore.createIndex('sync_status', 'sync_status', { unique: false });
        objectStore.createIndex('created_at', 'created_at', { unique: false });

        log('Object store criado', 'info');
      }
    };
  });
}

// Adicionar check-list ao IndexedDB
async function addChecklistToDB(checklist) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);

    const request = objectStore.add(checklist);

    request.onsuccess = () => {
      log(`Check-list ${checklist.uuid} salvo no IndexedDB`, 'success');
      resolve(request.result);
    };

    request.onerror = () => {
      log(`Erro ao salvar check-list: ${request.error}`, 'error');
      reject(request.error);
    };
  });
}

// Obter todos os check-lists
async function getAllChecklists() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);

    const request = objectStore.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Obter check-lists pendentes de sincronização
async function getPendingChecklists() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const index = objectStore.index('sync_status');

    const request = index.getAll('pending');

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Atualizar status de sincronização
async function updateSyncStatus(id, status, error = null) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);

    const getRequest = objectStore.get(id);

    getRequest.onsuccess = () => {
      const checklist = getRequest.result;
      if (!checklist) {
        reject(new Error('Check-list não encontrado'));
        return;
      }

      checklist.sync_status = status;
      checklist.last_sync_attempt = new Date().toISOString();
      if (error) {
        checklist.sync_error = error;
      }
      if (status === 'synced') {
        checklist.synced_at = new Date().toISOString();
      }

      const updateRequest = objectStore.put(checklist);

      updateRequest.onsuccess = () => {
        log(`Status do check-list ${checklist.uuid} atualizado para: ${status}`, 'info');
        resolve();
      };

      updateRequest.onerror = () => {
        reject(updateRequest.error);
      };
    };

    getRequest.onerror = () => {
      reject(getRequest.error);
    };
  });
}

// Deletar check-list
async function deleteChecklist(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);

    const request = objectStore.delete(id);

    request.onsuccess = () => {
      log(`Check-list ${id} deletado`, 'warning');
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Limpar todos os dados
async function clearAllData() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);

    const request = objectStore.clear();

    request.onsuccess = () => {
      log('Todos os dados do IndexedDB foram limpos', 'warning');
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Gerar UUID único
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Inicializar ao carregar
window.addEventListener('DOMContentLoaded', async () => {
  try {
    await initDB();
    await renderChecklists();
    updateStats();
  } catch (error) {
    log(`Erro ao inicializar: ${error.message}`, 'error');
  }
});
