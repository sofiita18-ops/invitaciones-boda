(function () {
    'use strict';

    // URL de Google Apps Script
    const API_URL =
        'https://script.google.com/macros/s/AKfycbz5zrEtFPTINYTnNYnidS0WJ-4Ep-DbMjdlRF-b2tlhqRyQqBT8mQnWuw1C7CbwAs8fGw/exec';

    // Leer el ID de la URL
    const params = new URLSearchParams(window.location.search);
    const invitacionId = params.get('id');

    if (!invitacionId) {
        console.log('No se ha proporcionado ningún ID de invitación.');
        return;
    }

    /**
     * Cargar los invitados mediante JSONP.
     */
    function cargarInvitados() {

        const callbackName =
            'respuestaInvitacion_' + Date.now();

        window[callbackName] = function (data) {

            try {

                if (!data.ok) {
                    throw new Error(
                        data.error || 'No se encontraron invitados'
                    );
                }

                console.log('✅ Invitación encontrada:', data);

                mostrarInvitados(data.invitados);

            } catch (error) {

                console.error(
                    '❌ Error procesando la invitación:',
                    error
                );

            } finally {

                // Limpiar callback
                delete window[callbackName];

                // Eliminar script temporal
                const script =
                    document.getElementById(callbackName);

                if (script) {
                    script.remove();
                }
            }
        };

        const script = document.createElement('script');

        script.id = callbackName;

        script.src =
            `${API_URL}?id=${encodeURIComponent(invitacionId)}&callback=${callbackName}`;

        script.onerror = function () {

            console.error(
                '❌ No se pudo conectar con Google Apps Script.'
            );

            delete window[callbackName];
            script.remove();
        };

        document.body.appendChild(script);
    }


    /**
     * Mostrar los nombres encontrados.
     * De momento solo es una prueba.
     */
    function mostrarInvitados(invitados) {

        const nombres = invitados
            .map(invitado => invitado.Nombre)
            .filter(Boolean);

        console.log('👥 Invitados:', nombres);

        if (nombres.length > 0) {

            document.title =
                nombres.join(' & ') +
                ' · Nuestra boda';

        }
    }


    cargarInvitados();

})();
