odoo.define('pos_reprint_reorder.PosOrdersWidget', function(require) {
    "use strict";

    var models = require('point_of_sale.models');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const { useListener } = require('web.custom_hooks');
    var core = require('web.core');
    const { Gui } = require('point_of_sale.Gui');
    const PosComponent = require('point_of_sale.PosComponent');
    const Registries = require('point_of_sale.Registries');
    var _t = core._t;

// Start PosOrdersButton
    class PosOrdersButton extends PosComponent {
        constructor() {
            super(...arguments);
            useListener('click-pos-orders', this._onPosOrders);
            this.orders = this.env.pos.get('pos_session_orders');
        }
        
        async _onPosOrders() {
            const { confirmed, payload: newClient } = await this.showTempScreen(
                'OrderListScreenWidget',{'orders' : this.orders}
            );
        }
    };
    PosOrdersButton.template = 'PosOrdersButton';

    Registries.Component.add(PosOrdersButton);

    return PosOrdersButton;

});
