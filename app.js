document.addEventListener("DOMContentLoaded", () => {
    const gridPropias = document.getElementById("grid-camas-propias");
    const gridUrpa = document.getElementById("grid-camas-urpa");
    const gridPrestadas = document.getElementById("grid-camas-prestadas");

    const navButtons = document.querySelectorAll(".nav-btn");
    const secciones = {
        "torre": document.getElementById("seccion-torre"),
        "hospitalizacion": document.getElementById("seccion-hospitalizacion")
    };

    const modalIngreso = document.getElementById("modal-ingreso");
    const btnIngresoGeneral = document.getElementById("btn-ingreso-general");
    const cerrarModal = document.getElementById("cerrar-modal");
    const modalTipoUbicacion = document.getElementById("modal-tipo-ubicacion");
    const modalSelectUbicacion = document.getElementById("modal-select-ubicacion");
    const modalCustomUbicacion = document.getElementById("modal-custom-ubicacion");
    const modalBtnGuardar = document.getElementById("modal-btn-guardar");

    const tituloFichaPaciente = document.getElementById("titulo-ficha-paciente");
    const btnGuardarM1 = document.getElementById("btn-guardar-m1");

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
        });
    });

    function renderCenso() {
        gridPropias.innerHTML = "";
        gridUrpa.innerHTML = "";
        gridPrestadas.innerHTML = "";

        // 1. Camas Propias (218-A a 224-B)
        habitaciones.forEach(hab => {
            letras.forEach(letra => {
                const ubi = `${hab}-${letra}`;
                crearTarjetaCama(gridPropias, ubi, "propia");
            });
        });

        // 2. Camas URPA y Prestadas registradas dinámicamente
        Object.keys(pacientesData).forEach(ubi => {
            if (ubi.startsWith("URPA-")) {
                crearTarjetaCama(gridUrpa, ubi, "urpa");
            } else if (ubi.startsWith("PRESTADA-")) {
                crearTarjetaCama(gridPrestadas, ubi, "prestada");
            }
        });

        // Si no hay URPA o Prestadas, mostrar aviso
        if (gridUrpa.children.length === 0) {
            gridUrpa.innerHTML = `<p style="font-size: 13px; color: #64748b; font-style: italic;">No hay pacientes retenidos en URPA actualmente.</p>`;
        }
        if (gridPrestadas.children.length === 0) {
            gridPrestadas.innerHTML = `<p style="font-size: 13px; color: #64748b; font-style: italic;">No hay camas prestadas (Traumatología/Medicina) ocupadas.</p>`;
        }
        
        actualizarSelectorUbicaciones();
    }

    function crearTarjetaCama(contenedor, ubi, tipo) {
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
        contenedor.appendChild(card);
    }

    window.actualizarSelectorUbicaciones = function() {
        const tipo = modalTipoUbicacion.value;
        modalSelectUbicacion.innerHTML = "";
        
        if (tipo === "propia") {
            modalSelectUbicacion.style.display = "block";
            modalCustomUbicacion.style.display = "none";
            habitaciones.forEach(hab => {
                letras.forEach(letra => {
                    const ubi = `${hab}-${letra}`;
                    if (!pacientesData[ubi]) { // Solo mostrar libres o permitir selección
                        const opt = document.createElement("option");
                        opt.value = ubi;
                        opt.textContent = `Cama ${ubi}`;
                        modalSelectUbicacion.appendChild(opt);
                    }
                });
            });
        } else {
            modalSelectUbicacion.style.display = "none";
            modalCustomUbicacion.style.display = "block";
            modalCustomUbicacion.placeholder = tipo === "urpa" ? "Ej. URPA-01, URPA-02" : "Ej. Traumatología - Cama 302";
        }
    }

    function abrirFichaPaciente(ubi) {
        camaActiva = ubi;
        const paciente = pacientesData[ubi];

        navButtons.forEach(b => b.classList.remove("active"));
        document.querySelector('[data-tab="hospitalizacion"]').classList.add("active");
        secciones.torre.style.display = "none";
        secciones.hospitalizacion.style.display = "block";

        if (paciente) {
            tituloFichaPaciente.textContent = `📋 Ficha Ubicación ${ubi}: ${paciente.nombre} (HC: ${paciente.hc})`;
            document.getElementById("m1-motivo").value = paciente.motivo || "";
            document.getElementById("m1-te").value = paciente.te || "";
            document.getElementById("m1-relato").value = paciente.relato || "";
            document.getElementById("m1-pa").value = paciente.pa || "120/80";
            document.getElementById("m1-fc").value = paciente.fc || "82";
            document.getElementById("m1-fr").value = paciente.fr || "18";
            document.getElementById("m1-t").value = paciente.t || "37.0";
            document.getElementById("m1-sato2").value = paciente.sato2 || "98";
            document.getElementById("m1-diuresis").value = paciente.diuresis || "1.0";
            document.getElementById("m1-conducta").value = paciente.conducta || "Observacion";
            document.getElementById("m1-destino").value = paciente.destino || "";

            document.getElementById("chk-hta").checked = paciente.hta || false;
            document.getElementById("trat-hta").value = paciente.tHta || "";
            document.getElementById("chk-dm2").checked = paciente.dm2 || false;
            document.getElementById("trat-dm2").value = paciente.tDm2 || "";
            document.getElementById("chk-irc").checked = paciente.irc || false;
            document.getElementById("trat-irc").value = paciente.tIrc || "";

            document.getElementById("ant-anio").value = paciente.antAnio || "";
            document.getElementById("ant-proc").value = paciente.antProc || "";
            document.getElementById("ant-comp").value = paciente.antComp || "";
            document.getElementById("ant-lugar").value = paciente.antLugar || "";

            document.getElementById("m1-alergias").value = paciente.alergiaDetalle || "";
            document.getElementById("m1-anticoag").value = paciente.anticoagDetalle || "";
        } else {
            tituloFichaPaciente.textContent = `📋 Ubicación ${ubi} - Sin paciente asignado.`;
            document.querySelectorAll("input[type='text'], textarea").forEach(el => {
                if(!el.id.includes("fv-")) el.value = "";
            });
            document.querySelectorAll("input[type='checkbox']").forEach(el => el.checked = false);
        }
    }

    btnIngresoGeneral.addEventListener("click", () => { 
        modalIngreso.style.display = "block"; 
        actualizarSelectorUbicaciones();
    });
    cerrarModal.addEventListener("click", () => { modalIngreso.style.display = "none"; });

    modalBtnGuardar.addEventListener("click", () => {
        const tipo = modalTipoUbicacion.value;
        let ubiSel = "";

        if (tipo === "propia") {
            ubiSel = modalSelectUbicacion.value;
        } else if (tipo === "urpa") {
            const val = modalCustomUbicacion.value.trim();
            ubiSel = val ? `URPA-${val}` : "URPA-01";
        } else if (tipo === "prestada") {
            const val = modalCustomUbicacion.value.trim();
            ubiSel = val ? `PRESTADA-${val}` : "PRESTADA-Traumatologia-Cama1";
        }

        const nombre = document.getElementById("modal-nombre").value;
        const hc = document.getElementById("modal-hc").value;
        const dx = document.getElementById("modal-dx").value;

        if (!nombre) { alert("Ingrese el nombre del paciente."); return; }

        pacientesData[ubiSel] = { nombre, hc: hc || "S/N", diagnostico: dx || "En estudio", riesgo: "verde" };
        localStorage.setItem("pacientesData", JSON.stringify(pacientesData));
        modalIngreso.style.display = "none";
        renderCenso();
        abrirFichaPaciente(ubiSel);
    });

    btnGuardarM1.addEventListener("click", () => {
        if (!camaActiva) return;
        if (!pacientesData[camaActiva]) pacientesData[camaActiva] = { nombre: "Paciente " + camaActiva };

        let p = pacientesData[camaActiva];
        p.motivo = document.getElementById("m1-motivo").value;
        p.te = document.getElementById("m1-te").value;
        p.relato = document.getElementById("m1-relato").value;
        p.pa = document.getElementById("m1-pa").value;
        p.fc = document.getElementById("m1-fc").value;
        p.fr = document.getElementById("m1-fr").value;
        p.t = document.getElementById("m1-t").value;
        p.sato2 = document.getElementById("m1-sato2").value;
        p.diuresis = document.getElementById("m1-diuresis").value;
        p.conducta = document.getElementById("m1-conducta").value;
        p.destino = document.getElementById("m1-destino").value;

        p.hta = document.getElementById("chk-hta").checked;
        p.tHta = document.getElementById("trat-hta").value;
        p.dm2 = document.getElementById("chk-dm2").checked;
        p.tDm2 = document.getElementById("trat-dm2").value;
        p.irc = document.getElementById("chk-irc").checked;
        p.tIrc = document.getElementById("trat-irc").value;

        p.antAnio = document.getElementById("ant-anio").value;
        p.antProc = document.getElementById("ant-proc").value;
        p.antComp = document.getElementById("ant-comp").value;
        p.antLugar = document.getElementById("ant-lugar").value;

        p.alergiaDetalle = document.getElementById("m1-alergias").value;
        p.anticoagDetalle = document.getElementById("m1-anticoag").value;

        localStorage.setItem("pacientesData", JSON.stringify(pacientesData));
        alert("¡Ficha clínica integral de ingreso guardada con éxito!");
    });

    renderCenso();
});
