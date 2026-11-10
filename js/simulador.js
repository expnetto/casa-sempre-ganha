(function () {
  const form = document.getElementById("form-simulador");
  if (!form) return;

  const campoValor = document.getElementById("valor-aposta");
  const mostraValor = document.getElementById("mostra-valor");
  const campoNumero = document.getElementById("numero-escolhido");
  const blocoNumero = document.getElementById("campo-numero");

  function mostrarNumero(sim) {
    campoNumero.disabled = !sim;
    blocoNumero.hidden = !sim;
  }
  const erro = document.getElementById("erro-simulador");
  const botaoUma = document.getElementById("girar-uma");
  const faixa = document.getElementById("faixa-simulador");
  const legenda = document.getElementById("legenda-simulador");
  const painel = document.getElementById("resultado-simulador");
  const corpoTabela = document.getElementById("corpo-rodadas");
  const filtro = document.getElementById("so-destaques");
  const trilho = Roleta.montarFaixa(faixa);
  Roleta.posicionar(faixa, trilho, 0);

  let sessao = null;

  function lerConfig() {
    const dados = new FormData(form);
    return {
      saldoInicial: Number(dados.get("saldo-inicial")),
      valor: Number(dados.get("valor-aposta")),
      tipo: dados.get("tipo"),
      numero: Number(dados.get("numero-escolhido")),
      rodadas: Number(dados.get("rodadas")),
      estrategia: dados.get("estrategia")
    };
  }

  function validar(config) {
    if (!(config.saldoInicial >= 10 && config.saldoInicial <= 10000)) return "O saldo inicial precisa ficar entre R$ 10 e R$ 10.000.";
    if (!(config.rodadas >= 1 && config.rodadas <= 500)) return "Escolha de 1 a 500 rodadas.";
    if (config.tipo === "numero" && !(Number.isInteger(config.numero) && config.numero >= 0 && config.numero <= 36)) return "O número precisa ser inteiro, de 0 a 36.";
    if (config.valor > config.saldoInicial) return "A aposta não pode ser maior que o saldo inicial.";
    return "";
  }

  function novaSessao(config) {
    return {
      config: config,
      saldo: config.saldoInicial,
      proximaAposta: config.valor,
      anterior: null,
      apostado: 0,
      vitorias: 0,
      quases: 0,
      linhas: []
    };
  }

  function escolherAlvo(s) {
    const c = s.config;
    if (c.tipo === "numero") {
      return c.estrategia === "seguir" && s.anterior !== null ? s.anterior : c.numero;
    }
    if (c.estrategia === "seguir" && s.anterior !== null && s.anterior !== 0) {
      return Roleta.cor(s.anterior);
    }
    return "vermelha";
  }

  function rodada(s, sorteado) {
    const c = s.config;
    const alvo = escolherAlvo(s);
    const valor = Math.min(c.estrategia === "dobrar" ? s.proximaAposta : c.valor, s.saldo);
    const ganhou = c.tipo === "numero" ? sorteado === alvo : Roleta.cor(sorteado) === alvo;
    const premio = ganhou ? valor * (c.tipo === "numero" ? 36 : 2) : 0;
    const quase = !ganhou && (c.tipo === "numero"
      ? Roleta.ehQuase(sorteado, alvo)
      : Roleta.vizinhos(sorteado).some(function (n) { return Roleta.cor(n) === alvo; }));

    s.saldo = s.saldo - valor + premio;
    s.apostado += valor;
    if (ganhou) s.vitorias += 1;
    if (quase) s.quases += 1;
    s.proximaAposta = ganhou ? c.valor : valor * 2;
    s.anterior = sorteado;
    s.linhas.push({
      numero: s.linhas.length + 1,
      alvo: alvo,
      valor: valor,
      sorteado: sorteado,
      ganhou: ganhou,
      quase: quase,
      saldo: s.saldo
    });
  }

  function nomeAlvo(alvo) {
    if (typeof alvo === "number") return "Número " + alvo;
    return alvo === "vermelha" ? "Vermelho" : "Preto";
  }

  function celula(texto, classe) {
    const td = document.createElement("td");
    td.textContent = texto;
    if (classe) td.className = classe;
    return td;
  }

  function desenharTabela() {
    const linhas = filtro.checked
      ? sessao.linhas.filter(function (l) { return l.ganhou || l.quase; })
      : sessao.linhas;
    const fragmento = document.createDocumentFragment();
    linhas.forEach(function (l) {
      const tr = document.createElement("tr");
      if (l.ganhou) tr.className = "vitoria";
      else if (l.quase) tr.className = "quase";
      tr.appendChild(celula(l.numero, "num"));
      tr.appendChild(celula(nomeAlvo(l.alvo)));
      tr.appendChild(celula(formatarReais(l.valor), "num"));
      const tdCasa = document.createElement("td");
      const bolinha = document.createElement("span");
      bolinha.className = "bolinha casa-" + Roleta.cor(l.sorteado);
      bolinha.textContent = l.sorteado;
      tdCasa.appendChild(bolinha);
      tr.appendChild(tdCasa);
      tr.appendChild(celula(l.ganhou ? "Ganhou" : l.quase ? "Quase" : "Perdeu"));
      tr.appendChild(celula(formatarReais(l.saldo), "num"));
      fragmento.appendChild(tr);
    });
    corpoTabela.replaceChildren(fragmento);
  }

  function desenharResumo() {
    const s = sessao;
    const resultado = s.saldo - s.config.saldoInicial;
    const esperado = -s.apostado / 37;
    const numero = document.getElementById("saldo-final");
    numero.textContent = formatarReais(s.saldo);
    numero.classList.toggle("negativo", resultado < 0);
    document.getElementById("res-rodadas").textContent = s.linhas.length;
    document.getElementById("frase-resultado").textContent =
      "Você apostou " + formatarReais(s.apostado) + " ao todo e " +
      (resultado < 0 ? "perdeu " + formatarReais(-resultado) : resultado > 0 ? "ganhou " + formatarReais(resultado) : "empatou") +
      ". A matemática previa perder " + formatarReais(-esperado) + "." +
      (resultado > 0 ? " Ganhar numa sessão curta é sorte; em muitas rodadas, o resultado sempre se aproxima da previsão." : "");
    document.getElementById("res-vitorias").textContent = s.vitorias;
    document.getElementById("res-quases").textContent = s.quases;
    const barra = document.getElementById("barra-saldo");
    barra.max = s.config.saldoInicial * 2;
    barra.value = Math.min(s.saldo, barra.max);
    barra.textContent = formatarReais(s.saldo);
    const quebrou = document.getElementById("res-quebrou");
    quebrou.hidden = s.saldo > 0;
    quebrou.textContent = "O saldo acabou na rodada " + s.linhas.length + ". As rodadas seguintes não aconteceram.";
    painel.hidden = false;
    desenharTabela();
    Estado.gravar("simulador", {
      saldoInicial: s.config.saldoInicial,
      saldoFinal: s.saldo,
      apostado: s.apostado,
      rodadas: s.linhas.length,
      data: new Date().toISOString()
    });
    if (typeof Cassino !== "undefined") Cassino.luzes(s.saldo / s.config.saldoInicial);
    const lateral = document.querySelector(".saldo-lateral");
    if (lateral) {
      lateral.querySelector("strong").textContent = formatarReais(s.saldo);
      lateral.hidden = false;
    }
  }

  function preparar() {
    const config = lerConfig();
    const mensagem = validar(config);
    erro.textContent = mensagem;
    return mensagem ? null : config;
  }

  campoValor.addEventListener("input", function () {
    mostraValor.textContent = formatarReais(Number(campoValor.value));
  });

  form.addEventListener("change", function (evento) {
    if (evento.target.name === "tipo") {
      mostrarNumero(evento.target.value === "numero");
    }
  });

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const config = preparar();
    if (!config) return;
    sessao = novaSessao(config);
    for (let i = 0; i < config.rodadas && sessao.saldo > 0; i++) {
      rodada(sessao, Roleta.girar());
    }
    const ultima = sessao.linhas[sessao.linhas.length - 1];
    Roleta.posicionar(faixa, trilho, ultima.sorteado);
    legenda.textContent = "Última casa sorteada: " + ultima.sorteado + " " + Roleta.nomeCor(ultima.sorteado) + ".";
    desenharResumo();
    painel.scrollIntoView({ block: "start" });
  });

  form.addEventListener("reset", function () {
    sessao = null;
    painel.hidden = true;
    erro.textContent = "";
    legenda.textContent = "";
    setTimeout(function () {
      mostraValor.textContent = formatarReais(Number(campoValor.value));
      mostrarNumero(false);
    });
  });

  botaoUma.addEventListener("click", function () {
    const config = preparar();
    if (!config) return;
    if (!sessao || sessao.saldo <= 0) sessao = novaSessao(config);
    const sorteado = Roleta.girar();
    rodada(sessao, sorteado);
    const linha = sessao.linhas[sessao.linhas.length - 1];
    legenda.textContent = "Girando...";
    Roleta.animar(faixa, trilho, sorteado).then(function () {
      let texto = "Deu " + sorteado + " " + Roleta.nomeCor(sorteado) + ". ";
      texto += linha.ganhou ? "Ganhou." : linha.quase ? "Quase. Perdeu por uma casa." : "Perdeu.";
      texto += " Saldo: " + formatarReais(linha.saldo) + ".";
      legenda.textContent = texto;
      desenharResumo();
      if (typeof Cassino !== "undefined") {
        if (linha.ganhou) Cassino.chuva("ficha", linha.alvo === "vermelha" || linha.alvo === "preta" ? 8 : 24);
        else if (linha.quase) {
          faixa.classList.remove("treme");
          void faixa.offsetWidth;
          faixa.classList.add("treme");
        }
      }
    });
  });

  filtro.addEventListener("change", function () {
    if (sessao) desenharTabela();
  });

  mostraValor.textContent = formatarReais(Number(campoValor.value));
  mostrarNumero(form.querySelector('input[name="tipo"]:checked').value === "numero");
})();
