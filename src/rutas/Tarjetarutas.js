import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const router = Router();
const prisma = new PrismaClient();
export default router;

//mostrar
router.get("/tarjeta", async (req, res) => {
  const tarjeta = await prisma.tarjeta.findMany();
  res.json(tarjeta);
});

//guardar
router.post("/tarjeta/:userId", async (req, res) => {
  function protegerNumeroTarjeta(numeroTarjeta) {
    numeroTarjeta = numeroTarjeta.toString();

    if (numeroTarjeta.length < 4) {
      return "Número de tarjeta inválido";
    }

    const primerosDosDigitos = numeroTarjeta.slice(0, 2);
    const ultimosDosDigitos = numeroTarjeta.slice(-2);
    const dígitosProtegidos = "*".repeat(numeroTarjeta.length - 4);
    const numeroProtegido = `${primerosDosDigitos}${dígitosProtegidos}${ultimosDosDigitos}`;

    return numeroProtegido;
  }

  try {
    const userId = parseInt(req.params.userId);
    const { numerotarjeta, ccv, fecha, banco } = req.body;

    // Protege el número de tarjeta antes de guardarlo en la base de datos
    const numerotarjetaProtegido = protegerNumeroTarjeta(numerotarjeta);

    const nuevaTarjeta = await prisma.tarjeta.create({
      data: {
        numerotarjeta: numerotarjetaProtegido, // Guarda el número de tarjeta protegido
        ccv,
        fecha,
        banco,
        usuario: { connect: { id: userId } },
      },
    });

    res.status(200).json(nuevaTarjeta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar tarjeta" });
  }
});

//actualizar
router.put("/tarjeta/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);

  // Verifica si la dirección existe para el usuario
  const tarjetaexistente = await prisma.tarjeta.findFirst({
    where: { usuarioId: userId }, // Usa el campo de relación correcto (usuarioId)
  });

  if (!tarjetaexistente) {
    return res.status(404).json({ error: "Dirección no encontrada" });
  }

  // Si la dirección existe, procede a actualizarla
  try {
    const tarjetaActualizada = await prisma.tarjeta.update({
      where: {
        id: tarjetaexistente.id, // Usa el campo de ID para actualizar
      },
      data: req.body,
    });
    res.json(tarjetaActualizada);
  } catch (error) {
    res.status(500).json({
      error: "Error al actualizar la dirección",
      message: error.message,
    });
  }
});

//eliminar
router.delete("/tarjeta/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);

  // Primero, busca la dirección que corresponde al usuario
  const tarjetaEncontrada = await prisma.tarjeta.findFirst({
    where: {
      usuarioId: userId,
    },
  });

  if (!tarjetaEncontrada) {
    return res
      .status(404)
      .json({ error: "Tarjeta no encontrada para este usuario" });
  }

  // Luego, elimina la dirección encontrada
  const tarjetaBorrada = await prisma.tarjeta.delete({
    where: {
      id: tarjetaEncontrada.id,
    },
  });

  res.json(tarjetaBorrada);
});

//ver tabla de usuario y tarjeta
router.get("/tarjeta/:userId", async (req, res) => {
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
  const tarjetas = await prisma.tarjeta.findMany({
    where: { usuarioId: userId },
  });

  res.json({ usuario: usuarioFiltrado, tarjetas });
});

// mostar tarjetas por id
router.get("/tarjetas/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);

  // Luego, obtén todas las direcciones asociadas a ese usuario
  const tarjetas = await prisma.tarjeta.findMany({
    where: { usuarioId: userId },
  });
  if (tarjetas.length > 0) {
    res.json(tarjetas[0]); // Envía el primer objeto de la matriz directamente
  } else {
    res.json({}); // Si no hay tarjetas, envía un objeto vacío
  }
});
