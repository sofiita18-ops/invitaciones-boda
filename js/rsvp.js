(function () {

    'use strict';


    /*
     * ----------------------------------------------------
     * ABRIR FORMULARIO
     * ----------------------------------------------------
     */

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

            alert(
                'No se han encontrado invitados.'
            );

            return;
        }


        const modal =
            document.createElement('div');

        modal.id =
            'rsvp-modal';


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
                        Completa la información de todas
                        las personas incluidas en esta invitación.
                    </p>


                    <div id="rsvp-invitados">

                        <div class="rsvp-loading">
                            Cargando...
                        </div>

                    </div>


                    <div class="rsvp-general">

                        <label
                            for="rsvp-observaciones"
                        >
                            ¿Algo más que debamos saber?
                        </label>

                        <textarea
                            id="rsvp-observaciones"
                            rows="4"
                            placeholder="Cualquier detalle que debamos tener en cuenta..."
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


        document.body.appendChild(
            modal
        );


        document.body.classList.add(
            'rsvp-open'
        );


        setTimeout(() => {

            modal.classList.add(
                'is-visible'
            );

        }, 20);


        /*
         * Cerrar
         */

        document
            .getElementById('rsvp-close')
            .addEventListener(
                'click',
                cerrarFormulario
            );


        document
            .querySelector('.rsvp-backdrop')
            .addEventListener(
                'click',
                cerrarFormulario
            );


        /*
         * Cargar invitados + respuestas
         */

        cargarFormulario();


        /*
         * Guardar
         */

        document
            .getElementById('guardar-rsvp')
            .addEventListener(
                'click',
                guardarFormulario
            );

    }


    /*
     * ----------------------------------------------------
     * CERRAR
     * ----------------------------------------------------
     */

    function cerrarFormulario() {

        const modal =
            document.getElementById(
                'rsvp-modal'
            );


        if (!modal) {
            return;
        }


        modal.classList.remove(
            'is-visible'
        );


        setTimeout(() => {

            modal.remove();

            document.body.classList.remove(
                'rsvp-open'
            );

        }, 300);

    }


    /*
     * ----------------------------------------------------
     * CARGAR FORMULARIO
     * ----------------------------------------------------
     */

    async function cargarFormulario() {

        const contenedor =
            document.getElementById(
                'rsvp-invitados'
            );


        try {

            const respuestas =
                await obtenerRespuestas();


            const invitados =
                window.invitacionBoda
                    ?.invitados || [];


            contenedor.innerHTML = '';


            invitados.forEach(
                (invitado, index) => {

                    const respuesta =
                        respuestas.find(
                            r =>
                                String(
                                    r.Nombre
                                ).trim()
                                ===
                                String(
                                    invitado.Nombre
                                ).trim()
                        );


                    contenedor.appendChild(

                        crearInvitado(
                            invitado,
                            respuesta,
                            index
                        )

                    );

                }
            );


        } catch (error) {

            console.error(
                error
            );


            contenedor.innerHTML = '';

            const invitados =
                window.invitacionBoda
                    ?.invitados || [];


            invitados.forEach(
                (invitado, index) => {

                    contenedor.appendChild(

                        crearInvitado(
                            invitado,
                            null,
                            index
                        )

                    );

                }
            );

        }

    }


    /*
     * ----------------------------------------------------
     * OBTENER RESPUESTAS EXISTENTES
     * ----------------------------------------------------
     */

    function obtenerRespuestas() {

        return new Promise(
            (resolve, reject) => {

                const id =
                    window.invitacionBoda
                        ?.id;


                if (!id) {

                    resolve([]);

                    return;
                }


                const callback =
                    'rsvpRead_' +
                    Date.now();


                window[callback] =
                    function (data) {

                        try {

                            if (!data.ok) {

                                reject(
                                    new Error(
                                        data.error ||
                                        'No se han podido cargar las respuestas.'
                                    )
                                );

                                return;
                            }


                            resolve(
                                data.respuestas ||
                                []
                            );


                        } finally {

                            delete window[
                                callback
                            ];


                            if (
                                script.parentNode
                            ) {

                                script.remove();

                            }

                        }

                    };


                const script =
                    document.createElement(
                        'script'
                    );


                const api =
                    window.invitacionBoda
                        .apiUrl;


                script.src =
                    api +
                    '?id=' +
                    encodeURIComponent(id) +
                    '&action=getRsvp' +
                    '&prefix=' +
                    callback;


                script.onerror =
                    function () {

                        delete window[
                            callback
                        ];


                        if (
                            script.parentNode
                        ) {

                            script.remove();

                        }


                        reject(
                            new Error(
                                'Error conectando con RSVP.'
                            )
                        );

                    };


                document.body.appendChild(
                    script
                );

            }
        );
    }


    /*
     * ----------------------------------------------------
     * CREAR BLOQUE DE INVITADO
     * ----------------------------------------------------
     */

    function crearInvitado(
        invitado,
        respuesta,
        index
    ) {

        const bloque =
            document.createElement(
                'div'
            );


        bloque.className =
            'rsvp-person';


        bloque.dataset.nombre =
            invitado.Nombre || '';


        const nombre =
            escapeHtml(
                invitado.Nombre || ''
            );


        const asistencia =
            respuesta?.Asistencia ||
            '';


        const menu =
            respuesta?.Menú ||
            '';


        const alergias =
            respuesta?.[
                'Alergias / intolerancias'
            ] || '';


        const alojamiento =
            respuesta?.Alojamiento ||
            '';


        const observaciones =
            respuesta?.Observaciones ||
            '';


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
                            ${
                                asistencia === 'Sí'
                                    ? 'checked'
                                    : ''
                            }
                        >

                        <span>
                            Sí, allí estaré
                        </span>

                    </label>


                    <label class="rsvp-option">

                        <input
                            type="radio"
                            name="asistencia-${index}"
                            value="No"
                            ${
                                asistencia === 'No'
                                    ? 'checked'
                                    : ''
                            }
                        >

                        <span>
                            No podré asistir
                        </span>

                    </label>

                </div>

            </div>


            <div
                class="rsvp-extra-fields"
                data-extra-fields="${index}"
            >

                <div class="rsvp-field">

                    <label
                        for="menu-${index}"
                    >
                        Menú
                    </label>


                    <select
                        id="menu-${index}"
                    >

                        <option value="">
                            Selecciona una opción
                        </option>


                        <option
                            value="Normal"
                            ${
                                menu === 'Normal'
                                    ? 'selected'
                                    : ''
                            }
                        >
                            Normal
                        </option>


                        <option
                            value="Vegetariano"
                            ${
                                menu === 'Vegetariano'
                                    ? 'selected'
                                    : ''
                            }
                        >
                            Vegetariano
                        </option>


                        <option
                            value="Infantil"
                            ${
                                menu === 'Infantil'
                                    ? 'selected'
                                    : ''
                            }
                        >
                            Infantil
                        </option>

                    </select>

                </div>


                <div class="rsvp-field">

                    <label
                        for="alergias-${index}"
                    >
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
                                ${
                                    alojamiento === 'Sí'
                                        ? 'checked'
                                        : ''
                                }
                            >

                            <span>
                                Sí
                            </span>

                        </label>


                        <label class="rsvp-option">

                            <input
                                type="radio"
                                name="alojamiento-${index}"
                                value="No"
                                ${
                                    alojamiento === 'No'
                                        ? 'checked'
                                        : ''
                                }
                            >

                            <span>
                                No
                            </span>

                        </label>

                    </div>

                </div>


                <div class="rsvp-field">

                    <label
                        for="observaciones-${index}"
                    >
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
         * Mostrar/ocultar campos
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


            if (
                !seleccion ||
                seleccion.value === 'No'
            ) {

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


    /*
     * ----------------------------------------------------
     * GUARDAR FORMULARIO
     * ----------------------------------------------------
     */

    async function guardarFormulario() {

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


        const invitados =
            [];


        /*
         * Validar personas
         */

        for (
            const persona
            of personas
        ) {

            const nombre =
                persona.dataset.nombre;


            const asistencia =
                persona.querySelector(
                    'input[name^="asistencia-"]:checked'
                );


            if (!asistencia) {

                mostrarMensaje(
                    mensaje,
                    `Indica si ${nombre} asistirá o no.`,
                    true
                );

                return;
            }


            let menu = '';
            let alergias = '';
            let alojamiento = '';
            let observaciones = '';


            if (
                asistencia.value === 'Sí'
            ) {

                const menuElement =
                    persona.querySelector(
                        'select'
                    );


                const alergiasElement =
                    persona.querySelector(
                        'input[type="text"]'
                    );


                const alojamientoElement =
                    persona.querySelector(
                        'input[name^="alojamiento-"]:checked'
                    );


                const observacionesElement =
                    persona.querySelector(
                        'textarea'
                    );


                menu =
                    menuElement
                        ?.value || '';


                alergias =
                    alergiasElement
                        ?.value
                        ?.trim() || '';


                alojamiento =
                    alojamientoElement
                        ?.value || '';


                observaciones =
                    observacionesElement
                        ?.value
                        ?.trim() || '';

            }


            invitados.push({

                nombre,

                asistencia:
                    asistencia.value,

                menu,

                alergias,

                alojamiento,

                observaciones

            });

        }


        /*
         * Observación general
         */

        const observacionGeneral =
            document.getElementById(
                'rsvp-observaciones'
            );


        if (
            observacionGeneral &&
            observacionGeneral.value.trim()
        ) {

            const texto =
                observacionGeneral.value.trim();


            if (invitados.length) {

                invitados[
                    invitados.length - 1
                ].observaciones +=
                    (
                        invitados[
                            invitados.length - 1
                        ].observaciones
                            ? ' | '
                            : ''
                    ) +
                    texto;

            }

        }


        const datos = {

            id:
                window.invitacionBoda.id,

            invitados

        };


        boton.disabled = true;

        boton.textContent =
            'Guardando...';


        try {

            const resultado =
                await guardarEnAppsScript(
                    datos
                );


            if (!resultado.ok) {

                throw new Error(
                    resultado.error ||
                    'No se ha podido guardar.'
                );

            }


            mostrarMensaje(
                mensaje,
                '¡Respuesta guardada correctamente! ❤️',
                false
            );


            boton.textContent =
                'Respuesta guardada';


            window.invitacionBoda.rsvp =
                invitados;


        } catch (error) {

            console.error(
                error
            );


            mostrarMensaje(
                mensaje,
                'No hemos podido guardar la respuesta. Inténtalo de nuevo.',
                true
            );


            boton.disabled =
                false;


            boton.textContent =
                'Guardar respuesta';

        }

    }


    /*
     * ----------------------------------------------------
     * GUARDAR EN APPS SCRIPT MEDIANTE JSONP
     * ----------------------------------------------------
     */

    function guardarEnAppsScript(
        datos
    ) {

        return new Promise(
            (resolve, reject) => {

                const callback =
                    'rsvpSave_' +
                    Date.now();


                window[callback] =
                    function (data) {

                        try {

                            resolve(
                                data
                            );

                        } finally {

                            delete window[
                                callback
                            ];

                            if (
                                script.parentNode
                            ) {

                                script.remove();

                            }

                        }

                    };


                const script =
                    document.createElement(
                        'script'
                    );


                const api =
                    window.invitacionBoda
                        .apiUrl;


                const payload =
                    encodeURIComponent(
                        JSON.stringify(datos)
                    );


                script.src =
                    api +
                    '?action=saveRsvp' +
                    '&id=' +
                    encodeURIComponent(
                        datos.id
                    ) +
                    '&payload=' +
                    payload +
                    '&prefix=' +
                    callback;


                script.onerror =
                    function () {

                        delete window[
                            callback
                        ];


                        if (
                            script.parentNode
                        ) {

                            script.remove();

                        }


                        reject(
                            new Error(
                                'No se ha podido conectar con Apps Script.'
                            )
                        );

                    };


                document.body.appendChild(
                    script
                );

            }
        );

    }


    /*
     * ----------------------------------------------------
     * MENSAJES
     * ----------------------------------------------------
     */

    function mostrarMensaje(
        elemento,
        texto,
        error
    ) {

        elemento.textContent =
            texto;


        elemento.className =
            'rsvp-message ' +
            (
                error
                    ? 'error'
                    : 'success'
            );

    }


    /*
     * ----------------------------------------------------
     * ESCAPAR HTML
     * ----------------------------------------------------
     */

    function escapeHtml(
        text
    ) {

        return String(text || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

    }


    /*
     * Exponer función para custom.js
     */

    window.abrirFormularioRsvp =
        abrirFormularioRsvp;


})();
