// Rastreio de cliques no WhatsApp (decorartpapeisepisos.com.br)
//
// 1. Quando a pessoa chega por um anúncio, guarda no navegador dela os códigos
//    que vêm no endereço (gclid do Google Ads, fbclid do Meta, utm_...) por 90 dias.
// 2. Quando ela clica em qualquer botão de WhatsApp, manda uma linha para a planilha
//    "Cliques no WhatsApp do site - Decorart" com a hora, a página, o botão e esses códigos.
//
// Não manda nome, telefone nem nada que identifique a pessoa.
(function () {
  var RECEPTOR = 'https://script.google.com/macros/s/AKfycbwf-OcvhC2dyk9qqKLhKsP4t-60sqDlRwcrurrbnWNDD5lap-VPQLkfU6YB7vtGA5_yTQ/exec';
  var CHAVE = 'decorart_origem';
  var VALIDADE_DIAS = 90;
  var CAMPOS = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

  function ler() {
    try { return JSON.parse(localStorage.getItem(CHAVE) || 'null'); } catch (e) { return null; }
  }
  function gravar(o) {
    try { localStorage.setItem(CHAVE, JSON.stringify(o)); } catch (e) {}
  }

  // Guarda a origem quando a pessoa chega com códigos de anúncio no endereço
  var params = new URLSearchParams(location.search);
  var nova = {};
  CAMPOS.forEach(function (c) { var v = params.get(c); if (v) nova[c] = v; });
  var origem = ler();
  if (Object.keys(nova).length) {
    nova.chegou_em = new Date().toISOString();
    origem = nova;
    gravar(origem);
  } else if (origem && origem.chegou_em &&
             Date.now() - Date.parse(origem.chegou_em) > VALIDADE_DIAS * 864e5) {
    try { localStorage.removeItem(CHAVE); } catch (e) {}
    origem = null;
  }

  function idDoClique() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  // Envia cada clique em botão de WhatsApp para a planilha
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="wa.me"], a[href*="api.whatsapp.com"]');
    if (!a || RECEPTOR.indexOf('http') !== 0) return;
    var dados = Object.assign({}, ler() || {}, {
      id: idDoClique(),
      pagina: location.pathname,
      botao: (a.textContent || a.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 60)
    });
    var corpo = JSON.stringify(dados);
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(RECEPTOR, new Blob([corpo], { type: 'text/plain' }))) return;
    } catch (err) {}
    try { fetch(RECEPTOR, { method: 'POST', mode: 'no-cors', keepalive: true, body: corpo }); } catch (err) {}
  }, true);
})();
