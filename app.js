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
    const modalBtnGuardar = document.getElementById("modal-btn-guardar");

    const tituloFichaPaciente = document.getElementById("titulo-ficha-paciente");
    const btnGuardarM1 = document.getElementById("btn-guardar-m1");

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
        });
    });

    function renderCenso() {
        gridCamas.innerHTML = "";
        modalSelectCama.innerHTML = "";

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
        secciones.torre.style.display = "none";
        secciones.hospitalizacion.style.display = "block";

        if (paciente) {
            tituloFichaPaciente.textContent = `📋 Ficha Cama ${ubi}: ${paciente.nombre} (HC: ${paciente.hc})`;
            document.getElementById("m1-motivo").value = paciente.motivo || "";
            document.getElementById("m1-te").value = paciente.te || "";
            document.getElementById("m1-relato").value = paciente.relato || "";
            document.getElementById("m1-pa").value = paciente.pa || "";
            document.getElementById("m1-fc").value = paciente.fc || "";
            document.getElementById("m1-fr").value = paciente.fr || "";
            document.getElementById("m1-t").value = paciente.t || "";
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

            document.getElementById("m1-ant-quirurgicos").value = paciente.antQx || "";
            document.getElementById("m1-alergias").value = paciente.alergiaDetalle || "";
            document.getElementById("m1-anticoag").value = paciente.anticoagDetalle || "";
        } else {
            tituloFichaPaciente.textContent = `📋 Cama ${ubi} - Sin paciente asignado.`;
            document.querySelectorAll("input[type='text'], textarea").forEach(el => el.value = "");
            document.querySelectorAll("input[type='checkbox']").forEach(el => el.checked = false);
        }
    }

    btnIngresoGeneral.addEventListener("click", () => { modalIngreso.style.display = "block"; });
    cerrarModal.addEventListener("click", () => { modalIngreso.style.display = "none"; });

    modalBtnGuardar.addEventListener("click", () => {
        const ubiSel = modalSelectCama.value;
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

        p.antQx = document.getElementById("m1-ant-quirurgicos").value;
        p.alergiaDetalle = document.getElementById("m1-alergias").value;
        p.anticoagDetalle = document.getElementById("m1-anticoag").value;

        localStorage.setItem("pacientesData", JSON.stringify(pacientesData));
        alert("¡Ficha de Anamnesis y Comorbilidades guardada con éxito!");
    });

    renderCenso();
});
