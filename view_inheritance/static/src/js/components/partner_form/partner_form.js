/** @odoo-module **/

import {registry} from '@web/core/registry';
import { formView } from '@web/views/form/form_view';
import { FormController } from '@web/views/form/form_controller';
import { useService } from '@web/core/utils/hooks'

class ResPartnerFormController extends FormController {
    static template='view_inheritance.ResPartnerForm'
    setup(){
        super.setup()
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

// ResPartnerFormController.template='view_inheritance.ResPartnerForm'

export const resPartnerFormView = {
    ...formView,
    Controller: ResPartnerFormController,
}

registry.category('views').add('res_partner_form_view', resPartnerFormView)
