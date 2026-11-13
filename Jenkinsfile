pipeline {
    agent any
    environment {
        IMAGE = "sumeer16/myapp"
        KUBECONFIG = "/var/lib/jenkins/.kube/config"
    }
    stages {
        stage('Checkout') {
            steps { checkout scm }
        }
        stage('Build Docker Image') {
            steps { sh 'docker build -t $IMAGE:$BUILD_NUMBER .' }
        }
        stage('Push Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
                    usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh 'echo $PASS | docker login -u $USER --password-stdin'
                    sh 'docker push $IMAGE:$BUILD_NUMBER'
                }
            }
        }
        stage('Detect Live Color') {
            steps {
                script {
                    def live = sh(
                        script: "kubectl get svc myapp-bg-service -o jsonpath='{.spec.selector.version}' 2>/dev/null || echo none",
                        returnStdout: true).trim()
                    env.OLD_COLOR = live
                    env.NEW_COLOR = (live == 'blue') ? 'green' : 'blue'
                    echo "Live: ${env.OLD_COLOR}  ->  Deploying to: ${env.NEW_COLOR}"
                }
            }
        }
        stage('Deploy to Idle Color') {
            steps {
                sh 'sed "s|__COLOR__|$NEW_COLOR|g; s|__IMAGE__|$IMAGE:$BUILD_NUMBER|g" deployment-template.yaml | kubectl apply -f -'
                sh 'kubectl rollout status deployment/myapp-$NEW_COLOR'
            }
        }
        stage('Verify New Version') {
            steps {
                sh 'kubectl get pods -l version=$NEW_COLOR'
            }
        }
        stage('Switch Traffic') {
            steps {
                sh 'kubectl get svc myapp-bg-service || kubectl apply -f service.yaml'
                sh """kubectl patch svc myapp-bg-service -p '{"spec":{"selector":{"app":"myapp","version":"${env.NEW_COLOR}"}}}'"""
                sh 'kubectl get svc myapp-bg-service -o jsonpath="{.spec.selector.version}"'
            }
        }
    }
    post {
        failure { echo 'Deployment failed. Live traffic is still on the old version.' }
    }
}
