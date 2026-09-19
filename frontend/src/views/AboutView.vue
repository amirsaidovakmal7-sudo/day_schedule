<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AboutAnatomy from '@/components/about/AboutAnatomy.vue'
import RevealText from '@/components/about/RevealText.vue'
import StoryHistory from '@/components/about/StoryHistory.vue'
import StorySchedule from '@/components/about/StorySchedule.vue'
import StoryTasks from '@/components/about/StoryTasks.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import FlipClock from '@/components/base/FlipClock.vue'
import DayHero from '@/components/day/DayHero.vue'
import DayRuler from '@/components/day/DayRuler.vue'
import { observeInView, vInview } from '@/composables/useInView'
import { useScenePhase } from '@/composables/useScenePhase'
import { useStickyProgress } from '@/composables/useScrollProgress'
import { useBackButton } from '@/composables/useTelegram'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const { track } = useScenePhase('field')

useBackButton(() => router.push({ name: 'home' }))

function localIso(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const today = localIso()
const dayNumber = new Date().getDate()
const tomorrowNumber = new Date(Date.now() + 86_400_000).getDate()

const signedIn = computed(() => authStore.isAuthenticated)

function primary() {
  if (signedIn.value) router.push({ name: 'home' })
  else router.push({ name: 'auth', query: { mode: 'register' } })
}

function secondary() {
  router.push({ name: 'auth' })
}

// The two pinned scenes are driven by scroll position
const scheduleEl = ref<HTMLElement>()
const historyEl = ref<HTMLElement>()
const scheduleProgress = useStickyProgress(scheduleEl)
const historyProgress = useStickyProgress(historyEl)

// Scrolling the schedule scene runs the sample day from 07:00 to 19:00 in 5-minute steps
const scheduleMinutes = computed(() => 420 + Math.round((scheduleProgress.value * 720) / 5) * 5)
const scheduleClock = computed(() => {
  const m = scheduleMinutes.value
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
})

// The tasks demo plays only while it is on screen
const tasksEl = ref<HTMLElement>()
const tasksActive = ref(false)
let stopTasks: (() => void) | undefined

onMounted(() => {
  if (tasksEl.value) {
    stopTasks = observeInView(tasksEl.value, (visible) => (tasksActive.value = visible), { threshold: 0.25 })
  }
})
onBeforeUnmount(() => stopTasks?.())
</script>

<template>
  <div class="about" :class="{ 'is-authed': signedIn }">
    <header v-if="!signedIn" class="about__top env-field">
      <RouterLink to="/auth" class="about__brand">Дневник <span>дня</span></RouterLink>
      <RouterLink to="/auth" class="about__signin">Войти</RouterLink>
    </header>

    <!-- 1 · Hero: the idea in one line, on a live day -->
    <section :ref="(el) => track(el, 'field')" class="hero env-field">
      <div class="hero__inner">
        <div class="hero__copy">
          <RevealText tag="h1" mode="lines" class="hero__title" :text="'Сначала\nсегодня.'" />
          <p class="hero__lead">
            «Дневник дня» открывается сразу на текущем дне: что нужно сделать и когда. Вчерашний день не пропадает — его
            можно перечитать, но уже не переписать.
          </p>
          <div class="hero__cta">
            <BaseButton @click="primary">
              {{ signedIn ? 'Открыть сегодня' : 'Создать аккаунт' }}
              <template #icon><BaseIcon :icon="ArrowRight" :size="18" /></template>
            </BaseButton>
            <BaseButton v-if="!signedIn" variant="text" @click="secondary">Уже есть аккаунт</BaseButton>
          </div>
        </div>

        <div class="hero__date" aria-hidden="true">
          <DayHero :date="today" :live="false" compact />
        </div>

        <DayRuler class="hero__ruler" />
      </div>
    </section>

    <!-- 2 · Today: what matters right now -->
    <section :ref="(el) => track(el, 'plain')" class="block block--today env-plain">
      <div class="block__inner block__inner--split">
        <div class="block__copy">
          <RevealText tag="h2" mode="words" class="block__title" :text="'Что важно\nименно сегодня?'" />
          <p v-inview class="block__text">
            Никаких календарей и папок. Открываете приложение — и видите сегодняшнее число, свои дела и часы, в которые
            они происходят. Остальное живёт на других страницах.
          </p>
        </div>
        <AboutAnatomy :day="dayNumber" />
      </div>
    </section>

    <!-- 3 · Tasks -->
    <section :ref="(el) => { tasksEl = (el as HTMLElement) ?? undefined; track(el, 'plain') }" class="block block--tasks env-alt">
      <div class="block__inner block__inner--split">
        <div class="block__copy">
          <RevealText tag="h2" mode="words" class="block__title" :text="'Что необходимо\nсделать?'" />
          <p v-inview class="block__text">
            Пишете задачу одной строкой и нажимаете Enter — можно сразу писать следующую. Сделанное не прячется: оно
            остаётся в списке зачёркнутым, и к вечеру видно, сколько уже позади.
          </p>
          <ul v-inview class="points">
            <li>Enter добавляет задачу и оставляет курсор в поле</li>
            <li>Выполненное остаётся на своём месте</li>
          </ul>
        </div>
        <StoryTasks :active="tasksActive" />
      </div>
    </section>

    <!-- 4 · Schedule: scrolling moves the clock -->
    <section :ref="(el) => { scheduleEl = (el as HTMLElement) ?? undefined; track(el, 'board') }" class="story story--schedule env-board">
      <div class="story__stage">
        <div class="block__inner block__inner--split">
          <div class="block__copy">
            <RevealText tag="h2" mode="words" class="block__title" :text="'Когда я\nэто делаю?'" />
            <p v-inview class="block__text story__text">
              Укажите время и коротко напишите, что происходит. Записи выстраиваются вдоль линии дня, а отметка
              «сейчас» показывает, где вы находитесь. Прокрутите — и день пройдёт сам.
            </p>
            <div class="story__clock"><FlipClock :value="scheduleClock" :spin="false" /></div>
          </div>
          <StorySchedule :minutes="scheduleMinutes" />
        </div>
      </div>
    </section>

    <!-- 5 · History: scrolling tears the leaves off -->
    <section :ref="(el) => { historyEl = (el as HTMLElement) ?? undefined; track(el, 'field') }" class="story story--history env-field">
      <div class="story__stage">
        <div class="block__inner block__inner--split">
          <div class="block__copy">
            <RevealText tag="h2" mode="words" class="block__title" :text="'Что было в\nпредыдущие дни?'" />
            <p v-inview class="block__text story__text">
              Когда наступает новый день, прошлый остаётся в архиве целиком: задачи с отметками и расписание. Его можно
              открыть и перечитать — менять уже нельзя.
            </p>
          </div>
          <StoryHistory :progress="historyProgress" />
        </div>
      </div>
    </section>

    <!-- 6 · Finale -->
    <section :ref="(el) => track(el, 'board')" class="finale env-board">
      <div class="finale__inner">
        <div class="finale__copy">
          <RevealText tag="h2" mode="words" class="finale__title" :text="'Сегодня — ваш.\nЗавтра он станет\nисторией.'" />
          <div v-inview class="finale__cta">
            <BaseButton @click="primary">
              {{ signedIn ? 'Вернуться к сегодняшнему дню' : 'Начать с сегодняшнего дня' }}
              <template #icon><BaseIcon :icon="ArrowRight" :size="18" /></template>
            </BaseButton>
            <BaseButton v-if="!signedIn" variant="text" @click="secondary">Войти</BaseButton>
          </div>
        </div>
        <p class="finale__next tnum" aria-hidden="true">{{ tomorrowNumber }}</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--background);
}

