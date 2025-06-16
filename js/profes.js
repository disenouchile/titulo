const identidadAqui = document.querySelector("#identidad");
const asignaturasAqui = document.querySelector("#asignaturas");
const dialogoAqui = document.querySelector("#dialogo");
const resultadosAqui = document.querySelector("#resultados");
const afinesAqui = document.querySelector("#afines");

var dataProfes, dataTitulos;

async function datos(criterio) {
    var seleccion = [];
    var profeSeleccion = [];
    var profeOtres = [];
    var notas = [];
    var notasPrevias = [];
    const consulta = await fetch("https://api.myjson.online/v1/records/6a17f890-1a65-45e6-8c26-10ce18c28ca5");
    const data = await consulta.json();

    console.log(data);

    dataProfes = data.data.profes;
    dataTitulos = data.data.titulos;

    console.log(dataProfes);

    console.log(dataTitulos);

    //Creo una selección, basándome en el selector
    dataTitulos.forEach((d) => {
        if (d.profe_guia == criterio) {
            seleccion.push(d);
        }
    });

    //Creo una selección, basándome en el selector
    dataProfes.forEach((d) => {
        if (d.name == criterio) {
            profeSeleccion = d;
        }
    });

    console.log(profeSeleccion);

    dataProfes.forEach((d) => {
        if (d.grupo == profeSeleccion.grupo) {
            if(d.name !== profeSeleccion.name){
            profeOtres.push(d);
            }
        }
    });

    console.log(profeOtres);


    identidadAqui.innerHTML = `
    <div class="row align-items-center">
        <div class="col-md-5">
            <img src="${profeSeleccion.foto}" class="w-100">
        </div>
        <div class="col-md-7">
            <h1 class="fs-3">${profeSeleccion.name}</h1>
            <h2 class="fs-5">${profeSeleccion.nivel} ${profeSeleccion.adscripcion}</h2>
            <p>${profeSeleccion.mail}</p>
            <h4>Grado/Título</h4>
            <p>Pendiente</p>
            <h4>Enfoque de guiatura</h4>
            <p>${profeSeleccion.descriptor}</p>
        </div>
        <div class="col-md-12">
            <h4>Palabras clave</h4>
            <p>Pendiente…</p>
        </div>
    `;

    asignaturasAqui.innerHTML = `<h2 class="fs-4">Asignaturas impartidas</h2><object data="${profeSeleccion.asignaturas}" type="image/svg+xml" class="w-100 mt-4">
            </object>`

    dialogoAqui.innerHTML = `<h2 class="fs-4 my-3">Conversemos</h2>${dialogante(profeSeleccion.dialogo)}`;

    profeOtres.forEach((a)=>{
        afinesAqui.innerHTML += `<div class="col-4"><a href="profes.html?data=${a.name}"><img src="${a.foto}" class="w-100"> <p>${a.name}</p></a></div>`
    })



    if (profeSeleccion.titulades !== 0) {
        //Ordeno la selección por nombre de tituladas/os
        seleccion.sort(function (a, b) {
            if (a.nota_proyecto < b.nota_proyecto) {
                return 1;
            }
            if (a.nota_proyecto > b.nota_proyecto) {
                return -1;
            }
            return 0;
        });

        resultadosAqui.innerHTML = `<h2 class="fs-4 mt-4">Resultados en Examen de Título*</h2>
                <p class="lead" id="resumen"></p>
                <table class="table">
                    <thead>
                        <th>Egresado/a</th>
                        <th>Título</th>
                        <th>Semestre</th>
                        <th>Proyecto</th>
                        <th>Nota</th>
                    </thead>
                    <tbody></tbody>
                </table>
                 <div class="row py-5">
                    <div class="col-sm-6">
                        <p>¿Cómo se relaciona su nota aprobatoria previa, de Proyecto de Título I, con la nota definida por la comisión examinadora de Proyecto de Título II?</p>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 65 65" id="slope"></svg>
                    </div>
                    <div class="col-sm-6">
                        <p>¿Qué parte de las inscripciones en la asignatura de Proyecto de Título II con <span id="profe"></span> se han convertido en Exámenes de Título aprobados?</p>
                        <div id="donnut"></div>
                    </div>    
                </div>
            <p class="small">*Resultados en Examen de Título sólo consideran al <a href="https://fau.uchile.cl/admision/por-que-estudiar-en-la-fau/diseno" target="_blank">actual programa de estudios</a>. Para información de otras memorias y tesis, por favor visite su <a href="${profeSeleccion.perfil}" target="_blank">Portafolio Académico de la Universidad de Chile</a>.</p>
    `;

        //Genero una tabla que muestre la selección ya ordenada
        seleccion.forEach((s, i) => {
            if (s.repositorio_academico) {
                document.querySelector("tbody").innerHTML += `
                    <tr><td>${s.nombre}</td><td>${s.titulo_profesional}</td><td>${s.semestre_examen}</td><td><a href="${s.repositorio_academico}" target="_blank">${s.proyecto}</a></td><td class="text-center">${s.nota_proyecto.toFixed(
                    1
                )}</td></tr>`;
            } else {
                document.querySelector("tbody").innerHTML += `<tr><td>${s.nombre}</td><td>${s.titulo_profesional}</td><td>${s.semestre_examen}</td><td>${s.proyecto}</td><td class="text-center">${s.nota_proyecto.toFixed(1)}</td></tr>`;
            }
            notas.push(s.nota_proyecto);
            notasPrevias.push(s.nota_anteproyecto);
        });

        //Saco un promedio de las notas en la tabla
        var i = 0;
        var total = 0;
        notas.forEach((n) => {
            total += n;
            i++;
        });
        var promedio = (total / i).toFixed(1);

        if (notas.length == 1) {
            document.querySelector("#resumen").innerHTML = `<em>${promedio}</em> es la nota del proyecto guiado por ${profeSeleccion.profe} hasta un Examen de Título aprobado`;
        } else {
            document.querySelector("#resumen").innerHTML = `<em>${promedio}</em> es la nota promedio de los <em>${notas.length}</em> proyectos guiados por ${profeSeleccion.profe} hasta un Examen de Título aprobado; la mediana es de <em>${mediana(notas).toFixed(
                1
            )}</em>, y la desviación estándar es de <em>${desviacionEstandar(notas).toFixed(2)}</em>`;
        }

        document.querySelector("#donnut").innerHTML = `<svg width="100%" height="100%" viewBox="0 0 42 42"><circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--acentoAlto)" stroke-width="2"></circle><circle class="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--acento)" stroke-width="2" stroke-dasharray="${
            profeSeleccion.porcentajes
        } ${100 - profeSeleccion.porcentajes}" stroke-dashoffset="25"></circle><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="7" ${profeSeleccion.porcentajes}>${
            profeSeleccion.porcentajes
        }%</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-size="2" ${profeSeleccion.porcentajes}>${profeSeleccion.titulades} de ${profeSeleccion.guiades}</text></svg>`;
        document.querySelector("#profe").innerHTML = profeSeleccion.profe;
        document.querySelector("#slope").innerHTML = `
    <circle cx="5" cy="2.5" r=".5" fill="silver"/>
    <line x1="5" y1="2.5" x2="5" y2="62" stroke="silver" stroke-width=".3" />
    <circle cx="5" cy="62" r=".5" fill="silver"/>
    <circle cx="60" cy="2.5" r=".5" fill="silver"/>
    <line x1="60" y1="2.5" x2="60" y2="62.5" stroke="silver" stroke-width=".3" />
    <circle cx="60" cy="62.5" r=".5" fill="silver"/>
    `;
        for (var i = 0; i < notas.length; i++) {
            document.querySelector("#slope").innerHTML += `<g>    
<text x="0.5" y="${140 - notasPrevias[i] * 20 + 2.5}" font-size="2.3" dominant-baseline="middle">${notasPrevias[i].toFixed(1)}</text>
<circle cx="5" cy="${140 - notasPrevias[i] * 20 + 2.5}" r=".5" fill="var(--acento)"/>
<line x1="5" y1="${140 - notasPrevias[i] * 20 + 2.5}" x2="60" y2="${140 - notas[i] * 20 + 2.5}" stroke="var(--acento)" stroke-width=".3"/>
<circle cx="60" cy="${140 - notas[i] * 20 + 2.5}" r=".5" fill="var(--acento)"/>
<text x="61.25" y="${140 - notas[i] * 20 + 2.5}" font-size="2.3" dominant-baseline="middle">${notas[i].toFixed(1)}</text>
</g>`;
        }
    } else {
        resultadosAqui.innerHTML = `<p class="lead">Aún no hay registros de sus resultados como Prof. Guía en Examen de Título</p>`;
    }
}


