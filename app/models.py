from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Veiculo(Base):
    __tablename__ = "veiculos"
    
    id = Column(Integer, primary_key=True, index=True)
    modelo = Column(String, nullable=False)
    placa = Column(String, unique=True, index=True, nullable=False)
    status = Column(String, default="disponível")
    hora_inicio_aluguel = Column(DateTime, nullable=True)
    quilometragem_atual = Column(Float, default=0.0)
    
    telemetrias = relationship("Telemetria", back_populates="veiculo")
    
class Telemetria(Base):
    __tablename__ = "telemetrias"
    
    id = Column(Integer, primary_key=True, index=True)
    veiculo_id = Column(Integer, ForeignKey("veiculos.id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    quilometragem = Column(Float, nullable=False)
    registrado_em = Column(DateTime, nullable=False)
    
    veiculo = relationship("Veiculo", back_populates="telemetrias")