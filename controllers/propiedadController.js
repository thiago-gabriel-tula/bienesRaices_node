import {unlink} from 'node:fs/promises';
import {Categoria, Precio, Propiedad, Usuario, Mensaje} from '../models/index.js';
import {validationResult} from 'express-validator';
import { esVendedor, formatearFecha } from '../helpers/index.js';

const admin = async (req, res)=>{
    // Leer queryString
    const {pagina: paginaActual} = req.query;

    const expresion = /^[1-9]$/ // esto es una expresion regular. lo que está entre corchetes es lo que va comprobar que solo acepte digitos del 0 al 9. ^ esto sirve para indicar que tiene que iniciar con digito. $ esto indica que debe terminar con digito

    if(!expresion.test(paginaActual)){//devuelve un true o un false
        res.redirect('/mis-propiedades?pagina=1')

    }



    try {
        const {id} = req.usuario;

        // limit y offset para el paginador
        const limit = 10;
        const offset = ((paginaActual * limit) - limit);

        const [propiedades, total] = await Promise.all([
            Propiedad.findAll({
                limit: Number(limit), // limit es el limite de datos que puede darnos
                offset: Number(offset), //offset es para decirle a partir de donde empieza a pasar los datos
                where: {
                    usuarioId: id
                }, 
                include:[
                    {model: Categoria, as: 'categoria'},
                    {model: Precio, as: 'precio'},
                    {model: Mensaje, as: 'mensajes'}
                ]
            }),
            Propiedad.count({where:{usuarioId : id}})
        ]);
    
        res.render('propiedades/admin', {
            pagina: 'Mis Propiedades',
            propiedades,
            csrfToken: req.csrfToken(),
            paginas: Math.ceil(total / limit),
            paginaActual: Number(paginaActual),
            offset,
            total,
            limit
        });    
    } catch (error) {
     console.log(error);   
    }

}


// Formulario para crear una nueva propiedad
const crear = async (req, res)=>{
    // Consultar modelo de precios y categorias
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])
    
    
    res.render('propiedades/crear', {
        pagina: 'Crear propiedad',
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: {}
    });
};

const guardar = async (req, res)=>{
    // Validacion 
    let resultado = validationResult(req);

    if(!resultado.isEmpty()){
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ]);

        return res.render('propiedades/crear', {
            pagina: 'Crear propiedad',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        })
    }

    // Cear registro
    try {
        const {titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: precioId, categoria: categoriaId} = req.body;//a precio lo renombramos como precioId con el siguiente codigo: "{precio: precioId} = req.body" de esta forma cuando llamemos a "precioId" estariamos llamando a "precio" 
        const {id: usuarioId} = req.usuario;

        const propiedadGuardada = await Propiedad.create({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
            usuarioId,
            imagen: ''
        });

        const {id} = propiedadGuardada;

        res.redirect(`/propiedades/agregar-imagen/${id}`);

    } catch (error) {
        console.log(error)
    }
}


const agregarImagen = async (req, res)=>{

    const {id} = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if(!propiedad){
        return res.redirect('/mis-propiedades');
    }

    // Validar que la propiedad no esté publicada
    if(propiedad.publicado){
        return res.redirect('/mis-propiedades');
    }

    // Validar que la propiedad pertenece a quien visita esta pagina
    if(req.usuario.id.toString() !== propiedad.usuarioId.toString()){
        return res.redirect('/mis-propiedades');
    }

    console.log(req.usuario.id);
    console.log(propiedad.usuarioId);

    res.render('propiedades/agregar-imagen', {
        pagina: `Agregar Imagen: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        propiedad
    })
}

const almacenarImagen = async (req, res, next)=>{
    const {id} = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if(!propiedad){
        return res.redirect('/mis-propiedades');
    }

    // Validar que la propiedad no esté publicada
    if(propiedad.publicado){
        return res.redirect('/mis-propiedades');
    }

    // Validar que la propiedad pertenece a quien visita esta pagina
    if(req.usuario.id.toString() !== propiedad.usuarioId.toString()){
        return res.redirect('/mis-propiedades');
    }

    try {

        // Almacenar la imagen y publicar propiedad
        propiedad.imagen = req.file.filename;
        propiedad.publicado = 1;

        await propiedad.save();

        next();

    } catch (error) {
        console.log(error);
    }
}


const editar = async (req, res)=>{
    const { id } = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);
    if(!propiedad){
        return res.redirect('/mis-propiedades');
    }
   
    // Revisar que quien visita la URL, es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades');
    }

    // Consultar modelo de precios y categorias
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])
        
        
    res.render('propiedades/editar', {
        pagina: `Editar propiedad: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: propiedad,
    });
}

