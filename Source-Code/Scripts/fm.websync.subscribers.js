
/*
 * Vendor: Frozen Mountain Software
 * Title: WebSync Client Subscribers Extension for JavaScript
 * Version: 4.2.0
 * Copyright Frozen Mountain Software 2011+
 */

if (typeof global !== 'undefined' && !global.window) { global.window = global; global.document = { cookie: '' }; }

if (!window.fm) { window.fm = {}; }

if (!window.fm.websync) { window.fm.websync = {}; }

if (!window.fm.websync.subscribers) { window.fm.websync.subscribers = {}; }

var __hasProp =  {}.hasOwnProperty;

var __extends =  function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

var __bind =  function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

/**
@class fm.websync.subscribers.subscriberChangeType
 <div>
 The subscribers change type.
 </div><div>
 The type of change to the subscribers of a channel, subscribe or unsubscribe.
 </div>

@extends fm.enum
*/

fm.websync.subscribers.subscriberChangeType = {
  /**
  	@type {fm.websync.subscribers.subscriberChangeType}
  	@description  <div>
  	 Indicates that new clients are subscribing to the channel.
  	 </div>
  */

  Subscribe: 1,
  /**
  	@type {fm.websync.subscribers.subscriberChangeType}
  	@description  <div>
  	 Indicates that existing clients are unsubscribing from the channel.
  	 </div>
  */

  Unsubscribe: 2
};


/**
@class fm.websync.subscribers.base
 <div>
 Base methods supporting the Subscribers extension.
 </div>

@extends fm.object
*/


fm.websync.subscribers.base = (function(_super) {

  __extends(base, _super);

  /**
  	@ignore 
  	@description  <div>
  	 The channel prefix applied to Subscribers notifications.
  	 </div>
  */


  base._subscribersChannelPrefix = "/fm/subscribers";

  /**
  	@ignore 
  	@description  <div>
  	 The reserved name for the Subscribers extension.
  	 </div>
  */


  base._subscribersExtensionName = "fm.subscribers";

  /**
  	@ignore 
  	@description
  */


  function base() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      base.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
  }

  /**
  	 <div>
  	 Gets the subscribed clients.
  	 </div><param name="extensible">The extensible base.</param><returns>The subscribed clients.</returns>
  
  	@function getSubscribedClients
  	@param {fm.websync.extensible} extensible
  	@return {fm.hash}
  */


  base.getSubscribedClients = function() {
    var dictionary, extensible, _var0;
    extensible = arguments[0];
    dictionary = fm.websync.subscribers.serializer.deserializeSubscribedClients(extensible.getExtensionValueJson("fm.subscribers"));
    _var0 = dictionary;
    if (_var0 === null || typeof _var0 === 'undefined') {
      throw new Error("Subscribed clients could not be parsed.");
    }
    return dictionary;
  };

  /**
  	 <div>
  	 Sets the subscribed clients.
  	 </div><param name="extensible">The extensible base.</param><param name="subscribedClients">The subscribed clients.</param>
  
  	@function setSubscribedClients
  	@param {fm.websync.extensible} extensible
  	@param {fm.hash} subscribedClients
  	@return {void}
  */


  base.setSubscribedClients = function() {
    var extensible, subscribedClients;
    extensible = arguments[0];
    subscribedClients = arguments[1];
    return extensible.setExtensionValueJson("fm.subscribers", fm.websync.subscribers.serializer.serializeSubscribedClients(subscribedClients));
  };

  return base;

}).call(this, fm.object);


/**
@class fm.websync.subscribers.clientUnsubscribeArgs
 <div>
 Arguments for the subscriber change callback.
 </div>

@extends fm.websync.baseSuccessArgs
*/


