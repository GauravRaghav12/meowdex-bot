// Card data with different rarities and elements
const CARDS = [
  { name: 'Fire Cat', description: 'A fierce feline with blazing claws', element: 'Fire', rarity: 'Common', power: 100 },
  { name: 'Water Cat', description: 'A graceful cat that controls the tides', element: 'Water', rarity: 'Common', power: 110 },
  { name: 'Earth Cat', description: 'A sturdy cat with rock-solid defense', element: 'Earth', rarity: 'Common', power: 120 },
  { name: 'Air Cat', description: 'A swift cat that rides the wind', element: 'Air', rarity: 'Common', power: 105 },
  { name: 'Lightning Cat', description: 'An electrifying feline with shocking speed', element: 'Lightning', rarity: 'Rare', power: 200 },
  { name: 'Ice Cat', description: 'A cool cat that freezes enemies solid', element: 'Ice', rarity: 'Rare', power: 210 },
  { name: 'Shadow Cat', description: 'A mysterious cat that lurks in darkness', element: 'Shadow', rarity: 'Epic', power: 350 },
  { name: 'Cosmic Cat', description: 'A legendary cat from the stars above', element: 'Cosmic', rarity: 'Legendary', power: 500 },
];

// Rarity weights for card drops
const RARITY_WEIGHTS = {
  'Common': 60,
  'Rare': 25,
  'Epic': 12,
  'Legendary': 3
};

// Helper function to get random card based on rarity weights
function getRandomCard() {
  const totalWeight = Object.values(RARITY_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    random -= weight;
    if (random <= 0) {
      const cardsOfRarity = CARDS.filter(card => card.rarity === rarity);
      return cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
    }
  }
  
  return CARDS[0]; // Fallback to first card
}

// Helper function to get rarity color
function getRarityColor(rarity) {
  const colors = {
    'Common': 0x808080,
    'Rare': 0x0099ff,
    'Epic': 0x9932cc,
    'Legendary': 0xffd700
  };
  return colors[rarity] || 0x808080;
}

// Get card value in coins based on rarity
function getCardValue(rarity) {
  const values = {
    'Common': 10,
    'Rare': 25,
    'Epic': 50,
    'Legendary': 100
  };
  return values[rarity] || 10;
}

// Get rarity emoji
function getRarityEmoji(rarity) {
  const emojis = {
    'Common': '⚪',
    'Rare': '🔵',
    'Epic': '🟣',
    'Legendary': '🟡'
  };
  return emojis[rarity] || '⚪';
}

// Get element emoji
function getElementEmoji(element) {
  const emojis = {
    'Fire': '🔥',
    'Water': '💧',
    'Earth': '🌍',
    'Air': '💨',
    'Lightning': '⚡',
    'Ice': '❄️',
    'Shadow': '🌑',
    'Cosmic': '✨'
  };
  return emojis[element] || '❓';
}

// Find card by name (case insensitive, partial match)
function findCardByName(name) {
  return CARDS.find(card => 
    card.name.toLowerCase().includes(name.toLowerCase())
  );
}

// Group cards by rarity for display
function groupCardsByRarity(userCards) {
  const cardsByRarity = {};
  
  userCards.forEach(userCard => {
    const rarity = userCard.card.rarity;
    if (!cardsByRarity[rarity]) cardsByRarity[rarity] = [];
    
    const emoji = getRarityEmoji(rarity);
    const elementEmoji = getElementEmoji(userCard.card.element);
    cardsByRarity[rarity].push(`${emoji} ${userCard.card.name} ${elementEmoji} x${userCard.count}`);
  });
  
  return cardsByRarity;
}

module.exports = {
  CARDS,
  RARITY_WEIGHTS,
  getRandomCard,
  getRarityColor,
  getCardValue,
  getRarityEmoji,
  getElementEmoji,
  findCardByName,
  groupCardsByRarity
};