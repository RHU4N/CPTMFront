# README — Frontend CPTM PWA

**Autores:** Leonardo Torres, Mauricio Maio, Rhuan Santana, Vitor Bastos

---

## Visão Geral

Progressive Web App (PWA) para inspeção ambiental da CPTM. Permite que operadores e administradores realizem o Formulário de Dados de Campo (FDC) de efluentes, com suporte a trabalho offline, sincronização automática, registro fotográfico e administração de usuários e domínios.

---

## Arquitetura

```
CPTMFront/
├── src/
│   ├── api/              # axios configurado (api.js) com interceptors JWT/401
│   ├── components/
│   │   ├── forms/
│   │   │   └── steps/   # 8 steps do wizard FDC
│   │   ├── EfluenteForm.vue   # Wizard container (orquestra os 8 passos)
│   │   ├── PhotoUploader.vue  # Upload, câmera, compressão, preview
│   │   └── AppHeader.vue      # Cabeçalho com logout e perfil
│   ├── views/            # LoginView, DashboardView, HistoricoView, Admin*, MeuPerfilView
│   ├── stores/           # Pinia: auth.js
│   ├── services/         # authService, efluenteService, draftService, offlineQueue
│   ├── utils/            # authStorage, storageService (IndexedDB/localStorage)
│   └── router/           # Vue Router 4 com guards de autenticação e role
├── vite.config.js        # Vite 8 + vite-plugin-pwa
├── Dockerfile            # Build multi-stage → nginx
└── dist/                 # Artefato de build (57 arquivos em precache)
```

---

## Stack Tecnológica

| Componente | Tecnologia |
|---|---|
| Framework | Vue 3 (Composition API) |
| Estado global | Pinia 3 |
| Roteamento | Vue Router 4 |
| Build | Vite 8 |
| PWA | vite-plugin-pwa 1.2 (Workbox generateSW) |
| Mapas | Leaflet 1.9 |
| HTTP | Axios 1.x |
| Containerização | Docker + nginx |

---

## Fluxo FDC (Formulário de Dados de Campo)

O wizard `EfluenteForm.vue` guia o operador por 8 passos sequenciais com validação por etapa:

| Passo | ID | Campos obrigatórios |
|---|---|---|
| 1 | `premissas` | `txNomePjDaContratada`, `txNrContratoContratada`, `txSiglaDeptomMeioAmbiente` |
| 2 | `cadastrador` | `txAutorPfDoCadastro`, `txNmResponsavelCadastro` |
| 3 | `formulario` | `txNaturezaPga` (tipo de formulário é auto-preenchido e readonly) |
| 4 | `dataem` | `txNrElementoMonitoramento`, `txNmElementoMonitoramento`, `txStatusDesvioAmbiental` |
| 5 | `localizacao` | `txNrKmPoste`, `txCdMunicipioIbge`, `txNrLinha` + coordenadas |
| 6 | `caracterizacao` | `txOrigemEfluente` |
| 7 | `fotos` | Até 4 fotos (opcional) |
| 8 | `revisao` | Revisão e envio (submit para API) |

**Auto-preenchidos:**
- `pkCdMeioAmbienteCptm`: `crypto.randomUUID()`
- `dtDataDoCadastramento`: data de hoje
- `txAutorPfDoCadastro`: login da sessão
- `txNmResponsavelCadastro`: nome do usuário da sessão
- `txTipoDeFormulario`: `'Formulário de Cadastramento - FDC (FDC-EEA.EF)'` (readonly)

**Controle de avanço:** `busy = domainsLoading || submitting`. O botão "Próximo" é desabilitado enquanto domínios carregam.

---

## PWA e Offline

### Service Worker (Workbox generateSW)

- **Estratégia API** (`/api/*`): `NetworkFirst` com timeout 5s, cache de fallback de 24h
- **Estratégia tiles OSM** (`tile.openstreetmap.org`): `CacheFirst`, 30 dias, 300 entradas
- **Precache**: 57 arquivos de build (JS, CSS, HTML, imagens)
- **NavigateFallback**: `/index.html` (SPA routing offline)

