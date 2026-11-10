const Cassino = (function () {
  const raiz = document.documentElement;
  const corpo = document.body;
  const tema = corpo.dataset.tema;
  const temGsap = Boolean(window.gsap);
  const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ponteiroFino = window.matchMedia("(pointer: fine)").matches;
  const animar = temGsap && !reduzir;

  const JOGOS = {
    "index.html": { tema: "lobby", nome: "Lobby", peca: "ficha" },
    "mecanismos.html": { tema: "poker", nome: "Pôquer", peca: "ficha" },
    "mecanismo-quase-ganhou.html": { tema: "slots", nome: "Caça-níquel", peca: "moeda" },
    "mecanismo-reforco-variavel.html": { tema: "crash", nome: "Multiplicador", peca: "foguete" },
    "mecanismo-ilusao-controle.html": { tema: "futebol", nome: "Apostas esportivas", peca: "futebol" },
    "simulador.html": { tema: "roleta", nome: "Roleta", peca: "bola" },
    "numeros.html": { tema: "loteria", nome: "Loteria", peca: "moeda" },
    "ajuda.html": { tema: "fora", nome: "Fora do jogo", peca: null },
    "glossario.html": { tema: "bingo", nome: "Bingo", peca: "bingo" },
    "fontes.html": { tema: "dados", nome: "Dados", peca: "dado" },
    "sobre.html": { tema: "bastidores", nome: "Bastidores", peca: "mira" }
  };

  const FRASES = {
    lobby: ["Bônus de boas-vindas", "37 casas, uma é da casa", "Gire de novo", "De cada R$ 100 apostados, R$ 2,70 ficam na mesa", "Jackpot acumulado", "A casa sempre ganha"],
    poker: ["All-in", "A mesa sempre leva a parte dela", "Só mais uma mão", "O adversário blefa, a matemática não"],
    slots: ["Quase!", "Faltou uma", "Giros grátis", "O quase não paga nada", "Tente outra vez"],
    crash: ["Retire antes de cair", "Já chegou a 100x!", "O próximo vai longe", "Ninguém sabe quando cai, nem você"],
    futebol: ["Odds turbinadas", "Aposta ao vivo", "Você entende de futebol", "A cotação já traz a margem da casa", "Múltipla de cinco jogos"],
    roleta: ["Façam suas apostas", "Vermelho ou preto?", "O zero é da casa", "Dobre e recupere", "Cada giro esquece o anterior"],
    loteria: ["Acumulou", "Hoje pode ser o seu dia", "R$ 220 bilhões depositados em 2025", "Raspe e veja"],
    fora: ["Sem bônus", "Sem pressa", "CVV: ligue 188, 24 horas", "Aqui o cassino está desligado"],
    bingo: ["Cartela cheia", "Bingo!", "Saiu o número que faltava", "Toda palavra tem uma conta por trás"],
    dados: ["Role os dados", "Sete na saída", "De onde vem cada número", "Fonte e data de consulta"],
    bastidores: ["HTML", "CSS", "JavaScript", "GSAP", "Lenis", "A máquina por dentro"]
  };

  if (temGsap) {
    const plugins = [window.ScrollTrigger, window.SplitText, window.DrawSVGPlugin].filter(Boolean);
    gsap.registerPlugin.apply(gsap, plugins);
  }

  function aleatorio(min, max) {
    return min + Math.random() * (max - min);
  }

  function criar(tag, classe, pai) {
    const el = document.createElement(tag);
    if (classe) el.className = classe;
    if (pai) pai.appendChild(el);
    return el;
  }

  const fundo = criar("div", "fundo-jogo");
  fundo.setAttribute("aria-hidden", "true");
  corpo.insertBefore(fundo, corpo.firstChild);

  let lampadas = [];
  let ordemLampadas = [];
  let nivelLuz = 1;

  function montarLampadas() {
    const caixa = criar("div", "lampadas", fundo);
    const a = criar("div", "lampadas-a", caixa);
    const b = criar("div", "lampadas-b", caixa);

    function distribuir() {
      a.replaceChildren();
      b.replaceChildren();
      const largura = caixa.clientWidth;
      const altura = caixa.clientHeight;
      const passo = largura < 720 ? 20 : 26;
      const margem = 6;
      const pontos = [];
      for (let x = margem; x <= largura - margem; x += passo) pontos.push([x, margem]);
      for (let y = margem + passo; y <= altura - margem; y += passo) pontos.push([largura - margem, y]);
      for (let x = largura - margem - passo; x >= margem; x -= passo) pontos.push([x, altura - margem]);
      for (let y = altura - margem - passo; y > margem; y -= passo) pontos.push([margem, y]);
      lampadas = pontos.map(function (p, i) {
        const l = criar("i", "", i % 2 ? b : a);
        l.style.left = p[0] + "px";
        l.style.top = p[1] + "px";
        return l;
      });
      ordemLampadas = lampadas.map(function (_, i) { return i; }).sort(function (x, y) {
        return ((x * 2654435761) % 997) - ((y * 2654435761) % 997);
      });
      aplicarLuz(nivelLuz, false);
    }

    let espera;
    window.addEventListener("resize", function () {
      clearTimeout(espera);
      espera = setTimeout(distribuir, 200);
    });
    distribuir();
  }

  function aplicarLuz(nivel, comAnimacao) {
    nivelLuz = Math.max(0, Math.min(1, nivel));
    raiz.style.setProperty("--luz", nivelLuz.toFixed(2));
    const apagar = Math.round((1 - nivelLuz) * lampadas.length);
    ordemLampadas.forEach(function (indice, posicao) {
      const lampada = lampadas[indice];
      const deveApagar = posicao < apagar;
      if (lampada.classList.contains("apagada") === deveApagar) return;
      if (comAnimacao && !reduzir) {
        setTimeout(function () {
          lampada.classList.toggle("apagada", deveApagar);
        }, Math.random() * 900);
      } else {
        lampada.classList.toggle("apagada", deveApagar);
      }
    });
  }

  function nivelDoSimulador() {
    const s = Estado.ler().simulador;
    if (!s || !s.saldoInicial) return 1;
    return s.saldoFinal / s.saldoInicial;
  }

  function montarHolofotes() {
    criar("div", "holofote", fundo);
    criar("div", "holofote", fundo);
  }

  function montarNaipes() {
    ["♠", "♥", "♦", "♣", "♠", "♥"].forEach(function (naipe, i) {
      const el = criar("span", "naipe-solto", fundo);
      el.textContent = naipe;
      el.style.left = (8 + i * 16) + "%";
      el.style.top = (10 + ((i * 37) % 70)) + "%";
      if (animar) {
        gsap.to(el, { y: aleatorio(-40, 40), rotation: aleatorio(-15, 15), duration: aleatorio(6, 10), repeat: -1, yoyo: true, ease: "sine.inOut" });
      }
    });
  }

  function montarEstrelas() {
    const tela = criar("canvas", "estrelas", fundo);
    const ctx = tela.getContext("2d");
    let estrelas = [];
    function medir() {
      tela.width = innerWidth;
      tela.height = innerHeight;
      estrelas = Array.from({ length: 140 }, function () {
        return { x: Math.random() * tela.width, y: Math.random() * tela.height, z: aleatorio(0.2, 1) };
      });
    }
    function desenhar() {
      ctx.clearRect(0, 0, tela.width, tela.height);
      estrelas.forEach(function (e) {
        if (!reduzir) {
          e.x -= e.z * 0.6;
          if (e.x < 0) e.x = tela.width;
        }
        ctx.fillStyle = "rgba(232,240,255," + (0.25 + e.z * 0.6) + ")";
        ctx.fillRect(e.x, e.y, e.z * 2, e.z * 2);
      });
      if (!reduzir) requestAnimationFrame(desenhar);
    }
    window.addEventListener("resize", medir);
    medir();
    desenhar();
  }

  function montarCampo() {
    const campo = criar("div", "campo-linhas", fundo);
    if (animar && window.ScrollTrigger) {
      gsap.to(campo, { yPercent: -12, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });
    }
  }

  function montarBolas(cores, comLetra) {
    const letras = "BINGO";
    for (let i = 0; i < 9; i++) {
      const bola = criar("span", "bola-solta", fundo);
      const dentro = criar("span", "", bola);
      const numero = 1 + Math.floor(Math.random() * 60);
      dentro.textContent = comLetra ? letras[i % 5] + numero : numero;
      bola.style.setProperty("--t", Math.round(aleatorio(60, 130)) + "px");
      bola.style.setProperty("--c", cores[i % cores.length]);
      bola.style.left = aleatorio(0, 92) + "%";
      bola.style.top = aleatorio(0, 85) + "%";
      if (animar) {
        gsap.to(bola, { x: aleatorio(-60, 60), y: aleatorio(-60, 60), rotation: aleatorio(-90, 90), duration: aleatorio(7, 12), repeat: -1, yoyo: true, ease: "sine.inOut" });
      }
    }
  }

  function montarDados() {
    for (let i = 0; i < 4; i++) {
      const dado = criar("div", "dado-solto", fundo);
      dado.style.left = [8, 78, 30, 88][i] + "%";
      dado.style.top = [14, 22, 72, 80][i] + "%";
      const cubo = criar("div", "dado-3d", dado);
      for (let f = 0; f < 6; f++) criar("b", "", cubo);
      if (animar) {
        gsap.to(cubo, { rotationX: aleatorio(200, 400), rotationY: aleatorio(200, 400), duration: aleatorio(14, 22), repeat: -1, ease: "none" });
      }
    }
  }

  function montarPlanta() {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "-110 -110 220 220");
    svg.setAttribute("class", "planta-roda");
    const g = document.createElementNS(ns, "g");
    g.setAttribute("fill", "none");
    g.setAttribute("stroke", "#7cc4ff");
    g.setAttribute("stroke-width", "0.6");
    [100, 92, 70, 40, 8].forEach(function (r) {
      const c = document.createElementNS(ns, "circle");
      c.setAttribute("r", r);
      g.appendChild(c);
    });
    for (let i = 0; i < 37; i++) {
      const ang = (i / 37) * Math.PI * 2;
      const l = document.createElementNS(ns, "line");
      l.setAttribute("x1", Math.cos(ang) * 70);
      l.setAttribute("y1", Math.sin(ang) * 70);
      l.setAttribute("x2", Math.cos(ang) * 100);
      l.setAttribute("y2", Math.sin(ang) * 100);
      g.appendChild(l);
    }
    svg.appendChild(g);
    fundo.appendChild(svg);
    if (animar) gsap.to(g, { rotation: 360, svgOrigin: "0 0", duration: 120, repeat: -1, ease: "none" });
  }

  const montarFundo = {
    lobby: function () { montarHolofotes(); montarLampadas(); aplicarLuz(nivelDoSimulador(), false); },
    poker: montarNaipes,
    slots: montarLampadas,
    crash: montarEstrelas,
    futebol: montarCampo,
    roleta: function () { montarLampadas(); aplicarLuz(nivelDoSimulador(), false); },
    loteria: function () { montarBolas(["#f2a900", "#2450c7", "#d6336c", "#2f9e44", "#7048e8"], false); },
    bingo: function () { montarBolas(["#ff7b3a", "#ffd166", "#ef476f", "#06d6a0"], true); },
    dados: montarDados,
    bastidores: montarPlanta,
    fora: function () {}
  };
  (montarFundo[tema] || function () {})();

  function montarLetreiro() {
    const frases = FRASES[tema] || FRASES.lobby;
    const barra = criar("div", "letreiro", corpo);
    barra.setAttribute("aria-hidden", "true");
    const faixa = criar("div", "letreiro-faixa", barra);
    for (let copia = 0; copia < 2; copia++) {
      for (let volta = 0; volta < 3; volta++) {
        frases.forEach(function (frase) {
          criar("span", "", faixa).textContent = frase;
        });
      }
    }
    faixa.style.setProperty("--duracao", Math.round(frases.join("").length * 1.1) + "s");
  }
  montarLetreiro();

  function montarCursor() {
    const jogo = JOGOS[paginaAtual()];
    if (!animar || !ponteiroFino || !jogo || !jogo.peca) return;
    const cursor = criar("div", "cursor-jogo escondido", corpo);
    cursor.setAttribute("aria-hidden", "true");
    const peca = criar("div", "cursor-peca peca-" + jogo.peca, cursor);
    raiz.classList.add("com-cursor");
    const xPara = gsap.quickTo(cursor, "x", { duration: 0.18, ease: "power3" });
    const yPara = gsap.quickTo(cursor, "y", { duration: 0.18, ease: "power3" });
    const giroPara = gsap.quickTo(cursor, "rotation", { duration: 0.6, ease: "power3" });
    let ultimoX = 0;
    let giro = 0;
    const gira = jogo.peca !== "foguete" && jogo.peca !== "mira";

    window.addEventListener("pointermove", function (evento) {
      if (evento.pointerType !== "mouse") return;
      xPara(evento.clientX);
      yPara(evento.clientY);
      if (gira) {
        giro += (evento.clientX - ultimoX) * 1.4;
        giroPara(giro);
      } else if (jogo.peca === "foguete") {
        giroPara(Math.max(-35, Math.min(35, (evento.clientX - ultimoX) * 3)));
      }
      ultimoX = evento.clientX;
      const alvo = evento.target.closest("a, button, summary, label, select, input[type=submit], input[type=reset], input[type=radio], input[type=checkbox], input[type=range], input[type=color], canvas");
      const texto = evento.target.closest("input[type=text], input[type=number], input[type=email], input[type=password], input[type=date], textarea");
      cursor.classList.toggle("sobre-link", Boolean(alvo));
      cursor.classList.toggle("escondido", Boolean(texto));
    });
    document.addEventListener("pointerleave", function () {
      cursor.classList.add("escondido");
    });
    window.addEventListener("pointerdown", function () {
      gsap.fromTo(peca, { rotationY: 0 }, { rotationY: 360, duration: 0.6, ease: "power2.out" });
    });
  }

  function paginaAtual() {
    return location.pathname.split("/").pop() || "index.html";
  }

  let lenis = null;
  function iniciarRolagem() {
    if (!animar || !window.Lenis) return;
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (tempo) {
      lenis.raf(tempo * 1000);
    });
    gsap.ticker.lagSmoothing(0);
    document.addEventListener("click", function (evento) {
      const link = evento.target.closest('a[href^="#"]');
      if (!link || link.classList.contains("pular")) return;
      const alvo = document.querySelector(link.getAttribute("href"));
      if (!alvo) return;
      evento.preventDefault();
      lenis.scrollTo(alvo, { offset: -90 });
    });
  }

  function iniciarMagneticos() {
    if (!animar || !ponteiroFino) return;
    document.querySelectorAll(".botao").forEach(function (botao) {
      const xPara = gsap.quickTo(botao, "x", { duration: 0.8, ease: "elastic.out(1, 0.45)" });
      const yPara = gsap.quickTo(botao, "y", { duration: 0.8, ease: "elastic.out(1, 0.45)" });
      botao.addEventListener("pointermove", function (evento) {
        const caixa = botao.getBoundingClientRect();
        xPara((evento.clientX - caixa.left - caixa.width / 2) * 0.3);
        yPara((evento.clientY - caixa.top - caixa.height / 2) * 0.4);
      });
      botao.addEventListener("pointerleave", function () {
        xPara(0);
        yPara(0);
      });
    });
  }

  const cortina = document.querySelector(".cortina");
  const listras = cortina ? cortina.querySelectorAll(".cortina-listras i") : [];
  const aviso = cortina ? cortina.querySelector(".cortina-aviso") : null;

  function abrirCortina() {
    if (!raiz.classList.contains("cortina-fechada")) return Promise.resolve();
    let direcao = "frente";
    try {
      direcao = sessionStorage.getItem("csg-cortina") || "frente";
      sessionStorage.removeItem("csg-cortina");
    } catch (erro) {}
    const jogo = JOGOS[paginaAtual()];
    if (jogo) cortina.querySelector(".cortina-jogo").textContent = jogo.nome;
    if (!animar) {
      raiz.classList.remove("cortina-fechada");
      return Promise.resolve();
    }
    return new Promise(function (resolver) {
      gsap.timeline({
        delay: 0.25,
        onComplete: function () {
          raiz.classList.remove("cortina-fechada");
          gsap.set(listras, { clearProps: "all" });
          gsap.set(aviso, { clearProps: "all" });
          resolver();
        }
      })
        .to(aviso, { autoAlpha: 0, scale: 0.92, duration: 0.25, ease: "power2.in" })
        .to(listras, { scaleY: 0, transformOrigin: "50% 100%", duration: 0.5, ease: "power3.inOut", stagger: { each: 0.04, from: direcao === "tras" ? "end" : "start" } }, "-=0.05");
    });
  }

  function fecharCortina(destino, direcao) {
    const jogo = JOGOS[destino];
    if (!animar || !cortina || !jogo) return Promise.resolve();
    cortina.dataset.tema = jogo.tema;
    cortina.querySelector(".cortina-jogo").textContent = jogo.nome;
    cortina.classList.add("ativa");
    try {
      sessionStorage.setItem("csg-cortina", direcao);
    } catch (erro) {}
    return new Promise(function (resolver) {
      gsap.timeline({ onComplete: resolver })
        .fromTo(listras, { scaleY: 0, transformOrigin: "50% 0%" }, { scaleY: 1, duration: 0.45, ease: "power3.inOut", stagger: { each: 0.035, from: direcao === "tras" ? "end" : "start" } })
        .fromTo(aviso, { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: 0.25, ease: "power2.out" }, "-=0.15")
        .to({}, { duration: 0.35 });
    });
  }

  function rodarPreloader() {
    if (!raiz.classList.contains("primeira-visita")) return Promise.resolve();
    try {
      sessionStorage.setItem("csg-entrou", "1");
    } catch (erro) {}
    const preloader = document.querySelector(".preloader");
    if (!animar || !preloader) {
      raiz.classList.remove("primeira-visita");
      return Promise.resolve();
    }
    const alvos = ["A casa", "sempre", "ganha"];
    const iscas = ["Bônus", "Sorte", "Jackpot", "Prêmio", "Giro", "Vitória", "Bingo"];
    const fitas = preloader.querySelectorAll(".fita-entrada");
    const altura = preloader.querySelector(".rolo-entrada").clientHeight;
    const linha = gsap.timeline({ paused: true });
    fitas.forEach(function (fita, i) {
      const palavras = [];
      for (let k = 0; k < 10 + i * 4; k++) palavras.push(iscas[(k + i * 3) % iscas.length]);
      palavras.push(alvos[i], iscas[i]);
      fita.replaceChildren.apply(fita, palavras.map(function (p) {
        const s = document.createElement("span");
        s.textContent = p;
        return s;
      }));
      const fim = -(palavras.length - 2) * altura;
      linha.fromTo(fita, { y: 0 }, { y: fim, duration: 1.3 + i * 0.5, ease: i === 2 ? "back.out(1.4)" : "power3.out" }, 0.1);
    });
    return new Promise(function (resolver) {
      function sair() {
        linha.kill();
        gsap.to(preloader, {
          yPercent: -100, duration: 0.7, ease: "power3.inOut", onComplete: function () {
            raiz.classList.remove("primeira-visita");
            preloader.remove();
            resolver();
          }
        });
      }
      preloader.style.animation = "none";
      linha.eventCallback("onComplete", function () {
        gsap.delayedCall(0.5, sair);
      });
      preloader.querySelector(".preloader-pular").addEventListener("click", sair);
      linha.play();
    });
  }

  function revelarTitulo() {
    const titulo = document.querySelector(".conteudo h1");
    if (!animar || !titulo || !window.SplitText) return;
    const partes = SplitText.create(titulo, { type: "lines", mask: "lines" });
    gsap.from(partes.lines, { yPercent: 110, duration: 0.9, ease: "power4.out", stagger: 0.09 });
  }

  function chuva(tipo, quantidade) {
    if (!animar) return;
    const corFicha = Estado.ler().cor;
    const cores = corFicha ? [corFicha] : ["#c23b2e", "#1d1d1d", "#e0a93b", "#2f8a5b", "#2450c7"];
    for (let i = 0; i < quantidade; i++) {
      const peca = criar("div", "chuva " + (tipo === "nota" ? "nota" : tipo === "moeda" ? "cursor-peca peca-moeda" : "ficha"), corpo);
      if (tipo === "nota") peca.textContent = "R$";
      if (tipo === "moeda") {
        peca.style.width = "34px";
        peca.style.height = "34px";
      }
      peca.style.setProperty("--c", cores[i % cores.length]);
      const x = aleatorio(0, innerWidth - 60);
      gsap.fromTo(peca, { x: x, y: -80, rotation: aleatorio(-180, 180) }, {
        x: x + aleatorio(-120, 120),
        y: innerHeight + 80,
        rotation: "+=" + aleatorio(-540, 540),
        duration: aleatorio(1.4, 2.4),
        delay: aleatorio(0, 0.5),
        ease: "power1.in",
        onComplete: function () { peca.remove(); }
      });
    }
  }

  function contar(elemento, ate, formatar, duracao) {
    if (!animar) {
      elemento.textContent = formatar(ate);
      return;
    }
    const valor = { v: 0 };
    gsap.to(valor, {
      v: ate,
      duration: duracao || 1.6,
      ease: "power2.out",
      onUpdate: function () { elemento.textContent = formatar(valor.v); }
    });
  }

  const pronto = rodarPreloader().then(abrirCortina);
  pronto.then(revelarTitulo);
  montarCursor();
  iniciarRolagem();
  iniciarMagneticos();

  if (!temGsap) raiz.classList.remove("cortina-fechada", "primeira-visita");

  window.addEventListener("pageshow", function (evento) {
    if (!evento.persisted || !cortina) return;
    cortina.classList.remove("ativa");
    if (temGsap) gsap.set(listras, { scaleY: 0 });
    if (temGsap) gsap.set(aviso, { autoAlpha: 0 });
  });

  return {
    animar: animar,
    tema: tema,
    pronto: pronto,
    luzes: function (nivel) { if (lampadas.length) aplicarLuz(nivel, true); },
    chuva: chuva,
    contar: contar,
    fecharCortina: fecharCortina,
    aleatorio: aleatorio
  };
})();
