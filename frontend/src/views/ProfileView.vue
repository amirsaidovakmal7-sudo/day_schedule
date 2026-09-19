<script setup lang="ts">
import { ArrowRight, Check } from 'lucide-vue-next'
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import { useBackButton } from '@/composables/useTelegram'
import { useTheme } from '@/composables/useTheme'
import { useAuthStore } from '@/stores/auth'
import type { ThemePreference } from '@/stores/ui'
import { statusOf, toFieldErrors, toUserMessage } from '@/utils/errors'
import { useUiStore } from '@/stores/ui'

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
</script>

<template>
  <div class="profile">
    <div class="profile__inner">
      <PageHeader eyebrow="Аккаунт" title="Профиль">
        Вы вошли как <em class="profile__name">{{ authStore.user?.username }}</em>
      </PageHeader>

      <section class="block">
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

      <section class="block">
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
              <span v-if="usernameSaved" class="saved"><BaseIcon :icon="Check" :size="16" /> Сохранено</span>
            </Transition>
            <BaseButton type="submit" variant="secondary" :loading="usernameBusy">
              Сохранить
              <template #icon><BaseIcon :icon="ArrowRight" :size="16" /></template>
            </BaseButton>
          </div>
        </form>
      </section>

      <section class="block">
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
              <span v-if="passwordSaved" class="saved"><BaseIcon :icon="Check" :size="16" /> Пароль обновлён</span>
            </Transition>
            <BaseButton type="submit" variant="secondary" :loading="passwordBusy">
              Сменить пароль
              <template #icon><BaseIcon :icon="ArrowRight" :size="16" /></template>
            </BaseButton>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<style scoped>
.profile {
  flex: 1;
  background: var(--background);
}

.profile__inner {
  width: 100%;
  max-width: 62rem;
  margin: 0 auto;
  padding: var(--space-8) var(--gutter) var(--space-9);
  display: grid;
  gap: var(--space-8);
}

.profile__name {
  font-family: var(--font-display);
  font-style: italic;
  color: var(--text);
}

.block {
  display: grid;
  gap: var(--space-5) var(--space-7);
  padding-top: var(--space-6);
  border-top: 1px solid var(--border-strong);
}

.block__title {
  font-family: var(--font-display);
  font-size: var(--fs-section-title);
  font-weight: 400;
  line-height: var(--lh-tight);
  margin-bottom: var(--space-2);
}

.block__hint {
  font-size: var(--fs-meta);
  color: var(--muted);
  max-width: 28ch;
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
  min-height: var(--tap-target-min);
}

.saved {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--fs-meta);
  font-weight: 600;
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

/* Segmented control: one thumb slides between options */
.themes {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  max-width: 28rem;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
}

.themes__thumb {
  position: absolute;
  inset: 3px auto 3px 3px;
  width: calc((100% - 6px) / 3);
  background: var(--text);
  border-radius: calc(var(--radius-md) - 2px);
  transform: translateX(calc(var(--index) * 100%));
  transition: transform var(--duration-slow) var(--ease-out);
}

.themes__option {
  position: relative;
  min-height: var(--tap-target-min);
  font-size: var(--fs-meta);
  font-weight: 600;
  color: var(--text-secondary);
  transition: color var(--duration-base) var(--ease-standard);
}

.themes__option.is-active {
  color: var(--background);
}

@media (min-width: 900px) {
  .block {
    grid-template-columns: minmax(12rem, 1fr) minmax(0, 2fr);
  }
}
</style>
