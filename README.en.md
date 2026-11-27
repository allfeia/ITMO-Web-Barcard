# Barcard

[Русский](README.md) · [English](README.en.md)

Barcard is an interactive digital menu with staff training. It is designed for bars and restaurants where employees can learn cocktail ingredients through a game, while guests can spend time waiting for their order and order a prepared cocktail.

## Features

- cocktail cards with ingredients and recipes;
- game-based ingredient selection;
- step-by-step recipe reconstruction with ingredient quantities;
- points and player rankings;
- three difficulty levels: easy, medium, and hard;
- separate guest and bartender scenarios;
- backend for users, cocktails, game data, and rankings;
- cocktail recommendations based on the user's current state assessment;
- recommendation filtering by alcohol preference and allergen ingredient IDs.

## Architecture

The repository contains three main services.

- **Frontend** — a React application built with Vite.
- **Backend** — Node.js and Express. It uses PostgreSQL, provides the application API, and communicates with the ML service.
- **ML service** — a Python FastAPI service. It accepts three numeric state indicators and returns a cluster, an interpreted state, and suitable taste profiles.

The infrastructure is started with Docker Compose.

## ML recommendations

The ML service is located in `ml-service/`. The model is trained by `train_model.py` using `data.csv`.

The current implementation uses:

- `StandardScaler` for feature scaling;
- `KMeans` with five clusters for grouping states;
- `RandomForestClassifier` for predicting a cluster from three features;
- `cluster_profiles` and `state_to_tastes` dictionaries for interpreting the result.

Input features are `wellbeing`, `activity`, and `mood`.

Possible states are `positive`, `negative`, `fatigue`, `anxiety`, and `mixed`. Taste profiles use `sweet`, `umami`, `salty`, `sour`, and `bitter`.

### ML service API

`POST /predict`

```json
{
  "wellbeing": 6,
  "activity": 5,
  "mood": 6
}
```

```json
{
  "cluster": 2,
  "state": "positive",
  "tastes": ["sweet", "umami"]
}
```

The backend also filters cocktails by `alcoholPreference` and a list of allergen ingredient IDs.

## Project structure

```text
.
├── backend/          # Node.js + Express API, models, routes, and tests
├── docker/            # Dockerfiles for the frontend, backend, and ML service
├── ml-service/       # FastAPI service, training script, and saved models
├── public/            # static assets
├── src/               # React frontend
├── tests/             # frontend and end-to-end tests
├── docker-compose.yml
├── Makefile
└── package.json
```

## Running with Docker Compose

### Requirements

- Docker and Docker Compose;
- `backend/.env`;
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, and `PORT` variables.

```bash
docker compose up --build
```

Frontend uses port `80`, PostgreSQL is published on port `5433`, and the ML service listens on port `8000` inside the Docker network.

Stop the services with:

```bash
docker compose down
```

## Local development

```bash
npm install
npm run dev
```

```bash
cd backend
npm install
npm run dev
npm run db:sync
```

```bash
cd ml-service
pip install -r requirements.txt
python train_model.py
uvicorn app:app --reload --port 8000
```

The training command creates `rf_model.pkl`, `scaler.pkl`, `kmeans.pkl`, `cluster_profiles.pkl`, and `state_to_tastes.pkl`.

Build all components for one command:

```bash
make run
```

## Testing

The frontend uses Vitest and Playwright. The backend is configured with Vitest, Supertest, and coverage reporting.

```bash
npm test
npm run test:coverage
npm run test:e2e
```
