(function () {
  const raiz = document.documentElement;
  raiz.classList.remove("sem-js");
  raiz.classList.add("js");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  try {
    if (sessionStorage.getItem("csg-cortina")) raiz.classList.add("cortina-fechada");
    if (!sessionStorage.getItem("csg-entrou")) raiz.classList.add("primeira-visita");
  } catch (erro) {}
})();
