# 🎴 Scrum Poker

Aplicação de Scrum Poker em tempo real para sessões de refinamento com o time. Permite que múltiplos participantes votem simultaneamente e vejam os resultados em tempo real.

## 🚀 Como usar

### Pré-requisitos

- Node.js (v14 ou superior)
- npm

**Nota**: Se você usa `nvm` (Node Version Manager), certifique-se de que está carregado:
```bash
source ~/.nvm/nvm.sh
```

Ou adicione ao seu `~/.bashrc` ou `~/.zshrc` (se ainda não estiver):
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

### Instalação

**Opção 1 - Script automático:**
```bash
./install.sh
```

**Opção 2 - Manual:**
```bash
npm install
```

Se o `npm install` estiver lento ou não funcionar, verifique se o nvm está carregado:
```bash
source ~/.nvm/nvm.sh && npm install
```

### Executar

Inicie o servidor:
```bash
npm start
```

Ou em modo desenvolvimento (com auto-reload):
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

### Uso

1. Abra o navegador em `http://localhost:3000`
2. Digite seu nome
3. **Criar sala**: Clique em "Criar Nova Sala" para criar uma nova sessão
4. **Entrar em sala**: Digite o ID da sala e clique em "Entrar na Sala"
5. Compartilhe o ID da sala com seu time
6. Defina a história que será estimada (opcional)
7. Cada participante seleciona sua estimativa (cartas Fibonacci)
8. Quando todos votarem, clique em "Revelar Votos" para ver os resultados
9. Use "Nova Votação" para começar uma nova estimativa

## ✨ Funcionalidades

- ✅ Criar e entrar em salas
- ✅ Votação em tempo real
- ✅ Cartas Fibonacci (1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?, ☕)
- ✅ Revelar votos quando todos votarem
- ✅ Resetar para nova votação
- ✅ Definir história/estória atual
- ✅ Lista de participantes em tempo real
- ✅ Interface responsiva e moderna

## 🛠️ Tecnologias

- **Backend**: Node.js + Express + Socket.io
- **Frontend**: HTML5 + CSS3 + JavaScript (Vanilla)
- **Real-time**: Socket.io para comunicação bidirecional

## 📝 Notas

- Não há persistência de dados - tudo é em memória
- As salas são removidas quando ficam vazias
- Ideal para sessões de refinamento ao vivo

## 🔮 Próximas features (sugestões)

- [ ] Histórico de estimativas
- [ ] Média e moda dos votos
- [ ] Timer para votação
- [ ] Chat entre participantes
- [ ] Exportar resultados
- [ ] Tema escuro/claro

