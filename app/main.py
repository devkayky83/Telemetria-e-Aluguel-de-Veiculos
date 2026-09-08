from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from app.database import engine, Base, get_db
from app import models, schemas
from typing import List

Base.metadata.create_all(bind=engine)   

app = FastAPI(title="API de Telemetria e Aluguel de Veículos")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def read_root():
    return {"status": "API no ar"}

@app.get("/veiculos", response_model=List[schemas.VeiculoOut])
def listar_veiculos(db: Session = Depends(get_db)):
    return db.query(models.Veiculo).all()

@app.get("/veiculos/{veiculo_id}/telemetria", response_model=List[schemas.TelemetriaOut])
def listar_telemetria(veiculo_id: int, db: Session = Depends(get_db)):
    veiculo = db.query(models.Veiculo).filter(models.Veiculo.id == veiculo_id).first()
    
    if not veiculo:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    
    return veiculo.telemetrias

@app.get("/telemetria", response_model=List[schemas.TelemetriaOut])
def listar_telemetria_por_modelo(modelo: str, db: Session = Depends(get_db)):
    veiculos = db.query(models.Veiculo).filter(
        models.Veiculo.modelo.ilike(f"%{modelo}%")
    ).all()
    
    if not veiculos:
        raise HTTPException(status_code=404, detail="Nenhum veículo encontrado com o modelo especificado")
    
    veiculos_ids = [veiculo.id for veiculo in veiculos]
    return (
        db.query(models.Telemetria)
        .filter(models.Telemetria.veiculo_id.in_(veiculos_ids))
        .order_by(models.Telemetria.registrado_em.desc())
        .all()
    )

@app.post("/veiculos")
def criar_veiculo(veiculo: schemas.VeiculoCreate, db: Session = Depends(get_db)):
    novo_veiculo = models.Veiculo(
        modelo=veiculo.modelo, 
        placa=veiculo.placa,
        status=veiculo.status
    )
    db.add(novo_veiculo)
    
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Veículo com essa placa já cadastrado")
    
    db.commit()
    db.refresh(novo_veiculo)
    return novo_veiculo

@app.post("/aluguel/iniciar")
def iniciar_aluguel(aluguel: schemas.AluguelIniciar, db: Session = Depends(get_db)):
    veiculo = db.query(models.Veiculo).filter(models.Veiculo.id == aluguel.veiculo_id).first()
    
    if not veiculo:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    
    if veiculo.status.lower() != "disponível":
        raise HTTPException(status_code=400, detail="Veículo não está disponível para aluguel")
    
    veiculo.status = "alugado"
    veiculo.hora_inicio_aluguel = datetime.now()
    
    db.commit()
    db.refresh(veiculo)
    return veiculo


@app.post("/telemetria", response_model=schemas.TelemetriaOut)
def registrar_telemetria(telemetria: schemas.TelemetriaCreate, db: Session = Depends(get_db)):
    veiculo = db.query(models.Veiculo).filter(models.Veiculo.id == telemetria.veiculo_id).first()
    
    if not veiculo:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    
    if veiculo.status.lower() != "alugado":
        raise HTTPException(status_code=400, detail="Telemetria só pode ser registrada para veículos alugados")
    
    nova_telemetria = models.Telemetria(
        veiculo_id=telemetria.veiculo_id,
        latitude=telemetria.latitude,
        longitude=telemetria.longitude,
        quilometragem=telemetria.quilometragem,
        registrado_em=datetime.now()
    )
    db.add(nova_telemetria)
    veiculo.quilometragem_atual = round(telemetria.quilometragem, 2)
    
    db.commit()
    db.refresh(nova_telemetria)
    return nova_telemetria


@app.post("/devolver")
def devolver_veiculo(devolucao: schemas.DevolucaoVeiculo, db: Session = Depends(get_db)):
    veiculo = db.query(models.Veiculo).filter(models.Veiculo.id == devolucao.veiculo_id).first()
    
    if not veiculo:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    
    if veiculo.status.lower() != "alugado":
        raise HTTPException(status_code=400, detail="Este veículo não está alugado")
    
    veiculo.status = "disponível"
    veiculo.hora_inicio_aluguel = None

    db.commit()
    db.refresh(veiculo)
    return veiculo