if(new URLSearchParams(window.location.search).get('data')){
    var seleccion = new URLSearchParams(window.location.search).get('data');
    datos(seleccion).catch((error) => console.error(error));    
    console.log(seleccion);
    document.querySelector('select [value="'+seleccion+'"]').selected = true;
} else {
    datos("Abud Carrillo, Jenny").catch((error) => console.error(error));    
}

document.querySelectorAll("select")[0].addEventListener("change", (event) => {
    identidadAqui.innerHTML = " ";
    asignaturasAqui.innerHTML = " ";
    dialogoAqui.innerHTML = "";
    resultadosAqui.innerHTML = "";
    afinesAqui.innerHTML = "";
    console.clear();
    var seleccion = [];
    var profeSeleccion = [];
    var profeOtres = [];
    var notas = [];
    var notasPrevias = [];
    datos(event.target.value).catch((error) => console.error(error));
});

function eficiencia(profe) {
    var esto;
    if (alfabetico == profe) {
        esto = `<svg width="100%" height="100%" viewBox="0 0 42 42"><circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--acentoAlto)" stroke-width="2"></circle><circle class="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--acento)" stroke-width="2" stroke-dasharray="${
            d.porcentajes
        } ${100 - d.porcentajes}" stroke-dashoffset="25"></circle><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="7" ${color(d.porcentajes)}>${
            d.porcentajes
        }%</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-size="2" ${color(d.porcentajes)}>${d.titulades} de ${d.guiades}</text></svg>`;
    }
    return esto;
}

function desviacionEstandar(array) {
    const n = array.length;
    const mean = array.reduce((a, b) => a + b) / n;
    return Math.sqrt(array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

function mediana(numbers) {
    const sorted = Array.from(numbers).sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    return sorted[middle];
}

function dialogante(array) {
    const n = array.length;
    var coso = "";
    for (var x = 0; x < n; x++) {
        if (x % 2 !== 0) {
            coso += `<div class="profesor"><div class="burbuja">${array[x]}</div></div>`;
        } else {
            coso += `<div class="estudiante"><div class="burbuja">${array[x]}</div></div>`;
        }
    }
    return coso;
}