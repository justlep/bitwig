import {Control, Controller} from './control.js';

class XTouchMini extends Controller {

    static LOWER_BUTTON_UPD_NAMES = [null, null, 'RwdBtn', 'FwdBtn', 'LoopBtn', 'StopBtn', 'PlayBtn', 'RecBtn'];

    constructor() {
        const CONTROL_WIDTH = 94;
        let controls = [];
        for (let i = 0; i < 8; i++) {
            controls.push(new Control(`TopEncoder${i}`, {left: 40 + CONTROL_WIDTH * i, top: 49, width: CONTROL_WIDTH, height: 79}));
            let btnUdpName = XTouchMini.LOWER_BUTTON_UPD_NAMES[i];
            if (btnUdpName) {
                controls.push(new Control(btnUdpName, {left: 40 + CONTROL_WIDTH * i, top: 208, width: CONTROL_WIDTH, height: 47}));
            }
        }
        super('xtouch-mini.jpg', controls);
    }
}


new XTouchMini().run();
