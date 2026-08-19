(function () {
    'use strict';

    const API_URL =
        'https://script.google.com/macros/s/AKfycbz5zrEtFPTINYTnNYnidS0WJ-4Ep-DbMjdlRF-b2tlhqRyQqBT8mQnWuw1C7CbwAs8fGw/exec';

    const params = new URLSearchParams(window.location.search);
    const invitacionId = params.get('id');

    if (!invitacionId) {
        console.log('ℹ️ No hay ID de invitación.');
        return;
    }

    /*
     * Cargar nuestro CSS
     */
    const customCss = document.createElement('link');
    customCss.rel = 'stylesheet';
    customCss.href = 'css/custom.css';
    document.head.appendChild(customCss);


    /*
     * Crear sobre
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

        document.body.classList.add('invitation-locked');

        prepararApertura(overlay);
    }


    /*
     * Abrir sobre
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

            setTimeout(() => {

                overlay.classList.add('is-open');

                document.body.classList.remove(
                    'invitation-locked'
                );

                crearWebInvitacion();

            }, 950);
        }

        envelope.addEventListener(
            'click',
            abrir
        );

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

                if (desplazamiento > 60) {
                    abrir();
                }

                startY = null;

            },
            { passive: true }
        );
    }


    /*
     * Crear web de la boda
     */
    function crearWebInvitacion() {

        if (
            document.getElementById(
                'custom-wedding-site'
            )
        ) {
            return;
        }

        document.body.classList.add(
            'our-site-mode'
        );

        const invitados =
            window.invitacionBoda?.invitados || [];

        const web =
            document.createElement('main');

        web.id =
            'custom-wedding-site';

        web.innerHTML = `

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
                        Nos hace mucha ilusión compartir
                        este día contigo.
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

                </div>

            </section>


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
 * --------------------------------------------------------
 * BOTÓN CONFIRMAR ASISTENCIA
 * --------------------------------------------------------
 */

const botonRsvp =
    document.getElementById('open-rsvp');

if (botonRsvp) {

    botonRsvp.addEventListener(
        'click',
        function (event) {

            event.preventDefault();

            console.log(
                '💌 Botón Confirmar asistencia pulsado'
            );

            abrirFormularioRsvp();

        }
    );

} else {

    console.error(
        '❌ No se ha encontrado el botón #open-rsvp'
    );
}


/*
 * --------------------------------------------------------
 * CUENTA ATRÁS
 * --------------------------------------------------------
 */

iniciarCuentaAtras();
    }

    /*
     * Cuenta atrás
     */
    function iniciarCuentaAtras() {

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


    /*
     * Escapar HTML
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
     * Cargar invitados desde Apps Script
     */
    async function cargarInvitados() {

        try {

            const url =
                `${API_URL}?id=${encodeURIComponent(
                    invitacionId
                )}`;

            const response =
                await fetch(url);

            if (!response.ok) {
                throw new Error(
                    'Error HTTP ' +
                    response.status
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
                    invitado =>
                        invitado.Nombre
                )
            );

            window.invitacionBoda = {
                id: invitacionId,
                invitados: data.invitados,
                apiUrl: API_URL
            };

            crearSobre(
                data.invitados
            );

        } catch (error) {

            console.error(
                '❌ Error cargando la invitación:',
                error
            );

        }
    }


    /*
     * Iniciar
     */
    cargarInvitados();

    /*
 * ========================================================
 * FORMULARIO RSVP
 * ========================================================
 */

function abrirFormularioRsvp() {

    /*
     * Si ya existe, no crearlo otra vez.
     */
    if (
        document.getElementById(
            'rsvp-screen'
        )
    ) {
        return;
    }


    const datos =
        window.invitacionBoda;


    if (
        !datos ||
        !datos.invitados ||
        !datos.invitados.length
    ) {

        console.error(
            '❌ No hay invitados disponibles para el RSVP'
        );

        return;
    }


    console.log(
        '👥 Abriendo RSVP para:',
        datos.invitados
    );


    /*
     * Crear pantalla completa
     */
    const pantalla =
        document.createElement('div');

    pantalla.id =
        'rsvp-screen';


    pantalla.innerHTML = `

        <div class="rsvp-screen-inner">

            <button
                type="button"
                class="rsvp-close"
                id="rsvp-close"
                aria-label="Cerrar"
            >
                ×
            </button>


            <div class="rsvp-header">

                <p class="wedding-kicker">
                    Confirmación
                </p>

                <h2>
                    ¿Nos acompañáis?
                </h2>

                <p class="rsvp-intro">
                    Confirma la asistencia de todas
                    las personas incluidas en esta invitación.
                </p>

            </div>


            <div
                id="rsvp-people"
                class="rsvp-people"
            ></div>


            <div class="rsvp-general">

                <label for="rsvp-notes">
                    ¿Algo más que debamos saber?
                </label>

                <textarea
                    id="rsvp-notes"
                    rows="4"
                    placeholder="Cuéntanos cualquier detalle..."
                ></textarea>

            </div>


            <button
                type="button"
                id="rsvp-save"
                class="wedding-button wedding-button-main"
            >
                Guardar respuesta
            </button>


            <p
                id="rsvp-message"
                class="rsvp-message"
            ></p>

        </div>
    `;


document.body.appendChild(pantalla);

/*
 * Forzar que el RSVP sea visible.
 * Esto evita que cualquier estilo heredado,
 * caché o regla externa pueda ocultarlo.
 */
pantalla.style.setProperty(
    'display',
    'block',
    'important'
);

pantalla.style.setProperty(
    'position',
    'fixed',
    'important'
);

pantalla.style.setProperty(
    'inset',
    '0',
    'important'
);

pantalla.style.setProperty(
    'z-index',
    '2147483647',
    'important'
);

pantalla.style.setProperty(
    'background',
    '#f8f4ec',
    'important'
);

pantalla.style.setProperty(
    'visibility',
    'visible',
    'important'
);

pantalla.style.setProperty(
    'opacity',
    '1',
    'important'
);

pantalla.style.setProperty(
    'transform',
    'none',
    'important'
);

pantalla.style.setProperty(
    'overflow-y',
    'auto',
    'important'
);

document.body.classList.add(
    'rsvp-open'
);

console.log(
    '✅ RSVP visible forzado'
);

    /*
     * Crear cada invitado
     */
    const contenedor =
        document.getElementById(
            'rsvp-people'
        );


    datos.invitados.forEach(
        function (invitado, index) {

            const persona =
                document.createElement(
                    'div'
                );


            persona.className =
                'rsvp-person';


            persona.dataset.index =
                index;


            persona.innerHTML = `

                <h3>
                    ${escapeHtml(
                        invitado.Nombre || ''
                    )}
                </h3>


                <p class="rsvp-question">
                    ¿Vas a asistir?
                </p>


                <div class="rsvp-options">

                    <label>
                        <input
                            type="radio"
                            name="asistencia-${index}"
                            value="SI"
                        >

                        <span>
                            Sí, allí estaré
                        </span>
                    </label>


                    <label>
                        <input
                            type="radio"
                            name="asistencia-${index}"
                            value="NO"
                        >

                        <span>
                            No podré asistir
                        </span>
                    </label>

                </div>


                <div
                    class="rsvp-extra"
                    hidden
                >

                    <label>
                        Menú especial
                    </label>

                    <input
                        type="text"
                        class="rsvp-menu"
                        placeholder="Si necesitas un menú especial..."
                    >


                    <label>
                        Alergias / intolerancias
                    </label>

                    <input
                        type="text"
                        class="rsvp-allergies"
                        placeholder="Indica cuáles..."
                    >


                    <label>
                        ¿Necesitas alojamiento?
                    </label>


                    <div class="rsvp-options">

                        <label>

                            <input
                                type="radio"
                                name="alojamiento-${index}"
                                value="SI"
                            >

                            <span>
                                Sí
                            </span>

                        </label>


                        <label>

                            <input
                                type="radio"
                                name="alojamiento-${index}"
                                value="NO"
                            >

                            <span>
                                No
                            </span>

                        </label>

                    </div>


                    <label>
                        Comentarios
                    </label>

                    <textarea
                        class="rsvp-person-notes"
                        rows="3"
                        placeholder="Lo que quieras contarnos..."
                    ></textarea>

                </div>
            `;


            contenedor.appendChild(
                persona
            );


            /*
             * Mostrar campos extra al aceptar
             */
            const radios =
                persona.querySelectorAll(
                    `input[name="asistencia-${index}"]`
                );


            radios.forEach(
                function (radio) {

                    radio.addEventListener(
                        'change',
                        function () {

                            const extra =
                                persona.querySelector(
                                    '.rsvp-extra'
                                );


                            if (
                                this.value === 'SI'
                            ) {

                                extra.hidden =
                                    false;

                            } else {

                                extra.hidden =
                                    true;

                            }

                        }
                    );

                }
            );

        }
    );


    /*
     * Cerrar
     */
    document
        .getElementById('rsvp-close')
        .addEventListener(
            'click',
            cerrarFormularioRsvp
        );


    /*
     * Guardar
     * (por ahora solo prueba visual)
     */
    document
        .getElementById('rsvp-save')
        .addEventListener(
            'click',
            function () {

                document
                    .getElementById(
                        'rsvp-message'
                    )
                    .textContent =
                    'Formulario preparado correctamente ❤️';

            }
        );


    /*
     * Mostrar
     */
    document.body.classList.add(
        'rsvp-open'
    );





    console.log(
        '✅ Formulario RSVP creado'
    );
}


/*
 * Cerrar formulario
 */
function cerrarFormularioRsvp() {

    const pantalla =
        document.getElementById(
            'rsvp-screen'
        );


    if (!pantalla) {
        return;
    }


    pantalla.classList.remove(
        'is-visible'
    );


    setTimeout(
        function () {

            pantalla.remove();

            document.body.classList.remove(
                'rsvp-open'
            );

        },
        300
    );
}
})();
