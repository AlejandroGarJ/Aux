module.exports = function (grunt) {

  grunt.initConfig({
    ngAnnotate: {
      options: {
        singleQuotes: true,
      },
      app1: {
        files: {
          'app/angular.libs.js': [
            'node_modules/lodash/lodash.min.js',
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/angular/angular.js',
            'node_modules/angular-cookies/angular-cookies.js',
            'node_modules/angular-messages/angular-messages.js',
            'node_modules/angular-resource/angular-resource.js',
            'node_modules/angular-route/angular-route.js',
            'node_modules/angular-sanitize/angular-sanitize.js',
            'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
            'node_modules/platform/platform.js',
            'src/app-content/isteven-multi-select.js'
          ]
        }
      },
      app2: {
        files: {
          'app/componentes.js':[           
            'app.js',
            'appComponent.js',
            'src/app-services/user.service.local-storage.js',
            'src/app-services/share.properties.service.js',
            'src/app-services/flash.service.js',
            'src/app-services/user.service.js',
            'src/app-services/authentication.service.js', 
            'src/app-services/busqueda.service.js',
            'src/app-services/validaciones.service.js',                       
            'src/busqueda/validaciones.directive.js',
            'src/app-services/solicitarBaja.service.js',
            'src/cliente/cliente.directive.js',
            'src/header/header.component.js',
            'src/login/login.component.js',
            'src/busqueda/busqueda.componente.js',
            'src/detalle/detalle.component.js',
            'src/cliente/cliente.componente.js'
          ]
        }
      }
    },
    uglify: {
      options: {
        mangle: {
          reserved: ['jQuery', 'Backbone']
        }
      },
      my_target: {
        files: {
          'app/angular.libs.min.js': [
          'app/angular.libs.js'          
        ],
        }
      }
    },    
    watch: {
      javascripts: {
        files: ['*.js','!grunt*','src/**/*.js'],
        tasks: ['default']
      }
    }
  });

  // Paquetes referenciados en Package.json
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-ng-annotate');

  // Tareas a realizar
  grunt.registerTask('default', ['ngAnnotate','uglify']);

};