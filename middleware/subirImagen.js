import multer from 'multer';
import path from 'path'; // con path puedes leer la ubicacion de un archivo o navegar en diferentes acarpetas 
import {generarId} from '../helpers/token.js'

const storage = multer.diskStorage({
    destination: function(req, file, callBack){
        callBack(null, './public/uploads/')
    },
    filename: function(req, file, callBack){
        callBack(null, generarId() + path.extname(file.originalname))// extname : trae la extencion del archivo
    }
});

const upload = multer({storage});

export default upload;