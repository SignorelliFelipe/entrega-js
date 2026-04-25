
const clases = {
    Guerrero: {vida: 100, ataque: 20, img: "./img/casco-W_1.webp"},
    Mago: {vida: 75, ataque: 25, img: "./img/casco-M.jpg"},
    Arquero: {vida: 83, ataque: 18, img: "./img/casco-A.jpg"}
};

let enemigos = [];


document.getElementById("crearPersonaje").addEventListener("click", crearPersonaje);


document.getElementById("botonBestiario").addEventListener("click", () => {
    document.getElementById("popupBestiario").style.display = "flex";
});

document.getElementById("cerrarBestiario").addEventListener("click", () => {
    document.getElementById("popupBestiario").style.display = "none";
});

fetch("./data/enemigos.json")
    .then(res => res.json())
    .then(data => {
        enemigos = data;
        mostrarBestiario();
    });


function crearPersonaje(){
    let nombre = document.getElementById("nombre").value || "Aventurero";
    let clase = document.getElementById("clase").value;

    let stats = clases[clase];

    let personaje = {
        nombre,
        clase,
        vidaMax: stats.vida,
        vida: stats.vida,
        ataque: stats.ataque,
        nivel: 1,
        xp: 0
    };

    guardarPersonaje(personaje);
    mostrarPersonajes();

    Swal.fire("🧙 Personaje creado", `${nombre} está listo`, "success");

    document.getElementById("nombre").value = "";
}

function guardarPersonaje(p){
    let personajes = JSON.parse(localStorage.getItem("personajes")) || [];
    personajes.push(p);
    localStorage.setItem("personajes", JSON.stringify(personajes));
}

function mostrarPersonajes(){
    let cont = document.getElementById("resultado");
    cont.innerHTML = "";

    let personajes = JSON.parse(localStorage.getItem("personajes")) || [];

    if(personajes.length === 0){
        cont.innerHTML = "<p>No hay personajes</p>";
        return;
    }

    personajes.forEach((p, i) => {

        let vidaPorcentaje = (p.vida / p.vidaMax) * 100;
        let xpPorcentaje = (p.xp / 30) * 100;

        cont.innerHTML += `
        <div class="carta">
            <img src="${clases[p.clase].img}" class="imagenPersonaje">

            <h3>${p.nombre}</h3>
            <p>${p.clase} (Nivel ${p.nivel})</p>

            <p>❤️ ${Math.max(0, Math.floor(p.vida))} / ${p.vidaMax}</p>

            <div class="barraVida">
                <div class="vida" style="width:${vidaPorcentaje}%"></div>
            </div>

            <p>XP: ${p.xp}/30</p>

            <div class="barraXP">
                <div class="xp" style="width:${xpPorcentaje}%"></div>
            </div>

            <button class="botonEliminar" data-i="${i}">Eliminar</button>
            <button class="botonPelear" data-i="${i}">Pelear</button>
        </div>`;
    });

    activarBotones();
}

function activarBotones(){

    document.querySelectorAll(".botonEliminar").forEach(btn => {
        btn.addEventListener("click", (e)=>{
            let i = e.target.dataset.i;

            Swal.fire({
                title: "¿Eliminar personaje?",
                icon: "warning",
                showCancelButton: true
            }).then(r=>{
                if(r.isConfirmed) borrarPersonaje(i);
            });
        });
    });

    document.querySelectorAll(".botonPelear").forEach(btn => {
        btn.addEventListener("click", (e)=>{
            pelear(e.target.dataset.i);
        });
    });
}

function borrarPersonaje(i){
    let personajes = JSON.parse(localStorage.getItem("personajes")) || [];
    personajes.splice(i,1);
    localStorage.setItem("personajes", JSON.stringify(personajes));
    mostrarPersonajes();
}

function pelear(i){

    let personajes = JSON.parse(localStorage.getItem("personajes"));
    let p = personajes[i];

    if(p.vida <= 0){
        Swal.fire("💀 Está muerto", "No puede pelear");
        return;
    }

    let enemigo = JSON.parse(JSON.stringify(
        enemigos[Math.floor(Math.random()*enemigos.length)]
    ));

    Swal.fire({
        title: `⚔️ ${p.nombre} vs ${enemigo.nombre}`,
        text: "Combatiendo...",
        timer: 1200,
        showConfirmButton: false
    });

    setTimeout(()=>{

        while(p.vida > 0 && enemigo.vida > 0){

            let dañoJugador = Math.floor(Math.random() * p.ataque);
            let dañoEnemigo = Math.floor(Math.random() * enemigo.ataque);

            enemigo.vida -= dañoJugador;
            p.vida -= dañoEnemigo;
        }

        let resultado;

        if(p.vida > 0){
            resultado = `🏆 ${p.nombre} ganó`;

            p.xp += 10;

            if(p.xp >= 30){
                p.nivel++;
                p.ataque += 5;
                p.vidaMax += 10;
                p.vida = p.vidaMax;
                p.xp = 0;

                Swal.fire("✨ Subiste de nivel!", `Ahora sos nivel ${p.nivel}`);
            }

        } else {
            resultado = `💀 ${p.nombre} fue derrotado`;
        }

        localStorage.setItem("personajes", JSON.stringify(personajes));

        mostrarPersonajes();

        Swal.fire("Resultado", resultado, "info");

    }, 1200);
}


document.getElementById("btnInicio").addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

document.getElementById("btnParty").addEventListener("click", () => {
    document.getElementById("resultado").scrollIntoView({
        behavior: "smooth"
    });
});

function mostrarBestiario(){
    let cont = document.getElementById("bestiario");
    cont.innerHTML = "";

    enemigos.forEach((e, index)=>{
        cont.innerHTML += `
        <div class="carta">

            <div class="contenedorImagen">
                <img src="${e.imagen}" class="imagenPersonaje">

                <button class="botonEnemigo" data-index="${index}">
                    ⚔️
                </button>
            </div>

            <h3>${e.nombre}</h3>
            <p>❤️ ${e.vida}</p>
            <p>⚔️ ${e.ataque}</p>

        </div>`;
    });

    activarBotonesEnemigos();
}

function activarBotonesEnemigos(){
    document.querySelectorAll(".botonEnemigo").forEach(btn=>{
        btn.addEventListener("click", (e)=>{
            let index = e.target.dataset.index;
            Swal.fire("👹 Enemigo seleccionado", enemigos[index].nombre);
        });
    });
}

function abrirBestiario(){
    document.getElementById("popupBestiario").style.display = "flex";
}

document.getElementById("botonBestiario").addEventListener("click", abrirBestiario);
document.getElementById("botonBestiarioImg").addEventListener("click", abrirBestiario);

document.getElementById("cerrarBestiario").addEventListener("click", ()=>{
    document.getElementById("popupBestiario").style.display = "none";
});

mostrarPersonajes();