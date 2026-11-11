(function () {
  const faixa = document.getElementById("faixa-abertura");
  const botao = document.getElementById("girar-abertura");
  const legenda = document.getElementById("legenda-abertura");
  const placar = document.getElementById("placar-abertura");
  if (!faixa || !botao) return;

  const APOSTA = 10;
  let saldo = 100;
  let rodadas = 0;
  const trilho = Roleta.montarFaixa(faixa);
  Roleta.posicionar(faixa, trilho, 0);
  botao.hidden = false;

  const botaoSacar = document.getElementById("sacar-abertura");
  const formSaque = document.getElementById("form-saque");
  const campoSenha = document.getElementById("senha-saque");
  const erroSaque = document.getElementById("erro-saque");
  let tentativas = 0;

  botaoSacar.addEventListener("click", function () {
    formSaque.hidden = false;
    campoSenha.focus();
  });

  formSaque.addEventListener("submit", function (evento) {
    evento.preventDefault();
    if (!campoSenha.value) {
      erroSaque.textContent = "Digite a sua senha.";
      return;
    }
    campoSenha.value = "";
    tentativas += 1;
    if (tentativas === 1) {
      erroSaque.textContent = "Senha incorreta. Tente de novo.";
      campoSenha.focus();
      return;
    }
    formSaque.hidden = true;
    botaoSacar.disabled = true;
    botaoSacar.textContent = "Saque bloqueado por 24 horas";
    legenda.textContent = "Por segurança, o saque foi bloqueado. A roleta continua liberada: que tal mais uma rodada?";
    document.getElementById("revelacao-saque").hidden = false;
    botao.focus();
  });

  botao.addEventListener("click", function () {
    if (saldo < APOSTA) {
      legenda.textContent = "Os R$ 100 acabaram. Foi isso que a vantagem da casa fez com eles.";
      botao.disabled = true;
      return;
    }
    const numero = Roleta.girar();
    saldo -= APOSTA;
    rodadas += 1;
    legenda.textContent = "Girando...";
    Roleta.animar(faixa, trilho, numero).then(function () {
      const ganhou = Roleta.cor(numero) === "vermelha";
      if (ganhou) saldo += APOSTA * 2;
      const quase = !ganhou && Roleta.vizinhos(numero).some(function (n) {
        return Roleta.cor(n) === "vermelha";
      });
      let texto = "Deu " + numero + " " + Roleta.nomeCor(numero) + ". ";
      if (ganhou) texto += "Você ganhou R$ 10. Dá vontade de girar de novo, não dá?";
      else if (quase) texto += "Perdeu, e o vermelho estava na casa do lado.";
      else texto += "Perdeu R$ 10.";
      if (ganhou && typeof Cassino !== "undefined") Cassino.chuva("ficha", 10);
      legenda.textContent = texto;
      const anterior = Estado.ler().abertura || { apostado: 0, recebido: 0 };
      Estado.gravar("abertura", {
        apostado: anterior.apostado + APOSTA,
        recebido: anterior.recebido + (ganhou ? APOSTA * 2 : 0)
      });
      placar.textContent = "Rodadas: " + rodadas + ". Saldo: " + formatarReais(saldo) + ".";
      botaoSacar.hidden = saldo <= 0;
    });
  });
})();
