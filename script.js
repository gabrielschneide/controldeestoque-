"use strict";

// Configuração do JSONBin.io
const BIN_ID = "67a3eeb29fd07d161ce4a764";
const API_KEY = "$2a$10$7/4kIky21hKzyb3cd6xTf.X9EFsMKqgiMokRv37yoXy/nHJpFAsei";

let registros = [];
let editandoId = null;
let tentativas = 0;

// ================= FUNÇÕES PRINCIPAIS =================
async function carregarDados() {
    try {
        // Mostra animação de carregamento
        document.querySelector('.refresh-btn i').classList.add('loading');

        // Primeiro, tenta carregar dados do localStorage para evitar espera
        const dadosLocais = localStorage.getItem('registrosMateriais');
        if (dadosLocais) {
            registros = JSON.parse(dadosLocais);
            buscarRegistros();
        }

        // Verifica conexão
        if (!navigator.onLine) {
            showMessage('Você está offline! Carregando dados locais.', 'warning');
            return;
        }

        // Busca dados da nuvem
        const response = await axios.get(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': API_KEY }
        });

        // Atualiza registros e salva no localStorage
        registros = response.data.record.materiais;
        localStorage.setItem('registrosMateriais', JSON.stringify(registros));
        buscarRegistros();

        showMessage('Dados sincronizados com a nuvem!', 'success');

    } catch (error) {
        showMessage('Erro ao carregar dados!', 'error');
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
        localStorage.setItem('registrosMateriais', JSON.stringify(registros)); // Atualiza cache local
        showMessage('Dados salvos na nuvem!', 'success');
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
        if (editandoId) {
            const index = registros.findIndex(r => r.id === editandoId);
            registros[index] = novoRegistro;
            showMessage('Registro atualizado!', 'info');
        } else {
            registros.push(novoRegistro);
            showMessage('Registro salvo!', 'success');
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
    if (confirm('Excluir registro permanentemente?')) {
        registros = registros.filter(r => r.id !== id);
        await salvarNaNuvem();
        carregarDados();
        showMessage('Registro excluído!', 'info');
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

// ================= FUNÇÃO PARA GERAR PDF =================
function gerarRelatorioPDF() {
    const filtroData = document.getElementById('filtroData').value;

    if (!filtroData) {
        showMessage('Selecione uma data para gerar o relatório!', 'error');
        return;
    }

    const registrosFiltrados = registros.filter(registro => 
        registro.data === filtroData
    );

    if (registrosFiltrados.length === 0) {
        showMessage('Nenhum material encontrado para esta data!', 'error');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Relatório de Materiais Civis", 14, 15);
    doc.setFontSize(12);
    doc.text(`Data: ${formatarData(filtroData)}`, 14, 25);

    const headers = [["Data", "Material", "Quantidade"]];
    const data = registrosFiltrados.map(registro => [
        formatarData(registro.data),
        registro.nomeMaterial,
        registro.quantidade
    ]);

    doc.autoTable({
        head: headers,
        body: data,
        startY: 35,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    doc.save(`relatorio_materiais_${filtroData}.pdf`);
}

function formatarData(dataString) {
    const data = new Date(dataString);
    return `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
}

// ================= INICIALIZAÇÃO =================
window.addEventListener('load', carregarDados);
