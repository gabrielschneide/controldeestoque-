import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, onSnapshot } from "firebase/firestore";

export default function MaterialForm() {
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "materiais"), (snapshot) => {
      const listaMateriais = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMateriais(listaMateriais);
    });

    return () => unsubscribe();
  }, []);

  const adicionarMaterial = async (e) => {
    e.preventDefault();
    if (!nome || !quantidade) {
      alert("Preencha todos os campos!");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "materiais"), {
        nome,
        quantidade,
      });
      setNome("");
      setQuantidade("");
      console.log("Material adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar material: ", error);
      alert("Erro ao salvar no banco de dados");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Cadastro de Materiais</h2>
      <form onSubmit={adicionarMaterial}>
        <input
          type="text"
          placeholder="Nome do material"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <input
          type="number"
          placeholder="Quantidade"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Adicionar"}
        </button>
      </form>
      <h3>Lista de Materiais</h3>
      <ul>
        {materiais.map((material) => (
          <li key={material.id}>
            {material.nome} - {material.quantidade}
          </li>
        ))}
      </ul>
    </div>
  );
}
