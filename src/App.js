import logo from "./logo.svg";
import "./App.css";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"; // Cambié Map por MapContainer
import { useState } from "react";
import "leaflet/dist/leaflet.css"; // Importar los estilos de Leaflet
import axios from "axios";
import "leaflet/dist/leaflet.css"; // Importar los estilos de Leaflet
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl; // Eliminar la referencia interna a las URLs por defecto

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});
function App() {
  const [estado, Setstatdo] = useState({
    center: [-36.82034113562246, -73.04452061996228],
    zoom: 13,
  });

  const obtenerDatos = async () => {
    try {
      const respuesta = await axios.post(
        "https://temperas-api.herokuapp.com/temperas",
        {
          query:
            "{ propiedades { id nombre_estacion geometria { tipo_geometria latitud longitud } } }",
        }
      );

      //depurar las respuestas
      console.log(respuesta.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-screen bg-gray-100 ">
      <h1 className="font-bold text-5xl text-center">Temperas de la región</h1>
      <div className="flex space-x-3 p-3 ">
        <h2 className="b">Buscador</h2>
        <select name="select">
          <option value="value1">Value 1</option>
          <option value="value2" selected>
            Value 2
          </option>
          <option value="value3">Value 3</option>
        </select>
      </div>

      {/* Cambié Map por MapContainer */}
      <MapContainer
        center={estado?.center}
        zoom={estado?.zoom}
        style={{ height: "600px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {[
          [-36.82034113562246, -73.04452061996228],
          [-36.809922399207686, -73.0657412523529],
          [-36.79053885034361, -73.0461691695261],
        ].map((element, index) => (
          <Marker key={index} position={element}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default App;
