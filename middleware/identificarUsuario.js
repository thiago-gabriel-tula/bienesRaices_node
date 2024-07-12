import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

const identificarUsuario = async (req, res, next)=>{
    // Identificar si hay un token 
    const {_token} = req.cookies;

    if(!_token){
        req.usuario = null;
        return next();
    }

    // Comprobar el token
    try {
        const decoded = jwt.verify(_token, process.env.JWT_SECRET);
        const usuario = await Usuario.findOne({where: {id: decoded.id}});

        if(usuario){
            req.usuario = usuario;
            console.log(`EL USUARIO ES ESTE: ${usuario}`)
        }

        return next();

    } catch (error) {
        console.log(error);
        res.clearCookie('_token').redirect('auth/login')
    }
}

export default identificarUsuario;