# Harbor Registry Setup Guide

## 1. Tạo Harbor Secret

### Option A: Manual (cho testing nhanh)

```bash
# Tạo secret với username/password
kubectl create secret docker-registry harbor-registry-secret \
  --docker-server=qn-office \
  --docker-username=YOUR_HARBOR_USERNAME \
  --docker-password=YOUR_HARBOR_PASSWORD \
  --namespace=demo-domain
```

### Option B: Sử dụng base64 encoded credentials

```bash
# Encode credentials
echo -n "username:password" | base64

# Tạo file secret
cat > harbor-secret.yml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: harbor-registry-secret
  namespace: demo-domain
type: kubernetes.io/dockerconfigjson
stringData:
  .dockerconfigjson: |
    {
      "auths": {
        "qn-office": {
          "username": "YOUR_USERNAME",
          "password": "YOUR_PASSWORD",
          "auth": "BASE64_ENCODED_HERE"
        }
      }
    }
EOF

# Apply
kubectl apply -f harbor-secret.yml
```

### Option C: Copy từ existing secret

Nếu bạn đã có Harbor secret trong namespace khác:

```bash
# Export từ namespace khác
kubectl get secret harbor-creds -n harbor -o yaml > harbor-secret-export.yml

# Edit: change namespace to demo-domain, rename if needed
vim harbor-secret-export.yml

# Apply
kubectl apply -f harbor-secret-export.yml
```

## 2. Setup GitHub Secrets

Vào GitHub repo settings → Secrets and variables → Actions:

1. **HARBOR_USERNAME**: Harbor username của bạn
2. **HARBOR_PASSWORD**: Harbor password của bạn

URL: https://github.com/dungxbuif/demo-domain/settings/secrets/actions

## 3. Tạo Harbor Project

Vào Harbor UI (qn-office) và tạo project:

1. Login vào Harbor: `https://qn-office` (hoặc domain của bạn)
2. Projects → New Project
3. Project Name: `demo-domain`
4. Access Level: Private (recommended)
5. Save

## 4. Test Harbor Connection

```bash
# Test from local machine
docker login qn-office
# Nhập username và password

# Test pull
docker pull qn-office/demo-domain/backend:latest

# Test from Kubernetes
kubectl run test-pod --rm -it --image=qn-office/demo-domain/backend:latest \
  --overrides='{"spec":{"imagePullSecrets":[{"name":"harbor-registry-secret"}]}}' \
  --namespace=demo-domain
```

## 5. Verify Secret trong Cluster

```bash
# Check secret exists
kubectl get secret harbor-registry-secret -n demo-domain

# Verify secret data
kubectl get secret harbor-registry-secret -n demo-domain -o jsonpath='{.data.\.dockerconfigjson}' | base64 -d | jq

# Test pod với secret
kubectl get pods -n demo-domain
kubectl describe pod <pod-name> -n demo-domain | grep -A5 "Image"
```

## 6. Update Images khi Deploy

GitHub Actions sẽ tự động:
1. Build Docker images
2. Push to Harbor: `qn-office/demo-domain/backend:latest`
3. ArgoCD detect changes và pull images mới

## Troubleshooting

### ImagePullBackOff Error

```bash
# Check pod events
kubectl describe pod -n demo-domain -l app=backend

# Common issues:
# 1. Wrong credentials
kubectl delete secret harbor-registry-secret -n demo-domain
# Recreate with correct credentials

# 2. Harbor project không tồn tại
# → Tạo project "demo-domain" trong Harbor UI

# 3. Network connectivity
kubectl run -it --rm debug --image=busybox --restart=Never -- sh
# Inside pod:
nslookup qn-office
ping qn-office
```

### Harbor Registry URL

Kiểm tra Harbor registry URL chính xác:

```bash
# Nếu Harbor có domain:
HARBOR_REGISTRY=harbor.yourdomain.com

# Nếu Harbor dùng IP:
HARBOR_REGISTRY=192.168.1.100:5000

# Nếu Harbor internal trong K8s:
HARBOR_REGISTRY=harbor.harbor.svc.cluster.local
```

Update trong:
- `.github/workflows/build.yml` → HARBOR_REGISTRY
- `kubernetes/base/backend.yml` → image
- `kubernetes/base/frontend.yml` → image
- Harbor secret → docker-server

## Quick Commands

```bash
# Create secret
kubectl create secret docker-registry harbor-registry-secret \
  --docker-server=qn-office \
  --docker-username=admin \
  --docker-password=YOUR_PASSWORD \
  --namespace=demo-domain

# Verify
kubectl get secret harbor-registry-secret -n demo-domain

# Test deployment
kubectl rollout restart deployment/backend -n demo-domain
kubectl rollout restart deployment/frontend -n demo-domain

# Watch
kubectl get pods -n demo-domain -w
```
