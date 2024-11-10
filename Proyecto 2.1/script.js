let cartCount = 0; // Variable para contar productos en el carrito
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || []; // Cargar productos desde localStorage
let currentProduct = null; // Variable para almacenar el producto actual

// Inicializar el contador del carrito
cartCount = cartItems.length;
document.querySelector('.cart-container span').textContent = cartCount; // Actualizar el contador en el carrito

const toggleModal = () => document.body.classList.toggle("open");

const confirmarAgregarCarrito = (productName, productPrice) => {
    currentProduct = { name: productName, price: productPrice, complements: [] }; // Agregar un array para complementos
    toggleModal(); // Mostrar el modal para seleccionar complementos
};

const addToCart = () => {
    if (currentProduct) {
        // Obtener los complementos seleccionados
        const selectedSauces = Array.from(document.querySelectorAll('input[name="salsas"]:checked')).map(checkbox => checkbox.value);
        const selectedVegetables = Array.from(document.querySelectorAll('input[name="vegetales"]:checked')).map(checkbox => checkbox.value);

        // Verificar si no se seleccionó ningún complemento
        if (selectedSauces.length === 0 && selectedVegetables.length === 0) {
            showCustomAlert('Por favor selecciona al menos un complemento antes de confirmar.');
            return; // Salir de la función si no se seleccionó ningún complemento
        }

        // Agregar los complementos al producto actual
        currentProduct.complements = [...selectedSauces, ...selectedVegetables];

        // Agregar el producto al carrito
        cartItems.push(currentProduct);
        cartCount++; // Incrementar el contador
        document.querySelector('.cart-container span').textContent = cartCount; // Actualizar el contador en el carrito

        // Actualizar el almacenamiento local
        localStorage.setItem('cartItems', JSON.stringify(cartItems));

        // Actualizar la lista del carrito
        updateCartList();
        calculateTotal(); // Actualizar el total del carrito

        // Mostrar una alerta personalizada
        showCustomAlert(`${currentProduct.name} ha sido agregado al carrito por $${currentProduct.price.toLocaleString()}`);
        
        currentProduct = null; // Reiniciar el producto actual
        toggleModal(); // Cerrar el modal
    }
};


// Función para mostrar alertas personalizadas 
const showCustomAlert = (message) => {
    const customAlert = document.createElement('div');
    customAlert.textContent = message;
    customAlert.style.backgroundColor = '#f8d7da';
    customAlert.style.color = '#721c24';
    customAlert.style.padding = '10px';
    customAlert.style.position = 'fixed';
    customAlert.style.top = '10px';
    customAlert.style.left = '50%';
    customAlert.style.transform = 'translateX(-50%)';
    customAlert.style.zIndex = '1000';
    customAlert.style.border = '1px solid #f5c6cb';
    document.body.appendChild(customAlert);

    setTimeout(() => {
        customAlert.remove();
    }, 3000); // Eliminar la alerta después de 3 segundos
};

const updateCartList = () => {
    const cartList = document.getElementById('cart-list');
    cartList.innerHTML = ''; // Limpiar la lista
    cartItems.forEach((item, index) => {
        const li = document.createElement('li');
        
        // Mostrar también los complementos en el carrito
        const complementsList = item.complements.length > 0 ? ` (Complementos: ${item.complements.join(', ')})` : '';
        li.textContent = `${item.name} - $${item.price.toLocaleString()}${complementsList}`;

        // Crear un botón para eliminar el producto
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.style.marginLeft = '5px';
        deleteButton.onclick = () => removeItemFromCart(index);

        // Añadir el botón de eliminación al elemento de la lista
        li.appendChild(deleteButton);
        cartList.appendChild(li);
    });
};

const removeItemFromCart = (index) => {
    // Eliminar el producto del carrito utilizando el índice
    cartItems.splice(index, 1);
    
    // Actualizar el localStorage
    localStorage.setItem('cartItems', JSON.stringify(cartItems));

    // Actualizar la lista del carrito en la interfaz
    updateCartList();
    updateCartTotal();
};



// Función para calcular el total del carrito
const calculateTotal = () => {
    let total = 0;
    cartItems.forEach(item => {
        total += item.price; // Sumar el precio de cada producto
    });

    // Mostrar el total en el DOM
    const totalElement = document.getElementById('cart-total');
    totalElement.textContent = `Total: $${total.toLocaleString()}`;
    return total; // Devolver el total para usarlo en otras funciones
};

// Cargar el carrito al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    updateCartList();
    calculateTotal(); // Calcular el total cuando se cargue la página
});

