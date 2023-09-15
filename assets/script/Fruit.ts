import { _decorator, Component, Node } from 'cc';
import { CustomerOrder } from './CustomerOrder';
const { ccclass, property } = _decorator;

@ccclass('Fruit')
export class Fruit extends Component {
    // name of the fruit
    public fruit_name: string;
    // how much it contribute to the stock
    public fruit_value: number = 1;
    public fruit_stock: number = 0;


    constructor(f_name: string, f_value: number) {
        super();
        this.fruit_name = f_name;
        // this.fruit_value = f_value;
    }

    // add stock when player sucessfully match 2 cards
    add_stock(how_much:number): void {
        this.fruit_stock += how_much;
        console.log(this.fruit_name + " receives " + how_much + " stocks");
    }

    // take stock from player when seller has demand
    take_stock(fruit_order: CustomerOrder): void {
        // check if the current stock is more than the customer order
        let amount_to_take: number = fruit_order.get_amount();
        if(this.fruit_stock >= amount_to_take) {
            this.fruit_stock -= amount_to_take;
            fruit_order.set_amount(0);
        } else {
            fruit_order.set_amount(amount_to_take - this.fruit_stock);
            this.fruit_stock = 0;
            
        }
        fruit_order.set_amount_taken();


    }

}



