import { Suspense, lazy, useEffect, useRef, useState, type FormEvent } from 'react'
import addIcon from '@material-symbols/svg-400/rounded/add.svg?url'
import calendarIcon from '@material-symbols/svg-400/rounded/calendar_month.svg?url'
import campaignIcon from '@material-symbols/svg-400/rounded/campaign.svg?url'
import celebrationIcon from '@material-symbols/svg-400/rounded/celebration.svg?url'
import closeIcon from '@material-symbols/svg-400/rounded/close.svg?url'
import copyIcon from '@material-symbols/svg-400/rounded/content_copy.svg?url'
import favoriteIcon from '@material-symbols/svg-400/rounded/favorite.svg?url'
import locationIcon from '@material-symbols/svg-400/rounded/location_on.svg?url'
import menuIcon from '@material-symbols/svg-400/rounded/menu.svg?url'
import mouseIcon from '@material-symbols/svg-400/rounded/mouse.svg?url'
import northIcon from '@material-symbols/svg-400/rounded/north.svg?url'
import cameraIcon from '@material-symbols/svg-400/rounded/photo_camera.svg?url'
import sendIcon from '@material-symbols/svg-400/rounded/send.svg?url'
import southIcon from '@material-symbols/svg-400/rounded/south.svg?url'
import starIcon from '@material-symbols/svg-400/rounded/star_shine.svg?url'
import touchIcon from '@material-symbols/svg-400/rounded/touch_app.svg?url'
import waveIcon from '@material-symbols/svg-400/rounded/waving_hand.svg?url'

const MirrorScene = lazy(() => import('./MirrorScene'))
const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER?.replace(/\D/g, '')
const iconUrls = {
  add: addIcon,
  calendar_month: calendarIcon,
  campaign: campaignIcon,
  celebration: celebrationIcon,
  close: closeIcon,
  content_copy: copyIcon,
  favorite: favoriteIcon,
  location_on: locationIcon,
  menu: menuIcon,
  mouse: mouseIcon,
  north: northIcon,
  photo_camera: cameraIcon,
  send: sendIcon,
  south: southIcon,
  star_shine: starIcon,
  touch_app: touchIcon,
  waving_hand: waveIcon,
} as const
type IconName = keyof typeof iconUrls

const navItems = [
  { href: '#experiencia', label: 'La experiencia', index: '01' },
  { href: '#espejo', label: 'El espejo', index: '02' },
  { href: '#momentos', label: 'Tus momentos', index: '03' },
  { href: '#cobertura', label: 'Cobertura', index: '04' },
  { href: '#contacto', label: 'Cotizar', index: '05' },
]

const anatomy = [
  {
    number: '01',
    tag: 'La primera impresión',
    title: 'Una presencia que atrae.',
    description: 'Su formato de cuerpo entero, el vidrio oscuro y el borde de luz convierten cualquier rincón en el punto al que todos quieren acercarse.',
    part: 'MirrorGlass',
  },
  {
    number: '02',
    tag: 'Interacción natural',
    title: 'Toca. Juega. Sonríe.',
    description: 'La pantalla táctil invita a participar sin complicaciones. La experiencia comienza con un gesto.',
    part: 'TouchDisplay',
  },
  {
    number: '03',
    tag: 'El instante',
    title: 'Listo para capturar miradas.',
    description: 'En la parte superior se integra el módulo de cámara. La configuración concreta se confirma al preparar tu evento.',
    part: 'Camera',
  },
  {
    number: '04',
    tag: 'Detalles que brillan',
    title: 'La luz también celebra.',
    description: 'El marco luminoso acompaña cada momento y le da al espacio ese aire de celebración que se nota desde lejos.',
    part: 'LED_Frame',
  },
  {
    number: '05',
    tag: 'Hecho para eventos',
    title: 'Listo para ser el centro.',
    description: 'Una estructura desmontable y una base firme permiten integrar el espejo en distintos espacios de evento.',
    part: 'Stand',
  },
]

