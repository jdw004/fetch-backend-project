# Points Tracking Rest API (Node.js and Express)

## Setup

1. Install dependencies
```bash
npm init -y
npm install express body-parser
```

2. Run the application
```bash
node app.js
```

## Endpoints
- `/add` (POST): Add points transaction
- `/spend` (POST): Spend points
- `/balance` (GET): Get current point balance

## Testing
Used curl for endpoint testing.

Example Tests:
```bash
# Add points
curl -X POST http://localhost:8000/add -H "Content-Type: application/json" -d '{"payer": "DANNON", "points": 300, "timestamp": "2022-10-31T10:00:00Z"}'

curl -X POST http://localhost:8000/add -H "Content-Type: application/json" -d '{"payer": "UNILEVER", "points": 200, "timestamp": "2022-10-31T11:00:00Z"}'

curl -X POST http://localhost:8000/add -H "Content-Type: application/json" -d '{"payer": "DANNON", "points": -200, "timestamp": "2022-10-31T15:00:00Z"}'

curl -X POST http://localhost:8000/add -H "Content-Type: application/json" -d '{"payer": "MILLER COORS", "points": 10000, "timestamp": "2022-11-01T14:00:00Z"}'

curl -X POST http://localhost:8000/add -H "Content-Type: application/json" -d '{"payer": "DANNON", "points": 1000, "timestamp": "2022-11-02T14:00:00Z"}'

# Spend points
curl -X POST http://localhost:8000/spend -H "Content-Type: application/json" -d '{"points": 5000}'

# Get balance
curl http://localhost:8000/balance
```
