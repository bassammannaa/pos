odoo.define('pos_reprint_reorder.OrderListScreenWidget', function(require) {
    'use strict';

    const PosComponent = require('point_of_sale.PosComponent');
    const Registries = require('point_of_sale.Registries');
    const { useListener } = require('web.custom_hooks');
    const { Gui } = require('point_of_sale.Gui');
    const { debounce } = owl.utils;
    var core = require('web.core');
    var QWeb = core.qweb;
    var field_utils = require('web.field_utils');
    
    class OrderListScreenWidget extends PosComponent {
        constructor() {
            super(...arguments);
            useListener('repeat-order', this._repeatOrder);
            useListener('reprint-receipt', this._reprintReceipt);
            this.state = {
                query: null,
                selectedOrder: this.props.order,
            };
            this.updateOrderList = debounce(this.updateOrderList, 70);
            this.env.pos.db.order = {};
            this.env.pos.db.change = 0;
            this.env.pos.db.orderlines = [];
            this.env.pos.db.discount_total = 0;
            this.env.pos.db.paymentlines = [];
            this.env.pos.db.receipt = {};
            this.env.pos.db.product_taxes = [];
            this.env.pos.db.product_taxes_length = 0;
        }

        back() {
            this.trigger('close-temp-screen');
        }
        
        get_orders(){
        	var orders = this.env.pos.get('pos_session_orders');
        	return orders
        }
       
        _repeatOrder({ detail: lines }) {
        	Gui.showPopup('RepeatWidgetPopup', {
        		'lines': lines
            });
        }
        
        _RepeatOrder(lines) {
        	Gui.showPopup('RepeatWidgetPopup', {
        		'lines': lines
            });
        }
        
        async _ReprintReceipt(order) {
        	this.env.pos.db.order = order;
        	var result = {'receipt':{}};
            var order_id = parseInt(order.id);
            var cashier = this.env.pos.cashier
			|| this.env.pos.user;
			var company = this.env.pos.company;
			result['pos'] = this.env.pos;
			result['receipt']['header'] = this.env.pos.config.receipt_header
					|| '';
			result['receipt']['footer'] = this.env.pos.config.receipt_footer
					|| '';
			result['receipt']['curr_user'] = cashier ? cashier.name
					: null;
			result['receipt']['shop'] = this.env.pos.shop;
			result['receipt']['pos'] = this.env.pos;
			result['receipt']['company'] = {
				email : company.email,
				website : company.website,
				company_registry : company.company_registry,
				contact_address : company.partner_id[1],
				vat : company.vat,
				name : company.name,
				phone : company.phone,
				logo : this.env.pos.company_logo_base64,
			};
			result['receipt']['date'] = {
				localestring : order.date_order,
			};
			var lines = [];
            var payments = [];
            var discount = 0;
            var change = 0;
            var product_taxes = [];
            await this.rpc({
                model: 'pos.order',
                method: 'get_orderlines',
                args: [order.id,order.pos_reference],
            }).then(function (result) {
            	lines = result[0];
                payments = result[2];
                discount = result[1];
                change = result[3];
                product_taxes = result[4];
            });
            this.env.pos.db.change = change;
            this.env.pos.db.orderlines = lines;
            this.env.pos.db.discount_total = discount;
            this.env.pos.db.paymentlines = payments;
            this.env.pos.db.receipt = result.receipt;
            this.env.pos.db.product_taxes = product_taxes;
            this.env.pos.db.product_taxes_length = this.env.pos.db.product_taxes.length;
            await this.showTempScreen('ReprintReceiptScreenCopy');
        }
        
        async _reprintReceipt({ detail: order }) {
        	this.env.pos.db.order = order;
        	var result = {'receipt':{}};
            var order_id = parseInt(order.id);
            var cashier = this.env.pos.cashier
			|| this.env.pos.user;
			var company = this.env.pos.company;
			result['pos'] = this.env.pos;
			result['receipt']['header'] = this.env.pos.config.receipt_header
					|| '';
			result['receipt']['footer'] = this.env.pos.config.receipt_footer
					|| '';
			result['receipt']['curr_user'] = cashier ? cashier.name
					: null;
			result['receipt']['shop'] = this.env.pos.shop;
			result['receipt']['pos'] = this.env.pos;
			result['receipt']['company'] = {
				email : company.email,
				website : company.website,
				company_registry : company.company_registry,
				contact_address : company.partner_id[1],
				vat : company.vat,
				name : company.name,
				phone : company.phone,
				logo : this.env.pos.company_logo_base64,
			};
			result['receipt']['date'] = {
				localestring : order.date_order,
			};
			var lines = [];
            var payments = [];
            var discount = 0;
            var change = 0;
            var product_taxes = [];
            await this.rpc({
                model: 'pos.order',
                method: 'get_orderlines',
                args: [order.id,order.pos_reference],
            }).then(function (result) {
            	lines = result[0];
                payments = result[2];
                discount = result[1];
                change = result[3];
                product_taxes = result[4];
            });
            this.env.pos.db.change = change;
            this.env.pos.db.orderlines = lines;
            this.env.pos.db.discount_total = discount;
            this.env.pos.db.paymentlines = payments;
            this.env.pos.db.receipt = result.receipt;
            this.env.pos.db.product_taxes = product_taxes;
            this.env.pos.db.product_taxes_length = this.env.pos.db.product_taxes.length;
			await this.showTempScreen('ReprintReceiptScreenCopy');
            
        }
        
        updateOrderList(event) {
            this.state.query = event.target.value;
            var orders;
            if(this.state.query){
                orders = this.search_order(this.state.query);
                this.render_list(orders);
            }else{
                orders = this.env.pos.get('pos_session_orders');
                this.render_list(orders);
            }            
        }
        
        search_order(query){
        	try {
        		var re = RegExp(query, 'i');
                
            }catch(e){
                return [];
            }
            var results = [];
            for (var order_id in this.env.pos.get('pos_session_orders')){
                var r = re.exec(this.env.pos.get('pos_session_orders')[order_id]['name']+ '|'+ this.env.pos.get('pos_session_orders')[order_id]['partner_id'] +
                '|' + this.env.pos.get('pos_session_orders')[order_id]['pos_reference']); 
                if(r){
                	results.push(this.env.pos.get('pos_session_orders')[order_id]);
                }
            }
            return results;
        }
        
        render_list(orders){
            var contents = this.el.querySelector('.client-list-contents');
            var Length = orders.length;
            contents.innerHTML = "";
            if (this.state.query){
            	Length = orders.length;
        	}else{
        		if (orders.length == undefined){
        			Length = Object.keys(orders).length;
        		}
        	}
            for(var i = 0, len = Math.min(Length,1000); i < len; i++){
                var order    = orders[i];
                var table = document.getElementById("client-list").getElementsByTagName('tbody')[0];
                var rowCount = table.rows.length;
                var row = table.insertRow(rowCount);
                row.className = 'order-line';
                row.setAttribute("data-id", order.id);
              //Column 1  
                var cell1 = row.insertCell(0);  
                cell1.innerHTML = order.name;
              //Column 2
                var cell2 = row.insertCell(1);  
                cell2.innerHTML = order.pos_reference;
              //Column 3
                var cell3 = row.insertCell(2);  
                cell3.innerHTML = order.partner_id;
              //Column 4
                var cell4 = row.insertCell(3);  
                cell4.innerHTML = order.date_order;
              //Column 5
                var cell5 = row.insertCell(4); 
                if(order.currency_position === "after"){
                	cell5.innerHTML = order.amount_total + " " + order.currency_id;
                }else{
                	cell5.innerHTML = order.currency_id + " " + order.amount_total;
                }
              //Column 6
                var cell6 = row.insertCell(5);
                var btn_reorder = document.createElement("button");
                btn_reorder.className = 'repeat-button repeat_order';
                btn_reorder.innerHTML = "<i class='fa fa-refresh'></i> Re-Order";
                btn_reorder.addEventListener("click", this._RepeatOrder.bind(null, order.lines));
                cell6.appendChild(btn_reorder);
              //Column 7
                var cell7 = row.insertCell(6);
                var btn_reprint = document.createElement("button"); 
                btn_reprint.setAttribute("id", order.id);
                btn_reprint.className = 'receipt-reprint-button receipt_reprint';
                btn_reprint.innerHTML = "<i class='fa fa-print'></i> Receipt Reprint";
                btn_reprint.addEventListener("click", this._ReprintReceipt.bind(this, order));
                cell7.appendChild(btn_reprint);

            }

        }
    
    };
    OrderListScreenWidget.template = 'OrderListScreenWidget';

    Registries.Component.add(OrderListScreenWidget);
    
    return OrderListScreenWidget;
});
