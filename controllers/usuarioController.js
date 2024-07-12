import {check, validationResult} from 'express-validator';
import bcrypt from 'bcrypt';
import { generarId, generarJwt } from '../helpers/token.js';
import { emailRegistro, emailOlvidePassword} from '../helpers/emails.js';

// Importar modelos para manejarlos
import Usuario from "../models/Usuario.js";


const formularioLogin = (req, res)=>{
    res.render('auth/login', {
        pagina: 'Iniciar sesión',
        csrfToken: req.csrfToken()
    });  //lo que hace .render() es leer el contenido pug y mostrarlo. Lo que está adentro del parentecis es la ubicacion del archivo pug, despues se le pasa como segundo parametro la informacion que le quieras pasar
}

const autenticar = async (req, res)=>{
    // Validar
    await check('email').isEmail().withMessage('Email es obligatorio').run(req);
    await check('password').notEmpty().withMessage('El password es obligatorio').run(req);
    
    let resultado = validationResult(req);

    if(!resultado.isEmpty()){
        // Errores
        return  res.render('auth/login', {
            pagina: 'Iniciar sesión',
            errores: resultado.array(),
            csrfToken: req.csrfToken(),
            
        });
    }

    const {email, password} = req.body;
    // Comprobar si el usuario existe
    const usuario = await Usuario.findOne({where:{email}});
    if(!usuario){
        return  res.render('auth/login', {
            pagina: 'Iniciar sesión',
            errores: [{msg: 'El usuario no existe'}],
            csrfToken: req.csrfToken(),
            
        });
    }

    // comprobar que el usuario esté confirmado
    if(!usuario.confirmado){
        return  res.render('auth/login', {
            pagina: 'Iniciar sesión',
            errores: [{msg: 'Tu cuenta no ha sido confirmada'}],
            csrfToken: req.csrfToken(),
            
        });
    }

    // Revisar el password
    if(!usuario.verificarPassword(password)){
        return  res.render('auth/login', {
            pagina: 'Iniciar sesión',
            errores: [{msg: 'El password es incorrecto'}],
            csrfToken: req.csrfToken(),
            
        });
    }

    // Autenticar usuario
    const token = generarJwt({id: usuario.id, nombre: usuario.nombre, });
    
    console.log(token);

    // almacenar en un cookie

    //cookie es un método del objeto de respuesta res que se usa para configurar cookies en el navegador del cliente.

    return res.cookie('_token', token, {//'_token': Este es el nombre de la cookie. token: Este es el valor de la cookie. (llave valor como en localstorage)
        httpOnly: true,// Objeto de opciones: Las opciones adicionales para la cookie están definidas dentro de un objeto. 
        secure:true,
        sameSite:true
    }).redirect('/mis-propiedades');


}


const cerrarSesion = (req, res)=>{
    return res.clearCookie('_token').status(200).redirect('/auth/login')
}


const formularioRegistro = (req, res)=>{
    res.render('auth/registro', {
        pagina: 'Crear cuenta',
        csrfToken: req.csrfToken()
    });
}

const registrar = async (req, res)=>{
    // Validacion
    await check('nombre').notEmpty().withMessage('El nombre no puede ir vacio').run(req);// registra por el name de cada campo. noEmty signifca que va a vefificar que el campo con el name 'nombre' no esté vació. El .withMessage() es para manipular el mensaje de error. El .run() es para llamar a la funcion
    await check('email').isEmail().withMessage('Email incorrecto').run(req);
    await check('password').isLength({min: 6}).withMessage('El password debe de ser de 6 caracteres minimo').run(req);
    await check('repetir_password').equals('password').withMessage('Los password no son iguales').run(req);

    let resultado = validationResult(req); //ValidationResult() va a revisar las reglas que se hayan definido con el check(). si alguna de las reglas no se cumple devuelve un array con el objeto del incumpliemnto de lo contrario. devuelve un array vacio

    //Verificar que el resultado esté vacio
    if(!resultado.isEmpty()){
        // Errores
        return  res.render('auth/registro', {
            pagina: 'Crear cuenta',
            errores: resultado.array(),
            csrfToken: req.csrfToken(),
            usuario:{
                nombre:req.body.nombre,
                email: req.body.email
            }
        });
    }

    // Extraer los datos
    const {email, nombre, password} = req.body;

    // Verificar que el usuario no esté duplicado
    const existeUsuario = await Usuario.findOne({where: {email}});
    
   if(existeUsuario){
        return res.render('auth/registro', {
            pagina: 'Crear cuenta',
            errores: [{msg: 'El usuario ya está Registrado'}],
            csrfToken: req.csrfToken(),
            usuario: {
                nombre,
                email
            }
        })
   }


    //  Almacenar un usuario
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    });

    // Envia email de confirmacion
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    // Mostrar mensaje de confirmacion
    res.render('templates/mensaje', {
        pagina: 'Cuenta creada correctamente',
        mensaje: 'Hemos enviado un Email de confirmación, presiona en el mensaje'
    })
   
}

