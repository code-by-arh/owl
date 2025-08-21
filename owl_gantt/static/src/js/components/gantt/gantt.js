/** @odoo-module */

import { registry } from "@web/core/registry"
import { useService } from "@web/core/utils/hooks"
import { Component, onWillStart, onMounted, useRef, useState } from "@odoo/owl"
import { loadJS, loadCSS} from '@web/core/assets'
import { cookie } from "@web/core/browser/cookie";

export class GanttView extends Component {
    static template = 'owl_gantt.GanttView';
    setup(){
        
        //declare action service for navigation 
        this.action = useService('action')

        // declare state variables
        this.state = useState({
            closedIds: [],
            project:{}
        })     
        
        // save actions' parameter if exists from python to state variable and cookies
        // or get it from cookies
        if (this.props.action.project_id){
            this.state.project = {
                project_id            : this.props.action.project_id,
                project_name          : this.props.action.project_name,
                project_description   : this.props.action.project_description,
                project_display       : this.props.action.display,
                action_name           : this.props.action.name,
                project_action_id     : this.props.action.project_action_id
            }  
            cookie.set("project",JSON.stringify(this.state.project));

        } else {
            var project=JSON.parse(cookie.get('project'))
            if(project){
                this.state.project = project
            } else {
                console.log('no project....')
            }
        }        

        // define zoom configurations
        this.zoomConfig = {
            levels: [
                // days
                {
                    name:"day",
                    scale_height: 27,
                    scales:[
                        {unit: "day", step: 1, format: "%d %M"}
                    ]
                },
                // weeks
                {
                    name:"week",
                    scale_height: 50,
                    scales:[
                        {unit: "week", step: 1, format: (date)=>{
                            var dateToStr = gantt.date.date_to_str("%d %M");
                            var endDate = gantt.date.add(date, -6, "day");
                            var weekNum = gantt.date.date_to_str("%W")(date);
                            return "#" + weekNum + ", " + dateToStr(date) + " - " + dateToStr(endDate);
                        }},
                        {unit: "day", step: 1, format: "%j %D"}
                    ]
                },
                // months
                {
                    name:"month",
                    scale_height: 50,
                    scales:[
                        {unit: "month", step: 1, format: "%M %Y"},
                    ]
                },
                // years
                {
                    name:"year",
                    scale_height: 50,
                    scales:[
                        {unit: "year", step: 1, 
                        format: (date)=>{
                            var dateToStr = gantt.date.date_to_str("%Y");
                            var endDate = gantt.date.add(gantt.date.add(date, 1, "year"), -1, "day");
                            return dateToStr(endDate);
                            // return dateToStr(date) + " - " + dateToStr(endDate);
                        }
                    }
                    ]
                },
            ],
            element: function(){
                return gantt.$root.querySelector(".gantt_task");
            }
        };
        
        //fing ganttDiv element by query selector
        this.ganttDiv = useRef('ganttDiv') 

        onWillStart(async ()=>{
            await loadJS( '/owl_gantt/static/lib/gantt/dhtmlxgantt.js')
            await loadCSS('/owl_gantt/static/lib/gantt/dhtmlxgantt.css')
        })

        onMounted(()=>{
            const self = this
            
            gantt.config.date_format = "%Y-%m-%d %H:%i";
            gantt.setSkin("broadway");
            // gantt.setSkin("meadow");

            // -- set task header color
            gantt.templates.grid_row_class = function (start, end, item) {
                return item.$level == 1 ? "gantt_project" : ""
            };
            gantt.templates.task_row_class = function (start, end, item) {
                return item.$level == 1 ? "gantt_project" : ""
            };
            gantt.templates.task_class = function (start, end, item) {
                return item.$level == 1 ? "gantt_project" : ""
            };

            gantt.config.columns = [
                {name: "text", label: "Taks", tree: true, width: 280, resize: true},
                {name: "description", label: "Description", width: 170, resize: true},
                {name: "start_date", label: "Start Date", align: "center", width: 75, resize: true},
                {name: "end_date", label: "End Date", align: "center", width: 75, resize: true},
                {name: "duration", align: "center", width: 70, resize: true},
                {name: "level", label:"Level", align: "center", width: 40, resize: true},
                {name: "add", width: 40}

            ];

            // -- layout grid + gantt

            // gantt.config.layout = {
            //     //css: "gantt_container",
            //     cols: [
            //         {
            //             width: 840,
            //             min_width: 840,
            //             rows:[
            //                 {view: "grid", scrollX: "gridScroll", scrollable: true, scrollY: "scrollVer"},
            //                 {view: "scrollbar", id: "gridScroll", group:"horizontal"}
            //             ]
            //         },
            //         {resizer: true, width: 5},
            //         {
            //             rows:[
            //                 {view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer"},
            //                 {view: "scrollbar", id: "scrollHor", group:"horizontal"}
            //             ]
            //         },
            //         {view: "scrollbar", id: "scrollVer"}
            //     ]
            // };

            // gantt.config.lightbox.sections = [
            //     {label: "Description", name: "description", height: 40, map_to: "description", type: "textarea", focus: true},
            //     {label: "Predecessors", name: "predecessors", height: 40, map_to: "predecessors", type: "textarea"},
            //     {label: "Time period", name: "time", height: 40, map_to: "auto", type: "duration"},
            // ];

            // gantt.attachEvent("onGanttReady", function(){
            //     gantt.config.buttons_right = ["gantt_save_btn","gantt_cancel_btn","view_detail"];   
            //     gantt.config.buttons_left = ["gantt_delete_btn"];               
            // });

            // gantt.locale.labels["view_detail"] = "View Detail";

            // gantt.attachEvent("onLightboxButton", function(button_id, node, e){
            //     if(button_id == "view_detail"){
            //         var id = gantt.getState().lightbox;
            //         console.log(id)
            //         if(id==null)
            //             return

            //         if(typeof(id)=='string' && id.includes("p"))
            //             self.openProjectForm(parseInt(id.replace("p","")))
            //         else
            //             self.openTaskForm(id)
            //         gantt.hideLightbox();
            //     }
            // });

            // --- save closed tasks
            // gantt.attachEvent("onTaskClosed",  function(id) {
            //     self.state.closedIds.push(id)
            //     console.log(self.state.closedIds)
            // });

            // --- remove closed tasks
            // gantt.attachEvent("onTaskOpened",  function(id) {
            //     const x = self.state.closedIds.indexOf(id)
            //     self.state.closedIds.splice(x, 1)
            //     console.log(self.state.closedIds)
            // });       
                 
            //-- quixk info buttons
            // gantt.config.quickinfo_buttons=["icon_edit","advanced_details_button"];

            //--- grid row classes
            // gantt.templates.grid_row_class = function( start, end, task ){
            //     console.log(parseInt(task.rbp))
            //     if ( task.$level < self.editable_level ){                    
            //         return "nested_task"
            //     } 
            //     else if(task.realisasi>=75 && task.realisasi<90){
            //         return "orange_color"
            //     } 
            //     else if(task.realisasi>=90){
            //         return "red_color"
            //     }
                
            //     return "";
            // };

            // ----- init gantt object
            
            gantt.init(this.ganttDiv.el)
            gantt.ext.zoom.init(this.zoomConfig);
            
            // -- load data
            gantt.clearAll(); 
            gantt.load("/gantt/load/"+ this.state.project.project_id)

            const server = '/gantt/data'

            var dp = gantt.createDataProcessor(function(entity, action, data, id) { 
                switch(action) {
                    case "create":
                        return gantt.ajax.post(
                            server + "/" + entity,
                            data
                        ).then(function(res){
                            const task = JSON.parse(res.response)
                            if(task.action=="inserted"){
                                // var newTask = gantt.getTask(id)
                                // var tid = task.data.tid
                                // newTask.text = task.data.name; //changes task's data
                                // newTask.level = task.data.hierarchy_level; //changes task's data
                                // gantt.changeTaskId(id, tid); //changes the task's id '10 -> 15'
                                // gantt.refreshTask(tid); //renders the updated task
                            } else if (task.action=="exist"){
                                alert('Task exists')
                                gantt.deleteTask(id)
                            }
                        }).then(function(res){
                            console.log(res)
                        });
                        break;
                    case "update":
                       return gantt.ajax.put(
                             server + "/" + entity + "/" + id,
                             data
                        );
                        break;
                    case "delete":
                       return gantt.ajax.del(
                             server + "/" + entity + "/" + id
                       );
                        break;
               }
            });

            gantt.ext.zoom.setLevel("month");
        })
    }

