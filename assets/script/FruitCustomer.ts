import { _decorator, clamp, Component, Label, math, Node, ProgressBar, random, Sprite, UIOpacity } from 'cc';
import { Fruit } from './Fruit';
import { CustomerOrder } from './CustomerOrder';
import { GameManager } from './GameManager';
import { FruitOrderUI } from './FruitOrderUI';
const { ccclass, property } = _decorator;

enum customer_state {
    ORDER_NOT_FULLFILLED, //0
    ORDER_FULLFILLED, //1
    CANCEL_ORDER, //2
    IDLE, //3
    MAKE_ORDER,  //4
    STANDBY, //5
}

// generate demand from player and get fruit from player
@ccclass('FruitCustomer')
export class FruitCustomer extends Component {
    // current state of the sleer
    current_state: customer_state = customer_state.STANDBY;

    // available fruit that this seller can order
    private available_fruit: Fruit[] = [];
    // customer aggresiveness, mofidy customer behaviour, 50% chance of increase for each sucessful order
    private customer_aggresiveness: number = 1;
    
    //default values for customer behaviours
    @property(Number)
    public initial_order_rate: number = 0.5;
    @property(Number)
    public initial_min_demand: number = 1;
    @property(Number)
    public initial_max_demand: number = 10;
    @property(Number)
    public initial_max_wait_time: number = 360;

    private order_rate: number = 0.5
    private min_demand: number = 10;
    private max_demand: number = 50;
    private total_demand: number = 0

    private max_wait_time: number = 20;
    private elaspsed_patience: number = 0;

    @property(Node)
    public fruit_order_ui: Node[] = [];

    public can_order: boolean = false;
    private order_delay: number = 5;
    private order_delay_timer: number = 0;
    private fruit_order: CustomerOrder[] = []; 

    public game_manager: Node

    @property(ProgressBar)
    public customer_temper_bar: ProgressBar;
    @property(Label)
    public customer_patience_countdown: Label;

    

    start() {
        this.order_rate = this.initial_order_rate;
        this.min_demand = this.initial_min_demand;
        this.max_demand = this.initial_max_demand;
        this.max_wait_time = this.initial_max_wait_time;
        this.reset_customer(false);
    }

    // set random amount to get from each fruit
    // then switch state to order not fullfilled
    public order_fruit(how_many_type: number): void{
        if (this.can_order) {
            // choose random fruit to oder
            let choosen_fruit_to_order: Fruit[] = this.game_manager.getComponent(GameManager).selected_fruit_for_this_round.slice();

            // set random amount of fruit to order for each type of fruit, and add to total demand
            for (let i = 0; i < how_many_type; i++) {
                let random_order_amount: number = Math.floor(this.min_demand + Math.random()*(this.max_demand - this.min_demand));
                let new_order: CustomerOrder = new CustomerOrder(choosen_fruit_to_order[i], random_order_amount);
                this.total_demand += random_order_amount;
                this.fruit_order.push(new_order);
            }

            this.can_order = false;
        }
    }

    // setting up the fruit order UI
    private setup_fruit_order_ui(): void {
        for (let i = 0; i < this.fruit_order_ui.length; i++) {
            this.fruit_order_ui[i].active = true;
            if (i < this.fruit_order.length) {
                let order_to_monitor: CustomerOrder = this.fruit_order[i];
                if (order_to_monitor) {
                    let ui_to_use: FruitOrderUI = this.fruit_order_ui[i].getComponent(FruitOrderUI);
                    ui_to_use.set_animation(order_to_monitor.fruit_type.fruit_name);
                }    
            } else {
                this.fruit_order_ui[i].active = false;
            }
            
        }
    }

    // update the fruit order UI
    private update_fruit_order_UI(): void {
        for (let i = 0; i < this.fruit_order_ui.length; i++) {
            let order_to_monitor: CustomerOrder = this.fruit_order[i];
            if (order_to_monitor) {
                let ui_to_use: FruitOrderUI = this.fruit_order_ui[i].getComponent(FruitOrderUI);
                ui_to_use.set_label_amount(order_to_monitor.get_amount_taken(), order_to_monitor.get_initial_amount());
            }
        }
    }

    private take_stock_from_player(): void {
        // check if there is order
        let new_demand_after_stock_taken: number = 0;
        if (this.fruit_order) {
            for (let i = 0; i < this.fruit_order.length; i++){
                let order_to_handle: CustomerOrder = this.fruit_order[i];
                let amount_to_take: number = order_to_handle.get_amount();
                // if the fruit demand is more than 0, take stock from player
                if (amount_to_take > 0){
                    order_to_handle.get_fruit_type().take_stock(order_to_handle);
                    new_demand_after_stock_taken += order_to_handle.get_amount();
                
                }
            }
        }

        this.total_demand = new_demand_after_stock_taken;

    }


    // update the temper bar of the customer
    private update_patience_bar(): void {
        let new_progress: number = 1 - (this.elaspsed_patience/this.max_wait_time);
        // console.log("patience bar current progress: " + new_progress);
        this.customer_temper_bar.progress = new_progress;
    }

    // update the customer temper label countdown
    private update_customer_patience_countdown(): void {
        this.customer_patience_countdown.string = Math.round(this.customer_temper_bar.progress * this.max_wait_time).toString() + "s";
    }

