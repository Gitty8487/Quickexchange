const express = require('express');
const router = express.Router();

router.post('/create', (req, res) => {
    const { sendAmount } = req.body;
    if (!sendAmount || sendAmount < 2000) {
        return res.status(400).json({ success: false, message: "Min 2,000 UPI" });
    }
    const orderId = `QX-${Date.now()}`;
    res.status(201).json({ success: true, orderId });
});

module.exports = router;
