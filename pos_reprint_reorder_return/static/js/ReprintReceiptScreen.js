odoo.define('pos_reprint_reorder.ReprintReceiptScreen', function (require) {
    'use strict';

    const AbstractReceiptScreen = require('point_of_sale.AbstractReceiptScreen');
    const Registries = require('point_of_sale.Registries');

    const ReprintReceiptScreenCopy = (AbstractReceiptScreen) => {
        class ReprintReceiptScreenCopy extends AbstractReceiptScreen {
            confirm() {
        	this.orders = this.env.pos.get('pos_session_orders');
            	this.showTempScreen('OrderListScreenWidget',{'orders' : this.orders});
            }
            tryReprint() {
                this._printReceipt();
            }
        }
        ReprintReceiptScreenCopy.template = 'ReprintReceiptScreenCopy';
        return ReprintReceiptScreenCopy;
    };
    Registries.Component.addByExtending(ReprintReceiptScreenCopy, AbstractReceiptScreen);

    return ReprintReceiptScreenCopy;
});
