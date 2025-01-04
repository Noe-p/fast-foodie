-- CreateEnum
CREATE TYPE "SharedStatus" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterTable
ALTER TABLE "Dish" ADD COLUMN     "status" "SharedStatus" NOT NULL DEFAULT 'PUBLIC',
ADD COLUMN     "weeklyDish" BOOLEAN NOT NULL DEFAULT false;
