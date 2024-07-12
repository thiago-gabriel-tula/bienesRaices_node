//Este es el archivo de Models que va estar manejando el Controllers para mandarlo hacia la vista
//este sería el modelo de la base de datos a manejar
import { Sequelize } from "sequelize";
import db from "../config/db.js";
import bcrypt from "bcrypt";

const Usuario = db.define('usuarios', { // define es un método proporcionado por Sequelize (o el ORM que estés utilizando) que se utiliza para definir un nuevo modelo. Este método toma dos argumentos principales: el nombre de la tabla y un objeto que describe las columnas y sus propiedades.
    id:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    email:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    password:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    token: Sequelize.STRING,
    confirmado: Sequelize.BOOLEAN
}, {
    hooks: { //los hooks son funciones que se le pueden dar a los modelos
        //  Aquí se define una función asíncrona que recibe como parámetro el objeto usuario. Esta función será ejecutada antes de que el nuevo registro del usuario se guarde en la base de datos.
        beforeCreate: async function(usuario){ // Este es un hook específico que se ejecuta antes de que un nuevo registro se cree en la base de datos.  Los hooks pueden tener diferentes nombres como beforeUpdate, afterCreate, beforeDestroy
            
            const salt = await bcrypt.genSalt(10);//Esta línea genera una "sal" (salt) para el cifrado de la contraseña. La sal es un valor aleatorio que se usa para fortalecer el cifrado. bcrypt.genSalt(10) genera una sal con un costo de factor 10, lo que determina la complejidad del cifrado.
            
            usuario.password = await bcrypt.hash(usuario.password, salt);// Esta línea toma la contraseña del usuario (usuario.password) y la cifra usando la sal generada previamente. El método bcrypt.hash combina la contraseña y la sal, y produce un hash seguro que se almacena en lugar de la contraseña original.
        }
    },
    scopes:{ //los scopes sirven para eliminar ciertos campos cuando haces una consulta a la base de datos en un modelo en especifico
        eliminarPassword : {
            attributes: {
                exclude:['password', 'token', 'confirmado', 'updatedAt', 'createdAt']
            }
        }

    }
});

// Metodos personalizados 
Usuario.prototype.verificarPassword = function(password){
    return bcrypt.compareSync(password, this.password);
}

export default Usuario;