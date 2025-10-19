'use strict'

// Elementos do HTML
const container = document.getElementById('list.container')
const botao = document.getElementById('buscar')
const combo = document.getElementById('comboGeracao')
const barra = document.getElementById('input')
let listaPokemon = []


// Funções utilitárias
function capitalize(str) {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
}

const traducaoTipos = {
    normal: "Normal",
    fire: "Fogo",
    water: "Água",
    grass: "Grama",
    electric: "Elétrico",
    ice: "Gelo",
    fighting: "Lutador",
    poison: "Venenoso",
    ground: "Terra",
    flying: "Voador",
    psychic: "Psíquico",
    bug: "Inseto",
    rock: "Pedra",
    ghost: "Fantasma",
    dragon: "Dragão",
    dark: "Sombrio",
    steel: "Aço",
    fairy: "Fada"
}

const tipoInverso = Object.fromEntries(
    Object.entries(traducaoTipos).map(([en, pt]) => [pt.toLowerCase(), en])
)

// Funções para carregar dados
async function carregarPokemons() {
    const url = `https://pokeapi.co/api/v2/pokemon/?limit=151`
    const response = await fetch(url)
    const dados = await response.json()

    const promises = dados.results.map(async (p) => {
        const resp = await fetch(p.url)
        const info = await resp.json()
        return {
            id: info.id,
            nome: info.name,
            imagem: info.sprites.front_default,
            tipos: info.types.map(t => t.type.name)
        }
    })

    listaPokemon = await Promise.all(promises)
    mostrarPokemons(listaPokemon)
}

//Busca, Filtragem e Pesquisa
function LeitorFiltro() {
    window.addEventListener('DOMContentLoaded', () => {
        const select = document.getElementById('filtro')
        
        // chamar ao mudar a opção
        select.addEventListener('change', () => {
            if (select.value == 'Nome') {
                BuscarPokemonNome()
                barra.style.display = 'inline-block'
                combo.style.display = 'none'
            } else if (select.value == 'Tipo') {
                BuscarPokemonTipo()
                barra.style.display = 'inline-block'
                combo.style.display = 'none'
            } else {
                BuscarPokemonGeracao()
                barra.style.display = 'none'
                combo.style.display = 'inline-block'
            }
        })
    })
}



async function BuscarPokemonNome() {
    const p = document.getElementById('input').value.toLowerCase().trim().replace(/\s+/g, '')
    const url = `https://pokeapi.co/api/v2/pokemon/${p}`
    const response = await fetch(url)

    if (p == "") {
        carregarPokemons()
    } else if (response.status === 404) {
        container.innerHTML = `
            <div class="erro-pokemon">
                Pokémon não encontrado!
            </div>
        `
    } else {
        const dados = await response.json()
        const pokemon = {
            id: dados.id,
            nome: dados.name,
            imagem: dados.sprites.front_default,
            tipos: dados.types.map(t => t.type.name)
        }
        listaPokemon = [pokemon]
        mostrarPokemons(listaPokemon)
    }
}

async function BuscarPokemonTipo() {
    const entrada = document.getElementById('input').value.toLowerCase().trim().replace(/\s+/g, '')
    const p = tipoInverso[entrada] || entrada
    const url = `https://pokeapi.co/api/v2/pokemon/?limit=1025`
    const response = await fetch(url)
    const dados = await response.json()

    if (p === "") {
        carregarPokemons()
    } else {
        const pokemonFiltrados = await Promise.all(
            dados.results.map(async (t) => {
                const resp = await fetch(t.url)
                const info = await resp.json()
                return {
                    id: info.id,
                    nome: info.name,
                    imagem: info.sprites.front_default,
                    tipos: info.types.map(t => t.type.name)
                }
            })
        )
        const tipoU = pokemonFiltrados.filter(t => t.tipos.includes(p))
        mostrarPokemons(tipoU)
        if (tipoU.length === 0) {
            container.innerHTML = `
            <div class="erro-pokemon">
                Tipo não encontrado!
            </div>
        `
        } else {
            mostrarPokemons(tipoU)
        }
    }

}



