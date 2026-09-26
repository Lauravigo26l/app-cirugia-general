document.addEventListener("DOMContentLoaded", () => {
    const gridCamas = document.getElementById("grid-camas");
    const navButtons = document.querySelectorAll(".nav-btn");
    const secciones = {
        "torre": document.getElementById("seccion-torre"),
        "hospitalizacion": document.getElementById("seccion-hospitalizacion"),
        "quirofano": document.getElementById("seccion-quirofano"),
        "laboratorio": document.getElementById("seccion-laboratorio"),
        "escalas": document.getElementById("seccion-escalas"),
        "resumen": document.getElementById("seccion-resumen")
    };

    const modalIngreso = document.getElementById("modal-ingreso");
    const btnIngresoGeneral = document.getElementById("btn-ingreso-general");
    const cerrarModal = document.getElementById("cerrar-modal");
    const modalSelectCama = document.getElementById("modal-select-cama");
    const modalBtnGuardar = document.getElementById("modal-btn-guardar");

    const tituloFichaPaciente = document.getElementById("titulo-ficha-paciente");
    const btnGuardarHospitalizacion = document.getElementById("btn-guardar-hospitalizacion");
    const btnGuardarQx = document.getElementById("btn-guardar-qx");
    const btnGuardarLab = document.getElementById("btn-guardar-lab");
    const textoPaseWhatsApp = document.getElementById("texto-pase-whatsapp");

    // Habitaciones oficiales (218-A a 224-B) + Camas Prestadas / URPA
    const habitaciones = ["218", "219", "220", "221", "222", "223", "224"];
    const letras = ["A", "B"];
    const extras = ["PRESTADA-Medicina-412", "URPA-Recuperacion-01"];

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
            if (tabName === "escalas") cargarEscala();
        });
    });

    function renderCenso() {
        gridCamas.innerHTML = "";
        modalSelectCama.innerHTML = "";

        // Llenar camas oficiales y extras en el selector del modal
        const todasLasUbicaciones = [];
        habitaciones.forEach(hab => letras.forEach(letra => todasLasUbicaciones.push(`${hab}-${letra}`)));
        extras.forEach(ext => todasLasUbicaciones.push(ext));

        todasLasUbicaciones.forEach(ubi => {
            const option = document.createElement("option");
            option.value = ubi;
            option.textContent = `Ubicación / Cama ${ubi}`;
            modalSelectCama.appendChild(option);

            const paciente = pacientesData[ubi];
            const card = document.createElement("div");
            card.className = "cama-card";
            
            if (paciente) {
                card.classList.add(paciente.riesgo || "verde");
                card.innerHTML = `
                    <h3>${ubi} <span>🔴</span></h3>
                    <p><strong>Paciente:</strong> ${paciente.nombre}</p>
                    <p><strong>HC:</strong> ${paciente.hc}</p>
                    <p><strong>Dx:</strong> ${paciente.diagnostico || 'Sin diagnóstico'}</p>
                `;
            } else {
                card.innerHTML = `
                    <h3>${ubi} <span>🟢</span></h3>
                    <p><strong>Estado:</strong> Disponible / Libre</p>
                    <p><em>Hacer clic para registrar</em></p>
                `;
            }

            card.addEventListener("click", () => abrirFichaPaciente(ubi));
            gridCamas.appendChild(card);
        });
    }

    function abrirFichaPaciente(ubi) {
        camaActiva = ubi;
        const paciente = pacientesData[ubi];

        navButtons.forEach(b => b.classList.remove("active"));
        document.querySelector('[data-tab="hospitalizacion"]').classList.add("active");
        Object.keys(secciones).forEach(sec => secciones[sec].style.display = (sec === "hospitalizacion") ? "block" : "none");

        if (paciente) {
            tituloFichaPaciente.textContent = `📋 Ficha Cama ${ubi}: ${paciente.nombre} (HC: ${paciente.hc})`;
            
            // Asignar valores guardados
            document.getElementById("ing-motivo").value = paciente.motivo || "";
            document.getElementById("ing-tiempo").value = paciente.tiempo || "";
            document.getElementById("ing-relato").value = paciente.relato || "";
            document.getElementById("fv-pa").value = paciente.pa || "";
            document.getElementById("fv-fc").value = paciente.fc || "";
            document.getElementById("fv-fr").value = paciente.fr || "";
            document.getElementById("fv-t").value = paciente.t || "";
            document.getElementById("plan-conducta").value = paciente.conducta || "Observacion";
            document.getElementById("plan-destino").value = paciente.destino || "";

            document.getElementById("t-hta").value = paciente.tHta || "";
            document.getElementById("t-dm2").value = paciente.tDm2 || "";
            document.getElementById("t-irc").value = paciente.tIrc || "";
            document.getElementById("ant-quirurgicos").value = paciente.antQx || "";
            document.getElementById("alergia-detalle").value = paciente.alergiaDetalle || "";
            document.getElementById("anticoag-detalle").value = paciente.anticoagDetalle || "";

            document.getElementById("sug-cardio").value = paciente.sugCardio || "";
            document.getElementById("sug-anestesia").value = paciente.sugAnestesia || "";
            document.getElementById("sug-neumo").value = paciente.sugNeumo || "";
            document.getElementById("txt-indicaciones-pro").value = paciente.indicacionesPro || document.getElementById("txt-indicaciones-pro").placeholder;

            document.getElementById("c-hta").checked = paciente.hta || false;
            document.getElementById("c-dm2").checked = paciente.dm2 || false;
            document.getElementById("c-irc").checked = paciente.irc || false;
            document.getElementById("r-cardio").checked = paciente.rCardio || false;
            document.getElementById("r-anestesia").checked = paciente.rAnestesia || false;
            document.getElementById("r-neumo").checked = paciente.rNeumo || false;

            // Qx y Lab
            if (paciente.qx) {
                document.getElementById("qx-proc").value = paciente.qx.proc || "";
                document.getElementById("qx-abordaje").value = paciente.qx.abordaje || "";
                document.getElementById("qx-hinicio").value = paciente.qx.hinicio || "";
                document.getElementById("qx-hfin").value = paciente.qx.hfin || "";
                document.getElementById("qx-cirujano").value = paciente.qx.cirujano || "";
                document.getElementById("qx-ayudante").value = paciente.qx.ayudante || "";
                document.getElementById("qx-anestesiologo").value = paciente.qx.anestesiologo || "";
                document.getElementById("qx-tipoanestesia").value = paciente.qx.tipoanestesia || "";
                document.getElementById("qx-personal").value = paciente.qx.personal || "";
                document.getElementById("qx-tecnica").value = paciente.qx.tecnica || "";
                document.getElementById("qx-hallazgos").value = paciente.qx.hallazgos || "";
                document.getElementById("qx-drenaje").value = paciente.qx.drenaje || "";
            }
        } else {
            tituloFichaPaciente.textContent = `📋 Cama ${ubi} - Sin paciente asignado.`;
            document.querySelectorAll(".paciente-detalle-container input[type='text'], .paciente-detalle-container textarea").forEach(el => el.value = "");
            document.querySelectorAll(".paciente-detalle-container input[type='checkbox']").forEach(el => el.checked = false);
        }
    }

    btnIngresoGeneral.addEventListener("click", () => { modalIngreso.style.display = "block"; });
    cerrarModal.addEventListener("click", () => { modalIngreso.style.display = "none"; });

    modalBtnGuardar.addEventListener("click", () => {
        const ubiSel = modalSelectCama.value;
        const nombre = document.getElementById("modal-nombre").value;
        const hc = document.getElementById("modal-hc").value;
        const dx = document.getElementById("modal-dx").value;

        if (!nombre) {
            alert("Ingrese el nombre del paciente.");
            return;
        }

        pacientesData[ubiSel] = { nombre, hc: hc || "S/N", diagnostico: dx || "En estudio", riesgo: "verde" };
        localStorage.setItem("pacientesData", JSON.stringify(pacientesData));
        modalIngreso.style.display = "none";
        renderCenso();
        abrirFichaPaciente(ubiSel);
    });

    btnGuardarHospitalizacion.addEventListener("click", () => {
        if (!camaActiva) return;
        if (!pacientesData[camaActiva]) pacientesData[camaActiva] = { nombre: "Paciente " + camaActiva, hc: "S/N" };

        let p = pacientesData[camaActiva];
        p.motivo = document.getElementById("ing-motivo").value;
        p.tiempo = document.getElementById("ing-tiempo").value;
        p.relato = document.getElementById("ing-relato").value;
        p.pa = document.getElementById("fv-pa").value;
        p.fc = document.getElementById("fv-fc").value;
        p.fr = document.getElementById("fv-fr").value;
        p.t = document.getElementById("fv-t").value;
        p.conducta = document.getElementById("plan-conducta").value;
        p.destino = document.getElementById("plan-destino").value;

        p.hta = document.getElementById("c-hta").checked;
        p.tHta = document.getElementById("t-hta").value;
        p.dm2 = document.getElementById("c-dm2").checked;
        p.tDm2 = document.getElementById("t-dm2").value;
        p.irc = document.getElementById("c-irc").checked;
        p.tIrc = document.getElementById("t-irc").value;
        p.antQx = document.getElementById("ant-quirurgicos").value;

        p.alergiaDetalle = document.getElementById("alergia-detalle").value;
        p.anticoagDetalle = document.getElementById("anticoag-detalle").value;

        p.rCardio = document.getElementById("r-cardio").checked;
        p.sugCardio = document.getElementById("sug-cardio").value;
        p.rAnestesia = document.getElementById("r-anestesia").checked;
        p.sugAnestesia = document.getElementById("sug-anestesia").value;
        p.rNeumo = document.getElementById("r-neumo").checked;
        p.sugNeumo = document.getElementById("sug-neumo").value;
        p.indicacionesPro = document.getElementById("txt-indicaciones-pro").value;

        localStorage.setItem("pacientesData", JSON.stringify(pacientesData));
        alert("¡Ficha clínica integral guardada exitosamente!");
    });

    btnGuardarQx.addEventListener("click", () => {
        if (!camaActiva) { alert("Seleccione un paciente primero."); return; }
        if (!pacientesData[camaActiva]) pacientesData[camaActiva] = {};

        pacientesData[camaActiva].qx = {
            proc: document.getElementById("qx-proc").value,
            abordaje: document.getElementById("qx-abordaje").value,
            hinicio: document.getElementById("qx-hinicio").value,
            hfin: document.getElementById("qx-hfin").value,
            cirujano: document.getElementById("qx-cirujano").value,
            ayudante: document.getElementById("qx-ayudante").value,
            anestesiologo: document.getElementById("qx-anestesiologo").value,
            tipoanestesia: document.getElementById("qx-tipoanestesia").value,
            personal: document.getElementById("qx-personal").value,
            tecnica: document.getElementById("qx-tecnica").value,
            hallazgos: document.getElementById("qx-hallazgos").value,
            drenaje: document.getElementById("qx-drenaje").value
        };

        localStorage.setItem("pacientesData", JSON.stringify(pacientesData));
        alert("¡Protocolo quirúrgico guardado exitosamente!");
    });

    function generarPaseWhatsApp() {
        let total = 0;
        let detalle = "";
        Object.keys(pacientesData).forEach(ubi => {
            if (pacientesData[ubi].nombre) {
                total++;
                detalle += `\n- [${ubi}] ${pacientesData[ubi].nombre} (HC: ${pacientesData[ubi].hc}) | Dx: ${pacientesData[ubi].diagnostico || 'En estudio'}`;
            }
        });

        textoPaseWhatsApp.textContent = `📋 PASE DE GUARDIA - CIRUGÍA GENERAL\n🏥 Sede: Hospital II-2 Tarapoto\n🛏️ Censo Total: ${total} pacientes.\n${detalle}\n\n⚠️ Todo registrado en SurgiFlow Pro.`;
    }

    renderCenso();
});

