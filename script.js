console.log("Script carregado");

let registros = JSON.parse(localStorage.getItem('registrosEstoque')) || [];

console.log("Registros carregados:", registros);

// Função para validar e adicionar registro
function validarFormulario() {
    const dataRegistro = document.getElementById('dataRegistro').value;
    const nomeMaterial = document.getElementById('nomeMaterial').value.trim();
    const quantidade = document.getElementById('quantidade').value.trim();

    if (!dataRegistro || !nomeMaterial || !quantidade) {
        alert('Preencha todos os campos obrigatórios!');
        return;
    }

    const registro = {
        id: Date.now(),
        data: dataRegistro,
        material: nomeMaterial,
        quantidade: parseInt(quantidade)
    };

    registros.unshift(registro);
    localStorage.setItem('registrosEstoque', JSON.stringify(registros));
    limparFormulario();
}

// Função para limpar formulário
function limparFormulario() {
    document.getElementById('dataRegistro').value = '';
    document.getElementById('nomeMaterial').value = '';
    document.getElementById('quantidade').value = '';
}

// Função para formatar data
function formatarData(dataString) {
    const data = new Date(dataString);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

// Função para gerar relatório PDF
function gerarRelatorioPDF() {
    const filtroData = document.getElementById('filtroData').value;

    const registrosFiltrados = registros.filter(registro => {
        return registro.data === filtroData;
    });

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Relatório de Estoque", 10, 10);
    doc.text(`Data: ${formatarData(filtroData)}`, 10, 20);

    const tableHeaders = [["Data", "Material", "Quantidade"]];
    const tableData = registrosFiltrados.map(registro => [
        formatarData(registro.data),
        registro.material,
        registro.quantidade
    ]);

    doc.autoTable({
        head: tableHeaders,
        body: tableData,
        startY: 30
    });

    doc.save("relatorio_estoque.pdf");
}
