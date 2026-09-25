document.addEventListener("DOMContentLoaded", () => {
    const gridCamas = document.getElementById("grid-camas");
    const navButtons = document.querySelectorAll(".nav-btn");
    const secciones = {
        "torre": document.getElementById("seccion-torre"),
        "hospitalizacion": document.getElementById("seccion-hospitalizacion"),
        "resumen": document.getElementById("seccion-resumen")
    };

    const modalIngreso = document.getElementById("modal-ingreso");
    const btnIngresoGeneral = document.getElementById("btn-ingreso-general");
    const cerrarModal = document.getElementById("cerrar-modal");
    const modalSelectCama = document.getElementById("modal-select-cama");
    const modalBtnGuardar = document.getElementById("modal-btn-guardar");

    const tituloFichaPaciente = document.getElementById("titulo-ficha-paciente");
    const btnGuardarFicha = document.getElementById("btn-guardar-ficha");
    const textoPaseWhatsApp = document.getElementById("texto-pase-whatsapp");
    const spanAlertaTexto = document.getElementById("span-alerta-texto");

    const habitaciones = ["218", "219", "220", "221", "222", "223", "224"];
    const letras = ["A", "B"];

    let pacientesData = JSON.parse(localStorage.getItem("pacientesData")) || {};
    let camaActiva = null;

    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            navButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const tabName = btn.getAttribute("data-tab");
            Object.keys(secciones).forEach(sec => {
                secciones[sec].style.display = (sec === tabName) ? "block" : "none";
            });

            if (tabName === "resumen") generarPaseWhatsApp();
        });
    });

    function renderCenso() {
        gridCamas.innerHTML = "";
        modalSelectCama.innerHTML = "";

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
                    card.classList.add(paciente.riesgo || "verde");
                    card.innerHTML = `
                        <h3>Cama ${numCama} <span>🔴</span></h3>
                        <p><strong>Paciente:</strong> ${paciente.nombre}</p>
                        <p><strong>HC:</strong> ${paciente.hc}</p>
                        <p><strong>Dx:</strong> ${paciente.diagnostico || 'Sin diagnóstico'}</p>
                    `;
                } else {
                    card.innerHTML = `
                        <h3>Cama ${numCama} <span>🟢</span></h3>
                        <p><strong>Estado:</strong> Disponible / Libre</p>
                        <p><em>Hacer clic para registrar</em></p>
                    `;
                }

                card.addEventListener("click", () => abrirFichaPaciente(numCama));
                gridCamas.appendChild(card);
            });
        });
    }

    function abrirFichaPaciente(numCama) {
        camaActiva = numCama;
        const paciente = pacientesData[numCama];

        navButtons.forEach(b => b.classList.remove("active"));
        document.querySelector('[data-tab="hospitalizacion"]').classList.add("active");
        secciones.torre.style.display = "none";
        secciones.hospitalizacion.style.display = "block";
        secciones.resumen.style.display = "none";

        if (paciente) {
            tituloFichaPaciente.textContent = `📋 Cama ${numCama}: ${paciente.nombre} (HC: ${paciente.hc})`;
            
            // Admisión
            document.getElementById("adm-procedencia").value = paciente.procedencia || "";
            document.getElementById("adm-t-enf").value = paciente.tEnf || "";
            document.getElementById("adm-inicio").value = paciente.inicio || "";
            document.getElementById("adm-relato").value = paciente.relato || "";
            document.getElementById("fv-pa").value = paciente.pa || "";
            document.getElementById("fv-fc").value = paciente.fc || "";
            document.getElementById("fv-fr").value = paciente.fr || "";
            document.getElementById("fv-t").value = paciente.t || "";
            document.getElementById("fv-sat").value = paciente.sat || "";
            document.getElementById("fv-glasgow").value = paciente.glasgow || "";
            document.getElementById("adm-conducta").value = paciente.conducta || "Observación";

            // Comorbilidades & Tratamientos
            document.getElementById("chk-hta").checked = paciente.hta || false;
            document.getElementById("trat-hta").value = paciente.tratHta || "";
            document.getElementById("chk-dm2").checked = paciente.dm2 || false;
            document.getElementById("trat-dm2").value = paciente.tratDm2 || "";
            document.getElementById("chk-irc").checked = paciente.irc || false;
            document.getElementById("trat-irc").value = paciente.tratIrc || "";
            document.getElementById("chk-epoc").checked = paciente.epoc || false;
            document.getElementById("trat-epoc").value = paciente.tratEpoc || "";
            document.getElementById("txt-ant-quirurgicos").value = paciente.antQuirurgicos || "";

            // Riesgos
            document.getElementById("riesgo-cardio").checked = paciente.rCardio || false;
            document.getElementById("sug-cardio").value = paciente.sugCardio || "";
            document.getElementById("riesgo-anestesia").checked = paciente.rAnestesia || false;
            document.getElementById("sug-anestesia").value = paciente.sugAnestesia || "";
            document.getElementById("riesgo-nefro").checked = paciente.rNefro || false;
            document.getElementById("sug-nefro").value = paciente.sugNefro || "";

            // Alergias y Anticoagulantes
            document.getElementById("txt-alergias").value = paciente.alergias || "NINGUNA REGISTRADA";
            spanAlertaTexto.textContent = paciente.alergias || "NINGUNA REGISTRADA";
            document.getElementById("txt-anticoag").value = paciente.anticoag || "";

            // Quirófano
            document.getElementById("q-procedimiento").value = paciente.procedimiento || "Apendicectomía Laparoscópica";
            document.getElementById("q-abordaje").value = paciente.abordaje || "Laparoscópica";
            document.getElementById("q-h-inicio").value = paciente.hInicio || "";
            document.getElementById("q-h-fin").value = paciente.hFin || "";
            document.getElementById("q-t-op").value = paciente.tOp || "";
            document.getElementById("q-herida").value = paciente.herida || "Limpia";
            document.getElementById("q-cirujano").value = paciente.cirujano || "";
            document.getElementById("q-ayudante").value = paciente.ayudante || "";
            document.getElementById("q-anestesiologo").value = paciente.anestesiologo || "";
            document.getElementById("q-hallazgos").value = paciente.hallazgos || "";
            document.getElementById("q-tecnica").value = paciente.tecnica || "";
            document.getElementById("q-drenaje").value = paciente.drenaje || "";
            document.getElementById("q-debito-24h").value = paciente.debito24h || "";

            // Laboratorio Columnas
            document.getElementById("lab-d1-hb").value = paciente.d1Hb || "";
            document.getElementById("lab-d1-leuco").value = paciente.d1Leuco || "";
            document.getElementById("lab-d1-cay").value = paciente.d1Cay || "";
            document.getElementById("lab-d1-creat").value = paciente.d1Creat || "";
            document.getElementById("lab-d1-lac").value = paciente.d1Lac || "";
            document.getElementById("lab-d1-inr").value = paciente.d1Inr || "";

            document.getElementById("lab-d2-hb").value = paciente.d2Hb || "";
            document.getElementById("lab-d2-leuco").value = paciente.d2Leuco || "";
            document.getElementById("lab-d2-cay").value = paciente.d2Cay || "";
            document.getElementById("lab-d2-creat").value = paciente.d2Creat || "";
            document.getElementById("lab-d2-lac").value = paciente.d2Lac || "";
            document.getElementById("lab-d2-inr").value = paciente.d2Inr || "";

            document.getElementById("lab-d3-hb").value = paciente.d3Hb || "";
            document.getElementById("lab-d3-leuco").value = paciente.d3Leuco || "";
            document.getElementById("lab-d3-cay").value = paciente.d3Cay || "";
            document.getElementById("lab-d3-creat").value = paciente.d3Creat || "";
            document.getElementById("lab-d3-lac").value = paciente.d3Lac || "";
            document.getElementById("lab-d3-inr").value = paciente.d3Inr || "";

            // Tratamiento y Alta
            if(paciente.indicaciones) document.getElementById("txt-indicaciones").value = paciente.indicaciones;
            document.getElementById("txt-pendientes").value = paciente.pendientes || "";
            document.getElementById("chk-criterio-alta").checked = paciente.criterioAlta || false;
            document.getElementById("txt-indicaciones-alta").value = paciente.indAlta || "";
        } else {
            tituloFichaPaciente.textContent = `📋 Cama ${numCama} - Sin paciente asignado.`;
        }
    }

    btnIngresoGeneral.addEventListener("click", () => { modalIngreso.style.display = "block"; });
    cerrarModal.addEventListener("click", () => { modalIngreso.style.display = "none"; });

    modalBtnGuardar.addEventListener("click", () => {
        const camaSel = modalSelectCama.value;
        const nombre = document.getElementById("modal-nombre").value;
        const hc = document.getElementById("modal-hc").value;
        const dx = document.getElementById("modal-dx").value;

        if (!nombre) {
            alert("Ingrese el nombre del paciente.");
            return;
        }

        pacientesData[camaSel] = { nombre, hc: hc || "S/N", diagnostico: dx || "En estudio", riesgo: "verde" };
        localStorage.setItem("pacientesData", JSON.stringify(pacientesData));
        modalIngreso.style.display = "none";
        renderCenso();
        abrirFichaPaciente(camaSel);
    });

    btnGuardarFicha.addEventListener("click", () => {
        if (!camaActiva) return;
        if (!pacientesData[camaActiva]) {
            pacientesData[camaActiva] = { nombre: "Paciente " + camaActiva, hc: "S/N", diagnostico: "En estudio", riesgo: "verde" };
        }

        // Guardar Admisión
        pacientesData[camaActiva].procedencia = document.getElementById("adm-procedencia").value;
        pacientesData[camaActiva].tEnf = document.getElementById("adm-t-enf").value;
        pacientesData[camaActiva].inicio = document.getElementById("adm-inicio").value;
        pacientesData[camaActiva].relato = document.getElementById("adm-relato").value;
        pacientesData[camaActiva].pa = document.getElementById("fv-pa").value;
        pacientesData[camaActiva].fc = document.getElementById("fv-fc").value;
        pacientesData[camaActiva].fr = document.getElementById("fv-fr").value;
        pacientesData[camaActiva].t = document.getElementById("fv-t").value;
        pacientesData[camaActiva].sat = document.getElementById("fv-sat").value;
        pacientesData[camaActiva].glasgow = document.getElementById("fv-glasgow").value;
        pacientesData[camaActiva].conducta = document.getElementById("adm-conducta").value;

        // Comorbilidades y Tratamientos
        pacientesData[camaActiva].hta = document.getElementById("chk-hta").checked;
        pacientesData[camaActiva].tratHta = document.getElementById("trat-hta").value;
        pacientesData[camaActiva].dm2 = document.getElementById("chk-dm2").checked;
        pacientesData[camaActiva].tratDm2 = document.getElementById("trat-dm2").value;
        pacientesData[camaActiva].irc = document.getElementById("chk-irc").checked;
        pacientesData[camaActiva].tratIrc = document.getElementById("trat-irc").value;
        pacientesData[camaActiva].epoc = document.getElementById("chk-epoc").checked;
        pacientesData[camaActiva].tratEpoc = document.getElementById("trat-epoc").value;
        pacientesData[camaActiva].antQuirurgicos = document.getElementById("txt-ant-quirurgicos").value;

        // Riesgos
        pacientesData[camaActiva].rCardio = document.getElementById("riesgo-cardio").checked;
        pacientesData[camaActiva].sugCardio = document.getElementById("sug-cardio").value;
        pacientesData[camaActiva].rAnestesia = document.getElementById("riesgo-anestesia").checked;
        pacientesData[camaActiva].sugAnestesia = document.getElementById("sug-anestesia").value;
        pacientesData[camaActiva].rNefro = document.getElementById("riesgo-nefro").checked;
        pacientesData[camaActiva].sugNefro = document.getElementById("sug-nefro").value;

        // Alergias
        const alergiaVal = document.getElementById("txt-alergias").value;
        pacientesData[camaActiva].alergias = alergiaVal;
        spanAlertaTexto.textContent = alergiaVal;
        pacientesData[camaActiva].anticoag = document.getElementById("txt-anticoag").value;

        // Quirófano
        pacientesData[camaActiva].procedimiento = document.getElementById("q-procedimiento").value;
        pacientesData[camaActiva].abordaje = document.getElementById("q-abordaje").value;
        pacientesData[camaActiva].hInicio = document.getElementById("q-h-inicio").value;
        pacientesData[camaActiva].hFin = document.getElementById("q-h-fin").value;
        pacientesData[camaActiva].tOp = document.getElementById("q-t-op").value;
        pacientesData[camaActiva].herida = document.getElementById("q-herida").value;
        pacientesData[camaActiva].cirujano = document.getElementById("q-cirujano").value;
        pacientesData[camaActiva].ayudante = document.getElementById("q-ayudante").value;
        pacientesData[camaActiva].anestesiologo = document.getElementById("q-anestesiologo").value;
        pacientesData[camaActiva].hallazgos = document.getElementById("q-hallazgos").value;
        pacientesData[camaActiva].tecnica = document.getElementById("q-tecnica").value;
        pacientesData[camaActiva].drenaje = document.getElementById("q-drenaje").value;
        pacientesData[camaActiva].debito24h = document.getElementById("q-debito-24h").value;

        // Lab Columnas
        pacientesData[camaActiva].d1Hb = document.getElementById("lab-d1-hb").value;
        pacientesData[camaActiva].d1Leuco = document.getElementById("lab-d1-leuco").value;
        pacientesData[camaActiva].d1Cay = document.getElementById("lab-d1-cay").value;
        pacientesData[camaActiva].d1Creat = document.getElementById("lab-d1-creat").value;
        pacientesData[camaActiva].d1Lac = document.getElementById("lab-d1-lac").value;
        pacientesData[camaActiva].d1Inr = document.getElementById("lab-d1-inr").value;

        pacientesData[camaActiva].d2Hb = document.getElementById("lab-d2-hb").value;
        pacientesData[camaActiva].d2Leuco = document.getElementById("lab-d2-leuco").value;
        pacientesData[camaActiva].d2Cay = document.getElementById("lab-d2-cay").value;
        pacientesData[camaActiva].d2Creat = document.getElementById("lab-d2-creat").value;
        pacientesData[camaActiva].d2Lac = document.getElementById("lab-d2-lac").value;
        pacientesData[camaActiva].d2Inr = document.getElementById("lab-d2-inr").value;

        pacientesData[camaActiva].d3Hb = document.getElementById("lab-d3-hb").value;
        pacientesData[camaActiva].d3Leuco = document.getElementById("lab-d3-leuco").value;
        pacientesData[camaActiva].d3Cay = document.getElementById("lab-d3-cay").value;
        pacientesData[camaActiva].d3Creat = document.getElementById("lab-d3-creat").value;
        pacientesData[camaActiva].d3Lac = document.getElementById("lab-d3-lac").value;
        pacientesData[camaActiva].d3Inr = document.getElementById("lab-d3-inr").value;

        // Tratamiento y Alta
        pacientesData[camaActiva].indicaciones = document.getElementById("txt-indicaciones").value;
        pacientesData[camaActiva].pendientes = document.getElementById("txt-pendientes").value;
        pacientesData[camaActiva].criterioAlta = document.getElementById("chk-criterio-alta").checked;
        pacientesData[camaActiva].indAlta = document.getElementById("txt-indicaciones-alta").value;

        localStorage.setItem("pacientesData", JSON.stringify(pacientesData));
        alert("¡Ficha clínica maestra guardada exitosamente!");
    });

    function generarPaseWhatsApp() {
        let total = 0;
        let detalle = "";
        Object.keys(pacientesData).forEach(cama => {
            if (pacientesData[cama].nombre) {
                total++;
                detalle += `\n- Cama ${cama}: ${pacientesData[cama].nombre} (HC: ${pacientesData[cama].hc}) | Conducta: ${pacientesData[cama].conducta || 'En evolución'}`;
            }
        });

        textoPaseWhatsApp.textContent = `📋 PASE DE GUARDIA - CIRUGÍA GENERAL\n🏥 Sede: Hospital II-2 Tarapoto\n🛏️ Censo Total: ${total} pacientes.\n${detalle}\n\n⚠️ Verificado en SurgiFlow.`;
    }

    renderCenso();
});

function cambiarSubTab(num) {
    document.querySelectorAll('.subtab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.subtab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`subtab-content-${num}`).style.display = 'block';
    event.currentTarget.classList.add('active');
}

function copiarPaseWhatsApp() {
    const texto = document.getElementById("texto-pase-whatsapp").textContent;
    navigator.clipboard.writeText(texto);
    alert("¡Pase de guardia copiado al portapapeles!");
}
