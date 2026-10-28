const nav = document.querySelector('.main-nav');
const menuToggle = document.querySelector('.menu-toggle');
const pages = [...document.querySelectorAll('.page')];

function showPage(id) {
  const target = pages.find(page => page.id === id) || pages[0];
  pages.forEach(page => page.classList.toggle('active', page === target));
  document.querySelectorAll('.main-nav a[data-page]').forEach(link => link.classList.toggle('active', link.dataset.page === target.id));
  nav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

document.addEventListener('click', event => {
  const link = event.target.closest('a[data-page]');
  if (link) showPage(link.dataset.page);
});
menuToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
window.addEventListener('hashchange', () => showPage(location.hash.slice(1)));

const menus = {
  packages: [['Luxury Package','Per person · US$10.00'],['Premium Package','Per person · US$8.00'],['Deluxe Package','Per person · US$6.00'],['Classic Package — most popular','Per person · US$5.00'],['Home Dinner Package','Per person · US$4.00'],['Braai Package','Per person · US$3.00']],
  decor: [['Balloon Garland','US$80–US$150'],['Red Carpet','US$20.00'],['Cake Table','US$10.00'],['Backdrops','Floral, white round, 3D silver or 3D gold · US$25.00'],['Tent','US$120.00 · Price excludes transport and pitching labour'],['His and Hers Chairs','Each · US$15.00'],['Roora Package','US$5–US$10 per person, depending on requirements']],
  canapes: [['Garden & sea','Cucumber, mint & pea crostini; oyster with green apple; smoked salmon roulade.'],['From the hearth','Wild mushroom tartlet; harissa chicken skewer; crispy halloumi with fig.'],['Something sweet','Mini lemon posset; chocolate ganache tart; raspberry & rose macaron.']],
  mains: [['Supper table','Slow-roasted lamb shoulder, rosemary potatoes and vibrant seasonal vegetables.'],['From the garden','Herb-roasted chicken, buttery greens and lemon pan jus.'],['Plant-forward','Roasted squash & lentil Wellington with sage gravy.']],
  sweet: [['Celebration cake','Vanilla bean, chocolate ganache, lemon elderflower and seasonal fruit tiers.'],['After dinner','Mini pavlovas, espresso pots and bite-sized financiers.'],['The finishing touch','Cheese selection, spiced chutney, grapes and artisan crackers.']]
};
const packageImages = ['luxury', 'premium', 'deluxe', 'classic', 'home-dinner', 'braai'];
function renderMenu(key) {
  document.querySelector('#menuContent').innerHTML = menus[key].map((item, index) => {
    const image = key === 'packages' ? `<img class="dish-image" src="assets/images/${packageImages[index]}-package.webp" alt="${item[0]}" loading="lazy">` : '';
    return `<article class="dish">${image}<span class="dish-number">0${index + 1}</span><h3>${item[0]}</h3><p>${item[1]}</p></article>`;
  }).join('');
}
document.querySelectorAll('[data-menu]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-menu]').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  renderMenu(button.dataset.menu);
}));
renderMenu('packages');

