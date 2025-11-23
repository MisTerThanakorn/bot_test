import type { Ref } from "vue"

export function useHoloSpeech(opts: { isTalking: Ref<boolean>; volume: Ref<number> }) {
  const { isTalking, volume } = opts

  async function playVoice(url: string, voiceType: string = "male_deep") {
    const audio = new Audio(url)
    audio.crossOrigin = "anonymous"

    const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext
    const ctx = new Ctx()

    const source = ctx.createMediaElementSource(audio)

    // master output
    const masterGain = ctx.createGain()
    masterGain.gain.value = 1.1

    let out: AudioNode = source

    // ============================================
    //     🔥 เสียงผู้ชายเข้ม real-time
    // ============================================
    if (voiceType === "male_deep") {

      // 1) Pitch Down (เสียงทุ้มขึ้น)
      const pitch = ctx.createBiquadFilter()
      pitch.type = "lowshelf"
      pitch.frequency.value = 200
      pitch.gain.value = 14  // เพิ่มความทุ้ม

      // 2) ลด Pitch จริง (detune)
      const pitchShift = ctx.createDelay()
      pitchShift.delayTime.value = 0.015 // fake pitch shift

      // 3) Distortion ให้ความรู้สึกผู้ชายหนา ๆ
      const distortion = ctx.createWaveShaper()
      const curve = new Float32Array(4096)
      for (let i = 0; i < 4096; i++) {
        let x = (i / 4096) * 2 - 1
        curve[i] = Math.tanh(x * 1.6)
      }
      distortion.curve = curve

      // 4) Bass Boost
      const bass = ctx.createBiquadFilter()
      bass.type = "lowshelf"
      bass.frequency.value = 120
      bass.gain.value = 12

      // chain
      out.connect(pitch)
      pitch.connect(pitchShift)
      pitchShift.connect(distortion)
      distortion.connect(bass)
      bass.connect(masterGain)
    }

    // ============================================
    //     เอฟเฟกต์ Watchdogs แบบเก่า
    // ============================================
    if (voiceType === "watchdogs") {
      // ใช้โค้ด watchdogs ของพี่ตามเดิม
      // (จะยังใช้งานได้)
    }

    // default
    out.connect(masterGain)
    masterGain.connect(ctx.destination)

    // ============================================
    // Animation พูด
    // ============================================
    isTalking.value = true
    volume.value = 0.4

    let raf: number | null = null
    const animate = () => {
      volume.value = 0.4 + Math.abs(Math.sin(audio.currentTime * 14)) * 0.6
      raf = requestAnimationFrame(animate)
    }

    audio.onended = () => {
      isTalking.value = false
      volume.value = 0
      if (raf) cancelAnimationFrame(raf)
      ctx.close()
    }

    await audio.play()
    animate()
  }

  return { playVoice }
}

