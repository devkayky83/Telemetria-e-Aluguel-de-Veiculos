const API_URL = "http://127.0.0.1:8000";

async function carregarVeiculos() {
    const resposta = await fetch(`${API_URL}/veiculos`);
    const veiculos = await resposta.json();

    const corpoTabela = document.querySelector("#tabela-veiculos tbody");
    corpoTabela.innerHTML = "";

    veiculos.forEach(veiculo => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${veiculo.id}</td>
            <td>${veiculo.modelo}</td>
            <td>${veiculo.placa}</td>
            <td>${veiculo.status}</td>
            <td>${veiculo.quilometragem_atual}</td>
        `;
        corpoTabela.appendChild(linha);
    });
}

async function cadastrarVeiculo(){
    const modelo = document.querySelector("#input-modelo").value;
    const placa = document.querySelector("#input-placa").value;

    await fetch(`${API_URL}/veiculos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelo, placa })
    });

    document.querySelector("#input-modelo").value = "";
    document.querySelector("#input-placa").value = "";

    carregarVeiculos();
}

carregarVeiculos();
