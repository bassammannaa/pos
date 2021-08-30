odoo.define('pos_reprint_reorder.RepeatWidgetPopup', function(require) {
	"use strict";
    
    const Popup = require('point_of_sale.ConfirmPopup');
    const Registries = require('point_of_sale.Registries');
    const { useListener } = require('web.custom_hooks');
    const { Gui } = require('point_of_sale.Gui');
    var core = require('web.core');
    var _t = core._t;
    var utils = require('web.utils');
    var round_di = utils.round_decimals;
    
    class RepeatWidgetPopup extends Popup {
    	constructor() {
            super(...arguments);
            useListener('repeat-order-confirm', this._repeatOrderConfirm);
            this.client = 0;
        }

    	cancel() {
            this.trigger('close-popup');
        }
    	
    	_repeatOrderConfirm(e){
            var self = this;
    	    var myTable = document.getElementById('list').tBodies[0];
            var count  = 0;
            var c = 1;
            for (r=0, n = myTable.rows.length; r < n; r++) {
                var row = myTable.rows[r]
                var ordered_qty = document.getElementById("reorder-qty-"+c).value
                if (row.cells[1].innerHTML < ordered_qty){
                    count +=1
                }
                c = c+1
            }
            c = 1;
            for (var r=0, n = myTable.rows.length; r < n; r++) {
            	var client = $(document.getElementById("reorder-qty-"+c)).data("id");
            	this.client = client;
                row = myTable.rows[r]
                const $row = $(row);
                ordered_qty = parseInt(document.getElementById("reorder-qty-"+c).value);
                var product   = this.env.pos.db.get_product_by_id($row.data("id"));
                if (!product) {
                    return;
                }
                
                if (ordered_qty > 0){
                    this.env.pos.get_order().add_product(product, {
                    quantity: ordered_qty,
                    merge: false,

                    });
                }
                c = c+1
            if (this.client){
            	this.env.pos.get_order().set_client(self.env.pos.db.get_partner_by_id(this.client));
        	}
            }
            this.trigger('close-popup');
            this.trigger('close-temp-screen');
    	}
    } // end of class RepeatWidgetPopup
    
    RepeatWidgetPopup.template = 'RepeatWidgetPopup';

    Registries.Component.add(RepeatWidgetPopup);
    
    return RepeatWidgetPopup;
    
});