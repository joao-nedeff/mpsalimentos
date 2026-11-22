# Segurança de IA: mpsalimentos

Última revisão: 26/11/2026

## Situação

Este projeto não chama nenhum modelo de IA. A revisão não encontrou Workers AI, AI Gateway, OpenRouter nem APIs diretas de provedores de IA. O Worker da Cloudflare só serve os arquivos do site, entrega os preços e trata o formulário de contato.

Serviços externos: Resend (recebe nome, e-mail e mensagem do formulário), Firestore (leitura dos preços públicos), Google Fonts, Google Analytics e Meta Pixel. Os dois últimos só carregam depois que o visitante aceita os cookies de análise.

Como não há prompts, não há registro de prompts em gateway, cache ou logs.

## Limites da revisão

- Foram analisados o código, a configuração local e o histórico do Git.
- O painel da Cloudflare não foi conferido.
- A busca de segredos reconhece formatos conhecidos e pode não detectar uma senha sem formato típico.

## Decisões

- Filtro de segredos, roteamento e canário não foram implementados, porque não existe fluxo de prompts onde aplicá-los.
- `.assetsignore` passou a excluir `apresentacao`, `instagram` e `.claude`, para que um deploy manual feito desta pasta não publique esses arquivos.
- As regras abaixo passam a valer antes de qualquer integração com IA.

## Obrigatório antes de adicionar IA

1. **Aprovação:** provedor e modelo precisam ser aprovados pelo responsável pelo projeto. Não trocar nenhum dos dois sem nova aprovação.
2. **Filtro de segredos:** remover ou mascarar chaves AWS (`AKIA…`), `sk-…`, `ghp_…`, chaves privadas, JWTs e connection strings antes do envio, com testes. Registrar que algo foi removido, nunca o valor.
3. **Dados pessoais (LGPD):** não enviar dados do formulário de contato sem necessidade e atualizar a política de privacidade quando houver novo operador de dados.
4. **Retenção e rota:**
   - OpenRouter: enviar `"provider": { "zdr": true, "data_collection": "deny" }`, fixar provedores com `only` ou `order` e usar `"allow_fallbacks": false`.
   - Cloudflare AI Gateway: consultar a documentação atual, desativar o log de prompts e respostas, revisar o cache e avaliar DLP.
5. **Logs:** não guardar prompts completos nem segredos. Registrar só metadados, como horário, modelo, status e tamanho.
6. **Canário:** usar um canary token real com alerta monitorado, como um AWS key token do canarytokens.org. Nunca usar chave falsa sem monitoramento.
7. **Documentação:** atualizar este arquivo com a rota real de cada chamada.

## Se um segredo vazar

Rotacionar a credencial no serviço de origem e revisar o uso dela. Remover o valor do código não basta, porque ele pode continuar no histórico e em cópias.
