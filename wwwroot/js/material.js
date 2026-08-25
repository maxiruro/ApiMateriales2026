// Variable global o configurada (asegúrate de definir linkApi si no viene de config.js)
// const linkApi = "http://localhost:5000/api"; 

// 1. OBTENER RUBROS (Poblar el Select)
async function ObtenerRubros(idRubroSeleccionado = null) {
  try {
    const respuesta = await fetch(`${linkApi}/Rubros`);
    if (!respuesta.ok) throw new Error("Error al obtener rubros");

    const rubros = await respuesta.json();
    const comboSelect = document.getElementById("selectRubro");
    if (!comboSelect) return;

    let opciones = '<option value="" disabled selected>-- Seleccione un Rubro --</option>';
    
    rubros.forEach((rubro) => {
      // Compatibilidad con C# CamelCase (rubroID / rubroId) y PascalCase
      const id = rubro.rubroID ?? rubro.rubroId ?? rubro.RubroID;
      const texto = rubro.descripcion ?? rubro.Descripcion;
      
      opciones += `<option value="${id}">${texto}</option>`;
    });

    comboSelect.innerHTML = opciones;

    // Si viene un ID para seleccionar (modo edición)
    if (idRubroSeleccionado) {
      comboSelect.value = idRubroSeleccionado;
    }
  } catch (error) {
    console.error("Error en ObtenerRubros:", error);
  }
}

// 2. OBTENER MATERIALES (Tabla)
async function ObtenerMateriales() {
  try {
    // Cerrar modal si está abierto
    const modalElement = document.getElementById('modalMaterial');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }

    const respuesta = await fetch(`${linkApi}/Materiales`);
    if (!respuesta.ok) {
      console.error("Error al obtener materiales desde la API");
      return;
    }

    const materiales = await respuesta.json();
    LimpiarModal();

    const bodyMateriales = document.getElementById("tbody-materiales");
    if (!bodyMateriales) return;
    
    bodyMateriales.innerHTML = "";

    materiales.forEach((material) => {
      const precioCostoNum = Number(material.precioCosto) || 0;
      const precioTexto = precioCostoNum.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS"
      });

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${material.descripcion || ''}</td>
        <td>${material.rubroNombre || material.rubro?.descripcion || 'Sin Rubro'}</td> 
        <td class="text-end">${precioTexto}</td>
        <td class="text-center columnaBtn">
          <button class="btn btn-editar" title='Editar' onclick="AbrirModalEditar(${material.materialID})">
            <i class="fa-solid fa-pen"></i>
          </button>
        </td>
        <td class="text-center columnaBtn">
          <button class="btn btn-eliminar" title='Eliminar' onclick="Eliminar(${material.materialID})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>`;

      bodyMateriales.appendChild(tr);
    });
  } catch (error) {
    console.error("Error en ObtenerMateriales:", error);
  }
}

// 3. EDITAR MATERIAL
async function AbrirModalEditar(id) {
  try {
    const respuesta = await fetch(`${linkApi}/Materiales/${id}`);
    if (!respuesta.ok) throw new Error("No se pudo obtener el material");

    const material = await respuesta.json();

    document.getElementById("materialID").value = material.materialID;
    document.getElementById("materialDescripcion").value = material.descripcion;
    document.getElementById("precioCosto").value = material.precioCosto;

    // Cargar los rubros y seleccionar el del material activo
    await ObtenerRubros(material.rubroID);

    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalMaterial'));
    modal.show();

  } catch (error) {
    console.error("Error en AbrirModalEditar:", error);
  }
}

// 4. GUARDAR (Sincronizado con onclick="GuardarMaterial()" del HTML)
async function GuardarMaterial() {
  const form = document.querySelector(".formMaterial");
  if (!validarCamposRequeridos(form)) return;

  const materialID = parseInt(document.getElementById("materialID").value) || 0;
  const rubroID = parseInt(document.getElementById("selectRubro").value);
  const descripcion = document.getElementById("materialDescripcion").value.trim();
  const precioCosto = parseFloat(document.getElementById("precioCosto").value) || 0;

  if (!rubroID) {
    Swal.fire("Atención", "Debe seleccionar un rubro válido", "warning");
    return;
  }

  if (precioCosto <= 0) {
    Swal.fire("Atención", "El precio de costo debe ser mayor a cero.", "warning");
    return;
  }

  const materialDTO = {
    materialID: materialID,
    rubroID: rubroID,
    descripcion: descripcion,
    precioCosto: precioCosto
  };

  try {
    let respuesta;
    if (materialID > 0) {
      // PUT (Editar)
      respuesta = await fetch(`${linkApi}/Materiales/${materialID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(materialDTO)
      });
    } else {
      // POST (Crear)
      respuesta = await fetch(`${linkApi}/Materiales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(materialDTO)
      });
    }

    if (!respuesta.ok) throw new Error("Error al procesar la solicitud");

    await ObtenerMateriales();

  } catch (error) {
    console.error("Error al guardar:", error);
    Swal.fire("Error", "No se pudo guardar el registro en la base de datos", "error");
  }
}

// 5. ELIMINAR MATERIAL
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
    const respuesta = await fetch(`${linkApi}/Materiales/${id}`, {
      method: "DELETE"
    });

    if (!respuesta.ok) throw new Error("No se pudo eliminar el material");

    await Swal.fire({
      icon: "success",
      iconColor: "#e6b000",
      title: "Eliminado",
      text: "El registro fue eliminado correctamente",
      timer: 1500,
      showConfirmButton: false
    });

    ObtenerMateriales();

  } catch (error) {
    console.error("Error en Eliminar:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo eliminar el material",
      confirmButtonColor: "#752900"
    });
  }
}

// 6. VALIDACIÓN Y LIMPIEZA
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
  document.getElementById("materialID").value = "0";
  document.getElementById("materialDescripcion").value = "";
  document.getElementById("precioCosto").value = "";
  
  const select = document.getElementById("selectRubro");
  if (select) select.selectedIndex = 0;

  // Ocultar mensajes de error
  document.querySelectorAll(".error-texto").forEach(e => e.style.display = "none");
}

// 7. INICIALIZACIÓN
async function InicializarVistaMateriales() {
  await ObtenerRubros();
  await ObtenerMateriales();
}

// Ejecutar flujo de carga
InicializarVistaMateriales();