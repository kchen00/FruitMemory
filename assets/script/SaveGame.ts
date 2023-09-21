import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SaveGame')
export class SaveGame extends Component {

    private score_achieved: number;
    private level_achieved: number;
    private reputation_achived: number;
    private reputation_title_achieved: string;

    constructor(score:number, level:number, reputation:number, title:string) {
        super();
        this.score_achieved = score;
        this.level_achieved = level;
        this.reputation_achived = reputation;
        this.reputation_title_achieved = title;
    }

    // return a json of the new record
    public get_save_game(): SaveGame {
        return this;
    }

    
}


