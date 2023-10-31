-- CreateTable
CREATE TABLE `comentario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `publicacion_id` INTEGER NULL,
    `comentario` TEXT NULL,

    INDEX `publicacion_id`(`publicacion_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Carrito` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tiket` VARCHAR(300) NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `comentario` ADD CONSTRAINT `comentario_ibfk_1` FOREIGN KEY (`publicacion_id`) REFERENCES `publicacion`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
