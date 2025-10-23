'use strict'

window.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search)
    const nome = params.get('nome')
    if (nome) await carregarInfos(nome)
})

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
        speciesData.flavor_text_entries.find(e => e.language.name === 'pt')?.flavor_text ||
        speciesData.flavor_text_entries.find(e => e.language.name === 'en')?.flavor_text

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
        descricao: descricao.replace(/\s+/g, '')
    }

    console.log(pokemon)
    mostrarInfos(pokemon)
}

function mostrarInfos(pokemon) {
    const main = document.getElementById("main")
    const nome = document.createElement("h2")
    nome.textContent = pokemon.nome

    const img = document.createElement('img')
    img.src = pokemon.imagem

    main.append(nome, img)
}
