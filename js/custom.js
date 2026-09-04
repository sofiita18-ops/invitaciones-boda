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
     * ========================================================
     * DATOS DE LA BODA
     * (edita aquí para cambiar fecha, lugar o playlist)
     * ========================================================
     */
    const FECHA_BODA = new Date('2027-06-05T19:45:00');

    const LUGAR = {
        nombre: 'El Molino de San Lázaro',
        direccion: 'Paseo de la Ribera, 22 · 50014 Zaragoza',
        mapsUrl:
            'https://www.google.com/maps/place/Molino+de+San+L%C3%A1zaro/@41.6570365,-0.8719003,634m/data=!3m2!1e3!4b1!4m6!3m5!1s0xd5914f4ba57d54b:0x42daaf7e4d672d5f!8m2!3d41.6570365!4d-0.8719003!16s%2Fg%2F1tj53y8b?entry=ttu&g_ep=EgoyMDI2MDgxNy4wIKXMDSoASAFQAw%3D%3D',
        resumen: 'Molino de San Lázaro, Zaragoza'
    };

    const SPOTIFY_PLAYLIST_URL =
        'https://open.spotify.com/playlist/2LRCul0O7rFApSW6pLG2xF?si=6216654274204537';
    const SPOTIFY_PLAYLIST_ID = '2LRCul0O7rFApSW6pLG2xF';

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

        function esMenor(invitado) {

            const tipo =
                String(invitado.Tipo || '')
                    .trim()
                    .toLowerCase();

            return (
                tipo === 'niño' ||
                tipo === 'nino' ||
                tipo === 'bebé' ||
                tipo === 'bebe'
            );
        }

        const nombresAdultos = invitados
            .filter(invitado => !esMenor(invitado))
            .map(invitado => invitado.Nombre)
            .filter(Boolean);

        const nombresMenores = invitados
            .filter(esMenor)
            .map(invitado => invitado.Nombre)
            .filter(Boolean);

        if (!nombresAdultos.length && !nombresMenores.length) {
            return;
        }

        const nombreInvitados =
            nombresAdultos.length === 1
                ? nombresAdultos[0]
                : nombresAdultos.join(' · ');

        const nombreMenores =
            nombresMenores.join(' · ');

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

                ${
                    nombreMenores
                        ? `<div class="invitation-guest-names-kids">
                               ${escapeHtml(nombreMenores)}
                           </div>`
                        : ''
                }

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
                        <img
                            src="img/logo.png"
                            alt="P&amp;S"
                        >
                    </div>

                </div>

                <div class="invitation-open-hint" id="invitation-hint">
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
     *
     * Un único gesto:
     * la solapa se abre, el sobre se desliza hacia
     * abajo y desaparece, mientras la web (con la
     * imagen de portada) va apareciendo de fondo.
     */
    function prepararApertura(overlay) {

        const envelope =
            overlay.querySelector('#envelope');

        let startY = null;
        let abierta = false;

        function abrirSobre() {

            if (abierta) {
                return;
            }

            abierta = true;

            // Preparamos la web detrás del sobre para
            // que la portada ya esté lista al descubrirse
            crearWebInvitacion();

            // La solapa se abre
            envelope.classList.add('is-opening');

            // El sobre se desliza hacia abajo y el
            // overlay se desvanece, dejando ver la portada
            setTimeout(() => {

                envelope.classList.add('is-sliding');
                overlay.classList.add('is-open');

            }, 250);

            setTimeout(() => {

                document.body.classList.remove(
                    'invitation-locked'
                );

                overlay.remove();

            }, 1250);
        }

        envelope.addEventListener('click', abrirSobre);

        envelope.addEventListener('keydown', event => {

            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                abrirSobre();
            }

        });

        overlay.addEventListener(
            'touchstart',
            event => {
                startY = event.touches[0].clientY;
            },
            { passive: true }
        );

        overlay.addEventListener(
            'touchend',
            event => {

                if (startY === null) {
                    return;
                }

                const endY = event.changedTouches[0].clientY;
                const desplazamiento = startY - endY;

                if (desplazamiento > 50) {
                    abrirSobre();
                }

                startY = null;

            },
            { passive: true }
        );
    }


    /*
     * Formatear fecha y hora en español
     */
    function formatearFecha(fecha) {

        const texto = fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    function formatearHora(fecha) {

        return (
            fecha.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            }) + ' h'
        );
    }


    /*
     * Crear web de la boda
     */
    function crearWebInvitacion() {

        if (document.getElementById('custom-wedding-site')) {
            return;
        }

        document.body.classList.add('our-site-mode');

        const invitados =
            window.invitacionBoda?.invitados || [];

        const web = document.createElement('main');

        web.id = 'custom-wedding-site';

        web.innerHTML = `

            <section class="wedding-section wedding-cover">

                <div class="wedding-cover-overlay"></div>

                <div class="wedding-cover-content">

                    <p class="wedding-small-title">
                        Nos casamos
                    </p>

                    <h1>
                        Pilar <span>&</span> Sofía
                    </h1>

                    <p class="wedding-date">
                        ${escapeHtml(formatearFecha(FECHA_BODA))}
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

                <div class="wedding-content reveal-on-scroll">

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
                                ${escapeHtml(formatearFecha(FECHA_BODA))}
                                <br>
                                ${escapeHtml(formatearHora(FECHA_BODA))}
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
                                ${escapeHtml(LUGAR.nombre)}
                            </p>

                            <p class="event-address">
                                ${escapeHtml(LUGAR.direccion)}
                            </p>

                        </div>

                    </div>

                    <a
                        class="wedding-button"
                        href="${LUGAR.mapsUrl}"
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

                <div class="wedding-content reveal-on-scroll">

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
                id="musica"
                class="wedding-section wedding-music"
            >

                <div class="wedding-content reveal-on-scroll">

                    <p class="wedding-kicker">
                        Ambientad la fiesta
                    </p>

                    <h2>
                        Nuestra playlist
                    </h2>

                    <p class="wedding-text">
                        Añade las canciones que no pueden
                        faltar en nuestra boda a esta
                        playlist colaborativa. Sonarán
                        en la fiesta.
                    </p>

                    <div class="spotify-embed-wrapper">
                        <iframe
                            title="Playlist colaborativa de la boda"
                            style="border-radius: 12px"
                            src="https://open.spotify.com/embed/playlist/${SPOTIFY_PLAYLIST_ID}?utm_source=generator&theme=0"
                            width="100%"
                            height="352"
                            frameborder="0"
                            allowfullscreen=""
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                        ></iframe>
                    </div>

                    <a
                        class="wedding-button"
                        href="${SPOTIFY_PLAYLIST_URL}"
                        target="_blank"
                        rel="noopener"
                    >
                        Abrir en Spotify
                    </a>

                    <p class="wedding-text song-form-intro">
                        ¿No tienes Spotify? Sin problema,
                        escribe aquí tu propuesta y nosotros
                        la añadimos.
                    </p>

                    <div class="song-form">

                        <label for="song-name">
                            Tu nombre (opcional)
                        </label>

                        <input
                            type="text"
                            id="song-name"
                            placeholder="¿Quién la propone?"
                        >

                        <label for="song-title">
                            Canción
                        </label>

                        <input
                            type="text"
                            id="song-title"
                            placeholder="Título y artista"
                        >

                        <button
                            type="button"
                            id="song-submit"
                            class="wedding-button wedding-button-main"
                        >
                            Proponer canción
                        </button>

                        <p
                            id="song-message"
                            class="rsvp-message"
                        ></p>

                    </div>

                </div>

            </section>


            <section
                id="informacion"
                class="wedding-section wedding-info"
            >

                <div class="wedding-content reveal-on-scroll">

                    <p class="wedding-kicker">
                        Para que todo sea más fácil
                    </p>

                    <h2>
                        Información
                    </h2>

                    <div class="info-card reveal-on-scroll">

                        <h3>
                            Alojamiento
                        </h3>

                        <p>
                            Aquí añadiremos los hoteles,
                            apartamentos y opciones de
                            alojamiento recomendadas.
                        </p>

                    </div>

                    <div class="info-card reveal-on-scroll">

                        <h3>
                            Cómo llegar
                        </h3>

                        <p>
                            ${escapeHtml(LUGAR.nombre)},
                            ${escapeHtml(LUGAR.direccion)}.
                            Aquí añadiremos información
                            sobre coche, autobús, taxi,
                            parking, etc.
                        </p>

                    </div>

                    <div class="info-card reveal-on-scroll">

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
                    Pilar & Sofía
                </p>

                <span>
                    Con mucho cariño
                </span>

            </footer>

        `;

       document.body.appendChild(web);

       document.documentElement.style.scrollBehavior = 'smooth';


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

/*
 * --------------------------------------------------------
 * ANIMACIONES AL HACER SCROLL
 * --------------------------------------------------------
 */

iniciarRevelado();

/*
 * --------------------------------------------------------
 * FORMULARIO DE CANCIONES SIN SPOTIFY
 * --------------------------------------------------------
 */

iniciarFormularioCancion();

    }

    /*
     * Cuenta atrás
     */
    function iniciarCuentaAtras() {

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
                FECHA_BODA - ahora;

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
     * Animaciones de aparición al hacer scroll
     */
    function iniciarRevelado() {

        const elementos =
            document.querySelectorAll('.reveal-on-scroll');

        if (!elementos.length) {
            return;
        }

        if (!('IntersectionObserver' in window)) {

            elementos.forEach(
                elemento => elemento.classList.add('is-visible')
            );

            return;
        }

        const observer = new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add('is-visible');

                        observer.unobserve(entry.target);

                    }

                });

            },
            { threshold: 0.15 }
        );

        elementos.forEach(
            elemento => observer.observe(elemento)
        );
    }


    /*
     * Formulario de canciones sin cuenta de Spotify
     */
    function iniciarFormularioCancion() {

        const boton =
            document.getElementById('song-submit');

        if (!boton) {
            return;
        }

        boton.addEventListener(
            'click',
            async function () {

                const nombreInput =
                    document.getElementById('song-name');

                const cancionInput =
                    document.getElementById('song-title');

                const mensaje =
                    document.getElementById('song-message');

                const cancion =
                    cancionInput?.value?.trim() || '';

                if (!cancion) {

                    mensaje.textContent =
                        'Escribe el título de la canción antes de enviarla.';

                    return;
                }

                const nombre =
                    nombreInput?.value?.trim() || '';

                boton.disabled = true;
                boton.textContent = 'Enviando...';
                mensaje.textContent = '';

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
                                    JSON.stringify({
                                        action: 'saveSong',
                                        nombre: nombre,
                                        cancion: cancion
                                    })
                            }
                        );

                    if (!response.ok) {

                        throw new Error(
                            'Error HTTP ' +
                            response.status
                        );

                    }

                    const resultado =
                        await response.json();

                    if (!resultado.ok) {

                        throw new Error(
                            resultado.error ||
                            'No se pudo guardar la canción.'
                        );

                    }

                    mensaje.textContent =
                        '¡Canción añadida, gracias! 🎶';

                    boton.textContent =
                        'Proponer canción';

                    boton.disabled = false;

                    if (cancionInput) {
                        cancionInput.value = '';
                    }

                    if (nombreInput) {
                        nombreInput.value = '';
                    }

                } catch (error) {

                    console.error(
                        '❌ Error guardando la canción:',
                        error
                    );

                    mensaje.textContent =
                        'No hemos podido guardar tu propuesta. Inténtalo de nuevo.';

                    boton.disabled = false;

                    boton.textContent =
                        'Proponer canción';

                }

            }
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

                <p class="rsvp-note">
                    Podrás volver al formulario y cambiar
                    tu respuesta más adelante.
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
    
