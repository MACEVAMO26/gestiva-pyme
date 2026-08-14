-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: gestivapyme
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_requests`
--

DROP TABLE IF EXISTS `admin_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int DEFAULT NULL,
  `tipo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente',
  `notas_propietaria` text COLLATE utf8mb4_unicode_ci,
  `banco` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comprobante_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `datos_nuevos` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_requests`
--

LOCK TABLES `admin_requests` WRITE;
/*!40000 ALTER TABLE `admin_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `afiliaciones`
--

DROP TABLE IF EXISTS `afiliaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `afiliaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `eps` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `arl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `afondo_pension` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente',
  `fecha_contratacion` date DEFAULT NULL,
  `finalizacion_contrato` date DEFAULT NULL,
  `renovacion_contrato` date DEFAULT NULL,
  `documento_soporte_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notas_rechazo` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `fondo_cesantias` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `afiliaciones_user_id_index` (`user_id`),
  CONSTRAINT `afiliaciones_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `afiliaciones`
--

LOCK TABLES `afiliaciones` WRITE;
/*!40000 ALTER TABLE `afiliaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `afiliaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `areas`
--

DROP TABLE IF EXISTS `areas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `areas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int DEFAULT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `areas_empresa_id_index` (`empresa_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `areas`
--

LOCK TABLES `areas` WRITE;
/*!40000 ALTER TABLE `areas` DISABLE KEYS */;
/*!40000 ALTER TABLE `areas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asignacion_turnos`
--

DROP TABLE IF EXISTS `asignacion_turnos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asignacion_turnos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int DEFAULT NULL,
  `turno_id` int DEFAULT NULL,
  `fecha_desde` date DEFAULT NULL,
  `fecha_hasta` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `asignacion_turnos_turno_id_index` (`turno_id`),
  KEY `asignacion_turnos_usuario_id_index` (`usuario_id`),
  CONSTRAINT `asignacion_turnos_turno_id_foreign` FOREIGN KEY (`turno_id`) REFERENCES `turnos` (`id`),
  CONSTRAINT `asignacion_turnos_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignacion_turnos`
--

LOCK TABLES `asignacion_turnos` WRITE;
/*!40000 ALTER TABLE `asignacion_turnos` DISABLE KEYS */;
/*!40000 ALTER TABLE `asignacion_turnos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cajas`
--

DROP TABLE IF EXISTS `cajas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cajas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int NOT NULL,
  `usuario_apertura` int NOT NULL,
  `usuario_cierre` int DEFAULT NULL,
  `saldo_inicial` decimal(15,2) NOT NULL,
  `saldo_final` decimal(15,2) DEFAULT NULL,
  `abierta_en` timestamp NOT NULL,
  `cerrada_en` timestamp NULL DEFAULT NULL,
  `estado` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Abierta',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cajas_usuario_cierre_foreign` (`usuario_cierre`),
  KEY `cajas_empresa_id_foreign` (`empresa_id`),
  KEY `cajas_usuario_apertura_foreign` (`usuario_apertura`),
  CONSTRAINT `cajas_empresa_id_foreign` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cajas_usuario_apertura_foreign` FOREIGN KEY (`usuario_apertura`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `cajas_usuario_cierre_foreign` FOREIGN KEY (`usuario_cierre`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cajas`
--

LOCK TABLES `cajas` WRITE;
/*!40000 ALTER TABLE `cajas` DISABLE KEYS */;
/*!40000 ALTER TABLE `cajas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cajas_movimientos`
--

DROP TABLE IF EXISTS `cajas_movimientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cajas_movimientos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `caja_id` int NOT NULL,
  `tipo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `monto` decimal(15,2) NOT NULL,
  `concepto` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comprobante` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `venta_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cajas_movimientos_caja_id_foreign` (`caja_id`),
  KEY `cajas_movimientos_venta_id_foreign` (`venta_id`),
  CONSTRAINT `cajas_movimientos_caja_id_foreign` FOREIGN KEY (`caja_id`) REFERENCES `cajas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cajas_movimientos_venta_id_foreign` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cajas_movimientos`
--

LOCK TABLES `cajas_movimientos` WRITE;
/*!40000 ALTER TABLE `cajas_movimientos` DISABLE KEYS */;
/*!40000 ALTER TABLE `cajas_movimientos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `calendario_eventos`
--

DROP TABLE IF EXISTS `calendario_eventos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calendario_eventos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `fecha_inicio` timestamp NOT NULL,
  `fecha_fin` timestamp NOT NULL,
  `color_etiqueta` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#45a1ae',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `calendario_eventos_usuario_id_index` (`usuario_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calendario_eventos`
--

LOCK TABLES `calendario_eventos` WRITE;
/*!40000 ALTER TABLE `calendario_eventos` DISABLE KEYS */;
/*!40000 ALTER TABLE `calendario_eventos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cargos`
--

DROP TABLE IF EXISTS `cargos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cargos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int DEFAULT NULL,
  `rol_id` int DEFAULT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `funciones` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) DEFAULT '1',
  `inactive_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cargos_empresa_id_index` (`empresa_id`),
  KEY `cargos_rol_id_index` (`rol_id`),
  CONSTRAINT `cargos_empresa_id_foreign` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`),
  CONSTRAINT `cargos_rol_id_foreign` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cargos`
--

LOCK TABLES `cargos` WRITE;
/*!40000 ALTER TABLE `cargos` DISABLE KEYS */;
INSERT INTO `cargos` VALUES (1,1,NULL,'Jefe de Recursos Humanos','Responsable de la gestión humana de la empresa',NULL,1,NULL,'2026-07-25 01:05:22','2026-07-25 01:05:22');
/*!40000 ALTER TABLE `cargos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int DEFAULT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `tipo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `inactive_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `categorias_empresa_id_index` (`empresa_id`),
  CONSTRAINT `categorias_empresa_id_foreign` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int DEFAULT NULL,
  `nombres` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `apellidos` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre_razon_social` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `documento` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ciudad` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `inactive_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `tipo_cliente` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `membresia` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pedidos_activos` int NOT NULL DEFAULT '0',
  `estado_pedido` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado_financiero` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comentarios` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clientes_documento_unique` (`documento`),
  KEY `clientes_empresa_id_index` (`empresa_id`),
  CONSTRAINT `clientes_empresa_id_foreign` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cotizaciones_pedidos`
--

DROP TABLE IF EXISTS `cotizaciones_pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cotizaciones_pedidos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cliente_id` int DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `tipo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descuento` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) DEFAULT NULL,
  `motivo_anulacion` text COLLATE utf8mb4_unicode_ci,
  `fecha_hora` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cotizaciones_pedidos_cliente_id_index` (`cliente_id`),
  KEY `cotizaciones_pedidos_usuario_id_index` (`usuario_id`),
  CONSTRAINT `cotizaciones_pedidos_cliente_id_foreign` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`),
  CONSTRAINT `cotizaciones_pedidos_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cotizaciones_pedidos`
--

LOCK TABLES `cotizaciones_pedidos` WRITE;
/*!40000 ALTER TABLE `cotizaciones_pedidos` DISABLE KEYS */;
/*!40000 ALTER TABLE `cotizaciones_pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cotizaciones_pedidos_detalle`
--

DROP TABLE IF EXISTS `cotizaciones_pedidos_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cotizaciones_pedidos_detalle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cotizacion_pedido_id` int DEFAULT NULL,
  `tipo_item` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `item_id` int DEFAULT NULL,
  `cantidad` int DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cotizaciones_pedidos_detalle_cotizacion_pedido_id_index` (`cotizacion_pedido_id`),
  CONSTRAINT `cotizaciones_pedidos_detalle_cotizacion_pedido_id_foreign` FOREIGN KEY (`cotizacion_pedido_id`) REFERENCES `cotizaciones_pedidos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cotizaciones_pedidos_detalle`
--

LOCK TABLES `cotizaciones_pedidos_detalle` WRITE;
/*!40000 ALTER TABLE `cotizaciones_pedidos_detalle` DISABLE KEYS */;
/*!40000 ALTER TABLE `cotizaciones_pedidos_detalle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cuentas_por_pagar`
--

DROP TABLE IF EXISTS `cuentas_por_pagar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cuentas_por_pagar` (
  `id` int NOT NULL AUTO_INCREMENT,
  `proveedor_id` int NOT NULL,
  `factura_numero` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `concepto` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total` decimal(15,2) NOT NULL,
  `saldo_pendiente` decimal(15,2) NOT NULL,
  `fecha_emision` date NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `estado` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pendiente',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cuentas_por_pagar_proveedor_id_foreign` (`proveedor_id`),
  CONSTRAINT `cuentas_por_pagar_proveedor_id_foreign` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cuentas_por_pagar`
--

LOCK TABLES `cuentas_por_pagar` WRITE;
/*!40000 ALTER TABLE `cuentas_por_pagar` DISABLE KEYS */;
/*!40000 ALTER TABLE `cuentas_por_pagar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documento_empleados`
--

DROP TABLE IF EXISTS `documento_empleados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documento_empleados` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empleado_id` int NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_archivo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cloudinary_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cloudinary_public_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `documento_empleados_empleado_id_foreign` (`empleado_id`),
  CONSTRAINT `documento_empleados_empleado_id_foreign` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documento_empleados`
--

LOCK TABLES `documento_empleados` WRITE;
/*!40000 ALTER TABLE `documento_empleados` DISABLE KEYS */;
/*!40000 ALTER TABLE `documento_empleados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empleados`
--

DROP TABLE IF EXISTS `empleados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empleados` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo_empleado` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `empresa_id` int DEFAULT NULL,
  `area_id` int DEFAULT NULL,
  `cargo_id` int DEFAULT NULL,
  `jerarquia_id` int DEFAULT NULL,
  `fecha_contratacion` date DEFAULT NULL,
  `tipo_contrato` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `salario` decimal(12,2) DEFAULT NULL,
  `eps` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `arl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fondo_pension` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fondo_cesantias` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `caja_compensacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `baja_solicitada` tinyint(1) NOT NULL DEFAULT '0',
  `estado_afiliacion` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `empleados_codigo_empleado_unique` (`codigo_empleado`),
  KEY `empleados_area_id_index` (`area_id`),
  KEY `empleados_cargo_id_index` (`cargo_id`),
  KEY `empleados_empresa_id_index` (`empresa_id`),
  KEY `empleados_jerarquia_id_index` (`jerarquia_id`),
  KEY `empleados_usuario_id_index` (`usuario_id`),
  CONSTRAINT `empleados_empresa_id_foreign` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`) ON DELETE CASCADE,
  CONSTRAINT `empleados_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empleados`
--

LOCK TABLES `empleados` WRITE;
/*!40000 ALTER TABLE `empleados` DISABLE KEYS */;
/*!40000 ALTER TABLE `empleados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empresa`
--

DROP TABLE IF EXISTS `empresa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empresa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `razon_social` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nit` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_empresa` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ciudad` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `estado_pago` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'al_dia',
  `inactive_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `plan_suscripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'Básico',
  `fecha_inscripcion` date DEFAULT NULL,
  `renovaciones` int NOT NULL DEFAULT '0',
  `monto_mensual` decimal(10,2) NOT NULL DEFAULT '0.00',
  `fecha_proximo_pago` date DEFAULT NULL,
  `last_activity_at` timestamp NULL DEFAULT NULL,
  `estado_servidor` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'online',
  `ultimo_ping` timestamp NULL DEFAULT NULL,
  `descuento` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'N/A',
  `periodo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Mensual',
  `descuentos_aplicados` json DEFAULT NULL,
  `cargos_extra` json DEFAULT NULL,
  `addons_personalizados` json DEFAULT NULL,
  `color_primario` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color_secundario` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color_fondo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color_texto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dominio` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `arl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `caja_compensacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contrato_aceptado` tinyint(1) NOT NULL DEFAULT '0',
  `contrato_fecha_aceptacion` timestamp NULL DEFAULT NULL,
  `contrato_ip_aceptacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contrato_firma_path` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `empresa_nit_unique` (`nit`),
  UNIQUE KEY `empresa_dominio_unique` (`dominio`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empresa`
--

LOCK TABLES `empresa` WRITE;
/*!40000 ALTER TABLE `empresa` DISABLE KEYS */;
INSERT INTO `empresa` VALUES (1,'TechVenta y soluciones S.A.','900123456-7','Ventas y Servicios',NULL,NULL,'macevngs@gmail.com',NULL,NULL,1,'al_dia',NULL,'2026-07-24 01:55:21','2026-07-24 01:55:21','Básico','2026-07-01',0,0.00,NULL,'2026-07-24 19:12:41','online',NULL,'Referido 10%','Mensual',NULL,NULL,NULL,'#6366f1','#1e293b','#4c808a','#f8fafc','techventaysoluciones',NULL,NULL,1,'2026-08-09 10:09:41','127.0.0.1','data:image/png;base64,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');
/*!40000 ALTER TABLE `empresa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empresa_modulo`
--

DROP TABLE IF EXISTS `empresa_modulo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empresa_modulo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int NOT NULL,
  `modulo_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `empresa_modulo_empresa_id_modulo_id_unique` (`empresa_id`,`modulo_id`),
  KEY `empresa_modulo_modulo_id_index` (`modulo_id`),
  CONSTRAINT `empresa_modulo_empresa_id_foreign` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`) ON DELETE CASCADE,
  CONSTRAINT `empresa_modulo_modulo_id_foreign` FOREIGN KEY (`modulo_id`) REFERENCES `modulos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empresa_modulo`
--

LOCK TABLES `empresa_modulo` WRITE;
/*!40000 ALTER TABLE `empresa_modulo` DISABLE KEYS */;
INSERT INTO `empresa_modulo` VALUES (1,1,'f_caja',1,'2026-07-24 04:16:22','2026-08-11 23:50:41'),(2,1,'r_tur',1,'2026-07-24 04:16:23','2026-08-11 23:50:41'),(3,1,'r_aus',1,'2026-07-24 04:16:23','2026-08-11 23:50:42'),(4,1,'r_vac',1,'2026-07-24 04:16:23','2026-08-11 23:50:42'),(5,1,'v_pos',1,'2026-07-24 04:16:23','2026-08-11 23:50:41'),(6,1,'v_inv',1,'2026-07-24 04:16:24','2026-08-11 23:50:42'),(7,1,'v_cxc',1,'2026-07-24 04:16:24','2026-08-11 23:50:42'),(8,1,'v_rep',1,'2026-07-24 04:16:24','2026-08-11 23:50:43'),(9,1,'v_prov',1,'2026-07-24 04:16:25','2026-08-11 23:50:44'),(10,1,'s_age',1,'2026-07-24 04:16:25','2026-08-11 23:50:41'),(11,1,'s_crm',1,'2026-07-24 04:16:25','2026-08-11 23:50:42'),(12,1,'s_cat',1,'2026-07-24 04:16:25','2026-08-11 23:50:42'),(13,1,'s_ope',1,'2026-07-24 04:16:26','2026-08-11 23:50:43'),(14,1,'s_rep',1,'2026-07-24 04:16:26','2026-08-11 23:50:44'),(15,1,'a_contable',1,'2026-08-11 23:50:41','2026-08-11 23:50:41'),(16,1,'soporte',1,'2026-08-11 23:50:43','2026-08-11 23:50:43');
/*!40000 ALTER TABLE `empresa_modulo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ia_chat_history`
--

DROP TABLE IF EXISTS `ia_chat_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ia_chat_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int DEFAULT NULL,
  `rol` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensaje` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `modo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'basico',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=226 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ia_chat_history`
--

LOCK TABLES `ia_chat_history` WRITE;
/*!40000 ALTER TABLE `ia_chat_history` DISABLE KEYS */;
INSERT INTO `ia_chat_history` VALUES (1,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 03:54:10','2026-08-13 03:54:10'),(2,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 04:16:54','2026-08-13 04:16:54'),(3,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 04:17:51','2026-08-13 04:17:51'),(4,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 04:21:42','2026-08-13 04:21:42'),(5,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 04:23:10','2026-08-13 04:23:10'),(6,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 04:23:16','2026-08-13 04:23:16'),(7,1,'assistant','Sugerencias servidas en tareas','basico','2026-08-13 04:24:27','2026-08-13 04:24:27'),(8,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 04:24:35','2026-08-13 04:24:35'),(9,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 04:36:11','2026-08-13 04:36:11'),(10,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 04:36:57','2026-08-13 04:36:57'),(11,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 04:39:48','2026-08-13 04:39:48'),(12,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 04:40:38','2026-08-13 04:40:38'),(13,1,'assistant','Sugerencias servidas en tareas','basico','2026-08-13 04:45:34','2026-08-13 04:45:34'),(14,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 04:45:40','2026-08-13 04:45:40'),(15,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 04:46:32','2026-08-13 04:46:32'),(16,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 04:46:44','2026-08-13 04:46:44'),(17,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 04:46:49','2026-08-13 04:46:49'),(18,1,'assistant','Sugerencias servidas en tareas','basico','2026-08-13 04:49:43','2026-08-13 04:49:43'),(19,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 04:51:43','2026-08-13 04:51:43'),(20,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 04:51:57','2026-08-13 04:51:57'),(21,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 04:52:05','2026-08-13 04:52:05'),(22,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 07:29:09','2026-08-13 07:29:09'),(23,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 07:39:20','2026-08-13 07:39:20'),(24,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 07:40:39','2026-08-13 07:40:39'),(25,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 07:54:51','2026-08-13 07:54:51'),(26,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 07:55:19','2026-08-13 07:55:19'),(27,1,'assistant','Sugerencias servidas en tareas','basico','2026-08-13 07:55:54','2026-08-13 07:55:54'),(28,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 07:56:06','2026-08-13 07:56:06'),(29,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 08:02:32','2026-08-13 08:02:32'),(30,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 08:03:34','2026-08-13 08:03:34'),(31,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 08:03:46','2026-08-13 08:03:46'),(32,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 08:06:50','2026-08-13 08:06:50'),(33,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 08:08:01','2026-08-13 08:08:01'),(34,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 08:09:40','2026-08-13 08:09:40'),(35,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 08:33:56','2026-08-13 08:33:56'),(36,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 08:35:21','2026-08-13 08:35:21'),(37,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 08:35:29','2026-08-13 08:35:29'),(38,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 08:42:48','2026-08-13 08:42:48'),(39,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 08:43:06','2026-08-13 08:43:06'),(40,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 08:44:08','2026-08-13 08:44:08'),(41,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 08:48:43','2026-08-13 08:48:43'),(42,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 09:27:14','2026-08-13 09:27:14'),(43,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 09:27:25','2026-08-13 09:27:25'),(44,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 09:30:23','2026-08-13 09:30:23'),(45,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 09:37:15','2026-08-13 09:37:15'),(46,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 09:37:21','2026-08-13 09:37:21'),(47,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 09:37:55','2026-08-13 09:37:55'),(48,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 09:38:01','2026-08-13 09:38:01'),(49,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 09:39:17','2026-08-13 09:39:17'),(50,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 09:39:24','2026-08-13 09:39:24'),(51,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 09:40:00','2026-08-13 09:40:00'),(52,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 09:40:05','2026-08-13 09:40:05'),(53,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 09:40:39','2026-08-13 09:40:39'),(54,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 09:40:45','2026-08-13 09:40:45'),(55,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 09:42:36','2026-08-13 09:42:36'),(56,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 09:42:38','2026-08-13 09:42:38'),(57,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 09:45:12','2026-08-13 09:45:12'),(58,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 09:45:15','2026-08-13 09:45:15'),(59,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 09:46:05','2026-08-13 09:46:05'),(60,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 09:46:11','2026-08-13 09:46:11'),(61,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 09:46:16','2026-08-13 09:46:16'),(62,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 09:54:59','2026-08-13 09:54:59'),(63,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 09:55:04','2026-08-13 09:55:04'),(64,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 09:55:09','2026-08-13 09:55:09'),(65,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 09:55:54','2026-08-13 09:55:54'),(66,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 09:56:11','2026-08-13 09:56:11'),(67,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 10:15:48','2026-08-13 10:15:48'),(68,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 10:16:21','2026-08-13 10:16:21'),(69,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 10:17:58','2026-08-13 10:17:58'),(70,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 10:18:27','2026-08-13 10:18:27'),(71,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 10:18:40','2026-08-13 10:18:40'),(72,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 10:45:09','2026-08-13 10:45:09'),(73,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 10:48:28','2026-08-13 10:48:28'),(74,1,'assistant','Sugerencias servidas en tareas','basico','2026-08-13 10:52:31','2026-08-13 10:52:31'),(75,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 10:52:39','2026-08-13 10:52:39'),(76,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 10:52:50','2026-08-13 10:52:50'),(77,1,'assistant','Sugerencias servidas en ventas','basico','2026-08-13 10:52:53','2026-08-13 10:52:53'),(78,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 10:52:58','2026-08-13 10:52:58'),(79,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 10:53:01','2026-08-13 10:53:01'),(80,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 10:53:04','2026-08-13 10:53:04'),(81,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 10:53:07','2026-08-13 10:53:07'),(82,1,'assistant','Sugerencias servidas en ventas','basico','2026-08-13 11:02:13','2026-08-13 11:02:13'),(83,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:02:16','2026-08-13 11:02:16'),(84,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:02:19','2026-08-13 11:02:19'),(85,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:02:22','2026-08-13 11:02:22'),(86,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:02:25','2026-08-13 11:02:25'),(87,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:02:27','2026-08-13 11:02:27'),(88,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:02:30','2026-08-13 11:02:30'),(89,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:02:36','2026-08-13 11:02:36'),(90,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:02:39','2026-08-13 11:02:39'),(91,1,'assistant','Sugerencias servidas en ventas','basico','2026-08-13 11:02:42','2026-08-13 11:02:42'),(92,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:02:47','2026-08-13 11:02:47'),(93,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:02:58','2026-08-13 11:02:58'),(94,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:22:00','2026-08-13 11:22:00'),(95,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:23:58','2026-08-13 11:23:58'),(96,1,'assistant','Sugerencias servidas en tareas','basico','2026-08-13 11:26:08','2026-08-13 11:26:08'),(97,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:26:58','2026-08-13 11:26:58'),(98,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:27:05','2026-08-13 11:27:05'),(99,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:28:36','2026-08-13 11:28:36'),(100,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:28:41','2026-08-13 11:28:41'),(101,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:28:44','2026-08-13 11:28:44'),(102,1,'assistant','Sugerencias servidas en ventas','basico','2026-08-13 11:33:28','2026-08-13 11:33:28'),(103,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:33:34','2026-08-13 11:33:34'),(104,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:36:46','2026-08-13 11:36:46'),(105,1,'assistant','Sugerencias servidas en ventas','basico','2026-08-13 11:36:51','2026-08-13 11:36:51'),(106,1,'assistant','Sugerencias servidas en ventas','basico','2026-08-13 11:39:23','2026-08-13 11:39:23'),(107,1,'assistant','Sugerencias servidas en ventas','basico','2026-08-13 11:41:36','2026-08-13 11:41:36'),(108,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:41:44','2026-08-13 11:41:44'),(109,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:41:49','2026-08-13 11:41:49'),(110,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:41:54','2026-08-13 11:41:54'),(111,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:41:56','2026-08-13 11:41:56'),(112,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:45:49','2026-08-13 11:45:49'),(113,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:45:54','2026-08-13 11:45:54'),(114,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:48:26','2026-08-13 11:48:26'),(115,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:49:04','2026-08-13 11:49:04'),(116,1,'assistant','Sugerencias servidas en tareas','basico','2026-08-13 11:51:46','2026-08-13 11:51:46'),(117,1,'assistant','Sugerencias servidas en tareas','basico','2026-08-13 11:54:54','2026-08-13 11:54:54'),(118,1,'assistant','Sugerencias servidas en tareas','basico','2026-08-13 11:58:04','2026-08-13 11:58:04'),(119,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 11:58:10','2026-08-13 11:58:10'),(120,1,'assistant','Sugerencias servidas en tareas','basico','2026-08-13 11:59:47','2026-08-13 11:59:47'),(121,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:00:27','2026-08-13 12:00:27'),(122,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:00:32','2026-08-13 12:00:32'),(123,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:00:37','2026-08-13 12:00:37'),(124,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:00:58','2026-08-13 12:00:58'),(125,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:01:18','2026-08-13 12:01:18'),(126,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:01:39','2026-08-13 12:01:39'),(127,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:02:00','2026-08-13 12:02:00'),(128,1,'assistant','Sugerencias servidas en ventas','basico','2026-08-13 12:02:05','2026-08-13 12:02:05'),(129,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:02:25','2026-08-13 12:02:25'),(130,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:02:44','2026-08-13 12:02:44'),(131,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:02:47','2026-08-13 12:02:47'),(132,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:03:08','2026-08-13 12:03:08'),(133,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:03:11','2026-08-13 12:03:11'),(134,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:03:30','2026-08-13 12:03:30'),(135,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:03:33','2026-08-13 12:03:33'),(136,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:04:05','2026-08-13 12:04:05'),(137,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:04:13','2026-08-13 12:04:13'),(138,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:07:57','2026-08-13 12:07:57'),(139,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:08:05','2026-08-13 12:08:05'),(140,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:08:07','2026-08-13 12:08:07'),(141,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:08:10','2026-08-13 12:08:10'),(142,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:14:43','2026-08-13 12:14:43'),(143,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:16:07','2026-08-13 12:16:07'),(144,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:16:12','2026-08-13 12:16:12'),(145,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:16:14','2026-08-13 12:16:14'),(146,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:16:20','2026-08-13 12:16:20'),(147,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:16:30','2026-08-13 12:16:30'),(148,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:16:38','2026-08-13 12:16:38'),(149,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:16:41','2026-08-13 12:16:41'),(150,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:16:44','2026-08-13 12:16:44'),(151,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:16:47','2026-08-13 12:16:47'),(152,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:17:30','2026-08-13 12:17:30'),(153,1,'assistant','Sugerencias servidas en tareas','basico','2026-08-13 12:17:35','2026-08-13 12:17:35'),(154,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:17:43','2026-08-13 12:17:43'),(155,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:17:48','2026-08-13 12:17:48'),(156,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:18:32','2026-08-13 12:18:32'),(157,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:18:37','2026-08-13 12:18:37'),(158,1,'assistant','Sugerencias servidas en tareas','basico','2026-08-13 12:18:47','2026-08-13 12:18:47'),(159,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:18:52','2026-08-13 12:18:52'),(160,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:18:55','2026-08-13 12:18:55'),(161,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:18:58','2026-08-13 12:18:58'),(162,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:20:21','2026-08-13 12:20:21'),(163,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:20:26','2026-08-13 12:20:26'),(164,1,'assistant','Sugerencias servidas en ventas','basico','2026-08-13 12:20:29','2026-08-13 12:20:29'),(165,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:20:35','2026-08-13 12:20:35'),(166,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:20:38','2026-08-13 12:20:38'),(167,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:23:49','2026-08-13 12:23:49'),(168,1,'assistant','Sugerencias servidas en tareas','basico','2026-08-13 12:23:54','2026-08-13 12:23:54'),(169,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:23:59','2026-08-13 12:23:59'),(170,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:24:04','2026-08-13 12:24:04'),(171,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:24:12','2026-08-13 12:24:12'),(172,1,'assistant','Sugerencias servidas en tareas','basico','2026-08-13 12:24:20','2026-08-13 12:24:20'),(173,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:24:25','2026-08-13 12:24:25'),(174,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:27:48','2026-08-13 12:27:48'),(175,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:32:18','2026-08-13 12:32:18'),(176,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:32:23','2026-08-13 12:32:23'),(177,1,'assistant','Sugerencias servidas en tareas','basico','2026-08-13 12:32:26','2026-08-13 12:32:26'),(178,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:32:36','2026-08-13 12:32:36'),(179,1,'assistant','Sugerencias servidas en tareas','basico','2026-08-13 12:32:39','2026-08-13 12:32:39'),(180,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:43:49','2026-08-13 12:43:49'),(181,1,'assistant','Sugerencias servidas en tareas','basico','2026-08-13 12:43:59','2026-08-13 12:43:59'),(182,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:44:02','2026-08-13 12:44:02'),(183,1,'assistant','Sugerencias servidas en ventas','basico','2026-08-13 12:44:10','2026-08-13 12:44:10'),(184,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:44:13','2026-08-13 12:44:13'),(185,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:44:16','2026-08-13 12:44:16'),(186,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:44:19','2026-08-13 12:44:19'),(187,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:44:22','2026-08-13 12:44:22'),(188,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:44:24','2026-08-13 12:44:24'),(189,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:49:39','2026-08-13 12:49:39'),(190,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:49:47','2026-08-13 12:49:47'),(191,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:49:49','2026-08-13 12:49:49'),(192,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:49:52','2026-08-13 12:49:52'),(193,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:49:55','2026-08-13 12:49:55'),(194,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:49:58','2026-08-13 12:49:58'),(195,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:50:02','2026-08-13 12:50:02'),(196,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:50:05','2026-08-13 12:50:05'),(197,1,'assistant','Sugerencias servidas en ventas','basico','2026-08-13 12:50:11','2026-08-13 12:50:11'),(198,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:50:13','2026-08-13 12:50:13'),(199,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:50:16','2026-08-13 12:50:16'),(200,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:50:19','2026-08-13 12:50:19'),(201,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 12:50:22','2026-08-13 12:50:22'),(202,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 13:07:59','2026-08-13 13:07:59'),(203,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 15:54:44','2026-08-13 15:54:44'),(204,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 16:01:42','2026-08-13 16:01:42'),(205,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 16:20:13','2026-08-13 16:20:13'),(206,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 16:24:54','2026-08-13 16:24:54'),(207,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 16:25:27','2026-08-13 16:25:27'),(208,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 16:25:33','2026-08-13 16:25:33'),(209,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 16:26:16','2026-08-13 16:26:16'),(210,1,'assistant','Sugerencias servidas en ventas','basico','2026-08-13 16:26:17','2026-08-13 16:26:17'),(211,1,'assistant','Sugerencias servidas en ventas','basico','2026-08-13 16:32:55','2026-08-13 16:32:55'),(212,1,'assistant','Sugerencias servidas en ventas','basico','2026-08-13 16:32:56','2026-08-13 16:32:56'),(213,1,'assistant','Sugerencias servidas en ventas','basico','2026-08-13 16:42:28','2026-08-13 16:42:28'),(214,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 16:45:46','2026-08-13 16:45:46'),(215,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 16:45:50','2026-08-13 16:45:50'),(216,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 16:46:15','2026-08-13 16:46:15'),(217,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 16:46:15','2026-08-13 16:46:15'),(218,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 16:46:22','2026-08-13 16:46:22'),(219,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 16:46:40','2026-08-13 16:46:40'),(220,1,'assistant','Sugerencias servidas en general','basico','2026-08-13 16:46:50','2026-08-13 16:46:50'),(221,1,'assistant','Sugerencias servidas en general','basico','2026-08-14 03:28:49','2026-08-14 03:28:49'),(222,1,'assistant','Sugerencias servidas en general','basico','2026-08-14 03:28:54','2026-08-14 03:28:54'),(223,1,'assistant','Sugerencias servidas en general','basico','2026-08-14 03:34:43','2026-08-14 03:34:43'),(224,1,'assistant','Sugerencias servidas en general','basico','2026-08-14 03:34:45','2026-08-14 03:34:45'),(225,1,'assistant','Sugerencias servidas en general','basico','2026-08-14 04:03:54','2026-08-14 04:03:54');
/*!40000 ALTER TABLE `ia_chat_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ia_configs`
--

DROP TABLE IF EXISTS `ia_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ia_configs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `proveedor` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `api_key` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `modo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'apagado',
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ia_configs_proveedor_unique` (`proveedor`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ia_configs`
--

LOCK TABLES `ia_configs` WRITE;
/*!40000 ALTER TABLE `ia_configs` DISABLE KEYS */;
INSERT INTO `ia_configs` VALUES (2,'gemini','eyJpdiI6Inh4VzNOSnlCZElYNXJhRXg3WUdVb1E9PSIsInZhbHVlIjoieHZ4TmlOa203L3JTRGh0YTFQS2dWZlp6WXNoMUVaVCtRN2trZVNtM2J4aUZNMzlCbHRCd2ExMEh1NC9xa3k3OFNuWnllRUk4a2ZGaDJ3U3dHM3NpVlE9PSIsIm1hYyI6ImIzNGRiNTNjY2E0OWIzMDkzMTQ3ODgzYTFjZWQ1MWUzMzQ1NDUyYzI2ODgxYTkzMjYwNjEzOWRjNTFlYTk0OGYiLCJ0YWciOiIifQ==','simple',1,'2026-08-13 16:24:24','2026-08-13 16:45:28');
/*!40000 ALTER TABLE `ia_configs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ia_sugerencias_personalizadas`
--

DROP TABLE IF EXISTS `ia_sugerencias_personalizadas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ia_sugerencias_personalizadas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int NOT NULL,
  `mensaje` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `audiencia` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Todos',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ia_sugerencias_personalizadas_empresa_id_index` (`empresa_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ia_sugerencias_personalizadas`
--

LOCK TABLES `ia_sugerencias_personalizadas` WRITE;
/*!40000 ALTER TABLE `ia_sugerencias_personalizadas` DISABLE KEYS */;
INSERT INTO `ia_sugerencias_personalizadas` VALUES (1,1,'Feliz fin de semana a todos','Operativos',1,'2026-08-13 08:01:11','2026-08-13 08:01:11'),(4,1,'Buen dia !','Todos',1,'2026-08-13 16:25:21','2026-08-13 16:25:21');
/*!40000 ALTER TABLE `ia_sugerencias_personalizadas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventario`
--

DROP TABLE IF EXISTS `inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `producto_id` int DEFAULT NULL,
  `stock_actual` int DEFAULT NULL,
  `stock_minimo` int DEFAULT NULL,
  `bodega` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estante` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `posicion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventario_producto_id_unique` (`producto_id`),
  CONSTRAINT `inventario_producto_id_foreign` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario`
--

LOCK TABLES `inventario` WRITE;
/*!40000 ALTER TABLE `inventario` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jerarquias`
--

DROP TABLE IF EXISTS `jerarquias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jerarquias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nivel` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `jerarquias_empresa_id_foreign` (`empresa_id`),
  CONSTRAINT `jerarquias_empresa_id_foreign` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jerarquias`
--

LOCK TABLES `jerarquias` WRITE;
/*!40000 ALTER TABLE `jerarquias` DISABLE KEYS */;
/*!40000 ALTER TABLE `jerarquias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` text COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` smallint NOT NULL,
  `reserved_at` int DEFAULT NULL,
  `available_at` int NOT NULL,
  `created_at` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leads`
--

DROP TABLE IF EXISTS `leads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `horario_llamada` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mensaje` text COLLATE utf8mb4_unicode_ci,
  `estado` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `notas` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leads`
--

LOCK TABLES `leads` WRITE;
/*!40000 ALTER TABLE `leads` DISABLE KEYS */;
/*!40000 ALTER TABLE `leads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logs_auditoria`
--

DROP TABLE IF EXISTS `logs_auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs_auditoria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int DEFAULT NULL,
  `modulo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `accion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entidad_afectada_id` int DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `ip_origen` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_hora` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `logs_auditoria_usuario_id_index` (`usuario_id`),
  CONSTRAINT `logs_auditoria_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logs_auditoria`
--

LOCK TABLES `logs_auditoria` WRITE;
/*!40000 ALTER TABLE `logs_auditoria` DISABLE KEYS */;
/*!40000 ALTER TABLE `logs_auditoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'2026_07_14_052313_create_admin_requests_table',1),(2,'2026_07_14_052313_create_afiliaciones_table',1),(3,'2026_07_14_052313_create_asignacion_turnos_table',1),(4,'2026_07_14_052313_create_cache_locks_table',1),(5,'2026_07_14_052313_create_cache_table',1),(6,'2026_07_14_052313_create_cargos_table',1),(7,'2026_07_14_052313_create_categorias_table',1),(8,'2026_07_14_052313_create_clientes_table',1),(9,'2026_07_14_052313_create_cotizaciones_pedidos_detalle_table',1),(10,'2026_07_14_052313_create_cotizaciones_pedidos_table',1),(11,'2026_07_14_052313_create_empresa_modulo_table',1),(12,'2026_07_14_052313_create_empresa_table',1),(13,'2026_07_14_052313_create_failed_jobs_table',1),(14,'2026_07_14_052313_create_inventario_table',1),(15,'2026_07_14_052313_create_job_batches_table',1),(16,'2026_07_14_052313_create_jobs_table',1),(17,'2026_07_14_052313_create_leads_table',1),(18,'2026_07_14_052313_create_logs_auditoria_table',1),(19,'2026_07_14_052313_create_modulos_table',1),(20,'2026_07_14_052313_create_movimientos_inventario_table',1),(21,'2026_07_14_052313_create_notificaciones_table',1),(22,'2026_07_14_052313_create_ordenes_compra_detalle_table',1),(23,'2026_07_14_052313_create_ordenes_compra_table',1),(24,'2026_07_14_052313_create_password_reset_tokens_table',1),(25,'2026_07_14_052313_create_permisos_table',1),(26,'2026_07_14_052313_create_personal_access_tokens_table',1),(27,'2026_07_14_052313_create_productos_table',1),(28,'2026_07_14_052313_create_proveedores_table',1),(29,'2026_07_14_052313_create_recepciones_detalle_table',1),(30,'2026_07_14_052313_create_recepciones_table',1),(31,'2026_07_14_052313_create_recordatorios_table',1),(32,'2026_07_14_052313_create_roles_table',1),(33,'2026_07_14_052313_create_servicios_table',1),(34,'2026_07_14_052313_create_sessions_table',1),(35,'2026_07_14_052313_create_tarifas_table',1),(36,'2026_07_14_052313_create_turnos_table',1),(37,'2026_07_14_052313_create_users_table',1),(38,'2026_07_14_052313_create_usuarios_table',1),(39,'2026_07_14_052313_create_vacaciones_table',1),(40,'2026_07_14_052316_add_foreign_keys_to_afiliaciones_table',1),(41,'2026_07_14_052316_add_foreign_keys_to_asignacion_turnos_table',1),(42,'2026_07_14_052316_add_foreign_keys_to_cargos_table',1),(43,'2026_07_14_052316_add_foreign_keys_to_categorias_table',1),(44,'2026_07_14_052316_add_foreign_keys_to_clientes_table',1),(45,'2026_07_14_052316_add_foreign_keys_to_cotizaciones_pedidos_detalle_table',1),(46,'2026_07_14_052316_add_foreign_keys_to_cotizaciones_pedidos_table',1),(47,'2026_07_14_052316_add_foreign_keys_to_empresa_modulo_table',1),(48,'2026_07_14_052316_add_foreign_keys_to_inventario_table',1),(49,'2026_07_14_052316_add_foreign_keys_to_logs_auditoria_table',1),(50,'2026_07_14_052316_add_foreign_keys_to_movimientos_inventario_table',1),(51,'2026_07_14_052316_add_foreign_keys_to_notificaciones_table',1),(52,'2026_07_14_052316_add_foreign_keys_to_ordenes_compra_detalle_table',1),(53,'2026_07_14_052316_add_foreign_keys_to_ordenes_compra_table',1),(54,'2026_07_14_052316_add_foreign_keys_to_permisos_table',1),(55,'2026_07_14_052316_add_foreign_keys_to_productos_table',1),(56,'2026_07_14_052316_add_foreign_keys_to_proveedores_table',1),(57,'2026_07_14_052316_add_foreign_keys_to_recepciones_detalle_table',1),(58,'2026_07_14_052316_add_foreign_keys_to_recepciones_table',1),(59,'2026_07_14_052316_add_foreign_keys_to_recordatorios_table',1),(60,'2026_07_14_052316_add_foreign_keys_to_roles_table',1),(61,'2026_07_14_052316_add_foreign_keys_to_servicios_table',1),(62,'2026_07_14_052316_add_foreign_keys_to_usuarios_table',1),(63,'2026_07_14_052316_add_foreign_keys_to_vacaciones_table',1),(64,'2026_07_14_070318_add_notas_to_leads_table',1),(65,'2026_07_17_215856_add_color_primario_to_empresa_table',1),(66,'2026_07_17_223827_add_theme_colors_to_empresa_table',1),(67,'2026_07_18_060835_add_extra_fields_to_clientes_table',1),(69,'2026_07_22_155528_create_jerarquias_table',1),(70,'2026_07_22_155529_create_empleados_table',1),(71,'2026_07_23_191716_refactor_usuarios_and_empleados_tables',2),(72,'2026_07_23_195701_add_baja_solicitada_to_empleados_table',3),(73,'2026_07_24_170500_create_tareas_table',4),(74,'2026_07_24_000000_create_reuniones_table',5),(75,'2026_07_24_183357_add_email_personal_to_usuarios_table',6),(76,'2026_07_24_234742_create_sedes_table',7),(77,'2026_07_22_155527_create_areas_table',8),(78,'2026_07_25_011048_add_arl_caja_to_empresas_table',9),(79,'2026_07_25_025803_add_fondo_cesantias_to_afiliaciones_table',10),(80,'2026_07_25_034723_add_evaluacion_to_proveedores_table',11),(81,'2026_07_25_072734_create_servicios_tickets_table',12),(82,'2026_07_25_072735_create_servicios_materiales_table',12),(83,'2026_07_25_072736_create_ventas_table',12),(84,'2026_07_25_072737_create_ventas_detalles_table',12),(85,'2026_07_25_072738_create_cajas_table',12),(86,'2026_07_25_072740_create_cajas_movimientos_table',12),(87,'2026_07_25_072741_create_cuentas_por_pagar_table',12),(88,'2026_07_29_011825_add_descargar_subir_to_permisos_table',13),(89,'2026_07_29_015506_add_es_base_to_roles_table',14),(90,'2026_07_29_040606_create_documento_empleados_table',15),(91,'2026_07_30_203227_add_estado_paquete_to_ventas_table',16),(92,'2026_07_30_203342_add_eps_arl_to_empleados_table',17),(93,'2026_07_30_203403_create_soporte_tickets_table',18),(94,'2026_07_30_204324_add_imagen_url_to_productos_table',19),(95,'2026_08_08_172857_add_contrato_fields_to_empresas_table',20),(96,'2026_08_11_035248_create_ia_configs_table',21),(97,'2026_08_11_035249_create_ia_chat_history_table',21),(98,'2026_08_11_225658_create_calendario_eventos_table_and_insert_inicio_modules',22),(99,'2026_08_11_234239_modify_usuarios_and_permisos_tables',23),(100,'2026_08_12_224508_add_tutorial_visto_to_usuarios_table',24),(101,'2026_08_12_231004_create_ia_sugerencias_personalizadas_table',25),(102,'2026_08_13_113144_add_modo_to_ia_configs_table',26);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `modulos`
--

DROP TABLE IF EXISTS `modulos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modulos` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `paquete` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modulos`
--

LOCK TABLES `modulos` WRITE;
/*!40000 ALTER TABLE `modulos` DISABLE KEYS */;
INSERT INTO `modulos` VALUES ('a_contable','Conector Contable','addons',1,'2026-07-22 21:23:42','2026-07-22 21:23:42'),('f_caja','Caja y Pre-facturación','finanzas',1,'2026-07-22 21:23:40','2026-07-22 21:23:40'),('i_cal','Calendario Personal','base',1,NULL,NULL),('i_not','Notificaciones','base',1,NULL,NULL),('i_rec','Recordatorios','base',1,NULL,NULL),('i_reu','Reuniones','base',1,NULL,NULL),('i_tar','Resumen de Tareas','base',1,NULL,NULL),('inicio','Inicio','base',1,NULL,NULL),('r_aus','Control de Horas Extras y Ausencias','rrhh',1,'2026-07-22 21:23:41','2026-07-22 21:23:41'),('r_tur','Horarios y Turnos','rrhh',1,'2026-07-22 21:23:41','2026-07-22 21:23:41'),('r_vac','Gestión de Vacaciones','rrhh',1,'2026-07-22 21:23:42','2026-07-22 21:23:42'),('s_age','Agenda y Calendario','servicios',1,'2026-07-22 21:23:38','2026-07-22 21:23:38'),('s_cat','Catálogo de Servicios','servicios',1,'2026-07-22 21:23:39','2026-07-22 21:23:39'),('s_crm','CRM (Gestión de Clientes)','servicios',1,'2026-07-22 21:23:38','2026-07-22 21:23:38'),('s_ope','Gestión de Operarios','servicios',1,'2026-07-22 21:23:39','2026-07-22 21:23:39'),('s_rep','Reportes de Servicios','servicios',1,'2026-07-22 21:23:40','2026-07-22 21:23:40'),('soporte','Soporte Técnico','rrhh',1,'2026-07-31 03:56:04','2026-07-31 03:56:04'),('v_cxc','Clientes','ventas',1,'2026-07-22 21:23:36','2026-07-22 21:23:36'),('v_inv','Inventario','ventas',1,'2026-07-22 21:23:35','2026-07-22 21:23:35'),('v_pos','Ventas','ventas',1,'2026-07-22 21:23:35','2026-07-22 21:23:35'),('v_prov','Proveedores','ventas',1,'2026-07-22 21:23:37','2026-07-22 21:23:37'),('v_rep','Compras','ventas',1,'2026-07-22 21:23:36','2026-07-22 21:23:36');
/*!40000 ALTER TABLE `modulos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimientos_inventario`
--

DROP TABLE IF EXISTS `movimientos_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimientos_inventario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `producto_id` int DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `tipo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cantidad` int DEFAULT NULL,
  `justificacion` text COLLATE utf8mb4_unicode_ci,
  `fecha_hora` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `movimientos_inventario_producto_id_index` (`producto_id`),
  KEY `movimientos_inventario_usuario_id_index` (`usuario_id`),
  CONSTRAINT `movimientos_inventario_producto_id_foreign` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `movimientos_inventario_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientos_inventario`
--

LOCK TABLES `movimientos_inventario` WRITE;
/*!40000 ALTER TABLE `movimientos_inventario` DISABLE KEYS */;
/*!40000 ALTER TABLE `movimientos_inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int DEFAULT NULL,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `leida` tinyint(1) DEFAULT '0',
  `fecha_hora` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `notificaciones_usuario_id_index` (`usuario_id`),
  CONSTRAINT `notificaciones_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ordenes_compra`
--

DROP TABLE IF EXISTS `ordenes_compra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ordenes_compra` (
  `id` int NOT NULL AUTO_INCREMENT,
  `proveedor_id` int DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `fecha_requerida` date DEFAULT NULL,
  `estado` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `justificacion_rechazo` text COLLATE utf8mb4_unicode_ci,
  `motivo_anulacion` text COLLATE utf8mb4_unicode_ci,
  `total` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ordenes_compra_proveedor_id_index` (`proveedor_id`),
  KEY `ordenes_compra_usuario_id_index` (`usuario_id`),
  CONSTRAINT `ordenes_compra_proveedor_id_foreign` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`),
  CONSTRAINT `ordenes_compra_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordenes_compra`
--

LOCK TABLES `ordenes_compra` WRITE;
/*!40000 ALTER TABLE `ordenes_compra` DISABLE KEYS */;
/*!40000 ALTER TABLE `ordenes_compra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ordenes_compra_detalle`
--

DROP TABLE IF EXISTS `ordenes_compra_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ordenes_compra_detalle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orden_compra_id` int DEFAULT NULL,
  `producto_id` int DEFAULT NULL,
  `cantidad` int DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ordenes_compra_detalle_orden_compra_id_index` (`orden_compra_id`),
  KEY `ordenes_compra_detalle_producto_id_index` (`producto_id`),
  CONSTRAINT `ordenes_compra_detalle_orden_compra_id_foreign` FOREIGN KEY (`orden_compra_id`) REFERENCES `ordenes_compra` (`id`),
  CONSTRAINT `ordenes_compra_detalle_producto_id_foreign` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordenes_compra_detalle`
--

LOCK TABLES `ordenes_compra_detalle` WRITE;
/*!40000 ALTER TABLE `ordenes_compra_detalle` DISABLE KEYS */;
/*!40000 ALTER TABLE `ordenes_compra_detalle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permisos`
--

DROP TABLE IF EXISTS `permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permisos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rol_id` int DEFAULT NULL,
  `area` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `puede_ver` tinyint(1) DEFAULT NULL,
  `puede_crear` tinyint(1) DEFAULT NULL,
  `puede_editar` tinyint(1) DEFAULT NULL,
  `puede_inactivar` tinyint(1) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `puede_descargar` tinyint(1) NOT NULL DEFAULT '0',
  `puede_subir` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `permisos_rol_id_index` (`rol_id`),
  CONSTRAINT `permisos_rol_id_foreign` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permisos`
--

LOCK TABLES `permisos` WRITE;
/*!40000 ALTER TABLE `permisos` DISABLE KEYS */;
INSERT INTO `permisos` VALUES (1,1,'v_pos',1,1,1,1,'2026-07-24 01:55:21','2026-07-24 01:55:21',1,1),(2,1,'v_inv',1,1,1,1,'2026-07-24 01:55:21','2026-07-24 01:55:21',1,1),(3,1,'v_cxc',1,1,1,1,'2026-07-24 01:55:21','2026-07-24 01:55:21',1,1),(4,1,'v_rep',1,1,1,1,'2026-07-24 01:55:21','2026-07-24 01:55:21',1,1),(5,1,'v_prov',1,1,1,1,'2026-07-24 01:55:21','2026-07-24 01:55:21',1,1),(6,1,'s_age',1,1,1,1,'2026-07-24 01:55:21','2026-07-24 01:55:21',1,1),(7,1,'s_crm',1,1,1,1,'2026-07-24 01:55:21','2026-07-24 01:55:21',1,1),(8,1,'s_cat',1,1,1,1,'2026-07-24 01:55:21','2026-07-24 01:55:21',1,1),(9,1,'s_ope',1,1,1,1,'2026-07-24 01:55:21','2026-07-24 01:55:21',1,1),(10,1,'s_rep',1,1,1,1,'2026-07-24 01:55:21','2026-07-24 01:55:21',1,1),(11,1,'f_caja',1,1,1,1,'2026-07-24 01:55:21','2026-07-24 01:55:21',1,1),(12,1,'r_tur',1,1,1,1,'2026-07-24 01:55:21','2026-07-24 01:55:21',1,1),(13,1,'r_aus',1,1,1,1,'2026-07-24 01:55:21','2026-07-24 01:55:21',1,1),(14,1,'r_vac',1,1,1,1,'2026-07-24 01:55:21','2026-07-24 01:55:21',1,1),(15,1,'a_contable',1,1,1,1,'2026-07-24 01:55:21','2026-07-24 01:55:21',0,0),(16,1,'Administración',1,0,0,0,'2026-07-25 05:28:16','2026-07-25 05:28:16',0,0),(17,1,'Gestión Humana',1,0,0,0,'2026-07-25 09:00:58','2026-07-25 09:00:58',0,0),(18,1,'Clientes',1,0,0,0,'2026-07-25 09:01:00','2026-07-25 09:01:00',0,0),(19,1,'Ventas',1,0,0,0,'2026-07-25 09:01:03','2026-07-25 09:01:03',0,0),(20,1,'Inventario',1,0,0,0,'2026-07-25 09:01:05','2026-07-25 09:01:05',0,0),(21,1,'Compras',1,0,0,0,'2026-07-25 09:01:08','2026-07-25 09:01:08',0,0),(22,1,'Caja',1,0,0,0,'2026-07-25 09:01:10','2026-07-25 09:01:10',0,0);
/*!40000 ALTER TABLE `permisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` int NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'AppModelsUser',1,'auth_token','2367645107617e388e08216e03ae2a10135d4ca0325e79471f50a9ffcd8a7678','[\"*\"]','2026-07-23 00:36:42',NULL,'2026-07-23 00:36:21','2026-07-23 00:36:42'),(2,'AppModelsUser',1,'auth_token','7f9e47f2a3799a3cd0c1ba8bf5a78122044d82fa6beb5dab2f95a902bb88b254','[\"*\"]','2026-07-23 02:35:23',NULL,'2026-07-23 00:36:25','2026-07-23 02:35:23'),(3,'AppModelsUser',1,'auth_token','321d9e99dc534392db246b811ec4bfd06cef0de55bfd6ea41497d0b82d6dd6a6','[\"*\"]','2026-07-23 02:35:43',NULL,'2026-07-23 02:35:25','2026-07-23 02:35:43'),(4,'AppModelsUser',1,'auth_token','73b87a08b1b5af954bf539a85a539c78fd0ed73e132372a732387a552fa97890','[\"*\"]','2026-07-23 02:44:04',NULL,'2026-07-23 02:36:02','2026-07-23 02:44:04'),(5,'AppModelsUser',1,'auth_token','6b24db1534ef5450f189ea3c6e126028227a5d15e892f849881672ef46486ed7','[\"*\"]','2026-07-23 21:11:30',NULL,'2026-07-23 20:50:26','2026-07-23 21:11:30'),(6,'AppModelsUser',1,'auth_token','e8fafbd275d77c5d8ed8ebb4abc7622c5eaad198c484d6af40c41a1872bfc938','[\"*\"]','2026-07-24 01:28:00',NULL,'2026-07-24 01:27:35','2026-07-24 01:28:00'),(7,'AppModelsUser',1,'auth_token','33cb739a8b797e9c833f62825adc90e615ecd29a0e7cc61f236acbb070753921','[\"*\"]',NULL,NULL,'2026-07-24 01:27:44','2026-07-24 01:27:44'),(8,'AppModelsUser',1,'auth_token','c721af4bf5ea51db6ba02d40e44716ba8999faca4c618e5748fdb5a145a45666','[\"*\"]','2026-07-24 01:51:12',NULL,'2026-07-24 01:45:15','2026-07-24 01:51:12'),(9,'AppModelsUser',1,'auth_token','cc82c6c89c24b0167a390ab9d553ad44ff45cdf82a2691458ff62e63b984cb46','[\"*\"]','2026-07-24 04:13:07',NULL,'2026-07-24 01:51:20','2026-07-24 04:13:07'),(10,'AppModelsUser',1,'auth_token','34198b6af2877e32593dd48198e2d828bcf5c49ae16f9ee430be1997069db701','[\"*\"]','2026-07-24 07:07:27',NULL,'2026-07-24 04:15:55','2026-07-24 07:07:27'),(11,'AppModelsUser',2,'auth_token','c3acbf9cc65c0c5775e06513af5d8ecb8ecd8eed1ef2aa9ae8f75a006790db83','[\"*\"]',NULL,NULL,'2026-07-24 04:42:26','2026-07-24 04:42:26'),(12,'AppModelsUser',2,'auth_token','78961b1e00e4253951da596518af1fb3ba80772c4e34d25148b366d46cdfd908','[\"*\"]','2026-07-24 05:33:19',NULL,'2026-07-24 04:43:52','2026-07-24 05:33:19'),(13,'AppModelsUser',2,'auth_token','3bdd27fb3e6a01566601c9fd22d3919d8c2b6b7d7c88fe71ee4ca2b79a786979','[\"*\"]','2026-07-24 06:49:08',NULL,'2026-07-24 05:44:50','2026-07-24 06:49:08'),(14,'AppModelsUser',2,'auth_token','f76f818d7d0bd3ed54994d37802efae34242aae8518156921bb8cc5b7015e1fb','[\"*\"]','2026-07-24 07:05:05',NULL,'2026-07-24 06:49:19','2026-07-24 07:05:05'),(15,'AppModelsUser',2,'test','83a6d19a68cebf94364a8faa6146bc19aa161240e8605fb2447659f6fda2c7d5','[\"*\"]','2026-07-24 06:59:00',NULL,'2026-07-24 06:58:41','2026-07-24 06:59:00'),(16,'AppModelsUser',1,'auth_token','360b153386e970150939e04517438a95a2658821f9c5535c595c71429fe2dfa2','[\"*\"]','2026-07-24 07:30:36',NULL,'2026-07-24 07:07:30','2026-07-24 07:30:36'),(17,'AppModelsUser',2,'auth_token','09aa979b12552f1f9c83b1cbd276f7a801d84ad5572bf83d38ed34ad588628da','[\"*\"]','2026-07-24 07:54:42',NULL,'2026-07-24 07:08:10','2026-07-24 07:54:42'),(18,'AppModelsUser',2,'auth_token','080e5edc40280a0c66be49e22597a40f6287d88afb00edc78d60f5eaf27ec689','[\"*\"]','2026-07-24 18:55:57',NULL,'2026-07-24 18:55:15','2026-07-24 18:55:57'),(19,'AppModelsUser',2,'auth_token','5af2a8fd40f7885316faed0b7452c89a1fa5c84d70ccc012b37f2724cfa939f2','[\"*\"]','2026-07-24 20:06:19',NULL,'2026-07-24 19:12:23','2026-07-24 20:06:19'),(20,'AppModelsUser',2,'auth_token','911b28ecb94a5e2cd381e3b4add537893583cd67045a3273682604179f5d7bed','[\"*\"]','2026-07-25 01:58:00',NULL,'2026-07-24 21:35:15','2026-07-25 01:58:00'),(21,'AppModelsUser',1,'auth_token','2da7203629f04f847ee615338c35b08a998131b769878901b3981b8b875f6b2c','[\"*\"]','2026-07-25 04:07:23',NULL,'2026-07-24 21:50:19','2026-07-25 04:07:23'),(22,'AppModelsUser',1,'auth_token','38e05e70b608854cbd717de38761de14e3504993015eb5bbe69a3bd9c934fa1f','[\"*\"]','2026-07-25 05:02:57',NULL,'2026-07-25 02:01:28','2026-07-25 05:02:57'),(23,'AppModelsUser',1,'auth_token','80a770f5ff7013f9b8180a80a0524c23443cc56abc8386a40e17566b9501eeaf','[\"*\"]','2026-07-25 02:52:14',NULL,'2026-07-25 02:52:12','2026-07-25 02:52:14'),(24,'AppModelsUser',2,'auth_token','33c352fc0510c0db39bdff53f0f09a0d9e6ed76f375ba28760e022404f73d75e','[\"*\"]','2026-07-25 02:55:08',NULL,'2026-07-25 02:54:40','2026-07-25 02:55:08'),(25,'AppModelsUser',2,'auth_token','e30c55385fc86961830b3dbe652aa60cc7d7446cfa04ba6a536fb8f93f975f1c','[\"*\"]','2026-07-25 02:59:33',NULL,'2026-07-25 02:59:31','2026-07-25 02:59:33'),(26,'AppModelsUser',2,'auth_token','70af87038e04458658bf1c63afc45ef64b76dfe400ee78b7e41613c51378c163','[\"*\"]','2026-07-25 03:03:48',NULL,'2026-07-25 02:59:43','2026-07-25 03:03:48'),(27,'AppModelsUser',1,'auth_token','6b2d34aef4bd0bc53c56be1b8781a370b141172d968e3e0ef69419a817d2d6b0','[\"*\"]','2026-07-25 03:00:06',NULL,'2026-07-25 03:00:04','2026-07-25 03:00:06'),(28,'AppModelsUser',2,'auth_token','947386a38e3e537041c52601ebbdb066cc7317639fc7871b13b05eab7cdf1b77','[\"*\"]','2026-07-25 03:06:39',NULL,'2026-07-25 03:06:37','2026-07-25 03:06:39'),(29,'AppModelsUser',1,'auth_token','9ec7ce126c9ee7adde4ac392169558a5450e85b7c0c496039fbb643ea5ad27df','[\"*\"]','2026-07-25 03:22:00',NULL,'2026-07-25 03:21:57','2026-07-25 03:22:00'),(30,'AppModelsUser',2,'auth_token','21a31fd817d9814219ce4d5137c99957d7b53aef7f0cc90af9aad96e7d37ca90','[\"*\"]','2026-07-25 04:32:50',NULL,'2026-07-25 04:32:41','2026-07-25 04:32:50'),(31,'AppModelsUser',2,'auth_token','f3e26c0b51711f8a38a162caef287772b484bdbc649cf14ed75790132d82b2dc','[\"*\"]','2026-07-25 06:11:20',NULL,'2026-07-25 05:13:38','2026-07-25 06:11:20'),(32,'AppModelsUser',2,'auth_token','2baae83bac5a553e91e4af2a1141fdb787d9d148fe4eda9f2cf43a3c55cf773e','[\"*\"]','2026-07-25 09:40:48',NULL,'2026-07-25 08:22:09','2026-07-25 09:40:48'),(33,'AppModelsUser',2,'auth_token','9ea7b169d84bf103382c6821f051664ac8491c88f261994eaecdec29df8241a3','[\"*\"]','2026-07-25 12:37:21',NULL,'2026-07-25 09:56:32','2026-07-25 12:37:21'),(34,'AppModelsUser',1,'auth_token','0df4596dd00b6af1f0a9900ee316d90a0720723f3feefac9764fb2bbd2b00eff','[\"*\"]','2026-07-26 04:10:54',NULL,'2026-07-26 04:10:51','2026-07-26 04:10:54'),(35,'AppModelsUser',2,'auth_token','1a488fd6b196f5377e4b7a1e3196f240b03212a9a28b4f92d15996c2728a831d','[\"*\"]','2026-07-26 06:09:11',NULL,'2026-07-26 04:23:15','2026-07-26 06:09:11'),(36,'AppModelsUser',1,'auth_token','47f99edf936aea99c1aac719565912f5ee0b9e5f6559bb6fae9521764b16a885','[\"*\"]','2026-07-26 06:25:23',NULL,'2026-07-26 04:26:41','2026-07-26 06:25:23'),(37,'AppModelsUser',2,'auth_token','6d429c07a060de26640c33a0d7e0057fcbdeb30708726d64b26b3a353cda761b','[\"*\"]','2026-07-26 06:11:42',NULL,'2026-07-26 06:10:12','2026-07-26 06:11:42'),(38,'AppModelsUser',2,'auth_token','6e9f24b174a3673c5305bb843ed4c0d02a2b364116803ae3bf5c8158d3ae4902','[\"*\"]','2026-07-26 06:19:53',NULL,'2026-07-26 06:18:49','2026-07-26 06:19:53'),(39,'AppModelsUser',2,'auth_token','f388056a5a743a3af65245f83be2ebe2932f45433607745df07ec787207c6174','[\"*\"]','2026-07-26 06:25:20',NULL,'2026-07-26 06:25:10','2026-07-26 06:25:20'),(40,'AppModelsUser',1,'auth_token','1060bebd6580ea1f4dc00acba7532dea601b666c90b40ea49d3b4911ded153f7','[\"*\"]','2026-07-26 07:41:30',NULL,'2026-07-26 06:30:56','2026-07-26 07:41:30'),(41,'AppModelsUser',1,'auth_token','b52bf1b83cad9149ee117fa0a5e86fe28a33ff124f15d4fc95d8010fd80e0ef3','[\"*\"]','2026-07-26 08:41:25',NULL,'2026-07-26 08:27:05','2026-07-26 08:41:25'),(42,'AppModelsUser',1,'auth_token','e72c86f639d7c593219cced4f9ccd3dd1dfc2d8d31081573aaf93063c3763aa6','[\"*\"]','2026-07-27 18:57:42',NULL,'2026-07-27 18:57:13','2026-07-27 18:57:42'),(43,'AppModelsUser',1,'auth_token','59e170708cc0e93d86a609e6f72f41bcc320a0ab04a77a80c8cc5ebecb8b2642','[\"*\"]','2026-07-27 19:05:37',NULL,'2026-07-27 19:04:09','2026-07-27 19:05:37'),(44,'AppModelsUser',2,'auth_token','86fec6740cab638d0abf0584fea8662ca27cb960fb3c64f43a128a7ab72d9b40','[\"*\"]','2026-07-29 07:18:46',NULL,'2026-07-29 05:55:38','2026-07-29 07:18:46'),(45,'AppModelsUser',2,'auth_token','eaec203e5afbeac7cb310c877397e9bb84bd7087bf7e3bab5d50d7ba88d4214b','[\"*\"]','2026-07-29 10:44:07',NULL,'2026-07-29 07:32:08','2026-07-29 10:44:07'),(46,'AppModelsUser',2,'auth_token','388e58153635571eaf821958eeb320b6288461bf4327a1d4c5ae711e2e341df5','[\"*\"]','2026-07-29 08:12:06',NULL,'2026-07-29 07:44:45','2026-07-29 08:12:06'),(47,'AppModelsUser',2,'auth_token','4248f61018db72d74819328267b2d63d3a2134e6e1e2e4c9eb09c43be345e87c','[\"*\"]','2026-07-29 11:07:19',NULL,'2026-07-29 08:12:10','2026-07-29 11:07:19'),(48,'AppModelsUser',1,'auth_token','13ba325337f2924582cb6399daba2abfb4a9d8134fa302de902066e5d386cf8e','[\"*\"]','2026-07-31 07:58:06',NULL,'2026-07-31 03:35:28','2026-07-31 07:58:06'),(49,'AppModelsUser',1,'auth_token','9407e426a0ba2ff81a249ca853a1c4c2f6f64e19884b4ed148d5acfee4a6cce4','[\"*\"]','2026-08-04 06:43:05',NULL,'2026-08-04 06:43:02','2026-08-04 06:43:05'),(50,'AppModelsUser',1,'auth_token','f3839d6453c288c5a44e3c6fe8539ffa6e16dea974f0c65520ccf5a2a9b50a08','[\"*\"]','2026-08-09 09:19:29',NULL,'2026-08-09 09:19:12','2026-08-09 09:19:29'),(51,'AppModelsUser',2,'auth_token','2c98b4620b01cd570782c48ccec3f8285a38e8a7664dbd10a961bca2d0cfde81','[\"*\"]','2026-08-09 09:50:33',NULL,'2026-08-09 09:19:44','2026-08-09 09:50:33'),(52,'AppModelsUser',2,'auth_token','1547af1fed345fdfb3920d721c2972bb54d705592d20a5fbc1dbb6ef381dda15','[\"*\"]','2026-08-09 09:54:09',NULL,'2026-08-09 09:53:56','2026-08-09 09:54:09'),(53,'AppModelsUser',2,'auth_token','cc47151a23fa22ee185a8ba425890fe93ea2816a43ddfe957629faed0749d849','[\"*\"]','2026-08-09 10:04:05',NULL,'2026-08-09 09:56:05','2026-08-09 10:04:05'),(54,'AppModelsUser',2,'auth_token','8e7b6cd448a8c705b88921007b5e68e72f7705b2045bbba8f60bcc14de512667','[\"*\"]','2026-08-09 10:31:39',NULL,'2026-08-09 10:04:26','2026-08-09 10:31:39'),(55,'AppModelsUser',2,'auth_token','d731273df898ff5a224e7e045eaca89139f684854d8be5d468d340fac1185b1a','[\"*\"]','2026-08-09 10:57:23',NULL,'2026-08-09 10:32:14','2026-08-09 10:57:23'),(56,'AppModelsUser',2,'auth_token','5a892c52b2d2bafe27b3c14a7fa676ed6de4ca3bb27a16427d224c9c2f367a18','[\"*\"]','2026-08-09 11:02:50',NULL,'2026-08-09 10:57:26','2026-08-09 11:02:50'),(57,'AppModelsUser',2,'auth_token','827b4f5276bf8f2df4dd7cd9e3c1dee310e66cc5ea71f699d62d0a9cdfd3fea5','[\"*\"]','2026-08-09 11:20:36',NULL,'2026-08-09 11:03:40','2026-08-09 11:20:36'),(58,'AppModelsUser',2,'auth_token','705981c0b0ef696ec8ff2b74c8df553d33e425c723b15bd0cba3d487b0f74796','[\"*\"]','2026-08-09 11:24:39',NULL,'2026-08-09 11:20:39','2026-08-09 11:24:39'),(59,'AppModelsUser',2,'auth_token','25c12f5de559142e7a60810b6d26d428cc8290db2b4801a83d3160ae999337c8','[\"*\"]','2026-08-09 11:25:40',NULL,'2026-08-09 11:24:42','2026-08-09 11:25:40'),(60,'AppModelsUser',2,'auth_token','e8c0d4e0b5c55c5588c090df2a0edef5459723439184c2c108e0ccb932b573cf','[\"*\"]','2026-08-09 11:48:41',NULL,'2026-08-09 11:25:43','2026-08-09 11:48:41'),(61,'AppModelsUser',2,'auth_token','970d5ba47413dd042d0867e43bece59cf6df573ce61f45ac9747068b6303a565','[\"*\"]','2026-08-09 11:53:49',NULL,'2026-08-09 11:48:47','2026-08-09 11:53:49'),(62,'AppModelsUser',2,'auth_token','ac7b50e01ad833bdac08b5e30a5900c6e1d9e21dfa853260c0cc5a478857d0fa','[\"*\"]','2026-08-09 13:48:12',NULL,'2026-08-09 11:54:01','2026-08-09 13:48:12'),(63,'AppModelsUser',2,'auth_token','85c8bf0e0b5bafee6f975341d83e27e210ac3a40772ae633f8086c1d69c4ff93','[\"*\"]','2026-08-09 14:20:38',NULL,'2026-08-09 13:48:16','2026-08-09 14:20:38'),(64,'AppModelsUser',2,'auth_token','9a4933e9ed5bad9cb8f2c2d6277e1208a96c80163047b4999a627a2c2bf8dd13','[\"*\"]','2026-08-09 15:13:58',NULL,'2026-08-09 14:20:46','2026-08-09 15:13:58'),(65,'AppModelsUser',2,'auth_token','840336ad151705d682c174608cc8387b9a1bf66e55cd7602e4ef398fca782a84','[\"*\"]','2026-08-09 15:55:18',NULL,'2026-08-09 15:20:47','2026-08-09 15:55:18'),(66,'AppModelsUser',2,'auth_token','cc35c8d9dc3af83580413613ceb272a1c68cc8fe4fa2d552a950d8d4e80343b6','[\"*\"]','2026-08-09 16:26:26',NULL,'2026-08-09 16:03:27','2026-08-09 16:26:26'),(67,'AppModelsUser',2,'auth_token','6f4719e8636313eb2d8bac8f0984fe21123bc4582eadfca090352d4d51766ae1','[\"*\"]','2026-08-09 16:30:39',NULL,'2026-08-09 16:28:19','2026-08-09 16:30:39'),(68,'AppModelsUser',1,'auth_token','fc180c047b3f02d8e354380894168d01e7f0245990c4d5f3bef36ea1dfdaa6d8','[\"*\"]','2026-08-09 16:34:29',NULL,'2026-08-09 16:34:07','2026-08-09 16:34:29'),(69,'AppModelsUser',1,'auth_token','e525a3efa963a4fc9a8fc0f014bafe8fa89d22cafa02327641308499a241a943','[\"*\"]','2026-08-09 16:37:34',NULL,'2026-08-09 16:37:16','2026-08-09 16:37:34'),(70,'AppModelsUser',2,'auth_token','0c696eba2fce4d60fc7a70f08513a897acb73b12e3b4f0a45759e44fe3ce6851','[\"*\"]','2026-08-09 16:38:20',NULL,'2026-08-09 16:37:37','2026-08-09 16:38:20'),(71,'AppModelsUser',1,'auth_token','e1843e937dfdfb46cdfd091480a9dca1b906e6c2627d2f322e7e4f674c09b522','[\"*\"]','2026-08-10 00:37:02',NULL,'2026-08-09 23:52:54','2026-08-10 00:37:02'),(72,'AppModelsUser',1,'auth_token','2705c57457c3680ea693880848e38df0cb24590256b58fa194df5a65943e12e0','[\"*\"]','2026-08-10 02:07:37',NULL,'2026-08-10 02:07:34','2026-08-10 02:07:37'),(73,'AppModelsUser',2,'auth_token','96870e8d1b317b0b22f4728a28dddeba78fd4a7af373b5b001a387e9b520dda5','[\"*\"]','2026-08-10 02:23:46',NULL,'2026-08-10 02:07:59','2026-08-10 02:23:46'),(74,'AppModelsUser',2,'auth_token','8d216030e468faf9bb4815836d4e77eaa80621271d22a968641c0ae9711bb5cf','[\"*\"]','2026-08-10 03:56:09',NULL,'2026-08-10 02:30:06','2026-08-10 03:56:09'),(75,'AppModelsUser',2,'auth_token','8985da1baead51afaf7496241a220c4c2eb70f7979687f77236e3b70ae279cea','[\"*\"]','2026-08-10 10:26:56',NULL,'2026-08-10 03:56:16','2026-08-10 10:26:56'),(76,'AppModelsUser',2,'auth_token','1f64dcdc8205cffed4bb63eb9f5c4fa09262bb2ca2e81cc0be074403f7dac289','[\"*\"]','2026-08-10 10:36:36',NULL,'2026-08-10 10:27:06','2026-08-10 10:36:36'),(77,'AppModelsUser',1,'auth_token','3291b9f40409cdb9da77dae5bc2ffefe58d73cea3ca061a1dda24949a55e38a9','[\"*\"]','2026-08-10 11:18:36',NULL,'2026-08-10 11:10:49','2026-08-10 11:18:36'),(78,'AppModelsUser',2,'auth_token','cb5067f26f8137a20e42f57ddda70dfca7083c8920f031d08bc28cb6a6a8682a','[\"*\"]',NULL,NULL,'2026-08-11 03:16:42','2026-08-11 03:16:42'),(79,'AppModelsUser',2,'auth_token','3ef8cf210c86ec9aa09423be4aa33eb482fb2b99ea36a4fd5ae343722da65624','[\"*\"]',NULL,NULL,'2026-08-11 04:12:52','2026-08-11 04:12:52'),(80,'AppModelsUser',1,'auth_token','4e54473b834ce9df0429eedddb837ee95cf6d5e11093d8fa5f692ccc591b7d42','[\"*\"]','2026-08-11 04:19:56',NULL,'2026-08-11 04:13:02','2026-08-11 04:19:56'),(81,'AppModelsUser',1,'auth_token','f7f546153344b44f3b8e336b362dc4982ea08dd813edaf89a2a8a55f2ba44004','[\"*\"]','2026-08-11 08:39:09',NULL,'2026-08-11 06:42:13','2026-08-11 08:39:09'),(82,'AppModelsUser',2,'auth_token','a992995c998f4634fcfb8cf7b4114d881d7e8463452700c7d1ed1604441c0c02','[\"*\"]',NULL,NULL,'2026-08-11 10:56:37','2026-08-11 10:56:37'),(83,'AppModelsUser',2,'auth_token','f23112f23904ef7227fcf6ddc3a8e0e73fb3886c8bc7940f18f60bf6089fc36c','[\"*\"]',NULL,NULL,'2026-08-11 22:43:37','2026-08-11 22:43:37'),(84,'AppModelsUser',1,'auth_token','98dbfa9dca7e3d3ab72e48758fa5668f8d9a0365928697630aa9af24c7bf7f1e','[\"*\"]','2026-08-12 00:44:36',NULL,'2026-08-11 23:07:29','2026-08-12 00:44:36'),(85,'AppModelsUser',2,'auth_token','5b3981930f22a0dc64e9f3e2cfe30812ad65b86d5c4118ad3f57c200d41eb9f6','[\"*\"]',NULL,NULL,'2026-08-11 23:49:09','2026-08-11 23:49:09'),(86,'AppModelsUser',2,'auth_token','a0bf05f8ad12411ad2bd4734dc633b9d480f806134e7ba55523caa7f6b400c13','[\"*\"]',NULL,NULL,'2026-08-11 23:50:05','2026-08-11 23:50:05'),(87,'AppModelsUser',2,'auth_token','f108e02ab5d9c9201f909af8e60260c29ced9a703368ef7a2770551788b08b5a','[\"*\"]',NULL,NULL,'2026-08-12 00:05:10','2026-08-12 00:05:10'),(88,'AppModelsUser',2,'auth_token','06c9ced9154269a08c60a9ef1b9ffdeb656c24bc3f79fb12c6c3ae02896b4ae6','[\"*\"]',NULL,NULL,'2026-08-12 00:36:55','2026-08-12 00:36:55'),(89,'AppModelsUser',2,'auth_token','5dbc3903379629ec5d91a5277e32337d2fa0cc87e9ceb113d926fa3ca81b5925','[\"*\"]',NULL,NULL,'2026-08-12 00:44:22','2026-08-12 00:44:22'),(90,'AppModelsUser',2,'auth_token','68755df869488c945b1cf857ed2f49e14cddf1cb8e87337053867571ba68285d','[\"*\"]','2026-08-12 05:54:18',NULL,'2026-08-12 00:51:53','2026-08-12 05:54:18'),(91,'AppModelsUser',1,'test','eec83d0fa2019ad124c93dc864dbe625744bd4a9b3bd2dd57c5c95f7d8e1b848','[\"*\"]','2026-08-12 06:00:28',NULL,'2026-08-12 06:00:13','2026-08-12 06:00:28'),(92,'AppModelsUser',2,'auth_token','3a6588e393d4993be0e38c9b7caf16317d5f625b24ca74f9eb34d7dd1e3e5148','[\"*\"]','2026-08-12 06:07:40',NULL,'2026-08-12 06:03:46','2026-08-12 06:07:40'),(93,'AppModelsUser',2,'auth_token','2fae71079011ee1692e822990531ef0708f1d0734648689e686bcf490e9eba9f','[\"*\"]','2026-08-12 06:14:37',NULL,'2026-08-12 06:13:30','2026-08-12 06:14:37'),(94,'AppModelsUser',1,'auth_token','6335c14db78652ee47604ffae39de3481a67bc6a72c7a49dc9542a3af22a809b','[\"*\"]','2026-08-12 06:20:38',NULL,'2026-08-12 06:20:28','2026-08-12 06:20:38'),(95,'AppModelsUser',2,'auth_token','b4edaaa4cf1082c1051e4afe92038be923f6275906079597e48120c4e88fd76d','[\"*\"]',NULL,NULL,'2026-08-12 06:23:56','2026-08-12 06:23:56'),(96,'AppModelsUser',2,'auth_token','1e65bdea08543d86d7b9fc35f6efb5ac5afbfe2e30249cc4c6818cc0e03bd77f','[\"*\"]','2026-08-12 06:56:47',NULL,'2026-08-12 06:37:36','2026-08-12 06:56:47'),(97,'AppModelsUser',2,'test','55fa6172c3c8e54072fec3206625926bed6a33106e5b1293b09ece6670c6cae6','[\"*\"]','2026-08-12 07:34:35',NULL,'2026-08-12 06:50:43','2026-08-12 07:34:35'),(98,'AppModelsUser',2,'auth_token','b02785b840254fd406c579e6c5504b675be8500d720d490c1577dd190bf71fd7','[\"*\"]','2026-08-12 06:58:07',NULL,'2026-08-12 06:57:12','2026-08-12 06:58:07'),(99,'AppModelsUser',2,'auth_token','9fbc2067fa5a6f6e916dbd030881a4b64af67cdd2260a4826b7695938f94d595','[\"*\"]','2026-08-12 07:02:07',NULL,'2026-08-12 06:58:13','2026-08-12 07:02:07'),(100,'AppModelsUser',2,'auth_token','ee2657597611c48aa6b6df7de5a51193347b960e1b1750a7b87b337c29721d1e','[\"*\"]','2026-08-12 07:13:51',NULL,'2026-08-12 07:06:31','2026-08-12 07:13:51'),(101,'AppModelsUser',2,'auth_token','5f9070f803897268142b023ce7eccf8f5534cecfc49263ea49eccd5533ec4154','[\"*\"]','2026-08-12 07:37:30',NULL,'2026-08-12 07:16:11','2026-08-12 07:37:30'),(102,'AppModelsUser',2,'auth_token','f323baf9a02ac9fa4bbb541f52a2f567266d3b1a0cd6de0510978c1a87a3e77f','[\"*\"]','2026-08-12 08:19:38',NULL,'2026-08-12 07:38:41','2026-08-12 08:19:38'),(103,'AppModelsUser',1,'auth_token','5e744012b332b820831f7923d1ef9a3b7d6c21b8fb0a90d9ca75a8aaf735f89f','[\"*\"]','2026-08-12 08:20:31',NULL,'2026-08-12 08:20:28','2026-08-12 08:20:31'),(104,'AppModelsUser',2,'auth_token','f0a50232d08f1f05b37d316a1235e6d1b7d2e8109b0209ca835a2d5f503f2ff0','[\"*\"]','2026-08-12 10:35:48',NULL,'2026-08-12 09:12:33','2026-08-12 10:35:48'),(105,'AppModelsUser',2,'auth_token','d236886978debc14d36a967b0a5d7179bc2eb5242c98dff362f1e8f0f593a385','[\"*\"]','2026-08-12 12:01:39',NULL,'2026-08-12 10:46:13','2026-08-12 12:01:39'),(106,'AppModelsUser',2,'auth_token','e4c1b019fd444f5a4414b2bc88acee5d0702dafb65ddfdc880d12c6a26987f71','[\"*\"]','2026-08-12 16:38:58',NULL,'2026-08-12 13:20:30','2026-08-12 16:38:58'),(107,'AppModelsUser',2,'auth_token','dd8c2ecf262cc327380eb2988f824597e3f8cb428c1597b4dc0cb5e2601022c3','[\"*\"]','2026-08-13 02:32:18',NULL,'2026-08-13 02:22:12','2026-08-13 02:32:18'),(108,'AppModelsUser',1,'auth_token','ff4ea99d4fb3e29a93b175f5be57cee2d6309375a4773f49753faa65d6240e72','[\"*\"]','2026-08-13 02:37:24',NULL,'2026-08-13 02:22:23','2026-08-13 02:37:24'),(109,'AppModelsUser',2,'auth_token','deda858d2448a4cc6207c2db2343dedc098e8b6a9f5225456ee0208df180e357','[\"*\"]','2026-08-13 04:46:34',NULL,'2026-08-13 02:36:38','2026-08-13 04:46:34'),(110,'AppModelsUser',2,'auth_token','b3d6388a760f06d0653318120f90d87618f8e4528023fb4ceec8ae7718ab136e','[\"*\"]','2026-08-13 04:52:04',NULL,'2026-08-13 04:46:38','2026-08-13 04:52:04'),(111,'AppModelsUser',2,'auth_token','ec0bc642c886d7bbbbdb406cf61732b0f29f5a6a6412b4f0083834f013751dbd','[\"*\"]','2026-08-13 08:03:48',NULL,'2026-08-13 07:29:06','2026-08-13 08:03:48'),(112,'AppModelsUser',2,'auth_token','3f189b2eab4a60a8a4efb6bb28263944f4d6f4171d291248871f28fa12d186e6','[\"*\"]','2026-08-13 08:48:45',NULL,'2026-08-13 08:06:46','2026-08-13 08:48:45'),(113,'AppModelsUser',2,'auth_token','41ad7bfa53b3c617edde9c70b0235c54a82a5475764f4f572056493c365d4d0f','[\"*\"]','2026-08-13 08:33:58',NULL,'2026-08-13 08:09:35','2026-08-13 08:33:58'),(114,'AppModelsUser',2,'auth_token','2dea91b502980646be912f1d299e467e6880de8a2abd88de5be41fd43b394830','[\"*\"]','2026-08-13 08:44:10',NULL,'2026-08-13 08:35:18','2026-08-13 08:44:10'),(115,'AppModelsUser',2,'auth_token','6b5e997da45fd8ecebc8dc60fae07eedfde4332c302f39bea5706414e1f37476','[\"*\"]','2026-08-13 09:56:12',NULL,'2026-08-13 09:27:11','2026-08-13 09:56:12'),(116,'AppModelsUser',2,'auth_token','6ecc80e9dbc5cebf850e05385d0fb6bc33dbc43d0d90703c0805befda5e9d7c6','[\"*\"]','2026-08-13 09:46:15',NULL,'2026-08-13 09:39:13','2026-08-13 09:46:15'),(117,'AppModelsUser',2,'auth_token','c57ccb74e408178f0618e52caa0d926b7d4936591da512c959e08baa4e50c379','[\"*\"]','2026-08-13 13:07:58',NULL,'2026-08-13 10:15:40','2026-08-13 13:07:58'),(119,'App\\Models\\User',2,'auth_token','10695b88f17aa6fea774fd9d44558dcee020d750aae5b058694bbdc49e65c5d9','[\"*\"]','2026-08-13 16:46:50',NULL,'2026-08-13 15:54:43','2026-08-13 16:46:50'),(120,'App\\Models\\User',1,'auth_token','ca99102d60ca3b9d67b4e4429fd13ea68897b7afd3e2a6e9f6cfb4b3565993d5','[\"*\"]','2026-08-13 16:45:29',NULL,'2026-08-13 15:55:01','2026-08-13 16:45:29'),(121,'App\\Models\\User',1,'test','5a9176a54373e4e405012731430d83ca439e724c00a1fe2f4197518f2aa9e5df','[\"*\"]','2026-08-13 16:32:58',NULL,'2026-08-13 16:30:35','2026-08-13 16:32:58'),(122,'App\\Models\\User',2,'auth_token','0b67acd02cea78e41bcea730797a7e6fc6ae4a201b2e29bdbf01e7abfc00e5e2','[\"*\"]','2026-08-14 04:03:54',NULL,'2026-08-14 03:28:47','2026-08-14 04:03:54'),(123,'App\\Models\\User',1,'auth_token','805dc10b0f54505dd5b948230882ee2d81016e99e58dbbab9f64428cae4d42e8','[\"*\"]','2026-08-14 03:45:51',NULL,'2026-08-14 03:43:12','2026-08-14 03:45:51'),(124,'App\\Models\\User',1,'auth_token','c73e5ca3e7663706d0bb3c17398ab8fce15c8801c0065f87057fdf847ac416b9','[\"*\"]',NULL,NULL,'2026-08-14 03:46:24','2026-08-14 03:46:24');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `categoria_id` int DEFAULT NULL,
  `empresa_id` int DEFAULT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `precio_compra` decimal(10,2) DEFAULT NULL,
  `precio_venta` decimal(10,2) DEFAULT NULL,
  `stock_inicial` int DEFAULT NULL,
  `unidad_medida` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `inactive_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `imagen_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `productos_categoria_id_index` (`categoria_id`),
  KEY `productos_empresa_id_index` (`empresa_id`),
  CONSTRAINT `productos_categoria_id_foreign` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  CONSTRAINT `productos_empresa_id_foreign` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedores`
--

DROP TABLE IF EXISTS `proveedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int DEFAULT NULL,
  `razon_social` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nit` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contacto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `documentos_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `inactive_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `calificacion` int DEFAULT '0',
  `comentarios_evaluacion` text COLLATE utf8mb4_unicode_ci,
  `estado_evaluacion` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'No Evaluado',
  PRIMARY KEY (`id`),
  UNIQUE KEY `proveedores_nit_unique` (`nit`),
  KEY `proveedores_empresa_id_index` (`empresa_id`),
  CONSTRAINT `proveedores_empresa_id_foreign` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedores`
--

LOCK TABLES `proveedores` WRITE;
/*!40000 ALTER TABLE `proveedores` DISABLE KEYS */;
/*!40000 ALTER TABLE `proveedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recepciones`
--

DROP TABLE IF EXISTS `recepciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recepciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orden_compra_id` int DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `tipo_recepcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_hora` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `recepciones_orden_compra_id_index` (`orden_compra_id`),
  KEY `recepciones_usuario_id_index` (`usuario_id`),
  CONSTRAINT `recepciones_orden_compra_id_foreign` FOREIGN KEY (`orden_compra_id`) REFERENCES `ordenes_compra` (`id`),
  CONSTRAINT `recepciones_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recepciones`
--

LOCK TABLES `recepciones` WRITE;
/*!40000 ALTER TABLE `recepciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `recepciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recepciones_detalle`
--

DROP TABLE IF EXISTS `recepciones_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recepciones_detalle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recepcion_id` int DEFAULT NULL,
  `producto_id` int DEFAULT NULL,
  `cantidad_recibida` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `recepciones_detalle_producto_id_index` (`producto_id`),
  KEY `recepciones_detalle_recepcion_id_index` (`recepcion_id`),
  CONSTRAINT `recepciones_detalle_producto_id_foreign` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `recepciones_detalle_recepcion_id_foreign` FOREIGN KEY (`recepcion_id`) REFERENCES `recepciones` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recepciones_detalle`
--

LOCK TABLES `recepciones_detalle` WRITE;
/*!40000 ALTER TABLE `recepciones_detalle` DISABLE KEYS */;
/*!40000 ALTER TABLE `recepciones_detalle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recordatorios`
--

DROP TABLE IF EXISTS `recordatorios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recordatorios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `completado` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `recordatorios_usuario_id_index` (`usuario_id`),
  CONSTRAINT `recordatorios_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recordatorios`
--

LOCK TABLES `recordatorios` WRITE;
/*!40000 ALTER TABLE `recordatorios` DISABLE KEYS */;
/*!40000 ALTER TABLE `recordatorios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reuniones`
--

DROP TABLE IF EXISTS `reuniones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reuniones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int NOT NULL,
  `organizador_id` int NOT NULL,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `fecha_hora` timestamp NOT NULL,
  `tipo_encuentro` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'virtual',
  `audiencia` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enlace_lugar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reuniones_organizador_id_foreign` (`organizador_id`),
  KEY `reuniones_empresa_id_foreign` (`empresa_id`),
  CONSTRAINT `reuniones_empresa_id_foreign` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`),
  CONSTRAINT `reuniones_organizador_id_foreign` FOREIGN KEY (`organizador_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reuniones`
--

LOCK TABLES `reuniones` WRITE;
/*!40000 ALTER TABLE `reuniones` DISABLE KEYS */;
/*!40000 ALTER TABLE `reuniones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int DEFAULT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) DEFAULT '1',
  `inactive_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `es_base` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `roles_empresa_id_index` (`empresa_id`),
  CONSTRAINT `roles_empresa_id_foreign` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,1,'Gerente General','Administrador principal de la empresa (Gerencia)',1,NULL,'2026-07-24 01:55:21','2026-07-24 01:55:21',0),(2,NULL,'Jefe de Área',NULL,1,NULL,'2026-07-25 01:05:19','2026-07-25 01:05:19',0),(3,1,'Jefe de Caja y Pre-facturación','Rol base para administrar Caja y Pre-facturación',1,NULL,'2026-07-29 07:24:48','2026-07-29 07:24:48',1),(4,1,'Jefe de Control de Horas Extras y Ausencias','',1,NULL,'2026-07-29 07:28:12','2026-07-29 07:28:12',1),(5,1,'Jefe de Horarios y Turnos','',1,NULL,'2026-07-29 07:28:12','2026-07-29 07:28:12',1),(6,1,'Jefe de Gestión de Vacaciones','',1,NULL,'2026-07-29 07:28:13','2026-07-29 07:28:13',1),(7,1,'Jefe de Agenda y Calendario','',1,NULL,'2026-07-29 07:28:14','2026-07-29 07:28:14',1),(8,1,'Jefe de Catálogo de Servicios','',1,NULL,'2026-07-29 07:28:14','2026-07-29 07:28:14',1),(9,1,'Jefe de CRM (Gestión de Clientes)','',1,NULL,'2026-07-29 07:28:15','2026-07-29 07:28:15',1),(10,1,'Jefe de Gestión de Operarios','',1,NULL,'2026-07-29 07:28:15','2026-07-29 07:28:15',1),(11,1,'Jefe de Reportes de Servicios','',1,NULL,'2026-07-29 07:28:16','2026-07-29 07:28:16',1),(12,1,'Jefe de Clientes','',1,NULL,'2026-07-29 07:28:16','2026-07-29 07:28:16',1),(13,1,'Jefe de Inventario','',1,NULL,'2026-07-29 07:28:17','2026-07-29 07:28:17',1),(14,1,'Jefe de Ventas','',1,NULL,'2026-07-29 07:28:18','2026-07-29 07:28:18',1),(15,1,'Jefe de Proveedores','',1,NULL,'2026-07-29 07:28:18','2026-07-29 07:28:18',1),(16,1,'Jefe de Compras','',1,NULL,'2026-07-29 07:28:19','2026-07-29 07:28:19',1),(17,1,'Jefe de Conector Contable','',1,NULL,'2026-08-11 23:50:42','2026-08-11 23:50:42',1),(18,1,'Jefe de Soporte Técnico','',1,NULL,'2026-08-11 23:50:44','2026-08-11 23:50:44',1);
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sedes`
--

DROP TABLE IF EXISTS `sedes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sedes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activa',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sedes_empresa_id_foreign` (`empresa_id`),
  CONSTRAINT `sedes_empresa_id_foreign` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sedes`
--

LOCK TABLES `sedes` WRITE;
/*!40000 ALTER TABLE `sedes` DISABLE KEYS */;
/*!40000 ALTER TABLE `sedes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicios`
--

DROP TABLE IF EXISTS `servicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `categoria_id` int DEFAULT NULL,
  `empresa_id` int DEFAULT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `tarifa` decimal(10,2) DEFAULT NULL,
  `tiempo_estimado` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `inactive_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `servicios_categoria_id_index` (`categoria_id`),
  KEY `servicios_empresa_id_index` (`empresa_id`),
  CONSTRAINT `servicios_categoria_id_foreign` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  CONSTRAINT `servicios_empresa_id_foreign` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicios`
--

LOCK TABLES `servicios` WRITE;
/*!40000 ALTER TABLE `servicios` DISABLE KEYS */;
/*!40000 ALTER TABLE `servicios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicios_materiales`
--

DROP TABLE IF EXISTS `servicios_materiales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicios_materiales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `servicios_materiales_ticket_id_foreign` (`ticket_id`),
  KEY `servicios_materiales_producto_id_foreign` (`producto_id`),
  CONSTRAINT `servicios_materiales_producto_id_foreign` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `servicios_materiales_ticket_id_foreign` FOREIGN KEY (`ticket_id`) REFERENCES `servicios_tickets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicios_materiales`
--

LOCK TABLES `servicios_materiales` WRITE;
/*!40000 ALTER TABLE `servicios_materiales` DISABLE KEYS */;
/*!40000 ALTER TABLE `servicios_materiales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicios_tickets`
--

DROP TABLE IF EXISTS `servicios_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicios_tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int NOT NULL,
  `consecutivo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cliente_nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `servicio_requerido` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_solicitada` date DEFAULT NULL,
  `hora_sugerida` time DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pendiente',
  `tecnico_id` int DEFAULT NULL,
  `notas_ejecucion` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `servicios_tickets_tecnico_id_foreign` (`tecnico_id`),
  KEY `servicios_tickets_empresa_id_foreign` (`empresa_id`),
  CONSTRAINT `servicios_tickets_empresa_id_foreign` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`) ON DELETE CASCADE,
  CONSTRAINT `servicios_tickets_tecnico_id_foreign` FOREIGN KEY (`tecnico_id`) REFERENCES `empleados` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicios_tickets`
--

LOCK TABLES `servicios_tickets` WRITE;
/*!40000 ALTER TABLE `servicios_tickets` DISABLE KEYS */;
/*!40000 ALTER TABLE `servicios_tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int DEFAULT NULL,
  `ip_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_last_activity_index` (`last_activity`),
  KEY `sessions_user_id_index` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('0TyVDA3loLgbDo96SMs8z7Zp06soLskweamg9JCK',NULL,'::1','Go-http-client/1.1','YToyOntzOjY6Il90b2tlbiI7czo0MDoiSzg1czNLRHdScERTd3hKeFJzdjNDR1VtRU5jNElZNHhHOXp5cFc3bCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1784960958),('1X7T4KLbj3v87e7KN6SLtBOkp665OdZ6EYxaVpdv',NULL,'::1','Go-http-client/1.1','YToyOntzOjY6Il90b2tlbiI7czo0MDoid254UjJ4ekVDZG9BVjh0c25uaHdMdkx5Q04zV3ZYWklaUzhOVndyayI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1784848697),('5zmtwVei9ejQEJxHYEwDmTDmoEVqjVtKT4IAy8Ho',NULL,'::1','Go-http-client/2.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiNU14bENCVHBhUUxNZ05ZR0R0czlLbUJ0WUVzVHZCZVFOcWdKMkNpeCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzI6Imh0dHA6Ly9nZXN0aXZhLXB5bWUub25yZW5kZXIuY29tIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1784835589),('61NcKIDaLrbfbhjVJDcZtJRP7nyHLx9Z7np1vDqO',NULL,'::1','Go-http-client/1.1','YToyOntzOjY6Il90b2tlbiI7czo0MDoiRTZMRTdkV29QMjlQaHVsZ1JjYzRTZEhHeHg4OGo3OWZyYWg5aUVmOSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1785305456),('6BGbwAtZ3L4lDJzqLPwRyDlUERYYDycTtmODzrtJ',NULL,'::1','Go-http-client/2.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiMlNPbmlTcTM0N2prS0tjNUdJMkt6MXcxTVdXNk5wVG1PT3lDbkh4TSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzI6Imh0dHA6Ly9nZXN0aXZhLXB5bWUub25yZW5kZXIuY29tIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1784929914),('6VUWpjrOfQsNc7k4CULSe3RslTsV6N2MuE1XkBXf',NULL,'::1','Go-http-client/1.1','YToyOntzOjY6Il90b2tlbiI7czo0MDoiYXpNOG9xVlh5ZzFNdmZ2QlZ6d2ZySzBZNlE0S2RReEtYc0FPZFgzdiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1784966699),('B4Gbg5kItebVE6bvjxcxuprZh6M78BFSh4AhvknU',NULL,'::1','Go-http-client/2.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoieEx1TkVxYlFZT1paY2Y0T214ZURIanVBT3NJNnQxSzNoVjF2QVZ4WiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzI6Imh0dHA6Ly9nZXN0aXZhLXB5bWUub25yZW5kZXIuY29tIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1784949632),('BK8eyxhyZtCvNs3mhuP3zDj8H9r7klGgjoCtvSqu',NULL,'::1','Go-http-client/1.1','YToyOntzOjY6Il90b2tlbiI7czo0MDoiVk4zTjh2V042dzhxZnVLSGdDY3V0aGxJZTRYdDdVRUJMR1NYRk83MiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1786592157),('CdJUy7SMo3qySHsOTTHPpgqEFfCGGK2unqL0zaW6',NULL,'::1','Go-http-client/2.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiN3FxRG40QXdMS1Niazc2NE1lT0d3TU5Mdnl0U0xwUWM0N21WMVVkZSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzI6Imh0dHA6Ly9nZXN0aXZhLXB5bWUub25yZW5kZXIuY29tIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1784928058),('cDOIDiKJ0zFhZ0cyQ0a8E4uCdzNe4agoluY1707l',NULL,'::1','Go-http-client/2.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiY2l3Z1B4ZE5oYXNuelBTeWFwN0lhR1B5WGdvYmtpcTBUazg1NmxxNCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzI6Imh0dHA6Ly9nZXN0aXZhLXB5bWUub25yZW5kZXIuY29tIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1784960958),('Gs19iF23x1oj3fEvuljlVC6dXGMtj5q7YqsmX2vR',NULL,'::1','Go-http-client/2.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiOGJDd2JLckZ1ZTZtdWdUeGVVUzM4VGhGeEVJTDNQWU04OE9aSm54cyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzI6Imh0dHA6Ly9nZXN0aXZhLXB5bWUub25yZW5kZXIuY29tIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1786592161),('Hr9grxOmZfbJRIPnRoT0UIaoveemQuTEjrdCUQdH',NULL,'::1','Go-http-client/2.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiUGVENDBWbEtFZ25aRlhQVTZveWF4M2d1R1VIejN1RDFXbm1Edlc3ZyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzI6Imh0dHA6Ly9nZXN0aXZhLXB5bWUub25yZW5kZXIuY29tIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1785300415),('I0d0QSXmi0QBZeRqxtnhoQdVfZZCOSXhg33WeJms',NULL,'::1','Go-http-client/1.1','YToyOntzOjY6Il90b2tlbiI7czo0MDoiN3dScGZ0VXRocm9hRmVSM0xFM2JmWDhrWjNSMDFmQ212Sk9wUGZObyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1784929914),('izI76ElpN4zROrDpoDylxVW5cm8Rp5haICZvCn2H',NULL,'::1','Go-http-client/2.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiNlpyYUlET2hwVExRSkhsT2FqNXVCRE5LMmtDRDBSNUZYbFk4YjV5YiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzI6Imh0dHA6Ly9nZXN0aXZhLXB5bWUub25yZW5kZXIuY29tIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1784905657),('JFHDsXD5iJfP94HyLl8M6KbTYJVivlk1w1YbiP1A',NULL,'::1','Go-http-client/1.1','YToyOntzOjY6Il90b2tlbiI7czo0MDoiR3R2RXhTWFZjVjgwcVVaMWs1MVJwYjU3QXM3U0VFdnBFYzl2aUlIdSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1784836060),('JFibG5s4DBZam8zAET0TFxle2DxQgzMUWDIgsq1q',NULL,'::1','Go-http-client/2.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiSTc0Rkp5UGx1V2hQSURpS1VpU3dlMHNBWW05QmZrVFJnOXhHYUR2VyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzI6Imh0dHA6Ly9nZXN0aXZhLXB5bWUub25yZW5kZXIuY29tIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1784848697),('JtMdgFZRhJIBpR0WcFykXTNb3jwR7ybeEX2UCdTY',NULL,'::1','Go-http-client/2.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoid2tXWnV5NnMwdHNPRUR1RVVraURvbkc0SUNpMzE2T0lCRG55azJmaCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzI6Imh0dHA6Ly9nZXN0aXZhLXB5bWUub25yZW5kZXIuY29tIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1785305456),('KGznpb7LDFwCofon1NlvgnVhSSGjwemTF5RkFuwc',NULL,'::1','Go-http-client/1.1','YToyOntzOjY6Il90b2tlbiI7czo0MDoiNzhwZ0Q4UktubUt1TTIxdFA2d25XanlKVnl2T2JJUlcwa0JDbURHNiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1786498439),('KttITYcV9ZLiv9Y1BLHG7j7DKSQPHFuR2G85Ne8v',NULL,'::1','Go-http-client/1.1','YToyOntzOjY6Il90b2tlbiI7czo0MDoiNFBBRHlnUmJoUlRTTHl1UVhXS3M4VHdwY0I5YlhjMjVQblh3ZUdxYyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1784928058),('lnuH7DTaBoOLb5eWgmFIMgw8ol4S9JgHrHIYAgmP',NULL,'::1','Go-http-client/2.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiVEVSdU1EaXBjVG1kT3ROd0hsUmQycXcwcXllNWRnQ1V1NG10QnRvTiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzI6Imh0dHA6Ly9nZXN0aXZhLXB5bWUub25yZW5kZXIuY29tIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1785290907),('M77vdz54V4ebakCV7fAKnil8re8MJtWrpMFrQ00s',NULL,'::1','Go-http-client/1.1','YToyOntzOjY6Il90b2tlbiI7czo0MDoiWWdLM1VLWDVEQTlvZlZ0NUR3VXJ5bFVyRXY3Q1prdm1PdE1haldqeiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1785300416),('P3e3WyabGbcKT5Ens6IdziRsbBXiPCkJhjmUwozr',NULL,'::1','Go-http-client/2.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiU2dNYlNydmNXYVl4QlluNlZRN3EyWjJWcjdNWldueFl3c0c3cGdHdyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzI6Imh0dHA6Ly9nZXN0aXZhLXB5bWUub25yZW5kZXIuY29tIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1784939850),('pyyhyuhZsLbcP7240ihyYlQlTkw4goNHn8S29gdL',NULL,'::1','Go-http-client/2.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiTDlMbUI1OW82SkZzZnhtMzlxdzl5R3ZQNjNLaElNVnBQY0d5Y0JGdSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzI6Imh0dHA6Ly9nZXN0aXZhLXB5bWUub25yZW5kZXIuY29tIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1784836060),('q3l1pxpGznDUqmLQYhkQjGqr4ptmuNuiVHKVCyOY',NULL,'::1','Go-http-client/1.1','YToyOntzOjY6Il90b2tlbiI7czo0MDoiOWN5dDBSMDhuUWZkR0c0bjZLcUs4U3F0dXIzMGpFVEF0aWFDMURNYyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1785290903),('rOlWRnOHcz0qSRfEdpqBEoOOhKjz6ElZ2To4y4wg',NULL,'::1','Go-http-client/1.1','YToyOntzOjY6Il90b2tlbiI7czo0MDoiWHZWYzVKQUJpU2RCYk83V3ExTGRId0pNR1Y0UXZnYU1hMnhqVDRzVyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1784939850),('RrIf4Rmm7CljuldKdeBNAYMk0LkI2uiWUm6hrG6h',NULL,'::1','Go-http-client/2.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiUXdsM0RBNFB0VzZCVVRzY28wOHE0VktwaU5GZW5PWFY0bEowZDc2QyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzI6Imh0dHA6Ly9nZXN0aXZhLXB5bWUub25yZW5kZXIuY29tIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1784966707),('RyvU5DGJDV75DgRzqn4LJXn7GeV5CIt668aNrPs9',NULL,'::1','Go-http-client/1.1','YToyOntzOjY6Il90b2tlbiI7czo0MDoiNFZCYXc5UlM4anJZWUp1ZGFSRmhrYVR6MkJ2bUZZTGNNUG9ZWUxrTCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1786578834),('SBcYj8GhQtZn6T1VlKCYJR08L5mE1OVp7X90QSVr',NULL,'::1','Go-http-client/1.1','YToyOntzOjY6Il90b2tlbiI7czo0MDoiVWtFWmFXaWx4NlU4dDBLb0phTnpJaTlwUzM2aFRIeTF4TmZJWVVOdCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1784949632),('T5CmH73gGAECxtJvrc1q5RU9WUAAJmJ4x4WEcNsL',NULL,'::1','Go-http-client/1.1','YToyOntzOjY6Il90b2tlbiI7czo0MDoiVnpmamN0alpZNkpXNXczdGxMc0NNYUpmZTN1ZDNoS3BvdUxzNlpYUiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1784835589),('UEUoNdobzUbuvBCdhR841VO49IODvKnjTEY88kIN',NULL,'::1','Go-http-client/2.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoid2JLQWI4VnRnRk83cWZsNUNiaGxtYTNYWmNqaHB0YzgzU3lncjJQMSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzI6Imh0dHA6Ly9nZXN0aXZhLXB5bWUub25yZW5kZXIuY29tIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1786498439),('Wk1ke347jOJFKJVzHxY4DVYKHS4LF56TKKeyV71B',NULL,'::1','Go-http-client/2.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoid0Q2d3Y0ajNaZHRYdUIyN1lFeHY1eFJ4T3NNalMyamNEQmJsV2o0OCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzI6Imh0dHA6Ly9nZXN0aXZhLXB5bWUub25yZW5kZXIuY29tIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1786578841),('wv36tgclMwKMR6Hjlhzzlj7nz6xcZhMiJ8fVAkQ9',NULL,'::1','Go-http-client/2.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoidDc5d1NhS3E1V0k5YXYzTXNYUFYyZjJDTVJQM2dVNE1yZjE3eVZwMyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzI6Imh0dHA6Ly9nZXN0aXZhLXB5bWUub25yZW5kZXIuY29tIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1784836563),('yP3F7k9MxEDwT2NnIerJqmwJ6wdFbORfxIgUvm3k',NULL,'::1','Go-http-client/1.1','YToyOntzOjY6Il90b2tlbiI7czo0MDoieklzdlVtT3c2QkpJUzJvTVNaU1NaQXcxRzVQaWw4YnRCMm8wNkNJTSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1784905657),('yQDjD6R8QAfwr1hcQCEP6fqnalMLRDsYEZ2m2dBi',NULL,'::1','Go-http-client/1.1','YToyOntzOjY6Il90b2tlbiI7czo0MDoid2RLUWdDbXVqWFMwaXI2UEpxQ204cU1VUzNPSjlJQUZLRDhQNTZEYSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1784836561);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `soporte_tickets`
--

DROP TABLE IF EXISTS `soporte_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `soporte_tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `asunto` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensaje` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Abierto',
  `tecnico_id` int DEFAULT NULL,
  `notas_resolucion` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `soporte_tickets_empresa_id_foreign` (`empresa_id`),
  KEY `soporte_tickets_usuario_id_foreign` (`usuario_id`),
  KEY `soporte_tickets_tecnico_id_foreign` (`tecnico_id`),
  CONSTRAINT `soporte_tickets_empresa_id_foreign` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`),
  CONSTRAINT `soporte_tickets_tecnico_id_foreign` FOREIGN KEY (`tecnico_id`) REFERENCES `users` (`id`),
  CONSTRAINT `soporte_tickets_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `soporte_tickets`
--

LOCK TABLES `soporte_tickets` WRITE;
/*!40000 ALTER TABLE `soporte_tickets` DISABLE KEYS */;
/*!40000 ALTER TABLE `soporte_tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tareas`
--

DROP TABLE IF EXISTS `tareas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tareas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `asignador_id` int NOT NULL,
  `asignado_id` int NOT NULL,
  `estado` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'notificada',
  `empresa_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tareas_empresa_id_foreign` (`empresa_id`),
  KEY `tareas_asignador_id_foreign` (`asignador_id`),
  KEY `tareas_asignado_id_foreign` (`asignado_id`),
  CONSTRAINT `tareas_asignado_id_foreign` FOREIGN KEY (`asignado_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tareas_asignador_id_foreign` FOREIGN KEY (`asignador_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tareas_empresa_id_foreign` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tareas`
--

LOCK TABLES `tareas` WRITE;
/*!40000 ALTER TABLE `tareas` DISABLE KEYS */;
/*!40000 ALTER TABLE `tareas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tarifas`
--

DROP TABLE IF EXISTS `tarifas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tarifas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan_mensual` decimal(10,2) NOT NULL DEFAULT '70000.00',
  `modulo_extra` decimal(10,2) NOT NULL DEFAULT '15000.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `addon_extra` decimal(10,2) DEFAULT '10000.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tarifas`
--

LOCK TABLES `tarifas` WRITE;
/*!40000 ALTER TABLE `tarifas` DISABLE KEYS */;
INSERT INTO `tarifas` VALUES (1,70000.00,20000.00,'2026-07-23 00:36:38','2026-07-23 00:36:38',10000.00);
/*!40000 ALTER TABLE `tarifas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `turnos`
--

DROP TABLE IF EXISTS `turnos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `turnos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre_turno` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hora_entrada` time DEFAULT NULL,
  `hora_salida` time DEFAULT NULL,
  `dias_semana` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `inactive_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `turnos`
--

LOCK TABLES `turnos` WRITE;
/*!40000 ALTER TABLE `turnos` DISABLE KEYS */;
/*!40000 ALTER TABLE `turnos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int DEFAULT NULL,
  `rol_id` int DEFAULT NULL,
  `documento` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `debe_cambiar_clave` tinyint(1) NOT NULL DEFAULT '1',
  `telegram_chat_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `inactive_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_activity_at` timestamp NULL DEFAULT NULL,
  `telefono` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `perfil_formalizado` tinyint(1) NOT NULL DEFAULT '0',
  `email_personal` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primer_nombre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `segundo_nombre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primer_apellido` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `segundo_apellido` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_documento` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuarios_email_unique` (`email`),
  UNIQUE KEY `usuarios_documento_unique` (`documento`),
  UNIQUE KEY `usuarios_telegram_chat_id_unique` (`telegram_chat_id`),
  KEY `usuarios_empresa_id_index` (`empresa_id`),
  KEY `usuarios_rol_id_index` (`rol_id`),
  CONSTRAINT `usuarios_empresa_id_foreign` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`),
  CONSTRAINT `usuarios_rol_id_foreign` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,NULL,NULL,'0','gestivapyme@gmail.com','https://res.cloudinary.com/scflfwxx/image/upload/v1784753313/avatars/bnveej1tk0eyrky4nbk9.jpg','$2y$12$4Q0Q5vUNZJQqT1rN/UqcVerfm2MUbuvLV3hqQ4d4/HLRSm9nHiOjC',0,NULL,1,NULL,'2026-07-22 21:23:44','2026-07-23 01:49:00','2026-07-24 07:30:38',NULL,NULL,0,NULL,'ADMINISTRADOR',NULL,NULL,NULL,NULL),(2,1,1,'900123456-7','gerencia@techventaysoluciones.gestivapyme.com',NULL,'$2y$12$HJUh.4FJukk0LlJiIK4rVuaoMzX3kJoQoXNlJ7ctsYIlpWlgGqree',0,NULL,1,NULL,'2026-07-24 01:55:21','2026-07-24 01:55:21','2026-07-24 19:12:41',NULL,NULL,0,NULL,'Humberto','Rodrigo','Sanchez','Sanches',NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vacaciones`
--

DROP TABLE IF EXISTS `vacaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vacaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `tipo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Disfrute Legal',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `estado` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente',
  `justificacion_respuesta` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `vacaciones_usuario_id_index` (`usuario_id`),
  CONSTRAINT `vacaciones_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vacaciones`
--

LOCK TABLES `vacaciones` WRITE;
/*!40000 ALTER TABLE `vacaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `vacaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ventas`
--

DROP TABLE IF EXISTS `ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ventas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int NOT NULL,
  `factura_consecutivo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cliente_id` int DEFAULT NULL,
  `subtotal` decimal(15,2) NOT NULL,
  `impuestos` decimal(15,2) NOT NULL,
  `descuentos` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total` decimal(15,2) NOT NULL,
  `metodo_pago` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pagada',
  `vendedor_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `estado_paquete` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Preparando',
  PRIMARY KEY (`id`),
  KEY `ventas_cliente_id_foreign` (`cliente_id`),
  KEY `ventas_vendedor_id_foreign` (`vendedor_id`),
  KEY `ventas_empresa_id_foreign` (`empresa_id`),
  CONSTRAINT `ventas_cliente_id_foreign` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `ventas_empresa_id_foreign` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ventas_vendedor_id_foreign` FOREIGN KEY (`vendedor_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventas`
--

LOCK TABLES `ventas` WRITE;
/*!40000 ALTER TABLE `ventas` DISABLE KEYS */;
/*!40000 ALTER TABLE `ventas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ventas_detalles`
--

DROP TABLE IF EXISTS `ventas_detalles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ventas_detalles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `venta_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `precio_unitario` decimal(15,2) NOT NULL,
  `subtotal` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ventas_detalles_venta_id_foreign` (`venta_id`),
  KEY `ventas_detalles_producto_id_foreign` (`producto_id`),
  CONSTRAINT `ventas_detalles_producto_id_foreign` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ventas_detalles_venta_id_foreign` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventas_detalles`
--

LOCK TABLES `ventas_detalles` WRITE;
/*!40000 ALTER TABLE `ventas_detalles` DISABLE KEYS */;
/*!40000 ALTER TABLE `ventas_detalles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'gestivapyme'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-14  4:39:40