function cambiarSubTabHosp(num) {
    document.querySelectorAll('.hosp-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.subtab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`hosp-content-${num}`).style.display = 'block';
    event.currentTarget.classList.add('active');
}

function cargarEscala() {
    const tipo = document.getElementById("select-escala").value;
    const contenedor = document.getElementById("contenedor-escala-detalle");

    if (tipo === "alvarado") {
        contenedor.innerHTML = `
            <h4>Escala de Alvarado (Apendicitis Aguda)</h4>
            <p style="font-size:13px;">Seleccione los hallazgos clínicos presentes:</p>
            <label><input type="checkbox" class="alv" value="1"> Migración del dolor a FID (1 pto)</label><br>
            <label><input type="checkbox" class="alv" value="1"> Anorexia / Cetosis (1 pto)</label><br>
            <label><input type="checkbox" class="alv" value="1"> Náuseas y Vómitos (1 pto)</label><br>
            <label><input type="checkbox" class="alv" value="2"> Dolor en Fosa Iliaca Derecha (2 ptos)</label><br>
            <label><input type="checkbox" class="alv" value="1"> Dolor a la descompresión / Rebote (1 pto)</label><br>
            <label><input type="checkbox" class="alv" value="1"> Elevación de temperatura > 37.3°C (1 pto)</label><br>
            <label><input type="checkbox" class="alv" value="2"> Leucocitosis > 10,000 (2 ptos)</label><br>
            <label><input type="checkbox" class="alv" value="1"> Desviación izquierda / Abastonados (1 pto)</label><br>
            <button class="btn-pink" style="margin-top:10px;" onclick="calcularAlvarado()">Calcular Puntaje IA</button>
            <p id="resultado-alvarado" style="font-weight:bold; margin-top:10px; color:#be185d;"></p>
        `;
    } else {
        contenedor.innerHTML = `<h4>Criterios de Tokio / Caprini / MPI</h4><p style="font-size:13px;">Módulo interactivo de IA listo para cálculo rápido.</p>`;
    }
}

function calcularAlvarado() {
    let suma = 0;
    document.querySelectorAll('.alv:checked').forEach(el => suma += parseInt(el.value));
    let analisis = suma >= 7 ? "Puntaje >= 7: Apendicitis muy probable. Indicación quirúrgica." : (suma >= 5 ? "Puntaje 5-6: Compatible / Observación o imagen de apoyo." : "Puntaje < 5: Apendicitis poco probable.");
    document.getElementById("resultado-alvarado").textContent = `Puntaje Total: ${suma} / 10 &bull; Análisis: ${analisis}`;
}

function copiarPaseWhatsApp() {
    navigator.clipboard.writeText(document.getElementById("texto-pase-whatsapp").textContent);
    alert("¡Pase de guardia copiado al portapapeles!");
}
