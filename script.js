"use strict";

// Configuração do Supabase
const SUPABASE_URL = "https://yzzfaudngbowilrhdinu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6emZhdWRuZ2Jvd2lscmhkaW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4Njc4NzYsImV4cCI6MjA1NDQ0Mzg3Nn0.GZsXRAEZ5lwVJhZbyDoldZkYBz6gupK_SuOBvlXtDew";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let registros = [];
let editandoId = null;

// ================= FUNÇÕES PRINCIPAIS =================

async function carregarDados() {
    try {
        const { data, error } = await supabase.from("materiais").select("*");
        if (error) throw error;

        registros = data;
        buscarRegistros();
        showMessage('Dados carregados!', 'success');
    } catch (error) {
        showMessage('Erro ao carregar dados: ' + error.message, 'error');
    }
}

async function salvarRegistro(registro) {
    try {
        if (editandoId) {
            const { error } = await supabase
                .from("materiais")
                .update(registro)
                .eq('id', editandoId);
            if (error) throw error;
            showMessage('Registro atualizado!');
        } else {
            const { error } = await supabase
                .from("materiais")
                .insert([registro]);
            if (error) throw error;
            showMessage('Registro salvo!');
        }
        await carregarDados();
    } catch (error) {
        showMessage('Erro ao salvar: ' + error.message, 'error');
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

    const registro = { 
        data, 
        nomeMaterial: nome, 
        quantidade: qtd 
    };
    
    await salvarRegistro(registro);
    limparFormulario();
}

// ================= FUNÇÕES AUXILIARES =================

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

// Função adicionada para edição
function editarRegistro(id) {
    const registro = registros.find(r => r.id === id);
    if (registro) {
        editandoId = id;
        document.getElementById('dataRegistro').value = registro.data;
        document.getElementById('nomeMaterial').value = registro.nomeMaterial;
        document.getElementById('quantidade').value = registro.quantidade;
    }
}

async function excluirRegistro(id) {
    if (confirm('Excluir registro permanentemente?')) {
        try {
            const { error } = await supabase.from("materiais").delete().eq('id', id);
            if (error) throw error;
            showMessage('Registro excluído!');
            await carregarDados();
        } catch (error) {
            showMessage('Erro ao excluir: ' + error.message, 'error');
        }
    }
}

function limparFormulario() {
    document.getElementById('materialForm').reset();
    editandoId = null;
}

function showMessage(msg, tipo = 'success') {
    const div = document.getElementById('statusMessage');
    div.className = `status-message ${tipo}`;
    div.textContent = msg;
    div.style.display = 'block';
    setTimeout(() => div.style.display = 'none', 3000);
}

// ================= INICIALIZAÇÃO =================
window.addEventListener('load', carregarDados);
