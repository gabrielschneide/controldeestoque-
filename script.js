"use strict";

// Configuração do JSONBin.io (SUAS CREDENCIAIS JÁ ESTÃO AQUI!)
const BIN_ID = "67a3eeb29fd07d161ce4a764";
const API_KEY = "$2a$10$7/4kIky21hKzyb3cd6xTf.X9EFsMKqgiMokRv37yoXy/nHJpFAsei";

let registros = [];
let editandoId = null;
let tentativas = 0;

// ================= FUNÇÕES PRINCIPAIS =================
async function carregarDados() {
    try {
        // Verifica conexão
        if (!navigator.onLine) {
            showMessage('Você está offline!', 'error');
            return;
        }

        // Mostra animação de carregamento
        document.querySelector('.refresh-btn i').classList.add('loading');
        
        // Busca dados da nuvem
        const response = await axios.get(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': API_KEY }
        });
        
        // Atualiza registros e lista
        registros = response.data.record.materiais;
        buscarRegistros();
        showMessage('Dados carregados da nuvem!', 'success');
        
        // Armazena última atualização
        localStorage.setItem('ultimaAtt', new Date().toISOString());
        
    } catch (error) {
        // Tentativa de reconexão
        if (tentativas < 3) {
            tentativas++;
            setTimeout(carregarDados, 2000); // Tenta novamente após 2 segundos
            showMessage(`Tentando reconectar... (${tentativas}/3)`, 'warning');
        } else {
            showMessage('Falha ao carregar dados!', 'error');
        }
    } finally {
        // Remove animação de carregamento
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
        await carregarDados(); // Recarrega os dados após salvar
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

// Função para formatar data
function formatarData(dataString) {
    const data = new Date(dataString);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

// ================= INICIALIZAÇÃO =================
window.addEventListener('load', carregarDados); // Carrega dados ao abrir/atualizar