const treats = [
  { emoji: '🍰', name: 'cake' }, { emoji: '🍓', name: 'strawberry' },
  { emoji: '🍕', name: 'pizza' }, { emoji: '🥂', name: 'celebration glasses' },
  { emoji: '🧁', name: 'cupcake' }, { emoji: '🍇', name: 'grapes' },
  { emoji: '🍪', name: 'cookie' }, { emoji: '🍍', name: 'pineapple' }
];
const gameBoard = document.querySelector('#board');
let playerName = 'guest', players = [{ name: 'guest', score: 0 }], currentPlayer = 0, firstCard = null, secondCard = null;
let gameLocked = false, gameMovesCount = 0, gamePairsFound = 0, gameSeconds = 0, gameTick = null, mismatchTimeout = null;
function shuffleGame(items) { const copy = [...items]; for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; } return copy; }
function gameTime(value) { return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`; }
function showGameScreen(name) { document.querySelectorAll('.game-screen').forEach(screen => screen.classList.toggle('active', screen.id === `game-${name}`)); }
function updateGameStats() { document.querySelector('#moves').textContent = gameMovesCount; document.querySelector('#pairs').textContent = `${gamePairsFound} / 8`; document.querySelector('#timer').textContent = gameTime(gameSeconds); renderPlayerScores(); }
function renderPlayerScores() {
  const scoreboard = document.querySelector('#player-scoreboard');
  if (!scoreboard) return;
  scoreboard.innerHTML = players.map((player, index) => `<div class="${index === currentPlayer ? 'current' : ''}"><span>${player.name}</span><strong>${player.score}</strong></div>`).join('');
}
function advanceTurn() { currentPlayer = (currentPlayer + 1) % players.length; renderPlayerScores(); document.querySelector('#status').textContent = `${players[currentPlayer].name}’s turn.`; }
function stopGameClock() { clearInterval(gameTick); gameTick = null; }
function startGameClock() { if (gameTick) return; gameTick = setInterval(() => { gameSeconds++; document.querySelector('#timer').textContent = gameTime(gameSeconds); }, 1000); }
function newGame() {
  stopGameClock(); clearTimeout(mismatchTimeout); firstCard = secondCard = null; gameLocked = false; currentPlayer = 0; players.forEach(player => player.score = 0); gameMovesCount = gamePairsFound = gameSeconds = 0; updateGameStats(); document.querySelector('#status').textContent = 'Find two treats that match.'; gameBoard.innerHTML = '';
  shuffleGame([...treats, ...treats]).forEach((item, index) => { const card = document.createElement('button'); card.type = 'button'; card.className = 'game-card'; card.dataset.name = item.name; card.setAttribute('aria-label', `Hidden card ${index + 1}`); card.innerHTML = `<span class="game-card-inner"><span class="game-card-face game-card-back" aria-hidden="true">${index + 1}</span><span class="game-card-face game-card-front" aria-hidden="true">${item.emoji}</span></span>`; card.addEventListener('click', () => flipGameCard(card, item, index)); gameBoard.appendChild(card); });
}
function flipGameCard(card, item, index) {
  if (gameLocked || card.classList.contains('is-open') || card.classList.contains('is-matched')) return;
  if (!gameTick) startGameClock(); card.classList.add('is-open'); card.setAttribute('aria-label', item.name);
  if (!firstCard) { firstCard = { card, item, index }; return; }
  secondCard = { card, item, index }; gameLocked = true; gameMovesCount++; updateGameStats();
  if (firstCard.item.name === secondCard.item.name) { [firstCard, secondCard].forEach(entry => { entry.card.classList.remove('is-open'); entry.card.classList.add('is-matched'); entry.card.setAttribute('aria-label', `Matched ${entry.item.name}`); }); gamePairsFound++; players[currentPlayer].score++; updateGameStats(); document.querySelector('#status').textContent = `Lovely match, ${players[currentPlayer].name}! Go again.`; firstCard = secondCard = null; gameLocked = false; if (gamePairsFound === 8) winGame(); }
  else { document.querySelector('#status').textContent = 'Not a match — remember those treats.'; mismatchTimeout = setTimeout(() => { [firstCard, secondCard].forEach(entry => { entry.card.classList.remove('is-open'); entry.card.setAttribute('aria-label', `Hidden card ${entry.index + 1}`); }); firstCard = secondCard = null; gameLocked = false; advanceTurn(); }, 850); }
}
function winGame() { stopGameClock(); const ranking = [...players].sort((a, b) => b.score - a.score); document.querySelector('#winner-name').textContent = ranking[0].name; document.querySelector('#victory-moves').textContent = gameMovesCount; document.querySelector('#victory-time').textContent = gameTime(gameSeconds); document.querySelector('#victory-players').textContent = players.length; document.querySelector('#victory-scores').innerHTML = ranking.map((player, index) => `<div><span>${index + 1}. ${player.name}</span><strong>${player.score} pairs</strong></div>`).join(''); setTimeout(() => showGameScreen('victory'), 450); }
document.querySelectorAll('[data-game-screen]').forEach(button => button.addEventListener('click', () => showGameScreen(button.dataset.gameScreen)));
const playerCountSelect = document.querySelector('#player-count');
function renderOtherPlayerFields() {
  const count = Number(playerCountSelect.value);
  document.querySelector('#other-player-fields').innerHTML = Array.from({ length: count - 1 }, (_, index) => `<label for="player-name-${index + 2}">Player ${index + 2} name</label><input id="player-name-${index + 2}" maxlength="24" autocomplete="off" placeholder="Enter player ${index + 2} name">`).join('');
}
playerCountSelect.addEventListener('change', renderOtherPlayerFields);
renderOtherPlayerFields();
document.querySelector('#join-game-btn').addEventListener('click', () => {
  const names = [document.querySelector('#player-name').value.trim(), ...[...document.querySelectorAll('#other-player-fields input')].map(input => input.value.trim())];
  if (names.some(name => !name)) { document.querySelector('#game-form-error').textContent = 'Please enter a name for every player.'; return; }
  playerName = names[0]; players = names.map(name => ({ name, score: 0 })); currentPlayer = 0; document.querySelector('#guest-name').textContent = playerName; showGameScreen('menu');
});
document.querySelector('#quick-game-btn').addEventListener('click', () => { newGame(); showGameScreen('play'); });
document.querySelector('#restart-btn').addEventListener('click', newGame);
document.querySelector('#play-again-btn').addEventListener('click', () => { newGame(); showGameScreen('play'); });
document.querySelector('#game-help-btn').addEventListener('click', () => { document.querySelector('#status').textContent = 'Turn over two cards at a time and match all eight pairs.'; showGameScreen('play'); });
newGame();

document.querySelector('#contactForm').addEventListener('submit', event => {
  event.preventDefault();
  const status = event.currentTarget.querySelector('.form-status');
  status.textContent = 'Thank you — your enquiry is ready for our team. We’ll be in touch soon.';
  event.currentTarget.reset();
});
document.querySelector('#year').textContent = new Date().getFullYear();
showPage(location.hash.slice(1) || 'home');

const themeButtons = document.querySelectorAll('[data-theme]');
function setTheme(theme) {
  document.body.dataset.theme = ['light', 'dark', 'gold'].includes(theme) ? theme : 'light';
  localStorage.setItem('aa-theme', document.body.dataset.theme);
  themeButtons.forEach(button => {
    const active = button.dataset.theme === document.body.dataset.theme;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}
themeButtons.forEach(button => button.addEventListener('click', () => setTheme(button.dataset.theme)));
setTheme(localStorage.getItem('aa-theme') || 'light');

const galleryFiles = [
  'assets/images/Screenshot 2026-10-28 at 22.34.13.webp',
  'assets/images/Screenshot 2026-10-28 at 22.34.17.webp',
  'assets/images/Screenshot 2026-10-28 at 22.34.29.webp',
  'assets/images/Screenshot 2026-10-28 at 22.34.53.webp',
  'assets/images/Screenshot 2026-10-28 at 22.34.58.webp',
  'assets/images/Screenshot 2026-10-28 at 22.35.02.webp',
  'assets/images/Screenshot 2026-10-28 at 22.35.20.webp',
  'assets/images/Screenshot 2026-10-28 at 22.35.29.webp',
  'assets/images/Screenshot 2026-10-28 at 22.35.49.webp',
  'assets/images/Screenshot 2026-10-28 at 22.35.53.webp',
  'assets/images/Screenshot 2026-10-28 at 22.35.57.webp',
  'assets/images/Screenshot 2026-10-28 at 22.36.00.webp',
  'assets/images/Screenshot 2026-10-28 at 22.36.03.webp',
  'assets/images/Screenshot 2026-10-28 at 22.36.14.webp',
  'assets/images/Screenshot 2026-10-28 at 22.36.21.webp',
  'assets/images/Screenshot 2026-10-28 at 22.36.26.webp',
  'assets/images/Screenshot 2026-10-28 at 22.36.30.webp',
  'assets/images/Screenshot 2026-10-28 at 22.36.32.webp',
  'assets/images/Screenshot 2026-10-28 at 22.36.35.webp',
  'assets/images/Screenshot 2026-10-28 at 22.36.42.webp',
  'assets/images/Screenshot 2026-10-28 at 22.36.53.webp',
  'assets/images/Screenshot 2026-10-28 at 22.36.58.webp',
  'assets/images/Screenshot 2026-10-28 at 22.37.02.webp',
  'assets/images/Screenshot 2026-10-28 at 22.37.06.webp',
  'assets/images/Screenshot 2026-10-28 at 22.37.09.webp',
  'assets/images/Screenshot 2026-10-28 at 22.37.26.webp',
  'assets/images/Screenshot 2026-10-28 at 22.37.29.webp',
  'assets/images/Screenshot 2026-10-28 at 22.37.31.webp',
  'assets/images/Screenshot 2026-10-28 at 22.37.34.webp',
  'assets/images/Screenshot 2026-10-28 at 22.37.48.webp',
  'assets/images/Screenshot 2026-10-28 at 22.37.59.webp',
  'assets/images/Screenshot 2026-10-28 at 22.38.10.webp',
  'assets/images/Screenshot 2026-10-28 at 22.38.14.webp',
  'assets/images/Screenshot 2026-10-28 at 22.38.16.webp',
  'assets/images/Screenshot 2026-10-28 at 22.38.32.webp',
  'assets/images/Screenshot 2026-10-28 at 22.38.36.webp',
  'assets/images/Screenshot 2026-10-28 at 22.38.51.webp',
  'assets/images/Screenshot 2026-10-28 at 22.38.56.webp',
  'assets/images/Screenshot 2026-10-28 at 22.38.58.webp',
  'assets/images/Screenshot 2026-10-28 at 22.39.02.webp',
  'assets/images/Screenshot 2026-10-28 at 22.39.04.webp'
];
const galleryGrid = document.querySelector('#galleryGrid');
if (galleryGrid) {
  galleryGrid.innerHTML = galleryFiles.map((src, index) => `<button class="gallery-item" type="button" aria-label="Open gallery image ${index + 1}"><img src="${src}" alt="A&A Events celebration ${index + 1}" loading="lazy" decoding="async"></button>`).join('');
  const warmImageCache = () => galleryFiles.slice(0, 12).forEach(src => {
    const preload = new Image();
    preload.decoding = 'async';
    preload.src = src;
  });
  if ('requestIdleCallback' in window) window.requestIdleCallback(warmImageCache, { timeout: 1500 });
  else setTimeout(warmImageCache, 500);
  galleryGrid.querySelectorAll('.gallery-item').forEach(item => item.addEventListener('click', () => window.open(item.querySelector('img').src, '_blank', 'noopener,noreferrer')));
}
