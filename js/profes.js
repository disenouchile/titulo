const identidadAqui = document.querySelector("#identidad");
const asignaturasAqui = document.querySelector("#asignaturas");
const dialogoAqui = document.querySelector("#dialogo");
const detallesAqui = document.querySelector("#detalles");
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
            if (d.name !== profeSeleccion.name) {
                profeOtres.push(d);
            }
        }
    });

    console.log(profeOtres);

    identidadAqui.innerHTML = `
    <div class="row align-items-end">
        <div class="col-md-5">
            <img src="${profeSeleccion.foto}" class="w-100 rounded">
        </div>
        <div class="col-md-7">
            <h1 class="fs-3">${profeSeleccion.nombre}</h1>
            <h2 class="fs-5">${profeSeleccion.nivel} &bull; ${profeSeleccion.adscripcion}</h2>
            <p>mail: ${profeSeleccion.mail}</p>
            <h4 class="fs-5">Grado/Título</h4>
            ${grados(profeSeleccion.grados)}
            <h4 class="fs-5">Enfoque de guiatura</h4>
            <p>${profeSeleccion.descriptor}</p>
        </div>
        <div class="col-md-12">
            <h4 class="fs-5">Palabras clave</h4>
            <p>Pendiente…</p>
        </div>
    `;

    asignaturasAqui.innerHTML = `<h2 class="fs-4">Asignaturas impartidas</h2><object data="${profeSeleccion.asignaturas}" type="image/svg+xml" class="w-100 mt-4">
            </object>`;

    dialogoAqui.innerHTML = `<h2 class="fs-4 my-3">Conversemos</h2>${dialogante(profeSeleccion.dialogo)}`;

    detallesAqui.innerHTML = `<div class="col-md-6"><dl><dt>Áreas FAU</dt>${areas(profeSeleccion.areas.toString())}</dl></div><div class="col-md-3"><dl><dt>Líneas DdD</dt>${lineas(
        profeSeleccion.lineas.toString()
    )}</dl></div><div class="col-md-3"><dl><dt>Énfasis en Título</dt>${enfasis(profeSeleccion.enfasis.toString())}</dl></div>`;

    profeOtres.forEach((a) => {
        afinesAqui.innerHTML += `<div class="col-4"><a href="profes.html?data=${a.name}"><img src="${a.foto}" class="w-100"> <p>${a.nombre}</p></a></div>`;
    });

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

        var graficoFinal = "";

        if (new URLSearchParams(window.location.search).get("clave")) {
            var clave = new URLSearchParams(window.location.search).get("clave");
            if ((clave = "admin")) {
                graficoFinal = `<div class="row py-5">
                            <div class="col-sm-6">
                                <p>¿Cómo se relaciona su nota aprobatoria previa, de Proyecto de Título I, con la nota definida por la comisión examinadora de Proyecto de Título II?</p>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 65 65" id="slope"></svg>
                            </div>
                            <div class="col-sm-6">
                                <p>¿Qué parte de las inscripciones en la asignatura de Proyecto de Título II con <span id="profe"></span> se han convertido en Exámenes de Título aprobados?</p>
                                <div id="donnut"></div>
                            </div>    
                        </div>`;
            }
        }

        resultadosAqui.innerHTML = `<h2 class="fs-4 mt-4">Resultados en Examen de Título*</h2>
                <p class="lead" id="resumen"></p>
                <div class="table-responsive">
                    <table class="table small">
                        <thead>
                            <th>Egresado/a</th>
                            <th>Título</th>
                            <th class="text-center d-none d-md-table-cell">Semestre</th>
                            <th>Proyecto</th>
                            <th class="text-center">Nota</th>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
                 ${graficoFinal}
            <p class="small">*Resultados en Examen de Título sólo consideran al <a href="https://fau.uchile.cl/admision/por-que-estudiar-en-la-fau/diseno" target="_blank">actual programa de estudios</a>. Para información de otras memorias y tesis, por favor visite su <a href="${profeSeleccion.perfil}" target="_blank">Portafolio Académico de la Universidad de Chile</a>.</p>
    `;

        //Genero una tabla que muestre la selección ya ordenada
        seleccion.forEach((s, i) => {
            if (s.repositorio_academico) {
                document.querySelector("tbody").innerHTML += `
                    <tr><td>${s.nombre}</td><td>${s.titulo_profesional}</td><td class="text-center d-none d-md-table-cell">${s.semestre_examen}</td><td><a href="${s.repositorio_academico}" target="_blank">${
                    s.proyecto
                }</a></td><td class="text-center">${s.nota_proyecto.toFixed(1).replace(".",",")}</td></tr>`;
            } else {
                document.querySelector("tbody").innerHTML += `<tr><td>${s.nombre}</td><td>${s.titulo_profesional}</td><td class="text-center">${s.semestre_examen}</td><td>${s.proyecto}</td><td class="text-center">${s.nota_proyecto.toFixed(
                    1
                ).replace(".",",")}</td></tr>`;
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
            document.querySelector("#resumen").innerHTML = `<em>${promedio.replace(".",",")}</em> es la nota del proyecto guiado por ${profeSeleccion.nombre} hasta un Examen de Título aprobado`;
        } else {
            document.querySelector("#resumen").innerHTML = `Son <em>${notas.length}</em> los proyectos guiados por ${
                profeSeleccion.nombre
            } hasta un Examen de Título aprobado. El promedio de su nota de aprobación es de <em>${promedio.replace(".",",")}</em>. La mediana es de <em>${mediana(notas).toFixed(1).replace(".",",")}</em>.</em>`;
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
            document.querySelector("#slope").innerHTML += `<g><text x="0.5" y="${140 - notasPrevias[i] * 20 + 2.5}" font-size="2.3" dominant-baseline="middle">${notasPrevias[i].toFixed(1)}</text><circle cx="5" cy="${140 - notasPrevias[i] * 20 + 2.5}" r=".5" fill="var(--acento)"/><line x1="5" y1="${140 - notasPrevias[i] * 20 + 2.5}" x2="60" y2="${140 - notas[i] * 20 + 2.5}" stroke="var(--acento)" stroke-width=".3"/><circle cx="60" cy="${140 - notas[i] * 20 + 2.5}" r=".5" fill="var(--acento)"/><text x="61.25" y="${140 - notas[i] * 20 + 2.5}" font-size="2.3" dominant-baseline="middle">${notas[i].toFixed(1)}</text></g>`;
        }


    } else {
        resultadosAqui.innerHTML = `<p class="lead">Aún no hay registros de sus resultados como Prof. Guía en Examen de Título</p>`;
    }
}