    collapseAll() {
        console.log(gantt)
        gantt.batchUpdate(function () {
            gantt.eachTask(function (task) {
                gantt.close(task.id)
            })
        })
    }
     
    expandAll() {
        gantt.batchUpdate(function () {
            gantt.eachTask(function (task) {
                gantt.open(task.id)
            })
        })
    }
    
    openTaskForm(id){
        this.action.doAction({
            type: "ir.actions.act_window",
            name: "Task",
            res_model: "project.task",
            res_id: parseInt(id),
            domain:[],
            context: {
                'active_id': parseInt(id),
                'toggle_active': true,
            },
            views:[
                [false, "form"],
            ],
            view_mode:"form",
            target: "new"
        })        
    }

    openProjectForm(id){
        this.action.doAction({
            type: "ir.actions.act_window",
            name: "Project",
            res_model: "project.project",
            res_id: parseInt(id),
            domain:[],
            context: {
                'active_id': parseInt(id),
                'toggle_active': true,
            },
            views:[
                [false, "form"],
            ],
            view_mode:"form",
            target: "new"
        })        
    }

    reload(){
        gantt.clearAll(); 
        gantt.load("/gantt/load/"+ this.state.project.project_id)
    }

    zoomYear(){
        gantt.ext.zoom.setLevel("year");
    }

    zoomMonth(){
        gantt.ext.zoom.setLevel("month");
    }

    zoomOut(){
        gantt.ext.zoom.zoomOut();
    }

    zoomIn(){
        gantt.ext.zoom.zoomIn();
    }
}

registry.category("actions").add("owl_gantt", GanttView);

function getLinkTypeLabel(type) {
    switch (type) {
        case "0": return "FS"; // Finish to Start
        case "1": return "SS"; // Start to Start
        case "2": return "FF"; // Finish to Finish
        case "3": return "SF"; // Start to Finish
        default: return "FS";  // default safe
    }
}