// Worker: serve os arquivos estáticos, trata o formulário de contato e entrega os preços.
// POST /api/contact -> envia e-mail pelo Resend (do próprio domínio),
// autenticado, direto para joao@mpsalimentos.com.
// GET /api/precos -> preços da página Pedidos, editados pelo João no admin do portal
// (pedidos.mpsalimentos.com, doc config/site do Firestore). Fica 60 s no cache da
// Cloudflare: cada visita NÃO vira uma leitura no banco (protege a cota grátis).
// Demais rotas -> assets.

const PRECOS_DOC = 'https://firestore.googleapis.com/v1/projects/sistema-chocolate/databases/(default)/documents/config/site';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/contact' && request.method === 'POST') {
      return handleContact(request, env);
    }
    if (url.pathname === '/api/precos' && request.method === 'GET') {
      return handlePrecos(request, env, ctx);
    }
    return env.ASSETS.fetch(request);
  },
};

// Converte um valor do Firestore REST ({stringValue}, {integerValue}, {mapValue}...) em JS.
function fsVal(v) {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return Number(v.doubleValue);
  if ('mapValue' in v) {
    var o = {}, f = v.mapValue.fields || {};
    for (var k in f) o[k] = fsVal(f[k]);
    return o;
  }
  return null;
}

function precoOk(n) { return typeof n === 'number' && isFinite(n) && n > 0 && n < 1e6; }

function unOk(n) { return Number.isInteger(n) && n > 0 && n < 1e5; }

function precoLimpo(c) {
  if (!c || !precoOk(c.por)) return null;
  return { de: precoOk(c.de) && c.de > c.por ? c.de : null, por: c.por };
}

var SABORES = ['leite', 'branco', 'amargo'];

// Doc atual: { selo, un: {media, grande}, sabores: {leite|branco|amargo: {media|grande: {de, por}}} }.
// Doc antigo: { selo, caixas: {media|grande: {un, de, por}} } -> mesmo preço nos três sabores.
function precosDoDoc(d) {
  var velho = d.caixas || {};
  var un = d.un || { media: velho.media && velho.media.un, grande: velho.grande && velho.grande.un };
  if (!unOk(un.media) || !unOk(un.grande)) return null;
  var sabores = {};
  for (var i = 0; i < SABORES.length; i++) {
    var s = SABORES[i], fonte = (d.sabores && d.sabores[s]) || velho;
    var m = precoLimpo(fonte.media), g = precoLimpo(fonte.grande);
    if (!m || !g) return null;
    sabores[s] = { media: m, grande: g };
  }
  return { un: { media: un.media, grande: un.grande }, sabores: sabores };
}

async function handlePrecos(request, env, ctx) {
  var cache = caches.default;
  var chave = new Request(new URL('/api/precos', request.url).toString());
  try {
    var hit = await cache.match(chave);
    if (hit) return hit;
  } catch (e) { /* cache indisponível: segue para o banco */ }
  try {
    var r = await fetch(env.PRECOS_DOC || PRECOS_DOC);
    if (!r.ok) throw new Error('firestore ' + r.status);
    var d = fsVal({ mapValue: { fields: (await r.json()).fields || {} } });
    var p = precosDoDoc(d);
    if (!p) throw new Error('dados incompletos');
    var selo = typeof d.selo === 'string' ? d.selo.trim().slice(0, 30) : '';
    var resp = new Response(JSON.stringify({ selo: selo, un: p.un, sabores: p.sabores }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
    });
    ctx.waitUntil(cache.put(chave, resp.clone()).catch(function () {}));
    return resp;
  } catch (e) {
    // Sem resposta boa: a página mantém os valores escritos no HTML.
    return json({ ok: false }, 503);
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

async function handleContact(request, env) {
  try {
    var data = await request.json();
    var name = String(data.name || '').trim().slice(0, 120);
    var email = String(data.email || '').trim().slice(0, 160);
    var message = String(data.message || '').trim().slice(0, 4000);
    var honey = String(data._honey || '');

    // Honeypot preenchido: provável bot. Finge sucesso e não envia.
    if (honey) return json({ ok: true });

    if (!name || !email || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json({ ok: false, error: 'Dados invalidos.' }, 400);
    }
    if (!env.RESEND_API_KEY) {
      return json({ ok: false, error: 'Envio de e-mail nao configurado.' }, 500);
    }

    var r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Site MPS Alimentos <contato@mpsalimentos.com>',
        to: ['joao@mpsalimentos.com'],
        reply_to: email,
        subject: 'Novo contato pelo site — ' + name,
        text: 'Nome: ' + name + '\nE-mail: ' + email + '\n\nMensagem:\n' + message,
        html:
          '<p><strong>Nome:</strong> ' + escapeHtml(name) +
          '<br><strong>E-mail:</strong> ' + escapeHtml(email) + '</p>' +
          '<p><strong>Mensagem:</strong><br>' + escapeHtml(message).replace(/\n/g, '<br>') + '</p>',
      }),
    });

    if (!r.ok) {
      return json({ ok: false, error: 'Falha ao enviar.' }, 502);
    }
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: 'Erro inesperado.' }, 500);
  }
}
