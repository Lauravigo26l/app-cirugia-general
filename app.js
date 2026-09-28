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

        // Recopilar todas las camas oficiales + las prestadas de Traumatología + URPA guardadas
        const listaUbicaciones = [];
        habitaciones.forEach(hab => letras.forEach(letra => listaUbicaciones.push(`${hab}-${letra}`)));

        // Agregar dinámicamente las camas prestadas o URPA existentes en la data
        Object.keys(pacientesData).forEach(ubi => {
            if ((ubi.startsWith("TRAUMA-") || ubi.startsWith("URPA-")) && !listaUbicaciones.includes(ubi)) {
                listaUbicaciones.push(ubi);
            }
        });

        listaUbicaciones.forEach(ubi => {
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
            document.getElementById("m1-pa").value = paciente.pa || "120/80";
            document.getElementById("m1-fc").value = paciente.fc || "80";
            document.getElementById("m1-fr").value = paciente.fr || "18";
            document.getElementById("m1-t").value = paciente.t || "37.0";
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

            document.getElementById("qx-ant-nombre").value = paciente.qxNombre || "";
            document.getElementById("qx-ant-anio").value = paciente.qxAnio || "";
            document.getElementById("qx-ant-complicacion").value = paciente.qxComplicacion || "";
            document.getElementById("m1-ant-quirurgicos-extra").value = paciente.antQxExtra || "";

            document.getElementById("m1-alergias").value = paciente.alergiaDetalle || "";
            document.getElementById("m1-anticoag").value = paciente.anticoagDetalle || "";
        } else {
            tituloFichaPaciente.textContent = `📋 Cama ${ubi} - Sin paciente asignado.`;
            document.querySelectorAll("input[type='text'], textarea").forEach(el => {
                if(el.id === "m1-pa") el.value = "120/80";
                else if(el.id === "m1-fc") el.value = "80";
                else if(el.id === "m1-fr") el.value = "18";
                else if(el.id === "m1-t") el.value = "37.0";
                else el.value = "";
            });
            document.querySelectorAll("input[type='checkbox']").forEach(el => el.checked = false);
        }
    }

    btnIngresoGeneral.addEventListener("click", () => {
        actualizarSelectorUbicacion();
        modalIngreso.style.display = "block";
    });
    cerrarModal.addEventListener("click", () => { modalIngreso.style.display = "none"; });

    window.actualizarSelectorUbicacion = function() {
        const tipo = document.getElementById("modal-select-tipo").value;
        const contenedor = document.getElementById("contenedor-selector-especifico");
        
        if (tipo === "oficial") {
            let html = `<label style="font-size:12px; margin-top:5px; display:block;">Seleccione Cama:</label><select id="modal-cama-oficial" style="width:100%; padding:6px;">`;
            habitaciones.forEach(hab => letras.forEach(letra => html += `<option value="${hab}-${letra}">Cama ${hab}-${letra}</option>`));
            html += `</select>`;
            contenedor.innerHTML = html;
        } else if (tipo === "trauma") {
            contenedor.innerHTML = `<label style="font-size:12px; margin-top:5px; display:block;">Número de Cama en Traumatología:</label><input type="text" id="modal-cama-trauma" placeholder="Ej. Traumatología - Cama 04">`;
        } else if (tipo === "urpa") {
            contenedor.innerHTML = `<label style="font-size:12px; margin-top:5px; display:block;">Identificador en URPA:</label><input type="text" id="modal-cama-urpa" placeholder="Ej. URPA - Camilla 02">`;
        }
    };

    modalBtnGuardar.addEventListener("click", () => {
        const tipo = document.getElementById("modal-select-tipo").value;
        let ubiSel = "";

        if (tipo === "oficial") {
            ubiSel = document.getElementById("modal-cama-oficial").value;
        } else if (tipo === "trauma") {
            const val = document.getElementById("modal-cama-trauma").value.trim();
            if (!val) { alert("Ingrese el detalle de la cama de traumatología."); return; }
            ubiSel = `TRAUMA-${val}`;
        } else if (tipo === "urpa") {
            const val = document.getElementById("modal-cama-urpa").value.trim();
            if (!val) { alert("Ingrese el identificador en URPA."); return; }
            ubiSel = `URPA-${val}`;
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

        p.qxNombre = document.getElementById("qx-ant-nombre").value;
        p.qxAnio = document.getElementById("qx-ant-anio").value;
        p.qxComplicacion = document.getElementById("qx-ant-complicacion").value;
        p.antQxExtra = document.getElementById("m1-ant-quirurgicos-extra").value;

        p.alergiaDetalle = document.getElementById("m1-alergias").value;
        p.anticoagDetalle = document.getElementById("m1-anticoag").value;

        localStorage.setItem("pacientesData", JSON.stringify(pacientesData));
        alert("¡Ficha clínica integral guardada con éxito!");
    });

    renderCenso();
});
