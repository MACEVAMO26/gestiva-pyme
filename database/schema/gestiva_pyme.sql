-- ========================================= 
-- GestivaPyme - Esquema de base de datos 
-- ========================================= 

DROP DATABASE IF EXISTS `gestiva_pyme`;
CREATE DATABASE `gestiva_pyme`;
USE `gestiva_pyme`;

CREATE TABLE `empresa` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `razon_social` varchar(255) NOT NULL,
  `nit` varchar(255) UNIQUE NOT NULL,
  `tipo_empresa` ENUM('Solo Servicios', 'Solo Ventas', 'Ventas y Servicios') NOT NULL,
  `direccion` varchar(255),
  `telefono` varchar(255),
  `email` varchar(255),
  `ciudad` varchar(255),
  `logo_url` varchar(255),
  `activo` boolean DEFAULT true,
  `inactive_at` timestamp NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `roles` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `empresa_id` int,
  `nombre` varchar(255),
  `descripcion` text,
  `activo` boolean DEFAULT true,
  `inactive_at` timestamp NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `permisos` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `rol_id` int,
  `modulo` varchar(255),
  `puede_ver` boolean,
  `puede_crear` boolean,
  `puede_editar` boolean,
  `puede_inactivar` boolean,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `cargos` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `empresa_id` int,
  `rol_id` int,
  `nombre` varchar(255),
  `descripcion` text,
  `funciones` text,
  `activo` boolean DEFAULT true,
  `inactive_at` timestamp NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `usuarios` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `empresa_id` int,
  `cargo_id` int,
  `rol_id` int,
  `nombres` varchar(255),
  `apellidos` varchar(255),
  `documento` varchar(255) UNIQUE,
  `email` varchar(255) UNIQUE,
  `password_hash` varchar(255),
  `eps` varchar(255) NULL,
  `arl` varchar(255) NULL,
  `fondo_pension` varchar(255) NULL,
  `fondo_cesantias` varchar(255) NULL,
  `caja_compensacion` varchar(255) NULL,
  `telegram_chat_id` varchar(255) UNIQUE,
  `activo` boolean DEFAULT true,
  `inactive_at` timestamp NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `categorias` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `empresa_id` int,
  `nombre` varchar(255),
  `descripcion` text,
  `tipo` ENUM('ventas', 'servicios', 'ventas y servicios'),
  `activo` boolean DEFAULT true,
  `inactive_at` timestamp NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `productos` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `categoria_id` int,
  `empresa_id` int,
  `nombre` varchar(255),
  `descripcion` text,
  `precio_compra` decimal(10,2),
  `precio_venta` decimal(10,2),
  `stock_inicial` int,
  `unidad_medida` varchar(255),
  `activo` boolean DEFAULT true,
  `inactive_at` timestamp NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `servicios` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `categoria_id` int,
  `empresa_id` int,
  `nombre` varchar(255),
  `descripcion` text,
  `tarifa` decimal(10,2),
  `tiempo_estimado` varchar(255),
  `activo` boolean DEFAULT true,
  `inactive_at` timestamp NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `inventario` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `producto_id` int UNIQUE,
  `stock_actual` int,
  `stock_minimo` int,
  `bodega` varchar(255),
  `estante` varchar(255),
  `posicion` varchar(255),
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `movimientos_inventario` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `producto_id` int,
  `usuario_id` int,
  `tipo` ENUM('entrada', 'salida', 'ajuste'),
  `cantidad` int,
  `justificacion` text,
  `fecha_hora` timestamp DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `proveedores` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `empresa_id` int,
  `razon_social` varchar(255),
  `nit` varchar(255) UNIQUE,
  `contacto` varchar(255),
  `telefono` varchar(255),
  `direccion` varchar(255),
  `email` varchar(255),
  `documentos_url` varchar(255),
  `activo` boolean DEFAULT true,
  `inactive_at` timestamp NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `ordenes_compra` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `proveedor_id` int,
  `usuario_id` int,
  `fecha_requerida` date,
  `estado` ENUM('pendiente', 'aprobada', 'rechazada', 'recibida_total', 'recibida_parcial', 'anulada'),
  `justificacion_rechazo` text,
  `motivo_anulacion` text,
  `total` decimal(10,2),
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `ordenes_compra_detalle` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `orden_compra_id` int,
  `producto_id` int,
  `cantidad` int,
  `precio_unitario` decimal(10,2),
  `subtotal` decimal(10,2),
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `recepciones` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `orden_compra_id` int,
  `usuario_id` int,
  `tipo_recepcion` ENUM('total', 'parcial'),
  `fecha_hora` timestamp DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `recepciones_detalle` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `recepcion_id` int,
  `producto_id` int,
  `cantidad_recibida` int,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `clientes` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `empresa_id` int,
  `nombres` varchar(255),
  `apellidos` varchar(255),
  `nombre_razon_social` varchar(255),
  `documento` varchar(255) UNIQUE,
  `email` varchar(255),
  `telefono` varchar(255),
  `direccion` varchar(255),
  `ciudad` varchar(255),
  `activo` boolean DEFAULT true,
  `inactive_at` timestamp NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `cotizaciones_pedidos` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `cliente_id` int,
  `usuario_id` int,
  `tipo` ENUM('cotizacion', 'pedido', 'factura'),
  `estado` ENUM('borrador', 'enviada', 'aprobada', 'convertida', 'facturada', 'anulada'),
  `descuento` decimal(10,2) DEFAULT 0,
  `total` decimal(10,2),
  `motivo_anulacion` text,
  `fecha_hora` timestamp DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `cotizaciones_pedidos_detalle` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `cotizacion_pedido_id` int,
  `tipo_item` ENUM('producto', 'servicio'),
  `item_id` int,
  `cantidad` int,
  `precio_unitario` decimal(10,2),
  `subtotal` decimal(10,2),
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `turnos` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `nombre_turno` varchar(255),
  `hora_entrada` time,
  `hora_salida` time,
  `dias_semana` varchar(255),
  `activo` boolean DEFAULT true,
  `inactive_at` timestamp NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `asignacion_turnos` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `usuario_id` int,
  `turno_id` int,
  `fecha_desde` date,
  `fecha_hasta` date,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `vacaciones` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `usuario_id` int,
  `fecha_inicio` date,
  `fecha_fin` date,
  `tipo` ENUM('Disfrute Legal', 'Colectivas', 'Anticipadas') NOT NULL DEFAULT 'Disfrute Legal',
  `observaciones` text NULL,
  `estado` ENUM('pendiente', 'aprobada', 'rechazada') DEFAULT 'pendiente',
  `justificacion_respuesta` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `notificaciones` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `usuario_id` int,
  `titulo` varchar(255),
  `descripcion` text,
  `leida` boolean DEFAULT false,
  `fecha_hora` timestamp DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `logs_auditoria` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `usuario_id` int,
  `modulo` varchar(255),
  `accion` varchar(255),
  `entidad_afectada_id` int,
  `descripcion` text,
  `ip_origen` varchar(255),
  `fecha_hora` timestamp DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Claves foráneas
