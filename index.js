require('colors');
require('dotenv').config({path:'./tokens.env'});

const { inquirerMenu,
        pausa,
        leerInput,
        listarLugares,

       
} = require('./helpers/inquirer');
const Busquedas = require('./models/busquedas');

//console.log(process.env.MAPBOX_KEY); Comprobando acceso al mapbox_key

// Crear la funcion main para poder crear una vista en la consola
const main = async() => {

    const busquedas = new Busquedas();
    let opt;
    
    do {
        // Imprimir el menú
        opt = await inquirerMenu();

        switch (opt) {
            case 1:
                 // Mostrar mensaje
                 const termino = await leerInput('Ciudad: ');

                 // Buscar los lugares
                 const lugares = await busquedas.ciudad( termino );

                 // Seleccionar el lugar
                 const id = await listarLugares( lugares );
                // Crear condicional para cancelar la busqueda del lugar
                if ( id === '0' ) continue;

                 const lugarSel = lugares.find( l => l.id === id );

                 // Guardar en DB
                 busquedas.agregarHistorial( lugarSel.nombre );

                 // Clima
                 const clima = await busquedas.climaLugar( lugarSel.lat, lugarSel.lng );


                 // Mostrar resultado
                 console.log('\nInformacion de la ciudad\n'.green);
                 console.log('Ciudad:', lugarSel.nombre);
                 console.log('Lat:', lugarSel.lat);
                 console.log('Lng:', lugarSel.lng);
                 console.log('Temperatura:', clima.temp);
                 console.log('Mínima:', clima.min);
                 console.log('Maxima:',clima.max);
                 console.log('Como esta el clima:', clima.desc)
                
            break;

            case 2:
                
                busquedas.historial.forEach( (lugar, i) => {
                    const idx = `${ i + 1 }.`.blue;
                    console.log( `${ idx } ${ lugar }`);
                });
                
            break;
                        
        }

        await pausa();

    } while( opt !== 0 );
}

main();