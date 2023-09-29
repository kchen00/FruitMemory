import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Leaderboard')
export class Leaderboard extends Component {

    start() {
        let params = {
            "type": "getRankingSummary",
            "rankingId": "0912AF429BF70514608931C488DD9037539FA9E95B7DA525CD238CAA0D8C55F5",
            "maxResults": "15",
            

        };
        sdkhub.getUserPlugin().showLeaderBoard(params);
    }

    update(deltaTime: number) {
        
    }
}


