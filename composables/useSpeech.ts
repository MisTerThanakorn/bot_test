export function useSpeech({ isTalking, volume }: any) {
  let audio: HTMLAudioElement | null = null

  function playVoice(url: string) {
    if (audio) audio.pause()

    audio = new Audio(url)
    audio.crossOrigin = "anonymous"

    const ctx = new AudioContext()
    const analyser = ctx.createAnalyser()
    const source = ctx.createMediaElementSource(audio)

    analyser.fftSize = 512
    const data = new Uint8Array(analyser.frequencyBinCount)

    source.connect(analyser)
    analyser.connect(ctx.destination)

    isTalking.value = true

    audio.onended = () => {
      isTalking.value = false
      volume.value = 0
    }

    audio.play()

    function loop() {
      if (!audio || audio.paused) return
      analyser.getByteFrequencyData(data)
      const avg = data.reduce((a, b) => a + b) / data.length
      volume.value = avg / 255
      requestAnimationFrame(loop)
    }
    loop()
  }

  return { playVoice }
}
