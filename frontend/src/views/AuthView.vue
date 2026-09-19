<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AuthArt from '@/components/auth/AuthArt.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { useHaptics } from '@/composables/useHaptics'
import { useMainButton } from '@/composables/useTelegram'
import { useAuthStore } from '@/stores/auth'
import { statusOf, toFieldErrors, toUserMessage } from '@/utils/errors'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const haptics = useHaptics()

const mode = ref<'login' | 'register'>(route.query.mode === 'register' ? 'register' : 'login')
const username = ref('')
const password = ref('')
const errors = reactive({ username: '', password: '', form: '' })
const submitting = ref(false)

const copy = computed(() =>
  mode.value === 'login'
    ? {
        title: 'С возвращением.',
        lead: 'Войдите, чтобы вернуться к своему дню.',
        action: 'Войти',
        switchLead: 'Ещё нет аккаунта?',
        switchAction: 'Создать',
      }
    : {
        title: 'Начнём с сегодняшнего дня.',
        lead: 'Логин и пароль — больше ничего не нужно.',
        action: 'Создать аккаунт',
        switchLead: 'Уже есть аккаунт?',
        switchAction: 'Войти',
      },
)

function clearErrors() {
  errors.username = ''
  errors.password = ''
  errors.form = ''
}

watch(mode, clearErrors)

async function submit() {
  clearErrors()
  const name = username.value.trim()
  if (name.length < 3) errors.username = 'Минимум 3 символа'
  else if (name.length > 32) errors.username = 'Максимум 32 символа'
  if (password.value.length < 6) errors.password = 'Минимум 6 символов'
  if (errors.username || errors.password) {
    haptics.notify('error')
    return
  }

  submitting.value = true
  try {
    if (mode.value === 'login') await authStore.login(name, password.value)
    else await authStore.register(name, password.value)
    haptics.notify('success')
    router.push({ name: 'home' })
  } catch (e) {
    const fields = toFieldErrors(e)
    const status = statusOf(e)
    errors.username = fields.username ?? (status === 409 ? toUserMessage(e) : '')
    errors.password = fields.password ?? ''
    if (!errors.username && !errors.password) errors.form = toUserMessage(e)
    haptics.notify('error')
  } finally {
    submitting.value = false
  }
}

useMainButton({
  text: () => copy.value.action,
  onClick: submit,
  disabled: submitting,
})
</script>

<template>
  <div class="auth">
    <AuthArt :mode="mode" class="auth__art" />

    <main class="auth__panel env-plain">
      <div class="auth__form-wrap">
        <h1 :key="`t-${mode}`" class="auth__title">
          <span class="auth__mask"><span class="auth__title-text">{{ copy.title }}</span></span>
        </h1>
        <p :key="`l-${mode}`" class="auth__lead">{{ copy.lead }}</p>

        <form class="auth__form" novalidate @submit.prevent="submit">
          <div class="auth__field" style="--i: 1">
            <BaseInput
              v-model="username"
              label="Логин"
              autocomplete="username"
              autofocus
              :error="errors.username"
              :disabled="submitting"
              @update:model-value="errors.username = ''"
            />
          </div>
          <div class="auth__field" style="--i: 2">
            <BaseInput
              v-model="password"
              type="password"
              label="Пароль"
              :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
              :hint="mode === 'register' ? 'Не короче 6 символов' : undefined"
              :error="errors.password"
              :disabled="submitting"
              @update:model-value="errors.password = ''"
            />
          </div>

          <Transition name="form-error">
            <p v-if="errors.form" class="auth__error" role="alert">{{ errors.form }}</p>
          </Transition>

          <div class="auth__actions" style="--i: 3">
            <BaseButton type="submit" block :loading="submitting">
              {{ copy.action }}
              <template #icon><BaseIcon :icon="ArrowRight" :size="18" /></template>
            </BaseButton>
          </div>
        </form>

        <div class="auth__secondary" style="--i: 4">
          <p class="auth__switch">
            {{ copy.switchLead }}
            <button type="button" class="auth__link auth__link--accent" @click="mode = mode === 'login' ? 'register' : 'login'">
              {{ copy.switchAction }}
            </button>
          </p>
          <RouterLink to="/about" class="auth__link">О приложении</RouterLink>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.auth {
  flex: 1;
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
  background: var(--background);
}

.auth__panel {
  display: flex;
  align-items: flex-start;
  padding: var(--space-6) var(--gutter) var(--space-7);
}

.auth__form-wrap {
  width: 100%;
  max-width: 28rem;
  margin: 0 auto;
  display: grid;
  gap: var(--space-4);
}

.auth__mask {
  display: block;
  overflow: hidden;
  padding-bottom: 0.1em;
  margin-bottom: -0.1em;
}

.auth__title {
  font-family: var(--font-display);
  font-size: clamp(3rem, 2rem + 2.6vw, 4.5rem);
  font-weight: 800;
  line-height: var(--lh-display);
  letter-spacing: -0.005em;
  text-wrap: balance;
}

.auth__title-text {
  display: block;
  animation: auth-rise var(--duration-reveal) var(--ease-out) 60ms both;
}

.auth__lead {
  color: var(--fg-2);
  font-size: var(--fs-sub);
  line-height: var(--lh-snug);
  text-wrap: pretty;
  animation: auth-fade var(--duration-slow) var(--ease-standard) 200ms both;
}

.auth__form {
  display: grid;
  gap: var(--space-5);
  margin-top: var(--space-4);
}

.auth__field,
.auth__actions,
.auth__secondary {
  animation: auth-slide 420ms var(--ease-out) both;
  animation-delay: calc(120ms + var(--i) * 60ms);
}

.auth__error {
  padding: var(--space-3) var(--space-4);
  background: var(--danger-soft);
  color: var(--danger);
  font-size: var(--fs-meta);
  font-weight: 650;
}

.form-error-enter-active,
.form-error-leave-active {
  transition:
    opacity var(--duration-base) var(--ease-standard),
    transform var(--duration-slow) var(--ease-out);
}

.form-error-enter-from,
.form-error-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.auth__secondary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2) var(--space-4);
  margin-top: var(--space-2);
  font-size: var(--fs-meta);
  color: var(--fg-2);
}

.auth__link {
  min-height: var(--tap-target-min);
  display: inline-flex;
  align-items: center;
  font-weight: 700;
  color: var(--fg);
  background: linear-gradient(currentColor, currentColor) left calc(50% + 0.75em) / 100% 2px no-repeat;
  transition:
    background-size var(--duration-slow) var(--ease-out),
    color var(--duration-fast) var(--ease-standard);
}

.auth__link--accent {
  margin-left: var(--space-1);
  color: var(--hl);
}

.auth__link:hover {
  background-size: 0 2px;
  background-position: right calc(50% + 0.75em);
}

@keyframes auth-rise {
  from {
    transform: translateY(108%);
  }
}

@keyframes auth-fade {
  from {
    opacity: 0;
  }
}

@keyframes auth-slide {
  from {
    opacity: 0;
    transform: translateX(-14px);
  }
}

@media (min-width: 900px) {
  .auth {
    grid-template-rows: none;
    grid-template-columns: minmax(0, 1.25fr) minmax(28rem, 0.85fr);
  }

  .auth__panel {
    align-items: center;
    padding: var(--space-8);
  }

  .auth__form-wrap {
    margin: 0;
  }
}
</style>
