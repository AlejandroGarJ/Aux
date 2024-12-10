const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const NgAnnotatePlugin = require("ng-annotate-webpack-plugin");
const StringReplacePlugin = require("string-replace-webpack-plugin");

module.exports = {
  mode: "development", // O 'production' según sea necesario
  devtool: false,
  entry: {
    main: "./app.js",
    bootstrap: "./bootstrap.ts",
  }, // Archivo de entrada
  watch: true, // Habilita el watch mode
  watchOptions: {
    aggregateTimeout: 300, // Espera 300 ms después del último cambio antes de recompilar
    poll: 1000, // Verifica cada 1 segundo (opcional, útil en algunos sistemas de archivos)
  },
  output: {
    filename: "[name].bundle.js", // Nombre del archivo de salida
    path: path.resolve(__dirname, "dist"), // Directorio de salida
  },

  devServer: {
    contentBase: path.join(__dirname, "./"), // Carpeta donde servir los archivos
    open: true, // Abre el navegador automáticamente
    port: 8080, // Puerto para el servidor de desarrollo
  },
  resolve: {
    extensions: [".js", ".ts"], // Asegúrate de que Webpack maneje archivos .ts
  },
  module: {
    rules: [
      {
        /* Para cambiar la ruta al templateUrl de los componentes */
        test: /\.ts$/, // Aplica ts-loader a los archivos .ts
        use: [
          {
            loader: "string-replace-loader",
            options: {
              search: /templateUrl:\s*['"]\.\/(.*?)['"]/g, // Regex para buscar rutas de templateUrl
              replace: function (match, p1) {
                // `this.resourcePath` contiene la ruta del archivo actual
                const filePath = this.resourcePath;
                const startIdx = filePath.indexOf("angular2");
                const result = filePath.substring(startIdx);

                const normalizedString = result.normalize("NFKD");
                formattedPath = normalizedString.replace(/\\/g, "/");
                formattedPath = formattedPath.replace(".ts", ".html");

                return `templateUrl: '${formattedPath.toString()}'`; // Aquí puedes modificar el reemplazo según sea necesario
              },
            },
          },
          {
            loader: "string-replace-loader",
            options: {
              // Buscar y reemplazar `styleUrls`
              search: /styleUrl:\s*['"]\.\/(.*?)['"]/g,
              replace: function (match, p1, p2, p3) {
                // `this.resourcePath` contiene la ruta del archivo actual
                const filePath = this.resourcePath;
                const startIdx = filePath.indexOf("angular2");
                const result = filePath.substring(startIdx);

                const normalizedString = result.normalize("NFKD");
                let formattedPath = normalizedString.replace(/\\/g, "/");
                formattedPath = formattedPath.replace(".ts", ".css");

                return `styleUrl: '${formattedPath}'`; // Aquí puedes modificar el reemplazo según sea necesario
              },
            },
          },
          "ts-loader", // Usa ts-loader para compilar TypeScript
        ],
        exclude: /node_modules/, // Excluye los node_modules
      },
      {
        test: /\.html$/,
        use: "html-loader",
      },
      {
        test: /\.js$/, // Procesar archivos .js
        exclude: /node_modules/,
        use: {
          loader: "babel-loader", // Utiliza Babel si es necesario (opcional)
        },
      },
      {
        test: /\.css$/,
        use: [
          "style-loader", // Inserta CSS en el DOM
          "css-loader", // Interpreta los archivos CSS
        ],
      },
    ],
  },
  plugins: [
    new NgAnnotatePlugin({
      add: true,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "angular2/**/*.html", // Busca todos los archivos .html en angular2 y subcarpetas
          to: "./[name].html", // Destino final de los archivos copiados
          globOptions: {
            ignore: ["**/node_modules/**"], // Ignora la carpeta node_modules si la hay
          },
        },
      ],
    }),
  ],
};
