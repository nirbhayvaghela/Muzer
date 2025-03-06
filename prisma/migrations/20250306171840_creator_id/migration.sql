/*
  Warnings:

  - You are about to drop the column `played` on the `Stream` table. All the data in the column will be lost.
  - Added the required column `creatorId` to the `Stream` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stream" DROP COLUMN "played",
ADD COLUMN     "creatorId" TEXT NOT NULL;
