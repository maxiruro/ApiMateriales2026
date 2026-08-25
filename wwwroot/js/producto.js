async function ObtenerMateriales(idMaterialSeleccionado = null) {
  try {
    const respuesta = await fetch(`${linkApi}/Materiales`);
    if (!respuesta.ok) throw new Error("Error al obtener materiales");

    const materiales = await respuesta.json();
    const comboSelect = document.getElementById("selectMaterial");
    if (!comboSelect) return;

    let opciones = '<option value="" disabled selected>-- Seleccione un Material --</option>';
    
    materiales.forEach((material) => {
      // Compatibilidad con C# CamelCase (rubroID / rubroId) y PascalCase
      const id = material.materialID ?? material.materialId ?? material.MaterialID;
      const texto = material.descripcion ?? material.Descripcion;
      
      opciones += `<option value="${id}">${texto}</option>`;
    });

    comboSelect.innerHTML = opciones;

    // Si viene un ID para seleccionar (modo edición)
    if (idMaterialSeleccionado) {
      comboSelect.value = idMaterialSeleccionado;
    }
  } catch (error) {
    console.error("Error en ObtenerMateriales:", error);
  }
}

async function ObtenerProductos() {
  try {
    // Cerrar modal si está abierto
    const modalElement = document.getElementById('modalProducto');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }

    const respuesta = await fetch(`${linkApi}/Productos`);
    if (!respuesta.ok) {
      console.error("Error al obtener productos desde la API");
      return;
    }

    const productos = await respuesta.json();
    LimpiarModal();

    const bodyProductos = document.getElementById("tbody-productos");
    if (!bodyProductos) return;
    
    bodyProductos.innerHTML = "";

    productos.forEach((producto) => {

      const precioCostoNum = Number(producto.costoTotal) || 0;
      const precioTexto = precioCostoNum.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS"
      });

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${producto.descripcion || ''}</td>
        <td class="text-end">${precioTexto}</td>
        <td class="text-center columnaBtn">
          <button class="btn btn-editar" title='Composición' onclick="AbrirModalComposicion(${producto.productoID})">
            <i class="fa-solid fa-list"></i>
        </button>
        <td class="text-center columnaBtn">
          <button class="btn btn-editar" title='Editar' onclick="AbrirModalEditar(${producto.productoID})">
            <i class="fa-solid fa-pen"></i>
          </button>
        </td>
        <td class="text-center columnaBtn">
          <button class="btn btn-eliminar" title='Eliminar' onclick="Eliminar(${producto.productoID})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>`;

      bodyProductos.appendChild(tr);
    });
  } catch (error) {
    console.error("Error en ObtenerProductos:", error);
  }
}

async function AbrirModalEditar(id) {
  try {
    const respuesta = await fetch(`${linkApi}/Productos/${id}`);
    if (!respuesta.ok) throw new Error("No se pudo obtener el producto");

    const producto = await respuesta.json();

    document.getElementById("productoID").value = producto.productoID;
    document.getElementById("productoDescripcion").value = producto.descripcion;

    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalProducto'));
    modal.show();

  } catch (error) {
    console.error("Error en AbrirModalEditar:", error);
  }
}

