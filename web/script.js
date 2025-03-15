let correctPhrase = ""; // Para armazenar a frase correta
let currentLevel = 1; // Nível padrão (Beginner)

// Função para carregar o banco de dados com base no nível
async function carregarBancoDeDados(level) {
    let caminho;
    switch (level) {
        case 1:
            caminho = "../db/beginner.json";
            break;
        case 2:
            caminho = "../db/intermediate.json";
            break;
        case 3:
            caminho = "../db/advanced.json";
            break;
        default:
            throw new Error("Nível inválido");
    }

    try {
        const response = await fetch(caminho);
        if (!response.ok) {
            throw new Error(`Erro ao carregar o banco de dados: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erro:", error);
        return [];
    }
}

// Função para sortear uma frase com base no nível
function sortearFrases(db) {
    const tempos = ["past", "present", "future"];
    const tipos = ["question", "affirmative", "negative"];

    // Sorteia um objeto do banco de dados
    const objeto = db[Math.floor(Math.random() * db.length)];

    // Sorteia a frase mostrada
    const tempo1 = tempos[Math.floor(Math.random() * tempos.length)];
    const tipo1 = tipos[Math.floor(Math.random() * tipos.length)];
    const fraseMostrada = objeto[tempo1][tipo1];

    // Sorteia a frase do desafio
    let tempo2, tipo2;
    do {
        tempo2 = tempos[Math.floor(Math.random() * tempos.length)];
        tipo2 = tipos[Math.floor(Math.random() * tipos.length)];
    } while (tempo1 === tempo2 && tipo1 === tipo2);

    correctPhrase = objeto[tempo2][tipo2];

    // Atualiza a interface do usuário
    document.getElementById("shown-phrase").textContent = `"${fraseMostrada}"`;
    document.getElementById("tense").textContent = tempo2;
    document.getElementById("type").textContent = tipo2;
}

// Função para resetar o campo e sortear uma nova frase
function resetarCampo() {
    document.getElementById("user-input").value = ""; // Limpa o campo
    document.getElementById("user-input").readOnly = false; // Libera o campo para edição
    document.getElementById("submit-btn").textContent = "Submit Answer"; // Volta o texto do botão
    document.getElementById("result").textContent = ""; // Limpa a mensagem de resultado
    document.getElementById("user-input").style.backgroundColor = "white";

    submitBtn.removeEventListener("click", resetarCampo);
    submitBtn.addEventListener("click", handleSubmit);
    iniciarSistema(); // Sorteia uma nova frase
}

// Função principal para iniciar o sistema
async function iniciarSistema() {
    const database = await carregarBancoDeDados(currentLevel); // Carrega o banco de dados do nível selecionado
    if (database.length > 0) {
        sortearFrases(database);
    } else {
        document.getElementById("shown-phrase").textContent = "Error loading database.";
    }
}

// Função para lidar com o envio da resposta
function handleSubmit() {
    const userInput = document.getElementById("user-input").value.trim();
    const resultDiv = document.getElementById("result");

    if (userInput === correctPhrase) {
        resultDiv.textContent = "Congratulations! You got it right!";
        resultDiv.style.color = "green";
    } else {
        resultDiv.textContent = `Incorrect. The correct phrase was: "${correctPhrase}"`;
        resultDiv.style.color = "red";
    }

    // Bloqueia o campo de texto para leitura
    document.getElementById("user-input").readOnly = true;
    document.getElementById("user-input").style.backgroundColor = "gray";

    // Altera o texto do botão para "New Phrase"
    document.getElementById("submit-btn").textContent = "New Phrase";

    // Remove o evento de envio e adiciona o evento de reset
    submitBtn.removeEventListener("click", handleSubmit);
    submitBtn.addEventListener("click", resetarCampo);
}

// Adiciona o evento de clique aos botões de nível
document.querySelectorAll(".level-btn").forEach(button => {
    button.addEventListener("click", () => {
        currentLevel = parseInt(button.getAttribute("data-level")); // Define o nível selecionado
        document.getElementById("menu").style.display = "none"; // Oculta o menu
        document.getElementById("game").style.display = "block"; // Exibe o jogo
        iniciarSistema(); // Inicia o jogo com o nível selecionado
    });
});

// Adiciona o evento de clique ao botão de enviar
const submitBtn = document.getElementById("submit-btn");
submitBtn.addEventListener("click", handleSubmit);