(function () {
  const form = document.getElementById("form-calculadora");
  if (!form) return;

  const SEMANAS_POR_MES = 52 / 12;
  const JUROS_ANO = 0.1;
  const JUROS_MES = Math.pow(1 + JUROS_ANO, 1 / 12) - 1;
  const DIAS_POR_MES = 365.25 / 12;
  const PERIODOS = [
    { id: "hoje", extra: 0 },
    { id: "um-ano", extra: 12 },
    { id: "cinco-anos", extra: 60 }
  ];
  const MECANISMOS = {
    futebol: { pagina: "mecanismo-ilusao-controle.html", nome: "a ilusão de controle", porque: "Conhecer o time dá a sensação de que a aposta depende de você, mas a cotação já traz a margem da casa." },
    ao_vivo: { pagina: "mecanismo-reforco-variavel.html", nome: "o reforço variável", porque: "Uma partida vira dezenas de pequenas apostas, cada uma com a chance de um prêmio a qualquer momento." },
    roleta: { pagina: "mecanismo-ilusao-controle.html", nome: "a ilusão de controle", porque: "Escolher número, cor e estratégia muda a sensação, mas não muda os 2,7% da casa." },
    caca_niquel: { pagina: "mecanismo-quase-ganhou.html", nome: "o quase acerto", porque: "A máquina mostra símbolos premiados passando raspando a linha com mais frequência do que o acaso." },
    multiplicador: { pagina: "mecanismo-reforco-variavel.html", nome: "o reforço variável", porque: "O prêmio pode vir na próxima rodada, e retirar cedo deixa a sensação de que dava para ganhar mais." }
  };

  const erro = document.getElementById("erro-calculadora");
  const painel = document.getElementById("resultado-calculadora");
  const campoDesde = form.elements["desde"];
  campoDesde.max = new Date().toISOString().slice(0, 10);

  function guardado(porMes, meses) {
    return porMes * (Math.pow(1 + JUROS_MES, meses) - 1) / JUROS_MES;
  }

  function mesesDesde(dataISO) {
    const inicio = new Date(dataISO + "T00:00:00");
    return (Date.now() - inicio.getTime()) / 86400000 / DIAS_POR_MES;
  }

  function validar(semanal, desde, meses, renda) {
    if (!(semanal > 0 && semanal <= 100000)) return "Informe quanto vai para apostas por semana (de R$ 1 a R$ 100.000).";
    if (!desde) return "Informe a data em que você começou a apostar.";
    if (!(meses >= 0)) return "A data de início não pode estar no futuro.";
    if (meses > 600) return "Escolha uma data nos últimos 50 anos.";
    if (renda < 0) return "A renda não pode ser negativa.";
    return "";
  }

  function textoMeses(meses) {
    if (meses < 1) return "menos de um mês";
    const inteiro = Math.round(meses);
    return inteiro + (inteiro === 1 ? " mês" : " meses");
  }

  function mostrarMecanismo(jogo) {
    const caixa = document.getElementById("mecanismo-jogo");
    const info = MECANISMOS[jogo];
    if (!info) {
      caixa.hidden = true;
      return;
    }
    caixa.replaceChildren();
    const texto = document.createElement("p");
    texto.textContent = "No jogo que você escolheu, o mecanismo que mais pesa é " + info.nome + ". " + info.porque + " ";
    const link = document.createElement("a");
    link.href = info.pagina;
    link.textContent = "Entender como funciona";
    texto.appendChild(link);
    caixa.appendChild(texto);
    caixa.hidden = false;
  }

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const semanal = Number(form.elements["gasto-semanal"].value);
    const desde = campoDesde.value;
    const meses = desde ? mesesDesde(desde) : NaN;
    const renda = Number(form.elements["renda"].value || 0);

    const mensagem = validar(semanal, desde, meses, renda);
    erro.textContent = mensagem;
    if (mensagem) return;

    const porMes = semanal * SEMANAS_POR_MES;
    const total = porMes * meses;

    document.getElementById("total-gasto").textContent = formatarReais(total);
    document.getElementById("por-mes").textContent = formatarReais(porMes);

    PERIODOS.forEach(function (p) {
      const n = meses + p.extra;
      const saiu = porMes * n;
      document.getElementById("tab-" + p.id + "-total").textContent = formatarReais(saiu);
      document.getElementById("tab-" + p.id + "-guardado").textContent = formatarReais(guardado(porMes, n));
    });
    document.getElementById("tab-hoje-rotulo").textContent = "Até hoje (" + textoMeses(meses) + ")";

    const medidor = document.getElementById("medidor-renda");
    const fraseRenda = document.getElementById("frase-renda");
    if (renda > 0) {
      const fatia = porMes / renda;
      medidor.value = Math.min(fatia, 1);
      medidor.textContent = Math.round(fatia * 100) + "%";
      fraseRenda.textContent = "Isso é " + Math.round(fatia * 100) + "% da sua renda mensal indo para apostas.";
      medidor.parentElement.hidden = false;
    } else {
      medidor.parentElement.hidden = true;
    }

    const jogo = form.elements["jogo"].value;
    mostrarMecanismo(jogo);
    Estado.gravar("calculadora", { semanal: semanal, desde: desde, total: Math.round(total * 100) / 100, jogo: jogo });

    painel.hidden = false;
    painel.scrollIntoView({ block: "start" });
    if (typeof Raspadinha !== "undefined") {
      const dica = document.getElementById("raspadinha-dica");
      dica.hidden = false;
      Raspadinha.cobrir(document.getElementById("raspadinha"), function () {
        dica.hidden = true;
        if (typeof Cassino !== "undefined") Cassino.chuva("nota", 22);
      });
    }
  });

  form.addEventListener("reset", function () {
    painel.hidden = true;
    erro.textContent = "";
  });
})();
