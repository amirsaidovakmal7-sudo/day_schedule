<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import BaseToast from '@/components/base/BaseToast.vue'
import AppNavigation from '@/components/layout/AppNavigation.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const route = useRoute()
const uiStore = useUiStore()
const authStore = useAuthStore()

const showChrome = computed(() => authStore.isAuthenticated && route.name !== 'auth')
const transitionName = computed(() => (showChrome.value ? uiStore.pageTransition : 'page-fade'))

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && uiStore.navOpen) uiStore.closeNav()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

watch(
  () => route.path,
  () => uiStore.closeNav(),
)

watch(
  () => uiStore.navOpen,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
  },
)
</script>

<template>
  <div class="shell" :class="{ 'is-authed': showChrome }" :data-phase="uiStore.scenePhase">
    <template v-if="showChrome">
      <header class="shell__topbar">
        <button
          type="button"
          class="menu-btn"
          :class="{ 'is-open': uiStore.navOpen }"
          :aria-label="uiStore.navOpen ? 'Закрыть меню' : 'Открыть меню'"
          :aria-expanded="uiStore.navOpen"
          aria-controls="app-nav"
          @click="uiStore.toggleNav()"
        >
          <span class="menu-btn__bar" />
          <span class="menu-btn__bar" />
        </button>
        <span class="shell__topbar-title">Дневник дня</span>
      </header>

      <Transition name="backdrop">
        <div v-if="uiStore.navOpen" class="shell__backdrop" @click="uiStore.closeNav()" />
      </Transition>

      <aside id="app-nav" class="shell__nav" :class="{ 'is-open': uiStore.navOpen }">
        <AppNavigation :open="uiStore.navOpen" @navigate="uiStore.closeNav()" />
      </aside>
    </template>

    <main class="shell__content">
      <RouterView v-slot="{ Component, route: activeRoute }">
        <Transition :name="transitionName" mode="out-in">
          <component :is="Component" :key="activeRoute.path" />
        </Transition>
      </RouterView>
    </main>
  </div>

  <BaseToast />
</template>

<style>
.shell {
  --top-bg: var(--background);
  --top-text: var(--text);
  --top-line: var(--border);

  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* The chrome follows whichever colour environment is centred on screen */
.shell[data-phase='ink'] {
  --top-bg: var(--ink);
  --top-text: var(--ink-text);
  --top-line: var(--ink-line);
}

.shell[data-phase='accent'] {
  --top-bg: var(--accent);
  --top-text: var(--on-accent);
  --top-line: color-mix(in srgb, var(--on-accent) 24%, transparent);
}

.shell__topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  height: calc(var(--topbar-height) + var(--safe-top));
  padding: var(--safe-top) var(--gutter) 0 calc(var(--gutter) - 0.75rem);
  background: var(--top-bg);
  color: var(--top-text);
  border-bottom: 1px solid var(--top-line);
  transition:
    background-color var(--duration-slow) var(--ease-standard),
    color var(--duration-slow) var(--ease-standard),
    border-color var(--duration-slow) var(--ease-standard);
}

.shell__topbar-title {
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--fs-subhead);
  font-weight: 400;
}

/* Two bars that cross into an X */
.menu-btn {
  position: relative;
  width: var(--tap-target-min);
  height: var(--tap-target-min);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.menu-btn__bar {
  display: block;
  width: 22px;
  height: 1.5px;
  background: currentColor;
  transition:
    transform var(--duration-slow) var(--ease-out),
    width var(--duration-base) var(--ease-out);
}

.menu-btn:hover .menu-btn__bar:last-child {
  width: 14px;
}

.menu-btn.is-open .menu-btn__bar:first-child {
  transform: translateY(3.75px) rotate(45deg);
}

.menu-btn.is-open .menu-btn__bar:last-child {
  width: 22px;
  transform: translateY(-3.75px) rotate(-45deg);
}

.shell__backdrop {
  position: fixed;
  inset: calc(var(--topbar-height) + var(--safe-top)) 0 0 0;
  background: var(--overlay);
  z-index: 45;
}

.shell__nav {
  --nav-text: var(--text);
  --nav-muted: var(--text-secondary);
  --nav-line: var(--border);
  --nav-accent: var(--accent);

  position: fixed;
  top: calc(var(--topbar-height) + var(--safe-top));
  left: 0;
  bottom: 0;
  width: min(86vw, 22rem);
  background: var(--surface);
  border-right: 1px solid var(--border);
  transform: translateX(-100%);
  transition: transform var(--duration-slow) var(--ease-out);
  z-index: 50;
  overflow-y: auto;
}

.shell__nav.is-open {
  transform: translateX(0);
  box-shadow: var(--shadow-overlay);
}

.shell__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

@media (min-width: 1024px) {
  .shell.is-authed {
    flex-direction: row;
  }

  .shell__topbar,
  .shell__backdrop {
    display: none;
  }

  .shell__nav {
    position: sticky;
    top: 0;
    height: 100vh;
    width: var(--rail-width);
    flex-shrink: 0;
    transform: none;
    box-shadow: none;
    background: var(--nav-bg, var(--surface));
    border-right-color: var(--nav-line);
    transition:
      background-color var(--duration-slow) var(--ease-standard),
      border-color var(--duration-slow) var(--ease-standard);
  }

  .shell.is-authed[data-phase='paper'] .shell__nav {
    --nav-bg: var(--surface);
  }

  .shell[data-phase='ink'] .shell__nav {
    --nav-bg: var(--ink);
    --nav-text: var(--ink-text);
    --nav-muted: var(--ink-muted);
    --nav-line: var(--ink-line);
    --nav-accent: var(--ink-accent);
  }

  .shell[data-phase='accent'] .shell__nav {
    --nav-bg: var(--accent);
    --nav-text: var(--on-accent);
    --nav-muted: color-mix(in srgb, var(--on-accent) 72%, transparent);
    --nav-line: color-mix(in srgb, var(--on-accent) 26%, transparent);
    --nav-accent: var(--on-accent);
  }
}

.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity var(--duration-base) var(--ease-standard);
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* One navigation language: deeper enters from the right, shallower from the left */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity var(--duration-fast) linear;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

.page-forward-leave-active,
.page-back-leave-active {
  transition: opacity 90ms linear;
}

.page-forward-enter-active,
.page-back-enter-active {
  transition:
    opacity var(--duration-base) var(--ease-out),
    transform var(--duration-slow) var(--ease-out);
}

.page-forward-enter-from {
  opacity: 0;
  transform: translateX(28px);
}

.page-back-enter-from {
  opacity: 0;
  transform: translateX(-28px);
}

.page-forward-leave-to,
.page-back-leave-to {
  opacity: 0;
}
</style>
