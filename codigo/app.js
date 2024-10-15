
/**
 * INICIAMOS USUARIO
 */
class Usuario {
    constructor() {
        this.nombre = localStorage.getItem('nombre') || null;
    }

    async solicitarNombre() {
        //desestructuramos el valor que devuelve el objeto y lo guardamos en la variable nombre
        const { value: nombre } = await Swal.fire({
            title: 'Bienvenido a nuestra web de recetas, Ingresa tu nombre',
            input: 'text',
            inputLabel: '¿Cómo te llamas?',
            inputPlaceholder: 'Escribe tu nombre',
            showCancelButton: false,
            confirmButtonText: 'Guardar',
            allowOutsideClick: false,
            inputValidator: (value) => {
                if (!value) {
                    return 'Por favor, ingresa un nombre válido';
                }
            }
        });

        if (nombre) {
            this.guardarNombre(nombre);
            this.mostrarNombre();
        }
    }

    guardarNombre(nombre) {
        this.nombre = nombre;
        localStorage.setItem('nombre', nombre);
    }

    mostrarNombre() {
        const contenedorNombre = document.getElementById('nombreUsuario');
        contenedorNombre.textContent = `Bienvenido ${this.nombre}! , aqui podras encontrar las mejores recetas para ti y tu familia`;
    }

    iniciar() {
        if (this.nombre) {
            this.mostrarNombre();
        } else {
            this.solicitarNombre();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const usuario = new Usuario();
    usuario.iniciar();
});

/**
 * INICIAMOS APP
 */

// Armando el select con las opciones para filtrar por categoria
const categorias = ["Postres", "Ensaladas", "Pastas", "Sopas", "Pizzas", "Platos Principales", "Entradas", "Arroces", "Bebidas", "Desayunos"];
const slcCategoria = document.querySelector('#slcCategoria');

categorias.forEach(categoria => {
    const option = document.createElement('option');
    option.value = categoria.toLowerCase();
    option.innerHTML = categoria;
    slcCategoria.append(option);
});

fetch('recetas.json')
    .then(response => response.json())
    .then(json => {
        renderizarRecetas(json.recetas);

        // El filtrado se hace aca, ya que hay que volver a imprimir las recetas que cumplan con el criterio de búsqueda cada vez que se hace click en el botón buscar
        document.getElementById('btnBuscar').addEventListener("click", filtrar);

        function filtrar() {
            const valorBuscado = document.getElementById('txtBuscar').value.toLowerCase();
            const recetasFiltradas = json.recetas.filter(receta =>
                receta.titulo.toLowerCase().includes(valorBuscado)
            );
            renderizarRecetas(recetasFiltradas);
        }

        //aca filtramos segun categoria
        document.querySelector("#slcCategoria").addEventListener("change", filtroPorCategorias);
        function filtroPorCategorias() {
            const categoriaSeleccionada = slcCategoria.value;
            if(categoriaSeleccionada === "") {
                //cuando elija todas se trae el json entero y retorna
                renderizarRecetas(json.recetas);
                return;
            }
            const recetasSegunCategoria = json.recetas.filter(receta => 
                receta.categoria.toLowerCase() === categoriaSeleccionada
            );
            renderizarRecetas(recetasSegunCategoria);
        }
    })
    .catch(error => {
        console.log('Error: ', error);
        alert("Error al cargar las recetas");
    });



function renderizarRecetas(recetas) {
    const contenedor = document.getElementById('recetas');
    contenedor.innerHTML = '';

    recetas.forEach(receta => {
        const divReceta = document.createElement('div');
        divReceta.classList.add('cuadro-receta');
        const itemIngredientes = receta.ingredientes.map(ingrediente => `<li>${ingrediente}</li>`).join('');
        
        divReceta.innerHTML = `
            <h3>${receta.titulo}</h3>
            <button class="btnMostrar">Ver Receta</button>
            <button class="favorito">❤</button>
            <div class="info-receta" style="display: none;">
                <p><strong>Comensales:</strong> ${receta.comensales}</p>
                <p><strong>Ingredientes:</strong>
                    <ul>${itemIngredientes}</ul>
                </p>
                <p><strong>Procedimiento:</strong> ${receta.procedimiento}</p>
            </div>
        `;
        contenedor.append(divReceta);

        // Acción para mostrar/ocultar receta
        const btnExpandir = divReceta.querySelector('.btnMostrar');
        btnExpandir.addEventListener('click', () => {
            const info = divReceta.querySelector('.info-receta');
            info.style.display = info.style.display === 'none' ? 'block' : 'none';
        });

        // Actualiza el estado del botón favorito al renderizar
        actualizarEstadoFavorito(divReceta, receta);

        // Acción del botón favorito
        const btnFavorito = divReceta.querySelector('.favorito');
        btnFavorito.addEventListener("click", () => {
            toggleFavorito(receta);
            actualizarEstadoFavorito(divReceta, receta);
        });
    });
}

function toggleFavorito(receta) {
    let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    const esFavorito = favoritos.some(fav => fav.id === receta.id);

    if (esFavorito) {
        favoritos = favoritos.filter(fav => fav.id !== receta.id);
    } else {
        favoritos.push(receta);
        Swal.fire({
            title: 'Receta añadida a favoritos',
            text: `${receta.titulo} ha sido añadida a tus favoritos.`,
            icon: 'success',
            confirmButtonText: 'Aceptar'
        });
    }

    localStorage.setItem('favoritos', JSON.stringify(favoritos));
}

function actualizarEstadoFavorito(divReceta, receta) {
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    const btnFavorito = divReceta.querySelector('.favorito');
    const esFavorito = favoritos.some(fav => fav.id === receta.id);

    // Actualizar clases del botón de favorito
    if (esFavorito) {
        btnFavorito.classList.add('favorito-rojo');
        btnFavorito.classList.remove('favorito-negro');
    } else {
        btnFavorito.classList.add('favorito-negro');
        btnFavorito.classList.remove('favorito-rojo');
    }
}
