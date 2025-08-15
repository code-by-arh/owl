/** @odoo-module **/

import { registry } from '@web/core/registry'
import { CharField,charField } from '@web/views/fields/char/char_field' // ref web/static/src/views/fields
class UsernameField extends CharField {
    static template = 'widget_username_field.UsernameField'

    setup(){
        super.setup()
        console.log('char field inherited')
    }

    get emailDomain(){
        const { email } = this.props.record.data // full record
        console.log(email)
        return email ? email.split('@')[1] : ''
    }
}
// 
export const usernameField = {
    ...charField,
    component: UsernameField,
    supportedTypes: ["char"],
};

registry.category('fields').add('username', usernameField)