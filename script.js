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
  canapes: [['Garden & sea','Cucumber, mint & pea crostini; oyster with green apple; smoked salmon roulade.'],['From the hearth','Wild mushroom tartlet; harissa chicken skewer; crispy halloumi with fig.'],['Something sweet','Mini lemon posset; chocolate ganache tart; raspberry & rose macaron.']],
  mains: [['Supper table','Slow-roasted lamb shoulder, rosemary potatoes and vibrant seasonal vegetables.'],['From the garden','Herb-roasted chicken, buttery greens and lemon pan jus.'],['Plant-forward','Roasted squash & lentil Wellington with sage gravy.']],
  sweet: [['Celebration cake','Vanilla bean, chocolate ganache, lemon elderflower and seasonal fruit tiers.'],['After dinner','Mini pavlovas, espresso pots and bite-sized financiers.'],['The finishing touch','Cheese selection, spiced chutney, grapes and artisan crackers.']]
};
function renderMenu(key) {
  document.querySelector('#menuContent').innerHTML = menus[key].map((item, index) => `<article class="dish"><span class="dish-number">0${index + 1}</span><h3>${item[0]}</h3><p>${item[1]}</p></article>`).join('');
}
document.querySelectorAll('[data-menu]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-menu]').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  renderMenu(button.dataset.menu);
}));
renderMenu('canapes');

const symbols = ['🥂','🍰','🌿','🕯️'];
const board = document.querySelector('#memoryBoard');
let flipped = [], moves = 0, matched = 0, timerSeconds = 0, timerId;

function formatTime(seconds) { return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; }
function restartGame() {
  clearInterval(timerId); timerSeconds = 0; moves = 0; matched = 0; flipped = [];
  document.querySelector('#moves').textContent = '0'; document.querySelector('#timer').textContent = '0:00';
  const cards = [...symbols, ...symbols].sort(() => Math.random() - .5);
  board.innerHTML = cards.map((symbol, index) => `<button class="card" data-symbol="${symbol}" data-index="${index}" aria-label="Hidden card"><span class="card-inner"><span class="card-face card-back">A&amp;A</span><span class="card-face card-front">${symbol}</span></span></button>`).join('');
}
board.addEventListener('click', event => {
  const card = event.target.closest('.card');
  if (!card || card.classList.contains('flipped') || card.classList.contains('matched') || flipped.length === 2) return;
  if (!timerId && matched === 0) timerId = setInterval(() => { timerSeconds++; document.querySelector('#timer').textContent = formatTime(timerSeconds); }, 1000);
  card.classList.add('flipped'); flipped.push(card);
  if (flipped.length === 2) {
    moves++; document.querySelector('#moves').textContent = moves;
    if (flipped[0].dataset.symbol === flipped[1].dataset.symbol) {
      flipped.forEach(item => item.classList.add('matched')); flipped = []; matched += 2;
      if (matched === 8) { clearInterval(timerId); timerId = null; setTimeout(() => alert(`Beautiful work! You matched every pair in ${moves} moves and ${formatTime(timerSeconds)}.`), 350); }
    } else setTimeout(() => { flipped.forEach(item => item.classList.remove('flipped')); flipped = []; }, 800);
  }
});
document.querySelector('#restartGame').addEventListener('click', restartGame);
restartGame();

document.querySelector('#contactForm').addEventListener('submit', event => {
  event.preventDefault();
  const status = event.currentTarget.querySelector('.form-status');
  status.textContent = 'Thank you — your enquiry is ready for our team. We’ll be in touch soon.';
  event.currentTarget.reset();
});
document.querySelector('#year').textContent = new Date().getFullYear();
showPage(location.hash.slice(1) || 'home');
