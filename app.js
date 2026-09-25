document.addEventListener("DOMContentLoaded", () => {
    const gridCamas = document.getElementById("grid-camas");
    const navButtons = document.querySelectorAll(".nav-btn");
    const secciones = {
        "torre": document.getElementById("seccion-torre"),
        "hospitalizacion": document.getElementById("seccion-hospitalizacion"),
        "emergencia": document.getElementById("seccion-emergencia")
    };

    const modalIngreso = document.getElementById("modal-ingreso");
    const btnIngresoGeneral = document.getElementById("btn-ingreso-general");
    const cerrarModal = document.getElementById("cerrar-modal");
    const modalSelectCama = document.getElementById("modal-select-cama");
    const modalBtnGuardar = document.getElementById("modal-btn-guardar");

    const tituloFichaPaciente = document.getElementById("titulo-ficha-paciente");
    const btnGuardarFicha = document.getElementById("btn-guardar-ficha");

    const habitaciones = ["218", "219", "220", "221", "222", "223", "224"];
    const letras = ["A", "B"];

    let pacientesData = JSON.parse(localStorage.getItem("pacientesData")) || {};
    let camaActiva = null;

    // Navegación de pestañas principales
    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            navButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const tabName = btn.getAttribute("data-tab");
            Object.keys(secciones).forEach(sec => {
                secciones[sec].style.display = (sec === tabName) ? "block" : "none";
            });
        });
    });

    // Renderizar grilla de camas
    function renderCenso() {
        gridCamas.innerHTML = "";
        modalSelectCama.innerHTML = "";

        habitaciones.forEach(hab => {
            letras.forEach(letra => {
                const numCama = `${hab}-${letra}`;
                
                // Llenar selector del modal
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

                card.addEventListener("click", () => {
                    abrirFichaPaciente(numCama);
                });

                gridCamas.appendChild(card);
            });
        });
    }

    function abrirFichaPaciente(numCama) {
        camaActiva = numCama;
        const paciente = pacientesData[numCama];

        // Cambiar a la pestaña de hospitalización
        navButtons.forEach(b => b.classList.remove("active"));
        document.querySelector('[data-tab="hospitalizacion"]').classList.add("active");
        secciones.torre.style.display = "none";
        secciones.hospitalizacion.style.display = "block";
        secciones.emergencia.style.display = "none";

        if (paciente) {
            tituloFichaPaciente.textContent = `📋 Ficha de Cama ${numCama}: ${paciente.nombre} (HC: ${paciente.hc})`;
            document.getElementById("txt-tratamiento-habitual").value = paciente.tratamientoHabitual || "";
            document.getElementById("q-abordaje").value = paciente.abordaje || "Laparoscópica";
            document.getElementById("q-tecnica").value = paciente.tecnica || "";
            document.getElementById("q-cirujano").value = paciente.cirujano || "";
            document.getElementById("q-drenaje").value = paciente.drenaje || "";
            document.getElementById("lab-hb").value = paciente.hb || "";
            document.getElementById("lab-leuco").value = paciente.leuco || "";
            document.getElementById("lab-cayados").value = paciente.cayados || "";
            document.getElementById("lab-creat").value = paciente.creat || "";
            document.getElementById("lab-lactato").value = paciente.lactato || "";
            document.getElementById("lab-inr").value = paciente.inr || "";
            document.getElementById("txt-indicaciones").value = paciente.indicaciones || "";
        } else {
            tituloFichaPaciente.textContent = `📋 Cama ${numCama} - Sin paciente asignado. Registre datos abajo:`;
            document.getElementById("txt-tratamiento-habitual").value = "";
            document.getElementById("q-tecnica").value = "";
            document.getElementById("txt-indicaciones").value = "";
        }
    }

    // Modal de ingreso
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
            diagnostico: dx || "Evaluación por cirugía",
            riesgo: "verde"
        };

        localStorage.setItem("pacientesData", JSON.stringify(pacientesData));
        modalIngreso.style.display = "none";
        renderCenso();
        abrirFichaPaciente(camaSel);
    });

    // Guardar Ficha Clínica
    btnGuardarFicha.addEventListener("click", () => {
        if (!camaActiva) {
            alert("Seleccione una cama primero.");
            return;
        }

        if (!pacientesData[camaActiva]) {
            pacientesData[camaActiva] = { nombre: "Paciente Cama " + camaActiva, hc: "S/N", diagnostico: "En estudio", riesgo: "verde" };
        }

        pacientesData[camaActiva].tratamientoHabitual = document.getElementById("txt-tratamiento-habitual").value;
        pacientesData[camaActiva].abordaje = document.getElementById("q-abordaje").value;
        pacientesData[camaActiva].tecnica = document.getElementById("q-tecnica").value;
        pacientesData[camaActiva].cirujano = document.getElementById("q-cirujano").value;
        pacientesData[camaActiva].drenaje = document.getElementById("q-drenaje").value;
        pacientesData[camaActiva].hb = document.getElementById("lab-hb").value;
        pacientesData[camaActiva].leuco = document.getElementById("lab-leuco").value;
        pacientesData[camaActiva].cayados = document.getElementById("lab-cayados").value;
        pacientesData[camaActiva].creat = document.getElementById("lab-creat").value;
        pacientesData[camaActiva].lactato = document.getElementById("lab-lactato").value;
        pacientesData[camaActiva].inr = document.getElementById("lab-inr").value;
        pacientesData[camaActiva].indicaciones = document.getElementById("txt-indicaciones").value;

        localStorage.setItem("pacientesData", JSON.stringify(pacientesData));
        alert("¡Datos del paciente guardados exitosamente en la nube local!");
    });

    renderCenso();
});

// Función global para cambiar sub-pestañas
function cambiarSubTab(num) {
    document.querySelectorAll('.subtab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.subtab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`subtab-content-${num}`).style.display = 'block';
    event.currentTarget.classList.add('active');
}
