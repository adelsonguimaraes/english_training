import random
import json

# Função para carregar o banco de dados do arquivo JSON
def carregar_banco_de_dados(caminho_arquivo):
    try:
        with open(caminho_arquivo, "r") as arquivo:
            dados = json.load(arquivo)
        return dados
    except FileNotFoundError:
        print(f"Erro: O arquivo '{caminho_arquivo}' não foi encontrado.")
        return []
    except json.JSONDecodeError:
        print(f"Erro: O arquivo '{caminho_arquivo}' não é um JSON válido.")
        return []

# Função para sortear frases dentro do mesmo objeto
def sortear_frases(db):
    if not db:
        print("O banco de dados está vazio. Certifique-se de que o arquivo db.json está correto.")
        return None, None, None, None

    tempos = ["past", "present", "future"]
    tipos = ["question", "affirmative", "negative"]

    # Sorteia um único objeto
    objeto_sorteado = random.choice(db)

    # Sorteia a primeira frase (mostrada)
    tempo1 = random.choice(tempos)
    tipo1 = random.choice(tipos)
    frase_mostrada = objeto_sorteado[tempo1][tipo1]

    # Sorteia a segunda frase (desafio) dentro do mesmo objeto
    tempo2 = random.choice(tempos)
    tipo2 = random.choice(tipos)

    # Garante que a frase do desafio seja diferente da mostrada
    while tempo1 == tempo2 and tipo1 == tipo2:
        tempo2 = random.choice(tempos)
        tipo2 = random.choice(tipos)

    frase_desafio = objeto_sorteado[tempo2][tipo2]

    return frase_mostrada, tempo2, tipo2, frase_desafio

# Carrega o banco de dados do arquivo JSON
caminho_arquivo = "db.json"
banco_de_dados = carregar_banco_de_dados(caminho_arquivo)

# Executar o sorteio
frase_mostrada, tempo_desafio, tipo_desafio, frase_desafio = sortear_frases(banco_de_dados)

if frase_mostrada and frase_desafio:
    # Exibe a primeira frase (mostrada)
    print("Frase mostrada:", frase_mostrada)

    # Indica o tempo verbal e tipo da frase do desafio
    print(f"Desafio: Escreva uma frase no tempo '{tempo_desafio}' e do tipo '{tipo_desafio}'.")

    # Recebe a resposta do usuário
    resposta = input("Digite a frase correspondente: ")

    # Verifica se a resposta está correta
    if resposta.strip() == frase_desafio:
        print("Parabéns! Você acertou!")
    else:
        print("Não foi dessa vez. A resposta correta é:", frase_desafio)
