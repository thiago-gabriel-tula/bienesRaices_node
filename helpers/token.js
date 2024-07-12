import jwt from 'jsonwebtoken';


// genera un identificador único basado en la combinación de la marca de tiempo actual y un número aleatorio.
const generarId = ()=> Math.random().toString(32).substring(2) + Date.now().toString(32);

// jsonwebtoken
const generarJwt = datos=>{
    // El primer objeto es la informacion que queremos guardar en ese json web token
    return jwt.sign({id: datos.id, nombre: datos.nombre}, process.env.JWT_SECRET, {expiresIn: '1y'});// este objeto es para definir cuanto va a durar ese json web token
}



export {
    generarId,
    generarJwt

};
