## Realtime/Working [WebRTC Experiments](https://www.webrtc-experiment.com/) and WebSync! [Demos](http://websync.somee.com/)

WebSync is used as signaling gateway for/with:

1. [RTCMultiConnection.js](http://www.RTCMultiConnection.org/docs/)
2. [DataChanel.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/DataChannel)
3. [Video-Conferencing](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/video-conferencing) experiment
4. [Plugin-free screen sharing](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/Pluginfree-Screen-Sharing) experiment

and many others. **Try a few demos:** http://websync.somee.com/

=

#### Please visit main repository for other [WebRTC](https://www.webrtc-experiment.com/) experiments:

https://github.com/muaz-khan/WebRTC-Experiment

=

This repository contains two directories:

1. Deployment-Package
2. Source-Code

"Deployment-Package" directory can be deployed on any IIS +=7 web-server.

"Source-Code" is written in C# and ASP.NET WebForms.

=

#### How to use WebSync for signaling?

```html
<script src="fm.js"> </script>
<script src="fm.websync.js"> </script>
<script src="fm.websync.subscribers.js"> </script>
<script src="fm.websync.chat.js"> </script>
```

```javascript
// www.RTCMultiConnection.org/latest.js

var connection = new RTCMultiConnection();

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
```

=

#### [Demos](http://websync.somee.com/) using WebSync for Signaling

1. [RTCMultiConnection All-in-One Demo](http://websync.somee.com/RTCMultiConnection.aspx)
2. [DataChannel.js » A WebRTC Library for Data Sharing](http://websync.somee.com/DataChannel.aspx)
3. [Video Conferencing](http://websync.somee.com/video-conferencing.aspx)
4. [Plugin-free Screen Sharing](http://websync.somee.com/Pluginfree-Screen-Sharing.aspx)
5. [Admin/Guest audio/video calling using RTCMultiConnection](http://websync.somee.com/admin-guest.aspx)
6. [WebRTC Group File Sharing using RTCDataChannel APIs!](http://websync.somee.com/file-hangout.aspx)

=

##### Muaz Khan (muazkh@gmail.com) - [@muazkh](https://twitter.com/muazkh) / [@WebRTCWeb](https://twitter.com/WebRTCWeb)

<a href="http://www.MuazKhan.com"><img src="https://www.webrtc-experiment.com/images/Muaz-Khan.gif" /></a>

=

This repository's main URL is:

https://github.com/muaz-khan/WebSync-Signaling

=

##### License

[WebRTC Experiments](https://www.webrtc-experiment.com/) are released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/+MuazKhan).
