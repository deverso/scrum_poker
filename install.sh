#!/bin/bash
# Script para instalar dependências do Scrum Poker

# Carregar nvm se disponível
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    source "$HOME/.nvm/nvm.sh"
fi

# Verificar se npm está disponível
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado!"
    echo ""
    echo "Se você usa nvm, carregue-o primeiro:"
    echo "  source ~/.nvm/nvm.sh"
    echo ""
    echo "Ou adicione ao seu ~/.bashrc ou ~/.zshrc:"
    echo "  export NVM_DIR=\"\$HOME/.nvm\""
    echo "  [ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\""
    exit 1
fi

echo "✅ npm encontrado: $(npm --version)"
echo "✅ node encontrado: $(node --version)"
echo ""
echo "📦 Instalando dependências..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Instalação concluída com sucesso!"
    echo ""
    echo "Para iniciar o servidor:"
    echo "  npm start"
    echo ""
    echo "Ou em modo desenvolvimento:"
    echo "  npm run dev"
else
    echo ""
    echo "❌ Erro na instalação"
    exit 1
fi

