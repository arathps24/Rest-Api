import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const router = Router();
const prisma = new PrismaClient();

// ---------------------------------------mostrar administrador
router.get("/admin", async (req, res) => {
  const administrador = await prisma.administrador.findMany();
  res.json(administrador);
});

//--------------------------------------- buscar administrador con su id
router.get("/admin/:id", async (req, res) => {
  const adminId = await prisma.administrador.findFirst({
    where: {
      id: parseInt(req.params.id),
    },
  });

  if (!adminId)
    return res.status(404).json({ error: "Administrador no encontrado" });
  res.json(adminId);
});

//---------------------------------------------borrar administrador
router.delete("/admin/:id", async (req, res) => {
  const borraradmin = await prisma.administrador.delete({
    where: {
      id: parseInt(req.params.id),
    },
  });

  if (!borraradmin)
    return res.status(404).json({ error: "Administrador no encontrado" });
  res.json(borraradmin);
});
//--------------------------------- guardar un nuevo administrador
router.post("/admin", async (req, res) => {
  const { nombre, password } = req.body;
  // Generar una encriptación
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);

  const nuevoadmin = await prisma.administrador.create({
    data: {
      nombre: nombre,
      password: hashedPassword,
    },
  });
  const token = jwt.sign({ adminId: nuevoadmin.id }, "secretoDelToken");

  await prisma.administrador.update({
    where: { id: nuevoadmin.id },
    data: { token },
  });
  const respuesta = {
    administrador: nuevoadmin,
    token: token,
  };
  if (nuevoadmin.token === null) {
    delete respuesta.administrador.token;
  }
  res.json(respuesta);
});

//---------------------------------------Login de administrador
router.post("/admin/login", async (req, res) => {
  const { nombre, password } = req.body;

  const administrador = await prisma.administrador.findMany({
    where: {
      nombre: nombre,
    },
  });

  if (administrador.length > 0) {
    const passwordMatch = await bcrypt.compare(
      password,
      administrador[0].password
    );

    if (passwordMatch) {
      res.json({ message: "Inicio de sesión exitoso" });
    } else {
      res.status(401).json({ error: "Credenciales incorrectas" });
    }
  } else {
    res.status(401).json({ error: "Credenciales incorrectas" });
  }
});

//------------------------------------Actualizar Administrador
router.put("/admin/:id", async (req, res) => {
  const adminActualizado = await prisma.administrador.update({
    where: {
      id: parseInt(req.params.id),
    },
    data: req.body,
  });

  if (!adminActualizado)
    return res.status(404).json({ error: "Administrador no encontrado" });
  res.json(adminActualizado);
});

export default router;
