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
                        ${paciente.candidatoAlta ? '<p style="color:#059669; font-weight:bold;">✨ Candidato a Alta</p>' : ''}
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
            
            document.getElementById("ing-motivo").value = paciente.motivo || "";
            document.getElementById("ing-tiempo").value = paciente.tiempoEnf || "";
            document.getElementById("ing-relato").value = paciente.relato || "";
            
            document.getElementById("fv-pa").value = paciente.fvPa || "";
            document.getElementById("fv-fc").value = paciente.fvFc || "";
            document.getElementById("fv-fr").value = paciente.fvFr || "";
            document.getElementById("fv-temp").value = paciente.fvTemp || "";
            document.getElementById("fv-sat").value = paciente.fvSat || "";
            document.getElementById("ing-plan-estrategico").value = paciente.planEstrategico || "Observación en piso";

            document.getElementById("tr-hta").value = paciente.trHta || "";
            document.getElementById("tr-dm2").value = paciente.trDm2 || "";
            document.getElementById("tr-irc").value = paciente.trIrc || "";
            document.getElementById("tr-epoc").value = paciente.trEpoc || "";
            document.getElementById("txt-ant-quirurgicos").value = paciente.antQuirurgicos || "";
            document.getElementById("txt-riesgos-especialistas").value = paciente.riesgosEspecialistas || "";

            document.getElementById("txt-alergias-intenso").value = paciente.alergiasIntenso || "";
            document.getElementById("ant-farmaco").value = paciente.antFarmaco || "";
            document.getElementById("ant-ult-toma").value = paciente.antUltToma || "";
            document.getElementById("ant-sugerencia").value = paciente.antSugerencia || "";

            document.getElementById("q-procedimiento").value = paciente.procedimiento || "Apendicectomía Laparoscópica";
            document.getElementById("q-abordaje").value = paciente.abordaje || "Laparoscópico";
            document.getElementById("q-cirujano").value = paciente.cirujano || "";
            document.getElementById("q-asistente").value = paciente.asistente || "";
            document.getElementById("q-anestesiologo").value = paciente.anestesiologo || "";
            document.getElementById("q-licenciada").value = paciente.licenciada || "";
            document.getElementById("q-tecnico").value = paciente.tecnico || "";
            document.getElementById("q-tiempo").value = paciente.qTiempo || "";
            document.getElementById("q-hallazgos").value = paciente.hallazgos || "";
            document.getElementById("q-tecnica").value = paciente.qTecnica || "";
            document.getElementById("q-drenaje").value = paciente.qDrenaje || "";
            document.getElementById("q-debito").value = paciente.qDebito || "";

            document.getElementById("lab-fecha").value = paciente.labFecha || "";
            document.getElementById("lab-hb").value = paciente.hb || "";
            document.getElementById("lab-leuco").value = paciente.leuco || "";
            document.getElementById("lab-cayados").value = paciente.cayados || "";
            document.getElementById("lab-plaquetas").value = paciente.plaquetas || "";
            document.getElementById("lab-creat").value = paciente.creat || "";
            document.getElementById("lab-urea").value = paciente.urea || "";
            document.getElementById("lab-glucosa").value = paciente.glucosa || "";
            document.getElementById("lab-lactato").value = paciente.lactato || "";

            if(paciente.indicaciones) document.getElementById("txt-indicaciones").value = paciente.indicaciones;
            document.getElementById("chk-candidato-alta").checked = paciente.candidatoAlta || false;
            document.getElementById("txt-indicaciones-alta").value = paciente.indAlta || "";

            document.getElementById("chk-hta").checked = paciente.hta || false;
            document.getElementById("chk-dm2").checked = paciente.dm2 || false;
            document.getElementById("chk-irc").checked = paciente.irc || false;
            document.getElementById("chk-epoc").checked = paciente.epoc || false;
        } else {
            tituloFichaPaciente.textContent = `📋 Cama ${numCama} - Sin paciente asignado.`;
            document.querySelectorAll(".paciente-detalle-container input[type='text'], .paciente-detalle-container textarea").forEach(el => el.value = "");
            document.querySelectorAll(".paciente-detalle-container input[type='checkbox']").forEach(el => el.checked = false);
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
        p.motivo = document.getElementById("ing-motivo").value;
        p.tiempoEnf = document.getElementById("ing-tiempo").value;
        p.relato = document.getElementById("ing-relato").value;

        p.fvPa = document.getElementById("fv-pa").value;
        p.fvFc = document.getElementById("fv-fc").value;
        p.fvFr = document.getElementById("fv-fr").value;
        p.fvTemp = document.getElementById("fv-temp").value;
        p.fvSat = document.getElementById("fv-sat").value;
        p.planEstrategico = document.getElementById("ing-plan-estrategico").value;

        p.trHta = document.getElementById("tr-hta").value;
        p.trDm2 = document.getElementById("tr-dm2").value;
        p.trIrc = document.getElementById("tr-irc").value;
        p.trEpoc = document.getElementById("tr-epoc").value;
        p.antQuirurgicos = document.getElementById("txt-ant-quirurgicos").value;
        p.riesgosEspecialistas = document.getElementById("txt-riesgos-especialistas").value;

        p.alergiasIntenso = document.getElementById("txt-alergias-intenso").value;
        p.antFarmaco = document.getElementById("ant-farmaco").value;
        p.antUltToma = document.getElementById("ant-ult-toma").value;
        p.antSugerencia = document.getElementById("ant-sugerencia").value;

        p.procedimiento = document.getElementById("q-procedimiento").value;
        p.abordaje = document.getElementById("q-abordaje").value;
        p.cirujano = document.getElementById("q-cirujano").value;
        p.asistente = document.getElementById("q-asistente").value;
        p.anestesiologo = document.getElementById("q-anestesiologo").value;
        p.licenciada = document.getElementById("q-licenciada").value;
        p.tecnico = document.getElementById("q-tecnico").value;
        p.qTiempo = document.getElementById("q-tiempo").value;
        p.hallazgos = document.getElementById("q-hallazgos").value;
        p.qTecnica = document.getElementById("q-tecnica").value;
        p.qDrenaje = document.getElementById("q-drenaje").value;
        p.qDebito = document.getElementById("q-debito").value;

        p.labFecha = document.getElementById("lab-fecha").value;
        p.hb = document.getElementById("lab-hb").value;
        p.leuco = document.getElementById("lab-leuco").value;
        p.cayados = document.getElementById("lab-cayados").value;
        p.plaquetas = document.getElementById("lab-plaquetas").value;
        p.creat = document.getElementById("lab-creat").value;
        p.urea = document.getElementById("lab-urea").value;
        p.glucosa = document.getElementById("lab-glucosa").value;
        p.lactato = document.getElementById("lab-lactato").value;

        p.indicaciones = document.getElementById("txt-indicaciones").value;
        p.candidatoAlta = document.getElementById("chk-candidato-alta").checked;
        p.indAlta = document.getElementById("txt-indicaciones-alta").value;

        p.hta = document.getElementById("chk-hta").checked;
        p.dm2 = document.getElementById("chk-dm2").checked;
        p.irc = document.getElementById("chk-irc").checked;
        p.epoc = document.getElementById("chk-epoc").checked;

        localStorage.setItem("pacientesData", JSON.stringify(pacientesData));
        alert("¡Ficha clínica completa guardada exitosamente!");
        renderCenso();
    });

    function generarPaseWhatsApp() {
        let total = 0;
        let detalle = "";
        Object.keys(pacientesData).forEach(cama => {
            if (pacientesData[cama].nombre) {
                total++;
                detalle += `\n- Cama ${cama}: ${pacientesData[cama].nombre} (HC: ${pacientesData[cama].hc}) | Plan: ${pacientesData[cama].planEstrategico || 'En observación'}${pacientesData[cama].candidatoAlta ? ' [✨ ALTA]' : ''}`;
            }
        });

        textoPaseWhatsApp.textContent = `📋 PASE DE GUARDIA - CIRUGÍA GENERAL\n🏥 Sede: Hospital II-2 Tarapoto\n🛏️ Censo Total: ${total} pacientes.\n${detalle}\n\n⚠️ Gestionado con SurgiFlow Pro.`;
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
