
/*
 * Vendor: Frozen Mountain Software
 * Title: WebSync Client Chat Extension for JavaScript
 * Version: 4.2.0
 * Copyright Frozen Mountain Software 2011+
 */

if (typeof global !== 'undefined' && !global.window) { global.window = global; global.document = { cookie: '' }; }

if (!window.fm) { window.fm = {}; }

if (!window.fm.websync) { window.fm.websync = {}; }

if (!window.fm.websync.chat) { window.fm.websync.chat = {}; }

var __bind =  function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

var __hasProp =  {}.hasOwnProperty;

var __extends =  function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

/**
@class fm.websync.chat.chatUser
 <div>
 An instance of a chat participant.
 </div>

@extends fm.serializable
*/


fm.websync.chat.chatUser = (function(_super) {

  __extends(chatUser, _super);

  /**
  	@ignore 
  	@description
  */


  chatUser.prototype.__userId = null;

  /**
  	@ignore 
  	@description
  */


  chatUser.prototype.__userNickname = null;

  /**
  	@ignore 
  	@description
  */


  function chatUser() {
    this.setUserNickname = __bind(this.setUserNickname, this);

    this.setUserId = __bind(this.setUserId, this);

    this.getUserNickname = __bind(this.getUserNickname, this);

    this.getUserId = __bind(this.getUserId, this);

    var userId, userNickname;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      chatUser.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    userId = arguments[0];
    userNickname = arguments[1];
    chatUser.__super__.constructor.call(this);
    this.setUserId(userId);
    this.setUserNickname(userNickname);
  }

  /**
  	 <div>
  	 Gets the user ID of the chat participant.
  	 </div>
  
  	@function getUserId
  	@return {fm.string}
  */


  chatUser.prototype.getUserId = function() {
    return this.__userId;
  };

  /**
  	 <div>
  	 Gets the user nickname of the chat participant.
  	 </div>
  
  	@function getUserNickname
  	@return {fm.string}
  */


  chatUser.prototype.getUserNickname = function() {
    return this.__userNickname;
  };

  /**
  	 <div>
  	 Sets the user ID of the chat participant.
  	 </div>
  
  	@function setUserId
  	@param {fm.string} value
  	@return {void}
  */


  chatUser.prototype.setUserId = function() {
    var value;
    value = arguments[0];
    this.setIsDirty(true);
    return this.__userId = value;
  };

  /**
  	 <div>
  	 Sets the user nickname of the chat participant.
  	 </div>
  
  	@function setUserNickname
  	@param {fm.string} value
  	@return {void}
  */


  chatUser.prototype.setUserNickname = function() {
    var value;
    value = arguments[0];
    this.setIsDirty(true);
    return this.__userNickname = value;
  };

  return chatUser;

})(fm.serializable);


/**
@class fm.websync.chat.clientExtensions
 <div>
 Extensions for the <see cref="fm.websync.client">fm.websync.client</see> class.
 </div>
*/

