# -*- coding: utf-8 -*-
{
    'name': 'POS Reprint Voucher, ReOrder and Return Product in Odoo',
    'version': '14.0.1.0.0',
    'category': 'Point of Sale',
    "summary":
        """ 
        This Module Will Help to do the following:
            1- Reprint Receipt/Invoice.
            2- Reorder any Previous Order.
            3- Filter Previous Orders.
            4- Return specific product from any order.
        """,
    'description':
        """
        This Module Will Help to Reprint Voucher, ReOrder and Return Product in Odoo
        """,
    'author': 'Bssam Mannaa',
    'company': 'Bassam Mannaa',
    'images': ['static/description/banner.png', 'static/description/POS-Reprint-Reorder-v14.gif'],

    'website': 'https://www.BassamMannaa.com',
    'depends': ['point_of_sale'],
    'data': [
        'views/return.xml',
        'views/pos_template.xml',
        'views/pos_config_view.xml',
    ],
    "qweb": [
        'static/src/xml/pos_return.xml'
        'static/src/xml/pos.xml',
        'static/src/xml/ReprintReceiptScreen.xml',
    ],
    'license': 'AGPL-3',
    'installable': True,
    'auto_install': False,
    'application': False,

}
