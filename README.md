# CCE Demo - Cloud Container Engine Platform

A complete cloud-native microservice demo project designed for Huawei Cloud CCE (Cloud Container Engine) deployment, featuring a professional business-style web interface with authentication, React frontend, Spring Boot backend, and MySQL database.

## Architecture

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   Frontend      │       │    Backend      │       │     MySQL       │
│   (React)       │──────▶│  (Spring Boot)  │──────▶│    (MySQL 8)    │
│   Port: 80      │       │   Port: 8080    │       │   Port: 3306    │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

## Technology Stack

### Frontend
- **React 18** - Modern UI library
- **Bootstrap 5** - Responsive design framework
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing
- **React i18next** - Internationalization (i18n) support
- **Custom Theme System** - Unified business-style design

### Backend
- **Spring Boot 3.2** - Application framework
- **Spring Data JPA** - Data persistence
- **Spring Actuator** - Health checks and monitoring
- **MySQL Connector 8.0.33** - Database driver
- **Jakarta Validation** - Input validation

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Local development orchestration
- **Kubernetes** - Container orchestration
- **Helm** - Kubernetes package manager
- **Huawei Cloud CCE** - Managed Kubernetes service
- **Huawei Cloud OBS** - Object Storage Service for file storage
- **SWR** - Container registry

## Features

### Application Features
- Professional login interface with authentication
- Docker and Kubernetes technology showcase
- Complete CRUD operations for user management
- File upload and management with OBS storage support
- Responsive web interface with business-style design
- Internationalization (i18n) support - Chinese/English language switching
- Chinese character support (UTF-8 encoding)
- Session management with localStorage

### Technical Features
- Health checks and monitoring endpoints
- Load balancing support
- Persistent storage for database and file uploads
- OBS (Object Storage Service) integration for cloud storage
- Production-ready Docker images
- Kubernetes manifests for CCE deployment
- Helm chart for easy deployment with configurable parameters
- CI/CD pipeline with Jenkins
- OBS credentials managed via Helm templates

## Project Structure

```
CCE-Demo/
├── frontend/                    # React frontend application
│   ├── public/
│   │   └── index.html          # HTML template
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Login.js        # Login page component
│   │   │   ├── Login.css       # Login page styles
│   │   │   ├── Dashboard.js    # Dashboard component
│   │   │   └── Dashboard.css   # Dashboard styles
│   │   ├── App.js              # Main application
│   │   ├── App.css             # App container styles
│   │   ├── theme.css           # Shared theme variables
│   │   └── index.js            # Entry point
│   ├── Dockerfile              # Frontend container
│   ├── nginx.conf              # Nginx configuration
│   └── package.json            # Dependencies
├── backend/                     # Spring Boot backend application
│   ├── src/
│   │   └── main/
│   │       ├── java/           # Java source code
│   │       └── resources/
│   │           └── application.properties  # Configuration
│   ├── Dockerfile              # Backend container
│   └── pom.xml                 # Maven dependencies
├── k8s/                         # Kubernetes manifests
│   ├── namespace.yaml          # Namespace definition
│   ├── mysql-*.yaml            # MySQL resources
│   ├── backend-*.yaml          # Backend resources
│   ├── frontend-*.yaml         # Frontend resources
│   ├── file-storage-pvc.yaml   # OBS storage PVC
│   ├── obs-secret.yaml         # OBS credentials secret
│   └── cce-demo-chart/         # Helm chart
│       ├── Chart.yaml          # Chart metadata
│       ├── values.yaml         # Default values
│       └── templates/          # Template files
│           ├── obs-secret.yaml # OBS secret template
│           └── ...
├── mysql-init/                  # Database initialization
│   └── 01-init.sql             # Init script with sample data
├── docker-compose.yml           # Local development setup
├── Jenkinsfile                  # CI/CD pipeline
└── README.md                    # Documentation
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

4. Login credentials:
- Username: `admin`
- Password: `admin123`

5. Stop all services:
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
4. Helm 3.x installed
5. SWR (Software Container Registry) for image storage
6. Jenkins server (for CI/CD)

### Method 1: Manual Deployment with kubectl

#### Step 1: Build and Push Docker Images

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

#### Step 2: Deploy to CCE

1. Create namespace:
```bash
kubectl apply -f k8s/namespace.yaml
```

2. Deploy all resources:
```bash
kubectl apply -f k8s/
```

3. Wait for deployments to be ready:
```bash
kubectl wait --for=condition=ready pod -l app=mysql -n cce-demo --timeout=300s
kubectl wait --for=condition=ready pod -l app=backend -n cce-demo --timeout=300s
kubectl wait --for=condition=ready pod -l app=frontend -n cce-demo --timeout=300s
```

### Method 2: Deployment with Helm

1. Update Helm values:
```bash
# Edit k8s/cce-demo-chart/values.yaml
# Update image repositories and other configurations
```

2. Deploy with Helm (with OBS credentials):
```bash
helm install cce-demo k8s/cce-demo-chart \
  --namespace cce-demo \
  --create-namespace \
  --set backend.image=<swr-endpoint>/<namespace>/cce-demo-backend:latest \
  --set frontend.image=<swr-endpoint>/<namespace>/cce-demo-frontend:latest \
  --set fileStorage.obs.accessKey=<YOUR_OBS_ACCESS_KEY> \
  --set fileStorage.obs.secretKey=<YOUR_OBS_SECRET_KEY>
