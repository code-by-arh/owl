/** @odoo-module **/

import {registry} from '@web/core/registry';
import { listView } from '@web/views/list/list_view';
import { ListController } from '@web/views/list/list_controller';
import { useService } from '@web/core/utils/hooks'

class ResPartnerListController extends ListController {
    setup(){
        super.setup()
        console.log('inherited list view')
        this.action = useService('action')
    }

    openSalesView(){
        console.log('sales order here..')
        this.action.doAction({
            type:'ir.actions.act_window',
            name:'Customer Sales',
            res_model:'sale.order',
            views:[[false, 'list'] , [false,'form']],
            domain:[],
            context:{},
        })
    }
}

export const resPartnerListView = {
    ...listView,
    Controller: ResPartnerListController,
    buttonTemplate: "view_inheritance.ResPartnerListView.Buttons",
}

registry.category('views').add('res_partner_list_view', resPartnerListView)
