/** @odoo-module **/

import { registry } from '@web/core/registry'
import { CharField } from '@web/views/fields/char/char_field' // ref web/static/src/views/fields
class UsernameField extends CharField {
    setup(){
        super.setup()
        console.log('char field inherited')
        
        //to get the props
        //console.log(this.props)
    }


    get emailDomain(){
        const { email } = this.props.record.data// full record
        return email ? email.split('@')[1] : ''
    }
}
// 
UsernameField.template = 'vit_owl_todo.UsernameField'
UsernameField.supportedTypes = ['char']
UsernameField.components = { CharField }

registry.category('fields').add('username', UsernameField)