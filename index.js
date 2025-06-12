// DeepSeek
// Initialize the map
const map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Load Turf.js dynamically
const script = document.createElement('script');
script.src = 'https://unpkg.com/@turf/turf@6/turf.min.js';
script.onload = initMap;
document.head.appendChild(script);

function initMap() {
  // Create a polygon and add it to the map
  const polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
  ]).addTo(map);

  // Fit the map to the polygon bounds
  map.fitBounds(polygon.getBounds());

  // Function to calculate area using Turf.js
  function calculatePolygonArea(latlngs) {
    // Convert Leaflet LatLngs to GeoJSON Polygon format
    const coordinates = [latlngs.map(latlng => [latlng.lng, latlng.lat])];
    // Close the polygon (first and last point must be the same)
    coordinates[0].push(coordinates[0][0]);
    
    const geojsonPolygon = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: coordinates
      }
    };
    
    // Calculate area in square meters
    const area = turf.area(geojsonPolygon);
    
    // Convert to hectares (1 hectare = 10,000 m²)
    const areaHectares = area / 10000;
    
    return {
      squareMeters: area,
      hectares: areaHectares
    };
  }

  // Calculate and display the area
  const area = calculatePolygonArea(polygon.getLatLngs()[0]);
  console.log('Area:', area);

  // Display the area on the map
  const popup = L.popup()
    .setLatLng(polygon.getBounds().getCenter())
    .setContent(`
      <b>Polygon Area</b><br>
      ${area.squareMeters.toFixed(2)} m²<br>
      ${area.hectares.toFixed(4)} hectares
    `)
    .openOn(map);
}