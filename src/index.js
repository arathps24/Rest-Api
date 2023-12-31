import express from "express";
import cors from "cors";
import Adminrutas from "./rutas/Adminrutas.js";
import Usuariorutas from "./rutas/Usuariorutas.js";
import Productorutas from "./rutas/Productorutas.js";
import Direccion from "./rutas/Direccionrutas.js";
import Carrito from "./rutas/Carritorutas.js";
import Tarjeta from "./rutas/Tarjetarutas.js";
import EnvioCorreo from "./rutas/RutasMensajesCorreo.js";
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", Adminrutas);
app.use("/api", Usuariorutas);
app.use("/api", Productorutas);
app.use("/api", Direccion);
app.use("/api", EnvioCorreo);
app.use("/api", Tarjeta);
app.use("/car", Carrito);
app.listen(3001);
console.log("Servidor con el puerto", 3001);
