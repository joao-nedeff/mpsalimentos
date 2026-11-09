// Abas (Chocolate / Cobertura) da página inicial e da página Pedidos.
// Marcação: [role=tablist] com botões [role=tab][aria-controls] e painéis [role=tabpanel].
// Teclado: setas esquerda/direita, Home e End trocam de aba (padrão WAI-ARIA).
(function () {
  document.querySelectorAll('[role="tablist"]').forEach(function (lista) {
    var abas = Array.prototype.slice.call(lista.querySelectorAll('[role="tab"]'));
    function escolher(aba, foco) {
      abas.forEach(function (a) {
        var ativa = a === aba;
        a.setAttribute('aria-selected', ativa ? 'true' : 'false');
        a.tabIndex = ativa ? 0 : -1;
        var painel = document.getElementById(a.getAttribute('aria-controls'));
        if (painel) painel.hidden = !ativa;
      });
      if (foco) aba.focus();
    }
    abas.forEach(function (aba, i) {
      aba.addEventListener('click', function () { escolher(aba); });
      aba.addEventListener('keydown', function (e) {
        var n = abas.length, j = null;
        if (e.key === 'ArrowRight') j = (i + 1) % n;
        else if (e.key === 'ArrowLeft') j = (i - 1 + n) % n;
        else if (e.key === 'Home') j = 0;
        else if (e.key === 'End') j = n - 1;
        if (j !== null) { e.preventDefault(); escolher(abas[j], true); }
      });
    });
  });
})();
