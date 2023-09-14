import { _decorator, Component, Node } from 'cc';
import { Fruit } from './Fruit';
const { ccclass, property } = _decorator;

@ccclass('CustomerOrder')
export class CustomerOrder extends Component {
    public fruit_type: Fruit;
    // how much to take
    private amount: number; 
    private initial_amount: number;
    // how much already taken
    private amount_taken: number;

    constructor(f_type: Fruit, how_much: number) {
        super();
        this.fruit_type = f_type;
        this.amount = how_much;
        this.initial_amount = this.amount;
    }

    public get_fruit_type(): Fruit {
        return this.fruit_type;
    }

    public get_amount(): number {
        return this.amount;
    }

    public set_amount(value: number) {
        this.amount = value;
    }

    public set_amount_taken(): void {
        this.amount_taken = this.initial_amount - this.amount;
    }

    public get_amount_taken(): number {
        return this.amount_taken;
    }

    public get_initial_amount(): number {
        return this.initial_amount;
    }

}


