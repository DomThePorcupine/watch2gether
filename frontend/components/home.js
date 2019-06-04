import React, { Component } from 'react';

import movie from '../vids/xmen.mp4';
import qs from 'query-string';

import { PLAY } from '../assets/icons';

export default class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            canvash: 0,
            canvasw: 0,
            playing: true,
        };

        this.pressPause = this.pressPause.bind(this);
        this.pressPlay = this.pressPlay.bind(this);
        
        this.server = new WebSocket('ws://' + window.location.hostname + ':8888');

        this.server.onopen = () => {
            let params = qs.parse(location.search);
            if(params.id !== undefined) {
                // We're okay
                this.setState({
                    id: params.id
                });
                this.server.send(JSON.stringify({
                    action: 'connect',
                    id: params.id,
                }))
            } else {
                // Ask for an id
                this.server.send(JSON.stringify({
                    action: 'init',
                }));
            }

        };

        this.server.onmessage = (mess) => {
            const data = JSON.parse(mess.data);
            console.log(data);
            if(data.action === 'init') {
                window.location.href = window.location.href.split('?')[0] + '?' + qs.stringify({id: data.id});
            } else if(data.action === 'pause') {
                const tvid = document.getElementById('thevid');
                if(!tvid.paused) {
                    tvid.pause();
                }
            } else if(data.action === 'play') {
                const tvid = document.getElementById('thevid');
                if(tvid.paused) {
                    tvid.play();
                }
                
            } else if(data.action === 'sync') {
                const tvid = document.getElementById('thevid');
                tvid.pause();
                this.server.send(JSON.stringify({
                    action: 'sync',
                    currentTime: tvid.currentTime,
                    id: this.state.id,
                }));
            } else if(data.action === 'setTime') {
                const tvid = document.getElementById('thevid');
                tvid.currentTime = data.time;
                // tvid.load();
                tvid.play();
            }
        }
    }

    componentDidMount() {
        const tvid = document.getElementById('thevid');
        tvid.addEventListener('loadedmetadata', () => {
            this.setState({
                canvash: tvid.offsetHeight,
                canvasw: tvid.offsetWidth
            });

            var stage = new Konva.Stage({
                container: 'playercontrols',
                width: tvid.offsetWidth,
                height: tvid.offsetHeight
            });

            stage.getContainer().style.zIndex = 400;

            let layer = new Konva.Layer();
            stage.add(layer);

            var box = new Konva.Rect({
                x: 0,
                y: 0,
                width: tvid.offsetWidth,
                height: tvid.offsetHeight,
                opacity: 0,
            });

            var play = new Konva.Path({
                x: 10,
                y: 10,
                data: PLAY.path,
                fill: 'black'
            });

            var triangle = new Konva.RegularPolygon({
                x: 15,
                y: stage.height() - 15,
                sides: 3,
                radius: 10,
                fill: 'black',
                stroke: 'white',
                strokeWidth: 1,
                lineJoin: 'round',
                opacity: 0,
            });

            box.on('mouseover', () => {
                console.log('mouseover')
                console.log(triangle);
                triangle.opacity(1);
                layer.draw();
            });

            box.on('mouseout', () => {
                console.log('mouseout');
                setTimeout(() => {
                    triangle.opacity(0);
                    layer.draw();
                }, 500);
                
            });

            triangle.rotate(90);
            layer.add(play);
            layer.add(triangle);
            layer.add(box);
            layer.draw();

        });

    }

    pressPause(ev) {
        console.log(ev);
        const tvid = document.getElementById('thevid');
        console.log('Pausing all');
        this.server.send(JSON.stringify({
            action: 'pause',
            id: this.state.id,
        }));
        tvid.pause();
    
    }

    pressPlay() {
        const tvid = document.getElementById('thevid');
        tvid.play();
        this.server.send(JSON.stringify({
            action: 'play',
            id: this.state.id,
        }));
    }

    

    render() {
        return (
            <div style={{ display: 'flex', flexDirection: 'column'}}>
                <div>
                    <div id="playercontrols" style={{height: this.state.canvash, width: this.state.canvasw, position: 'absolute'}}></div>
                    <video id="thevid" autoPlay muted src={movie} style={{maxWidth: '400px', zIndex: -1}}></video>
                </div>
            </div>
        );
    }
};