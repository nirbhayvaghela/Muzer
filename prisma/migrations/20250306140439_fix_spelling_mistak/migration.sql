/*
  Warnings:

  - You are about to drop the column `queueID` on the `Stream` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[streamId,userId]` on the table `Upvote` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `queueId` to the `Stream` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Stream" DROP CONSTRAINT "Stream_queueID_fkey";

-- DropIndex
DROP INDEX "Upvote_streamId_key";

-- AlterTable
ALTER TABLE "Stream" DROP COLUMN "queueID",
ADD COLUMN     "queueId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Upvote_streamId_userId_key" ON "Upvote"("streamId", "userId");

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "Queue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
