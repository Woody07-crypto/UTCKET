// calendario.js - Versión mejorada para usar las URLs de imagen de Firebase
import { db } from './firebase-config.js';
import { 
    collection, 
    getDocs, 
    query, 
    where, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log("Calendario.js cargado correctamente");

document.addEventListener("DOMContentLoaded", async function () {
    console.log("Inicializando calendario...");

    // Configuración del menú móvil
    const menuToggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".menu");
    const menuOverlay = document.querySelector(".menu-overlay");

    if (menuToggle && menu && menuOverlay) {
        menuToggle.addEventListener("click", () => {
            menu.classList.add("menu-open");
            menuOverlay.classList.add("overlay-open");
        });

        menuOverlay.addEventListener("click", () => {
            menu.classList.remove("menu-open");
            menuOverlay.classList.remove("overlay-open");
        });
    }

    // Elementos del DOM
    const eventosLista = document.getElementById("eventos-lista");
    const formBusqueda = document.getElementById("form-busqueda-calendario");
    const fArtista = document.getElementById("artista");
    const fCiudad = document.getElementById("ciudad");
    const fFecha = document.getElementById("fecha");

    let todosLosEventos = [];

    // Función para cargar eventos desde Firestore
    async function cargarEventos() {
        try {
            eventosLista.innerHTML = '<div class="cargando">Cargando eventos...</div>';
            
            const querySnapshot = await getDocs(collection(db, "Conciertos"));
            
            todosLosEventos = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log("Eventos cargados:", todosLosEventos);
            mostrarEventos(todosLosEventos);

        } catch (error) {
            console.error("❌ Error cargando conciertos:", error);
            mostrarEventosEstaticos();
        }
    }

    // Función para mostrar eventos en el calendario
    function mostrarEventos(lista) {
        if (!eventosLista) return;
        
        eventosLista.innerHTML = "";

        if (lista.length === 0) {
            eventosLista.innerHTML = `
                <div class="sin-resultados">
                    <p>No se encontraron eventos con los filtros seleccionados.</p>
                    <button id="btn-mostrar-todos" class="btn-buscar">Mostrar todos los eventos</button>
                </div>
            `;
            
            document.getElementById('btn-mostrar-todos').addEventListener('click', function() {
                cargarEventos();
            });
            return;
        }

        // Ordenar eventos por fecha
        lista.sort((a, b) => {
            const fechaA = a.Fecha?.toDate ? a.Fecha.toDate() : new Date(a.Fecha);
            const fechaB = b.Fecha?.toDate ? b.Fecha.toDate() : new Date(b.Fecha);
            return fechaA - fechaB;
        });

        lista.forEach(evento => {
            // USAR LOS CAMPOS CORRECTOS DE FIREBASE (con mayúsculas)
            const artista = evento.Artista || "Artista desconocido";
            const lugar = evento.Lugar || "Lugar no especificado";
            
            // ✅ USAR EL CAMPO 'Imagen' DE FIREBASE
            const imagen = evento.imagen || 'img/placeholder.jpg';
            
            // Formatear fecha
            const fechaEvento = evento.Fecha?.toDate ? evento.Fecha.toDate() : new Date(evento.Fecha);
            const fechaFormateada = formatearFecha(fechaEvento);

            // Calcular precios si existen
            let precioTexto = "Precio no disponible";
            if (evento.Precios && Array.isArray(evento.Precios) && evento.Precios.length > 0) {
                const precioMin = Math.min(...evento.Precios);
                const precioMax = Math.max(...evento.Precios);
                precioTexto = `$${precioMin} - $${precioMax}`;
            }

            // Crear tarjeta de evento
            const eventoCard = document.createElement("div");
            eventoCard.classList.add("evento-card");
            eventoCard.innerHTML = `
                <img src="${imagen}" alt="${artista}" class="evento-imagen" 
                     onerror="this.src='img/placeholder.jpg'">
                <div class="evento-info">
                    <h3 class="evento-titulo">${artista}</h3>
                    <div class="evento-detalles">
                        <div class="evento-detalle">
                            ${lugar}
                        </div>
                        <div class="evento-detalle">
                            ${fechaFormateada}
                        </div>
                        ${evento.Localidades && Array.isArray(evento.Localidades) ? `
                        <div class="evento-detalle">
                            ${evento.Localidades.join(', ')}
                        </div>
                        ` : ''}
                    </div>
                    <div class="evento-precio">
                        ${precioTexto}
                    </div>
                    <button class="evento-btn" data-event-id="${evento.id}">Comprar Boleto</button>
                </div>
            `;

            // Agregar evento al botón de compra
            const botonCompra = eventoCard.querySelector('.evento-btn');
            botonCompra.addEventListener('click', function() {
                alert(`Redirigiendo a compra del evento: ${artista}`);
                // window.location.href = `compra.html?evento=${evento.id}`;
            });

            eventosLista.appendChild(eventoCard);
        });

        // Actualizar contador de resultados
        actualizarContadorResultados(lista.length);
    }

    // Función para formatear fecha
    function formatearFecha(fecha) {
        if (!(fecha instanceof Date) || isNaN(fecha)) {
            return 'Fecha no especificada';
        }
        
        const opciones = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return fecha.toLocaleDateString('es-ES', opciones);
    }

    // Función para actualizar contador de resultados
    function actualizarContadorResultados(cantidad) {
        const tituloResultados = document.querySelector('.resultados-calendario h3');
        if (tituloResultados) {
            tituloResultados.textContent = `Eventos Encontrados (${cantidad})`;
        }
    }

    // Función de fallback
    function mostrarEventosEstaticos() {
        if (eventosLista) {
            eventosLista.innerHTML = `
                <div class="error-carga">
                    <p>No se pudieron cargar los eventos desde la base de datos.</p>
                    <p>Por favor, intenta recargar la página.</p>
                </div>
            `;
        }
    }

    // Función para filtrar eventos
    function filtrarEventos(e) {
        e.preventDefault();

        let filtrados = todosLosEventos;

        // Mostrar estado de carga
        eventosLista.innerHTML = '<div class="cargando">Buscando eventos...</div>';

        setTimeout(() => {
            // Filtro por artista
            if (fArtista && fArtista.value.trim() !== "") {
                const busqueda = fArtista.value.trim().toLowerCase();
                filtrados = filtrados.filter(evento => {
                    const artista = evento.Artista || "";
                    return artista.toLowerCase().includes(busqueda);
                });
            }

            // Filtro por ciudad (busca en el campo Lugar)
            if (fCiudad && fCiudad.value.trim() !== "") {
                const busqueda = fCiudad.value.trim().toLowerCase();
                filtrados = filtrados.filter(evento => {
                    const lugar = evento.Lugar || "";
                    return lugar.toLowerCase().includes(busqueda);
                });
            }

            // Filtro por fecha
            if (fFecha && fFecha.value !== "") {
                const fechaFiltro = new Date(fFecha.value);
                filtrados = filtrados.filter(evento => {
                    const fechaEvento = evento.Fecha?.toDate ? evento.Fecha.toDate() : new Date(evento.Fecha);
                    if (!(fechaEvento instanceof Date) || isNaN(fechaEvento)) return false;

                    return fechaEvento.toDateString() === fechaFiltro.toDateString();
                });
            }

            mostrarEventos(filtrados);
        }, 100);
    }

    // Configurar el formulario de búsqueda
    if (formBusqueda) {
        formBusqueda.addEventListener("submit", filtrarEventos);
        
        // Botón para limpiar filtros
        const btnLimpiar = formBusqueda.querySelector('.btn-limpiar');
        if (btnLimpiar) {
            btnLimpiar.addEventListener('click', function() {
                formBusqueda.reset();
                cargarEventos();
            });
        }
    }

    // Cargar eventos al iniciar
    cargarEventos();
});