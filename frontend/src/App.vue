<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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

// A thin line runs across the top edge on every route change
const lineKey = ref(0)
watch(
  () => route.path,
  () => (lineKey.value += 1),
)
</script>

<template>
  <div class="shell" :class="{ 'is-authed': showChrome }" :data-phase="uiStore.scenePhase">
    <span v-if="lineKey > 0" :key="lineKey" class="route-line" aria-hidden="true" />

    <aside v-if="showChrome" class="shell__nav">
      <AppNavigation />
    </aside>

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
  --nav-bg: var(--surface);
  --nav-fg: var(--text);
  --nav-muted: var(--text-secondary);
  --nav-marker: var(--accent);
  --nav-on-marker: var(--on-accent);

  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* The navigation takes on the colour of whatever environment is centred on screen */
.shell[data-phase='field'] {
  --nav-bg: var(--accent);
  --nav-fg: var(--ink);
  --nav-muted: rgba(13, 14, 18, 0.8);
  --nav-marker: var(--ink);
  --nav-on-marker: var(--paper);
}

.shell[data-phase='board'] {
  --nav-bg: var(--inverse-bg);
  --nav-fg: var(--inverse-text);
  --nav-muted: var(--inverse-muted);
  --nav-marker: var(--inverse-time);
  --nav-on-marker: var(--inverse-bg);
}

.shell__nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  background: var(--nav-bg);
  color: var(--nav-fg);
  border-top: var(--stroke) solid var(--nav-fg);
  padding-bottom: var(--safe-bottom);
  transition:
    background-color var(--duration-slow) var(--ease-standard),
    color var(--duration-slow) var(--ease-standard),
    border-color var(--duration-slow) var(--ease-standard);
}

.shell__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.shell.is-authed .shell__content {
  padding-bottom: calc(var(--tabbar-height) + var(--safe-bottom));
}

@media (min-width: 1024px) {
  .shell.is-authed {
    flex-direction: row;
  }

  .shell__nav {
    position: sticky;
    top: 0;
    left: auto;
    right: auto;
    bottom: auto;
    height: 100vh;
    width: var(--rail-width);
    flex-shrink: 0;
    border-top: none;
    border-right: var(--stroke) solid var(--nav-fg);
    padding-bottom: 0;
  }

  .shell.is-authed .shell__content {
    padding-bottom: 0;
  }
}

.route-line {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  z-index: 90;
  background: var(--nav-fg);
  transform-origin: left;
  pointer-events: none;
  animation: route-run 520ms var(--ease-out) both;
}

@keyframes route-run {
  0% {
    transform: scaleX(0);
    opacity: 1;
  }
  70% {
    transform: scaleX(1);
    opacity: 1;
  }
  100% {
    transform: scaleX(1);
    opacity: 0;
  }
}

/* One navigation language: deeper enters from below-right, shallower from above-left, same level crossfades */
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
  transform: translate(24px, 12px);
}

.page-back-enter-from {
  opacity: 0;
  transform: translate(-24px, -12px);
}

.page-forward-leave-to,
.page-back-leave-to {
  opacity: 0;
}
</style>