fm.websync.subscribers.clientUnsubscribeArgs = (function(_super) {

  __extends(clientUnsubscribeArgs, _super);

  /**
  	@ignore 
  	@description
  */


  clientUnsubscribeArgs.prototype._channel = null;

  /**
  	@ignore 
  	@description
  */


  clientUnsubscribeArgs.prototype._unsubscribedClient = null;

  /**
  	@ignore 
  	@description
  */


  function clientUnsubscribeArgs() {
    this.setUnsubscribedClient = __bind(this.setUnsubscribedClient, this);

    this.setChannel = __bind(this.setChannel, this);

    this.getUnsubscribedClient = __bind(this.getUnsubscribedClient, this);

    this.getChannel = __bind(this.getChannel, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientUnsubscribeArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientUnsubscribeArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the channel on which the change occurred.
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  clientUnsubscribeArgs.prototype.getChannel = function() {
    return this._channel;
  };

  /**
  	 <div>
  	 Gets the client who unsubscribed from the channel.
  	 </div>
  
  	@function getUnsubscribedClient
  	@return {fm.websync.subscribedClient}
  */


  clientUnsubscribeArgs.prototype.getUnsubscribedClient = function() {
    return this._unsubscribedClient;
  };

  /**
  	 <div>
  	 Sets the channel on which the change occurred.
  	 </div>
  
  	@function setChannel
  	@param {fm.string} value
  	@return {void}
  */


  clientUnsubscribeArgs.prototype.setChannel = function() {
    var value;
    value = arguments[0];
    return this._channel = value;
  };

  /**
  	 <div>
  	 Sets the client who unsubscribed from the channel.
  	 </div>
  
  	@function setUnsubscribedClient
  	@param {fm.websync.subscribedClient} value
  	@return {void}
  */


  clientUnsubscribeArgs.prototype.setUnsubscribedClient = function() {
    var value;
    value = arguments[0];
    return this._unsubscribedClient = value;
  };

  return clientUnsubscribeArgs;

})(fm.websync.baseSuccessArgs);


/**
@class fm.websync.subscribers.serializer

@extends fm.object
*/


fm.websync.subscribers.serializer = (function(_super) {

  __extends(serializer, _super);

  /**
  	@ignore 
  	@description
  */


  function serializer() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      serializer.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    serializer.__super__.constructor.call(this);
  }

  /**
  
  	@function createSubscribedClients
  	@return {fm.hash}
  */


  serializer.createSubscribedClients = function() {
    return {};
  };

  /**
  
  	@function createSubscriberChange
  	@return {fm.websync.subscribers.subscriberChange}
  */


  serializer.createSubscriberChange = function() {
    return new fm.websync.subscribers.subscriberChange();
  };

  /**
  	 <div>
  	 Deserializes a subscribed clients collection from JSON.
  	 </div><param name="subscribedClientsJson">The subscribed clients collection (in JSON) to deserialize.</param><returns>The deserialized subscribed clients collection.</returns>
  
  	@function deserializeSubscribedClients
  	@param {fm.string} subscribedClientsJson
  	@return {fm.hash}
  */


  serializer.deserializeSubscribedClients = function() {
    var subscribedClientsJson;
    subscribedClientsJson = arguments[0];
    return fm.serializer.deserializeObject(subscribedClientsJson, serializer.createSubscribedClients, serializer.deserializeSubscribedClientsCallback);
  };

  /**
  
  	@function deserializeSubscribedClientsCallback
  	@param {fm.hash} subscribedClients
  	@param {fm.string} name
  	@param {fm.string} valueJson
  	@return {void}
  */


  serializer.deserializeSubscribedClientsCallback = function() {
    var name, subscribedClients, valueJson;
    subscribedClients = arguments[0];
    name = arguments[1];
    valueJson = arguments[2];
    return subscribedClients[name] = fm.websync.subscribedClient.fromJsonMultiple(valueJson);
  };

  /**
  	 <div>
  	 Deserializes a subscriber change object from JSON.
  	 </div><param name="subscriberChangeJson">The subscriber change object (in JSON) to deserialize.</param><returns>The deserialized subscriber change object.</returns>
  
  	@function deserializeSubscriberChange
  	@param {fm.string} subscriberChangeJson
  	@return {fm.websync.subscribers.subscriberChange}
  */


  serializer.deserializeSubscriberChange = function() {
    var subscriberChangeJson;
    subscriberChangeJson = arguments[0];
    return fm.serializer.deserializeObjectFast(subscriberChangeJson, serializer.createSubscriberChange, serializer.deserializeSubscriberChangeCallback);
  };

  /**
  
  	@function deserializeSubscriberChangeCallback
  	@param {fm.websync.subscribers.subscriberChange} subscriberChange
  	@param {fm.string} name
  	@param {fm.string} valueJson
  	@return {void}
  */


  serializer.deserializeSubscriberChangeCallback = function() {
    var name, str, subscriberChange, valueJson, _var0;
    subscriberChange = arguments[0];
    name = arguments[1];
    valueJson = arguments[2];
    str = name;
    _var0 = str;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      if (!(str === "client")) {
        if (str === "type") {
          return subscriberChange.setType(fm.websync.subscribers.serializer.deserializeSubscriberChangeType(valueJson));
        }
      } else {
        return subscriberChange.setClient(fm.websync.subscribedClient.fromJson(valueJson));
      }
    }
  };

  /**
  	 <div>
  	 Deserializes a subscriber change type from JSON.
  	 </div><param name="subscriberChangeTypeJson">The subscriber change type (in JSON) to deserialize.</param><returns>The deserialized subscriber change type.</returns>
  
  	@function deserializeSubscriberChangeType
  	@param {fm.string} subscriberChangeTypeJson
  	@return {fm.websync.subscribers.subscriberChangeType}
  */


  serializer.deserializeSubscriberChangeType = function() {
    var subscriberChangeTypeJson;
    subscriberChangeTypeJson = arguments[0];
    switch (fm.serializer.deserializeString(subscriberChangeTypeJson)) {
      case "subscribe":
        return fm.websync.subscribers.subscriberChangeType.Subscribe;
      case "unsubscribe":
        return fm.websync.subscribers.subscriberChangeType.Unsubscribe;
    }
    throw new Error("Unknown subscriber change type.");
  };

  /**
  	 <div>
  	 Serializes a subscribed clients collection to JSON.
  	 </div><param name="subscribedClients">The subscribed clients collection to serialize.</param><returns>The serialized subscribed clients collection.</returns>
  
  	@function serializeSubscribedClients
  	@param {fm.hash} subscribedClients
  	@return {fm.string}
  */


  serializer.serializeSubscribedClients = function() {
    var subscribedClients;
    subscribedClients = arguments[0];
    return fm.serializer.serializeObject(subscribedClients, serializer.serializeSubscribedClientsCallback);
  };

  /**
  
  	@function serializeSubscribedClientsCallback
  	@param {fm.hash} subscribedClients
  	@param {fm.hash} jsonObject
  	@return {void}
  */


  serializer.serializeSubscribedClientsCallback = function() {
    var jsonObject, str, subscribedClients, _i, _len, _results, _var0;
    subscribedClients = arguments[0];
    jsonObject = arguments[1];
    _var0 = fm.hashExtensions.getKeys(subscribedClients);
    _results = [];
    for (_i = 0, _len = _var0.length; _i < _len; _i++) {
      str = _var0[_i];
      _results.push(jsonObject[str] = fm.websync.subscribedClient.toJsonMultiple(subscribedClients[str]));
    }
    return _results;
  };

  /**
  	 <div>
  	 Serializes a subscriber change object to JSON.
  	 </div><param name="subscriberChange">The subscriber change object to serialize.</param><returns>The serialized subscriber change object.</returns>
  
  	@function serializeSubscriberChange
  	@param {fm.websync.subscribers.subscriberChange} subscriberChange
  	@return {fm.string}
  */


  serializer.serializeSubscriberChange = function() {
    var subscriberChange;
    subscriberChange = arguments[0];
    return fm.serializer.serializeObjectFast(subscriberChange, serializer.serializeSubscriberChangeCallback);
  };

  /**
  
  	@function serializeSubscriberChangeCallback
  	@param {fm.websync.subscribers.subscriberChange} subscriberChange
  	@param {fm.hash} jsonObject
  	@return {void}
  */


  serializer.serializeSubscriberChangeCallback = function() {
    var jsonObject, subscriberChange, _var0;
    subscriberChange = arguments[0];
    jsonObject = arguments[1];
    _var0 = subscriberChange.getClient();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      jsonObject["client"] = fm.websync.subscribedClient.toJson(subscriberChange.getClient());
    }
    return jsonObject["type"] = fm.websync.subscribers.serializer.serializeSubscriberChangeType(subscriberChange.getType());
  };

  /**
  	 <div>
  	 Serializes a subscriber change type to JSON.
  	 </div><param name="subscriberChangeType">The subscriber change type to serialize.</param><returns>The serialized subscriber change type.</returns>
  
  	@function serializeSubscriberChangeType
  	@param {fm.websync.subscribers.subscriberChangeType} subscriberChangeType
  	@return {fm.string}
  */


  serializer.serializeSubscriberChangeType = function() {
    var str, subscriberChangeType;
    subscriberChangeType = arguments[0];
    switch (subscriberChangeType) {
      case fm.websync.subscribers.subscriberChangeType.Subscribe:
        str = "subscribe";
        break;
      case fm.websync.subscribers.subscriberChangeType.Unsubscribe:
        str = "unsubscribe";
        break;
      default:
        throw new Error("Unknown subscriber change type.");
    }
    return fm.serializer.serializeString(str);
  };

  return serializer;

}).call(this, fm.object);


