maptilersdk.config.apiKey = maptilerApiKey;
const map = new maptilersdk.Map({
    container: 'map',
    style: maptilersdk.MapStyle.BRIGHT,
    center: checkpoint.geometry.coordinates,
    zoom: 10
});

new maptilersdk.Marker()
    .setLngLat(checkpoint.geometry.coordinates)
    .setPopup(
        new maptilersdk.Popup({ offset: 25 })
            .setHTML(
                `<h3>${checkpoint.title}</h3><p>${checkpoint.location}</p>`
            )
    )
    .addTo(map)