const guardarCambios = async (req, res)=>{
    // Verificar la validación 
    let resultado = validationResult(req);

    if(!resultado.isEmpty()){
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ]);

        return res.render('propiedades/editar', {
            pagina: 'Editar propiedad',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        })
    }


    const { id } = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);
    
    if(!propiedad){
        return res.redirect('/mis-propiedades');
    }
   
    // Revisar que quien visita la URL, es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades');
    }


    // Reescribir el objeto y actualizarla
    try {
        const {titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: precioId, categoria: categoriaId} = req.body;
       
        propiedad.set({//.set() Se utiliza este método cuando necesites actualizar múltiples propiedades al mismo tiempo 
           titulo,
           descripcion,
           habitaciones,
           estacionamiento,
           wc,
           calle,
           lat,
           lng,
           precioId,
           categoriaId
        });

        await propiedad.save();
        res.redirect('/mis-propiedades');
        
    } catch (error) {
        console.log(error);
    }
}

const eliminar = async (req, res)=>{
    const { id } = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    
    if(!propiedad){
        return res.redirect('/mis-propiedades');
    }
   
    // Revisar que quien visita la URL, es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades');
    }

    // Eliminar la imagen asociada en nuestra carpeta de public
    await unlink(`public/uploads/${propiedad.imagen}`)

    // Eliminar la propiedad
    await propiedad.destroy();
    res.redirect('/mis-propiedades');
}

// Modifica el estado de la propiedad
const cambiarEstado = async (req, res)=>{
    const { id } = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    
    if(!propiedad){
        return res.redirect('/mis-propiedades');
    }
   
    // Revisar que quien visita la URL, es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades');
    }

    // Actualizar
    propiedad.publicado = !propiedad.publicado 

    await propiedad.save();

    res.json({
        resultado: "ok"
    })
}

// Muestra una propiedad
const mostrarPropiedad = async (req, res)=>{
    const {id} = req.params;

    // Comprobar que la propiedad exista 
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            {model: Precio, as: 'precio'},
            {model: Categoria, as: 'categoria'},
            {model: Usuario, as: 'usuario'}
        ]
    });

    if(!propiedad || !propiedad.publicado){
        return res.redirect('/404');
    }


    res.render('propiedades/mostrar', {
        propiedad,
        pagina: propiedad.titulo,
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId)

    })
}


const enviarMensaje = async (req, res)=>{
    const {id} = req.params;

    // Comprobar que la propiedad exista 
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            {model: Precio, as: 'precio'},
            {model: Categoria, as: 'categoria'},
            {model: Usuario, as: 'usuario'}
        ]
    });

    if(!propiedad){
        return res.redirect('/404');
    }

    // Validacion 
    let resultado = validationResult(req);

    if(!resultado.isEmpty()){
        return res.render('propiedades/mostrar', {
            propiedad,
            pagina: propiedad.titulo,
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
            errores: resultado.array()
    
        })
    }

    const {mensaje} = req.body;
    const {id: propiedadeId} = req.params;
    const {id: usuarioId} = req.usuario;

    // Almacenamos el mensaje
    await Mensaje.create({
        mensaje,
        propiedadeId,
        usuarioId
    })

    res.redirect('/');
}

// Leer mensajes recibidos
const verMensaje = async (req, res)=>{
    const { id } = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            {
                model: Mensaje,
                 as: 'mensajes',
                 include: [
                    {model: Usuario.scope('eliminarPassword'), as: 'usuario'}
                ]
            }
        ]
    });

    
    if(!propiedad){
        return res.redirect('/mis-propiedades');
    }
   
    // Revisar que quien visita la URL, es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades');
    }

    res.render('propiedades/mensajes', {
        pagina: 'Mensajes',
        mensajes: propiedad.mensajes,
        formatearFecha
    })
}

export {
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar,
    cambiarEstado,
    mostrarPropiedad,
    enviarMensaje,
    verMensaje
}