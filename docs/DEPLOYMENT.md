# 🚀 Deployment Guide

> Complete deployment instructions for Sentiment Aura

## 📋 Overview

This guide covers development setup, production deployment, environment configuration, and operational best practices for the Sentiment Aura application.

## 🛠️ Development Setup

### Prerequisites

- **Node.js**: v16+ (for frontend)
- **Python**: 3.9+ (for backend)
- **Git**: For version control
- **API Keys**: Deepgram and at least one LLM provider

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd sentiment-aura

# Setup Frontend
cd frontend
npm install
cp .env.example .env  # Create and edit .env file

# Setup Backend
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Create and edit .env file

# Start both servers
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend
cd frontend
npm start
```

### Development Environment Variables

#### Frontend (.env)
```env
# Required
REACT_APP_DEEPGRAM_API_KEY=your_deepgram_api_key
REACT_APP_BACKEND_URL=http://localhost:8000

# Optional
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=debug
```

#### Backend (.env)
```env
# LLM API Keys (at least one required)
OPENAI_API_KEY=your_openai_key
# OR
ANTHROPIC_API_KEY=your_anthropic_key
# OR
GEMINI_API_KEY=your_gemini_key

# Server Configuration
PORT=8000
DEBUG=True
ENVIRONMENT=development

# CORS Settings
CORS_ORIGINS=["http://localhost:3000"]

# API Configuration
MAX_TIMEOUT=10
MAX_RETRIES=3
MAX_TEXT_LENGTH=5000
```

### Local Development Tips

1. **Use separate terminals** for frontend and backend
2. **Enable hot reload** for faster development
3. **Use Chrome DevTools** for debugging
4. **Monitor network tab** for API calls
5. **Check console** for WebSocket frames

---

## 🌐 Production Deployment

### Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   CloudFront    │────▶│    S3 Bucket    │     │   Deepgram API  │
│      (CDN)      │     │   (Frontend)    │────▶│   (WebSocket)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │  Load Balancer  │────▶│    LLM APIs     │
                        │   (ALB/Nginx)   │     │ (OpenAI/Claude) │
                        └─────────────────┘     └─────────────────┘
                               │
                        ┌──────┴──────┐
                        ▼             ▼
                  ┌──────────┐  ┌──────────┐
                  │Backend #1│  │Backend #2│
                  │  (ECS)   │  │  (ECS)   │
                  └──────────┘  └──────────┘
```

### Frontend Deployment

#### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Set environment variables
vercel env add REACT_APP_DEEPGRAM_API_KEY
vercel env add REACT_APP_BACKEND_URL
```

#### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd frontend
netlify deploy --prod

# Set environment variables in Netlify dashboard
```

#### Option 3: AWS S3 + CloudFront

```bash
# Build the frontend
cd frontend
npm run build

# Upload to S3
aws s3 sync build/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

### Backend Deployment

#### Option 1: Docker Container

**Dockerfile:**
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Build and Run:**
```bash
# Build image
docker build -t sentiment-aura-backend .

# Run container
docker run -p 8000:8000 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  sentiment-aura-backend
```

#### Option 2: AWS ECS/Fargate

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin $ECR_URI

docker build -t sentiment-aura .
docker tag sentiment-aura:latest $ECR_URI/sentiment-aura:latest
docker push $ECR_URI/sentiment-aura:latest

# Deploy with ECS CLI or Console
ecs-cli compose up
```

#### Option 3: Heroku

```bash
# Create Heroku app
heroku create sentiment-aura-api

# Set buildpack
heroku buildpacks:set heroku/python

# Deploy
git push heroku main

# Set environment variables
heroku config:set OPENAI_API_KEY=your_key
```

### Database Setup (Future Enhancement)

```sql
-- PostgreSQL schema for analytics
CREATE TABLE transcriptions (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  sentiment_score FLOAT,
  sentiment_type VARCHAR(20),
  keywords TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sentiment ON transcriptions(sentiment_type);
CREATE INDEX idx_created ON transcriptions(created_at);
```

---

## 🔐 Environment Configuration

### Production Environment Variables

#### Frontend Production
```env
REACT_APP_DEEPGRAM_API_KEY=prod_deepgram_key
REACT_APP_BACKEND_URL=https://api.yourdomain.com
REACT_APP_ENVIRONMENT=production
REACT_APP_SENTRY_DSN=your_sentry_dsn  # Error tracking
```

#### Backend Production
```env
# API Keys (stored in secrets manager)
OPENAI_API_KEY=${SECRET_OPENAI_KEY}
ANTHROPIC_API_KEY=${SECRET_ANTHROPIC_KEY}

# Server
PORT=8000
DEBUG=False
ENVIRONMENT=production

# Security
CORS_ORIGINS=["https://yourdomain.com"]
SECRET_KEY=your-secret-key-here
HTTPS_ONLY=True

# Performance
MAX_WORKERS=4
CONNECTION_POOL_SIZE=20
CACHE_ENABLED=True

# Monitoring
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=INFO
```

