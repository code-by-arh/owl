/** @odoo-module  */

import { useBus, useService } from "@web/core/utils/hooks";
import { KanbanController } from "@web/views/kanban/kanban_controller";
import {  onWillStart, useState, onWillUnmount, onMounted, onWillDestroy, onRendered} from "@odoo/owl";

export class WoKanbanController extends KanbanController {
    static template = "owl_kanban_realtime.WOKanbanController";

    setup() {
        super.setup();
        console.log('setup WOKanbanController in addon...')
        this.state = useState({
            isLoading: false,
            activeRequests: 0,
            ticker:0,
        });

        onMounted(()=>{
            console.log('onMounted')
            this.listener=this.onMessage.bind(this)
            this.busService = this.env.services.bus_service
            this.channel = "mrp.workorder"
            this.busService.addChannel(this.channel)
            this.busService.addEventListener("notification", this.listener)
        });

        // Clean up the interval when the component is destroyed
        onWillUnmount(() => {
            console.log('onWillUnmount')
            this.busService.removeEventListener("notification", this.listener)
        });

        onWillStart(()=>{
            console.log('onWillStart..')
        });

        onRendered(()=>{
            console.log('onrendered this.state.isLoading', this.state.isLoading, 'this.state.activeRequests', this.state.activeRequests)
        });
    }

    onMessage({ detail: notifications }) {
        console.log('onMessage notifications.length',notifications.length, 'this.state.isLoading', this.state.isLoading, 'this.state.activeRequests', this.state.activeRequests)

        this.updateTicker()
        notifications = notifications.filter(item => item.payload.channel === this.channel)
        if (notifications.length>0 && !this.state.isLoading){
            this.updateKanban();
        }
    }

    async updateKanban(data) {
        this.state.activeRequests++;
        this.state.isLoading = true;
        try {
            return await this.model.load({
                groupBy: this.props.groupBy,
                domain: this.props.domain,
                orderBy: this.props.orderBy
            })
        } catch(e){
            console.error(e)
        } finally {
            this.state.activeRequests--;
            this.state.isLoading = this.state.activeRequests > 0;
        }
    }

    updateTicker(){
        this.state.ticker +=1;
        let currentTime = new Date();
        var led = $('#led_realtime')
        if (this.state.ticker % 2 == 0){
            led.removeClass('realtime-on')
            led.addClass('realtime-off')
        }
        else{
            led.removeClass('realtime-off')
            led.addClass('realtime-on')
        }
        let formattedTime = this.formatDate(currentTime)
        this.state.last_check = formattedTime
        led.attr('title', this.state.last_check)
    }

    formatDate(currentTime){
        let formattedTime = currentTime.getUTCFullYear() + "-" +
            String(currentTime.getUTCMonth() + 1).padStart(2, '0') + "-" +
            String(currentTime.getUTCDate()).padStart(2, '0') + " " +
            String(currentTime.getUTCHours()).padStart(2, '0') + ":" +
            String(currentTime.getUTCMinutes()).padStart(2, '0') + ":" +
            String(currentTime.getUTCSeconds()).padStart(2, '0') ;
        return formattedTime
    }

    get progressBarAggregateFields() {
        const res = super.progressBarAggregateFields;
        const progressAttributes = this.props.archInfo.progressAttributes;
        if (progressAttributes && progressAttributes.duration_expected_sum_field) {
            res.push(progressAttributes.duration_expected_sum_field);
        }
        return res;
    }

}
