// DeepSeek
/* POLYGON AREA CALCULATOR - COMPLETE IMPLEMENTATION */
class PolygonAreaCalculator {
  constructor() {
    this.map = null;
    this.polygon = null;
    this.controlPanel = null;
    this.init();
  }

  async init() {
    try {
      // 1. Verify critical dependencies
      this.verifyDependencies();
      
      // 2. Initialize map
      this.initMap();
      
      // 3. Setup UI components
      this.initUI();
      
      // 4. Create initial polygon
      this.createInitialPolygon();
      
      // 5. Setup event handlers
      this.setupEventHandlers();
      
      console.log('[SUCCESS] Application initialized');
    } catch (error) {
      this.handleCriticalError(error);
    }
  }

  verifyDependencies() {
    const missing = [];
    if (!window.L) missing.push('Leaflet.js');
    if (!window.turf) missing.push('Turf.js');
    
    if (missing.length > 0) {
      throw new Error(`Missing required libraries: ${missing.join(', ')}`);
    }
  }

  initMap() {
    this.map = L.map('map').setView([51.505, -0.09], 13);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19
    }).addTo(this.map);
  }

  initUI() {
    // Create control panel
    this.controlPanel = L.control({ position: 'topright' });
    
    this.controlPanel.onAdd = () => {
      const panel = L.DomUtil.create('div', 'info-panel');
      panel.innerHTML = `
        <h4>Polygon Area Calculator</h4>
        <div class="area-display">
          <p>Draw or modify the polygon</p>
          <div id="area-result">-</div>
        </div>
        <div class="error-display" id="error-display"></div>
      `;
      return panel;
    };
    
    this.controlPanel.addTo(this.map);
  }

  createInitialPolygon() {
    const initialCoords = [
      [51.509, -0.08],
      [51.503, -0.06],
      [51.51, -0.047]
    ];
    
    this.polygon = L.polygon(initialCoords, {
      color: '#3388ff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.3,
      editable: true
    }).addTo(this.map);
    
    this.map.fitBounds(this.polygon.getBounds());
    this.updateAreaDisplay();
  }

  setupEventHandlers() {
    // Update area when polygon is edited
    this.polygon.on('edit', () => {
      this.updateAreaDisplay();
    });
    
    // Handle map errors
    this.map.on('error', (e) => {
      this.showError(`Map error: ${e.message}`);
    });
  }

  calculateArea() {
    try {
      const latLngs = this.polygon.getLatLngs()[0];
      
      // Validation
      if (!latLngs || latLngs.length < 3) {
        throw new Error('Polygon must have at least 3 points');
      }
      
      // Convert to GeoJSON format
      const coordinates = [latLngs.map(point => [point.lng, point.lat])];
      coordinates[0].push(coordinates[0][0]); // Close polygon
      
      // Calculate area in square meters
      const areaM2 = turf.area({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: coordinates
        }
      });
      
      return {
        squareMeters: areaM2,
        hectares: areaM2 / 10000,
        squareKilometers: areaM2 / 1000000,
        acres: areaM2 / 4046.86
      };
    } catch (error) {
      this.showError(`Calculation error: ${error.message}`);
      return null;
    }
  }

  updateAreaDisplay() {
    const area = this.calculateArea();
    const display = document.getElementById('area-result');
    const errorDisplay = document.getElementById('error-display');
    
    if (!area) {
      display.innerHTML = '<span class="error-text">Invalid area</span>';
      return;
    }
    
    errorDisplay.textContent = '';
    display.innerHTML = `
      <table>
        <tr><td>Square Meters:</td><td>${area.squareMeters.toLocaleString()} m²</td></tr>
        <tr><td>Hectares:</td><td>${area.hectares.toFixed(2)} ha</td></tr>
        <tr><td>Square Kilometers:</td><td>${area.squareKilometers.toFixed(4)} km²</td></tr>
        <tr><td>Acres:</td><td>${area.acres.toFixed(2)} acres</td></tr>
      </table>
    `;
  }

  showError(message) {
    console.error('[ERROR]', message);
    const errorDisplay = document.getElementById('error-display');
    errorDisplay.innerHTML = `<span class="error-text">${message}</span>`;
    setTimeout(() => errorDisplay.innerHTML = '', 5000);
  }

  handleCriticalError(error) {
    console.error('[CRITICAL ERROR]', error);
    document.body.innerHTML = `
      <div style="color:red; padding:20px; font-family:sans-serif">
        <h1>Application Error</h1>
        <p>${error.message}</p>
        <p>Check console for details</p>
      </div>
    `;
  }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PolygonAreaCalculator();
});