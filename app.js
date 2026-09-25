document.addEventListener("DOMContentLoaded", () => {
    const gridCamas = document.getElementById("grid-camas");
    const navButtons = document.querySelectorAll(".nav-btn");
    const secciones = {
        "torre": document.getElementById("seccion-torre"),
        "hospitalizacion": document.getElementById("seccion-hospitalizacion"),
        "quirofano": document.getElementById("seccion-quirofano"),
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
                    const estadoAlta = paciente.aptoAlta ? "🌟 [APTO PARA ALTA]" : "";
                    card.innerHTML = `
                        <h3>Cama ${numCama} <span>🔴</span></h3>
                        <p><strong>Paciente:</strong> ${paciente.nombre}</p>
                        <p><strong>HC:</strong> ${paciente.hc}</p>
                        <p><strong>Dx:</strong> ${paciente.diagnostico || 'Sin diagnóstico'}</p>
                        <p style="color:#b91c1c; font-weight:bold;">${estadoAlta}</p>
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
            document.getElementById("hc-motivo").value = paciente.motivo || "";
            document.getElementById("hc-tiempo").value = paciente.tiempoEnf || "";
            document.getElementById("hc-relato").value = paciente.relato || "";
            document.getElementById("hc-apoyo").value = paciente.apoyoDiag || "";
            document.getElementById("hc-plan-inicial").value = paciente.planInicial || "Se opera de emergencia";
            
            document.getElementById("tr-hta").value = paciente.trHta || "";
            document.getElementById("tr-dm2").value = paciente.trDm2 || "";
            document.getElementById("tr-irc").value = paciente.trIrc || "";
            document.getElementById("ant-quirurgicos").value = paciente.antQuirurgicos || "";
            
            document.getElementById("r-cardio-det").value = paciente.rCardioDet || "";
            document.getElementById("r-anes-det").value = paciente.rAnesDet || "";
            document.getElementById("r-nefro-det").value = paciente.rNefroDet || "";
            document.getElementById("alergia-intensa").value = paciente.alergiaIntensa || "";
            document.getElementById("anticoag-farma").value = paciente.anticoagFarma || "";
            document.getElementById("anticoag-ultima").value = paciente.anticoagUltima || "";
            
            document.getElementById("lab-col-hb").value = paciente.labHb || "";
            document.getElementById("lab-col-leuco").value = paciente.labLeuco || "";
            document.getElementById("lab-col-cayados").value = paciente.labCayados || "";
            document.getElementById("lab-col-plaquetas").value = paciente.labPlaquetas || "";
            document.getElementById("lab-col-creat").value = paciente.labCreat || "";
            document.getElementById("lab-col-lactato").value = paciente.labLactato || "";
            
            if(paciente.indicaciones) document.getElementById("txt-indicaciones").value = paciente.indicaciones;
            document.getElementById("chk-alta").checked = paciente.aptoAlta || false;
            document.getElementById("txt-indicaciones-alta").value = paciente.indAlta || "";
            
            document.getElementById("chk-hta").checked = paciente.hta || false;
            document.getElementById("chk-dm2").checked = paciente.dm2 || false;
            document.getElementById("chk-irc").checked = paciente.irc || false;
            document.getElementById("r-cardio-chk").checked = paciente.rCardioChk || false;
            document.getElementById("r-anes-chk").checked = paciente.rAnesChk || false;
            document.getElementById("r-nefro-chk").checked = paciente.rNefroChk || false;
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

        pacientesData[camaActiva].motivo = document.getElementById("hc-motivo").value;
        pacientesData[camaActiva].tiempoEnf = document.getElementById("hc-tiempo").value;
        pacientesData[camaActiva].relato = document.getElementById("hc-relato").value;
        pacientesData[camaActiva].apoyoDiag = document.getElementById("hc-apoyo").value;
        pacientesData[camaActiva].planInicial = document.getElementById("hc-plan-inicial").value;
        
        pacientesData[camaActiva].trHta = document.getElementById("tr-hta").value;
        pacientesData[camaActiva].trDm2 = document.getElementById("tr-dm2").value;
        pacientesData[camaActiva].trIrc = document.getElementById("tr-irc").value;
        pacientesData[camaActiva].antQuirurgicos = document.getElementById("ant-quirurgicos").value;
        
        pacientesData[camaActiva].rCardioDet = document.getElementById("r-cardio-det").value;
        pacientesData[camaActiva].rAnesDet = document.getElementById("r-anes-det").value;
        pacientesData[camaActiva].rNefroDet = document.getElementById("r-nefro-det").value;
        pacientesData[camaActiva].alergiaIntensa = document.getElementById("alergia-intensa").value;
        pacientesData[camaActiva].anticoagFarma = document.getElementById("anticoag-farma").value;
        pacientesData[camaActiva].anticoagUltima = document.getElementById("anticoag-ultima").value;
        
        pacientesData[camaActiva].labHb = document.getElementById("lab-col-hb").value;
        pacientesData[camaActiva].labLeuco = document.getElementById("lab-col-leuco").value;
        pacientesData[camaActiva].labCayados = document.getElementById("lab-col-cayados").value;
        pacientesData[camaActiva].labPlaquetas = document.getElementById("lab-col-plaquetas").value;
        pacientesData[camaActiva].labCreat = document.getElementById("lab-col-creat").value;
        pacientesData[camaActiva].labLactato = document.getElementById("lab-col-lactato").value;
        
        pacientesData[camaActiva].indicaciones = document.getElementById("txt-indicaciones").value;
        pacientesData[camaActiva].aptoAlta = document.getElementById("chk-alta").checked;
        pacientesData[camaActiva].indAlta = document.getElementById("txt-indicaciones-alta").value;

        pacientesData[camaActiva].hta = document.getElementById("chk-hta").checked;
        pacientesData[camaActiva].dm2 = document.getElementById("chk-dm2").checked;
        pacientesData[camaActiva].irc = document.getElementById("chk-irc").checked;
        pacientesData[camaActiva].rCardioChk = document.getElementById("r-cardio-chk").checked;
        pacientesData[camaActiva].rAnesChk = document.getElementById("r-anes-chk").checked;
        paciente = pacientesData[camaActiva];
        pacientesData[camaActiva].rNefroChk = document.getElementById("r-nefro-chk").checked;

        localStorage.setItem("pacientesData", JSON.stringify(pacientesData));
        alert("¡Historia clínica y quirúrgica guardada exitosamente!");
        renderCenso();
    });

    function generarPaseWhatsApp() {
        let total = 0;
        let aptosAlta = 0;
        let detalle = "";
        Object.keys(pacientesData).forEach(cama => {
            if (pacientesData[cama].nombre) {
                total++;
                if (pacientesData[cama].aptoAlta) aptosAlta++;
                detalle += `\n- Cama ${cama}: ${pacientesData[cama].nombre} (HC: ${pacientesData[cama].hc}) | Dx: ${pacientesData[cama].diagnostico} | Plan: ${pacientesData[cama].planInicial || 'En observación'}`;
            }
        });

        textoPaseWhatsApp.textContent = `📋 PASE DE GUARDIA - CIRUGÍA GENERAL\n🏥 Sede: Hospital II-2 Tarapoto\n🛏️ Censo Total: ${total} pacientes (${aptosAlta} listos para alta).\n${detalle}\n\n⚠️ Revisar indicaciones y pendientes en SurgiFlow Pro.`;
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