fm.websync.chat.clientExtensions = (function() {
  /**
  	@ignore 
  	@description
  */

  clientExtensions._argsKey = null;

  /**
  	@ignore 
  	@description
  */


  clientExtensions._channelKey = null;

  /**
  	@ignore 
  	@description
  */


  clientExtensions._joinStateKey = null;

  /**
  	@ignore 
  	@description
  */


  clientExtensions._leaveStateKey = null;

  /**
  	@ignore 
  	@description
  */


  clientExtensions._userCacheKey = null;

  /**
  	@ignore 
  	@description
  */


  clientExtensions._userCacheLockKey = null;

  /**
  	@ignore 
  	@description
  */


  clientExtensions._userIdKey = null;

  /**
  	@ignore 
  	@description
  */


  clientExtensions._userNicknameKey = null;

  /**
  	@ignore 
  	@description
  */


  function clientExtensions() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientExtensions.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
  }

  /**
  
  	@function getRecordValueJson
  	@param {fm.hash} records
  	@param {fm.string} key
  	@return {fm.string}
  */


  clientExtensions.getRecordValueJson = function() {
    var key, records;
    records = arguments[0];
    key = arguments[1];
    if (fm.hashExtensions.containsKey(records, key)) {
      return records[key].getValueJson();
    }
    return null;
  };

  /**
  
  	@function getRecordValueJsonFromArray
  	@param {fm.array} records
  	@param {fm.string} key
  	@return {fm.string}
  */


  clientExtensions.getRecordValueJsonFromArray = function() {
    var key, record, records, _i, _len, _var0;
    records = arguments[0];
    key = arguments[1];
    _var0 = records;
    for (_i = 0, _len = _var0.length; _i < _len; _i++) {
      record = _var0[_i];
      if (record.getKey() === key) {
        return record.getValueJson();
      }
    }
    return null;
  };

  /**
  
  	@function getUser
  	@param {fm.hash} records
  	@param {fm.string} channel
  	@return {fm.websync.chat.chatUser}
  */


  clientExtensions.getUser = function() {
    var channel, records;
    records = arguments[0];
    channel = arguments[1];
    return new fm.websync.chat.chatUser(fm.websync.chat.clientExtensions.getUserId(records, channel), fm.websync.chat.clientExtensions.getUserNickname(records, channel));
  };

  /**
  
  	@function getUserId
  	@param {fm.hash} records
  	@param {fm.string} channel
  	@return {fm.string}
  */


  clientExtensions.getUserId = function() {
    var channel, recordValueJson, records, _var0;
    records = arguments[0];
    channel = arguments[1];
    recordValueJson = fm.websync.chat.clientExtensions.getRecordValueJson(records, fm.websync.chat.clientExtensions.getUserIdKey(channel));
    _var0 = recordValueJson;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return null;
    }
    return fm.serializer.deserializeString(recordValueJson);
  };

  /**
  
  	@function getUserIdFromArray
  	@param {fm.array} records
  	@param {fm.string} channel
  	@return {fm.string}
  */


  clientExtensions.getUserIdFromArray = function() {
    var channel, recordValueJsonFromArray, records, _var0;
    records = arguments[0];
    channel = arguments[1];
    recordValueJsonFromArray = fm.websync.chat.clientExtensions.getRecordValueJsonFromArray(records, fm.websync.chat.clientExtensions.getUserIdKey(channel));
    _var0 = recordValueJsonFromArray;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return null;
    }
    return fm.serializer.deserializeString(recordValueJsonFromArray);
  };

  /**
  	 <div>
  	 Gets the binding key for a user ID.
  	 </div><param name="channel">The subscribed channel.</param><returns></returns>
  
  	@function getUserIdKey
  	@param {fm.string} channel
  	@return {fm.string}
  */


  clientExtensions.getUserIdKey = function() {
    var channel;
    channel = arguments[0];
    return fm.stringExtensions.concat(fm.websync.chat.clientExtensions._userIdKey, channel);
  };

  /**
  
  	@function getUserNickname
  	@param {fm.hash} records
  	@param {fm.string} channel
  	@return {fm.string}
  */


  clientExtensions.getUserNickname = function() {
    var channel, recordValueJson, records, _var0;
    records = arguments[0];
    channel = arguments[1];
    recordValueJson = fm.websync.chat.clientExtensions.getRecordValueJson(records, fm.websync.chat.clientExtensions.getUserNicknameKey(channel));
    _var0 = recordValueJson;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return null;
    }
    return fm.serializer.deserializeString(recordValueJson);
  };

  /**
  
  	@function getUserNicknameFromArray
  	@param {fm.array} records
  	@param {fm.string} channel
  	@return {fm.string}
  */


  clientExtensions.getUserNicknameFromArray = function() {
    var channel, recordValueJsonFromArray, records, _var0;
    records = arguments[0];
    channel = arguments[1];
    recordValueJsonFromArray = fm.websync.chat.clientExtensions.getRecordValueJsonFromArray(records, fm.websync.chat.clientExtensions.getUserNicknameKey(channel));
    _var0 = recordValueJsonFromArray;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return null;
    }
    return fm.serializer.deserializeString(recordValueJsonFromArray);
  };

  /**
  	 <div>
  	 Gets the binding key for a user nickname.
  	 </div><param name="channel">The subscribed channel.</param><returns></returns>
  
  	@function getUserNicknameKey
  	@param {fm.string} channel
  	@return {fm.string}
  */


  clientExtensions.getUserNicknameKey = function() {
    var channel;
    channel = arguments[0];
    return fm.stringExtensions.concat(fm.websync.chat.clientExtensions._userNicknameKey, channel);
  };

  /**
  	 <div>
  	 Binds/subscribes the client to the channel with the specified
  	 user ID and nickname.
  	 </div><div>
  	 When the join completes successfully, the OnSuccess callback
  	 will be invoked, passing in the joined channel, user ID, and
  	 user nickname, <b>including any modifications made on the server</b>.
  	 </div><param name="client">The client.</param><param name="joinArgs">The join arguments.
  	 See <see cref="fm.websync.chat.joinArgs">fm.websync.chat.joinArgs</see> for details.</param><returns>The client.</returns>
  
  	@function join
  	@param {fm.websync.client} client
  	@param {fm.websync.chat.joinArgs} joinArgs
  	@return {fm.websync.client}
  */


  clientExtensions.join = function() {
    var args, args3, bindArgs, client, joinArgs, subscribeArgs;
    client = arguments[0];
    joinArgs = arguments[1];
    if (fm.stringExtensions.isNullOrEmpty(joinArgs.getChannel())) {
      throw new Error("Please specify the channel.");
    }
    if (fm.stringExtensions.isNullOrEmpty(joinArgs.getUserId())) {
      throw new Error("Please specify the user ID.");
    }
    if (fm.stringExtensions.isNullOrEmpty(joinArgs.getUserNickname())) {
      throw new Error("Please specify the user nickname.");
    }
    joinArgs.setDynamicValue(fm.websync.chat.clientExtensions._userCacheKey, {});
    joinArgs.setDynamicValue(fm.websync.chat.clientExtensions._userCacheLockKey, new fm.object());
    joinArgs.setDynamicValue(fm.websync.chat.clientExtensions._joinStateKey, new fm.websync.chat.joinState());
    joinArgs.setDynamicValue(fm.websync.chat.clientExtensions._channelKey, joinArgs.getChannel());
    joinArgs.setDynamicValue(fm.websync.chat.clientExtensions._userIdKey, joinArgs.getUserId());
    joinArgs.setDynamicValue(fm.websync.chat.clientExtensions._userNicknameKey, joinArgs.getUserNickname());
    client.startBatch();
    args3 = new fm.websync.bindArgs([new fm.websync.record(fm.websync.chat.clientExtensions.getUserIdKey(joinArgs.getChannel()), fm.serializer.serializeString(joinArgs.getUserId())), new fm.websync.record(fm.websync.chat.clientExtensions.getUserNicknameKey(joinArgs.getChannel()), fm.serializer.serializeString(joinArgs.getUserNickname()))]);
    args3.setRequestUrl(joinArgs.getRequestUrl());
    args3.setSynchronous(joinArgs.getSynchronous());
    args3.setOnSuccess(clientExtensions.onBindSuccess);
    args3.setOnFailure(clientExtensions.onBindFailure);
    args3.setDynamicProperties(joinArgs.getDynamicProperties());
    bindArgs = args3;
    bindArgs.setDynamicValue(fm.websync.chat.clientExtensions._argsKey, joinArgs);
    bindArgs.copyExtensions(joinArgs);
    client.bind(bindArgs);
    args = new fm.websync.subscribeArgs([joinArgs.getChannel()], joinArgs.getTag());
    args.setRequestUrl(joinArgs.getRequestUrl());
    args.setSynchronous(joinArgs.getSynchronous());
    args.setOnSuccess(clientExtensions.onSubscribeSuccess);
    args.setOnFailure(clientExtensions.onSubscribeFailure);
    args.setOnReceive(clientExtensions.onReceive);
    args.setDynamicProperties(joinArgs.getDynamicProperties());
    subscribeArgs = fm.websync.subscribers.subscribeArgsExtensions.setOnClientUnsubscribe(fm.websync.subscribers.subscribeArgsExtensions.setOnClientSubscribe(args, clientExtensions.onClientSubscribe), clientExtensions.onClientUnsubscribe);
    subscribeArgs.setDynamicValue(fm.websync.chat.clientExtensions._argsKey, joinArgs);
    subscribeArgs.copyExtensions(joinArgs);
    client.subscribe(subscribeArgs);
    client.endBatch();
    return client;
  };

  /**
  	 <div>
  	 Unsubscribes/unbinds the client from the channel.
  	 </div><div>
  	 When the leave completes successfully, the OnSuccess callback
  	 will be invoked, passing in the left
  	 channel, <b>including any modifications made on the server</b>.
  	 </div><param name="client">The client.</param><param name="leaveArgs">The leave arguments.
  	 See <see cref="fm.websync.chat.leaveArgs">fm.websync.chat.leaveArgs</see> for details.</param><returns>The client.</returns>
  
  	@function leave
  	@param {fm.websync.client} client
  	@param {fm.websync.chat.leaveArgs} leaveArgs
  	@return {fm.websync.client}
  */


  clientExtensions.leave = function() {
    var args3, args4, client, leaveArgs, unbindArgs, unsubscribeArgs;
    client = arguments[0];
    leaveArgs = arguments[1];
    if (fm.stringExtensions.isNullOrEmpty(leaveArgs.getChannel())) {
      throw new Error("Please specify the channel.");
    }
    leaveArgs.setDynamicValue(fm.websync.chat.clientExtensions._leaveStateKey, new fm.websync.chat.leaveState());
    leaveArgs.setDynamicValue(fm.websync.chat.clientExtensions._channelKey, leaveArgs.getChannel());
    client.startBatch();
    args3 = new fm.websync.unsubscribeArgs([leaveArgs.getChannel()], leaveArgs.getTag());
    args3.setRequestUrl(leaveArgs.getRequestUrl());
    args3.setSynchronous(leaveArgs.getSynchronous());
    args3.setOnSuccess(clientExtensions.onUnsubscribeSuccess);
    args3.setOnFailure(clientExtensions.onUnsubscribeFailure);
    args3.setDynamicProperties(leaveArgs.getDynamicProperties());
    unsubscribeArgs = args3;
    unsubscribeArgs.setDynamicValue(fm.websync.chat.clientExtensions._argsKey, leaveArgs);
    unsubscribeArgs.copyExtensions(leaveArgs);
    client.unsubscribe(unsubscribeArgs);
    args4 = new fm.websync.unbindArgs([new fm.websync.record(fm.websync.chat.clientExtensions.getUserIdKey(leaveArgs.getChannel())), new fm.websync.record(fm.websync.chat.clientExtensions.getUserNicknameKey(leaveArgs.getChannel()))]);
    args4.setRequestUrl(leaveArgs.getRequestUrl());
    args4.setSynchronous(leaveArgs.getSynchronous());
    args4.setOnSuccess(clientExtensions.onUnbindSuccess);
    args4.setOnFailure(clientExtensions.onUnbindFailure);
    args4.setDynamicProperties(leaveArgs.getDynamicProperties());
    unbindArgs = args4;
    unbindArgs.setDynamicValue(fm.websync.chat.clientExtensions._argsKey, leaveArgs);
    unbindArgs.copyExtensions(leaveArgs);
    client.unbind(unbindArgs);
    client.endBatch();
    return client;
  };

  /**
  
  	@function onBindFailure
  	@param {fm.websync.bindFailureArgs} args
  	@return {void}
  */


  clientExtensions.onBindFailure = function() {
    var args, dynamicValue;
    args = arguments[0];
    dynamicValue = args.getDynamicValue(fm.websync.chat.clientExtensions._argsKey);
    return dynamicValue.getDynamicValue(fm.websync.chat.clientExtensions._joinStateKey).updateBindFailure(args);
  };

  /**
  
  	@function onBindSuccess
  	@param {fm.websync.bindSuccessArgs} args
  	@return {void}
  */


  clientExtensions.onBindSuccess = function() {
    var args, dynamicValue;
    args = arguments[0];
    dynamicValue = args.getDynamicValue(fm.websync.chat.clientExtensions._argsKey);
    dynamicValue.getDynamicValue(fm.websync.chat.clientExtensions._joinStateKey).updateBindSuccess(args);
    dynamicValue.setDynamicValue(fm.websync.chat.clientExtensions._userIdKey, fm.websync.chat.clientExtensions.getUserIdFromArray(args.getRecords(), dynamicValue.getChannel()));
    return dynamicValue.setDynamicValue(fm.websync.chat.clientExtensions._userNicknameKey, fm.websync.chat.clientExtensions.getUserNicknameFromArray(args.getRecords(), dynamicValue.getChannel()));
  };

  /**
  
  	@function onClientSubscribe
  	@param {fm.websync.subscribers.clientSubscribeArgs} args
  	@return {void}
  */


  clientExtensions.onClientSubscribe = function() {
    var args, dynamicValue;
    args = arguments[0];
    dynamicValue = args.getDynamicValue(fm.websync.chat.clientExtensions._argsKey);
    return fm.websync.chat.clientExtensions.process(fm.websync.subscribers.subscriberChangeType.Subscribe, args.getSubscribedClient(), args.getChannel(), dynamicValue, args, true);
  };

  /**
  
  	@function onClientUnsubscribe
  	@param {fm.websync.subscribers.clientUnsubscribeArgs} args
  	@return {void}
  */


  clientExtensions.onClientUnsubscribe = function() {
    var args, dynamicValue;
    args = arguments[0];
    dynamicValue = args.getDynamicValue(fm.websync.chat.clientExtensions._argsKey);
    return fm.websync.chat.clientExtensions.process(fm.websync.subscribers.subscriberChangeType.Unsubscribe, args.getUnsubscribedClient(), args.getChannel(), dynamicValue, args, true);
  };

  /**
  
  	@function onReceive
  	@param {fm.websync.subscribeReceiveArgs} args
  	@return {void}
  */


  clientExtensions.onReceive = function() {
    var args, args4, dynamicValue, p;
    args = arguments[0];
    dynamicValue = args.getDynamicValue(fm.websync.chat.clientExtensions._argsKey);
    args4 = new fm.websync.chat.joinReceiveArgs(args.getChannel(), args.getDataJson());
    args4.__publishingUser = fm.websync.chat.clientExtensions.getUser(args.getPublishingClient().getBoundRecords(), dynamicValue.getChannel());
    args4.__userId = dynamicValue.getDynamicValue(fm.websync.chat.clientExtensions._userIdKey);
    args4.__userNickname = dynamicValue.getDynamicValue(fm.websync.chat.clientExtensions._userNicknameKey);
    args4.setClient(args.getClient());
    args4.setTimestamp(args.getTimestamp());
    args4.setDynamicProperties(dynamicValue.getDynamicProperties());
    p = args4;
    p.copyExtensions(args);
    return dynamicValue.getOnReceive()(p);
  };

  /**
  
  	@function onSubscribeFailure
  	@param {fm.websync.subscribeFailureArgs} args
  	@return {void}
  */


  clientExtensions.onSubscribeFailure = function() {
    var args, dynamicValue, state;
    args = arguments[0];
    dynamicValue = args.getDynamicValue(fm.websync.chat.clientExtensions._argsKey);
    state = dynamicValue.getDynamicValue(fm.websync.chat.clientExtensions._joinStateKey);
    state.updateSubscribeFailure(args);
    if (state.getBindSuccess()) {
      throw new Error("Join failed (bind succeeded, subscribe failed).");
    }
    return fm.websync.chat.clientExtensions.raiseJoinFailure(dynamicValue, args, args.getIsResubscribe());
  };

  /**
  
  	@function onSubscribeSuccess
  	@param {fm.websync.subscribeSuccessArgs} args
  	@return {void}
  */


  clientExtensions.onSubscribeSuccess = function() {
    var args, client, clientArray, dynamicValue, item, state, users, _i, _len, _var0, _var1;
    args = arguments[0];
    dynamicValue = args.getDynamicValue(fm.websync.chat.clientExtensions._argsKey);
    state = dynamicValue.getDynamicValue(fm.websync.chat.clientExtensions._joinStateKey);
    state.updateSubscribeSuccess(args);
    dynamicValue.setDynamicValue(fm.websync.chat.clientExtensions._channelKey, args.getChannel());
    if (!state.getBindSuccess()) {
      throw new Error("Join failed (subscribe succeeded, bind failed).");
    }
    clientArray = fm.websync.subscribers.subscribeSuccessArgsExtensions.getSubscribedClients(args)[args.getChannel()];
    users = [];
    _var0 = clientArray;
    for (_i = 0, _len = _var0.length; _i < _len; _i++) {
      client = _var0[_i];
      item = fm.websync.chat.clientExtensions.process(fm.websync.subscribers.subscriberChangeType.Subscribe, client, args.getChannel(), dynamicValue, args, false);
      _var1 = item;
      if (_var1 !== null && typeof _var1 !== 'undefined') {
        fm.arrayExtensions.add(users, item);
      }
    }
    return fm.websync.chat.clientExtensions.raiseJoinSuccess(dynamicValue, args, users);
  };

  /**
  
  	@function onUnbindFailure
  	@param {fm.websync.unbindFailureArgs} args
  	@return {void}
  */


  clientExtensions.onUnbindFailure = function() {
    var args, dynamicValue, state;
    args = arguments[0];
    dynamicValue = args.getDynamicValue(fm.websync.chat.clientExtensions._argsKey);
    state = dynamicValue.getDynamicValue(fm.websync.chat.clientExtensions._leaveStateKey);
    state.updateUnbindFailure(args);
    if (state.getUnsubscribeSuccess()) {
      throw new Error("Leave failed (unsubscribe succeeded, unbind failed).");
    }
    return fm.websync.chat.clientExtensions.raiseLeaveFailure(dynamicValue, args);
  };

  /**
  
  	@function onUnbindSuccess
  	@param {fm.websync.unbindSuccessArgs} args
  	@return {void}
  */


  clientExtensions.onUnbindSuccess = function() {
    var args, dynamicValue, state;
    args = arguments[0];
    dynamicValue = args.getDynamicValue(fm.websync.chat.clientExtensions._argsKey);
    state = dynamicValue.getDynamicValue(fm.websync.chat.clientExtensions._leaveStateKey);
    state.updateUnbindSuccess(args);
    dynamicValue.setDynamicValue(fm.websync.chat.clientExtensions._userIdKey, fm.websync.chat.clientExtensions.getUserIdFromArray(args.getRecords(), dynamicValue.getChannel()));
    dynamicValue.setDynamicValue(fm.websync.chat.clientExtensions._userNicknameKey, fm.websync.chat.clientExtensions.getUserNicknameFromArray(args.getRecords(), dynamicValue.getChannel()));
    if (!state.getUnsubscribeSuccess()) {
      throw new Error("Leave failed (unbind succeeded, unsubscribe failed).");
    }
    return fm.websync.chat.clientExtensions.raiseLeaveSuccess(dynamicValue, args);
  };

  /**
  
  	@function onUnsubscribeFailure
  	@param {fm.websync.unsubscribeFailureArgs} args
  	@return {void}
  */


  clientExtensions.onUnsubscribeFailure = function() {
    var args, dynamicValue;
    args = arguments[0];
    dynamicValue = args.getDynamicValue(fm.websync.chat.clientExtensions._argsKey);
    return dynamicValue.getDynamicValue(fm.websync.chat.clientExtensions._leaveStateKey).updateUnsubscribeFailure(args);
  };

  /**
  
  	@function onUnsubscribeSuccess
  	@param {fm.websync.unsubscribeSuccessArgs} args
  	@return {void}
  */


  clientExtensions.onUnsubscribeSuccess = function() {
    var args, dynamicValue;
    args = arguments[0];
    dynamicValue = args.getDynamicValue(fm.websync.chat.clientExtensions._argsKey);
    dynamicValue.getDynamicValue(fm.websync.chat.clientExtensions._leaveStateKey).updateUnsubscribeSuccess(args);
    return dynamicValue.setDynamicValue(fm.websync.chat.clientExtensions._channelKey, args.getChannel());
  };

  /**
  
  	@function process
  	@param {fm.websync.subscribers.subscriberChangeType} type
  	@param {fm.websync.subscribedClient} subscriber
  	@param {fm.string} channel
  	@param {fm.websync.chat.joinArgs} joinArgs
  	@param {fm.websync.baseOutputArgs} outputArgs
  	@param {fm.boolean} fireEvents
  	@return {fm.websync.chat.chatUser}
  */


  clientExtensions.process = function() {
    var args2, args3, args4, channel, dictionary2, dynamicValue, fireEvents, flag, flag2, joinArgs, obj2, outputArgs, p, subscriber, type, user, _var0, _var1, _var2, _var3, _var4, _var5;
    type = arguments[0];
    subscriber = arguments[1];
    channel = arguments[2];
    joinArgs = arguments[3];
    outputArgs = arguments[4];
    fireEvents = arguments[5];
    dynamicValue = joinArgs.getDynamicValue(fm.websync.chat.clientExtensions._userCacheKey);
    obj2 = joinArgs.getDynamicValue(fm.websync.chat.clientExtensions._userCacheLockKey);
    _var0 = dynamicValue;
    _var1 = obj2;
    if ((_var0 !== null && typeof _var0 !== 'undefined') && (_var1 !== null && typeof _var1 !== 'undefined')) {
      user = fm.websync.chat.clientExtensions.getUser(subscriber.getBoundRecords(), joinArgs.getChannel());
      if (user.getUserId() === joinArgs.getDynamicValue(fm.websync.chat.clientExtensions._userIdKey)) {
        return null;
      }
      if (type === fm.websync.subscribers.subscriberChangeType.Subscribe) {
        flag = false;
        dictionary2 = null;
        _var2 = new fm.holder(dictionary2);
        _var3 = fm.hashExtensions.tryGetValue(dynamicValue, user.getUserId(), _var2);
        dictionary2 = _var2.getValue();
        if (!_var3) {
          dictionary2 = {};
        }
        dictionary2[subscriber.getClientId().toString()] = true;
        flag = fm.hashExtensions.getCount(dictionary2) === 1;
        if (flag) {
          dynamicValue[user.getUserId()] = dictionary2;
        }
        if (flag) {
          if (fireEvents) {
            args2 = new fm.websync.chat.userJoinArgs();
            args2.__channel = channel;
            args2.__joinedUser = user;
            args2.__userId = joinArgs.getDynamicValue(fm.websync.chat.clientExtensions._userIdKey);
            args2.__userNickname = joinArgs.getDynamicValue(fm.websync.chat.clientExtensions._userNicknameKey);
            args2.setClient(outputArgs.getClient());
            args2.setTimestamp(outputArgs.getTimestamp());
            args2.setDynamicProperties(outputArgs.getDynamicProperties());
            p = args2;
            p.copyExtensions(outputArgs);
            joinArgs.getOnUserJoin()(p);
          }
          return user;
        }
      } else {
        flag2 = false;
        dictionary2 = null;
        _var4 = new fm.holder(dictionary2);
        _var5 = fm.hashExtensions.tryGetValue(dynamicValue, user.getUserId(), _var4);
        dictionary2 = _var4.getValue();
        if (!_var5) {
          return null;
        }
        fm.hashExtensions.remove(dictionary2, subscriber.getClientId().toString());
        flag2 = fm.hashExtensions.getCount(dictionary2) === 0;
        if (flag2) {
          fm.hashExtensions.remove(dynamicValue, user.getUserId());
        }
        if (flag2) {
          if (fireEvents) {
            args4 = new fm.websync.chat.userLeaveArgs();
            args4.__channel = channel;
            args4.__leftUser = user;
            args4.__userId = joinArgs.getDynamicValue(fm.websync.chat.clientExtensions._userIdKey);
            args4.__userNickname = joinArgs.getDynamicValue(fm.websync.chat.clientExtensions._userNicknameKey);
            args4.setClient(outputArgs.getClient());
            args4.setTimestamp(outputArgs.getTimestamp());
            args4.setDynamicProperties(outputArgs.getDynamicProperties());
            args3 = args4;
            args3.copyExtensions(outputArgs);
            joinArgs.getOnUserLeave()(args3);
          }
          return user;
        }
      }
    }
    return null;
  };

  /**
  
  	@function raiseJoinFailure
  	@param {fm.websync.chat.joinArgs} joinArgs
  	@param {fm.websync.baseFailureArgs} args
  	@param {fm.boolean} isRejoin
  	@return {void}
  */


  clientExtensions.raiseJoinFailure = function() {
    var args, args3, args4, args5, isRejoin, joinArgs, p, retry, _var0, _var1;
    joinArgs = arguments[0];
    args = arguments[1];
    isRejoin = arguments[2];
    retry = false;
    _var0 = joinArgs.getOnFailure();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      args3 = new fm.websync.chat.joinFailureArgs();
      args3.__channel = joinArgs.getDynamicValue(fm.websync.chat.clientExtensions._channelKey);
      args3.__userId = joinArgs.getDynamicValue(fm.websync.chat.clientExtensions._userIdKey);
      args3.__userNickname = joinArgs.getDynamicValue(fm.websync.chat.clientExtensions._userNicknameKey);
      args3.__isRejoin = isRejoin;
      args3.setRetry(args.getRetry());
      args3.setClient(args.getClient());
      args3.setException(args.getException());
      args3.setTimestamp(args.getTimestamp());
      args3.setDynamicProperties(joinArgs.getDynamicProperties());
      p = args3;
      p.copyExtensions(args);
      joinArgs.getOnFailure()(p);
      retry = p.getRetry();
    }
    _var1 = joinArgs.getOnComplete();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      args5 = new fm.websync.chat.joinCompleteArgs();
      args5.__isRejoin = isRejoin;
      args5.setClient(args.getClient());
      args5.setTimestamp(args.getTimestamp());
      args5.setDynamicProperties(joinArgs.getDynamicProperties());
      args4 = args5;
      args4.copyExtensions(args);
      joinArgs.getOnComplete()(args4);
    }
    if (retry) {
      joinArgs.setIsRetry(true);
      return fm.websync.chat.clientExtensions.join(args.getClient(), joinArgs);
    }
  };

  /**
  
  	@function raiseJoinSuccess
  	@param {fm.websync.chat.joinArgs} joinArgs
  	@param {fm.websync.subscribeSuccessArgs} args
  	@param {fm.array} users
  	@return {void}
  */


  clientExtensions.raiseJoinSuccess = function() {
    var args, args3, args4, args5, joinArgs, p, users, _var0, _var1;
    joinArgs = arguments[0];
    args = arguments[1];
    users = arguments[2];
    _var0 = joinArgs.getOnSuccess();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      args3 = new fm.websync.chat.joinSuccessArgs();
      args3.__channel = args.getChannel();
      args3.__userId = joinArgs.getDynamicValue(fm.websync.chat.clientExtensions._userIdKey);
      args3.__userNickname = joinArgs.getDynamicValue(fm.websync.chat.clientExtensions._userNicknameKey);
      args3.__users = fm.arrayExtensions.toArray(users);
      args3.__isRejoin = args.getIsResubscribe();
      args3.setClient(args.getClient());
      args3.setTimestamp(args.getTimestamp());
      args3.setDynamicProperties(joinArgs.getDynamicProperties());
      p = args3;
      p.copyExtensions(args);
      joinArgs.getOnSuccess()(p);
    }
    _var1 = joinArgs.getOnComplete();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      args5 = new fm.websync.chat.joinCompleteArgs();
      args5.__isRejoin = args.getIsResubscribe();
      args5.setClient(args.getClient());
      args5.setTimestamp(args.getTimestamp());
      args5.setDynamicProperties(joinArgs.getDynamicProperties());
      args4 = args5;
      args4.copyExtensions(args);
      return joinArgs.getOnComplete()(args4);
    }
  };

  /**
  
  	@function raiseLeaveFailure
  	@param {fm.websync.chat.leaveArgs} leaveArgs
  	@param {fm.websync.baseFailureArgs} args
  	@return {void}
  */


  clientExtensions.raiseLeaveFailure = function() {
    var args, args3, args4, args5, leaveArgs, p, retry, _var0, _var1;
    leaveArgs = arguments[0];
    args = arguments[1];
    retry = false;
    _var0 = leaveArgs.getOnFailure();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      args3 = new fm.websync.chat.leaveFailureArgs();
      args3.__channel = leaveArgs.getDynamicValue(fm.websync.chat.clientExtensions._channelKey);
      args3.__userId = fm.global.tryCastString(leaveArgs.getDynamicValue(fm.websync.chat.clientExtensions._userIdKey));
      args3.__userNickname = fm.global.tryCastString(leaveArgs.getDynamicValue(fm.websync.chat.clientExtensions._userNicknameKey));
      args3.setRetry(args.getRetry());
      args3.setClient(args.getClient());
      args3.setException(args.getException());
      args3.setTimestamp(args.getTimestamp());
      args3.setDynamicProperties(leaveArgs.getDynamicProperties());
      p = args3;
      p.copyExtensions(args);
      leaveArgs.getOnFailure()(p);
      retry = p.getRetry();
    }
    _var1 = leaveArgs.getOnComplete();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      args5 = new fm.websync.chat.leaveCompleteArgs();
      args5.setClient(args.getClient());
      args5.setTimestamp(args.getTimestamp());
      args5.setDynamicProperties(leaveArgs.getDynamicProperties());
      args4 = args5;
      args4.copyExtensions(args);
      leaveArgs.getOnComplete()(args4);
    }
    if (retry) {
      leaveArgs.setIsRetry(true);
      return fm.websync.chat.clientExtensions.leave(args.getClient(), leaveArgs);
    }
  };

  /**
  
  	@function raiseLeaveSuccess
  	@param {fm.websync.chat.leaveArgs} leaveArgs
  	@param {fm.websync.unbindSuccessArgs} args
  	@return {void}
  */


  clientExtensions.raiseLeaveSuccess = function() {
    var args, args3, args4, args5, leaveArgs, p, _var0, _var1;
    leaveArgs = arguments[0];
    args = arguments[1];
    _var0 = leaveArgs.getOnSuccess();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      args3 = new fm.websync.chat.leaveSuccessArgs();
      args3.__channel = leaveArgs.getDynamicValue(fm.websync.chat.clientExtensions._channelKey);
      args3.__userId = leaveArgs.getDynamicValue(fm.websync.chat.clientExtensions._userIdKey);
      args3.__userNickname = leaveArgs.getDynamicValue(fm.websync.chat.clientExtensions._userNicknameKey);
      args3.setClient(args.getClient());
      args3.setTimestamp(args.getTimestamp());
      args3.setDynamicProperties(leaveArgs.getDynamicProperties());
      p = args3;
      p.copyExtensions(args);
      leaveArgs.getOnSuccess()(p);
    }
    _var1 = leaveArgs.getOnComplete();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      args5 = new fm.websync.chat.leaveCompleteArgs();
      args5.setClient(args.getClient());
      args5.setTimestamp(args.getTimestamp());
      args5.setDynamicProperties(leaveArgs.getDynamicProperties());
      args4 = args5;
      args4.copyExtensions(args);
      return leaveArgs.getOnComplete()(args4);
    }
  };

  /**
  
  	@function getRecordValue
  	@param {fm.hash} records
  	@param {fm.string} key
  	@return {fm.hash}
  */


  clientExtensions.getRecordValue = function() {
    var key, records;
    records = arguments[0];
    key = arguments[1];
    return fm.json.deserialize(clientExtensions.getRecordValueJson.apply(clientExtensions, arguments));
  };

  /**
  	 <div>
  	 Binds/subscribes the client to the channel with the specified
  	 user ID and nickname.
  	 </div><div>
  	 When the join completes successfully, the OnSuccess callback
  	 will be invoked, passing in the joined channel, user ID, and
  	 user nickname, <b>including any modifications made on the server</b>.
  	 </div><param name="client">The client.</param><param name="joinArgs">The join arguments.
  	 See <see cref="fm.websync.chat.joinArgs">fm.websync.chat.joinArgs</see> for details.</param><returns>The client.</returns>
  
  	@function join
  	@param {fm.websync.chat.joinArgs} joinArgs
  	@return {fm.websync.client}
  */


  fm.websync.client.prototype.join = function() {
    var joinArgs;
    joinArgs = arguments[0];
    Array.prototype.splice.call(arguments, 0, 0, this);
    return fm.websync.chat.clientExtensions.join.apply(this, arguments);
  };

  /**
  	 <div>
  	 Unsubscribes/unbinds the client from the channel.
  	 </div><div>
  	 When the leave completes successfully, the OnSuccess callback
  	 will be invoked, passing in the left
  	 channel, <b>including any modifications made on the server</b>.
  	 </div><param name="client">The client.</param><param name="leaveArgs">The leave arguments.
  	 See <see cref="fm.websync.chat.leaveArgs">fm.websync.chat.leaveArgs</see> for details.</param><returns>The client.</returns>
  
  	@function leave
  	@param {fm.websync.chat.leaveArgs} leaveArgs
  	@return {fm.websync.client}
  */


  fm.websync.client.prototype.leave = function() {
    var leaveArgs;
    leaveArgs = arguments[0];
    Array.prototype.splice.call(arguments, 0, 0, this);
    return fm.websync.chat.clientExtensions.leave.apply(this, arguments);
  };

  clientExtensions._channelKey = "fm.chat.channel";

  clientExtensions._userIdKey = "fm.chat.userId";

  clientExtensions._userNicknameKey = "fm.chat.userNickname";

  clientExtensions._userCacheKey = "fm.chat.userCache";

  clientExtensions._userCacheLockKey = "fm.chat.userCacheLock";

  clientExtensions._joinStateKey = "fm.chat.joinState";

  clientExtensions._leaveStateKey = "fm.chat.leaveState";

  clientExtensions._argsKey = "fm.chat.args";

  return clientExtensions;

}).call(this);


