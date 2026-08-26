from fastapi import FastAPI

app = FastAPI(title="API de Telemetria e Aluguel de Veículos")

@app.get("/")
def read_root():
    return {"status": "API no ar"}