# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD automation of the Tech Payment API.

## Workflows

### 1. CI/CD Pipeline (`ci-cd.yml`)

**Triggers:** Push to main branch, Pull requests to main branch

**Jobs:**
- **Test:** Builds and tests the application
- **Build and Push:** Builds Docker image and pushes to Docker Hub
- **Deploy:** Deploys to AWS EKS cluster

**Features:**
- Automatic testing on pull requests
- Docker image building and pushing
- Kubernetes deployment to EKS
- MongoDB connection via GitHub secrets

### 2. Manual Deploy (`manual-deploy.yml`)

**Triggers:** Manual workflow dispatch

**Purpose:** Manual deployment with custom parameters

**Inputs:**
- `docker_image`: Docker image to deploy
- `mongodb_uri`: MongoDB URI (optional, uses GitHub secret if not provided)
- `environment`: Environment (production/staging)
- `namespace`: Kubernetes namespace
- `replicas`: Number of replicas

### 3. Scale Deployment (`scale.yml`)

**Triggers:** Manual workflow dispatch

**Purpose:** Scale deployment up or down

**Inputs:**
- `namespace`: Kubernetes namespace
- `replicas`: Number of replicas
- `deployment`: Deployment name

### 4. Rollback Deployment (`rollback.yml`)

**Triggers:** Manual workflow dispatch

**Purpose:** Rollback to previous deployment revision

**Inputs:**
- `namespace`: Kubernetes namespace
- `deployment`: Deployment name

## Required GitHub Secrets

Set these secrets in your GitHub repository settings:

### AWS Credentials
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_SESSION_TOKEN`: AWS session token (if using temporary credentials)

### Docker Hub
- `DOCKERHUB_USERNAME`: Docker Hub username
- `DOCKERHUB_ACCESS_TOKEN`: Docker Hub access token

### Database
- `MONGODB_URI`: MongoDB connection string

## Usage

### Automatic Deployment
1. Push to the `main` branch
2. The CI/CD pipeline will automatically:
   - Run tests
   - Build and push Docker image
   - Deploy to EKS

### Manual Deployment
1. Go to Actions tab in GitHub
2. Select "Manual Deploy to AWS"
3. Click "Run workflow"
4. Fill in the required parameters
5. Click "Run workflow"

### Scaling
1. Go to Actions tab in GitHub
2. Select "Scale Deployment"
3. Click "Run workflow"
4. Set the desired number of replicas
5. Click "Run workflow"

### Rollback
1. Go to Actions tab in GitHub
2. Select "Rollback Deployment"
3. Click "Run workflow"
4. Click "Run workflow"

## Kubernetes Resources

The workflows deploy the following Kubernetes resources:

- **Namespace:** `payments-service`
- **ConfigMap:** `tech-payment-api-config`
- **Secret:** `tech-payment-api-secret` (contains MongoDB URI)
- **Deployment:** `tech-payment-api`
- **Service:** `tech-payment-api-service`
- **HPA:** `tech-payment-api-hpa`

## Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**
   - Verify `MONGODB_URI` secret is set correctly
   - Check MongoDB network access from EKS cluster

2. **Docker Build Failures**
   - Verify Docker Hub credentials
   - Check Dockerfile syntax

3. **Kubernetes Deployment Issues**
   - Check AWS credentials
   - Verify EKS cluster access
   - Check resource limits and requests

### Debugging Commands

```bash
# Check pod status
kubectl get pods -n payments-service

# Check pod logs
kubectl logs -f deployment/tech-payment-api -n payments-service

# Check service status
kubectl get services -n payments-service

# Check deployment status
kubectl describe deployment tech-payment-api -n payments-service

# Check events
kubectl get events -n payments-service --sort-by='.lastTimestamp'
```

## Security Notes

- All sensitive data (MongoDB URI, AWS credentials) are stored as GitHub secrets
- Kubernetes secrets are used for sensitive configuration
- Network policies should be configured for production use
- Consider using AWS IAM roles for EKS instead of access keys 