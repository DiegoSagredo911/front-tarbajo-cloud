import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;

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

  const [propiedades, setPropiedades] = useState([]);
  const [fechas, setFechas] = useState([]);
  const [temperaturas, setTemperaturas] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [EndPoit, setEndPoit] = useState("http://52.90.196.224:80");

  const obtenerDatos = async () => {
    try {
      const respuesta = await axios.post(EndPoit, {
        query:
          "{ propiedades { id nombre_estacion geometria { tipo_geometria latitud longitud } } }",
      });

      setPropiedades(respuesta?.data?.data?.propiedades);
    } catch (error) {
      console.error(error);
    }
  };

  const obtenerFechas = async () => {
    try {
      const respuesta = await axios.post(EndPoit, {
        query: "{ fechas { fecha_id fecha } }",
      });

      setFechas(respuesta?.data?.data?.fechas);
    } catch (error) {
      console.error(error);
    }
  };

  const obtenerTemperaturas = async (fecha, propiedadId) => {
    try {
      const respuesta = await axios.post(EndPoit, {
        query: `{
          temperaturasPorFechaYPropiedad(fecha: "${fecha}", propiedadId: ${propiedadId}) {
            id
            propiedad { nombre_estacion }
            fecha { fecha }
            media
            minima
            maxima
          }
        }`,
      });

      return respuesta?.data?.data?.temperaturasPorFechaYPropiedad || [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const handleFechaChange = async (e) => {
    const fechaSeleccionada = e.target.value;
    setFechaSeleccionada(fechaSeleccionada);

    const temperaturasPromises = propiedades.map((propiedad) =>
      obtenerTemperaturas(fechaSeleccionada, propiedad.id)
    );

    const temperaturasPorPropiedad = await Promise.all(temperaturasPromises);
    setTemperaturas(temperaturasPorPropiedad.flat());
  };

  return (
    <div className="h-screen bg-gray-100 ">
      <h1 className="font-bold text-5xl text-center">
        Temperaturas de la región
      </h1>

      <div className="flex space-x-3 p-3">
        <h2>Buscador</h2>
        <select onChange={handleFechaChange} name="select">
          <option value="">Fechas</option>
          {fechas.map((element, index) => (
            <option key={index} value={element.fecha}>
              {element.fecha}
            </option>
          ))}
        </select>
      </div>

      <MapContainer
        center={estado?.center}
        zoom={estado?.zoom}
        style={{ height: "600px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {propiedades.map((propiedad, index) => {
          const temperatura = temperaturas.find(
            (temp) =>
              temp.propiedad.nombre_estacion === propiedad.nombre_estacion
          );
          return (
            <Marker
              key={index}
              position={[
                propiedad.geometria.latitud,
                propiedad.geometria.longitud,
              ]}
            >
              <Popup>
                <div>
                  <h3>{propiedad.nombre_estacion}</h3>
                  {temperatura ? (
                    <div>
                      <p>Máxima: {temperatura.maxima}°C</p>
                      <p>Mínima: {temperatura.minima}°C</p>
                    </div>
                  ) : (
                    <p>Temperaturas no disponibles</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      <div className="flex flex-row items-center space-x-5 p-3">
        <h1>EndPoit:</h1>
        <input
          className=""
          type="text"
          value={EndPoit}
          onChange={(e) => setEndPoit(e.target.value)}
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
          onClick={() => {
            obtenerDatos();
            obtenerFechas();
          }}
        >
          Conectar
        </button>
      </div>
    </div>
  );
}

export default App;
