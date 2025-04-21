import React, { useReducer, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { Physics, RigidBody, BallCollider } from '@react-three/rapier'
import { easing } from 'maath'
import { Effects } from './Effects'
import './style.css'

const accents = ['#ff4060', '#ffcc00', '#20ffa0', '#4060ff']
const shuffle = (accent = 0) => [
  { color: '#444', roughness: 0.1, metalness: 0.5 },
  { color: '#444', roughness: 0.1, metalness: 0.5 },
  { color: '#444', roughness: 0.1, metalness: 0.5 },
  { color: 'white', roughness: 0.1, metalness: 0.1 },
  { color: 'white', roughness: 0.1, metalness: 0.1 },
  { color: 'white', roughness: 0.1, metalness: 0.1 },
  { color: accents[accent], roughness: 0.1, accent: true },
  { color: accents[accent], roughness: 0.1, accent: true },
  { color: accents[accent], roughness: 0.1, accent: true },
  { color: '#444', roughness: 0.1 },
  { color: '#444', roughness: 0.3 },
  { color: '#444', roughness: 0.3 },
  { color: 'white', roughness: 0.1 },
  { color: 'white', roughness: 0.2 },
  { color: 'white', roughness: 0.1 },
  { color: accents[accent], roughness: 0.1, accent: true, transparent: true, opacity: 0.5 },
  { color: accents[accent], roughness: 0.3, accent: true },
  { color: accents[accent], roughness: 0.1, accent: true }
]


export function BackgroundAnimation() {
  const [accent, cycleAccent] = useReducer((s) => ++s % accents.length, 0)
  const connectors = useMemo(() => shuffle(accent), [accent])

  return (
    <Canvas 
      flat 
      shadows 
      dpr={[1, 1.5]} 
      gl={{ antialias: false }} 
      camera={{ position: [0, 0, 30], fov: 17.5, near: 10, far: 40 }}
    >
      <color attach="background" args={['#FFFFFF']} />

      <Physics timeStep="vary" gravity={[0, 0, 0]}>
        <Pointer />
        {connectors.map((p, i) => <Sphere key={i} {...p} />)}
      </Physics>

      <Environment resolution={256}>
        <group rotation={[-Math.PI / 3, 0, 1]}>
          <Lightformer form="circle" intensity={100} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={8} />
          <Lightformer form="ring" color="#4060ff" intensity={80} onUpdate={(self) => self.lookAt(0, 0, 0)} position={[10, 10, 0]} scale={10} />
        </group>
      </Environment>
      <Effects />
    </Canvas>
  )
}

function Sphere({ position, color = 'white', vec = new THREE.Vector3(), ...props }) {
  const api = useRef(), ref = useRef()
  const pos = useMemo(() => position || [THREE.MathUtils.randFloatSpread(10), THREE.MathUtils.randFloatSpread(10), THREE.MathUtils.randFloatSpread(10)], [])
  useFrame((_, delta) => {
    delta = Math.min(0.1, delta)
    if (api.current) {
    api.current.applyImpulse(vec.copy(api.current.translation()).negate().multiplyScalar(0.2))
  }
    if (ref.current) {
    easing.dampC(ref.current.material.color, color, 0.2, delta)
  }
  })
  return (
    <RigidBody ref={api} position={pos} linearDamping={4} angularDamping={1} friction={0.1} colliders={false}>
      <BallCollider args={[1]} />
      <mesh ref={ref} castShadow receiveShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial {...props} />
      </mesh>
    </RigidBody>
  )
}

function Pointer({ vec = new THREE.Vector3() }) {
  const ref = useRef()
  useFrame(({ mouse, viewport }) => {
    if (ref.current) {
      ref.current.setNextKinematicTranslation(
        vec.set((mouse.x * viewport.width) / 2, (mouse.y * viewport.height) / 2, 0)
      )
    }
  })
  return (
    <RigidBody ref={ref} type="kinematicPosition" colliders={false}>
      <BallCollider args={[1]} />
    </RigidBody>
  )
}
