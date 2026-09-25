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
            document.getElementById("txt-tratamiento-habitual").value = paciente.tratamientoHabitual || "";
            document.getElementById("txt-alergias").value = paciente.alergias || "";
            document.getElementById("txt-anticoag").value = paciente.anticoag || "";
            
            document.getElementById("q-abordaje").value = paciente.abordaje || "Laparoscópica";
            document.getElementById("q-herida").value = paciente.herida || "Limpia";
            document.getElementById("q-tecnica").value = paciente.tecnica || "";
            document.getElementById("q-cirujano").value = paciente.cirujano || "";
            document.getElementById("q-drenaje").value = paciente.drenaje || "";
            
            document.getElementById("lab-hb").value = paciente.hb || "";
            document.getElementById("lab-leuco").value = paciente.leuco || "";
            document.getElementById("lab-cayados").value = paciente.cayados || "";
            document.getElementById("lab-creat").value = paciente.creat || "";
            document.getElementById("lab-lactato").value = paciente.lactato || "";
            document.getElementById("lab-inr").value = paciente.inr || "";
            document.getElementById("score-alvarado").value = paciente.alvarado || "";
            document.getElementById("score-tokio").value = paciente.tokio || "";
            
            document.getElementById("txt-indicaciones").value = paciente.indicaciones || "";
            document.getElementById("txt-plan").value = paciente.plan || "";
            
            document.getElementById("chk-hta").checked = paciente.hta || false;
            document.getElementById("chk-dm2").checked = paciente.dm2 || false;
            document.getElementById("chk-irc").checked = paciente.irc || false;
            document.getElementById("chk-epoc").checked = paciente.epoc || false;
            document.getElementById("chk-cardiopatia").checked = paciente.cardiopatia || false;
            document.getElementById("chk-cirugia").checked = paciente.cirugiaPrev || false;

            document.getElementById("riesgo-cardio").checked = paciente.rCardio || false;
            document.getElementById("riesgo-anestesia").checked = paciente.rAnestesia || false;
            document.getElementById("riesgo-neumo").checked = paciente.rNeumo || false;
            document.getElementById("riesgo-nefro").checked = paciente.rNefro || false;
        } else {
            tituloFichaPaciente.textContent = `📋 Cama ${numCama} - Sin paciente asignado.`;
            // Limpiar campos
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

        pacientesData[camaActiva].tratamientoHabitual = document.getElementById("txt-tratamiento-habitual").value;
        pacientesData[camaActiva].alergias = document.getElementById("txt-alergias").value;
        pacientesData[camaActiva].anticoag = document.getElementById("txt-anticoag").value;
        
        pacientesData[camaActiva].abordaje = document.getElementById("q-abordaje").value;
        pacientesData[camaActiva].herida = document.getElementById("q-herida").value;
        pacientesData[camaActiva].tecnica = document.getElementById("q-tecnica").value;
        pacientesData[camaActiva].cirujano = document.getElementById("q-cirujano").value;
        pacientesData[camaActiva].drenaje = document.getElementById("q-drenaje").value;
        
        pacientesData[camaActiva].hb = document.getElementById("lab-hb").value;
        pacientesData[camaActiva].leuco = document.getElementById("lab-leuco").value;
        pacientesData[camaActiva].cayados = document.getElementById("lab-cayados").value;
        pacientesData[camaActiva].creat = document.getElementById("lab-creat").value;
        pacientesData[camaActiva].lactato = document.getElementById("lab-lactato").value;
        pacientesData[camaActiva].inr = document.getElementById("lab-inr").value;
        pacientesData[camaActiva].alvarado = document.getElementById("score-alvarado").value;
        pacientesData[camaActiva].tokio = document.getElementById("score-tokio").value;
        
        pacientesData[camaActiva].indicaciones = document.getElementById("txt-indicaciones").value;
        pacientesData[camaActiva].plan = document.getElementById("txt-plan").value;

        pacientesData[camaActiva].hta = document.getElementById("chk-hta").checked;
        pacientesData[camaActiva].dm2 = document.getElementById("chk-dm2").checked;
        pacientesData[camaActiva].irc = document.getElementById("chk-irc").checked;
        pacientesData[camaActiva].epoc = document.getElementById("chk-epoc").checked;
        pacientesData[camaActiva].cardiopatia = document.getElementById("chk-cardiopatia").checked;
        pacientesData[camaActiva].cirugiaPrev = document.getElementById("chk-cirugia").checked;

        pacientesData[camaActiva].rCardio = document.getElementById("riesgo-cardio").checked;
        pacientesData[camaActiva].rAnestesia = document.getElementById("riesgo-anestesia").checked;
        pacientesData[camaActiva].rNeumo = document.getElementById("riesgo-neumo").checked;
        pacientesData[camaActiva].rNefro = document.getElementById("riesgo-nefro").checked;

        localStorage.setItem("pacientesData", JSON.stringify(pacientesData));
        alert("¡Ficha clínica completa guardada exitosamente!");
    });

    function generarPaseWhatsApp() {
        let total = 0;
        let detalle = "";
        Object.keys(pacientesData).forEach(cama => {
            if (pacientesData[cama].nombre) {
                total++;
                detalle += `\n- Cama ${cama}: ${pacientesData[cama].nombre} (HC: ${pacientesData[cama].hc}) | Dx: ${pacientesData[cama].diagnostico}`;
            }
        });

        textoPaseWhatsApp.textContent = `📋 PASE DE GUARDIA - CIRUGÍA GENERAL\n🏥 Sede: Hospital II-2 Tarapoto\n🛏️ Censo Total: ${total} pacientes.\n${detalle}\n\n⚠️ Revisar indicaciones y pendientes en SurgiFlow.`;
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
