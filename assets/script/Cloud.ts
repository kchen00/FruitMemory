import { _decorator, Component, Input, math, Node, random, Size, UIOpacity, UITransform, Vec3, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Cloud')
export class Cloud extends Component {

    private speed: number = 10;
    private screen_size: Size = view.getVisibleSize();

    private n: number = Math.random();
    private opacity_compo: UIOpacity

    start() {
        this.randomize();
        // this.opacity_compo = this.node.getComponent(UIOpacity);
        // this.node.setScale(new Vec3(this.n, this.n, 1));

    }

    private touched(): void {
        this.speed += 10;
    }

    private randomize(): void {
        let random_scale: number = Math.floor(1 + Math.random() * (5 - 1));
        this.node.scale = new Vec3(random_scale, random_scale, 1);
        this.speed = Math.floor(10 + Math.random() * (20 - 10));
        this.speed /= random_scale;
    }

    update(deltaTime: number) {
        this.node.on(Input.EventType.TOUCH_START, this.touched, this);
        let current_position: Vec3 = this.node.getWorldPosition();
        let new_position: Vec3 = current_position.add(new Vec3(this.speed, 0, 0).multiplyScalar(deltaTime))
        this.node.worldPosition = new_position;
        
        if (this.node.worldPosition.x > this.screen_size.width + 64*this.node.getScale().x*2) {
            this.randomize()
            this.node.worldPosition = new Vec3(-64*this.node.getScale().x, this.node.worldPosition.y, 0);
        }
    }

    // update(deltaTime: number): void {
    //     this.n += deltaTime;
    //     this.opacity_compo.opacity = ((-Math.sin(this.n)+1) / 2) * 255;
    //     let new_scale: number = ((Math.sin(this.n)+1) / 2) * 5;
    //     this.node.setScale(new Vec3(new_scale, new_scale, 1));
    //     this.node.on(Input.EventType.TOUCH_START, this.touched, this);
    // }
}


