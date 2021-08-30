# -*- coding: utf-8 -*-
#odoo14
{
    "name": "POS Order Reprint and ReOrder in Odoo",
	"category": "Point of Sale",
	'version': '1.0', 
	
    "summary": "This Module Will Help to Reprint POS Receipt/Invoice and Reorder of any POS Order from Orders list in POS, Easily Filter Orders in POS Screen",
    'description': "This Module Will Help to Reprint POS Receipt/Invoice and Reorder of any POS Order from Orders list in POS, Easily Filter Orders in POS Screen",
	'license': 'OPL-1',
    'price': 29.99,
	'currency': 'USD',
	
	'author': "Icon Technology",
    'website': "https://icontechnology.co.in",
    'support':  'team@icontechnology.in',
    'maintainer': 'Icon Technology',
	
    "images": ['static/description/POS-Reprint-Reorder-v14.gif'],
    
	# any module necessary for this one to work correctly
	"depends": ["point_of_sale", "product_return_pos"],
	# always loaded
    "data": [
        "views/pos_config_view.xml",
    ],
    "qweb": ["static/src/xml/pos.xml",
             "static/src/xml/ReprintReceiptScreen.xml",
    ],
    "application": False,
    "installable": True,
}