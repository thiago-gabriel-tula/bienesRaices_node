import express from "express" //extrae la funcion
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";
import serverless from 'serverless-http'

import usuarioRoutes from "./routes/usuarioRoutes.js";
import propiedadesRoutes from "./routes/propiedadesRoutes.js";
import appRoutes from "./routes/appRoutes.js";
import apiRoutes from "./routes/apiRoutes.js";
import db from "./config/db.js";

//crear la app (acá llamamos a la funcion extraída)
const app = express();

//Habilitar lectura de datos de formularios (no lee archivos. solo imputs. para leer archivos se requiere la extension de multer)
app.use(express.urlencoded({extended: true}));

dotenv.config({path: '.env'}) //config es un método proporcionado por la librería dotenv. Este método lee el archivo .env, parsea su contenido y agrega las variables de entorno definidas en ese archivo a process.env. {path: '.env'}: Este objeto es una configuración opcional que se le pasa al método config. La clave path especifica la ruta del archivo .env que debe leerse. En este caso, la ruta es '.env', lo que indica que el archivo .env se encuentra en el directorio actual del proyecto.

// Habilitar cookie-parser
app.use(cookieParser());

// Habilitar el CSRF
app.use(csrf({cookie: true}));

// Conexion a la base de datos
const conectarBD = async ()=>{
    try {
        await db.authenticate(); //autenticar y conectar con la base de datos.
    
        db.sync();//Genera una tabla de los modelos sql si no existe
        console.log('Conexion correcta a la base de datos');
    } catch (error) {
        console.log(error);
    }
}

conectarBD();

// Habilitar Pug
app.set('view engine', 'pug'); // .set() es para agregar configuracion. acá adentro le ponemos el engine que vamos a utilizar (engine es para escribir html desde el servidor)
app.set('views', './views'); //Acá le pasamos las carpetas en donde va a estar los archivos pug

// carpeta publica
app.use(express.static('public')); //En esta carpeta va a identificar los archivos estaticos

// Routing
app.use('/', appRoutes);
app.use('/auth', usuarioRoutes); //.get() busca una ruta en especifica que está dentro del parentecis. Y .use() busca todas las rutas que inicien con lo especificado
app.use('/', propiedadesRoutes);
app.use('/api', apiRoutes);
// es como hacer esto: 
//     app.get('/auth', (req, res)=>{
//         res.render('auth/login', {
//             autenticado: true
//         });
//     })

// Definir un puerto y arrancar el proyecto
const port = process.env.PORT || 3000;

app.listen(port, ()=>{
    console.log(`El servidor está conectada en http://localhost:${port}`);
});

export default app;