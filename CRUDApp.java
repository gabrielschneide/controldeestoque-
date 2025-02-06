import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

class Item {
    int id;
    String nome;

    public Item(int id, String nome) {
        this.id = id;
        this.nome = nome;
    }

    @Override
    public String toString() {
        return "ID: " + id + ", Nome: " + nome;
    }
}

public class CRUDApp {
    private static List<Item> lista = new ArrayList<>();
    private static int editandoId = -1; // Inicializa com -1 para indicar que nenhum item está sendo editado
    private static Scanner scanner = new Scanner(System.in);

    public static void main(String[] args) {
        int opcao;
        do {
            System.out.println("\n===== MENU =====");
            System.out.println("1 - Adicionar Item");
            System.out.println("2 - Listar Itens");
            System.out.println("3 - Editar Item");
            System.out.println("4 - Excluir Item");
            System.out.println("5 - Sair");
            System.out.print("Escolha uma opção: ");
            opcao = scanner.nextInt();
            scanner.nextLine(); // Consumir quebra de linha

            switch (opcao) {
                case 1:
                    adicionarItem();
                    break;
                case 2:
                    listarItens();
                    break;
                case 3:
                    editarItem();
                    break;
                case 4:
                    excluirItem();
                    break;
                case 5:
                    System.out.println("Saindo...");
                    break;
                default:
                    System.out.println("Opção inválida! Tente novamente.");
            }
        } while (opcao != 5);
    }

    private static void adicionarItem() {
        System.out.print("Digite o nome do item: ");
        String nome = scanner.nextLine();
        int id = lista.size() + 1;
        lista.add(new Item(id, nome));
        System.out.println("Item adicionado com sucesso!");
    }

    private static void listarItens() {
        if (lista.isEmpty()) {
            System.out.println("Nenhum item cadastrado.");
        } else {
            System.out.println("\n===== LISTA DE ITENS =====");
            for (Item item : lista) {
                System.out.println(item);
            }
        }
    }

    private static void editarItem() {
        System.out.print("Digite o ID do item a ser editado: ");
        editandoId = scanner.nextInt();
        scanner.nextLine(); // Consumir quebra de linha

        boolean encontrado = false;
        for (Item item : lista) {
            if (item.id == editandoId) {
                System.out.print("Digite o novo nome: ");
                String novoNome = scanner.nextLine();
                item.nome = novoNome;
                encontrado = true;
                System.out.println("Item atualizado com sucesso!");
                break;
            }
        }

        if (!encontrado) {
            System.out.println("ID não encontrado.");
        }

        editandoId = -1; // Resetando o ID após a edição
    }

    private static void excluirItem() {
        System.out.print("Digite o ID do item a ser excluído: ");
        int idExcluir = scanner.nextInt();
        scanner.nextLine(); // Consumir quebra de linha

        boolean removido = lista.removeIf(item -> item.id == idExcluir);

        if (removido) {
            System.out.println("Item removido com sucesso!");
        } else {
            System.out.println("ID não encontrado.");
        }
    }
}
