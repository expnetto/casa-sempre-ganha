(function () {
  const form = document.getElementById("form-limites");
  if (!form) return;

  const DIA = 86400000;
  const erro = document.getElementById("erro-limites");
  const painel = document.getElementById("painel-plano");
  const formRegistro = document.getElementById("form-registro");
  const campoCor = document.getElementById("cor-destaque");
  const raiz = document.documentElement;

  function hojeISO() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

  function diasDesde(dataISO) {
    const inicio = new Date(dataISO + "T00:00:00");
    const hoje = new Date(hojeISO() + "T00:00:00");
    return Math.round((hoje - inicio) / DIA);
  }

  function aplicarCor(cor) {
    raiz.style.setProperty("--destaque", cor);
    raiz.style.setProperty("--destaque-fundo", cor + "24");
  }

  function preencher(plano) {
    form.elements["nome"].value = plano.nome || "";
    form.elements["teto"].value = plano.teto;
    form.elements["periodo"].value = String(plano.periodo);
    form.elements["inicio"].value = plano.inicio;
    form.elements["email-confianca"].value = plano.email || "";
    form.elements["anotacao"].value = plano.anotacao || "";
    form.elements["autoexclusao"].checked = Boolean(plano.autoexclusao);
  }

  function desenhar(plano) {
    if (!plano) {
      painel.hidden = true;
      return;
    }
    const passados = diasDesde(plano.inicio);
    const diaAtual = passados + 1;
    const titulo = document.getElementById("plano-dia");
    const barraDias = document.getElementById("barra-dias");
    const fraseDias = document.getElementById("plano-frase-dias");
    const novoPeriodo = document.getElementById("novo-periodo");

    barraDias.max = plano.periodo;
    novoPeriodo.hidden = true;
    if (passados < 0) {
      titulo.textContent = "Começa em " + -passados + (passados === -1 ? " dia" : " dias");
      barraDias.value = 0;
      fraseDias.textContent = "O plano começa em " + new Date(plano.inicio + "T00:00:00").toLocaleDateString("pt-BR") + ".";
    } else if (diaAtual > plano.periodo) {
      titulo.textContent = "Período concluído";
      barraDias.value = plano.periodo;
      fraseDias.textContent = "Você chegou ao fim dos " + plano.periodo + " dias. Dá para começar outro período com o mesmo teto.";
      novoPeriodo.hidden = false;
    } else {
      titulo.textContent = "Dia " + diaAtual + " de " + plano.periodo;
      barraDias.value = diaAtual;
      fraseDias.textContent = "Faltam " + (plano.periodo - diaAtual) + " dias para fechar este período.";
    }

    const gasto = plano.gasto || 0;
    const barraGasto = document.getElementById("barra-gasto");
    barraGasto.max = plano.teto;
    barraGasto.value = Math.min(gasto, plano.teto);
    barraGasto.textContent = formatarReais(gasto);
    document.getElementById("plano-gasto").textContent =
      formatarReais(gasto) + " de " + formatarReais(plano.teto);

    const situacao = document.getElementById("plano-situacao");
    if (gasto > plano.teto) {
      situacao.textContent = "Você passou do teto em " + formatarReais(gasto - plano.teto) + ". Passar do limite não apaga o plano. Vale ler a seção de apoio logo abaixo.";
    } else {
      situacao.textContent = "Ainda cabem " + formatarReais(plano.teto - gasto) + " dentro do teto que você escolheu.";
    }

    const saudacao = document.getElementById("plano-saudacao");
    saudacao.textContent = plano.nome ? plano.nome + ", este é o seu plano." : "Este é o seu plano.";
    document.getElementById("plano-anotacao").textContent = plano.anotacao || "";
    painel.hidden = false;
  }

  function validar(dados, anterior) {
    if (!(dados.teto >= 1 && dados.teto <= 1000000)) return "Defina um teto entre R$ 1 e R$ 1.000.000.";
    if (!dados.inicio) return "Escolha a data de início do plano.";
    if (dados.palavraNova && dados.palavraNova.length < 4) return "A palavra de trava precisa ter pelo menos 4 letras.";
    if (anterior && anterior.palavra && dados.teto > anterior.teto && dados.palavraNova !== anterior.palavra) {
      return "Para aumentar o teto, digite a palavra de trava que você criou. É o freio que você mesmo colocou.";
    }
    return "";
  }

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const anterior = Estado.ler().limites;
    const dados = {
      nome: form.elements["nome"].value.trim().slice(0, 40),
      teto: Number(form.elements["teto"].value),
      periodo: Number(form.elements["periodo"].value),
      inicio: form.elements["inicio"].value,
      palavraNova: form.elements["palavra"].value,
      email: form.elements["email-confianca"].value.trim(),
      anotacao: form.elements["anotacao"].value.trim().slice(0, 600),
      autoexclusao: form.elements["autoexclusao"].checked
    };
    const mensagem = validar(dados, anterior);
    erro.textContent = mensagem;
    if (mensagem) return;

    const mesmoPeriodo = anterior && anterior.inicio === dados.inicio && anterior.periodo === dados.periodo;
    const plano = {
      nome: dados.nome,
      teto: dados.teto,
      periodo: dados.periodo,
      inicio: dados.inicio,
      palavra: dados.palavraNova || (anterior && anterior.palavra) || "",
      email: dados.email,
      anotacao: dados.anotacao,
      autoexclusao: dados.autoexclusao,
      gasto: mesmoPeriodo ? anterior.gasto || 0 : 0
    };
    if (!Estado.gravar("limites", plano)) {
      erro.textContent = "O navegador bloqueou o salvamento (modo privado?). O plano aparece agora, mas não fica guardado.";
    }
    Estado.gravar("cor", campoCor.value);
    form.elements["palavra"].value = "";
    desenhar(plano);
    painel.scrollIntoView({ block: "start" });
  });

  form.addEventListener("reset", function () {
    erro.textContent = "";
    setTimeout(function () {
      form.elements["inicio"].value = hojeISO();
    });
  });

  formRegistro.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const campo = formRegistro.elements["valor-registro"];
    const valor = Number(campo.value);
    const aviso = document.getElementById("erro-registro");
    if (!(valor > 0 && valor <= 1000000)) {
      aviso.textContent = "Digite um valor maior que zero.";
      return;
    }
    aviso.textContent = "";
    const plano = Estado.ler().limites;
    if (!plano) return;
    plano.gasto = (plano.gasto || 0) + valor;
    Estado.gravar("limites", plano);
    campo.value = "";
    desenhar(plano);
  });

  document.getElementById("novo-periodo").addEventListener("click", function () {
    const plano = Estado.ler().limites;
    if (!plano) return;
    plano.inicio = hojeISO();
    plano.gasto = 0;
    Estado.gravar("limites", plano);
    preencher(plano);
    desenhar(plano);
  });

  document.getElementById("apagar-plano").addEventListener("click", function () {
    if (!confirm("Apagar o plano salvo neste navegador? Isso não tem volta.")) return;
    Estado.gravar("limites", null);
    form.reset();
    desenhar(null);
  });

  campoCor.addEventListener("input", function () {
    aplicarCor(campoCor.value);
  });

  campoCor.addEventListener("change", function () {
    Estado.gravar("cor", campoCor.value);
  });

  const estado = Estado.ler();
  if (estado.cor) campoCor.value = estado.cor;
  form.elements["inicio"].value = hojeISO();
  if (estado.limites) {
    preencher(estado.limites);
    desenhar(estado.limites);
  }
})();
