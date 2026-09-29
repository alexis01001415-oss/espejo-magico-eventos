import { useEffect, useRef, useState } from 'react'
import {
  ACESFilmicToneMapping,
  Box3,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  Object3D,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

type Pose = { x: number; y: number; scale: number; yaw: number; roll: number; opacity: number }

const parts = ['MirrorGlass', 'TouchDisplay', 'Camera', 'LED_Frame', 'Stand']
const clamp = (value: number) => MathUtils.clamp(value, 0, 1)
const mix = MathUtils.lerp

function getPose(): Pose {
  const hero = document.getElementById('inicio')
  const story = document.getElementById('experiencia')
  const anatomy = document.getElementById('espejo')
  if (!hero || !story || !anatomy) return { x: 1.1, y: 0, scale: 1, yaw: -0.12, roll: 0, opacity: 1 }

  const vh = window.innerHeight
  const mobile = window.innerWidth < 960
  const tablet = window.innerWidth >= 600 && mobile
  const heroRect = hero.getBoundingClientRect()
  const storyRect = story.getBoundingClientRect()
  const anatomyRect = anatomy.getBoundingClientRect()

  if (heroRect.bottom > 1) {
    const progress = clamp(-heroRect.top / Math.max(1, heroRect.height - vh))
    return mobile
      ? { x: mix(0, 0.1, progress), y: mix(tablet ? 0.76 : 0.8, tablet ? 0.65 : 0.72, progress), scale: mix(tablet ? 0.5 : 0.46, tablet ? 0.45 : 0.43, progress), yaw: mix(-0.12, -0.38, progress), roll: mix(0, -0.025, progress), opacity: 1 - clamp((progress - 0.7) / 0.3) }
      : { x: mix(1.05, 1.42, progress), y: mix(0.02, -0.08, progress), scale: mix(1, 0.76, progress), yaw: mix(-0.1, -0.48, progress), roll: mix(0, -0.03, progress), opacity: 1 }
  }

  if (storyRect.bottom > 0) {
    const progress = clamp(-storyRect.top / Math.max(1, storyRect.height))
    return mobile
      ? { x: 0.3, y: 0.86, scale: 0.45, yaw: mix(-0.38, 0.12, progress), roll: 0, opacity: 0 }
      : { x: mix(1.42, -1.12, progress), y: 0, scale: mix(0.76, 0.82, progress), yaw: mix(-0.48, 0.2, progress), roll: mix(-0.03, 0, progress), opacity: 1 }
  }

  if (anatomyRect.bottom > 0) {
    const exitProgress = clamp((vh - anatomyRect.bottom) / vh)
    const enterProgress = clamp((vh * 0.55 - anatomyRect.top) / (vh * 0.75))
    return mobile
      ? { x: 0, y: tablet ? 0.75 : 0.9, scale: tablet ? 0.6 : 0.43, yaw: 0.12, roll: 0, opacity: 0.72 * enterProgress * (1 - exitProgress) }
      : { x: -1.22, y: 0.03, scale: 0.9, yaw: 0.22, roll: 0, opacity: 1 - exitProgress }
  }
  return { x: 0, y: 0, scale: 0.6, yaw: 0, roll: 0, opacity: 0 }
}

function nearestPart() {
  const steps = [...document.querySelectorAll<HTMLElement>('[data-part]')]
  let best: string | null = null
  let distance = Infinity
  for (const step of steps) {
    const rect = step.getBoundingClientRect()
    const mid = rect.top + rect.height * 0.5
    const current = Math.abs(mid - window.innerHeight * 0.52)
    if (rect.bottom > 0 && rect.top < window.innerHeight && current < distance) {
      best = step.dataset.part ?? null
      distance = current
    }
  }
  return best
}

function Poster() {
  const posterRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const update = () => {
      const pose = getPose()
      const anatomyTop = document.getElementById('espejo')?.getBoundingClientRect().top ?? Infinity
      if (posterRef.current) posterRef.current.style.opacity = anatomyTop < window.innerHeight ? '0' : String(pose.opacity)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  return <div className="mirror-poster" ref={posterRef} aria-hidden="true"><img src={`${import.meta.env.BASE_URL}models/espejo-magico-poster.webp`} alt="" /></div>
}

export default function MirrorScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const stage = stageRef.current
    if (!canvas || !stage) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' })
    } catch {
      const timeout = window.setTimeout(() => setFailed(true), 0)
      return () => window.clearTimeout(timeout)
    }

    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = SRGBColorSpace
    renderer.toneMapping = ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.55
    const scene = new Scene()
    const camera = new PerspectiveCamera(35, 1, 0.1, 50)
    camera.position.set(0, 0, 6.6)
    camera.lookAt(0, 0, 0)
    scene.add(new HemisphereLight(new Color('#e8f5ff'), new Color('#182043'), 2.8))
    const key = new DirectionalLight('#ffffff', 4.3)
    key.position.set(-3.5, 5, 5)
    scene.add(key)
    const rim = new DirectionalLight('#99c9f5', 5.5)
    rim.position.set(3, 2, -5)
    scene.add(rim)
    const fill = new DirectionalLight('#7badde', 1.8)
    fill.position.set(4, -2, 4)
    scene.add(fill)

    const rig = new Group()
    scene.add(rig)
    let model: Object3D | null = null
    const objectParts = new Map<string, { object: Object3D; original: Vector3 }>()
    const current: Pose = { x: 1.05, y: 0.02, scale: 1, yaw: -0.1, roll: 0, opacity: 1 }
    let frame = 0
    let disposed = false
    let pointerX = 0

    const render = () => {
      frame = 0
      if (disposed) return
      const target = getPose()
      const factor = reducedMotion ? 1 : 0.13
      current.x = mix(current.x, target.x, factor)
      current.y = mix(current.y, target.y, factor)
      current.scale = mix(current.scale, target.scale, factor)
      current.yaw = mix(current.yaw, target.yaw, factor)
      current.roll = mix(current.roll, target.roll, factor)
      current.opacity = target.opacity
      const compact = window.innerWidth < 960
      rig.position.set(current.x + (compact ? 0 : pointerX * 0.08), current.y, 0)
      rig.scale.setScalar(current.scale)
      rig.rotation.set(0, current.yaw + (compact ? 0 : pointerX * 0.05), current.roll)
      stage.style.opacity = String(current.opacity)
      stage.style.visibility = current.opacity < 0.015 ? 'hidden' : 'visible'

      const active = nearestPart()
      const anatomyRect = document.getElementById('espejo')?.getBoundingClientRect()
      const anatomyVisible = Boolean(anatomyRect && anatomyRect.top < window.innerHeight && anatomyRect.bottom > 0)
      let partsMoving = false
      objectParts.forEach(({ object, original }, name) => {
        const targetZ = original.z + (anatomyVisible && name === active && name !== 'MirrorGlass' ? 0.13 : 0)
        const nextZ = mix(object.position.z, targetZ, reducedMotion ? 1 : 0.16)
        partsMoving ||= Math.abs(targetZ - nextZ) > 0.001
        object.position.z = nextZ
      })
      if (model && current.opacity > 0.005) renderer.render(scene, camera)
      const moving = Math.abs(current.x - target.x) + Math.abs(current.y - target.y) + Math.abs(current.scale - target.scale)
        + Math.abs(current.yaw - target.yaw) + Math.abs(current.opacity - target.opacity)
      if (moving > 0.002 || partsMoving) requestRender()
    }

    const requestRender = () => { if (!frame) frame = window.requestAnimationFrame(render) }
    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 960 ? 1.25 : 1.7)
      renderer.setPixelRatio(pixelRatio)
      renderer.setSize(window.innerWidth, window.innerHeight, false)
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      requestRender()
    }
    const mouseMove = (event: MouseEvent) => {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2
      requestRender()
    }
    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', requestRender, { passive: true })
    window.addEventListener('mousemove', mouseMove, { passive: true })

    new GLTFLoader().load(`${import.meta.env.BASE_URL}models/espejo-magico.glb`, (gltf) => {
      if (disposed) return
      model = gltf.scene
      const softbox = model.getObjectByName('SoftboxUmbrella')
      const softboxParent = softbox?.parent
      if (softbox) {
        softbox.visible = false
        softboxParent?.remove(softbox)
      }
      const bounds = new Box3().setFromObject(model)
      if (softbox && softboxParent) softboxParent.add(softbox)
      const center = bounds.getCenter(new Vector3())
      const height = bounds.getSize(new Vector3()).y || 1
      const scale = 3.2 / height
      model.scale.setScalar(scale)
      model.position.set(-center.x * scale, -center.y * scale, -center.z * scale)
      rig.add(model)
      for (const name of parts) {
        const object = model.getObjectByName(name)
        if (object) objectParts.set(name, { object, original: object.position.clone() })
      }
      model.traverse((object) => {
        if (object instanceof Mesh) {
          object.castShadow = false
          object.receiveShadow = false
        }
      })
      requestRender()
      window.requestAnimationFrame(() => { if (!disposed) setReady(true) })
    }, undefined, () => { if (!disposed) setFailed(true) })

    return () => {
      disposed = true
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', requestRender)
      window.removeEventListener('mousemove', mouseMove)
      renderer.dispose()
    }
  }, [])

  if (failed) return <Poster />
  return <div className="mirror-stage" ref={stageRef} aria-hidden="true"><canvas ref={canvasRef} /><img className={`mirror-stage__poster ${ready ? 'mirror-stage__poster--hidden' : ''}`} src={`${import.meta.env.BASE_URL}models/espejo-magico-poster.webp`} alt="" /></div>
}
