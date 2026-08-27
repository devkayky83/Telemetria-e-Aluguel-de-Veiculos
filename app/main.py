from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.database import engine, Base, get_db
from app import models, schemas

Base.metadata.create_all(bind=engine)   

app = FastAPI(title="API de Telemetria e Aluguel de Veículos")

@app.get("/")
def read_root():
    return {"status": "API no ar"}

@app.post("/veiculos")
def criar_veiculo(veiculo: schemas.VeiculoCreate, db: Session = Depends(get_db)):
    novo_veiculo = models.Veiculo(
        modelo=veiculo.modelo, 
        placa=veiculo.placa,
        status=veiculo.status
    )
    db.add(novo_veiculo)
    db.commit()
    db.refresh(novo_veiculo)
    return novo_veiculo