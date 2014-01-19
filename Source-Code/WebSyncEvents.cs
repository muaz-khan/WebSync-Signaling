// www.WebRTC-Experiment.com
// www.MuazKhan.com
// www.RTCMultiConnection.org
// muazkh@gmail.com
// @muazkh and @WebRTCWeb on twiter

using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using FM;
using FM.WebSync.Server;

namespace SignalingServer
{
    [DataContract]
    public class ChatMessage
    {
        [DataMember(Name = "username")]
        public string Username { get; set; }

        [DataMember(Name = "text")]
        public string Text { get; set; }

        [DataMember(Name = "timestamp")]
        public DateTime Timestamp { get; set; }
    }

    public class WebSyncEvents
    {
        private static List<ChatMessage> Messages = new List<ChatMessage>();
        private static object MessagesLock = new object();

        [WebSyncEvent(EventType.AfterSubscribe, "/chat", FilterType.Template)]
        public static void SendMessages(object sender, WebSyncEventArgs e)
        {
            // include past messages in the response
            ChatMessage[] pastMessages;
            lock (MessagesLock)
            {
                pastMessages = Messages.ToArray();
            }
            e.SetExtensionValueJson("pastMessages", Json.Serialize(pastMessages));
        }

        [WebSyncEvent(EventType.BeforePublish, "/chat", FilterType.Template)]
        public static void StoreMessage(object sender, WebSyncEventArgs e)
        {
            // get the message, timestamp it, and store message for future chatters
            var message = Json.Deserialize<ChatMessage>(e.PublishInfo.DataJson);
            lock (MessagesLock)
            {
                message.Timestamp = DateTime.UtcNow;
                Messages.Add(message);
            }
            e.PublishInfo.DataJson = Json.Serialize(message);
        }
    }
}