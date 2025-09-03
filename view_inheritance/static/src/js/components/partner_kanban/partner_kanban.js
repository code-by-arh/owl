/** @odoo-module **/

import {registry} from '@web/core/registry';
import { kanbanView } from '@web/views/kanban/kanban_view';
import { KanbanController } from '@web/views/kanban/kanban_controller';
import { useService } from '@web/core/utils/hooks'
import {  onWillStart} from "@odoo/owl";

class ResPartnerKanbanController extends KanbanController {
    setup(){
        super.setup()
        console.log('inherited kanban view')
        this.action = useService('action')

        //-- side bar
        this.orm = useService('orm')
        onWillStart(async()=>{
            this.customerLocations = await this.orm.readGroup('res.partner', [], ['state_id'], ['state_id'])
            console.log(this.customerLocations)
        })
    }


    selectLocation(state){
        const id= state[0]
        const name= state[1]
        this.model.load({
            domain: [...this.props.domain, ['state_id', '=', id]],
            context: this.props.context,
        });        

    }

    openSalesView(){
        console.log('sales order here..')
        this.action.doAction({
            type:'ir.actions.act_window',
            name:'Customer Sales',
            res_model:'sale.order',
            views:[[false, 'kanban'] , [false,'form']]
        })
    }

    openInvoicesView(){
        console.log('Invoices here..')
        this.action.doAction({
            type:'ir.actions.act_window',
            name:'Invoicing',
            res_model: 'account.move',
            domain: [['move_type', '=', 'out_invoice']],  
            views: [[false, 'kanban'], [false, 'form']],
        })
    }

    openMeetingView(){
        console.log('Meeting here..')
        this.action.doAction({
            type:'ir.actions.act_window',
            name:'Meetings',
            res_model: 'calendar.event',
            views: [[false, 'calendar'], [false, 'form']],
        })
    }

}


//sidebar
ResPartnerKanbanController.template= 'view_inheritance.ResPartnerKanbanView'


export const resPartnerKanbanView = {
    ...kanbanView,
    Controller: ResPartnerKanbanController
}

registry.category('views').add('res_partner_kanban_view', resPartnerKanbanView)
