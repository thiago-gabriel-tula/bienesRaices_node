import {exit} from 'node:process';
import categorias from "./categorias.js";
import precios from "./precios.js";
import usuarios from "./usuarios.js";


import db from "../config/db.js";

import { truncate } from 'node:fs';

import { Categoria, Precio, Usuario } from '../models/index.js';// Aca no estamos importando los modelos sino que estamos importando los modelos con las tablas ya relacionadas

const importarDatos = async ()=>{
    try {
        // Autenticar
        await db.authenticate();

        // Insertar las columnas
        await db.sync(); //crea las tablas si no existen, según los modelos definidos.

        // Insertamos los datos
        await Promise.all([
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios),
            Usuario.bulkCreate(usuarios)

        ]) // inserta múltiples registros en la tabla Categoria

        console.log('Datos importados correctamente');

        exit();// cuando se pone exit() o exit(0) significa termina el proceso pero que todo salio bien y si se le pone exit(1) es porque queremos que termine el proceso pero hubo un error

    } catch (error) {
        console.log(error);
        exit(1);// Es una forma de terminar el proceso
    }
}


const eliminarDatos = async ()=>{
    try {
        await Promise.all([
            Categoria.destroy({where: {}, truncate: true}), // si no se le pasa el truncate va a eliminar los registros pero guardas los id de la tabla, entonces cuando vuelvas a actualizar la base de datos vuelve a empezar desde el id siguiente al anterior eliminado
            Precio.destroy({where: {}, truncate: true})

        ]);

        console.log('Datos eliminados correctamente');
        exit();
    } catch (error) {
        console.log(error);
        exit(1);
    }
}

if(process.argv[2] === "-i"){
    importarDatos();
};

// "db:importar": "node ./seed/seeder.js -i"  ESTO ES LO QUE ESTÁ EN PACKAGE.JSON

// "node ./seed/seeder.js -i" esta parte es el .argv que lo va a leer como un array: [node, ./seed/seeder.js, -i] 

// Entonces la posicion 2 seria "-i" 

if(process.argv[2] === "-e"){
    eliminarDatos();
};