/** @odoo-module */

import { registry } from "@web/core/registry"
import {useService} from '@web/core/utils/hooks';
import { Component, onWillStart, onMounted, useRef, useState, useSubEnv } from "@odoo/owl"
import { loadJS, loadCSS} from '@web/core/assets'

export class TreeReport extends Component {
    static template = "owl_treegrid.TreeReport"

    setup(){
        this.state = useState({
            selectedRow: false,
            childNumber: 0,
            collapsedRows: [],
            uoms:[],
            report:{
                report_id: this.props.action.context.report_id,
                name: this.props.action.name
            }
        })
        this.orm = useService("orm")
        this.taskModel = "report.task"
        this.uomModel = "uom.uom"
        this.ui = useService("ui");
        this.action = useService('action')

        //treegrid
        this.treegridDiv = useRef('treegrid') //query selector
        this.treegrid = false

        //notif
        this.notif = useService("notification");
        
        onWillStart(async ()=>{
            await loadJS( '/owl_treegrid/static/lib/gridpack_trial/codebase/gridpack.js')
            await loadCSS('/owl_treegrid/static/lib/gridpack_trial/codebase/gridpack.css')
        })

        onMounted(()=>{
            this.setupTreegrid()            
        })
    }

    setupTreegrid(){
        const self = this
        var columns = [
            { 
                id: "text", minWidth: 250, 
                header: [{ text: "Code" }, { content: "inputFilter" }], 
                gravity: 1.5, editable: false,
                tooltipTemplate: (cell, row, col) => `${row.text}-${row.description}`,
            },
            { id: "description", maxWidth: 350, type: "string", header: [{ text: "Description" }, { content: "inputFilter" }], resizable: true},
            { id: "level", minWidth: 50, type: "number", header: [{ text: "Level" , rowspan:2}], editable: false, resizable: true},
            { id: "debit", type: "number", header: [{ text: "Debit" , rowspan:2}], editable: false, resizable: true},
            { id: "credit", type: "number", header: [{ text: "Credit" , rowspan:2}], editable: false, resizable: true},
            { id: "balance", type: "number", header: [{ text: "Balance" , rowspan:2}], editable: false, resizable: true},

        ]

        this.treegrid = new dhx.Grid(this.treegridDiv.el, {
            type: "tree",
            columns: columns,
            headerRowHeight: 30,
            height: 600,  
            rowHeight: 28,
            css: "custom",
            editable: true,
            adjust: true,
            leftSplit: 2,
            selection: "row",
            eventHandlers: { 
                onclick: { 
                    "dhx_checkbox--check-all": function(event, data) {
                        this.treegrid.data.forEach(row => {
                            this.treegrid.data.update(row.id, {
                                [data.col.id]: event.target.checked,
                            });
                        });
                    }
                },
            },
            rowCss: function (row) {
                return row.level <= self.state.report.level_penagihan ? "my_custom_row" : ""
            },
        })

        this.treegrid.events.on("afterEditEnd", async function(value,row,column){
            // your logic here
            self.state.selectedRow = row

            if(value && row.level>=self.state.report.level_penagihan){
                const data = {
                    "description": row.description,
                    "uom_id": parseInt(row.satuan),
                    
                    "volume": row.volume,                    //Volume Kontrak  
                    "harga_satuan": row.harga_satuan,        //Harga Satuan kontrak

                    "harga_satuan_rbp": row.harga_satuan_rbp, //Harga Satuan FHT
                    
                    "volume_rbp_master": row.volume_rbp_master, //Volume rbp master
                    "harga_satuan_rbp_master": row.harga_satuan_rbp_master, //Harga Satuan master
                    
                    "volume_rbp_bod": row.volume_rbp_bod,                    //Volume BOD  
                    "harga_satuan_rbp_bod": row.harga_satuan_rbp_bod, //Harga Satuan BOD
                    
                    "volume_si": row.volume_si,                    //Volume SI  
                    "harga_satuan_pendapatan": row.harga_satuan_pendapatan, //Harga Satuan Pendapatan
                    "harga_satuan_si": row.harga_satuan_si, //Harga Satuan SI

                    "volume_update_budget":row.volume_update_budget, // volumen update budget
                    "harga_satuan_update_budget":row.harga_satuan_update_budget, // harga_satuan_update_budget

                    "pfc35_estimasi_sisa":row.pfc35_estimasi_sisa, // pfc35_estimasi_sisa
                    "pfc70_estimasi_sisa":row.pfc70_estimasi_sisa, // pfc70_estimasi_sisa
                    "pfc100_estimasi_sisa":row.pfc100_estimasi_sisa, // pfc100_estimasi_sisa
                }
                await self.orm.write(self.taskModel, [ parseInt(row.id) ], data)
                self.treegridReload()
            }
            else{
                self.treegrid.paint()
            }
        });

        this.treegrid.selection.events.on("afterSelect", function(row, col){
            self.state.selectedRow = row
            self.state.childNumber=0
        });

        this.treegrid.events.on("afterCollapse", function(rowId) {
            // your logic here
            if (self.state.collapsedRows.indexOf(rowId) === -1)
                self.state.collapsedRows.push(rowId)

            console.log(self.state.collapsedRows)
        }); 

        this.treegrid.events.on("afterExpand", function(rowId) {
            // your logic here
            const index = self.state.collapsedRows.indexOf(rowId);
            if (index > -1) { // only splice array when item is found
                self.state.collapsedRows.splice(index, 1); // 2nd parameter means remove one item only
            }
            console.log(self.state.collapsedRows)
        });

        this.treegrid.events.on("cellDblClick", function(row,column,e){
            // your logic here
            // console.log('doubleclick', column.id)
            if (column.id == 'text'){
                const id=row.id
                if(typeof(id)=='string' && id.includes("p"))
                    self.openProjectForm(parseInt(id.replace("p","")))
                else
                    self.openTaskForm(id)
                // self.openTaskForm()
            }

        });

        this.treegrid.events.on("cellMouseOver", function(row,column,e){
            // your logic here
            if (column.id == 'text'){

                self.treegrid.data._order.forEach(element => {
                    self.treegrid.removeCellCss(element.id, "text", "myCustomClass");
                    
                });
                self.treegrid.addCellCss(row.id, "text", "myCustomClass");
            }
            else{
                self.treegrid.removeCellCss(row.id, "text", "myCustomClass");
            }
        });

        this.treegridReload()        
    }

