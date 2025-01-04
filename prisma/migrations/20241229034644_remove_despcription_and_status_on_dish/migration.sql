/*
  Warnings:

  - You are about to drop the column `description` on the `Dish` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Dish` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Dish" DROP COLUMN "description",
DROP COLUMN "status";
