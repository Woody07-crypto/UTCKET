// add.js - Versión corregida con todos los imports
import { db } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log("add.js cargado correctamente");

// ========== FUNCIONES PARA CARGAR DATOS EXISTENTES ==========

// Cargar empleados existentes
async function cargarEmpleados() {
    const container = document.getElementById('empleados-lista');
    if (!container) return;
    
    console.log("Cargando empleados...");
    
    try {
        const querySnapshot = await getDocs(collection(db, 'Empleado'));
        console.log("Empleados obtenidos:", querySnapshot.size);
        
        if (querySnapshot.empty) {
            container.innerHTML = '<p class="empty-message">No hay empleados registrados</p>';
            return;
        }
        
        container.innerHTML = ''; 
        
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

// Cargar conciertos existentes
async function cargarConciertos() {
    const container = document.getElementById('conciertos-lista');
    if (!container) return;
    
    console.log("Cargando conciertos...");
    
    try {
        const querySnapshot = await getDocs(collection(db, 'Conciertos'));
        console.log("Conciertos obtenidos:", querySnapshot.size);
        
        if (querySnapshot.empty) {
            container.innerHTML = '<p class="empty-message">No hay conciertos registrados</p>';
            return;
        }
        
        container.innerHTML = '';
        
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

// ========== FUNCIONES PARA CREAR TARJETAS ==========

// Crear tarjeta de empleado
function crearTarjetaEmpleado(id, empleado) {
    const card = document.createElement('div');
    card.className = 'empleado-card';
    
    const iniciales = (empleado.Nombre?.[0] || '') + (empleado.Apellido?.[0] || '');
    
    card.innerHTML = `
        <div class="card-header">
            <div class="avatar">${iniciales}</div>
            <div class="card-header-info">
                <div class="card-title">${empleado.Nombre || 'Sin nombre'} ${empleado.Apellido || ''}</div>
                <div class="card-subtitle">${empleado.Puesto || 'N/A'}</div>
            </div>
        </div>
        <div class="card-body">
            <div class="card-info">
                <div class="info-icon">👤</div>
                <div class="info-content">
                    <div class="info-label">Usuario</div>
                    <div class="info-value">${empleado.Usuario || empleado.Carnet || 'N/A'}</div>
                </div>
            </div>
            <div class="card-info">
                <div class="info-icon">🆔</div>
                <div class="info-content">
                    <div class="info-label">Carnet</div>
                    <div class="info-value">${empleado.Carnet || 'N/A'}</div>
                </div>
            </div>
            <div class="card-info">
                <div class="info-icon">📧</div>
                <div class="info-content">
                    <div class="info-label">Email</div>
                    <div class="info-value">${empleado.Email || 'N/A'}</div>
                </div>
            </div>
            <div class="card-info">
                <div class="info-icon">✅</div>
                <div class="info-content">
                    <div class="info-label">Estado</div>
                    <span class="status-badge status-active">Activo</span>
                </div>
            </div>
            <div class="card-actions">
                <button class="btn-editar" onclick="cargarEmpleadoParaEditar('${id}')">✏️ Editar</button>
                <button class="btn-eliminar" onclick="eliminarEmpleado('${id}')">🗑️ Eliminar</button>
            </div>
        </div>
    `;
    
    return card;
}

// Crear tarjeta de concierto
function crearTarjetaConcierto(id, concierto) {
    const card = document.createElement('div');
    card.className = 'concierto-card';
    
    let localidadesHTML = '';
    if (concierto.Localidades && Array.isArray(concierto.Localidades)) {
        concierto.Localidades.forEach((localidad, index) => {
            const cantidad = concierto['Cantidad'] && concierto['Cantidad'][index] 
                ? concierto['Cantidad'][index] 
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
        <div class="card-header">
            <div class="card-title">${concierto.Artista || 'Sin nombre'}</div>
            <div class="card-subtitle">${concierto.Lugar || 'N/A'}</div>
        </div>
        <div class="card-body">
            <div class="card-info">
                <div class="info-label">📍 Lugar</div>
                <div class="info-value">${concierto.Lugar || 'N/A'}</div>
            </div>
            <div class="card-info">
                <div class="info-label">📅 Fecha</div>
                <div class="info-value">${formatearFecha(concierto.Fecha)}</div>
            </div>
            <div class="card-info">
                <div class="info-label">🎫 Localidades</div>
                <div class="localidades-grid">
                    ${localidadesHTML || '<p style="color: #999;">No hay localidades disponibles</p>'}
                </div>
            </div>
            <div class="card-actions">
                <button class="btn-editar" onclick="cargarConciertoParaEditar('${id}')">✏️ Editar</button>
                <button class="btn-eliminar" onclick="eliminarConcierto('${id}')">🗑️ Eliminar</button>
            </div>
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

// ========== FUNCIONES DE ELIMINACIÓN ==========

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

// ========== FORMULARIO DE CONCIERTO ==========

const formConcierto = document.getElementById('form-concierto');

if (formConcierto) {
    console.log("Formulario de concierto encontrado");
    
    formConcierto.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log("Intentando agregar concierto...");
        
        try {
            // Obtener valores del formulario
            const artista = document.getElementById('artist-name').value.trim();
            const fecha = document.getElementById('concert-date').value;
            const lugar = document.getElementById('concert-venue').value.trim();
            const localidadesRaw = document.getElementById('venue-seats').value;
            const cantidadesRaw = document.getElementById('ticket-quantity').value;
            const preciosRaw = document.getElementById('ticket-prices').value;
            
            // Procesar arrays (separados por coma)
            const localidades = localidadesRaw.split(',').map(s => s.trim()).filter(s => s);
            const cantidades = cantidadesRaw.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
            const precios = preciosRaw.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
            
            // Validaciones
            if (!artista || !fecha || !lugar) {
                alert('❌ Por favor completa todos los campos obligatorios');
                return;
            }
            
            if (localidades.length === 0 || cantidades.length === 0 || precios.length === 0) {
                alert('❌ Por favor ingresa al menos una localidad, cantidad y precio');
                return;
            }
            
            if (localidades.length !== cantidades.length || localidades.length !== precios.length) {
                alert('❌ El número de localidades, cantidades y precios debe coincidir');
                return;
            }
            
            // Crear objeto de datos
            const conciertoData = {
                Artista: artista,
                Fecha: fecha,
                Lugar: lugar,
                Localidades: localidades,
                'Cantidad': cantidades,
                Precios: precios,
                fechaCreacion: serverTimestamp()
            };
            
            console.log("Datos a enviar:", conciertoData);
            
            // Guardar en Firestore
            const docRef = await addDoc(collection(db, 'Conciertos'), conciertoData);
            
            console.log("Concierto agregado con ID:", docRef.id);
            alert('¡Concierto agregado exitosamente!');
            
            // Limpiar formulario
            this.reset();
            
            // Recargar lista
            cargarConciertos();
            
        } catch (error) {
            console.error('❌ Error al agregar concierto:', error);
            alert('❌ Error al agregar concierto: ' + error.message);
        }
    });
}

// ========== FORMULARIO DE EMPLEADO ==========

const formEmpleado = document.getElementById('form-empleado');

if (formEmpleado) {
    console.log("Formulario de empleado encontrado");
    
    formEmpleado.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log("Intentando agregar empleado...");
        
        try {
            // Obtener valores del formulario
            const nombre = document.getElementById('emp-first').value.trim();
            const apellido = document.getElementById('emp-last').value.trim();
            const carnet = document.getElementById('emp-carnet').value.trim();
            const puesto = document.getElementById('emp-puesto').value.trim();
            const email = document.getElementById('emp-email').value.trim();
            const password = document.getElementById('emp-password').value;
            
            // Validaciones
            if (!nombre || !apellido || !carnet || !puesto || !email || !password) {
                alert('❌ Por favor completa todos los campos');
                return;
            }
            
            if (password.length < 8) {
                alert('❌ La contraseña debe tener al menos 8 caracteres');
                return;
            }
            
            // Crear objeto de datos
            const empleadoData = {
                Nombre: nombre,
                Apellido: apellido,
                Carnet: carnet,
                Puesto: puesto,
                Email: email,
                Usuario: email.split('@')[0], // Generar usuario del email
                Password: password, 
                fechaCreacion: serverTimestamp()
            };
            
            console.log("Datos a enviar:", { ...empleadoData, Password: '****' }); 
            
            // Guardar en Firestore
            const docRef = await addDoc(collection(db, 'Empleado'), empleadoData);
            
            console.log("Empleado agregado con ID:", docRef.id);
            alert('¡Empleado agregado exitosamente!');
            
            // Limpiar formulario
            this.reset();
            
            // Recargar lista
            cargarEmpleados();
            
        } catch (error) {
            console.error('❌ Error al agregar empleado:', error);
            alert('❌ Error al agregar empleado: ' + error.message);
        }
    });
}

// ========== INICIALIZACIÓN ==========

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM cargado, iniciando carga de datos...");
    cargarConciertos();
    cargarEmpleados();
});