-- 1. Création de la base de données
CREATE DATABASE IF NOT EXISTS appdb
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. Utiliser la base
USE appdb;

-- 3. Création de la table employees
CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(50) NOT NULL,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  department VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  status ENUM('active','inactive','remote') NOT NULL DEFAULT 'active',
  hireDate DATE NOT NULL,
  salary DECIMAL(10,2) NOT NULL,
  avatar VARCHAR(255) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_email (email)
);