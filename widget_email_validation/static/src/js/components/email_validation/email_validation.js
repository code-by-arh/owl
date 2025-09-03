/** @odoo-module **/

import { registry } from '@web/core/registry'
import { EmailField } from '@web/views/fields/email/email_field' // referensi web/static/src/views/fields/email_field.js

class ValidEmailField extends EmailField {
    static template = 'widget_email_validation.ValidEmailField'
    setup(){
        super.setup()
        console.log('email field inherited')
    }

    get email() {
        return this.props.record.data[this.props.name];
    }

    //getter function: simple cara ambil nilai di XML
    get isValidEmail(){
        let re = /\S+@\S+\.\S+/;
        return re.test(this.email)
    }
}
export const emailField = {
    component: ValidEmailField,
    supportedTypes: ["char"],
};

registry.category('fields').add('valid_email', emailField)