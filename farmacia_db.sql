
DROP DATABASE IF EXISTS farmacia_db;
CREATE DATABASE farmacia_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE farmacia_db;

CREATE TABLE medicamentos (
    id_med INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    precio DECIMAL(10,2) NOT NULL,
    fecha_venc DATE NOT NULL,
    requiere_receta BOOLEAN DEFAULT FALSE,
    CONSTRAINT chk_stock_positivo CHECK (stock >= 0),
    CONSTRAINT chk_precio_positivo CHECK (precio >= 0)
) ENGINE=InnoDB;

CREATE TABLE lotes_medicamentos (
    id_lote INT AUTO_INCREMENT PRIMARY KEY,
    id_med INT NOT NULL,
    codigo_lote VARCHAR(50) NOT NULL UNIQUE,
    cantidad_inicial INT NOT NULL,
    cantidad_actual INT NOT NULL,
    fecha_fabricacion DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    laboratorio_fabricante VARCHAR(100) NOT NULL,
    FOREIGN KEY (id_med) REFERENCES medicamentos(id_med) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_cantidad_lote CHECK (cantidad_actual >= 0 AND cantidad_actual <= cantidad_inicial),
    CONSTRAINT chk_fechas_lote CHECK (fecha_fabricacion < fecha_vencimiento)
) ENGINE=InnoDB;

CREATE TABLE ventas (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    fecha_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT chk_total_positivo CHECK (total >= 0)
) ENGINE=InnoDB;

CREATE TABLE detalles_ventas (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT NOT NULL,
    id_med INT NOT NULL,
    cantidad INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_venta) REFERENCES ventas(id_venta) ON DELETE CASCADE,
    FOREIGN KEY (id_med) REFERENCES medicamentos(id_med) ON DELETE RESTRICT,
    CONSTRAINT chk_cantidad_positiva CHECK (cantidad > 0),
    CONSTRAINT chk_subtotal_positivo CHECK (subtotal >= 0)
) ENGINE=InnoDB;


CREATE TABLE recetas_medicas (
    id_receta INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT NULL,
    cedula_profesional_medico VARCHAR(50) NOT NULL,
    nombre_medico VARCHAR(100) NOT NULL,
    nombre_paciente VARCHAR(100) NOT NULL,
    fecha_emision DATE NOT NULL,
    diagnostico VARCHAR(255) NULL,
    FOREIGN KEY (id_venta) REFERENCES ventas(id_venta) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;


CREATE TABLE historial_precios (
    id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
    id_med INT NOT NULL,
    precio_anterior DECIMAL(10,2) NOT NULL,
    precio_nuevo DECIMAL(10,2) NOT NULL,
    fecha_modificacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuario_db VARCHAR(100) NOT NULL,
    FOREIGN KEY (id_med) REFERENCES medicamentos(id_med) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_med_nombre ON medicamentos(nombre);
CREATE INDEX idx_med_vencimiento ON medicamentos(fecha_venc);
CREATE INDEX idx_ventas_fecha ON ventas(fecha_hora);
