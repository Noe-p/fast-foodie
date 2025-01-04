import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Azerty12!', 10);
  
  const user = await prisma.user.create({
    data: {
      userName: 'admin',
      password: hashedPassword,
    }
  });

  console.log('Utilisateur créé:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
