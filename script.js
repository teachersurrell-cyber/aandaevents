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
const gameMoves = document.querySelector('#moves');
const gamePairs = document.querySelector('#pairs');
const gameTimer = document.querySelector('#timer');
const gameStatus = document.querySelector('#status');
const gameStart = document.querySelector('#start-btn');
const gameRestart = document.querySelector('#restart-btn');
let firstCard = null, secondCard = null, gameLocked = true, gamePairsFound = 0;
let gameStarted = false, gameFinished = false, gameSeconds = 0, gameTick = null, mismatchTimeout = null;

function shuffleGame(items) { const copy = [...items]; for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; } return copy; }
function gameTime(value) { return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`; }
function updateGameStats() { gameMoves.textContent = gameMovesCount; gamePairs.textContent = `${gamePairsFound} / ${treats.length}`; gameTimer.textContent = gameTime(gameSeconds); }
let gameMovesCount = 0;
function stopGameClock() { if (gameTick) clearInterval(gameTick); gameTick = null; }
function startGameClock() { if (gameTick || gameFinished) return; gameTick = setInterval(() => { gameSeconds++; gameTimer.textContent = gameTime(gameSeconds); }, 1000); }
function newGame() {
  stopGameClock(); if (mismatchTimeout) clearTimeout(mismatchTimeout);
  firstCard = secondCard = null; gameLocked = true; gameMovesCount = gamePairsFound = gameSeconds = 0; gameStarted = gameFinished = false;
  updateGameStats(); gameStart.disabled = false; gameStart.textContent = '✨ Start playing'; gameStatus.textContent = 'Tap “Start playing” when you’re ready.';
  gameBoard.innerHTML = '';
  shuffleGame([...treats, ...treats].map((treat, index) => ({ ...treat, uid: `${treat.name}-${index}-${Math.random().toString(16).slice(2)}` }))).forEach((item, index) => {
    const card = document.createElement('button'); card.type = 'button'; card.className = 'game-card'; card.disabled = true; card.dataset.name = item.name; card.setAttribute('aria-label', `Hidden card ${index + 1}`);
    card.innerHTML = `<span class="game-card-inner"><span class="game-card-face game-card-back" aria-hidden="true"></span><span class="game-card-face game-card-front" aria-hidden="true">${item.emoji}</span></span>`;
    card.addEventListener('click', () => flipGameCard(card, item, index)); gameBoard.appendChild(card);
  });
}
function beginGame() { if (gameStarted || gameFinished) return; gameStarted = true; gameLocked = false; [...gameBoard.children].forEach(card => card.disabled = false); gameStart.disabled = true; gameStart.textContent = 'Game in progress…'; gameStatus.textContent = 'Find two treats that match. Good luck!'; startGameClock(); }
function flipGameCard(card, item, index) {
  if (!gameStarted) beginGame(); if (gameLocked || card.classList.contains('is-open') || card.classList.contains('is-matched')) return;
  card.classList.add('is-open'); card.setAttribute('aria-label', item.name);
  if (!firstCard) { firstCard = { card, item, index }; return; }
  secondCard = { card, item, index }; gameLocked = true; gameMovesCount++; updateGameStats();
  if (firstCard.item.name === secondCard.item.name) {
    [firstCard, secondCard].forEach(entry => { entry.card.classList.remove('is-open'); entry.card.classList.add('is-matched'); entry.card.disabled = true; entry.card.setAttribute('aria-label', `Matched ${entry.item.name}`); });
    gamePairsFound++; updateGameStats(); gameStatus.innerHTML = '<strong>Lovely match!</strong> Keep going.'; firstCard = secondCard = null; gameLocked = false;
    if (gamePairsFound === treats.length) winGame();
  } else { gameStatus.textContent = 'Not a match this time. Try to remember where they are!'; mismatchTimeout = setTimeout(() => { [firstCard, secondCard].forEach(entry => { entry.card.classList.remove('is-open'); entry.card.setAttribute('aria-label', `Hidden card ${entry.index + 1}`); }); firstCard = secondCard = null; gameLocked = false; }, 850); }
}
function winGame() { gameFinished = true; gameLocked = true; stopGameClock(); gameStart.disabled = false; gameStart.textContent = '🎉 Play again'; const rating = gameMovesCount <= 12 ? 'event-planning superstar' : gameMovesCount <= 18 ? 'dessert detective' : 'treat-matching pro'; gameStatus.innerHTML = `<strong>You did it!</strong> All treats matched in ${gameMovesCount} moves and ${gameTime(gameSeconds)}. You’re a ${rating}!`; }
gameStart.addEventListener('click', () => { if (gameFinished) { newGame(); beginGame(); return; } beginGame(); });
gameRestart.addEventListener('click', newGame);
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
