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
      legenda.textContent = texto;
      placar.textContent = "Rodadas: " + rodadas + ". Saldo: " + formatarReais(saldo) + ".";
    });
  });
})();
