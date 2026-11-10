(function () {
  const alvos = document.querySelectorAll("[data-revelar]");
  if (!alvos.length) return;

  if (!("IntersectionObserver" in window)) {
    alvos.forEach(function (el) {
      el.classList.add("visivel");
    });
    return;
  }

  const observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visivel");
        observador.unobserve(entrada.target);
      }
    });
  }, { rootMargin: "0px 0px -12% 0px" });

  alvos.forEach(function (el) {
    observador.observe(el);
  });
})();
