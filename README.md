# 🔮 Predictive SRE — AI-Powered Kubernetes Observability

> **Predict incidents before they happen.** A production-grade observability platform that uses Prophet (Facebook's time-series forecasting) to predict Kubernetes pod memory usage 30 minutes ahead, with real-time risk visualization and automated alerting.

---

## 🏗️ Architecture
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│ React + Vite │────▶│ Flask API   │────▶│ Prometheus  │
│  (Port 5173)│     │  (Port 5001) │     │  (Port 5001)│     │  (Port 9090)│
└─────────────┘     └──────────────┘     └─────────────┘     └──────┬──────┘
│
▼
┌─────────────┐
│ Kubernetes  │
│   Cluster   │
│  (Minikube) │
└─────────────┘
plain

**Data Flow:**
1. **Prometheus** scrapes metrics from Kubernetes pods every 15s
2. **Flask + Prophet** queries Prometheus, fits a forecast model, predicts 30 minutes ahead
3. **React Dashboard** displays risk levels (LOW/MEDIUM/HIGH), trend direction, and memory metrics
4. **Grafana** provides industry-standard visualization of real-time pod metrics
5. **Prometheus Alert Rules** fire when memory exceeds thresholds for 2+ minutes

---

## 🚀 Quick Start

### Prerequisites
- Docker Desktop
- minikube
- kubectl
- Helm
- Node.js
- Python 3.9+

### 1. Start the Cluster
```bash
minikube start --driver=docker --memory=3000 --cpus=2
kubectl create namespace sre-learning
kubectl apply -f k8s/
2. Install Prometheus + Grafana
bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace
3. Start the AI Backend
bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install flask flask-cors prometheus-api-client prophet pandas numpy
python app.py
4. Start the Dashboard
bash
cd frontend
npm install
npm run dev
5. Apply Alert Rules
bash
kubectl apply -f nginx-memory-alert.yaml
📊 Screenshots
AI Prediction Dashboard
react-dashboard.png
Real-Time Grafana Monitoring
grafana-dashboard.png
Prometheus Alert Rules
prometheus-alert.png
🧪 Chaos Engineering
This platform was tested with intentional failures:
Table
Experiment	Result
Memory leak injection	AI detected 📈 increasing trend at 8% memory
Alert threshold breach	INACTIVE → PENDING → FIRING in 5 minutes
Pod OOMKill	Kubernetes ReplicaSet auto-recovered the pod
🛠️ Tech Stack
Table
Layer	Technology
Orchestration	Kubernetes, Minikube
Monitoring	Prometheus, Grafana, Alertmanager
AI/ML	Prophet (Facebook), pandas, numpy
Backend	Flask, Flask-CORS
Frontend	React, Vite
Deployment	Helm, YAML manifests
📅 Roadmap
[x] Kubernetes cluster with namespaces, RBAC, HPA
[x] Prometheus + Grafana monitoring stack
[x] AI prediction API with Prophet
[x] React dashboard with risk indicators
[x] Custom Grafana dashboard
[x] Prometheus alert rules
[x] Chaos engineering validation
[ ] AWS EKS deployment (Terraform)
[ ] CI/CD with GitHub Actions
[ ] Alertmanager → Slack/PagerDuty integration
