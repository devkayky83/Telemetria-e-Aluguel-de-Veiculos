from fastapi import FastAPI
from app.database import engine, Base
from app import models

Base.metadata.create_all(bind=engine)   

app = FastAPI(title="API de Telemetria e Aluguel de Veículos")

@app.get("/")
def read_root():
    return {"status": "API no ar"}