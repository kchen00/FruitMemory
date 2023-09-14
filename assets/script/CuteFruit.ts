import { _decorator, animation, AnimationClip, AnimationComponent, Component, ConeCollider, EventTouch, Input, lerp, random, Size, Sprite, Vec2, Vec3, view, View } from 'cc';
const { ccclass, property } = _decorator;

enum state{RUN, IDLE}

@ccclass('CuteFruit')
export class CuteFruit extends Component {
    @property(Sprite)
    public fruit_sprite: Sprite;

    @property(Number)
    public min_speed = 40;
    @property(Number)
    public max_speed = 50;
    private speed: number;

    private possible_state: state[] = [state.IDLE, state.RUN];
    private current_state: state = state.IDLE;
    private state_timer: number = 0

    private run_direction: Vec3[] = [
        new Vec3(0, 1, 0),   // Up
        new Vec3(1, 0, 0),   // Right
        new Vec3(0, -1, 0),  // Down
        new Vec3(-1, 0, 0),  // Left
        new Vec3(1, 1, 0),   // Up-Right
        new Vec3(1, -1, 0),  // Down-Right
        new Vec3(-1, 1, 0),  // Up-Left
        new Vec3(-1, -1, 0)  // Down-Left
    ]

    private random_direction: Vec3;

    private random_fruit: string [] = [
        "apple",
        "orange",
        "lemon",
        "pear",
        "strawberry",
        "watermelon",
        
    ]
    private fruit_name: string;

    private run_animation_list: string[] = [
        "apple_running",
        "orange_running",
        "lemon_running",
        "pear_running",
        "strawberry_running",
        "watermelon_running"
    ]

    private idle_animation_list: string[] = [
        "apple_idle",
        "orange_idle",
        "lemon_idle",
        "pear_idle",
        "strawberry_idle",
        "watermelon_idle"
    ]

    private choosen_running_anim: string;
    private choosen_idle_anim: string;



    private screen_size: Size = view.getVisibleSize();
    private animation_component: AnimationComponent;
    private animation_playing: boolean = false

    
    start() {
        this.animation_component = this.fruit_sprite.getComponent(AnimationComponent);
        this.randomize()
        // choose random direction to run
        this.random_direction = this.run_direction[Math.floor(Math.random() * this.run_direction.length)];
        this.random_direction.multiplyScalar(this.speed);

    }

    private is_out_of_screen(node_pos: Vec3): boolean {
        if(node_pos.x > this.screen_size.width + 20 || node_pos.y > this.screen_size.height + 20) {
            return true;
        }
        return false;
    }

    private set_animation(): void{

        for (let i = 0; i < this.random_fruit.length; i++) {
            if (this.idle_animation_list[i].includes(this.fruit_name)) {
                this.choosen_idle_anim = this.idle_animation_list[i];
            }

        }

        for (let i = 0; i < this.random_fruit.length; i++) {
            if (this.run_animation_list[i].includes(this.fruit_name)) {
                this.choosen_running_anim = this.run_animation_list[i];
            }
        }

        this.animation_playing = false;
        
    }

    private touched(): void {
        this.randomize();
    }

    private randomize(): void {
        this.fruit_name = this.random_fruit[Math.floor(Math.random() * this.random_fruit.length)];
        let random_scale: number = Math.floor(1 + Math.random() * (5 - 1));
        this.node.scale = new Vec3(random_scale, random_scale, 1);
        this.speed = Math.floor(this.min_speed + Math.random() * (this.max_speed - this.min_speed));
        this.speed /= random_scale;
        this.current_state = Math.floor(Math.random() * this.possible_state.length);
        this.set_animation()
    }

    update(deltaTime: number) {
        this.state_timer += deltaTime;
        this.node.on(Input.EventType.TOUCH_START, this.touched, this);
        
        if (this.state_timer >= 5) {
            this.current_state = Math.floor(Math.random() * this.possible_state.length);
            this.animation_playing = false;
        
        
            this.state_timer = 0;
        }
        
        switch(this.current_state) {
            case state.RUN:
                let current_position: Vec3 = this.node.getWorldPosition();
                let new_position: Vec3 = current_position.add(new Vec3(1, 0, 0).multiplyScalar(this.speed * deltaTime));
                this.node.setWorldPosition(new_position);
                
                if (this.is_out_of_screen(this.node.worldPosition)) {
                    this.randomize()
                    this.node.setWorldPosition(new Vec3(-100, Math.random() * this.screen_size.height, 0));
                }

                if(this.animation_playing == false) {
                    this.animation_component.play(this.choosen_running_anim);
                    this.animation_playing = true;
                }

                break;

            case state.IDLE:
                if(this.animation_playing == false) {
                    this.animation_component.play(this.choosen_idle_anim);
                    this.animation_playing = true;
                }
                break;
        }

    }
}


