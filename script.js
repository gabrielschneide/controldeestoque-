const API_URL = 'https://script.google.com/macros/s/AKfycbwtfA4R_5B1gFMcUQXwDcMRzgVC_ig3Em4zPjZ9U_S4AZv-BTg5EwqSRWKM8Of-8M8wgw/exec'; // Cole sua URL aqui

document.getElementById("form").addEventListener("submit", async (e) => {
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

    const result = await response.json();
    
    if (result.status === "success") {
      alert("Dados salvos! Atualizando a tabela...");
      await carregarDados(); // Atualiza a tabela sem recarregar a página
    } else {
      alert("Erro: " + result.message);
    }
  } catch (error) {
    alert("Erro de conexão. Verifique o console.");
    console.error(error);
  }
});

async function carregarDados() {
  try {
    const response = await fetch(API_URL);
    const dados = await response.json();
    atualizarTabela(dados);
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
  }
}

function atualizarTabela(dados) {
  const tbody = document.querySelector("#listaMateriais tbody");
  tbody.innerHTML = dados.map(item => `
    <tr>
      <td>${item.Data}</td>
      <td>${item.Material}</td>
      <td>${item.Quantidade}</td>
    </tr>
  `).join("");
}

// Carrega os dados ao abrir a página
document.addEventListener("DOMContentLoaded", carregarDados);
