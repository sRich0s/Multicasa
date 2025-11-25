BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "vivienda" (
	"id"	INTEGER NOT NULL,
	"titulo"	VARCHAR(200) NOT NULL,
	"precio"	FLOAT NOT NULL,
	"lat"	FLOAT NOT NULL,
	"lng"	FLOAT NOT NULL,
	"habitaciones"	INTEGER NOT NULL,
	"banos"	INTEGER NOT NULL,
	"area"	INTEGER NOT NULL,
	"tipo"	VARCHAR(50) NOT NULL,
	"estado"	VARCHAR(50) NOT NULL,
	"descripcion"	TEXT NOT NULL,
	"fechaCreacion"	VARCHAR(20),
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "noticia" (
	"id"	INTEGER NOT NULL,
	"titulo"	VARCHAR(200) NOT NULL,
	"contenido"	TEXT NOT NULL,
	"fecha"	VARCHAR(20),
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "contacto" (
	"id"	INTEGER NOT NULL,
	"nombre"	VARCHAR(120) NOT NULL,
	"correo"	VARCHAR(120) NOT NULL,
	"mensaje"	TEXT NOT NULL,
	"fecha"	VARCHAR(20),
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "transaccion" (
	"id"	INTEGER NOT NULL,
	"viviendasId"	INTEGER NOT NULL,
	"viviendasTitulo"	VARCHAR(200) NOT NULL,
	"tipoAnterior"	VARCHAR(50) NOT NULL,
	"tipoNuevo"	VARCHAR(50) NOT NULL,
	"fecha"	VARCHAR(20),
	FOREIGN KEY("viviendasId") REFERENCES "vivienda"("id"),
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "images" (
	"id"	INTEGER,
	"Field2"	BLOB,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "viviendaImages" (
	"imageID"	INTEGER,
	"viviendaID"	INTEGER,
	FOREIGN KEY("imageID") REFERENCES "images",
	FOREIGN KEY("viviendaID") REFERENCES "vivienda"
);
COMMIT;
