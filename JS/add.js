import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log("add.js cargado correctamente");


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
            
            
            const conciertoData = {
                Artista: artista,
                Fecha: fecha,
                Lugar: lugar,
                Localidades: localidades,
                'Cantidad de ticket': cantidades,
                Precios: precios,
                fechaCreacion: serverTimestamp()
            };
            
            console.log("Datos a enviar:", conciertoData);
            
            
            const docRef = await addDoc(collection(db, 'Conciertos'), conciertoData);
            
            console.log("Concierto agregado con ID:", docRef.id);
            alert('¡Concierto agregado exitosamente!');
            
           
            this.reset();
            
            
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error al agregar concierto:', error);
            alert('❌ Error al agregar concierto: ' + error.message);
        }
    });
}


const formEmpleado = document.getElementById('form-empleado');

if (formEmpleado) {
    console.log("Formulario de empleado encontrado");
    
    formEmpleado.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log("Intentando agregar empleado...");
        
        try {
            
            const nombre = document.getElementById('emp-first').value.trim();
            const apellido = document.getElementById('emp-last').value.trim();
            const carnet = document.getElementById('emp-carnet').value.trim();
            const password = document.getElementById('emp-password').value;
            
            
            if (!nombre || !apellido || !carnet || !password) {
                alert('❌ Por favor completa todos los campos');
                return;
            }
            
            if (password.length < 8) {
                alert('❌ La contraseña debe tener al menos 8 caracteres');
                return;
            }
            
            
            const empleadoData = {
                Nombre: nombre,
                Apellido: apellido,
                Carnet: carnet,
                Password: password, 
                fechaCreacion: serverTimestamp()
            };
            
            console.log("Datos a enviar:", { ...empleadoData, Password: '****' }); 
            
            
            const docRef = await addDoc(collection(db, 'Empleado'), empleadoData);
            
            console.log("Empleado agregado con ID:", docRef.id);
            alert('¡Empleado agregado exitosamente!');
            
            
            this.reset();
            
            
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error al agregar empleado:', error);
            alert('❌ Error al agregar empleado: ' + error.message);
        }
    });
}

// Si no se encuentra ningún formulario
if (!formConcierto && !formEmpleado) {
    console.warn("No se encontró ningún formulario en esta página");
}