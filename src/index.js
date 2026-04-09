import GUI from 'lil-gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { uniform, uv, vec3 } from 'three/tsl'
import * as THREE from 'three/webgpu'
import { voronoi, voronoiNormalizeSeed } from './voronoi.js'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.threejs')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGPURenderer({
    canvas: canvas,
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x111111)

/**
 * Demo
 */
const material = new THREE.MeshBasicNodeMaterial()

const subdivision = uniform(3)
const seed = uniform(0)
const channel = { value: 'r' }
const voronoiOutput = voronoi(uv(), subdivision, seed)

material.colorNode = vec3(voronoiOutput[channel.value])
// material.colorNode = vec3(voronoiOutput.g)
// material.colorNode = vec3(float(-0.9).mod(1))

const geometry = new THREE.BoxGeometry(1, 1, 1)
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Debug
gui.add(subdivision, 'value', 1, 50, 1).name('subdivision')
gui.add(seed, 'value', 0, 50, 1).name('seed')
gui.add(channel, 'value', [ 'r', 'g', 'b', 'a' ]).name('channel').onChange(() =>
{
    material.colorNode = vec3(voronoiOutput[channel.value])

    if(channel.value === 'a')
        material.colorNode = voronoiNormalizeSeed(material.colorNode, subdivision, seed)
    material.needsUpdate = true
})

/**
 * Animate
 */
const timer = new THREE.Timer()

const tick = () =>
{
    timer.update()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene,camera)
}

renderer.setAnimationLoop(tick)
