const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 8000;

app.use(bodyParser.json());

// Initialize user data
let userTotalPoints = 0;
let userBalance = {};
let userTransactions = []; // Stack of transactions sorted by timestamp

// Add Points
app.post('/add', (req, res) => {
    const { payer, points, timestamp } = req.body;

    // Validate request
    if (!payer || typeof points !== 'number' || !timestamp) {
        return res.status(400).send('Invalid request body');
    }

    const timestampDate = new Date(Date.parse(timestamp));
    const transaction = { payer, points, timestampDate };

    if (points < 0) {
        // Negative points logic: Deduct points
        const deductionPoints = -points;
        if (deductionPoints > userTotalPoints) {
            return res.status(400).send('User does not have enough points for deduction');
        }

        let spendPointsRemaining = deductionPoints;
        for (let i = 0; i < userTransactions.length && spendPointsRemaining > 0; i++) {
            let transaction = userTransactions[i];
            const { payer } = transaction;

            if (transaction.points <= spendPointsRemaining) {
                spendPointsRemaining -= transaction.points;
                userBalance[payer] -= transaction.points;
                userTransactions.splice(i, 1);
                i--;
            } else {
                transaction.points -= spendPointsRemaining;
                userBalance[payer] -= spendPointsRemaining;
                spendPointsRemaining = 0;
            }
        }

        userTotalPoints -= deductionPoints;
        res.sendStatus(200);
        return;
    }

    // Insert transaction in sorted order (binary search insertion)
    let low = 0, high = userTransactions.length - 1;
    while (low <= high) {
        const mid = Math.floor(low + (high - low) / 2);
        if (userTransactions[mid].timestampDate > timestampDate) high = mid - 1;
        else low = mid + 1;
    }
    userTransactions.splice(low, 0, transaction);

    // Update balances
    userBalance[payer] = (userBalance[payer] || 0) + points;
    userTotalPoints += points;

    res.sendStatus(200);
});



// Spend Points
app.post('/spend', (req, res) => {
    const { points } = req.body;

    // Validate request
    if (!points || typeof points !== 'number') {
        return res.status(400).send('Invalid request body');
    }
    if (points > userTotalPoints) {
        return res.status(400).send('User does not have enough points');
    }

    let spendPointsRemaining = points;
    let spendTransactions = [];
    userTotalPoints -= points;

    // Spend points from oldest to newest
    for (let i = 0; i < userTransactions.length && spendPointsRemaining > 0; i++) {
        let transaction = userTransactions[i];
        const { payer } = transaction;

        if (transaction.points <= spendPointsRemaining) {
            // Fully spend this transaction
            spendTransactions.push({ payer, points: -transaction.points });
            spendPointsRemaining -= transaction.points;

            // Update balance and remove transaction
            userBalance[payer] -= transaction.points;
            userTransactions.splice(i, 1);
            i--; // Adjust index due to splice
        } 
        else {
            // Partially spend this transaction
            spendTransactions.push({ payer, points: -spendPointsRemaining });

            // Deduct points from transaction
            transaction.points -= spendPointsRemaining;
            userBalance[payer] -= spendPointsRemaining;
            spendPointsRemaining = 0; // Fully spent
        }
    }
    // Respond with spend transactions
    res.json(spendTransactions);
});

// Get Balance
app.get('/balance', (req, res) => {
    res.json(userBalance);
});

// Start Server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
