from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
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

@app.post("/aluguel/iniciar")
def iniciar_aluguel(aluguel: schemas.AluguelIniciar, db: Session = Depends(get_db)):
    veiculo = db.query(models.Veiculo).filter(models.Veiculo.id == aluguel.veiculo_id).first()
    
    if not veiculo:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    
    if veiculo.status == "alugado":
        raise HTTPException(status_code=400, detail="Veículo já alugado")
    
    veiculo.status = "alugado"
    veiculo.hora_inicio_aluguel = datetime.now()
    
    db.commit()
    db.refresh(veiculo)
    return veiculo