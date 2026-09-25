document.addEventListener("DOMContentLoaded", () => {
    const gridCamas = document.getElementById("grid-camas");
    const navButtons = document.querySelectorAll(".nav-btn");
    const secciones = {
        "torre": document.getElementById("seccion-torre"),
        "hospitalizacion": document.getElementById("seccion-hospitalizacion"),
        "emergencia": document.getElementById("seccion-emergencia")
    };

    const habitaciones = ["218", "219", "220", "221", "222", "223", "224"];
    const letras = ["A", "B"];

    let pacientesData = JSON.parse(localStorage.getItem("pacientesData")) || {};

    // Sistema de Pestañas Superiores
    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            navButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const tabName = btn.getAttribute("data-tab");
            Object.keys(secciones.forEach(sec => {
                if(secciones[sec]) secciones[sec].style.display = "none";
            }));
            
            // Mostrar la sección seleccionada
            if(tabName === "torre") secciones.torre.style.display = "block";
            if(tabName === "hospitalizacion") secciones.hospitalizacion.style.display = "block";
            if(tabName === "emergencia") secciones.emergencia.style.display = "block";
        });
    });

    function renderCenso() {
        gridCamas.innerHTML = "";

        habitaciones.forEach(hab => {
            letras.forEach(letra => {
                const numCama = `${hab}-${letra}`;
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
                        <p><em>Hacer clic para registrar paciente</em></p>
                    `;
                }

                card.addEventListener("click", () => {
                    const nombre = prompt(`Registrar paciente para Cama ${numCama}\nIngrese Apellidos y Nombres:`);
                    if (nombre) {
                        const hc = prompt("Ingrese Historia Clínica (HC):") || "S/N";
                        const diagnostico = prompt("Ingrese Diagnóstico Principal:") || "Post-operatorio";
                        pacientesData[numCama] = { nombre, hc, diagnostico, riesgo: "verde" };
                        localStorage.setItem("pacientesData", JSON.stringify(pacientesData));
                        renderCenso();
                    }
                });

                gridCamas.appendChild(card);
            });
        });
    }

    document.getElementById("btn-ingreso").addEventListener("click", () => {
        alert("Selecciona directamente una tarjeta de cama verde en la grilla para registrar al paciente.");
    });

    renderCenso();
});
