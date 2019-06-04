const WebSocket = require('ws');
const crypto = require('crypto');
const WSPORT = 8888;

const wss = new WebSocket.Server({
    port: WSPORT,
    host: '0.0.0.0',
}, () => {
    console.log(`Listening on port: ${WSPORT}`);
});

let rooms = {};

wss.on('connection', (ws) => {
    ws.on('message', (mess) => {
        let data = JSON.parse(mess);
        console.log(data);
        if(data.action === 'init') {
            let id = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
            ws.send(JSON.stringify({
                action: 'init',
                id: id,
            }))
        } else if(data.action === 'connect') {
            if(rooms[data.id] !== undefined) {
                rooms[data.id].forEach((client) => {
                    client.send(JSON.stringify({
                        action: 'sync',
                    }));
                })
                rooms[data.id].push(ws);
                
            } else {
                rooms[data.id] = [ws];
            }
        } else if(data.action === 'pause') {
            if(rooms[data.id] !== undefined) {
                rooms[data.id].forEach((client) => {
                    client.send(JSON.stringify({
                        action: 'pause',
                    }))
                })
            }
        } else if(data.action === 'play') {
            if(rooms[data.id] !== undefined) {
                rooms[data.id].forEach((client) => {
                    client.send(JSON.stringify({
                        action: 'play',
                    }))
                })
            }
        } else if(data.action === 'sync') {
            if(rooms[data.id] !== undefined) {
                rooms[data.id].forEach((client) => {
                    client.send(JSON.stringify({
                        action: 'setTime',
                        time: data.currentTime,
                    }))
                })
            }
        }
    });
});
