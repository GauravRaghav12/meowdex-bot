const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper function to ensure user exists in database
async function ensureUser(discordId, username) {
  let user = await prisma.user.findUnique({
    where: { discordId }
  });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        discordId,
        username,
        coins: 100
      }
    });
  }
  
  return user;
}

// Helper function to ensure cards exist in database
async function ensureCardsExist(cards) {
  for (const cardData of cards) {
    const existingCard = await prisma.card.findFirst({
      where: { name: cardData.name }
    });
    
    if (!existingCard) {
      await prisma.card.create({
        data: cardData
      });
    }
  }
}

// Add card to user's collection
async function addCardToUser(userId, cardId, count = 1) {
  const existingUserCard = await prisma.userCard.findUnique({
    where: {
      userId_cardId: {
        userId: userId,
        cardId: cardId
      }
    }
  });
  
  if (existingUserCard) {
    return await prisma.userCard.update({
      where: { id: existingUserCard.id },
      data: { count: existingUserCard.count + count }
    });
  } else {
    return await prisma.userCard.create({
      data: {
        userId: userId,
        cardId: cardId,
        count: count
      }
    });
  }
}

// Remove card from user's collection
async function removeCardFromUser(userId, cardId, count = 1) {
  const userCard = await prisma.userCard.findUnique({
    where: {
      userId_cardId: {
        userId: userId,
        cardId: cardId
      }
    }
  });
  
  if (!userCard || userCard.count < count) {
    return null; // Not enough cards
  }
  
  if (userCard.count === count) {
    await prisma.userCard.delete({
      where: { id: userCard.id }
    });
    return { deleted: true };
  } else {
    return await prisma.userCard.update({
      where: { id: userCard.id },
      data: { count: userCard.count - count }
    });
  }
}

// Get user's collection
async function getUserCollection(userId) {
  return await prisma.userCard.findMany({
    where: { userId: userId },
    include: { card: true },
    orderBy: { card: { rarity: 'asc' } }
  });
}

// Update user coins
async function updateUserCoins(userId, amount) {
  return await prisma.user.update({
    where: { id: userId },
    data: { coins: { increment: amount } }
  });
}

// Update last daily claim
async function updateLastDaily(userId) {
  return await prisma.user.update({
    where: { id: userId },
    data: { lastDaily: new Date() }
  });
}

module.exports = {
  prisma,
  ensureUser,
  ensureCardsExist,
  addCardToUser,
  removeCardFromUser,
  getUserCollection,
  updateUserCoins,
  updateLastDaily
};