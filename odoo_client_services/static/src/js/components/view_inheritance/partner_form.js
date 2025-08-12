/** @odoo-module **/

import {registry} from '@web/core/registry';
import { formView } from '@web/views/form/form_view';
import { FormController } from '@web/views/form/form_controller';
import { useService } from '@web/core/utils/hooks'

class ResPartnerFormController extends FormController {
    setup(){
        super.setup()
        console.log('inherited form view...')
        this.action = useService('action')
    }

    openWebsite(model){
        console.log(model)
        const url = model.root.data.website
        this.action.doAction({
            type: 'ir.actions.act_url',
            target: 'self',
            url
        })
    }
    
}

ResPartnerFormController.template='vit_owl_todo.ResPartnerForm'

export const resPartnerFormView = {
    ...formView,
    Controller: ResPartnerFormController,
}

registry.category('views').add('res_partner_form_view', resPartnerFormView)
