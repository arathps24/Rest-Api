import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const router = Router();
const prisma = new PrismaClient();
export default router;
// ---------------------------------------mostrar Usuario
router.get("/usuario", async (req, res) => {
  const usuario = await prisma.usuario.findMany();
  res.json(usuario);
});

//--------------------------------------- buscar Usuario con su id
router.get("/usuario/:id", async (req, res) => {
  const usuarioId = await prisma.usuario.findFirst({
    where: {
      id: parseInt(req.params.id),
    },
  });

  if (!usuarioId)
    return res.status(404).json({ error: "Usuario no encontrado" });
  res.json(usuarioId);
});

//---------------------------------------------borrar Usuario
router.delete("/usuario/:id", async (req, res) => {
  const borrarusuario = await prisma.usuario.delete({
    where: {
      id: parseInt(req.params.id),
    },
  });

  if (!borrarusuario)
    return res.status(404).json({ error: "Usuario no encontrado" });
  res.json(borrarusuario);
});

//--------------------------------- guardar un nuevo Usuario
router.post("/usuario", async (req, res) => {
  const { correo, nombre, password } = req.body;

  // Verificar si ya existe un usuario con el mismo correo
  const usuarioExistente = await prisma.usuario.findFirst({
    where: { correo: correo },
  });

  if (usuarioExistente) {
    // Si el usuario ya existe, devolver un error de duplicado
    return res.status(409).json({ error: "Correo electrónico ya registrado" });
  }

  // Generar una encriptación
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);

  // Encriptar la contraseña
  const hashedPassword = await bcrypt.hash(password, salt);

  const nuevousuario = await prisma.usuario.create({
    data: {
      correo: correo,
      nombre: nombre,
      password: hashedPassword,
    },
  });

  const token = jwt.sign({ adminId: nuevousuario.id }, "secretoDelToken");

  await prisma.usuario.update({
    where: { id: nuevousuario.id },
    data: { token },
  });

  const respuesta = {
    usuario: nuevousuario,
    token: token,
  };

  if (nuevousuario.token === null) {
    delete respuesta.usuario.token;
  }

  res.json(respuesta);
});

//---------------------------------------Login de Usuario
router.post("/usuario/login", async (req, res) => {
  const { correo, password } = req.body;

  const usuario = await prisma.usuario.findMany({
    where: {
      correo: correo,
    },
  });

  if (usuario.length > 0) {
    const passwordMatch = await bcrypt.compare(password, usuario[0].password);

    if (passwordMatch) {
      res.json(usuario[0]);
    } else {
      res.status(401).json({ error: "Credenciales incorrectas" });
    }
  } else {
    res.status(401).json({ error: "Credenciales incorrectas" });
  }
});

//------------------------------------Actualizar Usuario
router.put("/usuario/:id", async (req, res) => {
  const usuarioActualizado = await prisma.usuario.update({
    where: {
      id: parseInt(req.params.id),
    },
    data: req.body,
  });

  if (!usuarioActualizado)
    return res.status(404).json({ error: "Usuario no encontrado" });
  res.json(usuarioActualizado);
});
