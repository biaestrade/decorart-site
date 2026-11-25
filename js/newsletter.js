// Newsletter da Decorart: pop-up + chamada no rodapé.
// O cadastro (nome e e-mail) vai para a aba "Newsletter" da planilha da Decorart,
// pelo mesmo receptor do Google Apps Script usado no rastreio de cliques.
(function () {
  var RECEPTOR = 'https://script.google.com/macros/s/AKfycbwf-OcvhC2dyk9qqKLhKsP4t-60sqDlRwcrurrbnWNDD5lap-VPQLkfU6YB7vtGA5_yTQ/exec';
  var CHAVE = 'decorart_newsletter';   // {inscrito: true} ou {fechou_em: data}
  var DIAS_SEM_MOSTRAR = 30;           // depois de fechar, só volta a aparecer em 30 dias
  var ESPERA_MS = 25000;               // abre depois de 25 s na página...
  var ROLAGEM = 0.6;                   // ...ou quando rolar 60% da página
  var PRIVACIDADE = '/privacidade/';

  function ler() { try { return JSON.parse(localStorage.getItem(CHAVE) || '{}'); } catch (e) { return {}; } }
  function gravar(o) { try { localStorage.setItem(CHAVE, JSON.stringify(o)); } catch (e) {} }
  function origem() { try { return JSON.parse(localStorage.getItem('decorart_origem') || '{}') || {}; } catch (e) { return {}; } }

  var css = [
    '.nl-fundo{position:fixed;inset:0;z-index:90;background:rgba(20,32,19,.55);display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .25s}',
    '.nl-fundo.aberto{opacity:1}',
    '.nl-caixa{position:relative;width:100%;max-width:440px;background:#fff;color:var(--verde,#2E442D);border-radius:14px;padding:34px 28px 24px;box-shadow:0 18px 50px rgba(0,0,0,.3);text-align:center;font-family:Montserrat,Arial,sans-serif;transform:translateY(12px);transition:transform .25s}',
    '.nl-fundo.aberto .nl-caixa{transform:none}',
    '.nl-fechar{position:absolute;top:8px;right:10px;width:36px;height:36px;border:0;background:none;font-size:28px;line-height:1;color:#777;cursor:pointer}',
    '.nl-caixa h2{font-size:22px;line-height:1.3;margin:0 0 8px;font-weight:700}',
    '.nl-caixa p.nl-sub{font-size:15px;margin:0 0 18px;color:#4C664B}',
    '.nl-form{display:flex;flex-direction:column;gap:10px}',
    '.nl-form input[type=text],.nl-form input[type=email]{width:100%;padding:13px 14px;border:1px solid #B9C7B8;border-radius:8px;font:inherit;font-size:15px;color:#2E442D;background:#fff}',
    '.nl-form input:focus{outline:2px solid #4C664B;outline-offset:1px;border-color:#4C664B}',
    '.nl-form button{padding:14px;border:0;border-radius:8px;background:var(--verde,#2E442D);color:#fff;font:inherit;font-size:16px;font-weight:700;cursor:pointer;transition:background .2s}',
    '.nl-form button:hover{background:var(--verde-hover,#336331)}',
    '.nl-form button:disabled{opacity:.6;cursor:default}',
    '.nl-aviso{font-size:12px;color:#777;margin:12px 0 0;line-height:1.5}',
    '.nl-aviso a{color:#4C664B}',
    '.nl-erro{font-size:13px;color:#B3261E;min-height:0;margin:0}',
    '.nl-mel{position:absolute!important;left:-9999px!important;width:1px;height:1px;opacity:0}',
    '.nl-ok{font-size:16px;padding:10px 0 4px}',
    '.nl-faixa{background:var(--verde-escuro,#1F331E);color:#fff;padding:28px 0}',
    '.nl-faixa .container{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px 32px}',
    '.nl-faixa .container>div{flex:1 1 300px;max-width:430px}',
    '.nl-faixa h2{font-size:20px;margin:0 0 2px;font-weight:700}',
    '.nl-faixa p.nl-sub{margin:0;font-size:14px;color:var(--verde-claro,#B5D8B3)}',
    '.nl-faixa .nl-form{flex-direction:row;flex-wrap:wrap;flex:1 1 460px;max-width:620px}',
    '.nl-faixa .nl-form input[type=text]{flex:1 1 120px;width:auto;min-width:0;border-color:transparent}',
    '.nl-faixa .nl-form input[type=email]{flex:2 1 170px;width:auto;min-width:0;border-color:transparent}',
    '.nl-faixa .nl-form button{flex:0 0 auto;background:var(--verde-claro,#B5D8B3);color:var(--verde-escuro,#1F331E);padding:13px 22px}',
    '.nl-faixa .nl-form button:hover{background:#fff}',
    '.nl-faixa .nl-aviso{color:#cfd9ce;flex-basis:100%;margin:0}',
    '.nl-faixa .nl-aviso a{color:#fff}',
    '.nl-faixa .nl-erro{color:#ffb4ab;flex-basis:100%}',
    '@media (max-width:760px){.nl-faixa .container{flex-direction:column;align-items:stretch;text-align:center}.nl-faixa .container>div{max-width:none;flex:none}.nl-faixa .nl-form{flex-direction:column;flex-basis:auto}.nl-faixa .nl-form input[type=text],.nl-faixa .nl-form input[type=email]{flex:none;width:100%}}'
  ].join('\n');
  var estilo = document.createElement('style');
  estilo.textContent = css;
  document.head.appendChild(estilo);

  function formulario(onde) {
    return '<form class="nl-form" novalidate data-onde="' + onde + '">' +
      '<input type="text" name="nome" placeholder="Seu nome" autocomplete="name" maxlength="80" aria-label="Seu nome">' +
      '<input type="email" name="email" placeholder="Seu melhor e-mail" autocomplete="email" maxlength="120" required aria-label="Seu e-mail">' +
      '<input type="text" name="site" class="nl-mel" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<button type="submit">Quero receber</button>' +
      '<p class="nl-erro" role="alert"></p>' +
      '<p class="nl-aviso">Sem spam: no máximo um e-mail por mês, e você cancela quando quiser. Veja a <a href="' + PRIVACIDADE + '">Política de Privacidade</a>.</p>' +
      '</form>';
  }

  var TITULO = 'Novidades da Decorart no seu e-mail';
  var SUB = 'Lançamentos de papéis de parede, ideias de decoração e condições especiais para inscritos.';

  function enviar(form) {
    var erro = form.querySelector('.nl-erro');
    var nome = form.nome.value.trim();
    var email = form.email.value.trim().toLowerCase();
    erro.textContent = '';
    if (form.site.value) return mostrarOk(form);           // robô preencheu o campo escondido
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      erro.textContent = 'Confira o e-mail digitado.';
      form.email.focus();
      return;
    }
    var o = origem();
    var dados = {
      tipo: 'newsletter', nome: nome.slice(0, 80), email: email.slice(0, 120),
      pagina: location.pathname, onde: form.dataset.onde,
      gclid: o.gclid || '', gbraid: o.gbraid || '', wbraid: o.wbraid || '', fbclid: o.fbclid || '',
      utm_source: o.utm_source || '', utm_medium: o.utm_medium || '', utm_campaign: o.utm_campaign || ''
    };
    form.querySelector('button').disabled = true;
    var corpo = JSON.stringify(dados);
    var foi = false;
    try { foi = navigator.sendBeacon && navigator.sendBeacon(RECEPTOR, new Blob([corpo], { type: 'text/plain' })); } catch (e) {}
    if (!foi) { try { fetch(RECEPTOR, { method: 'POST', mode: 'no-cors', keepalive: true, body: corpo }); } catch (e) {} }
    gravar({ inscrito: true, em: new Date().toISOString() });
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'newsletter_signup', pagina: location.pathname, onde: form.dataset.onde });
    mostrarOk(form);
  }

  function mostrarOk(form) {
    form.outerHTML = '<p class="nl-ok"><strong>Inscrição feita!</strong><br>Obrigado, você vai receber nossas novidades por e-mail.</p>';
    if (pop && pop.classList.contains('aberto')) setTimeout(fechar, 3500);
  }

  document.addEventListener('submit', function (e) {
    if (!e.target.classList || !e.target.classList.contains('nl-form')) return;
    e.preventDefault();
    enviar(e.target);
  });

  // Faixa fixa logo acima do rodapé (sempre visível, para quem não viu o pop-up)
  var rodape = document.querySelector('footer.rodape');
  var estado = ler();
  if (rodape) {
    var faixa = document.createElement('section');
    faixa.className = 'nl-faixa';
    faixa.id = 'newsletter';
    faixa.innerHTML = '<div class="container"><div><h2>' + TITULO + '</h2><p class="nl-sub">' + SUB + '</p></div>' +
      (estado.inscrito ? '<p class="nl-ok">Você já está inscrito(a). Obrigado!</p>' : formulario('rodape')) + '</div>';
    rodape.parentNode.insertBefore(faixa, rodape);
  }

  // Pop-up
  var pop = null;
  function podeMostrar() {
    var s = ler();
    if (s.inscrito) return false;
    if (s.fechou_em && Date.now() - Date.parse(s.fechou_em) < DIAS_SEM_MOSTRAR * 864e5) return false;
    if (document.querySelector('.lightbox.aberta')) return false;   // não atrapalha quem está vendo fotos
    return true;
  }
  function abrir() {
    if (pop || !podeMostrar()) return;
    pop = document.createElement('div');
    pop.className = 'nl-fundo';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-modal', 'true');
    pop.setAttribute('aria-labelledby', 'nl-titulo');
    pop.innerHTML = '<div class="nl-caixa"><button type="button" class="nl-fechar" aria-label="Fechar">&times;</button>' +
      '<h2 id="nl-titulo">' + TITULO + '</h2><p class="nl-sub">' + SUB + '</p>' + formulario('popup') + '</div>';
    document.body.appendChild(pop);
    requestAnimationFrame(function () { pop.classList.add('aberto'); });
    pop.addEventListener('click', function (e) {
      if (e.target === pop || e.target.classList.contains('nl-fechar')) fechar(true);
    });
    var email = pop.querySelector('input[type=email]');
    if (email && window.matchMedia('(min-width: 761px)').matches) setTimeout(function () { email.focus(); }, 300);
    pararGatilhos();
  }
  function fechar(peloUsuario) {
    if (!pop) return;
    if (peloUsuario && !ler().inscrito) gravar({ fechou_em: new Date().toISOString() });
    var p = pop;
    p.classList.remove('aberto');
    setTimeout(function () { p.remove(); }, 250);
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && pop) fechar(true); });

  var timer = null;
  function aoRolar() {
    var h = document.documentElement;
    if ((h.scrollTop + innerHeight) / h.scrollHeight >= ROLAGEM) abrir();
  }
  function aoSair(e) { if (!e.relatedTarget && e.clientY <= 0) abrir(); }   // mouse saindo pelo topo (computador)
  function pararGatilhos() {
    clearTimeout(timer);
    removeEventListener('scroll', aoRolar);
    document.removeEventListener('mouseout', aoSair);
  }
  if (podeMostrar()) {
    timer = setTimeout(abrir, ESPERA_MS);
    // Rolagem só conta depois de 8 s, para não abrir em quem rola rápido logo ao chegar
    setTimeout(function () {
      addEventListener('scroll', aoRolar, { passive: true });
      document.addEventListener('mouseout', aoSair);
    }, 8000);
  }
})();
