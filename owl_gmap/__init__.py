# -*- coding: utf-8 -*-

from . import controllers
from . import models

def fix_damaged_actions(env):
    """Fix any actions that were damaged by previous incorrect cleanup"""
    import logging
    logger = logging.getLogger(__name__)
    
    ActWindow = env['ir.actions.act_window']
    
    # Find partner actions that might have been damaged
    damaged_actions = ActWindow.search([
        ('res_model', '=', 'res.partner'),
        '|',
        ('view_mode', '=', 'map'),  # Only map
        ('view_mode', '=', 'kanban,list,form'),  # Missing map that we added before
    ])
    
    for action in damaged_actions:
        # Restore proper view modes based on the action
        if 'customer' in action.name.lower():
            action.view_mode = 'kanban,list,form,map'
        elif 'vendor' in action.name.lower() or 'supplier' in action.name.lower():
            action.view_mode = 'kanban,list,form,map'
        elif 'contact' in action.name.lower():
            action.view_mode = 'kanban,list,form,map'
        else:
            # Default for partner actions
            action.view_mode = 'kanban,list,form,map'
        
        logger.info(f"Fixed damaged action '{action.name}' (ID: {action.id}) - view_mode: {action.view_mode}")
    
    env.cr.commit()

def post_init_hook(env):
    """Add map view to partner actions and ensure it's last"""
    import logging
    logger = logging.getLogger(__name__)
    logger.info('Running post_init_hook to add map views...')
    
    # First, fix any damaged actions from previous incorrect cleanup
    fix_damaged_actions(env)
    
    try:
        # Verify the map view exists
        map_view = env.ref('owl_gmap.res_partner_map_view', raise_if_not_found=False)
        if not map_view:
            logger.error("Map view 'owl_gmap.res_partner_map_view' not found!")
            return
            
        logger.info(f"Found map view: {map_view.name} (ID: {map_view.id})")
            
        ActWindow = env['ir.actions.act_window']
        
        # Target specific actions we want to modify
        action_xmlids = [
            'contacts.action_contacts',  # Contacts
            'base.action_partner_form',  # Contacts
            'base.action_partner_customer_form',  # Customers (generic)
            'base.action_partner_supplier_form',  # Vendors (generic)
            'account.res_partner_action_customer',  # Invoicing -> Customers
            'account.res_partner_action_supplier',  # Purchase -> Vendors
        ]
        
        for xmlid in action_xmlids:
            try:
                action = env.ref(xmlid, raise_if_not_found=False)
                if not action:
                    logger.info(f"Action '{xmlid}' not found, skipping...")
                    continue
                    
                logger.info(f"\nProcessing action '{action.name}' (ID: {action.id})")
                logger.info(f"  Current view_mode: {action.view_mode}")
                
                # Parse current view_mode to ensure we maintain all existing views
                current_views = action.view_mode.split(',') if action.view_mode else []
                
                # Add map if not present
                if 'map' not in current_views:
                    current_views.append('map')
                
                # Ensure map is last
                if 'map' in current_views:
                    current_views.remove('map')
                    current_views.append('map')
                
                # Update view_mode
                new_view_mode = ','.join(current_views)
                if action.view_mode != new_view_mode:
                    action.view_mode = new_view_mode
                    logger.info(f"  Updated view_mode to: {new_view_mode}")
                
                # No need to create ActWindowView records - Odoo handles this automatically
                # when the view_mode is set on the action
                
                # Commit changes
                env.cr.commit()
                logger.info(f"  Successfully processed '{action.name}'")
                            
            except Exception as e:
                logger.error(f"Error processing action '{xmlid}': {e}", exc_info=True)
                    
    except Exception as e:
        logger.error(f"Error in post_init_hook: {e}", exc_info=True)