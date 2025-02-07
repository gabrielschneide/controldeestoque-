const API_URL = '';

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form");

  if (!form) {
    console.error("Formulário não encontrado!");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = document.getElementById("data").value;
    const material = document.getElementById("material").value;
    const quantidade = document.getElementById("quantidade").value;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, material, quantidade }),
      });

      // Verifica se a resposta é válida
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "success") {
        alert("Dados salvos! Atualizando a tabela...");
        await carregarDados();
      } else {
        alert("Erro: " + (result.message || "Resposta inválida da API"));
      }
    } catch (error) {
      alert("Erro de conexão. Verifique o console.");
      console.error("Erro no envio:", error);
    }
  });

  // Carrega os dados ao abrir a página
  carregarDados();
});

async function carregarDados() {
  try {
    const response = await fetch(API_URL);

    // Verifica se a resposta é válida
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const dados = await response.json();

    // Verifica se os dados são um array
    if (!Array.isArray(dados)) {
      throw new Error("Resposta da API não é um array!");
    }

    atualizarTabela(dados);
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    alert("Erro ao carregar dados. Verifique o console.");
  }
}

function atualizarTabela(dados) {
  const tbody = document.querySelector("#listaMateriais tbody");

  if (!tbody) {
    console.error("Tabela não encontrada!");
    return;
  }

  // Verifica se há dados
  if (dados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3">Nenhum dado encontrado.</td></tr>';
    return;
  }

  // Constrói as linhas da tabela
  tbody.innerHTML = dados.map(item => `
    <tr>
      <td>${item.Data || '-'}</td>
      <td>${item.Material || '-'}</td>
      <td>${item.Quantidade || '-'}</td>
    </tr>
  `).join("");
}

function filtrarPorData() {
  const dataFiltro = document.getElementById("filtroData").value;
  const linhas = document.querySelectorAll("#listaMateriais tbody tr");

  linhas.forEach(linha => {
    const data = linha.cells[0].textContent;
    linha.style.display = data === dataFiltro ? "" : "none";
  });
}
