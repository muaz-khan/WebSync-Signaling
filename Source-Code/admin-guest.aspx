<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="admin-guest.aspx.cs" Inherits="SignalingServer.admin_guest" %>

<!--
    > Muaz Khan     - https://github.com/muaz-khan 
    > MIT License   - https://www.webrtc-experiment.com/licence/
    > Documentation - http://www.RTCMultiConnection.org/docs/
-->
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Admin/Guest audio/video calling using RTCMultiConnection & WebSync as Signaling GateWay!</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <link rel="author" type="text/html" href="https://plus.google.com/+MuazKhan">
        <meta name="author" content="Muaz Khan">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <script>
            var hash = window.location.hash.replace('#', '');
            if (!hash.length) {
                location.href = location.href + '#' + ((Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-'));
                location.reload();
            }
        </script>
        <link href="//fonts.googleapis.com/css?family=Inconsolata" rel="stylesheet" type="text/css" />
        <style>
            html { background: #eee; }

            body {
                font-family: "Inconsolata", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", monospace;
                font-size: 1.2em;
                line-height: 1.2em;
                margin: 0;
            }

            body {
                background: #fff;
                border: 1px solid;
                border-color: #ddd #aaa #aaa #ddd;
                border-radius: 5px;
                margin: .5em auto 0 auto;
                padding: .8em;
                padding-top: 0;
            }

            h1, h2 {
                border-bottom: 1px solid black;
                display: inline;
                font-weight: normal;
                line-height: 36px;
                padding: 0 0 3px 0;
            }

            h1 {
                background: rgb(238, 238, 238);
                border-bottom-width: 2px;
                display: block;
                margin-top: 0;
                padding: .3em;
                text-align: center;
            }

            button {
                -moz-border-radius: 3px;
                -moz-transition: none;
                -webkit-transition: none;
                background: #0370ea;
                background: -moz-linear-gradient(top, #008dfd 0, #0370ea 100%);
                background: -webkit-linear-gradient(top, #008dfd 0, #0370ea 100%);
                border: 1px solid #076bd2;
                border-radius: 3px;
                color: #fff;
                display: inline-block;
                font-family: inherit;
                font-size: .8em;
                line-height: 1.3;
                padding: 5px 12px;
                text-align: center;
                text-shadow: 1px 1px 1px #076bd2;
            }

            button:hover { background: rgb(9, 147, 240); }

            button:active { background: rgb(10, 118, 190); }

            button[disabled] {
                background: none;
                border: 1px solid rgb(187, 181, 181);
                color: gray;
                text-shadow: none;
            }

            #remote-media-streams video { width: 10em; }

            #local-media-stream video { width: 34em; }

            footer { text-align: center; }

            code {
                color: rgb(204, 14, 14);
                font-family: inherit;
            }

            audio, video { vertical-align: bottom; }

            pre {
                border-left: 2px solid red;
                margin-left: 2em;
                padding-left: 1em;
            }

            a {
                color: #2844FA;
                text-decoration: none;
            }

            a:hover, a:focus { color: #1B29A4; }

            a:active { color: #000; }

            :-moz-any-link:focus {
                border: 0;
                color: #000;
            }

            ::selection { background: #ccc; }

            ::-moz-selection { background: #ccc; }

            .prompt-bar {
                background: rgb(255, 255, 255);
                border: 9px solid rgb(216, 216, 216);
                border-radius: 5px;
                bottom: 0;
                box-shadow: 0 0 5px, inset 0 0 2px;
                display: none;
                position: fixed;
                right: 0;
                width: 30%;
                z-index: 100;
            }

            .prompt-bar #header {
                border-bottom: 1px solid rgb(213, 211, 211);
                display: block;
                padding: .1em .6em;
            }

            .prompt-bar #body { padding: .2em .6em; }

            .prompt-bar #controls {
                background: rgb(175, 174, 174);
                border: 1px solid gray;
                text-align: center;
            }

            video {
                vertical-align: top;
                width: 48%;
            }
        </style>

        <!-- WebSync -->
        <script src="/Scripts/fm.js"> </script>
        <script src="/Scripts/fm.websync.js"> </script>
        <script src="/Scripts/fm.websync.subscribers.js"> </script>
        <script src="/Scripts/fm.websync.chat.js"> </script>
        
        <!-- www.webrtc-experiment.com/getMediaElement -->
        <script src="//www.webrtc-experiment.com/getMediaElement.min.js"> </script>

        <!-- www.RTCMultiConnection.org -->
        <script src="//www.webrtc-experiment.com/RTCMultiConnection-v1.5.min.js"> </script>
    </head>
    <body>
        <h1>
            Admin/Guest audio/video calling using <a href="http://www.RTCMultiConnection.org/docs/" target="_blank">RTCMultiConnection</a>
            & WebSync as Signaling GateWay!
        </h1>
        <p>
            <span>Copyright © 2013</span>
            <a href="https://github.com/muaz-khan" target="_blank">Muaz Khan</a><span>&lt;</span><a href="http://twitter.com/muazkh" target="_blank">@muazkh</a><span>&gt;</span>
            »
            <a href="http://twitter.com/WebRTCWeb" target="_blank" title="Twitter profile for WebRTC Experiments">@WebRTC Experiments</a>
            »
            <a href="https://plus.google.com/106306286430656356034/posts" target="_blank" title="Google+ page for WebRTC Experiments">Google+</a>
            »
            <a href="https://github.com/muaz-khan/WebRTC-Experiment/issues" target="_blank">What's New?</a>
        </p>

        <div id="videos-container" style="text-align: center;"></div>
        <div style="text-align: center;">
            <button id="init-admin">I'm Admin</button>
            <button id="init-guest">I'm Guest</button>
        </div>
        <div class="prompt-bar">
            <h2 id="header">...</h2>
            <p id="body">...</p>
            <div id="controls">
                <button id="ok">...</button>
                <button id="cancel">x</button>
            </div>
        </div>
        <script>
            // ------------------------------------------------------------------
            // <using WebSync for signaling>
            var channels = {};
            var username = Math.round(Math.random() * 60535) + 5000;

            var client = new fm.websync.client('websync.ashx');

            client.setAutoDisconnect({
                synchronous: true
            });

            client.connect({
                onSuccess: function () {
                    client.join({
                        channel: '/chat',
                        userId: username,
                        userNickname: username,
                        onReceive: function (event) {
                            var message = JSON.parse(event.getData().text);
                            if (channels[message.channel] && channels[message.channel].onmessage) {
                                channels[message.channel].onmessage(message.message);
                            }
                        }
                    });
                }
            });

            function openSignalingChannel(config) {
                var channel = config.channel || this.channel;
                channels[channel] = config;

                if (config.onopen) setTimeout(config.onopen, 1000);
                return {
                    send: function (message) {
                        client.publish({
                            channel: '/chat',
                            data: {
                                username: username,
                                text: JSON.stringify({
                                    message: message,
                                    channel: channel
                                })
                            }
                        });
                    }
                };
            }
            // </using WebSync for signaling>
            // ------------------------------------------------------------------
            
            function initAdminOrGuest(userType) {
                window.connection = new RTCMultiConnection();
                
                // overriding sigaling server to websync
                connection.openSignalingChannel = openSignalingChannel;
                
                connection.userType = userType;

                if (userType == 'guest') connection.onAdmin = onGuestOrUser;
                if (userType == 'admin') connection.onGuest = onGuestOrUser;

                function onGuestOrUser(user) {
                    promptBar.style.display = 'block';
                    promptBar.querySelector('#ok').disabled = false;

                    promptBar.querySelector('#header').innerHTML = userType + ' is online';
                    promptBar.querySelector('#body').innerHTML = 'Are you want to do audio/video call with ' + userType + '?';
                    var ok = promptBar.querySelector('#ok');
                    ok.innerHTML = 'Audio/Video Call';
                    ok.onclick = function() {
                        connection.request(user.userid);
                        this.disabled = true;
                    };

                    promptBar.querySelector('#cancel').onclick = function() {
                        promptBar.style.display = 'none';
                    };
                }

                connection.onRequest = function(userid, extra) {
                    promptBar.style.display = 'block';
                    promptBar.querySelector('#ok').disabled = false;

                    promptBar.querySelector('#header').innerHTML = 'New Request';
                    promptBar.querySelector('#body').innerHTML = userid + ' requested you to receive his audio/video call. Are you want to accept his call?';
                    var ok = promptBar.querySelector('#ok');
                    ok.innerHTML = 'Receive Audio/Video Call';
                    ok.onclick = function() {
                        connection.accept(userid, extra);
                        this.disabled = true;
                    };

                    promptBar.querySelector('#cancel').onclick = function() {
                        promptBar.style.display = 'none';
                        this.disabled = true;
                    };
                };
                connection.onstats = function(stats, userinfo) {
                    resetPromptBar();

                    if (stats == 'busy') {
                        promptBar.querySelector('#header').innerHTML = userType + ' is Busy';
                        promptBar.querySelector('#body').innerHTML = userinfo.userid + ' is busy. Please wait..';
                    }
                    if (stats == 'accepted') {
                        promptBar.querySelector('#header').innerHTML = 'Receiving';
                        promptBar.querySelector('#body').innerHTML = userinfo.userid + ' is receiving your call..';
                    }
                };

                connection.session = {
                    audio: true,
                    video: true
                };

                connection.onstream = function(e) {
                    var mediaElement = getMediaElement(e.mediaElement, {
                        width: (videosContainer.clientWidth / 2) - 50,
                        buttons: ['mute-audio', 'mute-video', 'record-audio', 'record-video', 'full-screen', 'volume-slider', 'stop'],
                        onMuted: function(type) {
                            connection.streams[e.streamid].mute({
                                audio: type == 'audio',
                                video: type == 'video'
                            });
                        },
                        onUnMuted: function(type) {
                            connection.streams[e.streamid].unmute({
                                audio: type == 'audio',
                                video: type == 'video'
                            });
                        },
                        onRecordingStarted: function(type) {
                            connection.streams[e.streamid].startRecording({
                                audio: type == 'audio',
                                video: type == 'video'
                            });
                        },
                        onRecordingStopped: function(type) {
                            connection.streams[e.streamid].stopRecording(function(blob) {
                                var _mediaElement = document.createElement(type);

                                _mediaElement.src = URL.createObjectURL(blob);
                                _mediaElement = getMediaElement(_mediaElement, {
                                    buttons: ['mute-audio', 'mute-video', 'stop']
                                });

                                _mediaElement.toggle(['mute-audio', 'mute-video']);

                                videosContainer.insertBefore(_mediaElement, videosContainer.firstChild);
                            }, type);
                        },
                        onStopped: function() {
                            connection.drop();
                        }
                    });

                    videosContainer.insertBefore(mediaElement, videosContainer.firstChild);

                    if (e.type == 'remote') {
                        resetPromptBar();
                        promptBar.style.display = 'none';
                    }
                };

                connection.onstreamended = function(e) {
                    if (e.mediaElement.parentNode && e.mediaElement.parentNode.parentNode && e.mediaElement.parentNode.parentNode.parentNode) {
                        e.mediaElement.parentNode.parentNode.parentNode.removeChild(e.mediaElement.parentNode.parentNode);
                    }
                };

                connection.connect();
            }

            document.getElementById('init-admin').onclick = function() {
                this.disabled = true;
                initAdminOrGuest('admin');
            };

            document.getElementById('init-guest').onclick = function() {
                this.disabled = true;
                initAdminOrGuest('guest');
            };

            var promptBar = document.querySelector('.prompt-bar');

            function resetPromptBar() {
                promptBar.style.display = 'block';
                promptBar.querySelector('#ok').disabled = true;

                promptBar.querySelector('#ok').innerHTML = '...';
                promptBar.querySelector('#header').innerHTML = '...';
                promptBar.querySelector('#body').innerHTML = '...';
            }

            var videosContainer = document.getElementById('videos-container');
        </script>
        
        <section class="experiment">
            <h2 class="header">How to use WebSync for Signaling?</h2>
                
            <pre>
// www.RTCMultiConnection.org/latest.js

var connection = new RTCMultiConnection();

// easiest way to customize what you need!
connection.session = {
    audio: true,
    video: true
};

// on getting local or remote media stream
connection.onstream = function(e) {
    document.body.appendChild(e.mediaElement);
};

// ------------------------------------------------------------------
// start-using WebSync for signaling
var channels = {};
var username = Math.round(Math.random() * 60535) + 5000;

var client = new fm.websync.client('websync.ashx');

client.setAutoDisconnect({
    synchronous: true
});

client.connect({
    onSuccess: function () {
        client.join({
            channel: '/chat',
            userId: username,
            userNickname: username,
            onReceive: function (event) {
                var message = JSON.parse(event.getData().text);
                if (channels[message.channel] && channels[message.channel].onmessage) {
                    channels[message.channel].onmessage(message.message);
                }
            }
        });
    }
});

connection.openSignalingChannel = function (config) {
    var channel = config.channel || this.channel;
    channels[channel] = config;

    if (config.onopen) setTimeout(config.onopen, 1000);
    return {
        send: function (message) {
            client.publish({
                channel: '/chat',
                data: {
                    username: username,
                    text: JSON.stringify({
                        message: message,
                        channel: channel
                    })
                }
            });
        }
    };
};
// end-using WebSync for signaling
// ------------------------------------------------------------------

// check existing sessions
connection.connect();

// open new session
document.getElementById('open-new-session').onclick = function() {
    connection.open();
};
</pre>
        </section>

        <section style="border: 1px solid rgb(189, 189, 189); border-radius: .2em; margin: 1em 3em;">
            <h2 id="feedback" style="border-bottom: 1px solid rgb(189, 189, 189); padding: .2em .4em;">Feedback</h2>
            <div>
                <textarea id="message" style="border: 1px solid rgb(189, 189, 189); height: 8em; margin: .2em; outline: none; resize: vertical; width: 98%;" placeholder="Have any message? Suggestions or something went wrong?"></textarea>
            </div>
            <button id="send-message" style="font-size: 1em;">Send Message</button>
        </section>
        <footer>
            <p> <a href="https://www.webrtc-experiment.com/" target="_blank">WebRTC Experiments!</a> © <a href="https://plus.google.com/100325991024054712503" rel="author" target="_blank">Muaz Khan</a>, <span> 2013 </span> » <a href="mailto:muazkh@gmail.com" target="_blank">Email</a>»
                <a
                    href="http://twitter.com/muazkh" target="_blank">@muazkh</a>» <a href="https://github.com/muaz-khan" target="_blank">Github</a>
            </p>
        </footer>
      
        <script src="//www.webrtc-experiment.com/common.js"> </script>
        
        <!-- somee.com hack! -->
        <style>center, .last-div, .last-div ~ * { display: none !important }</style>
        <div class="last-div"></div>
    </body>
</html>