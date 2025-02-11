document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('item-form');
  const listaItens = document.getElementById('lista-itens');
  const filtroDataInput = document.getElementById('filtro-data');
  const filtrarBtn = document.getElementById('filtrar-btn');

  let estoque = []; // Inicializa o array de estoque

  // Carregar dados do LocalStorage
  function carregarEstoque() {
    const estoqueSalvo = localStorage.getItem('estoque');
    if (estoqueSalvo) {
      estoque = JSON.parse(estoqueSalvo);
      atualizarLista();
    }
  }

  // Salvar dados no LocalStorage
  function salvarEstoque() {
    localStorage.setItem('estoque', JSON.stringify(estoque));
  }

  // Adicionar item ao estoque
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = document.getElementById('data').value;
    const material = document.getElementById('material').value;
    const quantidade = parseInt(document.getElementById('quantidade').value);

    const item = { data, material, quantidade };
    estoque.push(item);
    salvarEstoque();
    atualizarLista();
    form.reset();
  });

  // Atualizar a lista de itens na tela
  function atualizarLista() {
    listaItens.innerHTML = '';
    estoque.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.data} - ${item.material} - Quantidade: ${item.quantidade}`;
      listaItens.appendChild(li);
    });
  }

  // Filtrar por data
  filtrarBtn.addEventListener('click', () => {
    const filtroData = filtroDataInput.value;
    const estoqueFiltrado = estoque.filter(item => item.data === filtroData);
    atualizarListaFiltrada(estoqueFiltrado);
  });

  // Atualizar a lista com os itens filtrados
  function atualizarListaFiltrada(estoqueFiltrado) {
    listaItens.innerHTML = '';
    estoqueFiltrado.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.data} - ${item.material} - Quantidade: ${item.quantidade}`;
      listaItens.appendChild(li);
    });
  }

  // Inicializar
  carregarEstoque();
});