async function BuscarPokemonGeracao() {
    const p = document.getElementById('comboGeracao')
    const url = `https://pokeapi.co/api/v2/pokemon/?limit=1025`
    const response = await fetch(url)
    const dados = await response.json()

    if (p.value === "") {
        carregarPokemons()
    } else {
        const pokemonFiltrados = await Promise.all(
            dados.results.map(async (g) => {
                const resp = await fetch(g.url)
                const info = await resp.json()

                const speciesResp = await fetch(info.species.url)
                const species = await speciesResp.json()

                return {
                    id: info.id,
                    nome: info.name,
                    imagem: info.sprites.front_default,
                    tipos: info.types.map(t => t.type.name),
                    generation: species.generation.name
                }
            })
        )
        
        const resultado = pokemonFiltrados.filter(g => g.generation === p.value)

        if (resultado.length === 0) {
            container.innerHTML = `
            <div class="erro-pokemon">
                Geração não encontrada!
            </div>
        `
        } else {
            mostrarPokemons(resultado)
        }
    }
}





// Sugestão de busca
async function sugestoesBarra() {
    const input = document.getElementById('input')
    const listaSugestoes = document.createElement('ul')
    listaSugestoes.classList.add('sugestoes')
    input.parentNode.appendChild(listaSugestoes)

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/?limit=1025`)
    const dados = await response.json()
    const pokemons = dados.results.map(p => p.name)

    input.addEventListener('input', () => {
        const p = input.value.toLowerCase().trim().replace(/\s+/g, '')
        listaSugestoes.innerHTML = ''
        if (p.length === 0) return

        const filtrados = pokemons.filter(nome => nome.startsWith(p)).slice(0)
        filtrados.forEach(nome => {
            const item = document.createElement('li')
            item.textContent = capitalize(nome)
            item.addEventListener('click', () => {
                input.value = nome
                listaSugestoes.innerHTML = ""
                BuscarPokemonNome(select.value)
            })
            listaSugestoes.appendChild(item)
        })
    })
}


// Mostrar Pokemons
function mostrarPokemons(lista) {
    container.replaceChildren()

    lista.forEach(pokemon => {
        const card = document.createElement('div')
        card.classList.add('poke')

        const image = document.createElement('div')
        const img = document.createElement('img')
        img.src = pokemon.imagem
        image.appendChild(img)
        image.classList.add('image', pokemon.tipos[0].toLowerCase())

        const divInfos = document.createElement('div')
        divInfos.classList.add('infos')

        const nome = document.createElement('p')
        nome.classList.add('nome')
        nome.textContent = capitalize(pokemon.nome)

        const id = document.createElement('p')
        id.classList.add('id')
        id.textContent = String(pokemon.id).padStart(3, '0')

        const tiposContainer = document.createElement('div')
        tiposContainer.classList.add('tipos')
        pokemon.tipos.forEach(tipo => {
            const tipoDiv = document.createElement('div')
            tipoDiv.classList.add('tipo', tipo.toLowerCase())
            tipoDiv.textContent = capitalize(tipo)
            tiposContainer.appendChild(tipoDiv)
        })

        divInfos.append(id, nome, tiposContainer)
        card.append(image, divInfos)
        container.appendChild(card)
    })
}



// Event listeners
botao.addEventListener('click', () => {
    const select = document.getElementById('filtro').value
    if (select === 'Nome') {
        BuscarPokemonNome()
    } else if (select === 'Tipo') {
        BuscarPokemonTipo()
    } else {
        BuscarPokemonGeracao()
    }
})

document.getElementById("input").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        const select = document.getElementById('filtro').value
        if (select === 'Nome') {
            BuscarPokemonNome()
        } else if (select === 'Tipo') {
            BuscarPokemonTipo()
        } else {
            BuscarPokemonGeracao()
        }
    }
})


window.addEventListener('DOMContentLoaded', () => {
    sugestoesBarra()
})





// Inicialização
carregarPokemons()
LeitorFiltro()