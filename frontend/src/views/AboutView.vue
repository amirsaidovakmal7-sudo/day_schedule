<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import DemoHistory from '@/components/about/DemoHistory.vue'
import DemoSchedule from '@/components/about/DemoSchedule.vue'
import DemoTasks from '@/components/about/DemoTasks.vue'
import RevealText from '@/components/about/RevealText.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import CurrentDate from '@/components/day/CurrentDate.vue'
import DayRuler from '@/components/day/DayRuler.vue'
import { observeInView, vInview } from '@/composables/useInView'
import { useBackButton } from '@/composables/useTelegram'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

useBackButton(() => router.push({ name: 'home' }))

function localIso(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const today = localIso()
const dayNumber = new Date().getDate()

const signedIn = computed(() => authStore.isAuthenticated)

function primary() {
  if (signedIn.value) router.push({ name: 'home' })
  else router.push({ name: 'auth', query: { mode: 'register' } })
}

function secondary() {
  router.push({ name: 'auth' })
}

const steps = [
  {
    index: '01',
    label: 'Задачи',
    title: 'Что нужно сделать?',
    text: 'Добавляйте задачи одной строкой: Enter — и можно писать следующую. Выполненная задача не исчезает, а остаётся частью дня.',
    points: ['Enter — добавить и сразу продолжить', 'Выполненное остаётся на своём месте'],
  },
  {
    index: '02',
    label: 'Расписание',
    title: 'А когда?',
    text: 'Укажите время и коротко опишите, чем заняты этот час. Записи выстраиваются вдоль линии дня, а «сейчас» отмечено между ними.',
    points: ['Время и описание — без длинных форм', 'Порядок всегда по часам'],
  },
  {
    index: '03',
    label: 'Дни',
    title: 'Что было раньше?',
    text: 'Когда наступает новый день, предыдущий остаётся в архиве целиком: задачи с отметками и расписание. Его можно открыть и перечитать — менять уже нельзя.',
    points: ['Архив по месяцам', 'Только просмотр'],
  },
]

const envByStep = ['env-paper', 'env-ink', 'env-archive'] as const
const phaseByStep = ['paper', 'ink', 'paper'] as const
const activeStep = ref(0)
const stepEls = ref<HTMLElement[]>([])
const heroEl = ref<HTMLElement>()
const statementEl = ref<HTMLElement>()
const finaleEl = ref<HTMLElement>()

const stops: (() => void)[] = []
const band = { threshold: 0, rootMargin: '-45% 0px -45% 0px' }

onMounted(() => {
  const phases = [
    [heroEl.value, 'paper'],
    [statementEl.value, 'accent'],
    [finaleEl.value, 'ink'],
  ] as const
  for (const [el, phase] of phases) {
    if (el) stops.push(observeInView(el, (visible) => visible && uiStore.setScenePhase(phase), band))
  }
  stepEls.value.forEach((el, index) => {
    stops.push(
      observeInView(
        el,
        (visible) => {
          if (!visible) return
          activeStep.value = index
          uiStore.setScenePhase(phaseByStep[index])
        },
        band,
      ),
    )
  })
})

onBeforeUnmount(() => {
  stops.forEach((stop) => stop())
  uiStore.setScenePhase('paper')
})
</script>

<template>
  <div class="about">
    <header v-if="!signedIn" class="about__top">
      <RouterLink to="/auth" class="about__brand">Дневник <em>дня</em></RouterLink>
      <RouterLink to="/auth" class="about__signin">Войти</RouterLink>
    </header>

    <!-- 1 · Hero -->
    <section ref="heroEl" class="hero">
      <div class="hero__inner">
        <div class="hero__copy">
          <p class="label hero__eyebrow">
            <span class="hero__rule" aria-hidden="true" />
            О приложении
          </p>
          <RevealText tag="h1" mode="lines" class="hero__title" :text="'Сначала\n_сегодня._'" />
          <p class="hero__lead">
            «Дневник дня» открывается сразу на текущем дне: что нужно сделать и когда. Вчерашний день не пропадает — его
            можно перечитать, но уже не переписать.
          </p>
          <div class="hero__cta">
            <BaseButton @click="primary">
              {{ signedIn ? 'Открыть сегодня' : 'Создать аккаунт' }}
              <template #icon><BaseIcon :icon="ArrowRight" :size="16" /></template>
            </BaseButton>
            <BaseButton v-if="!signedIn" variant="text" @click="secondary">Уже есть аккаунт</BaseButton>
          </div>
        </div>

        <div class="hero__art" aria-hidden="true">
          <CurrentDate :date="today" />
          <DayRuler />
        </div>
      </div>
    </section>

    <!-- 2 · Today (accent environment) -->
    <section ref="statementEl" class="statement">
      <span class="statement__ghost" aria-hidden="true">{{ dayNumber }}</span>
      <div class="statement__inner">
        <p class="label statement__eyebrow">
          <span class="statement__rule" aria-hidden="true" />
          Сегодня
        </p>
        <RevealText tag="h2" mode="words" class="statement__title" :text="'Что важно\n_именно сегодня?_'" />
        <p v-inview class="statement__lead">
          Приложение не просит выбрать день или открыть планировщик. Оно открывается на сегодняшней дате — с задачами и
          расписанием под рукой.
        </p>

        <ol v-inview class="parts">
          <li class="parts__row" style="--i: 0">
            <span class="label parts__index">01</span>
            <span class="parts__name">Дата</span>
            <span class="parts__text">Крупная, чтобы сразу видеть, какой это день.</span>
          </li>
          <li class="parts__row" style="--i: 1">
            <span class="label parts__index">02</span>
            <span class="parts__name">Задачи</span>
            <span class="parts__text">То, что нужно сделать. Отмеченное остаётся на месте.</span>
          </li>
          <li class="parts__row" style="--i: 2">
            <span class="label parts__index">03</span>
            <span class="parts__name">Расписание</span>
            <span class="parts__text">То, что происходит по часам.</span>
          </li>
        </ol>
      </div>
    </section>

    <!-- 3 · Story: the surrounding environment changes with the active step -->
    <section class="story" :class="envByStep[activeStep]">
      <div class="story__inner">
        <div class="story__steps">
          <article
            v-for="(step, i) in steps"
            :key="step.index"
            :ref="(el) => (stepEls[i] = el as HTMLElement)"
            class="step"
            :class="{ 'is-active': activeStep === i }"
          >
            <p class="label step__label">
              <span class="step__index tnum">{{ step.index }}</span> {{ step.label }}
            </p>
            <RevealText tag="h2" mode="lines" class="step__title" :text="step.title" />
            <p class="step__text">{{ step.text }}</p>
            <ul class="step__points">
              <li v-for="point in step.points" :key="point">{{ point }}</li>
            </ul>

            <div class="step__inline-demo">
              <DemoTasks v-if="i === 0" :active="activeStep === 0" />
              <DemoSchedule v-else-if="i === 1" :active="activeStep === 1" />
              <DemoHistory v-else :active="activeStep === 2" />
            </div>
          </article>
        </div>

        <div class="story__panel" aria-hidden="true">
          <div class="panel" :class="{ 'is-on': activeStep === 0 }"><DemoTasks :active="activeStep === 0" /></div>
          <div class="panel" :class="{ 'is-on': activeStep === 1 }"><DemoSchedule :active="activeStep === 1" /></div>
          <div class="panel" :class="{ 'is-on': activeStep === 2 }"><DemoHistory :active="activeStep === 2" /></div>
        </div>
      </div>
    </section>

    <!-- 4 · Finale -->
    <section ref="finaleEl" class="finale env-ink">
      <div class="finale__inner">
        <RevealText tag="h2" mode="words" class="finale__title" :text="'Сегодня — ваш.\nЗавтра он станет\n_историей._'" />
        <div v-inview class="finale__cta">
          <BaseButton @click="primary">
            {{ signedIn ? 'Вернуться к сегодняшнему дню' : 'Начать с сегодняшнего дня' }}
            <template #icon><BaseIcon :icon="ArrowRight" :size="16" /></template>
          </BaseButton>
          <BaseButton v-if="!signedIn" variant="text" @click="secondary">Войти</BaseButton>
        </div>
        <p class="label finale__sign">Дневник дня</p>
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

/* Signed-out header */
.about__top {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: var(--topbar-height);
  padding: 0 var(--gutter);
  background: var(--background);
  border-bottom: 1px solid var(--border);
}

.about__brand {
  font-family: var(--font-display);
  font-size: 1.375rem;
}

.about__brand em {
  color: var(--accent);
  font-weight: 300;
}

.about__signin {
  min-height: var(--tap-target-min);
  display: inline-flex;
  align-items: center;
  font-size: var(--fs-meta);
  font-weight: 600;
}

/* ---------- Hero (paper) ---------- */
.hero {
  background: var(--background);
}

.hero__inner {
  width: 100%;
  max-width: var(--wide-max);
  margin: 0 auto;
  padding: var(--space-8) var(--gutter) var(--section-y);
  display: grid;
  gap: var(--space-8);
  align-items: end;
}

.hero__eyebrow {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--accent);
  margin-bottom: var(--space-5);
}

