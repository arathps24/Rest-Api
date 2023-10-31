/*
  Warnings:

  - You are about to drop the column `imagen` on the `usuario` table. All the data in the column will be lost.
  - You are about to drop the `comentario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `publicacion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `comentario` DROP FOREIGN KEY `comentario_ibfk_1`;

-- AlterTable
ALTER TABLE `carrito` ADD COLUMN `usuarioId` INTEGER NULL;

-- AlterTable
ALTER TABLE `producto` ADD COLUMN `estado` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `stock` DECIMAL(10, 2) NULL;

-- AlterTable
ALTER TABLE `usuario` DROP COLUMN `imagen`,
    ADD COLUMN `nombreCom` VARCHAR(60) NULL,
    ADD COLUMN `telefono` VARCHAR(60) NULL;

-- DropTable
DROP TABLE `comentario`;

-- DropTable
DROP TABLE `publicacion`;

-- CreateTable
CREATE TABLE `tarjeta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NULL,
    `numerotarjeta` VARCHAR(191) NOT NULL,
    `ccv` VARCHAR(191) NOT NULL,
    `fecha` VARCHAR(191) NOT NULL,
    `banco` VARCHAR(60) NULL,

    INDEX `usuarioId`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `direccion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `estado` VARCHAR(60) NULL,
    `municipio` VARCHAR(60) NULL,
    `calle` VARCHAR(60) NULL,
    `NumeroExterior` VARCHAR(60) NULL,
    `NumeroInterior` VARCHAR(60) NULL,
    `referencias` TEXT NULL,
    `usuarioId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `carrito` ADD CONSTRAINT `carrito_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tarjeta` ADD CONSTRAINT `pago_ibfk_1` FOREIGN KEY (`usuarioId`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `direccion` ADD CONSTRAINT `direccion_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
