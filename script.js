"use strict";

let registros = JSON.parse(localStorage.getItem('registrosMateriais')) || [];
let editandoId = null;

function showMessage(message, type = 'success') {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.className = `status-message ${type}`;
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}

function validarFormulario() {
    const dataRegistro = document.getElementById('dataRegistro').value;
    const nomeMaterial = document.getElementById('nomeMaterial').value.trim();
    const quantidade = document.getElementById('quantidade').value;

    if (!dataRegistro || !nomeMaterial || !quantidade) {
        showMessage('Preencha todos os campos obrigatórios!', 'error');
        return;
    }

    if(editandoId) {
        const index = registros.findIndex(r => r.id === editandoId);
        registros[index] = {
            ...registros[index],
            data: dataRegistro,
            nomeMaterial: nomeMaterial,
            quantidade: quantidade
        };
        showMessage('Registro atualizado com sucesso!');
        editandoId = null;
    } else {
        const registro = {
            id: Date.now(),
            data: dataRegistro,
            nomeMaterial: nomeMaterial,
            quantidade: quantidade
        };
        registros.unshift(registro);
        showMessage('Material adicionado com sucesso!');
    }

    localStorage.setItem('registrosMateriais', JSON.stringify(registros));
    limparFormulario();
    document.getElementById('submitButton').innerHTML = 
        '<i class="fas fa-save"></i> Adicionar Material';
    buscarRegistros();
}

function limparFormulario() {
    document.getElementById('dataRegistro').value = '';
    document.getElementById('nomeMaterial').value = '';
    document.getElementById('quantidade').value = '';
}

function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

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

    const tableHeaders = [["Data", "Material", "Quantidade"]];
    const tableData = registrosFiltrados.map(registro => [
        formatarData(registro.data),
        registro.nomeMaterial,
        registro.quantidade
    ]);

    doc.autoTable({
        head: tableHeaders,
        body: tableData,
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

    doc.save(`relatorio_materiais_${filtroData}.pdf`);
}

function buscarRegistros() {
    const dataSelecionada = document.getElementById('dataPesquisa').value;
    const resultadosDiv = document.getElementById('resultadosPesquisa');
    
    if(!dataSelecionada) {
        showMessage('Selecione uma data para buscar!', 'error');
        return;
    }

    const registrosFiltrados = registros.filter(registro => 
        registro.data === dataSelecionada
    );

    resultadosDiv.innerHTML = registrosFiltrados.map(registro => `
        <div class="registro-item" data-id="${registro.id}">
            <div>
                <strong>${registro.nomeMaterial}</strong><br>
                <small>Quantidade: ${registro.quantidade}</small>
            </div>
            <div class="registro-acoes">
                <button class="editar-btn" onclick="editarRegistro(${registro.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="excluir-btn" onclick="excluirRegistro(${registro.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    resultadosDiv.classList.toggle('show-results', registrosFiltrados.length > 0);
    
    if(registrosFiltrados.length === 0) {
        showMessage('Nenhum registro encontrado para esta data!', 'error');
    }
}

function editarRegistro(id) {
    editandoId = id;
    const registro = registros.find(r => r.id === id);
    
    document.getElementById('dataRegistro').value = registro.data;
    document.getElementById('nomeMaterial').value = registro.nomeMaterial;
    document.getElementById('quantidade').value = registro.quantidade;
    
    document.getElementById('submitButton').innerHTML = 
        '<i class="fas fa-sync"></i> Atualizar Material';
        
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function excluirRegistro(id) {
    if(confirm('Tem certeza que deseja excluir este registro permanentemente?')) {
        registros = registros.filter(registro => registro.id !== id);
        localStorage.setItem('registrosMateriais', JSON.stringify(registros));
        buscarRegistros();
        showMessage('Registro excluído com sucesso!');
    }
}

// Inicialização
document.getElementById('dataPesquisa').valueAsDate = new Date();
