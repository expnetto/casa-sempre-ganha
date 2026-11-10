(function () {
  const corpo = document.getElementById("comprovante-corpo");
  if (!corpo) return;

  const VANTAGEM = { roleta: 1 / 37, multiplicador: 0.03 };
  const PERGUNTAS = [
    "Você apostou mais do que podia perder?",
    "Precisou apostar valores maiores para sentir a mesma empolgação?",
    "Voltou outro dia para tentar recuperar o dinheiro que tinha perdido?",
    "Pegou dinheiro emprestado ou vendeu alguma coisa para apostar?",
    "Sentiu que pode ter um problema com apostas?",
    "As apostas causaram problemas de saúde para você, como estresse ou ansiedade?",
    "Alguém criticou as suas apostas ou disse que você tinha um problema, mesmo que você achasse que não?",
    "As apostas causaram problemas financeiros para você ou para a sua casa?",
    "Você se sentiu culpado pela forma como aposta ou pelo que acontece quando aposta?"
  ];
  const OPCOES = ["Nunca", "Às vezes", "Na maioria das vezes", "Quase sempre"];
  const FAIXAS = [
    { ate: 0, nome: "Sem sinais de problema", texto: "Pelas suas respostas, as apostas não estão causando problemas. Se você aposta, o que protege é decidir antes quanto aceita perder e tratar esse valor como gasto, não como investimento." },
    { ate: 2, nome: "Baixo risco", texto: "Há poucos sinais, mas eles existem. Vale observar se o valor ou a frequência das apostas estão subindo. A autoexclusão do governo é uma forma rápida de dar uma pausa, se quiser." },
    { ate: 7, nome: "Risco moderado", texto: "Suas respostas mostram consequências reais das apostas. Conversar com alguém de confiança e com um profissional ajuda. O CAPS atende de graça, e a autoexclusão bloqueia todas as casas autorizadas de uma vez." },
    { ate: 27, nome: "Jogo problemático", texto: "Suas respostas indicam que as apostas estão causando problemas sérios. Isso tem tratamento, e você não precisa resolver sozinho. Ligue 188 (CVV) agora se precisar conversar, e procure o CAPS da sua região." }
  ];

  function linhaTabela(nome, apostado, voltou) {
    const tr = document.createElement("tr");
    [nome, formatarReais(apostado), formatarReais(voltou)].forEach(function (texto, i) {
      const cel = document.createElement(i === 0 ? "th" : "td");
      if (i === 0) cel.scope = "row";
      else cel.className = "num";
      cel.textContent = texto;
      tr.appendChild(cel);
    });
    return tr;
  }

  function paragrafo(texto, classe) {
    const p = document.createElement("p");
    p.textContent = texto;
    if (classe) p.className = classe;
    return p;
  }

  function desenharComprovante() {
    const estado = Estado.ler();
    document.getElementById("comprovante-data").textContent = new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
    const jogos = [];
    if (estado.abertura && estado.abertura.apostado) {
      jogos.push({ nome: "Roleta da abertura", apostado: estado.abertura.apostado, voltou: estado.abertura.recebido, vantagem: VANTAGEM.roleta });
    }
    if (estado.simulador && estado.simulador.apostado) {
      const s = estado.simulador;
      jogos.push({ nome: "Simulador de roleta", apostado: s.apostado, voltou: s.apostado + s.saldoFinal - s.saldoInicial, vantagem: VANTAGEM.roleta });
    }
    if (estado.crash && estado.crash.apostado) {
      jogos.push({ nome: "Multiplicador", apostado: estado.crash.apostado, voltou: estado.crash.recebido, vantagem: VANTAGEM.multiplicador });
    }

    const reflexao = document.getElementById("comprovante-reflexao");
    reflexao.hidden = !estado.reflexao;
    reflexao.textContent = estado.reflexao ? "Com esse dinheiro, eu: " + estado.reflexao : "";

    if (!jogos.length && !estado.calculadora && !estado.maquina) return;
    const fragmento = document.createDocumentFragment();

    if (jogos.length) {
      const tabela = document.createElement("table");
      const cabeca = tabela.createTHead().insertRow();
      ["Jogo", "Apostado", "Voltou"].forEach(function (t, i) {
        const th = document.createElement("th");
        th.scope = "col";
        th.textContent = t;
        if (i) th.className = "num";
        cabeca.appendChild(th);
      });
      const corpoTabela = tabela.createTBody();
      let apostado = 0;
      let voltou = 0;
      let previsto = 0;
      jogos.forEach(function (j) {
        corpoTabela.appendChild(linhaTabela(j.nome, j.apostado, j.voltou));
        apostado += j.apostado;
        voltou += j.voltou;
        previsto += j.apostado * j.vantagem;
      });
      tabela.createTFoot().appendChild(linhaTabela("Total", apostado, voltou));
      fragmento.appendChild(tabela);

      const ficou = apostado - voltou;
      const porcento = apostado ? (ficou / apostado) * 100 : 0;
      fragmento.appendChild(paragrafo(
        ficou >= 0
          ? "Ficou com a casa: " + formatarReais(ficou) + " (" + porcento.toFixed(1).replace(".", ",") + "% do que você apostou)."
          : "Você saiu " + formatarReais(-ficou) + " na frente. Foi sorte de sessão curta: quanto mais rodadas, mais o resultado se aproxima da previsão abaixo.",
        "comprovante-destaque"
      ));
      fragmento.appendChild(paragrafo("A matemática previa que a casa ficasse com cerca de " + formatarReais(previsto) + "."));
    }

    if (estado.maquina && estado.maquina.giros) {
      const m = estado.maquina;
      fragmento.appendChild(paragrafo("Caça-níquel: " + m.giros + (m.giros === 1 ? " giro, " : " giros, ") + m.quases + (m.quases === 1 ? " quase acerto." : " quase acertos.")));
    }

    if (estado.calculadora && estado.calculadora.total) {
      fragmento.appendChild(paragrafo("Na vida real, você informou " + formatarReais(estado.calculadora.total) + " em apostas desde " + new Date(estado.calculadora.desde + "T00:00:00").toLocaleDateString("pt-BR") + ". Esse dinheiro não era de mentira.", "comprovante-destaque"));
    }
    corpo.replaceChildren(fragmento);
  }

  document.getElementById("zerar-extrato").addEventListener("click", function () {
    if (!confirm("Apagar o extrato e as jogadas guardadas neste navegador?")) return;
    ["abertura", "simulador", "crash", "maquina", "calculadora", "reflexao"].forEach(function (parte) {
      Estado.gravar(parte, null);
    });
    location.reload();
  });

  const formReflexao = document.getElementById("form-reflexao");
  const campoReflexao = document.getElementById("reflexao");
  campoReflexao.value = Estado.ler().reflexao || "";
  formReflexao.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const texto = campoReflexao.value.trim().slice(0, 300);
    const erro = document.getElementById("erro-reflexao");
    if (!texto) {
      erro.textContent = "Escreva uma resposta antes de imprimir.";
      return;
    }
    erro.textContent = "";
    Estado.gravar("reflexao", texto);
    desenharComprovante();
    document.getElementById("comprovante").scrollIntoView({ block: "start" });
  });

  const lista = document.getElementById("perguntas");
  PERGUNTAS.forEach(function (pergunta, i) {
    const item = document.createElement("li");
    const grupo = document.createElement("fieldset");
    const legenda = document.createElement("legend");
    legenda.textContent = pergunta;
    grupo.appendChild(legenda);
    const opcoes = document.createElement("ul");
    opcoes.className = "opcoes opcoes-linha";
    OPCOES.forEach(function (texto, valor) {
      const li = document.createElement("li");
      const entrada = document.createElement("input");
      entrada.type = "radio";
      entrada.name = "p" + i;
      entrada.id = "p" + i + "-" + valor;
      entrada.value = valor;
      entrada.required = true;
      const rotulo = document.createElement("label");
      rotulo.htmlFor = entrada.id;
      rotulo.textContent = texto;
      li.append(entrada, rotulo);
      opcoes.appendChild(li);
    });
    grupo.appendChild(opcoes);
    item.appendChild(grupo);
    lista.appendChild(item);
  });

  const formTeste = document.getElementById("form-teste");
  const progresso = document.getElementById("progresso-teste");
  const contagem = document.getElementById("contagem-teste");

  function respondidas() {
    return PERGUNTAS.filter(function (_, i) {
      return formTeste.querySelector('input[name="p' + i + '"]:checked');
    }).length;
  }

  function atualizarProgresso() {
    const n = respondidas();
    progresso.value = n;
    progresso.textContent = n + " de 9";
    contagem.textContent = n + " de 9";
  }

  formTeste.addEventListener("change", atualizarProgresso);
  formTeste.addEventListener("reset", function () {
    setTimeout(atualizarProgresso);
    document.getElementById("resultado-teste").hidden = true;
    document.getElementById("erro-teste").textContent = "";
  });

  formTeste.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const erro = document.getElementById("erro-teste");
    if (respondidas() < PERGUNTAS.length) {
      erro.textContent = "Responda as nove perguntas para ver o resultado. Faltam " + (PERGUNTAS.length - respondidas()) + ".";
      return;
    }
    erro.textContent = "";
    let pontos = 0;
    PERGUNTAS.forEach(function (_, i) {
      pontos += Number(formTeste.querySelector('input[name="p' + i + '"]:checked').value);
    });
    const faixa = FAIXAS.find(function (f) { return pontos <= f.ate; });
    document.getElementById("pontos-teste").textContent = pontos;
    document.getElementById("faixa-teste").textContent = faixa.nome;
    document.getElementById("texto-teste").textContent = faixa.texto;
    const painel = document.getElementById("resultado-teste");
    painel.hidden = false;
    painel.scrollIntoView({ block: "start" });
  });

  desenharComprovante();
})();
