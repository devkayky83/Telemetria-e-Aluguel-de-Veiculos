from pydantic import BaseModel

class VeiculoCreate(BaseModel):
    modelo: str
    placa: str
    status: str = "disponível"
    
class AluguelIniciar(BaseModel):
    veiculo_id: int
    
class TelemetriaCreate(BaseModel):
    veiculo_id: int
    latitude: float
    longitude: float
    quilometragem: float