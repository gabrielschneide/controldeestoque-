"use strict";

// Configuração do JSONBin.io (SUAS CREDENCIAIS JÁ ESTÃO AQUI!)
const BIN_ID = "67a3eeb29fd07d161ce4a764";
const API_KEY = "$2a$10$7/4kIky21hKzyb3cd6xTf.X9EFsMKqgiMokRv37yoXy/nHJpFAsei";

let registros = [];
let editandoId = null;

// ================= FUNÇÕES PRINCIPAIS =================
async function carregarDados() {
    try {
        document.querySelector('.refresh-btn i').classList.add('loading');
        
        const response = await axios.get(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': API_KEY }
        });
        
        registros = response.data.record.materiais;
        showMessage('Dados atualizados da nuvem!', 'success');
        buscarRegistros();
        
    } catch (error) {
        showMessage('Falha ao carregar dados!', 'error');
    } finally {
        document.querySelector('.refresh-btn i').classList.remove('loading');
    }
}

async function salvarNaNuvem() {
    try {
        await axios.put(`https://api.jsonbin.io/v3/b/${BIN_ID}`, 
            { materiais: registros },
            { headers: { 'X-Master-Key': API_KEY } }
        );
    } catch (error) {
        showMessage('Erro ao sincronizar com a nuvem!', 'error');
    }
}

async function validarFormulario() {
    const data = document.getElementById('dataRegistro').value;
    const nome = document.getElementById('nomeMaterial').value.trim();
    const qtd = document.getElementById('quantidade').value;

    if (!data || !nome || !qtd) {
        showMessage('Preencha todos os campos!', 'error');
        return;
    }

    const novoRegistro = {
        id: Date.now(),
        data,
        nomeMaterial: nome,
        quantidade: qtd
    };

    try {
        if(editandoId) {
            const index = registros.findIndex(r => r.id === editandoId);
            registros[index] = novoRegistro;
            showMessage('Registro atualizado!');
        } else {
            registros.push(novoRegistro);
            showMessage('Registro salvo na nuvem!');
        }

        await salvarNaNuvem();
        carregarDados();
        limparFormulario();

    } catch (error) {
        showMessage('Erro ao salvar!', 'error');
    }
}

// ================= FUNÇÕES AUXILIARES =================
function buscarRegistros() {
    const dataSelecionada = document.getElementById('dataPesquisa').value;
    const resultados = registros.filter(r => r.data === dataSelecionada);
    
    const resultadosDiv = document.getElementById('resultadosPesquisa');
    resultadosDiv.innerHTML = resultados.map(r => `
        <div class="registro-item">
            <div>
                <strong>${r.nomeMaterial}</strong><br>
                <small>${r.data} - Quantidade: ${r.quantidade}</small>
            </div>
            <div class="registro-acoes">
                <button class="editar-btn" onclick="editarRegistro(${r.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="excluir-btn" onclick="excluirRegistro(${r.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    resultadosDiv.classList.toggle('show-results', resultados.length > 0);
}

function editarRegistro(id) {
    const registro = registros.find(r => r.id === id);
    
    document.getElementById('dataRegistro').value = registro.data;
    document.getElementById('nomeMaterial').value = registro.nomeMaterial;
    document.getElementById('quantidade').value = registro.quantidade;
    
    editandoId = id;
    document.getElementById('submitButton').innerHTML = '<i class="fas fa-sync"></i> Atualizar';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function excluirRegistro(id) {
    if(confirm('Excluir registro permanentemente?')) {
        registros = registros.filter(r => r.id !== id);
        await salvarNaNuvem();
        carregarDados();
        showMessage('Registro excluído!');
    }
}

function limparFormulario() {
    document.getElementById('materialForm').reset();
    editandoId = null;
    document.getElementById('submitButton').innerHTML = '<i class="fas fa-save"></i> Salvar Registro';
}

function showMessage(msg, tipo = 'success') {
    const div = document.getElementById('statusMessage');
    div.className = `status-message ${tipo}`;
    div.textContent = msg;
    div.style.display = 'block';
    setTimeout(() => div.style.display = 'none', 3000);
}

// ================= INICIALIZAÇÃO =================
carregarDados();
