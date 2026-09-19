# Как запустить серверы

Запускать нужно из **Windows PowerShell**, не из WSL/Linux-терминала. Приглашение должно выглядеть как `PS C:\Users\User>`.

## Терминал 1 — бэкенд (порт 8000)

```powershell
cd C:\Users\User\PycharmProjects\Rank_text
.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

## Терминал 2 — фронтенд (порт 5173)

```powershell
cd C:\Users\User\PycharmProjects\Rank_text\frontend
npm run dev
```

## Открыть

- Приложение: http://localhost:5173
- Swagger бэкенда: http://localhost:8000/docs

## Остановить

`Ctrl+C` в каждом терминале.

Если порт остался занятым (Vite иногда оставляет процесс):

```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5173 -State Listen).OwningProcess -Force
Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000 -State Listen).OwningProcess -Force
```

Если на порту никто не слушает, команда выдаст ошибку. Это нормально, порт уже свободен.

## Ошибка `sh: 1: vite: not found`

Это значит, что терминал работает в Linux-оболочке (WSL), а `node_modules` установлены под Windows. Сам Vite установлен правильно: `vite` и `vite.cmd` лежат в `node_modules\.bin`. PyCharm часто открывает новые вкладки Terminal именно в WSL.

**Решение 1 (рекомендуется): использовать Windows PowerShell.**

Открой отдельный PowerShell: `Win`, набери `PowerShell`, Enter. Затем:

```powershell
cd C:\Users\User\PycharmProjects\Rank_text\frontend
npm run dev
```

Чтобы терминал в PyCharm открывался в PowerShell: Settings → Tools → Terminal → в поле Shell path поставь `powershell.exe`.

**Решение 2: остаться в WSL и переустановить зависимости там.**

```bash
cd /mnt/c/Users/User/PycharmProjects/Rank_text/frontend
rm -rf node_modules
npm install
npm run dev
```

После этого `node_modules` будет работать только в Linux, а в PowerShell придётся снова делать `npm install`.

## Заметки

- Vite стартует около 12 секунд. В выводе сначала появятся строки `> day-diary-mini-app@0.1.0 dev` и `> vite`, потом `Local: http://localhost:5173/`.
- Порт в `frontend\.env` (`VITE_API_BASE_URL=http://localhost:8000`) должен совпадать с портом бэкенда. После правки `.env` фронтенд нужно перезапустить.
- Прокрутка вывода терминала вверх: колесо мыши или `Shift+PageUp`.

---

# Запуск в GitHub Codespaces (терминал VS Code)

Codespace работает на Linux, поэтому Windows-команды выше (`.venv\Scripts\...`, `PowerShell`) там не подходят. `.venv` и `node_modules` в репозиторий не попадают, их нужно создать заново. Убедись, что актуальный код запушен в репозиторий и в Codespace подтянут (`git pull`).

## Терминал 1 — бэкенд (порт 8000)

Из корня репозитория (там, где лежит `main.py`):

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

Виртуальное окружение и `pip install` нужны только в первый раз. В следующие разы хватит двух команд:

```bash
source .venv/bin/activate
python -m uvicorn main:app --reload --port 8000
```

Запускай из корня репозитория: файл базы `db.sqlite3` создаётся в текущей папке. База в Codespace новая, пользователей с компьютера там нет, зарегистрируйся заново.

## Терминал 2 — фронтенд (порт 5173)

```bash
cd frontend
echo "VITE_API_BASE_URL=https://${CODESPACE_NAME}-8000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}" > .env.local
npm install
npm run dev
```

Зачем `.env.local`: в `frontend/.env` записан `http://localhost:8000`, а в Codespace браузер открывает страницу по адресу вида `https://<имя>-5173.app.github.dev`, и `localhost` в нём указывает на твой компьютер, а не на Codespace. Файл `.env.local` перекрывает `.env` и не попадает в git (он в `.gitignore`). Команду с `echo` нужно выполнить один раз. После изменения `.env`/`.env.local` фронтенд надо перезапустить.

## Открыть

1. Внизу VS Code открой вкладку **Ports** (Порты).
2. Для порта **8000** нажми правой кнопкой → **Port Visibility** → **Public**. Без этого браузер получит редирект на вход в GitHub вместо ответа API, и приложение покажет «Не удалось загрузить сегодняшний день».
3. Для порта **5173** нажми на иконку глобуса (Open in Browser) или скопируй адрес из колонки Forwarded Address.

Видимость порта сбрасывается на Private после перезапуска Codespace, поэтому пункт 2 придётся повторять.

Swagger бэкенда: адрес порта 8000 + `/docs`.

## Если что-то не работает

- **`Blocked request. This host is not allowed`** в браузере: Vite не пускает адрес Codespaces. В `frontend/vite.config.ts` в блок `server` добавь строку `allowedHosts: true,` и перезапусти `npm run dev`.
- **«Не удалось загрузить сегодняшний день»**: проверь, что порт 8000 стоит в режиме Public и что `frontend/.env.local` создан. Проверить содержимое: `cat frontend/.env.local`, адрес должен оканчиваться на `-8000.app.github.dev`.
- **Остановить:** `Ctrl+C` в каждом терминале.
