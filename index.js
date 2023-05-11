let d = document,
  $pokemonContainer = d.getElementById("pokemon-container"),
  $target = d.getElementById("target"),
  $loader = d.querySelector("#target div"),
  $inputsCheckboxContainer = document.querySelector(".input-checkbox"),
  $allPokemonInputs = document.querySelectorAll(".checkbox-type"),
  $pokemonsCount = document.getElementById("pokemons-count"),
  // $search = d.getElementById("search"),
  $fragment = d.createDocumentFragment();

let offset = 0;
const limit = 20;
const pokeElements = 20;
const pokemonAPI = `https://pokeapi.co/api/v2/pokemon`;
const typeFilters = new Set();

d.addEventListener("DOMContentLoaded", (e) => {
  renderPokemon(pokemonAPI, 0);
  handleIntersectionObserver();
  handleMutationObserver();
});

const renderPokemon = async (url, offset = 0, limit = 20) => {
  try {
    let res = await fetch(`${url}/?offset=${offset}&limit=${limit}`);
    if (!res.ok)
      throw {
        status: res.status || "0",
        statusText: res.statusText || "Ocurrió un error",
      };

    let json = await res.json();

    const { results } = json;
    for (let i = 0; i < results.length; i++) {
      try {
        let res = await fetch(results[i].url);
        if (!res.ok)
          throw {
            status: res.status || "0",
            statusText: res.statusText || "Ocurrió un error",
          };

        let json = await res.json();
        // container elements
        const divContainer = document.createElement("div");
        const divImageContainer = document.createElement("div");
        const divInfoContainer = document.createElement("div");
        const divStatsContainer = document.createElement("div");

        divContainer.classList.add("div-pokemon-container");
        divImageContainer.classList.add("div-image-container");
        divInfoContainer.classList.add("div-info-container");
        divStatsContainer.classList.add("div-stats-container");

        // img elements
        const img = document.createElement("img");
        // info elements
        const name = document.createElement("p");
        const hp = document.createElement("p");
        const type = document.createElement("p");
        const hr = document.createElement("hr");
        // stats elements
        const attack = document.createElement("p");
        const defense = document.createElement("p");
        const speed = document.createElement("p");

        // img content
        img.src = json.sprites.front_default;
        // info content
        name.textContent = json.name;
        hp.textContent = `${json.stats[0].base_stat} HP`;
        type.textContent = `${json.types[0].type.name}`;
        // stats content
        attack.textContent = `Attack ${json.stats[1].base_stat}`;
        defense.textContent = `Defense ${json.stats[2].base_stat}`;
        speed.textContent = `Speed ${json.stats[5].base_stat}`;

        // img append
        divImageContainer.appendChild(img);

        // info append
        divInfoContainer.appendChild(name);
        divInfoContainer.appendChild(hp);
        divInfoContainer.appendChild(type);
        divInfoContainer.appendChild(hr);

        // stats append
        divStatsContainer.appendChild(attack);
        divStatsContainer.appendChild(defense);
        divStatsContainer.appendChild(speed);

        // containers append
        divContainer.appendChild(divImageContainer);
        divContainer.appendChild(divInfoContainer);
        divContainer.appendChild(divStatsContainer);

        // Agregamos los nuevos tipos de pokemones al Set
        typeFilters.add(type.textContent);
        // Comprobamos los inputs de tipos de pokemon para mostrar o no mostrar los nuevos pokemones
        // Si el tipo de pokemon coincide con algún input en valor unchecked entonces agrega la clase none
        [...$allPokemonInputs]
          .filter((input) => !input.checked)
          .map((el) => el.value)
          .some((palabra) => palabra.includes(type.textContent))
          ? divContainer.classList.add("none")
          : null;

        $fragment.appendChild(divContainer);
      } catch (error) {
        console.log(error);
      }
    }
    createFilters(typeFilters);
    $pokemonContainer.appendChild($fragment);
    // Pokemons Count
    $pokemonsCount.textContent = `Filtrando ${pokeElements + offset} pokemones`;
  } catch (err) {
    console.log(err);
  }
};
const createFilters = (typeFilters) => {
  let html = "";
  // Traemos los filtros que tienen el valor unchecked
  let getFilterUnchecked =
    // Si el tamaño del nodeList es 0 (porque es la primera carga) entonces forzamos un null para la siguiente validación
    d.querySelectorAll(".checkbox-type").length > 0
      ? [...d.querySelectorAll(".checkbox-type")]
          .filter((el) => !el.checked)
          .map((el) => el.value)
      : null;
  // Iteramos cada tipo de pokemon
  [...typeFilters].forEach((type) => {
    html += `
    <div>
    <label for="${type}">${type}</label>
    <input
      type="checkbox"
      name="type"
      class="checkbox-type"
      value="${type}"
      ${
        // En la primera carga mandamos todos con valor checked
        getFilterUnchecked
          ? // Si coincide el tipo de pokemon con algún unchecked lo mantenemos, los demás serán checked (incluido los nuevos tipos de pokemones)
            getFilterUnchecked.some((typeFilter) => typeFilter.includes(type))
            ? null
            : "checked"
          : "checked"
      }
    />
  </div>`;
  });
  $inputsCheckboxContainer.innerHTML = html;
};
const handleIntersectionObserver = () => {
  let options = {
    rootMargin: "0px",
  };
  function handleIntersect(entries, observer) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        $loader.classList.remove("none");
        $loader.classList.add("is-visible");
        offset += limit;
        renderPokemon(pokemonAPI, offset);
      } else {
        $loader.classList.remove("is-visible");
        $loader.classList.add("none");
        // observer.disconnect();
      }
    });
  }
  let observer = new IntersectionObserver(handleIntersect, options);
  return observer.observe($target);
};
const handleMutationObserver = () => {
  const config = { childList: true, subtree: true };

  const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        $allPokemonInputs = document.querySelectorAll(".checkbox-type");
        inputCheckbox($allPokemonInputs);
      }
    }
  };
  const observer = new MutationObserver(callback);

  observer.observe($inputsCheckboxContainer, config);
};

// $search.addEventListener("keyup", (e) => {
//   let value = e.target.value;
//   let $pokemonCards = document.querySelectorAll(".div-pokemon-container");

//   $pokemonCards.forEach((pokemonCard) =>
//     pokemonCard.childNodes[1].childNodes[0].innerHTML.includes(value)
//       ? pokemonCard.classList.remove("none")
//       : pokemonCard.classList.add("none")
//   );
// });
function inputCheckbox($allPokemonInputs) {
  $allPokemonInputs.forEach((checkbox) =>
    checkbox.addEventListener("change", (e) => {
      let $pokemonCards = document.querySelectorAll(".div-pokemon-container");
      const getChecked = [...$allPokemonInputs]
        .filter((input) => !input.checked)
        .map((el) => el.value);

      [...$pokemonCards].forEach((card) => {
        let pokemonType = card.childNodes[1].childNodes[2].textContent;
        getChecked.some((palabra) => palabra.includes(pokemonType))
          ? card.classList.add("none")
          : card.classList.remove("none");
      });
    })
  );
}
