/** @odoo-module */

import { registry } from "@web/core/registry"
import { useService } from "@web/core/utils/hooks"
const { Component, onWillStart, onMounted, useRef,useState } = owl
import { loadJS, loadCSS} from '@web/core/assets'

export class FileUpload extends Component {

    static template = "owl_file_upload.FileUpload"
    setup(){
        console.log("Owl file_upload Lib")

        //fileph
        this.file = useRef('file') //query selector


        onWillStart(async ()=>{

            //filepond
            await loadJS('https://unpkg.com/filepond@^4/dist/filepond.js')
            await loadCSS('https://unpkg.com/filepond@^4/dist/filepond.css')

        })

        onMounted(()=>{
            
            //plugin
            // FilePond.registerPlugin(FilePondPluginImagePreview);

            //filepond
            FilePond.create(this.file.el, {
                allowMultiple: true,
                server :{
                    process: '/filepond/process',
                    revert: '/filepond/revert',
                    fetch: null
                }
            })
        })
    }
}


registry.category("actions").add("file_upload", FileUpload)