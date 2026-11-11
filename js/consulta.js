(function () {
  function normalizar(texto) {
    return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }

  const busca = document.getElementById("form-busca");
  if (busca) {
    const campo = document.getElementById("busca-termo");
    const resultado = document.getElementById("busca-resultado");
    const secoes = Array.from(document.querySelectorAll(".termos"));
    busca.hidden = false;
    busca.addEventListener("submit", function (evento) {
      evento.preventDefault();
    });
    campo.addEventListener("input", function () {
      const procurado = normalizar(campo.value.trim());
      let achados = 0;
      secoes.forEach(function (secao) {
        let naSecao = 0;
        secao.querySelectorAll("details").forEach(function (termo) {
          const bate = normalizar(termo.textContent).includes(procurado);
          termo.hidden = !bate;
          if (bate) naSecao += 1;
        });
        secao.hidden = naSecao === 0;
        achados += naSecao;
      });
      if (!procurado) resultado.textContent = "";
      else if (achados) resultado.textContent = achados + (achados === 1 ? " termo encontrado." : " termos encontrados.");
      else resultado.textContent = "Nenhum termo com “" + campo.value.trim() + "”.";
    });
  }

  const novidades = document.getElementById("form-novidades");
  if (novidades) {
    novidades.addEventListener("submit", function (evento) {
      evento.preventDefault();
      const email = document.getElementById("email-novidades");
      const erro = document.getElementById("erro-novidades");
      const ok = document.getElementById("ok-novidades");
      ok.textContent = "";
      if (!email.value.trim() || !email.checkValidity()) {
        erro.textContent = "Digite um e-mail válido, como nome@email.com.";
        email.focus();
        return;
      }
      erro.textContent = "";
      ok.textContent = "Anotado. Como este é um projeto de faculdade sem servidor, a inscrição é só uma demonstração: o e-mail não sai do seu navegador.";
      novidades.reset();
    });
  }
})();
