import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MainMenuHighScore')
export class MainMenuHighScore extends Component {
    private save_game: any;
    private previous_score: number;
    private previous_level: number;
    private previous_reputation: number;
    private previous_reputation_tile: string;
    
    start() {
        let save_game_found: boolean = this.read_save_game();
        if (save_game_found) {
            this.node.getComponent(Label).string = "Highscore:  " + this.previous_score.toString();
        } else {
            this.node.getComponent(Label).string = "Highscore:  0";
        }
    }

    // read previous save game, if exists do something
    private read_save_game(): boolean {
        let previous_save: any = localStorage.getItem("save_game");
        if (previous_save) {
            console.log("save game found");
            console.log(previous_save);
            let parsed_data: any = JSON.parse(previous_save);
            this.previous_score = parsed_data.score_achieved;
            this.previous_level = parsed_data.level_achieved;
            this.previous_reputation = parsed_data.reputation_achived;
            this.previous_reputation_tile = parsed_data.reputation_title_achieved;
            return true;
        } 
            
        console.log("no save game found");
        return false;
    }
}



