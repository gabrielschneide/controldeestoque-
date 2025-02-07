const API_URL = 'https://script.google.com/macros/s/AKfycbz4lk0qR-FkjYbUfjEbBeNhoZVmXW1-KkGMsI3f-VAb41s3kCoEAc0Wcej7jy9UHSKOLQ/exec';

// Função para adicionar um novo material
document.getElementById('estoqueForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = document.getElementById('data').value;
    const material = document.getElementById('material').value;
    const quantidade = document.getElementById('quantidade').value;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data, material, quantidade })
        });

        if (response.ok) {
            alert('Material adicionado com sucesso!');
            location.reload(); // Recarrega a página para atualizar a lista
        }
    } catch (error) {
        console.error('Erro:', error);
    }
});

// Função para carregar os dados ao abrir a página
async function carregarDados() {
    try {
        const response = await fetch(API_URL);
        const dados = await response.json();
        atualizarTabela(dados);
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Função para atualizar a tabela com os dados
function atualizarTabela(dados) {
    const tbody = document.querySelector('#listaMateriais tbody');
    tbody.innerHTML = '';

    dados.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.Data}</td>
            <td>${item.Material}</td>
            <td>${item.Quantidade}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Função para filtrar por data
function filtrarPorData() {
    const dataFiltro = document.getElementById('filtroData').value;
    const linhas = document.querySelectorAll('#listaMateriais tbody tr');

    linhas.forEach(linha => {
        const data = linha.cells[0].textContent;
        linha.style.display = data === dataFiltro ? '' : 'none';
    });
}

// Inicializa o carregamento dos dados
carregarDados();
