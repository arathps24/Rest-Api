import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
const router = Router();
const prisma = new PrismaClient();
export default router;

//--------------------------------- Ruta para notificar inicio de cambio de contraseña
router.post("/envio-cambio", async (req, res) => {
  const { correo } = req.body;

  // Verificar si el correo está asociado a un usuario
  const usuario = await prisma.usuario.findFirst({
    where: { correo: correo },
  });

  if (!usuario) {
    return res.status(404).json({ error: "Este Correo No Esta Registrado" });
  }

  function generarToken() {
    const longitudToken = 100;
    const caracteres =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";

    for (let i = 0; i < longitudToken; i++) {
      const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
      token += caracteres.charAt(indiceAleatorio);
    }

    return token;
  }
  const tokenGenerado = generarToken();
  const resetLink = `http://localhost:5173/Cambio/${tokenGenerado}`;

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { token: tokenGenerado },
  });

  setTimeout(async () => {
    const tokenGenerado = generarToken();
    try {
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { token: tokenGenerado },
      });
      //console.log("Token expirado eliminado de la base de datos");
    } catch (error) {
      console.error("Error al eliminar el token:", error);
    }
  }, 36000);

  // envio a correo
  const transporterConfig = {
    service: "", // Se llenará dependiendo del proveedor
    auth: {
      user: "", // Tu correo aquí
      pass: "", // Tu contraseña aquí
    },
    secure: true,
    port: 465,
  };

  if (correo.endsWith("@gmail.com")) {
    transporterConfig.service = "Gmail";
    transporterConfig.auth.user = "abarrotesneon@gmail.com";
    transporterConfig.auth.pass = "uwfg irnf aahd yvfw";
  } else if (
    correo.endsWith("@hotmail.com") ||
    correo.endsWith("@outlook.com")
  ) {
    transporterConfig.host = "smtp.live.com";
    transporterConfig.service = "outlook";
    transporterConfig.auth.user = "abarrotesneon@hotmail.com";
    transporterConfig.auth.pass = "npejbluvsatqifhn";
    transporterConfig.secure = false; // Intenta establecer secure en false para Hotmail
    transporterConfig.port = 587;
  } else {
    return res.status(400).json({ error: "Proveedor de correo no compatible" });
  }

  const transporter = nodemailer.createTransport(transporterConfig);

  // Contenido del correo
  const mailOptions = {
    from: transporterConfig.auth.user,
    to: correo, // Destinatario
    subject: "Cambio de contraseña",
    html: `
    <div style="font-family: Arial, sans-serif; color: #333; background-color: #cbd5e1; padding: 20px; border-radius: 5px; text-align: center;">
    <p style="font-size: 18px;">Se ha iniciado el proceso para restablecer tu contraseña. Por favor presione el siguiente enlace:</p>
    <a href="${resetLink}" style="display: inline-block; padding: 20px 50px; background-color: #082f49; color: #fff; text-decoration: none; border-radius: 5px; font-size: 15px">Restablecer Contraseña</a>
    <p style="font-size: 18px;">El enlace expirará en una hora.</p>
  </div>
  `,
  };

  // Envío del correo
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ error: "Error al enviar el correo" });
    } else {
      //console.log("Correo enviado: " + info.response);
      res.json({
        message: "Se ha enviado un correo para restablecer la contraseña",
      });
    }
  });
});

//--------------------------------- Ruta para actualizar la contraseña con el token
router.put("/cambio-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Verificar si el token está asociado a un usuario
  const usuario = await prisma.usuario.findFirst({
    where: { token: token },
  });

  if (!usuario) {
    return res.status(404).json({ error: "el usuario no existe" });
  }

  // Generar una encriptación para la nueva contraseña
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Actualizar la contraseña del usuario
  const usuarioActualizado = await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      password: hashedPassword,
    },
  });

  if (!usuarioActualizado) {
    return res.status(500).json({ error: "Error al actualizar la contraseña" });
  }

  res.json({ message: "Contraseña actualizada exitosamente" });
});

// buscar usuario por token
router.get("/usuario-token/:token", async (req, res) => {
  const usuarioToken = await prisma.usuario.findFirst({
    where: {
      token: req.params.token,
    },
  });

  if (!usuarioToken)
    return res.status(404).json({ error: "Usuario no encontrado" });
  res.json(usuarioToken);
});