.hero__rule {
  width: 2.5rem;
  height: 1px;
  background: currentColor;
  transform-origin: left;
  animation: about-rule var(--duration-draw) var(--ease-out) 80ms both;
}

.hero__title {
  font-family: var(--font-display);
  font-size: var(--fs-hero);
  font-weight: 300;
  line-height: var(--lh-tight);
  letter-spacing: -0.035em;
  margin-bottom: var(--space-5);
}

.hero__lead {
  max-width: 34rem;
  font-size: var(--fs-subhead);
  line-height: var(--lh-snug);
  color: var(--text-secondary);
}

.hero__cta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3) var(--space-4);
  margin-top: var(--space-6);
}

.hero__art {
  --fs-display: clamp(7rem, 4rem + 11vw, 13rem);
  display: grid;
  gap: var(--space-3);
}

/* ---------- Statement (accent environment) ---------- */
.statement {
  position: relative;
  overflow: hidden;
  background: var(--accent);
  color: var(--on-accent);
  --reveal-accent: currentColor;
}

.statement__ghost {
  position: absolute;
  right: -0.06em;
  bottom: -0.22em;
  font-family: var(--font-display);
  font-size: clamp(16rem, 8rem + 38vw, 44rem);
  font-weight: 300;
  line-height: 1;
  letter-spacing: -0.06em;
  color: color-mix(in srgb, var(--on-accent) 11%, transparent);
  pointer-events: none;
  user-select: none;
}

