from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import joblib

app = FastAPI()

model = joblib.load("rf_model.pkl")
scaler = joblib.load("scaler.pkl")
cluster_profiles = joblib.load("cluster_profiles.pkl")
state_to_tastes = joblib.load("state_to_tastes.pkl")

class SANRequest(BaseModel):
    wellbeing: float
    activity: float
    mood: float

@app.post("/predict")
def predict(data: SANRequest):

    X = np.array([[
        data.wellbeing,
        data.activity,
        data.mood
    ]])

    X_scaled = scaler.transform(X)

    cluster = int(model.predict(X_scaled)[0])

    state = cluster_profiles[cluster]

    profile = state_to_tastes[state]

    return {
    "cluster": cluster,
    "state": state,
    "tastes": profile,
}