### IndexedDB

Banco `cptm-offline-db` (via storageService) com stores para:
- Rascunhos de FDC em progresso
- Fila de sincronização offline

### Comportamento offline

1. App carrega do cache do Service Worker
2. Rascunhos são salvos no IndexedDB
3. Quando a conexão é restaurada, a fila de sincronização envia os dados pendentes
4. O log de sincronização é registrado via `POST /api/log/sincronizacoes`

---

## Autenticação

- Sessão armazenada em `localStorage` (token JWT)
- Guards de rota verificam `isAuthenticated` e `isAdmin` (via Pinia store)
- Token Bearer enviado automaticamente em todas as requisições (interceptor Axios)
- `cptm:unauthorized` custom event: ao receber HTTP 401, limpa sessão e redireciona para `/login`
- Rota `/trocar-senha` obrigatória no primeiro acesso (`primeiroAcesso: true`)

---

## Registro Fotográfico

`PhotoUploader.vue` gerencia até 4 fotos por inspeção:

- **Upload por arquivo**: `input[type="file"]` aceita `image/*` (múltiplos)
- **Câmera mobile**: `getUserMedia` com aspect ratio 3:4
- **Compressão automática**: canvas crop central 3:4 + JPEG 82% (max 900px de largura)
- **Preview**: `URL.createObjectURL` com drag-and-drop para reordenação
- **Remoção individual** e ordenação via botões ↑/↓

---

## Administração

### Usuários (`/admin/usuarios`)
- Listagem, criação, edição e exclusão de usuários
- Geração de senha temporária (10 chars, forte)
- Restrição: apenas perfil `admin`

### Domínios (`/admin/dominios`)
- CRUD de todos os domínios (municípios, linhas, origens de efluente, etc.)
- Seletor de tipo: o conteúdo e o botão "+ Novo Item" só aparecem após selecionar o tipo
- Modal de criação/edição com validação de campo obrigatório

### Logs (`/admin/logs`)
- Visualização de `TB_LOG_ACAO` (ações de usuários)
- Visualização de `TB_LOG_SINCRONIZACAO` (sincronizações offline)

---

## Docker Local

O Dockerfile usa build multi-stage:

```dockerfile
# Stage 1: build Vite
FROM node:22-alpine AS builder
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm ci && npm run build

# Stage 2: nginx para servir os estáticos
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

O docker-compose passa `VITE_API_BASE_URL=http://localhost:5000` para que o browser acesse a API diretamente na porta 5000 do host.

```bash
# Subir todos os serviços (da pasta CPTMBack)
docker compose up -d

# Rebuild do frontend
docker compose build frontend
docker compose up -d frontend
```

---

## Variáveis de Ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:5000` | URL base da API (usada em tempo de build pelo browser) |

---

## Desenvolvimento Local

```bash
cd CPTMFront

# Instalar dependências
npm install

# Servidor de desenvolvimento (hot reload)
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Dev completo (API + Frontend)
npm run dev:full
```

A variável `VITE_API_BASE_URL` pode ser configurada em `.env.local`:
```
VITE_API_BASE_URL=http://localhost:5000
```

---

## Deploy Vercel

1. Conectar o repositório no painel Vercel
2. Configurar build:
   - **Framework Preset:** Vite
   - **Root Directory:** `CPTMFront`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Adicionar variável de ambiente:
   - `VITE_API_BASE_URL` = URL pública da API em produção
4. Configurar `vercel.json` para SPA routing:
   ```json
   { "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }] }
   ```

---

## Responsividade

| Viewport | Suporte |
|---|---|
| 768px+ (tablet/desktop) | Completo — sem overflow horizontal |
| 375px (iPhone SE) | Parcial — overflow horizontal de ~32px (bug conhecido) |
| 320px (mobile pequeno) | Parcial — overflow horizontal de ~87px (bug conhecido) |

Os viewports abaixo de 375px apresentam overflow horizontal causado por elementos com largura mínima fixa. Correção planejada para próxima versão.
