import { _decorator, animation, AnimationComponent, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FruitOrderUI')
export class FruitOrderUI extends Component {
    
    @property(Label)
    public amount_label: Label;
    private occupied: boolean = false;

    @property(Node)
    public fruit_sprite: Node;

    private idle_animation_list: string[] = [
        "apple_idle",
        "orange_idle",
        "lemon_idle",
        "pear_idle",
        "strawberry_idle",
        "watermelon_idle"
    ]
    private idle_anim: string;
    private fruit_sprite_animation_component: AnimationComponent;
    private animation_playing: boolean = false;
    
    protected start(): void {
        this.fruit_sprite_animation_component = this.fruit_sprite.getComponent(AnimationComponent);
        this.reset_ui();
    }
    
    public set_label_amount(amount_completed: number, original_amount:number): void{
        this.amount_label.string = amount_completed.toString() + "/" + original_amount;
    }
    
    public get_occupied(): boolean {
        return this.occupied;
    }
    
    public reset_ui(): void {
        this.occupied = false;
        this.amount_label.string = "0/0";
        this.animation_playing = false;
    }
    
    public set_animation(fruit_name: string): void {
        for (let i = 0; i < this.idle_animation_list.length; i++) {
            if (this.idle_animation_list[i].includes(fruit_name)) {
                this.idle_anim = this.idle_animation_list[i];
                this.fruit_sprite_animation_component.play(this.idle_anim);
                this.animation_playing = true;
                break;
            }
        }

        
        
    }
    
    update(deltaTimer: number): void {
        if (this.animation_playing == false && Math.random() > 0.5) {
            this.fruit_sprite_animation_component.play(this.idle_anim);
            this.animation_playing = true;
        } else {
            if(Math.random() > 0.99) {
                this.fruit_sprite_animation_component.stop();
                this.animation_playing = false;
            }
        }
        
    }
}


