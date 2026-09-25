document.addEventListener("DOMContentLoaded", () => {
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

    const tituloFichaPaciente = document.getElementById("titulo-ficha-paciente");
    const btnGuardarFicha = document.getElementById("btn-guardar-ficha");
    const textoPaseWhatsApp = document.getElementById("texto-pase-whatsapp");

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
        Object.keys(secciones).forEach(sec => secciones[sec].style.display = (sec === "hospitalizacion") ? "block" : "none");

        if (paciente) {
            tituloFichaPaciente.textContent = `📋 Cama ${numCama}: ${paciente.nombre} (HC: ${paciente.hc})`;
            
            // Anamnesis
            document.getElementById("an-procedencia").value = paciente.procedencia || "";
            document.getElementById("an-t-enfermedad").value = paciente.tEnfermedad || "";
            document.getElementById("an-inicio").value = paciente.inicio || "";
            document.getElementById("an-relato").value = paciente.relato || "";
            document.getElementById("fv-pa").value = paciente.pa || "";
            document.getElementById("fv-fc").value = paciente.fc || "";
            document.getElementById("fv-fr").value = paciente.fr || "";
            document.getElementById("fv-temp").value = paciente.temp || "";

            // Comorbilidades & Tratamientos
            document.getElementById("t-hta").value = paciente.tHta || "";
            document.getElementById("t-dm2").value = paciente.tDm2 || "";
            document.getElementById("t-irc").value = paciente.tIrc || "";
            document.getElementById("t-epoc").value = paciente.tEpoc || "";
            document.getElementById("t-cardio").value = paciente.tCardio || "";
            document.getElementById("t-hepatopatia").value = paciente.tHepatopatia || "";
            document.getElementById("ant-quirurgicos").value = paciente.antQuirurgicos || "";

            // Alertas
            document.getElementById("alerta-alergias").value = paciente.alergias || "";
            document.getElementById("alerta-anticoag").value = paciente.anticoag || "";

            // Riesgos
            document.getElementById("obs-cardio").value = paciente.obsCardio || "";
            document.getElementById("obs-anestesia").value = paciente.obsAnestesia || "";
            document.getElementById("obs-neumo").value = paciente.obsNeumo || "";
            document.getElementById("obs-nefro").value = paciente.obsNefro || "";

            // Quirófano
            document.getElementById("q-procedimiento").value = paciente.qProcedimiento || "Apendicectomía Laparoscópica";
            document.getElementById("q-abordaje").value = paciente.qAbordaje || "Laparoscópica";
            document.getElementById("q-herida").value = paciente.qHerida || "Limpia";
            document.getElementById("q-h-inicio").value = paciente.qHInicio || "";
            document.getElementById("q-h-fin").value = paciente.qHFin || "";
            document.getElementById("q-anestesia").value = paciente.qAnestesia || "";
            document.getElementById("q-asa").value = paciente.qAsa || "";
            document.getElementById("q-cirujano").value = paciente.qCirujano || "";
            document.getElementById("q-asistente").value = paciente.qAsistente || "";
            document.getElementById("q-anestesio").value = paciente.qAnestesio || "";
            document.getElementById("q-enfermera").value = paciente.qEnfermera || "";
            document.getElementById("q-hallazgos").value = paciente.qHallazgos || "";
            document.getElementById("q-tecnica").value = paciente.qTecnica || "";
            document.getElementById("q-drenaje-tipo").value = paciente.qDrenajeTipo || "";
            document.getElementById("q-debito-24h").value = paciente.qDebito24h || "";

            // Laboratorio
            document.getElementById("lab-fecha").value = paciente.labFecha || "";
            document.getElementById("lab-hb").value = paciente.labHb || "";
            document.getElementById("lab-leuco").value = paciente.labLeuco || "";
            document.getElementById("lab-cayados").value = paciente.labCayados || "";
            document.getElementById("lab-plaquetas").value = paciente.labPlaquetas || "";
            document.getElementById("lab-creat").value = paciente.labCreat || "";
            document.getElementById("lab-urea").value = paciente.labUrea || "";
            document.getElementById("lab-lactato").value = paciente.labLactato || "";
            document.getElementById("lab-tgo").value = paciente.labTgo || "";
            document.getElementById("lab-bili").value = paciente.labBili || "";
            document.getElementById("lab-inr").value = paciente.labInr || "";

            // Tratamiento y Plan
            document.getElementById("txt-indicaciones").value = paciente.indicaciones || "";
            document.getElementById("txt-pendientes").value = paciente.pendientes || "";
            document.getElementById("sel-alta").value = paciente.selAlta || "No";
            document.getElementById("txt-indicaciones-alta").value = paciente.indAlta || "";

            // Checkboxes
            document.getElementById("c-hta").checked = paciente.cHta || false;
            document.getElementById("c-dm2").checked = paciente.cDm2 || false;
            document.getElementById("c-irc").checked = paciente.cIrc || false;
            document.getElementById("c-epoc").checked = paciente.cEpoc || false;
            document.getElementById("c-cardio").checked = paciente.cCardio || false;
            document.getElementById("c-hepatopatia").checked = paciente.cHepatopatia || false;

            document.getElementById("r-cardio").checked = paciente.rCardio || false;
            document.getElementById("r-anestesia").checked = paciente.rAnestesia || false;
            document.getElementById("r-neumo").checked = paciente.rNeumo || false;
            document.getElementById("r-nefro").checked = paciente.rNefro || false;
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

        const p = pacientesData[camaActiva];
        p.procedencia = document.getElementById("an-procedencia").value;
        p.tEnfermedad = document.getElementById("an-t-enfermedad").value;
        p.inicio = document.getElementById("an-inicio").value;
        p.relato = document.getElementById("an-relato").value;
        p.pa = document.getElementById("fv-pa").value;
        p.fc = document.getElementById("fv-fc").value;
        p.fr = document.getElementById("fv-fr").value;
        p.temp = document.getElementById("fv-temp").value;

        p.tHta = document.getElementById("t-hta").value;
        p.tDm2 = document.getElementById("t-dm2").value;
        p.tIrc = document.getElementById("t-irc").value;
        p.tEpoc = document.getElementById("t-epoc").value;
        p.tCardio = document.getElementById("t-cardio").value;
        p.tHepatopatia = document.getElementById("t-hepatopatia").value;
        p.antQuirurgicos = document.getElementById("ant-quirurgicos").value;

        p.alergias = document.getElementById("alerta-alergias").value;
        p.anticoag = document.getElementById("alerta-anticoag").value;

        p.obsCardio = document.getElementById("obs-cardio").value;
        p.obsAnestesia = document.getElementById("obs-anestesia").value;
        p.obsNeumo = document.getElementById("obs-neumo").value;
        p.obsNefro = document.getElementById("obs-nefro").value;

        p.qProcedimiento = document.getElementById("q-procedimiento").value;
        p.qAbordaje = document.getElementById("q-abordaje").value;
        p.qHerida = document.getElementById("q-herida").value;
        p.qHInicio = document.getElementById("q-h-inicio").value;
        p.qHFin = document.getElementById("q-h-fin").value;
        p.qAnestesia = document.getElementById("q-anestesia").value;
        p.qAsa = document.getElementById("q-asa").value;
        p.qCirujano = document.getElementById("q-cirujano").value;
        p.qAsistente = document.getElementById("q-asistente").value;
        p.qAnestesio = document.getElementById("q-anestesio").value;
        p.qEnfermera = document.getElementById("q-enfermera").value;
        p.qHallazgos = document.getElementById("q-hallazgos").value;
        p.qTecnica = document.getElementById("q-tecnica").value;
        p.qDrenajeTipo = document.getElementById("q-drenaje-tipo").value;
        p.qDebito24h = document.getElementById("q-debito-24h").value;

        p.labFecha = document.getElementById("lab-fecha").value;
        p.labHb = document.getElementById("lab-hb").value;
        p.labLeuco = document.getElementById("lab-leuco").value;
        p.labCayados = document.getElementById("lab-cayados").value;
        p.labPlaquetas = document.getElementById("lab-plaquetas").value;
        p.labCreat = document.getElementById("lab-creat").value;
        p.labUrea = document.getElementById("lab-urea").value;
        p.labLactato = document.getElementById("lab-lactato").value;
        p.labTgo = document.getElementById("lab-tgo").value;
        p.labBili = document.getElementById("lab-bili").value;
        p.labInr = document.getElementById("lab-inr").value;

        p.indicaciones = document.getElementById("txt-indicaciones").value;
        p.pendientes = document.getElementById("txt-pendientes").value;
        p.selAlta = document.getElementById("sel-alta").value;
        p.indAlta = document.getElementById("txt-indicaciones-alta").value;

        p.cHta = document.getElementById("c-hta").checked;
        p.cDm2 = document.getElementById("c-dm2").checked;
        p.cIrc = document.getElementById("c-irc").checked;
        p.cEpoc = document.getElementById("c-epoc").checked;
        p.cCardio = document.getElementById("c-cardio").checked;
        p.cHepatopatia = document.getElementById("c-hepatopatia").checked;

        p.rCardio = document.getElementById("r-cardio").checked;
        p.rAnestesia = document.getElementById("r-anestesia").checked;
        p.rNeumo = document.getElementById("r-neumo").checked;
        p.rNefro = document.getElementById("r-nefro").checked;

        localStorage.setItem("pacientesData", JSON.stringify(pacientesData));
        alert("¡Ficha clínica integral guardada exitosamente!");
    });

    function generarPaseWhatsApp() {
        let total = 0;
        let detalle = "";
        Object.keys(pacientesData).forEach(cama => {
            if (pacientesData[cama].nombre) {
                total++;
                detalle += `\n- Cama ${cama}: ${pacientesData[cama].nombre} (HC: ${pacientesData[cama].hc}) | Dx: ${pacientesData[cama].diagnostico} | Alta: ${pacientesData[cama].selAlta}`;
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
