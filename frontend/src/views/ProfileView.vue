<script setup lang="ts">
import { ArrowRight, ArrowUpRight, Check } from 'lucide-vue-next'
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import { vInview } from '@/composables/useInView'
import { useBackButton } from '@/composables/useTelegram'
import { useTheme } from '@/composables/useTheme'
import { useAuthStore } from '@/stores/auth'
import type { ThemePreference } from '@/stores/ui'
import { useUiStore } from '@/stores/ui'
import { statusOf, toFieldErrors, toUserMessage } from '@/utils/errors'

const authStore = useAuthStore()
const uiStore = useUiStore()
const { preference, setPreference } = useTheme()
const router = useRouter()

useBackButton(() => router.push({ name: 'home' }))

const THEMES: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Как в системе' },
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' },
]
const themeIndex = computed(() => THEMES.findIndex((t) => t.value === preference.value))

// --- username ---
const username = ref(authStore.user?.username ?? '')
const usernameError = ref('')
const usernameBusy = ref(false)
const usernameSaved = ref(false)

async function saveUsername() {
  const value = username.value.trim()
  usernameSaved.value = false
  if (value.length < 3) {
    usernameError.value = 'Минимум 3 символа'
    return
  }
  if (value === authStore.user?.username) {
    usernameError.value = 'Это ваш текущий логин'
    return
  }
  usernameBusy.value = true
  usernameError.value = ''
  try {
    await authStore.changeUsername(value)
    username.value = value
    usernameSaved.value = true
  } catch (e) {
    usernameError.value = toFieldErrors(e).username ?? toUserMessage(e)
  } finally {
    usernameBusy.value = false
  }
}

function onUsernameInput() {
  usernameSaved.value = false
  usernameError.value = ''
}

// --- password ---
const passwords = reactive({ old: '', next: '' })
const passwordErrors = reactive({ old: '', next: '' })
const passwordBusy = ref(false)
const passwordSaved = ref(false)

function onPasswordInput(field: 'old' | 'next') {
  passwordSaved.value = false
  passwordErrors[field] = ''
}

async function savePassword() {
  passwordSaved.value = false
  passwordErrors.old = passwords.old ? '' : 'Введите текущий пароль'
  passwordErrors.next = passwords.next.length >= 6 ? '' : 'Минимум 6 символов'
  if (passwordErrors.old || passwordErrors.next) return

  passwordBusy.value = true
  try {
    await authStore.changePassword(passwords.old, passwords.next)
    passwords.old = ''
    passwords.next = ''
    passwordSaved.value = true
  } catch (e) {
    const fields = toFieldErrors(e)
    passwordErrors.old = fields.old_password ?? (statusOf(e) === 400 ? toUserMessage(e) : '')
    passwordErrors.next = fields.new_password ?? ''
    if (!passwordErrors.old && !passwordErrors.next) uiStore.showToast(toUserMessage(e), 'danger')
  } finally {
    passwordBusy.value = false
  }
}

// --- sign out ---
const signingOut = ref(false)

async function signOut() {
  signingOut.value = true
  try {
    await authStore.logout()
  } finally {
    signingOut.value = false
    router.push({ name: 'auth' })
  }
}
</script>

