// Configurez votre clé OMDb ici
const OMDB_API_KEY = 'VOTRE_CLE_API'; // <-- Remplacez par votre clé OMDb

const searchForm = document.getElementById('searchForm');
const queryInput = document.getElementById('query');
const resultsEl = document.getElementById('results');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const pageInfo = document.getElementById('pageInfo');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');

let currentQuery = '';
let currentPage = 1;
let totalResults = 0;

searchForm.addEventListener('submit', e => {
  e.preventDefault();
  currentQuery = queryInput.value.trim();
  if (!currentQuery) return;
  currentPage = 1;
  searchMovies(currentQuery, currentPage);
});

prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    searchMovies(currentQuery, currentPage);
  }
});
nextBtn.addEventListener('click', () => {
  const lastPage = Math.ceil(totalResults / 10);
  if (currentPage < lastPage) {
    currentPage++;
    searchMovies(currentQuery, currentPage);
  }
});

async function searchMovies(q, page=1) {
  resultsEl.innerHTML = '<p>Chargement…</p>';
  pageInfo.textContent = '';
  try {
    const res = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(q)}&page=${page}`);
    const data = await res.json();
    if (data.Response === 'False') {
      resultsEl.innerHTML = `<p>${data.Error}</p>`;
      prevBtn.disabled = nextBtn.disabled = true;
      return;
    }
    totalResults = parseInt(data.totalResults,10);
    renderResults(data.Search);
    updatePagination();
  } catch (err) {
    resultsEl.innerHTML = '<p>Erreur réseau.</p>';
  }
}

function renderResults(items) {
  resultsEl.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('article');
    card.className = 'card';
    const img = document.createElement('img');
    img.src = item.Poster !== 'N/A' ? item.Poster : 'https://via.placeholder.com/300x450?text=No+Image';
    img.alt = `${item.Title} poster`;
    const title = document.createElement('h3');
    title.textContent = item.Title;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `<span>${item.Year}</span><span>${item.Type}</span>`;
    const more = document.createElement('button');
    more.textContent = 'Détails';
    more.addEventListener('click', () => showDetails(item.imdbID));
    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(more);
    resultsEl.appendChild(card);
  });
}

function updatePagination() {
  const lastPage = Math.ceil(totalResults / 10);
  pageInfo.textContent = `Page ${currentPage} / ${lastPage} — ${totalResults} résultats`;
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= lastPage;
}

async function showDetails(imdbID) {
  modalBody.innerHTML = '<p>Chargement…</p>';
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden','false');
  try {
    const res = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${imdbID}&plot=full`);
    const data = await res.json();
    if (data.Response === 'False') {
      modalBody.innerHTML = `<p>${data.Error}</p>`;
      return;
    }
    modalBody.innerHTML = `
      <div style="display:flex;gap:1rem;flex-wrap:wrap">
        <img src="${data.Poster !== 'N/A' ? data.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}" alt="${data.Title}" style="width:200px;height:auto;border-radius:6px"/>
        <div style="flex:1;min-width:200px">
          <h2 style="margin-top:0">${data.Title} (${data.Year})</h2>
          <p><strong>Genre:</strong> ${data.Genre}</p>
          <p><strong>Réalisateur:</strong> ${data.Director}</p>
          <p><strong>Acteurs:</strong> ${data.Actors}</p>
          <p><strong>Note IMDB:</strong> ${data.imdbRating} — <a href="https://www.imdb.com/title/${data.imdbID}" target="_blank" rel="noopener">IMDB</a></p>
          <p>${data.Plot}</p>
        </div>
      </div>
    `;
  } catch (err) {
    modalBody.innerHTML = '<p>Erreur réseau.</p>';
  }
}

closeModal.addEventListener('click', () => {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden','true');
});
modal.addEventListener('click', e => {
  if (e.target === modal) {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden','true');
  }
});
