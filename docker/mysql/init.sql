-- MySQL initialization script for Consultancy Platform

-- Create database if not exists (usually handled by MYSQL_DATABASE env var)
CREATE DATABASE IF NOT EXISTS consultancy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Performance optimizations
SET GLOBAL innodb_buffer_pool_size = 256 * 1024 * 1024; -- 256MB
SET GLOBAL innodb_log_file_size = 64 * 1024 * 1024; -- 64MB
SET GLOBAL max_connections = 200;
SET GLOBAL query_cache_size = 0; -- Disabled in MySQL 8
SET GLOBAL thread_cache_size = 8;

-- Security settings
-- Note: Root password is set via MYSQL_ROOT_PASSWORD env var

-- Grant all privileges to application user
GRANT ALL PRIVILEGES ON consultancy.* TO 'consultancy'@'%';
FLUSH PRIVILEGES;
