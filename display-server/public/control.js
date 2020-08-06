import ko from './knockout-latest.esm.js';

export class Control {
    constructor(udpName, {left, top, width, height}) {
        this.udpName = udpName;
        this.style = {left, top, width, height};
        this.valueName = ko.observable('?');
    }
}

export class Controller {

    /**
     * @type {Map<string, Control>}
     */
    controlsByName = new Map();

    constructor(imageUrl, controls) {
        this.imageUrl = imageUrl;

        this.controlsByName = new Map();
        for (let control of controls) {
            this.controlsByName.set(control.udpName, control);
        }
    }

    /**
     * @return {Control[]}
     */
    get controls() {
        return Array.from(this.controlsByName.values());
    }

    run() {
        const socket = io();

        socket.on('control2valueName', ({controlName, valueName}) => {
            console.log('control2valueName received: %s -> %s', controlName, valueName);
            let existingControl = this.controlsByName.get(controlName);
            if (existingControl) {
                existingControl.valueName(valueName || '-');
            }
        })

        ko.applyBindings(this);
    }
}
