from pydantic import BaseModel

class VeiculoCreate(BaseModel):
    modelo: str
    placa: str
    status: str = "disponível"
    
class AluguelIniciar(BaseModel):
    veiculo_id: int