-- ============================================================
ALTER TABLE `roles` ADD FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`);
ALTER TABLE `permisos` ADD FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`);
ALTER TABLE `cargos` ADD FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`);
ALTER TABLE `cargos` ADD FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`);
ALTER TABLE `usuarios` ADD FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`);
ALTER TABLE `usuarios` ADD FOREIGN KEY (`cargo_id`) REFERENCES `cargos` (`id`);
ALTER TABLE `usuarios` ADD FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`);
ALTER TABLE `categorias` ADD FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`);
ALTER TABLE `productos` ADD FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`);
ALTER TABLE `productos` ADD FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`);
ALTER TABLE `servicios` ADD FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`);
ALTER TABLE `servicios` ADD FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`);
ALTER TABLE `inventario` ADD FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);
ALTER TABLE `movimientos_inventario` ADD FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);
ALTER TABLE `movimientos_inventario` ADD FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);
ALTER TABLE `proveedores` ADD FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`);
ALTER TABLE `ordenes_compra` ADD FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`);
ALTER TABLE `ordenes_compra` ADD FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);
ALTER TABLE `ordenes_compra_detalle` ADD FOREIGN KEY (`orden_compra_id`) REFERENCES `ordenes_compra` (`id`);
ALTER TABLE `ordenes_compra_detalle` ADD FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);
ALTER TABLE `recepciones` ADD FOREIGN KEY (`orden_compra_id`) REFERENCES `ordenes_compra` (`id`);
ALTER TABLE `recepciones` ADD FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);
ALTER TABLE `recepciones_detalle` ADD FOREIGN KEY (`recepcion_id`) REFERENCES `recepciones` (`id`);
ALTER TABLE `recepciones_detalle` ADD FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);
ALTER TABLE `clientes` ADD FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`);
ALTER TABLE `cotizaciones_pedidos` ADD FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`);
ALTER TABLE `cotizaciones_pedidos` ADD FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);
ALTER TABLE `cotizaciones_pedidos_detalle` ADD FOREIGN KEY (`cotizacion_pedido_id`) REFERENCES `cotizaciones_pedidos` (`id`);
ALTER TABLE `asignacion_turnos` ADD FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);
ALTER TABLE `asignacion_turnos` ADD FOREIGN KEY (`turno_id`) REFERENCES `turnos` (`id`);
ALTER TABLE `vacaciones` ADD FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);
ALTER TABLE `notificaciones` ADD FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);
ALTER TABLE `logs_auditoria` ADD FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);