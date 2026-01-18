# 🚀 Como Iniciar o Projeto

## 📋 Passos Rápidos

### 1. Instalar Dependências

```bash
cd client
npm install
```

**Nota**: Se não tiver `npm`, pode usar `yarn` ou `pnpm`.

### 2. Rodar o Jogo

```bash
npm run dev
```

### 3. Acessar no Navegador

O Vite abrirá automaticamente em: **http://localhost:3000**

Se não abrir automaticamente, acesse manualmente.

---

## 📝 Comandos Úteis

### Instalar dependências
```bash
cd client
npm install
```

### Rodar em modo desenvolvimento
```bash
cd client
npm run dev
```

### Build para produção
```bash
cd client
npm run build
```

### Preview do build
```bash
cd client
npm run preview
```

---

## ⚠️ Requisitos

- **Node.js** 18+ instalado
- **npm** ou **yarn** ou **pnpm**

### Verificar versão do Node

```bash
node --version
```

Se não tiver Node.js instalado:
- **Windows/Mac**: Baixe em https://nodejs.org/
- **Linux**: `sudo apt install nodejs npm` (Ubuntu/Debian)

---

## 🐛 Problemas Comuns

### Erro: "command not found: npm"
**Solução**: Instale o Node.js primeiro

### Erro: "Cannot find module"
**Solução**: Execute `npm install` novamente no diretório `/client`

### Erro: "Port 3000 already in use"
**Solução**: 
- Feche outro processo usando a porta 3000
- Ou o Vite usará a próxima porta disponível (3001, 3002, etc)

### Erro: "Failed to resolve import"
**Solução**: Verifique se instalou as dependências com `npm install`

---

## ✅ Verificação Rápida

1. ✅ Node.js instalado? → `node --version`
2. ✅ Dentro da pasta `/client`? → `cd client`
3. ✅ Dependências instaladas? → `npm install`
4. ✅ Rodar o projeto? → `npm run dev`

---

## 🎮 O Que Esperar

Quando iniciar com `npm run dev`:

```
  VITE v5.0.10  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

O jogo abrirá no navegador e você poderá:
- ✅ Jogar normalmente
- ✅ Ver pontuação sendo salva no localStorage
- ✅ Ver dados sendo salvos localmente

---

## 📦 Dados Salvos

Os dados são salvos automaticamente no **localStorage** do navegador. Você pode verificar em:

**DevTools (F12)** → **Application** → **Local Storage** → `http://localhost:3000`

Keys salvadas:
- `game_sessions` - Histórico de sessões
- `game_leaderboard` - Top 100 pontuações
- `game_progress` - Progresso do jogador

---

**Pronto!** 🎉 O jogo deve estar rodando agora!
