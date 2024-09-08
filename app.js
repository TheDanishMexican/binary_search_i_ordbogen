"use strict";

window.addEventListener('load', start);

function start() {
    console.log('App started');
    addEventListeners();
}

function addEventListeners() {
    const searchButton = document.querySelector("#searchButton");

    searchButton.addEventListener("click", (event) => onSearchClicked(event));
}

async function onSearchClicked(event) {
    event.preventDefault();

    const searchTerm = document.querySelector("#searchTerm").value.trim();

    console.log(searchTerm);

    if (searchTerm) {
        await searchWord(searchTerm);
    }
}

async function searchWord(word) {
    const startTime = performance.now();
    let iterations = 0;

    try {
        const response = await fetch('http://localhost:8080/ordbogen');
        const { min, max } = await response.json();

        let low = min;
        let high = max;
        let foundWord = null;

        while (low <= high) {
            iterations++;
            const mid = Math.floor((low + high) / 2);

            const wordResponse = await fetch(`http://localhost:8080/ordbogen/${mid}`);
            const wordEntry = await wordResponse.json();

            const comparison = word.localeCompare(wordEntry.inflected);

            if (comparison === 0) {
                foundWord = wordEntry;
                break;
            } else if (comparison < 0) {
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }

        const endTime = performance.now();
        const timeTaken = endTime - startTime;

        displayResults(foundWord, iterations, timeTaken);

    } catch (error) {
        console.error("Error during search:", error);
    }
}

function displayResults(foundWord, iterations, timeTaken) {
    const resultsDiv = document.querySelector("#results");
    resultsDiv.innerHTML = '';

    if (foundWord) {
        resultsDiv.innerHTML = `
      <p>Word found:</p>
      <ul>
        <li><strong>Inflected:</strong> ${foundWord.inflected}</li>
        <li><strong>Headword:</strong> ${foundWord.headword}</li>
        <li><strong>Part of speech:</strong> ${foundWord.partofspeech}</li>
        <li><strong>ID:</strong> ${foundWord.id}</li>
      </ul>
    `;
    } else {
        resultsDiv.innerHTML = `<p>Word not found.</p>`;
    }

    resultsDiv.innerHTML += `
    <p>Iterations: ${iterations}</p>
    <p>Time taken: ${timeTaken.toFixed(2)} ms</p>
  `;
}

