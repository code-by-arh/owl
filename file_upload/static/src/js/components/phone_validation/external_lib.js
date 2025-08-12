/** @odoo-module */

import { registry } from "@web/core/registry"
import { useService } from "@web/core/utils/hooks"
const { Component, onWillStart, onMounted, useRef,useState } = owl
import { loadJS, loadCSS} from '@web/core/assets'

export class ExternalLib extends Component {
    setup(){
        console.log("Owl External Lib")

        this.phone = useRef('phone') //query selector
        this.iti

        this.state = useState({
            phoneValid:undefined
        })


        //fileph
        this.file = useRef('file') //query selector


        onWillStart(async ()=>{
            await loadJS('/vit_owl_odoo/static/lib/intlTelInput.js')
            await loadCSS('https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/css/intlTelInput.css')

            //filepond
            await loadJS('https://unpkg.com/filepond@^4/dist/filepond.js')
            await loadCSS('https://unpkg.com/filepond@^4/dist/filepond.css')


            //previe
            await loadCSS('https://unpkg.com/filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css')
            await loadJS('https://unpkg.com/filepond-plugin-image-preview/dist/filepond-plugin-image-preview.js')
        })

        onMounted(()=>{
            //check initialized ?
            console.log('intlTelInput',intlTelInput)
            this.iti = intlTelInput(this.phone.el, {
                utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js",
            })

            //plugin
            FilePond.registerPlugin(FilePondPluginImagePreview);

            //filepond
            FilePond.create(this.file.el, {
                allowMultiple: true,
                server :{
                    process: './filepond/process',
                    revert: './filepond/revert',
                    fetch: null
                }
            })
        })
    }

    validate(){
        if(this.iti.isValidNumber()){
            console.log('phone is valid')
            this.state.phoneValid=true
        }else{
            console.log('phone is not valid')
            this.state.phoneValid=false
        }
    }
}

ExternalLib.template = "vit_owl_todo.ExternalLib"

registry.category("actions").add("vit_owl_todo.ExternalLib", ExternalLib)