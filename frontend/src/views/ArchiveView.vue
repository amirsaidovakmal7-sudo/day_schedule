<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import DayListItem from '@/components/archive/DayListItem.vue'
import BaseErrorState from '@/components/base/BaseErrorState.vue'
import BaseSkeleton from '@/components/base/BaseSkeleton.vue'
import OdometerNumber from '@/components/base/OdometerNumber.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import { vInview } from '@/composables/useInView'
import { useBackButton } from '@/composables/useTelegram'
import { useArchiveStore } from '@/stores/archive'
import type { DaySummary } from '@/types/api'
import { formatMonthYear, monthKey, pluralize } from '@/utils/date'

const archiveStore = useArchiveStore()
const router = useRouter()

useBackButton(() => router.push({ name: 'home' }))

onMounted(() => {
  archiveStore.load().catch(() => {})
})

const groups = computed(() => {
  const result: { key: string; title: string; days: DaySummary[] }[] = []
  for (const day of archiveStore.days) {
    const key = monthKey(day.date)
    let group = result[result.length - 1]
    if (!group || group.key !== key) {
      group = { key, title: formatMonthYear(day.date), days: [] }
      result.push(group)
    }
    group.days.push(day)
  }
  return result
})

const total = computed(() => archiveStore.days.length)
</script>

<template>
  <div class="archive env-plain">
    <div class="archive__inner">
      <PageHeader title="Дни">
        <template v-if="total > 0">
          Сохранено {{ total }} {{ pluralize(total, ['день', 'дня', 'дней']) }}. Любой можно открыть и перечитать —
          изменить его уже нельзя.
        </template>
        <template v-else>Здесь собирается история ваших дней.</template>
        <template v-if="total > 0" #extra>
          <p class="archive__total tnum" aria-hidden="true"><OdometerNumber :value="total" /></p>
        </template>
      </PageHeader>

      <div v-if="archiveStore.status === 'loading' && total === 0" class="archive__loading" aria-busy="true">
        <BaseSkeleton height="6rem" />
        <BaseSkeleton height="6rem" />
        <BaseSkeleton height="6rem" />
      </div>

      <BaseErrorState v-else-if="archiveStore.status === 'error'" @retry="archiveStore.load()" />

      <p v-else-if="total === 0" class="archive__empty">
        Пока не сохранено ни одного дня. Сегодняшний окажется здесь, когда наступит завтра.
      </p>

      <div v-else class="archive__groups">
        <section v-for="group in groups" :key="group.key" v-inview class="group">
          <header class="group__head">
            <h2 class="group__title">{{ group.title }}</h2>
            <p class="group__count tnum">{{ group.days.length }}</p>
          </header>
          <ul class="group__list">
            <li v-for="(day, i) in group.days" :key="day.id" class="group__item" :style="{ '--i': i }">
              <DayListItem :day="day" />
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.archive {
  flex: 1;
}

.archive__inner {
  width: 100%;
  max-width: 62rem;
  margin: 0 auto;
  padding: var(--space-7) var(--gutter) var(--space-9);
  display: grid;
  gap: var(--space-8);
}

.archive__total {
  font-family: var(--font-display);
  font-size: clamp(6rem, 3rem + 9vw, 12rem);
  font-weight: 900;
  line-height: 0.8;
  color: var(--time);
  --od-cell: 0.8em;
}

.archive__loading {
  display: grid;
  gap: var(--space-3);
}

.archive__empty {
  font-family: var(--font-display);
  font-size: var(--fs-section);
  font-weight: 700;
  line-height: var(--lh-tight);
  color: var(--fg-muted);
  max-width: 16ch;
}

.archive__groups {
  display: grid;
  gap: var(--space-8);
}

.group__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: var(--stroke) solid var(--rule-strong);
}

.group__title {
  font-family: var(--font-display);
  font-size: var(--fs-section);
  font-weight: 800;
  line-height: var(--lh-display);
  text-transform: capitalize;
  color: var(--time);
}

.group__count {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
  color: var(--fg-muted);
}

/* Rows wipe in one by one — a different family from the heading above */
.group__item {
  animation: row-wipe var(--duration-reveal) var(--ease-out) both;
  animation-delay: calc(var(--i) * 70ms);
}

.group[data-inview='false'] .group__item {
  animation-play-state: paused;
}

@keyframes row-wipe {
  from {
    clip-path: inset(0 0 100% 0);
    transform: translateY(-6px);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}

@media (min-width: 1024px) {
  .archive__inner {
    padding-block: var(--space-8) var(--space-9);
  }
}
</style>
