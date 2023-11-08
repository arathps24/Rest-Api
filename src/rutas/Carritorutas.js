import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
const router = Router();
const prisma = new PrismaClient();
import pdfkit from "pdfkit";
import multer from "multer";
const upload = multer();
const accountName = "arath2454";
const accountKey =
  "/YBRjQ/Ld9NtXwTjIcGNrToqr8boIDHBWFPhGuYsGl2VuLp8jZgcECuRJgYoNk55n53fZJBgorO++AStl1rSlQ==";
const containerName = "tikets";
const credential = new StorageSharedKeyCredential(accountName, accountKey);
const blobService = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  credential
);

// ---------------------------------------mostrar carrito
router.get("/pedidos", async (req, res) => {
  const carrito = await prisma.carrito.findMany();
  res.json(carrito);
});

//------------------------------------aprobar
router.put("/pedidos/:id", async (req, res) => {
  const PedidoAprobar = await prisma.carrito.update({
    where: {
      id: parseInt(req.params.id),
    },
    data: req.body,
  });

  if (!PedidoAprobar)
    return res.status(404).json({ error: "Pedido no encontrado" });
  res.json(PedidoAprobar);
});
//---------------------------------------Agregar carrito
router.post("/carrito", async (req, res) => {
  try {
    const {
      nombre,
      cartItems,
      total,
      nombreCom,
      telefono,
      envio,
      MetodoPago,
      numerotarjeta,
      estado,
      calle,
      municipio,
      referencias,
      NumeroExterior,
      NumeroInterior,
      TipoEnvio,
      usuarioId,
    } = req.body;

    // Crear un nuevo documento PDF
    const doc = new pdfkit();

    doc.fontSize(18).text(`Pedido de: ${nombreCom}`);
    doc.fontSize(14).text(`Telefono: ${telefono}`);
    if (MetodoPago === "Paypal") {
      doc.fontSize(14).text(`Metodo de Pago: ${MetodoPago}`);
    } else if (MetodoPago === "Tarjeta") {
      doc.fontSize(14).text(`Metodo de Pago: ${MetodoPago} ${numerotarjeta}`);
    }
    if (TipoEnvio === "Recoger") {
      doc.fontSize(14).text(`Entrega: Recoger en la Tienda`);
    } else if (TipoEnvio === "Domicilio") {
      doc
        .fontSize(14)
        .text(
          `Entrega Domicilio: ${estado},${municipio},${calle},${referencias},${NumeroExterior},${NumeroInterior}`
        );
    }

    doc.fontSize(14).text(`Fecha: ${new Date().toLocaleDateString()}`);

    const margin = 40; // Left and right margin
    const pageWidth = 550; // Width of the page
    const colCount = 4; // Number of columns
    const colWidth = (pageWidth - 2 * margin) / colCount;

    let y = doc.y + 20; // Initial Y position

    // Draw table headers
    doc.font("Helvetica-Bold");
    doc.text("ID", margin, y);
    doc.text("Producto", margin + colWidth, y);
    doc.text("Cantidad", margin + 2 * colWidth, y);
    doc.text("Precio", margin + 3 * colWidth, y);
    y += 20; // Move down for row data
    doc.font("Helvetica");

    // Draw table rows
    cartItems.forEach((item) => {
      doc.text(item.id.toString(), margin, y);
      doc.text(item.nombrePro, margin + colWidth, y);
      doc.text(item.cantidad.toString(), margin + 2 * colWidth, y);
      doc.text(item.precio.toString(), margin + 3 * colWidth, y);
      y += 20; // Move down for the next row
    });

    y += 5;
    doc
      .moveTo(margin, y)
      .lineTo(pageWidth - margin, y)
      .stroke();

    // Space before total
    y += 15;
    doc.fontSize(16).text(`Total:`, margin, y);
    doc.fontSize(16).text(`${total}`, margin + 3 * colWidth, y);

    // Generar un buffer a partir del PDF
    const pdfBuffer = await new Promise((resolve) => {
      const buffers = [];
      doc.on("data", (buffer) => buffers.push(buffer));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.end();
    });

    const containerClient = blobService.getContainerClient(containerName);
    const pdfBlobName = `${nombre}_${Date.now()}.pdf`; // Nombre único para el PDF
    const blobClient = containerClient.getBlockBlobClient(pdfBlobName);

    await blobClient.uploadData(pdfBuffer, {
      blobHTTPHeaders: { blobContentType: "application/pdf" },
    });

    const pdfUrl = blobClient.url;

    // Guardar la URL del PDF en tu base de datos
    const newCarrito = await prisma.carrito.create({
      data: {
        tiket: pdfUrl,
        TipoEnvio: TipoEnvio,
        Total: total,
        usuario: { connect: { id: usuarioId } },
      },
    });

    res.status(200).json(newCarrito);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar el tiket" });
  }
});
//------------------------------------------------Eliminar carrito
router.delete("/carrito/:id", async (req, res) => {
  const borrarCarrito = await prisma.carrito.delete({
    where: {
      id: parseInt(req.params.id),
    },
  });

  if (!borrarCarrito)
    return res.status(404).json({ error: "Producto no encontrado" });
  res.json(borrarCarrito);
});

//--------------------------------------- buscar las compras del usuario por id
router.get("/carrito/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const carritoId = await prisma.carrito.findMany({
    where: {
      usuarioId: userId,
    },
  });

  if (!carritoId)
    return res.status(404).json({ error: "Publicacion no encontrada" });
  res.json(carritoId);
});

export default router;

//----------------------------------------------ver tabla de usuario y corrito por usuario
router.get("/compras/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);

  // Primero, obtén el usuario con el ID proporcionado
  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
  });

  // Copia el objeto de usuario y elimina los campos "token" y "password"
  const usuarioFiltrado = { ...usuario };
  delete usuarioFiltrado.token;
  delete usuarioFiltrado.password;

  // Luego, obtén todas las direcciones asociadas a ese usuario
  const compras = await prisma.carrito.findMany({
    where: { usuarioId: userId },
  });

  res.json({ usuario: usuarioFiltrado, compras });
});

//ver tabla de compras de todos los usuario
router.get("/ventas", async (req, res) => {
  const compras = await prisma.carrito.findMany(); // Obtener las compras

  // Iterar sobre las compras y obtener los detalles del usuario
  const ventasConUsuarios = await Promise.all(
    compras.map(async (compra) => {
      const usuario = await prisma.usuario.findUnique({
        where: {
          id: compra.usuarioId,
        },
        select: {
          nombre: true,
          correo: true,
          telefono: true,
          nombreCom: true,
        },
      });

      return {
        ...compra,
        ...usuario,
      };
    })
  );

  res.json(ventasConUsuarios);
});
