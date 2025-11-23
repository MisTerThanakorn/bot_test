<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { ref, watch } from 'vue'
import * as THREE from 'three'
import gsap from 'gsap'

const props = defineProps({
  isTalking: Boolean,
  volume: Number
})

const head = ref<THREE.Group | null>(null)
const mouth = ref<THREE.Mesh | null>(null)
const leftEye = ref<THREE.Mesh | null>(null)
const rightEye = ref<THREE.Mesh | null>(null)

// FOLLOW MOUSE
function onMouseMove(e: MouseEvent) {
  if (!head.value) return
  const x = (e.clientX / window.innerWidth - 0.5) * 0.6
  const y = (e.clientY / window.innerHeight - 0.5) * -0.6

  gsap.to(head.value.rotation, {
    y: x,
    x: y,
    duration: 0.4,
    ease: "power2.out"
  })
}

// TALK ANIMATION
watch(() => props.volume, (v) => {
  if (!mouth.value) return
  const h = 0.05 + v * 0.25

  gsap.to(mouth.value.scale, {
    y: h,
    duration: 0.08
  })
})

// EYES GLOW
watch(() => props.isTalking, (val) => {
  if (!leftEye.value || !rightEye.value) return

  const intensity = val ? 6 : 2
  gsap.to(leftEye.value.material.emissiveIntensity, { duration: 0.3, value: intensity })
  gsap.to(rightEye.value.material.emissiveIntensity, { duration: 0.3, value: intensity })
})
</script>

<template>
  <div class="w-full h-[700px]" @mousemove="onMouseMove">
    <TresCanvas clear-color="#000" shadows>
      <TresPerspectiveCamera :position="[0, 1.2, 4]" />
      <OrbitControls enableZoom="false" enablePan="false" />

      <!-- MAIN LIGHT -->
      <TresAmbientLight :intensity="0.3" />
      <TresDirectionalLight :position="[2, 2, 3]" :intensity="1" cast-shadow />

      <!-- ROBOT HEAD GROUP -->
      <TresGroup ref="head">
        
        <!-- HEAD BASE -->
        <TresMesh>
          <TresBoxGeometry :args="[1.6, 1.8, 1.4]" />
          <TresMeshStandardMaterial color="#111" metalness="0.6" roughness="0.25" />
        </TresMesh>

        <!-- FACE PANEL -->
        <TresMesh :position="[0, -0.2, 0.75]">
          <TresBoxGeometry :args="[1.2, 0.7, 0.2]" />
          <TresMeshStandardMaterial color="#0f0" emissive="#0f0" :emissiveIntensity="0.4" />
        </TresMesh>

        <!-- MOUTH (EQ) -->
        <TresMesh ref="mouth" :position="[0, -0.2, 0.86]">
          <TresBoxGeometry :args="[0.9, 0.15, 0.1]" />
          <TresMeshStandardMaterial color="#22ff88" emissive="#22ff88" :emissiveIntensity="1.5" />
        </TresMesh>

        <!-- LEFT EYE -->
        <TresMesh ref="leftEye" :position="[-0.45, 0.35, 0.8]">
          <TresSphereGeometry :args="[0.15, 32, 32]" />
          <TresMeshStandardMaterial color="#ff0000" emissive="#ff0000" :emissiveIntensity="2" />
        </TresMesh>

        <!-- RIGHT EYE -->
        <TresMesh ref="rightEye" :position="[0.45, 0.35, 0.8]">
          <TresSphereGeometry :args="[0.15, 32, 32]" />
          <TresMeshStandardMaterial color="#ff0000" emissive="#ff0000" :emissiveIntensity="2" />
        </TresMesh>

      </TresGroup>
    </TresCanvas>
  </div>
</template>