/**
@class fm.websync.subscribers.subscriberChangeCallback

@extends fm.object
*/


fm.websync.subscribers.subscriberChangeCallback = (function(_super) {

  __extends(subscriberChangeCallback, _super);

  /**
  	@ignore 
  	@description
  */


  subscriberChangeCallback.prototype._dynamicProperties = null;

  /**
  	@ignore 
  	@description
  */


  subscriberChangeCallback.prototype._onClientSubscribe = null;

  /**
  	@ignore 
  	@description
  */


  subscriberChangeCallback.prototype._onClientUnsubscribe = null;

  /**
  	@ignore 
  	@description
  */


  function subscriberChangeCallback() {
    this.setOnClientUnsubscribe = __bind(this.setOnClientUnsubscribe, this);

    this.setOnClientSubscribe = __bind(this.setOnClientSubscribe, this);

    this.setDynamicProperties = __bind(this.setDynamicProperties, this);

    this.onReceive = __bind(this.onReceive, this);

    this.getOnClientUnsubscribe = __bind(this.getOnClientUnsubscribe, this);

    this.getOnClientSubscribe = __bind(this.getOnClientSubscribe, this);

    this.getDynamicProperties = __bind(this.getDynamicProperties, this);

    var dynamicProperties, onClientSubscribe, onClientUnsubscribe;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      subscriberChangeCallback.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    onClientSubscribe = arguments[0];
    onClientUnsubscribe = arguments[1];
    dynamicProperties = arguments[2];
    subscriberChangeCallback.__super__.constructor.call(this);
    this.setOnClientSubscribe(onClientSubscribe);
    this.setOnClientUnsubscribe(onClientUnsubscribe);
    this.setDynamicProperties(dynamicProperties);
  }

  /**
  
  	@function getDynamicProperties
  	@return {fm.hash}
  */


  subscriberChangeCallback.prototype.getDynamicProperties = function() {
    return this._dynamicProperties;
  };

  /**
  
  	@function getOnClientSubscribe
  	@return {fm.singleAction}
  */


  subscriberChangeCallback.prototype.getOnClientSubscribe = function() {
    return this._onClientSubscribe;
  };

  /**
  
  	@function getOnClientUnsubscribe
  	@return {fm.singleAction}
  */


  subscriberChangeCallback.prototype.getOnClientUnsubscribe = function() {
    return this._onClientUnsubscribe;
  };

  /**
  
  	@function onReceive
  	@param {fm.websync.subscribeReceiveArgs} receiveArgs
  	@return {void}
  */


  subscriberChangeCallback.prototype.onReceive = function() {
    var args2, args3, args4, change, p, receiveArgs, _var0, _var1, _var2;
    receiveArgs = arguments[0];
    change = fm.websync.subscribers.serializer.deserializeSubscriberChange(receiveArgs.getDataJson());
    _var0 = change.getClient().getClientId();
    if ((_var0 === null ? _var0 !== receiveArgs.getClient().getClientId() : !_var0.equals(receiveArgs.getClient().getClientId()))) {
      if (change.getType() === fm.websync.subscribers.subscriberChangeType.Subscribe) {
        _var1 = this.getOnClientSubscribe();
        if (_var1 !== null && typeof _var1 !== 'undefined') {
          args2 = new fm.websync.subscribers.clientSubscribeArgs();
          args2.setSubscribedClient(change.getClient());
          args2.setChannel(receiveArgs.getChannel().substring("/fm/subscribers".length));
          args2.setTimestamp(receiveArgs.getTimestamp());
          args2.setClient(receiveArgs.getClient());
          args2.setDynamicProperties(this.getDynamicProperties());
          p = args2;
          p.copyExtensions(receiveArgs);
          return this.getOnClientSubscribe()(p);
        }
      } else {
        _var2 = this.getOnClientUnsubscribe();
        if (_var2 !== null && typeof _var2 !== 'undefined') {
          args4 = new fm.websync.subscribers.clientUnsubscribeArgs();
          args4.setUnsubscribedClient(change.getClient());
          args4.setChannel(receiveArgs.getChannel().substring("/fm/subscribers".length));
          args4.setTimestamp(receiveArgs.getTimestamp());
          args4.setClient(receiveArgs.getClient());
          args4.setDynamicProperties(this.getDynamicProperties());
          args3 = args4;
          args3.copyExtensions(receiveArgs);
          return this.getOnClientUnsubscribe()(args3);
        }
      }
    }
  };

  /**
  
  	@function setDynamicProperties
  	@param {fm.hash} value
  	@return {void}
  */


  subscriberChangeCallback.prototype.setDynamicProperties = function() {
    var value;
    value = arguments[0];
    return this._dynamicProperties = value;
  };

  /**
  
  	@function setOnClientSubscribe
  	@param {fm.singleAction} value
  	@return {void}
  */


  subscriberChangeCallback.prototype.setOnClientSubscribe = function() {
    var value;
    value = arguments[0];
    return this._onClientSubscribe = value;
  };

  /**
  
  	@function setOnClientUnsubscribe
  	@param {fm.singleAction} value
  	@return {void}
  */


  subscriberChangeCallback.prototype.setOnClientUnsubscribe = function() {
    var value;
    value = arguments[0];
    return this._onClientUnsubscribe = value;
  };

  return subscriberChangeCallback;

})(fm.object);


