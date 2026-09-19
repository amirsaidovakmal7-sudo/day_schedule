<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseIcon from '@/components/base/BaseIcon.vue'
import { useAuthStore } from '@/stores/auth'

defineProps<{ open?: boolean }>()
const emit = defineEmits<{ navigate: [] }>()

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const items = [
  { to: '/', label: 'Сегодня', names: ['home'] },
  { to: '/archive', label: 'Дни', names: ['archive', 'archive-day'] },
  { to: '/profile', label: 'Профиль', names: ['profile'] },
  { to: '/about', label: 'О приложении', names: ['about'] },
]

const activeIndex = computed(() => {
  const index = items.findIndex((item) => item.names.includes(String(route.name)))
  return index === -1 ? 0 : index
})

async function logout() {
  await authStore.logout()
  emit('navigate')
  router.push({ name: 'auth' })
}
</script>

<template>
  <nav class="nav" :class="{ 'is-open': open }" aria-label="Основная навигация">
    <RouterLink to="/" class="nav__brand" @click="emit('navigate')">
      <span class="nav__brand-main">Дневник</span>
      <span class="nav__brand-sub">дня</span>
    </RouterLink>

    <ul class="nav__list" :style="{ '--active': activeIndex }">
      <li v-for="(item, index) in items" :key="item.to" class="nav__row" :style="{ '--n': index }">
        <RouterLink
          :to="item.to"
          class="nav__link"
          :class="{ 'is-active': index === activeIndex }"
          :aria-current="index === activeIndex ? 'page' : undefined"
          @click="emit('navigate')"
        >
          <span class="label nav__index tnum">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="nav__label">{{ item.label }}</span>
        </RouterLink>
      </li>
      <li class="nav__indicator" aria-hidden="true" />
    </ul>

    <div class="nav__footer">
      <p class="label nav__user">{{ authStore.user?.username }}</p>
      <button type="button" class="nav__logout" @click="logout">
        <span class="nav__logout-label">Выйти</span>
        <BaseIcon :icon="ArrowUpRight" :size="16" />
      </button>
    </div>
  </nav>
</template>

<style scoped>
.nav {
  --row-h: 3.5rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: var(--space-6) var(--space-5) var(--space-5);
  color: var(--nav-text, var(--text));
}

.nav__brand {
  display: flex;
  flex-direction: column;
  font-family: var(--font-display);
  font-size: 1.75rem;
  line-height: 1;
  margin-bottom: var(--space-7);
  letter-spacing: -0.01em;
}

.nav__brand-main {
  font-weight: 400;
}

.nav__brand-sub {
  font-style: italic;
  font-weight: 300;
  color: var(--nav-accent, var(--accent));
  padding-left: 1.1em;
  transition: color var(--duration-slow) var(--ease-standard);
}

.nav__list {
  position: relative;
  flex: 1;
  align-content: start;
}

.nav__row {
  height: var(--row-h);
  --nav-enter: calc(120ms + var(--n) * 55ms);
}

.nav__link {
  height: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding-left: var(--space-4);
  color: var(--nav-muted, var(--text-secondary));
  transition: color var(--duration-base) var(--ease-standard);
}

.nav__index {
  width: 1.5rem;
  opacity: 0.75;
  transition: color var(--duration-base) var(--ease-standard);
}

.nav__label {
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 400;
  line-height: 1;
  white-space: nowrap;
  transition:
    transform var(--duration-base) var(--ease-out),
    color var(--duration-base) var(--ease-standard);
}

.nav__link:hover {
  color: var(--nav-text, var(--text));
}

.nav__link:hover .nav__label {
  transform: translateX(5px);
}

.nav__link:hover .nav__index {
  color: var(--nav-accent, var(--accent));
}

.nav__link.is-active {
  color: var(--nav-text, var(--text));
}

.nav__link.is-active .nav__label {
  font-style: italic;
  color: var(--nav-accent, var(--accent));
}

.nav__link.is-active .nav__index {
  color: var(--nav-accent, var(--accent));
}

/* One bar travels between items instead of each item toggling its own */
.nav__indicator {
  position: absolute;
  left: 0;
  top: 0;
  width: 2px;
  height: var(--row-h);
  background: var(--nav-accent, var(--accent));
  transform: translateY(calc(var(--active) * var(--row-h)));
  transition:
    transform var(--duration-slow) var(--ease-out),
    background-color var(--duration-slow) var(--ease-standard);
}

.nav__footer {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding-top: var(--space-4);
  border-top: 1px solid var(--nav-line, var(--border));
  transition: border-color var(--duration-slow) var(--ease-standard);
}

.nav__user {
  color: var(--nav-muted, var(--muted));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav__logout {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--tap-target-min);
  color: var(--nav-text, var(--text));
  font-size: var(--fs-meta);
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: color var(--duration-fast) var(--ease-standard);
}

.nav__logout :deep(svg) {
  transition: transform var(--duration-base) var(--ease-out);
}

.nav__logout:hover {
  color: var(--danger);
}

.nav__logout:hover :deep(svg) {
  transform: translate(3px, -3px);
}

/* Mobile drawer: links enter one after another */
@media (max-width: 1023px) {
  .nav {
    padding-top: var(--space-5);
  }

  .nav__brand {
    display: none;
  }

  .nav__link {
    padding-left: var(--space-5);
  }

  .nav__label {
    font-size: 1.875rem;
  }

  .nav.is-open .nav__row {
    animation: nav-row-in var(--duration-slow) var(--ease-out) both;
    animation-delay: var(--nav-enter);
  }
}

@keyframes nav-row-in {
  from {
    opacity: 0;
    transform: translateX(-16px);
  }
}
</style>
