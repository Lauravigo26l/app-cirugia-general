document.addEventListener("DOMContentLoaded", () => {
    const gridCamas = document.getElementById("grid-camas");
    const navButtons = document.querySelectorAll(".nav-btn");
    const secciones = {
        "torre": document.getElementById("seccion-torre"),
        "hospitalizacion": document.getElementById("seccion-hospitalizacion")
    };

    const modalIngreso = document.getElementById("modal-ingreso");
    const btnIngresoGeneral = document.getElementById("btn-ingreso-general");
    const cerrarModal = document.getElementById("cerrar-modal");
    const modalSelectCama = document.getElementById("modal-select-cama");
    const modalTipoUbicacion = document.getElementById("modal-tipo-ubicacion");
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
        gridCamas.innerHTML = "";
        actualizarSelectorUbicaciones();

        const camasMostrar = [];
        habitaciones.forEach(hab => letras.forEach(letra => camasMostrar.push(`${hab}-${letra}`)));
        
        Object.keys(pacientesData).forEach(ubi => {
            if ((ubi.startsWith("URPA-") || ubi.startsWith("PRESTADA-")) && !camasMostrar.includes(ubi)) {
                camasMostrar.push(ubi);
            }
        });

        camasMostrar.forEach(ubi => {
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

    window.actualizarSelectorUbicaciones = function() {
        const tipo = modalTipoUbicacion.value;
        const contCama = document.getElementById("contenedor-selector-cama");
        const contLibre = document.getElementById("contenedor-texto-libre");
        const labelLibre = document.getElementById("label-texto-libre");

        modalSelectCama.innerHTML = "";

        if (tipo === "oficial") {
            contCama.style.display = "block";
            contLibre.style.display = "none";
            habitaciones.forEach(hab => {
                letras.forEach(letra => {
                    const numCama = `${hab}-${letra}`;
                    const opt = document.createElement("option");
                    opt.value = numCama;
                    opt.textContent = `Cama ${numCama}`;
                    modalSelectCama.appendChild(opt);
                });
            });
        } else if (tipo === "urpa") {
            contCama.style.display = "none";
            contLibre.style.display = "block";
            labelLibre.textContent = "Identificador en URPA (Ej. URPA-01):";
            document.getElementById("modal-ubicacion-libre").value = "URPA-";
        } else if (tipo === "prestada") {
            contCama.style.display = "none";
            contLibre.style.display = "block";
            labelLibre.textContent = "Servicio y Cama Prestada (Ej. PRESTADA-Traumatologia-Cama310):";
            document.getElementById("modal-ubicacion-libre").value = "PRESTADA-";
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
            tituloFichaPaciente.textContent = `📋 Ficha Cama/Ubicación ${ubi}: ${paciente.nombre} (HC: ${paciente.hc})`;
            // Módulo 1
            document.getElementById("m1-motivo").value = paciente.motivo || "";
            document.getElementById("m1-te").value = paciente.te || "";
            document.getElementById("m1-relato").value = paciente.relato || "";
            document.getElementById("m1-pa").value = paciente.pa || "120/80";
            document.getElementById("m1-fc").value = paciente.fc || "80";
            document.getElementById("m1-fr").value = paciente.fr || "18";
            document.getElementById("m1-t").value = paciente.t || "36.8";
            document.getElementById("m1-conducta").value = paciente.conducta || "Observacion";
            document.getElementById("m1-destino").value = paciente.destino || "";

            document.getElementById("chk-hta").checked = paciente.hta || false;
            document.getElementById("trat-hta").value = paciente.tHta || "";
            document.getElementById("chk-dm2").checked = paciente.dm2 || false;
            document.getElementById("trat-dm2").value = paciente.tDm2 || "";
            document.getElementById("chk-irc").checked = paciente.irc || false;
            document.getElementById("trat-irc").value = paciente.tIrc || "";
            document.getElementById("chk-epoc").checked = paciente.epoc || false;
            document.getElementById("trat-epoc").value = paciente.tEpoc || "";

            document.getElementById("aq-cirugia").value = paciente.aqCirugia || "";
            document.getElementById("aq-anio").value = paciente.aqAnio || "";
            document.getElementById("aq-lugar").value = paciente.aqLugar || "";
            document.getElementById("aq-comp-si").value = paciente.aqCompSi || "No";
            document.getElementById("aq-detalle-comp").value = paciente.aqDetalleComp || "";

            document.getElementById("m1-alergias").value = paciente.alergiaDetalle || "";
            document.getElementById("m1-anticoag").value = paciente.anticoagDetalle || "";

            // Módulo 2 (Riesgos Perioperatorios)
            document.getElementById("r2-cardio-chk").checked = paciente.r2CardioChk || false;
            document.getElementById("r2-cardio-estado").value = paciente.r2CardioEstado || "";
            document.getElementById("r2-cardio-sug").value = paciente.r2CardioSug || "";

            document.getElementById("r2-anestesia-chk").checked = paciente.r2AnestesiaChk || false;
            document.getElementById("r2-anestesia-estado").value = paciente.r2AnestesiaEstado || "";
            document.getElementById("r2-anestesia-sug").value = paciente.r2AnestesiaSug || "";

            document.getElementById("r2-neumo-chk").checked = paciente.r2NeumoChk || false;
            document.getElementById("r2-neumo-estado").value = paciente.r2NeumoEstado || "";
            document.getElementById("r2-neumo-sug").value = paciente.r2NeumoSug || "";

            document.getElementById("r2-nefro-chk").checked = paciente.r2NefroChk || false;
            document.getElementById("r2-nefro-estado").value = paciente.r2NefroEstado || "";
            document.getElementById("r2-nefro-sug").value = paciente.r2NefroSug || "";

        } else {
            tituloFichaPaciente.textContent = `📋 Ubicación ${ubi} - Sin paciente asignado.`;
            document.querySelectorAll("input[type='text'], textarea").forEach(el => {
                if(el.id === "m1-pa") el.value = "120/80";
                else if(el.id === "m1-fc") el.value = "80";
                else if(el.id === "m1-fr") el.value = "18";
                else if(el.id === "m1-t") el.value = "36.8";
                else el.value = "";
            });
            document.querySelectorAll("input[type='checkbox']").forEach(el => el.checked = false);
        }
    }

    btnIngresoGeneral.addEventListener("click", () => { modalIngreso.style.display = "block"; });
    cerrarModal.addEventListener("click", () => { modalIngreso.style.display = "none"; });

    modalBtnGuardar.addEventListener("click", () => {
        const tipo = modalTipoUbicacion.value;
        let ubiSel = "";

        if (tipo === "oficial") {
            ubiSel = modalSelectCama.value;
        } else {
            ubiSel = document.getElementById("modal-ubicacion-libre").value.trim();
            if (!ubiSel || ubiSel === "URPA-" || ubiSel === "PRESTADA-") {
                alert("Por favor ingrese una identificación válida.");
                return;
            }
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
        if (!pacientesData[camaActiva]) pacientesData[camaActiva] = { nombre: "Paciente " + camaActiva, hc: "S/N" };

        let p = pacientesData[camaActiva];
        // Módulo 1
        p.motivo = document.getElementById("m1-motivo").value;
        p.te = document.getElementById("m1-te").value;
        p.relato = document.getElementById("m1-relato").value;
        p.pa = document.getElementById("m1-pa").value;
        p.fc = document.getElementById("m1-fc").value;
        p.fr = document.getElementById("m1-fr").value;
        p.t = document.getElementById("m1-t").value;
        p.conducta = document.getElementById("m1-conducta").value;
        p.destino = document.getElementById("m1-destino").value;

        p.hta = document.getElementById("chk-hta").checked;
        p.tHta = document.getElementById("trat-hta").value;
        p.dm2 = document.getElementById("chk-dm2").checked;
        p.tDm2 = document.getElementById("trat-dm2").value;
        p.irc = document.getElementById("chk-irc").checked;
        p.tIrc = document.getElementById("trat-irc").value;
        p.epoc = document.getElementById("chk-epoc").checked;
        p.tEpoc = document.getElementById("trat-epoc").value;

        p.aqCirugia = document.getElementById("aq-cirugia").value;
        p.aqAnio = document.getElementById("aq-anio").value;
        p.aqLugar = document.getElementById("aq-lugar").value;
        p.aqCompSi = document.getElementById("aq-comp-si").value;
        p.aqDetalleComp = document.getElementById("aq-detalle-comp").value;

        p.alergiaDetalle = document.getElementById("m1-alergias").value;
        p.anticoagDetalle = document.getElementById("m1-anticoag").value;

        // Módulo 2 (Riesgos Perioperatorios)
        p.r2CardioChk = document.getElementById("r2-cardio-chk").checked;
        p.r2CardioEstado = document.getElementById("r2-cardio-estado").value;
        p.r2CardioSug = document.getElementById("r2-cardio-sug").value;

        p.r2AnestesiaChk = document.getElementById("r2-anestesia-chk").checked;
        p.r2AnestesiaEstado = document.getElementById("r2-anestesia-estado").value;
        p.r2AnestesiaSug = document.getElementById("r2-anestesia-sug").value;

        p.r2NeumoChk = document.getElementById("r2-neumo-chk").checked;
        p.r2NeumoEstado = document.getElementById("r2-neumo-estado").value;
        p.r2NeumoSug = document.getElementById("r2-neumo-sug").value;

        p.r2NefroChk = document.getElementById("r2-nefro-chk").checked;
        p.r2NefroEstado = document.getElementById("r2-nefro-estado").value;
        p.r2NefroSug = document.getElementById("r2-nefro-sug").value;

        localStorage.setItem("pacientesData", JSON.stringify(pacientesData));
        alert("¡Ficha Clínica Integral (Módulos 1 y 2) guardada exitosamente!");
    });

    renderCenso();
});

// Función para cambiar entre las sub-pestañas 1 y 2
function cambiarSubTabHosp(num) {
    document.querySelectorAll('.hosp-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.subtab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`hosp-content-${num}`).style.display = 'block';
    event.currentTarget.classList.add('active');
}
