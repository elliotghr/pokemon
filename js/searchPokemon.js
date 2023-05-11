import { getHtml } from "./includeHtml.js";

document.addEventListener("DOMContentLoaded", (e) => {
  getHtml();
});

document.addEventListener("keyup", (e) => {
  getHtml();
  if (e.key === "Enter") {
    getPokemon(e.target.value);
  }
});

const getPokemon = async (pokemon) => {
  try {
    let res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
    if (!res.ok)
      throw {
        status: res.status,
        statusText: res.statusText,
      };

    let json = await res.json();
    renderPokemon([json]);
  } catch (error) {
    console.log(error);
  }
};

const renderPokemon = (data) => {
  let html = "";
  data.forEach((el) => {
    html = `
        <h2>${el.name}</h2>
        <img src='${el.sprites.front_default}'>
        <p>${el.stats[0].stat.name}<span>${el.stats[2].base_stat}</span></p>
        <p>${el.stats[1].stat.name}<span>${el.stats[1].base_stat}</span></p>
        <p>${el.stats[2].stat.name}<span>${el.stats[2].base_stat}</span></p>
        `;
  });
  document.querySelector(".pokemon-container").innerHTML = html;
};
