import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const router = Router();
const prisma = new PrismaClient();
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import multer from "multer";
const upload = multer();

const accountName = "arath2454";
const accountKey =
  "/YBRjQ/Ld9NtXwTjIcGNrToqr8boIDHBWFPhGuYsGl2VuLp8jZgcECuRJgYoNk55n53fZJBgorO++AStl1rSlQ==";
const containerName = "productos-imagenes";
const credential = new StorageSharedKeyCredential(accountName, accountKey);
const blobService = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  credential
);
// ---------------------------------------mostrar Producto
router.get("/producto", async (req, res) => {
  const producto = await prisma.producto.findMany();
  res.json(producto);
});

//---------------------------------------Agregar Producto

router.post("/producto", upload.single("imagen"), async (req, res) => {
  try {
    const { nombrePro, descripcion, precio, stock } = req.body;
    const { originalname, buffer, mimetype } = req.file;

    const containerClient = blobService.getContainerClient(containerName);
    const blobClient = containerClient.getBlockBlobClient(originalname);
    await blobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: mimetype },
    });

    // Obtener la URL directa al archivo Blob
    const url = blobClient.url;

    // Guardar el producto en la base de datos utilizando Prisma
    const newProduct = await prisma.producto.create({
      data: {
        nombrePro: nombrePro,
        descripcion: descripcion,
        precio: precio,
        imagen: url,
        stock: stock,
      },
    });

    res.status(200).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar el producto" });
  }
});

//------------------------------------------------Eliminar Producto
router.delete("/producto/:id", async (req, res) => {
  const borrarProducto = await prisma.producto.delete({
    where: {
      id: parseInt(req.params.id),
    },
  });

  if (!borrarProducto)
    return res.status(404).json({ error: "Producto no encontrado" });
  res.json(borrarProducto);
});

//--------------------------------------- buscar Producto con su id
router.get("/producto/:id", async (req, res) => {
  const productoId = await prisma.producto.findFirst({
    where: {
      id: parseInt(req.params.id),
    },
  });

  if (!productoId)
    return res.status(404).json({ error: "Producto no encontrado" });
  res.json(productoId);
});

//------------------------------------Actualizar Producto
router.put("/producto/:id", async (req, res) => {
  const productoActualizado = await prisma.producto.update({
    where: {
      id: parseInt(req.params.id),
    },
    data: req.body,
  });

  if (!productoActualizado)
    return res.status(404).json({ error: "Producto no encontrado" });
  res.json(productoActualizado);
});

export default router;
