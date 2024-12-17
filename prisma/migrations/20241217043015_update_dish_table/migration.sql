/*
  Warnings:

  - Made the column `chefId` on table `Dish` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Dish" DROP CONSTRAINT "Dish_chefId_fkey";

-- AlterTable
ALTER TABLE "Dish" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'private',
ALTER COLUMN "chefId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Dish" ADD CONSTRAINT "Dish_chefId_fkey" FOREIGN KEY ("chefId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
