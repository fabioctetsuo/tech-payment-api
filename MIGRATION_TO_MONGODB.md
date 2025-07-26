# Migration from PostgreSQL/Prisma to MongoDB/Mongoose

## Overview
This document describes the migration of the tech-payment-api from PostgreSQL with Prisma ORM to MongoDB with Mongoose ODM.

## Changes Made

### 1. Database Configuration
- **Before**: PostgreSQL database with Prisma ORM
- **After**: MongoDB database with Mongoose ODM

### 2. Docker Configuration
- Updated `docker-compose.yml`:
  - Replaced PostgreSQL service with MongoDB service
  - Changed environment variables from `DATABASE_URL` to `MONGODB_URI`
  - Updated port mapping from `5434:5432` to `27017:27017`
  - Changed volume name from `payment_postgres_data` to `payment_mongodb_data`

### 3. Dependencies
- **Removed**:
  - `@prisma/client`
  - `prisma`
- **Added**:
  - `@nestjs/mongoose`
  - `mongoose`

### 4. Code Changes

#### Database Schema
- **Before**: Prisma schema (`prisma/schema.prisma`)
- **After**: Mongoose schema (`src/infrastructure/persistence/mongoose/pagamento.schema.ts`)

#### Database Module
- **Before**: `PrismaModule` (`src/infrastructure/persistence/prisma/prisma.module.ts`)
- **After**: `DatabaseModule` (`src/infrastructure/persistence/mongoose/mongoose.module.ts`)

#### Repository Layer
- Updated `PagamentoRepository` to use Mongoose instead of Prisma
- Added proper mapping between Mongoose documents and domain entities
- Implemented CRUD operations using Mongoose methods

### 5. Data Model
The `Pagamento` entity structure remains the same:
- `id`: Unique identifier (UUID in PostgreSQL, ObjectId in MongoDB)
- `pedido_id`: Order ID
- `cliente_id`: Customer ID
- `status`: Payment status (enum)
- `valor`: Payment amount
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## Running the Application

### Prerequisites
- Docker and Docker Compose installed
- Node.js 22.4.1 or later

### Steps
1. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Start the services:
   ```bash
   docker-compose up --build
   ```

### Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `MONGO_USER`: MongoDB username (default: admin)
- `MONGO_PASSWORD`: MongoDB password (default: password)
- `PAYMENT_WEBHOOK_URL`: Webhook URL for payment notifications

## Benefits of Migration
1. **Flexibility**: MongoDB's document-based structure allows for more flexible schema evolution
2. **Scalability**: MongoDB is designed for horizontal scaling
3. **Performance**: Better performance for read-heavy workloads
4. **JSON-like Documents**: Natural fit for JavaScript/TypeScript applications

## Notes
- The migration maintains backward compatibility with the existing API endpoints
- All business logic and domain entities remain unchanged
- The repository pattern is preserved, only the implementation details changed
- Timestamps are automatically managed by Mongoose 