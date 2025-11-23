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

const head = ref(null)
const mouth = ref(null)
const leftEye = ref(null)
const rightEye = ref(null)

function onMouseMove(e) {
  if (!head.value) return
 
  const mouseX = (e.clientX / window.innerWidth - 0.5)
  const mouseY = (e.clientY / window.innerHeight - 0.5)
 
  gsap.to(head.value.rotation, {
    y: mouseX * 0.6,      // ซ้าย/ขวา
    x: mouseY * 0.6,     // ขึ้น/ลง
    duration: 0.3,
    ease: "power2.out"
  })
}


// TALK
watch(() => props.volume, (v) => {
  if (!mouth.value) return
  const h = 0.1 + v * 0.25
  gsap.to(mouth.value.scale, { y: h, duration: 0.1 })
})

// EYES GLOW
watch(() => props.isTalking, (val) => {
  const to = val ? 8 : 2
  gsap.to(leftEye.value.material, { emissiveIntensity: to })
  gsap.to(rightEye.value.material, { emissiveIntensity: to })
})
</script>

<template>
  <div class="w-full h-[550px] relative" @mousemove="onMouseMove">
    <div class="absolute inset-0 blur-xl opacity-40 bg-emerald-400"></div>

    <TresCanvas clear-color="#02070A" :window-size="true">
      <TresPerspectiveCamera :position="[0,1.4,5]" :look-at="[0,0,0]" />
      <OrbitControls :enableZoom="false" :enablePan="false" />

      <TresAmbientLight :intensity="1" />
      <TresPointLight :position="[0,2,2]" :intensity="15" color="#00ffaa" />

      <TresGroup ref="head">

        <!-- HEAD -->
        <TresMesh>
          <TresBoxGeometry :args="[1.8,1.8,1.4]" />
          <TresMeshStandardMaterial color="#0b0b0b" metalness="0.7" roughness="0.2" />
        </TresMesh>

        <!-- FACE SCREEN -->
        <TresMesh :position="[0,-0.1,0.75]">
          <TresBoxGeometry :args="[1.3,0.9,0.2]" />
          <TresMeshStandardMaterial color="#00ffcc" emissive="#00ffcc" :emissiveIntensity="0.4" />
        </TresMesh>

        <!-- MOUTH -->
        <TresMesh ref="mouth" :position="[0,-0.25,0.9]">
          <TresBoxGeometry :args="[1.0,0.15,0.1]" />
          <TresMeshStandardMaterial color="#00ffaa" emissive="#00ffaa" :emissiveIntensity="2" />
        </TresMesh>

        <!-- EYES -->
        <TresMesh ref="leftEye" :position="[-0.5,0.3,0.8]">
          <TresSphereGeometry :args="[0.18,32,32]" />
          <TresMeshStandardMaterial color="red" emissive="red" :emissiveIntensity="2" />
        </TresMesh>
        <TresMesh ref="rightEye" :position="[0.5,0.3,0.8]">
          <TresSphereGeometry :args="[0.18,32,32]" />
          <TresMeshStandardMaterial color="red" emissive="red" :emissiveIntensity="2" />
        </TresMesh>
      </TresGroup>
    </TresCanvas>
  </div>
</template>
