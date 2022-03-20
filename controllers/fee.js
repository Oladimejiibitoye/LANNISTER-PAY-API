const req = require('express/lib/request');
const Fee = require('../models/fee');
const Transaction = require('../models/transaction');

exports.getFees = (req, res, next) => {
    Fee.find()
        .then(fees => {
            res.status(200).json({
                status: 'ok',
                fees: fees
            });
        });
};

exports.postFee = (req, res, next) => {
    const {
        fee_Id,
        fee_Currency,
        fee_Locale,
        fee_Entity,
        entity_Property,
        fee_Type,
        fee_Value,
        flat_Value,
        perc_Value } = req.body;

    const fee = new Fee({
        fee_Id: fee_Id,
        fee_Currency: fee_Currency,
        fee_Locale: fee_Locale,
        fee_Entity: fee_Entity,
        entity_Property: entity_Property,
        fee_Type: fee_Type,
        fee_Value: fee_Value,
        flat_Value: flat_Value,
        perc_Value: perc_Value
    });
    fee
        .save()
        .then(result => {
            res.status(200).json({
                status: "ok",
                fee: result
            });
        }).catch(err => {
            console.log(err)
        })

}

exports.postComputeTransactionfee = (req, res, next) => {
    const ID = req.body.ID;
    const Amount = req.body.Amount;
    const Currency = req.body.Currency;
    const CurrencyCountry = req.body.CurrencyCountry;
    const _Customerid = req.body.Customer._Customerid;
    const EmailAddress = req.body.Customer.EmailAddress;
    const FullName = req.body.Customer.FullName;
    const BearsFee = req.body.Customer.BearsFee;
    const _PaymentEntityid = req.body.PaymentEntity._PaymentEntityid;
    const Issuer = req.body.PaymentEntity.Issuer;
    const Brand = req.body.PaymentEntity.Brand;
    const Number = req.body.PaymentEntity.Number;
    const SixID = req.body.PaymentEntity.SixID;
    const Type = req.body.PaymentEntity.Type;
    const Country = req.body.PaymentEntity.Country;
    const Customer = ({
        _Customerid: _Customerid,
        EmailAddress: EmailAddress,
        FullName: FullName,
        BearsFee: BearsFee
    });
    const PaymentEntity = ({
        _PaymentEntityid: _PaymentEntityid,
        Issuer: Issuer,
        Brand: Brand,
        Number: Number,
        SixID: SixID,
        Type: Type,
        Country: Country
    });
    const transaction = new Transaction({
        ID: ID,
        Amount: Amount,
        Currency: Currency,
        CurrencyCountry: CurrencyCountry,
        Customer: {
            _Customerid: _Customerid,
            EmailAddress: EmailAddress,
            FullName: FullName,
            BearsFee: BearsFee,
        },
        PaymentEntity: {
            _PaymentEntityid: _PaymentEntityid,
            Issuer: Issuer,
            Brand: Brand,
            Number: Number,
            SixID: SixID,
            Type: Type,
            Country: Country,
        }
    });
    transaction
        .save()
        .then(result => {
            let ChargeAmount;
            let AppliedFeeValue;
            let AppliedFeeID;
            let SettlementAmount;
            if (Customer.BearsFee === false) {
                ChargeAmount = transaction.Amount;
                res.status(200).json({
                    ChargeAmount: ChargeAmount,
                });

            }
            else if (Customer.BearsFee === true) {
                if (transaction.CurrencyCountry === '*' && PaymentEntity.Country === '*' && transaction.Currency === 'NGN') {
                    Fee.findOne({ fee_Locale: '*', $or: [{ fee_Entity: PaymentEntity.Type }, { fee_Entity: '*' }], $or: [{ entity_Property: PaymentEntity.Brand }, { entity_Property: '*' }] })
                        .then(
                            config => {
                                Fee.findById(config._id).then(
                                    feeconfig => {
                                        AppliedFeeID = feeconfig.fee_Id;
                                        if (feeconfig.fee_Type === 'FLAT') {
                                            AppliedFeeValue = feeconfig.fee_Value;
                                        }
                                        else if (feeconfig.fee_Type === 'PERC') {
                                            AppliedFeeValue = ((feeconfig.fee_Value / 100) * transaction.Amount);
                                        }
                                        else if (feeconfig.fee_Type === 'FLAT_PERC') {
                                            AppliedFeeValue = feeconfig.flat_Value + ((feeconfig.perc_Value) / 100) * transaction.Amount;
                                        }
                                        ChargeAmount = transaction.Amount + AppliedFeeValue;
                                        SettlementAmount = ChargeAmount - AppliedFeeValue;
                                        res.status(200).json({
                                            AppliedFeeID: AppliedFeeID,
                                            AppliedFeeValue: AppliedFeeValue,
                                            ChargeAmount: ChargeAmount,
                                            SettlementAmount: SettlementAmount,
                                        });
                                    })
                            })
                }
                else if (transaction.CurrencyCountry === PaymentEntity.Country && transaction.Currency === 'NGN') {
                    Fee.findOne({
                        $or: [{ $or: [{ fee_Locale: 'LOCL' }, { fee_Locale: '*' }], fee_Entity: PaymentEntity.Type, $or: [{ entity_Property: PaymentEntity.Brand }, { entity_Property: '*' }] },
                        { fee_Locale: '*', fee_Entity: '*', entity_Property: '*' }]
                    })
                        .then(
                            config => {
                                //console.log(config);
                                Fee.findById(config._id)
                                    .then(
                                        feeconfig => {
                                            AppliedFeeID = feeconfig.fee_Id;
                                            if (feeconfig.fee_Type === 'FLAT_PERC') {
                                                AppliedFeeValue = feeconfig.flat_Value + ((feeconfig.perc_Value) / 100) * transaction.Amount;
                                            }
                                            else if (feeconfig.fee_Type === 'FLAT') {
                                                AppliedFeeValue = feeconfig.fee_Value;
                                            }
                                            else if (feeconfig.fee_Type === 'PERC') {
                                                AppliedFeeValue = (((feeconfig.fee_Value) / 100) * transaction.Amount);
                                            }
                                            ChargeAmount = transaction.Amount + AppliedFeeValue;
                                            SettlementAmount = ChargeAmount - AppliedFeeValue;
                                            res.status(200).json({
                                                AppliedFeeID: AppliedFeeID,
                                                AppliedFeeValue: AppliedFeeValue,
                                                ChargeAmount: ChargeAmount,
                                                SettlementAmount: SettlementAmount,
                                            });
                                        })
                            })
                }

                else if (transaction.CurrencyCountry !== PaymentEntity.Country && transaction.Currency === 'NGN') {
                    Fee.findOne({
                        $or: [{ $or: [{ fee_Locale: 'INTL' }, { fee_Locale: '*' }], fee_Entity: PaymentEntity.Type, $or: [{ entity_Property: PaymentEntity.Brand }, { entity_Property: '*' }] },
                        { fee_Locale: '*', fee_Entity: '*', entity_Property: '*' }]
                    })
                        .then(
                            config => {
                                Fee.findById(config._id).then(
                                    feeconfig => {
                                        AppliedFeeID = feeconfig.fee_Id;
                                        if (feeconfig.fee_Type === 'FLAT') {
                                            AppliedFeeValue = feeconfig.fee_Value;
                                        }
                                        else if (feeconfig.fee_Type === 'PERC') {
                                            AppliedFeeValue = ((feeconfig.fee_Value / 100) * transaction.Amount);
                                        }
                                        else if (feeconfig.fee_Type === 'FLAT_PERC') {
                                            AppliedFeeValue = feeconfig.flat_Value + ((feeconfig.perc_Value) / 100) * transaction.Amount;
                                        }
                                        ChargeAmount = transaction.Amount + AppliedFeeValue;
                                        SettlementAmount = ChargeAmount - AppliedFeeValue;
                                        res.status(200).json({
                                            AppliedFeeID: AppliedFeeID,
                                            AppliedFeeValue: AppliedFeeValue,
                                            ChargeAmount: ChargeAmount,
                                            SettlementAmount: SettlementAmount,
                                        });
                                    })
                            })
                }

                else if (transaction.Currency !== 'NGN') {
                    res.status(500).json({
                        Status: 'Currency is not NGN'
                    })
                }
            }
        }

        ).catch(err => {
            console.log(err)
        })
}