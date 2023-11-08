-- CreateTable
CREATE TABLE `administrador` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NULL,
    `password` VARCHAR(100) NULL,
    `token` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `producto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombrePro` VARCHAR(60) NULL,
    `descripcion` TEXT NULL,
    `stock` DECIMAL(10, 2) NULL,
    `precio` DECIMAL(10, 2) NULL,
    `imagen` VARCHAR(100) NULL,
    `estado` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(60) NULL,
    `correo` VARCHAR(60) NULL,
    `password` VARCHAR(100) NULL,
    `token` VARCHAR(100) NULL,
    `telefono` VARCHAR(60) NULL,
    `nombreCom` VARCHAR(60) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `carrito` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tiket` VARCHAR(300) NULL,
    `TipoEnvio` VARCHAR(300) NULL,
    `Total` INTEGER NULL,
    `usuarioId` INTEGER NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
