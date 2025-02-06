"use strict";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDV8aMQDG1MxZunWtolMlJMu3SF6uBozEE",
    authDomain: "estoque-materiais.firebaseapp.com",
    projectId: "estoque-materiais",
    storageBucket: "estoque-materiais.firebasestorage.app",
    messagingSenderId: "893033145063",
    appId: "1:893033145063:web:f9a3da6a47ae22e39a7842"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let registros = [];
let editandoId = null;

// ================= FUNÇÕES PRINCIPAIS =================

/**
 * Carrega os dados do Firestore e atualiza a interface do usuário.
 */
async function carregarDados() {
    try {
        document.querySelector('.refresh-btn i').classList.add('loading');

        const querySnapshot = await db.collection("materiais").get();
        registros = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        buscarRegistros();
        showMessage('Dados carregados!', 'success');

    } catch (error) {
        showMessage('Erro ao carregar dados: ' + error.message, 'error');
    } finally {
        document.querySelector('.refresh-btn i').classList.remove('loading');
    }
}

/**
 * Salva um novo registro ou atualiza um registro existente no Firestore.
 * @param {Object} registro - O registro a ser salvo.
 */
async function salvarRegistro(registro) {
    try {
        if (editandoId) {
            await db.collection("materiais").doc(editandoId).update(registro);
            showMessage('Registro atualizado!');
        } else {
            await db.collection("materiais").add(registro);
            showMessage('Registro salvo na nuvem!');
        }
        await carregarDados();
    } catch (error) {
        showMessage('Erro ao salvar: ' + error.message, 'error');
    }
}

/**
 * Valida e envia o formulário de registro de materiais.
 */
async function validarFormulario() {
    const data = document.getElementById('dataRegistro').value;
    const nome = document.getElementById('nomeMaterial').value.trim();
    const qtd = document.getElementById('quantidade').value;

    if (!data || !nome || !qtd) {
        showMessage('Preencha todos os campos!', 'error');
        return;
    }

    const registro = { data, nomeMaterial: nome, quantidade: qtd };
    await salvarRegistro(registro);
    limparFormulario();
}

// ================= FUNÇÕES AUXILIARES =================

/**
 * Busca e exibe os registros filtrados pela data selecionada.
 */
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
                <button class="editar-btn" onclick="editarRegistro('${r.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="excluir-btn" onclick="excluirRegistro('${r.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    resultadosDiv.classList.toggle('show-results', resultados.length > 0);
}

/**
 * Preenche o formulário com os dados de um registro para edição.
 * @param {string} id - O ID do registro a ser editado.
 */
function editarRegistro(id) {
    const registro = registros.find(r => r.id === id);

    document.getElementById('dataRegistro').value = registro.data;
    document.getElementById('nomeMaterial').value = registro.nomeMaterial;
    document.getElementById('quantidade').value = registro.quantidade;

    editandoId = id;
    document.getElementById('submitButton').innerHTML = '<i class="fas fa-sync"></i> Atualizar';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Exclui um registro do Firestore.
 * @param {string} id - O ID do registro a ser excluído.
 */
async function excluirRegistro(id) {
    if (confirm('Excluir registro permanentemente?')) {
        try {
            await db.collection("materiais").doc(id).delete();
            showMessage('Registro excluído!');
            await carregarDados();
        } catch (error) {
            showMessage('Erro ao excluir: ' + error.message, 'error');
        }
    }
}

/**
 * Limpa o formulário de registro de materiais.
 */
function limparFormulario() {
    document.getElementById('materialForm').reset();
    editandoId = null;
    document.getElementById('submitButton').innerHTML = '<i class="fas fa-save"></i> Salvar Registro';
}

/**
 * Exibe uma mensagem de status para o usuário.
 * @param {string} msg - A mensagem a ser exibida.
 * @param {string} tipo - O tipo de mensagem (success ou error).
 */
function showMessage(msg, tipo = 'success') {
    const div = document.getElementById('statusMessage');
    div.className = `status-message ${tipo}`;
    div.textContent = msg;
    div.style.display = 'block';
    setTimeout(() => div.style.display = 'none', 3000);
}

// ================= FUNÇÃO PARA GERAR PDF =================

/**
 * Gera um relatório em PDF dos materiais filtrados por data.
 */
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

    // Configuração do PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Título do Relatório
    doc.setFontSize(18);
    doc.text("Relatório de Materiais Civis", 14, 15);
    doc.setFontSize(12);
    doc.text(`Data: ${formatarData(filtroData)}`, 14, 25);

    // Cabeçalho da Tabela
    const headers = [["Data", "Material", "Quantidade"]];

    // Dados da Tabela
    const data = registrosFiltrados.map(registro => [
        formatarData(registro.data),
        registro.nomeMaterial,
        registro.quantidade
    ]);

    // Gerar Tabela
    doc.autoTable({
        head: headers,
        body: data,
        startY: 35,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 120 },
            2: { cellWidth: 30 }
        }
    });

    // Salvar PDF
    doc.save(`relatorio_materiais_${filtroData}.pdf`);
}

/**
 * Formata uma string de data no formato DD/MM/YYYY.
 * @param {string} dataString - A string de data a ser formatada.
 * @returns {string} - A string de data formatada.
 */
function formatarData(dataString) {
    const data = new Date(dataString);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

// ================= INICIALIZAÇÃO =================
window.addEventListener('load', carregarDados);
