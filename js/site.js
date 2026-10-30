// Pasta das fotos. As fotos ficam em img/ANO/MES/arquivo, igual ao WordPress.
const RAIZ = document.documentElement.dataset.raiz || '';
const ANTIGO = 'https://decorartpapeisepisos.com.br/wp-content/uploads/';
const foto = caminho => RAIZ + 'img/' + caminho;
// Miniatura leve (500px, .webp) usada nas grades; a foto grande abre ao clicar
const mini = caminho => RAIZ + 'img/mini/' + caminho.replace(/\.[a-z0-9]+$/i, '.webp');

// Enquanto as fotos não estiverem copiadas para img/, mostra a do site antigo.
function fotoAntiga(src) {
  const i = src.indexOf('img/');
  return i >= 0 ? ANTIGO + src.slice(i + 4) : null;
}
function socorro(img) {
  if (img.dataset.full && !img.dataset.tentouFull) { img.dataset.tentouFull = '1'; img.src = img.dataset.full; return; }
  if (img.dataset.tentou) return;
  img.dataset.tentou = '1';
  const alt = fotoAntiga(img.getAttribute('src') || '');
  if (alt) img.src = alt;
}
document.addEventListener('error', e => { if (e.target.tagName === 'IMG') socorro(e.target); }, true);
document.querySelectorAll('img').forEach(img => { if (img.complete && img.naturalWidth === 0) socorro(img); });
// Fundos (foto do topo e da chamada final)
document.querySelectorAll('[data-fundo]').forEach(el => {
  const src = foto(el.dataset.fundo);
  const teste = new Image();
  teste.onload = () => { el.style.backgroundImage = `url('${src}')`; };
  teste.onerror = () => { el.style.backgroundImage = `url('${ANTIGO + el.dataset.fundo}')`; };
  teste.src = src;
});

// Menu do celular
const botaoMenu = document.querySelector('.botao-menu');
const menu = document.querySelector('.menu');
if (botaoMenu) {
  botaoMenu.addEventListener('click', () => menu.classList.toggle('aberto'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('aberto')));
}

// Texto digitando no topo da home (mesma velocidade do site antigo)
const digitando = document.querySelector('[data-palavras]');
if (digitando) {
  const palavras = digitando.dataset.palavras.split('|');
  let p = 0, letra = palavras[0].length, apagando = true;
  function passo() {
    const palavra = palavras[p];
    if (apagando) {
      letra--;
      digitando.textContent = palavra.slice(0, letra);
      if (letra === 0) { apagando = false; p = (p + 1) % palavras.length; }
      setTimeout(passo, 50);
    } else {
      const nova = palavras[p];
      letra++;
      digitando.textContent = nova.slice(0, letra);
      if (letra === nova.length) { apagando = true; setTimeout(passo, 2500); }
      else setTimeout(passo, 120);
    }
  }
  setTimeout(passo, 2500);
}

// Foto ampliada, com setas para passar
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = '<button class="fechar" aria-label="Fechar">&times;</button><button class="seta anterior" aria-label="Anterior">&#8249;</button><img alt=""><button class="seta proxima" aria-label="Próxima">&#8250;</button><div class="legenda"></div>';
document.body.appendChild(lightbox);
const fotoGrande = lightbox.querySelector('img');
const legenda = lightbox.querySelector('.legenda');
let grupo = [], atual = 0;
function mostrar(i) {
  atual = (i + grupo.length) % grupo.length;
  const img = grupo[atual].querySelector('img');
  fotoGrande.src = grupo[atual].getAttribute('href') || img.currentSrc || img.src;
  fotoGrande.alt = img.alt;
  legenda.textContent = grupo[atual].dataset.legenda || '';
}
document.addEventListener('click', e => {
  const link = e.target.closest('[data-ampliar]');
  if (!link) return;
  e.preventDefault();
  grupo = [...link.parentElement.closest('[data-grupo]').querySelectorAll('[data-ampliar]')]
    .filter(a => !a.closest('[hidden]'));
  mostrar(grupo.indexOf(link));
  lightbox.classList.add('aberta');
});
lightbox.addEventListener('click', e => {
  if (e.target.classList.contains('anterior')) return mostrar(atual - 1);
  if (e.target.classList.contains('proxima')) return mostrar(atual + 1);
  if (e.target !== fotoGrande) lightbox.classList.remove('aberta');
});
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('aberta')) return;
  if (e.key === 'Escape') lightbox.classList.remove('aberta');
  if (e.key === 'ArrowLeft') mostrar(atual - 1);
  if (e.key === 'ArrowRight') mostrar(atual + 1);
});

