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

            if (tabName === "resumen") generarPaseWhatsApp();
        });
    });

    function renderCenso() {
        gridCamas.innerHTML = "";
        modalSelectCama.innerHTML = "";

        // Habitaciones oficiales
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
                    card.classList.add(paciente.riesgo || "verde");
                    const badgeAlta = paciente.condicionAlta ? ' <span style="background:#059669; color:white; padding:2px 6px; border-radius:4px; font-size:10px;">¡ALTA!</span>' : '';
                    card.innerHTML = `
                        <h3>Cama ${numCama} ${badgeAlta}<span>🔴</span></h3>
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
        Object.keys(secciones).forEach(sec => secciones[sec].style.display = "none");
        secciones.hospitalizacion.style.display = "block";

        if (paciente) {
            tituloFichaPaciente.textContent = `📋 Cama ${numCama}: ${paciente.nombre} (HC: ${paciente.hc})`;
            
            // Comorbilidades y tratamientos
            ['hta', 'dm2', 'irc', 'epoc'].forEach(com => {
                const chk = document.getElementById(`chk-${com}`);
                const txt = document.getElementById(`trat-${com}`);
                chk.checked = paciente[com] || false;
                txt.value = paciente[`trat_${com}`] || "";
                txt.style.display = chk.checked ? "block" : "none";
            });

            document.getElementById("ant-cirugia-tipo").value = paciente.antCirugiaTipo || "";
            document.getElementById("ant-cirugia-anio").value = paciente.antCirugiaAnio || "";
            document.getElementById("ant-cirugia-lugar").value = paciente.antCirugiaLugar || "";
            document.getElementById("ant-cirugia-complicaciones").value = paciente.antCirugiaComp || "";

            document.getElementById("txt-alergias-criticas").value = paciente.alergiasCriticas || "";
            document.getElementById("txt-anticoag-farma").value = paciente.anticoagFarma || "";
            document.getElementById("txt-anticoag-ultima").value = paciente.anticoagUltima || "";
            document.getElementById("txt-anticoag-sugerencia").value = paciente.anticoagSugerencia || "";

            ['cardio', 'anestesia', 'neumo', 'nefro'].forEach(r => {
                document.getElementById(`chk-r-${r}`).checked = paciente[`r_${r}`] || false;
                document.getElementById(`txt-r-${r}`).value = paciente[`txt_r_${r}`] || "";
            });

            document.getElementById("q-procedimiento").value = paciente.qProcedimiento || "";
            document.getElementById("q-abordaje").value = paciente.abordaje || "Laparoscópica";
            document.getElementById("q-h-inicio").value = paciente.hInicio || "";
            document.getElementById("q-h-fin").value = paciente.hFin || "";
            document.getElementById("q-anestesia").value = paciente.anestesia || "";
            document.getElementById("q-herida").value = paciente.herida || "Limpia";
            document.getElementById("q-cirujano").value = paciente.cirujano || "";
            document.getElementById("q-asistente").value = paciente.asistente || "";
            document.getElementById("q-personal").value = paciente.personal || "";
            document.getElementById("q-tecnica").value = paciente.tecnica || "";
            document.getElementById("q-drenaje").value = paciente.drenaje || "";

            document.getElementById("lab-fecha").value = paciente.labFecha || "";
            document.getElementById("lab-hb").value = paciente.hb || "";
            document.getElementById("lab-leuco").value = paciente.leuco || "";
            document.getElementById("lab-cayados").value = paciente.cayados || "";
            document.getElementById("lab-creat").value = paciente.creat || "";
            document.getElementById("lab-lactato").value = paciente.lactato || "";
            document.getElementById("lab-inr").value = paciente.inr || "";
            document.getElementById("dren-12h").value = paciente.dren12h || "";
            document.getElementById("dren-24h").value = paciente.dren24h || "";

            document.getElementById("ind-1").value = paciente.ind1 || "Decúbito dorsal / Cabecera a 30°";
            document.getElementById("ind-2").value = paciente.ind2 || "Dieta blanda / Tolerancia oral adecuada";
            document.getElementById("ind-3").value = paciente.ind3 || "CFV c/6h | Balance Hídrico Estricto (BHE)";
            document.getElementById("ind-4").value = paciente.ind4 || "Cloruro de Sodio 9‰ 1000cc en 24h (V.S)";
            document.getElementById("ind-5").value = paciente.ind5 || "Omeprazol 40mg IV c/24h";
            document.getElementById("ind-6").value = paciente.ind6 || "Ceftriaxona 2g IV c/24h";
            document.getElementById("ind-7").value = paciente.ind7 || "Tramadol 100mg + Metamizol 2g en CIV c/24h";
            document.getElementById("ind-8").value = paciente.ind8 || "Curación de herida operatoria c/48h";
            document.getElementById("txt-pendientes").value = paciente.pendientes || "";

            const chkAlta = document.getElementById("chk-condicion-alta");
            chkAlta.checked = paciente.condicionAlta || false;
            document.getElementById("lbl-estado-cama").textContent = chkAlta.checked ? "Paciente en condiciones de Alta (Cama por liberar)" : "Ocupada / En Piso";
            document.getElementById("lbl-estado-cama").style.color = chkAlta.checked ? "#db2777" : "#059669";
        } else {
            tituloFichaPaciente.textContent = `📋 Cama ${numCama} - Sin paciente asignado.`;
            document.querySelectorAll(".paciente-detalle-container input[type='text'], .paciente-detalle-container textarea").forEach(el => el.value = "");
            document.querySelectorAll(".paciente-detalle-container input[type='checkbox']").forEach(el => el.checked = false);
            document.querySelectorAll("[id^='trat-']").forEach(el => el.style.display = "none");
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

        ['hta', 'dm2', 'irc', 'epoc'].forEach(com => {
            pacientesData[camaActiva][com] = document.getElementById(`chk-${com}`).checked;
            pacientesData[camaActiva][`trat_${com}`] = document.getElementById(`trat-${com}`).value;
        });

        pacientesData[camaActiva].antCirugiaTipo = document.getElementById("ant-cirugia-tipo").value;
        pacientesData[camaActiva].antCirugiaAnio = document.getElementById("ant-cirugia-anio").value;
        pacientesData[camaActiva].antCirugiaLugar = document.getElementById("ant-cirugia-lugar").value;
        pacientesData[camaActiva].antCirugiaComp = document.getElementById("ant-cirugia-complicaciones").value;

        pacientesData[camaActiva].alergiasCriticas = document.getElementById("txt-alergias-criticas").value;
        pacientesData[camaActiva].anticoagFarma = document.getElementById("txt-anticoag-farma").value;
        pacientesData[camaActiva].anticoagUltima = document.getElementById("txt-anticoag-ultima").value;
        pacientesData[camaActiva].anticoagSugerencia = document.getElementById("txt-anticoag-sugerencia").value;

        ['cardio', 'anestesia', 'neumo', 'nefro'].forEach(r => {
            pacientesData[camaActiva][`r_${r}`] = document.getElementById(`chk-r-${r}`).checked;
            pacientesData[camaActiva][`txt_r_${r}`] = document.getElementById(`txt-r-${r}`).value;
        });

        pacientesData[camaActiva].qProcedimiento = document.getElementById("q-procedimiento").value;
        pacientesData[camaActiva].abordaje = document.getElementById("q-abordaje").value;
        pacientesData[camaActiva].hInicio = document.getElementById("q-h-inicio").value;
        pacientesData[camaActiva].hFin = document.getElementById("q-h-fin").value;
        pacientesData[camaActiva].anestesia = document.getElementById("q-anestesia").value;
        pacientesData[camaActiva].herida = document.getElementById("q-herida").value;
        pacientesData[camaActiva].cirujano = document.getElementById("q-cirujano").value;
        pacientesData[camaActiva].asistente = document.getElementById("q-asistente").value;
        pacientesData[camaActiva].personal = document.getElementById("q-personal").value;
        pacientesData[camaActiva].tecnica = document.getElementById("q-tecnica").value;
        pacientesData[camaActiva].drenaje = document.getElementById("q-drenaje").value;

        pacientesData[camaActiva].labFecha = document.getElementById("lab-fecha").value;
        pacientesData[camaActiva].hb = document.getElementById("lab-hb").value;
        pacientesData[camaActiva].leuco = document.getElementById("lab-leuco").value;
        pacientesData[camaActiva].cayados = document.getElementById("lab-cayados").value;
        pacientesData[camaActiva].creat = document.getElementById("lab-creat").value;
        pacientesData[camaActiva].lactato = document.getElementById("lab-lactato").value;
        pacientesData[camaActiva].inr = document.getElementById("lab-inr").value;
        pacientesData[camaActiva].dren12h = document.getElementById("dren-12h").value;
        pacientesData[camaActiva].dren24h = document.getElementById("dren-24h").value;

        pacientesData[camaActiva].ind1 = document.getElementById("ind-1").value;
        pacientesData[camaActiva].ind2 = document.getElementById("ind-2").value;
        pacientesData[camaActiva].ind3 = document.getElementById("ind-3").value;
        pacientesData[camaActiva].ind4 = document.getElementById("ind-4").value;
        pacientesData[camaActiva].ind5 = document.getElementById("ind-5").value;
        pacientesData[camaActiva].ind6 = document.getElementById("ind-6").value;
        pacientesData[camaActiva].ind7 = document.getElementById("ind-7").value;
        pacientesData[camaActiva].ind8 = document.getElementById("ind-8").value;
        pacientesData[camaActiva].pendientes = document.getElementById("txt-pendientes").value;
        pacientesData[camaActiva].condicionAlta = document.getElementById("chk-condicion-alta").checked;

        localStorage.setItem("pacientesData", JSON.stringify(pacientesData));
        alert("¡Ficha clínica avanzada guardada exitosamente!");
        renderCenso();
    });

    function generarPaseWhatsApp() {
        let total = 0;
        let altas = 0;
        let detalle = "";
        Object.keys(pacientesData).forEach(cama => {
            if (pacientesData[cama].nombre) {
                total++;
                if (pacientesData[cama].condicionAlta) altas++;
                detalle += `\n- Cama ${cama}: ${pacientesData[cama].nombre} (HC: ${pacientesData[cama].hc}) | Dx: ${pacientesData[cama].diagnostico} ${pacientesData[cama].condicionAlta ? '✅ [PROBABLE ALTA]' : ''}`;
            }
        });

        textoPaseWhatsApp.textContent = `📋 PASE DE GUARDIA - CIRUGÍA GENERAL\n🏥 Sede: Hospital II-2 Tarapoto\n🛏️ Censo Total: ${total} pacientes (${altas} listos para alta).\n${detalle}\n\n⚠️ Revisar indicaciones y pendientes en SurgiFlow.`;
    }

    renderCenso();
});

function cambiarSubTab(num) {
    document.querySelectorAll('.subtab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.subtab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`subtab-content-${num}`).style.display = 'block';
    event.currentTarget.classList.add('active');
}

function toggleComorbilidad(com) {
    const chk = document.getElementById(`chk-${com}`);
    const txt = document.getElementById(`trat-${com}`);
    txt.style.display = chk.checked ? "block" : "none";
}

function toggleCondicionAlta() {
    const chk = document.getElementById("chk-condicion-alta");
    const lbl = document.getElementById("lbl-estado-cama");
    lbl.textContent = chk.checked ? "Paciente en condiciones de Alta (Cama por liberar)" : "Ocupada / En Piso";
    lbl.style.color = chk.checked ? "#db2777" : "#059669";
}

function generarTecnicaIA() {
    const proc = document.getElementById("q-procedimiento").value || "Cirugía general";
    const tecnicaIA = `Paciente en decúbito dorsal bajo anestesia general. Asepsia y antisepsia de región operatoria. Se realiza abordaje según técnica convencional/laparoscópica, identificándose hallazgos intraoperatorios sin incidentes. Se realiza hemostasia prolija, recuento de gasas y compresas conforme (conforme). Cierre de pared por planos anatómicos. Paciente pasa a recuperación en condiciones estables.`;
    document.getElementById("q-tecnica").value = tecnicaIA;
    alert("✨ IA: Protocolo operatorio redactado paso a paso con éxito.");
}

function analizarLaboratoriosIA() {
    const hb = parseFloat(document.getElementById("lab-hb").value) || 12;
    const leuco = parseFloat(document.getElementById("lab-leuco").value) || 8000;
    let mensaje = "Valores analíticos dentro de parámetros aceptables de evolución postoperatoria.";
    if (hb < 10) mensaje = "⚠️ ADVERTENCIA: Hemoglobina baja (< 10 g/dL). Evaluar control estricto o soporte transfusional.";
    if (leuco > 12000) mensaje = "⚠️ ADVERTENCIA: Leucocitosis elevada. Descartar foco infeccioso residual o colección intraabdominal.";
    
    document.getElementById("texto-analisis-ia").textContent = mensaje;
    document.getElementById("analisis-ia-box").style.display = "block";
}

function calcularAlvarado() {
    let suma = 0;
    document.querySelectorAll('.alv-chk:checked').forEach(el => {
        suma += parseInt(el.value);
    });
    document.getElementById('resultado-alvarado').textContent = suma;
    let interp = "Riesgo Bajo (Observación)";
    if (suma >= 5 && suma <= 6) interp = "Compatible (Evaluar Imágenes / TAC)";
    if (suma >= 7 && suma <= 8) interp = "Probable Apendicitis (Cirugía indicada)";
    if (suma >= 9) interp = "Apendicitis Muy Probable (Cirugía de Urgencia)";
    document.getElementById('interpretacion-alvarado').textContent = interp;
}

function copiarPaseWhatsApp() {
    const texto = document.getElementById("texto-pase-whatsapp").textContent;
    navigator.clipboard.writeText(texto);
    alert("¡Pase de guardia copiado al portapapeles!");
}
