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

        stage('Docker Login') {
            steps {
                echo 'Logging in to Docker registry...'
                script {
                    withCredentials([usernamePassword(
                        credentialsId: 'docker-registry-credentials',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )]) {
                        sh '''
                            docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD} ${DOCKER_REGISTRY}
                        '''
                    }
                }
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
                script {
                    withCredentials([
                        file(credentialsId: 'kubeconfig-file', variable: 'KUBECONFIG'),
                        usernamePassword(
                            credentialsId: 'obs-credentials',
                            usernameVariable: 'OBS_ACCESS_KEY',
                            passwordVariable: 'OBS_SECRET_KEY'
                        )
                    ]) {
                        sh '''
                            # Ensure namespace exists
                            kubectl --kubeconfig ${KUBECONFIG} get namespace ${KUBE_NAMESPACE} || \
                            kubectl --kubeconfig ${KUBECONFIG} create namespace ${KUBE_NAMESPACE}

                            # Create OBS credentials secret with base64 encoding
                            # Secret type: cfe/secure-opaque
                            # Labels: secret.kubernetes.io/used-by: csi
                            # Data keys: access.key, secret.key (base64 encoded)
                            kubectl --kubeconfig ${KUBECONFIG} create secret generic obs-credentials \
                                --namespace ${KUBE_NAMESPACE} \
                                --from-literal=access.key=$(echo -n ${OBS_ACCESS_KEY} | base64) \
                                --from-literal=secret.key=$(echo -n ${OBS_SECRET_KEY} | base64) \
                                --labels=secret.kubernetes.io/used-by=csi \
                                --type=cfe/secure-opaque \
                                --dry-run=client -o yaml | kubectl --kubeconfig ${KUBECONFIG} apply -f -

                            # Update Helm dependencies
                            helm dependency update ${HELM_CHART_PATH} || true

                            # Deploy using Helm
                            # For CI runs we default the frontend service to ClusterIP to avoid long LoadBalancer provisioning
                            helm upgrade --install ${HELM_RELEASE} ${HELM_CHART_PATH} \
                                --kubeconfig ${KUBECONFIG} \
                                --namespace ${KUBE_NAMESPACE} \
                                --set backend.image=${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${BACKEND_IMAGE}:${IMAGE_TAG} \
                                --set frontend.image=${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${FRONTEND_IMAGE}:${IMAGE_TAG} \
                                --set frontend.service.type=ClusterIP \
                                --set fileStorage.obs.secretName=obs-credentials \
                                --wait \
                                --timeout 10m
                        '''
                    }
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                echo 'Verifying deployment...'
                script {
                    withCredentials([
                        file(credentialsId: 'kubeconfig-file', variable: 'KUBECONFIG'),
                        usernamePassword(
                            credentialsId: 'obs-credentials',
                            usernameVariable: 'OBS_ACCESS_KEY',
                            passwordVariable: 'OBS_SECRET_KEY'
                        )
                    ]) {
                        sh '''
                            kubectl --kubeconfig ${KUBECONFIG} get pods -n ${KUBE_NAMESPACE}
                            kubectl --kubeconfig ${KUBECONFIG} get services -n ${KUBE_NAMESPACE}
                            kubectl --kubeconfig ${KUBECONFIG} get ingress -n ${KUBE_NAMESPACE} || true
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up...'
            script {
                try {
                    sh 'docker logout ${DOCKER_REGISTRY} || true'
                    sh 'docker image prune -f || true'
                } catch (Exception e) {
                    echo 'Docker cleanup skipped'
                }
            }
        }
        success {
            echo 'Deployment successful!'
            script {
                withCredentials([
                        file(credentialsId: 'kubeconfig-file', variable: 'KUBECONFIG'),
                        usernamePassword(
                            credentialsId: 'obs-credentials',
                            usernameVariable: 'OBS_ACCESS_KEY',
                            passwordVariable: 'OBS_SECRET_KEY'
                        )
                    ]) {
                    sh '''
                        echo "Application deployed successfully!"
                        kubectl --kubeconfig ${KUBECONFIG} get pods -n ${KUBE_NAMESPACE} || true
                    '''
                }
            }
        }
        failure {
            echo 'Deployment failed!'
            script {
                withCredentials([
                        file(credentialsId: 'kubeconfig-file', variable: 'KUBECONFIG'),
                        usernamePassword(
                            credentialsId: 'obs-credentials',
                            usernameVariable: 'OBS_ACCESS_KEY',
                            passwordVariable: 'OBS_SECRET_KEY'
                        )
                    ]) {
                    sh '''
                        echo "Checking pod status for debugging..."
                        kubectl --kubeconfig ${KUBECONFIG} get pods -n ${KUBE_NAMESPACE} || true
                        kubectl --kubeconfig ${KUBECONFIG} describe pods -n ${KUBE_NAMESPACE} | tail -200 || true
                        echo "\n-- Services --"
                        kubectl --kubeconfig ${KUBECONFIG} get svc -n ${KUBE_NAMESPACE} || true
                        kubectl --kubeconfig ${KUBECONFIG} describe svc -n ${KUBE_NAMESPACE} || true
                        echo "\n-- Events --"
                        kubectl --kubeconfig ${KUBECONFIG} get events -n ${KUBE_NAMESPACE} --sort-by='.metadata.creationTimestamp' || true
                        echo "\n-- PVCs --"
                        kubectl --kubeconfig ${KUBECONFIG} get pvc -n ${KUBE_NAMESPACE} || true
                        kubectl --kubeconfig ${KUBECONFIG} describe pvc -n ${KUBE_NAMESPACE} || true
                    '''
                }
            }
        }
    }
}
