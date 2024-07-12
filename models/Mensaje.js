import { Sequelize } from "sequelize";
import db from "../config/db.js";

const Mensaje = db.define('mensajes', {
    mensaje: {
        type: Sequelize.STRING(200),
        allowNull: false
    },
    
});

export default Mensaje;