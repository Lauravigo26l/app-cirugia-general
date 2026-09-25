document.addEventListener("DOMContentLoaded", () => {
    const gridCamas = document.getElementById("grid-camas");
    const gridExtras = document.getElementById("grid-extras");
    const modal = document.getElementById("modal-paciente");
    const closeModal = document.querySelector(".close");
    const formPaciente = document.getElementById("form-paciente");
    
    const totalPacientesEl = document.getElementById("total-pacientes");
    const totalPrestadasEl = document.getElementById("total-prestadas");
    const totalUrpaEl = document.getElementById("total-urpa");

    // Habitaciones de tu servicio real
    const habitaciones = ["218", "219", "220", "221", "222", "223", "224"];
    const letras = ["A", "B"];

    // Base de datos local en el navegador (Carga o inicializa)
    let pacientesData = JSON.parse(localStorage.getItem("pacientesData")) || {};

    let camaSeleccionada = null;

    function renderCenso() {
        gridCamas.innerHTML = "";
        gridExtras.innerHTML = "";
        
        let countTotal = 0;
        let countPrestadas = 0;
        let countUrpa = 0;

        // 1. Renderizar camas oficiales del servicio (218-A a 224-B)
        habitaciones.forEach(hab => {
            letras.forEach(letra => {
                const numCama = `${hab}-${letra}`;
                const paciente = pacientesData[numCama];

                const card = document.createElement("div");
                card.className = "cama-card";
                
                if (paciente) {
                    card.classList.add(paciente.riesgo); // verde, amarillo o rojo
                    card.innerHTML = `
                        <h3>Cama ${numCama} <span>🔴</span></h3>
                        <p><strong>Paciente:</strong> ${paciente.nombre}</p>
                        <p><strong>HC:</strong> ${paciente.hc}</p>
                        <p><strong>Dx:</strong> ${paciente.diagnostico || 'Sin diagnóstico'}</p>
                    `;
                    countTotal++;
                } else {
                    card.innerHTML = `
                        <h3>Cama ${numCama} <span>🟢</span></h3>
                        <p><strong>Estado:</strong> Disponible / Libre</p>
                        <p><em>Hacer clic para registrar</em></p>
                    `;
                }

                card.addEventListener("click", () => abrirModal(numCama, paciente));
                gridCamas.appendChild(card);
            });
        });

        // 2. Renderizar Camas Prestadas y URPA
        Object.keys(pacientesData).forEach(key => {
            if (key.startsWith("PRESTADA-") || key.startsWith("URPA-")) {
                const paciente = pacientesData[key];
                const card = document.createElement("div");
                card.className = `cama-card ${paciente.riesgo}`;
                
                card.innerHTML = `
                    <h3>${key}</h3>
                    <p><strong>Paciente:</strong> ${paciente.nombre}</p>
                    <p><strong>HC:</strong> ${paciente.hc}</p>
                    <p><strong>Dx:</strong> ${paciente.diagnostico}</p>
                `;

                if (paciente.tipo === "prestada") countPrestadas++;
                if (paciente.tipo === "urpa") countUrpa++;
                countTotal++;

                card.addEventListener("click", () => abrirModal(key, paciente));
                gridExtras.appendChild(card);
            }
        });

        // Actualizar contadores superiores
        totalPacientesEl.textContent = countTotal;
        totalPrestadasEl.textContent = countPrestadas;
        totalUrpaEl.textContent = countUrpa;

        // Guardar en almacenamiento local
        localStorage.setItem("pacientesData", JSON.stringify(pacientesData));
    }

    function abrirModal(camaId, paciente) {
        camaSeleccionada = camaId;
        document.getElementById("input-cama").value = camaId;
        
        if (paciente) {
            document.getElementById("input-nombre").value = paciente.nombre || "";
            document.getElementById("input-hc").value = paciente.hc || "";
            document.getElementById("input-diagnostico").value = paciente.diagnostico || "";
            document.getElementById("input-riesgo").value = paciente.riesgo || "verde";
            document.getElementById("input-tipo").value = paciente.tipo || "propia";
        } else {
            formPaciente.reset();
            document.getElementById("input-cama").value = camaId;
        }

        modal.style.display = "block";
    }

    closeModal.addEventListener("click", () => { modal.style.display = "none"; });
    window.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

    // Botón para agregar paciente extra (Prestada o URPA)
    document.getElementById("btn-ingreso").addEventListener("click", () => {
        const tipoExtra = prompt("¿Qué deseas registrar?\nEscribe 1 para Cama Prestada (ej. en Medicina)\nEscribe 2 para Paciente Retenido en URPA");
        if (tipoExtra === "1") {
            const nombreServicio = prompt("Indique el servicio y cama (Ej. Medicina - Cama 412):");
            if (nombreServicio) abrirModal(`PRESTADA-${nombreServicio}`, null);
        } else if (tipoExtra === "2") {
            const idUrpa = prompt("Identificador del paciente en URPA (Ej. URPA-01):");
            if (idUrpa) abrirModal(`URPA-${idUrpa}`, null);
        }
    });

    // Guardar formulario
    formPaciente.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const nombre = document.getElementById("input-nombre").value;
        const hc = document.getElementById("input-hc").value;
        const diagnostico = document.getElementById("input-diagnostico").value;
        const riesgo = document.getElementById("input-riesgo").value;
        const tipo = document.getElementById("input-tipo").value;

        pacientesData[camaSeleccionada] = { nombre, hc, diagnostico, riesgo, tipo };

        modal.style.display = "none";
        renderCenso();
    });

    // Inicializar censo en pantalla
    renderCenso();
});