.statement__inner {
  position: relative;
  width: 100%;
  max-width: var(--wide-max);
  margin: 0 auto;
  padding: var(--section-y) var(--gutter);
  display: grid;
  gap: var(--space-6);
}

.statement__eyebrow {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.statement__rule {
  width: 2.5rem;
  height: 1px;
  background: currentColor;
}

.statement__title {
  font-family: var(--font-display);
  font-size: var(--fs-hero);
  font-weight: 300;
  line-height: var(--lh-tight);
  letter-spacing: -0.03em;
  max-width: 14ch;
}

.statement__lead {
  max-width: 32rem;
  font-size: var(--fs-subhead);
  line-height: var(--lh-snug);
  transition: opacity var(--duration-slow) var(--ease-standard) 300ms;
}

.statement__lead[data-inview='false'] {
  opacity: 0;
}

.parts {
  max-width: 44rem;
  border-top: 1px solid color-mix(in srgb, var(--on-accent) 32%, transparent);
}

.parts__row {
  display: grid;
  grid-template-columns: 2.25rem minmax(11rem, 15rem) minmax(0, 1fr);
  align-items: baseline;
  gap: var(--space-3) var(--space-4);
  padding-block: var(--space-4);
  border-bottom: 1px solid color-mix(in srgb, var(--on-accent) 32%, transparent);
  transition:
    clip-path var(--duration-reveal) var(--ease-out),
    opacity var(--duration-base) var(--ease-standard);
  transition-delay: calc(var(--i) * 110ms + 200ms);
}

.parts[data-inview='false'] .parts__row {
  clip-path: inset(0 100% 0 0);
  opacity: 0;
}

.parts__name {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 1.2rem + 1.2vw, 2.25rem);
  font-weight: 400;
  line-height: 1;
}

