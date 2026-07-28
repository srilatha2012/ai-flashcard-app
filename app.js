const initialDecks = [
  {
    id: 1,
    name: 'General Knowledge',
    cards: [
      { id: 101, front: 'What is the capital of France?', back: 'Paris' },
      { id: 102, front: 'What planet is known as the Red Planet?', back: 'Mars' }
    ]
  },
  {
    id: 2,
    name: 'Science',
    cards: [{ id: 201, front: 'What gas do plants absorb?', back: 'Carbon dioxide' }]
  },
  {
    id: 3,
    name: 'History',
    cards: [{ id: 301, front: 'Who was the first President of the United States?', back: 'George Washington' }]
  }
];

let decks = initialDecks.map((deck) => ({ ...deck, cards: [...deck.cards] }));
let activeDeckId = initialDecks[0].id;
let activeCardIndex = 0;
let isCardFlipped = false;
let editingDeckId = null;
let editingCardId = null;
let activeModal = null;
let lastFocusedElement = null;

const deckList = document.getElementById('deck-list');
const deckTitle = document.getElementById('deck-title');
const openModalBtn = document.getElementById('open-modal-btn');
const editDeckBtn = document.getElementById('edit-deck-btn');
const deckModal = document.getElementById('deck-modal');
const deckModalTitle = document.getElementById('modal-title');
const deckModalCloseBtn = deckModal.querySelector('.modal-close');
const cancelDeckBtn = document.getElementById('cancel-modal-btn');
const deleteDeckBtn = document.getElementById('delete-deck-btn');
const deckForm = document.getElementById('deck-form');
const deckNameInput = document.getElementById('deck-name');

const cardModal = document.getElementById('card-modal');
const cardModalTitle = document.getElementById('card-modal-title');
const cardModalCloseBtn = cardModal.querySelector('.modal-close');
const cancelCardBtn = document.getElementById('cancel-card-btn');
const deleteCardBtn = document.getElementById('delete-card-btn');
const cardForm = document.getElementById('card-form');
const cardFrontInput = document.getElementById('card-front');
const cardBackInput = document.getElementById('card-back');
const newCardBtn = document.getElementById('new-card-btn');
const cardList = document.getElementById('card-list');
const studyCard = document.getElementById('study-card');
const studyCardFront = document.getElementById('study-card-front');
const studyCardBack = document.getElementById('study-card-back');
const prevCardBtn = document.getElementById('prev-card-btn');
const flipCardBtn = document.getElementById('flip-card-btn');
const nextCardBtn = document.getElementById('next-card-btn');

function getActiveDeck() {
  return decks.find((deck) => deck.id === activeDeckId) || null;
}

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
      activeCardIndex = 0;
      isCardFlipped = false;
      renderDecks();
    });
    li.appendChild(link);
    deckList.appendChild(li);
  });

  updateDeckTitle();
  renderCards();
  renderStudyCard();
}

function updateDeckTitle() {
  const activeDeck = getActiveDeck();
  deckTitle.textContent = activeDeck ? activeDeck.name : 'No deck selected';
}

function openModal(modalElement, openerElement = null) {
  lastFocusedElement = openerElement || document.activeElement;
  activeModal = modalElement;
  modalElement.classList.add('open');
  modalElement.setAttribute('aria-hidden', 'false');

  const focusable = Array.from(
    modalElement.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
  ).filter((element) => !element.hasAttribute('disabled'));

  if (focusable.length > 0) {
    focusable[0].focus();
  }
}

function closeModal(modalElement, formElement = null) {
  modalElement.classList.remove('open');
  modalElement.setAttribute('aria-hidden', 'true');
  activeModal = null;

  if (formElement) {
    formElement.reset();
  }

  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
}

