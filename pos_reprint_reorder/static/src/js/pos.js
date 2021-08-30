odoo.define("pos_reprint_reorder.PosModel", function(require) {
	"use strict";

	var rpc = require("web.rpc");
	var models = require("point_of_sale.models");
	var core = require('web.core');
	var _t = core._t;
	
	models.load_models({
		model: 'pos.config',
		loaded: function(self) {
			rpc.query({
					model: 'pos.config',
					method: 'get_choosed_session',
					args: [
						[self.config.id], self.config.session_limit_conf, self.config.id
					]

				})
				.then(
					function(result) {
						self.db.choosed_session = result;
					});
		}
	});
	models.load_models({
		model: 'pos.order',
		fields: ['name', 'partner_id', 'date_order', 'amount_total', 'pos_reference', 'lines', 'state', 'session_id', 'company_id'],
		loaded: function(self) {
			rpc.query({
					model: 'pos.order',
					method: 'get_orders_according_to_selected_option',
					args: [
						[self.config.id], self.config.session_limit_conf, self.config.id
					]

				})
				.then(
					function(result) {
						self
							.set({
								'pos_session_orders': result
							});
						self.db.pos_session_orders = result;
						self.db.order_by_id = {};
						for (var order_id in self.get('pos_session_orders')) {
							self.db.order_by_id[order_id] = self.get('pos_session_orders')[order_id];
						}

					});

		}
	});

	models.load_models({
		model: 'pos.order.line',
		fields: ['product_id', 'qty', 'discount', 'price_subtotal_incl'],
		loaded: function(self, order_lines) {
			self.order_lines = order_lines;
		}
	});
	
	
});