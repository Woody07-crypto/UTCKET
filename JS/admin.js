// admin.js - Usando firebase-config.js existente
import { db } from './firebase-config.js';
import { collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log("Iniciando admin.js...");

// Variables globales para estadísticas
let totalConciertos = 0;
let totalEmpleados = 0;
let proximosEventos = 0;
let ticketsVendidos = 0;

// FUNCIONES PARA CONCIERTOS 

// Cargar conciertos al iniciar la página
async function cargarConciertos() {
    const container = document.getElementById('conciertos-lista');
    console.log("Cargando conciertos...");
    
    try {
        const querySnapshot = await getDocs(collection(db, 'Conciertos'));
        console.log("Conciertos obtenidos:", querySnapshot.size);
        
        // Actualizar estadísticas
        totalConciertos = querySnapshot.size;
        if (document.getElementById('total-conciertos')) {
            document.getElementById('total-conciertos').textContent = totalConciertos;
        }
        if (document.getElementById('count-conciertos')) {
            document.getElementById('count-conciertos').textContent = totalConciertos;
        }
        
        // Calcular próximos eventos
        const hoy = new Date();
        proximosEventos = 0;
        querySnapshot.forEach((docSnapshot) => {
            const concierto = docSnapshot.data();
            const fechaConcierto = new Date(concierto.Fecha);
            if (fechaConcierto > hoy) {
                proximosEventos++;
            }
        });
        
        if (document.getElementById('proximos-eventos')) {
            document.getElementById('proximos-eventos').textContent = proximosEventos;
            document.getElementById('trend-eventos').textContent = `En los próximos 30 días`;
        }
        
        if (querySnapshot.empty) {
            if (container) container.innerHTML = '<p class="empty-message">No hay conciertos registrados</p>';
            return;
        }
        
        if (container) {
            container.innerHTML = '';
            
            // Mostrar solo los primeros 3 conciertos en el dashboard
            let contador = 0;
            querySnapshot.forEach((docSnapshot) => {
                if (contador < 3) {
                    const concierto = docSnapshot.data();
                    console.log("Concierto:", docSnapshot.id, concierto);
                    const conciertoCard = crearTarjetaConciertoDashboard(docSnapshot.id, concierto);
                    container.appendChild(conciertoCard);
                    contador++;
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Error al cargar conciertos:', error);
        if (container) container.innerHTML = '<p class="empty-message">Error al cargar conciertos: ' + error.message + '</p>';
    }
}

// Crear tarjeta de concierto para dashboard
function crearTarjetaConciertoDashboard(id, concierto) {
    const card = document.createElement('div');
    card.className = 'quick-card';
    
    card.innerHTML = `
        <div class="quick-card-title">${concierto.Artista || 'Sin nombre'}</div>
        <div class="quick-card-info">
            ${concierto.Lugar || 'N/A'}<br>
            <span>${formatearFecha(concierto.Fecha)}</span>
        </div>
    `;
    
    return card;
}

// FUNCIONES PARA EMPLEADOS

// Cargar empleados al iniciar la página
async function cargarEmpleados() {
    const container = document.getElementById('empleados-lista');
    console.log("Cargando empleados...");
    
    try {
        const querySnapshot = await getDocs(collection(db, 'Empleado'));
        console.log("Empleados obtenidos:", querySnapshot.size);
        
        // Actualizar estadísticas
        totalEmpleados = querySnapshot.size;
        if (document.getElementById('total-empleados')) {
            document.getElementById('total-empleados').textContent = totalEmpleados;
        }
        if (document.getElementById('count-empleados')) {
            document.getElementById('count-empleados').textContent = totalEmpleados;
        }
        if (document.getElementById('trend-empleados')) {
            document.getElementById('trend-empleados').textContent = `${querySnapshot.size} activos`;
        }
        
        if (querySnapshot.empty) {
            if (container) container.innerHTML = '<p class="empty-message">No hay empleados registrados</p>';
            return;
        }
        
        if (container) {
            container.innerHTML = ''; 
            
            // Mostrar solo los primeros 2 empleados en el dashboard
            let contador = 0;
            querySnapshot.forEach((docSnapshot) => {
                if (contador < 2) {
                    const empleado = docSnapshot.data();
                    console.log("Empleado:", docSnapshot.id, empleado);
                    const empleadoCard = crearTarjetaEmpleadoDashboard(docSnapshot.id, empleado);
                    container.appendChild(empleadoCard);
                    contador++;
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Error al cargar empleados:', error);
        if (container) container.innerHTML = '<p class="empty-message">Error al cargar empleados: ' + error.message + '</p>';
    }
}

// Crear tarjeta de empleado para dashboard
function crearTarjetaEmpleadoDashboard(id, empleado) {
    const card = document.createElement('div');
    card.className = 'quick-card';
    
    card.innerHTML = `
        <div class="quick-card-title">${empleado.Nombre || 'Sin nombre'} ${empleado.Apellido || ''}</div>
        <div class="quick-card-info">
            Usuario: <span>${empleado.Usuario || empleado.Carnet || 'N/A'}</span><br>
            Contraseña: <span>${empleado.Contraseña || 'N/A'}</span>
        </div>
    `;
    
    return card;
}

// ========== FUNCIONES UTILITARIAS ==========

// Formatear fecha
function formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    
    try {
        // Si es un timestamp de Firestore
        if (fecha.seconds) {
            const date = new Date(fecha.seconds * 1000);
            return date.toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        // Si es una cadena de fecha
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Error al formatear fecha:', error);
        return fecha.toString();
    }
}

// FUNCIONES DE ELIMINACIÓN 

// Eliminar concierto
window.eliminarConcierto = async function(id) {
    if (!confirm('¿Estás seguro de eliminar este concierto?')) return;
    
    try {
        await deleteDoc(doc(db, 'Conciertos', id));
        alert('Concierto eliminado exitosamente');
        cargarConciertos(); // Recargar lista
    } catch (error) {
        console.error('Error al eliminar concierto:', error);
        alert('❌ Error al eliminar concierto: ' + error.message);
    }
}

// Eliminar empleado
window.eliminarEmpleado = async function(id) {
    if (!confirm('¿Estás seguro de eliminar este empleado?')) return;
    
    try {
        await deleteDoc(doc(db, 'Empleado', id));
        alert('Empleado eliminado exitosamente');
        cargarEmpleados(); 
    } catch (error) {
        console.error('Error al eliminar empleado:', error);
        alert('❌ Error al eliminar empleado: ' + error.message);
    }
}

// FUNCIONES DE EDICIÓN 

// Editar concierto (redirige a la página de edición)
window.editarConcierto = function(id) {
    window.location.href = `add_conciertos.html?edit=${id}`;
}

// Editar empleado (redirige a la página de edición)
window.editarEmpleado = function(id) {
    window.location.href = `add_empleados.html?edit=${id}`;
}

// FUNCIONES DE ESTADÍSTICAS 

// Cargar estadísticas adicionales
async function cargarEstadisticas() {
    try {
        // Aquí puedes agregar lógica para calcular tickets vendidos
        // Por ahora, usaremos valores de ejemplo
        ticketsVendidos = 1200;
        if (document.getElementById('tickets-vendidos')) {
            document.getElementById('tickets-vendidos').textContent = '1.2K';
            document.getElementById('trend-tickets').textContent = '↑ 15% vs mes anterior';
        }
        
        // Actualizar tendencia de conciertos
        if (document.getElementById('trend-conciertos')) {
            document.getElementById('trend-conciertos').textContent = '↑ 3 este mes';
        }
        
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

// INICIALIZACIÓN

// Inicializar dashboard
console.log("⏳ Esperando DOMContentLoaded...");
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM cargado, iniciando carga de datos...");
    cargarConciertos();
    cargarEmpleados();
    cargarEstadisticas();
});