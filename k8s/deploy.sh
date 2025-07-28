#!/bin/bash

# Deployment script for Tech Payment API
# This script deploys the payment API to AWS EKS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DOCKER_IMAGE=""
NAMESPACE="payment-service"
REPLICAS="2"
ENVIRONMENT="production"
MONGODB_URI=""

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -i, --image IMAGE       Docker image to deploy (required)"
    echo "  -n, --namespace NS      Kubernetes namespace (default: payment-service)"
    echo "  -r, --replicas NUM      Number of replicas (default: 2)"
    echo "  -e, --environment ENV   Environment (default: production)"
    echo "  -m, --mongodb-uri URI   MongoDB URI (optional, uses GitHub secret if not provided)"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -i username/tech-payment-api:latest"
    echo "  $0 -i username/tech-payment-api:latest -r 3 -e staging"
    echo "  $0 -i username/tech-payment-api:latest -m 'mongodb://localhost:27017/payments'"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -i|--image)
            DOCKER_IMAGE="$2"
            shift 2
            ;;
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -r|--replicas)
            REPLICAS="$2"
            shift 2
            ;;
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -m|--mongodb-uri)
            MONGODB_URI="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate required parameters
if [ -z "$DOCKER_IMAGE" ]; then
    print_error "Docker image is required"
    show_usage
    exit 1
fi

print_status "Starting deployment of Tech Payment API"
print_status "Docker Image: $DOCKER_IMAGE"
print_status "Namespace: $NAMESPACE"
print_status "Replicas: $REPLICAS"
print_status "Environment: $ENVIRONMENT"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed or not in PATH"
    exit 1
fi

# Check if we can connect to the cluster
print_status "Checking cluster connectivity..."
if ! kubectl cluster-info &> /dev/null; then
    print_error "Cannot connect to Kubernetes cluster"
    print_error "Please ensure your kubeconfig is properly configured"
    exit 1
fi

print_success "Connected to Kubernetes cluster"

# Create namespace if it doesn't exist
print_status "Creating namespace if it doesn't exist..."
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# Create or update ConfigMap
print_status "Creating/updating ConfigMap..."
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: tech-payment-api-config
  namespace: $NAMESPACE
data:
  NODE_ENV: "$ENVIRONMENT"
  SERVICE_PORT: "3003"
EOF

