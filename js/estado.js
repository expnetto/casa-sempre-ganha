const Estado = (function () {
  const CHAVE = "csg";

  function padrao() {
    return { simulador: null, cor: null };
  }

  function ler() {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE));
      return Object.assign(padrao(), salvo);
    } catch (erro) {
      return padrao();
    }
  }

  function gravar(parte, valor) {
    const novo = Object.assign(ler(), { [parte]: valor });
    try {
      localStorage.setItem(CHAVE, JSON.stringify(novo));
      return true;
    } catch (erro) {
      return false;
    }
  }

  function aplicarCor(cor) {
    if (/^#[0-9a-f]{6}$/i.test(cor)) document.documentElement.style.setProperty("--ficha", cor);
  }

  aplicarCor(ler().cor);

  return { ler: ler, gravar: gravar, aplicarCor: aplicarCor };
})();

function formatarReais(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
