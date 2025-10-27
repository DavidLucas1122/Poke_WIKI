'use strict'

// Elementos do HTML
const container = document.getElementById('list.container')
const botao = document.getElementById('buscar')
const barra = document.getElementById('input')
const combo = document.getElementById('comboGeracao')
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

const tipoTraduzido = Object.fromEntries(
    Object.entries(traducaoTipos).map(([en, pt]) => [pt.toLowerCase(), en])
)






// Funções para carregar dados (separando em lotes de 5 em 5)
async function carregarPokemons(limite = 5) {
    const url = `https://pokeapi.co/api/v2/pokemon/?limit=151`
    const response = await fetch(url)
    const dados = await response.json()

    container.replaceChildren()


    // Carrega os Pokémon em lotes de 'limite' unidades
    for (let i = 0; i < dados.results.length; i += limite) {
        const lote = dados.results.slice(i, i + limite)

        const promises = lote.map(p => fetch(p.url).then(resp => resp.json()))
        const pokemons = await Promise.all(promises)

        const dadosFinais = pokemons.map(info => ({
            id: info.id,
            nome: info.name,
            imagem: info.sprites.front_default,
            tipos: info.types.map(t => t.type.name)
        }))

        //... pra mesclar arrays, mantendo a estrutura de listaPokemon
        listaPokemon.push(...dadosFinais)
        mostrarPokemons(listaPokemon)
    }
}


//Busca, Filtragem e Pesquisa
function LeitorFiltro() {
    const select = document.getElementById('filtro')
    // chamar ao mudar a opção
    select.addEventListener('change', () => {
        barra.value = '' // limpa o texto digitado
        const listaSugestoes = document.querySelector('.sugestoes')
        if (listaSugestoes) listaSugestoes.innerHTML = '' // limpa as sugestões

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

    if (entrada == "") {
        carregarPokemons()
        return
    }

    else {
        //Garantir que o código funcione tanto se o usuário digitar o tipo em português quanto em inglês.
        const p = tipoTraduzido[entrada] || entrada
        const url = `https://pokeapi.co/api/v2/type/${p}`
        const response = await fetch(url)
        const dados = await response.json()

        console.log(dados)

        const pokemonFiltrados = await Promise.all(
            dados.pokemon.map(async (p) => {
                const resp = await fetch(p.pokemon.url)
                const info = await resp.json()
                return {
                    id: info.id,
                    nome: info.name,
                    imagem: info.sprites.front_default,
                    tipos: info.types.map(t => t.type.name)
                }
            })
        )
        if (pokemonFiltrados.length === 0) {
            container.innerHTML = `
            <div class="erro-pokemon">
                Tipo não encontrado!
            </div>
        `
        } else {
            mostrarPokemons(pokemonFiltrados)
        }
    }
}

async function BuscarPokemonGeracao() {
    const p = document.getElementById('comboGeracao').value
    const url = `https://pokeapi.co/api/v2/generation/${p}`
    const response = await fetch(url)
    const dados = await response.json()
    listaPokemon = []

    const pokemonFiltrados = await Promise.all(
        dados.pokemon_species.map(async (species) => {
            const resp = await fetch(`https://pokeapi.co/api/v2/pokemon/${species.name}`)
            if (!resp.ok) return null
            const info = await resp.json()
            return {
                id: info.id,
                nome: info.name,
                imagem: await info.sprites.front_default,
                tipos: await info.types.map(t => t.type.name)
            }
        })
    )

    const pokemonValidados = pokemonFiltrados.filter(p => p !== null);
    pokemonValidados.sort((a, b) => a.id - b.id);

    listaPokemon = pokemonValidados;
    pokemonValidados.sort((a, b) => a.id - b.id)

    if (pokemonValidados.length === 0) {
        container.innerHTML = `
            <div class="erro-pokemon">
                Geração não encontrada!
            </div>
        `
    } else {
        mostrarPokemons(listaPokemon)
    }
}

document.getElementById('comboGeracao').addEventListener('change', BuscarPokemonGeracao)




// Sugestão de busca
async function sugestoesBarra() {
    const input = document.getElementById('input')
    const listaSugestoes = document.createElement('ul')
    listaSugestoes.classList.add('sugestoes')
    input.parentNode.appendChild(listaSugestoes)
    const select = document.getElementById('filtro')
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/?limit=1025`)
    const dados = await response.json()
    const pokemons = dados.results.map(p => p.name)


    input.addEventListener('input', () => {
        const p = input.value.toLowerCase().trim().replace(/\s+/g, '')
        listaSugestoes.innerHTML = ''

        if (select.value == 'Nome') {
            listaSugestoes.innerHTML = ''
            const filtrados = pokemons.filter(nome => nome.startsWith(p))
            filtrados.forEach(nome => {
                const item = document.createElement('li')
                item.textContent = capitalize(nome)
                item.addEventListener('click', () => {
                    input.value = nome
                    listaSugestoes.innerHTML = ""
                    BuscarPokemonNome()
                })
                listaSugestoes.appendChild(item)
            })
        } else if (select.value == 'Tipo') {
            listaSugestoes.innerHTML = ''
            const tiposFiltrados = Object.values(traducaoTipos).filter(tipo => tipo.toLowerCase().startsWith(p))
            tiposFiltrados.forEach(tipo => {
                const item = document.createElement('li')
                item.textContent = tipo
                item.addEventListener('click', () => {
                    input.value = tipo
                    listaSugestoes.innerHTML = ""
                    BuscarPokemonTipo()
                })
                listaSugestoes.appendChild(item)
            })
        }
        else {
            listaSugestoes.style.display = 'inline-block'
        }
    })
    document.addEventListener('click', (event) => {
        if (!input.contains(event.target) && !listaSugestoes.contains(event.target)) {
            listaSugestoes.innerHTML = ''
        }
    })
}




// Mostrar Pokemons
function mostrarPokemons(lista) {
    container.replaceChildren()

    lista.forEach(pokemon => {
        const link = document.createElement('a')
        const card = document.createElement('div')

        link.href = `detalhes.html?nome=${pokemon.nome.toLowerCase()}`
        card.classList.add('poke')

        // imagem com lazy loading
        const image = document.createElement('div')
        const img = document.createElement('img')
        img.src = pokemon.imagem
        image.appendChild(img)
        image.classList.add('image', pokemon.tipos[0].toLowerCase())

        // infos
        const divInfos = document.createElement('div')
        divInfos.classList.add('infos')

        const nome = document.createElement('p')
        nome.classList.add('nome')
        nome.textContent = capitalize(pokemon.nome)

        const id = document.createElement('p')
        id.classList.add('id')
        id.textContent = String(pokemon.id).padStart(3, '0')

        // tipos
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
        link.append(card)
        container.appendChild(link)
    })
}



// eventListeners
botao.addEventListener('click', () => {
    const select = document.getElementById('filtro').value
    if (select === 'Nome') {
        BuscarPokemonNome()
    } else if (select === 'Tipo') {
        BuscarPokemonTipo()
    } else if (select === 'Geração') {
        BuscarPokemonGeracao()
    }
})

input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        const select = document.getElementById('filtro').value
        if (select === 'Nome') {
            BuscarPokemonNome()
        } else if (select === 'Tipo') {
            BuscarPokemonTipo()
        } else if (select === 'Geração') {
            BuscarPokemonGeracao()
        }
    }
})


window.addEventListener('DOMContentLoaded', () => {
    sugestoesBarra()
})

carregarPokemons()
LeitorFiltro()


//Endpoints de tipos: https://pokeapi.co/api/v2/type/fire