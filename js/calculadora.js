(function () {
  const form = document.getElementById("form-calculadora");
  if (!form) return;

  const SEMANAS_POR_MES = 52 / 12;
  const JUROS_ANO = 0.1;
  const JUROS_MES = Math.pow(1 + JUROS_ANO, 1 / 12) - 1;
  const PERIODOS = [
    { id: "hoje", extra: 0 },
    { id: "um-ano", extra: 12 },
    { id: "cinco-anos", extra: 60 }
  ];

  const erro = document.getElementById("erro-calculadora");
  const painel = document.getElementById("resultado-calculadora");

  function guardado(porMes, meses) {
    return porMes * (Math.pow(1 + JUROS_MES, meses) - 1) / JUROS_MES;
  }

  function alugueis(valor, aluguel) {
    const quantos = valor / aluguel;
    return quantos.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + (quantos >= 2 ? " aluguéis" : " aluguel");
  }

  function validar(semanal, meses, aluguel, renda) {
    if (!(semanal > 0 && semanal <= 100000)) return "Informe quanto vai para apostas por semana (de R$ 1 a R$ 100.000).";
    if (!(Number.isInteger(meses) && meses >= 1 && meses <= 600)) return "Informe há quantos meses, em número inteiro (de 1 a 600).";
    if (!(aluguel > 0)) return "Informe um valor de aluguel maior que zero.";
    if (renda < 0) return "A renda não pode ser negativa.";
    return "";
  }

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const semanal = Number(form.elements["gasto-semanal"].value);
    const meses = Number(form.elements["meses"].value);
    const aluguel = Number(form.elements["aluguel"].value);
    const renda = Number(form.elements["renda"].value || 0);

    const mensagem = validar(semanal, meses, aluguel, renda);
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
      document.getElementById("tab-" + p.id + "-aluguel").textContent = alugueis(saiu, aluguel);
      document.getElementById("tab-" + p.id + "-guardado").textContent = formatarReais(guardado(porMes, n));
    });
    document.getElementById("tab-hoje-rotulo").textContent = "Até hoje (" + meses + (meses === 1 ? " mês)" : " meses)");

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

    painel.hidden = false;
    painel.scrollIntoView({ block: "start" });
  });

  form.addEventListener("reset", function () {
    painel.hidden = true;
    erro.textContent = "";
  });
})();