/**
@class fm.websync.chat.leaveState

@extends fm.object
*/


fm.websync.chat.leaveState = (function(_super) {

  __extends(leaveState, _super);

  /**
  	@ignore 
  	@description
  */


  leaveState.prototype._unbindFailureArgs = null;

  /**
  	@ignore 
  	@description
  */


  leaveState.prototype._unbindSuccess = false;

  /**
  	@ignore 
  	@description
  */


  leaveState.prototype._unbindSuccessArgs = null;

  /**
  	@ignore 
  	@description
  */


  leaveState.prototype._unsubscribeFailureArgs = null;

  /**
  	@ignore 
  	@description
  */


  leaveState.prototype._unsubscribeSuccess = false;

  /**
  	@ignore 
  	@description
  */


  leaveState.prototype._unsubscribeSuccessArgs = null;

  /**
  	@ignore 
  	@description
  */


  function leaveState() {
    this.updateUnsubscribeSuccess = __bind(this.updateUnsubscribeSuccess, this);

    this.updateUnsubscribeFailure = __bind(this.updateUnsubscribeFailure, this);

    this.updateUnbindSuccess = __bind(this.updateUnbindSuccess, this);

    this.updateUnbindFailure = __bind(this.updateUnbindFailure, this);

    this.setUnsubscribeSuccessArgs = __bind(this.setUnsubscribeSuccessArgs, this);

    this.setUnsubscribeSuccess = __bind(this.setUnsubscribeSuccess, this);

    this.setUnsubscribeFailureArgs = __bind(this.setUnsubscribeFailureArgs, this);

    this.setUnbindSuccessArgs = __bind(this.setUnbindSuccessArgs, this);

    this.setUnbindSuccess = __bind(this.setUnbindSuccess, this);

    this.setUnbindFailureArgs = __bind(this.setUnbindFailureArgs, this);

    this.getUnsubscribeSuccessArgs = __bind(this.getUnsubscribeSuccessArgs, this);

    this.getUnsubscribeSuccess = __bind(this.getUnsubscribeSuccess, this);

    this.getUnsubscribeFailureArgs = __bind(this.getUnsubscribeFailureArgs, this);

    this.getUnbindSuccessArgs = __bind(this.getUnbindSuccessArgs, this);

    this.getUnbindSuccess = __bind(this.getUnbindSuccess, this);

    this.getUnbindFailureArgs = __bind(this.getUnbindFailureArgs, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      leaveState.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    leaveState.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the args for the failed Unbind.
  	 </div>
  
  	@function getUnbindFailureArgs
  	@return {fm.websync.unbindFailureArgs}
  */


  leaveState.prototype.getUnbindFailureArgs = function() {
    return this._unbindFailureArgs;
  };

  /**
  	 <div>
  	 Gets whether the unbind was successful.
  	 </div>
  
  	@function getUnbindSuccess
  	@return {fm.boolean}
  */


  leaveState.prototype.getUnbindSuccess = function() {
    return this._unbindSuccess;
  };

  /**
  	 <div>
  	 Gets the args for the successful Unbind.
  	 </div>
  
  	@function getUnbindSuccessArgs
  	@return {fm.websync.unbindSuccessArgs}
  */


  leaveState.prototype.getUnbindSuccessArgs = function() {
    return this._unbindSuccessArgs;
  };

  /**
  	 <div>
  	 Gets the args for the failed Unsubscribe.
  	 </div>
  
  	@function getUnsubscribeFailureArgs
  	@return {fm.websync.unsubscribeFailureArgs}
  */


  leaveState.prototype.getUnsubscribeFailureArgs = function() {
    return this._unsubscribeFailureArgs;
  };

  /**
  	 <div>
  	 Gets whether the unsubscribe was successful.
  	 </div>
  
  	@function getUnsubscribeSuccess
  	@return {fm.boolean}
  */


  leaveState.prototype.getUnsubscribeSuccess = function() {
    return this._unsubscribeSuccess;
  };

  /**
  	 <div>
  	 Gets the args for the successful Unsubscribe.
  	 </div>
  
  	@function getUnsubscribeSuccessArgs
  	@return {fm.websync.unsubscribeSuccessArgs}
  */


  leaveState.prototype.getUnsubscribeSuccessArgs = function() {
    return this._unsubscribeSuccessArgs;
  };

  /**
  	 <div>
  	 Sets the args for the failed Unbind.
  	 </div>
  
  	@function setUnbindFailureArgs
  	@param {fm.websync.unbindFailureArgs} value
  	@return {void}
  */


  leaveState.prototype.setUnbindFailureArgs = function() {
    var value;
    value = arguments[0];
    return this._unbindFailureArgs = value;
  };

  /**
  	 <div>
  	 Sets whether the unbind was successful.
  	 </div>
  
  	@function setUnbindSuccess
  	@param {fm.boolean} value
  	@return {void}
  */


  leaveState.prototype.setUnbindSuccess = function() {
    var value;
    value = arguments[0];
    return this._unbindSuccess = value;
  };

  /**
  	 <div>
  	 Sets the args for the successful Unbind.
  	 </div>
  
  	@function setUnbindSuccessArgs
  	@param {fm.websync.unbindSuccessArgs} value
  	@return {void}
  */


  leaveState.prototype.setUnbindSuccessArgs = function() {
    var value;
    value = arguments[0];
    return this._unbindSuccessArgs = value;
  };

  /**
  	 <div>
  	 Sets the args for the failed Unsubscribe.
  	 </div>
  
  	@function setUnsubscribeFailureArgs
  	@param {fm.websync.unsubscribeFailureArgs} value
  	@return {void}
  */


  leaveState.prototype.setUnsubscribeFailureArgs = function() {
    var value;
    value = arguments[0];
    return this._unsubscribeFailureArgs = value;
  };

  /**
  	 <div>
  	 Sets whether the unsubscribe was successful.
  	 </div>
  
  	@function setUnsubscribeSuccess
  	@param {fm.boolean} value
  	@return {void}
  */


  leaveState.prototype.setUnsubscribeSuccess = function() {
    var value;
    value = arguments[0];
    return this._unsubscribeSuccess = value;
  };

  /**
  	 <div>
  	 Sets the args for the successful Unsubscribe.
  	 </div>
  
  	@function setUnsubscribeSuccessArgs
  	@param {fm.websync.unsubscribeSuccessArgs} value
  	@return {void}
  */


  leaveState.prototype.setUnsubscribeSuccessArgs = function() {
    var value;
    value = arguments[0];
    return this._unsubscribeSuccessArgs = value;
  };

  /**
  	 <div>
  	 Updates the state with a failed unbind.
  	 </div><param name="unbindFailureArgs"></param>
  
  	@function updateUnbindFailure
  	@param {fm.websync.unbindFailureArgs} unbindFailureArgs
  	@return {void}
  */


  leaveState.prototype.updateUnbindFailure = function() {
    var unbindFailureArgs;
    unbindFailureArgs = arguments[0];
    this.setUnbindSuccess(false);
    return this.setUnbindFailureArgs(unbindFailureArgs);
  };

  /**
  	 <div>
  	 Updates the state with a successful unbind.
  	 </div><param name="unbindSuccessArgs"></param>
  
  	@function updateUnbindSuccess
  	@param {fm.websync.unbindSuccessArgs} unbindSuccessArgs
  	@return {void}
  */


  leaveState.prototype.updateUnbindSuccess = function() {
    var unbindSuccessArgs;
    unbindSuccessArgs = arguments[0];
    this.setUnbindSuccess(true);
    return this.setUnbindSuccessArgs(unbindSuccessArgs);
  };

  /**
  	 <div>
  	 Updates the state with a failed unsubscribe.
  	 </div><param name="unsubscribeFailureArgs"></param>
  
  	@function updateUnsubscribeFailure
  	@param {fm.websync.unsubscribeFailureArgs} unsubscribeFailureArgs
  	@return {void}
  */


  leaveState.prototype.updateUnsubscribeFailure = function() {
    var unsubscribeFailureArgs;
    unsubscribeFailureArgs = arguments[0];
    this.setUnsubscribeSuccess(false);
    return this.setUnsubscribeFailureArgs(unsubscribeFailureArgs);
  };

  /**
  	 <div>
  	 Updates the state with a successful unsubscribe.
  	 </div><param name="unsubscribeSuccessArgs"></param>
  
  	@function updateUnsubscribeSuccess
  	@param {fm.websync.unsubscribeSuccessArgs} unsubscribeSuccessArgs
  	@return {void}
  */


  leaveState.prototype.updateUnsubscribeSuccess = function() {
    var unsubscribeSuccessArgs;
    unsubscribeSuccessArgs = arguments[0];
    this.setUnsubscribeSuccess(true);
    return this.setUnsubscribeSuccessArgs(unsubscribeSuccessArgs);
  };

  return leaveState;

})(fm.object);


/**
@class fm.websync.chat.joinArgs
 <div>
 Arguments for a client joining a chat channel.
 </div>

@extends fm.websync.baseInputArgsGeneric
*/


fm.websync.chat.joinArgs = (function(_super) {

  __extends(joinArgs, _super);

  /**
  	@ignore 
  	@description
  */


  joinArgs.prototype._channel = null;

  /**
  	@ignore 
  	@description
  */


  joinArgs.prototype._onReceive = null;

  /**
  	@ignore 
  	@description
  */


  joinArgs.prototype._onUserJoin = null;

  /**
  	@ignore 
  	@description
  */


  joinArgs.prototype._onUserLeave = null;

  /**
  	@ignore 
  	@description
  */


  joinArgs.prototype._rejoin = false;

  /**
  	@ignore 
  	@description
  */


  joinArgs.prototype._userId = null;

  /**
  	@ignore 
  	@description
  */


  joinArgs.prototype._userNickname = null;

  /**
  	@ignore 
  	@description
  */


  function joinArgs() {
    this.setUserNickname = __bind(this.setUserNickname, this);

    this.setUserId = __bind(this.setUserId, this);

    this.setTag = __bind(this.setTag, this);

    this.setRejoin = __bind(this.setRejoin, this);

    this.setOnUserLeave = __bind(this.setOnUserLeave, this);

    this.setOnUserJoin = __bind(this.setOnUserJoin, this);

    this.setOnReceive = __bind(this.setOnReceive, this);

    this.setChannel = __bind(this.setChannel, this);

    this.getUserNickname = __bind(this.getUserNickname, this);

    this.getUserId = __bind(this.getUserId, this);

    this.getTag = __bind(this.getTag, this);

    this.getRejoin = __bind(this.getRejoin, this);

    this.getOnUserLeave = __bind(this.getOnUserLeave, this);

    this.getOnUserJoin = __bind(this.getOnUserJoin, this);

    this.getOnReceive = __bind(this.getOnReceive, this);

    this.getChannel = __bind(this.getChannel, this);

    var channel, tag;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      joinArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    if (arguments.length === 2) {
      channel = arguments[0];
      tag = arguments[1];
      joinArgs.__super__.constructor.call(this);
      this.setChannel(channel);
      this.setTag(tag);
      return;
    }
    if (arguments.length === 1) {
      channel = arguments[0];
      joinArgs.__super__.constructor.call(this);
      this.setChannel(channel);
      return;
    }
  }

  /**
  	 <div>
  	 Gets the channel to join.
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  joinArgs.prototype.getChannel = function() {
    return this._channel;
  };

  /**
  	 <div>
  	 Gets the callback to invoke when data is received on the channel.
  	 See <see cref="fm.websync.chat.joinReceiveArgs">fm.websync.chat.joinReceiveArgs</see> for callback argument details.
  	 </div>
  
  	@function getOnReceive
  	@return {fm.singleAction}
  */


  joinArgs.prototype.getOnReceive = function() {
    return this._onReceive;
  };

  /**
  	 <div>
  	 Gets the callback to invoke when a user joins the channel.
  	 See <see cref="fm.websync.chat.userJoinArgs">fm.websync.chat.userJoinArgs</see> for callback argument details.
  	 </div>
  
  	@function getOnUserJoin
  	@return {fm.singleAction}
  */


  joinArgs.prototype.getOnUserJoin = function() {
    return this._onUserJoin;
  };

  /**
  	 <div>
  	 Gets the callback to invoke when a user leaves the channel.
  	 See <see cref="fm.websync.chat.userLeaveArgs">fm.websync.chat.userLeaveArgs</see> for callback argument details.
  	 </div>
  
  	@function getOnUserLeave
  	@return {fm.singleAction}
  */


  joinArgs.prototype.getOnUserLeave = function() {
    return this._onUserLeave;
  };

  /**
  	 <div>
  	 Gets whether or not the join is occurring because the connection has been lost and re-negotiated.
  	 </div>
  
  	@function getRejoin
  	@return {fm.boolean}
  */


  joinArgs.prototype.getRejoin = function() {
    return this._rejoin;
  };

  /**
  	 <div>
  	 Gets a tag that will uniquely identify the join subscription so the client can
  	 leave (unsubscribe) later without affecting other join subscriptions with the same channel.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  joinArgs.prototype.getTag = function() {
    var _ref;
    return (_ref = fm.serializer.deserializeString(this.getExtensionValueJson("fm.tag"))) != null ? _ref : fm.stringExtensions.empty;
  };

  /**
  	 <div>
  	 Gets the current user ID.
  	 </div>
  
  	@function getUserId
  	@return {fm.string}
  */


  joinArgs.prototype.getUserId = function() {
    return this._userId;
  };

  /**
  	 <div>
  	 Gets the current user nickname.
  	 </div>
  
  	@function getUserNickname
  	@return {fm.string}
  */


  joinArgs.prototype.getUserNickname = function() {
    return this._userNickname;
  };

  /**
  	 <div>
  	 Sets the channel to join.
  	 </div>
  
  	@function setChannel
  	@param {fm.string} value
  	@return {void}
  */


  joinArgs.prototype.setChannel = function() {
    var value;
    value = arguments[0];
    return this._channel = value;
  };

  /**
  	 <div>
  	 Sets the callback to invoke when data is received on the channel.
  	 See <see cref="fm.websync.chat.joinReceiveArgs">fm.websync.chat.joinReceiveArgs</see> for callback argument details.
  	 </div>
  
  	@function setOnReceive
  	@param {fm.singleAction} value
  	@return {void}
  */


  joinArgs.prototype.setOnReceive = function() {
    var value;
    value = arguments[0];
    return this._onReceive = value;
  };

  /**
  	 <div>
  	 Sets the callback to invoke when a user joins the channel.
  	 See <see cref="fm.websync.chat.userJoinArgs">fm.websync.chat.userJoinArgs</see> for callback argument details.
  	 </div>
  
  	@function setOnUserJoin
  	@param {fm.singleAction} value
  	@return {void}
  */


  joinArgs.prototype.setOnUserJoin = function() {
    var value;
    value = arguments[0];
    return this._onUserJoin = value;
  };

  /**
  	 <div>
  	 Sets the callback to invoke when a user leaves the channel.
  	 See <see cref="fm.websync.chat.userLeaveArgs">fm.websync.chat.userLeaveArgs</see> for callback argument details.
  	 </div>
  
  	@function setOnUserLeave
  	@param {fm.singleAction} value
  	@return {void}
  */


  joinArgs.prototype.setOnUserLeave = function() {
    var value;
    value = arguments[0];
    return this._onUserLeave = value;
  };

  /**
  	 <div>
  	 Sets whether or not the join is occurring because the connection has been lost and re-negotiated.
  	 </div>
  
  	@function setRejoin
  	@param {fm.boolean} value
  	@return {void}
  */


  joinArgs.prototype.setRejoin = function() {
    var value;
    value = arguments[0];
    return this._rejoin = value;
  };

  /**
  	 <div>
  	 Sets a tag that will uniquely identify the join subscription so the client can
  	 leave (unsubscribe) later without affecting other join subscriptions with the same channel.
  	 </div>
  
  	@function setTag
  	@param {fm.string} value
  	@return {void}
  */


  joinArgs.prototype.setTag = function() {
    var value;
    value = arguments[0];
    return this.setExtensionValueJson("fm.tag", fm.serializer.serializeString(value != null ? value : fm.stringExtensions.empty));
  };

  /**
  	 <div>
  	 Sets the current user ID.
  	 </div>
  
  	@function setUserId
  	@param {fm.string} value
  	@return {void}
  */


  joinArgs.prototype.setUserId = function() {
    var value;
    value = arguments[0];
    return this._userId = value;
  };

  /**
  	 <div>
  	 Sets the current user nickname.
  	 </div>
  
  	@function setUserNickname
  	@param {fm.string} value
  	@return {void}
  */


  joinArgs.prototype.setUserNickname = function() {
    var value;
    value = arguments[0];
    return this._userNickname = value;
  };

  return joinArgs;

})(fm.websync.baseInputArgsGeneric);


/**
@class fm.websync.chat.joinState

@extends fm.object
*/


fm.websync.chat.joinState = (function(_super) {

  __extends(joinState, _super);

  /**
  	@ignore 
  	@description
  */


  joinState.prototype._bindFailureArgs = null;

  /**
  	@ignore 
  	@description
  */


  joinState.prototype._bindSuccess = false;

  /**
  	@ignore 
  	@description
  */


  joinState.prototype._bindSuccessArgs = null;

  /**
  	@ignore 
  	@description
  */


  joinState.prototype._subscribeFailureArgs = null;

  /**
  	@ignore 
  	@description
  */


  joinState.prototype._subscribeSuccess = false;

  /**
  	@ignore 
  	@description
  */


  joinState.prototype._subscribeSuccessArgs = null;

  /**
  	@ignore 
  	@description
  */


  function joinState() {
    this.updateSubscribeSuccess = __bind(this.updateSubscribeSuccess, this);

    this.updateSubscribeFailure = __bind(this.updateSubscribeFailure, this);

    this.updateBindSuccess = __bind(this.updateBindSuccess, this);

    this.updateBindFailure = __bind(this.updateBindFailure, this);

    this.setSubscribeSuccessArgs = __bind(this.setSubscribeSuccessArgs, this);

    this.setSubscribeSuccess = __bind(this.setSubscribeSuccess, this);

    this.setSubscribeFailureArgs = __bind(this.setSubscribeFailureArgs, this);

    this.setBindSuccessArgs = __bind(this.setBindSuccessArgs, this);

    this.setBindSuccess = __bind(this.setBindSuccess, this);

    this.setBindFailureArgs = __bind(this.setBindFailureArgs, this);

    this.getSubscribeSuccessArgs = __bind(this.getSubscribeSuccessArgs, this);

    this.getSubscribeSuccess = __bind(this.getSubscribeSuccess, this);

    this.getSubscribeFailureArgs = __bind(this.getSubscribeFailureArgs, this);

    this.getBindSuccessArgs = __bind(this.getBindSuccessArgs, this);

    this.getBindSuccess = __bind(this.getBindSuccess, this);

    this.getBindFailureArgs = __bind(this.getBindFailureArgs, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      joinState.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    joinState.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the args for the failed Bind.
  	 </div>
  
  	@function getBindFailureArgs
  	@return {fm.websync.bindFailureArgs}
  */


  joinState.prototype.getBindFailureArgs = function() {
    return this._bindFailureArgs;
  };

  /**
  	 <div>
  	 Gets whether the Bind was successful.
  	 </div>
  
  	@function getBindSuccess
  	@return {fm.boolean}
  */


  joinState.prototype.getBindSuccess = function() {
    return this._bindSuccess;
  };

  /**
  	 <div>
  	 Gets the args for the successful Bind.
  	 </div>
  
  	@function getBindSuccessArgs
  	@return {fm.websync.bindSuccessArgs}
  */


  joinState.prototype.getBindSuccessArgs = function() {
    return this._bindSuccessArgs;
  };

  /**
  	 <div>
  	 Gets the args for the failed Subscribe.
  	 </div>
  
  	@function getSubscribeFailureArgs
  	@return {fm.websync.subscribeFailureArgs}
  */


  joinState.prototype.getSubscribeFailureArgs = function() {
    return this._subscribeFailureArgs;
  };

  /**
  	 <div>
  	 Gets whether the Subscribe was successful.
  	 </div>
  
  	@function getSubscribeSuccess
  	@return {fm.boolean}
  */


  joinState.prototype.getSubscribeSuccess = function() {
    return this._subscribeSuccess;
  };

  /**
  	 <div>
  	 Gets the args for the successful Subscribe.
  	 </div>
  
  	@function getSubscribeSuccessArgs
  	@return {fm.websync.subscribeSuccessArgs}
  */


  joinState.prototype.getSubscribeSuccessArgs = function() {
    return this._subscribeSuccessArgs;
  };

  /**
  	 <div>
  	 Sets the args for the failed Bind.
  	 </div>
  
  	@function setBindFailureArgs
  	@param {fm.websync.bindFailureArgs} value
  	@return {void}
  */


  joinState.prototype.setBindFailureArgs = function() {
    var value;
    value = arguments[0];
    return this._bindFailureArgs = value;
  };

  /**
  	 <div>
  	 Sets whether the Bind was successful.
  	 </div>
  
  	@function setBindSuccess
  	@param {fm.boolean} value
  	@return {void}
  */


  joinState.prototype.setBindSuccess = function() {
    var value;
    value = arguments[0];
    return this._bindSuccess = value;
  };

  /**
  	 <div>
  	 Sets the args for the successful Bind.
  	 </div>
  
  	@function setBindSuccessArgs
  	@param {fm.websync.bindSuccessArgs} value
  	@return {void}
  */


  joinState.prototype.setBindSuccessArgs = function() {
    var value;
    value = arguments[0];
    return this._bindSuccessArgs = value;
  };

  /**
  	 <div>
  	 Sets the args for the failed Subscribe.
  	 </div>
  
  	@function setSubscribeFailureArgs
  	@param {fm.websync.subscribeFailureArgs} value
  	@return {void}
  */


  joinState.prototype.setSubscribeFailureArgs = function() {
    var value;
    value = arguments[0];
    return this._subscribeFailureArgs = value;
  };

  /**
  	 <div>
  	 Sets whether the Subscribe was successful.
  	 </div>
  
  	@function setSubscribeSuccess
  	@param {fm.boolean} value
  	@return {void}
  */


  joinState.prototype.setSubscribeSuccess = function() {
    var value;
    value = arguments[0];
    return this._subscribeSuccess = value;
  };

  /**
  	 <div>
  	 Sets the args for the successful Subscribe.
  	 </div>
  
  	@function setSubscribeSuccessArgs
  	@param {fm.websync.subscribeSuccessArgs} value
  	@return {void}
  */


  joinState.prototype.setSubscribeSuccessArgs = function() {
    var value;
    value = arguments[0];
    return this._subscribeSuccessArgs = value;
  };

  /**
  	 <div>
  	 Updates the state with a failed Bind.
  	 </div><param name="bindFailureArgs"></param>
  
  	@function updateBindFailure
  	@param {fm.websync.bindFailureArgs} bindFailureArgs
  	@return {void}
  */


  joinState.prototype.updateBindFailure = function() {
    var bindFailureArgs;
    bindFailureArgs = arguments[0];
    this.setBindSuccess(false);
    return this.setBindFailureArgs(bindFailureArgs);
  };

  /**
  	 <div>
  	 Updates the state with a successful Bind.
  	 </div><param name="bindSuccessArgs"></param>
  
  	@function updateBindSuccess
  	@param {fm.websync.bindSuccessArgs} bindSuccessArgs
  	@return {void}
  */


  joinState.prototype.updateBindSuccess = function() {
    var bindSuccessArgs;
    bindSuccessArgs = arguments[0];
    this.setBindSuccess(true);
    return this.setBindSuccessArgs(bindSuccessArgs);
  };

  /**
  	 <div>
  	 Updates the state with a failed Subscribe.
  	 </div><param name="subscribeFailureArgs"></param>
  
  	@function updateSubscribeFailure
  	@param {fm.websync.subscribeFailureArgs} subscribeFailureArgs
  	@return {void}
  */


  joinState.prototype.updateSubscribeFailure = function() {
    var subscribeFailureArgs;
    subscribeFailureArgs = arguments[0];
    this.setSubscribeSuccess(false);
    return this.setSubscribeFailureArgs(subscribeFailureArgs);
  };

  /**
  	 <div>
  	 Updates the state with a successful Subscribe.
  	 </div><param name="subscribeSuccessArgs"></param>
  
  	@function updateSubscribeSuccess
  	@param {fm.websync.subscribeSuccessArgs} subscribeSuccessArgs
  	@return {void}
  */


  joinState.prototype.updateSubscribeSuccess = function() {
    var subscribeSuccessArgs;
    subscribeSuccessArgs = arguments[0];
    this.setSubscribeSuccess(true);
    return this.setSubscribeSuccessArgs(subscribeSuccessArgs);
  };

  return joinState;

})(fm.object);


/**
@class fm.websync.chat.userJoinArgs
 <div>
 Arguments for <see cref="fm.websync.chat.joinArgs.onUserJoin">fm.websync.chat.joinArgs.onUserJoin</see>.
 </div>

@extends fm.websync.baseSuccessArgs
*/


fm.websync.chat.userJoinArgs = (function(_super) {

  __extends(userJoinArgs, _super);

  /**
  	@ignore 
  	@description
  */


  userJoinArgs.prototype.__channel = null;

  /**
  	@ignore 
  	@description
  */


  userJoinArgs.prototype.__joinedUser = null;

  /**
  	@ignore 
  	@description
  */


  userJoinArgs.prototype.__userId = null;

  /**
  	@ignore 
  	@description
  */


  userJoinArgs.prototype.__userNickname = null;

  /**
  	@ignore 
  	@description
  */


  function userJoinArgs() {
    this.getUserNickname = __bind(this.getUserNickname, this);

    this.getUserId = __bind(this.getUserId, this);

    this.getJoinedUser = __bind(this.getJoinedUser, this);

    this.getChannel = __bind(this.getChannel, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      userJoinArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    userJoinArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the channel which the user has joined.
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  userJoinArgs.prototype.getChannel = function() {
    return this.__channel;
  };

  /**
  	 <div>
  	 Gets the user that joined.
  	 </div>
  
  	@function getJoinedUser
  	@return {fm.websync.chat.chatUser}
  */


  userJoinArgs.prototype.getJoinedUser = function() {
    return this.__joinedUser;
  };

  /**
  	 <div>
  	 Gets the ID of the current user.
  	 </div>
  
  	@function getUserId
  	@return {fm.string}
  */


  userJoinArgs.prototype.getUserId = function() {
    return this.__userId;
  };

  /**
  	 <div>
  	 Gets the nickname of the current user.
  	 </div>
  
  	@function getUserNickname
  	@return {fm.string}
  */


  userJoinArgs.prototype.getUserNickname = function() {
    return this.__userNickname;
  };

  return userJoinArgs;

})(fm.websync.baseSuccessArgs);


/**
@class fm.websync.chat.userLeaveArgs
 <div>
 Arguments for <see cref="fm.websync.chat.joinArgs.onUserLeave">fm.websync.chat.joinArgs.onUserLeave</see>.
 </div>

@extends fm.websync.baseSuccessArgs
*/


fm.websync.chat.userLeaveArgs = (function(_super) {

  __extends(userLeaveArgs, _super);

  /**
  	@ignore 
  	@description
  */


  userLeaveArgs.prototype.__channel = null;

  /**
  	@ignore 
  	@description
  */


  userLeaveArgs.prototype.__leftUser = null;

  /**
  	@ignore 
  	@description
  */


  userLeaveArgs.prototype.__userId = null;

  /**
  	@ignore 
  	@description
  */


  userLeaveArgs.prototype.__userNickname = null;

  /**
  	@ignore 
  	@description
  */


  function userLeaveArgs() {
    this.getUserNickname = __bind(this.getUserNickname, this);

    this.getUserId = __bind(this.getUserId, this);

    this.getLeftUser = __bind(this.getLeftUser, this);

    this.getChannel = __bind(this.getChannel, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      userLeaveArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    userLeaveArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the channel which the user has left.
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  userLeaveArgs.prototype.getChannel = function() {
    return this.__channel;
  };

  /**
  	 <div>
  	 Gets the user that left.
  	 </div>
  
  	@function getLeftUser
  	@return {fm.websync.chat.chatUser}
  */


  userLeaveArgs.prototype.getLeftUser = function() {
    return this.__leftUser;
  };

  /**
  	 <div>
  	 Gets the ID of the current user.
  	 </div>
  
  	@function getUserId
  	@return {fm.string}
  */


  userLeaveArgs.prototype.getUserId = function() {
    return this.__userId;
  };

  /**
  	 <div>
  	 Gets the nickname of the current user.
  	 </div>
  
  	@function getUserNickname
  	@return {fm.string}
  */


  userLeaveArgs.prototype.getUserNickname = function() {
    return this.__userNickname;
  };

  return userLeaveArgs;

})(fm.websync.baseSuccessArgs);


/**
@class fm.websync.chat.leaveArgs
 <div>
 Arguments for a client leaving a chat channel.
 </div>

@extends fm.websync.baseInputArgsGeneric
*/


fm.websync.chat.leaveArgs = (function(_super) {

  __extends(leaveArgs, _super);

  /**
  	@ignore 
  	@description
  */


  leaveArgs.prototype._channel = null;

  /**
  	@ignore 
  	@description
  */


  function leaveArgs() {
    this.setTag = __bind(this.setTag, this);

    this.setChannel = __bind(this.setChannel, this);

    this.getTag = __bind(this.getTag, this);

    this.getChannel = __bind(this.getChannel, this);

    var channel, tag;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      leaveArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    if (arguments.length === 2) {
      channel = arguments[0];
      tag = arguments[1];
      leaveArgs.__super__.constructor.call(this);
      this.setChannel(channel);
      this.setTag(tag);
      return;
    }
    if (arguments.length === 1) {
      channel = arguments[0];
      leaveArgs.__super__.constructor.call(this);
      this.setChannel(channel);
      return;
    }
  }

  /**
  	 <div>
  	 Gets the channel to leave.
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  leaveArgs.prototype.getChannel = function() {
    return this._channel;
  };

  /**
  	 <div>
  	 Gets a tag that uniquely identifies a join subscription so
  	 other join subscriptions with the same channel are not affected.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  leaveArgs.prototype.getTag = function() {
    var _ref;
    return (_ref = fm.serializer.deserializeString(this.getExtensionValueJson("fm.tag"))) != null ? _ref : fm.stringExtensions.empty;
  };

  /**
  	 <div>
  	 Sets the channel to leave.
  	 </div>
  
  	@function setChannel
  	@param {fm.string} value
  	@return {void}
  */


  leaveArgs.prototype.setChannel = function() {
    var value;
    value = arguments[0];
    return this._channel = value;
  };

  /**
  	 <div>
  	 Sets a tag that uniquely identifies a join subscription so
  	 other join subscriptions with the same channel are not affected.
  	 </div>
  
  	@function setTag
  	@param {fm.string} value
  	@return {void}
  */


  leaveArgs.prototype.setTag = function() {
    var value;
    value = arguments[0];
    return this.setExtensionValueJson("fm.tag", fm.serializer.serializeString(value != null ? value : fm.stringExtensions.empty));
  };

  return leaveArgs;

})(fm.websync.baseInputArgsGeneric);


/**
@class fm.websync.chat.joinCompleteArgs
 <div>
 Arguments for join complete callbacks.
 </div>

@extends fm.websync.baseCompleteArgs
*/


fm.websync.chat.joinCompleteArgs = (function(_super) {

  __extends(joinCompleteArgs, _super);

  /**
  	@ignore 
  	@description
  */


  joinCompleteArgs.prototype.__isRejoin = false;

  /**
  	@ignore 
  	@description
  */


  function joinCompleteArgs() {
    this.getIsRejoin = __bind(this.getIsRejoin, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      joinCompleteArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    joinCompleteArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets whether the join call was automatically
  	 invoked following a stream failure.
  	 </div>
  
  	@function getIsRejoin
  	@return {fm.boolean}
  */


  joinCompleteArgs.prototype.getIsRejoin = function() {
    return this.__isRejoin;
  };

  return joinCompleteArgs;

})(fm.websync.baseCompleteArgs);


/**
@class fm.websync.chat.joinFailureArgs
 <div>
 Arguments for join failure callbacks.
 </div>

@extends fm.websync.baseFailureArgs
*/


fm.websync.chat.joinFailureArgs = (function(_super) {

  __extends(joinFailureArgs, _super);

  /**
  	@ignore 
  	@description
  */


  joinFailureArgs.prototype.__channel = null;

  /**
  	@ignore 
  	@description
  */


  joinFailureArgs.prototype.__isRejoin = false;

  /**
  	@ignore 
  	@description
  */


  joinFailureArgs.prototype.__userId = null;

  /**
  	@ignore 
  	@description
  */


  joinFailureArgs.prototype.__userNickname = null;

  /**
  	@ignore 
  	@description
  */


  function joinFailureArgs() {
    this.getUserNickname = __bind(this.getUserNickname, this);

    this.getUserId = __bind(this.getUserId, this);

    this.getTag = __bind(this.getTag, this);

    this.getIsRejoin = __bind(this.getIsRejoin, this);

    this.getChannel = __bind(this.getChannel, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      joinFailureArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    joinFailureArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the channel that failed to be joined.
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  joinFailureArgs.prototype.getChannel = function() {
    return this.__channel;
  };

  /**
  	 <div>
  	 Gets whether the join call was automatically
  	 invoked following a stream failure.
  	 </div>
  
  	@function getIsRejoin
  	@return {fm.boolean}
  */


  joinFailureArgs.prototype.getIsRejoin = function() {
    return this.__isRejoin;
  };

  /**
  	 <div>
  	 Gets the tag associated with the join request.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  joinFailureArgs.prototype.getTag = function() {
    var _ref;
    return (_ref = fm.serializer.deserializeString(this.getExtensionValueJson("fm.tag"))) != null ? _ref : fm.stringExtensions.empty;
  };

  /**
  	 <div>
  	 Gets the ID of the current user.
  	 </div>
  
  	@function getUserId
  	@return {fm.string}
  */


  joinFailureArgs.prototype.getUserId = function() {
    return this.__userId;
  };

  /**
  	 <div>
  	 Gets the nickname of the current user.
  	 </div>
  
  	@function getUserNickname
  	@return {fm.string}
  */


  joinFailureArgs.prototype.getUserNickname = function() {
    return this.__userNickname;
  };

  return joinFailureArgs;

})(fm.websync.baseFailureArgs);


/**
@class fm.websync.chat.joinSuccessArgs
 <div>
 Arguments for join success callbacks.
 </div>

@extends fm.websync.baseSuccessArgs
*/


fm.websync.chat.joinSuccessArgs = (function(_super) {

  __extends(joinSuccessArgs, _super);

  /**
  	@ignore 
  	@description
  */


  joinSuccessArgs.prototype.__channel = null;

  /**
  	@ignore 
  	@description
  */


  joinSuccessArgs.prototype.__isRejoin = false;

  /**
  	@ignore 
  	@description
  */


  joinSuccessArgs.prototype.__userId = null;

  /**
  	@ignore 
  	@description
  */


  joinSuccessArgs.prototype.__userNickname = null;

  /**
  	@ignore 
  	@description
  */


  joinSuccessArgs.prototype.__users = null;

  /**
  	@ignore 
  	@description
  */


  function joinSuccessArgs() {
    this.getUsers = __bind(this.getUsers, this);

    this.getUserNickname = __bind(this.getUserNickname, this);

    this.getUserId = __bind(this.getUserId, this);

    this.getTag = __bind(this.getTag, this);

    this.getIsRejoin = __bind(this.getIsRejoin, this);

    this.getChannel = __bind(this.getChannel, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      joinSuccessArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    joinSuccessArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the channel that was joined.
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  joinSuccessArgs.prototype.getChannel = function() {
    return this.__channel;
  };

  /**
  	 <div>
  	 Gets whether the join call was automatically
  	 invoked following a stream failure.
  	 </div>
  
  	@function getIsRejoin
  	@return {fm.boolean}
  */


  joinSuccessArgs.prototype.getIsRejoin = function() {
    return this.__isRejoin;
  };

  /**
  	 <div>
  	 Gets the tag associated with the join request.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  joinSuccessArgs.prototype.getTag = function() {
    var _ref;
    return (_ref = fm.serializer.deserializeString(this.getExtensionValueJson("fm.tag"))) != null ? _ref : fm.stringExtensions.empty;
  };

  /**
  	 <div>
  	 Gets the ID of the current user.
  	 </div>
  
  	@function getUserId
  	@return {fm.string}
  */


  joinSuccessArgs.prototype.getUserId = function() {
    return this.__userId;
  };

  /**
  	 <div>
  	 Gets the nickname of the current user.
  	 </div>
  
  	@function getUserNickname
  	@return {fm.string}
  */


  joinSuccessArgs.prototype.getUserNickname = function() {
    return this.__userNickname;
  };

  /**
  	 <div>
  	 Gets the array of users in the channel.
  	 </div>
  
  	@function getUsers
  	@return {fm.array}
  */


  joinSuccessArgs.prototype.getUsers = function() {
    return this.__users;
  };

  return joinSuccessArgs;

})(fm.websync.baseSuccessArgs);


/**
@class fm.websync.chat.leaveCompleteArgs
 <div>
 Arguments for leave complete callbacks.
 </div>

@extends fm.websync.baseCompleteArgs
*/


fm.websync.chat.leaveCompleteArgs = (function(_super) {

  __extends(leaveCompleteArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function leaveCompleteArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      leaveCompleteArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    leaveCompleteArgs.__super__.constructor.call(this);
  }

  return leaveCompleteArgs;

})(fm.websync.baseCompleteArgs);


/**
@class fm.websync.chat.leaveFailureArgs
 <div>
 Arguments for leave failure callbacks.
 </div>

@extends fm.websync.baseFailureArgs
*/


fm.websync.chat.leaveFailureArgs = (function(_super) {

  __extends(leaveFailureArgs, _super);

  /**
  	@ignore 
  	@description
  */


  leaveFailureArgs.prototype.__channel = null;

  /**
  	@ignore 
  	@description
  */


  leaveFailureArgs.prototype.__userId = null;

  /**
  	@ignore 
  	@description
  */


  leaveFailureArgs.prototype.__userNickname = null;

  /**
  	@ignore 
  	@description
  */


  function leaveFailureArgs() {
    this.getUserNickname = __bind(this.getUserNickname, this);

    this.getUserId = __bind(this.getUserId, this);

    this.getTag = __bind(this.getTag, this);

    this.getChannel = __bind(this.getChannel, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      leaveFailureArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    leaveFailureArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the channel that failed to be left.
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  leaveFailureArgs.prototype.getChannel = function() {
    return this.__channel;
  };

  /**
  	 <div>
  	 Gets the tag associated with the join request.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  leaveFailureArgs.prototype.getTag = function() {
    var _ref;
    return (_ref = fm.serializer.deserializeString(this.getExtensionValueJson("fm.tag"))) != null ? _ref : fm.stringExtensions.empty;
  };

  /**
  	 <div>
  	 Gets the ID of the current user.
  	 </div>
  
  	@function getUserId
  	@return {fm.string}
  */


  leaveFailureArgs.prototype.getUserId = function() {
    return this.__userId;
  };

  /**
  	 <div>
  	 Gets the nickname of the current user.
  	 </div>
  
  	@function getUserNickname
  	@return {fm.string}
  */


  leaveFailureArgs.prototype.getUserNickname = function() {
    return this.__userNickname;
  };

  return leaveFailureArgs;

})(fm.websync.baseFailureArgs);


/**
@class fm.websync.chat.leaveSuccessArgs
 <div>
 Arguments for leave success callbacks.
 </div>

@extends fm.websync.baseSuccessArgs
*/


fm.websync.chat.leaveSuccessArgs = (function(_super) {

  __extends(leaveSuccessArgs, _super);

  /**
  	@ignore 
  	@description
  */


  leaveSuccessArgs.prototype.__channel = null;

  /**
  	@ignore 
  	@description
  */


  leaveSuccessArgs.prototype.__userId = null;

  /**
  	@ignore 
  	@description
  */


  leaveSuccessArgs.prototype.__userNickname = null;

  /**
  	@ignore 
  	@description
  */


  function leaveSuccessArgs() {
    this.getUserNickname = __bind(this.getUserNickname, this);

    this.getUserId = __bind(this.getUserId, this);

    this.getTag = __bind(this.getTag, this);

    this.getChannel = __bind(this.getChannel, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      leaveSuccessArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    leaveSuccessArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the channel that was left.
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  leaveSuccessArgs.prototype.getChannel = function() {
    return this.__channel;
  };

  /**
  	 <div>
  	 Gets the tag associated with the join request.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  leaveSuccessArgs.prototype.getTag = function() {
    var _ref;
    return (_ref = fm.serializer.deserializeString(this.getExtensionValueJson("fm.tag"))) != null ? _ref : fm.stringExtensions.empty;
  };

  /**
  	 <div>
  	 Gets the ID of the current user.
  	 </div>
  
  	@function getUserId
  	@return {fm.string}
  */


  leaveSuccessArgs.prototype.getUserId = function() {
    return this.__userId;
  };

  /**
  	 <div>
  	 Gets the nickname of the current user.
  	 </div>
  
  	@function getUserNickname
  	@return {fm.string}
  */


  leaveSuccessArgs.prototype.getUserNickname = function() {
    return this.__userNickname;
  };

  return leaveSuccessArgs;

})(fm.websync.baseSuccessArgs);


/**
@class fm.websync.chat.joinReceiveArgs
 <div>
 Arguments for <see cref="fm.websync.chat.joinArgs.onReceive">fm.websync.chat.joinArgs.onReceive</see>.
 </div>

@extends fm.websync.subscribeReceiveArgs
*/


fm.websync.chat.joinReceiveArgs = (function(_super) {

  __extends(joinReceiveArgs, _super);

  /**
  	@ignore 
  	@description
  */


  joinReceiveArgs.prototype.__publishingUser = null;

  /**
  	@ignore 
  	@description
  */


  joinReceiveArgs.prototype.__userId = null;

  /**
  	@ignore 
  	@description
  */


  joinReceiveArgs.prototype.__userNickname = null;

  /**
  	@ignore 
  	@description
  */


  function joinReceiveArgs() {
    this.getUserNickname = __bind(this.getUserNickname, this);

    this.getUserId = __bind(this.getUserId, this);

    this.getPublishingUser = __bind(this.getPublishingUser, this);

    var channel, dataJson;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      joinReceiveArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    channel = arguments[0];
    dataJson = arguments[1];
    joinReceiveArgs.__super__.constructor.call(this, channel, dataJson);
  }

  /**
  	 <div>
  	 Gets the user that published the message.
  	 </div>
  
  	@function getPublishingUser
  	@return {fm.websync.chat.chatUser}
  */


  joinReceiveArgs.prototype.getPublishingUser = function() {
    return this.__publishingUser;
  };

  /**
  	 <div>
  	 Gets the ID of the current user.
  	 </div>
  
  	@function getUserId
  	@return {fm.string}
  */


  joinReceiveArgs.prototype.getUserId = function() {
    return this.__userId;
  };

  /**
  	 <div>
  	 Gets the nickname of the current user.
  	 </div>
  
  	@function getUserNickname
  	@return {fm.string}
  */


  joinReceiveArgs.prototype.getUserNickname = function() {
    return this.__userNickname;
  };

  return joinReceiveArgs;

})(fm.websync.subscribeReceiveArgs);


var methodName, _fn, _i, _len, _ref;

_ref = ['join', 'leave'];
_fn = function(methodName) {
  var method;
  method = fm.websync.client.prototype[methodName];
  return fm.websync.client.prototype[methodName] = function() {
    var obj;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0])) {
      obj = arguments[0];
      return method.call(this, new fm.websync.chat[methodName + 'Args'](obj));
    } else {
      return method.apply(this, arguments);
    }
  };
};
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
  methodName = _ref[_i];
  _fn(methodName);
}
