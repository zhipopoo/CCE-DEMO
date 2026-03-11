# CCE Demo - Microservice Application

A complete microservice demo project designed for Huawei Cloud CCE (Cloud Container Engine) deployment, featuring React frontend, Spring Boot backend, and MySQL database.

## Architecture

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   Frontend      │       │    Backend      │       │     MySQL       │
│   (React)       │──────▶│  (Spring Boot)  │──────▶│    (MySQL 8)    │
│   Port: 80      │       │   Port: 8080    │       │   Port: 3306    │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

## Technology Stack

- **Frontend**: React 18, Bootstrap 5, Axios
- **Backend**: Spring Boot 3.2, Spring Data JPA, MySQL Connector
- **Database**: MySQL 8.0
- **Containerization**: Docker, Docker Compose
- **Orchestration**: Kubernetes (Huawei Cloud CCE)

## Features

- Complete CRUD operations for user management
- Responsive web interface with Bootstrap
- Health checks and monitoring
- Load balancing support
- Persistent storage for database
- Production-ready Docker images
- Kubernetes manifests for CCE deployment

## Project Structure

```
CCE-Demo/
├── frontend/                # React frontend application
│   ├── public/
│   ├── src/
│   ├── Dockerfile
│   └── nginx.conf
├── backend/                 # Spring Boot backend application
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
├── k8s/                     # Kubernetes manifests
│   ├── namespace.yaml
│   ├── mysql-*.yaml
│   ├── backend-*.yaml
│   └── frontend-*.yaml
├── docker-compose.yml       # Local development setup
└── README.md
```

## Local Development

### Prerequisites

- Docker Desktop
- Docker Compose
- Node.js 18+ (for local frontend development)
- JDK 17+ (for local backend development)
- Maven 3.9+ (for local backend development)

### Running with Docker Compose

1. Clone the repository:
```bash
git clone <repository-url>
cd CCE-Demo
```

2. Start all services:
```bash
docker-compose up -d
```

3. Access the application:
- Frontend: http://localhost
- Backend API: http://localhost:8080/api/users
- Backend Health: http://localhost:8080/actuator/health

4. Stop all services:
```bash
docker-compose down
```

### Local Development (Without Docker)

#### Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

#### Frontend

```bash
cd frontend
npm install
npm start
```

## Huawei Cloud CCE Deployment

### Prerequisites

1. Huawei Cloud account
2. CCE cluster (Kubernetes 1.25+)
3. kubectl configured to access your CCE cluster
4. SWR (Software Container Registry) for image storage

### Step 1: Build and Push Docker Images

1. Build Docker images:
```bash
# Build backend image
cd backend
docker build -t cce-demo-backend:latest .

# Build frontend image
cd ../frontend
docker build -t cce-demo-frontend:latest .
```

2. Tag images for SWR:
```bash
docker tag cce-demo-backend:latest <swr-endpoint>/<namespace>/cce-demo-backend:latest
docker tag cce-demo-frontend:latest <swr-endpoint>/<namespace>/cce-demo-frontend:latest
```

3. Push to SWR:
```bash
docker push <swr-endpoint>/<namespace>/cce-demo-backend:latest
docker push <swr-endpoint>/<namespace>/cce-demo-frontend:latest
```

### Step 2: Update Kubernetes Manifests

Update the image names in `k8s/backend-deployment.yaml` and `k8s/frontend-deployment.yaml`:

```yaml
image: <swr-endpoint>/<namespace>/cce-demo-backend:latest
image: <swr-endpoint>/<namespace>/cce-demo-frontend:latest
```

### Step 3: Deploy to CCE

1. Create namespace:
```bash
kubectl apply -f k8s/namespace.yaml
```

2. Create secrets and configmaps:
```bash
kubectl apply -f k8s/mysql-secret.yaml
kubectl apply -f k8s/mysql-configmap.yaml
```

3. Create persistent volume claim:
```bash
kubectl apply -f k8s/mysql-pvc.yaml
```

4. Deploy MySQL:
```bash
kubectl apply -f k8s/mysql-deployment.yaml
kubectl apply -f k8s/mysql-service.yaml
```

5. Wait for MySQL to be ready:
```bash
kubectl wait --for=condition=ready pod -l app=mysql -n cce-demo --timeout=300s
```

6. Deploy backend:
```bash
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
```

7. Deploy frontend:
```bash
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

### Step 4: Access the Application

1. Get the external IP:
```bash
kubectl get svc frontend-service -n cce-demo
```

2. Access the application using the EXTERNAL-IP

### One-Command Deployment

Deploy all resources at once:
```bash
kubectl apply -f k8s/
```

## API Endpoints

### User Management

- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Health Check

- `GET /actuator/health` - Application health status
- `GET /actuator/info` - Application information
- `GET /actuator/metrics` - Application metrics

## Configuration

### Environment Variables

#### Backend

- `DB_HOST` - MySQL host (default: localhost)
- `DB_PORT` - MySQL port (default: 3306)
- `DB_NAME` - Database name (default: ccedemo)
- `DB_USER` - Database user (default: root)
- `DB_PASSWORD` - Database password (default: password)

#### Frontend

- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:8080/api)

## Monitoring and Logging

### Health Checks

- **Liveness Probe**: Checks if the application is running
- **Readiness Probe**: Checks if the application is ready to receive traffic

### Logs

View logs in CCE:
```bash
# Backend logs
kubectl logs -f deployment/backend -n cce-demo

# Frontend logs
kubectl logs -f deployment/frontend -n cce-demo

# MySQL logs
kubectl logs -f deployment/mysql -n cce-demo
```

## Scaling

Scale backend replicas:
```bash
kubectl scale deployment backend --replicas=3 -n cce-demo
```

Scale frontend replicas:
```bash
kubectl scale deployment frontend --replicas=3 -n cce-demo
```

## Troubleshooting

### Common Issues

1. **MySQL Connection Failed**
   - Check if MySQL is running: `kubectl get pods -n cce-demo`
   - Check MySQL logs: `kubectl logs deployment/mysql -n cce-demo`
   - Verify secrets and configmaps

2. **Frontend Cannot Connect to Backend**
   - Check backend service: `kubectl get svc backend-service -n cce-demo`
   - Check backend pods: `kubectl get pods -l app=backend -n cce-demo`
   - Verify network policies

3. **Image Pull Errors**
   - Verify image exists in SWR
   - Check image pull secrets
   - Verify image name and tag

### Useful Commands

```bash
# Get all resources
kubectl get all -n cce-demo

# Describe deployment
kubectl describe deployment backend -n cce-demo

# Execute command in pod
kubectl exec -it <pod-name> -n cce-demo -- /bin/sh

# Port forward for local access
kubectl port-forward svc/backend-service 8080:8080 -n cce-demo
```

## Security Considerations

1. Change default passwords in production
2. Use Kubernetes secrets for sensitive data
3. Configure network policies
4. Enable RBAC
5. Use HTTPS/TLS for production

## License

This project is for demonstration purposes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

