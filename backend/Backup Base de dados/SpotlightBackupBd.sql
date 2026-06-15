-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 172.22.0.201    Database: Grupo14
-- ------------------------------------------------------
-- Server version	5.5.5-10.5.26-MariaDB-0+deb11u2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Artista`
--

DROP TABLE IF EXISTS `Artista`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Artista` (
  `numero_licenca` varchar(255) NOT NULL,
  `validade_licenca` datetime NOT NULL,
  `id_artista` int(11) NOT NULL AUTO_INCREMENT,
  `categoria_id` int(11) NOT NULL,
  PRIMARY KEY (`id_artista`),
  UNIQUE KEY `numero_licenca` (`numero_licenca`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `Artista_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `Categoria` (`categoria_id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Artista`
--

LOCK TABLES `Artista` WRITE;
/*!40000 ALTER TABLE `Artista` DISABLE KEYS */;
INSERT INTO `Artista` VALUES ('LIC_1780504515248','2030-12-31 00:00:00',21,1),('LIC_1780504630361','2030-12-31 00:00:00',22,1),('LIC_1780504940328','2030-12-31 00:00:00',23,1),('LIC-1234321313','2027-12-31 00:00:00',24,2),('LIC-1234321312','2027-12-31 00:00:00',26,2),('LIC-1234321311','2027-12-31 00:00:00',28,2),('LIC-123333333','2032-01-01 00:00:00',31,3),('LIC-1234323313','2027-12-31 00:00:00',33,1),('LIC-12','2026-06-10 00:00:00',36,1),('LIC-1223','2029-06-05 00:00:00',37,3),('LIC-55555','2030-09-15 00:00:00',38,5),('LIC-1781189563284','2031-12-31 00:00:00',39,1),('LIC-1781189839203','2031-12-31 00:00:00',40,1),('LIC-1781193800002','2031-12-31 00:00:00',51,1),('LIC-1781194163608','2031-12-31 00:00:00',57,1),('LIC-55523','2028-09-11 00:00:00',64,3),('LIC-1781348227608','2031-12-31 00:00:00',66,1),('LIC-12345','2026-09-30 00:00:00',76,2);
/*!40000 ALTER TABLE `Artista` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Categoria`
--

DROP TABLE IF EXISTS `Categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Categoria` (
  `categoria_id` int(11) NOT NULL AUTO_INCREMENT,
  `nome_categoria` varchar(255) NOT NULL,
  PRIMARY KEY (`categoria_id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Categoria`
--

LOCK TABLES `Categoria` WRITE;
/*!40000 ALTER TABLE `Categoria` DISABLE KEYS */;
INSERT INTO `Categoria` VALUES (1,'Música e Som'),(2,'Artes Performativas e Físicas'),(3,'Artes Visuais e Criação ao Vivo'),(4,'Entretenimento e Variedades'),(5,'Performances de Risco ou Logística Complexa');
/*!40000 ALTER TABLE `Categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Ocorrencia`
--

DROP TABLE IF EXISTS `Ocorrencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Ocorrencia` (
  `id_ocorrencia` int(11) NOT NULL AUTO_INCREMENT,
  `data_ocorrencia` date NOT NULL,
  `hora_ocorrencia` time NOT NULL,
  `local_ocorrencia` varchar(255) NOT NULL,
  `descricao_ocorrencia` text DEFAULT NULL,
  `estado_ocorrencia` enum('pendente','resolvida','em progresso') NOT NULL,
  `id_utilizador` int(11) NOT NULL,
  `id_spot` int(11) NOT NULL,
  `data_envio` date NOT NULL,
  PRIMARY KEY (`id_ocorrencia`),
  KEY `id_spot` (`id_spot`),
  KEY `Ocorrencia_ibfk_103` (`id_utilizador`),
  CONSTRAINT `Ocorrencia_ibfk_103` FOREIGN KEY (`id_utilizador`) REFERENCES `Utilizador` (`id_utilizador`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Ocorrencia_ibfk_104` FOREIGN KEY (`id_spot`) REFERENCES `Spot` (`id_spot`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Ocorrencia`
--

LOCK TABLES `Ocorrencia` WRITE;
/*!40000 ALTER TABLE `Ocorrencia` DISABLE KEYS */;
INSERT INTO `Ocorrencia` VALUES (3,'2026-05-20','14:30:00','Parque da Cidade - Entrada Norte','Lâmpada do poste de iluminação nº 45 encontra-se partida e com fios expostos.','pendente',30,2,'0000-00-00'),(4,'2026-05-20','14:30:00','Parque da Cidade - Entrada Norte','Lâmpada do poste de iluminação nº 45 encontra-se partida e com fios expostos.','pendente',30,2,'0000-00-00'),(5,'2026-05-25','15:30:00','Parque das Nações, Lisboa','Arvore no caminho.','pendente',30,18,'0000-00-00'),(7,'2026-05-18','09:15:00','Avenida da Boavista, Porto','Semáforo avariado há vários dias.','pendente',30,2,'0000-00-00'),(8,'2026-05-26','20:30:00','Parque das Nações, Lisboa','Uma pessoa no meu local','pendente',30,25,'2026-05-26'),(9,'2026-05-18','12:15:00','Avenida da Boavista, Porto','Semáforo avariado há vários dias.','pendente',4,10,'2026-05-28'),(10,'2026-06-02','12:00:00','RUA SANTA CATARINA','Ru�do excessivo','pendente',1,2,'2026-06-02'),(11,'2026-06-02','12:12:00','RUA SANTA CATARINA','12121212','pendente',31,4,'2026-06-02'),(12,'2026-06-01','13:14:00','RIBEIRA','o artista ocopou um espaço que não é dele','pendente',31,15,'2026-06-02'),(13,'2026-05-18','12:15:00','Avenida da Boavista, Porto','Semáforo avariado há vários dias.','pendente',4,10,'2026-06-03'),(14,'2026-05-18','12:15:00','Avenida da Boavista, Porto','Semáforo avariado há vários dias.','pendente',4,10,'2026-06-03'),(16,'2026-05-18','12:15:00','Avenida da Boavista, Porto','Semáforo avariado há vários dias.','pendente',4,10,'2026-06-03'),(17,'2026-05-18','12:15:00','Avenida da Boavista, Porto','Semáforo avariado há vários dias.','pendente',4,10,'2026-06-03'),(18,'2026-05-18','09:15:00','Avenida da Boavista, Porto','Semáforo avariado há vários dias.','pendente',30,2,'2026-06-05'),(19,'2026-06-04','19:52:00','RIBEIRA','O artsita estava charrado','pendente',31,18,'2026-06-07'),(20,'2026-06-03','17:41:00','RUA SANTA CATARINA','O artista excedeu as horas','pendente',104,8,'2026-06-13'),(21,'2026-06-12','19:00:00','RUA SANTA CATARINA','O artista excedeu o limite de horário','pendente',104,3,'2026-06-13');
/*!40000 ALTER TABLE `Ocorrencia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Reserva`
--

DROP TABLE IF EXISTS `Reserva`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Reserva` (
  `id_reserva` int(11) NOT NULL AUTO_INCREMENT,
  `id_spot` int(11) NOT NULL,
  `id_artista` int(11) NOT NULL,
  `data_emissao` date NOT NULL,
  `data_evento` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fim` time NOT NULL,
  PRIMARY KEY (`id_reserva`),
  KEY `id_spot` (`id_spot`),
  KEY `id_artista` (`id_artista`),
  CONSTRAINT `Reserva_ibfk_111` FOREIGN KEY (`id_spot`) REFERENCES `Spot` (`id_spot`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Reserva_ibfk_112` FOREIGN KEY (`id_artista`) REFERENCES `Artista` (`id_artista`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Reserva`
--

LOCK TABLES `Reserva` WRITE;
/*!40000 ALTER TABLE `Reserva` DISABLE KEYS */;
INSERT INTO `Reserva` VALUES (20,17,37,'2026-06-09','2026-06-11','15:00:00','17:00:00'),(22,17,38,'2026-06-09','2026-06-23','15:00:00','17:00:00'),(25,16,36,'2026-06-11','2026-06-14','14:40:00','15:40:00'),(26,20,36,'2026-06-11','2026-06-12','14:55:00','15:55:00'),(39,15,36,'2026-06-11','2026-06-13','10:06:00','10:50:00'),(40,16,36,'2026-06-12','2026-06-19','14:00:00','15:00:00'),(47,23,76,'2026-06-13','2026-06-15','15:40:00','16:40:00');
/*!40000 ALTER TABLE `Reserva` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Seguidor`
--

DROP TABLE IF EXISTS `Seguidor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Seguidor` (
  `id_utilizador` int(11) NOT NULL,
  `id_artista` int(11) NOT NULL,
  `data_inicio` datetime NOT NULL,
  KEY `id_artista` (`id_artista`),
  KEY `Seguidor_ibfk_1_idx` (`id_utilizador`),
  CONSTRAINT `Seguidor_ibfk_1` FOREIGN KEY (`id_utilizador`) REFERENCES `Utilizador` (`id_utilizador`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Seguidor_ibfk_2` FOREIGN KEY (`id_artista`) REFERENCES `Artista` (`id_artista`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Seguidor`
--

LOCK TABLES `Seguidor` WRITE;
/*!40000 ALTER TABLE `Seguidor` DISABLE KEYS */;
INSERT INTO `Seguidor` VALUES (40,26,'2026-06-08 14:17:49'),(40,31,'2026-06-08 14:55:21'),(44,31,'2026-06-08 17:50:27'),(31,31,'2026-06-08 22:33:37'),(30,33,'2026-06-09 10:46:16'),(46,31,'2026-06-09 11:21:36'),(46,33,'2026-06-09 11:21:37'),(30,38,'2026-06-12 11:40:20'),(30,37,'2026-06-12 11:40:28'),(30,39,'2026-06-12 11:40:31'),(30,31,'2026-06-13 14:06:29'),(104,31,'2026-06-13 14:08:56'),(104,33,'2026-06-13 14:20:36');
/*!40000 ALTER TABLE `Seguidor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Spot`
--

DROP TABLE IF EXISTS `Spot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Spot` (
  `id_spot` int(11) NOT NULL AUTO_INCREMENT,
  `localizacao` varchar(255) NOT NULL,
  `longitude` float NOT NULL,
  `latitude` float NOT NULL,
  `abertura` time NOT NULL,
  `fecho` time NOT NULL,
  PRIMARY KEY (`id_spot`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Spot`
--

LOCK TABLES `Spot` WRITE;
/*!40000 ALTER TABLE `Spot` DISABLE KEYS */;
INSERT INTO `Spot` VALUES (2,'RUA SANTA CATARINA',-8.60629,41.1485,'09:00:00','20:00:00'),(3,'RUA SANTA CATARINA',-8.60622,41.1488,'09:00:00','20:00:00'),(4,'RUA SANTA CATARINA',-8.60613,41.1487,'09:00:00','20:00:00'),(5,'RUA SANTA CATARINA',-8.60604,41.149,'09:00:00','20:00:00'),(6,'RUA SANTA CATARINA',-8.60613,41.149,'09:00:00','20:00:00'),(7,'RUA SANTA CATARINA',-8.60595,41.1492,'09:00:00','20:00:00'),(8,'RUA SANTA CATARINA',-8.60605,41.1492,'09:00:00','20:00:00'),(9,'RUA SANTA CATARINA',-8.60586,41.1494,'09:00:00','20:00:00'),(10,'RUA SANTA CATARINA',-8.60595,41.1495,'09:00:00','20:00:00'),(11,'RIBEIRA',-8.61307,41.1404,'10:00:00','22:00:00'),(12,'RIBEIRA',-8.61331,41.1403,'10:00:00','22:00:00'),(13,'RIBEIRA',-8.61379,41.1403,'10:00:00','22:00:00'),(14,'RIBEIRA',-8.61415,41.1403,'10:00:00','22:00:00'),(15,'RIBEIRA',-8.61451,41.1402,'10:00:00','22:00:00'),(16,'RIBEIRA',-8.61192,41.1405,'10:00:00','22:00:00'),(17,'RIBEIRA',-8.61136,41.1406,'10:00:00','22:00:00'),(18,'RIBEIRA',-8.60991,41.1408,'10:00:00','22:00:00'),(19,'RIBEIRA',-8.60959,41.1408,'10:00:00','22:00:00'),(20,'RIBEIRA',-8.61016,41.1408,'10:00:00','22:00:00'),(21,'SÉ DO PORTO',-8.61168,41.1423,'09:00:00','18:30:00'),(22,'SÉ DO PORTO',-8.61183,41.1429,'09:00:00','18:30:00'),(23,'PONTE D.LUIS 1º',-8.61008,41.1424,'09:00:00','17:00:00'),(24,'PONTE D.LUIS 1º',-8.61028,41.1427,'09:00:00','17:00:00'),(25,'PONTE D.LUIS 1º',-8.61025,41.1431,'09:00:00','17:00:00');
/*!40000 ALTER TABLE `Spot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Utilizador`
--

DROP TABLE IF EXISTS `Utilizador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Utilizador` (
  `id_utilizador` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `tipo` enum('artista','utilizador','admin') NOT NULL,
  `data_registo` datetime NOT NULL,
  `nome_utilizador` varchar(255) NOT NULL,
  `numero_telemovel` varchar(255) DEFAULT NULL,
  `id_artista` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_utilizador`),
  KEY `id_artista` (`id_artista`),
  CONSTRAINT `Utilizador_ibfk_1` FOREIGN KEY (`id_artista`) REFERENCES `Artista` (`id_artista`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Utilizador`
--

LOCK TABLES `Utilizador` WRITE;
/*!40000 ALTER TABLE `Utilizador` DISABLE KEYS */;
INSERT INTO `Utilizador` VALUES (1,'teste@example.com','$2b$10$7v1B3H6V8R/XfS/XG19eDeN5qZ/FjU1sR.7v1B3H6V8R/XfS/XG1e','admin','2026-06-02 11:23:16','Utilizador de Teste',NULL,NULL),(4,'primeiro@example.com','$2b$10$Z4LM0iD6IWocsuBd40GUau7kUor84AnywkBlISomcvZmFsuNhyX.a','artista','2026-05-21 09:41:30','primeiro','912345678',33),(5,'artista.teste@email.com','$2b$10$3Y0S.bjyBZvP7Sc1Pa82rO3pIbJsk6QSLLPt9N/GHtju80O2Joxxe','utilizador','2026-05-23 00:46:44','DJ Spot','912345678',NULL),(6,'admin@example.pt','$2b$10$Gj2VViaY6U7MkmJHsRazVueUKhVGabPavKyLTvDVQx5zGhQs.1xnO','admin','2026-05-24 21:37:46','ADMIN','961111111',NULL),(30,'teste@email.com','$2b$10$QjPaKDvGCnxUcP/sEFtWA.er/4t7OM8QpJkIgyCFA6WNuQgCnjZZy','artista','2026-05-21 00:10:39','JoaoTeste','987654321',36),(31,'lukinhas@gmail.com','$2b$10$4z/5oVr1ercM2sdYVoYNruFI.KN0kPq9orgc13PCMz/ENxcN/fOWW','admin','2026-06-02 10:58:40','Lukinhas','',NULL),(32,'ti@gmail.com','$2b$10$diwhcaNrQS/P5ZvjiM0PceyqkK.zCAoUWcYlcAZnfmE.mw4Wjxjnq','utilizador','2026-06-02 11:01:21','tiaguinho',NULL,NULL),(34,'utilizador@email.com','$2b$10$EHqZ9IWBWABviujwqLvfjupmoNUfNFLeEPIyw3TTfs5VY2VTpnzmS','utilizador','2026-06-02 13:24:56','teste','000000000',NULL),(36,'admin@email.com','$2b$10$0I1VPhGOI.ttgIPQIjAhJuR6tlHa2KOdxsGLIiLuQZZ5iLLORTrd6','admin','2026-06-02 17:42:40','Nome do User','912345678',NULL),(39,'test_user_1780504940161@example.com','$2b$10$IHEcl.nGMkLLhqDfczC6wOJ1G/nRjgGSxx3sxlel30Uhi5ur3C1pK','utilizador','2026-06-03 16:42:20','Test User Data Validade','912345678',NULL),(40,'admingoncalo@email.com','$2b$10$opyJpQzbdukyoteQT0KxquHD9bXZzC2rwjCPWAxG1RZPyYEayGEQa','admin','2026-06-04 14:35:45','ADMIN','912345612',NULL),(41,'testegoncalo@email.com','$2b$10$vRHb1W1T47pdMlzH6E8YruqnI8fq28n8ifBLV5TFR6hqD1C9cUNDC','artista','2026-06-04 20:44:46','TesteGoncalo','912345678',31),(42,'adamastor@example.pt','$2b$10$fNoq1E3AyPzRvyW3Susr9OmqvOScc23X3tz7uc/X8p/kVnLNz5isi','utilizador','2026-06-07 16:01:51','adamastor','911111111',NULL),(43,'testefinal@email.com','$2b$10$jE813Gqol/FmUftLbgDkGe5WKKqJEfSjhLWW8rHJW.8k1E5L84fmq','utilizador','2026-06-07 22:13:49','TesteFinal','912345678',NULL),(44,'testeartista@email.com','$2b$10$fDOA9TZazgfUhtH3xmyRuexZS1S..8hf/8o5WbxeHHLWC.6YyYpgO','utilizador','2026-06-08 17:21:36','TesteArtista','912345333',NULL),(45,'testeartista1@email.com','$2b$10$U0uVnXnAfbRBqTvCt/YQO.6g/nIP2dtFhjiYpjEgIT27aVpp2g7Da','artista','2026-06-09 10:57:42','TesteDeArtista','911111112',37),(46,'testefinal1@email.com','$2b$10$AIIWCpkj4cCt2vjqPL3YiOEHT0T6NjWZBjzafInCCwFKNrncI4wKq','artista','2026-06-09 11:00:57','TESTEFINAL','912111111',38),(47,'artista_auto_1781189431732@example.com','$2b$10$aMoYXF48sv1rOpkswTrYxOpMjmzZh5/gUsJ5xum54fsTM3vYXpX5i','utilizador','2026-06-11 14:50:33','artista_auto_1781189431732','944270920',NULL),(48,'artista_auto_1781189563284@example.com','$2b$10$12T0yUQRgRsByGDQSmIHmuD3pvJi39vUxDPjUuFfJe4aLzKe/fpe2','artista','2026-06-11 14:52:44','artista_auto_1781189563284','987397150',39),(49,'user_test_1781189782860@example.com','$2b$10$C7E97HbukObesVQ67TswZuUSfyVBWCDCsDk0KtAPs02cnEuE98xvi','utilizador','2026-06-11 14:56:23','user_test_1781189782860','968503705',NULL),(50,'artista_auto_1781189839203@example.com','$2b$10$pPKFYx1TR7HmJT0/9ubP5er3cb5dAUTfmCs0nuuod1V9MonefdFne','artista','2026-06-11 14:57:20','artista_auto_1781189839203','983080027',40),(70,'artista_auto_1781193800002@example.com','$2b$10$/FlQGIx0mU6UFgSmD7N75Ofk0B.6n.7aFUIl19E7V/u4P5ZuOHD6O','artista','2026-06-11 16:03:21','artista_auto_1781193800002','920955506',51),(76,'test_user_1781193897742@example.com','$2b$10$NvhZeNxqlvQcokEdzXwJdOHABOkOy3zjzO6YJeCdE5umtjdmeZPzy','utilizador','2026-06-11 16:04:57','Test User Data Validade','912345678',NULL),(77,'artista_auto_1781194163608@example.com','$2b$10$U4x9mGhJOWzepQdv.59bUeQ8YvkYJUZ29M01DJpYRWRK1US1DoWN6','artista','2026-06-11 16:09:24','artista_auto_1781194163608','940868883',57),(88,'ultimo@email.com','$2b$10$QQm8c1EbzbMSW.z3UtswSuV3fLRmZrbDQ1cczJDbEQCqx8XIwsPhC','artista','2026-06-11 21:46:46','Johny','987654322',64),(91,'artista_auto_1781348227608@example.com','$2b$10$ubRiUQggarLvQmAlcby8Re59evmqTzkrTE.lEJKx8aWeBWNdOFnzm','artista','2026-06-13 10:57:08','artista_auto_1781348227608','989514096',66),(104,'demoUtilizador@email.com','$2b$10$rywJbKFXnybeS3XS9lvywO.aRNLoFS/9euc3aYstkdkyCrhzou3mS','artista','2026-06-13 14:08:01','DemoUtilizador','123456789',76);
/*!40000 ALTER TABLE `Utilizador` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-14 14:49:49
