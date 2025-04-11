from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_selection import mutual_info_classif
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load and preprocess dataset
dataset_path = "C:\\Users\\Palash Hemade\\Downloads\\diet_recommendations_dataset.csv"  # Place the CSV in the same directory or adjust path
data = pd.read_csv(dataset_path)

# Replace 'None' in Disease_Type with 'Healthy'
data['Disease_Type'] = data['Disease_Type'].replace('None', 'Healthy')

# Drop missing values
data.dropna(inplace=True)

# Inject optional noise (as per original code)
shuffle_percentage = 0.15
num_shuffle = int(len(data) * shuffle_percentage)
shuffle_indices = np.random.choice(data.index, size=num_shuffle, replace=False)
data.loc[shuffle_indices, 'Diet_Recommendation'] = np.random.choice(
    data['Diet_Recommendation'].unique(), size=num_shuffle
)

# Label encoding
categorical_columns = ['Gender', 'Disease_Type', 'Severity', 'Physical_Activity_Level', 'Allergies', 'Preferred_Cuisine']
label_encoders = {}

for col in categorical_columns:
    le = LabelEncoder()
    data[col] = le.fit_transform(data[col])
    label_encoders[col] = le

# Feature selection
X = data.drop(columns=['Patient_ID', 'Diet_Recommendation', 'Adherence_to_Diet_Plan', 
                       'Weekly_Exercise_Hours', 'Glucose_mg/dL', 'Blood_Pressure_mmHg', 
                       'Cholesterol_mg/dL', 'Daily_Caloric_Intake', 'Dietary_Restrictions',
                       'Allergies', 'Severity', 'Dietary_Nutrient_Imbalance_Score', 
                       'Height_cm', 'Weight_kg', 'Gender'])
y = data['Diet_Recommendation']

feature_scores = mutual_info_classif(X, y)
important_features = X.columns[np.argsort(feature_scores)[-6:]]
X = X[important_features]

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

# ==== API Models ====
class PredictionRequest(BaseModel):
    Preferred_Cuisine: str
    Age: int
    Physical_Activity_Level: str
    BMI: float
    Disease_Type: str

# ==== Prediction Route ====
@app.post("/predict")
def predict_diet(req: PredictionRequest):
    try:
        input_data = req.dict()
        encoded_sample = {}
        for key, value in input_data.items():
            if key in label_encoders:
                encoder = label_encoders[key]
                if value in encoder.classes_:
                    encoded_sample[key] = encoder.transform([value])[0]
                else:
                    # Extend classes_ with unseen label for inference
                    encoder.classes_ = np.append(encoder.classes_, value)
                    encoded_sample[key] = encoder.transform([value])[0]
            else:
                encoded_sample[key] = value  # Numeric fields

        # Create dataframe and align with feature order
        input_df = pd.DataFrame([encoded_sample])
        input_df = input_df.reindex(columns=important_features, fill_value=0)

        prediction = model.predict(input_df)[0]
        return {"recommended_diet": prediction}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run with: uvicorn main:app --reload
