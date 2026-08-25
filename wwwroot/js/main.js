function cargarComponente(id, path) {
  return fetch(path)
    .then(res => {
      if (!res.ok) throw new Error(`Error ${res.status} al cargar ${path}`);
      return res.text();
    })
    .then(html => {
      const elemento = document.getElementById(id);
      if (elemento) {
        elemento.innerHTML = html;
      } else {
        console.warn(`No se encontró el contenedor con ID: "${id}"`);
      }
    })
    .catch(err => console.error(err));
}

function cargarVista(view) {
  fetch(`../views/${view}.html`)
    .then(res => {
      if (!res.ok) throw new Error(`No se pudo cargar la vista: ${view}`);
      return res.text();
    })
    .then(html => {
      const app = document.getElementById('app');
      if (!app) return;

      app.innerHTML = html;

      // 1. Limpiar scripts dinámicos anteriores para evitar duplicados
      document.querySelectorAll('.script-vista-dinamico').forEach(s => s.remove());

      // 2. Extraer y re-ejecutar los scripts de la vista
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const scripts = tempDiv.querySelectorAll('script');

      scripts.forEach(script => {
        const nuevoScript = document.createElement('script');
        nuevoScript.classList.add('script-vista-dinamico'); // Marca para poder limpiarlo después

        if (script.src) {
          // Extraemos la ruta relativa original (ej: "../../js/material.js")
          const srcOriginal = script.getAttribute('src');

          // Normalizamos la ruta quitando los "../" para que apunte directamente desde la raíz
          const rutaLimpia = srcOriginal.replace(/^(\.\.\/)+/, ''); 
          
          // Asignamos la ruta limpia desde la raíz del servidor
          nuevoScript.src = `/wwwroot/${rutaLimpia}`;
        } else {
          nuevoScript.textContent = script.textContent;
        }

        document.body.appendChild(nuevoScript);
      });
    })
    .catch(err => console.error("Error en cargarVista:", err));
}

function cargarVistaPorHash() {
  const vista = window.location.hash.replace('#', '') || 'Rubros/Rubro';
  cargarVista(vista);
  actualizarLinkActivo();
}

function navigateTo(vista) {
  window.location.hash = vista;
}

function actualizarLinkActivo() {
  const vistaActual = window.location.hash.replace('#', '') || 'Rubros/Rubro';

  // Elimina la clase 'active' de todos los nav-items y links
  const todosItemsNav = document.querySelectorAll('.nav-item');
  todosItemsNav.forEach(item => item.classList.remove('active'));

  const todosLinks = document.querySelectorAll('a[href^="#"]');
  todosLinks.forEach(link => {
    const hrefVista = link.getAttribute('href').replace('#', '');
    if (hrefVista === vistaActual) {
      link.classList.add('active');

      const itemNavPadre = link.closest('.nav-item');
      if (itemNavPadre) {
        itemNavPadre.classList.add('active');
      }

      const contenedorColapsar = link.closest('.collapse');

      if (contenedorColapsar) {
        contenedorColapsar.classList.add('show');
        const linkColapsar = document.querySelector(`[data-target="#${contenedorColapsar.id}"]`);
        if (linkColapsar) {
          linkColapsar.classList.remove('collapsed');
          linkColapsar.setAttribute('aria-expanded', 'true');
        }
      } else {
        document.querySelectorAll('.collapse').forEach(collapse => {
          collapse.classList.remove('show');
        });
        document.querySelectorAll('[data-linkColapsar="collapse"]').forEach(linkColapsar => {
          linkColapsar.classList.add('collapsed');
          linkColapsar.setAttribute('aria-expanded', 'false');
        });
      }
    } else {
      link.classList.remove('active');
    }
  });
}

// Event Listeners
window.addEventListener('hashchange', cargarVistaPorHash);

window.addEventListener('DOMContentLoaded', () => {
  // Cargar primero los componentes de la maqueta y luego la vista
  Promise.all([
    cargarComponente('accordionSidebar', '../views/Componentes/Sidebar.html'),
    cargarComponente('footer', '../views/Componentes/Footer.html')
  ]).then(() => {
    if (typeof initSidebar === 'function') {
      initSidebar();
    }
    cargarVistaPorHash(); // Se ejecuta de forma segura una vez montada la base
  });
});