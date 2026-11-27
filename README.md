# Barcard

Barcard - интерактивное диджитал меню с обучением персонала. Проект рассчитан на бары и рестораны, где сотрудники могут учить состав коктейлей по меню в игровом формата, а посетители могут скоротать время в ожидании своих блюд и дозаказать собранный коктейль.

## Возможности

- просмотр карточек коктейлей с составом и рецептом;
- игровой выбор ингредиентов коктейля;
- последовательное воспроизведение рецепта с учётом объёма ингредиентов;
- начисление очков и рейтинг игроков;
- три уровня сложности: лёгкий, средний и сложный;
- отдельные сценарии для посетителя и бармена;
- backend для пользователей, коктейлей, игровых данных и рейтингов;
- подбор коктейлей по результатам оценки состояния пользователя;
- фильтрация рекомендаций по алкогольным предпочтениям и ингредиентам-аллергенам.

## Архитектура

Репозиторий разделён на три основных сервиса.

- **Frontend** - React-приложение, собираемое Vite.
- **Backend** - Node.js и Express. Сервис работает с PostgreSQL, предоставляет API приложения и обращается к ML-сервису.
- **ML-service** - Python-сервис на FastAPI. Он принимает три числовых показателя состояния пользователя и возвращает кластер, интерпретированное состояние и подходящие вкусовые профили.

Инфраструктура запускается через Docker Compose.

## ML-рекомендации

ML-сервис расположен в `ml-service/`. Модель обучается скриптом `train_model.py` на `data.csv`.

Текущая реализация использует:

- `StandardScaler` для масштабирования признаков;
- `KMeans` с пятью кластерами для группировки состояний;
- `RandomForestClassifier` для определения кластера по трём признакам;
- словари `cluster_profiles` и `state_to_tastes` для интерпретации результата.

Входные признаки:

- `wellbeing` - самочувствие;
- `activity` - активность;
- `mood` - настроение.

Возможные состояния - `positive`, `negative`, `fatigue`, `anxiety` и `mixed`. Вкусовые профили представлены значениями `sweet`, `umami`, `salty`, `sour` и `bitter`.

### API ML-сервиса

`POST /predict`

Пример запроса:

```json
{
  "wellbeing": 6,
  "activity": 5,
  "mood": 6
}
```

Пример структуры ответа:

```json
{
  "cluster": 2,
  "state": "positive",
  "tastes": ["sweet", "umami"]
}
```

В backend дополнительно реализована фильтрация коктейлей по `alcoholPreference` и списку идентификаторов аллергенов. Фильтрация выполняется после получения набора коктейлей и исключает напитки, которые не соответствуют ограничениям.

## Структура проекта

```text
.
├── backend/          # Node.js + Express API, модели, маршруты и тесты
├── docker/            # Dockerfile для frontend, backend и ML-сервиса
├── ml-service/       # FastAPI, обучение и сохранённые модели
├── public/            # статические ресурсы
├── src/               # React frontend
├── tests/             # frontend и e2e-тесты
├── docker-compose.yml
├── Makefile
└── package.json
```

## Запуск через Docker Compose

### Требования

- Docker и Docker Compose;
- файл `backend/.env`;
- переменные `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` и `PORT`.

Запустите все сервисы из корня проекта:

```bash
docker compose up --build
```

После запуска:

- frontend доступен на порту `80`;
- backend публикуется на порту, указанном в `PORT`;
- PostgreSQL доступен с хоста на порту `5433`;
- ML-сервис доступен backend внутри Docker-сети на порту `8000`.

Для остановки:

```bash
docker compose down
```

## Локальная разработка

Frontend:

```bash
npm install
npm run dev
```

Полезные команды frontend:

```bash
npm run build
npm run lint
npm test
npm run test:e2e
```

Backend:

```bash
cd backend
npm install
npm run dev
```

Синхронизация базы данных выполняется командой:

```bash
npm run db:sync
```

ML-сервис локально:

```bash
cd ml-service
pip install -r requirements.txt
python train_model.py
uvicorn app:app --reload --port 8000
```

Команда обучения создаёт файлы моделей `rf_model.pkl`, `scaler.pkl`, `kmeans.pkl`, `cluster_profiles.pkl` и `state_to_tastes.pkl`.

Сборка всех компонентов одной командой:

make run

## Тестирование

Для frontend используются Vitest и Playwright. Для backend настроены Vitest, Supertest и покрытие кода.

```bash
npm test
npm run test:coverage
npm run test:e2e
```
