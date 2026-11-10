(function () {
  const form = document.getElementById("form-cadastro");
  if (!form) return;

  const IDADE_MINIMA = 18;
  const erro = document.getElementById("erro-cadastro");
  const revelacao = document.getElementById("revelacao-cadastro");
  const campoNascimento = form.elements["cad-nascimento"];
  campoNascimento.max = new Date().toISOString().slice(0, 10);

  function idade(dataISO) {
    const nascimento = new Date(dataISO + "T00:00:00");
    const hoje = new Date();
    let anos = hoje.getFullYear() - nascimento.getFullYear();
    const aindaNaoFez = hoje.getMonth() < nascimento.getMonth() ||
      (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
    if (aindaNaoFez) anos -= 1;
    return anos;
  }

  function validar() {
    const nome = form.elements["cad-nome"].value.trim();
    const email = form.elements["cad-email"];
    const senha = form.elements["cad-senha"].value;
    const nascimento = campoNascimento.value;
    if (!nome) return "Digite o seu nome.";
    if (!nascimento) return "Informe a data de nascimento.";
    if (idade(nascimento) < 0 || idade(nascimento) > 120) return "Confira a data de nascimento.";
    if (idade(nascimento) < IDADE_MINIMA) return "Apostas são proibidas para menores de 18 anos. Uma bet autorizada é obrigada a recusar este cadastro.";
    if (!email.value.trim() || !email.checkValidity()) return "Digite um e-mail válido, como nome@exemplo.com.";
    if (senha.length < 6) return "A senha precisa ter pelo menos 6 caracteres.";
    if (!form.elements["cad-termos"].checked) return "Para pegar o bônus, é preciso aceitar os termos. Já leu o que está neles?";
    return "";
  }

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const mensagem = validar();
    form.elements["cad-senha"].value = "";
    erro.textContent = mensagem;
    if (mensagem) return;
    const primeiroNome = form.elements["cad-nome"].value.trim().split(/\s+/)[0].slice(0, 30);
    document.getElementById("cadastro-saudacao").textContent =
      primeiroNome + ", nenhum dado foi enviado e a senha já foi apagada. Mas, numa bet de verdade, você teria acabado de aceitar isto:";
    revelacao.hidden = false;
    revelacao.scrollIntoView({ block: "start" });
  });
})();
