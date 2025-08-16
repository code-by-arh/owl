/** @odoo-module */

import { registry } from "@web/core/registry"
const { Component, onWillStart, onMounted, useRef,useState } = owl
import { loadJS, loadCSS} from '@web/core/assets'

export class PhoneValidation extends Component {
    static template = "owl_phone_validation.PhoneValidation"
    setup(){
        console.log("Owl owl_phone_validation External Lib")

        this.phone = useRef('phone') //query selector
        this.iti = undefined

        this.state = useState({
            phoneValid:undefined
        })

        onWillStart(async ()=>{
            await loadJS('https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/intlTelInput.min.js')
            await loadCSS('https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/css/intlTelInput.css')
        })

        onMounted(()=>{
            //check initialized ?
            console.log('intlTelInput',intlTelInput)
            this.iti = intlTelInput(this.phone.el, {
                utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js",
            })
        })
    }

    validate(){
        console.log(this.phone.el)
        if(this.iti.isValidNumber()){
            console.log('phone is valid')
            this.state.phoneValid=true
        }else{
            console.log('phone is not valid')
            this.state.phoneValid=false
        }
    }
}


registry.category("actions").add("owl_phone_validation", PhoneValidation)