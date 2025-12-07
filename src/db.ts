import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const dbPath = path.join(__dirname, "../../Switby.db");

export async function initializeDB() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
}

export async function createTables() {
  const db = await initializeDB();

  await db.exec(`

-- 1. Roles (Mejorado: FOREIGN KEY ahora usa ON DELETE RESTRICT para seguridad)
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rol_name TEXT NOT NULL UNIQUE
);

-- Inserta roles básicos
INSERT OR IGNORE INTO roles (id, rol_name) VALUES (1, 'Usuario');
INSERT OR IGNORE INTO roles (id, rol_name) VALUES (2, 'Administrador');

-- 2. Usuarios (Tabla de Cuenta y Seguridad)
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    creationDate DATETIME DEFAULT (datetime('now')),
    is_active INTEGER NOT NULL DEFAULT 1,
    rol_id INTEGER NOT NULL DEFAULT 1,
    -- Si se intenta borrar un rol que está en uso, la operación fallará
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT
);

-- 3. Perfiles (Tabla 1:1 para Datos Personales y Públicos)
CREATE TABLE IF NOT EXISTS perfiles (
    user_id INTEGER PRIMARY KEY, 
    username TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    last_activity DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 4. Categorías
CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoryName TEXT NOT NULL UNIQUE,
    description TEXT
);

-- 5. Etiquetas
CREATE TABLE IF NOT EXISTS etiquetas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nameTag TEXT NOT NULL UNIQUE
);

-- 6. Publicaciones
CREATE TABLE IF NOT EXISTS publicaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    creationDate DATETIME DEFAULT (datetime('now')),
    updateDate DATETIME DEFAULT (datetime('now')),
    user_id INTEGER NOT NULL,
    category_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categorias(id) ON DELETE SET NULL
);

-- 7. Publicaciones <-> Etiquetas (N:N)
CREATE TABLE IF NOT EXISTS publicaciones_etiquetas (
    publicacion_id INTEGER NOT NULL,
    etiqueta_id INTEGER NOT NULL,
    PRIMARY KEY (publicacion_id, etiqueta_id),
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (etiqueta_id) REFERENCES etiquetas(id) ON DELETE CASCADE
);

-- 8. Comentarios
CREATE TABLE IF NOT EXISTS comentarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    creationDate DATETIME DEFAULT (datetime('now')),
    user_id INTEGER NOT NULL,
    publicacion_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE
);

-- 9. Likes (Sin 'cantidad', con UNIQUE en la combinación user_id/publicacion_id)
CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    publicacion_id INTEGER NOT NULL,
    UNIQUE (user_id, publicacion_id),
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE
);

-- Índices de Rendimiento Adicionales
CREATE INDEX IF NOT EXISTS idx_publicaciones_title ON publicaciones (title);
CREATE INDEX IF NOT EXISTS idx_comentarios_date ON comentarios (creationDate);
CREATE INDEX IF NOT EXISTS idx_publicaciones_category ON publicaciones (category_id);

    `);

  console.log("chamo hemos creado la base de  datos uwu");
}

createTables().catch(console.error);
