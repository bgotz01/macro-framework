/*
  Warnings:

  - Added the required column `name` to the `waitlist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "waitlist" ADD COLUMN     "name" TEXT NOT NULL;
