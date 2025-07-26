# 💳 Payment Microservice

Payment processing microservice for handling payment transactions.

## 🚀 Quick Start

### Prerequisites
- Docker
- Docker Compose

### Deployment
```bash
# Full deployment (build, start, migrate, health check)
./deploy.sh

# Or step by step
./deploy.sh build    # Build Docker image
./deploy.sh start    # Start services
./deploy.sh migrate  # Run database migrations
./deploy.sh health   # Check service health
```

### Manual Start
```bash
# Start services
docker-compose up -d

# Run migrations
docker-compose exec payment-api npx prisma migrate deploy

# Check health
curl http://localhost:3002/health
```

## 📋 Available Commands

```bash
./deploy.sh deploy   # Full deployment
./deploy.sh start    # Start services only
./deploy.sh stop     # Stop services
./deploy.sh restart  # Restart services
./deploy.sh logs     # Show service logs
./deploy.sh build    # Build Docker image only
./deploy.sh migrate  # Run database migrations only
./deploy.sh health   # Check service health only
```

## 🌐 Service URLs

- **API**: http://localhost:3002
- **Health Check**: http://localhost:3002/health
- **Swagger Docs**: http://localhost:3002/api
- **Database**: localhost:5434

## 🗄️ Database

- **Database**: `payment_db`
- **Tables**: `pagamento`

## 📡 API Endpoints

### Payments
- `POST /pagamentos` - Create new payment
- `GET /pagamentos/pedidos/:id` - Get payment by order ID

### Webhooks
- `POST /webhooks/payment` - Webhook for payment status updates

## 🔧 Environment Variables

```bash
DATABASE_URL=postgresql://postgres:password@payment-postgres:5432/payment_db
PAYMENT_WEBHOOK_URL=http://localhost:3003/webhook
ORDER_API_URL=http://localhost:3000
```

## 🔗 Webhook Integration

The payment API includes a webhook endpoint that receives status updates from external payment services (like the payment-mock service).

### Webhook Endpoint
- **URL**: `POST /webhooks/payment`
- **Purpose**: Receive payment status updates from external services

### Webhook Payload Format
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "pedido_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "approved",
  "valor": 100.50
}
```

### Status Values
- `pending` - Payment is pending
- `processing` - Payment is being processed
- `approved` - Payment was approved
- `rejected` - Payment was rejected
- `cancelled` - Payment was cancelled

### Integration with Payment-Mock Service
The payment-mock service sends webhook notifications to this endpoint when payment status changes. The webhook automatically updates the payment status in the database.

### Integration with Order API
When a payment is approved (status = "approved"), the webhook automatically calls the Order API to confirm the order by making a PUT request to `/pedidos/:id/confirmar`. This ensures that orders are automatically confirmed when payments are successful.

## 🛠️ Development

### Local Development
```bash
# Install dependencies
npm install

# Start in development mode
npm run start:dev

# Run migrations
npm run migrate:dev

# Open Prisma Studio
npm run prisma:studio
```

### Database Management
```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run e2e tests
npm run test:e2e
```

## 📦 Docker

### Build Image
```bash
docker build -f Dockerfile.dev -t tech-payment-api:dev .
```

### Run Container
```bash
docker run -p 3002:3002 tech-payment-api:dev
```

## 🔍 Monitoring

- **Health Check**: `/health`
- **Logs**: `docker-compose logs -f payment-api`
- **Database**: Connect to `localhost:5434` with `payment_db`

## 🚨 Troubleshooting

### Service Not Starting
```bash
# Check logs
docker-compose logs payment-api

# Check database connection
docker-compose exec payment-postgres psql -U postgres -d payment_db
```

### Migration Issues
```bash
# Reset database
docker-compose exec payment-api npx prisma migrate reset

# Check migration status
docker-compose exec payment-api npx prisma migrate status
```

### Port Conflicts
If port 3002 or 5434 is already in use, modify the ports in `docker-compose.yml`:
```yaml
ports:
  - '3003:3002'  # Change 3002 to 3003
```

## 💰 Payment Processing

### Payment Status Flow
1. **PENDING** - Payment created
2. **PROCESSING** - Payment being processed
3. **APPROVED** - Payment successful
4. **REJECTED** - Payment failed
5. **CANCELLED** - Payment cancelled

### Mock Payment Provider
The service includes a mock payment provider that:
- Simulates payment processing delay (1 second)
- Has 80% success rate
- Returns APPROVED or REJECTED status

### Integration
To integrate with real payment providers:
1. Implement the `PaymentProviderPort` interface
2. Update the `PaymentModule` to use your provider
3. Configure environment variables for your provider

## 🔐 Security

### Payment Data
- Payment information is encrypted in transit
- Database connections use SSL
- Sensitive data is not logged

### Webhook Security
- Implement webhook signature verification
- Use HTTPS for webhook endpoints
- Validate webhook payloads

## 📊 Payment Analytics

### Metrics to Monitor
- Payment success rate
- Average processing time
- Failed payment reasons
- Revenue by time period

### Logging
- Payment creation events
- Processing status changes
- Error conditions
- Performance metrics 