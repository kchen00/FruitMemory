import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SdkInit')
export class SdkInit extends Component {
    //initialize the sdk to connect to huawer hms core
    start() {
        //initialize the service
        sdkhub.getUserPlugin().callFuncWithParam("init");
        //login
        // to test this, log out huawei id on the app gallery
        this.scheduleOnce(function(){
            sdkhub.getUserPlugin().login();
        },2);

        // show ads
        this.invokeBannerAds();

    }

    update(deltaTime: number) {

    }

    invokeBannerAds() {
        var params = {"adType": "Banner", "adId": "testw6vs28auh3", "pos": "0", "adSize": "BANNER_SIZE_320_50"};
        sdkhub.getAdsPlugin().showAds(params);
    }
}
