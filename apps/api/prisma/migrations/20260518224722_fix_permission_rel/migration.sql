/*
  Warnings:

  - You are about to drop the column `role_id` on the `permissions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[resource,action]` on the table `permissions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "permissions" DROP CONSTRAINT "permissions_role_id_fkey";

-- DropIndex
DROP INDEX "permissions_role_id_idx";

-- DropIndex
DROP INDEX "permissions_role_id_resource_action_key";

-- CreateTable
CREATE TABLE "_RoleToPermission" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL,

    CONSTRAINT "_RoleToPermission_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_RoleToPermission_B_index" ON "_RoleToPermission"("B");

-- Data Migration: Transfer existing permissions to the new pivot table
WITH MinPerms AS (
    SELECT resource, action, MIN(id) as master_id
    FROM permissions
    GROUP BY resource, action
)
INSERT INTO "_RoleToPermission" ("A", "B")
SELECT m.master_id, p.role_id
FROM permissions p
JOIN MinPerms m ON p.resource = m.resource AND p.action = m.action
ON CONFLICT DO NOTHING;

-- Data Cleanup: Delete duplicate permissions
DELETE FROM permissions
WHERE id NOT IN (
    SELECT MIN(id)
    FROM permissions
    GROUP BY resource, action
);

-- AlterTable
ALTER TABLE "permissions" DROP COLUMN "role_id";

-- CreateIndex
CREATE UNIQUE INDEX "permissions_resource_action_key" ON "permissions"("resource", "action");

-- AddForeignKey
ALTER TABLE "_RoleToPermission" ADD CONSTRAINT "_RoleToPermission_A_fkey" FOREIGN KEY ("A") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToPermission" ADD CONSTRAINT "_RoleToPermission_B_fkey" FOREIGN KEY ("B") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
