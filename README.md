# Blue-Green Deployment (Jenkins + Docker + Kubernetes)

Each Jenkins build deploys the new version to the idle color (blue or green),
waits until its pods are ready, then switches the Service selector to it.

## Files
- `app.js`, `package.json` - sample Node.js app (shows which color served the request)
- `Dockerfile` - builds the image
- `deployment-template.yaml` - Deployment with `__COLOR__` / `__IMAGE__` placeholders
- `service.yaml` - NodePort Service (selector `version: blue` on first run)
- `Jenkinsfile` - the pipeline

## Before you use it
- Change `IMAGE` in the Jenkinsfile if your Docker Hub username is not `sumeer16`.
- Jenkins needs credentials with ID `dockerhub-creds`, and kubectl access via
  `/var/lib/jenkins/.kube/config`.

## Check which color is live
    kubectl get svc myapp-bg-service -o jsonpath='{.spec.selector.version}'

## Instant rollback (switch back to the old color)
    kubectl patch svc myapp-bg-service -p '{"spec":{"selector":{"app":"myapp","version":"blue"}}}'
