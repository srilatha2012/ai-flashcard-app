const initialDecks = [
  { id: 1, name: 'General Knowledge' },
  { id: 2, name: 'Science' },
  { id: 3, name: 'History' }
];

let decks = [...initialDecks];
let activeDeckId = initialDecks[0].id;
let editingDeckId = null;
let lastFocusedElement = null;

const deckList = document.getElementById('deck-list');
const deckTitle = document.getElementById('deck-title');
const openModalBtn = document.getElementById('open-modal-btn');
const modal = document.getElementById('deck-modal');
const modalTitle = document.getElementById('modal-title');
const modalCloseBtn = modal.querySelector('.modal-close');
const cancelModalBtn = document.getElementById('cancel-modal-btn');
const deleteDeckBtn = document.getElementById('delete-deck-btn');
const deckForm = document.getElementById('deck-form');
const deckNameInput = document.getElementById('deck-name');
const editDeckBtn = document.getElementById('edit-deck-btn');

function renderDecks() {
  deckList.innerHTML = '';

  decks.forEach((deck) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = '#';
    link.className = 'deck-link';
    if (deck.id === activeDeckId) {
      link.classList.add('active');
    }
    link.textContent = deck.name;
    link.addEventListener('click', (event) => {
      event.preventDefault();
      activeDeckId = deck.id;
      renderDecks();
      updateDeckTitle();
    });
    li.appendChild(link);
    deckList.appendChild(li);
  });

  updateDeckTitle();
}

function updateDeckTitle() {
  const activeDeck = decks.find((deck) => deck.id === activeDeckId);
  if (activeDeck) {
    deckTitle.textContent = activeDeck.name;
  } else {
    deckTitle.textContent = 'No deck selected';
  }
}

function openModal(mode = 'create', deckId = null) {
  lastFocusedElement = document.activeElement;
  editingDeckId = mode === 'edit' ? deckId : null;
  modalTitle.textContent = mode === 'edit' ? 'Edit Deck' : 'New Deck';
  const deck = decks.find((item) => item.id === deckId);
  deckNameInput.value = deck ? deck.name : '';
  deleteDeckBtn.hidden = mode !== 'edit' || !deck;
  deckNameInput.focus();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  deckForm.reset();
  editingDeckId = null;
  deleteDeckBtn.hidden = true;

  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
}

function createDeck(name) {
  const trimmedName = name.trim();
  if (!trimmedName) return;

  const newDeck = { id: Date.now(), name: trimmedName };
  decks = [newDeck, ...decks];
  activeDeckId = newDeck.id;
  renderDecks();
}

function updateDeckName(deckId, newName) {
  const trimmedName = newName.trim();
  if (!trimmedName) return;

  decks = decks.map((deck) => (deck.id === deckId ? { ...deck, name: trimmedName } : deck));
  renderDecks();
}

function deleteDeck(deckId) {
  const deckToDelete = decks.find((deck) => deck.id === deckId);
  if (!deckToDelete) return;

  const shouldDelete = window.confirm(`Delete deck "${deckToDelete.name}"?`);
  if (!shouldDelete) return;

  decks = decks.filter((deck) => deck.id !== deckId);
  if (activeDeckId === deckId) {
    activeDeckId = decks[0]?.id ?? null;
  }
  renderDecks();
}

function trapFocus(event) {
  if (event.key !== 'Tab' || !modal.classList.contains('open')) return;

  const focusableElements = Array.from(
    modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
  ).filter((element) => !element.hasAttribute('disabled'));

  if (focusableElements.length === 0) {
    event.preventDefault();
    return;
  }

  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

openModalBtn.addEventListener('click', () => openModal('create'));
modalCloseBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);

deleteDeckBtn.addEventListener('click', () => {
  if (editingDeckId) {
    deleteDeck(editingDeckId);
    closeModal();
  }
});

modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal.classList.contains('open')) {
    closeModal();
  }
});

modal.addEventListener('keydown', trapFocus);

editDeckBtn.addEventListener('click', () => {
  const activeDeck = decks.find((deck) => deck.id === activeDeckId);
  if (activeDeck) {
    openModal('edit', activeDeck.id);
  }
});

deckForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (editingDeckId) {
    updateDeckName(editingDeckId, deckNameInput.value);
  } else {
    createDeck(deckNameInput.value);
  }

  closeModal();
});

renderDecks();
