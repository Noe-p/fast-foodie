import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Azerty12!', 10);
  
  const user = await prisma.user.create({
    data: {
      email: 'noefdrgv@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
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