.about__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 4rem;
  padding: 0 var(--gutter);
}

.about__brand {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}

.about__brand span {
  color: var(--fg-2);
}

.about__signin {
  min-height: var(--tap-target-min);
  display: inline-flex;
  align-items: center;
  font-size: var(--fs-meta);
  font-weight: 700;
  background: linear-gradient(currentColor, currentColor) left calc(50% + 0.7em) / 100% 2px no-repeat;
  transition: background-size var(--duration-slow) var(--ease-out);
}

.about__signin:hover {
  background-size: 0 2px;
  background-position: right calc(50% + 0.7em);
}

/* ---------- 1 · Hero ---------- */
.hero__inner {
  width: 100%;
  max-width: var(--wide-max);
  min-height: min(100svh, 64rem);
  margin: 0 auto;
  padding: var(--space-7) var(--gutter) var(--space-6);
  display: grid;
  gap: var(--space-7);
  align-content: space-between;
}

.hero__title {
  font-family: var(--font-display);
  font-size: var(--fs-hero);
  font-weight: 900;
  line-height: var(--lh-display);
  letter-spacing: -0.005em;
  margin-bottom: var(--space-5);
}

.hero__lead {
  max-width: 32rem;
  font-size: var(--fs-sub);
  line-height: var(--lh-snug);
  color: var(--fg-2);
}

.hero__cta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3) var(--space-4);
  margin-top: var(--space-6);
}