    // reset customer
    // reet order and patience
    // clear oder when order is fullfilled or cancelled
    private reset_customer(switch_to_idle: boolean = true): void {
        console.log("resetting customer")
        this.node.getComponent(UIOpacity).opacity = 0;
        this.fruit_order = [];
        this.total_demand = 0;
        this.elaspsed_patience = 0;
        this.can_order = false
        this.update_patience_bar();
        this.order_delay_timer = 0;
        if (switch_to_idle) {
            this.current_state = customer_state.IDLE;
        } else {
            this.current_state = customer_state.STANDBY;
        }
    }

    //reward player when demand is fullfilled
    private reward_player(): void {
        // calculate the percentage of time taken
        // 1/6, 3x reward
        // 2/6, 2x reward
        // 3/6, 1x reward
        // 4/6, -1x reputation
        // 5/6, -2x reputation
        // >= 6/6, -3x reputation
        let percentage_time_taken: number = this.elaspsed_patience/this.max_wait_time;
        let time_taken_portion: number = Math.floor(percentage_time_taken * 6);
        if(time_taken_portion <= 3) {
            // posibly value of zero, clamp the value
            time_taken_portion = clamp(time_taken_portion, 1, 3);
            // convert the number to the right one
            //1 -> 3, 2 -> 2, 3 -> 1
            time_taken_portion = 4 - time_taken_portion;
            console.log("you got " + time_taken_portion + "x of score and reputation!");
            this.game_manager.getComponent(GameManager).increase_player_reputation(10*time_taken_portion);
            this.game_manager.getComponent(GameManager).increase_player_score(10*time_taken_portion);
        } else {
            // possibly more than 6, clamp the value
            time_taken_portion = clamp(time_taken_portion, 4, 6);
            // convert the number to the right one
            // 4 -> 1, 5 -> 2, 6 -> 3
            time_taken_portion -= 3;
            console.log("you got -" + time_taken_portion + "x of score and reputation!");
            this.game_manager.getComponent(GameManager).decrease_player_reputation(10*time_taken_portion);
        }

    }

    // receive fruit available from game manager and shuffle the list
    public set_available_fruit(available_f: Fruit[]): void {
        console.log("receiving available fruit from game manager");
        this.available_fruit = available_f.slice();
    }

    // allow behavior modification to suit the difficulty
    // using a*e^kt function to determine the increment
    public modify_behavior(): void {
        console.log("customer behavior updated, customer aggresiveness is now " + this.customer_aggresiveness);
        this.min_demand = Math.round(this.initial_min_demand * Math.pow(Math.E, 0.1 * this.customer_aggresiveness));
        this.max_demand = Math.round(this.initial_max_demand * Math.pow(Math.E, 0.1 * this.customer_aggresiveness));
        this.max_wait_time = Math.round(this.initial_max_wait_time * Math.pow(Math.E, -0.8 * this.customer_aggresiveness));
    }

    update(deltaTime: number) {
        switch(this.current_state) {
            case customer_state.STANDBY:
                if (this.can_order) {
                    this.current_state = customer_state.IDLE;
                }
                break;

            case customer_state.IDLE:
                this.order_delay_timer += deltaTime;
                if (this.order_delay_timer >= this.order_delay) {
                    if (math.random() > this.order_rate) {
                        this.can_order = true;
                        this.node.getComponent(UIOpacity).opacity = 255;
                        this.current_state = customer_state.MAKE_ORDER;
                    } else {
                        console.log("cannot order yet");
                    }

                }

                break;

            // clear the previous order and create a new order
            case customer_state.MAKE_ORDER:
                this.fruit_order = [];
                this.order_fruit(this.game_manager.getComponent(GameManager).game_mode);
                this.node.getComponent(UIOpacity).opacity = 255;
                this.setup_fruit_order_ui();
                this.can_order = false;
                this.current_state = customer_state.ORDER_NOT_FULLFILLED;
                break;

            case customer_state.ORDER_NOT_FULLFILLED:
                // when total demand is more than 0, means still have demand that is not yet fulfilled
                // if demand is <= 0 , then demand is fullfilled, switch to order_fulfilled state and reward player
                // when demand is not fullfilled, increase temper
                // increase timer until it reach the max time
                // take stock from player
                this.take_stock_from_player();
                this.update_customer_patience_countdown();
                if (this.total_demand > 0) {
                    this.elaspsed_patience += deltaTime;
                    this.update_patience_bar();
                    this.update_fruit_order_UI();
                    // if (this.elaspsed_patience >= this.max_wait_time) {
                    //     console.log(this.name + " loses all his patience, he left you");
                    //     // this.current_state = customer_state.CANCEL_ORDER;

                    // }
                } else {
                    // else if success, switch state to demand fullfilled
                    console.log(this.node.name + " demand is fullfilled!");
                    this.current_state = customer_state.ORDER_FULLFILLED;
                }
                
                break;

            case customer_state.CANCEL_ORDER:
                console.log(this.name + " cancelled his order");
                this.game_manager.getComponent(GameManager).decrease_player_reputation(10);
                this.reset_customer();
                break;
        
            // reward player, then reset the cutomerm then reset the fruit available next round
            case customer_state.ORDER_FULLFILLED:
                this.reward_player();
                this.reset_customer();
                this.game_manager.getComponent(GameManager).select_random_fruit(this.game_manager.getComponent(GameManager).game_mode);
                if (Math.random() > 0.5) {
                    this.customer_aggresiveness += 0.1;
                    this.modify_behavior();
                }
                break;

        }
    }
}


