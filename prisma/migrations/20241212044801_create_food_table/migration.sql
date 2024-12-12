-- CreateTable
CREATE TABLE "Food" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "aisle" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "Food_pkey" PRIMARY KEY ("id")
);