    treegridExpandAll() {
        this.treegrid.expandAll();
    }

    async treegridReload(){
        this.ui.block();
        var self = this
        await this.treegrid.data.load('/tree_grid/load/'+this.state.report.report_id)
        this.state.collapsedRows.forEach(function(rowId){
            self.treegrid.collapse(rowId)
        })


        //margin cell

        this.treegrid.data._order.forEach(element => {
            // console.log(element.margin_sd, element.id)
            if(element.margin_sd>0){
                self.treegrid.removeCellCss(element.id, "margin_sd", "margin_minus");
                self.treegrid.addCellCss(element.id, "margin_sd", "margin_plus");
            }
            else{
                self.treegrid.removeCellCss(element.id, "margin_sd", "margin_plus");
                self.treegrid.addCellCss(element.id, "margin_sd", "margin_minus");
            }

            if(element.margin>0){
                self.treegrid.removeCellCss(element.id, "margin", "margin_minus");
                self.treegrid.addCellCss(element.id, "margin", "margin_plus");
            }
            else{
                self.treegrid.removeCellCss(element.id, "margin", "margin_plus");
                self.treegrid.addCellCss(element.id, "margin", "margin_minus");
            }            
            if(element.margin_bod>0){
                self.treegrid.removeCellCss(element.id, "margin_bod", "margin_minus");
                self.treegrid.addCellCss(element.id, "margin_bod", "margin_plus");
            }
            else{
                self.treegrid.removeCellCss(element.id, "margin_bod", "margin_plus");
                self.treegrid.addCellCss(element.id, "margin_bod", "margin_minus");
            }
            
        });


        this.ui.unblock();

    }
    
    treegridCollapseAll() {
        this.treegrid.collapseAll();
    }

    treegridExportXlSx() {
        this.treegrid.export.xlsx({
            url: "//export.dhtmlx.com/excel"
        });
    }

    treegridExportCsv() {
        this.treegrid.export.csv();
    }
}

registry.category("actions").add("tree_report", TreeReport)