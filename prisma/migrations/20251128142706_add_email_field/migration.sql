/*
  Warnings:

  - Added the required column `email` to the `Proposal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "email" TEXT NOT NULL;
