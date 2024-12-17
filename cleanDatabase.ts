import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanAllTables() {
  try {
    // Lancer une transaction pour supprimer toutes les données de chaque table
    await prisma.$transaction([
      prisma.dish.deleteMany({}),
      prisma.collaborator.deleteMany({}),
      prisma.food.deleteMany({}),
      prisma.ingredient.deleteMany({}),
      prisma.image.deleteMany({}),
      prisma.user.deleteMany({}),
    ]);
    console.log("Toutes les tables ont été nettoyées !");
  } catch (error) {
    console.error("Erreur lors du nettoyage de toutes les tables:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanAllTables();
