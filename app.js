document.addEventListener("DOMContentLoaded", () => {
    const gridCamas = document.getElementById("grid-camas");
    
    // Lista de habitaciones y camas de tu servicio
    const habitaciones = ["218", "219", "220", "221", "222", "223", "224"];
    const letras = ["A", "B"];

    habitaciones.forEach(hab => {
        letras.forEach(letra => {
            const numeroCama = `${hab}-${letra}`;
            
            // Creando la tarjeta visual para cada cama
            const card = document.createElement("div");
            card.className = "cama-card"; // Por defecto verde
            
            card.innerHTML = `
                <h3>Cama ${numeroCama}</h3>
                <p><strong>Estado:</strong> Disponible / Libre</p>
                <p><em>Sin paciente asignado</em></p>
            `;
            
            gridCamas.appendChild(card);
        });
    });
});
