async function ObtenerRubros() {
  try {
    // Cerrar modal si está abierto
    const modalElement = document.getElementById('modalRubro');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }

    const respuesta = await fetch(`${linkApi}/Rubros`);
    if (!respuesta.ok) {
      console.error("Error al obtener rubros desde la API");
      return;
    }

    const rubros = await respuesta.json();
    LimpiarModal();

    const bodyRubros = document.getElementById("tbody-rubros");
    if (!bodyRubros) return;
    
    bodyRubros.innerHTML = "";

    rubros.forEach((rubro) => {

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${rubro.descripcion || ''}</td>
        <td class="text-center columnaBtn">
          <button class="btn btn-editar" title='Editar' onclick="AbrirModalEditar(${rubro.rubroID})">
            <i class="fa-solid fa-pen"></i>
          </button>
        </td>
        <td class="text-center columnaBtn">
          <button class="btn btn-eliminar" title='Eliminar' onclick="Eliminar(${rubro.rubroID})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>`;

      bodyRubros.appendChild(tr);
    });
  } catch (error) {
    console.error("Error en ObtenerRubros:", error);
  }
}

async function AbrirModalEditar(id) {
  try {
    const respuesta = await fetch(`${linkApi}/Rubros/${id}`);
    if (!respuesta.ok) throw new Error("No se pudo obtener el rubro");

    const rubro = await respuesta.json();

    document.getElementById("rubroID").value = rubro.rubroID;
    document.getElementById("rubroDescripcion").value = rubro.descripcion;

    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalRubro'));
    modal.show();

  } catch (error) {
    console.error("Error en AbrirModalEditar:", error); 
  }
}

async function GuardarRubro() {
  const form = document.querySelector(".formRubro");
  if (!validarCamposRequeridos(form)) return;

  const rubroID = parseInt(document.getElementById("rubroID").value) || 0;
  const descripcion = document.getElementById("rubroDescripcion").value.trim();

  const rubroDTO = {
    rubroID: rubroID,
    descripcion: descripcion,
  };

  try {
    let respuesta;
    if (rubroID > 0) {
      // PUT (Editar)
      respuesta = await fetch(`${linkApi}/Rubros/${rubroID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rubroDTO)
      });
    } else {
      // POST (Crear)
      respuesta = await fetch(`${linkApi}/Rubros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rubroDTO)
      });
    }

    if (!respuesta.ok) throw new Error("Error al procesar la solicitud");

    await ObtenerRubros();

  } catch (error) {
    console.error("Error al guardar:", error);
    Swal.fire("Error", "No se pudo guardar el registro en la base de datos", "error");
  }
}

async function Eliminar(id) {
  const result = await Swal.fire({
    title: "¿Desea eliminar este registro?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    iconColor: "#e65100",
    showCancelButton: true,
    confirmButtonColor: "#752900",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (!result.isConfirmed) return;

  try {
    const respuesta = await fetch(`${linkApi}/Rubros/${id}`, {
      method: "DELETE"
    });

    if (!respuesta.ok) throw new Error("No se pudo eliminar el rubro");

    await Swal.fire({
      icon: "success",
      iconColor: "#e6b000",
      title: "Eliminado",
      text: "El registro fue eliminado correctamente",
      timer: 1500,
      showConfirmButton: false
    });

    ObtenerRubros();

  } catch (error) {
    console.error("Error en Eliminar:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "El rubro tiene materiales asociados y no se puede eliminar",
      confirmButtonColor: "#752900"
    });
  }
}

function validarCamposRequeridos(contenedor) {
  let valido = true;
  if (!contenedor) return true;

  const inputs = contenedor.querySelectorAll(".input-requerido");
  inputs.forEach(input => {
    const errorSpan = input.nextElementSibling;
    if (input.value.trim() === "") {
      if (errorSpan && errorSpan.classList.contains("error-texto")) {
        errorSpan.textContent = "Campo obligatorio";
        errorSpan.style.display = "block";
      }
      valido = false;
    } else {
      if (errorSpan && errorSpan.classList.contains("error-texto")) {
        errorSpan.style.display = "none";
      }
    }
  });

  return valido;
}

function LimpiarModal() {
  document.getElementById("rubroID").value = "0";
  document.getElementById("rubroDescripcion").value = "";

  // Ocultar mensajes de error
  document.querySelectorAll(".error-texto").forEach(e => e.style.display = "none");
}

// 7. INICIALIZACIÓN
async function InicializarVistaRubros() {
  await ObtenerRubros();
}

// Ejecutar flujo de carga
InicializarVistaRubros();

