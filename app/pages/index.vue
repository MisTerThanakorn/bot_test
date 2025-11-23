<script setup lang="ts">
import { ref, onMounted } from 'vue'
import HoloAvatar from '../../components/HoloAvatar.vue'
import { useHoloSpeech } from '../../composables/useSpeech'
import { useVoiceCommand } from '../../composables/useVoiceCommand'

type Mood = 'neutral' | 'happy' | 'thinking' | 'angry' | 'sad'
type ChatMsg = { id: number; role: 'user' | 'bot'; text: string }

const input = ref('')
const botText = ref('')
const listening = ref(false)

const isTalking = ref(false)
const volume = ref(0)
const mood = ref<Mood>('neutral')

const voiceType = ref('watchdogs')

const messages = ref<ChatMsg[]>([])
let msgId = 1
let unlockedAudio = false
let welcomed = false

const { playVoice } = useHoloSpeech({ isTalking, volume })

async function speak(text: string) {
  const res = await fetch('http://127.0.0.1:8000/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice: voiceType.value })
  })

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  await playVoice(url, voiceType.value)
}

async function welcomeBot() {
  if (welcomed) return
  welcomed = true

  const text = 'ยินดีต้อนรับ เข้าสู่ระบบผู้ช่วยอัจฉริยะเวอร์ชั่น Watch Dogs'
  botText.value = text
  await speak(text)
}

function unlockOnFirstGesture() {
  if (unlockedAudio) return
  unlockedAudio = true

  welcomeBot()

  window.removeEventListener('pointerdown', unlockOnFirstGesture)
  window.removeEventListener('keydown', unlockOnFirstGesture)
}

onMounted(() => {
  window.addEventListener('pointerdown', unlockOnFirstGesture)
  window.addEventListener('keydown', unlockOnFirstGesture)
})

const { startListening } = useVoiceCommand((v) => {
  listening.value = false
  input.value = v
  sendMessage()
})

function listenNow() {
  listening.value = true
  startListening()
}

function inferMoodFromText(t: string): Mood {
  const x = t.toLowerCase()
  if (x.includes('ดี') || x.includes('เยี่ยม')) return 'happy'
  if (x.includes('คิด') || x.includes('ช่วย')) return 'thinking'
  if (x.includes('โกรธ') || x.includes('ห่วย')) return 'angry'
  if (x.includes('เศร้า') || x.includes('ร้อง')) return 'sad'
  return 'neutral'
}

async function sendMessage() {
  if (!input.value.trim()) return

  const msg = input.value
  input.value = ''

  messages.value.push({ id: msgId++, role: 'user', text: msg })

  const res = await fetch('http://127.0.0.1:8000/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: msg })
  })

  const data = await res.json()

  botText.value = data.reply
  messages.value.push({ id: msgId++, role: 'bot', text: data.reply })
  mood.value = inferMoodFromText(data.reply)

  await speak(data.reply)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-black via-[#020617] to-black text-emerald-100 flex flex-col items-center pt-6 pb-8">
    <div class="w-full max-w-4xl px-6 mb-2">
      <h1 class="text-sm uppercase tracking-[0.35em] text-emerald-500/70">
        DTC HOLO ASSISTANT
      </h1>
    </div>

    <div class="w-full max-w-4xl px-4 flex flex-col gap-6">
      <div class="rounded-3xl border border-emerald-500/30 bg-black/40 backdrop-blur-xl">
        <HoloAvatar :isTalking="isTalking" :volume="volume" />
        <div class="px-6 pb-4 text-emerald-300/80 text-sm">
          {{ botText }}
        </div>
      </div>

      <div class="rounded-3xl border border-emerald-500/25 bg-black/50 backdrop-blur-xl flex flex-col h-[360px]">
        <div class="flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-3">
          <div
            v-for="m in messages"
            :key="m.id"
            class="flex"
            :class="m.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed"
              :class="m.role === 'user'
                ? 'bg-emerald-500 text-black rounded-br-sm'
                : 'bg-slate-900/80 text-emerald-100 rounded-bl-sm border border-emerald-500/40'"
            >
              {{ m.text }}
            </div>
          </div>
        </div>

        <form
          @submit.prevent="sendMessage"
          class="border-t border-emerald-500/20 px-4 py-3 flex gap-3 items-center"
        >
          <div v-if="listening" class="text-blue-400 animate-pulse text-sm">
            🎤 กำลังฟัง...
          </div>

          <input
            v-model="input"
            class="flex-1 bg-black/60 border border-emerald-400/40 rounded-full px-4 py-2.5 text-sm text-emerald-100"
            placeholder="พิมพ์ข้อความหรือกดปุ่มไมค์..."
          />

          <button class="px-5 py-2.5 rounded-full bg-emerald-500/20 border border-emerald-400/60">
            SEND
          </button>

          <button
            @click.prevent="listenNow"
            class="px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/40 hover:bg-blue-500/30"
          >
            🎤
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