<template>
  <div class="profile env-plain">
    <div class="profile__inner">
      <PageHeader title="Профиль">
        Вы вошли как <strong class="profile__name">{{ authStore.user?.username }}</strong>
      </PageHeader>

      <section v-inview class="block">
        <span class="block__rule" aria-hidden="true" />
        <header class="block__head">
          <h2 class="block__title">Оформление</h2>
          <p class="block__hint">Тема применяется сразу и запоминается на этом устройстве.</p>
        </header>
        <div class="block__body">
          <div class="themes" role="radiogroup" aria-label="Тема оформления" :style="{ '--index': themeIndex }">
            <span class="themes__thumb" aria-hidden="true" />
            <button
              v-for="theme in THEMES"
              :key="theme.value"
              type="button"
              role="radio"
              class="themes__option"
              :class="{ 'is-active': preference === theme.value }"
              :aria-checked="preference === theme.value"
              @click="setPreference(theme.value)"
            >
              {{ theme.label }}
            </button>
          </div>
        </div>
      </section>

      <section v-inview class="block">
        <span class="block__rule" aria-hidden="true" />
        <header class="block__head">
          <h2 class="block__title">Логин</h2>
          <p class="block__hint">Под ним вы входите в приложение.</p>
        </header>
        <form class="block__body form" novalidate @submit.prevent="saveUsername">
          <BaseInput
            v-model="username"
            label="Логин"
            autocomplete="username"
            :error="usernameError"
            @update:model-value="onUsernameInput"
          />
          <div class="form__footer">
            <Transition name="saved">
              <span v-if="usernameSaved" class="saved"><BaseIcon :icon="Check" :size="18" /> Сохранено</span>
            </Transition>
            <BaseButton type="submit" variant="secondary" :loading="usernameBusy">
              Сохранить
              <template #icon><BaseIcon :icon="ArrowRight" :size="18" /></template>
            </BaseButton>
          </div>
        </form>
      </section>

      <section v-inview class="block">
        <span class="block__rule" aria-hidden="true" />
        <header class="block__head">
          <h2 class="block__title">Пароль</h2>
          <p class="block__hint">Пароль нигде не показывается — только меняется.</p>
        </header>
        <form class="block__body form" novalidate @submit.prevent="savePassword">
          <BaseInput
            v-model="passwords.old"
            type="password"
            label="Текущий пароль"
            autocomplete="current-password"
            :error="passwordErrors.old"
            @update:model-value="onPasswordInput('old')"
          />
          <BaseInput
            v-model="passwords.next"
            type="password"
            label="Новый пароль"
            autocomplete="new-password"
            :error="passwordErrors.next"
            @update:model-value="onPasswordInput('next')"
          />
          <div class="form__footer">
            <Transition name="saved">
              <span v-if="passwordSaved" class="saved"><BaseIcon :icon="Check" :size="18" /> Пароль обновлён</span>
            </Transition>
            <BaseButton type="submit" variant="secondary" :loading="passwordBusy">
              Сменить пароль
              <template #icon><BaseIcon :icon="ArrowRight" :size="18" /></template>
            </BaseButton>
          </div>
        </form>
      </section>

      <section v-inview class="block">
        <span class="block__rule" aria-hidden="true" />
        <header class="block__head">
          <h2 class="block__title">Выход</h2>
          <p class="block__hint">Вы выйдете из аккаунта на этом устройстве. Данные останутся на сервере.</p>
        </header>
        <div class="block__body">
          <BaseButton variant="danger" :loading="signingOut" @click="signOut">
            Выйти из аккаунта
            <template #icon><BaseIcon :icon="ArrowUpRight" :size="18" /></template>
          </BaseButton>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.profile {
  flex: 1;
}

.profile__inner {
  width: 100%;
  max-width: 62rem;
  margin: 0 auto;
  padding: var(--space-7) var(--gutter) var(--space-9);
  display: grid;
  gap: var(--space-8);
}

.profile__name {
  font-weight: 750;
  color: var(--fg);
}

.block {
  position: relative;
  display: grid;
  gap: var(--space-5) var(--space-7);
  padding-top: var(--space-6);
}

.block__rule {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: var(--stroke);
  background: var(--rule-strong);
  transform-origin: left;
  transition: transform var(--duration-draw) var(--ease-out);
}

.block[data-inview='false'] .block__rule {
  transform: scaleX(0);
}

.block__title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 2rem + 2vw, 3.5rem);
  font-weight: 800;
  line-height: var(--lh-display);
  margin-bottom: var(--space-3);
}

.block__hint {
  font-size: var(--fs-meta);
  color: var(--fg-muted);
  max-width: 30ch;
}

.form {
  display: grid;
  gap: var(--space-5);
  max-width: 28rem;
}

.form__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-4);
  min-height: 3rem;
}

.saved {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--fs-meta);
  font-weight: 700;
  color: var(--success);
}

.saved-enter-active,
.saved-leave-active {
  transition:
    opacity var(--duration-base) var(--ease-standard),
    transform var(--duration-slow) var(--ease-out);
}

.saved-enter-from,
.saved-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

/* Segmented control: one marker slides between the options */
.themes {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  max-width: 28rem;
  border: var(--stroke) solid var(--fg);
}

.themes__thumb {
  position: absolute;
  inset: 0 auto 0 0;
  width: calc(100% / 3);
  background: var(--fill);
  transform: translateX(calc(var(--index) * 100%));
  transition: transform var(--duration-slow) var(--ease-out);
}

.themes__option {
  position: relative;
  min-height: 3.25rem;
  padding: 0 var(--space-2);
  font-size: var(--fs-meta);
  font-weight: 650;
  color: var(--fg-2);
  transition: color var(--duration-base) var(--ease-standard);
}

.themes__option:hover {
  color: var(--fg);
}

.themes__option.is-active {
  color: var(--on-fill);
}

@media (min-width: 900px) {
  .block {
    grid-template-columns: minmax(12rem, 1fr) minmax(0, 2fr);
  }
}
</style>