// Filtros + "Veja mais" (usado na galeria da home e no catálogo)
function montarGrade({ grade, filtros, botaoMais, itens, porVez, primeiraVez, categoriaInicial, desenhar }) {
  const qtd = v => (typeof v === 'function' ? v() : v);
  const inicial = () => qtd(primeiraVez || porVez);
  let categoria = categoriaInicial, limite = inicial();
  const textoMais = botaoMais ? botaoMais.textContent : '';
  let tudoAberto = false;
  function atualizar() {
    const lista = itens.filter(it => !categoria || it.cats.includes(categoria));
    grade.innerHTML = lista.slice(0, limite).map(desenhar).join('');
    if (!botaoMais) return;
    // Quando tudo já apareceu, o botão vira "Ver Menos" (some se a categoria cabe numa linha)
    tudoAberto = limite >= lista.length;
    botaoMais.hidden = tudoAberto && lista.length <= inicial();
    botaoMais.textContent = tudoAberto ? 'Ver Menos' : textoMais;
  }
  if (filtros) {
    filtros.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      filtros.querySelectorAll('button').forEach(x => x.classList.toggle('ativo', x === b));
      categoria = b.dataset.cat || null;
      limite = inicial();
      atualizar();
    });
  }
  if (botaoMais) botaoMais.addEventListener('click', () => {
    if (tudoAberto) {
      limite = inicial();
      atualizar();
      (filtros || grade).scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      limite += qtd(porVez);
      atualizar();
    }
  });
  atualizar();
}

// Quantas fotos cabem numa linha da grade
function colunas(grade) {
  const c = getComputedStyle(grade).gridTemplateColumns.split(' ').filter(Boolean).length;
  return c || 6;
}

// Galeria da home: fotos embaralhadas, 12 por vez, começa em Papel de Parede
const galeria = document.querySelector('.galeria');
if (galeria && window.FOTOS) {
  const filtros = document.querySelector('.filtros');
  filtros.innerHTML = window.CATEGORIAS.map((c, i) => `<li><button class="${i === 0 ? 'ativo' : ''}" data-cat="${c}">${c}</button></li>`).join('');
  const itens = window.FOTOS.map(f => ({ ...f, cats: [f.cat] })).sort(() => Math.random() - .5);
  montarGrade({
    grade: galeria, filtros, botaoMais: document.querySelector('#galeria-mais'),
    // Mostra só a primeira linha; cada "Veja Mais" acrescenta mais duas linhas
    itens, primeiraVez: () => colunas(galeria), porVez: () => colunas(galeria) * 2, categoriaInicial: window.CATEGORIAS[0],
    desenhar: f => `<a href="${foto(f.foto)}" data-ampliar><img src="${mini(f.foto)}" data-full="${foto(f.foto)}" alt="${f.alt}" loading="lazy" width="500" height="500"></a>`
  });
}

// Catálogo de papel de parede: filtros por estilo, 40 por vez
const catalogo = document.querySelector('.catalogo');
if (catalogo && window.CATALOGO) {
  const filtros = document.querySelector('.filtros');
  const cats = ['Brilho', 'Clean', 'Folhagens', 'Geométrico', 'Infantil', 'Listras'];
  filtros.innerHTML = '<li><button class="ativo" data-cat="">Todos</button></li>' + cats.map(c => `<li><button data-cat="${c}">${c}</button></li>`).join('');
  montarGrade({
    grade: catalogo, filtros, botaoMais: document.querySelector('#ver-mais'),
    itens: window.CATALOGO.map(m => ({ ...m, cats: m.cat || [] })), porVez: 40, categoriaInicial: null,
    desenhar: m => `<figure><a href="${foto(m.foto)}" data-ampliar data-legenda="${m.nome}"><img src="${mini(m.foto)}" data-full="${foto(m.foto)}" alt="Papel de parede ${m.nome}" loading="lazy" width="500" height="500"></a><figcaption>${m.nome}</figcaption></figure>`
  });
}

// Abas (Soluções, Diferenciais, Passos, FAQ)
document.querySelectorAll('.abas-info').forEach(caixa => {
  caixa.querySelector('.botoes').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    caixa.querySelectorAll('.botoes button').forEach(x => x.classList.toggle('ativa', x === b));
    caixa.querySelectorAll('.painel').forEach(p => { p.hidden = p.id !== b.dataset.painel; });
  });
});

// Clique em qualquer botão de WhatsApp vira um evento no Google Tag Manager
// (nome do evento: whatsapp_click), para usar como conversão no Google Ads/Analytics.
window.dataLayer = window.dataLayer || [];
document.addEventListener('click', e => {
  const a = e.target.closest('a[href*="wa.me"]');
  if (!a) return;
  window.dataLayer.push({ event: 'whatsapp_click', pagina: location.pathname, botao: (a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 60) });
});
