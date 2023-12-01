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
    const latency = parseFloat(req.body.latency) || 0;
    const jitter = parseFloat(req.body.jitter) || 0;;
    const packetLoss = parseFloat(req.body.packetLoss) || 0;

    const R = calculateRValue(latency, jitter, packetLoss);
    const MOS = calculateMOSValue(R);

    res.render('result', { R, MOS });
});


// function calculateRValue(latency, jitter, packetLoss) {
//     const R0 = 93.2;
//     const Is = latency;
//     const Id = jitter;
//     const Ie = packetLoss * (packetLoss < 0.01 ? 75 : 25);
//     return R0 - Is - Id - Ie;
// }
function calculateRValue(latency, jitter, packetLoss) {
    const R0 = 93.2;
    // 遅延の影響、100msを超えるとR値が線形的に減少します
    const Is = latency > 100 ? (latency - 100) / 50 : 0;
    // ジッタの影響、ジッタ値を50で割ります
    const Id = jitter / 50;
    // パケットロスの影響、1%未満の場合は係数として60を使用し、それ以外の場合は40を使用します
    const Ie = packetLoss * (packetLoss < 1 ? 60 : 40);
    let R = R0 - Is - Id - Ie;

    // R値が適切な範囲内にあることを保証します
    R = Math.max(0, Math.min(R, 100));
    return R;
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
