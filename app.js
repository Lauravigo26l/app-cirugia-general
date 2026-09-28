document.addEventListener("DOMContentLoaded", () => {
    const gridCamas = document.getElementById("grid-camas");
    const navButtons = document.querySelectorAll(".nav-btn");
    const secciones = {
        "torre": document.getElementById("seccion-torre"),
        "hospitalizacion": document.getElementById("seccion-hospitalizacion"),
        "riesgos": document.getElementById("seccion-riesgos")
    };

    const modalIngreso = document.getElementById("modal-ingreso");
    const btnIngresoGeneral = document.getElementById("btn-ingreso-general");
    const cerrarModal = document.getElementById("cerrar-modal");
    const modalSelectCama = document.getElementById("modal-select-cama");
    const modalTipoUbicacion = document.getElementById("modal-tipo-ubicacion");
    const modalBtnGuardar = document.getElementById("modal-btn-guardar");

    const tituloFichaPaciente = document.getElementById("titulo-ficha-paciente");
    const tituloRiesgosPaciente = document.getElementById("titulo-riesgos-paciente");
    const btnGuardarM1 = document.getElementById("btn-guardar-m1");
    const btnGuardarM2 = document.getElementById("btn-guardar-m2");

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
            labelLibre.textContent = "Identificador URPA (Ej. URPA-01):";
            document.getElementById("modal-ubicacion-libre").value = "URPA-";
        } else if (tipo === "prestada") {
            contCama.style.display = "none";
            contLibre.style.display = "block";
            labelLibre.textContent = "Servicio y Cama (Ej. PRESTADA-Traumatologia-310):";
            document.getElementById("modal-ubicacion-libre").value = "PRESTADA-";
        }
    }

    function abrirFichaPaciente(ubi) {
        camaActiva = ubi;
        const paciente = pacientesData[ubi];

        navButtons.forEach(b => b.classList.remove("active"));
        document.querySelector('[data-tab="hospitalizacion"]').classList.add("active");
        Object.keys(secciones).forEach(sec => {
            secciones[sec].style.display = (sec === "hospitalizacion") ? "block" : "none";
        });

        if (paciente) {
            tituloFichaPaciente.textContent = `📋 Ficha M1 Cama ${ubi}: ${paciente.nombre} (HC: ${paciente.hc})`;
            tituloRiesgosPaciente.textContent = `⚠️ Riesgos Perioperatorios - Cama ${ubi}: ${paciente.nombre}`;
            
            // Cargar M1
            document.getElementById("m1-motivo").value = paciente.motivo || "";
            document.getElementById("m1-te").value = paciente.te || "";
            document.getElementById("m1-relato").value = paciente.relato || "";
            document.getElementById("m1-pa").value = paciente.pa || "120/80";
            document.getElementById("m1-fc").value = paciente.fc || "80";
            document.getElementById("m1-fr").value = paciente.fr || "18";
            document.getElementById("m1-t").value = paciente.t || "36.8";

            document.getElementById("chk-hta").checked = paciente.hta || false;
            document.getElementById("trat-hta").value = paciente.tHta || "";
            document.getElementById("chk-dm2").checked = paciente.dm2 || false;
            document.getElementById("trat-dm2").value = paciente.tDm2 || "";
            document.getElementById("chk-irc").checked = paciente.irc || false;
            document.getElementById("trat-irc").value = paciente.tIrc || "";

            document.getElementById("aq-cirugia").value = paciente.aqCirugia || "";
            document.getElementById("aq-anio").value = paciente.aqAnio || "";
            document.getElementById("aq-lugar").value = paciente.aqLugar || "";
            document.getElementById("aq-comp-si").value = paciente.aqCompSi || "No";
            document.getElementById("aq-detalle-comp").value = paciente.aqDetalleComp || "";
            document.getElementById("m1-alergias").value = paciente.alergiaDetalle || "";
            document.getElementById("m1-anticoag").value = paciente.anticoagDetalle || "";

            // Cargar M2 (Riesgos)
            if (paciente.riesgos) {
                document.getElementById("r2-cardio-estado").value = paciente.riesgos.cardioEstado || "Pendiente";
                document.getElementById("r2-cardio-score").value = paciente.riesgos.cardioScore || "";
                document.getElementById("r2-cardio-sug").value = paciente.riesgos.cardioSug || "";

                document.getElementById("r2-asa").value = paciente.riesgos.asa || "ASA I";
                document.getElementById("r2-mallampati").value = paciente.riesgos.mallampati || "Clase I";
                document.getElementById("r2-viaprevista").value = paciente.riesgos.viaPrevista || "";
                document.getElementById("r2-anestesia-sug").value = paciente.riesgos.anestesiaSug || "";

                document.getElementById("r2-neumo-estado").value = paciente.riesgos.neumoEstado || "No requerido";
                document.getElementById("r2-neumo-vef1").value = paciente.riesgos.neumoVef1 || "";
                document.getElementById("r2-neumo-sug").value = paciente.riesgos.neumoSug || "";

                document.getElementById("r2-nefro-estado").value = paciente.riesgos.nefroEstado || "No requerido";
                document.getElementById("r2-nefro-tfg").value = paciente.riesgos.nefroTfg || "";
                document.getElementById("r2-nefro-sug").value = paciente.riesgos.nefroSug || "";
            }
        } else {
            tituloFichaPaciente.textContent = `📋 Cama ${ubi} - Sin paciente asignado.`;
            document.querySelectorAll("input[type='text'], textarea").forEach(el => el.value = "");
            document.querySelectorAll("input[type='checkbox']").forEach(el => el.checked = false);
        }
    }

    btnIngresoGeneral.addEventListener("click", () => { modalIngreso.style.display = "block"; });
    cerrarModal.addEventListener("click", () => { modalIngreso.style.display = "none"; });

    modalBtnGuardar.addEventListener("click", () => {
        const tipo = modalTipoUbicacion.value;
        let ubiSel = tipo === "oficial" ? modalSelectCama.value : document.getElementById("modal-ubicacion-libre").value.trim();

        if (!ubiSel || ubiSel === "URPA-" || ubiSel === "PRESTADA-") {
            alert("Ingrese un identificador válido.");
            return;
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
        if (!pacientesData[camaActiva]) pacientesData[camaActiva] = {};

        let p = pacientesData[camaActiva];
        p.motivo = document.getElementById("m1-motivo").value;
        p.te = document.getElementById("m1-te").value;
        p.relato = document.getElementById("m1-relato").value;
        p.pa = document.getElementById("m1-pa").value;
        p.fc = document.getElementById("m1-fc").value;
        p.fr = document.getElementById("m1-fr").value;
        p.t = document.getElementById("m1-t").value;

        p.hta = document.getElementById("chk-hta").checked;
        p.tHta = document.getElementById("trat-hta").value;
        p.dm2 = document.getElementById("chk-dm2").checked;
        p.tDm2 = document.getElementById("trat-dm2").value;
        p.irc = document.getElementById("chk-irc").checked;
        p.tIrc = document.getElementById("trat-irc").value;

        p.aqCirugia = document.getElementById("aq-cirugia").value;
        p.aqAnio = document.getElementById("aq-anio").value;
        p.aqLugar = document.getElementById("aq-lugar").value;
        p.aqCompSi = document.getElementById("aq-comp-si").value;
        p.aqDetalleComp = document.getElementById("aq-detalle-comp").value;

        p.alergiaDetalle = document.getElementById("m1-alergias").value;
        p.anticoagDetalle = document.getElementById("m1-anticoag").value;

        localStorage.setItem("pacientesData", JSON.stringify(pacientesData));
        alert("¡Módulo 1 guardado con éxito!");
    });

    btnGuardarM2.addEventListener("click", () => {
        if (!camaActiva) { alert("Seleccione un paciente primero."); return; }
        if (!pacientesData[camaActiva]) pacientesData[camaActiva] = {};

        pacientesData[camaActiva].riesgos = {
            cardioEstado: document.getElementById("r2-cardio-estado").value,
            cardioScore: document.getElementById("r2-cardio-score").value,
            cardioSug: document.getElementById("r2-cardio-sug").value,

            asa: document.getElementById("r2-asa").value,
            mallampati: document.getElementById("r2-mallampati").value,
            viaPrevista: document.getElementById("r2-viaprevista").value,
            anestesiaSug: document.getElementById("r2-anestesia-sug").value,

            neumoEstado: document.getElementById("r2-neumo-estado").value,
            neumoVef1: document.getElementById("r2-neumo-vef1").value,
            neumoSug: document.getElementById("r2-neumo-sug").value,

            nefroEstado: document.getElementById("r2-nefro-estado").value,
            nefroTfg: document.getElementById("r2-nefro-tfg").value,
            nefroSug: document.getElementById("r2-nefro-sug").value
        };

        localStorage.setItem("pacientesData", JSON.stringify(pacientesData));
        alert("¡Módulo 2 (Riesgos Perioperatorios) guardado con éxito!");
    });

    renderCenso();
});
