# GoalKeeper

GoalKeeper é um app web para gerenciar metas e acompanhar o progresso de forma visual e intuitiva. Crie objetivos, registre atualizações periódicas e visualize sua evolução com feedbacks claros para manter o foco e ajustar a estratégia ao longo do caminho.

Demo: https://arturstaation.github.io/GoalKeeper/

## ✨ Funcionalidades

- Criação, edição e exclusão de metas
- Registro de atualizações de progresso
- Visualização do status (percentual, barras de progresso, estados)
- Persistência local (LocalStorage) para manter dados entre sessões
- Interface responsiva e acessível
- Build estático para deploy no GitHub Pages

## 🧱 Tech Stack

- Vue 3 + Vite
- TypeScript
- CSS (Vanilla) com design tokens
- Deploy via GitHub Pages (branch `gh-pages`)

## 🚀 Começando

### Pré-requisitos
- Node.js 18+ e npm

### Instalação
```bash
npm install
```

### Ambiente de desenvolvimento
```bash
npm run dev
```
Acesse a aplicação no endereço exibido pelo Vite (normalmente http://localhost:5173).

### Build de produção
```bash
npm run build
```
Os artefatos serão gerados na pasta `dist/`.

## 📦 Deploy no GitHub Pages

Fluxo recomendado:
1. Garanta que suas mudanças estão na branch principal (`main`).
2. Rode o build:
   ```bash
   npm run build
   ```
3. Publique a pasta `dist/` na branch `gh-pages`:
   ```bash
   git add dist -f
   git commit -am "atualizando gh-pages"
   git push origin --delete gh-pages
   git subtree push --prefix dist origin gh-pages
   ```
A página ficará disponível em: https://arturstaation.github.io/GoalKeeper/

## 🗂️ Estrutura do projeto (resumo)

```
GoalKeeper/
├─ public/            # Assets estáticos
├─ src/               # Código-fonte (Vue 3 + TS)
│  ├─ components/     # Componentes reutilizáveis
│  ├─ views/          # Páginas/telas
│  ├─ store/          # Estado (se houver)
│  ├─ styles/         # Estilos globais / tokens
│  └─ main.ts         # Bootstrap da aplicação
├─ index.html
├─ vite.config.ts
└─ package.json
```



## 🧪 Qualidade e padrões

- Type-check com `vue-tsc`
- Scripts úteis:
  - `npm run dev` — Servidor de desenvolvimento
  - `npm run build` — Build de produção
  - `npm run preview` — Pré-visualização do build