const occasions: Array<{ label: string; phrase: string; className: string; symbol: IconName }> = [
  { label: 'Bodas', phrase: 'Un recuerdo tan único como el sí.', className: 'occasion--wedding', symbol: 'favorite' },
  { label: 'XV años', phrase: 'Toda la emoción de una noche irrepetible.', className: 'occasion--quince', symbol: 'star_shine' },
  { label: 'Cumpleaños', phrase: 'La fiesta se vive desde otro ángulo.', className: 'occasion--birthday', symbol: 'celebration' },
  { label: 'Eventos de marca', phrase: 'Una experiencia que da de qué hablar.', className: 'occasion--brand', symbol: 'campaign' },
]

const faqs = [
  { question: '¿En qué zonas está disponible?', answer: 'Por ahora planeamos atender eventos en Ciudad de México y Estado de México. Cuéntanos el lugar y revisamos la disponibilidad para tu fecha.' },
  { question: '¿Puedo adaptar la experiencia a mi evento?', answer: 'Sí. La idea es que la experiencia se sienta parte de tu celebración. Los detalles de personalización se definirán al preparar tu cotización.' },
  { question: '¿Incluye cámara e impresiones?', answer: 'El equipo admite distintas configuraciones. Confirmaremos los accesorios y entregables incluidos antes de cerrar cualquier renta.' },
  { question: '¿Con cuánto tiempo debo reservar?', answer: 'Compártenos la fecha en cuanto la tengas. Así podremos revisar disponibilidad y preparar una propuesta a tu medida.' },
]

function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  const mask = `url("${iconUrls[name]}")`
  return <span className={`material-symbols-rounded ${className}`} style={{ maskImage: mask, WebkitMaskImage: mask }} aria-hidden="true" />
}

function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <a className={`brand ${inverse ? 'brand--inverse' : ''}`} href="#inicio" aria-label="Lúmina, volver al inicio">
      <span className="brand__mark" aria-hidden="true"><span /></span>
      <span className="brand__word">LÚMINA<span className="brand__dot">.</span></span>
    </a>
  )
}

function Header() {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const close = () => { document.body.style.overflow = '' }
    dialog.addEventListener('close', close)
    return () => { dialog.removeEventListener('close', close); document.body.style.overflow = '' }
  }, [])

  const openMenu = () => {
    dialogRef.current?.showModal()
    document.body.style.overflow = 'hidden'
  }
  const closeMenu = () => dialogRef.current?.close()

  return (
    <>
      <header className="site-header" id="top">
        <div className="site-header__shell">
          <Brand />
          <div className="site-header__location"><span className="status-dot" /> Una experiencia para CDMX y Edo. Méx.</div>
          <div className="site-header__actions">
            <a className="button button--light button--header" href="#contacto">Cotiza tu fecha</a>
            <button className="menu-trigger" type="button" onClick={openMenu} aria-label="Abrir menú"><Icon name="menu" /></button>
          </div>
        </div>
      </header>
      <dialog className="nav-drawer" ref={dialogRef} onClick={(event) => { if (event.target === dialogRef.current) closeMenu() }} aria-label="Menú de navegación">
        <div className="nav-drawer__panel">
          <div className="nav-drawer__top"><Brand inverse /><button className="menu-trigger menu-trigger--close" type="button" onClick={closeMenu} aria-label="Cerrar menú"><Icon name="close" /></button></div>
          <p className="eyebrow">Explora Lúmina</p>
          <nav aria-label="Navegación principal">
            {navItems.map((item) => <a href={item.href} key={item.href} onClick={closeMenu}><span>{item.index}</span>{item.label}</a>)}
          </nav>
          <p className="nav-drawer__foot">Haz espacio para lo inesperado.</p>
        </div>
      </dialog>
    </>
  )
}

