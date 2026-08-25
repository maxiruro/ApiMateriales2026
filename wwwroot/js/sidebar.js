
function initSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const sidebarToggler = document.querySelector(".sidebar-toggler");
  const menuToggler = document.querySelector(".menu-toggler");

  if (!sidebar || !sidebarToggler || !menuToggler) return;

  let collapsedSidebarHeight = "56px";
  let fullSidebarHeight = "calc(100vh)";

  sidebarToggler.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });

  const toggleMenu = (isMenuActive) => {
    sidebar.style.height = isMenuActive ? `${sidebar.scrollHeight}px` : collapsedSidebarHeight;
    menuToggler.querySelector("span").innerText = isMenuActive ? "close" : "menu";
  };

  menuToggler.addEventListener("click", () => {
    toggleMenu(sidebar.classList.toggle("menu-active"));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
      sidebar.style.height = fullSidebarHeight;
    } else {
      sidebar.classList.remove("collapsed");
      sidebar.style.height = "auto";
      toggleMenu(sidebar.classList.contains("menu-active"));
    }
  });

  // Submenús desplegables
document.querySelectorAll(".submenu-toggle").forEach(menu => {

  menu.addEventListener("click", (e) => {
    e.preventDefault();

    const parent = menu.closest(".nav-item");

    parent.classList.toggle("open");

    // Recalcular altura en móvil
    if (sidebar.classList.contains("menu-active")) {
      sidebar.style.height = `${sidebar.scrollHeight}px`;
    }
  });

});

}