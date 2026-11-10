(function () {
  const cena = document.getElementById("cena-quase");
  if (!cena) return;

  const APOSTA = 17;
  const PAROU = 34;
  const faixa = document.getElementById("faixa-cena");
  const trilho = Roleta.montarFaixa(faixa);
  Roleta.posicionar(faixa, trilho, PAROU);
  trilho.querySelectorAll('[data-numero="' + APOSTA + '"]').forEach(function (casa) {
    casa.classList.add("alvo");
  });

  const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!window.gsap || !window.ScrollTrigger || reduzir) return;

  gsap.registerPlugin(ScrollTrigger);
  cena.classList.add("animada");

  const final = new DOMMatrixReadOnly(getComputedStyle(trilho).transform).m41;
  const umaVolta = trilho.children[0].offsetWidth * 37;
  const passos = cena.querySelectorAll(".cena-texto p");

  const linha = gsap.timeline({
    scrollTrigger: {
      trigger: cena,
      start: "center center",
      end: "+=1600",
      pin: true,
      scrub: 0.6
    }
  });

  linha
    .fromTo(trilho, { x: final + umaVolta * 0.85 }, { x: final, ease: "power3.out", duration: 3 }, 0)
    .from(passos[0], { autoAlpha: 0, y: 20, duration: 0.4 }, 0)
    .from(passos[1], { autoAlpha: 0, y: 20, duration: 0.4 }, 1.2)
    .from(passos[2], { autoAlpha: 0, y: 20, duration: 0.4 }, 2.6)
    .to(faixa, { scale: 1.03, duration: 0.2, yoyo: true, repeat: 1 }, 2.9);
})();
