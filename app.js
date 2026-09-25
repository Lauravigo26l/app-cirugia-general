document.addEventListener("DOMContentLoaded", () => {
    // Referencias DOM
    const gridCamas = document.getElementById("grid-camas");
    const navButtons = document.querySelectorAll(".nav-btn");
    const secciones = {
        "torre": document.getElementById("seccion-torre"),
        "hospitalizacion": document.getElementById("seccion-hospitalizacion"),
        "escalas": document.getElementById("seccion-escalas"),
        "resumen": document.getElementById("seccion-resumen")
    };

    const modalIngreso = document.getElementById("modal-ingreso");
    const btnIngresoGeneral = document.getElementById("btn-ingreso-general");
    const cerrarModal = document.getElementById("cerrar-modal");
    const modalSelectCama = document.getElementById("modal-select-cama");
    const modalBtnGuardar = document.getElementById("modal-btn-guardar");

    const pacienteNombreHeader = document.getElementById("paciente-nombre-header");
    const pacienteMetaHeader = document.getElementById("paciente-meta-header");
    const chkCandidatoAlta = document.getElementById("chk-candidato-alta");
    const btnGuardarFicha = document.getElementById("btn-guardar-ficha");
    const textoPaseWhatsApp = document.getElementById("texto-pase-whatsapp");

    // Habitaciones Oficiales Hospital II-2 Tarapoto
    const habitaciones = ["218", "219", "220", "221", "222", "223", "224"];
    const letras = ["A", "B"];

    let pacientesData = JSON.parse(localStorage.getItem("surgiflow_data")) || {};
    let camaActiva = null;

    // Navegación de Vistas Principales
    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            navButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const tabName = btn.getAttribute("data-tab");
            Object.keys(secciones).forEach(sec => {
                secciones[sec].style.display = (sec === tabName) ? "block" : "none";
            });

            if (tabName === "resumen") generarReporteGuardia();
        });
    });

    // Renderizar Torre de Control y Grilla de Camas
    function renderCenso() {
        gridCamas.innerHTML = "";
        modalSelectCama.innerHTML = "";

        let countPropias = 0;
        let countPrestadas = 0;
        let countUrpa = 0;
        let countAltas = 0;

        habitaciones.forEach(hab => {
            letras.forEach(letra => {
                const numCama = `${hab}-${letra}`;
                const option = document.createElement("option");
                option.value = numCama;
                option.textContent = `Cama ${numCama}`;
                modalSelectCama.appendChild(option);

                const paciente = pacientesData[numCama];
                const card = document.createElement("div");
                card.className = "cama-card";

                if (paciente) {
                    countPropias++;
                    if (paciente.candidatoAlta) {
                        card.classList.add("alta-posible");
                        countAltas++;
                    } else {
                        card.classList.add("ocupada");
                    }

                    card.innerHTML = `
                        <h3>Cama ${numCama} <span>${paciente.candidatoAlta ? '🟢 Alta' : '🔴'}</span></h3>
                        <p><strong>Paciente:</strong> ${paciente.nombre}</p>
                        <p><strong>HC:</strong> ${paciente.hc}</p>
                        <p><strong>Dx:</strong> ${paciente.dx || 'Post-operatorio'}</p>
                    `;
                } else {
                    card.innerHTML = `
                        <h3>Cama ${numCama} <span>⚪ Libre</span></h3>
                        <p><strong>Estado:</strong> Disponible</p>
                        <p><em>Clic para ingresar o asignar</em></p>
                    `;
                }

                card.addEventListener("click", () => abrirFichaPaciente(numCama));
                gridCamas.appendChild(card);
            });
        });

        // Actualizar Estadísticas Superiores
        document.getElementById("stat-propias").textContent = countPropias;
        document.getElementById("stat-prestadas").textContent = countPrestadas;
        document.getElementById("stat-urpa").textContent = countUrpa;
        document.getElementById("stat-altas").textContent = countAltas;
    }

    // Abrir Ficha del Paciente
    function abrirFichaPaciente(numCama) {
        camaActiva = numCama;
        const p = pacientesData[numCama];

        // Cambiar vista a Ficha Clínica
        navButtons.forEach(b => b.classList.remove("active"));
        document.querySelector('[data-tab="hospitalizacion"]').classList.add("active");
        secciones.torre.style.display = "none";
        secciones.hospitalizacion.style.display = "block";
        secciones.escalas.style.display = "none";
        secciones.resumen.style.display = "none";

        if (p) {
            pacienteNombreHeader.textContent = `Cama ${numCama}: ${p.nombre}`;
            pacienteMetaHeader.textContent = `HC: ${p.hc} | Diagnóstico: ${p.dx || 'En estudio'}`;
            chkCandidatoAlta.checked = p.candidatoAlta || false;

            // Anamnesis & Ingreso
            document.getElementById("ing-pa").value = p.ingPA || "";
            document.getElementById("ing-fc").value = p.ingFC || "";
            document.getElementById("ing-fr").value = p.ingFR || "";
            document.getElementById("ing-temp").value = p.ingTemp || "";
            document.getElementById("ing-sato2").value = p.ingSat || "";
            document.getElementById("ing-glasgow").value = p.ingGlas || "";
            document.getElementById("ing-te").value = p.ingTE || "";
            document.getElementById("ing-relato").value = p.ingRelato || "";
            document.getElementById("ing-imagenes").value = p.ingImg || "";
            document.getElementById("ing-diagnostico").value = p.dx || "";

            // Comorbilidades y Tratamientos
            document.getElementById("ram-farmaco").value = p.ramFarmaco || "";
            document.getElementById("ram-reaccion").value = p.ramReaccion || "";
            document.getElementById("txt-trat-hta").value = p.tratHTA || "";
            document.getElementById("txt-trat-dm2").value = p.tratDM2 || "";
            document.getElementById("txt-trat-irc").value = p.tratIRC || "";
            document.getElementById("txt-trat-epoc").value = p.tratEPOC || "";
            document.getElementById("txt-ant-quirurgicos").value = p.antQuirurgicos || "";

            // Riesgos
            document.getElementById("rq-cardio-detalle").value = p.rqCardio || "";
            document.getElementById("rq-anestesia-detalle").value = p.rqAnestesia || "";

            // Quirófano
            document.getElementById("op-procedimiento").value = p.opProc || "";
            document.getElementById("op-cirujano").value = p.opCirujano || "";
            document.getElementById("op-ayudante1").value = p.opAyudante || "";
            document.getElementById("op-hallazgos").value = p.opHallazgos || "";
            document.getElementById("op-tecnica-texto").value = p.opTecnica || "";
            document.getElementById("dren-tipo").value = p.drenTipo || "";
            document.getElementById("dren-debito").value = p.drenDebito || "";

            // Prescripción
            document.getElementById("ind-1").value = p.ind1 || "";
            document.getElementById("ind-3").value = p.ind3 || "";
            document.getElementById("ind-4-tipo").value = p.ind4Tipo || "";
            document.getElementById("ind-4-goteo").value = p.ind4Goteo || "";
            document.getElementById("ind-5").value = p.ind5 || "";
            document.getElementById("ind-6").value = p.ind6 || "";
            document.getElementById("ind-7").value = p.ind7 || "";
            document.getElementById("txt-pendientes").value = p.pendientes || "";
        } else {
            pacienteNombreHeader.textContent = `Cama ${numCama}: (Sin Paciente Registrado)`;
            pacienteMetaHeader.textContent = "Complete los datos a continuación para registrar el ingreso:";
            chkCandidatoAlta.checked = false;
        }
    }

    // Modal de Ingreso
    btnIngresoGeneral.addEventListener("click", () => { modalIngreso.style.display = "block"; });
    cerrarModal.addEventListener("click", () => { modalIngreso.style.display = "none"; });

    modalBtnGuardar.addEventListener("click", () => {
        const camaSel = modalSelectCama.value;
        const nombre = document.getElementById("modal-nombre").value;
        const hc = document.getElementById("modal-hc").value;
        const dx = document.getElementById("modal-dx").value;

        if (!nombre) {
            alert("Por favor ingrese el nombre del paciente.");
            return;
        }

        pacientesData[camaSel] = {
            nombre,
            hc: hc || "S/N",
            dx: dx || "En evaluación",
            candidatoAlta: false
        };

        localStorage.setItem("surgiflow_data", JSON.stringify(pacientesData));
        modalIngreso.style.display = "none";
        renderCenso();
        abrirFichaPaciente(camaSel);
    });

    // Guardar Ficha Completa
    btnGuardarFicha.addEventListener("click", () => {
        if (!camaActiva) return;

        if (!pacientesData[camaActiva]) {
            pacientesData[camaActiva] = { nombre: "Paciente Cama " + camaActiva, hc: "S/N" };
        }

        const p = pacientesData[camaActiva];
        p.candidatoAlta = chkCandidatoAlta.checked;

        // Anamnesis
        p.ingPA = document.getElementById("ing-pa").value;
        p.ingFC = document.getElementById("ing-fc").value;
        p.ingFR = document.getElementById("ing-fr").value;
        p.ingTemp = document.getElementById("ing-temp").value;
        p.ingSat = document.getElementById("ing-sato2").value;
        p.ingGlas = document.getElementById("ing-glasgow").value;
        p.ingTE = document.getElementById("ing-te").value;
        p.ingRelato = document.getElementById("ing-relato").value;
        p.ingImg = document.getElementById("ing-imagenes").value;
        p.dx = document.getElementById("ing-diagnostico").value || p.dx;

        // Comorbilidades
        p.ramFarmaco = document.getElementById("ram-farmaco").value;
        p.ramReaccion = document.getElementById("ram-reaccion").value;
        p.tratHTA = document.getElementById("txt-trat-hta").value;
        p.tratDM2 = document.getElementById("txt-trat-dm2").value;
        p.tratIRC = document.getElementById("txt-trat-irc").value;
        p.tratEPOC = document.getElementById("txt-trat-epoc").value;
        p.antQuirurgicos = document.getElementById("txt-ant-quirurgicos").value;

        // Riesgos
        p.rqCardio = document.getElementById("rq-cardio-detalle").value;
        p.rqAnestesia = document.getElementById("rq-anestesia-detalle").value;

        // Quirófano
        p.opProc = document.getElementById("op-procedimiento").value;
        p.opCirujano = document.getElementById("op-cirujano").value;
        p.opAyudante = document.getElementById("op-ayudante1").value;
        p.opHallazgos = document.getElementById("op-hallazgos").value;
        p.opTecnica = document.getElementById("op-tecnica-texto").value;
        p.drenTipo = document.getElementById("dren-tipo").value;
        p.drenDebito = document.getElementById("dren-debito").value;

        // Prescripción
        p.ind1 = document.getElementById("ind-1").value;
        p.ind3 = document.getElementById("ind-3").value;
        p.ind4Tipo = document.getElementById("ind-4-tipo").value;
        p.ind4Goteo = document.getElementById("ind-4-goteo").value;
        p.ind5 = document.getElementById("ind-5").value;
        p.ind6 = document.getElementById("ind-6").value;
        p.ind7 = document.getElementById("ind-7").value;
        p.pendientes = document.getElementById("txt-pendientes").value;

        localStorage.setItem("surgiflow_data", JSON.stringify(pacientesData));
        alert("¡Historial clínico, quirúrgico e indicaciones guardados con éxito!");
        renderCenso();
    });

    // Generador de Reporte WhatsApp
    function generarReporteGuardia() {
        let total = 0;
        let altas = 0;
        let cuerpo = "";

        Object.keys(pacientesData).forEach(cama => {
            const p = pacientesData[cama];
            if (p && p.nombre) {
                total++;
                const estadoAlta = p.candidatoAlta ? "🟢 [CANDIDATO A ALTA - Cama Liberable]" : "🔴 [Hospitalizado]";
                if (p.candidatoAlta) altas++;
                cuerpo += `\n* Cama ${cama}: ${p.nombre} (HC: ${p.hc})\n  Dx: ${p.dx || 'En estudio'} ${estadoAlta}\n  Pendientes: ${p.pendientes || 'Ninguno'}\n`;
            }
        });

        textoPaseWhatsApp.textContent = `📋 PASE DE GUARDIA - CIRUGÍA GENERAL
🏥 Hospital II-2 Tarapoto
🛏️ Censo Total: ${total} pacientes
🟢 Camas con Alta Programada (Liberables para URPA/Emergencia): ${altas}
===================================
${cuerpo}
===================================
⚠️ Coordinar subida de pacientes retenidos en URPA a camas con alta médica.`;
    }

    // Escala de Alvarado interactiva
    const alvCheckboxes = document.querySelectorAll(".alv-chk");
    alvCheckboxes.forEach(chk => {
        chk.addEventListener("change", () => {
            let total = 0;
            alvCheckboxes.forEach(c => { if (c.checked) total += parseInt(c.value); });
            document.getElementById("alv-total").textContent = total;
            const conclusion = document.getElementById("alv-conclusion");
            if (total >= 7) conclusion.textContent = "Alta probabilidad (Quirúrgico directo)";
            else if (total >= 4) conclusion.textContent = "Probabilidad intermedia (Evaluar ecografía/TAC)";
            else conclusion.textContent = "Baja probabilidad (Observación)";
        });
    });

    renderCenso();
});

