// Este Archivo sirve para hacer relaciones/asociaciones entre tablas

import Categoria from './Categoria.js';
import Mensaje from './Mensaje.js';
import Precio from './Precio.js';
import Propiedad from './Propiedad.js';
import Usuario from './Usuario.js';


//Precio.hasOne(Propiedad);// 1:1 se lee así: La base de datos "Propiedad" tiene un (hasOne) "Precio" (que sería la otra db)

Propiedad.belongsTo(Precio, {foreingKey: 'precioId'});//1:1 Hace lo mismo que el de arriba, solo que de izquierda a derecha. El de arriba se lee de derecha a izquierda
Propiedad.belongsTo(Categoria, {foreingKey: 'categoriaId'}); // el foreingKey es como va a estar llamado dentro de la tabla
Propiedad.belongsTo(Usuario, {foreingKey: 'usuarioId'});
Propiedad.hasMany(Mensaje, {foreingKey: 'propiedadId'});

Mensaje.belongsTo(Propiedad, {foreingKey: 'propiedadId'});
Mensaje.belongsTo(Usuario, {foreingKey: 'usuarioId'});

export {
    Precio,
    Categoria,
    Usuario,
    Propiedad,
    Mensaje
};