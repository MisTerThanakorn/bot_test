<script setup>
import { TresCanvas } from '@tresjs/core'
</script>

<template>
  <div style="width:100vw; height:100vh; background:black;">
    <TresCanvas :window-size="true">
      <TresMesh>
        <TresBoxGeometry :args="[1,1,1]" />
        <TresMeshStandardMaterial color="#00ff00" />
      </TresMesh>

      <TresAmbientLight :intensity="1" />
      <TresPerspectiveCamera :position="[2,2,3]" />
    </TresCanvas>
  </div>
</template>
