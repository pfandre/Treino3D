# Fluxo de Servidor Local e Sincronização

Sempre que o usuário pedir para iniciar o projeto, testar, ou "rodar um localhost", siga **estritamente** os passos abaixo:

1. **Sincronização Obrigatória (Git)**:
   - Antes de iniciar qualquer servidor, execute `git status` e `git pull` para garantir que as alterações feitas em outros dispositivos (ex: outro notebook do usuário) sejam baixadas.
   - O projeto possui um histórico de commits feitos remotamente que precisam ser sincronizados com a máquina local.

2. **Inicialização do Servidor (Five Server)**:
   - **NÃO** utilize linha de comando (`npx`, `node` ou `python` `http.server`) para rodar o localhost, pois esses binários não estão disponíveis no terminal.
   - O projeto deve ser executado obrigatoriamente através da extensão **Five Server** na **porta 3000**.
   - O projeto já possui o arquivo `fiveserver.config.js` na raiz e `.vscode/settings.json` configurados para a porta 3000.
   
3. **Instruções ao Usuário**:
   - Sempre lembre o usuário de ligar o servidor abrindo o `index.html` e clicando em "Open with Five Server" (ou no botão "Go Live" no rodapé).
   - Se o servidor já estiver rodando em outra porta (como 5500), instrua o usuário a clicar no botão no rodapé para desligar e depois ligar novamente.
