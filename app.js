document.addEventListener("DOMContentLoaded", () => {
    const gridCamas = document.getElementById("grid-camas");
    const navButtons = document.querySelectorAll(".nav-btn");
    const secciones = {
        "torre": document.getElementById("seccion-torre"),
        "hospitalizacion": document.getElementById("seccion-hospitalizacion"),
        "escalas": document.getElementById("seccion-escalas"),
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
    const selectProcedimiento = document.getElementById("q-procedimiento");
    const textareaTecnica = document.getElementById("q-tecnica");

    const habitaciones = ["218", "219", "220", "221", "222", "223", "224"];
    const letras = ["A", "B"];

    let pacientesData = JSON.parse(localStorage.getItem("pacientesData")) || {};
    let camaActiva = null;

    // Autogenerar técnica quirúrgica por IA según el procedimiento seleccionado
    if (selectProcedimiento) {
        selectProcedimiento.addEventListener("change", () => {
            const proc = selectProcedimiento.value;
            if (proc.includes("Apendicectomía Laparoscópica")) {
                textareaTecnica.value = "1. Paciente en decúbito dorsal bajo anestesia general.\n2. Asepsia y antisepsia de región operatoria, colocación de campos estériles.\n3. Incisión umbilical supra/infraumbilical, neumoperitoneo con aguja de Veress a 14 mmHg.\n4. Ingreso de trócar 10mm óptico y dos trócares accesorios de 5mm en fosa iliaca izquierda y suprapúbica.\n5. Exploración de cavidad: se evidencia líquido libre turbio en escasa cantidad y apéndice cecal retrocecal inflamado.\n6. Disección del mesoapéndice mediante electrocauterio / bisturí armónico y ligadura de base apendicular con endoloop.\n7. Extracción de pieza operatoria en bolsa endobag por puerto umbilical.\n8. Lavado profuso de cavidad con suero fisiológico templado, verificación de hemostasia y cierre por planos.";
            } else if (proc.includes("Colecistectomía Laparoscópica")) {
                textareaTecnica.value = "1. Paciente en decúbito dorsal bajo anestesia general.\n2. Neumoperitoneo mediante aguja de Veress e ingreso de trócar 10mm en ombligo.\n3. Colocación de trócares de trabajo (10mm subcostal derecho, 5mm línea media clavicular y 5mm línea axilar anterior).\n4. Exposición de vesícula biliar y disección del triángulo de Calot logrando la Visión Crítica de Seguridad de Strasberg.\n5. Clivaje y sección de conducto cístico y arteria cística previamente clipados con hemoclips metálicos.\n6. Disección retrógrada de la vesícula biliar de su lecho hepático mediante electrocauterio.\n7. Hemostasia prolija de lecho vesicular, lavado de cavidad y extracción de pieza en endobag.";
            } else {
                textareaTecnica.value = "1. Asepsia, antisepsia e incisión según abordaje planificado.\n2. Disección por planos anatómicos hasta cavidad abdominal.\n3. Hallazgos operatorios registrados, ejecución del procedimiento principal sin incidentes.\n4. Cierre de pared por planos anatómicos y piel con sutura reabsorbible / monofilamento.";
            }
        });
    }

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
                    const badgeAlta = paciente.condicionAlta ? ' <span style="background:#d9f99d; color:#365314; padding:2px 6px; border-radius:4px; font-size:10px;">ALTA</span>' : '';
                    card.classList.add(paciente.riesgo || "verde");
                    card.innerHTML = `
                        <h3>Cama ${numCama} ${badgeAlta}</h3>
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
        secciones.escalas.style.display = "none";
        secciones.resumen.style.display = "none";

        if (paciente) {
            tituloFichaPaciente.textContent = `📋 Cama ${numCama}: ${paciente.nombre} (HC: ${paciente.hc})`;
            document.getElementById("anam-motivo").value = paciente.motivo || "";
            document.getElementById("anam-tiempo").value = paciente.tiempoEnf || "";
            document.getElementById("anam-relato").value = paciente.relato || "";
            
            document.getElementById("trat-hta").value = paciente.tratHta || "";
            document.getElementById("trat-dm2").value = paciente.tratDm2 || "";
            document.getElementById("trat-irc").value = paciente.tratIrc || "";
            document.getElementById("ant-quirurgicos").value = paciente.antQuirurgicos || "";
            
            document.getElementById("alerta-alergias").value = paciente.alergias || "";
            document.getElementById("alerta-anticoag").value = paciente.anticoag || "";
            document.getElementById("riesgos-peri").value = paciente.riesgosPeri || "";

            document.getElementById("q-procedimiento").value = paciente.procedimiento || "Apendicectomía Laparoscópica";
            document.getElementById("q-abordaje").value = paciente.abordaje || "Laparoscópica";
            document.getElementById("q-h-inicio").value = paciente.hInicio || "";
            document.getElementById("q-h-fin").value = paciente.hFin || "";
            document.getElementById("q-cirujano").value = paciente.cirujano || "";
            document.getElementById("q-ayudante").value = paciente.ayudante || "";
            document.getElementById("q-anestesiologo").value = paciente.anestesiologo || "";
            document.getElementById("q-enfermera").value = paciente.enfermera || "";
            document.getElementById("q-tipo-anestesia").value = paciente.tipoAnestesia || "";
            document.getElementById("q-tecnica").value = paciente.tecnica || "";
            document.getElementById("q-hallazgos").value = paciente.hallazgos || "";
            document.getElementById("q-drenaje").value = paciente.drenaje || "";
            document.getElementById("q-debito-drenaje").value = paciente.debitoDrenaje || "";

            document.getElementById("lab-fecha").value = paciente.labFecha || "";
            document.getElementById("lab-hb").value = paciente.labHb || "";
            document.getElementById("lab-leuco").value = paciente.labLeuco || "";
            document.getElementById("lab-cayados").value = paciente.labCayados || "";
            document.getElementById("lab-plaquetas").value = paciente.labPlaquetas || "";
            document.getElementById("lab-creat").value = paciente.labCreat || "";
            document.getElementById("lab-urea").value = paciente.labUrea || "";
            document.getElementById("lab-lactato").value = paciente.labLactato || "";
            document.getElementById("lab-pcr").value = paciente.labPcr || "";

            document.getElementById("txt-indicaciones").value = paciente.indicaciones || document.getElementById("txt-indicaciones").value;
            document.getElementById("chk-condicion-alta").checked = paciente.condicionAlta || false;
            document.getElementById("txt-indicaciones-alta").value = paciente.indicacionesAlta || "";

            document.getElementById("chk-hta").checked = paciente.hta || false;
            document.getElementById("chk-dm2").checked = paciente.dm2 || false;
            document.getElementById("chk-irc").checked = paciente.irc || false;
        } else {
            tituloFichaPaciente.textContent = `📋 Cama ${numCama} - Sin paciente asignado.`;
            document.querySelectorAll(".paciente-detalle-container input[type='text'], .paciente-detalle-container textarea, .paciente-detalle-container input[type='date'], .paciente-detalle-container input[type='time']").forEach(el => {
                if(el.id !== "txt-indicaciones") el.value = "";
            });
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

        const p = pacientesData[camaActiva];
        p.motivo = document.getElementById("anam-motivo").value;
        p.tiempoEnf = document.getElementById("anam-tiempo").value;
        p.relato = document.getElementById("anam-relato").value;

        p.tratHta = document.getElementById("trat-hta").value;
        p.tratDm2 = document.getElementById("trat-dm2").value;
        p.tratIrc = document.getElementById("trat-irc").value;
        p.antQuirurgicos = document.getElementById("ant-quirurgicos").value;

        p.alergias = document.getElementById("alerta-alergias").value;
        p.anticoag = document.getElementById("alerta-anticoag").value;
        p.riesgosPeri = document.getElementById("riesgos-peri").value;

        p.procedimiento = document.getElementById("q-procedimiento").value;
        p.abordaje = document.getElementById("q-abordaje").value;
        p.hInicio = document.getElementById("q-h-inicio").value;
        p.hFin = document.getElementById("q-h-fin").value;
        p.cirujano = document.getElementById("q-cirujano").value;
        p.ayudante = document.getElementById("q-ayudante").value;
        p.anestesiologo = document.getElementById("q-anestesiologo").value;
        p.enfermera = document.getElementById("q-enfermera").value;
        p.tipoAnestesia = document.getElementById("q-tipo-anestesia").value;
        p.tecnica = document.getElementById("q-tecnica").value;
        p.hallazgos = document.getElementById("q-hallazgos").value;
        p.drenaje = document.getElementById("q-drenaje").value;
        p.debitoDrenaje = document.getElementById("q-debito-drenaje").value;

        p.labFecha = document.getElementById("lab-fecha").value;
        p.labHb = document.getElementById("lab-hb").value;
        p.labLeuco = document.getElementById("lab-leuco").value;
        p.labCayados = document.getElementById("lab-cayados").value;
        p.labPlaquetas = document.getElementById("lab-plaquetas").value;
        p.labCreat = document.getElementById("lab-creat").value;
        p.labUrea = document.getElementById("lab-urea").value;
        p.labLactato = document.getElementById("lab-lactato").value;
        p.labPcr = document.getElementById("lab-pcr").value;

        p.indicaciones = document.getElementById("txt-indicaciones").value;
        p.condicionAlta = document.getElementById("chk-condicion-alta").checked;
        p.indicacionesAlta = document.getElementById("txt-indicaciones-alta").value;

        p.hta = document.getElementById("chk-hta").checked;
        p.dm2 = document.getElementById("chk-dm2").checked;
        p.irc = document.getElementById("chk-irc").checked;

        localStorage.setItem("pacientesData", JSON.stringify(pacientesData));
        alert("¡Ficha clínica y quirúrgica completa guardada con éxito!");
        renderCenso();
    });

    // Calculadora de Escalas IA
    const btnCalcularScore = document.getElementById("btn-calcular-score");
    if (btnCalcularScore) {
        btnCalcularScore.addEventListener("click", () => {
            let totalPts = 0;
            document.querySelectorAll(".alvarado-item").forEach(item => {
                if (item.checked) totalPts += parseInt(item.value);
            });

            let gravedad = "";
            if (totalPts >= 7) gravedad = "⚠️ Apendicitis Aguda altamente probable (Puntaje: " + totalPts + "). Indicación quirúrgica de urgencia.";
            else if (totalPts >= 5) gravedad = "🟡 Apendicitis probable / Observación estricta o imágenes de apoyo (Puntaje: " + totalPts + ").";
            else gravedad = "🟢 Baja probabilidad de apendicitis aguda (Puntaje: " + totalPts + ").";

            document.getElementById("resultado-score-ia").textContent = gravedad;
        });
    }

    function generarPaseWhatsApp() {
        let total = 0;
        let detalle = "";
        let altas = "";
        Object.keys(pacientesData).forEach(cama => {
            if (pacientesData[cama].nombre) {
                total++;
                const p = pacientesData[cama];
                if (p.condicionAlta) {
                    altas += `\n- Cama ${cama}: ${p.nombre} (LISTO PARA ALTA)`;
                }
                detalle += `\n- Cama ${cama}: ${p.nombre} | Dx: ${p.diagnostico} ${p.debitoDrenaje ? '| Drenaje: ' + p.debitoDrenaje : ''}`;
            }
        });

        textoPaseWhatsApp.textContent = `📋 PASE DE GUARDIA - CIRUGÍA GENERAL\n🏥 Sede: Hospital II-2 Tarapoto\n🛏️ Censo Total: ${total} pacientes en servicio.\n\n✨ PACIENTES CON CONDICIÓN DE ALTA:${altas || '\nNinguno por el momento'}\n\n📌 PACIENTES HOSPITALIZADOS:${detalle}\n\n⚠️ Revisar indicaciones y reportes en SurgiFlow.`;
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