.parts__text {
  font-size: var(--fs-body);
  opacity: 0.9;
}

@media (max-width: 640px) {
  .parts__row {
    grid-template-columns: 2rem minmax(0, 1fr);
  }

  .parts__text {
    grid-column: 2;
  }
}

/* ---------- Story (environment follows the active step) ---------- */
.story {
  transition:
    background-color 700ms var(--ease-standard),
    color 700ms var(--ease-standard);
}

.story__inner {
  width: 100%;
  max-width: var(--wide-max);
  margin: 0 auto;
  padding: 0 var(--gutter);
}

.step {
  display: grid;
  gap: var(--space-4);
  align-content: center;
  padding: var(--section-y) 0;
  color: var(--text);
}

.step__label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--accent);
}

.step__index {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 300;
  letter-spacing: 0;
}

.step__title {
  font-family: var(--font-display);
  font-size: var(--fs-page-title);
  font-weight: 300;
  line-height: var(--lh-tight);
  letter-spacing: -0.03em;
}

.step__text {
  max-width: 30rem;
  font-size: var(--fs-subhead);
  line-height: var(--lh-snug);
  color: var(--text-secondary);
}

.step__points {
  display: grid;
  gap: var(--space-2);
  font-size: var(--fs-meta);
  font-weight: 500;
}

.step__points li {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.step__points li::before {
  content: '';
  width: 1.25rem;
  height: 1px;
  background: var(--accent);
}

.step__inline-demo {
  margin-top: var(--space-5);
}

.story__panel {
  display: none;
}

@media (min-width: 900px) {
  .story__inner {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
    gap: var(--space-8);
    align-items: start;
  }

  .step {
    min-height: 92vh;
  }

  .step__inline-demo {
    display: none;
  }

  .story__panel {
    position: sticky;
    top: 0;
    height: 100vh;
    display: grid;
    align-items: center;
    padding-block: var(--space-7);
  }

  .panel {
    grid-area: 1 / 1;
    max-height: calc(100vh - 6rem);
    overflow: hidden;
    opacity: 0;
    transform: translateY(16px);
    pointer-events: none;
    transition:
      opacity var(--duration-slow) var(--ease-standard),
      transform var(--duration-slow) var(--ease-out);
  }

  .panel.is-on {
    opacity: 1;
    transform: none;
    transition-delay: 120ms;
  }
}

/* ---------- Finale (ink) ---------- */
.finale__inner {
  width: 100%;
  max-width: var(--wide-max);
  margin: 0 auto;
  padding: calc(var(--section-y) * 1.2) var(--gutter) var(--section-y);
  display: grid;
  gap: var(--space-7);
}

.finale__title {
  font-family: var(--font-display);
  font-size: var(--fs-hero);
  font-weight: 300;
  line-height: var(--lh-tight);
  letter-spacing: -0.035em;
}

.finale__cta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3) var(--space-4);
  transition:
    opacity var(--duration-slow) var(--ease-standard) 500ms,
    transform var(--duration-slow) var(--ease-out) 500ms;
}

.finale__cta[data-inview='false'] {
  opacity: 0;
  transform: translateX(-16px);
}

.finale__sign {
  color: var(--ink-muted);
  padding-top: var(--space-5);
  border-top: 1px solid var(--ink-line);
}

@keyframes about-rule {
  from {
    transform: scaleX(0);
  }
}

@media (min-width: 900px) {
  .hero__inner {
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
    padding-top: var(--space-9);
  }

  .hero__art {
    justify-items: end;
  }
}

/* Scroll-driven parallax for the ghost numeral where the platform supports it */
@supports (animation-timeline: view()) {
  .statement__ghost {
    animation: ghost-drift linear both;
    animation-timeline: view();
    animation-range: entry 0% exit 100%;
  }

  @keyframes ghost-drift {
    from {
      transform: translateY(12%);
    }
    to {
      transform: translateY(-12%);
    }
  }
}
</style>
