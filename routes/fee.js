const express = require('express');

const router = express.Router();

const feeController = require('../controllers/fee');

router.get('/fees', feeController.getFees);

router.post('/fee', feeController.postFee);

router.post('/compute-transaction-fee', feeController.postComputeTransactionfee)

module.exports = router;