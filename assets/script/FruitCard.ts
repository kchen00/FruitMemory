import { _decorator, AnimationComponent, Color, Component, Game, Label, Layout, MotionStreak, Node, ParticleSystem2D, size, Size, Sprite, SpriteFrame, UIOpacity, UITransform, Vec2, Vec3 } from 'cc';
import { Fruit } from './Fruit';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('FruitCard')
export class FruitCard extends Component {
    public assigned_fruit: Fruit;

    @property(Node)
    public game_manager: Node;
    private monitor_touch: boolean = false;

    @property(Number)
    public show_time: number = 30;
    private countdown_time: boolean = true
    private elasped_time: number = 0;

    @property(Node)
    public fruit_sprite: Node;
    @property(SpriteFrame)
    public sprite_frames: SpriteFrame[] = [];
    @property(SpriteFrame)
    public question_mark_frame: SpriteFrame;
    private choosen_frame: SpriteFrame;

    private rotting_rate: number = 0;
    public is_rotten: boolean = false;

    start() {
        console.log("received fruit:  " + this.assigned_fruit.fruit_name);
    }


    //  get the coressponding fruit sprite based on the fruit type
    public get_sprite_frame(): void {
        for (let i = 0; i < this.sprite_frames.length; i++) {
            if (this.sprite_frames[i].name.includes(this.assigned_fruit.fruit_name)){
                this.choosen_frame = this.sprite_frames[i];
                this.fruit_sprite.getComponent(Sprite).spriteFrame = this.sprite_frames[i];
            }
        }
    }

    // handle the touch event
    private touch_card(): void {
        if (this.monitor_touch) {
            console.log("touched " + this.assigned_fruit.fruit_name);
            this.show_card();
            // after being touched, contact with game manager and set the touched card
            this.game_manager.getComponent(GameManager).set_selected_card(this.node);
        }
    }

    // set the assigned fruit bby the game manager
    public set_assigned_fruit(assigned_f: Fruit): void {
        this.assigned_fruit = assigned_f;
    }

    //hide the node after successful match
    public hide_after_sucessful(): void {
        this.node.getComponent(UIOpacity).opacity = 0;
        this.monitor_touch = false;
    }

    // hide the card when game start or does not match sucessfully
    public hide_card(): void {
        this.fruit_sprite.getComponent(Sprite).spriteFrame = this.question_mark_frame;
    }

    // show the card after being touched
    public show_card(): void {
        this.node.getComponent(UIOpacity).opacity = 255;
        this.fruit_sprite.getComponent(Sprite).spriteFrame = this.choosen_frame;
    }

    // initialize the card when the game start
    public start_game(): void {
        this.hide_card();
        this.monitor_touch = true;
        this.countdown_time = false
    }

    // increase the rot chance and check if the fruit has become rotten
    public increase_rot(): void {
        this.rotting_rate += 0.1;
        if (Math.random() < this.rotting_rate) {
            console.log("oh no the fruit is rotten");
            this.is_rotten = true
            this.node.getComponent(Sprite).color = new Color(176, 117, 0, 255)
        }
    }

    public reset_card(): void {
        this.rotting_rate = 0;
        this.is_rotten = false;
        this.node.getComponent(Sprite).color = new Color(255, 255, 255, 255)
    }

    update(deltaTime: number) {
        if (this.monitor_touch) {
            this.node.on(Node.EventType.TOUCH_START, this.touch_card, this);
        }
    }

}


