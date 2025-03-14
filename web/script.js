let correctPhrase = ""; // Para armazenar a frase correta

// Função para carregar o banco de dados
async function carregarBancoDeDados(caminho) {
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

// Função para sortear uma frase
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

// Função principal para iniciar o sistema
async function iniciarSistema() {
    const database = await carregarBancoDeDados("../db.json"); // Caminho do JSON
    if (database.length > 0) {
        sortearFrases(database);
    } else {
        document.getElementById("shown-phrase").textContent = "Erro ao carregar o banco de dados.";
    }
}

// Evento para verificar a resposta do usuário
document.getElementById("submit-btn").addEventListener("click", () => {
    const userInput = document.getElementById("user-input").value.trim();
    const resultDiv = document.getElementById("result");

    if (userInput === correctPhrase) {
        resultDiv.textContent = "Parabéns! Você acertou!";
        resultDiv.style.color = "green";
    } else {
        resultDiv.textContent = `Resposta incorreta. A frase correta era: "${correctPhrase}"`;
        resultDiv.style.color = "red";
    }

    // Limpa o campo de entrada
    document.getElementById("user-input").value = "";

    // Sorteia novas frases
    iniciarSistema();
});

// Inicia o sistema ao carregar a página
iniciarSistema();
