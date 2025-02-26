/*
  Warnings:

  - You are about to drop the column `active` on the `Stream` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Stream` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Upvote` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[extractedId]` on the table `Stream` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[streamId]` on the table `Upvote` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `queueID` to the `Stream` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Stream" DROP CONSTRAINT "Stream_userId_fkey";

-- DropForeignKey
ALTER TABLE "Upvote" DROP CONSTRAINT "Upvote_userId_fkey";

-- DropIndex
DROP INDEX "Upvote_streamId_userId_key";

-- AlterTable
ALTER TABLE "Stream" DROP COLUMN "active",
DROP COLUMN "userId",
ADD COLUMN     "played" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "queueID" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Upvote" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "Queue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Queue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Queue_userId_key" ON "Queue"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Stream_extractedId_key" ON "Stream"("extractedId");

-- CreateIndex
CREATE UNIQUE INDEX "Upvote_streamId_key" ON "Upvote"("streamId");

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_queueID_fkey" FOREIGN KEY ("queueID") REFERENCES "Queue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
