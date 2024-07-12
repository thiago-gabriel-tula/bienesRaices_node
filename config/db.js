import Sequelize from "sequelize";
import mysql2 from 'mysql2';
import dotenv from "dotenv";

dotenv.config({path: '.env'}); //Le tenemos que decir en que parte va encontrar ese archivo de .env

const db = new Sequelize(process.env.BD_NOMBRE, process.env.BD_USER, process.env.BD_PASSWORD, { //toma 4 parametros. Nombre de la base de datos, el usuario, el password y un objeto de configuracion
    // CONFIGURACION DE UNA BASE DE DATOS
    host:process.env.BD_HOST, //Especifica el nombre del host o la dirección IP del servidor de la base de datos. 
    port:3307, //Define el puerto en el que el servidor MySQL está escuchando
    dialect:'mysql', //  Indica el tipo de base de datos que se está utilizando.
    dialectModule: mysql2, // Especifica el módulo de dialecto como mysql2
    define: {
        timestamp: true // Aquí se definen algunas configuraciones predeterminadas para los modelos de Sequelize. La opción timestamp: true significa que Sequelize automáticamente añadirá los campos createdAt y updatedAt a los modelos, para gestionar las marcas de tiempo de creación y actualización de registros.
    },
    pool: { //  Esto ayuda a gestionar múltiples conexiones y puede mejorar el rendimiento
        max:15, //El número máximo de conexiones que el pool puede mantener al mismo tiempo
        min:0, //  Aquí, puede tener 0 conexiones mínimas, es decir, no mantendrá conexiones abiertas innecesariamente.
        adquire:30000, //: El tiempo máximo, en milisegundos, que el pool tratará de establecer una conexión antes de lanzar un error
        idle: 10000 //El tiempo máximo, en milisegundos, que una conexión puede estar inactiva antes de ser liberada. 
    },
    operatorAliases: false
});

// const db = new Sequelize('mysql://bienesRaices_dirtzeroby:5aa66a07faef3e228c7c2eef68f9b3a4f60cba83@7mr.h.filess.io:3307/bienesRaices_dirtzeroby');

export default db;