/**
@class fm.websync.subscribers.subscribeArgsExtensions
 <div>
 <see cref="fm.websync.subscribeArgs">fm.websync.subscribeArgs</see> extension methods for the Subscribers extension.
 </div><div>
 <p>
 The subscribers extension provides support for initial state load and differential
 updates on the clients actively subscribed to the channel(s).
 </p>
 <p>
 The extension is activated by adding a reference to your project.
 </p>
 </div>
*/

fm.websync.subscribers.subscribeArgsExtensions = (function() {
  /**
  	@ignore 
  	@description
  */

  function subscribeArgsExtensions() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      subscribeArgsExtensions.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
  }

  /**
  
  	@function addToChannelsCache
  	@param {fm.websync.client} client
  	@param {fm.string} channel
  	@return {void}
  */


  subscribeArgsExtensions.addToChannelsCache = function() {
    var channel, channelsCache, client, _var0;
    client = arguments[0];
    channel = arguments[1];
    channelsCache = fm.websync.subscribers.subscribeArgsExtensions.getChannelsCache(client);
    _var0 = channelsCache;
    if (!((_var0 === null || typeof _var0 === 'undefined') || fm.arrayExtensions.contains(channelsCache, channel))) {
      return fm.arrayExtensions.add(channelsCache, channel);
    }
  };

  /**
  
  	@function client_OnDisconnectResponse
  	@param {fm.websync.client} client
  	@param {fm.websync.clientDisconnectResponseArgs} args
  	@return {void}
  */


  subscribeArgsExtensions.client_OnDisconnectResponse = function() {
    var args, channelsCache, client, str, _i, _len, _results, _var0, _var1;
    client = arguments[0];
    args = arguments[1];
    channelsCache = fm.websync.subscribers.subscribeArgsExtensions.getChannelsCache(client);
    _var0 = channelsCache;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      _var1 = channelsCache;
      _results = [];
      for (_i = 0, _len = _var1.length; _i < _len; _i++) {
        str = _var1[_i];
        _results.push(args.getClient().unsetCustomOnReceive(str));
      }
      return _results;
    }
  };

  /**
  
  	@function client_OnSubscribeEnd
  	@param {fm.websync.client} client
  	@param {fm.websync.clientSubscribeEndArgs} args
  	@return {void}
  */


  subscribeArgsExtensions.client_OnSubscribeEnd = function() {
    var args, callback, channel, client, onClientSubscribe, onClientUnsubscribe, str, _i, _len, _results, _var0, _var1, _var2, _var3;
    client = arguments[0];
    args = arguments[1];
    _var0 = args.getException();
    if (_var0 === null || typeof _var0 === 'undefined') {
      onClientSubscribe = fm.websync.subscribers.subscribeArgsExtensions.getOnClientSubscribe(args.getMethodArgs());
      onClientUnsubscribe = fm.websync.subscribers.subscribeArgsExtensions.getOnClientUnsubscribe(args.getMethodArgs());
      _var1 = onClientSubscribe;
      _var2 = onClientUnsubscribe;
      if ((_var1 !== null && typeof _var1 !== 'undefined') || (_var2 !== null && typeof _var2 !== 'undefined')) {
        _var3 = args.getResponse().getChannels();
        _results = [];
        for (_i = 0, _len = _var3.length; _i < _len; _i++) {
          str = _var3[_i];
          channel = fm.stringExtensions.concat("/fm/subscribers", str);
          fm.websync.subscribers.subscribeArgsExtensions.addToChannelsCache(client, channel);
          callback = new fm.websync.subscribers.subscriberChangeCallback(onClientSubscribe, onClientUnsubscribe, args.getMethodArgs().getDynamicProperties());
          _results.push(args.getClient().setCustomOnReceive(channel, callback.onReceive));
        }
        return _results;
      }
    }
  };

  /**
  
  	@function client_OnSubscribeRequest
  	@param {fm.websync.client} client
  	@param {fm.websync.clientSubscribeRequestArgs} args
  	@return {void}
  */


  subscribeArgsExtensions.client_OnSubscribeRequest = function() {
    var args, client, list, onClientSubscribe, onClientUnsubscribe, str, _i, _len, _var0, _var1, _var2, _var3;
    client = arguments[0];
    args = arguments[1];
    _var0 = fm.websync.subscribers.subscribeArgsExtensions.getChannelsCache(client);
    if (_var0 === null || typeof _var0 === 'undefined') {
      fm.websync.subscribers.subscribeArgsExtensions.setChannelsCache(client, []);
    }
    onClientSubscribe = fm.websync.subscribers.subscribeArgsExtensions.getOnClientSubscribe(args.getMethodArgs());
    onClientUnsubscribe = fm.websync.subscribers.subscribeArgsExtensions.getOnClientUnsubscribe(args.getMethodArgs());
    _var1 = onClientSubscribe;
    _var2 = onClientUnsubscribe;
    if ((_var1 !== null && typeof _var1 !== 'undefined') || (_var2 !== null && typeof _var2 !== 'undefined')) {
      list = [];
      _var3 = args.getMethodArgs().getChannels();
      for (_i = 0, _len = _var3.length; _i < _len; _i++) {
        str = _var3[_i];
        fm.arrayExtensions.add(list, str);
        fm.arrayExtensions.add(list, fm.stringExtensions.concat("/fm/subscribers", str));
      }
      return args.getMethodArgs().setChannels(fm.arrayExtensions.toArray(list));
    }
  };

  /**
  
  	@function client_OnSubscribeResponse
  	@param {fm.websync.client} client
  	@param {fm.websync.clientSubscribeResponseArgs} args
  	@return {void}
  */


  subscribeArgsExtensions.client_OnSubscribeResponse = function() {
    var args, client, list, str, _i, _len, _var0, _var1;
    client = arguments[0];
    args = arguments[1];
    _var0 = args.getException();
    if (_var0 === null || typeof _var0 === 'undefined') {
      list = [];
      _var1 = args.getResponse().getChannels();
      for (_i = 0, _len = _var1.length; _i < _len; _i++) {
        str = _var1[_i];
        if (!fm.stringExtensions.startsWith(str, "/fm/subscribers/")) {
          fm.arrayExtensions.add(list, str);
        }
      }
      args.getMethodArgs().setChannels(fm.arrayExtensions.toArray(list));
      return args.getResponse().setChannels(fm.arrayExtensions.toArray(list));
    }
  };

  /**
  
  	@function client_OnUnsubscribeRequest
  	@param {fm.websync.client} client
  	@param {fm.websync.clientUnsubscribeRequestArgs} args
  	@return {void}
  */


  subscribeArgsExtensions.client_OnUnsubscribeRequest = function() {
    var args, client, list, str, _i, _len, _var0;
    client = arguments[0];
    args = arguments[1];
    list = [];
    _var0 = args.getMethodArgs().getChannels();
    for (_i = 0, _len = _var0.length; _i < _len; _i++) {
      str = _var0[_i];
      fm.arrayExtensions.add(list, str);
      fm.arrayExtensions.add(list, fm.stringExtensions.concat("/fm/subscribers", str));
    }
    return args.getMethodArgs().setChannels(fm.arrayExtensions.toArray(list));
  };

  /**
  
  	@function client_OnUnsubscribeResponse
  	@param {fm.websync.client} client
  	@param {fm.websync.clientUnsubscribeResponseArgs} args
  	@return {void}
  */


  subscribeArgsExtensions.client_OnUnsubscribeResponse = function() {
    var args, client, list, str, _i, _j, _len, _len1, _var0, _var1, _var2;
    client = arguments[0];
    args = arguments[1];
    _var0 = args.getException();
    if (_var0 === null || typeof _var0 === 'undefined') {
      _var1 = args.getResponse().getChannels();
      for (_i = 0, _len = _var1.length; _i < _len; _i++) {
        str = _var1[_i];
        if (fm.stringExtensions.startsWith(str, "/fm/subscribers")) {
          fm.websync.subscribers.subscribeArgsExtensions.removeFromChannelsCache(client, str);
          args.getClient().unsetCustomOnReceive(str);
        }
      }
      list = [];
      _var2 = args.getResponse().getChannels();
      for (_j = 0, _len1 = _var2.length; _j < _len1; _j++) {
        str = _var2[_j];
        if (!fm.stringExtensions.startsWith(str, "/fm/subscribers/")) {
          fm.arrayExtensions.add(list, str);
        }
      }
      args.getMethodArgs().setChannels(fm.arrayExtensions.toArray(list));
      return args.getResponse().setChannels(fm.arrayExtensions.toArray(list));
    }
  };

  /**
  
  	@function getChannelsCache
  	@param {fm.websync.client} client
  	@return {fm.array}
  */


  subscribeArgsExtensions.getChannelsCache = function() {
    var client;
    client = arguments[0];
    return fm.global.tryCastArray(client.getDynamicValue("fm.subscribers.channels"));
  };

  /**
  	 <div>
  	 Gets the callback invoked when a client subscribes.
  	 </div><param name="args">The <see cref="fm.websync.subscribeArgs">fm.websync.subscribeArgs</see> to extend.</param><returns>The callback invoked when a client subscribes.</returns>
  
  	@function getOnClientSubscribe
  	@param {fm.websync.subscribeArgs} args
  	@return {fm.singleAction}
  */


  subscribeArgsExtensions.getOnClientSubscribe = function() {
    var args;
    args = arguments[0];
    return args.getDynamicValue("fm.subscribers.onClientSubscribe");
  };

  /**
  	 <div>
  	 Gets the callback invoked when a client unsubscribes.
  	 </div><param name="args">The <see cref="fm.websync.subscribeArgs">fm.websync.subscribeArgs</see> to extend.</param><returns>The callback invoked when a client unsubscribes.</returns>
  
  	@function getOnClientUnsubscribe
  	@param {fm.websync.subscribeArgs} args
  	@return {fm.singleAction}
  */


  subscribeArgsExtensions.getOnClientUnsubscribe = function() {
    var args;
    args = arguments[0];
    return args.getDynamicValue("fm.subscribers.onClientUnsubscribe");
  };

  /**
  
  	@function removeFromChannelsCache
  	@param {fm.websync.client} client
  	@param {fm.string} channel
  	@return {void}
  */


  subscribeArgsExtensions.removeFromChannelsCache = function() {
    var channel, channelsCache, client, _var0;
    client = arguments[0];
    channel = arguments[1];
    channelsCache = fm.websync.subscribers.subscribeArgsExtensions.getChannelsCache(client);
    _var0 = channelsCache;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      return fm.arrayExtensions.remove(channelsCache, channel);
    }
  };

  /**
  
  	@function setChannelsCache
  	@param {fm.websync.client} client
  	@param {fm.array} channels
  	@return {void}
  */


  subscribeArgsExtensions.setChannelsCache = function() {
    var channels, client;
    client = arguments[0];
    channels = arguments[1];
    return client.setDynamicValue("fm.subscribers.channels", channels);
  };

  /**
  	 <div>
  	 Sets a callback to invoke when a client subscribes.
  	 </div><param name="args">The <see cref="fm.websync.subscribeArgs">fm.websync.subscribeArgs</see> to extend.</param><param name="onClientSubscribe">The callback to invoke when a client subscribes to
  	 the channel(s)).</param><returns>The <see cref="fm.websync.subscribeArgs">fm.websync.subscribeArgs</see>.</returns>
  
  	@function setOnClientSubscribe
  	@param {fm.websync.subscribeArgs} args
  	@param {fm.singleAction} onClientSubscribe
  	@return {fm.websync.subscribeArgs}
  */


  subscribeArgsExtensions.setOnClientSubscribe = function() {
    var args, onClientSubscribe;
    args = arguments[0];
    onClientSubscribe = arguments[1];
    args.setDynamicValue("fm.subscribers.onClientSubscribe", onClientSubscribe);
    return args;
  };

  /**
  	 <div>
  	 Sets a callback to invoke when a client unsubscribes.
  	 </div><param name="args">The <see cref="fm.websync.subscribeArgs">fm.websync.subscribeArgs</see> to extend.</param><param name="onClientUnsubscribe">The callback to invoke when a client unsubscribes from
  	 the channel(s)).</param><returns>The <see cref="fm.websync.subscribeArgs">fm.websync.subscribeArgs</see>.</returns>
  
  	@function setOnClientUnsubscribe
  	@param {fm.websync.subscribeArgs} args
  	@param {fm.singleAction} onClientUnsubscribe
  	@return {fm.websync.subscribeArgs}
  */


  subscribeArgsExtensions.setOnClientUnsubscribe = function() {
    var args, onClientUnsubscribe;
    args = arguments[0];
    onClientUnsubscribe = arguments[1];
    args.setDynamicValue("fm.subscribers.onClientUnsubscribe", onClientUnsubscribe);
    return args;
  };

  /**
  	 <div>
  	 Gets the callback invoked when a client subscribes.
  	 </div><param name="args">The <see cref="fm.websync.subscribeArgs">fm.websync.subscribeArgs</see> to extend.</param><returns>The callback invoked when a client subscribes.</returns>
  
  	@function getOnClientSubscribe
  	@return {fm.singleAction}
  */


  fm.websync.subscribeArgs.prototype.getOnClientSubscribe = function() {
    Array.prototype.splice.call(arguments, 0, 0, this);
    return fm.websync.subscribers.subscribeArgsExtensions.getOnClientSubscribe.apply(this, arguments);
  };

  /**
  	 <div>
  	 Gets the callback invoked when a client unsubscribes.
  	 </div><param name="args">The <see cref="fm.websync.subscribeArgs">fm.websync.subscribeArgs</see> to extend.</param><returns>The callback invoked when a client unsubscribes.</returns>
  
  	@function getOnClientUnsubscribe
  	@return {fm.singleAction}
  */


  fm.websync.subscribeArgs.prototype.getOnClientUnsubscribe = function() {
    Array.prototype.splice.call(arguments, 0, 0, this);
    return fm.websync.subscribers.subscribeArgsExtensions.getOnClientUnsubscribe.apply(this, arguments);
  };

  /**
  	 <div>
  	 Sets a callback to invoke when a client subscribes.
  	 </div><param name="args">The <see cref="fm.websync.subscribeArgs">fm.websync.subscribeArgs</see> to extend.</param><param name="onClientSubscribe">The callback to invoke when a client subscribes to
  	 the channel(s)).</param><returns>The <see cref="fm.websync.subscribeArgs">fm.websync.subscribeArgs</see>.</returns>
  
  	@function setOnClientSubscribe
  	@param {fm.singleAction} onClientSubscribe
  	@return {fm.websync.subscribeArgs}
  */


  fm.websync.subscribeArgs.prototype.setOnClientSubscribe = function() {
    var onClientSubscribe;
    onClientSubscribe = arguments[0];
    Array.prototype.splice.call(arguments, 0, 0, this);
    return fm.websync.subscribers.subscribeArgsExtensions.setOnClientSubscribe.apply(this, arguments);
  };

  /**
  	 <div>
  	 Sets a callback to invoke when a client unsubscribes.
  	 </div><param name="args">The <see cref="fm.websync.subscribeArgs">fm.websync.subscribeArgs</see> to extend.</param><param name="onClientUnsubscribe">The callback to invoke when a client unsubscribes from
  	 the channel(s)).</param><returns>The <see cref="fm.websync.subscribeArgs">fm.websync.subscribeArgs</see>.</returns>
  
  	@function setOnClientUnsubscribe
  	@param {fm.singleAction} onClientUnsubscribe
  	@return {fm.websync.subscribeArgs}
  */


  fm.websync.subscribeArgs.prototype.setOnClientUnsubscribe = function() {
    var onClientUnsubscribe;
    onClientUnsubscribe = arguments[0];
    Array.prototype.splice.call(arguments, 0, 0, this);
    return fm.websync.subscribers.subscribeArgsExtensions.setOnClientUnsubscribe.apply(this, arguments);
  };

  fm.websync.client.addOnSubscribeRequest(subscribeArgsExtensions.client_OnSubscribeRequest);

  fm.websync.client.addOnSubscribeResponse(subscribeArgsExtensions.client_OnSubscribeResponse);

  fm.websync.client.addOnSubscribeEnd(subscribeArgsExtensions.client_OnSubscribeEnd);

  fm.websync.client.addOnUnsubscribeRequest(subscribeArgsExtensions.client_OnUnsubscribeRequest);

  fm.websync.client.addOnUnsubscribeResponse(subscribeArgsExtensions.client_OnUnsubscribeResponse);

  fm.websync.client.addOnDisconnectResponse(subscribeArgsExtensions.client_OnDisconnectResponse);

  return subscribeArgsExtensions;

}).call(this);


