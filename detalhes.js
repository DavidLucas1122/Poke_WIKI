'use strict'


window.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search)
    const nome = params.get('nome')
    if (nome) await carregarInfos(nome)
})

function capitalize(str) {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
}

const abreviacoes = {
    hp: 'HP',
    attack: 'ATK',
    defense: 'DEF',
    'special-attack': 'SP.ATK',
    'special-defense': 'SP.DEF',
    speed: 'SPD'
}



//Após Clicar em Pokémon
async function carregarInfos(nomeId) {
    const url = `https://pokeapi.co/api/v2/pokemon/${nomeId}`
    const response = await fetch(url)
    const info = await response.json()
    console.log(info)

    //Outro Fetch, pois as infos que preciso então dentros de outra url
    const speciesResp = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${info.id}`)
    const speciesData = await speciesResp.json()
    console.log(speciesData)

    const descricao =
        speciesData.flavor_text_entries.find(e => e.language.name === 'pt') ||
        speciesData.flavor_text_entries.find(e => e.language.name === 'en');

    const descricaoLimpa = descricao.flavor_text.replace(/\n|\f/g, ' ').trim()
    const pokemon = {
        id: info.id,
        nome: info.name,
        imagem: info.sprites.front_default,
        imagemShiny: info.sprites.front_shiny,
        tipos: info.types.map(t => t.type.name),
        altura: info.height / 10,
        peso: info.weight / 10,
        status: info.stats.map(s => ({ nome: s.stat.name, valor: s.base_stat })),
        habilidades: info.abilities.map(a => a.ability.name),
        descricao: descricaoLimpa
    }
    console.log(pokemon)
    mostrarInfos(pokemon)
}

function mostrarInfos(pokemon) {
    //Get Elements
    const foto = document.getElementById("foto")
    const nome = document.getElementById("nome")
    const shiny = document.getElementById("shiny")
    const tiposContainer = document.getElementById('tipos_info')
    const stats = document.getElementById("stats")
    const descricao = document.getElementById("descricao")
    const peso = document.getElementById("peso")
    const altura = document.getElementById("altura")

    foto.className = `foto ${pokemon.tipos[0].toLowerCase()}` //Puxar cores para borda

    //Create ELements
    const img = document.createElement('img')
    nome.textContent = capitalize(pokemon.nome)
    img.src = pokemon.imagem
    foto.appendChild(img)

    shiny.replaceWith(shiny.cloneNode(true)) //Clonar o botão para substituir o antigo, para assim, não pegar eventListeners antigoss
    const novoShiny = document.getElementById("shiny")

    novoShiny.addEventListener('click', () => {
        img.src = (img.src === pokemon.imagem) ? pokemon.imagemShiny : pokemon.imagem
    })
    tiposContainer.classList.add('tipos')
    pokemon.tipos.forEach(tipo => {
        const tipoDiv = document.createElement('div')
        tipoDiv.classList.add('tipo', tipo.toLowerCase())
        tipoDiv.textContent = capitalize(tipo)
        tiposContainer.appendChild(tipoDiv)
    })

    pokemon.status.forEach(s => {
        const linha = document.createElement('div')
        linha.classList.add('stat')

        const nome = document.createElement('p')
        nome.textContent = abreviacoes[s.nome.toLowerCase()] || capitalize(s.nome)
        nome.classList.add('nome')

        const barra = document.createElement('div')
        barra.classList.add('barra')

        const valor = document.createElement('div')
        valor.classList.add('valor')
        valor.style.width = `${(s.valor / 255) * 100}%`
        valor.textContent = s.valor

        barra.appendChild(valor)
        linha.appendChild(nome)
        linha.appendChild(barra)
        stats.appendChild(linha)
    })

    descricao.textContent = pokemon.descricao
    peso.textContent = `Peso: ${pokemon.peso} kg`
    altura.textContent = `Altura: ${pokemon.altura} m`
}

