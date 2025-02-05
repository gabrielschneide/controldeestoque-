"use strict";

let registros = JSON.parse(localStorage.getItem('registrosMateriais')) || [];

function validarFormulario() {
    const dataRegistro = document.getElementById('dataRegistro').value;
    const nomeMaterial = document.getElementById('nomeMaterial').value.trim();
    const quantidade = document.getElementById('quantidade').value;

    if (!dataRegistro || !nomeMaterial || !quantidade) {
        alert('Preencha todos os campos obrigatórios!');
        return;
    }

    const registro = {
        id: Date.now(),
        data: dataRegistro,
        nomeMaterial: nomeMaterial,
        quantidade: quantidade
    };

    registros.unshift(registro);
    localStorage.setItem('registrosMateriais', JSON.stringify(registros));
    limparFormulario();
    alert('Material adicionado com sucesso!');
}

function limparFormulario() {
    document.getElementById('dataRegistro').value = '';
    document.getElementById('nomeMaterial').value = '';
    document.getElementById('quantidade').value = '';
}

function formatarData(dataString) {
    const data = new Date(dataString);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

function gerarRelatorioPDF() {
    const filtroData = document.getElementById('filtroData').value;
    
    if (!filtroData) {
        alert('Selecione uma data para gerar o relatório!');
        return;
    }

    const registrosFiltrados = registros.filter(registro => 
        registro.data === filtroData
    );

    if (registrosFiltrados.length === 0) {
        alert('Nenhum material encontrado para esta data!');
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
