const API_URL = "http://127.0.0.1:8000";

let veiculosCache = [];

async function carregarVeiculos() {
  const resposta = await fetch(`${API_URL}/veiculos`);
  const veiculos = await resposta.json();

  veiculosCache = veiculos;
  renderAluguel();

  const corpoTabela = document.querySelector("#tabela-veiculos tbody");
  corpoTabela.innerHTML = "";

  veiculos.forEach((veiculo) => {
    const linha = document.createElement("tr");
    linha.dataset.modelo = veiculo.modelo;
    linha.dataset.status = veiculo.status;
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

async function carregarTelemetria() {
  const modelo = document.querySelector("#input-veiculo").value.trim();
  const corpoTabela = document.querySelector("#corpo-tabela-telemetria");

  if (!modelo) {
    corpoTabela.innerHTML =
      "<tr><td colspan='6'>Digite o modelo do veículo</td></tr>";
    return;
  }

  const resposta = await fetch(
    `${API_URL}/telemetria?modelo=${encodeURIComponent(modelo)}`,
  );
  const dados = await resposta.json();

  corpoTabela.innerHTML = "";

  if (!resposta.ok) {
    corpoTabela.innerHTML = `<tr><td colspan='6'>${dados.detail}</td></tr>`;
    return;
  }

  dados.forEach((telemetria) => {
    const linha = document.createElement("tr");
    linha.dataset.modelo = modelo.toLowerCase();
    linha.innerHTML = `
            <td>${telemetria.id}</td>
            <td>${modelo}</td>
            <td>${telemetria.latitude}</td>
            <td>${telemetria.longitude}</td>
            <td>${telemetria.quilometragem}</td>
            <td>${telemetria.registrado_em}</td>
        `;
    corpoTabela.appendChild(linha);
  });
}

function filtrarVeiculos() {
  const filtro = document.querySelector("#input-modelo").value.toLowerCase();
  const status = document.querySelector("#select-status").value;

  let visiveis = 0;

  document.querySelectorAll("#tabela-veiculos tbody tr").forEach((veiculo) => {
    const modelo = veiculo.dataset.modelo.toLowerCase().includes(filtro);
    const status_filtro = veiculo.dataset.status.toLowerCase() === status;

    veiculo.style.display = modelo && status_filtro ? "" : "none";
    if (veiculo.style.display !== "none") visiveis++;
  });

  if (visiveis === 0) {
    document.querySelector("#corpo-tabela-veiculos").innerHTML =
      "<tr><td colspan='5'>Nenhum veículo encontrado</td></tr>";
  }
}

function filtroAluguel() {
  const filtro =
    document.querySelector("#input-modelo")?.value.toLowerCase() || "";
  const statusDesejado = "disponível";

  return veiculosCache.filter((veiculo) => {
    const modeloCorresponde = veiculo.modelo.toLowerCase().includes(filtro);
    const statusCorresponde = veiculo.status.toLowerCase() === statusDesejado;

    return modeloCorresponde && statusCorresponde;
  });
}

function renderAluguel() {
  const veiculos = filtroAluguel();
  const tbody = document.querySelector("#corpo-tabela-veiculos");
  tbody.innerHTML = "";

  if (veiculos.length === 0) {
    tbody.innerHTML = `<tr>
          <td colspan='5'>Nenhum veículo disponível para alugar</td>
        </tr>`;
    return;
  }

  veiculos.forEach((veiculo) => {
    const linha = document.createElement("tr");

    linha.innerHTML = `
        <td>${veiculo.id}</td>
        <td>${veiculo.modelo}</td>
        <td>${veiculo.placa}</td>
        <td>${veiculo.status}</td>
        <td>${veiculo.quilometragem_atual}</td>
        <td><button onclick="alugarVeiculo(${veiculo.id})">Alugar</button></td>
      `;
    tbody.appendChild(linha);
  });
}

async function cadastrarVeiculo() {
  const modelo = document.querySelector("#input-modelo").value;
  const placa = document.querySelector("#input-placa").value;

  await fetch(`${API_URL}/veiculos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ modelo, placa }),
  });

  document.querySelector("#input-modelo").value = "";
  document.querySelector("#input-placa").value = "";

  carregarVeiculos();
}

async function alugarVeiculo(veiculoId) {
  try {
    const resposta = await fetch(`${API_URL}/aluguel/iniciar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ veiculo_id: veiculoId }),
    });

    if (!resposta.ok) {
      const erro = await resposta.json();
      throw new Error(erro.detail || "Erro ao alugar veículo");
    }

    const veiculo = await resposta.json();
    alert(`Veículo ${veiculo.modelo} alugado com sucesso!`);
    filtrarVeiculos();
  } catch (error) {
    alert(error.message);
  }
}

if (document.querySelector("#tabela-veiculos")) {
  carregarVeiculos();
}

if (document.querySelector("#tabela-telemetria")) {
  document
    .querySelector("#input-veiculo")
    .addEventListener("keydown", (evento) => {
      if (evento.key === "Enter") carregarTelemetria();
    });
}