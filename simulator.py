import time
import random

try:
    import requests  # type: ignore[import-not-found]
except ModuleNotFoundError as exc:
    raise RuntimeError("Instale o pacote 'requests' com: pip install requests") from exc

API_URL = "http://127.0.0.1:8000"
INTERVALO_TELEMETRIA = 5

posicoes_atuais = {}

def buscar_veiculos_alugados():
    resposta = requests.get(f"{API_URL}/veiculos")
    veiculos = resposta.json()
    return [veiculo for veiculo in veiculos if veiculo["status"] == "alugado"]


def gerar_proxima_posicao(veiculo):
    if veiculo["id"] not in posicoes_atuais:
        posicoes_atuais[veiculo["id"]] = {
            "latitude": -23.5505,
            "longitude": -46.6333,
        }
        
    posicao = posicoes_atuais[veiculo["id"]]
    posicao["latitude"] += random.uniform(-0.001, 0.001)
    posicao["longitude"] += random.uniform(-0.001, 0.001)
    
    return posicao

def enviar_telemetria(veiculo):
    posicao = gerar_proxima_posicao(veiculo)
    nova_quilometragem = veiculo["quilometragem_atual"] + random.uniform(0.5, 3)
    
    payload = {
        "veiculo_id": veiculo["id"],
        "latitude": posicao["latitude"],
        "longitude": posicao["longitude"],
        "quilometragem": round(nova_quilometragem, 2)
    }
    
    resposta = requests.post(f"{API_URL}/telemetria", json=payload)
    
    if resposta.ok:
        print(
            f"[OK] Veículo {veiculo['id']} ({veiculo['modelo']}) -> "
            f"{payload['latitude']:.5f}, {payload['longitude']:.5f} | "
            f"{payload['quilometragem']} km"
        )
    else:
        print(f"[ERRO] Véiculo {veiculo["id"]}: {resposta.json().get('detail')}")
        
        
def main():
    print("Simulador de telemetria iniciado. Ctrl+C para parar.")
    while True:
        veiculos_alugados = buscar_veiculos_alugados()
        
        if not veiculos_alugados:
            print("Nenhum veículo alugado no momento...")
        else:
            for veiculo in veiculos_alugados:
                enviar_telemetria(veiculo)
        
        time.sleep(INTERVALO_TELEMETRIA)
        

if __name__ == "__main__":
    main()