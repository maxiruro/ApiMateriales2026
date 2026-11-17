
const selectRubro = document.getElementById("selectRubro");
const selectMaterial = document.getElementById("selectMaterial");
const selectProducto = document.getElementById("selectProducto");
const mensaje = document.getElementById("mensaje");

// 1. Cargar los rubros al iniciar
document.addEventListener("DOMContentLoaded", ObtenerRubros);

async function ObtenerRubros() {
    try {
        const respuesta = await fetch(`${linkApi}/Rubros`);

        if (!respuesta.ok) {
            throw new Error("Error al obtener los rubros");
        }

        const rubros = await respuesta.json();

        selectRubro.innerHTML =
            '<option value="0">Seleccione un rubro</option>';

        rubros.forEach(rubro => {
            const opcion = document.createElement("option");

            opcion.value = rubro.rubroID ?? rubro.RubroID;
            opcion.textContent = rubro.descripcion ?? rubro.Descripcion;

            selectRubro.appendChild(opcion);
        });

    } catch (error) {
        mostrarMensaje(error.message, true);
    }
}

// 2. Al elegir un rubro, cargar sus materiales
selectRubro.addEventListener("change", ObtenerMaterialesPorRubro);

async function ObtenerMaterialesPorRubro() {
    const rubroId = Number(selectRubro.value);

    // Reiniciar los selects dependientes
    selectMaterial.innerHTML =
        '<option value="0">Seleccione un material</option>';

    selectProducto.innerHTML =
        '<option value="0">Seleccione un producto</option>';

    selectMaterial.disabled = true;
    selectProducto.disabled = true;

    if (rubroId === 0) return;

    try {
        const respuesta = await fetch(
            `${linkApi}/Rubros/ObtenerMaterialesPorRubro/${rubroId}`
        );

        if (!respuesta.ok) {
            throw new Error("Error al obtener los materiales");
        }

        const materiales = await respuesta.json();

        materiales.forEach(material => {
            const opcion = document.createElement("option");

            opcion.value = material.materialID ?? material.MaterialID;
            opcion.textContent = material.descripcion ?? material.Descripcion;

            selectMaterial.appendChild(opcion);
        });

        selectMaterial.disabled = materiales.length === 0;

        if (materiales.length === 0) {
            mostrarMensaje("El rubro no tiene materiales.", false);
        } else {
            mostrarMensaje("", false);
        }

    } catch (error) {
        mostrarMensaje(error.message, true);
    }
}

// 3. Al elegir un material, cargar los productos que lo utilizan
selectMaterial.addEventListener("change", ObtenerProductosPorMaterial);

async function ObtenerProductosPorMaterial() {
    const materialId = Number(selectMaterial.value);

    selectProducto.innerHTML =
        '<option value="0">Seleccione un producto</option>';

    selectProducto.disabled = true;

    if (materialId === 0) return;

    try {
        const respuesta = await fetch(
            `${linkApi}/Rubros/ObtenerProductosPorMaterial/${materialId}`
        );

        if (!respuesta.ok) {
            throw new Error("Error al obtener los productos");
        }

        const productos = await respuesta.json();

        productos.forEach(producto => {
            const opcion = document.createElement("option");

            opcion.value = producto.productoID ?? producto.ProductoID;
            opcion.textContent =
                producto.productoNombre ?? producto.ProductoNombre;

            selectProducto.appendChild(opcion);
        });

        selectProducto.disabled = productos.length === 0;

        if (productos.length === 0) {
            mostrarMensaje(
                "No hay productos asociados a este material.",
                false
            );
        } else {
            mostrarMensaje("", false);
        }

    } catch (error) {
        mostrarMensaje(error.message, true);
    }
}

function mostrarMensaje(texto, esError) {
    mensaje.textContent = texto;
    mensaje.className = texto
        ? (esError ? "alert alert-danger" : "alert alert-info")
        : "";
}
