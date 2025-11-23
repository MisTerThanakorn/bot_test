<template>
  <div class="min-h-screen bg-[#02070A] flex flex-col items-center pt-10 text-emerald-200">

    <!-- HOLOGRAM 3D AI -->
    <Avatar3D :isTalking="isTalking" :volume="volume" />

    <!-- BOT TEXT -->
    <div class="mt-10 text-center space-y-3 max-w-2xl px-4">
      <p class="text-lg tracking-wide text-emerald-300/80 min-h-[3rem]">
        {{ botText || "เริ่มต้นสนทนากับ AI..." }}
      </p>

      <!-- INPUT BAR -->
      <form @submit.prevent="sendMessage" class="flex gap-3">
        <input
          v-model="input"
          class="flex-1 bg-black/40 border border-emerald-400/50
                 rounded-full px-4 py-3 text-emerald-100
                 focus:ring-2 focus:ring-emerald-400/70"
          placeholder="พิมพ์ข้อความที่นี่..."
        />

        <button
          class="px-6 py-3 rounded-full bg-emerald-500/10
                 border border-emerald-400/70 uppercase tracking-[0.25em]
                 hover:bg-emerald-500/20">
          SEND
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Avatar3D from '../components/Avatar3D.vue'
import { useSpeech } from '../composables/useSpeech'

const input = ref('')
const botText = ref('')
const isTalking = ref(false)
const volume = ref(0)

const { playVoice } = useSpeech({ isTalking, volume })

async function sendMessage() {
  if (!input.value.trim()) return

  const msg = input.value
  input.value = ""

  const res = await fetch("http://127.0.0.1:8000/chat", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: msg })
  })
  const data = await res.json()

  botText.value = data.reply

  const audioRes = await fetch("http://127.0.0.1:8000/tts", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: data.reply })
  })

  const { audio_url } = await audioRes.json()
  playVoice(audio_url)
}
</script>