function openDeckModal(mode = 'create', deckId = null) {
  editingDeckId = mode === 'edit' ? deckId : null;
  const deck = decks.find((item) => item.id === deckId);
  deckModalTitle.textContent = mode === 'edit' ? 'Edit Deck' : 'New Deck';
  deckNameInput.value = deck ? deck.name : '';
  deleteDeckBtn.hidden = mode !== 'edit' || !deck;
  openModal(deckModal, openModalBtn);
}

function closeDeckModal() {
  closeModal(deckModal, deckForm);
  editingDeckId = null;
  deleteDeckBtn.hidden = true;
}

function createDeck(name) {
  const trimmedName = name.trim();
  if (!trimmedName) return;

  const newDeck = { id: Date.now(), name: trimmedName, cards: [] };
  decks = [newDeck, ...decks];
  activeDeckId = newDeck.id;
  activeCardIndex = 0;
  isCardFlipped = false;
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
    activeCardIndex = 0;
    isCardFlipped = false;
  }
  renderDecks();
}

function renderCards() {
  const activeDeck = getActiveDeck();
  cardList.innerHTML = '';

  if (!activeDeck) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'empty-state';
    emptyItem.textContent = 'No deck selected.';
    cardList.appendChild(emptyItem);
    return;
  }

  if (activeDeck.cards.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'empty-state';
    emptyItem.textContent = 'No cards yet. Add one to begin.';
    cardList.appendChild(emptyItem);
    return;
  }

  activeDeck.cards.forEach((card, index) => {
    const item = document.createElement('li');
    item.className = 'card-preview';
    if (index === activeCardIndex) {
      item.classList.add('active');
    }

    const summary = document.createElement('div');
    summary.className = 'card-preview-content';
    summary.innerHTML = `<strong>${card.front}</strong><span>${card.back}</span>`;

    const actions = document.createElement('div');
    actions.className = 'card-preview-actions';

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.dataset.action = 'edit-card';
    editButton.dataset.cardId = card.id;
    editButton.textContent = 'Edit';

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.dataset.action = 'delete-card';
    deleteButton.dataset.cardId = card.id;
    deleteButton.textContent = 'Delete';

    actions.append(editButton, deleteButton);
    item.append(summary, actions);
    cardList.appendChild(item);
  });
}

function renderStudyCard() {
  const activeDeck = getActiveDeck();
  if (!activeDeck || activeDeck.cards.length === 0) {
    studyCardFront.textContent = 'No cards yet.';
    studyCardBack.textContent = 'Add a card to start studying.';
    studyCard.classList.remove('is-flipped');
    return;
  }

  if (activeCardIndex >= activeDeck.cards.length) {
    activeCardIndex = activeDeck.cards.length - 1;
  }

  const card = activeDeck.cards[activeCardIndex];
  studyCardFront.textContent = card.front;
  studyCardBack.textContent = card.back;
  studyCard.classList.toggle('is-flipped', isCardFlipped);
}

function showCard(direction) {
  const activeDeck = getActiveDeck();
  if (!activeDeck || activeDeck.cards.length === 0) return;

  activeCardIndex = (activeCardIndex + direction + activeDeck.cards.length) % activeDeck.cards.length;
  isCardFlipped = false;
  renderStudyCard();
}

function flipStudyCard() {
  if (!getActiveDeck() || getActiveDeck().cards.length === 0) return;
  isCardFlipped = !isCardFlipped;
  renderStudyCard();
}

function openCardModal(mode = 'create', cardId = null) {
  editingCardId = mode === 'edit' ? cardId : null;
  const activeDeck = getActiveDeck();
  const card = activeDeck?.cards.find((item) => item.id === cardId);
  cardModalTitle.textContent = mode === 'edit' ? 'Edit Card' : 'New Card';
  cardFrontInput.value = card ? card.front : '';
  cardBackInput.value = card ? card.back : '';
  deleteCardBtn.hidden = mode !== 'edit' || !card;
  openModal(cardModal, newCardBtn);
}

function closeCardModal() {
  closeModal(cardModal, cardForm);
  editingCardId = null;
  deleteCardBtn.hidden = true;
}

