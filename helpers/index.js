export const esVendedor = (usuarioId, propiedadUsuarioId)=>{
    return usuarioId == propiedadUsuarioId
}

export const formatearFecha = fecha =>{
    const nuevaFecha = new Date(fecha).toISOString().slice(0, 10);

    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    return new Date(nuevaFecha).toLocaleDateString('es-ES', options);
}