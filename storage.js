(function (global) {
  const STORAGE_KEY = 'flashcards-study-app-state';
  const STORAGE_VERSION = 1;

  function createDefaultState(defaultState) {
    return {
      version: STORAGE_VERSION,
      decks: defaultState.decks,
      activeDeckId: defaultState.activeDeckId
    };
  }

  function sanitizeDeck(deck, fallbackDecks) {
    const safeId = Number.isFinite(deck?.id) ? deck.id : Date.now();
    const safeName = typeof deck?.name === 'string' && deck.name.trim() ? deck.name.trim() : 'Untitled Deck';
    const safeCards = Array.isArray(deck?.cards)
      ? deck.cards.filter((card) => card && typeof card === 'object').map((card) => ({
          id: Number.isFinite(card?.id) ? card.id : Date.now(),
          front: typeof card?.front === 'string' ? card.front : '',
          back: typeof card?.back === 'string' ? card.back : ''
        }))
      : [];

    return {
      id: safeId,
      name: safeName,
      cards: safeCards
    };
  }

  function loadState(defaultState) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return createDefaultState(defaultState);
      }

      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== STORAGE_VERSION || !Array.isArray(parsed.decks)) {
        return createDefaultState(defaultState);
      }

      const decks = parsed.decks.map((deck) => sanitizeDeck(deck, defaultState.decks));
      const activeDeckId = decks.some((deck) => deck.id === parsed.activeDeckId)
        ? parsed.activeDeckId
        : (defaultState.activeDeckId || decks[0]?.id || null);

      return {
        version: STORAGE_VERSION,
        decks,
        activeDeckId
      };
    } catch (error) {
      return createDefaultState(defaultState);
    }
  }

  function saveState(state) {
    try {
      const payload = {
        version: STORAGE_VERSION,
        decks: Array.isArray(state?.decks) ? state.decks.map((deck) => sanitizeDeck(deck, [])) : [],
        activeDeckId: state?.activeDeckId || null
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn('Unable to save flashcards state.', error);
    }
  }

  global.flashcardsStorage = {
    loadState,
    saveState,
    STORAGE_KEY,
    STORAGE_VERSION
  };

  global.loadState = loadState;
  global.saveState = saveState;
})(window);
