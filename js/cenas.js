const Raspadinha = (function () {
  function cobrir(caixa, aoRevelar) {
    if (!caixa) return;
    const antigo = caixa.querySelector("canvas");
    if (antigo) antigo.remove();
    const tela = document.createElement("canvas");
    tela.setAttribute("aria-hidden", "true");
    caixa.appendChild(tela);
    const largura = caixa.clientWidth;
    const altura = caixa.clientHeight;
    tela.width = largura;
    tela.height = altura;
    const ctx = tela.getContext("2d");
    const brilho = ctx.createLinearGradient(0, 0, largura, altura);
    brilho.addColorStop(0, "#b8b8b8");
    brilho.addColorStop(0.5, "#ececec");
    brilho.addColorStop(1, "#9c9c9c");
    ctx.fillStyle = brilho;
    ctx.fillRect(0, 0, largura, altura);
    ctx.fillStyle = "rgba(60, 60, 60, 0.75)";
    ctx.font = "700 20px Fredoka, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("RASPE AQUI", largura / 2, altura / 2);
    ctx.globalCompositeOperation = "destination-out";

    let raspando = false;
    let movimentos = 0;
    let revelada = false;

    function revelar() {
      if (revelada) return;
      revelada = true;
      tela.style.transition = "opacity 400ms ease";
      tela.style.opacity = "0";
      setTimeout(function () { tela.remove(); }, 450);
      if (aoRevelar) aoRevelar();
    }

    function raspar(evento) {
      if (!raspando) return;
      const caixaTela = tela.getBoundingClientRect();
      ctx.beginPath();
      ctx.arc(evento.clientX - caixaTela.left, evento.clientY - caixaTela.top, 24, 0, Math.PI * 2);
      ctx.fill();
      movimentos += 1;
      if (movimentos % 10 === 0 && limpo() > 0.5) revelar();
    }

    function limpo() {
      const dados = ctx.getImageData(0, 0, largura, altura).data;
      let transparentes = 0;
      let total = 0;
      for (let i = 3; i < dados.length; i += 64) {
        total += 1;
        if (dados[i] === 0) transparentes += 1;
      }
      return transparentes / total;
    }

    tela.addEventListener("pointerdown", function (evento) {
      raspando = true;
      tela.setPointerCapture(evento.pointerId);
      raspar(evento);
    });
    tela.addEventListener("pointermove", raspar);
    tela.addEventListener("pointerup", function () { raspando = false; });
    return revelar;
  }
  return { cobrir: cobrir };
})();

