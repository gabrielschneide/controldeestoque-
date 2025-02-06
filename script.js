"use strict";

// Configuração do JSONBin.io
const BIN_ID = "67a3eeb29fd07d161ce4a764"; // Seu Bin ID
const API_KEY = "$2a$10$nLJMmE0TiglATAJbi/Htk.ASFsgc68bhXonWdrTMhU75P984NYpTS"; // Sua X-Master-Key
let registros = [];
let editandoId = null;

// Função para carregar dados
async function carregarDados() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { "X-Master-Key": API_KEY }
        });
        const data = await response.json();
        registros = data.record.registros || []; // Garante que registros seja um array
        buscarRegistros();
        showMessage('Dados carregados!', 'success');
    } catch (error) {
        showMessage('Erro ao carregar dados: ' + error.message, 'error');
    }
}

// Função para salvar dados
async function salvarRegistro(registro) {
    try {
        if (editandoId) {
            // Atualiza registro existente
            const index = registros.findIndex(r => r.id === editandoId);
            registros[index] = { ...registro, id: editandoId };
        } else {
            // Adiciona novo registro
            registro.id = Date.now().toString(); // ID único
            registros.push(registro);
        }

        // Envia dados atualizados para o JSONBin.io
        await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": API_KEY
            },
            body: JSON.stringify({ registros })
        });

        showMessage(editandoId ? 'Registro atualizado!' : 'Registro salvo!', 'success');
        await carregarDados();
        limparFormulario();
    } catch (error) {
        showMessage('Erro ao salvar: ' + error.message, 'error');
    }
}

// Função para buscar registros
function buscarRegistros() {
    const dataSelecionada = document.getElementById('dataPesquisa').value;
    const resultados = registros.filter(r => r.data === dataSelecionada);

    const resultadosDiv = document.getElementById('resultadosPesquisa');
    resultadosDiv.innerHTML = resultados.map(r => `
        <div class="registro-item">
            <div><strong>${r.nomeMaterial}</strong><br><small>${r.data} - Quantidade: ${r.quantidade}</small></div>
            <div>
                <button onclick="editarRegistro('${r.id}')"><i class="fas fa-edit"></i></button>
                <button onclick="excluirRegistro('${r.id}')"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

// Função para editar registro
function editarRegistro(id) {
    const registro = registros.find(r => r.id === id);
    if (registro) {
        editandoId = id;
        document.getElementById('dataRegistro').value = registro.data;
        document.getElementById('nomeMaterial').value = registro.nomeMaterial;
        document.getElementById('quantidade').value = registro.quantidade;
    }
}

// Função para excluir registro
async function excluirRegistro(id) {
    if (confirm('Excluir registro permanentemente?')) {
        try {
            registros = registros.filter(r => r.id !== id);
            await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Master-Key": API_KEY
                },
                body: JSON.stringify({ registros })
            });
            showMessage('Registro excluído!', 'success');
            await carregarDados();
        } catch (error) {
            showMessage('Erro ao excluir: ' + error.message, 'error');
        }
    }
}

// Função para limpar formulário
function limparFormulario() {
    document.getElementById('materialForm').reset();
    editandoId = null;
}

// Função para exibir mensagens
function showMessage(msg, tipo = 'success') {
    const div = document.getElementById('statusMessage');
    div.className = `status-message ${tipo}`;
    div.textContent = msg;
    div.style.display = 'block';
    setTimeout(() => div.style.display = 'none', 3000);
}

// Inicialização
window.addEventListener('load', carregarDados);