# Set MOCK_PAYMENT_SERVICE_URL if not provided
if [ -z "$MOCK_PAYMENT_SERVICE_URL" ]; then
    print_status "MOCK_PAYMENT_SERVICE_URL not provided, attempting to get it from LoadBalancer service..."
    
    # Get the external IP from the pagamento-mock service LoadBalancer
    MOCK_PAYMENT_EXTERNAL_IP=$(kubectl get svc payment-mock-service-loadbalancer -n payment-mock-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
    
    if [ -n "$MOCK_PAYMENT_EXTERNAL_IP" ]; then
        MOCK_PAYMENT_SERVICE_URL="http://${MOCK_PAYMENT_EXTERNAL_IP}:4000"
        print_status "✅ Mock Payment Service URL retrieved from LoadBalancer: $MOCK_PAYMENT_SERVICE_URL"
        export MOCK_PAYMENT_SERVICE_URL
    else
        print_warning "⚠️  Mock Payment service LoadBalancer external IP not available yet"
        print_warning "The service might still be provisioning. Using internal service URL as fallback."
        MOCK_PAYMENT_SERVICE_URL="http://payment-mock-service-loadbalancer.payment-mock-service.svc.cluster.local:4000"
        export MOCK_PAYMENT_SERVICE_URL
    fi
fi

# Set ORDER_API_URL if not provided
if [ -z "$ORDER_API_URL" ]; then
    print_status "ORDER_API_URL not provided, attempting to get it from LoadBalancer service..."
    
    # Get the external IP from the orders service LoadBalancer
    ORDER_EXTERNAL_IP=$(kubectl get svc orders-service-loadbalancer -n orders-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
    
    if [ -n "$ORDER_EXTERNAL_IP" ]; then
        ORDER_API_URL="http://${ORDER_EXTERNAL_IP}:3002"
        print_status "✅ Order API URL retrieved from LoadBalancer: $ORDER_API_URL"
        export ORDER_API_URL
    else
        print_warning "⚠️  Order service LoadBalancer external IP not available yet"
        print_warning "The service might still be provisioning. Using internal service URL as fallback."
        ORDER_API_URL="http://orders-service-loadbalancer.orders-service.svc.cluster.local:3002"
        export ORDER_API_URL
    fi
fi

# Create or update Secret
print_status "Creating/updating Secret..."
if [ -n "$MONGODB_URI" ]; then
    print_status "Using provided MongoDB URI"
    kubectl create secret generic tech-payment-api-secret \
        --from-literal=MONGODB_URI="$MONGODB_URI" \
        --from-literal=MOCK_PAYMENT_SERVICE_URL="$MOCK_PAYMENT_SERVICE_URL" \
        --from-literal=ORDER_API_URL="$ORDER_API_URL" \
        --namespace="$NAMESPACE" \
        --dry-run=client -o yaml | kubectl apply -f -
else
    print_warning "No MongoDB URI provided"
    print_warning "Make sure the MONGODB_URI secret is set in GitHub or create it manually"
    kubectl create secret generic tech-payment-api-secret \
        --from-literal=MOCK_PAYMENT_SERVICE_URL="$MOCK_PAYMENT_SERVICE_URL" \
        --from-literal=ORDER_API_URL="$ORDER_API_URL" \
        --namespace="$NAMESPACE" \
        --dry-run=client -o yaml | kubectl apply -f -
fi

# Set environment variables for template substitution
export DOCKER_IMAGE="$DOCKER_IMAGE"
export SERVICE_NAME="tech-payment-api"
export SERVICE_PORT="3003"
export NAMESPACE="$NAMESPACE"
export DOMAIN_NAME="tech-challenge.local"
export REPLICAS="$REPLICAS"

# Generate Kubernetes manifests from templates
print_status "Generating Kubernetes manifests..."
envsubst < k8s/deployment.yaml.template > k8s/deployment-generated.yaml
envsubst < k8s/service.yaml.template > k8s/service-generated.yaml

# Update replicas in deployment
sed -i "s/replicas: 2/replicas: $REPLICAS/" k8s/deployment-generated.yaml

print_success "Manifests generated successfully"

# Apply Kubernetes manifests
print_status "Applying Kubernetes manifests..."

print_status "Applying namespace..."
kubectl apply -f k8s/namespace.yaml

print_status "Applying ConfigMap..."
kubectl apply -f k8s/configmap.yaml

print_status "Applying deployment..."
kubectl apply -f k8s/deployment-generated.yaml

print_status "Applying service..."
kubectl apply -f k8s/service-generated.yaml

print_status "Applying HPA..."
kubectl apply -f k8s/hpa.yaml

# Wait for deployment to be ready
print_status "Waiting for deployment to be ready..."
if kubectl rollout status deployment/tech-payment-api -n "$NAMESPACE" --timeout=300s; then
    print_success "Deployment completed successfully!"
else
    print_error "Deployment failed or timed out"
    print_status "Checking deployment status..."
    kubectl describe deployment tech-payment-api -n "$NAMESPACE"
    exit 1
fi

# Verify deployment
print_status "Verifying deployment..."
kubectl get pods -n "$NAMESPACE"
kubectl get services -n "$NAMESPACE"

# Get service URL if LoadBalancer is configured
print_status "Checking service URL..."
SERVICE_HOST=$(kubectl get svc payment-service-loadbalancer -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")

if [ -n "$SERVICE_HOST" ]; then
    print_success "Service URL: http://$SERVICE_HOST:3003"
else
    print_warning "LoadBalancer service not found or not ready"
    print_status "You can access the service via port-forward:"
    print_status "kubectl port-forward svc/tech-payment-api-service 3003:3003 -n $NAMESPACE"
fi

# Clean up generated files
rm -f k8s/deployment-generated.yaml k8s/service-generated.yaml

print_success "Deployment completed successfully!"
print_status "Useful commands:"
echo "  kubectl get pods -n $NAMESPACE"
echo "  kubectl logs -f deployment/tech-payment-api -n $NAMESPACE"
echo "  kubectl describe deployment tech-payment-api -n $NAMESPACE" 