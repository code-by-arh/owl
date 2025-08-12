/** @odoo-module **/

import { registry } from '@web/core/registry'
import { EmailField } from '@web/views/fields/email/email_field' // ref web/static/src/views/fields
class ValidEmailField extends EmailField {
    setup(){
        super.setup()
        console.log('email field inherited')
        
        //to get the props
        //console.log(this.props)
    }


    //getter function: simple cara ambil nilai di XML
    get isValidEmail(){

        //regexp: matching carakter vs pola /pattern
        // abc@foogle.com
        // abc@def com
        // \S+ = non spaca chars >0
        let re = /\S+@\S+\.\S+/;
        return re.test(this.props.value)
    }
}

ValidEmailField.template = 'vit_owl_todo.ValidEmailField'
ValidEmailField.supportedTypes = ['char']

registry.category('fields').add('valid_email', ValidEmailField)