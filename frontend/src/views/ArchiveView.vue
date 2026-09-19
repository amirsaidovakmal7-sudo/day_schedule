<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import DayListItem from '@/components/archive/DayListItem.vue'
import BaseErrorState from '@/components/base/BaseErrorState.vue'
import BaseSkeleton from '@/components/base/BaseSkeleton.vue'
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
  <div class="archive">
    <div class="archive__inner">
      <PageHeader eyebrow="Архив" title="Дни" tone="secondary">
        <template v-if="total > 0">
          Сохранено {{ total }} {{ pluralize(total, ['день', 'дня', 'дней']) }}. Любой можно открыть и перечитать —
          изменить его уже нельзя.
        </template>
        <template v-else>Здесь собирается история ваших дней.</template>
      </PageHeader>

      <div v-if="archiveStore.status === 'loading' && total === 0" class="archive__loading" aria-busy="true">
        <BaseSkeleton height="5.25rem" />
        <BaseSkeleton height="5.25rem" />
        <BaseSkeleton height="5.25rem" />
      </div>

      <BaseErrorState v-else-if="archiveStore.status === 'error'" @retry="archiveStore.load()" />

      <p v-else-if="total === 0" class="archive__empty">
        Пока не сохранено ни одного дня. Сегодняшний окажется здесь, когда наступит завтра.
      </p>

      <div v-else class="archive__groups">
        <section v-for="group in groups" :key="group.key" v-inview class="group">
          <header class="group__head">
            <h2 class="group__title">{{ group.title }}</h2>
            <p class="label group__count tnum">{{ group.days.length }}</p>
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
  background: var(--background);
}

.archive__inner {
  width: 100%;
  max-width: 60rem;
  margin: 0 auto;
  padding: var(--space-8) var(--gutter) var(--space-9);
  display: grid;
  gap: var(--space-8);
}

.archive__loading {
  display: grid;
  gap: var(--space-3);
}

.archive__empty {
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--fs-section-title);
  line-height: var(--lh-tight);
  color: var(--muted);
  max-width: 22ch;
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
  border-bottom: 1px solid var(--border-strong);
  margin-bottom: var(--space-1);
}

.group__title {
  font-family: var(--font-display);
  font-size: var(--fs-section-title);
  font-weight: 400;
  text-transform: capitalize;
  color: var(--accent-secondary);
}

.group__count {
  color: var(--muted);
}

/* Rows wipe in one by one — a different motion family from the headings above */
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
    padding-block: var(--space-9);
  }
}
</style>
