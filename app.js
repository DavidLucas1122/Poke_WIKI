'use strict'

//Elementos do HTML
const container = document.getElementById('list.container')
let listaPokemon = []

//Trazer dados
async function carregarPokemons() {
    const url = `https://pokeapi.co/api/v2/pokemon/?limit=151`
    const response = await fetch(url)
    const dados = await response.json()

    //p = pokémon
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

//Sugestão de busca
async function sugestoesBarra() {
    const input = document.getElementById('input')
    const listaSugestoes = document.createElement('ul')
    listaSugestoes.classList.add('sugestoes')
    input.parentNode.appendChild(listaSugestoes)

    let pokemons = []
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/?limit=1025`)
    const dados = await response.json()
    pokemons = dados.results.map(p => p.name)

    input.addEventListener('input', () => {
        const p = document.getElementById('input').value.toLowerCase().trim().replace(/\s+/g, '')
        listaSugestoes.innerHTML = ''
        if (p.length === 0) {
            return
        }
        const filtrados = pokemons.filter(nome => nome.startsWith(p)).slice(0, 8)

        filtrados.forEach(nome => {
            const item = document.createElement('li')
            item.textContent = capitalize(nome)
            item.addEventListener('click', () => {
                input.value = nome
                listaSugestoes.innerHTML = ""
                carregarPokemonsPosBusca()
            })
            listaSugestoes.appendChild(item)
        })
    })
}

window.addEventListener('DOMContentLoaded', () => {
    sugestoesBarra()
})

//Trazer dados para a busca
async function carregarPokemonsPosBusca() {
    const p = document.getElementById('input').value.toLowerCase().trim().replace(/\s+/g, '')

    const url = `https://pokeapi.co/api/v2/pokemon/${p}`
    const response = await fetch(url)

    //p = pokémon
    if (p == "") {
        carregarPokemons()
    }
    else if (response.status === 404) {
        container.innerHTML = `
        <div class="erro-pokemon">
            Pokémon não encontrado!
        </div>
    `
    }
    else {
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

//Pesquisar com o Botão
const botao = document.getElementById('buscar')
botao.addEventListener('click', carregarPokemonsPosBusca)
//Pesquisar com Enter
document.getElementById("input").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        carregarPokemonsPosBusca()
    }
})


//Mostrar Pokemons
function mostrarPokemons(lista) {
    container.replaceChildren()

    lista.forEach(pokemon => {
        const card = document.createElement('div')
        card.classList.add('poke')

        const image = document.createElement('div')


        const img = document.createElement('img')
        img.src = pokemon.imagem

        //Coloca a img no container image
        image.appendChild(img)

        const divInfos = document.createElement('div')
        divInfos.classList.add('infos')

        const nome = document.createElement('p')
        nome.classList.add('nome')
        const id = document.createElement('p')
        id.classList.add('id')
        nome.textContent = pokemon.nome
        nome.textContent = capitalize(pokemon.nome)

        id.textContent = String(pokemon.id).padStart(3, '0')




        const tiposContainer = document.createElement('div')
        tiposContainer.classList.add('tipos')
        pokemon.tipos.forEach((tipo) => {
            const tipoDiv = document.createElement('div')
            tipoDiv.classList.add('tipo', tipo.toLowerCase())
            tipoDiv.textContent = tipo
            tipoDiv.textContent = capitalize(tipo)
            tiposContainer.appendChild(tipoDiv)
        })
        image.classList.add('image', pokemon.tipos[0].toLowerCase())



        divInfos.append(id, nome, tiposContainer)

        card.append(image, divInfos)
        container.appendChild(card)
    });
}

//Deixar a primeira letra maiúscula
function capitalize(str) {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
}

carregarPokemons()