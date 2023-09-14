import { _decorator, Component, director, Node, Scene, SceneAsset, sys } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ButtonAction')
export class ButtonAction extends Component {
    
    @property(String)
    public link: string = "";

    @property(SceneAsset)
    public target_scene: SceneAsset;

    public open_link(): void{
        window.open(this.link, "_blank");
    }

    public open_scene(): void {
        let scene_name: string = this.target_scene.name;
        console.log(scene_name);
        director.loadScene(scene_name);
    }
}


