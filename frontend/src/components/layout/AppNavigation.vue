<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseIcon from '@/components/base/BaseIcon.vue'
import { useAuthStore } from '@/stores/auth'

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
  router.push({ name: 'auth' })
}
</script>

<template>
  <nav class="nav" aria-label="Основная навигация">
    <RouterLink to="/" class="nav__brand">
      <span>Дневник</span>
      <span class="nav__brand-sub">дня</span>
    </RouterLink>

    <ul class="nav__list" :style="{ '--active': activeIndex }">
      <li class="nav__marker" aria-hidden="true" />
      <li v-for="(item, index) in items" :key="item.to" class="nav__row" :style="{ '--n': index }">
        <RouterLink
          :to="item.to"
          class="nav__link"
          :class="{ 'is-active': index === activeIndex }"
          :aria-current="index === activeIndex ? 'page' : undefined"
        >
          <span class="nav__label">{{ item.label }}</span>
        </RouterLink>
      </li>
    </ul>

    <div class="nav__footer">
      <p class="nav__user">{{ authStore.user?.username }}</p>
      <button type="button" class="nav__logout" @click="logout">
        <span class="nav__logout-label">Выйти</span>
        <BaseIcon :icon="ArrowUpRight" :size="18" />
      </button>
    </div>
  </nav>
</template>

<style scoped>
/* Mobile first: a bottom tab bar with one marker that slides between four cells */
.nav {
  display: block;
}

.nav__brand,
.nav__footer {
  display: none;
}

.nav__list {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  height: var(--tabbar-height);
}

.nav__marker {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 25%;
  background: var(--nav-marker);
  transform: translateX(calc(var(--active) * 100%));
  transition:
    transform var(--duration-slow) var(--ease-out),
    background-color var(--duration-slow) var(--ease-standard);
}

.nav__row {
  position: relative;
  z-index: 1;
}

.nav__link {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--space-1);
  color: var(--nav-muted);
  text-align: center;
  transition: color var(--duration-base) var(--ease-standard);
}

.nav__label {
  font-family: var(--font-ui);
  font-size: 0.8125rem;
  font-weight: 650;
  letter-spacing: -0.005em;
  line-height: 1.1;
}

.nav__link:hover {
  color: var(--nav-fg);
}

.nav__link.is-active {
  color: var(--nav-on-marker);
}

.nav__link:focus-visible {
  outline-color: var(--nav-fg);
  outline-offset: -5px;
}

@media (max-width: 359px) {
  .nav__label {
    font-size: 0.6875rem;
  }
}

/* Desktop: a poster-style rail with big words and the same sliding marker */
@media (min-width: 1024px) {
  .nav {
    --row-h: 3.75rem;
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: var(--space-6) 0 var(--space-5);
  }

  .nav__brand {
    display: flex;
    flex-direction: column;
    padding: 0 var(--space-5);
    margin-bottom: var(--space-8);
    font-family: var(--font-display);
    font-size: 3rem;
    font-weight: 800;
    line-height: 0.86;
    letter-spacing: -0.005em;
  }

  .nav__brand-sub {
    color: var(--nav-muted);
    padding-left: 0.9em;
    transition: color var(--duration-slow) var(--ease-standard);
  }

  .nav__list {
    display: block;
    flex: 1;
    height: auto;
    align-content: start;
  }

  .nav__marker {
    width: 100%;
    height: var(--row-h);
    bottom: auto;
    transform: translateY(calc(var(--active) * var(--row-h)));
  }

  .nav__row {
    height: var(--row-h);
    animation: nav-in var(--duration-slow) var(--ease-out) both;
    animation-delay: calc(120ms + var(--n) * 60ms);
  }

  .nav__link {
    justify-content: flex-start;
    padding: 0 var(--space-5);
  }

  .nav__label {
    font-family: var(--font-display);
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0;
    white-space: nowrap;
    transition: transform var(--duration-base) var(--ease-out);
  }

  .nav__link:hover .nav__label {
    transform: translateX(8px);
  }

  .nav__link.is-active:hover .nav__label {
    transform: none;
  }

  .nav__footer {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    margin: 0 var(--space-5);
    padding-top: var(--space-4);
    border-top: var(--stroke) solid var(--nav-fg);
    transition: border-color var(--duration-slow) var(--ease-standard);
  }

  .nav__user {
    font-size: var(--fs-label);
    font-weight: 650;
    color: var(--nav-muted);
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
    color: var(--nav-fg);
    font-size: var(--fs-meta);
    font-weight: 650;
    transition: color var(--duration-fast) var(--ease-standard);
  }

  .nav__logout :deep(svg) {
    transition: transform var(--duration-base) var(--ease-out);
  }

  .nav__logout:hover :deep(svg) {
    transform: translate(3px, -3px);
  }

  .nav__link:focus-visible {
    outline-offset: -3px;
  }
}

@keyframes nav-in {
  from {
    opacity: 0;
    transform: translateX(-16px);
  }
}
</style>
