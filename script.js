const API_URL = 'https://script.google.com/macros/s/AKfycbxiNMfklAGHoqXn7ka0Xf0wEXRsw9DVLnlMB6iCekwbx8Ej4p7ROfQP7zzNaY-uRWxxrA/exec';

// Função para adicionar um novo material
document.getElementById('estoqueForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = document.getElementById('data').value;
    const material = document.getElementById('material').value;
    const quantidade = document.getElementById('quantidade').value;

    if (!data || !material || !quantidade) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data, material, quantidade })
        });

        const result = await response.json();
        
        if (result.status === 'success') {
            alert('Material adicionado com sucesso!');
            carregarDados(); // Atualiza a tabela sem recarregar a página
        } else {
            alert('Erro ao adicionar material. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Ocorreu um erro ao enviar os dados. Verifique a conexão e tente novamente.');
    }
});

// Função para carregar os dados ao abrir a página
async function carregarDados() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Erro ao buscar os dados.');
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

    if (!dados.length) {
        tbody.innerHTML = '<tr><td colspan="3">Nenhum dado encontrado.</td></tr>';
        return;
    }

    dados.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.Data || '-'}</td>
            <td>${item.Material || '-'}</td>
            <td>${item.Quantidade || '-'}</td>
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

// Inicializa o carregamento dos dados ao abrir a página
document.addEventListener('DOMContentLoaded', carregarDados);
