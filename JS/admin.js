import { db } from './firebase-config.js';
import { collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log("Iniciando admin.js...");

// Cargar conciertos al iniciar la página
async function cargarConciertos() {
    const container = document.getElementById('conciertos-lista');
    console.log("Cargando conciertos...");
    
    try {
        const querySnapshot = await getDocs(collection(db, 'Conciertos'));
        console.log("Conciertos obtenidos:", querySnapshot.size);
        
        if (querySnapshot.empty) {
            container.innerHTML = '<p class="empty-message">No hay conciertos registrados</p>';
            return;
        }
        
        container.innerHTML = ''; // Limpiar contenedor
        
        querySnapshot.forEach((docSnapshot) => {
            const concierto = docSnapshot.data();
            console.log("Concierto:", docSnapshot.id, concierto);
            const conciertoCard = crearTarjetaConcierto(docSnapshot.id, concierto);
            container.appendChild(conciertoCard);
        });
        
    } catch (error) {
        console.error('❌ Error al cargar conciertos:', error);
        container.innerHTML = '<p class="empty-message">Error al cargar conciertos: ' + error.message + '</p>';
    }
}

// Cargar empleados al iniciar la página
async function cargarEmpleados() {
    const container = document.getElementById('empleados-lista');
    console.log("Cargando empleados...");
    
    try {
        const querySnapshot = await getDocs(collection(db, 'Empleado'));
        console.log("Empleados obtenidos:", querySnapshot.size);
        
        if (querySnapshot.empty) {
            container.innerHTML = '<p class="empty-message">No hay empleados registrados</p>';
            return;
        }
        
        container.innerHTML = ''; // Limpiar contenedor
        
        querySnapshot.forEach((docSnapshot) => {
            const empleado = docSnapshot.data();
            console.log("Empleado:", docSnapshot.id, empleado);
            const empleadoCard = crearTarjetaEmpleado(docSnapshot.id, empleado);
            container.appendChild(empleadoCard);
        });
        
    } catch (error) {
        console.error('❌ Error al cargar empleados:', error);
        container.innerHTML = '<p class="empty-message">Error al cargar empleados: ' + error.message + '</p>';
    }
}

// Crear tarjeta de concierto
function crearTarjetaConcierto(id, concierto) {
    const card = document.createElement('div');
    card.className = 'concierto-card';
    
    // Manejar arrays de localidades y cantidades
    let localidadesHTML = '';
    if (concierto.Localidades && Array.isArray(concierto.Localidades)) {
        concierto.Localidades.forEach((localidad, index) => {
            const cantidad = concierto['Cantidad de ticket'] && concierto['Cantidad de ticket'][index] 
                ? concierto['Cantidad de ticket'][index] 
                : 'N/A';
            const precio = concierto.Precios && concierto.Precios[index] 
                ? `$${concierto.Precios[index]}` 
                : 'N/A';
            
            localidadesHTML += `
                <div class="localidad-item">
                    <strong>${localidad}:</strong> ${cantidad} tickets - ${precio}
                </div>
            `;
        });
    }
    
    card.innerHTML = `
        <h3>${concierto.Artista || 'Sin nombre'}</h3>
        <p><strong>Fecha:</strong> ${formatearFecha(concierto.Fecha)}</p>
        <p><strong>Lugar:</strong> ${concierto.Lugar || 'N/A'}</p>
        <div style="margin-top: 15px;">
            <p><strong>Localidades y Precios:</strong></p>
            ${localidadesHTML || '<p style="color: #999;">No hay localidades disponibles</p>'}
        </div>
        <button class="btn-eliminar" onclick="eliminarConcierto('${id}')">Eliminar</button>
    `;
    
    return card;
}

// Crear tarjeta de empleado
function crearTarjetaEmpleado(id, empleado) {
    const card = document.createElement('div');
    card.className = 'empleado-card';
    
    card.innerHTML = `
        <h3>${empleado.Nombre || 'Sin nombre'} ${empleado.Apellido || ''}</h3>
        <p><strong>Carnet:</strong> ${empleado.Carnet || 'N/A'}</p>
        <button class="btn-eliminar" onclick="eliminarEmpleado('${id}')">Eliminar</button>
    `;
    
    return card;
}

// Formatear fecha
function formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    
    try {
        // Si es un Timestamp de Firestore
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
        cargarEmpleados(); // Recargar lista
    } catch (error) {
        console.error('Error al eliminar empleado:', error);
        alert('❌ Error al eliminar empleado: ' + error.message);
    }
}

// Cargar datos al iniciar
console.log("⏳ Esperando DOMContentLoaded...");
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM cargado, iniciando carga de datos...");
    cargarConciertos();
    cargarEmpleados();
});