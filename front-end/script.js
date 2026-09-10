const API_URL = "http://127.0.0.1:8000";

let veiculosCache = [];

async function carregarVeiculos() {
  const resposta = await fetch(`${API_URL}/veiculos`);
  veiculosCache = await resposta.json();

  if (document.querySelector("#corpo-tabela-cadastro")) {
    renderListaSimples("#corpo-tabela-cadastro", veiculosCache);
  }

  if (document.querySelector("#corpo-tabela-frota")) {
    renderListaSimples("#corpo-tabela-frota", veiculosCache);
  }

  if (document.querySelector("#corpo-tabela-aluguel")) {
    renderAluguel();
  }

  if (document.querySelector("#corpo-tabela-alugados")) {
    filtrarVeiculosAlugados();
  }
}

function classeBadge(status) {
  const chave = status.toLowerCase();
  if (chave === "disponível") return "badge-disponivel";
  if (chave === "alugado") return "badge-alugado";
  if (chave === "manutenção") return "badge-manutencao";
  return "";
}

function renderListaSimples(seletorTbody, veiculos) {
  const corpoTabela = document.querySelector(seletorTbody);
  corpoTabela.innerHTML = "";

  veiculos.forEach((veiculo) => {
    const linha = document.createElement("tr");
    linha.dataset.modelo = veiculo.modelo;
    linha.dataset.status = veiculo.status;
    linha.innerHTML = `
      <td>${veiculo.id}</td>
      <td>${veiculo.modelo}</td>
      <td>${veiculo.placa}</td>
      <td><span class="badge ${classeBadge(veiculo.status)}">${veiculo.status}</span></td>      
      <td>${veiculo.quilometragem_atual}</td>
    `;
    corpoTabela.appendChild(linha);
  });
}

function formatarData(isoString){
  const data = new Date(isoString);
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
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
    linha.innerHTML = `
      <td>${telemetria.id}</td>
      <td>Veículo #${telemetria.veiculo_id}</td>
      <td>${telemetria.latitude.toFixed(5)}</td>
      <td>${telemetria.longitude.toFixed(5)}</td>
      <td>${telemetria.quilometragem.toFixed(2)} km</td>
      <td>${formatarData(telemetria.registrado_em)}</td>
    `;
    corpoTabela.appendChild(linha);
  });
}

function filtrarVeiculos() {
  const filtro = document.querySelector("#input-modelo").value.toLowerCase();
  const status = document.querySelector("#select-status").value;

  let visiveis = 0;

  document.querySelectorAll("#tabela-frota tbody tr").forEach((veiculo) => {
    const modelo = veiculo.dataset.modelo.toLowerCase().includes(filtro);
    const status_filtro = veiculo.dataset.status.toLowerCase() === status;

    veiculo.style.display = modelo && status_filtro ? "" : "none";
    if (veiculo.style.display !== "none") visiveis++;
  });

  if (visiveis === 0) {
    document.querySelector("#corpo-tabela-frota").innerHTML =
      "<tr><td colspan='5'>Nenhum veículo encontrado</td></tr>";
  }
}

function filtrarVeiculosAlugados() {
  const filtro = document
    .querySelector("#input-modelo")
    .value.trim()
    .toLowerCase();
  const tbody = document.querySelector("#corpo-tabela-alugados");
  const veiculosAlugados = veiculosCache.filter((veiculo) => {
    const modelo = (veiculo.modelo || "").toLowerCase();
    const status = (veiculo.status || "").toLowerCase();
    return modelo.includes(filtro) && status === "alugado";
  });

  tbody.innerHTML = "";

  if (veiculosAlugados.length === 0) {
    tbody.innerHTML =
      "<tr><td colspan='6'>Nenhum veículo alugado encontrado</td></tr>";
    return;
  }

  veiculosAlugados.forEach((veiculo) => {
    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${veiculo.id}</td>
      <td>${veiculo.modelo}</td>
      <td>${veiculo.placa}</td>
      <td><span class="badge ${classeBadge(veiculo.status)}">${veiculo.status}</span></td>
      <td>${veiculo.quilometragem_atual}</td>
      <td><button class="btn btn-secundario" onclick="devolverVeiculo(${veiculo.id})">Devolver</button></td>
    `;
    tbody.appendChild(linha);
  });
}

async function devolverVeiculo(veiculoId) {
  try {
    const resposta = await fetch(`${API_URL}/devolver`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ veiculo_id: veiculoId }),
    });

    if (!resposta.ok) {
      const erro = await resposta.json();
      throw new Error(erro.detail || "Erro ao devolver veículo");
    }

    const veiculo = await resposta.json();
    alert(`Veículo ${veiculo.modelo} devolvido com sucesso!`);

    veiculosCache = veiculosCache.map((item) =>
      item.id === veiculo.id ? veiculo : item,
    );
    filtrarVeiculosAlugados();
  } catch (error) {
    alert(error.message);
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
  const tbody = document.querySelector("#corpo-tabela-aluguel");
  tbody.innerHTML = "";

  if (veiculos.length === 0) {
    tbody.innerHTML =
      "<tr><td colspan='5'>Nenhum veículo disponível para alugar</td></tr>";
    return;
  }

  veiculos.forEach((veiculo) => {
    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${veiculo.id}</td>
      <td>${veiculo.modelo}</td>
      <td>${veiculo.placa}</td>
      <td><span class="badge ${classeBadge(veiculo.status)}">${veiculo.status}</span></td>
      <td>${veiculo.quilometragem_atual}</td>
      <td><button class="btn" onclick="alugarVeiculo(${veiculo.id})">Alugar</button></td>
    `;
    tbody.appendChild(linha);
  });
}

async function cadastrarVeiculo() {
  const modelo = document.querySelector("#input-modelo").value;
  const placa = document.querySelector("#input-placa").value;

  try {
    const resposta = await fetch(`${API_URL}/veiculos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modelo, placa }),
    });

    if (!resposta.ok) {
      const erro = await resposta.json();
      throw new Error(erro.detail || "Erro ao cadastrar veículo");
    }

    document.querySelector("#input-modelo").value = "";
    document.querySelector("#input-placa").value = "";

    carregarVeiculos();
  } catch (error) {
    alert(error.message);
  }
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
    carregarVeiculos();
  } catch (error) {
    alert(error.message);
  }
}

if (
  document.querySelector("#tabela-cadastro") ||
  document.querySelector("#tabela-frota") ||
  document.querySelector("#tabela-aluguel") ||
  document.querySelector("#tabela-veiculos-alugados")
) {
  carregarVeiculos();
}

if (document.querySelector("#tabela-telemetria")) {
  document
    .querySelector("#input-veiculo")
    .addEventListener("keydown", (evento) => {
      if (evento.key === "Enter") carregarTelemetria();
    });
}
