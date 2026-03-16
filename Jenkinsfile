pipeline {
    agent any

    environment {
        // Docker registry configuration
        DOCKER_REGISTRY = 'swr.ap-southeast-1.myhuaweicloud.com'
        DOCKER_NAMESPACE = 'andy-demo'
        BACKEND_IMAGE = 'cce-demo-backend'
        FRONTEND_IMAGE = 'cce-demo-frontend'
        IMAGE_TAG = "${BUILD_NUMBER}"

        // Kubernetes configuration
        KUBE_NAMESPACE = 'cce-demo'
        HELM_RELEASE = 'cce-demo'
        HELM_CHART_PATH = 'k8s/cce-demo-chart'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                echo 'Building backend Docker image...'
                dir('backend') {
                    sh '''
                        docker build -t ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${BACKEND_IMAGE}:${IMAGE_TAG} .
                        docker tag ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${BACKEND_IMAGE}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${BACKEND_IMAGE}:latest
                    '''
                }
            }
        }

        stage('Build Frontend') {
            steps {
                echo 'Building frontend Docker image...'
                dir('frontend') {
                    sh '''
                        docker build -t ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${FRONTEND_IMAGE}:${IMAGE_TAG} .
                        docker tag ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${FRONTEND_IMAGE}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${FRONTEND_IMAGE}:latest
                    '''
                }
            }
        }

        stage('Push Images') {
            steps {
                echo 'Pushing Docker images to registry...'
                sh '''
                    docker push ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${BACKEND_IMAGE}:${IMAGE_TAG}
                    docker push ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${BACKEND_IMAGE}:latest
                    docker push ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${FRONTEND_IMAGE}:${IMAGE_TAG}
                    docker push ${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${FRONTEND_IMAGE}:latest
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying to Kubernetes using Helm...'
                sh '''
                    # Update Helm dependencies
                    helm dependency update ${HELM_CHART_PATH}

                    # Deploy using Helm
                    helm upgrade --install ${HELM_RELEASE} ${HELM_CHART_PATH} \
                        --namespace ${KUBE_NAMESPACE} \
                        --create-namespace \
                        --set backend.image=${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${BACKEND_IMAGE}:${IMAGE_TAG} \
                        --set frontend.image=${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${FRONTEND_IMAGE}:${IMAGE_TAG} \
                        --wait \
                        --timeout 5m
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                echo 'Verifying deployment...'
                sh '''
                    kubectl get pods -n ${KUBE_NAMESPACE}
                    kubectl get services -n ${KUBE_NAMESPACE}
                    kubectl get ingress -n ${KUBE_NAMESPACE}
                '''
            }
        }
    }

    post {
        always {
            echo 'Cleaning up...'
            sh '''
                docker image prune -f
            '''
        }
        success {
            echo 'Deployment successful!'
            sh '''
                echo "Application deployed successfully!"
                kubectl get pods -n ${KUBE_NAMESPACE}
            '''
        }
        failure {
            echo 'Deployment failed!'
            sh '''
                echo "Checking pod status for debugging..."
                kubectl get pods -n ${KUBE_NAMESPACE}
                kubectl describe pods -n ${KUBE_NAMESPACE} | tail -100
            '''
        }
    }
}
