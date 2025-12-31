# Sistema de Feedback Visual

Sistema unificado para fornecer feedback visual consistente ao usuário durante ações e operações no sistema.

## 📦 Componentes Disponíveis

### 1. Toast Notifications

Notificações temporárias que aparecem no canto da tela.

```tsx
import {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  showSavePromise,
} from '@/lib/feedback';

// Sucesso
showSuccess({
  description: 'Atividade criada com sucesso!',
});

// Erro
showError({
  title: 'Erro ao Salvar',
  description: 'Não foi possível salvar a atividade.',
});

// Aviso
showWarning({
  description: 'Alguns campos estão incompletos.',
});

// Informação
showInfo({
  description: 'Esta atividade está vinculada a uma obra.',
});

// Loading com Promise
const saveData = async () => {
  await showSavePromise(
    apiCall(),
    {
      loading: 'Salvando atividade...',
      success: 'Atividade salva com sucesso!',
      error: 'Erro ao salvar atividade.',
    }
  );
};
```

### 2. LoadingButton

Botão com estado de loading integrado.

```tsx
import { LoadingButton, useAsyncAction } from '@/lib/feedback';

function MyForm() {
  const { isLoading, execute } = useAsyncAction();

  const handleSave = execute(async () => {
    await saveData();
    showSuccess({ description: 'Salvo!' });
  });

  return (
    <LoadingButton
      onClick={handleSave}
      loading={isLoading}
      loadingText="Salvando..."
    >
      Salvar
    </LoadingButton>
  );
}
```

### 3. InlineFeedback

Feedback inline próximo ao elemento de ação.

```tsx
import { InlineFeedback, useInlineFeedback } from '@/lib/feedback';

function MyComponent() {
  const { show, showFeedback } = useInlineFeedback();

  const handleAction = async () => {
    await doSomething();
    showFeedback(3000); // Mostra por 3 segundos
  };

  return (
    <div>
      <Button onClick={handleAction}>Executar Ação</Button>
      <InlineFeedback
        type="success"
        message="Ação executada com sucesso!"
        show={show}
      />
    </div>
  );
}
```

### 4. ProgressFeedback

Barra de progresso para operações longas.

```tsx
import { ProgressFeedback, useProgress } from '@/lib/feedback';

function FileUploader() {
  const { progress, status, setProgress, completeProgress, failProgress } = useProgress();

  const handleUpload = async (file: File) => {
    try {
      await uploadFile(file, (p) => setProgress(p));
      completeProgress();
    } catch {
      failProgress();
    }
  };

  return (
    <ProgressFeedback
      progress={progress}
      status={status}
      message="Enviando arquivo..."
      successMessage="Arquivo enviado com sucesso!"
      errorMessage="Erro ao enviar arquivo."
    />
  );
}
```

## 🎨 Padrões de Uso

### Padrão 1: CRUD Básico

```tsx
import { showCreateSuccess, showUpdateSuccess, showDeleteSuccess, showError } from '@/lib/feedback';
import { LoadingButton, useAsyncAction } from '@/lib/feedback';

function CRUDComponent() {
  const { isLoading, execute } = useAsyncAction();

  const handleCreate = execute(async (data) => {
    try {
      await api.create(data);
      showCreateSuccess('Atividade');
    } catch (error) {
      showError({ description: 'Erro ao criar atividade.' });
    }
  });

  const handleUpdate = execute(async (id, data) => {
    try {
      await api.update(id, data);
      showUpdateSuccess('Atividade');
    } catch (error) {
      showError({ description: 'Erro ao atualizar atividade.' });
    }
  });

  const handleDelete = execute(async (id) => {
    try {
      await api.delete(id);
      showDeleteSuccess('Atividade');
    } catch (error) {
      showError({ description: 'Erro ao excluir atividade.' });
    }
  });

  return (
    <>
      <LoadingButton onClick={() => handleCreate(data)} loading={isLoading}>
        Criar
      </LoadingButton>
      <LoadingButton onClick={() => handleUpdate(id, data)} loading={isLoading}>
        Atualizar
      </LoadingButton>
      <LoadingButton onClick={() => handleDelete(id)} loading={isLoading} variant="destructive">
        Excluir
      </LoadingButton>
    </>
  );
}
```

### Padrão 2: Formulário com Validação

