from sqlalchemy import Column, Integer, String
from app.database import Base

class Veiculo(Base):
    __tablename__ = "veiculos"
    
    id = Column(Integer, primary_key=True, index=True)
    modelo = Column(String, nullable=False)
    placa = Column(String, unique=True, index=True, nullable=False)
    status = Column(String, default="disponível")
    