if (new URLSearchParams(window.location.search).get("data")) {
    var seleccion = new URLSearchParams(window.location.search).get("data");
    datos(seleccion).catch((error) => console.error(error));
    console.log(seleccion);
    document.querySelector('select [value="' + seleccion + '"]').selected = true;
} else {
    datos("Abud Carrillo, Jenny").catch((error) => console.error(error));
}

document.querySelectorAll("select")[0].addEventListener("change", (event) => {
    identidadAqui.innerHTML = " ";
    asignaturasAqui.innerHTML = " ";
    dialogoAqui.innerHTML = "";
    detallesAqui.innerHTML = "";
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

function areas(data) {
    var susAreas = "";
    if (data.includes("1")) {
        susAreas += "<dd>ÁREA PRIOTARIA 1. SISTEMAS FÍSICOS, NATURALES Y CAMBIOS AMBIENTALES</dd>";
    }
    if (data.includes("2")) {
        susAreas += "<dd>ÁREA PRIOTARIA 2. DIMENSIONES SOCIOECOLÓGICAS EN EL TERRITORIO</dd>";
    }
    if (data.includes("3")) {
        susAreas += "<dd>ÁREA PRIOTARIA 3. ASENTAMIENTOS, MOVILIDADES Y ORGÁNICAS COMUNITARIAS</dd>";
    }
    if (data.includes("4")) {
        susAreas += "<dd>ÁREA PRIOTARIA 4. DINÁMICAS Y TRANSFORMACIONES MORFOLÓGICAS, URBANAS Y RURALES</dd>";
    }
    if (data.includes("5")) {
        susAreas += "<dd>ÁREA PRIOTARIA 5. CREACIÓN, INNOVACIÓN PROYECTUAL Y DESARROLLOS TECNOLÓGICOS</dd>";
    }
    if (data.includes("6")) {
        susAreas += "<dd>ÁREA PRIOTARIA 6. CONSERVACIÓN E INTERVENCIÓN DE OBRAS, ENTORNOS Y CIUDADES PATRIMONIALES</dd>";
    }
    if (data.includes("7")) {
        susAreas += "<dd>ÁREA PRIOTARIA 7. CULTURAS VISUALES, MATERIALES-INMATERIALES Y MEDIALES</dd>";
    }
    if (data.includes("8")) {
        susAreas += "<dd>ÁREA PRIOTARIA 8. FENÓMENOS SENSIBLES, PERCEPTUALES Y CORPORALES EN EL ENTORNO</dd>";
    }
    return susAreas;
}

function lineas(data) {
    var susLineas = "";
    if (data.includes("1")) {
        susLineas += "<dd>Diseño centrado en la persona</dd>";
    }
    if (data.includes("2")) {
        susLineas += "<dd>Materiales, Tecnologías y Procesos</dd>";
    }
    if (data.includes("3")) {
        susLineas += "<dd>Morfología, Percepción y Color</dd>";
    }
    if (data.includes("4")) {
        susLineas += "<dd>Identidad y Patrimonio</dd>";
    }
    if (data.includes("5")) {
        susLineas += "<dd>Estudios Visuales y Mediales</dd>";
    }
    if (data.includes("6")) {
        susLineas += "<dd>Diseño Editorial y Tipografía</dd>";
    }
    return susLineas;
}

function enfasis(data) {
    var susEnfasis = "";
    if (data.includes("1")) {
        susEnfasis += "<dd>Innovación</dd>";
    }
    if (data.includes("2")) {
        susEnfasis += "<dd>Creación</dd>";
    }
    if (data.includes("3")) {
        susEnfasis += "<dd>Investigación</dd>";
    }
    return susEnfasis;
}

function grados(data) {
    var susGrados = "<ul>";
    data.forEach((d)=> {
        susGrados += "<li>"+d+"</li>";
    });
    susGrados += "</ul>";
    return susGrados;
}