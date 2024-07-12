import { Dropzone } from 'dropzone';

const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');


Dropzone.options.imagen = {
    dictDefaultMessage: 'Sube tus imagenes aquí',// Esto sirve para cambiar el texto de dropzone
    acceptedFiles: '.png,.jpg,.jpeg', // Esto sirve para configurar los archivos que se admitan 
    maxFilesize: 5,// Esto sirve para darle un maximo de cantidad de megas que se pueda subir
    maxFile:1,// Esto sirve para darle un maximo de archivos que se pueda subir
    paralleUploads:1, // Cantidad de archivo que estamos soportando
    autoProcessQueue: false, //autoProcessQueue sube la imagen en automatico pero si le ponemos false no lo hace hasta que nosotros le digamos cuando subirlo (en este caso hasta que apretemos en el boton "publicar propiedad")
    addRemoveLinks: true, // Agrega un enlace para eliminar el archivo
    dictRemoveFile: 'Borrar Archivo', //Dict es para cambiar el idioma. dictRemoveFile es para cambiar el texto en donde aparece el enlace para borrar el archivo
    dictMaxFilesExceeded: 'El limite es de un archivo', // Esto sirve para cambiar el texto del error cuando quieren subir mas archivos de lo permitido
    headers:{
        'CSRF-Token': token // Se le pasa el token 
    },
    paramName: 'imagen',
    init: function(){//Este funcion llamada init nos va permitir reescribir sobre el objeto de dropzone
        const dropzone = this;
        const btnPublicar = document.querySelector('#publicar');

        btnPublicar.addEventListener('click', function(){
            dropzone.processQueue();
        })

        dropzone.on('queuecomplete', function(){
            if(dropzone.getActiveFiles().length == 0){ //Verifica que no haya quedado archivos en la fila por cargar
                window.location.href = '/mis-propiedades' 
            }
        })
    }
}