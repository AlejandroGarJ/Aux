const gulp = require('gulp');
const replace = require('gulp-replace');
const argv = require('yargs').argv;

/*
    NORMA DE VERSIONADO: NºEntrega + '.' + Mes + '.' + 'Dia'

    1. Instala los módulos necesarios desde el terminal dentro del directorio /WebContent:

        > npm install yargs --save-dev
        > npm install gulp-cli --save-dev

    2. Ejecuta dentro de /WebContent >

        > gulp actualiza-versionado --entrega=NºEntrega

        Se actualizarán:
         Las referencias a los archivos JavaScript del archivo index.html.
         La variable versionPackage del archivo login.component.js que muestra la versión en la pantalla de inicio de sesión.
 */
gulp.task('actualiza-versionado', function(done) {

    console.log('[SISTEMA DE VERSIONADO] Entrega ' + argv.entrega)

    const version = argv.entrega + '.'  + (new Date().getMonth() + 1).toString().padStart(2, '0') + '.' + new Date().getDate().toString().padStart(2, '0')

    gulp.src('./index.html')
        .pipe(replace(/\?v=\d+\.\d+\.\d+/g, '?v=' + version))
        .pipe(gulp.dest('./'));

    gulp.src('src/login/login.component.js')
        .pipe(replace(/= '\d+\.\d+\.\d+'/g, '= ' + "'" + version + "'"))
        .pipe(gulp.dest('src/login'));

    console.log('[SISTEMA DE VERSIONADO] Referencias actualizadas a la version ' + version)

    done();
});