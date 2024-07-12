(function() {
    const lat = document.querySelector('#lat').value || 34.0518527; //latitud
    const lng = document.querySelector('#lng').value || -118.0423694; //longitud
    const mapa = L.map('mapa').setView([lat, lng ], 13);
    let marker;
    
    // Utilizar provider y geocoder
    const geocodeService = L.esri.Geocoding.geocodeService(); // esto nos va a permitir (en base a las cordenadas) el nombre de la calle

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // El pin
    marker = new L.marker([lat, lng], { //creamos un pin de la ubicacion y locolocamos entre lat y lng 
        draggable: true, // permite mover el pin 
        autoPan: true // hace que cuando se mueva el pin tambien se mueva el mapa
    })
    .addTo(mapa)

    // Detectar el movimiento
    marker.on('moveend', function(e){
        marker = e.target;
        const posicion = marker.getLatLng();
        mapa.panTo(new L.LatLng(posicion.lat, posicion.lng)) // esto hace centrar el pin

        // Obtener informacion de las calles al soltar el pin
        geocodeService.reverse().latlng(posicion, 13).run(function(error, resultado){
            
            marker.bindPopup(resultado.address.LongLabel); // esto es para que aparezca el globo que te dice detalladamente la ubicacion

            // Llenar los campos 
            document.querySelector('.calle').textContent = resultado?.address?.Address ?? '';
            document.querySelector('#calle').value = resultado?.address?.Address ?? '';
            document.querySelector('#lat').value = resultado?.latlng?.lat ?? '';
            document.querySelector('#lng').value = resultado?.latlng?.lng ?? '';
        })
    })

})()