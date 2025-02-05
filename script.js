console.log("Script carregado");

let registros = JSON.parse(localStorage.getItem('registrosEstoque')) || [];

console.log("Registros carregados:", registros);

// Função para validar e adicionar registro
function validarFormulario() {
    const dataRegistro = document.getElementById('dataRegistro').value;
    const nomeMaterial = document.getElementById('nomeMaterial').value.trim();
    const quantidade = document.getElementById('quantidade').value.trim();
    const operacao = document.getElementById('operacao').value;

    if (!dataRegistro || !nomeMaterial || !quantidade) {
        alert('Preencha todos os campos obrigatórios!');
        return;
    }

    const registro = {
        id: Date.now(),
        data: dataRegistro,
        material: nomeMaterial,
        quantidade: parseInt(quantidade),
        operacao: operacao
    };

    registros.unshift(registro);
    localStorage.setItem('registrosEstoque', JSON.stringify(registros));
    limparFormulario();
    atualizarHistorico(registros);
}

// Função para atualizar o histórico
function atualizarHistorico(registrosFiltrados) {
    const tbody = document.getElementById('historicoBody');
    tbody.innerHTML = '';

    registrosFiltrados.forEach(registro => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatarData(registro.data)}</td>
            <td>${registro.material}</td>
            <td>${registro.quantidade}</td>
            <td>${registro.operacao === 'entrada' ? 'Entrada' : 'Saída'}</td>
            <td>
                <button class="excluir-btn" onclick="excluirRegistro(${registro.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Função para excluir registro
function excluirRegistro(id) {
    registros = registros.filter(registro => registro.id !== id);
    localStorage.setItem('registrosEstoque', JSON.stringify(registros));
    atualizarHistorico(registros);
}

// Função para formatar data
function formatarData(dataString) {
    const data = new Date(dataString);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

// Função para limpar formulário
function limparFormulario() {
    document.getElementById('dataRegistro').value = '';
    document.getElementById('nomeMaterial').value = '';
    document.getElementById('quantidade').value = '';
    document.getElementById('operacao').value = 'entrada';
}

// Carregar histórico ao iniciar
atualizarHistorico(registros);