### Secrets Management

#### AWS Secrets Manager
```python
import boto3
import json

def get_secret(secret_name):
    client = boto3.client('secretsmanager')
    response = client.get_secret_value(SecretId=secret_name)
    return json.loads(response['SecretString'])

# Use in settings
secrets = get_secret('sentiment-aura/api-keys')
OPENAI_API_KEY = secrets['openai_key']
```

#### HashiCorp Vault
```bash
# Store secrets
vault kv put secret/sentiment-aura \
  openai_key="..." \
  anthropic_key="..."

# Retrieve in application
vault kv get -format=json secret/sentiment-aura
```

---

## 🔒 Security Considerations

### HTTPS Configuration

#### Nginx SSL Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    location / {
        proxy_pass http://backend:8000;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Security Headers
```python
# Add to FastAPI middleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.sessions import SessionMiddleware

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["yourdomain.com", "*.yourdomain.com"]
)

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000"
    return response
```

### API Key Security
1. **Never commit API keys** to version control
2. **Use environment variables** or secrets manager
3. **Rotate keys regularly**
4. **Monitor usage** for anomalies
5. **Implement key scoping** where possible

---

## 📊 Monitoring & Logging

### Application Monitoring

#### Sentry Integration
```javascript
// Frontend
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.REACT_APP_ENVIRONMENT,
  tracesSampleRate: 0.1,
});
```

```python
# Backend
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    integrations=[FastApiIntegration()],
    traces_sample_rate=0.1,
)
```

#### Custom Metrics
```python
# Prometheus metrics
from prometheus_client import Counter, Histogram, generate_latest

request_count = Counter('api_requests_total', 'Total API requests')
request_duration = Histogram('api_request_duration_seconds', 'API request duration')

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

### Logging Configuration

```python
import logging
from logging.handlers import RotatingFileHandler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        RotatingFileHandler('app.log', maxBytes=10485760, backupCount=5),
        logging.StreamHandler()
    ]
)
```

### Health Checks

```yaml
# Docker Compose health check
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

---

## 🧪 Testing in Production

### Smoke Tests
```bash
#!/bin/bash
# smoke_test.sh

# Test health endpoint
curl -f https://api.yourdomain.com/health || exit 1

# Test sentiment analysis
response=$(curl -s -X POST https://api.yourdomain.com/process_text \
  -H "Content-Type: application/json" \
  -d '{"text": "Test message"}')

echo $response | grep -q "sentiment" || exit 1
echo "✅ All tests passed"
```

### Load Testing
```python
# locustfile.py
from locust import HttpUser, task, between

class SentimentUser(HttpUser):
    wait_time = between(1, 3)
    
    @task
    def analyze_sentiment(self):
        self.client.post("/process_text", json={
            "text": "This is a load test message"
        })
```

Run load test:
```bash
locust -f locustfile.py --host=https://api.yourdomain.com
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          cd backend
          pip install -r requirements.txt
          pytest

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: |
          cd frontend
          npm install
          npm run build
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to AWS
        run: |
          # Build and push Docker image
          # Update ECS service
```

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: Microphone not working in production
**Solution:** Ensure HTTPS is enabled (required for getUserMedia)

#### Issue: CORS errors
**Solution:** Check CORS_ORIGINS matches your frontend URL

#### Issue: WebSocket connection fails
**Solution:** Verify Deepgram API key and WebSocket proxy configuration

#### Issue: Slow sentiment analysis
**Solution:** Check LLM API rate limits and implement caching

### Debug Commands
```bash
# Check backend logs
docker logs sentiment-aura-backend

# Test WebSocket connection
wscat -c wss://api.deepgram.com/v1/listen?token=YOUR_KEY

# Monitor resource usage
docker stats

# Check port binding
netstat -tulpn | grep 8000
```

---

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancer (ALB, Nginx)
- Deploy multiple backend instances
- Implement session affinity for WebSockets
- Use Redis for shared cache

### Performance Optimization
- Enable Gzip compression
- Implement CDN for static assets
- Use connection pooling
- Cache LLM responses
- Optimize Docker images

### Cost Optimization
- Monitor API usage
- Implement request batching
- Use cheaper LLM models when appropriate
- Set up auto-scaling policies

---

## 🔄 Rollback Procedures

```bash
# Docker rollback
docker run -p 8000:8000 sentiment-aura-backend:previous-version

# Kubernetes rollback
kubectl rollout undo deployment/sentiment-aura-backend

# Heroku rollback
heroku rollouts:rollback

# Database migration rollback
alembic downgrade -1
```

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] API keys secured
- [ ] SSL certificates ready
- [ ] Backup strategy in place

### Deployment
- [ ] Deploy backend first
- [ ] Run smoke tests
- [ ] Deploy frontend
- [ ] Verify WebSocket connectivity
- [ ] Check monitoring dashboards

### Post-Deployment
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify all features working
- [ ] Document any issues
- [ ] Update status page

---

*Complete deployment guide for Sentiment Aura*