/**
@class fm.websync.subscribers.subscriberChange
 <div>
 A description of a subscriber change on a channel, either a new
 subscriber entering or an existing subscriber leaving.
 </div>

@extends fm.serializable
*/


fm.websync.subscribers.subscriberChange = (function(_super) {

  __extends(subscriberChange, _super);

  /**
  	@ignore 
  	@description
  */


  subscriberChange.prototype.__client = null;

  /**
  	@ignore 
  	@description
  */


  subscriberChange.prototype.__type = null;

  /**
  	@ignore 
  	@description
  */


  function subscriberChange() {
    this.toJson = __bind(this.toJson, this);

    this.setType = __bind(this.setType, this);

    this.setClient = __bind(this.setClient, this);

    this.getType = __bind(this.getType, this);

    this.getClient = __bind(this.getClient, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      subscriberChange.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    subscriberChange.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Deserializes a subscriber change object from JSON.
  	 </div><param name="subscriberChangeJson">A JSON string to deserialize.</param><returns>The deserialized subscriber change object.</returns>
  
  	@function fromJson
  	@param {fm.string} subscriberChangeJson
  	@return {fm.websync.subscribers.subscriberChange}
  */


  subscriberChange.fromJson = function() {
    var subscriberChangeJson;
    subscriberChangeJson = arguments[0];
    return fm.websync.subscribers.serializer.deserializeSubscriberChange(subscriberChangeJson);
  };

  /**
  	 <div>
  	 Serializes a subscriber change object to JSON.
  	 </div><param name="subscriberChange">A subscriber change object to serialize.</param><returns>The serialized subscriber change object.</returns>
  
  	@function toJson
  	@param {fm.websync.subscribers.subscriberChange} subscriberChange
  	@return {fm.string}
  */


  subscriberChange.toJson = function() {
    var subscriberChange;
    subscriberChange = arguments[0];
    return fm.websync.subscribers.serializer.serializeSubscriberChange(subscriberChange);
  };

  /**
  	 <div>
  	 Gets the client who subscribed to or unsubscribed from the channel.
  	 </div>
  
  	@function getClient
  	@return {fm.websync.subscribedClient}
  */


  subscriberChange.prototype.getClient = function() {
    return this.__client;
  };

  /**
  	 <div>
  	 Gets the type of the subscriber change, either subscribe or unsubscribe.
  	 </div>
  
  	@function getType
  	@return {fm.websync.subscribers.subscriberChangeType}
  */


  subscriberChange.prototype.getType = function() {
    return this.__type;
  };

  /**
  	 <div>
  	 Sets the client who subscribed to or unsubscribed from the channel.
  	 </div>
  
  	@function setClient
  	@param {fm.websync.subscribedClient} value
  	@return {void}
  */


  subscriberChange.prototype.setClient = function() {
    var value;
    value = arguments[0];
    this.setIsDirty(true);
    return this.__client = value;
  };

  /**
  	 <div>
  	 Sets the type of the subscriber change, either subscribe or unsubscribe.
  	 </div>
  
  	@function setType
  	@param {fm.websync.subscribers.subscriberChangeType} value
  	@return {void}
  */


  subscriberChange.prototype.setType = function() {
    var value;
    value = arguments[0];
    this.setIsDirty(true);
    return this.__type = value;
  };

  /**
  	 <div>
  	 Serializes the subscriber change object to JSON.
  	 </div><returns>The serialized subscriber change object.</returns>
  
  	@function toJson
  	@return {fm.string}
  */


  subscriberChange.prototype.toJson = function() {
    return fm.websync.subscribers.subscriberChange.toJson(this);
  };

  return subscriberChange;

}).call(this, fm.serializable);


/**
@class fm.websync.subscribers.clientSubscribeArgs
 <div>
 Arguments for the subscriber change callback.
 </div>

@extends fm.websync.baseSuccessArgs
*/


fm.websync.subscribers.clientSubscribeArgs = (function(_super) {

  __extends(clientSubscribeArgs, _super);

  /**
  	@ignore 
  	@description
  */


  clientSubscribeArgs.prototype._channel = null;

  /**
  	@ignore 
  	@description
  */


  clientSubscribeArgs.prototype._subscribedClient = null;

  /**
  	@ignore 
  	@description
  */


  function clientSubscribeArgs() {
    this.setSubscribedClient = __bind(this.setSubscribedClient, this);

    this.setChannel = __bind(this.setChannel, this);

    this.getSubscribedClient = __bind(this.getSubscribedClient, this);

    this.getChannel = __bind(this.getChannel, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientSubscribeArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientSubscribeArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the channel on which the change occurred.
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  clientSubscribeArgs.prototype.getChannel = function() {
    return this._channel;
  };

  /**
  	 <div>
  	 Gets the client who subscribed to the channel.
  	 </div>
  
  	@function getSubscribedClient
  	@return {fm.websync.subscribedClient}
  */


  clientSubscribeArgs.prototype.getSubscribedClient = function() {
    return this._subscribedClient;
  };

  /**
  	 <div>
  	 Sets the channel on which the change occurred.
  	 </div>
  
  	@function setChannel
  	@param {fm.string} value
  	@return {void}
  */


  clientSubscribeArgs.prototype.setChannel = function() {
    var value;
    value = arguments[0];
    return this._channel = value;
  };

  /**
  	 <div>
  	 Sets the client who subscribed to the channel.
  	 </div>
  
  	@function setSubscribedClient
  	@param {fm.websync.subscribedClient} value
  	@return {void}
  */


  clientSubscribeArgs.prototype.setSubscribedClient = function() {
    var value;
    value = arguments[0];
    return this._subscribedClient = value;
  };

  return clientSubscribeArgs;

})(fm.websync.baseSuccessArgs);


/**
@class fm.websync.subscribers.subscribeSuccessArgsExtensions
 <div>
 <see cref="fm.websync.subscribeSuccessArgs">fm.websync.subscribeSuccessArgs</see> extension methods for the Subscribers extension.
 </div><div>
 <p>
 The subscribers extension provides support for initial state load and differential
 updates on the clients actively subscribed to the channel(s).
 </p>
 <p>
 The extension is activated by adding a reference to your project.
 </p>
 </div>
*/

fm.websync.subscribers.subscribeSuccessArgsExtensions = (function() {
  /**
  	@ignore 
  	@description
  */

  function subscribeSuccessArgsExtensions() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      subscribeSuccessArgsExtensions.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
  }

  /**
  	 <div>
  	 Gets the active subscribed clients on the just-subscribed channel(s).
  	 </div><param name="args">The <see cref="fm.websync.subscribeSuccessArgs">fm.websync.subscribeSuccessArgs</see> to extend.</param><returns>The subscribed clients, partitioned by channel.</returns>
  
  	@function getSubscribedClients
  	@param {fm.websync.subscribeSuccessArgs} args
  	@return {fm.hash}
  */


  subscribeSuccessArgsExtensions.getSubscribedClients = function() {
    var args;
    args = arguments[0];
    return fm.websync.subscribers.base.getSubscribedClients(args);
  };

  /**
  	 <div>
  	 Gets the active subscribed clients on the just-subscribed channel(s).
  	 </div><param name="args">The <see cref="fm.websync.subscribeSuccessArgs">fm.websync.subscribeSuccessArgs</see> to extend.</param><returns>The subscribed clients, partitioned by channel.</returns>
  
  	@function getSubscribedClients
  	@return {fm.hash}
  */


  fm.websync.subscribeSuccessArgs.prototype.getSubscribedClients = function() {
    Array.prototype.splice.call(arguments, 0, 0, this);
    return fm.websync.subscribers.subscribeSuccessArgsExtensions.getSubscribedClients.apply(this, arguments);
  };

  return subscribeSuccessArgsExtensions;

}).call(this);