// Función para limpiar el carrito
const clearCart = () => {
    cartItems = []; // Limpiar el array de productos
    cartCount = 0; // Reiniciar el contador
    document.querySelector('.cart-container span').textContent = cartCount; // Actualizar el contador en el carrito
    localStorage.removeItem('cartItems'); // Eliminar el carrito del localStorage
    updateCartList(); // Actualizar la lista del carrito
    calculateTotal(); // Reiniciar el total
    showCustomAlert('El carrito ha sido limpiado.'); // Mensaje de confirmación
};

// Función para descargar el carrito en un archivo PDF
const downloadCartPDF = () => {
    if (cartItems.length === 0) {
        showCustomAlert('El carrito está vacío.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Encabezado sin fondo negro
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0); // Texto negro
    doc.text("Fast foot", 105, 20, null, null, "center"); // Centrar el texto

    doc.setFontSize(12);
    doc.text("Ubicación: Salitre Plaza", 105, 28, null, null, "center"); // Centrar el texto

    // Obtener la fecha y hora del sistema
    const fechaActual = new Date();
    const opcionesFecha = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const opcionesHora = { hour: '2-digit', minute: '2-digit', hour12: false };
    const fechaFormateada = fechaActual.toLocaleDateString('es-ES', opcionesFecha);
    const horaFormateada = fechaActual.toLocaleTimeString('es-ES', opcionesHora);

    doc.setTextColor(0, 0, 0); // Texto negro
    doc.text(`Fecha: ${fechaFormateada} ${horaFormateada}`, 105, 40, null, null, "center"); // Centrar el texto

    // Separador
    doc.setLineWidth(0.5);
    doc.line(10, 45, 200, 45); // Línea horizontal

    // Títulos de las columnas
    doc.setFontSize(12);
    doc.text("Descripción", 30, 50); // Título para la descripción
    doc.text("Cantidad", 135, 50); // Título para la cantidad
    doc.text("Valor", 180, 50); // Título para el valor

    // Separador de títulos
    doc.setLineWidth(0.5);
    doc.line(10, 53, 200, 53); // Línea horizontal
    let y = 60; // Posición inicial para los productos

    // Añadir los productos al PDF
    cartItems.forEach(item => {
        const complementsList = item.complements.length > 0 ? ` (Complementos: ${item.complements.join(', ')})` : '';
        const cantidad = item.quantity || 1; // Suponiendo que cada producto tiene una propiedad quantity
        
        // Descripción con ajuste de texto
        const descriptionText = `${item.name}${complementsList}`;
        const splitDescription = doc.splitTextToSize(descriptionText, 100); // Ajusta el ancho de la descripción
        splitDescription.forEach((line, index) => {
            doc.text(line, 30, y + (index * 10)); // Alinea a la izquierda y ajusta la posición en Y
        });

        // Cantidad
        doc.text(`${cantidad}`, 135, y); // Cantidad en la segunda columna
        // Valor
        doc.text(`$${item.price.toLocaleString()}`, 180, y); // Valor en la tercera columna

        y += splitDescription.length * 10; // Aumentar el espacio de y según el número de líneas en la descripción
    });

    const total = calculateTotal(); // Obtener el total
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`Total: $${total.toLocaleString()}`, 170, y + 10, null, null, "right"); // Total alineado a la derecha

    doc.save('factura.pdf');
};


// Función para enviar el resumen del carrito a WhatsApp
const sendCartToWhatsApp = (phoneNumber) => {
    if (cartItems.length === 0) {
        showCustomAlert('El carrito está vacío.');
        return;
    }

    let message = "Resumen de tu pedido:\n";
    cartItems.forEach(item => {
        const complementsList = item.complements.length > 0 ? ` (Complementos: ${item.complements.join(', ')})` : '';
        message += `${item.name} - $${item.price.toLocaleString()}${complementsList}\n`;
    });

    const total = calculateTotal(); // Obtener el total
    message += `\nTotal: $${total.toLocaleString()}`;

    // Formatear el mensaje para WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    // Redireccionar a WhatsApp
    window.open(whatsappUrl, '_blank');
};

// Código existente para manejar la clase activa
const currentLocation = location.href;
const menuItems = document.querySelectorAll('nav ul li a');
menuItems.forEach(item => {
    if (item.href === currentLocation) {
        item.classList.add('active');
    }
});

const toggleCartList = () => {
    const cartListContainer = document.getElementById('cart-list-container');
    cartListContainer.style.display = cartListContainer.style.display === 'none' ? 'block' : 'none';
};
