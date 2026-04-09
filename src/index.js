import * as THREE from 'three/webgpu'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { cameraPosition, cameraProjectionMatrix, cameraViewMatrix, color, cos, deltaTime, dFdx, dFdy, diffuseColor, dot, float, Fn, If, instancedArray, instanceIndex, luminance, mat2, materialColor, materialEmissive, max, mix, nodeObject, normalMap, normalWorld, pass, TWO_PI, positionWorld, rand, range, screenCoordinate, screenUV, sin, texture, time, uniform, uv, vec2, vec3, vec4, viewport, viewportSharedTexture } from 'three/tsl'
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js'
import { hashBlur } from 'three/examples/jsm/tsl/display/hashBlur.js'
import { GLTFLoader, TransformControls } from 'three/examples/jsm/Addons.js'
import { normalizeSeed, voronoi } from './voronoi.js'

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
 * Test
 */
const material = new THREE.MeshBasicNodeMaterial()
const voronoiOutput = voronoi(uv(), 3)
// material.colorNode = vec3(normalizeSeed(voronoiOutput.b, 3))
material.colorNode = vec3(voronoiOutput.g)
// material.colorNode = vec3(float(-0.9).mod(1))

const geometry = new THREE.BoxGeometry(1, 1, 1)
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

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
