(function () {
    'use strict';

    const API_URL =
        'https://script.google.com/macros/s/AKfycbz5zrEtFPTINYTnNYnidS0WJ-4Ep-DbMjdlRF-b2tlhqRyQqBT8mQnWuw1C7CbwAs8fGw/exec';

    const params = new URLSearchParams(window.location.search);
    const invitacionId = params.get('id');

    /*
     * Si no existe ID, dejamos la web normal.
     */
    if (!invitacionId) {
        console.log('ℹ️ No hay ID de invitación.');
        return;
    }

    /*
     * ------------------------------------------------------
     * CARGAR CSS PERSONALIZADO
     * ------------------------------------------------------
     */

    const customCss = document.createElement('link');

    customCss.rel = 'stylesheet';
    customCss.href = 'css/custom.css';

    document.head.appendChild(customCss);


    /*
     * ------------------------------------------------------
     * CREAR SOBRE
     * ------------------------------------------------------
     */

    function crearSobre(invitados) {

        const nombres = invitados
            .map(invitado => invitado.Nombre)
            .filter(Boolean);

        if (!nombres.length) {
            return;
        }

        const nombreInvitados =
            nombres.length === 1
                ? nombres[0]
                : nombres.join(' · ');

        /*
         * Iniciales para el sello.
         */
        const iniciales = nombres
            .map(nombre => nombre.trim().charAt(0))
            .slice(0, 2)
            .join(' & ');

        const overlay = document.createElement('div');

        overlay.id = 'invitation-envelope';

        overlay.innerHTML = `
            <div class="invitation-envelope-content">

                <div class="invitation-guest-label">
                    Esta invitación es para
                </div>

                <div class="invitation-guest-names">
                    ${escapeHtml(nombreInvitados)}
                </div>

                <div
                    class="envelope"
                    id="envelope"
                    role="button"
                    tabindex="0"
                    aria-label="Abrir invitación"
                >

                    <div class="envelope-body"></div>

                    <div class="envelope-flap"></div>

                    <div class="envelope-seal">
                        ${escapeHtml(iniciales)}
                    </div>

                </div>

                <div class="invitation-open-hint">
                    Desliza hacia arriba para abrir
                </div>

                <div class="invitation-swipe">
                    ↑
                </div>

            </div>
        `;

        document.body.appendChild(overlay);

        /*
         * Bloquear la página mientras el sobre está cerrado.
         */
        document.body.classList.add('invitation-locked');

        prepararApertura(overlay);
    }


    /*
     * ------------------------------------------------------
     * ABRIR SOBRE
     * ------------------------------------------------------
     */

    function prepararApertura(overlay) {

        const envelope =
            overlay.querySelector('#envelope');

        let startY = null;

        function abrir() {

            if (
                envelope.classList.contains('is-opening') ||
                overlay.classList.contains('is-open')
            ) {
                return;
            }

            envelope.classList.add('is-opening');

            /*
             * Esperamos a que la animación del sobre termine
             * antes de quitar la pantalla.
             */
            setTimeout(() => {

                overlay.classList.add('is-open');

                document.body.classList.remove(
                    'invitation-locked'
                );

            }, 950);
        }


        /*
         * Tocar el sobre
         */
        envelope.addEventListener(
            'click',
            abrir
        );


        /*
         * Teclado
         */
        envelope.addEventListener(
            'keydown',
            event => {

                if (
                    event.key === 'Enter' ||
                    event.key === ' '
                ) {

                    event.preventDefault();
                    abrir();

                }

            }
        );


        /*
         * Gesto táctil:
         * deslizar hacia arriba.
         */
        overlay.addEventListener(
            'touchstart',
            event => {

                startY =
                    event.touches[0].clientY;

            },
            { passive: true }
        );


        overlay.addEventListener(
            'touchend',
            event => {

                if (startY === null) {
                    return;
                }

                const endY =
                    event.changedTouches[0].clientY;

                const desplazamiento =
                    startY - endY;

                /*
                 * 60 px hacia arriba = abrir
                 */
                if (desplazamiento > 60) {
                    abrir();
                }

                startY = null;

            },
            { passive: true }
        );
    }


    /*
     * ------------------------------------------------------
     * ESCAPAR HTML
     * ------------------------------------------------------
     */

    function escapeHtml(text) {

        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

    }


    /*
     * ------------------------------------------------------
     * LLAMAR A GOOGLE APPS SCRIPT
     * ------------------------------------------------------
     */

    async function cargarInvitados() {

        try {

            const url =
                `${API_URL}?id=${encodeURIComponent(invitacionId)}`;

            const response =
                await fetch(url);

            if (!response.ok) {
                throw new Error(
                    'Error HTTP ' + response.status
                );
            }

            const data =
                await response.json();

            if (!data.ok) {

                throw new Error(
                    data.error ||
                    'No se encontraron invitados'
                );

            }

            console.log(
                '✅ Respuesta recibida:',
                data
            );

            console.log(
                '👥 Invitados encontrados:',
                data.invitados.map(
                    invitado => invitado.Nombre
                )
            );

            /*
             * Guardamos los invitados globalmente.
             * Los utilizaremos después para el formulario.
             */
            window.invitacionBoda = {
                id: invitacionId,
                invitados: data.invitados
            };

            crearSobre(data.invitados);

        } catch (error) {

            console.error(
                '❌ Error cargando la invitación:',
                error
            );

        }
    }


    /*
     * Iniciar.
     */
    cargarInvitados();

})();
