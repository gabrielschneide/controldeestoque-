// Configuração do Sistema
const CONFIGURACAO = {
    GIST_ID: 'bc250af451d75b5bb8804e3f09174828',
    FILENAME: 'estoque.json',
    TOKEN: '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'
};

// Variáveis Globais
let dadosCompletos = [];

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    await carregarDados();
    configurarEventListeners();
});

// Configurar Eventos
function configurarEventListeners() {
    document.getElementById('btnFiltrar').addEventListener('click', aplicarFiltro);
    document.getElementById('btnLimparFiltro').addEventListener('click', limparFiltro);
    document.getElementById('materialForm').addEventListener('submit', handleSubmit);
}

// Carregar Dados da Nuvem
async function carregarDados() {
    try {
        const resposta = await fetch(`https://api.github.com/gists/${CONFIGURACAO.GIST_ID}`);
        const dadosGist = await resposta.json();
        dadosCompletos = JSON.parse(dadosGist.files[CONFIGURACAO.FILENAME].content);
        atualizarTabela(dadosCompletos);
    } catch (erro) {
        console.error('Erro ao carregar:', erro);
        mostrarAlerta('Falha na conexão com a nuvem!', 'erro');
    }
}

// Manipular Formulário
async function handleSubmit(e) {
    e.preventDefault();
    
    const novoItem = {
        id: Date.now().toString(),
        data: document.getElementById('data').value,
        material: document.getElementById('material').value,
        quantidade: document.getElementById('quantidade').value
    };

    try {
        await salvarNaNuvem([...dadosCompletos, novoItem]);
        dadosCompletos.push(novoItem);
        atualizarTabela(dadosCompletos);
        e.target.reset();
    } catch (erro) {
        console.error('Erro ao salvar:', erro);
        mostrarAlerta('Falha ao salvar na nuvem!', 'erro');
    }
}

// Sistema de Filtro
function aplicarFiltro() {
    const dataSelecionada = document.getElementById('filtroData').value;
    
    if(!dataSelecionada) {
        mostrarAlerta('Selecione uma data para filtrar!', 'aviso');
        return;
    }

    const dadosFiltrados = dadosCompletos.filter(item => item.data === dataSelecionada);
    atualizarTabela(dadosFiltrados);
}

function limparFiltro() {
    document.getElementById('filtroData').value = '';
    atualizarTabela(dadosCompletos);
}

// Atualizar Tabela
function atualizarTabela(dados) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    dados.forEach(item => {
        const tr = document.createElement('tr');
        tr.dataset.id = item.id;
        tr.innerHTML = `
            <td>${item.data}</td>
            <td>${item.material}</td>
            <td>${item.quantidade}</td>
            <td>
                <button class="btn btn-excluir" data-id="${item.id}">
                    🗑️ Excluir
                </button>
            </td>
        `;
        
        tr.querySelector('.btn-excluir').addEventListener('click', () => excluirItem(item.id));
        tbody.appendChild(tr);
    });
}

// Excluir Item
async function excluirItem(id) {
    if(!confirm('Confirmar exclusão permanente?')) return;
    
    try {
        const novosDados = dadosCompletos.filter(item => item.id !== id);
        await salvarNaNuvem(novosDados);
        dadosCompletos = novosDados;
        atualizarTabela(dadosCompletos);
    } catch (erro) {
        console.error('Erro ao excluir:', erro);
        mostrarAlerta('Falha na exclusão!', 'erro');
    }
}

// Função de Salvamento na Nuvem
async function salvarNaNuvem(dados) {
    await fetch(`https://api.github.com/gists/${CONFIGURACAO.GIST_ID}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `token ${CONFIGURACAO.TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            files: {
                [CONFIGURACAO.FILENAME]: {
                    content: JSON.stringify(dados)
                }
            }
        })
    });
}

// Sistema de Alertas
function mostrarAlerta(mensagem, tipo) {
    const cores = {
        erro: '#dc3545',
        aviso: '#ffc107',
        sucesso: '#28a745'
    };

    const alerta = document.createElement('div');
    alerta.style.position = 'fixed';
    alerta.style.top = '20px';
    alerta.style.right = '20px';
    alerta.style.padding = '1rem';
    alerta.style.borderRadius = '6px';
    alerta.style.color = 'white';
    alerta.style.backgroundColor = cores[tipo] || '#333';
    alerta.textContent = mensagem;
    
    document.body.appendChild(alerta);
    
    setTimeout(() => {
        alerta.remove();
    }, 3000);
}
