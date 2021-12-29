const fs = require('fs');

const axios = require('axios');

class Busquedas{

    // Historial de busqueda que tendra un maximo de 6 elementos en el array
    historial = [];
    dbPath = './db/database.json'

    constructor() {
        //TOD: leerBD si existe
        this.leerDB();
    }

    get paramsMapbox(){

        return{
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'en'
        }
    }

    get paramsWeatherMap(){

        return {
            appid : process.env.OPENWEATHER_KEY,
            units: 'metric',
            lang: 'en'
        }
    }

    async ciudad( lugar ='' ){

        // peticion http
        try{

            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapbox
            });

            const resp = await instance.get();
            // Como ver los features
            // console.log( resp.data.feautres);

            //Regresando objeto de forma implicita / especificar cuales fatures son deseados
            return resp.data.features.map( lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                // 1er posiscion de la longitud
                lng: lugar.center[0],
                // 2a posicion de la latitud
                lat: lugar.center[1],
            }));

            console.log(resp.data);

            

        }catch (error){

            return []; // retorna los lugares

        }

        
    }

    async climaLugar( lat, lon ){

        // peticion http
        try{

            //intance axios.create
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather?`,
                    // obtenemos el getter ...paramsWeatherMap y agregamos la latitud 'lat' y longitud ''
                params: { ...this.paramsWeatherMap, lat, lon }
            });

            const resp = await instance.get();
            const { weather , main } = resp.data;

            return {
                // Colocamos el weather[0] porque las posiciones estan dentro de un arreglo
                desc: weather[0].description,
                // fuera de arreglo
                min : main.temp_min,
                max: main.temp_max,
                temp: main.temp

            }

        }catch (error){

            console.log( error )

        }
        
    }

    agregarHistorial( lugar = '' ) {

        if( this.historial.includes( lugar.toLocaleLowerCase() ) ){
            return;
        }
        this.historial = this.historial.splice(0,5);

        this.historial.unshift( lugar.toLocaleLowerCase() );

        // Grabar en DB
        this.guardarDB();
    }

    guardarDB() {

        const payload = {
            historial: this.historial
        };

        fs.writeFileSync( this.dbPath, JSON.stringify( payload ) );

    }

    leerDB() {

        if( !fs.existsSync( this.dbPath ) ) return;
        
        const info = fs.readFileSync( this.dbPath, { encoding: 'utf-8' });
        const data = JSON.parse( info );

        this.historial = data.historial;


    }


}

module.exports = Busquedas;