// Función Global de Subtabs
function cambiarSubTab(n) {
    document.querySelectorAll(".subtab-content").forEach(el => el.style.display = "none");
    document.querySelectorAll(".subtab-btn").forEach(btn => btn.classList.remove("active"));
    document.getElementById(`subtab-content-${n}`).style.display = "block";
    event.currentTarget.classList.add("active");
}

// Calculadora de Washout
function calcularWashout() {
    const tipo = document.getElementById("anticoag-tipo").value;
    const rec = document.getElementById("anticoag-recomendacion");
    switch (tipo) {
        case "aspirina": rec.value = "Suspender 5 a 7 días antes de cx electiva."; break;
        case "clopidogrel": rec.value = "Suspender 5 a 7 días antes."; break;
        case "warfarina": rec.value = "Suspender 5 días antes (objetivo INR < 1.5). Puente HBPM si alto riesgo."; break;
        case "enoxaparina": rec.value = "Suspender 12h antes si dosis profiláctica; 24h si terapéutica."; break;
        case "doac": rec.value = "Suspender 24 a 48h según aclaramiento renal."; break;
        default: rec.value = "Sin requerimiento de lavado.";
    }
}

// Redactor Automático de Técnica Quirúrgica IA
function autoRedactarTecnica() {
    const abordaje = document.getElementById("op-abordaje").value;
    const txt = document.getElementById("op-tecnica-texto");

    if (abordaje === "laparo-cole") {
        txt.value = "Bajo anestesia general balanceada, paciente en decúbito dorsal. Asepsia y colocación de campos quirúrgicos. Incisión transumbilical de 10mm, técnica abierta de Hasson, neumoperitoneo a 14 mmHg con CO2. Colocación de trócares: 10mm umbilical, 10mm epigastrio, dos de 5mm en hipocondrio derecho. Tracción de fondo vesicular y bacinete. Disección del triángulo hepatocístico (Calot). Se logra Visión Crítica de Seguridad (VCS) de Strasberg: 2 estructuras vistas (conducto cístico y arteria cística) y tercio inferior de lecho disecado. Clipado de conducto cístico (2 proximales, 1 distal) y sección. Clipado y sección de arteria cística. Colecistectomía retrógrada con electrocauterio hook. Extracción de pieza por puerto umbilical protegida en bolsa. Hemostasia prolija del lecho. Retiro de trócares bajo visión. Cierre de aponeurosis umbilical con vicryl 1 y piel con nylon 3-0.";
    } else if (abordaje === "laparo-apendice") {
        txt.value = "Bajo anestesia general, paciente en decúbito dorsal. Neumoperitoneo mediante punción umbilical con técnica de Hasson. Inserción de trócares: 10mm umbilical, 10mm suprapúbico, 5mm en fosa iliaca izquierda. Inspección de cavidad: se ubica ciego y base apendicular. Disección de mesoapéndice ligando arteria apendicular con energía bipolar / clips. Ligadura de base apendicular mediante doble endoloop de PDS/Vicryl. Sección apendicular. Extracción de pieza operatoria en endobolsa por puerto suprapúbico. Lavado y aspiración de cavidad pélvica con suero fisiológico temperado. Hemostasia verificada. Desuflación y cierre de puertos aponeuróticos con vicryl y piel con nylon.";
    } else if (abordaje === "abierta-apendice") {
        txt.value = "Bajo anestesia raquídea, paciente en decúbito dorsal. Incisión de Rocky-Davis / McBurney en fosa iliaca derecha. Disección por planos anatómicos: piel, tejido celular subcutáneo, apertura de aponeurosis de oblicuo mayor, divulsión muscular. Apertura de peritoneo parietal. Exteriorización de ciego y apéndice cecal. Ligadura de mesoapéndice y arteria apendicular con seda 2-0. Ligadura de base apendicular con vicryl 2-0 y sección apendicular. Aseo de corredera parietocólica. Cierre por planos: peritoneo y aponeurosis con vicryl 1, piel con puntos simples de nylon 3-0.";
    } else {
        txt.value = "Procedimiento quirúrgico reglado paso a paso según hallazgos descritos.";
    }
}

