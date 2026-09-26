document.addEventListener("DOMContentLoaded", () => {
    const gridCamas = document.getElementById("grid-camas");
    const navButtons = document.querySelectorAll(".nav-btn");
    const secciones = {
        "torre": document.getElementById("seccion-torre"),
        "admision": document.getElementById("seccion-admision")
    };

    const modalIngreso = document.getElementById("modal-ingreso");
    const btnIngresoGeneral = document.getElementById("btn-ingreso-general");
    const cerrarModal = document.getElementById("cerrar-modal");
    const modalSelectCama = document.getElementById("modal-select-cama");
    const modalBtnGuardar = document.getElementById("modal-btn-guardar");

    const tituloFichaPaciente = document.getElementById("titulo-ficha-paciente");
    const btnGuardarAdmision = document.getElementById("btn-guardar-admision");

    // Habitaciones de tu servicio (218-A a 224-B) + Camas Prestadas y URPA
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
            option.textContent = `Cama / Ubicación ${ubi}`;
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
                    <p><em>Hacer clic para registrar admisión</em></p>
                `;
            }

            card.addEventListener("click", () => abrirAdmision(ubi));
            gridCamas.appendChild(card);
        });
    }

    function abrirAdmision(ubi) {
        camaActiva = ubi;
        const p = pacientesData[ubi];

        navButtons.forEach(b => b.classList.remove("active"));
        document.querySelector('[data-tab="admision"]').classList.add("active");
        secciones.torre.style.display = "none";
        secciones.admision.style.display = "block";

        if (p) {
            tituloFichaPaciente.textContent = `📋 Anamnesis Cama ${ubi}: ${p.nombre} (HC: ${p.hc})`;
            document.getElementById("adm-motivo").value = p.motivo || "";
            document.getElementById("adm-tiempo").value = p.tiempo || "";
            document.getElementById("adm-relato").value = p.relato || "";
            document.getElementById("fv-pa").value = p.pa || "";
            document.getElementById("fv-fc").value = p.fc || "";
            document.getElementById("fv-fr").value = p.fr || "";
            document.getElementById("fv-t").value = p.t || "";
            document.getElementById("adm-conducta").value = p.conducta || "Observacion";
            document.getElementById("adm-destino").value = p.destino || "";

            document.getElementById("chk-hta").checked = p.hta || false;
            document.getElementById("trat-hta").value = p.tratHta || "";
            document.getElementById("chk-dm2").checked = p.dm2 || false;
            document.getElementById("trat-dm2").value = p.tratDm2 || "";
            document.getElementById("chk-irc").checked = p.irc || false;
            document.getElementById("trat-irc").value = p.tratIrc || "";
            document.getElementById("ant-quirurgicos-detalle").value = p.antQx || "";

            document.getElementById("alergia-alerta").value = p.alergiaAlerta || "";
            document.getElementById("anticoag-alerta").value = p.anticoagAlerta || "";
        } else {
            tituloFichaPaciente.textContent = `📋 Cama ${ubi} - Sin paciente registrado.`;
            document.querySelectorAll("#seccion-admision input[type='text'], #seccion-admision textarea").forEach(el => el.value = "");
            document.querySelectorAll("#seccion-admision input[type='checkbox']").forEach(el => el.checked = false);
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
        abrirAdmision(ubiSel);
    });

    btnGuardarAdmision.addEventListener("click", () => {
        if (!camaActiva) return;
        if (!pacientesData[camaActiva]) pacientesData[camaActiva] = {};

        let p = pacientesData[camaActiva];
        p.motivo = document.getElementById("adm-motivo").value;
        p.tiempo = document.getElementById("adm-tiempo").value;
        p.relato = document.getElementById("adm-relato").value;
        p.pa = document.getElementById("fv-pa").value;
        p.fc = document.getElementById("fv-fc").value;
        p.fr = document.getElementById("fv-fr").value;
        p.t = document.getElementById("fv-t").value;
        p.conducta = document.getElementById("adm-conducta").value;
        p.destino = document.getElementById("adm-destino").value;

        p.hta = document.getElementById("chk-hta").checked;
        p.tratHta = document.getElementById("trat-hta").value;
        p.dm2 = document.getElementById("chk-dm2").checked;
        p.tratDm2 = document.getElementById("trat-dm2").value;
        p.irc = document.getElementById("chk-irc").checked;
        p.tratIrc = document.getElementById("trat-irc").value;
        p.antQx = document.getElementById("ant-quirurgicos-detalle").value;

        p.alergiaAlerta = document.getElementById("alergia-alerta").value;
        p.anticoagAlerta = document.getElementById("anticoag-alerta").value;

        localStorage.setItem("pacientesData", JSON.stringify(pacientesData));
        alert("¡Anamnesis e ingreso guardados correctamente!");
    });

    renderCenso();
});
