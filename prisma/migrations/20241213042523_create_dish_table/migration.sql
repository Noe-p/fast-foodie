/*
  Warnings:

  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DishToTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_DishToTag" DROP CONSTRAINT "_DishToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_DishToTag" DROP CONSTRAINT "_DishToTag_B_fkey";

-- AlterTable
ALTER TABLE "Dish" ADD COLUMN     "tags" TEXT[];

-- DropTable
DROP TABLE "Tag";

-- DropTable
DROP TABLE "_DishToTag";