function createCard(front, back) {
  const activeDeck = getActiveDeck();
  if (!activeDeck) return;

  const trimmedFront = front.trim();
  const trimmedBack = back.trim();
  if (!trimmedFront || !trimmedBack) return;

  activeDeck.cards.unshift({ id: Date.now(), front: trimmedFront, back: trimmedBack });
  activeCardIndex = 0;
  isCardFlipped = false;
  renderDecks();
}

function updateCard(cardId, front, back) {
  const activeDeck = getActiveDeck();
  if (!activeDeck) return;

  const trimmedFront = front.trim();
  const trimmedBack = back.trim();
  if (!trimmedFront || !trimmedBack) return;

  activeDeck.cards = activeDeck.cards.map((card) => (card.id === cardId ? { ...card, front: trimmedFront, back: trimmedBack } : card));
  renderDecks();
}

function deleteCard(cardId) {
  const activeDeck = getActiveDeck();
  if (!activeDeck) return;

  const cardToDelete = activeDeck.cards.find((card) => card.id === cardId);
  if (!cardToDelete) return;

  const shouldDelete = window.confirm(`Delete card "${cardToDelete.front}"?`);
  if (!shouldDelete) return;

  activeDeck.cards = activeDeck.cards.filter((card) => card.id !== cardId);
  if (activeCardIndex >= activeDeck.cards.length) {
    activeCardIndex = Math.max(0, activeDeck.cards.length - 1);
  }
  isCardFlipped = false;
  renderDecks();
}

function trapFocus(event) {
  if (event.key !== 'Tab' || !activeModal) return;

  const focusableElements = Array.from(
    activeModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
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

openModalBtn.addEventListener('click', () => openDeckModal('create'));
editDeckBtn.addEventListener('click', () => {
  const activeDeck = getActiveDeck();
  if (activeDeck) {
    openDeckModal('edit', activeDeck.id);
  }
});

deckModalCloseBtn.addEventListener('click', closeDeckModal);
cancelDeckBtn.addEventListener('click', closeDeckModal);

deleteDeckBtn.addEventListener('click', () => {
  if (editingDeckId) {
    deleteDeck(editingDeckId);
    closeDeckModal();
  }
});

deckModal.addEventListener('click', (event) => {
  if (event.target === deckModal) {
    closeDeckModal();
  }
});

deckForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (editingDeckId) {
    updateDeckName(editingDeckId, deckNameInput.value);
  } else {
    createDeck(deckNameInput.value);
  }

  closeDeckModal();
});

newCardBtn.addEventListener('click', () => openCardModal('create'));
cardModalCloseBtn.addEventListener('click', closeCardModal);
cancelCardBtn.addEventListener('click', closeCardModal);

cardModal.addEventListener('click', (event) => {
  if (event.target === cardModal) {
    closeCardModal();
  }
});

deleteCardBtn.addEventListener('click', () => {
  if (editingCardId) {
    deleteCard(editingCardId);
    closeCardModal();
  }
});

cardForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (editingCardId) {
    updateCard(editingCardId, cardFrontInput.value, cardBackInput.value);
  } else {
    createCard(cardFrontInput.value, cardBackInput.value);
  }

  closeCardModal();
});

cardList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const { action, cardId } = button.dataset;
  const numericCardId = Number(cardId);

  if (action === 'edit-card') {
    openCardModal('edit', numericCardId);
  }

  if (action === 'delete-card') {
    deleteCard(numericCardId);
  }
});

prevCardBtn.addEventListener('click', () => showCard(-1));
flipCardBtn.addEventListener('click', flipStudyCard);
nextCardBtn.addEventListener('click', () => showCard(1));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && activeModal) {
    if (activeModal === deckModal) {
      closeDeckModal();
    } else if (activeModal === cardModal) {
      closeCardModal();
    }
  }
});

document.addEventListener('keydown', trapFocus);

renderDecks();
