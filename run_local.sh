#!/bin/bash
echo "Starting SOCup AI Infrastructure..."

# 1. Start Docker Infrastructure
cd /home/batman/Pictures/SecurityClaw-main
docker-compose up -d

# Wait for docker to stabilize
sleep 3

# 2. Start Python Microservices
source /home/batman/Pictures/SecurityClaw-main/.venv/bin/activate
echo "Starting Alerts Service..."
cd /home/batman/Pictures/SecurityClaw-main/services/alerts
python main.py &
ALERTS_PID=$!

echo "Starting Timeline Service..."
cd /home/batman/Pictures/SecurityClaw-main/services/timeline
python main.py &
TIMELINE_PID=$!

# Wait for python services to be fully bound
sleep 3

# 3. Start Gateway
echo "Starting GraphQL Gateway..."
cd /home/batman/Pictures/SecurityClaw-main/apps/gateway
npm run dev &
GATEWAY_PID=$!

# 4. Start Next.js Frontend
echo "Starting Frontend Dashboard..."
cd /home/batman/Pictures/SecurityClaw-main/apps/web
npm run dev &
WEB_PID=$!

echo "All services started!"
echo "Next.js Web UI: http://localhost:3000"
echo "GraphQL Gateway: http://localhost:4000"
echo "Alerts API: http://localhost:8001"
echo "Timeline API: http://localhost:8002"

# Wait for all processes
wait $ALERTS_PID $TIMELINE_PID $GATEWAY_PID $WEB_PID
