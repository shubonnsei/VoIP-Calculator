const express = require('express');
const path = require('path');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/calculate', (req, res) => {
    const latency = parseFloat(req.body.latency);
    const jitter = parseFloat(req.body.jitter);
    const packetLoss = parseFloat(req.body.packetLoss);

    const R = calculateRValue(latency, jitter, packetLoss);
    const MOS = calculateMOSValue(R);

    res.render('result', { R, MOS });
});

function calculateRValue(latency, jitter, packetLoss) {
    const R0 = 93.2;
    const Is = latency;
    const Id = jitter;
    const Ie = packetLoss * (packetLoss < 0.01 ? 75 : 25);
    return R0 - Is - Id - Ie;
}

function calculateMOSValue(R) {
    if (R < 0) {
        return 1;
    } else if (R > 100) {
        return 4.5;
    } else {
        return 1 + (0.035 * R) + (0.000007 * R * (R - 60) * (100 - R));
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