async function GuardarProducto() {
  const form = document.querySelector(".formProducto");
  if (!validarCamposRequeridos(form)) return;

  const productoID = parseInt(document.getElementById("productoID").value) || 0;
  const descripcion = document.getElementById("productoDescripcion").value.trim();

  const productoDTO = {
    productoID: productoID,
    descripcion: descripcion,
  };

  try {
    let respuesta;
    if (productoID > 0) {
      // PUT (Editar)
      respuesta = await fetch(`${linkApi}/Productos/${productoID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productoDTO)
      });
    } else {
      // POST (Crear)
      respuesta = await fetch(`${linkApi}/Productos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productoDTO)
      });
    }

    if (!respuesta.ok) throw new Error("Error al procesar la solicitud");

    await ObtenerProductos();

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
    const respuesta = await fetch(`${linkApi}/Productos/${id}`, {
      method: "DELETE"
    });

    if (!respuesta.ok) throw new Error("No se pudo eliminar el producto");

    await Swal.fire({
      icon: "success",
      iconColor: "#e6b000",
      title: "Eliminado",
      text: "El registro fue eliminado correctamente",
      timer: 1500,
      showConfirmButton: false
    });

    ObtenerProductos();

  } catch (error) {
    console.error("Error en Eliminar:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo eliminar el producto",
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
  document.getElementById("productoID").value = "0";
  document.getElementById("productoDescripcion").value = "";

  // Ocultar mensajes de error
  document.querySelectorAll(".error-texto").forEach(e => e.style.display = "none");
}

// 7. INICIALIZACIÓN
async function InicializarVistaProductos() {
  await ObtenerProductos();
}

// Ejecutar flujo de carga
InicializarVistaProductos();

async function AbrirModalComposicion(id) {
  try {
    const respuesta = await fetch(`${linkApi}/Productos/${id}`);
    if (!respuesta.ok) throw new Error("No se pudo obtener el producto");

    const producto = await respuesta.json();

    document.getElementById("materialProductoID").value = producto.productoID;
    document.getElementById('productoDescripcion').innerText = producto.Descripcion;

    await ObtenerMateriales(producto.materialID);
    await CargarTablaMateriales(id);

    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalMaterialesProducto'));
    modal.show();

  } catch (error) {
    console.error("Error en AbrirModalComposicion:", error);
  }
}

async function CargarTablaMateriales(productoID) {
  try {
    const respuesta = await fetch(`${linkApi}/Productos/ObtenerMaterialesProducto/${productoID}`);
    if (!respuesta.ok) throw new Error("Error al obtener materiales");

    const materiales = await respuesta.json();
    const tbody = document.getElementById("tbody-materiales-producto");
    tbody.innerHTML = ""; // Limpiamos la tabla antes de cargar los nuevos datos

    materiales.forEach(item => {
      tbody.innerHTML += `
        <tr>
          <td>${item.materialNombre}</td>
          <td class="text-center">$${item.precioCostoUnitario.toFixed(2)}</td>
          <td class="text-center">${item.cantidad}</td>
          <td class="text-center">$${item.subtotal.toFixed(2)}</td>
          <td class="text-center">
            <button class="btn btn-eliminar" title='Eliminar material' onclick="EliminarMaterial(${item.materialProductoID})">
            <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });

  } catch (error) {
    console.error("Error al cargar materiales:", error);
  }
}

async function EliminarMaterial(materialProductoId) {
  if (!confirm("¿Está seguro de eliminar este material del producto?")) {
    return;
  }

  // 1. Obtenemos el ID del producto que tenemos guardado en el input hidden del modal
    const productoID = document.getElementById("productoID").value;

  try {
    const respuesta = await fetch(`${linkApi}/Productos/EliminarMaterialProducto/${materialProductoId}`, {
      method: "DELETE"
    });

    if (!respuesta.ok) {
      throw new Error("No se pudo eliminar el material");
    }

    const resultado = await respuesta.json();

    // 2. Volvemos a cargar la tabla para reflejar el cambio
    await CargarTablaMateriales(productoID);

     if (typeof ObtenerProductos === "function") {
      await ObtenerProductos(); 
    }

  } catch (error) {
    console.error("Error al eliminar el material:", error);
  }
}

async function AgregarMaterialProducto() {
  // 1. Obtener valores de los campos del modal
  const productoID = document.getElementById("materialProductoID").value;
  const selectMaterial = document.getElementById("selectMaterial");
  const materialID = selectMaterial.value;
  const cantidadInput = document.getElementById("cantidad");
  const cantidad = parseInt(cantidadInput.value);

  // 2. Validaciones cliente
  if (!materialID) {
    alert("Por favor, seleccione un material.");
    selectMaterial.focus();
    return;
  }

  if (isNaN(cantidad) || cantidad <= 0) {
    alert("Por favor, ingrese una cantidad válida mayor a 0.");
    cantidadInput.focus();
    return;
  }

  // 3. Crear el objeto DTO para enviar al backend
  const dto = {
    productoID: parseInt(productoID),
    materialID: parseInt(materialID),
    cantidad: cantidad
  };

  try {
    // 4. Hacer la petición POST a la API
    const respuesta = await fetch(`${linkApi}/Productos/AgregarMaterial`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dto)
    });

    if (!respuesta.ok) {
      const errorTexto = await respuesta.text();
      throw new Error(errorTexto || "Error al agregar el material");
    }

    const resultado = await respuesta.json();

    // 5. Limpiar los controles del formulario para el siguiente ingreso
    selectMaterial.value = "";
    cantidadInput.value = "";

    // 6. Recargar la tabla de materiales en el modal
    await CargarTablaMateriales(productoID);

    if (typeof ObtenerProductos === "function") {
      await ObtenerProductos(); // Reemplaza 'CargarProductos()' por el nombre real de tu función principal
    }

  } catch (error) {
    console.error("Error en AgregarMaterialProducto:", error);
    alert(`Ocurrió un error: ${error.message}`);
  }
}