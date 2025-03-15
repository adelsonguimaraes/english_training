let correctPhrase = ""; // Para armazenar a frase correta
let currentLevel = 1; // Nível padrão (Beginner)

// Função para gerar um hash simples baseado na frase
function gerarHash(frase) {
    let hash = 0;
    for (let i = 0; i < frase.length; i++) {
        hash = (hash << 5) - hash + frase.charCodeAt(i);
        hash |= 0; // Converte para um inteiro de 32 bits
    }
    return hash.toString();
}

// Função para salvar o resultado (acerto ou erro) no localStorage
function salvarResultado(frase, acertou, nivel) {
    const hash = gerarHash(frase);
    const dados = { hash, acerto: acertou, nivel };
    localStorage.setItem(hash, JSON.stringify(dados));
}

// Função para calcular a porcentagem de domínio de um nível
function calcularPorcentagemNivel(level) {
    const totalVariacoes = 20 * 9; // 20 objetos × 9 variações
    let totalAcertos = 0;

    // Percorre todos os itens no localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const dados = JSON.parse(localStorage.getItem(key));

        // Verifica se o item pertence ao nível atual e se foi acertado
        if (dados.nivel === level && dados.acerto) {
            totalAcertos += 1;
        }
    }

    return Math.round((totalAcertos / totalVariacoes) * 100);
}

// Função para atualizar o círculo de progresso com base no nível
function atualizarProgresso() {
    document.querySelectorAll(".progress-circle").forEach((circle, index) => {
        const nivel = index + 1; // 1: Beginner, 2: Intermediate, 3: Advanced
        const progress = calcularPorcentagemNivel(nivel);
        circle.setAttribute("data-progress", progress);
        circle.querySelector(".progress-value").textContent = `${progress}%`;
        const gradient = `conic-gradient(#4caf50 ${progress}%, #333333 ${progress}% 100%)`;
        circle.style.background = gradient;
    });
}

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

// Função para remover o ponto final de uma frase
function removerPontoFinal(frase) {
    return frase.replace(/\.$/, ""); // Remove o ponto final, se existir
}

// Função para lidar com o envio da resposta
function handleSubmit() {
    const userInput = document.getElementById("user-input").value.trim();
    const resultDiv = document.getElementById("result");

    // Remove o ponto final da entrada do usuário e da frase correta
    const userInputSemPonto = removerPontoFinal(userInput);
    const correctPhraseSemPonto = removerPontoFinal(correctPhrase);

    if (userInputSemPonto === correctPhraseSemPonto) {
        resultDiv.textContent = "Congratulations! You got it right!";
        resultDiv.style.color = "green";
        salvarResultado(correctPhrase, true, currentLevel); // Salva o acerto
    } else {
        resultDiv.textContent = `Incorrect. The correct phrase was: "${correctPhrase}"`;
        resultDiv.style.color = "red";
        salvarResultado(correctPhrase, false, currentLevel); // Salva o erro
    }

    // Bloqueia o campo de texto para leitura
    document.getElementById("user-input").readOnly = true;
    document.getElementById("user-input").style.backgroundColor = "gray";

    // Altera o texto do botão para "New Phrase"
    document.getElementById("submit-btn").textContent = "New Phrase";

    // Remove o evento de envio e adiciona o evento de reset
    submitBtn.removeEventListener("click", handleSubmit);
    submitBtn.addEventListener("click", resetarCampo);

    // Atualiza o progresso após salvar o resultado
    atualizarProgresso();
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

// Atualiza o progresso ao carregar a página
window.addEventListener("load", atualizarProgresso);