// Plantilla de Indicaciones Médicas
function cargarPlantillaIndicaciones() {
    document.getElementById("ind-1").value = "Reposo en cama, posición semisentada a 30°";
    document.getElementById("ind-3").value = "CFV c/6 horas, BHE estricto, Saturometría de pulso continua (OSA)";
    document.getElementById("ind-4-tipo").value = "Cloruro de Sodio 0.9% 1000cc";
    document.getElementById("ind-4-goteo").value = "A 30 gotas por minuto (CIV)";
    document.getElementById("ind-5").value = "Omeprazol 40mg EV c/24h en bolo lento";
    document.getElementById("ind-6").value = "Ceftriaxona 2g EV c/24h (Día 1) diluido en 100cc NaCl 0.9%";
    document.getElementById("ind-7").value = "Metamizol 1.5g + Tramadol 100mg en 1000cc NaCl 0.9% a 30 gts/min";
    document.getElementById("ind-8").value = "Dimenhidrinato 50mg EV condicional a náuseas o vómitos c/8h";
    document.getElementById("ind-9").value = "Curación diaria de herida, cuantificar y reportar débito de drenaje";
    alert("¡Plantilla hospitalaria post-operatoria cargada!");
}

function copiarPaseWhatsApp() {
    const texto = document.getElementById("texto-pase-whatsapp").textContent;
    navigator.clipboard.writeText(texto);
    alert("¡Pase de guardia copiado al portapapeles! Listo para pegar en WhatsApp.");
}
