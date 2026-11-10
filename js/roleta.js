const Roleta = (function () {
  const RODA = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
    5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
  ];
  const VERMELHOS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  const VOLTAS = 3;

  function cor(numero) {
    if (numero === 0) return "zero";
    return VERMELHOS.indexOf(numero) !== -1 ? "vermelha" : "preta";
  }

  function nomeCor(numero) {
    return { zero: "verde", vermelha: "vermelho", preta: "preto" }[cor(numero)];
  }

  function girar() {
    return Math.floor(Math.random() * 37);
  }

  function vizinhos(numero) {
    const i = RODA.indexOf(numero);
    return [RODA[(i + 36) % 37], RODA[(i + 1) % 37]];
  }

  function ehQuase(sorteado, apostado) {
    return vizinhos(apostado).indexOf(sorteado) !== -1;
  }

  function criarCasa(numero) {
    const casa = document.createElement("span");
    casa.className = "casa casa-" + cor(numero);
    casa.textContent = numero;
    casa.dataset.numero = numero;
    return casa;
  }

  function montarFaixa(faixa) {
    const trilho = document.createElement("div");
    trilho.className = "faixa-trilho";
    for (let volta = 0; volta < VOLTAS; volta++) {
      RODA.forEach(function (numero) {
        trilho.appendChild(criarCasa(numero));
      });
    }
    const marcador = document.createElement("span");
    marcador.className = "faixa-marcador";
    marcador.setAttribute("aria-hidden", "true");
    faixa.replaceChildren(trilho, marcador);
    faixa.setAttribute("aria-hidden", "true");
    return trilho;
  }

  function deslocamento(faixa, trilho, numero, volta) {
    const casa = trilho.children[volta * 37 + RODA.indexOf(numero)];
    const centroCasa = casa.offsetLeft + casa.offsetWidth / 2;
    return faixa.clientWidth / 2 - centroCasa;
  }

  function posicionar(faixa, trilho, numero) {
    trilho.style.transform = "translateX(" + deslocamento(faixa, trilho, numero, 1) + "px)";
  }

  function animar(faixa, trilho, numero, duracao) {
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const emAndamento = trilho.getAnimations();
    const atual = new DOMMatrixReadOnly(getComputedStyle(trilho).transform).m41;
    const fim = deslocamento(faixa, trilho, numero, 2);
    const umaVolta = trilho.children[0].offsetWidth * 37;
    let inicio = atual;
    while (inicio <= fim + umaVolta * 0.5) inicio += umaVolta;
    while (inicio > fim + umaVolta * 1.5) inicio -= umaVolta;
    emAndamento.forEach(function (a) {
      a.cancel();
    });
    trilho.style.transform = "translateX(" + fim + "px)";
    if (reduzir) return Promise.resolve();
    const quadros = [
      { transform: "translateX(" + inicio + "px)" },
      { transform: "translateX(" + fim + "px)" }
    ];
    const animacao = trilho.animate(quadros, {
      duration: duracao || 2200,
      easing: "cubic-bezier(0.1, 0.65, 0.12, 1)"
    });
    return animacao.finished.catch(function () {});
  }

  return {
    RODA: RODA,
    cor: cor,
    nomeCor: nomeCor,
    girar: girar,
    vizinhos: vizinhos,
    ehQuase: ehQuase,
    montarFaixa: montarFaixa,
    posicionar: posicionar,
    animar: animar
  };
})();
