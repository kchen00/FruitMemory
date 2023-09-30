import { _decorator, Component, director, game, Label, Node, Scene, SceneAsset } from 'cc';
import { GameManager } from './GameManager';
import { HUAWEI } from 'cc/env';
const { ccclass, property } = _decorator;

@ccclass('AdPlayer')
export class AdPlayer extends Component {
    @property(Node)
    private game_manager: Node;

    @property(SceneAsset)
    public main_scene: SceneAsset;
    public can_play_ad: boolean = true;

    private ad_params = {"adType": "Reward", "adId": "testx9dtjwj8hp", "startMuted": "0"};
    //plays ad to allow player revive 3 times before gameover
    private watch_ad(): void {
        if (this.can_play_ad) {
            console.log("ad playing");
            this.invokeRewardAds();
            this.game_manager.getComponent(GameManager).revive();

        } else {
            console.log("cannot play ad anymore");
            this.play_again();
        }

    }

    // preload the ad
    public invokepreloadrewardAds(): void {
        sdkhub.getAdsPlugin().preloadAds(this.ad_params);
    }

    // play the ad
    private invokeRewardAds(): void {
        sdkhub.getAdsPlugin().showAds(this.ad_params);
    }

    // reload the main scene
    private play_again(): void {
        let scene_name: string = this.main_scene.name;
        director.loadScene(scene_name);
    }

}


