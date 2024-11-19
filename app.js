// Using express
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

class PointsTracker {
    constructor() {
        this.transactions = [];
    }

    addTransaction(payer, points, timestamp) {
        this.transactions.push({
            payer,
            points,
            timestamp: new Date(timestamp)
        });
        this.transactions.sort((a, b) => a.timestamp - b.timestamp);
    }

    spendPoints(pointsToSpend) {
        const totalPoints = this.transactions.reduce((sum, t) => sum + t.points, 0);
        
        if (pointsToSpend > totalPoints) {
            throw new Error('Not enough points');
        }

        const spendLog = {};
        
        for (let transaction of this.transactions) {
            if (pointsToSpend <= 0) break;
            
            if (transaction.points > 0) {
                const spendAmount = Math.min(transaction.points, pointsToSpend);
                pointsToSpend -= spendAmount;
                
                spendLog[transaction.payer] = (spendLog[transaction.payer] || 0) - spendAmount;
                transaction.points -= spendAmount;
            }
        }

        return Object.entries(spendLog).map(([payer, points]) => ({ payer, points }));
    }

    getBalance() {
        const balance = {};
        this.transactions.forEach(transaction => {
            balance[transaction.payer] = (balance[transaction.payer] || 0) + transaction.points;
        });
        return balance;
    }
}

const pointsTracker = new PointsTracker();

app.post('/add', (req, res) => {
    const { payer, points, timestamp } = req.body;
    pointsTracker.addTransaction(payer, points, timestamp);
    res.sendStatus(200);
});

app.post('/spend', (req, res) => {
    try {
        const { points } = req.body;
        const spendLog = pointsTracker.spendPoints(points);
        res.json(spendLog);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.get('/balance', (req, res) => {
    res.json(pointsTracker.getBalance());
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
