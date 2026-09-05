from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class VeiculoCreate(BaseModel):
    modelo: str
    placa: str
    status: str = "disponível"
    
class VeiculoOut(BaseModel):
    id: int
    modelo: str
    placa: str
    status: str
    hora_inicio_aluguel: Optional[datetime] = None
    quilometragem_atual: float
    
    class Config:
        from_attributes = True
    
    
class AluguelIniciar(BaseModel):
    veiculo_id: int
    
class TelemetriaCreate(BaseModel):
    veiculo_id: int
    latitude: float
    longitude: float
    quilometragem: float
    
    
class TelemetriaOut(BaseModel):
    id: int
    veiculo_id: int
    latitude: float
    longitude: float
    quilometragem: float
    registrado_em: datetime
    
    class Config:
        from_attributes = True
        

class DevolucaoVeiculo(BaseModel):
    veiculo_id: int