"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_session_1 = __importDefault(require("express-session"));
const serve_favicon_1 = __importDefault(require("serve-favicon"));
// Inicialización de la app
const app = (0, express_1.default)();
// Configuración de variables de entorno
if (process.env.NODE_ENV !== "production") {
    dotenv_1.default.config();
}
// Configuración para las vistas
app.set("views", path_1.default.join(__dirname, "../views"));
app.set("view engine", "ejs");
app.use((0, serve_favicon_1.default)(path_1.default.join(__dirname, '../views/public/imgs', 'favicon.ico')));
// Middlewares
app.use('/images', express_1.default.static(path_1.default.join(__dirname, '../views/public/imgs')));
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, "../views/public")));
app.use((0, express_session_1.default)({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
}));
const registerRoute_1 = __importDefault(require("./routes/registerRoute"));
const sessionRoute_1 = __importDefault(require("./routes/sessionRoute"));
const mainRoute_1 = __importDefault(require("./routes/mainRoute"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
// Rutas
app.use(registerRoute_1.default);
app.use(sessionRoute_1.default);
app.use(mainRoute_1.default);
app.use(userRoutes_1.default);
// Rutas principales
app.get("/", (req, res) => {
    //res.send("Bienvenido");
    res.render("principal");
});
// Ruta para la escritura incorrecta de la URL
app.use((req, res, next) => {
    res.status(404).send("Página no encontrada D:");
});
// Puerto de escucha del servidor
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto: ${PORT}`);
});
