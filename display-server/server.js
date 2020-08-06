const {createSocket} = require('dgram');
const {EventEmitter} = require('events');
const express = require('express');
const http = require('http');
const path = require('path')
const finalhandler = require('finalhandler');
const serveStatic = require('serve-static');
const socketIo = require('socket.io');
const HTTP_PORT = 3000;
const UDP_BROADCAST_PORT = 7878;

function _logServerStart(serverName, server) {
    let serverAddress = server.address(),
        {port, family, address} = serverAddress;

    console.log(`${serverName} listening at ${address}:${port} (${family})`);
}

const EVT_CONTROL_TO_VALUE_NAME = 'control2valueName';
const CONTROL2VALUENAME_MSG_PREFIX = '[btwg] ';
const CONTROL2VALUENAME_MSG_SPLIT_STRING = ' --> ';

class UdpMessageHandler extends EventEmitter {

    constructor() {
        super();
        this.control2valueMap = new Map();
    }



    handleMessage(msg) {
        let msgString = msg.toString();
        // TODO check that the message is valid
        //console.log('Data received from client : ' + msgString);
        // console.log('Received %d bytes from %s:%d\n', msg.length);

        if (!msgString.startsWith(CONTROL2VALUENAME_MSG_PREFIX)) {
            console.log('ignoring unrecognized message');
            return;
        }

        for (let line of msgString.split('\n')) {
            let [controlName, valueName] = line.substr(CONTROL2VALUENAME_MSG_PREFIX.length).split(CONTROL2VALUENAME_MSG_SPLIT_STRING, 2);
            if (controlName && valueName) {
                this.control2valueMap.set(controlName, valueName);
                this.emit(EVT_CONTROL_TO_VALUE_NAME, {controlName, valueName});
            } else {
                console.warn('Unrecognized UDP line: %s', line);
            }
        }
    }

    emitCurrentState() {
        for (let [controlName, valueName] of this.control2valueMap.entries()) {
            this.emit(EVT_CONTROL_TO_VALUE_NAME, {controlName, valueName});
        }
    }
}

const udpMessageHandler = new UdpMessageHandler();

//  ---------- UDP-receiving part --------------

const udpServer = createSocket('udp4');

let isServerRunning = false;

udpServer.on('error', function (error) {
    console.log('UDP server error: ' + error);
    udpServer.close();
});

udpServer.on('message', (msg, info) => udpMessageHandler.handleMessage(msg));

udpServer.on('listening', () => _logServerStart('UDP server', udpServer));

udpServer.on('close', () => console.log('UDP server closed'));

udpServer.bind(UDP_BROADCAST_PORT, () => {
    udpServer.setBroadcast(true);
    isServerRunning = true;
});

//  ---------- HTTP part --------------

const app = express();
const httpServer = http.createServer(app);
const io = socketIo(httpServer);

app.use( serveStatic('./public', { 'index': ['index.html'] }));

io.on('connection', (socket) => {
    console.log('a user connected');
    udpMessageHandler.on(EVT_CONTROL_TO_VALUE_NAME, data => {
        console.log('Forwarding data from udpMessageHandler to socket: %o', data);
        socket.emit(EVT_CONTROL_TO_VALUE_NAME, data);
    });

    udpMessageHandler.emitCurrentState();
});

app.use(finalhandler);

httpServer.listen(HTTP_PORT, () => {
    _logServerStart('HTTP server', httpServer);
    console.log(`--> http://127.0.0.1:${HTTP_PORT}/`);
});
