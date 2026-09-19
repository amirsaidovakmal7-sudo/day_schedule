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
        eyebrow: 'Вход',
        title: 'С возвращением.',
        lead: 'Войдите, чтобы вернуться к своему дню.',
        action: 'Войти',
        switchLead: 'Ещё нет аккаунта?',
        switchAction: 'Создать',
      }
    : {
        eyebrow: 'Регистрация',
        title: 'Начнём с сегодняшнего дня.',
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

    <main class="auth__panel">
      <div class="auth__form-wrap">
        <p class="label auth__eyebrow" style="--i: 0">
          <span class="auth__rule" aria-hidden="true" />
          {{ copy.eyebrow }}
        </p>

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
              <template #icon><BaseIcon :icon="ArrowRight" :size="16" /></template>
            </BaseButton>
          </div>
        </form>

        <div class="auth__secondary" style="--i: 4">
          <p class="auth__switch">
            {{ copy.switchLead }}
            <button type="button" class="auth__switch-btn" @click="mode = mode === 'login' ? 'register' : 'login'">
              {{ copy.switchAction }}
            </button>
          </p>
          <RouterLink to="/about" class="auth__about">О приложении</RouterLink>
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
  max-width: 26rem;
  margin: 0 auto;
  display: grid;
  gap: var(--space-4);
}

.auth__eyebrow {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--accent);
}

.auth__rule {
  width: 2.5rem;
  height: 1px;
  background: currentColor;
  transform-origin: left;
  animation: auth-rule var(--duration-draw) var(--ease-out) 80ms both;
}

.auth__mask {
  display: block;
  overflow: hidden;
  padding-bottom: 0.14em;
  margin-bottom: -0.14em;
}

.auth__title {
  font-family: var(--font-display);
  font-size: clamp(2.125rem, 1.5rem + 2.2vw, 3.25rem);
  font-weight: 300;
  line-height: var(--lh-tight);
  letter-spacing: -0.03em;
  text-wrap: balance;
}

.auth__title-text {
  display: block;
  animation: auth-rise var(--duration-reveal) var(--ease-out) 60ms both;
}

.auth__lead {
  color: var(--text-secondary);
  font-size: var(--fs-subhead);
  line-height: var(--lh-snug);
  animation: auth-fade var(--duration-slow) var(--ease-standard) 220ms both;
}

.auth__form {
  display: grid;
  gap: var(--space-5);
  margin-top: var(--space-4);
}

.auth__field,
.auth__actions,
.auth__secondary {
  animation: auth-slide 460ms var(--ease-out) both;
  animation-delay: calc(140ms + var(--i) * 70ms);
}

.auth__error {
  padding: var(--space-3) var(--space-4);
  border-left: 2px solid var(--danger);
  background: var(--danger-soft);
  color: var(--danger);
  font-size: var(--fs-meta);
  font-weight: 500;
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
  transform: translateX(-10px);
}

.auth__secondary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-top: var(--space-2);
  font-size: var(--fs-meta);
  color: var(--text-secondary);
}

.auth__switch-btn,
.auth__about {
  min-height: var(--tap-target-min);
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  color: var(--text);
  background: linear-gradient(currentColor, currentColor) left calc(50% + 0.7em) / 100% 1px no-repeat;
  transition:
    background-size var(--duration-slow) var(--ease-out),
    color var(--duration-fast) var(--ease-standard);
}

.auth__switch-btn {
  margin-left: var(--space-1);
  color: var(--accent);
}

.auth__switch-btn:hover,
.auth__about:hover {
  background-size: 0 1px;
  background-position: right calc(50% + 0.7em);
}

@keyframes auth-rule {
  from {
    transform: scaleX(0);
  }
}

@keyframes auth-rise {
  from {
    transform: translateY(105%);
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
    grid-template-columns: minmax(0, 1.15fr) minmax(26rem, 0.85fr);
  }

  .auth__art {
    min-height: 100vh;
    justify-content: space-between;
    padding: var(--space-7) var(--space-8);
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