```tsx
import { showValidationError, showSuccess } from '@/lib/feedback';
import { LoadingButton, useAsyncAction } from '@/lib/feedback';

function FormComponent() {
  const { isLoading, execute } = useAsyncAction();

  const handleSubmit = execute(async (data) => {
    // Validação
    if (!data.name) {
      showValidationError('O campo nome é obrigatório.');
      return;
    }

    try {
      await api.save(data);
      showSuccess({ description: 'Formulário enviado com sucesso!' });
    } catch (error) {
      showError({ description: 'Erro ao enviar formulário.' });
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos do formulário */}
      <LoadingButton type="submit" loading={isLoading}>
        Enviar
      </LoadingButton>
    </form>
  );
}
```

### Padrão 3: Upload de Arquivo

```tsx
import { ProgressFeedback, useProgress } from '@/lib/feedback';
import { showSuccess, showError } from '@/lib/feedback';

function FileUploadComponent() {
  const { progress, status, setProgress, completeProgress, failProgress, startProgress } = useProgress();

  const handleFileUpload = async (file: File) => {
    startProgress();

    try {
      await uploadFile(file, {
        onProgress: (p) => setProgress(p),
      });
      completeProgress();
      showSuccess({ description: 'Arquivo enviado com sucesso!' });
    } catch (error) {
      failProgress();
      showError({ description: 'Erro ao enviar arquivo.' });
    }
  };

  return (
    <>
      <input type="file" onChange={(e) => handleFileUpload(e.target.files[0])} />
      {status !== 'loading' && (
        <ProgressFeedback
          progress={progress}
          status={status}
          message="Enviando arquivo..."
          successMessage="Arquivo enviado!"
          errorMessage="Falha no upload."
        />
      )}
    </>
  );
}
```

## 🎯 Melhores Práticas

### 1. Use LoadingButton para operações assíncronas

✅ **Bom:**
```tsx
<LoadingButton onClick={handleSave} loading={isLoading}>
  Salvar
</LoadingButton>
```

❌ **Evite:**
```tsx
<Button onClick={handleSave} disabled={isLoading}>
  {isLoading ? 'Salvando...' : 'Salvar'}
</Button>
```

### 2. Use toasts para feedback global

✅ **Bom:**
```tsx
showSuccess({ description: 'Item salvo com sucesso!' });
```

❌ **Evite:**
```tsx
alert('Item salvo com sucesso!');
```

### 3. Use InlineFeedback para ações locais

✅ **Bom:**
```tsx
<InlineFeedback type="success" message="Copiado!" show={show} />
```

❌ **Evite:**
Usar toast para ações muito pequenas ou frequentes.

### 4. Use ProgressFeedback para operações longas

✅ **Bom:**
```tsx
<ProgressFeedback
  progress={uploadProgress}
  status={uploadStatus}
  message="Enviando 10 arquivos..."
/>
```

❌ **Evite:**
Deixar o usuário sem feedback durante upload de arquivos.

## 🎨 Personalização

### Cores e Temas

Todos os componentes respeitam o tema atual (claro/escuro) e alto contraste.

### Durações

Você pode personalizar a duração dos toasts:

```tsx
showSuccess({
  description: 'Mensagem',
  duration: 5000, // 5 segundos
});
```

### Ícones Customizados

LoadingButton aceita ícones customizados:

```tsx
<LoadingButton
  loading={isLoading}
  loadingIcon={<Spinner />}
>
  Salvar
</LoadingButton>
```

## 📚 Referência Completa

### Funções de Toast

- `showSuccess(options)` - Feedback de sucesso
- `showError(options)` - Feedback de erro
- `showWarning(options)` - Feedback de aviso
- `showInfo(options)` - Feedback informativo
- `showLoading(options)` - Loading persistente
- `showSavePromise(promise, messages)` - Feedback automático para promises
- `showCreateSuccess(itemName?)` - Atalho para criação
- `showUpdateSuccess(itemName?)` - Atalho para atualização
- `showDeleteSuccess(itemName?)` - Atalho para exclusão
- `showNetworkError()` - Erro de conexão
- `showValidationError(message?)` - Erro de validação

### Hooks

- `useAsyncAction()` - Gerencia estado de loading para ações assíncronas
- `useInlineFeedback()` - Gerencia feedback inline temporário
- `useProgress()` - Gerencia progresso de operação

### Componentes

- `<LoadingButton />` - Botão com loading
- `<InlineFeedback />` - Feedback inline
- `<ProgressFeedback />` - Barra de progresso
