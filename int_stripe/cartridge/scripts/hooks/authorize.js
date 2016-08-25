'use strict';

var Logger = require('dw/system').Logger;
var System = require('dw/system');
var dworder = require('dw/order');
var Status = require('dw/system/Status');
var Transaction = require('dw/system/Transaction');
var PaymentMgr = require('dw/order/PaymentMgr');

var Stripe = require('~/cartridge/scripts/service/stripe');
 
exports.authorize = function (order, paymentDetails) : Status {
    Logger.debug("@@@@@ authorize hook order =" + order + " paymentinstrument =" + paymentDetails);

    var params = {
    		Order: order,
    		PaymentInstrument: paymentDetails
    };

    var orderNo = order.OrderNo;
    var paymentInstrument = paymentDetails;
    var paymentProcessor = PaymentMgr.getPaymentMethod(paymentInstrument.getPaymentMethod()).getPaymentProcessor();

    if (System.Site.getCurrent().getCustomPreferenceValue('stripeRELAYProcessAuthorization')) {
        var result = Stripe.AuthorizePayment(params);
        Transaction.wrap(function () {
            paymentInstrument.paymentTransaction.transactionID = result.transactionID;
            paymentInstrument.paymentTransaction.paymentProcessor = paymentProcessor;
        });
    } else {
        Transaction.wrap(function () {
            paymentInstrument.paymentTransaction.transactionID = orderNo;
            paymentInstrument.paymentTransaction.paymentProcessor = paymentProcessor;
        });
		
	} 

    return new Status(Status.OK);
}