function SceneGate() {
  const [interactive, setInteractive] = useState(false)
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const activate = () => {
      if (preference.matches) return
      setInteractive(true)
      window.removeEventListener('scroll', activate)
    }
    const onPreferenceChange = () => {
      if (preference.matches) setInteractive(false)
      else if (window.scrollY > 0) activate()
    }
    window.addEventListener('scroll', activate, { passive: true })
    preference.addEventListener('change', onPreferenceChange)
    const timer = window.innerWidth >= 960 ? window.setTimeout(activate, 1600) : 0
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', activate)
      preference.removeEventListener('change', onPreferenceChange)
    }
  }, [])
  const poster = <div className="mirror-poster mirror-poster--static" aria-hidden="true"><img src={`${import.meta.env.BASE_URL}models/espejo-magico-poster.webp`} alt="" /></div>
  return interactive ? <Suspense fallback={poster}><MirrorScene /></Suspense> : poster
}

function App() {
  const [copyState, setCopyState] = useState('')

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-revealed')
        observer.unobserve(entry.target)
      }
    }, { rootMargin: '0px 0px -12% 0px' })
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(element => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  const handleQuote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return
    const data = new FormData(form)
    const message = `Hola, quiero cotizar el espejo mágico Lúmina.\nMi nombre: ${data.get('name')}\nEvento: ${data.get('event')}\nFecha: ${data.get('date') || 'Por definir'}\nLugar: ${data.get('place')}\nNotas: ${data.get('notes') || 'Sin notas adicionales'}`
    if (whatsappNumber) {
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
      setCopyState('Se abrió WhatsApp con tu solicitud preparada.')
      return
    }
    try {
      await navigator.clipboard.writeText(message)
      setCopyState('Solicitud copiada. Podrás compartirla con nuestro equipo cuando habilitemos el contacto.')
    } catch {
      setCopyState(message)
    }
  }

  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <Header />
      <SceneGate />
      <main id="contenido">
        <section className="hero scene-section" id="inicio" data-scene="hero" aria-labelledby="hero-title">
          <div className="hero__sticky">
            <div className="hero__halo" aria-hidden="true" />
            <div className="hero__grid page-grid">
              <div className="hero__copy">
                <span className="eyebrow eyebrow--light"><span className="eyebrow-line" /> Espejo mágico para eventos</span>
                <h1 id="hero-title">Tu fiesta merece <em>verse</em> inolvidable.</h1>
                <p>Hay momentos que todos quieren vivir. Crea uno frente al espejo.</p>
                <div className="hero__buttons"><a className="button button--ice" href="#contacto">Cotiza tu evento <Icon name="calendar_month" /></a><a className="text-link text-link--light" href="#experiencia">Descubre la experiencia <Icon name="south" /></a></div>
              </div>
              <div className="hero__side-note" aria-hidden="true"><span>UNA NUEVA FORMA DE CELEBRAR</span><span>01 / 08</span></div>
            </div>
            <div className="hero__bottom page-grid"><span className="hero__scroll"><Icon name="mouse" /> Desliza para descubrir</span><span className="hero__bottom-rule" /><span className="hero__edition">CDMX + ESTADO DE MÉXICO</span></div>
          </div>
        </section>

        <section className="manifesto scene-section" id="experiencia" data-scene="story" aria-labelledby="manifesto-title">
          <div className="manifesto__inner page-grid">
            <div className="manifesto__index" data-reveal><span className="section-index">01 — LA IDEA</span><span className="thin-rule" /></div>
            <div className="manifesto__copy">
              <p className="eyebrow" data-reveal>Más que una foto</p>
              <h2 id="manifesto-title" data-reveal>La mejor parte de una fiesta es cuando <span>todos quieren participar.</span></h2>
              <p className="lead" data-reveal>Lúmina transforma una pausa en una experiencia: miradas, risas y ese “otra vez” que nadie tuvo que pedir.</p>
              <a className="text-link" href="#espejo" data-reveal>Conoce el espejo <Icon name="south" /></a>
            </div>
            <div className="manifesto__aside" data-reveal><span className="oversize-asterisk" aria-hidden="true">✳</span><p>El recuerdo empieza antes de tomar la foto.</p></div>
          </div>
        </section>

        <section className="anatomy scene-section" id="espejo" data-scene="anatomy" aria-labelledby="anatomy-title">
          <div className="anatomy__heading page-grid">
            <div className="anatomy__intro"><span className="section-index section-index--light">02 — CONOCE EL ESPEJO</span><h2 id="anatomy-title">Diseñado para <em>llamar la atención.</em></h2><p>Explora las piezas que hacen que la experiencia cobre vida.</p></div>
            <div className="anatomy__counter" aria-hidden="true">05 <span>DETALLES</span></div>
          </div>
          <div className="anatomy__steps page-grid">
            <div className="anatomy__model-space" aria-hidden="true" />
            <div className="anatomy__step-list">
              {anatomy.map((item) => <article className="anatomy-step" data-part={item.part} key={item.number}>
                <div className="anatomy-step__top"><span>{item.number} / 05</span><span>{item.tag}</span></div>
                <h3>{item.title}</h3><p>{item.description}</p>
                <div className="anatomy-step__rule" />
              </article>)}
            </div>
          </div>
        </section>

        <section className="journey scene-section" id="como-funciona" data-scene="later" aria-labelledby="journey-title">
          <div className="page-grid">
            <div className="section-heading" data-reveal><span className="section-index">03 — ASÍ SE VIVE</span><h2 id="journey-title">Tú pones la fiesta.<br /><em>El espejo pone la magia.</em></h2></div>
            <div className="journey__line" aria-hidden="true" />
            <div className="journey__cards">
              <article className="journey-card" data-reveal><span className="journey-card__number">01</span><Icon name="waving_hand" /><h3>Acércate</h3><p>Una luz llama tu atención. El espejo te invita a entrar en escena.</p></article>
              <article className="journey-card" data-reveal><span className="journey-card__number">02</span><Icon name="touch_app" /><h3>Hazlo tuyo</h3><p>Interactúa de forma intuitiva y disfruta el momento a tu manera.</p></article>
              <article className="journey-card" data-reveal><span className="journey-card__number">03</span><Icon name="photo_camera" /><h3>Recuérdalo</h3><p>Las mejores poses siempre vienen con una historia detrás.</p></article>
            </div>
          </div>
        </section>

        <section className="occasions scene-section" id="momentos" data-scene="later" aria-labelledby="occasions-title">
          <div className="page-grid">
            <div className="occasions__top" data-reveal><span className="section-index section-index--light">04 — MOMENTOS LÚMINA</span><h2 id="occasions-title">Cada celebración tiene <em>algo que contar.</em></h2><p>El espejo se convierte en un punto de encuentro, sea cual sea la ocasión.</p></div>
            <div className="occasion-grid">
              {occasions.map((item, index) => <article className={`occasion-card ${item.className}`} key={item.label} data-reveal><span className="occasion-card__number">0{index + 1}</span><Icon name={item.symbol} /><div><h3>{item.label}</h3><p>{item.phrase}</p></div></article>)}
            </div>
          </div>
        </section>

        <section className="difference scene-section" id="por-que-lumina" data-scene="later" aria-labelledby="difference-title">
          <div className="page-grid difference__layout">
            <div className="difference__title" data-reveal><span className="section-index">05 — EL EFECTO LÚMINA</span><h2 id="difference-title">Hay recuerdos que se guardan. <em>Otros se viven.</em></h2></div>
            <div className="difference__content" data-reveal><p className="lead">Un espejo mágico cambia la energía del evento: rompe el hielo, reúne a las personas y convierte un instante común en algo que todos comentan.</p><div className="difference__tags"><span>Interacción</span><span>Presencia</span><span>Celebración</span></div></div>
          </div>
          <div className="difference__marquee" aria-hidden="true"><div>REFLEJA EL MOMENTO · REFLEJA EL MOMENTO · REFLEJA EL MOMENTO ·</div></div>
        </section>

        <section className="coverage scene-section" id="cobertura" data-scene="later" aria-labelledby="coverage-title">
          <div className="page-grid coverage__layout">
            <div className="coverage__main" data-reveal><span className="section-index section-index--light">06 — CERCA DE TI</span><h2 id="coverage-title">La magia se mueve <em>contigo.</em></h2><p>Estamos preparando experiencias para eventos en Ciudad de México y Estado de México. Cuéntanos dónde será el tuyo.</p><a className="button button--ice" href="#contacto">Consultar mi fecha <Icon name="calendar_month" /></a></div>
            <div className="coverage__map" aria-label="Cobertura: Ciudad de México y Estado de México" data-reveal><div className="coverage__orbit coverage__orbit--one" /><div className="coverage__orbit coverage__orbit--two" /><div className="coverage__orbit coverage__orbit--three" /><div className="coverage__center"><Icon name="location_on" /><span>CDMX<br />+ EDOMEX</span></div><span className="coverage__caption">NUESTRA ZONA DE SERVICIO</span></div>
          </div>
        </section>

        <section className="questions scene-section" id="preguntas" data-scene="later" aria-labelledby="questions-title">
          <div className="page-grid questions__layout"><div data-reveal><span className="section-index">07 — BUENO SABER</span><h2 id="questions-title">Antes del <em>gran día.</em></h2><p>Respuestas rápidas para empezar a imaginar tu evento.</p></div><div className="faq-list" data-reveal>{faqs.map((faq, index) => <details key={faq.question}><summary><span>0{index + 1}</span><strong>{faq.question}</strong><Icon name="add" /></summary><p>{faq.answer}</p></details>)}</div></div>
        </section>

        <section className="contact scene-section" id="contacto" data-scene="later" aria-labelledby="contact-title">
          <div className="page-grid contact__layout"><div className="contact__intro" data-reveal><span className="section-index section-index--light">08 — TU PRÓXIMO EVENTO</span><h2 id="contact-title">Que todos digan: <em>“¿dónde conseguiste eso?”</em></h2><p>Cuéntanos cuándo y dónde será. La historia empieza aquí.</p></div><div className="contact__form-wrap" data-reveal><form className="contact-form" onSubmit={handleQuote}><div className="contact-form__row"><label>Tu nombre<input name="name" type="text" autoComplete="name" placeholder="¿Cómo te llamas?" required maxLength={80} /></label><label>Tipo de evento<input name="event" type="text" placeholder="Boda, cumpleaños..." required maxLength={80} /></label></div><div className="contact-form__row"><label>Fecha aproximada<input name="date" type="date" /></label><label>Ciudad o municipio<input name="place" type="text" placeholder="¿Dónde será?" required maxLength={100} /></label></div><label>Algo más que debamos saber<textarea name="notes" rows={3} placeholder="Cuéntanos tu idea" maxLength={500} /></label><button className="button button--ice button--wide" type="submit">{whatsappNumber ? 'Enviar por WhatsApp' : 'Preparar mi solicitud'} <Icon name={whatsappNumber ? 'send' : 'content_copy'} /></button><p className="contact-form__note">{whatsappNumber ? 'Al continuar, se abrirá WhatsApp con tu solicitud preparada.' : 'Esta es una vista previa. Por ahora, tu solicitud se copiará para compartirla cuando esté listo el canal de contacto.'}</p><p className="contact-form__feedback" role="status" aria-live="polite">{copyState}</p></form></div></div>
        </section>
      </main>
      <footer className="site-footer"><div className="site-footer__inner page-grid"><div className="site-footer__top"><Brand inverse /><a href="#inicio" className="back-top">Volver arriba <Icon name="north" /></a></div><div className="site-footer__big" aria-hidden="true">REFLEJA<span>LO</span>.</div><div className="site-footer__bottom"><p>Momentos que se viven frente al espejo.<br />CDMX · Estado de México</p><span>© {new Date().getFullYear()} Lúmina. Prototipo.</span><div><a href="#preguntas">Preguntas</a><a href="#contacto">Cotizar</a></div></div></div></footer>
    </>
  )
}

export default App