cargarRespuestasRsvp();
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


            const tipo =
                String(invitado.Tipo || '').trim();

            const esNino =
                tipo.toLowerCase() === 'niño' ||
                tipo.toLowerCase() === 'nino';

            const esBebe =
                tipo.toLowerCase() === 'bebé' ||
                tipo.toLowerCase() === 'bebe';

            const etiquetaTipo =
                esNino
                    ? 'Menú infantil'
                    : esBebe
                        ? 'Bebé, sin menú'
                        : '';

            const etiquetaAlergias =
                esBebe
                    ? 'Si tienes alguna petición especial para el bebé haznoslo saber aquí:'
                    : '¿Tienes alguna intolerancia, alergia o restricción alimentaria? Indícala aquí:';


            persona.innerHTML = `

                <h3>
                    ${escapeHtml(
                        invitado.Nombre || ''
                    )}
                </h3>

                ${
                    etiquetaTipo
                        ? `<p class="rsvp-person-tag">${escapeHtml(etiquetaTipo)}</p>`
                        : ''
                }


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
                        ${escapeHtml(etiquetaAlergias)}
                    </label>

                    <input
                        type="text"
                        class="rsvp-allergies"
                        placeholder="Indica cuáles..."
                    >


                    <label>
                        ¿Necesitas alojamiento?
                    </label>

                    <p class="rsvp-extra-note">
                        Os daremos varias opciones según
                        las respuestas.
                    </p>

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
                        ¿Vendrías a la preboda el día de
                        antes por la tarde?
                    </label>

                    <p class="rsvp-extra-note">
                        Según el número de personas
                        avisaremos si finalmente se realiza
                        o no.
                    </p>

                    <div class="rsvp-options">

                        <label>

                            <input
                                type="radio"
                                name="preboda-${index}"
                                value="SI"
                            >

                            <span>
                                Sí
                            </span>

                        </label>


                        <label>

                            <input
                                type="radio"
                                name="preboda-${index}"
                                value="NO"
                            >

                            <span>
                                No
                            </span>

                        </label>

                    </div>


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


    /*
     * Si cambia a NO,
     * limpiamos todos los datos extra.
     */

    const alergias =
        extra.querySelector(
            '.rsvp-allergies'
        );

    if (alergias) {
        alergias.value = '';
    }


    const alojamiento =
        extra.querySelectorAll(
            `input[name="alojamiento-${index}"]`
        );

    alojamiento.forEach(
        function (radio) {
            radio.checked = false;
        }
    );


    const preboda =
        extra.querySelectorAll(
            `input[name="preboda-${index}"]`
        );

    preboda.forEach(
        function (radio) {
            radio.checked = false;
        }
    );

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
 * Guardar respuesta RSVP
 */
document
    .getElementById('rsvp-save')
    .addEventListener(
        'click',
        async function () {

            const boton =
                document.getElementById('rsvp-save');

            const mensaje =
                document.getElementById('rsvp-message');

            const datos =
                window.invitacionBoda;

            if (
                !datos ||
                !datos.id ||
                !datos.invitados
            ) {

                mensaje.textContent =
                    'No se han podido cargar los datos de la invitación.';

                return;
            }


/*
 * Comprobar que todos los invitados
 * han indicado si asistirán o no.
 */
const personasRsvp =
    Array.from(
        document.querySelectorAll(
            '.rsvp-person'
        )
    );

const faltaConfirmacion =
    personasRsvp.some(
        function (persona) {

            const index =
                persona.dataset.index;

            return !persona.querySelector(
                `input[name="asistencia-${index}"]:checked`
            );

        }
    );

if (faltaConfirmacion) {

    mensaje.textContent =
        'Por favor, indica si asistirás antes de guardar la respuesta.';

    return;
}
        /*
 * Evitar dobles envíos
 * Solo bloqueamos el botón después
 * de comprobar que el formulario es válido.
 */
boton.disabled = true;

boton.textContent =
    'Guardando...';    
            /*
             * Recoger los datos de cada invitado
             */
            const invitados =
                Array.from(
                    document.querySelectorAll(
                        '.rsvp-person'
                    )
                ).map(
                    function (persona) {

                        const index =
                            persona.dataset.index;

                        const nombre =
                            persona
                                .querySelector('h3')
                                ?.textContent
                                ?.trim() || '';


                        const asistencia =
                            persona.querySelector(
                                `input[name="asistencia-${index}"]:checked`
                            )?.value || '';


                        const alergias =
                            persona
                                .querySelector('.rsvp-allergies')
                                ?.value
                                ?.trim() || '';


                        const alojamiento =
                            persona.querySelector(
                                `input[name="alojamiento-${index}"]:checked`
                            )?.value || '';


                        const preboda =
                            persona.querySelector(
                                `input[name="preboda-${index}"]:checked`
                            )?.value || '';


                        return {
                            nombre:
                                nombre,

                            asistencia:
                                asistencia === 'SI'
                                    ? 'Sí'
                                    : asistencia === 'NO'
                                        ? 'No'
                                        : '',

                            alergias:
                                alergias,

                            alojamiento:
                                alojamiento === 'SI'
                                    ? 'Sí'
                                    : alojamiento === 'NO'
                                        ? 'No'
                                        : '',

                            preboda:
                                preboda === 'SI'
                                    ? 'Sí'
                                    : preboda === 'NO'
                                        ? 'No'
                                        : '',

                        };

                    }
                );


            /*
             * Comentario general
             */
            const comentarioGeneral =
                document
                    .getElementById('rsvp-notes')
                    ?.value
                    ?.trim() || '';


            /*
             * Añadir comentario general
             * a las observaciones del primer invitado.
             */
            if (
                comentarioGeneral &&
                invitados.length
            ) {

                invitados[0].observaciones =
                    invitados[0].observaciones
                        ? invitados[0].observaciones +
                          ' | ' +
                          comentarioGeneral
                        : comentarioGeneral;

            }


            /*
             * Construir el objeto que recibirá Apps Script
             */
            const payload = {

                id:
                    datos.id,

                invitados:
                    invitados

            };


            console.log(
                '📤 Enviando RSVP:',
                payload
            );


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
                                JSON.stringify(
                                    payload
                                )
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        'Error HTTP ' +
                        response.status
                    );

                }


                const resultado =
                    await response.json();


                console.log(
                    '📥 Respuesta Apps Script:',
                    resultado
                );


                if (!resultado.ok) {

                    throw new Error(
                        resultado.error ||
                        'No se pudo guardar la respuesta.'
                    );

                }


                /*
                 * Éxito
                 */
                mensaje.textContent =
                    '¡Respuesta guardada correctamente! ❤️';


                boton.textContent =
                    'Respuesta guardada';


            } catch (error) {

                console.error(
                    '❌ Error guardando RSVP:',
                    error
                );


                mensaje.textContent =
                    'No hemos podido guardar la respuesta. Inténtalo de nuevo.';


                boton.disabled = false;

                boton.textContent =
                    'Guardar respuesta';

            }

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


    /*
 * ========================================================
 * CARGAR RESPUESTAS EXISTENTES
 * ========================================================
 */

function cargarRespuestasRsvp() {

    const datos =
        window.invitacionBoda;

    if (!datos || !datos.id) {
        return;
    }

    const callbackName =
        'rsvpRead_' + Date.now();

    window[callbackName] =
        function (respuesta) {

            try {

                if (!respuesta || !respuesta.ok) {

                    console.warn(
                        'No hay respuestas guardadas todavía.'
                    );

                    return;
                }

                const respuestas =
                    respuesta.respuestas || [];

                console.log(
                    '✅ Respuestas RSVP cargadas:',
                    respuestas
                );

                aplicarRespuestasRsvp(
                    respuestas
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
        encodeURIComponent(datos.id) +
        '&action=getRsvp' +
        '&prefix=' +
        encodeURIComponent(callbackName);


    script.onerror =
        function () {

            console.error(
                '❌ No se pudieron cargar las respuestas RSVP'
            );

            delete window[callbackName];

            if (script.parentNode) {
                script.remove();
            }

        };


    document.body.appendChild(
        script
    );
}


/*
 * ========================================================
 * APLICAR RESPUESTAS AL FORMULARIO
 * ========================================================
 */

function aplicarRespuestasRsvp(
    respuestas
) {

    const personas =
        document.querySelectorAll(
            '.rsvp-person'
        );


    personas.forEach(
        function (persona) {

            const nombre =
                persona
                    .querySelector('h3')
                    ?.textContent
                    ?.trim();

            if (!nombre) {
                return;
            }


            const respuesta =
                respuestas.find(
                    function (item) {

                        return String(
                            item.Nombre
                        ).trim()
                        ===
                        nombre;

                    }
                );


            if (!respuesta) {
                return;
            }


            const index =
                persona.dataset.index;


            /*
             * Asistencia
             */
            const asistencia =
                String(
                    respuesta.Asistencia || ''
                ).toLowerCase();


            if (
                asistencia === 'sí' ||
                asistencia === 'si'
            ) {

                const radio =
                    persona.querySelector(
                        `input[name="asistencia-${index}"][value="SI"]`
                    );

                if (radio) {
                    radio.checked = true;
                    radio.dispatchEvent(
                        new Event('change')
                    );
                }

            } else if (
                asistencia === 'no'
            ) {

                const radio =
                    persona.querySelector(
                        `input[name="asistencia-${index}"][value="NO"]`
                    );

                if (radio) {
                    radio.checked = true;
                    radio.dispatchEvent(
                        new Event('change')
                    );
                }
            }


            /*
             * Alergias
             */
            const alergias =
                persona.querySelector(
                    '.rsvp-allergies'
                );

            if (alergias) {

                alergias.value =
                    respuesta[
                        'Alergias / intolerancias'
                    ] || '';

            }


            /*
             * Alojamiento
             */
            const alojamiento =
                String(
                    respuesta.Alojamiento || ''
                ).toLowerCase();


            if (alojamiento) {

                const radio =
                    persona.querySelector(
                        `input[name="alojamiento-${index}"][value="${alojamiento === 'sí' || alojamiento === 'si' ? 'SI' : 'NO'}"]`
                    );

                if (radio) {
                    radio.checked = true;
                }
            }


            /*
             * Preboda
             */
            const preboda =
                String(
                    respuesta.Preboda || ''
                ).toLowerCase();


            if (preboda) {

                const radio =
                    persona.querySelector(
                        `input[name="preboda-${index}"][value="${preboda === 'sí' || preboda === 'si' ? 'SI' : 'NO'}"]`
                    );

                if (radio) {
                    radio.checked = true;
                }
            }


            /*
             * Observaciones
             */
            const notas =
                persona.querySelector(
                    '.rsvp-person-notes'
                );

            if (notas) {

                notas.value =
                    respuesta.Observaciones || '';

            }

        }
    );
}


    
})();