(function () {
  const temGsap = typeof gsap !== "undefined";
  const animar = typeof Cassino !== "undefined" && Cassino.animar;
  const tema = document.body.dataset.tema;

  function numeroAleatorio(semente) {
    let a = semente >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function lobby() {
    const roda = document.querySelector(".roda-giro img");
    const orbita = document.querySelector(".bola-orbita");
    if (!roda || !animar) return;
    gsap.to(roda, { rotation: 360, duration: 26, repeat: -1, ease: "none" });
    gsap.to(orbita, { rotation: -360, duration: 7, repeat: -1, ease: "none" });
    gsap.to(".roda-giro", { yPercent: 18, rotation: 25, ease: "none", scrollTrigger: { trigger: ".abertura", start: "top top", end: "bottom top", scrub: true } });
    document.querySelectorAll(".fichas-hero .ficha").forEach(function (ficha, i) {
      gsap.to(ficha, { y: Cassino.aleatorio(-24, 24), rotation: Cassino.aleatorio(-40, 40), duration: Cassino.aleatorio(2.5, 4), repeat: -1, yoyo: true, ease: "sine.inOut" });
      const xPara = gsap.quickTo(ficha, "x", { duration: 1.2, ease: "power3" });
      const fator = (i + 1) * 6;
      window.addEventListener("pointermove", function (evento) {
        xPara((evento.clientX / innerWidth - 0.5) * fator * 4);
      });
    });
    gsap.from(".ferramentas li", { y: 60, autoAlpha: 0, rotation: function (i) { return (i - 1) * 4; }, stagger: 0.12, duration: 0.8, ease: "back.out(1.6)", scrollTrigger: { trigger: ".ferramentas", start: "top 85%" } });
  }

  function poker() {
    const pista = document.getElementById("pista-mecanismos");
    if (!pista || !animar) return;
    const lista = pista.querySelector(".mecanismos-lista");
    const cartas = lista.querySelectorAll(".carta");
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1100px)", function () {
      pista.classList.add("ativa");
      const distancia = function () { return lista.scrollWidth - pista.clientWidth; };
      gsap.set(cartas, { rotation: function (i) { return [-4, 3, -2][i]; } });
      gsap.to(lista, {
        x: function () { return -distancia(); },
        ease: "none",
        scrollTrigger: { trigger: pista, start: "center center", end: function () { return "+=" + distancia(); }, pin: true, scrub: 1, invalidateOnRefresh: true }
      });
      return function () { pista.classList.remove("ativa"); };
    });
    gsap.from(cartas, {
      y: -260, x: 120, rotation: function () { return Cassino.aleatorio(-40, 40); }, autoAlpha: 0,
      duration: 0.9, ease: "power3.out", stagger: 0.18,
      scrollTrigger: { trigger: pista, start: "top 80%" }
    });
  }

  function faixaQuase() {
    const cena = document.getElementById("cena-quase");
    if (!cena) return;
    const APOSTA = 17;
    const PAROU = 34;
    const faixa = document.getElementById("faixa-cena");
    const trilho = Roleta.montarFaixa(faixa);
    Roleta.posicionar(faixa, trilho, PAROU);
    trilho.querySelectorAll('[data-numero="' + APOSTA + '"]').forEach(function (casa) {
      casa.classList.add("alvo");
    });
    if (!animar) return;
    const final = new DOMMatrixReadOnly(getComputedStyle(trilho).transform).m41;
    const umaVolta = trilho.children[0].offsetWidth * 37;
    const passos = cena.querySelectorAll(".cena-texto p");
    gsap.timeline({ scrollTrigger: { trigger: cena, start: "center center", end: "+=1600", pin: true, scrub: 0.6 } })
      .fromTo(trilho, { x: final + umaVolta * 0.85 }, { x: final, ease: "power3.out", duration: 3 }, 0)
      .from(passos[0], { autoAlpha: 0, y: 20, duration: 0.4 }, 0)
      .from(passos[1], { autoAlpha: 0, y: 20, duration: 0.4 }, 1.2)
      .from(passos[2], { autoAlpha: 0, y: 20, duration: 0.4 }, 2.6)
      .to(faixa, { scale: 1.03, duration: 0.2, yoyo: true, repeat: 1 }, 2.9);
  }

  function cacaNiquel() {
    const cena = document.getElementById("caca-niquel");
    if (!cena) return;
    const SIMBOLOS = ["♣", "♥", "BAR", "♦", "$", "♠", "♥", "♣", "BAR", "♦", "♠", "$"];
    const PARADA = 18;
    const fitas = cena.querySelectorAll(".rolo-fita");
    fitas.forEach(function (fita, r) {
      const lista = [];
      for (let i = 0; i < PARADA + 2; i++) lista.push(SIMBOLOS[(i * 5 + r * 3) % SIMBOLOS.length]);
      if (r < 2) {
        lista[PARADA] = "7";
      } else {
        lista[PARADA - 1] = "7";
        lista[PARADA] = "♣";
      }
      fita.replaceChildren.apply(fita, lista.map(function (s) {
        const el = document.createElement("span");
        el.textContent = s;
        if (s === "7") el.className = "sete";
        return el;
      }));
    });
    const altura = fitas[0].firstChild.offsetHeight;
    const fim = -(PARADA - 1) * altura;
    if (!animar) {
      fitas.forEach(function (f) { f.style.transform = "translateY(" + fim + "px)"; });
      return;
    }
    const passos = cena.querySelectorAll(".cena-texto p");
    const linha = gsap.timeline({ scrollTrigger: { trigger: cena, start: "center center", end: "+=1500", pin: true, scrub: 0.6 } });
    fitas.forEach(function (fita, r) {
      linha.fromTo(fita, { y: 0 }, { y: fim, duration: 1 + r * 0.7, ease: r === 2 ? "back.out(1.2)" : "power3.out" }, 0);
    });
    linha
      .from(passos[0], { autoAlpha: 0, y: 20, duration: 0.3 }, 0.8)
      .from(passos[1], { autoAlpha: 0, y: 20, duration: 0.3 }, 1.5)
      .from(passos[2], { autoAlpha: 0, y: 20, duration: 0.3 }, 2.3)
      .to(".linha-paga", { boxShadow: "0 0 40px rgba(255, 46, 151, 1)", borderColor: "#ff2e97", duration: 0.2, yoyo: true, repeat: 3 }, 2.4);
  }

  function palavras() {
    if (!animar || typeof SplitText === "undefined") return;
    document.querySelectorAll("[data-palavras]").forEach(function (paragrafo) {
      const partes = SplitText.create(paragrafo, { type: "words" });
      gsap.fromTo(partes.words, { opacity: 0.15 }, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: paragrafo, start: "top 80%", end: "bottom 45%", scrub: true } });
    });
  }

  function crash() {
    const area = document.getElementById("crash");
    if (!area) return;
    const tela = document.getElementById("crash-tela");
    const ctx = tela.getContext("2d");
    const numero = document.getElementById("crash-numero");
    const aviso = document.getElementById("crash-aviso");
    const apostar = document.getElementById("crash-apostar");
    const retirar = document.getElementById("crash-retirar");
    const saldoEl = document.getElementById("crash-saldo");
    const historico = document.getElementById("crash-historico");
    const APOSTA = 10;
    const VELOCIDADE = 0.15;
    let saldo = 100;
    let rodando = false;
    let retirou = 0;
    let queda = 1;
    let inicio = 0;
    let pontos = [];

    function formatarX(m) {
      return m.toFixed(2).replace(".", ",") + "x";
    }

    function sortearQueda() {
      const u = Math.random();
      return Math.max(1, Math.floor((97 / (1 - u))) / 100);
    }

    function medir() {
      tela.width = tela.clientWidth;
      tela.height = tela.clientHeight;
      desenhar();
    }

    function desenhar(caiu) {
      const w = tela.width;
      const h = tela.height;
      ctx.clearRect(0, 0, w, h);
      if (!pontos.length) return;
      const ultimo = pontos[pontos.length - 1];
      const tMax = Math.max(8, ultimo.t * 1.1);
      const mMax = Math.max(2, ultimo.m * 1.15);
      const px = function (t) { return 20 + (t / tMax) * (w - 60); };
      const py = function (m) { return h - 20 - ((m - 1) / (mMax - 1)) * (h - 60); };
      ctx.beginPath();
      ctx.moveTo(px(0), py(1));
      pontos.forEach(function (p) { ctx.lineTo(px(p.t), py(p.m)); });
      ctx.lineWidth = 4;
      ctx.strokeStyle = caiu ? "#ff4d5e" : "#39ff88";
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.lineTo(px(ultimo.t), h - 20);
      ctx.lineTo(px(0), h - 20);
      ctx.closePath();
      ctx.shadowBlur = 0;
      ctx.fillStyle = caiu ? "rgba(255,77,94,0.12)" : "rgba(57,255,136,0.12)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px(ultimo.t), py(ultimo.m), 8, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    }

    function atualizarSaldo() {
      saldoEl.textContent = formatarReais(saldo);
      apostar.textContent = saldo < APOSTA ? "Recomeçar com R$ 100" : "Apostar R$ 10";
    }

    function registrar(m) {
      const item = document.createElement("li");
      item.textContent = formatarX(m);
      if (m >= 2) item.className = "alto";
      historico.prepend(item);
      while (historico.children.length > 12) historico.lastChild.remove();
    }

    function quadro(agora) {
      const t = (agora - inicio) / 1000;
      const m = Math.exp(VELOCIDADE * t);
      if (m >= queda) {
        pontos.push({ t: Math.log(queda) / VELOCIDADE, m: queda });
        terminar();
        return;
      }
      pontos.push({ t: t, m: m });
      numero.textContent = formatarX(m);
      desenhar(false);
      requestAnimationFrame(quadro);
    }

    function terminar() {
      rodando = false;
      retirar.disabled = true;
      apostar.disabled = false;
      numero.textContent = formatarX(queda);
      numero.classList.add("caiu");
      desenhar(true);
      registrar(queda);
      if (retirou) {
        aviso.textContent = "Caiu em " + formatarX(queda) + ". Você saiu em " + formatarX(retirou) + ". Dá a sensação de que saiu cedo demais, e é essa sensação que puxa a próxima rodada.";
      } else {
        aviso.textContent = "Caiu em " + formatarX(queda) + " antes de você retirar. Perdeu R$ 10.";
        if (area.animate) area.animate([{ transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "none" }], { duration: 300 });
      }
      atualizarSaldo();
    }

    apostar.addEventListener("click", function () {
      if (rodando) return;
      if (saldo < APOSTA) {
        saldo = 100;
        atualizarSaldo();
        aviso.textContent = "Saldo de mentira reabastecido.";
        return;
      }
      saldo -= APOSTA;
      atualizarSaldo();
      queda = sortearQueda();
      retirou = 0;
      pontos = [];
      rodando = true;
      numero.classList.remove("caiu");
      aviso.textContent = "Subindo... retire quando quiser.";
      apostar.disabled = true;
      retirar.disabled = false;
      inicio = performance.now();
      requestAnimationFrame(quadro);
    });

    retirar.addEventListener("click", function () {
      if (!rodando || retirou) return;
      const ultimo = pontos[pontos.length - 1];
      retirou = ultimo ? ultimo.m : 1;
      const ganho = APOSTA * retirou;
      saldo += ganho;
      atualizarSaldo();
      retirar.disabled = true;
      aviso.textContent = "Retirou em " + formatarX(retirou) + ": recebeu " + formatarReais(ganho) + ". Veja até onde ele vai...";
      if (typeof Cassino !== "undefined" && retirou >= 1.5) Cassino.chuva("moeda", 10);
    });

    window.addEventListener("resize", medir);
    medir();
  }

  function odds() {
    const tabela = document.querySelector(".placar-odds tbody");
    if (!tabela) return;
    const MARGEM = 1.055;
    function formatar(v) {
      return v.toFixed(2).replace(".", ",");
    }
    function atualizarLinha(linha) {
      const celulas = linha.querySelectorAll(".odd");
      let soma = 0;
      celulas.forEach(function (c) { soma += 1 / Number(c.textContent.replace(",", ".")); });
      linha.querySelector(".margem").textContent = Math.round(soma * 100) + "%";
    }
    tabela.querySelectorAll("tr").forEach(atualizarLinha);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setInterval(function () {
      const linhas = tabela.querySelectorAll("tr");
      const linha = linhas[Math.floor(Math.random() * linhas.length)];
      const celulas = Array.from(linha.querySelectorAll(".odd"));
      const de = Math.floor(Math.random() * 3);
      const para = (de + 1 + Math.floor(Math.random() * 2)) % 3;
      const passo = 0.01 + Math.random() * 0.03;
      const ps = celulas.map(function (c) { return Number(c.dataset.p); });
      if (ps[de] - passo < 0.08) return;
      ps[de] -= passo;
      ps[para] += passo;
      celulas.forEach(function (c, i) {
        const antes = Number(c.textContent.replace(",", "."));
        const depois = 1 / (ps[i] * MARGEM);
        c.dataset.p = ps[i].toFixed(4);
        c.textContent = formatar(depois);
        if (Math.abs(depois - antes) > 0.001) {
          c.classList.remove("subiu", "desceu");
          c.classList.add(depois > antes ? "subiu" : "desceu");
          setTimeout(function () { c.classList.remove("subiu", "desceu"); }, 1200);
        }
      });
      atualizarLinha(linha);
    }, 1600);
  }

  function simularNoite(semente) {
    const sorte = numeroAleatorio(semente);
    const vermelhos = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    const jogadores = ["fixa", "dobrar", "seguir"].map(function (e) {
      return { estrategia: e, saldo: 1000, proxima: 10, anterior: null, linha: [1000] };
    });
    for (let r = 0; r < 200; r++) {
      const n = Math.floor(sorte() * 37);
      const cor = n === 0 ? "zero" : vermelhos.indexOf(n) !== -1 ? "vermelha" : "preta";
      jogadores.forEach(function (j) {
        if (j.saldo <= 0) {
          j.linha.push(0);
          return;
        }
        let alvo = "vermelha";
        if (j.estrategia === "seguir" && j.anterior && j.anterior !== "zero") alvo = j.anterior;
        const valor = Math.min(j.estrategia === "dobrar" ? j.proxima : 10, j.saldo);
        const ganhou = cor === alvo;
        j.saldo += ganhou ? valor : -valor;
        j.proxima = ganhou ? 10 : valor * 2;
        j.anterior = cor;
        j.linha.push(j.saldo);
      });
    }
    return jogadores;
  }

  function graficoSaldos() {
    const figura = document.getElementById("grafico-estrategias");
    if (!figura) return;
    let escolhida = null;
    for (let semente = 1; semente < 2000 && !escolhida; semente++) {
      const noite = simularNoite(semente);
      const dobra = noite[1].linha;
      const quebrou = dobra.indexOf(0);
      if (quebrou > 90 && quebrou < 170 && Math.max.apply(null, dobra) > 1080 && noite[0].saldo < 1000 && noite[2].saldo < 1000 && noite[0].saldo > 850 && noite[2].saldo > 850) escolhida = noite;
    }
    if (!escolhida) escolhida = simularNoite(7);
    const svg = figura.querySelector("svg");
    const ns = "http://www.w3.org/2000/svg";
    const L = 800;
    const A = 360;
    const maximo = Math.max.apply(null, escolhida.map(function (j) { return Math.max.apply(null, j.linha); })) * 1.05;
    const x = function (i) { return 40 + (i / 200) * (L - 160); };
    const y = function (v) { return A - 30 - (v / maximo) * (A - 60); };
    const cores = ["#ffffff", "#ff5c5c", "#ffd400"];

    const base = document.createElementNS(ns, "line");
    base.setAttribute("x1", x(0));
    base.setAttribute("x2", x(200));
    base.setAttribute("y1", y(1000));
    base.setAttribute("y2", y(1000));
    base.setAttribute("stroke", "rgba(255,255,255,0.45)");
    base.setAttribute("stroke-dasharray", "6 6");
    svg.appendChild(base);

    const caminhos = escolhida.map(function (j, k) {
      const d = j.linha.map(function (v, i) { return (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1); }).join(" ");
      const p = document.createElementNS(ns, "path");
      p.setAttribute("d", d);
      p.setAttribute("fill", "none");
      p.setAttribute("stroke", cores[k]);
      p.setAttribute("stroke-width", "3");
      p.setAttribute("stroke-linejoin", "round");
      svg.appendChild(p);
      const rotulo = document.createElementNS(ns, "text");
      rotulo.setAttribute("x", x(200) + 10);
      rotulo.setAttribute("y", y(j.saldo) + 6 + (k - 1) * 16);
      rotulo.textContent = j.saldo > 0 ? "R$ " + j.saldo : "quebrou";
      rotulo.setAttribute("fill", cores[k]);
      svg.appendChild(rotulo);
      return { caminho: p, rotulo: rotulo };
    });

    if (!animar || typeof DrawSVGPlugin === "undefined") return;
    const linha = gsap.timeline({ scrollTrigger: { trigger: figura, start: "top 70%", end: "bottom 40%", scrub: 1 } });
    caminhos.forEach(function (c) {
      linha.fromTo(c.caminho, { drawSVG: "0%" }, { drawSVG: "100%", ease: "none", duration: 1 }, 0);
      linha.fromTo(c.rotulo, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, 0.95);
    });
  }

  function contadores() {
    document.querySelectorAll("[data-contar]").forEach(function (el) {
      const valor = Number(el.dataset.contar);
      const casas = Number.isInteger(valor) ? 0 : 1;
      const formatar = function (v) {
        const texto = v.toFixed(casas).replace(".", ",");
        return el.dataset.formato === "bi" ? "R$ " + texto + " bi" : texto + " mi";
      };
      if (!animar || typeof ScrollTrigger === "undefined") return;
      el.textContent = formatar(0);
      ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: function () { Cassino.contar(el, valor, formatar, 2); } });
    });
    if (animar) gsap.from(".bola-loteria", { y: -120, rotation: -180, autoAlpha: 0, stagger: 0.15, duration: 1, ease: "bounce.out", scrollTrigger: { trigger: ".bolas-numeros", start: "top 85%" } });
  }

  const cenas = {
    lobby: lobby,
    poker: poker,
    slots: function () { faixaQuase(); cacaNiquel(); palavras(); },
    crash: crash,
    futebol: function () { odds(); graficoSaldos(); },
    loteria: contadores
  };

  function iniciar() {
    if (cenas[tema]) cenas[tema]();
    if (temGsap && typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(iniciar);
  } else {
    iniciar();
  }
})();
