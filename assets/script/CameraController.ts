import { _decorator, Component, easing, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraController')
export class CameraController extends Component {

    private shake_intensity: number = 0;
    private redcue_intensity: number = 0;
    private initial_position: Vec3;

    start() {
        this.initial_position = this.node.getWorldPosition();
        // console.log(this.initial_position);

    }

    public apply_intensity(intensity: number, reduce: number) {
        this.shake_intensity = intensity;
        this.redcue_intensity = reduce;

    }

    private shake_camera(): void {
        let x_offset: number = Math.random() * this.shake_intensity - this.shake_intensity/2;
        let y_offset: number = Math.random() * this.shake_intensity - this.shake_intensity/2;
        let new_position: Vec3 = this.initial_position.clone().add(new Vec3(x_offset, y_offset, 0));

        this.node.setWorldPosition(new_position);
    }

    update(deltaTime: number) {
        if (Math.floor(this.shake_intensity) > 0) {
            this.shake_camera();
            this.shake_intensity -= deltaTime * this.redcue_intensity;
        } else {
            this.node.setWorldPosition(this.initial_position);
        }
    }
}


