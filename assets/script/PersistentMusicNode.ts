import { _decorator, AudioClip, AudioSourceComponent, Component, director, game, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PersistentMusicNode')
export class PersistentMusicNode extends Component {
    
    protected start(): void {
        director.addPersistRootNode(this.node);
        
    }

    // destroy node when switching to main game scene
    protected update(dt: number): void {
        if (director.getScene().name == "main") {
            this.node.destroy();
        }
    }
}


