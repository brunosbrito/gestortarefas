# Especificação de API - Módulo de Notas Fiscais (DANFE/NF-e)

## Visão Geral

Este documento especifica os endpoints necessários para o backend implementar o sistema completo de gestão de Notas Fiscais Eletrônicas (NF-e), incluindo importação de XML, processamento, validação e geração de DANFE.

**Base URL:** `https://api.gmxindustrial.com.br/api/suprimentos/nf`

**Autenticação:** Bearer Token (JWT) no header `Authorization`

---

## Índice

1. [Endpoints](#endpoints)
2. [Modelos de Dados](#modelos-de-dados)
3. [Validações e Regras de Negócio](#validações-e-regras-de-negócio)
4. [Processamento de XML NF-e](#processamento-de-xml-nf-e)
5. [Geração de DANFE](#geração-de-danfe)
6. [Integração com n8n](#integração-com-n8n)
7. [Stack Tecnológico Recomendado](#stack-tecnológico-recomendado)
8. [Considerações de Segurança](#considerações-de-segurança)

---

## Endpoints

### 1. Listar Notas Fiscais

**Endpoint:** `GET /api/suprimentos/nf`

**Query Parameters:**
- `contrato_id` (opcional): number - Filtrar NFs por contrato
- `status` (opcional): string - Filtrar por status (validado, processado, rejeitado)
- `fornecedor` (opcional): string - Filtrar por nome/CNPJ do fornecedor
- `data_inicio` (opcional): date - Data inicial de emissão
- `data_fim` (opcional): date - Data final de emissão

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "numero": "12345",
      "serie": "1",
      "chave_acesso": "35240112345678901234550010000123451234567890",
      "cnpj_fornecedor": "12.345.678/0001-90",
      "nome_fornecedor": "Fornecedor ABC Ltda",
      "data_emissao": "2024-03-15T10:30:00Z",
      "valor_total": 50000.00,
      "valor_produtos": 48000.00,
      "valor_impostos": 2000.00,
      "peso_total": 10000.50,
      "pasta_origem": "NFsMarco2024",
      "subpasta": "Semana1",
      "status_processamento": "validado",
      "contrato_id": 1,
      "observacoes": null,
      "created_at": "2024-03-15T14:20:00Z",
      "updated_at": "2024-03-15T14:20:00Z",
      "items": [
        {
          "id": 1,
          "nf_id": 1,
          "numero_item": 1,
          "codigo_produto": "AÇO-CA50-12MM",
          "descricao": "Aço estrutural CA-50 12mm",
          "ncm": "72142000",
          "quantidade": 10,
          "unidade": "TON",
          "valor_unitario": 4800.00,
          "valor_total": 48000.00,
          "centro_custo": "Material",
          "status_integracao": "integrado",
          "created_at": "2024-03-15T14:20:00Z"
        }
      ]
    }
  ]
}
```

---

### 2. Obter Detalhes de uma NF

**Endpoint:** `GET /api/suprimentos/nf/:id`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "numero": "12345",
    "serie": "1",
    "chave_acesso": "35240112345678901234550010000123451234567890",
    "cnpj_fornecedor": "12.345.678/0001-90",
    "nome_fornecedor": "Fornecedor ABC Ltda",
    "data_emissao": "2024-03-15T10:30:00Z",
    "valor_total": 50000.00,
    "valor_produtos": 48000.00,
    "valor_impostos": 2000.00,
    "pasta_origem": "NFsMarco2024",
    "status_processamento": "validado",
    "contrato_id": 1,
    "protocolo_autorizacao": "135240012345678",
    "data_autorizacao": "2024-03-15T10:35:00Z",
    "xml_original_path": "/storage/nfe/2024/03/nfe_12345.xml",
    "items": [...],
    "historico": [
      {
        "id": 1,
        "acao": "importado",
        "usuario": "João Silva",
        "data": "2024-03-15T14:20:00Z",
        "observacao": "Importado via n8n webhook"
      },
      {
        "id": 2,
        "acao": "validado",
        "usuario": "Maria Santos",
        "data": "2024-03-15T15:00:00Z",
        "observacao": "Conferido com pedido de compra #PC-123"
      }
    ]
  }
}
```

**Response 404:**
```json
{
  "success": false,
  "message": "Nota fiscal não encontrada"
}
```

---

### 3. Importar XML de NF-e

**Endpoint:** `POST /api/suprimentos/nf/import`

**Content-Type:** `multipart/form-data`

**Body:**
- `xml_file`: File - Arquivo XML da NF-e
- `contrato_id` (opcional): number - Associar NF a um contrato
- `pasta_origem` (opcional): string - Pasta de origem (para tracking)

**Processamento:**
1. Validar estrutura XML contra schema XSD da SEFAZ
2. Validar chave de acesso (algoritmo de dígito verificador)
3. Verificar duplicidade (mesma chave de acesso)
4. Extrair todos os campos relevantes
5. Armazenar XML original em storage
6. Criar registro no banco de dados
7. Criar itens associados
8. Retornar NF processada

**Response 200:**
```json
{
  "success": true,
  "message": "NF-e importada com sucesso",
  "data": {
    "id": 1,
    "numero": "12345",
    "serie": "1",
    "chave_acesso": "35240112345678901234550010000123451234567890",
    "cnpj_fornecedor": "12.345.678/0001-90",
    "nome_fornecedor": "Fornecedor ABC Ltda",
    "valor_total": 50000.00,
    "status_processamento": "processado",
    "items": [...]
  }
}
```

**Response 400:**
```json
{
  "success": false,
  "message": "XML inválido",
  "errors": [
    "Chave de acesso inválida",
    "Campo obrigatório 'emit.CNPJ' não encontrado",
    "Valor total inconsistente (soma dos itens não bate)"
  ]
}
```

**Response 409:**
```json
{
  "success": false,
  "message": "NF-e já importada anteriormente",
  "data": {
    "id": 1,
    "chave_acesso": "35240112345678901234550010000123451234567890",
    "data_importacao": "2024-03-10T10:00:00Z"
  }
}
```

---

### 4. Validar Nota Fiscal

**Endpoint:** `POST /api/suprimentos/nf/:id/validate`

**Body:**
```json
{
  "observacao": "Conferido com pedido de compra #PC-123"
}
```

**Processamento:**
1. Verificar se NF está em status 'processado' ou 'rejeitado'
2. Atualizar status para 'validado'
3. Registrar no histórico com usuário e timestamp
4. (Opcional) Integrar com sistema de contabilidade

**Response 200:**
```json
{
  "success": true,
  "message": "NF validada com sucesso",
  "data": {
    "id": 1,
    "status_processamento": "validado",
    "validado_por": "Maria Santos",
    "validado_em": "2024-03-15T15:00:00Z"
  }
}
```

**Response 400:**
```json
{
  "success": false,
  "message": "NF não pode ser validada no status atual"
}
```

---

### 5. Rejeitar Nota Fiscal

**Endpoint:** `POST /api/suprimentos/nf/:id/reject`

**Body:**
```json
{
  "reason": "Valores não conferem com pedido de compra. Diferença de R$ 5.000,00 no item #3."
}
```

**Validações:**
- `reason` é obrigatório e deve ter no mínimo 10 caracteres

**Response 200:**
```json
{
  "success": true,
  "message": "NF rejeitada",
  "data": {
    "id": 1,
    "status_processamento": "rejeitado",
    "rejeitado_por": "João Silva",
    "rejeitado_em": "2024-03-15T16:30:00Z",
    "motivo_rejeicao": "Valores não conferem com pedido de compra..."
  }
}
```

---

### 6. Download de XML Original

**Endpoint:** `GET /api/suprimentos/nf/:id/download/xml`

**Response 200:**
- **Content-Type:** `application/xml`
- **Content-Disposition:** `attachment; filename="NFe_12345_serie1.xml"`
- **Body:** Stream do arquivo XML original

**Response 404:**
```json
{
  "success": false,
  "message": "XML não encontrado"
}
```

---

### 7. Download de DANFE (PDF)

**Endpoint:** `GET /api/suprimentos/nf/:id/download/pdf`

**Query Parameters:**
- `layout` (opcional): string - "retrato" ou "paisagem" (default: "retrato")

**Processamento:**
1. Buscar dados da NF no banco
2. Gerar DANFE seguindo layout oficial SEFAZ
3. Incluir código de barras da chave de acesso
4. Incluir QR Code (se NFC-e)
5. Incluir protocolo de autorização
6. Retornar PDF como stream

**Response 200:**
- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="DANFE_12345_serie1.pdf"`
- **Body:** Stream do PDF gerado

**Especificações do DANFE:**
- Seguir layout padrão SEFAZ (Versão 4.01)
- Incluir todas as seções obrigatórias:
  - Identificação do emitente
  - Destinatário/Remetente
  - Dados do produto/serviço
  - Cálculo do imposto
  - Transportador/Volumes
  - Dados adicionais
  - Código de barras com chave de acesso
  - Protocolo de autorização e data/hora

---

### 8. Estatísticas de NFs

**Endpoint:** `GET /api/suprimentos/nf/stats`

**Query Parameters:**
- `periodo` (opcional): string - "mes_atual", "trimestre", "ano", "customizado"
- `data_inicio` (opcional): date - Para período customizado
- `data_fim` (opcional): date - Para período customizado

**Response 200:**
```json
{
  "success": true,
  "data": {
    "total_nfs": 150,
    "validated": 120,
    "pending_validation": 25,
    "rejected": 5,
    "total_value": 5250000.00,
    "total_weight": 125000.50,
    "by_fornecedor": [
      {
        "cnpj": "12.345.678/0001-90",
        "nome": "Fornecedor ABC",
        "quantidade": 45,
        "valor_total": 2100000.00
      }
    ],
    "by_month": [
      {
        "mes": "2024-03",
        "quantidade": 50,
        "valor_total": 1750000.00
      }
    ]
  }
}
```

---

### 9. Processar Pasta via n8n Webhook

**Endpoint:** `POST /api/suprimentos/nf/process-folder`

**Body:**
```json
{
  "folder_name": "NFsMarco2024/Semana1",
  "contrato_id": 1
}
```

**Processamento:**
1. Criar log de processamento
2. Chamar webhook n8n configurado
3. n8n irá:
   - Acessar pasta no OneDrive
   - Baixar todos os XMLs
   - Chamar endpoint `/import` para cada XML
   - Retornar callback com status
4. Retornar ID do log para tracking

**Response 200:**
```json
{
  "success": true,
  "message": "Processamento iniciado via n8n",
  "data": {
    "processing_log_id": 42,
    "webhook_status": 200,
    "n8n_url": "https://n8n.gmxindustrial.com.br/webhook/process-nf-folder",
    "estimated_time": "5 minutos"
  }
}
```

**Response 500:**
```json
{
  "success": false,
  "message": "Erro ao chamar webhook n8n",
  "error": "Connection refused"
}
```

---

### 10. Status de Processamento de Pasta

**Endpoint:** `GET /api/suprimentos/nf/process-folder/:log_id/status`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "log_id": 42,
    "status": "processing",
    "progress": {
      "total_files": 25,
      "processed": 18,
      "success": 16,
      "failed": 2,
      "percentage": 72
    },
    "errors": [
      {
        "file": "NF_12350.xml",
        "error": "XML inválido - chave de acesso incorreta"
      }
    ],
    "started_at": "2024-03-15T16:00:00Z",
    "estimated_completion": "2024-03-15T16:05:00Z"
  }
}
```

---

## Modelos de Dados

### Nota Fiscal (nota_fiscal)

```sql
CREATE TABLE nota_fiscal (
  id SERIAL PRIMARY KEY,
  numero VARCHAR(20) NOT NULL,
  serie VARCHAR(10) NOT NULL,
  chave_acesso VARCHAR(44) UNIQUE NOT NULL,
  modelo VARCHAR(2) NOT NULL, -- '55' para NF-e, '65' para NFC-e

  -- Emitente (Fornecedor)
  cnpj_fornecedor VARCHAR(18) NOT NULL,
  nome_fornecedor VARCHAR(255) NOT NULL,
  inscricao_estadual_fornecedor VARCHAR(20),

  -- Destinatário (Empresa)
  cnpj_destinatario VARCHAR(18) NOT NULL,
  nome_destinatario VARCHAR(255) NOT NULL,

  -- Datas
  data_emissao TIMESTAMP NOT NULL,
  data_entrada_saida TIMESTAMP,

  -- Valores
  valor_total DECIMAL(15, 2) NOT NULL,
  valor_produtos DECIMAL(15, 2),
  valor_frete DECIMAL(15, 2) DEFAULT 0,
  valor_seguro DECIMAL(15, 2) DEFAULT 0,
  valor_desconto DECIMAL(15, 2) DEFAULT 0,
  valor_impostos DECIMAL(15, 2) DEFAULT 0,

  -- ICMS
  valor_base_icms DECIMAL(15, 2),
  valor_icms DECIMAL(15, 2),

  -- IPI
  valor_ipi DECIMAL(15, 2),

  -- PIS/COFINS
  valor_pis DECIMAL(15, 2),
  valor_cofins DECIMAL(15, 2),

  -- Transporte
  peso_bruto DECIMAL(15, 3),
  peso_liquido DECIMAL(15, 3),
  peso_total DECIMAL(15, 3),

  -- Informações Adicionais
  informacoes_complementares TEXT,
  informacoes_fisco TEXT,

  -- Autorização SEFAZ
  protocolo_autorizacao VARCHAR(50),
  data_autorizacao TIMESTAMP,

  -- Controle Interno
  pasta_origem VARCHAR(255),
  subpasta VARCHAR(255),
  xml_original_path VARCHAR(500) NOT NULL,
  status_processamento VARCHAR(20) NOT NULL DEFAULT 'processado',
    -- Valores possíveis: 'processado', 'validado', 'rejeitado', 'cancelado'

  contrato_id INTEGER REFERENCES contrato(id) ON DELETE SET NULL,

  -- Validação/Rejeição
  validado_por INTEGER REFERENCES users(id),
  validado_em TIMESTAMP,
  rejeitado_por INTEGER REFERENCES users(id),
  rejeitado_em TIMESTAMP,
  motivo_rejeicao TEXT,
  observacoes TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_chave_acesso (chave_acesso),
  INDEX idx_cnpj_fornecedor (cnpj_fornecedor),
  INDEX idx_status (status_processamento),
  INDEX idx_data_emissao (data_emissao),
  INDEX idx_contrato (contrato_id)
);
```

### Item de Nota Fiscal (nota_fiscal_item)

```sql
CREATE TABLE nota_fiscal_item (
  id SERIAL PRIMARY KEY,
  nf_id INTEGER NOT NULL REFERENCES nota_fiscal(id) ON DELETE CASCADE,

  numero_item INTEGER NOT NULL,
  codigo_produto VARCHAR(100),
  ean VARCHAR(14),
  descricao TEXT NOT NULL,
  ncm VARCHAR(8),
  cfop VARCHAR(4),

  unidade VARCHAR(10) NOT NULL,
  quantidade DECIMAL(15, 4) NOT NULL,
  valor_unitario DECIMAL(15, 4) NOT NULL,
  valor_total DECIMAL(15, 2) NOT NULL,
  valor_desconto DECIMAL(15, 2) DEFAULT 0,

  -- Impostos do item
  valor_icms DECIMAL(15, 2),
  aliquota_icms DECIMAL(5, 2),
  valor_ipi DECIMAL(15, 2),
  aliquota_ipi DECIMAL(5, 2),
  valor_pis DECIMAL(15, 2),
  valor_cofins DECIMAL(15, 2),

  -- Integração
  centro_custo VARCHAR(100),
  categoria VARCHAR(100),
  status_integracao VARCHAR(20) DEFAULT 'pendente',
    -- Valores: 'pendente', 'integrado', 'rejeitado'

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_nf_id (nf_id),
  INDEX idx_codigo_produto (codigo_produto)
);
```

### Histórico de NF (nota_fiscal_historico)

```sql
CREATE TABLE nota_fiscal_historico (
  id SERIAL PRIMARY KEY,
  nf_id INTEGER NOT NULL REFERENCES nota_fiscal(id) ON DELETE CASCADE,

  acao VARCHAR(50) NOT NULL,
    -- Valores: 'importado', 'validado', 'rejeitado', 'cancelado', 'alterado'

  usuario_id INTEGER REFERENCES users(id),
  usuario_nome VARCHAR(255),

  observacao TEXT,
  dados_anteriores JSONB, -- Para auditoria de alterações

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_nf_id (nf_id),
  INDEX idx_created_at (created_at)
);
```

### Log de Processamento (nf_processing_log)

```sql
CREATE TABLE nf_processing_log (
  id SERIAL PRIMARY KEY,

  folder_name VARCHAR(255) NOT NULL,
  contrato_id INTEGER REFERENCES contrato(id),

  status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- Valores: 'pending', 'processing', 'completed', 'failed'

  total_files INTEGER DEFAULT 0,
  processed_files INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,

  errors JSONB,
  n8n_workflow_id VARCHAR(100),

  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,

  created_by INTEGER REFERENCES users(id),

  INDEX idx_status (status),
  INDEX idx_created_at (started_at)
);
```

---

## Validações e Regras de Negócio

### Validação de Chave de Acesso

A chave de acesso tem 44 dígitos e deve seguir o algoritmo de validação da SEFAZ:

**Estrutura:**
```
UF (2) + AAMM (4) + CNPJ (14) + MOD (2) + SERIE (3) + NNF (9) + TPEMIS (1) + CNNN (8) + DV (1)
```

**Algoritmo do Dígito Verificador:**
```python
def validar_chave_acesso(chave: str) -> bool:
    if len(chave) != 44:
        return False

    # Pegar os 43 primeiros dígitos
    chave_sem_dv = chave[:43]
    dv_informado = int(chave[43])

    # Calcular DV usando módulo 11
    multiplicador = 2
    soma = 0

    for i in range(len(chave_sem_dv) - 1, -1, -1):
        soma += int(chave_sem_dv[i]) * multiplicador
        multiplicador += 1
        if multiplicador > 9:
            multiplicador = 2

    resto = soma % 11

    if resto == 0 or resto == 1:
        dv_calculado = 0
    else:
        dv_calculado = 11 - resto

    return dv_calculado == dv_informado
```

### Validações de XML

1. **Schema XSD:** Validar contra schema oficial da SEFAZ (versão atual)
2. **Campos Obrigatórios:**
   - `nfeProc.NFe.infNFe.ide` (identificação)
   - `nfeProc.NFe.infNFe.emit` (emitente)
   - `nfeProc.NFe.infNFe.dest` (destinatário)
   - `nfeProc.NFe.infNFe.det` (detalhamento - pelo menos 1 item)
   - `nfeProc.NFe.infNFe.total` (totais)

3. **Validação de Valores:**
   - Soma dos valores dos itens deve bater com valor total
   - Validar cálculos de impostos
   - Verificar consistência de pesos

4. **Validação de Datas:**
   - Data de emissão não pode ser futura
   - Data de emissão não pode ser anterior a 90 dias (configurável)

### Regras de Duplicidade

- Não permitir importar XML com mesma chave de acesso
- Permitir re-importação se NF anterior foi rejeitada (após confirmação)
- Alertar se existir NF com mesmo número/série/fornecedor mas chave diferente

---

## Processamento de XML NF-e

### Estrutura do XML NF-e (Resumida)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe35240112345678901234550010000123451234567890" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <cNF>12345678</cNF>
        <natOp>Venda de mercadoria</natOp>
        <mod>55</mod>
        <serie>1</serie>
        <nNF>12345</nNF>
        <dhEmi>2024-03-15T10:30:00-03:00</dhEmi>
        <tpNF>1</tpNF>
        <finNFe>1</finNFe>
      </ide>

      <emit>
        <CNPJ>12345678000190</CNPJ>
        <xNome>FORNECEDOR ABC LTDA</xNome>
        <xFant>Fornecedor ABC</xFant>
        <enderEmit>
          <xLgr>Rua Exemplo</xLgr>
          <nro>123</nro>
          <xBairro>Centro</xBairro>
          <cMun>3550308</cMun>
          <xMun>São Paulo</xMun>
          <UF>SP</UF>
          <CEP>01234567</CEP>
        </enderEmit>
        <IE>123456789</IE>
      </emit>

      <dest>
        <CNPJ>98765432000110</CNPJ>
        <xNome>GML ESTRUTURAS LTDA</xNome>
        <enderDest>
          <xLgr>Avenida Industrial</xLgr>
          <nro>456</nro>
          <xBairro>Distrito Industrial</xBairro>
          <cMun>3550308</cMun>
          <xMun>São Paulo</xMun>
          <UF>SP</UF>
          <CEP>07654321</CEP>
        </enderDest>
        <IE>987654321</IE>
      </dest>

      <det nItem="1">
        <prod>
          <cProd>AÇO-CA50-12MM</cProd>
          <cEAN></cEAN>
          <xProd>Aço estrutural CA-50 12mm</xProd>
          <NCM>72142000</NCM>
          <CFOP>5101</CFOP>
          <uCom>TON</uCom>
          <qCom>10.0000</qCom>
          <vUnCom>4800.0000</vUnCom>
          <vProd>48000.00</vProd>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <modBC>0</modBC>
              <vBC>48000.00</vBC>
              <pICMS>18.00</pICMS>
              <vICMS>8640.00</vICMS>
            </ICMS00>
          </ICMS>
        </imposto>
      </det>

      <total>
        <ICMSTot>
          <vBC>48000.00</vBC>
          <vICMS>8640.00</vICMS>
          <vProd>48000.00</vProd>
          <vNF>50000.00</vNF>
        </ICMSTot>
      </total>

      <transp>
        <modFrete>0</modFrete>
        <vol>
          <qVol>100</qVol>
          <pesoL>9500.500</pesoL>
          <pesoB>10000.500</pesoB>
        </vol>
      </transp>

      <infAdic>
        <infCpl>Observações adicionais da nota fiscal</infCpl>
      </infAdic>
    </infNFe>
  </NFe>

  <protNFe versao="4.00">
    <infProt>
      <tpAmb>1</tpAmb>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e</xMotivo>
      <nProt>135240012345678</nProt>
      <dhRecbto>2024-03-15T10:35:00-03:00</dhRecbto>
    </infProt>
  </protNFe>
</nfeProc>
```

### Campos a Extrair

**Identificação (`ide`):**
- `mod`: Modelo (55 = NF-e, 65 = NFC-e)
- `serie`: Série
- `nNF`: Número da NF
- `dhEmi`: Data/hora de emissão

**Emitente (`emit`):**
- `CNPJ`: CNPJ do fornecedor
- `xNome`: Razão social
- `IE`: Inscrição estadual

**Destinatário (`dest`):**
- `CNPJ`: CNPJ da empresa
- `xNome`: Razão social

**Itens (`det`):**
- `prod.cProd`: Código do produto
- `prod.xProd`: Descrição
- `prod.NCM`: NCM
- `prod.CFOP`: CFOP
- `prod.uCom`: Unidade
- `prod.qCom`: Quantidade
- `prod.vUnCom`: Valor unitário
- `prod.vProd`: Valor total do produto

**Totais (`total.ICMSTot`):**
- `vBC`: Base de cálculo ICMS
- `vICMS`: Valor do ICMS
- `vProd`: Valor dos produtos
- `vNF`: Valor total da NF

**Transporte (`transp`):**
- `vol.pesoL`: Peso líquido
- `vol.pesoB`: Peso bruto

**Protocolo (`protNFe.infProt`):**
- `nProt`: Número do protocolo
- `dhRecbto`: Data/hora de autorização

---

## Geração de DANFE

### Layout Padrão SEFAZ

O DANFE deve seguir o layout oficial definido no **Manual de Orientação do Contribuinte - MOC versão 7.0** da SEFAZ.

**Seções obrigatórias (Retrato):**

1. **Topo (Recibo do Destinatário)**
   - "RECEBEMOS DE [EMITENTE] OS PRODUTOS CONSTANTES DA NOTA FISCAL..."
   - Data de recebimento, identificação e assinatura

2. **Cabeçalho**
   - Logo/identificação do emitente (opcional)
   - "DANFE" em destaque
   - "Documento Auxiliar da Nota Fiscal Eletrônica"
   - Tipo de operação (Entrada/Saída)
   - Número, série, folha
   - Chave de acesso com código de barras
   - Protocolo de autorização

3. **Dados do Emitente**
   - Razão social
   - Endereço completo
   - CNPJ
   - Inscrição estadual

4. **Destinatário/Remetente**
   - Razão social
   - CNPJ/CPF
   - Endereço completo
   - Inscrição estadual

5. **Dados do Produto/Serviço**
   - Tabela com colunas:
     - Código
     - Descrição
     - NCM/SH
     - CST
     - CFOP
     - Unidade
     - Quantidade
     - Valor unitário
     - Valor total
     - BC ICMS
     - Valor ICMS
     - Valor IPI
     - Alíquotas

6. **Cálculo do Imposto**
   - Base de cálculo ICMS
   - Valor do ICMS
   - Base de cálculo ICMS ST
   - Valor do ICMS ST
   - Valor total dos produtos
   - Valor do frete
   - Valor do seguro
   - Desconto
   - Outras despesas
   - Valor do IPI
   - **Valor total da nota**

7. **Transportador/Volumes Transportados**
   - Razão social do transportador
   - Frete por conta (0=Emitente, 1=Destinatário)
   - Placa do veículo, UF
   - CNPJ/CPF
   - Endereço
   - Quantidade, espécie, marca, numeração
   - Peso bruto e líquido

8. **Dados Adicionais**
   - Informações complementares
   - Reservado ao fisco

9. **Rodapé**
   - Mensagem padrão SEFAZ
   - Número do protocolo e data/hora de autorização

### Código de Barras

Usar biblioteca para gerar **Code128** com a chave de acesso (44 dígitos).

### QR Code (NFC-e)

Para NFC-e (modelo 65), incluir QR Code conforme especificação SEFAZ.

---

## Integração com n8n

### Workflow n8n Sugerido

```
┌─────────────┐
│  Webhook    │ <- POST /webhook/process-nf-folder
└──────┬──────┘
       │
       v
┌─────────────────────┐
│ OneDrive - List     │ Lista arquivos .xml na pasta
└──────┬──────────────┘
       │
       v
┌─────────────────────┐
│ Loop Items          │ Para cada arquivo XML
└──────┬──────────────┘
       │
       v
┌─────────────────────┐
│ OneDrive - Download │ Baixa o XML
└──────┬──────────────┘
       │
       v
┌─────────────────────┐
│ HTTP Request        │ POST /api/suprimentos/nf/import
└──────┬──────────────┘
       │
       v
┌─────────────────────┐
│ Set Status          │ Registra sucesso/falha
└──────┬──────────────┘
       │
       v
┌─────────────────────┐
│ HTTP Callback       │ PUT /api/suprimentos/nf/process-folder/:log_id/status
└─────────────────────┘
```

### Endpoints de Callback

**Atualizar Status:**
```
PUT /api/suprimentos/nf/process-folder/:log_id/status
```

**Body:**
```json
{
  "status": "processing",
  "total_files": 25,
  "processed_files": 18,
  "success_count": 16,
  "failed_count": 2,
  "errors": [
    {
      "file": "NF_12350.xml",
      "error": "XML inválido"
    }
  ]
}
```

---

## Stack Tecnológico Recomendado

### Backend (Python/FastAPI)

```python
# requirements.txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4

# Processamento de XML NF-e
lxml==5.1.0
xmlschema==3.0.2

# Geração de DANFE
reportlab==4.0.9
python-barcode==0.15.1
qrcode[pil]==7.4.2

# Validações
pydantic==2.5.3
python-decouple==3.8

# HTTP Client
httpx==0.26.0
requests==2.31.0

# Utilitários
python-dateutil==2.8.2
```

### Exemplo de Estrutura

```
backend/
├── app/
│   ├── api/
│   │   └── suprimentos/
│   │       ├── nf_routes.py
│   │       ├── nf_service.py
│   │       └── nf_models.py
│   ├── core/
│   │   ├── auth.py
│   │   └── config.py
│   ├── utils/
│   │   ├── xml_parser.py
│   │   ├── danfe_generator.py
│   │   └── validators.py
│   └── main.py
├── storage/
│   └── nfe/
│       └── 2024/
│           └── 03/
├── schemas/
│   └── nfe_v4.00.xsd
└── requirements.txt
```

### Exemplo de Parser XML

```python
from lxml import etree
import xmlschema

class NFEParser:
    def __init__(self, xml_content: bytes):
        self.xml_content = xml_content
        self.tree = etree.fromstring(xml_content)
        self.schema = xmlschema.XMLSchema('schemas/nfe_v4.00.xsd')

    def validate_schema(self) -> bool:
        """Valida XML contra schema XSD"""
        return self.schema.is_valid(self.tree)

    def extract_data(self) -> dict:
        """Extrai dados do XML"""
        ns = {'nfe': 'http://www.portalfiscal.inf.br/nfe'}

        # Chave de acesso
        inf_nfe = self.tree.find('.//nfe:infNFe', ns)
        chave_acesso = inf_nfe.get('Id')[3:]  # Remove 'NFe' do início

        # Identificação
        ide = self.tree.find('.//nfe:ide', ns)
        numero = ide.find('nfe:nNF', ns).text
        serie = ide.find('nfe:serie', ns).text
        data_emissao = ide.find('nfe:dhEmi', ns).text

        # Emitente
        emit = self.tree.find('.//nfe:emit', ns)
        cnpj_fornecedor = emit.find('nfe:CNPJ', ns).text
        nome_fornecedor = emit.find('nfe:xNome', ns).text

        # Totais
        total = self.tree.find('.//nfe:ICMSTot', ns)
        valor_produtos = float(total.find('nfe:vProd', ns).text)
        valor_total = float(total.find('nfe:vNF', ns).text)

        # Itens
        items = []
        for det in self.tree.findall('.//nfe:det', ns):
            prod = det.find('nfe:prod', ns)
            item = {
                'numero_item': int(det.get('nItem')),
                'codigo_produto': prod.find('nfe:cProd', ns).text,
                'descricao': prod.find('nfe:xProd', ns).text,
                'ncm': prod.find('nfe:NCM', ns).text,
                'quantidade': float(prod.find('nfe:qCom', ns).text),
                'unidade': prod.find('nfe:uCom', ns).text,
                'valor_unitario': float(prod.find('nfe:vUnCom', ns).text),
                'valor_total': float(prod.find('nfe:vProd', ns).text),
            }
            items.append(item)

        return {
            'chave_acesso': chave_acesso,
            'numero': numero,
            'serie': serie,
            'data_emissao': data_emissao,
            'cnpj_fornecedor': cnpj_fornecedor,
            'nome_fornecedor': nome_fornecedor,
            'valor_produtos': valor_produtos,
            'valor_total': valor_total,
            'items': items
        }
```

### Exemplo de Gerador DANFE

```python
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
import barcode
from barcode.writer import ImageWriter

class DANFEGenerator:
    def __init__(self, nf_data: dict):
        self.nf_data = nf_data
        self.width, self.height = A4

    def generate(self, output_path: str):
        """Gera PDF do DANFE"""
        c = canvas.Canvas(output_path, pagesize=A4)

        # Cabeçalho
        self._draw_header(c)

        # Dados do emitente
        self._draw_emitente(c)

        # Destinatário
        self._draw_destinatario(c)

        # Tabela de produtos
        self._draw_produtos(c)

        # Totais
        self._draw_totais(c)

        # Código de barras
        self._draw_barcode(c)

        c.showPage()
        c.save()

    def _draw_header(self, c):
        # Título DANFE
        c.setFont("Helvetica-Bold", 16)
        c.drawString(100*mm, 280*mm, "DANFE")

        c.setFont("Helvetica", 8)
        c.drawString(100*mm, 275*mm, "Documento Auxiliar da Nota Fiscal Eletrônica")

        # Número e série
        c.setFont("Helvetica-Bold", 12)
        c.drawString(150*mm, 280*mm, f"Nº {self.nf_data['numero']}")
        c.drawString(150*mm, 275*mm, f"Série {self.nf_data['serie']}")

    def _draw_barcode(self, c):
        # Gerar código de barras da chave de acesso
        chave = self.nf_data['chave_acesso']

        # Usar biblioteca python-barcode
        code128 = barcode.get('code128', chave, writer=ImageWriter())
        filename = code128.save('temp_barcode')

        # Desenhar no PDF
        c.drawImage(filename, 20*mm, 20*mm, width=170*mm, height=15*mm)

        # Texto da chave abaixo do código de barras
        c.setFont("Helvetica", 8)
        chave_formatada = ' '.join([chave[i:i+4] for i in range(0, len(chave), 4)])
        c.drawString(20*mm, 15*mm, chave_formatada)
```

---

## Considerações de Segurança

### Autenticação e Autorização

- Todos os endpoints requerem autenticação JWT
- Implementar roles: `admin`, `gerente_suprimentos`, `visualizador`
- Apenas `admin` e `gerente_suprimentos` podem validar/rejeitar NFs
- Logs de auditoria para todas as ações

### Validação de Entrada

- Sanitizar todos os inputs
- Validar tipo MIME de arquivos uploadados (deve ser XML ou application/xml)
- Limitar tamanho de upload (máximo 5MB por arquivo)
- Validar estrutura XML antes de processar

### Armazenamento

- Armazenar XMLs originais em storage seguro (S3 ou filesystem com permissões restritas)
- Não expor paths absolutos na API
- Implementar controle de acesso aos arquivos
- Backup regular dos XMLs importados

### Rate Limiting

- Limitar requests por IP/usuário
- Endpoint de importação: máximo 10 requisições/minuto
- Endpoint de processamento de pasta: máximo 5 requisições/hora

### Logs e Monitoramento

- Logar todas as importações (sucesso e falha)
- Alertar em caso de múltiplas falhas
- Monitorar webhook n8n (timeout, failures)
- Dashboard de métricas (quantidade processada, taxa de sucesso)

---

## Testes

### Casos de Teste Essenciais

1. **Importação de XML válido**
   - Arquivo XML bem formado e válido
   - Campos obrigatórios presentes
   - Chave de acesso válida

2. **Importação de XML inválido**
   - XML malformado
   - Schema inválido
   - Chave de acesso incorreta
   - Campos obrigatórios faltando

3. **Duplicidade**
   - Tentar importar mesma NF duas vezes
   - Verificar rejeição

4. **Validação/Rejeição**
   - Validar NF processada
   - Rejeitar NF com motivo
   - Tentar validar NF já validada

5. **Geração de DANFE**
   - Gerar PDF com todos os campos
   - Verificar código de barras
   - Verificar layout

6. **Download de arquivos**
   - Download de XML original
   - Download de PDF/DANFE
   - Arquivo não encontrado

---

## Cronograma Sugerido

### Fase 1 (Sprint 1-2): Fundação
- [ ] Setup inicial do projeto backend
- [ ] Modelos de dados e migrations
- [ ] Autenticação e autorização
- [ ] Endpoint de listagem (com mocks)
- [ ] Endpoint de detalhes

### Fase 2 (Sprint 3-4): Processamento
- [ ] Parser de XML NF-e
- [ ] Validação de chave de acesso
- [ ] Validação contra schema XSD
- [ ] Endpoint de importação
- [ ] Armazenamento de XMLs
- [ ] Verificação de duplicidade

### Fase 3 (Sprint 5-6): Validação e DANFE
- [ ] Endpoints de validar/rejeitar
- [ ] Histórico de ações
- [ ] Geração de DANFE básico
- [ ] Código de barras
- [ ] Endpoint de download de PDF

### Fase 4 (Sprint 7): Integração n8n
- [ ] Endpoint de processamento de pasta
- [ ] Webhook n8n
- [ ] Logs de processamento
- [ ] Callback de status

### Fase 5 (Sprint 8): Refinamentos
- [ ] DANFE layout oficial completo
- [ ] Estatísticas e relatórios
- [ ] Testes de integração
- [ ] Documentação final

---

## Contato e Suporte

Para dúvidas sobre esta especificação ou o frontend:
- **Frontend:** Branch `modulo-pcp-qualidade-ai-assistant`
- **Service:** `src/services/suprimentos/nfService.ts`
- **Interface:** `src/interfaces/suprimentos/NotaFiscalInterface.ts`

---

## Referências

- [Portal da Nota Fiscal Eletrônica](http://www.nfe.fazenda.gov.br/)
- [Manual de Orientação do Contribuinte - MOC v7.0](http://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=/fSitConfTecnicos)
- [Schema XSD NF-e v4.00](http://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=Iy/5Qol1YbE=)
- [Código de Barras para DANFE](https://www.gs1br.org/codigos-e-padroes/codigo-de-barras)

---

**Documento gerado por:** Claude Sonnet 4.5
**Data:** 2026-01-14
**Versão:** 1.0
