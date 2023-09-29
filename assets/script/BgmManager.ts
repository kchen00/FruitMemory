import { _decorator, AudioClip, AudioSourceComponent, Component, easing, lerp, math, Node, random, tween } from 'cc';

enum state {PLAY_MUSIC, CHANGE_MUSIC}
const { ccclass, property } = _decorator;
@ccclass('BgmManager')
export class BgmManager extends Component {
    private current_state: state = state.PLAY_MUSIC;

    @property(AudioClip)
    public bgms: AudioClip[] = [];
    private audio_player: AudioSourceComponent;

    private time_elasped: number = 0;

    @property(Number)
    public audio_lerp_ratio: number = 0.8;

    private bgm_index: number = 0;

    @property(Number)
    public max_volume: number = 0.8;

    start() {
        this.bgms = this.shuffleArray(this.bgms);
        this.audio_player = this.node.getComponent(AudioSourceComponent);
        this.audio_player.clip = this.bgms[this.bgm_index];
        this.audio_player.play();
    }

    // shuffle array
    private  shuffleArray<T>(array: T[]): T[] {
        const shuffledArray = [...array]; // Create a copy of the original array
    
        for (let i = shuffledArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
        }
    
        return shuffledArray;
    }
    

    update(deltaTime: number) {
        switch(this.current_state) {
            case state.PLAY_MUSIC:
                this.time_elasped += deltaTime;

                // when volume in lower than 1, raise up the volume
                if (this.audio_player.volume < 1) {
                    this.audio_player.volume = lerp(this.audio_player.volume, this.max_volume, this.audio_lerp_ratio);
                }

                if(this.audio_player.playing == false) {
                    this.audio_player.play();
                }

                // random chance of changing music
                if (this.time_elasped >= 60 && Math.random() > 0.99) {
                    this.current_state = state.CHANGE_MUSIC;
                }

                break;
            
            case state.CHANGE_MUSIC:
                this.audio_player.volume = lerp(this.audio_player.volume, 0, this.audio_lerp_ratio);
                console.log(this.audio_player.volume);
                if (this.audio_player.volume <= 0.1) {
                    this.audio_player.stop();
                    this.bgm_index = (this.bgm_index + 1) % this.bgms.length;
                    this.audio_player.clip = this.bgms[this.bgm_index];
                    this.time_elasped = 0;    
                    this.current_state = state.PLAY_MUSIC;
                }
                break;

        }


    }
}


