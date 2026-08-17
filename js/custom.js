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

    crearWebInvitacion();

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
/* ==========================================================
   WEB DE LA BODA
   ========================================================== */

function crearWebInvitacion() {

    // Evitar crearla dos veces
    if (document.getElementById('custom-wedding-site')) {
        return;
    }

    /*
     * Ocultar la web original de RamPatra.
     * La mantenemos en el proyecto por ahora, pero no se verá.
     */
    document.body.classList.add('our-site-mode');


    /*
     * Datos de los invitados
     */
    const invitados =
        window.invitacionBoda?.invitados || [];

    const nombres =
        invitados
            .map(invitado => invitado.Nombre)
            .filter(Boolean);

    const nombresTexto =
        nombres.join(' & ');


    /*
     * Crear nuestra página
     */
    const web =
        document.createElement('main');

    web.id =
        'custom-wedding-site';


    web.innerHTML = `

        <!-- =============================================
             PORTADA
             ============================================= -->

        <section class="wedding-section wedding-cover">

            <div class="wedding-cover-overlay"></div>

            <div class="wedding-cover-content">

                <p class="wedding-small-title">
                    Nos casamos
                </p>

                <h1>
                    Sofía <span>&</span> X
                </h1>

                <p class="wedding-date">
                    FECHA DE LA BODA
                </p>

                <div
                    id="wedding-countdown"
                    class="wedding-countdown"
                >
                    <div>
                        <strong>--</strong>
                        <span>días</span>
                    </div>

                    <div>
                        <strong>--</strong>
                        <span>horas</span>
                    </div>

                    <div>
                        <strong>--</strong>
                        <span>min</span>
                    </div>

                    <div>
                        <strong>--</strong>
                        <span>seg</span>
                    </div>
                </div>

                <p class="wedding-scroll-hint">
                    ↓
                </p>

            </div>

        </section>


        <!-- =============================================
             EVENTO
             ============================================= -->

        <section
            id="evento"
            class="wedding-section wedding-event"
        >

            <div class="wedding-content">

                <p class="wedding-kicker">
                    El gran día
                </p>

                <h2>
                    La boda
                </h2>

                <div class="event-details">

                    <div class="event-detail">

                        <div class="event-icon">
                            ♡
                        </div>

                        <h3>
                            FECHA
                        </h3>

                        <p>
                            FECHA DE LA BODA
                        </p>

                    </div>


                    <div class="event-detail">

                        <div class="event-icon">
                            ○
                        </div>

                        <h3>
                            LUGAR
                        </h3>

                        <p>
                            NOMBRE DEL LUGAR
                        </p>

                        <p class="event-address">
                            Dirección del lugar
                        </p>

                    </div>


                    <div class="event-detail">

                        <div class="event-icon">
                            ◷
                        </div>

                        <h3>
                            HORA
                        </h3>

                        <p>
                            00:00 h
                        </p>

                    </div>

                </div>


                <a
                    class="wedding-button"
                    href="#"
                    target="_blank"
                    rel="noopener"
                >
                    Cómo llegar
                </a>

            </div>

        </section>


        <!-- =============================================
             CONFIRMACIÓN
             ============================================= -->

        <section
            id="confirmacion"
            class="wedding-section wedding-rsvp"
        >

            <div class="wedding-content">

                <p class="wedding-kicker">
                    ¿Nos acompañas?
                </p>

                <h2>
                    Confirma tu asistencia
                </h2>

                <p class="wedding-text">
                    Nos hace mucha ilusión compartir este
                    día contigo.
                </p>

                <button
                    type="button"
                    id="open-rsvp"
                    class="wedding-button wedding-button-main"
                >
                    Confirmar asistencia
                </button>

            </div>

        </section>


        <!-- =============================================
             INFORMACIÓN
             ============================================= -->

        <section
            id="informacion"
            class="wedding-section wedding-info"
        >

            <div class="wedding-content">

                <p class="wedding-kicker">
                    Para que todo sea más fácil
                </p>

                <h2>
                    Información
                </h2>


                <div class="info-card">

                    <h3>
                        Alojamiento
                    </h3>

                    <p>
                        Aquí añadiremos los hoteles,
                        apartamentos y opciones de
                        alojamiento recomendadas.
                    </p>

                </div>


                <div class="info-card">

                    <h3>
                        Cómo llegar
                    </h3>

                    <p>
                        Aquí añadiremos información
                        sobre coche, autobús, taxi,
                        parking, etc.
                    </p>

                </div>


                <div class="info-card">

                    <h3>
                        Horarios
                    </h3>

                    <p>
                        Aquí pondremos los horarios
                        específicos de la boda,
                        autobuses, recepción, etc.
                    </p>

                </div>


                <div class="info-card">

                    <h3>
                        Otros detalles
                    </h3>

                    <p>
                        Todo aquello que necesitéis
                        saber antes de venir.
                    </p>

                </div>

            </div>

        </section>


        <!-- =============================================
             PIE
             ============================================= -->

        <footer class="wedding-footer">

            <p>
                Sofía & X
            </p>

            <span>
                Con mucho cariño
            </span>

        </footer>

    `;


    document.body.appendChild(web);


    /*
     * Inicializar cuenta atrás
     */
    iniciarCuentaAtras();


    /*
     * Botón de RSVP
     */
    const botonRsvp =
        document.getElementById('open-rsvp');

    if (botonRsvp) {

        botonRsvp.addEventListener(
            'click',
            () => {

                /*
                 * De momento solo desplazamos
                 * hacia la futura zona del formulario.
                 */
                 abrirFormularioRsvp();

            }
        );
    }



/* ==========================================================
   CUENTA ATRÁS
   ========================================================== */

function iniciarCuentaAtras() {

    /*
     * CAMBIAREMOS ESTA FECHA CUANDO ME DES
     * LA FECHA DEFINITIVA DE LA BODA.
     */
    const fechaBoda =
        new Date('2030-01-01T18:00:00');

    const elemento =
        document.getElementById(
            'wedding-countdown'
        );

    if (!elemento) {
        return;
    }


    function actualizar() {

        const ahora =
            new Date();

        const diferencia =
            fechaBoda - ahora;


        if (diferencia <= 0) {

            elemento.innerHTML = `
                <p>
                    ¡Ha llegado el gran día!
                </p>
            `;

            return;
        }


        const dias =
            Math.floor(
                diferencia /
                (1000 * 60 * 60 * 24)
            );

        const horas =
            Math.floor(
                (diferencia /
                (1000 * 60 * 60)) % 24
            );

        const minutos =
            Math.floor(
                (diferencia /
                (1000 * 60)) % 60
            );

        const segundos =
            Math.floor(
                (diferencia /
                1000) % 60
            );


        elemento.innerHTML = `

            <div>
                <strong>${dias}</strong>
                <span>días</span>
            </div>

            <div>
                <strong>${horas}</strong>
                <span>horas</span>
            </div>

            <div>
                <strong>${minutos}</strong>
                <span>min</span>
            </div>

            <div>
                <strong>${segundos}</strong>
                <span>seg</span>
            </div>

        `;
    }


    actualizar();

    setInterval(
        actualizar,
        1000
    );
}


    /* ==========================================================
   FORMULARIO RSVP
   ========================================================== */

function abrirFormularioRsvp() {

    const existente =
        document.getElementById('rsvp-modal');

    if (existente) {
        existente.classList.add('is-visible');
        return;
    }

    const invitados =
        window.invitacionBoda?.invitados || [];

    if (!invitados.length) {
        alert('No se han encontrado invitados para este enlace.');
        return;
    }

    const modal =
        document.createElement('div');

    modal.id = 'rsvp-modal';

    modal.innerHTML = `
        <div class="rsvp-backdrop"></div>

        <div class="rsvp-panel">

            <button
                type="button"
                class="rsvp-close"
                id="rsvp-close"
                aria-label="Cerrar"
            >
                ×
            </button>

            <div class="rsvp-inner">

                <p class="wedding-kicker">
                    Confirmación
                </p>

                <h2>
                    ¿Quiénes nos acompañáis?
                </h2>

                <p class="rsvp-intro">
                    Selecciona las personas que asistirán
                    y completa sus datos.
                </p>

                <div id="rsvp-invitados"></div>

                <div class="rsvp-general">

                    <label for="rsvp-observaciones">
                        ¿Hay algo más que debamos saber?
                    </label>

                    <textarea
                        id="rsvp-observaciones"
                        rows="4"
                        placeholder="Cuéntanos cualquier cosa que debamos tener en cuenta..."
                    ></textarea>

                </div>

                <button
                    type="button"
                    id="guardar-rsvp"
                    class="wedding-button wedding-button-main rsvp-save"
                >
                    Guardar respuesta
                </button>

                <div
                    id="rsvp-mensaje"
                    class="rsvp-message"
                ></div>

            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.body.classList.add('rsvp-open');

    setTimeout(() => {
        modal.classList.add('is-visible');
    }, 20);


    /*
     * Cerrar
     */
    document
        .getElementById('rsvp-close')
        .addEventListener(
            'click',
            cerrarFormularioRsvp
        );

    document
        .querySelector('.rsvp-backdrop')
        .addEventListener(
            'click',
            cerrarFormularioRsvp
        );


    /*
     * Crear campos de invitados
     */
    cargarCamposInvitados();


    /*
     * Botón guardar
     */
    document
        .getElementById('guardar-rsvp')
        .addEventListener(
            'click',
            guardarFormularioRsvp
        );
}


/* ==========================================================
   CERRAR FORMULARIO
   ========================================================== */

function cerrarFormularioRsvp() {

    const modal =
        document.getElementById('rsvp-modal');

    if (!modal) {
        return;
    }

    modal.classList.remove('is-visible');

    setTimeout(() => {

        modal.remove();

        document.body.classList.remove(
            'rsvp-open'
        );

    }, 350);
}


/* ==========================================================
   CARGAR INVITADOS + RESPUESTAS EXISTENTES
   ========================================================== */

function cargarCamposInvitados() {

    const contenedor =
        document.getElementById('rsvp-invitados');

    const invitados =
        window.invitacionBoda?.invitados || [];

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = `
        <div class="rsvp-loading">
            Cargando...
        </div>
    `;


    obtenerRsvpExistente()
        .then(respuestas => {

            contenedor.innerHTML = '';

            invitados.forEach(
                (invitado, index) => {

                    const nombre =
                        invitado.Nombre || '';

                    const respuesta =
                        respuestas.find(
                            r =>
                                String(r.Nombre).trim()
                                ===
                                String(nombre).trim()
                        );


                    contenedor.appendChild(
                        crearBloqueInvitado(
                            invitado,
                            respuesta,
                            index
                        )
                    );

                }
            );

        })
        .catch(error => {

            console.error(error);

            contenedor.innerHTML = `
                <p class="rsvp-error">
                    No se han podido cargar las respuestas anteriores.
                    Puedes rellenar el formulario igualmente.
                </p>
            `;

            invitados.forEach(
                (invitado, index) => {

                    contenedor.appendChild(
                        crearBloqueInvitado(
                            invitado,
                            null,
                            index
                        )
                    );

                }
            );

        });
}


/* ==========================================================
   LEER RSVP DESDE APPS SCRIPT
   ========================================================== */

function obtenerRsvpExistente() {

    return new Promise(
        (resolve, reject) => {

            const id =
                window.invitacionBoda?.id;

            if (!id) {
                resolve([]);
                return;
            }


            const callbackName =
                'rsvp_' + Date.now();


            window[callbackName] =
                function (data) {

                    try {

                        if (!data.ok) {
                            reject(
                                new Error(
                                    data.error ||
                                    'No se han podido leer las respuestas.'
                                )
                            );
                            return;
                        }

                        resolve(
                            data.respuestas || []
                        );

                    } finally {

                        delete window[callbackName];

                        if (script.parentNode) {
                            script.remove();
                        }

                    }
                };


            const script =
                document.createElement('script');

            script.src =
                API_URL +
                '?id=' +
                encodeURIComponent(id) +
                '&action=getRsvp' +
                '&prefix=' +
                encodeURIComponent(callbackName);


            script.onerror =
                function () {

                    delete window[callbackName];

                    if (script.parentNode) {
                        script.remove();
                    }

                    reject(
                        new Error(
                            'No se ha podido conectar con RSVP.'
                        )
                    );

                };


            document.body.appendChild(script);

        }
    );
}


/* ==========================================================
   BLOQUE DE CADA INVITADO
   ========================================================== */

function crearBloqueInvitado(
    invitado,
    respuesta,
    index
) {

    const bloque =
        document.createElement('div');

    bloque.className =
        'rsvp-person';

    bloque.dataset.nombre =
        invitado.Nombre || '';

    const nombre =
        escapeHtml(
            invitado.Nombre || ''
        );


    const asistencia =
        respuesta?.Asistencia || '';

    const menu =
        respuesta?.Menú || '';

    const alergias =
        respuesta?.['Alergias / intolerancias'] || '';

    const alojamiento =
        respuesta?.Alojamiento || '';

    const observaciones =
        respuesta?.Observaciones || '';


    bloque.innerHTML = `

        <div class="rsvp-person-title">

            <h3>
                ${nombre}
            </h3>

        </div>


        <div class="rsvp-field">

            <label>
                ¿Nos acompañas?
            </label>

            <div class="rsvp-options">

                <label class="rsvp-option">
                    <input
                        type="radio"
                        name="asistencia-${index}"
                        value="Sí"
                        ${asistencia === 'Sí' ? 'checked' : ''}
                    >
                    <span>Sí, allí estaré</span>
                </label>

                <label class="rsvp-option">
                    <input
                        type="radio"
                        name="asistencia-${index}"
                        value="No"
                        ${asistencia === 'No' ? 'checked' : ''}
                    >
                    <span>No podré asistir</span>
                </label>

            </div>

        </div>


        <div
            class="rsvp-extra-fields"
            data-extra-fields="${index}"
        >

            <div class="rsvp-field">

                <label for="menu-${index}">
                    Menú
                </label>

                <select id="menu-${index}">

                    <option value="">
                        Selecciona una opción
                    </option>

                    <option
                        value="Normal"
                        ${menu === 'Normal' ? 'selected' : ''}
                    >
                        Normal
                    </option>

                    <option
                        value="Vegetariano"
                        ${menu === 'Vegetariano' ? 'selected' : ''}
                    >
                        Vegetariano
                    </option>

                    <option
                        value="Infantil"
                        ${menu === 'Infantil' ? 'selected' : ''}
                    >
                        Infantil
                    </option>

                </select>

            </div>


            <div class="rsvp-field">

                <label for="alergias-${index}">
                    Alergias / intolerancias
                </label>

                <input
                    type="text"
                    id="alergias-${index}"
                    value="${escapeHtml(alergias)}"
                    placeholder="Indica cuáles"
                >

            </div>


            <div class="rsvp-field">

                <label>
                    ¿Necesitas alojamiento?
                </label>

                <div class="rsvp-options">

                    <label class="rsvp-option">
                        <input
                            type="radio"
                            name="alojamiento-${index}"
                            value="Sí"
                            ${alojamiento === 'Sí' ? 'checked' : ''}
                        >
                        <span>Sí</span>
                    </label>

                    <label class="rsvp-option">
                        <input
                            type="radio"
                            name="alojamiento-${index}"
                            value="No"
                            ${alojamiento === 'No' ? 'checked' : ''}
                        >
                        <span>No</span>
                    </label>

                </div>

            </div>


            <div class="rsvp-field">

                <label for="observaciones-${index}">
                    Observaciones
                </label>

                <textarea
                    id="observaciones-${index}"
                    rows="3"
                    placeholder="Cualquier cosa que debamos saber..."
                >${escapeHtml(observaciones)}</textarea>

            </div>

        </div>
    `;


    /*
     * Mostrar/ocultar campos adicionales
     */
    const radios =
        bloque.querySelectorAll(
            `input[name="asistencia-${index}"]`
        );

    function actualizarCampos() {

        const seleccion =
            bloque.querySelector(
                `input[name="asistencia-${index}"]:checked`
            );

        const extras =
            bloque.querySelector(
                `[data-extra-fields="${index}"]`
            );

        if (!seleccion || seleccion.value === 'No') {

            extras.classList.add(
                'is-disabled'
            );

        } else {

            extras.classList.remove(
                'is-disabled'
            );

        }
    }

    radios.forEach(
        radio => {
            radio.addEventListener(
                'change',
                actualizarCampos
            );
        }
    );

    actualizarCampos();


    return bloque;
}


/* ==========================================================
   GUARDAR FORMULARIO
   ========================================================== */

async function guardarFormularioRsvp() {

    const boton =
        document.getElementById(
            'guardar-rsvp'
        );

    const mensaje =
        document.getElementById(
            'rsvp-mensaje'
        );

    const personas =
        document.querySelectorAll(
            '.rsvp-person'
        );


    if (!personas.length) {
        return;
    }


    const invitados =
        [];


    for (const persona of personas) {

        const nombre =
            persona.dataset.nombre;

        const asistenciaSeleccionada =
            persona.querySelector(
                'input[name^="asistencia-"]:checked'
            );


        if (!asistenciaSeleccionada) {

            mensaje.innerHTML =
                `Indica si ${escapeHtml(nombre)}
                 asistirá o no.`;

            mensaje.className =
                'rsvp-message error';

            return;
        }


        const asistencia =
            asistenciaSeleccionada.value;


        let menu = '';
        let alergias = '';
        let alojamiento = '';
        let observaciones = '';


        if (asistencia === 'Sí') {

            const menuInput =
                persona.querySelector(
                    'select'
                );

            const alergiasInput =
                persona.querySelector(
                    'input[type="text"]'
                );

            const alojamientoInput =
                persona.querySelector(
                    'input[name^="alojamiento-"]:checked'
                );

            const observacionesInput =
                persona.querySelector(
                    'textarea'
                );


            menu =
                menuInput
                    ? menuInput.value
                    : '';

            alergias =
                alergiasInput
                    ? alergiasInput.value.trim()
                    : '';

            alojamiento =
                alojamientoInput
                    ? alojamientoInput.value
                    : '';

            observaciones =
                observacionesInput
                    ? observacionesInput.value.trim()
                    : '';
        }


        invitados.push({
            nombre,
            asistencia,
            menu,
            alergias,
            alojamiento,
            observaciones
        });
    }


    /*
     * Observación general
     */
    const observacionesGenerales =
        document.getElementById(
            'rsvp-observaciones'
        );


    if (
        observacionesGenerales &&
        observacionesGenerales.value.trim()
    ) {

        if (invitados.length) {

            invitados[
                invitados.length - 1
            ].observaciones =
                invitados[
                    invitados.length - 1
                ].observaciones
                + ' | '
                + observacionesGenerales.value.trim();

        }
    }


    const payload = {

        id:
            window.invitacionBoda.id,

        invitados
    };


    boton.disabled = true;

    boton.textContent =
        'Guardando...';


    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'text/plain;charset=utf-8'
                    },

                    body:
                        JSON.stringify(payload)
                }
            );


        const data =
            await response.json();


        if (!data.ok) {

            throw new Error(
                data.error ||
                'No se ha podido guardar.'
            );

        }


        mensaje.innerHTML =
            '¡Respuesta guardada correctamente! ❤️';

        mensaje.className =
            'rsvp-message success';


        boton.textContent =
            'Respuesta guardada';


        /*
         * Actualizamos nuestro estado local
         */
        window.invitacionBoda.rsvp =
            invitados;


    } catch (error) {

        console.error(error);

        mensaje.innerHTML =
            'No hemos podido guardar la respuesta. ' +
            'Inténtalo de nuevo.';

        mensaje.className =
            'rsvp-message error';


        boton.disabled = false;

        boton.textContent =
            'Guardar respuesta';
    }
}
})();
