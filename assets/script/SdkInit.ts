import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SdkInit')
export class SdkInit extends Component {
    //initialize the sdk to connect ti huawer hms core
    
    private  welcome_user: boolean = false;
    start() {
        //initialize the service
        sdkhub.getUserPlugin().callFuncWithParam("init");
        //login
        // to test this, log out huawei id on the app gallery
        this.scheduleOnce(function(){
            sdkhub.getUserPlugin().login();
        },2);


    }

    update(deltaTime: number) {

        
    }
}