@media (max-width: 1023px) {
  .about.is-authed .hero__inner {
    min-height: calc(100svh - var(--tabbar-height) - var(--safe-bottom));
  }
}

@media (min-width: 1200px) {
  .hero__inner {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
    grid-template-areas:
      'copy date'
      'ruler ruler';
    align-items: end;
  }

  .hero__copy {
    grid-area: copy;
    align-self: center;
  }

  .hero__date {
    grid-area: date;
  }

  .hero__ruler {
    grid-area: ruler;
  }
}

/* ---------- shared blocks ---------- */
.block__inner {
  width: 100%;
  max-width: var(--wide-max);
  margin: 0 auto;
  padding: var(--section-y) var(--gutter);
  display: grid;
  gap: var(--space-7);
}

.block__title {
  font-family: var(--font-display);
  font-size: var(--fs-section);
  font-weight: 800;
  line-height: var(--lh-display);
  letter-spacing: -0.005em;
  margin-bottom: var(--space-5);
}

.block__text {
  max-width: 30rem;
  font-size: var(--fs-sub);
  line-height: var(--lh-snug);
  color: var(--fg-2);
  transition: opacity var(--duration-slow) var(--ease-standard) 300ms;
}

.block__text[data-inview='false'] {
  opacity: 0;
}

.points {
  display: grid;
  gap: var(--space-3);
  margin-top: var(--space-5);
  font-size: var(--fs-meta);
  font-weight: 600;
  transition: opacity var(--duration-slow) var(--ease-standard) 500ms;
}

.points[data-inview='false'] {
  opacity: 0;
}

.points li {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.points li::before {
  content: '';
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  background: var(--fill);
}

@media (min-width: 900px) {
  .block__inner--split {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
    align-items: center;
    gap: var(--space-8);
  }
}

/* ---------- pinned scenes ---------- */
.story__stage {
  display: flex;
  align-items: center;
  min-height: 100svh;
}

.story__stage .block__inner {
  padding-block: var(--space-7);
}

@media (min-height: 641px) {
  .story--schedule {
    height: 340vh;
  }

  .story--history {
    height: 300vh;
  }

  .story__stage {
    position: sticky;
    top: 0;
    height: 100svh;
    min-height: 0;
    overflow: hidden;
  }

  .story__stage .block__inner {
    padding-block: var(--space-6);
  }
}

/* The flip clock rides under the copy; it scales with the screen height so nothing is cut off */
.story__clock {
  margin-top: var(--space-6);
  font-size: clamp(3.5rem, 6vh + 3vw, 8.5rem);
}

@media (max-height: 640px) {
  .story__clock {
    display: none;
  }
}

@media (max-width: 899px) {
  .story__clock {
    margin-top: var(--space-3);
    font-size: 3rem;
  }

  .story__text {
    display: none;
  }

  .story .block__title {
    font-size: clamp(2.75rem, 2rem + 4vw, 3.5rem);
    margin-bottom: 0;
  }

  .story .block__inner {
    gap: var(--space-4);
  }

  .story--schedule :deep(.demo) {
    --pad-max: 1rem;
  }

  .about.is-authed .story__stage {
    padding-bottom: calc(var(--tabbar-height) + var(--safe-bottom));
  }
}

/* ---------- 6 · Finale ---------- */
.finale__inner {
  width: 100%;
  max-width: var(--wide-max);
  margin: 0 auto;
  padding: calc(var(--section-y) * 1.1) var(--gutter) var(--section-y);
  display: grid;
  gap: var(--space-7);
  align-items: end;
}

.finale__title {
  font-family: var(--font-display);
  font-size: clamp(3.5rem, 1.25rem + 6vw, 7rem);
  font-weight: 900;
  line-height: var(--lh-display);
  letter-spacing: -0.005em;
}

.finale__cta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3) var(--space-4);
  margin-top: var(--space-6);
  transition:
    opacity var(--duration-slow) var(--ease-standard) 500ms,
    transform var(--duration-slow) var(--ease-out) 500ms;
}

.finale__cta[data-inview='false'] {
  opacity: 0;
  transform: translateX(-16px);
}

/* Tomorrow's leaf is still blank: an outlined numeral */
.finale__next {
  font-family: var(--font-display);
  font-size: clamp(12rem, 6rem + 22vw, 26rem);
  font-weight: 900;
  line-height: 0.78;
  letter-spacing: -0.02em;
  color: transparent;
  -webkit-text-stroke: 3px var(--time);
  user-select: none;
}

@media (min-width: 900px) {
  .finale__inner {
    grid-template-columns: minmax(0, 1.3fr) auto;
  }

  .finale__next {
    justify-self: end;
  }
}
</style>
