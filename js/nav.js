(function () {
  const raiz = document.documentElement;
  raiz.classList.remove("sem-js");
  raiz.classList.add("js");

  const ORDEM = [
    "index.html",
    "mecanismos.html",
    "mecanismo-quase-ganhou.html",
    "mecanismo-reforco-variavel.html",
    "mecanismo-ilusao-controle.html",
    "simulador.html",
    "numeros.html",
    "ajuda.html",
    "glossario.html",
    "fontes.html",
    "sobre.html"
  ];

  function posicao(caminho) {
    const arquivo = caminho.split("/").pop() || "index.html";
    return ORDEM.indexOf(arquivo);
  }

  const aqui = posicao(location.pathname);

  try {
    const anterior = Number(sessionStorage.getItem("csg-anterior"));
    if (sessionStorage.getItem("csg-anterior") !== null && anterior > aqui) {
      raiz.classList.add("vindo-de-tras");
    }
    sessionStorage.removeItem("csg-anterior");
  } catch (erro) {}

  const estado = Estado.ler();
  if (estado.cor && document.body.dataset.tema === "fora") {
    document.body.style.setProperty("--destaque", estado.cor);
    document.body.style.setProperty("--destaque-fundo", estado.cor + "24");
  }

  const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tempoSaida = reduzir ? 120 : 180;

  document.addEventListener("click", function (evento) {
    const link = evento.target.closest("a");
    if (!link || link.target || link.hasAttribute("download")) return;
    if (evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.button !== 0) return;
    if (link.protocol !== location.protocol || link.host !== location.host) return;
    if (link.pathname === location.pathname) return;

    const destino = posicao(link.pathname);
    if (destino === -1) return;

    evento.preventDefault();
    try {
      sessionStorage.setItem("csg-anterior", String(aqui));
    } catch (erro) {}
    const direcao = destino < aqui ? "tras" : "frente";
    if (typeof Cassino !== "undefined" && Cassino.animar) {
      Cassino.fecharCortina(ORDEM[destino], direcao).then(function () {
        location.href = link.href;
      });
      return;
    }
    raiz.classList.add(direcao === "tras" ? "saindo-tras" : "saindo-frente");
    setTimeout(function () {
      location.href = link.href;
    }, tempoSaida);
  });

  window.addEventListener("pageshow", function (evento) {
    if (evento.persisted) {
      raiz.classList.remove("saindo-frente", "saindo-tras");
    }
  });

  const botao = document.querySelector(".botao-menu");
  const menu = document.getElementById("menu");
  if (botao && menu) {
    botao.addEventListener("click", function () {
      const aberto = menu.classList.toggle("aberto");
      botao.setAttribute("aria-expanded", String(aberto));
      botao.textContent = aberto ? "Fechar" : "Menu";
    });
  }

  const saldo = document.querySelector(".saldo-lateral");
  if (saldo && estado.simulador) {
    saldo.querySelector("strong").textContent = formatarReais(estado.simulador.saldoFinal);
    saldo.hidden = false;
  }
})();
