<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="SignalingServer.Default" %>

<!--
    // Muaz Khan     - www.MuazKhan.com
    // MIT License   - www.WebRTC-Experiment.com/licence
    // Source Codes  - github.com/muaz-khan
-->

<!DOCTYPE html>
<html lang="en">

    <head>
        <title>WebRTC Experiments & WebSync as Signaling GateWay!</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta charset="utf-8">
    
        <meta name="title" content="WebRTC Experiments & Demos ® Muaz Khan" />
        <meta name="description" content="WebRTC Demos & Experiments; Audio/Video Conferencing & Broadcasting; Recording & Screen-Sharing; File-Sharing, data sharing and text-chat; hangouts; signaling using WebSockets & Socketio; SIP & XMPP; RecordRTC.js; RTCMultiConnection.js; DataChannel.js; getMediaElement.js; File.js; Meeting.js; PeerConnection.js; RTCall.js; and many other WebRTC Libraries; all-in-one solution for WebRTC!" />
        <meta name="keywords" content="WebRTC,Demos,Experiments,RTCMultiConnection.js,RecordRTC.js,getMediaElement.js,DataChannel.js,Library,Documentation,WebRTC-Docs,Muaz-Khan,WebRTC-Tutorials,WebRTC-Libraries" />
    
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <link rel="author" type="text/html" href="https://plus.google.com/+MuazKhan">
        <meta name="author" content="Muaz Khan">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <link rel="stylesheet" href="//www.webrtc-experiment.com/style.css">
        <script>
            document.createElement('article');
            document.createElement('footer');
        </script>
    </head>

    <body>
        <article>
            <header style="text-align: center;">

                <h1>
                    <a href="https://github.com/muaz-khan/WebRTC-Experiment">WebRTC Experiments</a> & WebSync as Signaling GateWay!
                </h1>            
                <p>
                    <span>Copyright © 2013</span>
                    <a href="http://www.muazkhan.com/">Muaz Khan</a><span>&lt;</span><a href="http://twitter.com/muazkh">@muazkh</a><span>&gt;</span>
                    »
                    <a href="http://twitter.com/WebRTCWeb" title="Twitter profile for WebRTC Experiments">@WebRTC Experiments</a>
                    »
                    <a href="https://plus.google.com/106306286430656356034/posts" title="Google+ page for WebRTC Experiments">Google+</a>
                    »
                    <a href="https://github.com/muaz-khan/WebRTC-Experiment/issues">What's New?</a>
                </p>
            </header>

            <div class="github-stargazers"></div>

            <section class="experiment">
                <ol>
                    <li>
                        <a href="/RTCMultiConnection.aspx">RTCMultiConnection All-in-One Demo</a>
                    </li>
                    
                    <li>
                        <a href="/DataChannel.aspx">DataChannel.js » A WebRTC Library for Data Sharing</a>
                    </li>
                    
                    <li>
                        <a href="/video-conferencing.aspx">Video-Conferencing</a>
                    </li>
                
                    <li>
                        <a href="/Pluginfree-Screen-Sharing.aspx">Plugin-free Screen Sharing</a>
                    </li>
                
                    <li>
                        <a href="/admin-guest.aspx">Admin/Guest audio/video calling using RTCMultiConnection</a>
                    </li>
                
                    <li>
                        <a href="/file-hangout.aspx">WebRTC Group File Sharing using RTCDataChannel APIs!</a>
                    </li>
                </ol>
            </section>
		
            <section class="experiment own-widgets latest-commits">
                <h2 class="header" id="updates" style="color: red; padding-bottom: .1em;"><a href="https://github.com/muaz-khan/WebRTC-Experiment/commits/master">Latest Updates</a></h2>
                <div id="github-commits"></div>
            </section>        
            <section class="experiment own-widgets">
                <h2 class="header" id="issues" style="color: red; padding-bottom: .1em;"><a href="https://github.com/muaz-khan/WebRTC-Experiment/issues">Latest Issues</a></h2>
                <div id="github-issues"></div>
            </section>
		
            <section class="experiment">
                <h2 class="header" id="feedback">Feedback</h2>
                <div>
                    <textarea id="message" style="border: 1px solid rgb(189, 189, 189); height: 8em; margin: .2em; outline: none; resize: vertical; width: 98%;" placeholder="Have any message? Suggestions or something went wrong?"></textarea>
                </div>
                <button id="send-message" style="font-size: 1em;">Send Message</button><small style="margin-left: 1em;">Enter your email too; if you want "direct" reply!</small>
            </section>
        </article>
        <footer>
            <p>
                <a href="https://www.webrtc-experiment.com/">WebRTC Experiments</a>
                ©
                <a href="https://plus.google.com/100325991024054712503" rel="author">Muaz Khan</a>, <span>2013 </span>»
                <a href="mailto:muazkh@gmail.com">Email</a>»
                <a href="http://twitter.com/muazkh">@muazkh</a>»
                <a href="https://twitter.com/WebRTCWeb">@WebRTCWeb</a>»
                <a href="https://github.com/muaz-khan">Github</a>
            </p>
        </footer>
	
        <script src="//www.webrtc-experiment.com/commits.js"> </script>
        
        <!-- somee.com hack! -->
        <style>center, .last-div, .last-div ~ * { display: none !important }</style>
        <div class="last-div"></div>
    </body>
</html>