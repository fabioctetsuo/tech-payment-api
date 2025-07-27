# Kubernetes Manifests

This directory contains Kubernetes manifests for deploying the Tech Payment API to AWS EKS.

## Files

### Core Resources

- **`namespace.yaml`**: Creates the `payment-service` namespace
- **`configmap.yaml`**: Configuration for the application
- **`deployment.yaml.template`**: Deployment template (uses environment variables)
- **`service.yaml.template`**: Service template (uses environment variables)
- **`hpa.yaml`**: Horizontal Pod Autoscaler configuration
- **`secret.yaml`**: Secret template (actual secret created by GitHub Actions)

## Deployment

### Automatic Deployment (Recommended)

The GitHub Actions CI/CD pipeline automatically handles deployment:

1. **Build and Push**: Docker image is built and pushed to Docker Hub
2. **Deploy**: Kubernetes manifests are applied to EKS cluster
3. **Configure**: Secrets and ConfigMaps are created/updated

### Manual Deployment

To deploy manually:

```bash
# Set environment variables
export DOCKER_IMAGE="your-dockerhub-username/tech-payment-api:latest"
export SERVICE_NAME="tech-payment-api"
export SERVICE_PORT="3002"
export NAMESPACE="payment-service"
export DOMAIN_NAME="tech-challenge.local"

# Generate manifests from templates
envsubst < k8s/deployment.yaml.template > k8s/deployment.yaml
envsubst < k8s/service.yaml.template > k8s/service.yaml

# Apply manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml

# Create secret (replace with your MongoDB URI)
kubectl create secret generic tech-payment-api-secret \
  --from-literal=MONGODB_URI="your-mongodb-connection-string" \
  --namespace=payment-service
```

## Configuration

### Environment Variables

The application uses the following environment variables:

- **`NODE_ENV`**: Environment (production/staging)
- **`SERVICE_PORT`**: Port the application listens on (3002)
- **`MONGODB_URI`**: MongoDB connection string (from secret)

### Resource Limits

- **CPU Request**: 250m
- **CPU Limit**: 500m
- **Memory Request**: 256Mi
- **Memory Limit**: 512Mi

### Health Checks

- **Liveness Probe**: `/health` endpoint on port 3002
- **Readiness Probe**: `/health` endpoint on port 3002
- **Initial Delay**: 30s (liveness), 5s (readiness)

### Autoscaling

- **Min Replicas**: 2
- **Max Replicas**: 10
- **CPU Target**: 70% utilization
- **Memory Target**: 80% utilization

## Services

### Internal Service

- **Name**: `tech-payment-api-service`
- **Type**: ClusterIP
- **Port**: 3002
- **Target Port**: 3002

### Load Balancer (if configured)

- **Name**: `payment-service-loadbalancer`
- **Type**: LoadBalancer
- **Port**: 3002

## Monitoring

### Health Check Endpoint

```bash
# Check if the service is healthy
curl http://localhost:3002/health
```

### Kubernetes Commands

```bash
# Check pod status
kubectl get pods -n payment-service

# Check service status
kubectl get services -n payment-service

# Check deployment status
kubectl get deployments -n payment-service

# Check HPA status
kubectl get hpa -n payment-service

# View logs
kubectl logs -f deployment/tech-payment-api -n payment-service

# Describe resources
kubectl describe deployment tech-payment-api -n payment-service
kubectl describe service tech-payment-api-service -n payment-service
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**
   - Verify `MONGODB_URI` secret is set correctly
   - Check MongoDB network access from EKS cluster
   - Verify MongoDB credentials

2. **Pod Startup Issues**
   - Check resource limits and requests
   - Verify health check endpoints
   - Check application logs

3. **Service Issues**
   - Verify service selectors match pod labels
   - Check port configurations
   - Verify network policies

### Debugging Steps

1. **Check Pod Status**
   ```bash
   kubectl get pods -n payment-service
   kubectl describe pod <pod-name> -n payment-service
   ```

2. **Check Logs**
   ```bash
   kubectl logs <pod-name> -n payment-service
   kubectl logs -f deployment/tech-payment-api -n payment-service
   ```

3. **Check Events**
   ```bash
   kubectl get events -n payment-service --sort-by='.lastTimestamp'
   ```

4. **Check Configuration**
   ```bash
   kubectl get configmap tech-payment-api-config -n payment-service -o yaml
   kubectl get secret tech-payment-api-secret -n payment-service -o yaml
   ```

## Security

- MongoDB connection string is stored in Kubernetes secrets
- Network policies should be configured for production use
- Consider using AWS IAM roles for EKS instead of access keys
- Enable RBAC for fine-grained access control 