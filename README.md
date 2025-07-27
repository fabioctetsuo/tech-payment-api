# 💳 Payment Microservice

Payment processing microservice for handling payment transactions.

## 🚀 Quick Start

### Prerequisites
- Docker
- Docker Compose

### Local Development
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
./deploy.sh health   # Check service health only
```

## 🌐 Service URLs

- **API**: http://localhost:3002
- **Health Check**: http://localhost:3002/health
- **Swagger Docs**: http://localhost:3002/api

## 🗄️ Database

This service uses **MongoDB** for data persistence. The MongoDB connection string is provided via the `MONGODB_URI` environment variable.

## 📡 API Endpoints

### Payments
- `POST /pagamentos` - Create new payment
- `GET /pagamentos/pedidos/:id` - Get payment by order ID

### Webhooks
- `POST /webhooks/payment` - Webhook for payment status updates

## 🔧 Environment Variables

```bash
MONGODB_URI=mongodb://localhost:27017/payments
MOCK_PAYMENT_SERVICE_URL=http://localhost:4000
ORDER_API_URL=http://localhost:3000
```

### External Service URLs

The payment API automatically retrieves external service URLs from AWS load balancers during deployment:

- **MOCK_PAYMENT_SERVICE_URL**: URL for the payment mock service (port 4000)
- **ORDER_API_URL**: URL for the order API service (port 3000)

These URLs are retrieved using `kubectl get svc` commands and stored in Kubernetes secrets for the application to use.

#### URL Retrieval Logic

The deployment process automatically:

1. **Retrieves LoadBalancer hostnames** from AWS EKS services
2. **Constructs full URLs** with appropriate ports
3. **Falls back to internal URLs** if external IPs are not available
4. **Stores URLs in Kubernetes secrets** for the application

#### Manual URL Retrieval

You can manually retrieve the external URLs using the provided script:

```bash
# From the tech-payment-api directory
./scripts/get-external-urls.sh
```

This script will show you the current external URLs that would be used in deployment.

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

## 🚀 CI/CD Deployment

This service includes automated CI/CD deployment to AWS EKS using GitHub Actions.

### GitHub Actions Workflows

- **`ci-cd.yml`**: Automatic deployment on push to main branch
- **`manual-deploy.yml`**: Manual deployment with custom parameters
- **`scale.yml`**: Scale deployment up or down
- **`rollback.yml`**: Rollback to previous deployment

### Required GitHub Secrets

Set these secrets in your GitHub repository:

```bash
# AWS Credentials
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_SESSION_TOKEN=your-aws-session-token

# Docker Hub
DOCKERHUB_USERNAME=your-dockerhub-username
DOCKERHUB_ACCESS_TOKEN=your-dockerhub-access-token

# Database
MONGODB_URI=your-mongodb-connection-string
```

### Setup GitHub Secrets

Use the provided script to set up GitHub secrets:

```bash
# Make script executable
chmod +x scripts/set-github-secrets.sh

# Run the setup script
./scripts/set-github-secrets.sh
```

### Kubernetes Deployment

The service is deployed to the `payment-service` namespace in AWS EKS.

#### Manual Deployment

```bash
# Deploy using the provided script
./k8s/deploy.sh -i username/tech-payment-api:latest

# Deploy with custom parameters
./k8s/deploy.sh -i username/tech-payment-api:latest -r 3 -e staging
```

#### Kubernetes Resources

- **Namespace**: `payment-service`
- **Deployment**: `tech-payment-api`
- **Service**: `tech-payment-api-service`
- **HPA**: `tech-payment-api-hpa`
- **ConfigMap**: `tech-payment-api-config`
- **Secret**: `tech-payment-api-secret`

### Monitoring Kubernetes Deployment

```bash
# Check pod status
kubectl get pods -n payment-service

# View logs
kubectl logs -f deployment/tech-payment-api -n payment-service

# Check service status
kubectl get services -n payment-service

# Check HPA status
kubectl get hpa -n payment-service
```

## 🛠️ Development

### Local Development
```bash
# Install dependencies
npm install

# Start in development mode
npm run start:dev

# Open MongoDB connection
# Make sure MongoDB is running locally or update MONGODB_URI
```

### Database Management
```bash
# Connect to MongoDB
mongosh "your-mongodb-connection-string"

# View collections
show collections

# Query payments
db.pagamentos.find()
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
docker run -p 3002:3002 -e MONGODB_URI="your-mongodb-uri" tech-payment-api:dev
```

## 🔍 Monitoring

- **Health Check**: `/health`
- **Logs**: `docker-compose logs -f payment-api`
- **Kubernetes**: `kubectl logs -f deployment/tech-payment-api -n payment-service`

## 🚨 Troubleshooting

### Service Not Starting
```bash
# Check logs
docker-compose logs payment-api

# Check MongoDB connection
# Verify MONGODB_URI is correct and accessible
```

### Kubernetes Deployment Issues
```bash
# Check pod status
kubectl get pods -n payment-service

# Check pod logs
kubectl logs <pod-name> -n payment-service

# Check events
kubectl get events -n payment-service --sort-by='.lastTimestamp'

# Check secret
kubectl get secret tech-payment-api-secret -n payment-service -o yaml
```

### MongoDB Connection Issues
```bash
# Verify MongoDB URI format
mongodb://username:password@host:port/database

# Test connection
mongosh "your-mongodb-connection-string"

# Check network access from EKS cluster
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

### Kubernetes Security
- MongoDB connection string stored in Kubernetes secrets
- Network policies should be configured for production
- Consider using AWS IAM roles for EKS

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