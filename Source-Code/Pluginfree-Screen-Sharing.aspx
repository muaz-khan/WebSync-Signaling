<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Pluginfree-Screen-Sharing.aspx.cs" Inherits="SignalingServer.Pluginfree_Screen_Sharing" %>

<!--
    > Muaz Khan     - https://github.com/muaz-khan 
    > MIT License   - https://www.webrtc-experiment.com/licence/
    > Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/Pluginfree-Screen-Sharing
-->
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>WebRTC Screen Sharing | Plugin-free & WebSync as Signaling GateWay!</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <link rel="author" type="text/html" href="https://plus.google.com/+MuazKhan">
        <meta name="author" content="Muaz Khan">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <link rel="stylesheet" href="//www.webrtc-experiment.com/style.css">
        
        <style>
            video {
                -moz-transition: all 1s ease;
                -ms-transition: all 1s ease;
                
                -o-transition: all 1s ease;
                -webkit-transition: all 1s ease;
                transition: all 1s ease;
                vertical-align: top;
                width: 100%;
            }

            input {
                border: 1px solid #d9d9d9;
                border-radius: 1px;
                font-size: 2em;
                margin: .2em;
                width: 30%;
            }

            select {
                border: 1px solid #d9d9d9;
                border-radius: 1px;
                height: 50px;
                margin-left: 1em;
                margin-right: -12px;
                padding: 1.1em;
                vertical-align: 6px;
                width: 18%;
            }

            .setup {
                border-bottom-left-radius: 0;
                border-top-left-radius: 0;
                font-size: 102%;
                height: 47px;
                margin-left: -9px;
                margin-top: 8px;
                position: absolute;
            }

            p { padding: 1em; }

            li {
                border-bottom: 1px solid rgb(189, 189, 189);
                border-left: 1px solid rgb(189, 189, 189);
                padding: .5em;
            }
        </style>
        <script>
            document.createElement('article');
            document.createElement('footer');
        </script>
        
        <!-- WebSync -->
        <script src="/Scripts/fm.js"> </script>
        <script src="/Scripts/fm.websync.js"> </script>
        <script src="/Scripts/fm.websync.subscribers.js"> </script>
        <script src="/Scripts/fm.websync.chat.js"> </script>

        <!-- scripts used for video-conferencing -->
        <script src="https://www.webrtc-experiment.com/Pluginfree-Screen-Sharing/conference.js"> </script>
    </head>

    <body>
        <article>
            <header style="text-align: center;">
                <h1>
                    <a href="https://www.webrtc-experiment.com/">WebRTC</a> 
                    <a href="https://github.com/muaz-khan/WebRTC-Experiment/tree/master/Pluginfree-Screen-Sharing" target="_blank">Plugin-free Screen Sharing</a>
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
            </header>

            <div class="github-stargazers"></div>
        
            <!-- just copy this <section> and next script -->
            <section class="experiment">                
                <section id="number-of-participants">
                    <span>
                        Private ?? <a href="/Pluginfree-Screen-Sharing/" target="_blank" title="Open this link for private screen sharing!"><code><strong id="unique-token">#123456789</strong></code></a>
                    </span>
                    <input type="text" id="room-name">
                    <button id="share-screen" class="setup">Share Your Screen</button>
                </section>
                
                <!-- list of all available broadcasting rooms -->
                <table style="width: 100%;" id="rooms-list"></table>
                
                <!-- local/remote videos container -->
                <div id="videos-container"></div>
            </section>
        
            <script>
                // Muaz Khan     - https://github.com/muaz-khan
                // MIT License   - https://www.webrtc-experiment.com/licence/
                // Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/Pluginfree-Screen-Sharing

                // ------------------------------------------------------------------
                // <using WebSync for signaling>
                var channels = { };
                var username = Math.round(Math.random() * 60535) + 5000;

                var client = new fm.websync.client('websync.ashx');

                client.setAutoDisconnect({
                    synchronous: true
                });

                client.connect({
                    onSuccess: function() {
                        client.join({
                            channel: '/chat',
                            userId: username,
                            userNickname: username,
                            onReceive: function(event) {
                                var message = JSON.parse(event.getData().text);
                                if (channels[message.channel] && channels[message.channel].onmessage) {
                                    channels[message.channel].onmessage(message.message);
                                }
                            }
                        });
                    }
                });

                function openSocket(config) {
                    var channel = config.channel || 'Plugin-free-screen-sharing';
                    channels[channel] = config;

                    if (config.onopen) setTimeout(config.onopen, 1000);
                    return {
                        send: function(message) {
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

                var config = {
                    openSocket: openSocket,
                    onRemoteStream: function(media) {
                        var video = media.video;
                        video.setAttribute('controls', true);
                        videosContainer.insertBefore(video, videosContainer.firstChild);
                        video.play();
                        rotateVideo(video);
                    },
                    onRoomFound: function(room) {
                        var alreadyExist = document.getElementById(room.broadcaster);
                        if (alreadyExist) return;

                        if (typeof roomsList === 'undefined') roomsList = document.body;

                        var tr = document.createElement('tr');
                        tr.setAttribute('id', room.broadcaster);
                        tr.innerHTML = '<td>' + room.roomName + '</td>' +
                            '<td><button class="join" id="' + room.roomToken + '">Open Screen</button></td>';
                        roomsList.insertBefore(tr, roomsList.firstChild);

                        var button = tr.querySelector('.join');
                        button.onclick = function() {
                            var button = this;
                            button.disabled = true;
                            conferenceUI.joinRoom({
                                roomToken: button.id,
                                joinUser: button.parentNode.parentNode.id
                            });
                        };
                    },
                    onNewParticipant: function(numberOfParticipants) {
                        var element = document.getElementById('number-of-participants');
                        if (!element) return;
                        element.innerHTML = numberOfParticipants + ' room participants';
                    }
                };

                function captureUserMedia(callback) {
                    var video = document.createElement('video');
                    video.setAttribute('autoplay', true);
                    video.setAttribute('controls', true);
                    videosContainer.insertBefore(video, videosContainer.firstChild);

                    var screen_constraints = {
                        mandatory: {
                            chromeMediaSource: 'screen',
                            maxWidth: 1280,
                            maxHeight: 720
                        },
                        optional: []
                    };
                    var constraints = {
                        audio: false,
                        video: screen_constraints
                    };
                    getUserMedia({
                        video: video,
                        constraints: constraints,
                        onsuccess: function(stream) {
                            config.attachStream = stream;
                            callback && callback();

                            video.setAttribute('muted', true);
                            rotateVideo(video);
                        },
                        onerror: function() {
                            if (location.protocol === 'http:') {
                                alert('Please test this WebRTC experiment on HTTPS.');
                            } else {
                                alert('Screen capturing is either denied or not supported. Are you enabled flag: "Enable screen capture support in getUserMedia"?');
                            }
                        }
                    });
                }

                /* on page load: get public rooms */
                var conferenceUI = conference(config);

                /* UI specific */
                var videosContainer = document.getElementById("videos-container") || document.body;
                var roomsList = document.getElementById('rooms-list');

                document.getElementById('share-screen').onclick = function() {
                    var roomName = document.getElementById('room-name') || { };
                    roomName.disabled = true;
                    captureUserMedia(function() {
                        conferenceUI.createRoom({
                            roomName: (roomName.value || 'Anonymous') + ' shared screen with you'
                        });
                    });
                    this.disabled = true;
                };

                function rotateVideo(video) {
                    video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(0deg)';
                    setTimeout(function() {
                        video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(360deg)';
                    }, 1000);
                }

                (function() {
                    var uniqueToken = document.getElementById('unique-token');
                    if (uniqueToken)
                        if (location.hash.length > 2) uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<h2 style="text-align:center;"><a href="' + location.href + '" target="_blank">Share this link</a></h2>';
                        else uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = '#' + (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');
                })();

            </script>
            
            <section class="experiment">
                <h2 class="header">How to use WebSync for Signaling?</h2>
                <pre>
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

function openSocket(config) {
    var channel = config.channel || 'Plugin-free-screen-sharing';
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
// end-using WebSync for signaling
// ------------------------------------------------------------------

var config = {
     openSocket: openSocket,
     onRemoteStream: function() {},
     onRoomFound: function() {}
};
</pre>
            </section>
            
            <section class="experiment">
                <ol>
                    <li>Share full screen with one or more users in HD format!</li>
                    <li>Make sure you enabled the flag "<strong>Enable screen capture support in getUserMedia</strong>" via "<strong>chrome://flags</strong>".<br/><br/>Screen-sharing fails if you've not enabled that flag.</li>
                    <li>Recursive cascade images or blurred screen experiences occur only when you try to share screen between two tabs on the same system. This NEVER happens when sharing between unique systems or devices.</li>
                    <li>Firefox has no support of screen-sharing yet.</li>
                    <li>Remember, it is not desktop sharing!</li>
                </ol>
            </section>
        
            <section class="experiment own-widgets latest-commits">
                <h2 class="header" id="updates" style="color: red; padding-bottom: .1em;"><a href="https://github.com/muaz-khan/WebRTC-Experiment/commits/master" target="_blank">Latest Updates</a></h2>
                <div id="github-commits"></div>
            </section>
        
            <section class="experiment">
                <h2 class="header" id="feedback">Feedback</h2>
                <div>
                    <textarea id="message" style="border: 1px solid rgb(189, 189, 189); height: 8em; margin: .2em; outline: none; resize: vertical; width: 98%;" placeholder="Have any message? Suggestions or something went wrong?"></textarea>
                </div>
                <button id="send-message" style="font-size: 1em;">Send Message</button><small style="margin-left: 1em;">Enter your email too; if you want "direct" reply!</small>
            </section>
            
            <section class="experiment">
                <h2 class="header">Why Screen Sharing Fails?</h2>
                <ol>
                    <li>
                        You've not used '<strong>chromeMediaSource</strong>' constraint: 
                        <pre>
mandatory: {chromeMediaSource: 'screen'}
</pre>
                    </li>
                    <li>You requested audio-stream alongwith '<strong>chromeMediaSource</strong>' – it is not permitted.</li>
                    <li>You're not testing it on SSL origin (HTTPS domain).</li>
                    <li>Screen capturing is requested <strong>multiple times</strong>. Multiple capturing of screen is not allowed even from two unique tabs.</li>
                </ol>
				
                <p>
                    <strong><code>mandatory: {chromeMediaSource: 'tab'}</code></strong> is useful only in chrome extensions. See <a href="https://www.webrtc-experiment.com/screen-broadcast/">Tab sharing using tabCapture APIs</a>.
                </p>
            </section>
			
            <section class="experiment">
                <h2 class="header">Suggestions</h2>
                <ol>
                    <li>
                        If you're newcomer, newbie or beginner; you're suggested to try <a href="https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection" target="_blank">RTCMultiConnection.js</a> or <a href="https://github.com/muaz-khan/WebRTC-Experiment/tree/master/DataChannel" target="_blank">DataChannel.js</a> libraries.
                    </li>
                </ol>
		
            </section>
        </article>
        <footer>
            <p>
                <a href="https://www.webrtc-experiment.com/">WebRTC Experiments</a>
                ©
                <a href="https://plus.google.com/100325991024054712503" rel="author" target="_blank">Muaz Khan</a>, <span>2013 </span>»
                <a href="mailto:muazkh@gmail.com" target="_blank">Email</a>»
                <a href="http://twitter.com/muazkh" target="_blank">@muazkh</a>»
                <a href="https://github.com/muaz-khan" target="_blank">Github</a>
            </p>
        </footer>
    
        <!-- commits.js is useless for you! -->
        <script src="//www.webrtc-experiment.com/commits.js" async> </script>
        
        <!-- somee.com hack! -->
        <style>center, .last-div, .last-div ~ * { display: none !important }</style>
        <div class="last-div"></div>
    </body>
</html>