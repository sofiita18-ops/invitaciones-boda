(function () {
    'use strict';

    // IMPORTANTE:
    // Aquí debes pegar EXACTAMENTE la URL de tu
    // implementación de Apps Script.
    const API_URL = 'https://script.google.com/macros/s/AKfycbz5zrEtFPTINYTnNYnidS0WJ-4Ep-DbMjdlRF-b2tlhqRyQqBT8mQnWuw1C7CbwAs8fGw/exec';

    const params = new URLSearchParams(window.location.search);
    const invitacionId = params.get('id');

    if (!invitacionId) {
        console.log('ℹ️ No hay ID de invitación en la URL.');
        return;
    }

    function cargarInvitados() {

        const callbackName =
            'respuestaInvitacion_' + Date.now();

        window[callbackName] = function (data) {

            console.log('✅ Respuesta recibida de Apps Script:', data);

            if (!data.ok) {
                console.error(
                    '❌ Apps Script ha respondido con un error:',
                    data.error
                );

                limpiar();
                return;
            }

            mostrarInvitados(data.invitados);
            limpiar();
        };

        const script = document.createElement('script');

        script.id = callbackName;

        script.src =
            API_URL +
            '?id=' +
            encodeURIComponent(invitacionId) +
            '&prefix=' +
            encodeURIComponent(callbackName);

        script.onerror = function () {

            console.error(
                '❌ No se pudo cargar la URL de Apps Script:',
                script.src
            );

            limpiar();
        };

        document.body.appendChild(script);


        function limpiar() {
            delete window[callbackName];

            const elemento =
                document.getElementById(callbackName);

            if (elemento) {
                elemento.remove();
            }
        }
    }


    function mostrarInvitados(invitados) {

        const nombres = invitados
            .map(invitado => invitado.Nombre)
            .filter(Boolean);

        console.log('👥 Invitados encontrados:', nombres);

        if (nombres.length > 0) {

            document.title =
                nombres.join(' & ') +
                ' · Nuestra boda';

        }
    }


    cargarInvitados();

})();
