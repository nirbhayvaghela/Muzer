/*
  Warnings:

  - You are about to drop the column `bigImage` on the `Stream` table. All the data in the column will be lost.
  - You are about to drop the column `smallImage` on the `Stream` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Stream" DROP COLUMN "bigImage",
DROP COLUMN "smallImage",
ADD COLUMN     "thumbnail" TEXT NOT NULL DEFAULT '';
