async function ObtenerMaterialesPorProducto() {
    try {
        const res = await fetch(`${linkApi}/Productos/materialesPorProducto`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!res.ok) throw new Error(`Error: ${res.status}`);

        const productos = await res.json();
        const tbody = document.querySelector("#tablaProductos tbody");
        tbody.innerHTML = "";

        let htmlContent = "";

        productos.forEach(producto => {
            // 1. Fila Principal (Coincide con las columnas del <thead>)
            htmlContent += `
                <tr class="table-primary text-uppercase fw-bold">
                    <td>${producto.descripcion}</td>
                    <td class="text-end">$${producto.costoTotal}</td>
                    <td class="text-center">${producto.porcentajeGanancia}%</td>
                    <td class="text-end">$${producto.precioVenta}</td>
                </tr>
            `;

            const materiales = producto.listadoMateriales || [];

            if (materiales.length > 0) {
                // 2. Subencabezado de Materiales
                htmlContent += `
                    <tr class="table-secondary small text-muted text-uppercase fw-bold">
                        <th class="ps-4">- Material</th>
                        <th class="text-end">Costo Unit.</th>
                        <th class="text-center">Cantidad</th>
                        <th class="text-end">Subtotal</th>
                    </tr>
                `;

                // 3. Filas del Subnivel (Materiales)
                materiales.forEach(material => {
                    htmlContent += `
                        <tr class=" small">
                            <td class="ps-5 text-muted">~${material.descripcion}</td>
                            <td class="text-end text-muted">$${material.precioCostoUnitario}</td>
                            <td class="text-center text-muted">${material.cantidad}</td>
                            <td class="text-end text-muted">$${material.subtotal}</td>
                        </tr>
                    `;
                });
            } else {
                htmlContent += `
                    <tr>
                        <td colspan="4" class="ps-4 text-muted fst-italic small">Sin materiales asignados</td>
                    </tr>
                `;
            }
        });

        tbody.innerHTML = htmlContent;

    } catch (error) {
        console.error("Error al cargar el informe:", error);
    }
}

ObtenerMaterialesPorProducto();