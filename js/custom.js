(function () {
    'use strict';

    // URL de nuestro Google Apps Script
    const API_URL = 'https://script.google.com/macros/s/AKfycbz5zrEtFPTINYTnNYnidS0WJ-4Ep-DbMjdlRF-b2tlhqRyQqBT8mQnWuw1C7CbwAs8fGw/exec';

    // Lee el ID de la URL:
    // https://sofiita18-ops.github.io/invitaciones-boda/?id=F001
    const params = new URLSearchParams(window.location.search);
    const invitacionId = params.get('id');

    // Si no hay ID, no hacemos nada todavía.
    if (!invitacionId) {
        console.log('No se ha proporcionado ningún ID de invitación.');
        return;
    }

    /**
     * Consulta Google Apps Script
     */
    async function cargarInvitados() {
        try {
            const url = `${API_URL}?id=${encodeURIComponent(invitacionId)}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Error HTTP ' + response.status);
            }

            const data = await response.json();

            if (!data.ok) {
                throw new Error(data.error || 'No se encontraron invitados');
            }

            console.log('✅ Invitación encontrada:', data);

            mostrarInvitados(data.invitados);

        } catch (error) {
            console.error('❌ Error cargando la invitación:', error);
        }
    }

    /**
     * De momento solo mostramos los nombres en la consola.
     * Más adelante los colocaremos en el sobre.
     */
    function mostrarInvitados(invitados) {

        const nombres = invitados
            .map(invitado => invitado.Nombre)
            .filter(Boolean);

        console.log('👥 Invitados:', nombres);

        // PRUEBA TEMPORAL:
        // Cambiamos el título de la página para comprobar que funciona.
        if (nombres.length > 0) {
            document.title = nombres.join(' & ') + ' · Nuestra boda';
        }
    }

    cargarInvitados();

})();
