export function useVoiceCommand(callback: (text: string) => void) {
  let recognition: any = null

  const startListening = () => {
    const Speech =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!Speech) return

    recognition = new Speech()
    recognition.lang = "th-TH"
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript
      callback(text)
    }

    recognition.onerror = () => {}
    recognition.start()
  }

  return { startListening }
}