```

3. Upgrade deployment:
```bash
helm upgrade cce-demo k8s/cce-demo-chart \
  --namespace cce-demo \
  --set backend.image=<swr-endpoint>/<namespace>/cce-demo-backend:<new-tag> \
  --set frontend.image=<swr-endpoint>/<namespace>/cce-demo-frontend:<new-tag>
```

#### OBS Storage Configuration

The Helm chart supports OBS (Object Storage Service) for file storage:

- **Storage Type**: Configured via `fileStorage.mountType` (default: "obs")
- **PVC Name**: `fileStorage.obs.pvcName` (default: "backend-storage-pvc")
- **Storage Class**: `csi-obs` (Huawei Cloud OBS CSI driver)
- **Filesystem Type**: `s3fs` (configured via `csi.storage.k8s.io/fstype`)
- **Volume Type**: `STANDARD` (can be set to `WARM` for lower cost)

OBS credentials are automatically created as a Kubernetes Secret by the Helm template.

### Method 3: CI/CD with Jenkins

The project includes a Jenkinsfile for automated CI/CD:

1. Configure Jenkins credentials:
   - `docker-registry-credentials`: Docker registry username/password
   - `kubeconfig-file`: Kubernetes configuration file
   - `obs-credentials`: OBS access key and secret key

2. Create a Jenkins pipeline using the Jenkinsfile

3. The pipeline will:
   - Build Docker images
   - Push images to SWR
   - Deploy to CCE using Helm with OBS credentials
   - Verify deployment status

**Note**: OBS credentials are now managed by Helm templates, eliminating the need for manual kubectl commands in the Jenkinsfile.

### Access the Application

1. Get the external IP:
```bash
kubectl get svc frontend-service -n cce-demo
```

2. Access the application using the EXTERNAL-IP

3. Login with credentials:
   - Username: `admin`
   - Password: `admin123`

## API Endpoints

### Authentication

- Login: `POST /login` (handled by frontend)
- Logout: Clear localStorage (handled by frontend)

### User Management

- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### File Management

- `GET /api/files/list` - List all uploaded files
- `POST /api/files/upload` - Upload a file
- `GET /api/files/download/{filename}` - Download a file
- `DELETE /api/files/delete/{filename}` - Delete a file
- `GET /api/files/mount-info` - Get storage mount information

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
- `FILE_MOUNT_TYPE` - File storage type (default: obs, options: obs, local)

#### Frontend

- `REACT_APP_API_URL` - Backend API URL (default: /api)

### Database Configuration

The database is configured with UTF-8 support for Chinese characters:
- Character set: `utf8mb4`
- Collation: `utf8mb4_unicode_ci`
- Connection encoding: `UTF-8`

Sample data includes Chinese names (张三, 李四, 王五).

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
   - Check PVC status: `kubectl get pvc -n cce-demo`

2. **Frontend Cannot Connect to Backend**
   - Check backend service: `kubectl get svc backend-service -n cce-demo`
   - Check backend pods: `kubectl get pods -l app=backend -n cce-demo`
   - Verify network policies
   - Check nginx configuration

3. **Image Pull Errors**
   - Verify image exists in SWR
   - Check image pull secrets
   - Verify image name and tag
   - Ensure proper authentication

4. **Chinese Character Encoding Issues**
   - Database uses utf8mb4 charset
   - Backend configured with UTF-8 encoding
   - Frontend has UTF-8 meta charset
   - Nginx configured with UTF-8 charset

5. **Helm Deployment Fails**
   - Check Helm release status: `helm list -n cce-demo`
   - View Helm history: `helm history cce-demo -n cce-demo`
   - Rollback if needed: `helm rollback cce-demo <revision> -n cce-demo`

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

# Check events
kubectl get events -n cce-demo --sort-by='.metadata.creationTimestamp'

# View resource usage
kubectl top pods -n cce-demo
```

## Security Considerations

1. **Authentication**: Change default login credentials in production
2. **Database**: Change default passwords in production
3. **Secrets**: Use Kubernetes secrets for sensitive data
4. **Network**: Configure network policies
5. **RBAC**: Enable Role-Based Access Control
6. **TLS**: Use HTTPS/TLS for production
7. **Image Security**: Scan images for vulnerabilities
8. **Updates**: Keep dependencies updated

## Performance Optimization

### Frontend
- Production build with minification
- Nginx for static file serving
- Gzip compression enabled
- Proper caching headers

### Backend
- Connection pooling with HikariCP
- JPA optimization
- Actuator metrics for monitoring

### Database
- Proper indexing on frequently queried fields
- Connection pooling
- Persistent volume for data durability

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## License

This project is for demonstration purposes.

## Support

For issues and questions:
1. Check the Troubleshooting section
2. Review Kubernetes events and logs
3. Consult Huawei Cloud CCE documentation
4. Open an issue in the repository

## Changelog

### Version 1.1.0
- Added internationalization (i18n) support with Chinese/English language switching
- Integrated OBS (Object Storage Service) for file storage
- Added file upload and management features
- Improved Helm chart with OBS secret template
- Updated Kubernetes configurations for OBS storage
- Enhanced CI/CD pipeline with automated OBS credential management
- Updated README with OBS and i18n documentation

### Version 1.0.0
- Initial release
- Professional login interface
- Docker and Kubernetes showcase
- User management CRUD operations
- Chinese character support
- Helm chart for deployment
- CI/CD pipeline with Jenkins
- Comprehensive documentation
