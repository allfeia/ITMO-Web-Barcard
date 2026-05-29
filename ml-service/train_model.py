import pandas as pd
import joblib

from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

df = pd.read_csv("data.csv")

df = df.rename(columns={
    "Самочувствие": "wellbeing",
    "Активность": "activity",
    "Настроение": "mood"
})

X = df[["wellbeing", "activity", "mood"]]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

kmeans = KMeans(n_clusters=5, random_state=42)
clusters = kmeans.fit_predict(X_scaled)

def detect_state(w, a, m):

    def level(x):
        if x < 4:
            return "low"
        elif x <= 5:
            return "neutral"
        else:
            return "high"

    w_l = level(w)
    a_l = level(a)
    m_l = level(m)

    if w_l == "high" and a_l == "high" and m_l == "high":
        return "positive"

    if w_l == "low" and a_l == "low" and m_l == "low":
        return "negative"

    if a_l == "low" and w_l != "high":
        return "fatigue"

    if a_l == "high" and m_l == "low":
        return "anxiety"

    if w_l == "neutral" and a_l == "neutral" and m_l == "neutral":
        return "neutral"

    return "mixed"

centers = scaler.inverse_transform(kmeans.cluster_centers_)

cluster_profiles = {
    idx: detect_state(*center)
    for idx, center in enumerate(centers)
}

state_to_tastes = {
    "positive": ["sweet", "umami"],
    "negative": ["sweet", "umami"],
    "fatigue": ["salty", "umami"],
    "anxiety": ["sour", "sweet", "bitter"],
    "mixed": ["sweet", "sour", "bitter"]
}

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled,
    clusters,
    test_size=0.2,
    random_state=42
)

model = RandomForestClassifier(
    n_estimators=300,
    max_depth=6,
    random_state=42
)

model.fit(X_train, y_train)

print("Accuracy:", model.score(X_test, y_test))

joblib.dump(model, "rf_model.pkl")
joblib.dump(scaler, "scaler.pkl")
joblib.dump(kmeans, "kmeans.pkl")
joblib.dump(cluster_profiles, "cluster_profiles.pkl")
joblib.dump(state_to_tastes, "state_to_tastes.pkl")

print("Saved successfully")
