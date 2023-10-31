import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const router = Router();
const prisma = new PrismaClient();
export default router;

//mostrar
router.get("/direccion", async (req, res) => {
  const direcciones = await prisma.direccion.findMany();
  res.json(direcciones);
});
//guardar
router.post("/direccion/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const {
      estado,
      municipio,
      calle,
      referencias,
      NumeroExterior,
      NumeroInterior,
    } = req.body;

    const nuevaDireccion = await prisma.direccion.create({
      data: {
        estado,
        municipio,
        calle,
        referencias,
        NumeroExterior,
        NumeroInterior,
        usuario: { connect: { id: userId } }, // Asocia la dirección con el usuario
      },
    });

    res.status(200).json(nuevaDireccion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar ruta" });
  }
});

//actualizar
router.put("/direccion/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);

  // Verifica si la dirección existe para el usuario
  const direccionExistente = await prisma.direccion.findFirst({
    where: { usuarioId: userId }, // Usa el campo de relación correcto (usuarioId)
  });

  if (!direccionExistente) {
    return res.status(404).json({ error: "Dirección no encontrada" });
  }

  // Si la dirección existe, procede a actualizarla
  try {
    const direccionActualizada = await prisma.direccion.update({
      where: {
        id: direccionExistente.id, // Usa el campo de ID para actualizar
      },
      data: req.body,
    });
    res.json(direccionActualizada);
  } catch (error) {
    res.status(500).json({
      error: "Error al actualizar la dirección",
      message: error.message,
    });
  }
});

//eliminar
router.delete("/direccion/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);

  // Primero, busca la dirección que corresponde al usuario
  const direccionEncontrada = await prisma.direccion.findFirst({
    where: {
      usuarioId: userId,
    },
  });

  if (!direccionEncontrada) {
    return res
      .status(404)
      .json({ error: "Dirección no encontrada para este usuario" });
  }

  // Luego, elimina la dirección encontrada
  const direccionBorrada = await prisma.direccion.delete({
    where: {
      id: direccionEncontrada.id,
    },
  });

  res.json(direccionBorrada);
});

//buscar
/*router.get("/direccion/:id", async (req, res) => {
  const productoId = await prisma.direccion.findFirst({
    where: {
      id: parseInt(req.params.id),
    },
  });

  if (!productoId)
    return res.status(404).json({ error: "Producto no encontrado" });
  res.json(productoId);
});*/

router.get("/direccion/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);

  // Primero, obtén el usuario con el ID proporcionado
  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
  });

  if (!usuario) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  // Copia el objeto de usuario y elimina los campos "token" y "password"
  const usuarioFiltrado = { ...usuario };
  delete usuarioFiltrado.token;
  delete usuarioFiltrado.password;

  // Luego, obtén todas las direcciones asociadas a ese usuario
  const direcciones = await prisma.direccion.findMany({
    where: { usuarioId: userId },
  });

  res.json({ usuario: usuarioFiltrado, direcciones });
});

// mostar tarjetas por id
router.get("/direcciones/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);

  // Luego, obtén todas las direcciones asociadas a ese usuario
  const Direccion = await prisma.direccion.findMany({
    where: { usuarioId: userId },
  });
  if (Direccion.length > 0) {
    res.json(Direccion[0]); // Envía el primer objeto de la matriz directamente
  } else {
    res.json({}); // Si no hay tarjetas, envía un objeto vacío
  }
});
