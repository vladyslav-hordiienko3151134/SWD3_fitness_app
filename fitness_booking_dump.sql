-- MySQL dump 10.13  Distrib 9.5.0, for macos15 (arm64)
--
-- Host: localhost    Database: fitness_booking
-- ------------------------------------------------------
-- Server version	9.5.0

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'f5c886ce-47de-11f1-bb51-06229aa052bb:1-73';

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `booking_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `class_id` int NOT NULL,
  `booking_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(50) DEFAULT 'confirmed',
  PRIMARY KEY (`booking_id`),
  KEY `user_id` (`user_id`),
  KEY `class_id` (`class_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `fitness_classes` (`class_id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_chk_1` CHECK ((`status` in (_utf8mb4'confirmed',_utf8mb4'cancelled',_utf8mb4'completed')))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (7,8,15,'2026-05-11 11:25:31','confirmed');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fitness_classes`
--

DROP TABLE IF EXISTS `fitness_classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fitness_classes` (
  `class_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `start_time` timestamp NOT NULL,
  `end_time` timestamp NOT NULL,
  `max_capacity` int NOT NULL,
  `current_bookings` int DEFAULT '0',
  `location` varchar(200) DEFAULT NULL,
  `trainer_name` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`class_id`),
  CONSTRAINT `fitness_classes_chk_1` CHECK ((`max_capacity` > 0)),
  CONSTRAINT `fitness_classes_chk_2` CHECK ((`current_bookings` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fitness_classes`
--

LOCK TABLES `fitness_classes` WRITE;
/*!40000 ALTER TABLE `fitness_classes` DISABLE KEYS */;
INSERT INTO `fitness_classes` VALUES (1,'Morning Yoga','2026-04-28 07:00:00','2026-04-28 08:00:00',12,0,'Studio A','Sarah'),(2,'Hard Training','2026-04-28 17:00:00','2026-04-28 18:00:00',10,0,'Studio B','Mike'),(3,'Pilates','2026-04-29 08:30:00','2026-04-29 09:30:00',8,0,'Studio A','Emma'),(4,'Boxing','2026-04-29 18:00:00','2026-04-29 19:30:00',15,0,'Studio C','John'),(5,'Spinning','2026-04-30 17:30:00','2026-04-30 18:30:00',20,0,'Cycle Area','Lisa'),(6,'Сross fit','2026-04-30 19:00:00','2026-04-30 20:00:00',25,0,'Studio C','Carlos'),(7,'Stretching','2026-05-01 09:00:00','2026-05-01 10:00:00',15,0,'Studio A','Sarah'),(8,'Crossfit','2026-05-01 16:00:00','2026-05-01 17:30:00',12,0,'Main Hall','Mike'),(9,'Kickboxing','2026-05-02 18:00:00','2026-05-02 19:00:00',10,0,'Studio C','John'),(10,'Power Yoga','2026-05-03 10:00:00','2026-05-03 11:00:00',14,0,'Studio B','Sarah'),(15,'I\'m begging to attend my session','2026-05-31 11:30:00','2026-05-31 17:30:00',3,1,'Studio A','Lionel Messi'),(16,'I\'m begging to attend my session2','2026-05-30 11:30:00','2026-05-30 17:30:00',3,0,'Studio B','Lionel Messi'),(17,'Hi I\'m the best','2026-05-28 11:30:00','2026-05-28 12:30:00',67,0,'Studio for the best','Christiano Ronaldo');
/*!40000 ALTER TABLE `fitness_classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (8,'user','one','0876767676','user1@gmail.com','user','$2b$10$Qwj5rOnGh1e9r.wlGUdkPucTg/7U2Vat0bRXoFOZEUDhr2KAaiv1W','2026-05-10 19:26:16'),(9,'user','two','0876767676','user2@gmail.com','user','$2b$10$Uci4cY2Zho9C9k8B4E88ZutuNMaUQggCDfWm9pwOaVLzB3jof6cSa','2026-05-10 19:26:58'),(10,'user','three','0876767676','user3@gmail.com','user','$2b$10$QIc6.xq2TpqR1BszVfYjsOn/2L1G3xIcubwLHcDUABEwcOf5SVdcu','2026-05-10 19:27:33'),(11,'Lionel','Messi','0871010101','lionelmessi@gmail.com','organizer','$2b$10$kvTMUvFD0Q3oV.TzXlvPHeEVfSkSSU/FIzBUM3aYRk8KSu2eZmuSK','2026-05-10 19:29:09'),(12,'Christiano','Ronaldo','0877777777','sui@gmail.com','organizer','$2b$10$dbCq4X0Rbtd7ZbT95dRssuSxlr7pzycXkoI35Z1HwomSU9KxIxD4u','2026-05-10 19:30:50'),(13,'Vlad','Petuh','0876666666','vladpetuh@gmail.com','admin','$2b$10$dMm11HT8HmUh4fMo9ihYFu6W2h8rrzrIMzoQDbCAEsI6f0qkJsM6q','2026-05-10 19:32:44');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-11 16:12:19
