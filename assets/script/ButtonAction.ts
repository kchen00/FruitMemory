import { _decorator, AudioSource, Component, director, Node, Scene, SceneAsset, sys } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ButtonAction')
export class ButtonAction extends Component {
    
    @property(String)
    public link: string = "";

    @property(SceneAsset)
    public target_scene: SceneAsset;

    private audio_player: AudioSource;

    start() {
        this.audio_player = this.node.getComponent(AudioSource);
    }

    public open_link(): void{
        this.play_sound();
        window.open(this.link, "_blank");
    }

    public open_scene(): void {
        this.play_sound();
        let scene_name: string = this.target_scene.name;
        director.loadScene(scene_name);
    }

    private play_sound(): void {
        if (this.audio_player) {
            this.audio_player.play();
        }
    }
}


