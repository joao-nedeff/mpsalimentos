// Worker: serve os arquivos estáticos e trata o formulário de contato.
// POST /api/contact -> envia e-mail pelo Resend (do próprio domínio),
// autenticado, direto para joao@mpsalimentos.com. Demais rotas -> assets.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/contact' && request.method === 'POST') {
      return handleContact(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};

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
