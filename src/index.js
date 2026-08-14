// Worker mínimo: apenas entrega os arquivos estáticos (index.html, assets/...).
// Ter um script (em vez de "só assets") libera a adição de Custom Domain no painel.
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
