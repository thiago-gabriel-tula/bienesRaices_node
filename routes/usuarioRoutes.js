import express from "express";

import { formularioLogin, autenticar, formularioRegistro, formularioOlvidePassword, registrar, confirmar, resetPassword, comprobarToken, nuevoPassword, cerrarSesion} from "../controllers/usuarioController.js";

const router = express.Router();


router.get('/login', formularioLogin);
router.post('/login', autenticar);

// Cerrar sesion
router.post('/cerrar-sesion', cerrarSesion)

router.get('/registro', formularioRegistro);
router.post('/registro', registrar);

router.get('/confirmar/:token', confirmar)// eso dos puntos indican que no es una url fija sino que lo que sigue lo va tomar como variable que puede ser utilizada como url

router.get('/olvide-password', formularioOlvidePassword);
router.post('/olvide-password', resetPassword);

// Almacena el nuevo password
router.get('/olvide-password/:token', comprobarToken);
router.post('/olvide-password/:token', nuevoPassword);

export default router;

// METODOS HTTP
// Get: utilizado para Mostrar información
// Post: utilizado para Enviar informaciónn
// Put/Patch: utilizado para Actualizar información
// Delete: utilizado para Eliminar información