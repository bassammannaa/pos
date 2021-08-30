# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
import pytz
import string, random, datetime
from itertools import product
from odoo.exceptions import UserError, ValidationError
from odoo.tools import float_is_zero


class PosConfig(models.Model):
    _inherit = 'pos.config'

    session_limit_conf = fields.Selection(
        [("load_all", "Load all session's orders"), ("load_last_3", "Load last 3 session's orders"),
         ("load_last_5", "Load last 5 session's orders")], default="load_last_3")

    def get_choosed_session(self, session_limit_conf, config_id):
        session_ids = []
        if session_limit_conf == 'load_last_3':
            PosSession = self.env['pos.session'].search([], order="id desc", limit=3)
            for session in PosSession:
                session_ids.append(session.id)
        elif session_limit_conf == 'load_last_5':
            PosSession = self.env['pos.session'].search([], order="id desc", limit=5)
            for session in PosSession:
                session_ids.append(session.id)
        else:
            PosSession = self.env['pos.session'].search([])
            for session in PosSession:
                session_ids.append(session.id)
        return session_ids


class PosOrder(models.Model):
    _inherit = 'pos.order'

    def get_orders_according_to_selected_option(self, session_limit_conf, config_id):
        orders = {}
        ConfigObj = self.env['pos.config'].browse(config_id)
        session_ids = ConfigObj.get_choosed_session(session_limit_conf, config_id)
        PosOrders = self.env['pos.order'].search([('session_id', 'in', session_ids)])
        user_tz = pytz.timezone(self.env.context.get('tz') or self.env.user.tz)

        i = 0
        for order in PosOrders:
            lines = {}
            j = 0
            for line in order.lines:
                lines.update({j: {
                    'id': line.id,
                    'product': line.full_product_name,
                    'product_id': line.product_id.id,
                    'discount': line.discount,
                    'qty': line.qty,
                    'partnerid': order.partner_id.id if order.partner_id else False,
                }
                })

                j += 1
            date_order = pytz.utc.localize(order.date_order).astimezone(user_tz)
            orders.update({i: {
                'id': order.id,
                'name': order.name,
                'date_order': date_order,
                'partner_id': order.partner_id.name if order.partner_id else "",
                'partnerid': order.partner_id.id if order.partner_id else False,
                'client_phone': order.partner_id.phone if order.partner_id.phone else "",
                'lines': lines,
                'pos_reference': order.pos_reference,
                'amount_total': "{:.2f}".format(order.amount_total),
                'amount_tax': "{:.2f}".format(order.amount_tax),
                'currency_id': order.currency_id.symbol,
                'currency_position': order.currency_id.position
            }
            })
            i += 1
        return orders

    def get_details(self, ref):
        order_id = self.env['pos.order'].sudo().search([('pos_reference', '=', ref)], limit=1)
        return order_id.ids

    def get_orderlines(self, ref):
        discount = 0
        result = []
        product_taxes = []
        order_id = self.search([('pos_reference', '=', ref)], limit=1)
        lines = self.env['pos.order.line'].search([('order_id', '=', order_id.id)])
        payment_lines = []
        change = order_id.amount_return
        for i in order_id.payment_ids:
            if i.amount > 0:
                temp = {
                    'amount': i.amount,
                    'name': i.payment_method_id.name
                }
                payment_lines.append(temp)
        i = 1
        for line in lines:
            new_vals = {
                'product_id': line.full_product_name,
                'qty': line.qty,
                'price_unit': line.price_unit,
                'price_subtotal': line.price_subtotal,
                'price_subtotal_incl': line.price_subtotal_incl,
                'discount': line.discount,
            }
            discount += (line.price_unit * line.qty * line.discount) / 100
            result.append(new_vals)

            ##taxes
            if line.product_id.taxes_id:
                price = line.price_unit * (1 - (line.discount or 0.0) / 100.0)
                taxes = line.product_id.taxes_id.compute_all(price, line.order_id.pricelist_id.currency_id, line.qty,
                                                             product=line.product_id, partner=False)
                for tax in taxes['taxes']:
                    product_taxes.append(tax)
            i += 1
        return [result, discount, payment_lines, change, product_taxes]