// Funcion que comprueba una cuenta
const confirmar = async (req, res)=>{
    // req.params Se usa para leer parámetros de ruta, es como req.body que lee el cuerpo, en este caso lee la variable de la ruta 
    //el valor /:token será capturado como un parámetro de la ruta llamado token. Puedes acceder a este valor usando req.params.token dentro del manejador de la ruta

    const {token} = req.params;
   

    // Verificar si el token es valido
    const usuario = await Usuario.findOne({where: {token}});
    console.log(usuario);

    if(usuario == null){
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true
        })
    }


    // Confirmar la cuenta
    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save();

    res.render('auth/confirmar-cuenta', {
        pagina: 'Cuenta Confirmada',
        mensaje: 'La cuenta se confirmó correctamente',
    })

}

const formularioOlvidePassword = (req, res)=>{
    res.render('auth/olvide-password', {
        pagina: 'Recupera tu acceso a Bienes Raices ',
        csrfToken: req.csrfToken()
    });
}

const resetPassword = async (req, res)=>{
    // Validacion
    await check('email').isEmail().withMessage('Eso no parece un Email').run(req);
     
    let resultado = validationResult(req); //ValidationResult() va a revisar las reglas que se hayan definido con el check(). si alguna de las reglas no se cumple devuelve un array con el objeto del incumpliemnto de lo contrario. devuelve un array vacio
 
    //Verificar que el resultado esté vacio
    if(!resultado.isEmpty()){
        // Errores
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu cuenta a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    // Buscar usuario
    const {email} = req.body;

    const usuario = await Usuario.findOne({where: {email}});
    
    if(!usuario){
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu cuenta a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El Email no pertenece a ningun usuario'}]
        })
    }

    // Generar un token y enviar al email
    usuario.token = generarId();
    await usuario.save();

    // enviar email
    emailOlvidePassword({email:usuario.email, nombre: usuario.nombre, token: usuario.token});

    // Renderizar un mensaje
    res.render('templates/mensaje', {
        pagina: 'Reestablece tu password',
        mensaje: ' Te hemos enviado un Email con las instrucciones'
    })
}

const comprobarToken = async (req, res)=>{
    const {token} = req.params;

    const usuario = await Usuario.findOne({where: {token}});

    if(!usuario){
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Reestablece tu password',
            mensaje: 'Hubo un error al validar tu información, Intenta de nuevo',
            error: true
        })
    }

    // Mostrar formulario para modificar el password
    res.render('auth/reset-password', {
        pagina:'Reestablece tu password',
        csrfToken: req.csrfToken()
    })
}


const nuevoPassword = async (req, res)=>{
    // Validar el password
    await check('password').isLength({min:6}).withMessage('El password debe tener 6 caracters minimo').run(req);

    let resultado = validationResult(req);

    if(!resultado.isEmpty()){
        // Errores
        return  res.render('auth/reset-password', {
            pagina: 'Reestablece tu password',
            errores: resultado.array(),
            csrfToken: req.csrfToken(),
            usuario:{
                nombre:req.body.nombre,
                email: req.body.email
            }
        });
    }

    const {token} = req.params;
    const {password} = req.body;

    // Identificar quien hace el cambio
    const usuario = await Usuario.findOne({where: {token}});
    

    // Hashear el nuevo password
    const salt = await bcrypt.genSalt(10);//Esta línea genera una "sal" (salt) para el cifrado de la contraseña. La sal es un valor aleatorio que se usa para fortalecer el cifrado. bcrypt.genSalt(10) genera una sal con un costo de factor 10, lo que determina la complejidad del cifrado.
            
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token = null;

    await usuario.save();

    res.render('auth/confirmar-cuenta', {
        pagina: 'Password reestablecido',
        mensaje: 'El password se guardó correctamente'
    })
}

export {
    formularioLogin,
    formularioRegistro,
    formularioOlvidePassword,
    registrar,
    confirmar,
    resetPassword,
    comprobarToken,
    nuevoPassword,
    autenticar,
    cerrarSesion
}