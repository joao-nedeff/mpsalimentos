/* Consentimento de cookies + Google Analytics 4 (opt-in) — MPS Alimentos
   O GA só carrega se o visitante aceitar "Análise e desempenho".
   A escolha fica salva em localStorage e pode ser alterada pelo link "Cookies" no rodapé. */
(function(){
  var KEY = 'mps-consent-v2';
  var GA_ID = 'G-9RMZFXB8KT';
  var gaLoaded = false, analyticsOn = false;
  var banner, modal, chkAnalytics;

  function loadGA(){
    if (gaLoaded) return; gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }
  function applyConsent(analytics){
    analyticsOn = !!analytics;
    window['ga-disable-' + GA_ID] = !analytics; // respeitado pelo GA mesmo se já carregado
    if (analytics) loadGA();
  }
  function save(analytics){ try{ localStorage.setItem(KEY, JSON.stringify({analytics: !!analytics})); }catch(e){} }
  function read(){ try{ return JSON.parse(localStorage.getItem(KEY)); }catch(e){ return null; } }

  function openModal(){ if (!modal) return; var c = read(); chkAnalytics.checked = c ? !!c.analytics : false; modal.hidden = false; }
  function closeModal(){ if (modal) modal.hidden = true; }
  function hideBanner(){ if (banner) banner.hidden = true; }
  window.mpsOpenConsent = function(){ openModal(); };

  function track(name){ if (analyticsOn && window.gtag){ try{ gtag('event', name); }catch(e){} } }

  var MARKUP =
    '<div id="cookie-banner" class="cookie-banner" hidden role="dialog" aria-label="Aviso de cookies" aria-live="polite">' +
      '<p>Usamos cookies para analisar o tráfego e melhorar o site. Você escolhe o que permitir. Saiba mais na <a href="privacidade.html">Política de Privacidade</a>.</p>' +
      '<div class="cookie-actions">' +
        '<button id="cookie-prefs" class="cookie-btn ghost" type="button">Personalizar</button>' +
        '<button id="cookie-accept" class="cookie-btn solid" type="button">Aceitar</button>' +
      '</div>' +
    '</div>' +
    '<div id="cookie-modal" class="cookie-modal" hidden role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">' +
      '<div class="cookie-modal-card">' +
        '<h2 id="cookie-modal-title">Preferências de cookies</h2>' +
        '<p class="cookie-modal-intro">Escolha quais dados podem ser coletados. Você pode alterar isso quando quiser pelo link “Cookies” no rodapé.</p>' +
        '<div class="cookie-cat"><div class="cookie-cat-head"><span class="cookie-cat-name">Necessários</span><span class="cookie-badge">Sempre ativos</span></div>' +
          '<p>Essenciais para o site funcionar e para lembrar as suas escolhas. Não rastreiam a sua navegação.</p></div>' +
        '<div class="cookie-cat"><div class="cookie-cat-head"><span class="cookie-cat-name">Análise e desempenho</span>' +
          '<label class="switch"><input type="checkbox" id="cookie-analytics"><span class="slider"></span></label></div>' +
          '<p>Google Analytics: ajuda a entender como o site é usado, de forma agregada. Usa cookies.</p></div>' +
        '<div class="cookie-modal-actions">' +
          '<button id="cookie-reject-all" class="cookie-btn ghost" type="button">Recusar todas</button>' +
          '<button id="cookie-save" class="cookie-btn solid" type="button">Salvar preferências</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  function init(){
    var host = document.createElement('div');
    host.innerHTML = MARKUP;
    while (host.firstChild) document.body.appendChild(host.firstChild);

    banner = document.getElementById('cookie-banner');
    modal = document.getElementById('cookie-modal');
    chkAnalytics = document.getElementById('cookie-analytics');

    var saved = read();
    if (saved) applyConsent(saved.analytics);
    else banner.hidden = false;

    document.getElementById('cookie-accept').addEventListener('click', function(){ save(true); applyConsent(true); hideBanner(); closeModal(); });
    document.getElementById('cookie-prefs').addEventListener('click', openModal);
    document.getElementById('cookie-save').addEventListener('click', function(){ var a = chkAnalytics.checked; save(a); applyConsent(a); hideBanner(); closeModal(); });
    document.getElementById('cookie-reject-all').addEventListener('click', function(){ save(false); applyConsent(false); hideBanner(); closeModal(); });
    modal.addEventListener('click', function(e){ if (e.target === modal) closeModal(); });

    // Eventos de contato (só registram com consentimento de análise)
    document.querySelectorAll('a[href^="https://wa.me/"]').forEach(function(a){ a.addEventListener('click', function(){ track('clique_whatsapp'); }); });
    document.querySelectorAll('a[href^="mailto:"]').forEach(function(a){ a.addEventListener('click', function(){ track('clique_email'); }); });
    document.querySelectorAll('a[href*="instagram.com/"]').forEach(function(a){ a.addEventListener('click', function(){ track('clique_instagram'); }); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
