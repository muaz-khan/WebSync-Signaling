
/*
 * Vendor: Frozen Mountain Software
 * Title: WebSync Client for JavaScript
 * Version: 4.2.0
 * Copyright Frozen Mountain Software 2011+
 */

if (typeof global !== 'undefined' && !global.window) { global.window = global; global.document = { cookie: '' }; }

if (!window.fm) { window.fm = {}; }

if (!window.fm.websync) { window.fm.websync = {}; }

var __bind =  function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

var __hasProp =  {}.hasOwnProperty;

var __extends =  function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };


fm.websync.crypto = (function() {

  function crypto() {}

  crypto.tryBase64Decode = function(s, result) {
    result.setValue(null);
    return false;
  };

  return crypto;

})();


var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

fm.websync.webSocket = (function() {

  function webSocket(requestUrl) {
    this.raiseOnResponseReceived = __bind(this.raiseOnResponseReceived, this);

    this.raiseOnRequestCreated = __bind(this.raiseOnRequestCreated, this);

    this.raiseCloseComplete = __bind(this.raiseCloseComplete, this);

    this.raiseReceive = __bind(this.raiseReceive, this);

    this.raiseStreamFailure = __bind(this.raiseStreamFailure, this);

    this.raiseOpenFailure = __bind(this.raiseOpenFailure, this);

    this.raiseOpenSuccess = __bind(this.raiseOpenSuccess, this);

    this.close = __bind(this.close, this);

    this.send = __bind(this.send, this);

    this.open = __bind(this.open, this);

    this.getIsOpen = __bind(this.getIsOpen, this);

    this.getBufferedAmount = __bind(this.getBufferedAmount, this);
    requestUrl = fm.util.absolutizeUrl(requestUrl);
    requestUrl = requestUrl.replace("https://", "wss://");
    requestUrl = requestUrl.replace("http://", "ws://");
    this._requestUrl = requestUrl;
  }

  webSocket.prototype.getBufferedAmount = function() {
    if (!this._webSocket) {
      return 0;
    }
    return this._webSocket.bufferedAmount;
  };

  webSocket.prototype.getIsOpen = function() {
    if (!this._webSocket) {
      return false;
    }
    return this._webSocket.readyState === 1;
  };

  webSocket.prototype.open = function(args) {
    var headers, url,
      _this = this;
    url = this._requestUrl;
    headers = args.getHeaders();
    if (headers) {
      url = fm.httpTransfer.addQueryToUrl(url, 'headers', fm.json.serialize(headers.toHash()));
    }
    if ('WebSocket' in window) {
      this._webSocket = new WebSocket(url);
    } else if ('MozWebSocket' in window) {
      this._webSocket = new MozWebSocket(url);
    }
    if (!this._webSocket) {
      raiseOpenFailure(args, {
        statusCode: 0,
        exception: new Error('Could not create WebSocket.')
      });
      return;
    }
    this._onRequestCreated = args.getOnRequestCreated();
    this._onResponseReceived = args.getOnResponseReceived();
    this.raiseOnRequestCreated(args);
    this._opening = true;
    this._closing = false;
    this._webSocket.onopen = function(e) {
      _this.raiseOnResponseReceived(args);
      _this._opening = false;
      return _this.raiseOpenSuccess(args);
    };
    this._webSocket.onerror = function(e) {
      if (_this._opening) {
        _this._opening = false;
        return _this.raiseOpenFailure(args, {
          statusCode: e.code,
          exception: new Error(e.message || 'Unspecified WebSocket error.')
        });
      } else if (!_this._closing) {
        return _this.raiseStreamFailure(args, {
          statusCode: e.code,
          exception: new Error(e.message || 'Unspecified WebSocket error.')
        });
      }
    };
    this._webSocket.onclose = function(e) {
      if (_this._opening) {
        _this._opening = false;
        return _this.raiseOpenFailure(args, {
          statusCode: e.code,
          exception: new Error('Could not open WebSocket.')
        });
      } else if (_this._aborting) {
        return _this.raiseStreamFailure(args, {
          statusCode: e.code,
          exception: new Error('WebSocket request timed out.')
        });
      }
    };
    return this._webSocket.onmessage = function(e) {
      if (_this._timer) {
        window.clearTimeout(_this._timer);
      }
      _this.raiseOnResponseReceived(_this._sendArgs);
      _this._sendArgs = null;
      return _this.raiseReceive(args, {
        textMessage: e.data
      });
    };
  };

  webSocket.prototype.send = function(args) {
    var _this = this;
    if (!this._webSocket) {
      return;
    }
    this._sendArgs = args;
    this.raiseOnRequestCreated(args);
    this._timer = window.setTimeout(function() {
      _this._aborting = true;
      return _this._webSocket.close();
    }, args.getTimeout());
    return this._webSocket.send(args.getTextMessage());
  };

  webSocket.prototype.close = function(args) {
    var code, reason;
    if (!args) {
      this.close(new fm.websync.webSocketCloseArgs());
    }
    if (!this._webSocket) {
      return false;
    }
    code = args.getStatusCode() || fm.websync.webSocketStatusCode.Normal;
    reason = args.getReason() || '';
    this._closing = true;
    this._webSocket.close(code, reason);
    this._webSocket = null;
    this.raiseCloseComplete(args, {
      statusCode: code,
      reason: reason
    });
    return true;
  };

  webSocket.prototype.raiseOpenSuccess = function(openArgs) {
    var cb;
    cb = openArgs.getOnSuccess();
    if (cb) {
      return cb(new fm.websync.webSocketOpenSuccessArgs());
    }
  };

  webSocket.prototype.raiseOpenFailure = function(openArgs, e) {
    var cb;
    cb = openArgs.getOnFailure();
    if (cb) {
      return cb(new fm.websync.webSocketOpenFailureArgs(e));
    }
  };

  webSocket.prototype.raiseStreamFailure = function(openArgs, e) {
    var cb;
    cb = openArgs.getOnStreamFailure();
    if (cb) {
      return cb(new fm.websync.webSocketStreamFailureArgs(e));
    }
  };

  webSocket.prototype.raiseReceive = function(openArgs, e) {
    var cb;
    cb = openArgs.getOnReceive();
    if (cb) {
      return cb(new fm.websync.webSocketReceiveArgs(e));
    }
  };

  webSocket.prototype.raiseCloseComplete = function(closeArgs, e) {
    var cb;
    cb = closeArgs.getOnComplete();
    if (cb) {
      return cb(new fm.websync.webSocketCloseCompleteArgs(e));
    }
  };

  webSocket.prototype.raiseOnRequestCreated = function(requestArgs) {
    var args, cb;
    cb = this._onRequestCreated();
    if (cb) {
      args = new fm.httpRequestCreatedArgs();
      args.setRequestArgs(requestArgs);
      args.setSender(requestArgs.getSender());
      args.setRequest(null);
      return cb(args);
    }
  };

  webSocket.prototype.raiseOnResponseReceived = function(requestArgs) {
    var args, cb;
    cb = this._onResponseReceived();
    if (cb) {
      args = new fm.httpResponseReceivedArgs();
      args.setRequestArgs(requestArgs);
      args.setSender(requestArgs.getSender());
      args.setResponse(null);
      return cb(args);
    }
  };

  return webSocket;

})();


/**
@class fm.websync.connectRetryMode
 <div>
 Various behaviour modes for handling connect retries.
 </div>

@extends fm.enum
*/

fm.websync.connectRetryMode = {
  /**
  	@type {fm.websync.connectRetryMode}
  	@description  <div>
  	 Indicates that the client should automatically
  	 retry after a connect failure, even if the failure
  	 originates from a custom server-side event.
  	 </div>
  */

  Aggressive: 1,
  /**
  	@type {fm.websync.connectRetryMode}
  	@description  <div>
  	 Indicates that the client should automatically
  	 retry after a connect failure, unless the failure
  	 originates from a custom server-side event.
  	 </div>
  */

  Intelligent: 2,
  /**
  	@type {fm.websync.connectRetryMode}
  	@description  <div>
  	 Indicates that the client should not automatically
  	 retry after a connect failure.
  	 </div>
  */

  None: 3,
  /**
  	@type {fm.websync.connectRetryMode}
  	@description  <div>
  	 Same as <see cref="fm.websync.connectRetryMode.Intelligent">fm.websync.connectRetryMode.Intelligent</see>.
  	 </div>
  */

  Default: 2
};


/**
@class fm.websync.concurrencyMode
 <div>
 Various behaviour modes for the streaming connection.
 </div>

@extends fm.enum
*/

fm.websync.concurrencyMode = {
  /**
  	@type {fm.websync.concurrencyMode}
  	@description  <div>
  	 Indicates that the client will not be competing with
  	 many other clients within the same process.
  	 </div>
  */

  Low: 1,
  /**
  	@type {fm.websync.concurrencyMode}
  	@description  <div>
  	 Indicates that the client will have to compete with
  	 hundreds or thousands of other clients within the same
  	 process for processor time.
  	 </div>
  */

  High: 2,
  /**
  	@type {fm.websync.concurrencyMode}
  	@description  <div>
  	 Same as <see cref="fm.websync.concurrencyMode.Low">fm.websync.concurrencyMode.Low</see>.
  	 </div>
  */

  Default: 1
};


/**
@class fm.websync.reconnect
 <div>
 Allowed reconnect advice values for <see cref="fm.websync.message"> Messagesfm.websync.message</see>.
 </div>

@extends fm.enum
*/

fm.websync.reconnect = {
  /**
  	@type {fm.websync.reconnect}
  	@description  <div>
  	 Indicates that the client should retry its last request.
  	 </div>
  */

  Retry: 1,
  /**
  	@type {fm.websync.reconnect}
  	@description  <div>
  	 Indicates that the client should attempt to handshake.
  	 </div>
  */

  Handshake: 2,
  /**
  	@type {fm.websync.reconnect}
  	@description  <div>
  	 Indicates that the client should not attempt to reconnect.
  	 </div>
  */

  None: 3
};


/**
@class fm.websync.connectionType
 <div>
 Allowed connection type values for <see cref="fm.websync.message">Messagesfm.websync.message</see>.
 </div>

@extends fm.enum
*/

fm.websync.connectionType = {
  /**
  	@type {fm.websync.connectionType}
  	@description  <div>
  	 Indicates that the WebSocket connection type is supported.
  	 </div>
  */

  WebSocket: 1,
  /**
  	@type {fm.websync.connectionType}
  	@description  <div>
  	 Indicates that the long-polling connection type is supported.
  	 </div>
  */

  LongPolling: 2,
  /**
  	@type {fm.websync.connectionType}
  	@description  <div>
  	 Indicates that the callback-polling connection type is supported.
  	 </div>
  */

  CallbackPolling: 3,
  /**
  	@type {fm.websync.connectionType}
  	@description  <div>
  	 (Unsupported) Indicates that the iframe connection type is supported.
  	 </div>
  */

  IFrame: 4,
  /**
  	@type {fm.websync.connectionType}
  	@description  <div>
  	 (Unsupported) Indicates that the flash connection type is supported.
  	 </div>
  */

  Flash: 5
};


/**
@class fm.websync.messageType
 <div>
 Possible message types for <see cref="fm.websync.message">Messagesfm.websync.message</see>.
 </div>

@extends fm.enum
*/

fm.websync.messageType = {
  /**
  	@type {fm.websync.messageType}
  	@description  <div>
  	 Message is a connect request/response.
  	 </div>
  */

  Connect: 1,
  /**
  	@type {fm.websync.messageType}
  	@description  <div>
  	 Message is a disconnect request/response.
  	 </div>
  */

  Disconnect: 2,
  /**
  	@type {fm.websync.messageType}
  	@description  <div>
  	 Messages is a bind request/response.
  	 </div>
  */

  Bind: 3,
  /**
  	@type {fm.websync.messageType}
  	@description  <div>
  	 Messages is an unbind request/response.
  	 </div>
  */

  Unbind: 4,
  /**
  	@type {fm.websync.messageType}
  	@description  <div>
  	 Message is a subscribe request/response.
  	 </div>
  */

  Subscribe: 5,
  /**
  	@type {fm.websync.messageType}
  	@description  <div>
  	 Message is an unsubscribe request/response.
  	 </div>
  */

  Unsubscribe: 6,
  /**
  	@type {fm.websync.messageType}
  	@description  <div>
  	 Message is a publish request/response.
  	 </div>
  */

  Publish: 7,
  /**
  	@type {fm.websync.messageType}
  	@description  <div>
  	 Message is a notify request/response.
  	 </div>
  */

  Notify: 8,
  /**
  	@type {fm.websync.messageType}
  	@description  <div>
  	 Message is a service request/response.
  	 </div>
  */

  Service: 9,
  /**
  	@type {fm.websync.messageType}
  	@description  <div>
  	 Message is a stream request/response.
  	 </div>
  */

  Stream: 10,
  /**
  	@type {fm.websync.messageType}
  	@description  <div>
  	 Message is an unknown request/response.
  	 </div>
  */

  Unknown: 11
};


/**
@class fm.websync.webSocketStatusCode
 <div>
 An enumeration of potential WebSocket status codes.
 </div>

@extends fm.enum
*/

fm.websync.webSocketStatusCode = {
  /**
  	@type {fm.websync.webSocketStatusCode}
  	@description  <div>
  	 Indicates normal closure, meaning that the purpose for which
  	 the connection was established has been fulfilled.
  	 </div>
  */

  Normal: 1000,
  /**
  	@type {fm.websync.webSocketStatusCode}
  	@description  <div>
  	 Indicates that an endpoint is "going away", such as a server
  	 going down or a browser having navigated away from a page.
  	 </div>
  */

  GoingAway: 1001,
  /**
  	@type {fm.websync.webSocketStatusCode}
  	@description  <div>
  	 Indicates that an endpoint is terminating the connection
  	 due to a protocol error.
  	 </div>
  */

  ProtocolError: 1002,
  /**
  	@type {fm.websync.webSocketStatusCode}
  	@description  <div>
  	 Indicates that an endpoint is terminating the connection
  	 because it has received a type of data that it cannot accept.
  	 </div>
  */

  InvalidType: 1003,
  /**
  	@type {fm.websync.webSocketStatusCode}
  	@description  <div>
  	 Indicates that no status code was present in the Close frame.
  	 Reserved for use outside Close frames.
  	 </div>
  */

  NoStatus: 1005,
  /**
  	@type {fm.websync.webSocketStatusCode}
  	@description  <div>
  	 Indicates that the connection was closed abnormally, without
  	 sending a Close frame. Reserved for use outside Close frames.
  	 </div>
  */

  Abnormal: 1006,
  /**
  	@type {fm.websync.webSocketStatusCode}
  	@description  <div>
  	 Indicates that an endpoint is terminating the connection
  	 because it has received data within a message that was not
  	 consistent with the type of message.
  	 </div>
  */

  InvalidData: 1007,
  /**
  	@type {fm.websync.webSocketStatusCode}
  	@description  <div>
  	 Indicates that an endpoint is terminating the connection
  	 because it has received a message that violates its policy.
  	 </div>
  */

  PolicyViolation: 1008,
  /**
  	@type {fm.websync.webSocketStatusCode}
  	@description  <div>
  	 Indicates that an endpoint is terminating the connection
  	 because it has received a message that is too big for it
  	 to process.
  	 </div>
  */

  MessageTooLarge: 1009,
  /**
  	@type {fm.websync.webSocketStatusCode}
  	@description  <div>
  	 Indicates that the client is terminating the connection
  	 because it has expected the server to negotiate one or
  	 more extensions, but the server didn't return them in the
  	 response message of the WebSocket handshake.
  	 </div>
  */

  UnsupportedExtension: 1010,
  /**
  	@type {fm.websync.webSocketStatusCode}
  	@description  <div>
  	 Indicates that the server is terminating the connection
  	 because it encountered an unexpected condition that
  	 prevented it from fulfilling the request.
  	 </div>
  */

  UnexpectedCondition: 1011,
  /**
  	@type {fm.websync.webSocketStatusCode}
  	@description  <div>
  	 Indicates that the connection was closed due to a failure
  	 to perform a TLS handshake. Reserved for use outside Close
  	 frames.
  	 </div>
  */

  SecureHandshakeFailure: 1015
};


/**
@class fm.websync.backoffArgs
 <div>
 Arguments used for <see cref="fm.websync.connectArgs.retryBackoff">fm.websync.connectArgs.retryBackoff</see></div>

@extends fm.object
*/


fm.websync.backoffArgs = (function(_super) {

  __extends(backoffArgs, _super);

  /**
  	@ignore 
  	@description
  */


  backoffArgs.prototype._index = 0;

  /**
  	@ignore 
  	@description
  */


  backoffArgs.prototype._lastTimeout = 0;

  /**
  	@ignore 
  	@description
  */


  function backoffArgs() {
    this.setLastTimeout = __bind(this.setLastTimeout, this);

    this.setIndex = __bind(this.setIndex, this);

    this.getLastTimeout = __bind(this.getLastTimeout, this);

    this.getIndex = __bind(this.getIndex, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      backoffArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    backoffArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the current backoff index. Starts at <c>0</c> and
  	 increments by <c>1</c> for each backoff attempt.
  	 </div>
  
  	@function getIndex
  	@return {fm.int}
  */


  backoffArgs.prototype.getIndex = function() {
    return this._index;
  };

  /**
  	 <div>
  	 Gets last timeout value used.
  	 </div>
  
  	@function getLastTimeout
  	@return {fm.int}
  */


  backoffArgs.prototype.getLastTimeout = function() {
    return this._lastTimeout;
  };

  /**
  	 <div>
  	 Sets the current backoff index. Starts at <c>0</c> and
  	 increments by <c>1</c> for each backoff attempt.
  	 </div>
  
  	@function setIndex
  	@param {fm.int} value
  	@return {void}
  */


  backoffArgs.prototype.setIndex = function() {
    var value;
    value = arguments[0];
    return this._index = value;
  };

  /**
  	 <div>
  	 Sets last timeout value used.
  	 </div>
  
  	@function setLastTimeout
  	@param {fm.int} value
  	@return {void}
  */


  backoffArgs.prototype.setLastTimeout = function() {
    var value;
    value = arguments[0];
    return this._lastTimeout = value;
  };

  return backoffArgs;

})(fm.object);


/**
@class fm.websync.extensible
 <div>
 <p>
 Base class that defines the properties and methods shared by any class that
 is considered extensible by the Bayeux specification.
 </p>
 <p>
 The Bayeux specification defines the Ext field, which allows custom data to be
 stored with a message using a namespaced key to access the information. This class
 provides methods that store and retrieve JSON data stored in this manner. For example,
 the <see cref="fm.websync.extensible.metaJson">fm.websync.extensible.metaJson</see> property uses the Ext field to store its value
 using "fm.meta" as a key.
 </p>
 <p>
 In addition, classes which inherit from <see cref="fm.websync.extensible">fm.websync.extensible</see> can store
 dynamic property values for local read/write access without the need to serialize
 to JSON. This can aid greatly in the
 development of third-party extensions to WebSync. Custom information can be stored
 with method arguments in the "before" event and read out again for further
 processing in the "after" event.
 </p>
 </div>

@extends fm.dynamic
*/


fm.websync.extensible = (function(_super) {

  __extends(extensible, _super);

  /**
  	@ignore 
  	@description
  */


  extensible.prototype.__extensions = null;

  /**
  	@ignore 
  	@description  <div>
  	 The reserved extension name for acknowledgement of received messages.
  	 </div>
  */


  extensible._acknowledgementExtensionName = "fm.ack";

  /**
  	@ignore 
  	@description  <div>
  	 The reserved extension name for disabling the transmission of binary data as binary.
  	 </div>
  */


  extensible._disableBinaryExtensionName = "fm.dbin";

  /**
  	@ignore 
  	@description  <div>
  	 The reserved extension name for enhanced cleanup of old client IDs.
  	 </div>
  */


  extensible._lastClientIdExtensionName = "fm.lcid";

  /**
  	@ignore 
  	@description  <div>
  	 The reserved extension name for enhanced cleanup of old session IDs.
  	 </div>
  */


  extensible._lastSessionIdExtensionName = "fm.lsid";

  /**
  	@ignore 
  	@description  <div>
  	 The reserved extension name for message/publication meta-data.
  	 </div>
  */


  extensible._metaExtensionName = "fm.meta";

  /**
  	@ignore 
  	@description  <div>
  	 The reserved extension name for the client ID targeted by a notification.
  	 </div>
  */


  extensible._notifyClientIdExtensionName = "fm.notify";

  /**
  	@ignore 
  	@description  <div>
  	 The reserved extension name for records bound to notifying clients.
  	 </div>
  */


  extensible._notifyingClientExtensionName = "fm.notifying";

  /**
  	@ignore 
  	@description  <div>
  	 The reserved extension name for records bound to publishing clients.
  	 </div>
  */


  extensible._publishingClientExtensionName = "fm.publishing";

  /**
  	@ignore 
  	@description  <div>
  	 The reserved extension name for passing back server actions to a client.
  	 </div>
  */


  extensible._serverActionsExtensionName = "fm.server";

  /**
  	@ignore 
  	@description  <div>
  	 The reserved extension name for the server-defined timeout interval.
  	 </div>
  */


  extensible._serverTimeoutExtensionName = "fm.timeout";

  /**
  	@ignore 
  	@description  <div>
  	 The reserved extension name for the secure session ID.
  	 </div>
  */


  extensible._sessionIdExtensionName = "fm.sessionId";

  /**
  	@ignore 
  	@description  <div>
  	 The reserved extension name for tags.
  	 </div>
  */


  extensible._tagExtensionName = "fm.tag";

  /**
  	@ignore 
  	@description
  */


  function extensible() {
    this.setMeta = __bind(this.setMeta, this);

    this.setExtensionValue = __bind(this.setExtensionValue, this);

    this.getMeta = __bind(this.getMeta, this);

    this.getExtensionValue = __bind(this.getExtensionValue, this);

    this.setMetaJson = __bind(this.setMetaJson, this);

    this.setExtensionValueJson = __bind(this.setExtensionValueJson, this);

    this.setExtensions = __bind(this.setExtensions, this);

    this.getMetaJson = __bind(this.getMetaJson, this);

    this.getExtensionValueJson = __bind(this.getExtensionValueJson, this);

    this.getExtensions = __bind(this.getExtensions, this);

    this.getExtensionNames = __bind(this.getExtensionNames, this);

    this.getExtensionCount = __bind(this.getExtensionCount, this);

    this.copyExtensions = __bind(this.copyExtensions, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      extensible.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    extensible.__super__.constructor.call(this);
  }

  /**
  
  	@function convertKeyToRecord
  	@param {fm.string} key
  	@return {fm.websync.record}
  */


  extensible.convertKeyToRecord = function() {
    var key;
    key = arguments[0];
    return new fm.websync.record(key);
  };

  /**
  
  	@function convertRecordToKey
  	@param {fm.websync.record} record
  	@return {fm.string}
  */


  extensible.convertRecordToKey = function() {
    var record;
    record = arguments[0];
    return record.getKey();
  };

  /**
  	 <div>
  	 Gets the first channel from an array of channels.
  	 </div><param name="channels">The channels to scan.</param><returns>The first channel.</returns>
  
  	@function sharedGetChannel
  	@param {fm.array} channels
  	@return {fm.string}
  */


  extensible.sharedGetChannel = function() {
    var channels, _var0;
    channels = arguments[0];
    _var0 = channels;
    if ((_var0 === null || typeof _var0 === 'undefined') || (channels.length === 0)) {
      return null;
    }
    return channels[0];
  };

  /**
  	 <div>
  	 Converts an array of channels to itself.
  	 </div><param name="channels">The array of channels.</param><returns>The array of channels.</returns>
  
  	@function sharedGetChannels
  	@param {fm.array} channels
  	@return {fm.array}
  */


  extensible.sharedGetChannels = function() {
    var channels;
    channels = arguments[0];
    return channels;
  };

  /**
  	 <div>
  	 Gets the first key from an array of records.
  	 </div><param name="records">The records to scan.</param><returns>The first key.</returns>
  
  	@function sharedGetKey
  	@param {fm.array} records
  	@return {fm.string}
  */


  extensible.sharedGetKey = function() {
    var record, records, _var0;
    records = arguments[0];
    record = fm.websync.extensible.sharedGetRecord(records);
    _var0 = record;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return null;
    }
    return fm.websync.extensible.convertRecordToKey(record);
  };

  /**
  	 <div>
  	 Converts an array of records to an array of keys.
  	 </div><param name="records">The array of records.</param><returns>The array of keys.</returns>
  
  	@function sharedGetKeys
  	@param {fm.array} records
  	@return {fm.array}
  */


  extensible.sharedGetKeys = function() {
    var list, record, records, _i, _len, _var0, _var1;
    records = arguments[0];
    records = fm.websync.extensible.sharedGetRecords(records);
    _var0 = records;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return null;
    }
    list = [];
    _var1 = records;
    for (_i = 0, _len = _var1.length; _i < _len; _i++) {
      record = _var1[_i];
      fm.arrayExtensions.add(list, fm.websync.extensible.convertRecordToKey(record));
    }
    return fm.arrayExtensions.toArray(list);
  };

  /**
  	 <div>
  	 Gets the first record from an array of records.
  	 </div><param name="records">The records to scan.</param><returns>The first record.</returns>
  
  	@function sharedGetRecord
  	@param {fm.array} records
  	@return {fm.websync.record}
  */


  extensible.sharedGetRecord = function() {
    var records, _var0;
    records = arguments[0];
    _var0 = records;
    if ((_var0 === null || typeof _var0 === 'undefined') || (records.length === 0)) {
      return null;
    }
    return records[0];
  };

  /**
  	 <div>
  	 Converts an array of records to itself.
  	 </div><param name="records">The array of records.</param><returns>The array of records.</returns>
  
  	@function sharedGetRecords
  	@param {fm.array} records
  	@return {fm.array}
  */


  extensible.sharedGetRecords = function() {
    var records;
    records = arguments[0];
    return records;
  };

  /**
  	 <div>
  	 Converts a channel to a validated channel array.
  	 </div><param name="channel">The channel to convert.</param><param name="validate">Whether or not to validate the channel.</param><returns>The validated channel array.</returns>
  
  	@function sharedSetChannel
  	@param {fm.string} channel
  	@param {fm.boolean} validate
  	@return {fm.array}
  */


  extensible.sharedSetChannel = function() {
    var channel, error, validate, _var0, _var1, _var2;
    if (arguments.length === 2) {
      channel = arguments[0];
      validate = arguments[1];
      _var0 = channel;
      if (_var0 === null || typeof _var0 === 'undefined') {
        return null;
      }
      error = null;
      _var1 = new fm.holder(error);
      _var2 = fm.websync.extensible.validateChannel(channel, _var1);
      error = _var1.getValue();
      if (!(!validate || _var2)) {
        throw new Error(fm.stringExtensions.format("Invalid channel. {0}", error));
      }
      return [channel];
      return;
    }
    if (arguments.length === 1) {
      channel = arguments[0];
      return fm.websync.extensible.sharedSetChannel(channel, true);
    }
  };

  /**
  	 <div>
  	 Converts an array of channels to an array of validated channels.
  	 </div><param name="channels">The array of channels.</param><param name="validate">Whether or not to validate the channels.</param><returns>The array of validated channels.</returns>
  
  	@function sharedSetChannels
  	@param {fm.array} channels
  	@param {fm.boolean} validate
  	@return {fm.array}
  */


  extensible.sharedSetChannels = function() {
    var channels, error, str, validate, _i, _len, _var0, _var1, _var2, _var3;
    if (arguments.length === 2) {
      channels = arguments[0];
      validate = arguments[1];
      _var0 = channels;
      if (_var0 !== null && typeof _var0 !== 'undefined') {
        _var1 = channels;
        for (_i = 0, _len = _var1.length; _i < _len; _i++) {
          str = _var1[_i];
          error = null;
          _var2 = new fm.holder(error);
          _var3 = fm.websync.extensible.validateChannel(str, _var2);
          error = _var2.getValue();
          if (!(!validate || _var3)) {
            throw new Error(fm.stringExtensions.format("Invalid channel. {0}", error));
          }
        }
      }
      return channels;
      return;
    }
    if (arguments.length === 1) {
      channels = arguments[0];
      return fm.websync.extensible.sharedSetChannels(channels, true);
    }
  };

  /**
  	 <div>
  	 Converts a key to a validated record array.
  	 </div><param name="key">The key to convert.</param><param name="validate">Whether or not to validate the record.</param><returns>The validated record array.</returns>
  
  	@function sharedSetKey
  	@param {fm.string} key
  	@param {fm.boolean} validate
  	@return {fm.array}
  */


  extensible.sharedSetKey = function() {
    var error, key, record, validate, _var0, _var1, _var2;
    if (arguments.length === 2) {
      key = arguments[0];
      validate = arguments[1];
      _var0 = key;
      if (_var0 === null || typeof _var0 === 'undefined') {
        return null;
      }
      record = fm.websync.extensible.convertKeyToRecord(key);
      error = null;
      _var1 = new fm.holder(error);
      _var2 = fm.websync.extensible.validateRecord(record, _var1);
      error = _var1.getValue();
      if (!(!validate || _var2)) {
        throw new Error(fm.stringExtensions.format("Invalid record. {0}", error));
      }
      return [record];
      return;
    }
    if (arguments.length === 1) {
      key = arguments[0];
      return fm.websync.extensible.sharedSetKey(key, true);
    }
  };

  /**
  	 <div>
  	 Converts an array of keys to an array of validated records.
  	 </div><param name="keys">The array of keys.</param><param name="validate">Whether or not to validate the records.</param><returns>The array of records.</returns>
  
  	@function sharedSetKeys
  	@param {fm.array} keys
  	@param {fm.boolean} validate
  	@return {fm.array}
  */


  extensible.sharedSetKeys = function() {
    var error, keys, list, record, str, validate, _i, _len, _var0, _var1, _var2, _var3;
    if (arguments.length === 1) {
      keys = arguments[0];
      return fm.websync.extensible.sharedSetKeys(keys, true);
      return;
    }
    if (arguments.length === 2) {
      keys = arguments[0];
      validate = arguments[1];
      _var0 = keys;
      if (_var0 === null || typeof _var0 === 'undefined') {
        return null;
      }
      list = [];
      _var1 = keys;
      for (_i = 0, _len = _var1.length; _i < _len; _i++) {
        str = _var1[_i];
        record = fm.websync.extensible.convertKeyToRecord(str);
        error = null;
        _var2 = new fm.holder(error);
        _var3 = fm.websync.extensible.validateRecord(record, _var2);
        error = _var2.getValue();
        if (!(!validate || _var3)) {
          throw new Error(fm.stringExtensions.format("Invalid record. {0}", error));
        }
        fm.arrayExtensions.add(list, record);
      }
      return fm.arrayExtensions.toArray(list);
    }
  };

  /**
  	 <div>
  	 Converts a record to a validated record array.
  	 </div><param name="record">The record to convert.</param><param name="validate">Whether or not to validate the record.</param><returns>The validated record array.</returns>
  
  	@function sharedSetRecord
  	@param {fm.websync.record} record
  	@param {fm.boolean} validate
  	@return {fm.array}
  */


  extensible.sharedSetRecord = function() {
    var error, record, validate, _var0, _var1;
    if (arguments.length === 2) {
      record = arguments[0];
      validate = arguments[1];
      error = null;
      _var0 = new fm.holder(error);
      _var1 = fm.websync.extensible.validateRecord(record, _var0);
      error = _var0.getValue();
      if (!(!validate || _var1)) {
        throw new Error(fm.stringExtensions.format("Invalid record. {0}", error));
      }
      return [record];
      return;
    }
    if (arguments.length === 1) {
      record = arguments[0];
      return fm.websync.extensible.sharedSetRecord(record, true);
    }
  };

  /**
  	 <div>
  	 Converts an array of records to an array of validated records.
  	 </div><param name="records">The array of records.</param><param name="validate">Whether or not to validate the records.</param><returns>The array of validated records.</returns>
  
  	@function sharedSetRecords
  	@param {fm.array} records
  	@param {fm.boolean} validate
  	@return {fm.array}
  */


  extensible.sharedSetRecords = function() {
    var error, record, records, validate, _i, _len, _var0, _var1, _var2, _var3;
    if (arguments.length === 2) {
      records = arguments[0];
      validate = arguments[1];
      _var0 = records;
      if (_var0 !== null && typeof _var0 !== 'undefined') {
        _var1 = records;
        for (_i = 0, _len = _var1.length; _i < _len; _i++) {
          record = _var1[_i];
          error = null;
          _var2 = new fm.holder(error);
          _var3 = fm.websync.extensible.validateRecord(record, _var2);
          error = _var2.getValue();
          if (!(!validate || _var3)) {
            throw new Error(fm.stringExtensions.format("Invalid record. {0}", error));
          }
        }
      }
      return records;
      return;
    }
    if (arguments.length === 1) {
      records = arguments[0];
      return fm.websync.extensible.sharedSetRecords(records, true);
    }
  };

  /**
  	 <div>
  	 Validates a channel.
  	 </div><param name="channel">The channel to validate.</param><param name="error">The error, if validation failed.</param><returns>
  	 <c>true</c> if validation succeeded; otherwise <c>false</c>.</returns>
  
  	@function validateChannel
  	@param {fm.string} channel
  	@param {fm.holder} error
  	@return {fm.boolean}
  */


  extensible.validateChannel = function() {
    var channel, error, _var0;
    channel = arguments[0];
    error = arguments[1];
    _var0 = channel;
    if (_var0 === null || typeof _var0 === 'undefined') {
      error.setValue("Channel is null.");
      return false;
    }
    if (!fm.stringExtensions.startsWith(channel, "/", fm.stringComparison.Ordinal)) {
      error.setValue("Channel must start with a forward-slash (/).");
      return false;
    }
    if (fm.stringExtensions.indexOf(channel, "*", fm.stringComparison.Ordinal) >= 0) {
      error.setValue("Channel may not contain asterisks (*).");
      return false;
    }
    if (fm.websync.metaChannels.isReservedChannel(channel)) {
      error.setValue("Channel is reserved.");
      return false;
    }
    error.setValue(null);
    return true;
  };

  /**
  	 <div>
  	 Validates a record.
  	 </div><param name="record">The record to validate.</param><param name="error">The error, if validation failed.</param><returns>
  	 <c>true</c> if validation succeeded; otherwise <c>false</c>.</returns>
  
  	@function validateRecord
  	@param {fm.websync.record} record
  	@param {fm.holder} error
  	@return {fm.boolean}
  */


  extensible.validateRecord = function() {
    var error, record, _var0;
    record = arguments[0];
    error = arguments[1];
    _var0 = record;
    if (_var0 === null || typeof _var0 === 'undefined') {
      error.setValue("Record is null.");
      return false;
    }
    if (fm.stringExtensions.isNullOrEmpty(record.getKey())) {
      error.setValue("Key is null or empty.");
      return false;
    }
    error.setValue(null);
    return true;
  };

  /**
  	 <div>
  	 Copies extension values from one instance into this instance.
  	 </div><param name="extensible">The object with the extensions to copy.</param><returns>This instance.</returns>
  
  	@function copyExtensions
  	@param {fm.websync.extensible} extensible
  	@return {void}
  */


  extensible.prototype.copyExtensions = function() {
    var extensible, str, _i, _len, _results, _var0;
    extensible = arguments[0];
    _var0 = extensible.getExtensionNames();
    _results = [];
    for (_i = 0, _len = _var0.length; _i < _len; _i++) {
      str = _var0[_i];
      _results.push(this.setExtensionValueJson(str, extensible.getExtensionValueJson(str), false));
    }
    return _results;
  };

  /**
  	 <div>
  	 Gets the number of extensions stored with this instance.
  	 </div>
  
  	@function getExtensionCount
  	@return {fm.int}
  */


  extensible.prototype.getExtensionCount = function() {
    return this.getExtensions().getCount();
  };

  /**
  	 <div>
  	 Gets the names of the extensions stored with this instance.
  	 </div>
  
  	@function getExtensionNames
  	@return {fm.array}
  */


  extensible.prototype.getExtensionNames = function() {
    return this.getExtensions().getNames();
  };

  /**
  	 <div>
  	 Gets the internal extensions collection.
  	 </div>
  
  	@function getExtensions
  	@return {fm.websync.extensions}
  */


  extensible.prototype.getExtensions = function() {
    var _var0;
    _var0 = this.__extensions;
    if (_var0 === null || typeof _var0 === 'undefined') {
      this.__extensions = new fm.websync.extensions();
    }
    return this.__extensions;
  };

  /**
  	 <div>
  	 Gets a serialized value stored in the extensions.
  	 </div><param name="name">Fully-qualified extension name.</param><returns>The extension value in JSON format.</returns>
  
  	@function getExtensionValueJson
  	@param {fm.string} name
  	@return {fm.string}
  */


  extensible.prototype.getExtensionValueJson = function() {
    var name;
    name = arguments[0];
    return this.getExtensions().getValueJson(name);
  };

  /**
  	 <div>
  	 Gets meta-data associated with the message/publication.  Must be valid JSON.
  	 </div><div>
  	 Use this property to define meta-data about the request itself, such as
  	 authentication details, etc.
  	 </div>
  
  	@function getMetaJson
  	@return {fm.string}
  */


  extensible.prototype.getMetaJson = function() {
    return this.getExtensionValueJson("fm.meta");
  };

  /**
  	 <div>
  	 Sets the internal extensions collection.
  	 </div>
  
  	@function setExtensions
  	@param {fm.websync.extensions} value
  	@return {void}
  */


  extensible.prototype.setExtensions = function() {
    var value, _var0;
    value = arguments[0];
    _var0 = value;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return this.__extensions = new fm.websync.extensions();
    } else {
      return this.__extensions = value;
    }
  };

  /**
  	 <div>
  	 Stores a serialized value in the extensions.  Must be valid JSON.
  	 </div><param name="name">Fully-qualified extension name.</param><param name="valueJson">The extension value in valid JSON format.</param><param name="validate">Whether or not to validate the JSON value.</param>
  
  	@function setExtensionValueJson
  	@param {fm.string} name
  	@param {fm.string} valueJson
  	@param {fm.boolean} validate
  	@return {void}
  */


  extensible.prototype.setExtensionValueJson = function() {
    var name, validate, valueJson;
    if (arguments.length === 3) {
      name = arguments[0];
      valueJson = arguments[1];
      validate = arguments[2];
      this.getExtensions().setValueJson(name, valueJson, validate);
      return;
    }
    if (arguments.length === 2) {
      name = arguments[0];
      valueJson = arguments[1];
      this.getExtensions().setValueJson(name, valueJson);
    }
  };

  /**
  	 <div>
  	 Sets meta-data associated with the message/publication.  Must be valid JSON.
  	 </div><div>
  	 Use this property to define meta-data about the request itself, such as
  	 authentication details, etc.
  	 </div>
  
  	@function setMetaJson
  	@param {fm.string} value
  	@return {void}
  */


  extensible.prototype.setMetaJson = function() {
    var value;
    value = arguments[0];
    return this.setExtensionValueJson("fm.meta", value);
  };

  /**
  
  	@function getExtensionValue
  	@param {fm.string} name
  	@return {fm.hash}
  */


  extensible.prototype.getExtensionValue = function() {
    var name;
    name = arguments[0];
    return fm.json.deserialize(this.getExtensionValueJson.apply(this, arguments));
  };

  /**
  
  	@function getMeta
  	@return {fm.hash}
  */


  extensible.prototype.getMeta = function() {
    return fm.json.deserialize(this.getMetaJson.apply(this, arguments));
  };

  /**
  
  	@function setExtensionValue
  	@param {fm.string} name
  	@param {fm.string} valueJson
  	@param {fm.hash} extensionValue
  	@return {}
  */


  extensible.prototype.setExtensionValue = function() {
    var extensionValue, name, valueJson;
    if (arguments.length === 3) {
      name = arguments[0];
      valueJson = arguments[1];
      extensionValue = arguments[2];
      arguments[arguments.length - 1] = fm.json.serialize(arguments[arguments.length - 1]);
      this.setExtensionValueJson.apply(this, arguments);
      return;
    }
    if (arguments.length === 2) {
      name = arguments[0];
      extensionValue = arguments[1];
      arguments[arguments.length - 1] = fm.json.serialize(arguments[arguments.length - 1]);
      this.setExtensionValueJson.apply(this, arguments);
    }
  };

  /**
  
  	@function setMeta
  	@param {fm.hash} meta
  	@return {}
  */


  extensible.prototype.setMeta = function() {
    var meta;
    meta = arguments[0];
    arguments[arguments.length - 1] = fm.json.serialize(arguments[arguments.length - 1]);
    return this.setMetaJson.apply(this, arguments);
  };

  return extensible;

}).call(this, fm.dynamic);


/**
@class fm.websync.baseInputArgs
 <div>
 Base input arguments for WebSync <see cref="fm.websync.client">fm.websync.client</see> methods.
 </div>

@extends fm.websync.extensible
*/


fm.websync.baseInputArgs = (function(_super) {

  __extends(baseInputArgs, _super);

  /**
  	@ignore 
  	@description
  */


  baseInputArgs.prototype._isRetry = false;

  /**
  	@ignore 
  	@description
  */


  baseInputArgs.prototype._requestUrl = null;

  /**
  	@ignore 
  	@description
  */


  baseInputArgs.prototype._synchronous = null;

  /**
  	@ignore 
  	@description
  */


  function baseInputArgs() {
    this.setSynchronous = __bind(this.setSynchronous, this);

    this.setRequestUrl = __bind(this.setRequestUrl, this);

    this.setIsRetry = __bind(this.setIsRetry, this);

    this.getSynchronous = __bind(this.getSynchronous, this);

    this.getRequestUrl = __bind(this.getRequestUrl, this);

    this.getIsRetry = __bind(this.getIsRetry, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      baseInputArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    baseInputArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets whether this method call is a retry following a failure.
  	 </div>
  
  	@function getIsRetry
  	@return {fm.boolean}
  */


  baseInputArgs.prototype.getIsRetry = function() {
    return this._isRetry;
  };

  /**
  	 <div>
  	 Gets the absolute URL of the WebSync request handler, typically
  	 ending with websync.ashx, to use for this request. Overrides the
  	 client-level setting. This request will be sent using the
  	 <see cref="fm.websync.client.StreamRequestTransfer">fm.websync.client.StreamRequestTransfer</see> class (especially relevant if
  	 WebSockets are in use).
  	 </div>
  
  	@function getRequestUrl
  	@return {fm.string}
  */


  baseInputArgs.prototype.getRequestUrl = function() {
    return this._requestUrl;
  };

  /**
  	 <div>
  	 Gets whether the request should be executed asynchronously.
  	 If <c>true</c>, the request will be executed synchronously.
  	 If <c>false</c>, the request will be executed asynchronously.
  	 If <c>null</c>, the request will be executed synchronously or asynchronously,
  	 depending on the value of <see cref="fm.websync.client.synchronous">fm.websync.client.synchronous</see>.
  	 Defaults to <c>null</c>.
  	 </div>
  
  	@function getSynchronous
  	@return {fm.nullable}
  */


  baseInputArgs.prototype.getSynchronous = function() {
    return this._synchronous;
  };

  /**
  	 <div>
  	 Sets whether this method call is a retry following a failure.
  	 </div>
  
  	@function setIsRetry
  	@param {fm.boolean} value
  	@return {void}
  */


  baseInputArgs.prototype.setIsRetry = function() {
    var value;
    value = arguments[0];
    return this._isRetry = value;
  };

  /**
  	 <div>
  	 Sets the absolute URL of the WebSync request handler, typically
  	 ending with websync.ashx, to use for this request. Overrides the
  	 client-level setting. This request will be sent using the
  	 <see cref="fm.websync.client.StreamRequestTransfer">fm.websync.client.StreamRequestTransfer</see> class (especially relevant if
  	 WebSockets are in use).
  	 </div>
  
  	@function setRequestUrl
  	@param {fm.string} value
  	@return {void}
  */


  baseInputArgs.prototype.setRequestUrl = function() {
    var value;
    value = arguments[0];
    return this._requestUrl = value;
  };

  /**
  	 <div>
  	 Sets whether the request should be executed asynchronously.
  	 If <c>true</c>, the request will be executed synchronously.
  	 If <c>false</c>, the request will be executed asynchronously.
  	 If <c>null</c>, the request will be executed synchronously or asynchronously,
  	 depending on the value of <see cref="fm.websync.client.synchronous">fm.websync.client.synchronous</see>.
  	 Defaults to <c>null</c>.
  	 </div>
  
  	@function setSynchronous
  	@param {fm.nullable} value
  	@return {void}
  */


  baseInputArgs.prototype.setSynchronous = function() {
    var value;
    value = arguments[0];
    return this._synchronous = value;
  };

  return baseInputArgs;

})(fm.websync.extensible);


/**
@class fm.websync.baseInputArgsGeneric
 <div>
 Generic ase input arguments for WebSync <see cref="fm.websync.baseClient">fm.websync.baseClient</see> methods.
 </div>

@extends fm.websync.baseInputArgs
*/


fm.websync.baseInputArgsGeneric = (function(_super) {

  __extends(baseInputArgsGeneric, _super);

  /**
  	@ignore 
  	@description
  */


  baseInputArgsGeneric.prototype._onComplete = null;

  /**
  	@ignore 
  	@description
  */


  baseInputArgsGeneric.prototype._onFailure = null;

  /**
  	@ignore 
  	@description
  */


  baseInputArgsGeneric.prototype._onSuccess = null;

  /**
  	@ignore 
  	@description
  */


  function baseInputArgsGeneric() {
    this.setOnSuccess = __bind(this.setOnSuccess, this);

    this.setOnFailure = __bind(this.setOnFailure, this);

    this.setOnComplete = __bind(this.setOnComplete, this);

    this.getOnSuccess = __bind(this.getOnSuccess, this);

    this.getOnFailure = __bind(this.getOnFailure, this);

    this.getOnComplete = __bind(this.getOnComplete, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      baseInputArgsGeneric.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    baseInputArgsGeneric.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the callback to invoke after <see cref="fm.websync.baseInputArgsGeneric`3.onSuccess">fm.websync.baseInputArgsGeneric`3.onSuccess</see> or <see cref="fm.websync.baseInputArgsGeneric`3.onFailure">fm.websync.baseInputArgsGeneric`3.onFailure</see>.
  	 </div>
  
  	@function getOnComplete
  	@return {fm.singleAction}
  */


  baseInputArgsGeneric.prototype.getOnComplete = function() {
    return this._onComplete;
  };

  /**
  	 <div>
  	 Gets the callback to invoke if the request fails.
  	 </div>
  
  	@function getOnFailure
  	@return {fm.singleAction}
  */


  baseInputArgsGeneric.prototype.getOnFailure = function() {
    return this._onFailure;
  };

  /**
  	 <div>
  	 Gets the callback to invoke if the request succeeds.
  	 </div>
  
  	@function getOnSuccess
  	@return {fm.singleAction}
  */


  baseInputArgsGeneric.prototype.getOnSuccess = function() {
    return this._onSuccess;
  };

  /**
  	 <div>
  	 Sets the callback to invoke after <see cref="fm.websync.baseInputArgsGeneric`3.onSuccess">fm.websync.baseInputArgsGeneric`3.onSuccess</see> or <see cref="fm.websync.baseInputArgsGeneric`3.onFailure">fm.websync.baseInputArgsGeneric`3.onFailure</see>.
  	 </div>
  
  	@function setOnComplete
  	@param {fm.singleAction} value
  	@return {void}
  */


  baseInputArgsGeneric.prototype.setOnComplete = function() {
    var value;
    value = arguments[0];
    return this._onComplete = value;
  };

  /**
  	 <div>
  	 Sets the callback to invoke if the request fails.
  	 </div>
  
  	@function setOnFailure
  	@param {fm.singleAction} value
  	@return {void}
  */


  baseInputArgsGeneric.prototype.setOnFailure = function() {
    var value;
    value = arguments[0];
    return this._onFailure = value;
  };

  /**
  	 <div>
  	 Sets the callback to invoke if the request succeeds.
  	 </div>
  
  	@function setOnSuccess
  	@param {fm.singleAction} value
  	@return {void}
  */


  baseInputArgsGeneric.prototype.setOnSuccess = function() {
    var value;
    value = arguments[0];
    return this._onSuccess = value;
  };

  return baseInputArgsGeneric;

})(fm.websync.baseInputArgs);


/**
@class fm.websync.baseOutputArgs
 <div>
 Base output arguments for WebSync <see cref="fm.websync.baseOutputArgs.client">fm.websync.baseOutputArgs.client</see> methods.
 </div>

@extends fm.websync.extensible
*/


fm.websync.baseOutputArgs = (function(_super) {

  __extends(baseOutputArgs, _super);

  /**
  	@ignore 
  	@description
  */


  baseOutputArgs.prototype.__timestamp = null;

  /**
  	@ignore 
  	@description
  */


  baseOutputArgs.prototype._client = null;

  /**
  	@ignore 
  	@description
  */


  function baseOutputArgs() {
    this.setTimestamp = __bind(this.setTimestamp, this);

    this.setClient = __bind(this.setClient, this);

    this.getTimestamp = __bind(this.getTimestamp, this);

    this.getClient = __bind(this.getClient, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      baseOutputArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    baseOutputArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the active WebSync <see cref="fm.websync.baseOutputArgs.client">fm.websync.baseOutputArgs.client</see> who made the request.
  	 </div>
  
  	@function getClient
  	@return {fm.websync.client}
  */


  baseOutputArgs.prototype.getClient = function() {
    return this._client;
  };

  /**
  	 <div>
  	 Gets the date/time the message was processed on the server (in UTC/GMT).
  	 </div>
  
  	@function getTimestamp
  	@return {fm.nullable}
  */


  baseOutputArgs.prototype.getTimestamp = function() {
    return this.__timestamp;
  };

  /**
  	 <div>
  	 Sets the active WebSync <see cref="fm.websync.baseOutputArgs.client">fm.websync.baseOutputArgs.client</see> who made the request.
  	 </div>
  
  	@function setClient
  	@param {fm.websync.client} value
  	@return {void}
  */


  baseOutputArgs.prototype.setClient = function() {
    var value;
    value = arguments[0];
    return this._client = value;
  };

  /**
  	 <div>
  	 Sets the date/time the message was processed on the server (in UTC/GMT).
  	 </div>
  
  	@function setTimestamp
  	@param {fm.nullable} value
  	@return {void}
  */


  baseOutputArgs.prototype.setTimestamp = function() {
    var value;
    value = arguments[0];
    if (value !== null) {
      return this.__timestamp = value;
    } else {
      return this.__timestamp = null;
    }
  };

  return baseOutputArgs;

})(fm.websync.extensible);


/**
@class fm.websync.basePublisherEventArgs
 <div>
 Base arguments for <see cref="fm.websync.basePublisherEventArgs.publisher">fm.websync.basePublisherEventArgs.publisher</see>-triggered events.
 </div>

@extends fm.object
*/


fm.websync.basePublisherEventArgs = (function(_super) {

  __extends(basePublisherEventArgs, _super);

  /**
  	@ignore 
  	@description
  */


  basePublisherEventArgs.prototype._publisher = null;

  /**
  	@ignore 
  	@description
  */


  function basePublisherEventArgs() {
    this.setPublisher = __bind(this.setPublisher, this);

    this.getPublisher = __bind(this.getPublisher, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      basePublisherEventArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    basePublisherEventArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the <see cref="fm.websync.basePublisherEventArgs.publisher">fm.websync.basePublisherEventArgs.publisher</see> triggering the event.
  	 </div>
  
  	@function getPublisher
  	@return {fm.websync.publisher}
  */


  basePublisherEventArgs.prototype.getPublisher = function() {
    return this._publisher;
  };

  /**
  	 <div>
  	 Sets the <see cref="fm.websync.basePublisherEventArgs.publisher">fm.websync.basePublisherEventArgs.publisher</see> triggering the event.
  	 </div>
  
  	@function setPublisher
  	@param {fm.websync.publisher} value
  	@return {void}
  */


  basePublisherEventArgs.prototype.setPublisher = function() {
    var value;
    value = arguments[0];
    return this._publisher = value;
  };

  return basePublisherEventArgs;

})(fm.object);


/**
@class fm.websync.basePublisherResponseEventArgs
 <div>
 Base arguments for <see cref="fm.websync.publisher">fm.websync.publisher</see> events that occur
 after a response is received.
 </div>

@extends fm.websync.basePublisherEventArgs
*/


fm.websync.basePublisherResponseEventArgs = (function(_super) {

  __extends(basePublisherResponseEventArgs, _super);

  /**
  	@ignore 
  	@description
  */


  basePublisherResponseEventArgs.prototype._exception = null;

  /**
  	@ignore 
  	@description
  */


  function basePublisherResponseEventArgs() {
    this.setException = __bind(this.setException, this);

    this.getException = __bind(this.getException, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      basePublisherResponseEventArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    basePublisherResponseEventArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the exception generated while completing the request, if any.
  	 Will be <c>null</c> if no exception was generated.
  	 </div>
  
  	@function getException
  	@return {Error}
  */


  basePublisherResponseEventArgs.prototype.getException = function() {
    return this._exception;
  };

  /**
  	 <div>
  	 Sets the exception generated while completing the request, if any.
  	 Will be <c>null</c> if no exception was generated.
  	 </div>
  
  	@function setException
  	@param {Error} value
  	@return {void}
  */


  basePublisherResponseEventArgs.prototype.setException = function() {
    var value;
    value = arguments[0];
    return this._exception = value;
  };

  return basePublisherResponseEventArgs;

})(fm.websync.basePublisherEventArgs);


/**
@class fm.websync.basePublisherResponseEventArgsGeneric
 <div>
 Generic base arguments for <see cref="fm.websync.publisher">fm.websync.publisher</see> events that occur
 after a response is received.
 </div>

@extends fm.websync.basePublisherResponseEventArgs
*/


fm.websync.basePublisherResponseEventArgsGeneric = (function(_super) {

  __extends(basePublisherResponseEventArgsGeneric, _super);

  /**
  	@ignore 
  	@description
  */


  basePublisherResponseEventArgsGeneric.prototype._requests = null;

  /**
  	@ignore 
  	@description
  */


  basePublisherResponseEventArgsGeneric.prototype._responses = null;

  /**
  	@ignore 
  	@description
  */


  function basePublisherResponseEventArgsGeneric() {
    this.setResponses = __bind(this.setResponses, this);

    this.setRequests = __bind(this.setRequests, this);

    this.getResponses = __bind(this.getResponses, this);

    this.getRequests = __bind(this.getRequests, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      basePublisherResponseEventArgsGeneric.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    basePublisherResponseEventArgsGeneric.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the requests sent to the server.
  	 </div>
  
  	@function getRequests
  	@return {fm.array}
  */


  basePublisherResponseEventArgsGeneric.prototype.getRequests = function() {
    return this._requests;
  };

  /**
  	 <div>
  	 Gets the responses received from the server.
  	 </div>
  
  	@function getResponses
  	@return {fm.array}
  */


  basePublisherResponseEventArgsGeneric.prototype.getResponses = function() {
    return this._responses;
  };

  /**
  	 <div>
  	 Sets the requests sent to the server.
  	 </div>
  
  	@function setRequests
  	@param {fm.array} value
  	@return {void}
  */


  basePublisherResponseEventArgsGeneric.prototype.setRequests = function() {
    var value;
    value = arguments[0];
    return this._requests = value;
  };

  /**
  	 <div>
  	 Sets the responses received from the server.
  	 </div>
  
  	@function setResponses
  	@param {fm.array} value
  	@return {void}
  */


  basePublisherResponseEventArgsGeneric.prototype.setResponses = function() {
    var value;
    value = arguments[0];
    return this._responses = value;
  };

  return basePublisherResponseEventArgsGeneric;

})(fm.websync.basePublisherResponseEventArgs);


/**
@class fm.websync.basePublisherRequestEventArgs
 <div>
 Base arguments for <see cref="fm.websync.publisher">fm.websync.publisher</see> events that occur
 before a request is sent.
 </div>

@extends fm.websync.basePublisherEventArgs
*/


fm.websync.basePublisherRequestEventArgs = (function(_super) {

  __extends(basePublisherRequestEventArgs, _super);

  /**
  	@ignore 
  	@description
  */


  basePublisherRequestEventArgs.prototype._cancel = false;

  /**
  	@ignore 
  	@description
  */


  function basePublisherRequestEventArgs() {
    this.setCancel = __bind(this.setCancel, this);

    this.getCancel = __bind(this.getCancel, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      basePublisherRequestEventArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    basePublisherRequestEventArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets whether or not to cancel the request.
  	 If set to <c>true</c>, the request will not be processed.
  	 Defaults to <c>false</c>.
  	 </div>
  
  	@function getCancel
  	@return {fm.boolean}
  */


  basePublisherRequestEventArgs.prototype.getCancel = function() {
    return this._cancel;
  };

  /**
  	 <div>
  	 Sets whether or not to cancel the request.
  	 If set to <c>true</c>, the request will not be processed.
  	 Defaults to <c>false</c>.
  	 </div>
  
  	@function setCancel
  	@param {fm.boolean} value
  	@return {void}
  */


  basePublisherRequestEventArgs.prototype.setCancel = function() {
    var value;
    value = arguments[0];
    return this._cancel = value;
  };

  return basePublisherRequestEventArgs;

})(fm.websync.basePublisherEventArgs);


/**
@class fm.websync.basePublisherRequestEventArgsGeneric
 <div>
 Generic base arguments for <see cref="fm.websync.publisher">fm.websync.publisher</see> events that occur
 before a request is sent.
 </div>

@extends fm.websync.basePublisherRequestEventArgs
*/


fm.websync.basePublisherRequestEventArgsGeneric = (function(_super) {

  __extends(basePublisherRequestEventArgsGeneric, _super);

  /**
  	@ignore 
  	@description
  */


  basePublisherRequestEventArgsGeneric.prototype._requests = null;

  /**
  	@ignore 
  	@description
  */


  function basePublisherRequestEventArgsGeneric() {
    this.setRequests = __bind(this.setRequests, this);

    this.getRequests = __bind(this.getRequests, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      basePublisherRequestEventArgsGeneric.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    basePublisherRequestEventArgsGeneric.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the requests being sent to the server.
  	 </div>
  
  	@function getRequests
  	@return {fm.array}
  */


  basePublisherRequestEventArgsGeneric.prototype.getRequests = function() {
    return this._requests;
  };

  /**
  	 <div>
  	 Sets the requests being sent to the server.
  	 </div>
  
  	@function setRequests
  	@param {fm.array} value
  	@return {void}
  */


  basePublisherRequestEventArgsGeneric.prototype.setRequests = function() {
    var value;
    value = arguments[0];
    return this._requests = value;
  };

  return basePublisherRequestEventArgsGeneric;

})(fm.websync.basePublisherRequestEventArgs);


/**
@class fm.websync.baseClientEventArgs
 <div>
 Base arguments for <see cref="fm.websync.baseClientEventArgs.client">fm.websync.baseClientEventArgs.client</see>-triggered events.
 </div>

@extends fm.object
*/


fm.websync.baseClientEventArgs = (function(_super) {

  __extends(baseClientEventArgs, _super);

  /**
  	@ignore 
  	@description
  */


  baseClientEventArgs.prototype._client = null;

  /**
  	@ignore 
  	@description
  */


  function baseClientEventArgs() {
    this.setClient = __bind(this.setClient, this);

    this.getClient = __bind(this.getClient, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      baseClientEventArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    baseClientEventArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the <see cref="fm.websync.baseClientEventArgs.client">fm.websync.baseClientEventArgs.client</see> triggering the event.
  	 </div>
  
  	@function getClient
  	@return {fm.websync.client}
  */


  baseClientEventArgs.prototype.getClient = function() {
    return this._client;
  };

  /**
  	 <div>
  	 Sets the <see cref="fm.websync.baseClientEventArgs.client">fm.websync.baseClientEventArgs.client</see> triggering the event.
  	 </div>
  
  	@function setClient
  	@param {fm.websync.client} value
  	@return {void}
  */


  baseClientEventArgs.prototype.setClient = function() {
    var value;
    value = arguments[0];
    return this._client = value;
  };

  return baseClientEventArgs;

})(fm.object);


/**
@class fm.websync.baseClientEndEventArgs
 <div>
 Base arguments for <see cref="fm.websync.client">fm.websync.client</see> events that occur
 after a response has been processed.
 </div>

@extends fm.websync.baseClientEventArgs
*/


fm.websync.baseClientEndEventArgs = (function(_super) {

  __extends(baseClientEndEventArgs, _super);

  /**
  	@ignore 
  	@description
  */


  baseClientEndEventArgs.prototype._exception = null;

  /**
  	@ignore 
  	@description
  */


  baseClientEndEventArgs.prototype._response = null;

  /**
  	@ignore 
  	@description
  */


  function baseClientEndEventArgs() {
    this.setResponse = __bind(this.setResponse, this);

    this.setException = __bind(this.setException, this);

    this.getResponse = __bind(this.getResponse, this);

    this.getException = __bind(this.getException, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      baseClientEndEventArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    baseClientEndEventArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the exception generated while completing the request, if any.
  	 Will be <c>null</c> if no exception was generated.
  	 </div>
  
  	@function getException
  	@return {Error}
  */


  baseClientEndEventArgs.prototype.getException = function() {
    return this._exception;
  };

  /**
  	 <div>
  	 Gets the response received from the server.
  	 </div>
  
  	@function getResponse
  	@return {fm.websync.message}
  */


  baseClientEndEventArgs.prototype.getResponse = function() {
    return this._response;
  };

  /**
  	 <div>
  	 Sets the exception generated while completing the request, if any.
  	 Will be <c>null</c> if no exception was generated.
  	 </div>
  
  	@function setException
  	@param {Error} value
  	@return {void}
  */


  baseClientEndEventArgs.prototype.setException = function() {
    var value;
    value = arguments[0];
    return this._exception = value;
  };

  /**
  	 <div>
  	 Sets the response received from the server.
  	 </div>
  
  	@function setResponse
  	@param {fm.websync.message} value
  	@return {void}
  */


  baseClientEndEventArgs.prototype.setResponse = function() {
    var value;
    value = arguments[0];
    return this._response = value;
  };

  return baseClientEndEventArgs;

})(fm.websync.baseClientEventArgs);


/**
@class fm.websync.baseClientEndEventArgsGeneric
 <div>
 Generic base arguments for <see cref="fm.websync.client">fm.websync.client</see> events that occur
 after a response has been processed.
 </div>

@extends fm.websync.baseClientEndEventArgs
*/


fm.websync.baseClientEndEventArgsGeneric = (function(_super) {

  __extends(baseClientEndEventArgsGeneric, _super);

  /**
  	@ignore 
  	@description
  */


  baseClientEndEventArgsGeneric.prototype._methodArgs = null;

  /**
  	@ignore 
  	@description
  */


  function baseClientEndEventArgsGeneric() {
    this.setMethodArgs = __bind(this.setMethodArgs, this);

    this.getMethodArgs = __bind(this.getMethodArgs, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      baseClientEndEventArgsGeneric.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    baseClientEndEventArgsGeneric.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the original arguments passed into the client method.
  	 </div>
  
  	@function getMethodArgs
  	@return {fm.object}
  */


  baseClientEndEventArgsGeneric.prototype.getMethodArgs = function() {
    return this._methodArgs;
  };

  /**
  	 <div>
  	 Sets the original arguments passed into the client method.
  	 </div>
  
  	@function setMethodArgs
  	@param {fm.object} value
  	@return {void}
  */


  baseClientEndEventArgsGeneric.prototype.setMethodArgs = function() {
    var value;
    value = arguments[0];
    return this._methodArgs = value;
  };

  return baseClientEndEventArgsGeneric;

})(fm.websync.baseClientEndEventArgs);


/**
@class fm.websync.baseClientResponseEventArgs
 <div>
 Base arguments for <see cref="fm.websync.client">fm.websync.client</see> events that occur
 after a response is received.
 </div>

@extends fm.websync.baseClientEventArgs
*/


fm.websync.baseClientResponseEventArgs = (function(_super) {

  __extends(baseClientResponseEventArgs, _super);

  /**
  	@ignore 
  	@description
  */


  baseClientResponseEventArgs.prototype._exception = null;

  /**
  	@ignore 
  	@description
  */


  baseClientResponseEventArgs.prototype._response = null;

  /**
  	@ignore 
  	@description
  */


  function baseClientResponseEventArgs() {
    this.setResponse = __bind(this.setResponse, this);

    this.setException = __bind(this.setException, this);

    this.getResponse = __bind(this.getResponse, this);

    this.getException = __bind(this.getException, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      baseClientResponseEventArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    baseClientResponseEventArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the exception generated while completing the request, if any.
  	 Will be <c>null</c> if no exception was generated.
  	 </div>
  
  	@function getException
  	@return {Error}
  */


  baseClientResponseEventArgs.prototype.getException = function() {
    return this._exception;
  };

  /**
  	 <div>
  	 Gets the response received from the server.
  	 </div>
  
  	@function getResponse
  	@return {fm.websync.message}
  */


  baseClientResponseEventArgs.prototype.getResponse = function() {
    return this._response;
  };

  /**
  	 <div>
  	 Sets the exception generated while completing the request, if any.
  	 Will be <c>null</c> if no exception was generated.
  	 </div>
  
  	@function setException
  	@param {Error} value
  	@return {void}
  */


  baseClientResponseEventArgs.prototype.setException = function() {
    var value;
    value = arguments[0];
    return this._exception = value;
  };

  /**
  	 <div>
  	 Sets the response received from the server.
  	 </div>
  
  	@function setResponse
  	@param {fm.websync.message} value
  	@return {void}
  */


  baseClientResponseEventArgs.prototype.setResponse = function() {
    var value;
    value = arguments[0];
    return this._response = value;
  };

  return baseClientResponseEventArgs;

})(fm.websync.baseClientEventArgs);


/**
@class fm.websync.baseClientResponseEventArgsGeneric
 <div>
 Generic base arguments for <see cref="fm.websync.client">fm.websync.client</see> events that occur
 after a response is received.
 </div>

@extends fm.websync.baseClientResponseEventArgs
*/


fm.websync.baseClientResponseEventArgsGeneric = (function(_super) {

  __extends(baseClientResponseEventArgsGeneric, _super);

  /**
  	@ignore 
  	@description
  */


  baseClientResponseEventArgsGeneric.prototype._methodArgs = null;

  /**
  	@ignore 
  	@description
  */


  function baseClientResponseEventArgsGeneric() {
    this.setMethodArgs = __bind(this.setMethodArgs, this);

    this.getMethodArgs = __bind(this.getMethodArgs, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      baseClientResponseEventArgsGeneric.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    baseClientResponseEventArgsGeneric.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the original arguments passed into the client method.
  	 </div>
  
  	@function getMethodArgs
  	@return {fm.object}
  */


  baseClientResponseEventArgsGeneric.prototype.getMethodArgs = function() {
    return this._methodArgs;
  };

  /**
  	 <div>
  	 Sets the original arguments passed into the client method.
  	 </div>
  
  	@function setMethodArgs
  	@param {fm.object} value
  	@return {void}
  */


  baseClientResponseEventArgsGeneric.prototype.setMethodArgs = function() {
    var value;
    value = arguments[0];
    return this._methodArgs = value;
  };

  return baseClientResponseEventArgsGeneric;

})(fm.websync.baseClientResponseEventArgs);


/**
@class fm.websync.clientNotifyResponseArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnNotifyResponse">fm.websync.client.addOnNotifyResponse</see>.
 </div>

@extends fm.websync.baseClientResponseEventArgsGeneric
*/


fm.websync.clientNotifyResponseArgs = (function(_super) {

  __extends(clientNotifyResponseArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function clientNotifyResponseArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientNotifyResponseArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientNotifyResponseArgs.__super__.constructor.call(this);
  }

  return clientNotifyResponseArgs;

})(fm.websync.baseClientResponseEventArgsGeneric);


/**
@class fm.websync.baseServerArgs
 <div>
 Base arguments for <see cref="fm.websync.connectArgs">fm.websync.connectArgs</see> "OnServer" callbacks.
 </div>

@extends fm.websync.baseOutputArgs
*/


fm.websync.baseServerArgs = (function(_super) {

  __extends(baseServerArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function baseServerArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      baseServerArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    baseServerArgs.__super__.constructor.call(this);
  }

  return baseServerArgs;

})(fm.websync.baseOutputArgs);


/**
@class fm.websync.baseSuccessArgs
 <div>
 Base arguments for <see cref="fm.websync.client">fm.websync.client</see> "OnSuccess" callbacks.
 </div>

@extends fm.websync.baseOutputArgs
*/


fm.websync.baseSuccessArgs = (function(_super) {

  __extends(baseSuccessArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function baseSuccessArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      baseSuccessArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    baseSuccessArgs.__super__.constructor.call(this);
  }

  return baseSuccessArgs;

})(fm.websync.baseOutputArgs);


/**
@class fm.websync.baseReceiveArgs
 <div>
 Arguments for <see cref="fm.websync.subscribeArgs.onReceive">fm.websync.subscribeArgs.onReceive</see>.
 </div>

@extends fm.websync.baseSuccessArgs
*/


fm.websync.baseReceiveArgs = (function(_super) {

  __extends(baseReceiveArgs, _super);

  /**
  	@ignore 
  	@description
  */


  baseReceiveArgs.prototype.__dataJson = null;

  /**
  	@ignore 
  	@description
  */


  function baseReceiveArgs() {
    this.getData = __bind(this.getData, this);

    this.getTag = __bind(this.getTag, this);

    this.getIsBinary = __bind(this.getIsBinary, this);

    this.getDataJson = __bind(this.getDataJson, this);

    this.getDataBytes = __bind(this.getDataBytes, this);

    var dataJson;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      baseReceiveArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    dataJson = arguments[0];
    baseReceiveArgs.__super__.constructor.call(this);
    this.__dataJson = dataJson;
  }

  /**
  	 <div>
  	 Gets the data that was sent in binary format.
  	 </div>
  
  	@function getDataBytes
  	@return {fm.array}
  */


  baseReceiveArgs.prototype.getDataBytes = function() {
    var decoded, _var0, _var1;
    decoded = null;
    _var0 = new fm.holder(decoded);
    _var1 = fm.websync.crypto.tryBase64Decode(fm.serializer.deserializeString(this.__dataJson), _var0);
    decoded = _var0.getValue();
    _var1;

    return decoded;
  };

  /**
  	 <div>
  	 Gets the data that was sent in JSON format.
  	 </div>
  
  	@function getDataJson
  	@return {fm.string}
  */


  baseReceiveArgs.prototype.getDataJson = function() {
    return this.__dataJson;
  };

  /**
  	 <div>
  	 Gets whether or not the data is binary.
  	 </div>
  
  	@function getIsBinary
  	@return {fm.boolean}
  */


  baseReceiveArgs.prototype.getIsBinary = function() {
    var _var0;
    _var0 = this.getDataBytes();
    return _var0 !== null && typeof _var0 !== 'undefined';
  };

  /**
  	 <div>
  	 Gets the tag that identifies the contents of the payload.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  baseReceiveArgs.prototype.getTag = function() {
    return fm.serializer.deserializeString(this.getExtensionValueJson("fm.tag"));
  };

  /**
  
  	@function getData
  	@return {fm.hash}
  */


  baseReceiveArgs.prototype.getData = function() {
    return fm.json.deserialize(this.getDataJson.apply(this, arguments));
  };

  return baseReceiveArgs;

})(fm.websync.baseSuccessArgs);


/**
@class fm.websync.baseClientRequestEventArgs
 <div>
 Base arguments for <see cref="fm.websync.client">fm.websync.client</see> events that occur
 before a request is sent.
 </div>

@extends fm.websync.baseClientEventArgs
*/


fm.websync.baseClientRequestEventArgs = (function(_super) {

  __extends(baseClientRequestEventArgs, _super);

  /**
  	@ignore 
  	@description
  */


  baseClientRequestEventArgs.prototype._cancel = false;

  /**
  	@ignore 
  	@description
  */


  function baseClientRequestEventArgs() {
    this.setCancel = __bind(this.setCancel, this);

    this.getCancel = __bind(this.getCancel, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      baseClientRequestEventArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    baseClientRequestEventArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets whether or not to cancel the request.
  	 If set to <c>true</c>, the request will not be processed.
  	 Defaults to <c>false</c>.
  	 </div>
  
  	@function getCancel
  	@return {fm.boolean}
  */


  baseClientRequestEventArgs.prototype.getCancel = function() {
    return this._cancel;
  };

  /**
  	 <div>
  	 Sets whether or not to cancel the request.
  	 If set to <c>true</c>, the request will not be processed.
  	 Defaults to <c>false</c>.
  	 </div>
  
  	@function setCancel
  	@param {fm.boolean} value
  	@return {void}
  */


  baseClientRequestEventArgs.prototype.setCancel = function() {
    var value;
    value = arguments[0];
    return this._cancel = value;
  };

  return baseClientRequestEventArgs;

})(fm.websync.baseClientEventArgs);


/**
@class fm.websync.baseClientRequestEventArgsGeneric
 <div>
 Generic base arguments for <see cref="fm.websync.client">fm.websync.client</see> events that occur
 before a request is sent.
 </div>

@extends fm.websync.baseClientRequestEventArgs
*/


fm.websync.baseClientRequestEventArgsGeneric = (function(_super) {

  __extends(baseClientRequestEventArgsGeneric, _super);

  /**
  	@ignore 
  	@description
  */


  baseClientRequestEventArgsGeneric.prototype._methodArgs = null;

  /**
  	@ignore 
  	@description
  */


  function baseClientRequestEventArgsGeneric() {
    this.setMethodArgs = __bind(this.setMethodArgs, this);

    this.getMethodArgs = __bind(this.getMethodArgs, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      baseClientRequestEventArgsGeneric.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    baseClientRequestEventArgsGeneric.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the original arguments passed into the client method.
  	 </div>
  
  	@function getMethodArgs
  	@return {fm.object}
  */


  baseClientRequestEventArgsGeneric.prototype.getMethodArgs = function() {
    return this._methodArgs;
  };

  /**
  	 <div>
  	 Sets the original arguments passed into the client method.
  	 </div>
  
  	@function setMethodArgs
  	@param {fm.object} value
  	@return {void}
  */


  baseClientRequestEventArgsGeneric.prototype.setMethodArgs = function() {
    var value;
    value = arguments[0];
    return this._methodArgs = value;
  };

  return baseClientRequestEventArgsGeneric;

})(fm.websync.baseClientRequestEventArgs);


/**
@class fm.websync.clientNotifyRequestArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnNotifyRequest">fm.websync.client.addOnNotifyRequest</see>.
 </div>

@extends fm.websync.baseClientRequestEventArgsGeneric
*/


fm.websync.clientNotifyRequestArgs = (function(_super) {

  __extends(clientNotifyRequestArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function clientNotifyRequestArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientNotifyRequestArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientNotifyRequestArgs.__super__.constructor.call(this);
  }

  return clientNotifyRequestArgs;

})(fm.websync.baseClientRequestEventArgsGeneric);


/**
@class fm.websync.clientSubscribeEndArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnSubscribeEnd">fm.websync.client.addOnSubscribeEnd</see>.
 </div>

@extends fm.websync.baseClientEndEventArgsGeneric
*/


fm.websync.clientSubscribeEndArgs = (function(_super) {

  __extends(clientSubscribeEndArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function clientSubscribeEndArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientSubscribeEndArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientSubscribeEndArgs.__super__.constructor.call(this);
  }

  return clientSubscribeEndArgs;

})(fm.websync.baseClientEndEventArgsGeneric);


/**
@class fm.websync.clientBindEndArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnBindEnd">fm.websync.client.addOnBindEnd</see>.
 </div>

@extends fm.websync.baseClientEndEventArgsGeneric
*/


fm.websync.clientBindEndArgs = (function(_super) {

  __extends(clientBindEndArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function clientBindEndArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientBindEndArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientBindEndArgs.__super__.constructor.call(this);
  }

  return clientBindEndArgs;

})(fm.websync.baseClientEndEventArgsGeneric);


/**
@class fm.websync.clientConnectEndArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnConnectEnd">fm.websync.client.addOnConnectEnd</see>.
 </div>

@extends fm.websync.baseClientEndEventArgsGeneric
*/


fm.websync.clientConnectEndArgs = (function(_super) {

  __extends(clientConnectEndArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function clientConnectEndArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientConnectEndArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientConnectEndArgs.__super__.constructor.call(this);
  }

  return clientConnectEndArgs;

})(fm.websync.baseClientEndEventArgsGeneric);


/**
@class fm.websync.clientDisconnectEndArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnDisconnectEnd">fm.websync.client.addOnDisconnectEnd</see>.
 </div>

@extends fm.websync.baseClientEndEventArgsGeneric
*/


fm.websync.clientDisconnectEndArgs = (function(_super) {

  __extends(clientDisconnectEndArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function clientDisconnectEndArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientDisconnectEndArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientDisconnectEndArgs.__super__.constructor.call(this);
  }

  return clientDisconnectEndArgs;

})(fm.websync.baseClientEndEventArgsGeneric);


/**
@class fm.websync.clientNotifyEndArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnNotifyEnd">fm.websync.client.addOnNotifyEnd</see>.
 </div>

@extends fm.websync.baseClientEndEventArgsGeneric
*/


fm.websync.clientNotifyEndArgs = (function(_super) {

  __extends(clientNotifyEndArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function clientNotifyEndArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientNotifyEndArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientNotifyEndArgs.__super__.constructor.call(this);
  }

  return clientNotifyEndArgs;

})(fm.websync.baseClientEndEventArgsGeneric);


/**
@class fm.websync.clientPublishEndArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnPublishEnd">fm.websync.client.addOnPublishEnd</see>.
 </div>

@extends fm.websync.baseClientEndEventArgsGeneric
*/


fm.websync.clientPublishEndArgs = (function(_super) {

  __extends(clientPublishEndArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function clientPublishEndArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientPublishEndArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientPublishEndArgs.__super__.constructor.call(this);
  }

  return clientPublishEndArgs;

})(fm.websync.baseClientEndEventArgsGeneric);


/**
@class fm.websync.clientServiceEndArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnServiceEnd">fm.websync.client.addOnServiceEnd</see>.
 </div>

@extends fm.websync.baseClientEndEventArgsGeneric
*/


fm.websync.clientServiceEndArgs = (function(_super) {

  __extends(clientServiceEndArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function clientServiceEndArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientServiceEndArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientServiceEndArgs.__super__.constructor.call(this);
  }

  return clientServiceEndArgs;

})(fm.websync.baseClientEndEventArgsGeneric);


/**
@class fm.websync.clientUnbindEndArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnUnbindEnd">fm.websync.client.addOnUnbindEnd</see>.
 </div>

@extends fm.websync.baseClientEndEventArgsGeneric
*/


fm.websync.clientUnbindEndArgs = (function(_super) {

  __extends(clientUnbindEndArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function clientUnbindEndArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientUnbindEndArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientUnbindEndArgs.__super__.constructor.call(this);
  }

  return clientUnbindEndArgs;

})(fm.websync.baseClientEndEventArgsGeneric);


/**
@class fm.websync.clientUnsubscribeEndArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnUnsubscribeEnd">fm.websync.client.addOnUnsubscribeEnd</see>.
 </div>

@extends fm.websync.baseClientEndEventArgsGeneric
*/


fm.websync.clientUnsubscribeEndArgs = (function(_super) {

  __extends(clientUnsubscribeEndArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function clientUnsubscribeEndArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientUnsubscribeEndArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientUnsubscribeEndArgs.__super__.constructor.call(this);
  }

  return clientUnsubscribeEndArgs;

})(fm.websync.baseClientEndEventArgsGeneric);


/**
@class fm.websync.notifyReceiveArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnNotify">fm.websync.client.addOnNotify</see>.
 </div>

@extends fm.websync.baseReceiveArgs
*/


fm.websync.notifyReceiveArgs = (function(_super) {

  __extends(notifyReceiveArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function notifyReceiveArgs() {
    this.getWasSentByMe = __bind(this.getWasSentByMe, this);

    this.getNotifyingClient = __bind(this.getNotifyingClient, this);

    var dataJson;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      notifyReceiveArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    dataJson = arguments[0];
    notifyReceiveArgs.__super__.constructor.call(this, dataJson);
  }

  /**
  	 <div>
  	 Gets details about the client sending the notification.
  	 </div>
  
  	@function getNotifyingClient
  	@return {fm.websync.notifyingClient}
  */


  notifyReceiveArgs.prototype.getNotifyingClient = function() {
    return fm.websync.notifyingClient.fromJson(this.getExtensionValueJson("fm.notifying"));
  };

  /**
  	 <div>
  	 Gets whether the data was sent by the current client.
  	 </div>
  
  	@function getWasSentByMe
  	@return {fm.boolean}
  */


  notifyReceiveArgs.prototype.getWasSentByMe = function() {
    var _var0, _var1, _var2;
    _var0 = this.getNotifyingClient();
    _var1 = this.getClient();
    _var2 = this.getNotifyingClient().getClientId();
    return (((_var0 !== null && typeof _var0 !== 'undefined') && (_var1 !== null && typeof _var1 !== 'undefined')) && (this.getNotifyingClient().getClientId() !== null)) && (_var2 === null ? _var2 === this.getClient().getClientId() : _var2.equals(this.getClient().getClientId()));
  };

  return notifyReceiveArgs;

})(fm.websync.baseReceiveArgs);


/**
@class fm.websync.socketOpenFailureArgs
 <div>
 Failure arguments for use with the <see cref="fm.websync.socketMessageTransfer">fm.websync.socketMessageTransfer</see>.
 </div>

@extends fm.dynamic
*/


fm.websync.socketOpenFailureArgs = (function(_super) {

  __extends(socketOpenFailureArgs, _super);

  /**
  	@ignore 
  	@description
  */


  socketOpenFailureArgs.prototype._exception = null;

  /**
  	@ignore 
  	@description
  */


  function socketOpenFailureArgs() {
    this.setException = __bind(this.setException, this);

    this.getException = __bind(this.getException, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      socketOpenFailureArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    socketOpenFailureArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the exception generated while connecting.
  	 </div>
  
  	@function getException
  	@return {Error}
  */


  socketOpenFailureArgs.prototype.getException = function() {
    return this._exception;
  };

  /**
  	 <div>
  	 Sets the exception generated while connecting.
  	 </div>
  
  	@function setException
  	@param {Error} value
  	@return {void}
  */


  socketOpenFailureArgs.prototype.setException = function() {
    var value;
    value = arguments[0];
    return this._exception = value;
  };

  return socketOpenFailureArgs;

})(fm.dynamic);


/**
@class fm.websync.socketOpenSuccessArgs
 <div>
 Success arguments for use with the <see cref="fm.websync.socketMessageTransfer">fm.websync.socketMessageTransfer</see>.
 </div>

@extends fm.dynamic
*/


fm.websync.socketOpenSuccessArgs = (function(_super) {

  __extends(socketOpenSuccessArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function socketOpenSuccessArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      socketOpenSuccessArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    socketOpenSuccessArgs.__super__.constructor.call(this);
  }

  return socketOpenSuccessArgs;

})(fm.dynamic);


/**
@class fm.websync.socketStreamFailureArgs
 <div>
 Stream failure arguments for use with the <see cref="fm.websync.socketMessageTransfer">fm.websync.socketMessageTransfer</see>.
 </div>

@extends fm.dynamic
*/


fm.websync.socketStreamFailureArgs = (function(_super) {

  __extends(socketStreamFailureArgs, _super);

  /**
  	@ignore 
  	@description
  */


  socketStreamFailureArgs.prototype._exception = null;

  /**
  	@ignore 
  	@description
  */


  function socketStreamFailureArgs() {
    this.setException = __bind(this.setException, this);

    this.getException = __bind(this.getException, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      socketStreamFailureArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    socketStreamFailureArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the exception generated by the active connection.
  	 </div>
  
  	@function getException
  	@return {Error}
  */


  socketStreamFailureArgs.prototype.getException = function() {
    return this._exception;
  };

  /**
  	 <div>
  	 Sets the exception generated by the active connection.
  	 </div>
  
  	@function setException
  	@param {Error} value
  	@return {void}
  */


  socketStreamFailureArgs.prototype.setException = function() {
    var value;
    value = arguments[0];
    return this._exception = value;
  };

  return socketStreamFailureArgs;

})(fm.dynamic);


/**
@class fm.websync.serverSubscribeArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnServerSubscribe">fm.websync.client.addOnServerSubscribe</see>.
 </div>

@extends fm.websync.baseSuccessArgs
*/


fm.websync.serverSubscribeArgs = (function(_super) {

  __extends(serverSubscribeArgs, _super);

  /**
  	@ignore 
  	@description
  */


  serverSubscribeArgs.prototype.__channels = null;

  /**
  	@ignore 
  	@description
  */


  function serverSubscribeArgs() {
    this.getTag = __bind(this.getTag, this);

    this.getChannels = __bind(this.getChannels, this);

    this.getChannel = __bind(this.getChannel, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      serverSubscribeArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    serverSubscribeArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the channel to which the client was subscribed.
  	 Must start with a forward slash (/).
  	 Overrides <see cref="fm.websync.serverSubscribeArgs.channels">fm.websync.serverSubscribeArgs.channels</see>.
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  serverSubscribeArgs.prototype.getChannel = function() {
    return fm.websync.extensible.sharedGetChannel(this.__channels);
  };

  /**
  	 <div>
  	 Gets the channels to which the client was subscribed.
  	 Each must start with a forward slash (/).
  	 Overrides <see cref="fm.websync.serverSubscribeArgs.channel">fm.websync.serverSubscribeArgs.channel</see>.
  	 </div>
  
  	@function getChannels
  	@return {fm.array}
  */


  serverSubscribeArgs.prototype.getChannels = function() {
    return fm.websync.extensible.sharedGetChannels(this.__channels);
  };

  /**
  	 <div>
  	 Gets the tag associated with the subscribe request.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  serverSubscribeArgs.prototype.getTag = function() {
    var _ref;
    return (_ref = fm.serializer.deserializeString(this.getExtensionValueJson("fm.tag"))) != null ? _ref : fm.stringExtensions.empty;
  };

  return serverSubscribeArgs;

})(fm.websync.baseSuccessArgs);


/**
@class fm.websync.serverUnsubscribeArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnServerUnsubscribe">fm.websync.client.addOnServerUnsubscribe</see>.
 </div>

@extends fm.websync.baseSuccessArgs
*/


fm.websync.serverUnsubscribeArgs = (function(_super) {

  __extends(serverUnsubscribeArgs, _super);

  /**
  	@ignore 
  	@description
  */


  serverUnsubscribeArgs.prototype.__channels = null;

  /**
  	@ignore 
  	@description
  */


  function serverUnsubscribeArgs() {
    this.getTag = __bind(this.getTag, this);

    this.getChannels = __bind(this.getChannels, this);

    this.getChannel = __bind(this.getChannel, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      serverUnsubscribeArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    serverUnsubscribeArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the channel from which the client was unsubscribed.
  	 Must start with a forward slash (/).
  	 Overrides <see cref="fm.websync.serverUnsubscribeArgs.channels">fm.websync.serverUnsubscribeArgs.channels</see>.
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  serverUnsubscribeArgs.prototype.getChannel = function() {
    return fm.websync.extensible.sharedGetChannel(this.__channels);
  };

  /**
  	 <div>
  	 Gets the channels from which the client was unsubscribed.
  	 Each must start with a forward slash (/).
  	 Overrides <see cref="fm.websync.serverUnsubscribeArgs.channel">fm.websync.serverUnsubscribeArgs.channel</see>.
  	 </div>
  
  	@function getChannels
  	@return {fm.array}
  */


  serverUnsubscribeArgs.prototype.getChannels = function() {
    return fm.websync.extensible.sharedGetChannels(this.__channels);
  };

  /**
  	 <div>
  	 Gets the tag associated with the unsubscribe request.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  serverUnsubscribeArgs.prototype.getTag = function() {
    var _ref;
    return (_ref = fm.serializer.deserializeString(this.getExtensionValueJson("fm.tag"))) != null ? _ref : fm.stringExtensions.empty;
  };

  return serverUnsubscribeArgs;

})(fm.websync.baseSuccessArgs);


/**
@class fm.websync.serverUnbindArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnServerUnbind">fm.websync.client.addOnServerUnbind</see>.
 </div>

@extends fm.websync.baseSuccessArgs
*/


fm.websync.serverUnbindArgs = (function(_super) {

  __extends(serverUnbindArgs, _super);

  /**
  	@ignore 
  	@description
  */


  serverUnbindArgs.prototype.__records = null;

  /**
  	@ignore 
  	@description
  */


  function serverUnbindArgs() {
    this.getRecords = __bind(this.getRecords, this);

    this.getRecord = __bind(this.getRecord, this);

    this.getKeys = __bind(this.getKeys, this);

    this.getKey = __bind(this.getKey, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      serverUnbindArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    serverUnbindArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the record key from which the client was unbound.
  	 Overrides <see cref="fm.websync.serverUnbindArgs.keys">fm.websync.serverUnbindArgs.keys</see>, <see cref="fm.websync.serverUnbindArgs.record">fm.websync.serverUnbindArgs.record</see>, and <see cref="fm.websync.serverUnbindArgs.records">fm.websync.serverUnbindArgs.records</see>.
  	 </div>
  
  	@function getKey
  	@return {fm.string}
  */


  serverUnbindArgs.prototype.getKey = function() {
    return fm.websync.extensible.sharedGetKey(this.__records);
  };

  /**
  	 <div>
  	 Gets the record keys from which the client was unbound.
  	 Overrides <see cref="fm.websync.serverUnbindArgs.key">fm.websync.serverUnbindArgs.key</see>, <see cref="fm.websync.serverUnbindArgs.record">fm.websync.serverUnbindArgs.record</see>, and <see cref="fm.websync.serverUnbindArgs.records">fm.websync.serverUnbindArgs.records</see>.
  	 </div>
  
  	@function getKeys
  	@return {fm.array}
  */


  serverUnbindArgs.prototype.getKeys = function() {
    return fm.websync.extensible.sharedGetKeys(this.__records);
  };

  /**
  	 <div>
  	 Gets the record from which the client was unbound.
  	 Overrides <see cref="fm.websync.serverUnbindArgs.records">fm.websync.serverUnbindArgs.records</see>, <see cref="fm.websync.serverUnbindArgs.key">fm.websync.serverUnbindArgs.key</see>, and <see cref="fm.websync.serverUnbindArgs.keys">fm.websync.serverUnbindArgs.keys</see>.
  	 </div>
  
  	@function getRecord
  	@return {fm.websync.record}
  */


  serverUnbindArgs.prototype.getRecord = function() {
    return fm.websync.extensible.sharedGetRecord(this.__records);
  };

  /**
  	 <div>
  	 Gets the records from which the client was unbound.
  	 Overrides <see cref="fm.websync.serverUnbindArgs.record">fm.websync.serverUnbindArgs.record</see>, <see cref="fm.websync.serverUnbindArgs.key">fm.websync.serverUnbindArgs.key</see>, and <see cref="fm.websync.serverUnbindArgs.keys">fm.websync.serverUnbindArgs.keys</see>.
  	 </div>
  
  	@function getRecords
  	@return {fm.array}
  */


  serverUnbindArgs.prototype.getRecords = function() {
    return fm.websync.extensible.sharedGetRecords(this.__records);
  };

  return serverUnbindArgs;

})(fm.websync.baseSuccessArgs);


/**
@class fm.websync.serverBindArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnServerBind">fm.websync.client.addOnServerBind</see>.
 </div>

@extends fm.websync.baseServerArgs
*/


fm.websync.serverBindArgs = (function(_super) {

  __extends(serverBindArgs, _super);

  /**
  	@ignore 
  	@description
  */


  serverBindArgs.prototype.__records = null;

  /**
  	@ignore 
  	@description
  */


  function serverBindArgs() {
    this.getRecords = __bind(this.getRecords, this);

    this.getRecord = __bind(this.getRecord, this);

    this.getKeys = __bind(this.getKeys, this);

    this.getKey = __bind(this.getKey, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      serverBindArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    serverBindArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the record key to which the client was bound.
  	 Overrides <see cref="fm.websync.serverBindArgs.keys">fm.websync.serverBindArgs.keys</see>, <see cref="fm.websync.serverBindArgs.record">fm.websync.serverBindArgs.record</see>, and <see cref="fm.websync.serverBindArgs.records">fm.websync.serverBindArgs.records</see>.
  	 </div>
  
  	@function getKey
  	@return {fm.string}
  */


  serverBindArgs.prototype.getKey = function() {
    return fm.websync.extensible.sharedGetKey(this.__records);
  };

  /**
  	 <div>
  	 Gets the record keys to which the client was bound.
  	 Overrides <see cref="fm.websync.serverBindArgs.key">fm.websync.serverBindArgs.key</see>, <see cref="fm.websync.serverBindArgs.record">fm.websync.serverBindArgs.record</see>, and <see cref="fm.websync.serverBindArgs.records">fm.websync.serverBindArgs.records</see>.
  	 </div>
  
  	@function getKeys
  	@return {fm.array}
  */


  serverBindArgs.prototype.getKeys = function() {
    return fm.websync.extensible.sharedGetKeys(this.__records);
  };

  /**
  	 <div>
  	 Gets the record to which the client was bound.
  	 Overrides <see cref="fm.websync.serverBindArgs.records">fm.websync.serverBindArgs.records</see>, <see cref="fm.websync.serverBindArgs.key">fm.websync.serverBindArgs.key</see>, and <see cref="fm.websync.serverBindArgs.keys">fm.websync.serverBindArgs.keys</see>.
  	 </div>
  
  	@function getRecord
  	@return {fm.websync.record}
  */


  serverBindArgs.prototype.getRecord = function() {
    return fm.websync.extensible.sharedGetRecord(this.__records);
  };

  /**
  	 <div>
  	 Gets the records to which the client was bound.
  	 Overrides <see cref="fm.websync.serverBindArgs.record">fm.websync.serverBindArgs.record</see>, <see cref="fm.websync.serverBindArgs.key">fm.websync.serverBindArgs.key</see>, and <see cref="fm.websync.serverBindArgs.keys">fm.websync.serverBindArgs.keys</see>.
  	 </div>
  
  	@function getRecords
  	@return {fm.array}
  */


  serverBindArgs.prototype.getRecords = function() {
    return fm.websync.extensible.sharedGetRecords(this.__records);
  };

  return serverBindArgs;

})(fm.websync.baseServerArgs);


/**
@class fm.websync.messageRequestCreatedArgs
 <div>
 Arguments passed into callbacks when a message request is created.
 </div>

@extends fm.object
*/


fm.websync.messageRequestCreatedArgs = (function(_super) {

  __extends(messageRequestCreatedArgs, _super);

  /**
  	@ignore 
  	@description
  */


  messageRequestCreatedArgs.prototype._requests = null;

  /**
  	@ignore 
  	@description
  */


  messageRequestCreatedArgs.prototype._sender = null;

  /**
  	@ignore 
  	@description
  */


  function messageRequestCreatedArgs() {
    this.setSender = __bind(this.setSender, this);

    this.setRequests = __bind(this.setRequests, this);

    this.getSender = __bind(this.getSender, this);

    this.getRequests = __bind(this.getRequests, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      messageRequestCreatedArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    messageRequestCreatedArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the outgoing messages about to be sent to the server.
  	 </div>
  
  	@function getRequests
  	@return {fm.array}
  */


  messageRequestCreatedArgs.prototype.getRequests = function() {
    return this._requests;
  };

  /**
  	 <div>
  	 Gets the sender of the request, either a client or publisher.
  	 </div>
  
  	@function getSender
  	@return {fm.object}
  */


  messageRequestCreatedArgs.prototype.getSender = function() {
    return this._sender;
  };

  /**
  	 <div>
  	 Sets the outgoing messages about to be sent to the server.
  	 </div>
  
  	@function setRequests
  	@param {fm.array} value
  	@return {void}
  */


  messageRequestCreatedArgs.prototype.setRequests = function() {
    var value;
    value = arguments[0];
    return this._requests = value;
  };

  /**
  	 <div>
  	 Sets the sender of the request, either a client or publisher.
  	 </div>
  
  	@function setSender
  	@param {fm.object} value
  	@return {void}
  */


  messageRequestCreatedArgs.prototype.setSender = function() {
    var value;
    value = arguments[0];
    return this._sender = value;
  };

  return messageRequestCreatedArgs;

})(fm.object);


/**
@class fm.websync.messageResponseReceivedArgs
 <div>
 Arguments passed into callbacks when a message response is created.
 </div>

@extends fm.object
*/


fm.websync.messageResponseReceivedArgs = (function(_super) {

  __extends(messageResponseReceivedArgs, _super);

  /**
  	@ignore 
  	@description
  */


  messageResponseReceivedArgs.prototype._responses = null;

  /**
  	@ignore 
  	@description
  */


  messageResponseReceivedArgs.prototype._sender = null;

  /**
  	@ignore 
  	@description
  */


  function messageResponseReceivedArgs() {
    this.setSender = __bind(this.setSender, this);

    this.setResponses = __bind(this.setResponses, this);

    this.getSender = __bind(this.getSender, this);

    this.getResponses = __bind(this.getResponses, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      messageResponseReceivedArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    messageResponseReceivedArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the incoming messages about to be processed by the client.
  	 </div>
  
  	@function getResponses
  	@return {fm.array}
  */


  messageResponseReceivedArgs.prototype.getResponses = function() {
    return this._responses;
  };

  /**
  	 <div>
  	 Gets the sender of the request, either a client or publisher.
  	 </div>
  
  	@function getSender
  	@return {fm.object}
  */


  messageResponseReceivedArgs.prototype.getSender = function() {
    return this._sender;
  };

  /**
  	 <div>
  	 Sets the incoming messages about to be processed by the client.
  	 </div>
  
  	@function setResponses
  	@param {fm.array} value
  	@return {void}
  */


  messageResponseReceivedArgs.prototype.setResponses = function() {
    var value;
    value = arguments[0];
    return this._responses = value;
  };

  /**
  	 <div>
  	 Sets the sender of the request, either a client or publisher.
  	 </div>
  
  	@function setSender
  	@param {fm.object} value
  	@return {void}
  */


  messageResponseReceivedArgs.prototype.setSender = function() {
    var value;
    value = arguments[0];
    return this._sender = value;
  };

  return messageResponseReceivedArgs;

})(fm.object);


/**
@class fm.websync.messageRequestArgs
 <div>
 Arguments for sending a message request.
 </div>

@extends fm.dynamic
*/


fm.websync.messageRequestArgs = (function(_super) {

  __extends(messageRequestArgs, _super);

  /**
  	@ignore 
  	@description
  */


  messageRequestArgs.prototype._headers = null;

  /**
  	@ignore 
  	@description
  */


  messageRequestArgs.prototype._messages = null;

  /**
  	@ignore 
  	@description
  */


  messageRequestArgs.prototype._onHttpRequestCreated = null;

  /**
  	@ignore 
  	@description
  */


  messageRequestArgs.prototype._onHttpResponseReceived = null;

  /**
  	@ignore 
  	@description
  */


  messageRequestArgs.prototype._onRequestCreated = null;

  /**
  	@ignore 
  	@description
  */


  messageRequestArgs.prototype._onResponseReceived = null;

  /**
  	@ignore 
  	@description
  */


  messageRequestArgs.prototype._sender = null;

  /**
  	@ignore 
  	@description
  */


  messageRequestArgs.prototype._timeout = 0;

  /**
  	@ignore 
  	@description
  */


  messageRequestArgs.prototype._url = null;

  /**
  	@ignore 
  	@description
  */


  function messageRequestArgs() {
    this.setUrl = __bind(this.setUrl, this);

    this.setTimeout = __bind(this.setTimeout, this);

    this.setSender = __bind(this.setSender, this);

    this.setOnResponseReceived = __bind(this.setOnResponseReceived, this);

    this.setOnRequestCreated = __bind(this.setOnRequestCreated, this);

    this.setOnHttpResponseReceived = __bind(this.setOnHttpResponseReceived, this);

    this.setOnHttpRequestCreated = __bind(this.setOnHttpRequestCreated, this);

    this.setMessages = __bind(this.setMessages, this);

    this.setHeaders = __bind(this.setHeaders, this);

    this.getUrl = __bind(this.getUrl, this);

    this.getTimeout = __bind(this.getTimeout, this);

    this.getSender = __bind(this.getSender, this);

    this.getOnResponseReceived = __bind(this.getOnResponseReceived, this);

    this.getOnRequestCreated = __bind(this.getOnRequestCreated, this);

    this.getOnHttpResponseReceived = __bind(this.getOnHttpResponseReceived, this);

    this.getOnHttpRequestCreated = __bind(this.getOnHttpRequestCreated, this);

    this.getMessages = __bind(this.getMessages, this);

    this.getIsBinary = __bind(this.getIsBinary, this);

    this.getHeaders = __bind(this.getHeaders, this);

    var headers;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      messageRequestArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    headers = arguments[0];
    messageRequestArgs.__super__.constructor.call(this);
    this.setTimeout(15000);
    this.setHeaders(headers);
  }

  /**
  	 <div>
  	 Gets the headers for the request.
  	 </div>
  
  	@function getHeaders
  	@return {fm.nameValueCollection}
  */


  messageRequestArgs.prototype.getHeaders = function() {
    return this._headers;
  };

  /**
  	 <div>
  	 Gets whether or not each message in the batch is in binary format and can
  	 be tranferred as such.
  	 </div>
  
  	@function getIsBinary
  	@return {fm.boolean}
  */


  messageRequestArgs.prototype.getIsBinary = function() {
    var message, _i, _len, _var0;
    _var0 = this.getMessages();
    for (_i = 0, _len = _var0.length; _i < _len; _i++) {
      message = _var0[_i];
      if (!((message.getDisableBinary() !== true) && message.getIsBinary())) {
        return false;
      }
    }
    return true;
  };

  /**
  	 <div>
  	 Gets the messages to transfer.
  	 </div>
  
  	@function getMessages
  	@return {fm.array}
  */


  messageRequestArgs.prototype.getMessages = function() {
    return this._messages;
  };

  /**
  	 <div>
  	 Gets the callback to invoke whenever an underlying HTTP request
  	 has been created and is about to be transferred to the server. This is a
  	 good place to add headers/cookies. For WebSocket streams, this will fire
  	 only once for the initial HTTP-based handshake.
  	 </div>
  
  	@function getOnHttpRequestCreated
  	@return {fm.singleAction}
  */


  messageRequestArgs.prototype.getOnHttpRequestCreated = function() {
    return this._onHttpRequestCreated;
  };

  /**
  	 <div>
  	 Gets the callback to invoke whenever an underlying HTTP response
  	 has been received and is about to be processed by the client. This is a
  	 good place to read headers/cookies. For WebSocket streams, this will fire
  	 only once for the initial HTTP-based handshake.
  	 </div>
  
  	@function getOnHttpResponseReceived
  	@return {fm.singleAction}
  */


  messageRequestArgs.prototype.getOnHttpResponseReceived = function() {
    return this._onHttpResponseReceived;
  };

  /**
  	 <div>
  	 Gets the callback to invoke whenever a new request is created
  	 and about to be transferred to the server. This is a good place to read
  	 or modify outgoing messages.
  	 </div>
  
  	@function getOnRequestCreated
  	@return {fm.singleAction}
  */


  messageRequestArgs.prototype.getOnRequestCreated = function() {
    return this._onRequestCreated;
  };

  /**
  	 <div>
  	 Gets the callback to invoke whenever a new response is received
  	 and about to be processed by the client. This is a good place to read
  	 or modify incoming messages.
  	 </div>
  
  	@function getOnResponseReceived
  	@return {fm.singleAction}
  */


  messageRequestArgs.prototype.getOnResponseReceived = function() {
    return this._onResponseReceived;
  };

  /**
  	 <div>
  	 Gets the sender of the content, either a client or publisher.
  	 </div>
  
  	@function getSender
  	@return {fm.object}
  */


  messageRequestArgs.prototype.getSender = function() {
    return this._sender;
  };

  /**
  	 <div>
  	 Gets the number of milliseconds to wait before timing out the transfer.
  	 Defaults to 15000 (15 seconds).
  	 </div>
  
  	@function getTimeout
  	@return {fm.int}
  */


  messageRequestArgs.prototype.getTimeout = function() {
    return this._timeout;
  };

  /**
  	 <div>
  	 Gets the target URL for the request.
  	 </div>
  
  	@function getUrl
  	@return {fm.string}
  */


  messageRequestArgs.prototype.getUrl = function() {
    return this._url;
  };

  /**
  	 <div>
  	 Sets the headers for the request.
  	 </div>
  
  	@function setHeaders
  	@param {fm.nameValueCollection} value
  	@return {void}
  */


  messageRequestArgs.prototype.setHeaders = function() {
    var value;
    value = arguments[0];
    return this._headers = value;
  };

  /**
  	 <div>
  	 Sets the messages to transfer.
  	 </div>
  
  	@function setMessages
  	@param {fm.array} value
  	@return {void}
  */


  messageRequestArgs.prototype.setMessages = function() {
    var value;
    value = arguments[0];
    return this._messages = value;
  };

  /**
  	 <div>
  	 Sets the callback to invoke whenever an underlying HTTP request
  	 has been created and is about to be transferred to the server. This is a
  	 good place to add headers/cookies. For WebSocket streams, this will fire
  	 only once for the initial HTTP-based handshake.
  	 </div>
  
  	@function setOnHttpRequestCreated
  	@param {fm.singleAction} value
  	@return {void}
  */


  messageRequestArgs.prototype.setOnHttpRequestCreated = function() {
    var value;
    value = arguments[0];
    return this._onHttpRequestCreated = value;
  };

  /**
  	 <div>
  	 Sets the callback to invoke whenever an underlying HTTP response
  	 has been received and is about to be processed by the client. This is a
  	 good place to read headers/cookies. For WebSocket streams, this will fire
  	 only once for the initial HTTP-based handshake.
  	 </div>
  
  	@function setOnHttpResponseReceived
  	@param {fm.singleAction} value
  	@return {void}
  */


  messageRequestArgs.prototype.setOnHttpResponseReceived = function() {
    var value;
    value = arguments[0];
    return this._onHttpResponseReceived = value;
  };

  /**
  	 <div>
  	 Sets the callback to invoke whenever a new request is created
  	 and about to be transferred to the server. This is a good place to read
  	 or modify outgoing messages.
  	 </div>
  
  	@function setOnRequestCreated
  	@param {fm.singleAction} value
  	@return {void}
  */


  messageRequestArgs.prototype.setOnRequestCreated = function() {
    var value;
    value = arguments[0];
    return this._onRequestCreated = value;
  };

  /**
  	 <div>
  	 Sets the callback to invoke whenever a new response is received
  	 and about to be processed by the client. This is a good place to read
  	 or modify incoming messages.
  	 </div>
  
  	@function setOnResponseReceived
  	@param {fm.singleAction} value
  	@return {void}
  */


  messageRequestArgs.prototype.setOnResponseReceived = function() {
    var value;
    value = arguments[0];
    return this._onResponseReceived = value;
  };

  /**
  	 <div>
  	 Sets the sender of the content, either a client or publisher.
  	 </div>
  
  	@function setSender
  	@param {fm.object} value
  	@return {void}
  */


  messageRequestArgs.prototype.setSender = function() {
    var value;
    value = arguments[0];
    return this._sender = value;
  };

  /**
  	 <div>
  	 Sets the number of milliseconds to wait before timing out the transfer.
  	 Defaults to 15000 (15 seconds).
  	 </div>
  
  	@function setTimeout
  	@param {fm.int} value
  	@return {void}
  */


  messageRequestArgs.prototype.setTimeout = function() {
    var value;
    value = arguments[0];
    return this._timeout = value;
  };

  /**
  	 <div>
  	 Sets the target URL for the request.
  	 </div>
  
  	@function setUrl
  	@param {fm.string} value
  	@return {void}
  */


  messageRequestArgs.prototype.setUrl = function() {
    var value;
    value = arguments[0];
    return this._url = value;
  };

  return messageRequestArgs;

})(fm.dynamic);


/**
@class fm.websync.messageResponseArgs
 <div>
 Arguments for receiving a message response.
 </div>

@extends fm.dynamic
*/


fm.websync.messageResponseArgs = (function(_super) {

  __extends(messageResponseArgs, _super);

  /**
  	@ignore 
  	@description
  */


  messageResponseArgs.prototype._exception = null;

  /**
  	@ignore 
  	@description
  */


  messageResponseArgs.prototype._headers = null;

  /**
  	@ignore 
  	@description
  */


  messageResponseArgs.prototype._messages = null;

  /**
  	@ignore 
  	@description
  */


  messageResponseArgs.prototype._requestArgs = null;

  /**
  	@ignore 
  	@description
  */


  function messageResponseArgs() {
    this.setRequestArgs = __bind(this.setRequestArgs, this);

    this.setMessages = __bind(this.setMessages, this);

    this.setHeaders = __bind(this.setHeaders, this);

    this.setException = __bind(this.setException, this);

    this.getRequestArgs = __bind(this.getRequestArgs, this);

    this.getMessages = __bind(this.getMessages, this);

    this.getHeaders = __bind(this.getHeaders, this);

    this.getException = __bind(this.getException, this);

    var requestArgs;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      messageResponseArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    requestArgs = arguments[0];
    messageResponseArgs.__super__.constructor.call(this);
    this.setRequestArgs(requestArgs);
  }

  /**
  	 <div>
  	 Gets the exception generated while completing the request.
  	 </div>
  
  	@function getException
  	@return {Error}
  */


  messageResponseArgs.prototype.getException = function() {
    return this._exception;
  };

  /**
  	 <div>
  	 Gets the headers for the response.
  	 </div>
  
  	@function getHeaders
  	@return {fm.nameValueCollection}
  */


  messageResponseArgs.prototype.getHeaders = function() {
    return this._headers;
  };

  /**
  	 <div>
  	 Gets the messages read from the response.
  	 </div>
  
  	@function getMessages
  	@return {fm.array}
  */


  messageResponseArgs.prototype.getMessages = function() {
    return this._messages;
  };

  /**
  	 <div>
  	 Gets the original <see cref="fm.websync.messageRequestArgs">fm.websync.messageRequestArgs</see>.
  	 </div>
  
  	@function getRequestArgs
  	@return {fm.websync.messageRequestArgs}
  */


  messageResponseArgs.prototype.getRequestArgs = function() {
    return this._requestArgs;
  };

  /**
  	 <div>
  	 Sets the exception generated while completing the request.
  	 </div>
  
  	@function setException
  	@param {Error} value
  	@return {void}
  */


  messageResponseArgs.prototype.setException = function() {
    var value;
    value = arguments[0];
    return this._exception = value;
  };

  /**
  	 <div>
  	 Sets the headers for the response.
  	 </div>
  
  	@function setHeaders
  	@param {fm.nameValueCollection} value
  	@return {void}
  */


  messageResponseArgs.prototype.setHeaders = function() {
    var value;
    value = arguments[0];
    return this._headers = value;
  };

  /**
  	 <div>
  	 Sets the messages read from the response.
  	 </div>
  
  	@function setMessages
  	@param {fm.array} value
  	@return {void}
  */


  messageResponseArgs.prototype.setMessages = function() {
    var value;
    value = arguments[0];
    return this._messages = value;
  };

  /**
  	 <div>
  	 Sets the original <see cref="fm.websync.messageRequestArgs">fm.websync.messageRequestArgs</see>.
  	 </div>
  
  	@function setRequestArgs
  	@param {fm.websync.messageRequestArgs} value
  	@return {void}
  */


  messageResponseArgs.prototype.setRequestArgs = function() {
    var value;
    value = arguments[0];
    return this._requestArgs = value;
  };

  return messageResponseArgs;

})(fm.dynamic);


/**
@class fm.websync.notifyArgs
 <div>
 Arguments for client notify requests.
 </div>

@extends fm.websync.baseInputArgsGeneric
*/


fm.websync.notifyArgs = (function(_super) {

  __extends(notifyArgs, _super);

  /**
  	@ignore 
  	@description
  */


  notifyArgs.prototype.__dataJson = null;

  /**
  	@ignore 
  	@description
  */


  function notifyArgs() {
    this.setData = __bind(this.setData, this);

    this.getData = __bind(this.getData, this);

    this.setTag = __bind(this.setTag, this);

    this.setDataJson = __bind(this.setDataJson, this);

    this.setClientId = __bind(this.setClientId, this);

    this.getTag = __bind(this.getTag, this);

    this.getDataJson = __bind(this.getDataJson, this);

    this.getClientId = __bind(this.getClientId, this);

    var clientId, dataJson, tag;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      notifyArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    if (arguments.length === 3) {
      clientId = arguments[0];
      dataJson = arguments[1];
      tag = arguments[2];
      notifyArgs.__super__.constructor.call(this);
      this.setClientId(clientId);
      this.setDataJson(dataJson);
      this.setTag(tag);
      return;
    }
    if (arguments.length === 2) {
      clientId = arguments[0];
      dataJson = arguments[1];
      notifyArgs.call(this, clientId, dataJson, null);
      return;
    }
  }

  /**
  	 <div>
  	 Gets the client ID to notify.
  	 </div>
  
  	@function getClientId
  	@return {fm.guid}
  */


  notifyArgs.prototype.getClientId = function() {
    var nullable;
    nullable = fm.serializer.deserializeGuid(this.getExtensionValueJson("fm.notify"));
    if (nullable !== null) {
      return nullable;
    }
    return fm.guid.empty;
  };

  /**
  	 <div>
  	 Gets the data to send in JSON format.
  	 (Overrides <see cref="fm.websync.notifyArgs.dataBytes">fm.websync.notifyArgs.dataBytes</see>.)
  	 </div>
  
  	@function getDataJson
  	@return {fm.string}
  */


  notifyArgs.prototype.getDataJson = function() {
    return this.__dataJson;
  };

  /**
  	 <div>
  	 Gets the tag that identifies the contents of the payload.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  notifyArgs.prototype.getTag = function() {
    return fm.serializer.deserializeString(this.getExtensionValueJson("fm.tag"));
  };

  /**
  	 <div>
  	 Sets the client ID to notify.
  	 </div>
  
  	@function setClientId
  	@param {fm.guid} value
  	@return {void}
  */


  notifyArgs.prototype.setClientId = function() {
    var value;
    value = arguments[0];
    return this.setExtensionValueJson("fm.notify", fm.serializer.serializeGuid(value), false);
  };

  /**
  	 <div>
  	 Sets the data to send in JSON format.
  	 (Overrides <see cref="fm.websync.notifyArgs.dataBytes">fm.websync.notifyArgs.dataBytes</see>.)
  	 </div>
  
  	@function setDataJson
  	@param {fm.string} value
  	@return {void}
  */


  notifyArgs.prototype.setDataJson = function() {
    var value, _var0;
    value = arguments[0];
    _var0 = value;
    if (!((_var0 === null || typeof _var0 === 'undefined') || fm.serializer.isValidJson(value))) {
      throw new Error("The value is not valid JSON.");
    }
    return this.__dataJson = value;
  };

  /**
  	 <div>
  	 Sets the tag that identifies the contents of the payload.
  	 </div>
  
  	@function setTag
  	@param {fm.string} value
  	@return {void}
  */


  notifyArgs.prototype.setTag = function() {
    var value;
    value = arguments[0];
    return this.setExtensionValueJson("fm.tag", fm.serializer.serializeString(value), false);
  };

  /**
  
  	@function getData
  	@return {fm.hash}
  */


  notifyArgs.prototype.getData = function() {
    return fm.json.deserialize(this.getDataJson.apply(this, arguments));
  };

  /**
  
  	@function setData
  	@param {fm.hash} data
  	@return {}
  */


  notifyArgs.prototype.setData = function() {
    var data;
    data = arguments[0];
    arguments[arguments.length - 1] = fm.json.serialize(arguments[arguments.length - 1]);
    return this.setDataJson.apply(this, arguments);
  };

  return notifyArgs;

})(fm.websync.baseInputArgsGeneric);


/**
@class fm.websync.baseCompleteArgs
 <div>
 Base arguments for <see cref="fm.websync.client">fm.websync.client</see> "OnComplete" callbacks.
 </div>

@extends fm.websync.baseOutputArgs
*/


fm.websync.baseCompleteArgs = (function(_super) {

  __extends(baseCompleteArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function baseCompleteArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      baseCompleteArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    baseCompleteArgs.__super__.constructor.call(this);
  }

  return baseCompleteArgs;

})(fm.websync.baseOutputArgs);


/**
@class fm.websync.notifyCompleteArgs
 <div>
 Arguments for notify complete callbacks.
 </div>

@extends fm.websync.baseCompleteArgs
*/


fm.websync.notifyCompleteArgs = (function(_super) {

  __extends(notifyCompleteArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function notifyCompleteArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      notifyCompleteArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    notifyCompleteArgs.__super__.constructor.call(this);
  }

  return notifyCompleteArgs;

})(fm.websync.baseCompleteArgs);


/**
@class fm.websync.baseFailureArgs
 <div>
 Base arguments for <see cref="fm.websync.client">fm.websync.client</see> "OnFailure" callbacks.
 </div>

@extends fm.websync.baseOutputArgs
*/


fm.websync.baseFailureArgs = (function(_super) {

  __extends(baseFailureArgs, _super);

  /**
  	@ignore 
  	@description
  */


  baseFailureArgs.prototype._exception = null;

  /**
  	@ignore 
  	@description
  */


  baseFailureArgs.prototype._retry = false;

  /**
  	@ignore 
  	@description
  */


  function baseFailureArgs() {
    this.setRetry = __bind(this.setRetry, this);

    this.setException = __bind(this.setException, this);

    this.getRetry = __bind(this.getRetry, this);

    this.getException = __bind(this.getException, this);

    this.getErrorMessage = __bind(this.getErrorMessage, this);

    this.getErrorCode = __bind(this.getErrorCode, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      baseFailureArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    baseFailureArgs.__super__.constructor.call(this);
  }

  /**
  
  	@function getErrorCode
  	@param {Error} exception
  	@return {fm.int}
  */


  baseFailureArgs.getErrorCode = function() {
    var exception, intResult, s, _var0, _var1, _var2;
    exception = arguments[0];
    intResult = -1;
    try {
      _var0 = exception;
      if ((_var0 === null || typeof _var0 === 'undefined') || fm.stringExtensions.isNullOrEmpty(exception.message)) {
        return intResult;
      }
      if (fm.stringExtensions.indexOf(exception.message, "::") > -1) {
        s = fm.websync.splitter.split(exception.message, "::")[0];
        _var1 = new fm.holder(intResult);
        _var2 = fm.parseAssistant.tryParseInteger(s, _var1);
        intResult = _var1.getValue();
        _var2;

      }
    } catch (obj1) {

    } finally {

    }
    return intResult;
  };

  /**
  
  	@function getErrorMessage
  	@param {Error} exception
  	@return {fm.string}
  */


  baseFailureArgs.getErrorMessage = function() {
    var exception, message, _var0;
    exception = arguments[0];
    message = null;
    try {
      _var0 = exception;
      if ((_var0 === null || typeof _var0 === 'undefined') || fm.stringExtensions.isNullOrEmpty(exception.message)) {
        return message;
      }
      if (fm.stringExtensions.indexOf(exception.message, "::") > -1) {
        return fm.websync.splitter.split(exception.message, "::")[1];
      }
      message = exception.message;
    } catch (obj1) {

    } finally {

    }
    return message;
  };

  /**
  	 <div>
  	 Gets the error code value, if the exception was generated by WebSync; otherwise -1.
  	 </div>
  
  	@function getErrorCode
  	@return {fm.int}
  */


  baseFailureArgs.prototype.getErrorCode = function() {
    return fm.websync.baseFailureArgs.getErrorCode(this.getException());
  };

  /**
  	 <div>
  	 Gets the error message value, if the exception was generated by WebSync; otherwise <c>null</c>.
  	 </div>
  
  	@function getErrorMessage
  	@return {fm.string}
  */


  baseFailureArgs.prototype.getErrorMessage = function() {
    return fm.websync.baseFailureArgs.getErrorMessage(this.getException());
  };

  /**
  	 <div>
  	 Gets the exception generated while completing the request.
  	 </div>
  
  	@function getException
  	@return {Error}
  */


  baseFailureArgs.prototype.getException = function() {
    return this._exception;
  };

  /**
  	 <div>
  	 Gets whether or not to retry automatically after completing this operation.
  	 </div>
  
  	@function getRetry
  	@return {fm.boolean}
  */


  baseFailureArgs.prototype.getRetry = function() {
    return this._retry;
  };

  /**
  	 <div>
  	 Sets the exception generated while completing the request.
  	 </div>
  
  	@function setException
  	@param {Error} value
  	@return {void}
  */


  baseFailureArgs.prototype.setException = function() {
    var value;
    value = arguments[0];
    return this._exception = value;
  };

  /**
  	 <div>
  	 Sets whether or not to retry automatically after completing this operation.
  	 </div>
  
  	@function setRetry
  	@param {fm.boolean} value
  	@return {void}
  */


  baseFailureArgs.prototype.setRetry = function() {
    var value;
    value = arguments[0];
    return this._retry = value;
  };

  return baseFailureArgs;

}).call(this, fm.websync.baseOutputArgs);


/**
@class fm.websync.notifyFailureArgs
 <div>
 Arguments for notify failure callbacks.
 </div>

@extends fm.websync.baseFailureArgs
*/


fm.websync.notifyFailureArgs = (function(_super) {

  __extends(notifyFailureArgs, _super);

  /**
  	@ignore 
  	@description
  */


  notifyFailureArgs.prototype.__dataJson = null;

  /**
  	@ignore 
  	@description
  */


  function notifyFailureArgs() {
    this.getData = __bind(this.getData, this);

    this.getTag = __bind(this.getTag, this);

    this.getDataJson = __bind(this.getDataJson, this);

    this.getClientId = __bind(this.getClientId, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      notifyFailureArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    notifyFailureArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the client ID to which the data failed to be sent.
  	 </div>
  
  	@function getClientId
  	@return {fm.guid}
  */


  notifyFailureArgs.prototype.getClientId = function() {
    var nullable;
    nullable = fm.serializer.deserializeGuid(this.getExtensionValueJson("fm.notify"));
    if (nullable !== null) {
      return nullable;
    }
    return fm.guid.empty;
  };

  /**
  	 <div>
  	 Gets the data that failed to be sent in JSON format.
  	 </div>
  
  	@function getDataJson
  	@return {fm.string}
  */


  notifyFailureArgs.prototype.getDataJson = function() {
    return this.__dataJson;
  };

  /**
  	 <div>
  	 Gets the tag that identifies the contents of the payload.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  notifyFailureArgs.prototype.getTag = function() {
    return fm.serializer.deserializeString(this.getExtensionValueJson("fm.tag"));
  };

  /**
  
  	@function getData
  	@return {fm.hash}
  */


  notifyFailureArgs.prototype.getData = function() {
    return fm.json.deserialize(this.getDataJson.apply(this, arguments));
  };

  return notifyFailureArgs;

})(fm.websync.baseFailureArgs);


/**
@class fm.websync.notifySuccessArgs
 <div>
 Arguments for notify success callbacks.
 </div>

@extends fm.websync.baseSuccessArgs
*/


fm.websync.notifySuccessArgs = (function(_super) {

  __extends(notifySuccessArgs, _super);

  /**
  	@ignore 
  	@description
  */


  notifySuccessArgs.prototype.__dataJson = null;

  /**
  	@ignore 
  	@description
  */


  function notifySuccessArgs() {
    this.getData = __bind(this.getData, this);

    this.getTag = __bind(this.getTag, this);

    this.getDataJson = __bind(this.getDataJson, this);

    this.getClientId = __bind(this.getClientId, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      notifySuccessArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    notifySuccessArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the client ID to which the data was sent.
  	 </div>
  
  	@function getClientId
  	@return {fm.guid}
  */


  notifySuccessArgs.prototype.getClientId = function() {
    var nullable;
    nullable = fm.serializer.deserializeGuid(this.getExtensionValueJson("fm.notify"));
    if (nullable !== null) {
      return nullable;
    }
    return fm.guid.empty;
  };

  /**
  	 <div>
  	 Gets the data that was sent in JSON format.
  	 </div>
  
  	@function getDataJson
  	@return {fm.string}
  */


  notifySuccessArgs.prototype.getDataJson = function() {
    return this.__dataJson;
  };

  /**
  	 <div>
  	 Gets the tag that identifies the contents of the payload.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  notifySuccessArgs.prototype.getTag = function() {
    return fm.serializer.deserializeString(this.getExtensionValueJson("fm.tag"));
  };

  /**
  
  	@function getData
  	@return {fm.hash}
  */


  notifySuccessArgs.prototype.getData = function() {
    return fm.json.deserialize(this.getDataJson.apply(this, arguments));
  };

  return notifySuccessArgs;

})(fm.websync.baseSuccessArgs);


/**
@class fm.websync.publisherNotifyResponseArgs
 <div>
 Arguments for <see cref="fm.websync.publisher.addOnNotifyResponse">fm.websync.publisher.addOnNotifyResponse</see>.
 </div>

@extends fm.websync.basePublisherResponseEventArgsGeneric
*/


fm.websync.publisherNotifyResponseArgs = (function(_super) {

  __extends(publisherNotifyResponseArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function publisherNotifyResponseArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      publisherNotifyResponseArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    publisherNotifyResponseArgs.__super__.constructor.call(this);
  }

  return publisherNotifyResponseArgs;

})(fm.websync.basePublisherResponseEventArgsGeneric);


/**
@class fm.websync.publisherNotifyRequestArgs
 <div>
 Arguments for <see cref="fm.websync.publisher.addOnNotifyRequest">fm.websync.publisher.addOnNotifyRequest</see>.
 </div>

@extends fm.websync.basePublisherRequestEventArgsGeneric
*/


fm.websync.publisherNotifyRequestArgs = (function(_super) {

  __extends(publisherNotifyRequestArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function publisherNotifyRequestArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      publisherNotifyRequestArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    publisherNotifyRequestArgs.__super__.constructor.call(this);
  }

  return publisherNotifyRequestArgs;

})(fm.websync.basePublisherRequestEventArgsGeneric);


/**
@class fm.websync.clientResponseArgs
 <div>
 The internal representation of data received in response to a client request.
 </div>

@extends fm.dynamic
*/


fm.websync.clientResponseArgs = (function(_super) {

  __extends(clientResponseArgs, _super);

  /**
  	@ignore 
  	@description
  */


  clientResponseArgs.prototype._exception = null;

  /**
  	@ignore 
  	@description
  */


  clientResponseArgs.prototype._responses = null;

  /**
  	@ignore 
  	@description
  */


  function clientResponseArgs() {
    this.setResponses = __bind(this.setResponses, this);

    this.setResponse = __bind(this.setResponse, this);

    this.setException = __bind(this.setException, this);

    this.getResponses = __bind(this.getResponses, this);

    this.getResponse = __bind(this.getResponse, this);

    this.getException = __bind(this.getException, this);

    this.getErrorMessage = __bind(this.getErrorMessage, this);

    this.getErrorCode = __bind(this.getErrorCode, this);

    var dynamicProperties;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientResponseArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    dynamicProperties = arguments[0];
    clientResponseArgs.__super__.constructor.call(this);
    this.setDynamicProperties(dynamicProperties);
  }

  /**
  	 <div>
  	 Gets the error code value, if the exception was generated by WebSync; otherwise -1.
  	 </div>
  
  	@function getErrorCode
  	@return {fm.int}
  */


  clientResponseArgs.prototype.getErrorCode = function() {
    return fm.websync.baseFailureArgs.getErrorCode(this.getException());
  };

  /**
  	 <div>
  	 Gets the error message value, if the exception was generated by WebSync; otherwise <c>null</c>.
  	 </div>
  
  	@function getErrorMessage
  	@return {fm.string}
  */


  clientResponseArgs.prototype.getErrorMessage = function() {
    return fm.websync.baseFailureArgs.getErrorMessage(this.getException());
  };

  /**
  	 <div>
  	 Gets the exception generated by the request.
  	 </div>
  
  	@function getException
  	@return {Error}
  */


  clientResponseArgs.prototype.getException = function() {
    return this._exception;
  };

  /**
  	 <div>
  	 Gets the first response received from the server.
  	 </div>
  
  	@function getResponse
  	@return {fm.websync.message}
  */


  clientResponseArgs.prototype.getResponse = function() {
    var _var0;
    _var0 = this.getResponses();
    if ((_var0 === null || typeof _var0 === 'undefined') || (this.getResponses().length === 0)) {
      return null;
    }
    return this.getResponses()[0];
  };

  /**
  	 <div>
  	 Gets the responses received from the server.
  	 </div>
  
  	@function getResponses
  	@return {fm.array}
  */


  clientResponseArgs.prototype.getResponses = function() {
    return this._responses;
  };

  /**
  	 <div>
  	 Sets the exception generated by the request.
  	 </div>
  
  	@function setException
  	@param {Error} value
  	@return {void}
  */


  clientResponseArgs.prototype.setException = function() {
    var value;
    value = arguments[0];
    return this._exception = value;
  };

  /**
  	 <div>
  	 Sets the first response received from the server.
  	 </div>
  
  	@function setResponse
  	@param {fm.websync.message} value
  	@return {void}
  */


  clientResponseArgs.prototype.setResponse = function() {
    var value;
    value = arguments[0];
    return this.setResponses([value]);
  };

  /**
  	 <div>
  	 Sets the responses received from the server.
  	 </div>
  
  	@function setResponses
  	@param {fm.array} value
  	@return {void}
  */


  clientResponseArgs.prototype.setResponses = function() {
    var value;
    value = arguments[0];
    return this._responses = value;
  };

  return clientResponseArgs;

})(fm.dynamic);


/**
@class fm.websync.connectArgs
 <div>
 Arguments for client connect requests.
 </div>

@extends fm.websync.baseInputArgsGeneric
*/


fm.websync.connectArgs = (function(_super) {

  __extends(connectArgs, _super);

  /**
  	@ignore 
  	@description
  */


  connectArgs.prototype._defaultRetryBackoffTimeout = 0;

  /**
  	@ignore 
  	@description
  */


  connectArgs.prototype._isReconnect = false;

  /**
  	@ignore 
  	@description
  */


  connectArgs.prototype._lastClientId = null;

  /**
  	@ignore 
  	@description
  */


  connectArgs.prototype._lastSessionId = null;

  /**
  	@ignore 
  	@description
  */


  connectArgs.prototype._onStreamFailure = null;

  /**
  	@ignore 
  	@description
  */


  connectArgs.prototype._retryBackoff = null;

  /**
  	@ignore 
  	@description
  */


  connectArgs.prototype._retryMode = null;

  /**
  	@ignore 
  	@description
  */


  function connectArgs() {
    this.setRetryMode = __bind(this.setRetryMode, this);

    this.setRetryBackoff = __bind(this.setRetryBackoff, this);

    this.setOnStreamFailure = __bind(this.setOnStreamFailure, this);

    this.setLastSessionId = __bind(this.setLastSessionId, this);

    this.setLastClientId = __bind(this.setLastClientId, this);

    this.setIsReconnect = __bind(this.setIsReconnect, this);

    this.getRetryMode = __bind(this.getRetryMode, this);

    this.getRetryBackoff = __bind(this.getRetryBackoff, this);

    this.getOnStreamFailure = __bind(this.getOnStreamFailure, this);

    this.getLastSessionId = __bind(this.getLastSessionId, this);

    this.getLastClientId = __bind(this.getLastClientId, this);

    this.getIsReconnect = __bind(this.getIsReconnect, this);

    this.defaultRetryBackoff = __bind(this.defaultRetryBackoff, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      connectArgs.__super__.constructor.call(this);
      this._defaultRetryBackoffTimeout = 500;
      this.setRetryMode(fm.websync.connectRetryMode.Intelligent);
      this.setRetryBackoff(this.defaultRetryBackoff);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    connectArgs.__super__.constructor.call(this);
    this._defaultRetryBackoffTimeout = 500;
    this.setRetryMode(fm.websync.connectRetryMode.Intelligent);
    this.setRetryBackoff(this.defaultRetryBackoff);
  }

  /**
  
  	@function defaultRetryBackoff
  	@param {fm.websync.backoffArgs} e
  	@return {fm.int}
  */


  connectArgs.prototype.defaultRetryBackoff = function() {
    var e;
    e = arguments[0];
    if (e.getIndex() === 0) {
      return this._defaultRetryBackoffTimeout;
    }
    return e.getLastTimeout() * 2;
  };

  /**
  	 <div>
  	 Gets whether or not the connect is occurring because the connection has been lost and needs to be re-negotiated.
  	 </div>
  
  	@function getIsReconnect
  	@return {fm.boolean}
  */


  connectArgs.prototype.getIsReconnect = function() {
    return this._isReconnect;
  };

  /**
  	 <div>
  	 Gets the last client ID.
  	 </div>
  
  	@function getLastClientId
  	@return {fm.nullable}
  */


  connectArgs.prototype.getLastClientId = function() {
    return this._lastClientId;
  };

  /**
  	 <div>
  	 Gets the last session ID.
  	 </div>
  
  	@function getLastSessionId
  	@return {fm.nullable}
  */


  connectArgs.prototype.getLastSessionId = function() {
    return this._lastSessionId;
  };

  /**
  	 <div>
  	 Gets the callback to invoke if the streaming connection fails.
  	 See <see cref="fm.websync.streamFailureArgs">fm.websync.streamFailureArgs</see> for callback argument details.
  	 </div><div>
  	 <p>
  	 This method will be invoked if the connection was lost or the client
  	 record no longer exists on the server (either due to network loss or
  	 an application pool recycle). In either case, the client will automatically
  	 reconnect after firing this callback. If the reconnect succeeds, the
  	 OnSuccess callback will be invoked with <see cref="fm.websync.connectSuccessArgs.isReconnect">fm.websync.connectSuccessArgs.isReconnect</see>
  	 set to <c>true</c>. If the reconnect succeeds, the OnFailure callback
  	 will be invoked with <see cref="fm.websync.connectFailureArgs.isReconnect">fm.websync.connectFailureArgs.isReconnect</see> set
  	 to <c>true</c>.
  	 </p>
  	 <p>
  	 This is the recommended place to perform any UI updates necessary to
  	 inform the application user that the connection has been temporarily
  	 lost. Any UI components shown by this callback can be hidden in
  	 either OnSuccess or OnFailure.
  	 </p>
  	 </div>
  
  	@function getOnStreamFailure
  	@return {fm.singleAction}
  */


  connectArgs.prototype.getOnStreamFailure = function() {
    return this._onStreamFailure;
  };

  /**
  	 <div>
  	 Gets the backoff algorithm to use when retrying a failed connect handshake.
  	 Used to calculate the sleep timeout before retrying if <see cref="fm.websync.baseFailureArgs.retry">fm.websync.baseFailureArgs.retry</see>
  	 is set to <c>true</c> in <see cref="fm.websync.connectFailureArgs">fm.websync.connectFailureArgs</see>. The function should return
  	 the desired timeout in milliseconds.
  	 </div>
  
  	@function getRetryBackoff
  	@return {fm.singleFunction}
  */


  connectArgs.prototype.getRetryBackoff = function() {
    return this._retryBackoff;
  };

  /**
  	 <div>
  	 Gets the mode under which the client is expected to operate when
  	 a connect handshake fails. This property controls the default value of
  	 <see cref="fm.websync.baseFailureArgs.retry">fm.websync.baseFailureArgs.retry</see> in <see cref="fm.websync.connectFailureArgs">fm.websync.connectFailureArgs</see>,
  	 which can be overridden.
  	 </div>
  
  	@function getRetryMode
  	@return {fm.websync.connectRetryMode}
  */


  connectArgs.prototype.getRetryMode = function() {
    return this._retryMode;
  };

  /**
  	 <div>
  	 Sets whether or not the connect is occurring because the connection has been lost and needs to be re-negotiated.
  	 </div>
  
  	@function setIsReconnect
  	@param {fm.boolean} value
  	@return {void}
  */


  connectArgs.prototype.setIsReconnect = function() {
    var value;
    value = arguments[0];
    return this._isReconnect = value;
  };

  /**
  	 <div>
  	 Sets the last client ID.
  	 </div>
  
  	@function setLastClientId
  	@param {fm.nullable} value
  	@return {void}
  */


  connectArgs.prototype.setLastClientId = function() {
    var value;
    value = arguments[0];
    return this._lastClientId = value;
  };

  /**
  	 <div>
  	 Sets the last session ID.
  	 </div>
  
  	@function setLastSessionId
  	@param {fm.nullable} value
  	@return {void}
  */


  connectArgs.prototype.setLastSessionId = function() {
    var value;
    value = arguments[0];
    return this._lastSessionId = value;
  };

  /**
  	 <div>
  	 Sets the callback to invoke if the streaming connection fails.
  	 See <see cref="fm.websync.streamFailureArgs">fm.websync.streamFailureArgs</see> for callback argument details.
  	 </div><div>
  	 <p>
  	 This method will be invoked if the connection was lost or the client
  	 record no longer exists on the server (either due to network loss or
  	 an application pool recycle). In either case, the client will automatically
  	 reconnect after firing this callback. If the reconnect succeeds, the
  	 OnSuccess callback will be invoked with <see cref="fm.websync.connectSuccessArgs.isReconnect">fm.websync.connectSuccessArgs.isReconnect</see>
  	 set to <c>true</c>. If the reconnect succeeds, the OnFailure callback
  	 will be invoked with <see cref="fm.websync.connectFailureArgs.isReconnect">fm.websync.connectFailureArgs.isReconnect</see> set
  	 to <c>true</c>.
  	 </p>
  	 <p>
  	 This is the recommended place to perform any UI updates necessary to
  	 inform the application user that the connection has been temporarily
  	 lost. Any UI components shown by this callback can be hidden in
  	 either OnSuccess or OnFailure.
  	 </p>
  	 </div>
  
  	@function setOnStreamFailure
  	@param {fm.singleAction} value
  	@return {void}
  */


  connectArgs.prototype.setOnStreamFailure = function() {
    var value;
    value = arguments[0];
    return this._onStreamFailure = value;
  };

  /**
  	 <div>
  	 Sets the backoff algorithm to use when retrying a failed connect handshake.
  	 Used to calculate the sleep timeout before retrying if <see cref="fm.websync.baseFailureArgs.retry">fm.websync.baseFailureArgs.retry</see>
  	 is set to <c>true</c> in <see cref="fm.websync.connectFailureArgs">fm.websync.connectFailureArgs</see>. The function should return
  	 the desired timeout in milliseconds.
  	 </div>
  
  	@function setRetryBackoff
  	@param {fm.singleFunction} value
  	@return {void}
  */


  connectArgs.prototype.setRetryBackoff = function() {
    var value;
    value = arguments[0];
    return this._retryBackoff = value;
  };

  /**
  	 <div>
  	 Sets the mode under which the client is expected to operate when
  	 a connect handshake fails. This property controls the default value of
  	 <see cref="fm.websync.baseFailureArgs.retry">fm.websync.baseFailureArgs.retry</see> in <see cref="fm.websync.connectFailureArgs">fm.websync.connectFailureArgs</see>,
  	 which can be overridden.
  	 </div>
  
  	@function setRetryMode
  	@param {fm.websync.connectRetryMode} value
  	@return {void}
  */


  connectArgs.prototype.setRetryMode = function() {
    var value;
    value = arguments[0];
    return this._retryMode = value;
  };

  return connectArgs;

})(fm.websync.baseInputArgsGeneric);


/**
@class fm.websync.bindArgs
 <div>
 Arguments for client bind requests.
 </div>

@extends fm.websync.baseInputArgsGeneric
*/


fm.websync.bindArgs = (function(_super) {

  __extends(bindArgs, _super);

  /**
  	@ignore 
  	@description
  */


  bindArgs.prototype.__records = null;

  /**
  	@ignore 
  	@description
  */


  bindArgs.prototype._autoRebind = null;

  /**
  	@ignore 
  	@description
  */


  bindArgs.prototype._isRebind = false;

  /**
  	@ignore 
  	@description
  */


  function bindArgs() {
    this.setRecords = __bind(this.setRecords, this);

    this.setRecord = __bind(this.setRecord, this);

    this.setIsRebind = __bind(this.setIsRebind, this);

    this.setAutoRebind = __bind(this.setAutoRebind, this);

    this.getRecords = __bind(this.getRecords, this);

    this.getRecord = __bind(this.getRecord, this);

    this.getIsRebind = __bind(this.getIsRebind, this);

    this.getAutoRebind = __bind(this.getAutoRebind, this);

    var records;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      bindArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    records = arguments[0];
    bindArgs.__super__.constructor.call(this);
    this.setRecords(records);
  }

  /**
  	 <div>
  	 Gets whether to invoke this call to bind
  	 automatically after a reconnect following a stream failure.
  	 Should be <c>false</c> if Bind is invoked inside a method
  	 that will already be invoked automatically (like another
  	 client callback). Should be <c>true</c> if Bind needs to
  	 be invoked, but the call doesn't exist inside a callback
  	 chain. If set to <c>null</c>, the client will analyze the
  	 current context and switch to <c>false</c> if the call
  	 is executing within a callback chain, and switch to <c>true</c>
  	 otherwise. Defaults to <c>null</c>.
  	 </div>
  
  	@function getAutoRebind
  	@return {fm.nullable}
  */


  bindArgs.prototype.getAutoRebind = function() {
    return this._autoRebind;
  };

  /**
  	 <div>
  	 Gets whether or not the bind is occurring because the connection has been lost and re-negotiated.
  	 </div>
  
  	@function getIsRebind
  	@return {fm.boolean}
  */


  bindArgs.prototype.getIsRebind = function() {
    return this._isRebind;
  };

  /**
  	 <div>
  	 Gets the record to bind.
  	 Overrides <see cref="fm.websync.bindArgs.records">fm.websync.bindArgs.records</see>.
  	 </div>
  
  	@function getRecord
  	@return {fm.websync.record}
  */


  bindArgs.prototype.getRecord = function() {
    return fm.websync.extensible.sharedGetRecord(this.__records);
  };

  /**
  	 <div>
  	 Gets the records to bind.
  	 Overrides <see cref="fm.websync.bindArgs.record">fm.websync.bindArgs.record</see>.
  	 </div>
  
  	@function getRecords
  	@return {fm.array}
  */


  bindArgs.prototype.getRecords = function() {
    return fm.websync.extensible.sharedGetRecords(this.__records);
  };

  /**
  	 <div>
  	 Sets whether to invoke this call to bind
  	 automatically after a reconnect following a stream failure.
  	 Should be <c>false</c> if Bind is invoked inside a method
  	 that will already be invoked automatically (like another
  	 client callback). Should be <c>true</c> if Bind needs to
  	 be invoked, but the call doesn't exist inside a callback
  	 chain. If set to <c>null</c>, the client will analyze the
  	 current context and switch to <c>false</c> if the call
  	 is executing within a callback chain, and switch to <c>true</c>
  	 otherwise. Defaults to <c>null</c>.
  	 </div>
  
  	@function setAutoRebind
  	@param {fm.nullable} value
  	@return {void}
  */


  bindArgs.prototype.setAutoRebind = function() {
    var value;
    value = arguments[0];
    return this._autoRebind = value;
  };

  /**
  	 <div>
  	 Sets whether or not the bind is occurring because the connection has been lost and re-negotiated.
  	 </div>
  
  	@function setIsRebind
  	@param {fm.boolean} value
  	@return {void}
  */


  bindArgs.prototype.setIsRebind = function() {
    var value;
    value = arguments[0];
    return this._isRebind = value;
  };

  /**
  	 <div>
  	 Sets the record to bind.
  	 Overrides <see cref="fm.websync.bindArgs.records">fm.websync.bindArgs.records</see>.
  	 </div>
  
  	@function setRecord
  	@param {fm.websync.record} value
  	@return {void}
  */


  bindArgs.prototype.setRecord = function() {
    var value;
    value = arguments[0];
    return this.__records = fm.websync.extensible.sharedSetRecord(value);
  };

  /**
  	 <div>
  	 Sets the records to bind.
  	 Overrides <see cref="fm.websync.bindArgs.record">fm.websync.bindArgs.record</see>.
  	 </div>
  
  	@function setRecords
  	@param {fm.array} value
  	@return {void}
  */


  bindArgs.prototype.setRecords = function() {
    var value;
    value = arguments[0];
    return this.__records = fm.websync.extensible.sharedSetRecords(value);
  };

  return bindArgs;

})(fm.websync.baseInputArgsGeneric);


/**
@class fm.websync.serviceArgs
 <div>
 Arguments for client service requests.
 </div>

@extends fm.websync.baseInputArgsGeneric
*/


fm.websync.serviceArgs = (function(_super) {

  __extends(serviceArgs, _super);

  /**
  	@ignore 
  	@description
  */


  serviceArgs.prototype.__channel = null;

  /**
  	@ignore 
  	@description
  */


  serviceArgs.prototype.__dataJson = null;

  /**
  	@ignore 
  	@description
  */


  function serviceArgs() {
    this.setData = __bind(this.setData, this);

    this.getData = __bind(this.getData, this);

    this.setTag = __bind(this.setTag, this);

    this.setDataJson = __bind(this.setDataJson, this);

    this.setChannel = __bind(this.setChannel, this);

    this.getTag = __bind(this.getTag, this);

    this.getDataJson = __bind(this.getDataJson, this);

    this.getChannel = __bind(this.getChannel, this);

    var channel, dataJson, tag;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      serviceArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    if (arguments.length === 3) {
      channel = arguments[0];
      dataJson = arguments[1];
      tag = arguments[2];
      serviceArgs.__super__.constructor.call(this);
      this.setChannel(channel);
      this.setDataJson(dataJson);
      this.setTag(tag);
      return;
    }
    if (arguments.length === 2) {
      channel = arguments[0];
      dataJson = arguments[1];
      serviceArgs.call(this, channel, dataJson, null);
      return;
    }
  }

  /**
  	 <div>
  	 Gets the channel to which the data should be sent.
  	 Must start with a forward slash (/).
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  serviceArgs.prototype.getChannel = function() {
    return this.__channel;
  };

  /**
  	 <div>
  	 Gets the data to send in JSON format.
  	 (Overrides <see cref="fm.websync.serviceArgs.dataBytes">fm.websync.serviceArgs.dataBytes</see>.)
  	 </div>
  
  	@function getDataJson
  	@return {fm.string}
  */


  serviceArgs.prototype.getDataJson = function() {
    return this.__dataJson;
  };

  /**
  	 <div>
  	 Gets the tag that identifies the contents of the payload.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  serviceArgs.prototype.getTag = function() {
    return fm.serializer.deserializeString(this.getExtensionValueJson("fm.tag"));
  };

  /**
  	 <div>
  	 Sets the channel to which the data should be sent.
  	 Must start with a forward slash (/).
  	 </div>
  
  	@function setChannel
  	@param {fm.string} value
  	@return {void}
  */


  serviceArgs.prototype.setChannel = function() {
    var error, value, _var0, _var1;
    value = arguments[0];
    error = null;
    _var0 = new fm.holder(error);
    _var1 = fm.websync.extensible.validateChannel(value, _var0);
    error = _var0.getValue();
    if (!_var1) {
      throw new Error(fm.stringExtensions.format("Invalid channel. {0}", error));
    }
    return this.__channel = value;
  };

  /**
  	 <div>
  	 Sets the data to send in JSON format.
  	 (Overrides <see cref="fm.websync.serviceArgs.dataBytes">fm.websync.serviceArgs.dataBytes</see>.)
  	 </div>
  
  	@function setDataJson
  	@param {fm.string} value
  	@return {void}
  */


  serviceArgs.prototype.setDataJson = function() {
    var value, _var0;
    value = arguments[0];
    _var0 = value;
    if (!((_var0 === null || typeof _var0 === 'undefined') || fm.serializer.isValidJson(value))) {
      throw new Error("The value is not valid JSON.");
    }
    return this.__dataJson = value;
  };

  /**
  	 <div>
  	 Sets the tag that identifies the contents of the payload.
  	 </div>
  
  	@function setTag
  	@param {fm.string} value
  	@return {void}
  */


  serviceArgs.prototype.setTag = function() {
    var value;
    value = arguments[0];
    return this.setExtensionValueJson("fm.tag", fm.serializer.serializeString(value), false);
  };

  /**
  
  	@function getData
  	@return {fm.hash}
  */


  serviceArgs.prototype.getData = function() {
    return fm.json.deserialize(this.getDataJson.apply(this, arguments));
  };

  /**
  
  	@function setData
  	@param {fm.hash} data
  	@return {}
  */


  serviceArgs.prototype.setData = function() {
    var data;
    data = arguments[0];
    arguments[arguments.length - 1] = fm.json.serialize(arguments[arguments.length - 1]);
    return this.setDataJson.apply(this, arguments);
  };

  return serviceArgs;

})(fm.websync.baseInputArgsGeneric);


/**
@class fm.websync.unbindArgs
 <div>
 Arguments for client unbind requests.
 </div>

@extends fm.websync.baseInputArgsGeneric
*/


fm.websync.unbindArgs = (function(_super) {

  __extends(unbindArgs, _super);

  /**
  	@ignore 
  	@description
  */


  unbindArgs.prototype.__records = null;

  /**
  	@ignore 
  	@description
  */


  function unbindArgs() {
    this.setRecords = __bind(this.setRecords, this);

    this.setRecord = __bind(this.setRecord, this);

    this.setKeys = __bind(this.setKeys, this);

    this.setKey = __bind(this.setKey, this);

    this.getRecords = __bind(this.getRecords, this);

    this.getRecord = __bind(this.getRecord, this);

    this.getKeys = __bind(this.getKeys, this);

    this.getKey = __bind(this.getKey, this);

    var records;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      unbindArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    records = arguments[0];
    unbindArgs.__super__.constructor.call(this);
    this.setRecords(records);
  }

  /**
  	 <div>
  	 Gets the record key to unbind.
  	 Overrides <see cref="fm.websync.unbindArgs.keys">fm.websync.unbindArgs.keys</see>, <see cref="fm.websync.unbindArgs.record">fm.websync.unbindArgs.record</see>, and <see cref="fm.websync.unbindArgs.records">fm.websync.unbindArgs.records</see>.
  	 </div>
  
  	@function getKey
  	@return {fm.string}
  */


  unbindArgs.prototype.getKey = function() {
    return fm.websync.extensible.sharedGetKey(this.__records);
  };

  /**
  	 <div>
  	 Gets the record keys to unbind.
  	 Overrides <see cref="fm.websync.unbindArgs.key">fm.websync.unbindArgs.key</see>, <see cref="fm.websync.unbindArgs.record">fm.websync.unbindArgs.record</see>, and <see cref="fm.websync.unbindArgs.records">fm.websync.unbindArgs.records</see>.
  	 </div>
  
  	@function getKeys
  	@return {fm.array}
  */


  unbindArgs.prototype.getKeys = function() {
    return fm.websync.extensible.sharedGetKeys(this.__records);
  };

  /**
  	 <div>
  	 Gets the record to unbind.
  	 Overrides <see cref="fm.websync.unbindArgs.records">fm.websync.unbindArgs.records</see>, <see cref="fm.websync.unbindArgs.key">fm.websync.unbindArgs.key</see>, and <see cref="fm.websync.unbindArgs.keys">fm.websync.unbindArgs.keys</see>.
  	 </div>
  
  	@function getRecord
  	@return {fm.websync.record}
  */


  unbindArgs.prototype.getRecord = function() {
    return fm.websync.extensible.sharedGetRecord(this.__records);
  };

  /**
  	 <div>
  	 Gets the records to unbind.
  	 Overrides <see cref="fm.websync.unbindArgs.record">fm.websync.unbindArgs.record</see>, <see cref="fm.websync.unbindArgs.key">fm.websync.unbindArgs.key</see>, and <see cref="fm.websync.unbindArgs.keys">fm.websync.unbindArgs.keys</see>.
  	 </div>
  
  	@function getRecords
  	@return {fm.array}
  */


  unbindArgs.prototype.getRecords = function() {
    return fm.websync.extensible.sharedGetRecords(this.__records);
  };

  /**
  	 <div>
  	 Sets the record key to unbind.
  	 Overrides <see cref="fm.websync.unbindArgs.keys">fm.websync.unbindArgs.keys</see>, <see cref="fm.websync.unbindArgs.record">fm.websync.unbindArgs.record</see>, and <see cref="fm.websync.unbindArgs.records">fm.websync.unbindArgs.records</see>.
  	 </div>
  
  	@function setKey
  	@param {fm.string} value
  	@return {void}
  */


  unbindArgs.prototype.setKey = function() {
    var value;
    value = arguments[0];
    return this.__records = fm.websync.extensible.sharedSetKey(value);
  };

  /**
  	 <div>
  	 Sets the record keys to unbind.
  	 Overrides <see cref="fm.websync.unbindArgs.key">fm.websync.unbindArgs.key</see>, <see cref="fm.websync.unbindArgs.record">fm.websync.unbindArgs.record</see>, and <see cref="fm.websync.unbindArgs.records">fm.websync.unbindArgs.records</see>.
  	 </div>
  
  	@function setKeys
  	@param {fm.array} value
  	@return {void}
  */


  unbindArgs.prototype.setKeys = function() {
    var value;
    value = arguments[0];
    return this.__records = fm.websync.extensible.sharedSetKeys(value);
  };

  /**
  	 <div>
  	 Sets the record to unbind.
  	 Overrides <see cref="fm.websync.unbindArgs.records">fm.websync.unbindArgs.records</see>, <see cref="fm.websync.unbindArgs.key">fm.websync.unbindArgs.key</see>, and <see cref="fm.websync.unbindArgs.keys">fm.websync.unbindArgs.keys</see>.
  	 </div>
  
  	@function setRecord
  	@param {fm.websync.record} value
  	@return {void}
  */


  unbindArgs.prototype.setRecord = function() {
    var value;
    value = arguments[0];
    return this.__records = fm.websync.extensible.sharedSetRecord(value);
  };

  /**
  	 <div>
  	 Sets the records to unbind.
  	 Overrides <see cref="fm.websync.unbindArgs.record">fm.websync.unbindArgs.record</see>, <see cref="fm.websync.unbindArgs.key">fm.websync.unbindArgs.key</see>, and <see cref="fm.websync.unbindArgs.keys">fm.websync.unbindArgs.keys</see>.
  	 </div>
  
  	@function setRecords
  	@param {fm.array} value
  	@return {void}
  */


  unbindArgs.prototype.setRecords = function() {
    var value;
    value = arguments[0];
    return this.__records = fm.websync.extensible.sharedSetRecords(value);
  };

  return unbindArgs;

})(fm.websync.baseInputArgsGeneric);


/**
@class fm.websync.disconnectArgs
 <div>
 Arguments for client disconnect requests.
 </div>

@extends fm.websync.baseInputArgs
*/


fm.websync.disconnectArgs = (function(_super) {

  __extends(disconnectArgs, _super);

  /**
  	@ignore 
  	@description
  */


  disconnectArgs.prototype._onComplete = null;

  /**
  	@ignore 
  	@description
  */


  function disconnectArgs() {
    this.setOnComplete = __bind(this.setOnComplete, this);

    this.getOnComplete = __bind(this.getOnComplete, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      disconnectArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    disconnectArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the callback to invoke after the disconnection is complete.
  	 </div>
  
  	@function getOnComplete
  	@return {fm.singleAction}
  */


  disconnectArgs.prototype.getOnComplete = function() {
    return this._onComplete;
  };

  /**
  	 <div>
  	 Sets the callback to invoke after the disconnection is complete.
  	 </div>
  
  	@function setOnComplete
  	@param {fm.singleAction} value
  	@return {void}
  */


  disconnectArgs.prototype.setOnComplete = function() {
    var value;
    value = arguments[0];
    return this._onComplete = value;
  };

  return disconnectArgs;

})(fm.websync.baseInputArgs);


/**
@class fm.websync.publishArgs
 <div>
 Arguments for client publish requests.
 </div>

@extends fm.websync.baseInputArgsGeneric
*/


fm.websync.publishArgs = (function(_super) {

  __extends(publishArgs, _super);

  /**
  	@ignore 
  	@description
  */


  publishArgs.prototype.__channel = null;

  /**
  	@ignore 
  	@description
  */


  publishArgs.prototype.__dataJson = null;

  /**
  	@ignore 
  	@description
  */


  function publishArgs() {
    this.setData = __bind(this.setData, this);

    this.getData = __bind(this.getData, this);

    this.setTag = __bind(this.setTag, this);

    this.setDataJson = __bind(this.setDataJson, this);

    this.setChannel = __bind(this.setChannel, this);

    this.getTag = __bind(this.getTag, this);

    this.getDataJson = __bind(this.getDataJson, this);

    this.getChannel = __bind(this.getChannel, this);

    var channel, dataJson, tag;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      publishArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    if (arguments.length === 3) {
      channel = arguments[0];
      dataJson = arguments[1];
      tag = arguments[2];
      publishArgs.__super__.constructor.call(this);
      this.setChannel(channel);
      this.setDataJson(dataJson);
      this.setTag(tag);
      return;
    }
    if (arguments.length === 2) {
      channel = arguments[0];
      dataJson = arguments[1];
      publishArgs.call(this, channel, dataJson, null);
      return;
    }
  }

  /**
  	 <div>
  	 Gets the channel to which the data should be sent.
  	 Must start with a forward slash (/).
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  publishArgs.prototype.getChannel = function() {
    return this.__channel;
  };

  /**
  	 <div>
  	 Gets the data to send in JSON format.
  	 (Overrides <see cref="fm.websync.publishArgs.dataBytes">fm.websync.publishArgs.dataBytes</see>.)
  	 </div>
  
  	@function getDataJson
  	@return {fm.string}
  */


  publishArgs.prototype.getDataJson = function() {
    return this.__dataJson;
  };

  /**
  	 <div>
  	 Gets the tag that identifies the contents of the payload.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  publishArgs.prototype.getTag = function() {
    return fm.serializer.deserializeString(this.getExtensionValueJson("fm.tag"));
  };

  /**
  	 <div>
  	 Sets the channel to which the data should be sent.
  	 Must start with a forward slash (/).
  	 </div>
  
  	@function setChannel
  	@param {fm.string} value
  	@return {void}
  */


  publishArgs.prototype.setChannel = function() {
    var error, value, _var0, _var1;
    value = arguments[0];
    error = null;
    _var0 = new fm.holder(error);
    _var1 = fm.websync.extensible.validateChannel(value, _var0);
    error = _var0.getValue();
    if (!_var1) {
      throw new Error(fm.stringExtensions.format("Invalid channel. {0}", error));
    }
    return this.__channel = value;
  };

  /**
  	 <div>
  	 Sets the data to send in JSON format.
  	 (Overrides <see cref="fm.websync.publishArgs.dataBytes">fm.websync.publishArgs.dataBytes</see>.)
  	 </div>
  
  	@function setDataJson
  	@param {fm.string} value
  	@return {void}
  */


  publishArgs.prototype.setDataJson = function() {
    var value, _var0;
    value = arguments[0];
    _var0 = value;
    if (!((_var0 === null || typeof _var0 === 'undefined') || fm.serializer.isValidJson(value))) {
      throw new Error("The value is not valid JSON.");
    }
    return this.__dataJson = value;
  };

  /**
  	 <div>
  	 Sets the tag that identifies the contents of the payload.
  	 </div>
  
  	@function setTag
  	@param {fm.string} value
  	@return {void}
  */


  publishArgs.prototype.setTag = function() {
    var value;
    value = arguments[0];
    return this.setExtensionValueJson("fm.tag", fm.serializer.serializeString(value), false);
  };

  /**
  
  	@function getData
  	@return {fm.hash}
  */


  publishArgs.prototype.getData = function() {
    return fm.json.deserialize(this.getDataJson.apply(this, arguments));
  };

  /**
  
  	@function setData
  	@param {fm.hash} data
  	@return {}
  */


  publishArgs.prototype.setData = function() {
    var data;
    data = arguments[0];
    arguments[arguments.length - 1] = fm.json.serialize(arguments[arguments.length - 1]);
    return this.setDataJson.apply(this, arguments);
  };

  return publishArgs;

})(fm.websync.baseInputArgsGeneric);


/**
@class fm.websync.subscribeArgs
 <div>
 Arguments for client subscribe requests.
 </div>

@extends fm.websync.baseInputArgsGeneric
*/


fm.websync.subscribeArgs = (function(_super) {

  __extends(subscribeArgs, _super);

  /**
  	@ignore 
  	@description
  */


  subscribeArgs.prototype.__channels = null;

  /**
  	@ignore 
  	@description
  */


  subscribeArgs.prototype._autoResubscribe = null;

  /**
  	@ignore 
  	@description
  */


  subscribeArgs.prototype._isResubscribe = false;

  /**
  	@ignore 
  	@description
  */


  subscribeArgs.prototype._onReceive = null;

  /**
  	@ignore 
  	@description
  */


  function subscribeArgs() {
    this.setTag = __bind(this.setTag, this);

    this.setOnReceive = __bind(this.setOnReceive, this);

    this.setIsResubscribe = __bind(this.setIsResubscribe, this);

    this.setChannels = __bind(this.setChannels, this);

    this.setChannel = __bind(this.setChannel, this);

    this.setAutoResubscribe = __bind(this.setAutoResubscribe, this);

    this.getTag = __bind(this.getTag, this);

    this.getOnReceive = __bind(this.getOnReceive, this);

    this.getIsResubscribe = __bind(this.getIsResubscribe, this);

    this.getChannels = __bind(this.getChannels, this);

    this.getChannel = __bind(this.getChannel, this);

    this.getAutoResubscribe = __bind(this.getAutoResubscribe, this);

    var channels, tag;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      subscribeArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    if (arguments.length === 2) {
      channels = arguments[0];
      tag = arguments[1];
      subscribeArgs.__super__.constructor.call(this);
      this.setChannels(channels);
      this.setTag(tag);
      return;
    }
    if (arguments.length === 1) {
      channels = arguments[0];
      subscribeArgs.__super__.constructor.call(this);
      this.setChannels(channels);
      return;
    }
  }

  /**
  	 <div>
  	 Gets whether to invoke this call to subscribe
  	 automatically after a reconnect following a stream failure.
  	 Should be <c>false</c> if Subscribe is invoked inside a method
  	 that will already be invoked automatically (like another
  	 client callback). Should be <c>true</c> if Subscribe needs to
  	 be invoked, but the call doesn't exist inside a callback
  	 chain. If set to <c>null</c>, the client will analyze the
  	 current context and switch to <c>false</c> if the call
  	 is executing within a callback chain, and switch to <c>true</c>
  	 otherwise. Defaults to <c>null</c>.
  	 </div>
  
  	@function getAutoResubscribe
  	@return {fm.nullable}
  */


  subscribeArgs.prototype.getAutoResubscribe = function() {
    return this._autoResubscribe;
  };

  /**
  	 <div>
  	 Gets the channel to which the client should be subscribed.
  	 Must start with a forward slash (/).
  	 Overrides <see cref="fm.websync.subscribeArgs.channels">fm.websync.subscribeArgs.channels</see>.
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  subscribeArgs.prototype.getChannel = function() {
    return fm.websync.extensible.sharedGetChannel(this.__channels);
  };

  /**
  	 <div>
  	 Gets the channels to which the client should be subscribed.
  	 Each must start with a forward slash (/).
  	 Overrides <see cref="fm.websync.subscribeArgs.channel">fm.websync.subscribeArgs.channel</see>.
  	 </div>
  
  	@function getChannels
  	@return {fm.array}
  */


  subscribeArgs.prototype.getChannels = function() {
    return fm.websync.extensible.sharedGetChannels(this.__channels);
  };

  /**
  	 <div>
  	 Gets whether or not the subscribe is occurring because the connection has been lost and re-negotiated.
  	 </div>
  
  	@function getIsResubscribe
  	@return {fm.boolean}
  */


  subscribeArgs.prototype.getIsResubscribe = function() {
    return this._isResubscribe;
  };

  /**
  	 <div>
  	 Gets the callback to invoke when data is received on the channel(s).
  	 See <see cref="fm.websync.subscribeReceiveArgs">fm.websync.subscribeReceiveArgs</see> for callback argument details.
  	 </div>
  
  	@function getOnReceive
  	@return {fm.singleAction}
  */


  subscribeArgs.prototype.getOnReceive = function() {
    return this._onReceive;
  };

  /**
  	 <div>
  	 Gets a tag that will uniquely identify this subscription so it
  	 can be unsubscribed later without affecting other subscriptions with the same channel.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  subscribeArgs.prototype.getTag = function() {
    var _ref;
    return (_ref = fm.serializer.deserializeString(this.getExtensionValueJson("fm.tag"))) != null ? _ref : fm.stringExtensions.empty;
  };

  /**
  	 <div>
  	 Sets whether to invoke this call to subscribe
  	 automatically after a reconnect following a stream failure.
  	 Should be <c>false</c> if Subscribe is invoked inside a method
  	 that will already be invoked automatically (like another
  	 client callback). Should be <c>true</c> if Subscribe needs to
  	 be invoked, but the call doesn't exist inside a callback
  	 chain. If set to <c>null</c>, the client will analyze the
  	 current context and switch to <c>false</c> if the call
  	 is executing within a callback chain, and switch to <c>true</c>
  	 otherwise. Defaults to <c>null</c>.
  	 </div>
  
  	@function setAutoResubscribe
  	@param {fm.nullable} value
  	@return {void}
  */


  subscribeArgs.prototype.setAutoResubscribe = function() {
    var value;
    value = arguments[0];
    return this._autoResubscribe = value;
  };

  /**
  	 <div>
  	 Sets the channel to which the client should be subscribed.
  	 Must start with a forward slash (/).
  	 Overrides <see cref="fm.websync.subscribeArgs.channels">fm.websync.subscribeArgs.channels</see>.
  	 </div>
  
  	@function setChannel
  	@param {fm.string} value
  	@return {void}
  */


  subscribeArgs.prototype.setChannel = function() {
    var value;
    value = arguments[0];
    return this.__channels = fm.websync.extensible.sharedSetChannel(value);
  };

  /**
  	 <div>
  	 Sets the channels to which the client should be subscribed.
  	 Each must start with a forward slash (/).
  	 Overrides <see cref="fm.websync.subscribeArgs.channel">fm.websync.subscribeArgs.channel</see>.
  	 </div>
  
  	@function setChannels
  	@param {fm.array} value
  	@return {void}
  */


  subscribeArgs.prototype.setChannels = function() {
    var value;
    value = arguments[0];
    return this.__channels = fm.websync.extensible.sharedSetChannels(value);
  };

  /**
  	 <div>
  	 Sets whether or not the subscribe is occurring because the connection has been lost and re-negotiated.
  	 </div>
  
  	@function setIsResubscribe
  	@param {fm.boolean} value
  	@return {void}
  */


  subscribeArgs.prototype.setIsResubscribe = function() {
    var value;
    value = arguments[0];
    return this._isResubscribe = value;
  };

  /**
  	 <div>
  	 Sets the callback to invoke when data is received on the channel(s).
  	 See <see cref="fm.websync.subscribeReceiveArgs">fm.websync.subscribeReceiveArgs</see> for callback argument details.
  	 </div>
  
  	@function setOnReceive
  	@param {fm.singleAction} value
  	@return {void}
  */


  subscribeArgs.prototype.setOnReceive = function() {
    var value;
    value = arguments[0];
    return this._onReceive = value;
  };

  /**
  	 <div>
  	 Sets a tag that will uniquely identify this subscription so it
  	 can be unsubscribed later without affecting other subscriptions with the same channel.
  	 </div>
  
  	@function setTag
  	@param {fm.string} value
  	@return {void}
  */


  subscribeArgs.prototype.setTag = function() {
    var value;
    value = arguments[0];
    return this.setExtensionValueJson("fm.tag", fm.serializer.serializeString(value != null ? value : fm.stringExtensions.empty), false);
  };

  return subscribeArgs;

})(fm.websync.baseInputArgsGeneric);


/**
@class fm.websync.unsubscribeArgs
 <div>
 Arguments for client unsubscribe requests.
 </div>

@extends fm.websync.baseInputArgsGeneric
*/


fm.websync.unsubscribeArgs = (function(_super) {

  __extends(unsubscribeArgs, _super);

  /**
  	@ignore 
  	@description
  */


  unsubscribeArgs.prototype.__channels = null;

  /**
  	@ignore 
  	@description
  */


  function unsubscribeArgs() {
    this.setTag = __bind(this.setTag, this);

    this.setChannels = __bind(this.setChannels, this);

    this.setChannel = __bind(this.setChannel, this);

    this.getTag = __bind(this.getTag, this);

    this.getChannels = __bind(this.getChannels, this);

    this.getChannel = __bind(this.getChannel, this);

    var channels, tag;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      unsubscribeArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    if (arguments.length === 2) {
      channels = arguments[0];
      tag = arguments[1];
      unsubscribeArgs.__super__.constructor.call(this);
      this.setChannels(channels);
      this.setTag(tag);
      return;
    }
    if (arguments.length === 1) {
      channels = arguments[0];
      unsubscribeArgs.__super__.constructor.call(this);
      this.setChannels(channels);
      return;
    }
  }

  /**
  	 <div>
  	 Gets the channel from which the client should be unsubscribed.
  	 Must start with a forward slash (/).
  	 Overrides <see cref="fm.websync.unsubscribeArgs.channels">fm.websync.unsubscribeArgs.channels</see>.
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  unsubscribeArgs.prototype.getChannel = function() {
    return fm.websync.extensible.sharedGetChannel(this.__channels);
  };

  /**
  	 <div>
  	 Gets the channels from which the client should be unsubscribed.
  	 Each must start with a forward slash (/).
  	 Overrides <see cref="fm.websync.unsubscribeArgs.channel">fm.websync.unsubscribeArgs.channel</see>.
  	 </div>
  
  	@function getChannels
  	@return {fm.array}
  */


  unsubscribeArgs.prototype.getChannels = function() {
    return fm.websync.extensible.sharedGetChannels(this.__channels);
  };

  /**
  	 <div>
  	 Gets a tag that uniquely identifies a subscription so
  	 other subscriptions with the same channel are not affected.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  unsubscribeArgs.prototype.getTag = function() {
    var _ref;
    return (_ref = fm.serializer.deserializeString(this.getExtensionValueJson("fm.tag"))) != null ? _ref : fm.stringExtensions.empty;
  };

  /**
  	 <div>
  	 Sets the channel from which the client should be unsubscribed.
  	 Must start with a forward slash (/).
  	 Overrides <see cref="fm.websync.unsubscribeArgs.channels">fm.websync.unsubscribeArgs.channels</see>.
  	 </div>
  
  	@function setChannel
  	@param {fm.string} value
  	@return {void}
  */


  unsubscribeArgs.prototype.setChannel = function() {
    var value;
    value = arguments[0];
    return this.__channels = fm.websync.extensible.sharedSetChannel(value);
  };

  /**
  	 <div>
  	 Sets the channels from which the client should be unsubscribed.
  	 Each must start with a forward slash (/).
  	 Overrides <see cref="fm.websync.unsubscribeArgs.channel">fm.websync.unsubscribeArgs.channel</see>.
  	 </div>
  
  	@function setChannels
  	@param {fm.array} value
  	@return {void}
  */


  unsubscribeArgs.prototype.setChannels = function() {
    var value;
    value = arguments[0];
    return this.__channels = fm.websync.extensible.sharedSetChannels(value);
  };

  /**
  	 <div>
  	 Sets a tag that uniquely identifies a subscription so
  	 other subscriptions with the same channel are not affected.
  	 </div>
  
  	@function setTag
  	@param {fm.string} value
  	@return {void}
  */


  unsubscribeArgs.prototype.setTag = function() {
    var value;
    value = arguments[0];
    return this.setExtensionValueJson("fm.tag", fm.serializer.serializeString(value != null ? value : fm.stringExtensions.empty), false);
  };

  return unsubscribeArgs;

})(fm.websync.baseInputArgsGeneric);


/**
@class fm.websync.connectCompleteArgs
 <div>
 Arguments for connect complete callbacks.
 </div>

@extends fm.websync.baseCompleteArgs
*/


fm.websync.connectCompleteArgs = (function(_super) {

  __extends(connectCompleteArgs, _super);

  /**
  	@ignore 
  	@description
  */


  connectCompleteArgs.prototype._isReconnect = false;

  /**
  	@ignore 
  	@description
  */


  function connectCompleteArgs() {
    this.setIsReconnect = __bind(this.setIsReconnect, this);

    this.getIsReconnect = __bind(this.getIsReconnect, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      connectCompleteArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    connectCompleteArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets whether the connect call was automatically
  	 invoked following a stream failure.
  	 </div>
  
  	@function getIsReconnect
  	@return {fm.boolean}
  */


  connectCompleteArgs.prototype.getIsReconnect = function() {
    return this._isReconnect;
  };

  /**
  	 <div>
  	 Sets whether the connect call was automatically
  	 invoked following a stream failure.
  	 </div>
  
  	@function setIsReconnect
  	@param {fm.boolean} value
  	@return {void}
  */


  connectCompleteArgs.prototype.setIsReconnect = function() {
    var value;
    value = arguments[0];
    return this._isReconnect = value;
  };

  return connectCompleteArgs;

})(fm.websync.baseCompleteArgs);


/**
@class fm.websync.bindCompleteArgs
 <div>
 Arguments for bind complete callbacks.
 </div>

@extends fm.websync.baseCompleteArgs
*/


fm.websync.bindCompleteArgs = (function(_super) {

  __extends(bindCompleteArgs, _super);

  /**
  	@ignore 
  	@description
  */


  bindCompleteArgs.prototype._isRebind = false;

  /**
  	@ignore 
  	@description
  */


  function bindCompleteArgs() {
    this.setIsRebind = __bind(this.setIsRebind, this);

    this.getIsRebind = __bind(this.getIsRebind, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      bindCompleteArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    bindCompleteArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets whether the bind call was automatically
  	 invoked following a stream failure.
  	 </div>
  
  	@function getIsRebind
  	@return {fm.boolean}
  */


  bindCompleteArgs.prototype.getIsRebind = function() {
    return this._isRebind;
  };

  /**
  	 <div>
  	 Sets whether the bind call was automatically
  	 invoked following a stream failure.
  	 </div>
  
  	@function setIsRebind
  	@param {fm.boolean} value
  	@return {void}
  */


  bindCompleteArgs.prototype.setIsRebind = function() {
    var value;
    value = arguments[0];
    return this._isRebind = value;
  };

  return bindCompleteArgs;

})(fm.websync.baseCompleteArgs);


/**
@class fm.websync.serviceCompleteArgs
 <div>
 Arguments for service complete callbacks.
 </div>

@extends fm.websync.baseCompleteArgs
*/


fm.websync.serviceCompleteArgs = (function(_super) {

  __extends(serviceCompleteArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function serviceCompleteArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      serviceCompleteArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    serviceCompleteArgs.__super__.constructor.call(this);
  }

  return serviceCompleteArgs;

})(fm.websync.baseCompleteArgs);


/**
@class fm.websync.unbindCompleteArgs
 <div>
 Arguments for unbind complete callbacks.
 </div>

@extends fm.websync.baseCompleteArgs
*/


fm.websync.unbindCompleteArgs = (function(_super) {

  __extends(unbindCompleteArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function unbindCompleteArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      unbindCompleteArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    unbindCompleteArgs.__super__.constructor.call(this);
  }

  return unbindCompleteArgs;

})(fm.websync.baseCompleteArgs);


/**
@class fm.websync.disconnectCompleteArgs
 <div>
 Arguments for disconnect complete callbacks.
 </div>

@extends fm.websync.baseCompleteArgs
*/


fm.websync.disconnectCompleteArgs = (function(_super) {

  __extends(disconnectCompleteArgs, _super);

  /**
  	@ignore 
  	@description
  */


  disconnectCompleteArgs.prototype._exception = null;

  /**
  	@ignore 
  	@description
  */


  function disconnectCompleteArgs() {
    this.setException = __bind(this.setException, this);

    this.getException = __bind(this.getException, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      disconnectCompleteArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    disconnectCompleteArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the exception that was thrown while disconnecting.
  	 Will be <c>null</c> if the disconnect was performed gracefully.
  	 </div>
  
  	@function getException
  	@return {Error}
  */


  disconnectCompleteArgs.prototype.getException = function() {
    return this._exception;
  };

  /**
  	 <div>
  	 Sets the exception that was thrown while disconnecting.
  	 Will be <c>null</c> if the disconnect was performed gracefully.
  	 </div>
  
  	@function setException
  	@param {Error} value
  	@return {void}
  */


  disconnectCompleteArgs.prototype.setException = function() {
    var value;
    value = arguments[0];
    return this._exception = value;
  };

  return disconnectCompleteArgs;

})(fm.websync.baseCompleteArgs);


/**
@class fm.websync.publishCompleteArgs
 <div>
 Arguments for publish complete callbacks.
 </div>

@extends fm.websync.baseCompleteArgs
*/


fm.websync.publishCompleteArgs = (function(_super) {

  __extends(publishCompleteArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function publishCompleteArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      publishCompleteArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    publishCompleteArgs.__super__.constructor.call(this);
  }

  return publishCompleteArgs;

})(fm.websync.baseCompleteArgs);


/**
@class fm.websync.subscribeCompleteArgs
 <div>
 Arguments for subscribe complete callbacks.
 </div>

@extends fm.websync.baseCompleteArgs
*/


fm.websync.subscribeCompleteArgs = (function(_super) {

  __extends(subscribeCompleteArgs, _super);

  /**
  	@ignore 
  	@description
  */


  subscribeCompleteArgs.prototype._isResubscribe = false;

  /**
  	@ignore 
  	@description
  */


  function subscribeCompleteArgs() {
    this.setIsResubscribe = __bind(this.setIsResubscribe, this);

    this.getIsResubscribe = __bind(this.getIsResubscribe, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      subscribeCompleteArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    subscribeCompleteArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets whether the subscribe call was automatically
  	 invoked following a stream failure.
  	 </div>
  
  	@function getIsResubscribe
  	@return {fm.boolean}
  */


  subscribeCompleteArgs.prototype.getIsResubscribe = function() {
    return this._isResubscribe;
  };

  /**
  	 <div>
  	 Sets whether the subscribe call was automatically
  	 invoked following a stream failure.
  	 </div>
  
  	@function setIsResubscribe
  	@param {fm.boolean} value
  	@return {void}
  */


  subscribeCompleteArgs.prototype.setIsResubscribe = function() {
    var value;
    value = arguments[0];
    return this._isResubscribe = value;
  };

  return subscribeCompleteArgs;

})(fm.websync.baseCompleteArgs);


/**
@class fm.websync.unsubscribeCompleteArgs
 <div>
 Arguments for unsubscribe complete callbacks.
 </div>

@extends fm.websync.baseCompleteArgs
*/


fm.websync.unsubscribeCompleteArgs = (function(_super) {

  __extends(unsubscribeCompleteArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function unsubscribeCompleteArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      unsubscribeCompleteArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    unsubscribeCompleteArgs.__super__.constructor.call(this);
  }

  return unsubscribeCompleteArgs;

})(fm.websync.baseCompleteArgs);


/**
@class fm.websync.clientConnectResponseArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnConnectResponse">fm.websync.client.addOnConnectResponse</see>.
 </div>

@extends fm.websync.baseClientResponseEventArgsGeneric
*/


fm.websync.clientConnectResponseArgs = (function(_super) {

  __extends(clientConnectResponseArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function clientConnectResponseArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientConnectResponseArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientConnectResponseArgs.__super__.constructor.call(this);
  }

  return clientConnectResponseArgs;

})(fm.websync.baseClientResponseEventArgsGeneric);


/**
@class fm.websync.clientDisconnectResponseArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnDisconnectResponse">fm.websync.client.addOnDisconnectResponse</see>.
 </div>

@extends fm.websync.baseClientResponseEventArgsGeneric
*/


fm.websync.clientDisconnectResponseArgs = (function(_super) {

  __extends(clientDisconnectResponseArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function clientDisconnectResponseArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientDisconnectResponseArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientDisconnectResponseArgs.__super__.constructor.call(this);
  }

  return clientDisconnectResponseArgs;

})(fm.websync.baseClientResponseEventArgsGeneric);


/**
@class fm.websync.clientPublishResponseArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnPublishResponse">fm.websync.client.addOnPublishResponse</see>.
 </div>

@extends fm.websync.baseClientResponseEventArgsGeneric
*/


fm.websync.clientPublishResponseArgs = (function(_super) {

  __extends(clientPublishResponseArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function clientPublishResponseArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientPublishResponseArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientPublishResponseArgs.__super__.constructor.call(this);
  }

  return clientPublishResponseArgs;

})(fm.websync.baseClientResponseEventArgsGeneric);


/**
@class fm.websync.clientSubscribeResponseArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnSubscribeResponse">fm.websync.client.addOnSubscribeResponse</see>.
 </div>

@extends fm.websync.baseClientResponseEventArgsGeneric
*/


fm.websync.clientSubscribeResponseArgs = (function(_super) {

  __extends(clientSubscribeResponseArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function clientSubscribeResponseArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientSubscribeResponseArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientSubscribeResponseArgs.__super__.constructor.call(this);
  }

  return clientSubscribeResponseArgs;

})(fm.websync.baseClientResponseEventArgsGeneric);


/**
@class fm.websync.clientUnsubscribeResponseArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnUnsubscribeResponse">fm.websync.client.addOnUnsubscribeResponse</see>.
 </div>

@extends fm.websync.baseClientResponseEventArgsGeneric
*/


fm.websync.clientUnsubscribeResponseArgs = (function(_super) {

  __extends(clientUnsubscribeResponseArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function clientUnsubscribeResponseArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientUnsubscribeResponseArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientUnsubscribeResponseArgs.__super__.constructor.call(this);
  }

  return clientUnsubscribeResponseArgs;

})(fm.websync.baseClientResponseEventArgsGeneric);


/**
@class fm.websync.clientBindResponseArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnBindResponse">fm.websync.client.addOnBindResponse</see>.
 </div>

@extends fm.websync.baseClientResponseEventArgsGeneric
*/


fm.websync.clientBindResponseArgs = (function(_super) {

  __extends(clientBindResponseArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function clientBindResponseArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientBindResponseArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientBindResponseArgs.__super__.constructor.call(this);
  }

  return clientBindResponseArgs;

})(fm.websync.baseClientResponseEventArgsGeneric);


/**
@class fm.websync.clientUnbindResponseArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnUnbindResponse">fm.websync.client.addOnUnbindResponse</see>.
 </div>

@extends fm.websync.baseClientResponseEventArgsGeneric
*/


fm.websync.clientUnbindResponseArgs = (function(_super) {

  __extends(clientUnbindResponseArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function clientUnbindResponseArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientUnbindResponseArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientUnbindResponseArgs.__super__.constructor.call(this);
  }

  return clientUnbindResponseArgs;

})(fm.websync.baseClientResponseEventArgsGeneric);


/**
@class fm.websync.clientServiceResponseArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnServiceResponse">fm.websync.client.addOnServiceResponse</see>.
 </div>

@extends fm.websync.baseClientResponseEventArgsGeneric
*/


fm.websync.clientServiceResponseArgs = (function(_super) {

  __extends(clientServiceResponseArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function clientServiceResponseArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientServiceResponseArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientServiceResponseArgs.__super__.constructor.call(this);
  }

  return clientServiceResponseArgs;

})(fm.websync.baseClientResponseEventArgsGeneric);


/**
@class fm.websync.clientConnectRequestArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnConnectRequest">fm.websync.client.addOnConnectRequest</see>.
 </div>

@extends fm.websync.baseClientRequestEventArgsGeneric
*/


fm.websync.clientConnectRequestArgs = (function(_super) {

  __extends(clientConnectRequestArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function clientConnectRequestArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientConnectRequestArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientConnectRequestArgs.__super__.constructor.call(this);
  }

  return clientConnectRequestArgs;

})(fm.websync.baseClientRequestEventArgsGeneric);


/**
@class fm.websync.clientDisconnectRequestArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnDisconnectRequest">fm.websync.client.addOnDisconnectRequest</see>.
 </div>

@extends fm.websync.baseClientRequestEventArgsGeneric
*/


fm.websync.clientDisconnectRequestArgs = (function(_super) {

  __extends(clientDisconnectRequestArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function clientDisconnectRequestArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientDisconnectRequestArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientDisconnectRequestArgs.__super__.constructor.call(this);
  }

  return clientDisconnectRequestArgs;

})(fm.websync.baseClientRequestEventArgsGeneric);


/**
@class fm.websync.clientPublishRequestArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnPublishRequest">fm.websync.client.addOnPublishRequest</see>.
 </div>

@extends fm.websync.baseClientRequestEventArgsGeneric
*/


fm.websync.clientPublishRequestArgs = (function(_super) {

  __extends(clientPublishRequestArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function clientPublishRequestArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientPublishRequestArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientPublishRequestArgs.__super__.constructor.call(this);
  }

  return clientPublishRequestArgs;

})(fm.websync.baseClientRequestEventArgsGeneric);


/**
@class fm.websync.clientSubscribeRequestArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnSubscribeRequest">fm.websync.client.addOnSubscribeRequest</see>.
 </div>

@extends fm.websync.baseClientRequestEventArgsGeneric
*/


fm.websync.clientSubscribeRequestArgs = (function(_super) {

  __extends(clientSubscribeRequestArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function clientSubscribeRequestArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientSubscribeRequestArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientSubscribeRequestArgs.__super__.constructor.call(this);
  }

  return clientSubscribeRequestArgs;

})(fm.websync.baseClientRequestEventArgsGeneric);


/**
@class fm.websync.clientUnsubscribeRequestArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnUnsubscribeRequest">fm.websync.client.addOnUnsubscribeRequest</see>.
 </div>

@extends fm.websync.baseClientRequestEventArgsGeneric
*/


fm.websync.clientUnsubscribeRequestArgs = (function(_super) {

  __extends(clientUnsubscribeRequestArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function clientUnsubscribeRequestArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientUnsubscribeRequestArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientUnsubscribeRequestArgs.__super__.constructor.call(this);
  }

  return clientUnsubscribeRequestArgs;

})(fm.websync.baseClientRequestEventArgsGeneric);


/**
@class fm.websync.clientBindRequestArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnBindRequest">fm.websync.client.addOnBindRequest</see>.
 </div>

@extends fm.websync.baseClientRequestEventArgsGeneric
*/


fm.websync.clientBindRequestArgs = (function(_super) {

  __extends(clientBindRequestArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function clientBindRequestArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientBindRequestArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientBindRequestArgs.__super__.constructor.call(this);
  }

  return clientBindRequestArgs;

})(fm.websync.baseClientRequestEventArgsGeneric);


/**
@class fm.websync.clientUnbindRequestArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnUnbindRequest">fm.websync.client.addOnUnbindRequest</see>.
 </div>

@extends fm.websync.baseClientRequestEventArgsGeneric
*/


fm.websync.clientUnbindRequestArgs = (function(_super) {

  __extends(clientUnbindRequestArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function clientUnbindRequestArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientUnbindRequestArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientUnbindRequestArgs.__super__.constructor.call(this);
  }

  return clientUnbindRequestArgs;

})(fm.websync.baseClientRequestEventArgsGeneric);


/**
@class fm.websync.clientServiceRequestArgs
 <div>
 Arguments for <see cref="fm.websync.client.addOnServiceRequest">fm.websync.client.addOnServiceRequest</see>.
 </div>

@extends fm.websync.baseClientRequestEventArgsGeneric
*/


fm.websync.clientServiceRequestArgs = (function(_super) {

  __extends(clientServiceRequestArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function clientServiceRequestArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientServiceRequestArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientServiceRequestArgs.__super__.constructor.call(this);
  }

  return clientServiceRequestArgs;

})(fm.websync.baseClientRequestEventArgsGeneric);


/**
@class fm.websync.connectFailureArgs
 <div>
 Arguments for connect failure callbacks.
 </div>

@extends fm.websync.baseFailureArgs
*/


fm.websync.connectFailureArgs = (function(_super) {

  __extends(connectFailureArgs, _super);

  /**
  	@ignore 
  	@description
  */


  connectFailureArgs.prototype._isReconnect = false;

  /**
  	@ignore 
  	@description
  */


  function connectFailureArgs() {
    this.setIsReconnect = __bind(this.setIsReconnect, this);

    this.getIsReconnect = __bind(this.getIsReconnect, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      connectFailureArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    connectFailureArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets whether the connect call was automatically
  	 invoked following a stream failure.
  	 </div>
  
  	@function getIsReconnect
  	@return {fm.boolean}
  */


  connectFailureArgs.prototype.getIsReconnect = function() {
    return this._isReconnect;
  };

  /**
  	 <div>
  	 Sets whether the connect call was automatically
  	 invoked following a stream failure.
  	 </div>
  
  	@function setIsReconnect
  	@param {fm.boolean} value
  	@return {void}
  */


  connectFailureArgs.prototype.setIsReconnect = function() {
    var value;
    value = arguments[0];
    return this._isReconnect = value;
  };

  return connectFailureArgs;

})(fm.websync.baseFailureArgs);


/**
@class fm.websync.bindFailureArgs
 <div>
 Arguments for bind failure callbacks.
 </div>

@extends fm.websync.baseFailureArgs
*/


fm.websync.bindFailureArgs = (function(_super) {

  __extends(bindFailureArgs, _super);

  /**
  	@ignore 
  	@description
  */


  bindFailureArgs.prototype.__records = null;

  /**
  	@ignore 
  	@description
  */


  bindFailureArgs.prototype._isRebind = false;

  /**
  	@ignore 
  	@description
  */


  function bindFailureArgs() {
    this.setIsRebind = __bind(this.setIsRebind, this);

    this.getRecords = __bind(this.getRecords, this);

    this.getRecord = __bind(this.getRecord, this);

    this.getKeys = __bind(this.getKeys, this);

    this.getKey = __bind(this.getKey, this);

    this.getIsRebind = __bind(this.getIsRebind, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      bindFailureArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    bindFailureArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets whether the bind call was automatically
  	 invoked following a stream failure.
  	 </div>
  
  	@function getIsRebind
  	@return {fm.boolean}
  */


  bindFailureArgs.prototype.getIsRebind = function() {
    return this._isRebind;
  };

  /**
  	 <div>
  	 Gets the record key to which the client failed to be bound.
  	 Overrides <see cref="fm.websync.bindFailureArgs.keys">fm.websync.bindFailureArgs.keys</see>, <see cref="fm.websync.bindFailureArgs.record">fm.websync.bindFailureArgs.record</see>, and <see cref="fm.websync.bindFailureArgs.records">fm.websync.bindFailureArgs.records</see>.
  	 </div>
  
  	@function getKey
  	@return {fm.string}
  */


  bindFailureArgs.prototype.getKey = function() {
    return fm.websync.extensible.sharedGetKey(this.__records);
  };

  /**
  	 <div>
  	 Gets the record keys to which the client failed to be bound.
  	 Overrides <see cref="fm.websync.bindFailureArgs.key">fm.websync.bindFailureArgs.key</see>, <see cref="fm.websync.bindFailureArgs.record">fm.websync.bindFailureArgs.record</see>, and <see cref="fm.websync.bindFailureArgs.records">fm.websync.bindFailureArgs.records</see>.
  	 </div>
  
  	@function getKeys
  	@return {fm.array}
  */


  bindFailureArgs.prototype.getKeys = function() {
    return fm.websync.extensible.sharedGetKeys(this.__records);
  };

  /**
  	 <div>
  	 Gets the record to which the client failed to be bound.
  	 Overrides <see cref="fm.websync.bindFailureArgs.records">fm.websync.bindFailureArgs.records</see>, <see cref="fm.websync.bindFailureArgs.key">fm.websync.bindFailureArgs.key</see>, and <see cref="fm.websync.bindFailureArgs.keys">fm.websync.bindFailureArgs.keys</see>.
  	 </div>
  
  	@function getRecord
  	@return {fm.websync.record}
  */


  bindFailureArgs.prototype.getRecord = function() {
    return fm.websync.extensible.sharedGetRecord(this.__records);
  };

  /**
  	 <div>
  	 Gets the records to which the client failed to be bound.
  	 Overrides <see cref="fm.websync.bindFailureArgs.record">fm.websync.bindFailureArgs.record</see>, <see cref="fm.websync.bindFailureArgs.key">fm.websync.bindFailureArgs.key</see>, and <see cref="fm.websync.bindFailureArgs.keys">fm.websync.bindFailureArgs.keys</see>.
  	 </div>
  
  	@function getRecords
  	@return {fm.array}
  */


  bindFailureArgs.prototype.getRecords = function() {
    return fm.websync.extensible.sharedGetRecords(this.__records);
  };

  /**
  	 <div>
  	 Sets whether the bind call was automatically
  	 invoked following a stream failure.
  	 </div>
  
  	@function setIsRebind
  	@param {fm.boolean} value
  	@return {void}
  */


  bindFailureArgs.prototype.setIsRebind = function() {
    var value;
    value = arguments[0];
    return this._isRebind = value;
  };

  return bindFailureArgs;

})(fm.websync.baseFailureArgs);


/**
@class fm.websync.serviceFailureArgs
 <div>
 Arguments for service failure callbacks.
 </div>

@extends fm.websync.baseFailureArgs
*/


fm.websync.serviceFailureArgs = (function(_super) {

  __extends(serviceFailureArgs, _super);

  /**
  	@ignore 
  	@description
  */


  serviceFailureArgs.prototype.__channel = null;

  /**
  	@ignore 
  	@description
  */


  serviceFailureArgs.prototype.__dataJson = null;

  /**
  	@ignore 
  	@description
  */


  function serviceFailureArgs() {
    this.getData = __bind(this.getData, this);

    this.getTag = __bind(this.getTag, this);

    this.getDataJson = __bind(this.getDataJson, this);

    this.getChannel = __bind(this.getChannel, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      serviceFailureArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    serviceFailureArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the channel to which the data failed to be sent.
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  serviceFailureArgs.prototype.getChannel = function() {
    return this.__channel;
  };

  /**
  	 <div>
  	 Gets the data that failed to be sent in JSON format.
  	 </div>
  
  	@function getDataJson
  	@return {fm.string}
  */


  serviceFailureArgs.prototype.getDataJson = function() {
    return this.__dataJson;
  };

  /**
  	 <div>
  	 Gets the tag that identifies the contents of the payload.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  serviceFailureArgs.prototype.getTag = function() {
    return fm.serializer.deserializeString(this.getExtensionValueJson("fm.tag"));
  };

  /**
  
  	@function getData
  	@return {fm.hash}
  */


  serviceFailureArgs.prototype.getData = function() {
    return fm.json.deserialize(this.getDataJson.apply(this, arguments));
  };

  return serviceFailureArgs;

})(fm.websync.baseFailureArgs);


/**
@class fm.websync.unbindFailureArgs
 <div>
 Arguments for unbind failure callbacks.
 </div>

@extends fm.websync.baseFailureArgs
*/


fm.websync.unbindFailureArgs = (function(_super) {

  __extends(unbindFailureArgs, _super);

  /**
  	@ignore 
  	@description
  */


  unbindFailureArgs.prototype.__records = null;

  /**
  	@ignore 
  	@description
  */


  function unbindFailureArgs() {
    this.getRecords = __bind(this.getRecords, this);

    this.getRecord = __bind(this.getRecord, this);

    this.getKeys = __bind(this.getKeys, this);

    this.getKey = __bind(this.getKey, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      unbindFailureArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    unbindFailureArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the record key from which the client failed to be unbound.
  	 Overrides <see cref="fm.websync.unbindFailureArgs.keys">fm.websync.unbindFailureArgs.keys</see>, <see cref="fm.websync.unbindFailureArgs.record">fm.websync.unbindFailureArgs.record</see>, and <see cref="fm.websync.unbindFailureArgs.records">fm.websync.unbindFailureArgs.records</see>.
  	 </div>
  
  	@function getKey
  	@return {fm.string}
  */


  unbindFailureArgs.prototype.getKey = function() {
    return fm.websync.extensible.sharedGetKey(this.__records);
  };

  /**
  	 <div>
  	 Gets the record keys from which the client failed to be unbound.
  	 Overrides <see cref="fm.websync.unbindFailureArgs.key">fm.websync.unbindFailureArgs.key</see>, <see cref="fm.websync.unbindFailureArgs.record">fm.websync.unbindFailureArgs.record</see>, and <see cref="fm.websync.unbindFailureArgs.records">fm.websync.unbindFailureArgs.records</see>.
  	 </div>
  
  	@function getKeys
  	@return {fm.array}
  */


  unbindFailureArgs.prototype.getKeys = function() {
    return fm.websync.extensible.sharedGetKeys(this.__records);
  };

  /**
  	 <div>
  	 Gets the record from which the client failed to be unbound.
  	 Overrides <see cref="fm.websync.unbindFailureArgs.records">fm.websync.unbindFailureArgs.records</see>, <see cref="fm.websync.unbindFailureArgs.key">fm.websync.unbindFailureArgs.key</see>, and <see cref="fm.websync.unbindFailureArgs.keys">fm.websync.unbindFailureArgs.keys</see>.
  	 </div>
  
  	@function getRecord
  	@return {fm.websync.record}
  */


  unbindFailureArgs.prototype.getRecord = function() {
    return fm.websync.extensible.sharedGetRecord(this.__records);
  };

  /**
  	 <div>
  	 Gets the records from which the client failed to be unbound.
  	 Overrides <see cref="fm.websync.unbindFailureArgs.record">fm.websync.unbindFailureArgs.record</see>, <see cref="fm.websync.unbindFailureArgs.key">fm.websync.unbindFailureArgs.key</see>, and <see cref="fm.websync.unbindFailureArgs.keys">fm.websync.unbindFailureArgs.keys</see>.
  	 </div>
  
  	@function getRecords
  	@return {fm.array}
  */


  unbindFailureArgs.prototype.getRecords = function() {
    return fm.websync.extensible.sharedGetRecords(this.__records);
  };

  return unbindFailureArgs;

})(fm.websync.baseFailureArgs);


/**
@class fm.websync.streamFailureArgs
 <div>
 Arguments for <see cref="fm.websync.connectArgs.onStreamFailure">fm.websync.connectArgs.onStreamFailure</see>.
 </div>

@extends fm.websync.baseFailureArgs
*/


fm.websync.streamFailureArgs = (function(_super) {

  __extends(streamFailureArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function streamFailureArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      streamFailureArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    streamFailureArgs.__super__.constructor.call(this);
  }

  return streamFailureArgs;

})(fm.websync.baseFailureArgs);


/**
@class fm.websync.publishFailureArgs
 <div>
 Arguments for publish failure callbacks.
 </div>

@extends fm.websync.baseFailureArgs
*/


fm.websync.publishFailureArgs = (function(_super) {

  __extends(publishFailureArgs, _super);

  /**
  	@ignore 
  	@description
  */


  publishFailureArgs.prototype.__channel = null;

  /**
  	@ignore 
  	@description
  */


  publishFailureArgs.prototype.__dataJson = null;

  /**
  	@ignore 
  	@description
  */


  function publishFailureArgs() {
    this.getData = __bind(this.getData, this);

    this.getTag = __bind(this.getTag, this);

    this.getDataJson = __bind(this.getDataJson, this);

    this.getChannel = __bind(this.getChannel, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      publishFailureArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    publishFailureArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the channel to which the data failed to be sent.
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  publishFailureArgs.prototype.getChannel = function() {
    return this.__channel;
  };

  /**
  	 <div>
  	 Gets the data that failed to be sent in JSON format.
  	 </div>
  
  	@function getDataJson
  	@return {fm.string}
  */


  publishFailureArgs.prototype.getDataJson = function() {
    return this.__dataJson;
  };

  /**
  	 <div>
  	 Gets the tag that identifies the contents of the payload.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  publishFailureArgs.prototype.getTag = function() {
    return fm.serializer.deserializeString(this.getExtensionValueJson("fm.tag"));
  };

  /**
  
  	@function getData
  	@return {fm.hash}
  */


  publishFailureArgs.prototype.getData = function() {
    return fm.json.deserialize(this.getDataJson.apply(this, arguments));
  };

  return publishFailureArgs;

})(fm.websync.baseFailureArgs);


/**
@class fm.websync.subscribeFailureArgs
 <div>
 Arguments for subscribe failure callbacks.
 </div>

@extends fm.websync.baseFailureArgs
*/


fm.websync.subscribeFailureArgs = (function(_super) {

  __extends(subscribeFailureArgs, _super);

  /**
  	@ignore 
  	@description
  */


  subscribeFailureArgs.prototype.__channels = null;

  /**
  	@ignore 
  	@description
  */


  subscribeFailureArgs.prototype._isResubscribe = false;

  /**
  	@ignore 
  	@description
  */


  function subscribeFailureArgs() {
    this.setIsResubscribe = __bind(this.setIsResubscribe, this);

    this.getTag = __bind(this.getTag, this);

    this.getIsResubscribe = __bind(this.getIsResubscribe, this);

    this.getChannels = __bind(this.getChannels, this);

    this.getChannel = __bind(this.getChannel, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      subscribeFailureArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    subscribeFailureArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the channel to which the client failed to be subscribed.
  	 Must start with a forward slash (/).
  	 Overrides <see cref="fm.websync.subscribeFailureArgs.channels">fm.websync.subscribeFailureArgs.channels</see>.
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  subscribeFailureArgs.prototype.getChannel = function() {
    return fm.websync.extensible.sharedGetChannel(this.__channels);
  };

  /**
  	 <div>
  	 Gets the channels to which the client failed to be subscribed.
  	 Each must start with a forward slash (/).
  	 Overrides <see cref="fm.websync.subscribeFailureArgs.channel">fm.websync.subscribeFailureArgs.channel</see>.
  	 </div>
  
  	@function getChannels
  	@return {fm.array}
  */


  subscribeFailureArgs.prototype.getChannels = function() {
    return fm.websync.extensible.sharedGetChannels(this.__channels);
  };

  /**
  	 <div>
  	 Gets whether the subscribe call was automatically
  	 invoked following a stream failure.
  	 </div>
  
  	@function getIsResubscribe
  	@return {fm.boolean}
  */


  subscribeFailureArgs.prototype.getIsResubscribe = function() {
    return this._isResubscribe;
  };

  /**
  	 <div>
  	 Gets the tag associated with the subscribe request.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  subscribeFailureArgs.prototype.getTag = function() {
    var _ref;
    return (_ref = fm.serializer.deserializeString(this.getExtensionValueJson("fm.tag"))) != null ? _ref : fm.stringExtensions.empty;
  };

  /**
  	 <div>
  	 Sets whether the subscribe call was automatically
  	 invoked following a stream failure.
  	 </div>
  
  	@function setIsResubscribe
  	@param {fm.boolean} value
  	@return {void}
  */


  subscribeFailureArgs.prototype.setIsResubscribe = function() {
    var value;
    value = arguments[0];
    return this._isResubscribe = value;
  };

  return subscribeFailureArgs;

})(fm.websync.baseFailureArgs);


/**
@class fm.websync.unsubscribeFailureArgs
 <div>
 Arguments for unsubscribe failure callbacks.
 </div>

@extends fm.websync.baseFailureArgs
*/


fm.websync.unsubscribeFailureArgs = (function(_super) {

  __extends(unsubscribeFailureArgs, _super);

  /**
  	@ignore 
  	@description
  */


  unsubscribeFailureArgs.prototype.__channels = null;

  /**
  	@ignore 
  	@description
  */


  function unsubscribeFailureArgs() {
    this.getTag = __bind(this.getTag, this);

    this.getChannels = __bind(this.getChannels, this);

    this.getChannel = __bind(this.getChannel, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      unsubscribeFailureArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    unsubscribeFailureArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the channel from which the client failed to be unsubscribed.
  	 Must start with a forward slash (/).
  	 Overrides <see cref="fm.websync.unsubscribeFailureArgs.channels">fm.websync.unsubscribeFailureArgs.channels</see>.
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  unsubscribeFailureArgs.prototype.getChannel = function() {
    return fm.websync.extensible.sharedGetChannel(this.__channels);
  };

  /**
  	 <div>
  	 Gets the channels from which the client failed to be unsubscribed.
  	 Each must start with a forward slash (/).
  	 Overrides <see cref="fm.websync.unsubscribeFailureArgs.channel">fm.websync.unsubscribeFailureArgs.channel</see>.
  	 </div>
  
  	@function getChannels
  	@return {fm.array}
  */


  unsubscribeFailureArgs.prototype.getChannels = function() {
    return fm.websync.extensible.sharedGetChannels(this.__channels);
  };

  /**
  	 <div>
  	 Gets the tag associated with the subscribe request.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  unsubscribeFailureArgs.prototype.getTag = function() {
    var _ref;
    return (_ref = fm.serializer.deserializeString(this.getExtensionValueJson("fm.tag"))) != null ? _ref : fm.stringExtensions.empty;
  };

  return unsubscribeFailureArgs;

})(fm.websync.baseFailureArgs);


/**
@class fm.websync.connectSuccessArgs
 <div>
 Arguments for connect success callbacks.
 </div>

@extends fm.websync.baseSuccessArgs
*/


fm.websync.connectSuccessArgs = (function(_super) {

  __extends(connectSuccessArgs, _super);

  /**
  	@ignore 
  	@description
  */


  connectSuccessArgs.prototype._connectionType = null;

  /**
  	@ignore 
  	@description
  */


  connectSuccessArgs.prototype._isReconnect = false;

  /**
  	@ignore 
  	@description
  */


  function connectSuccessArgs() {
    this.setIsReconnect = __bind(this.setIsReconnect, this);

    this.setConnectionType = __bind(this.setConnectionType, this);

    this.getIsReconnect = __bind(this.getIsReconnect, this);

    this.getConnectionType = __bind(this.getConnectionType, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      connectSuccessArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    connectSuccessArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the connection type of the stream.
  	 </div>
  
  	@function getConnectionType
  	@return {fm.websync.connectionType}
  */


  connectSuccessArgs.prototype.getConnectionType = function() {
    return this._connectionType;
  };

  /**
  	 <div>
  	 Gets whether the connect call was automatically
  	 invoked following a stream failure.
  	 </div>
  
  	@function getIsReconnect
  	@return {fm.boolean}
  */


  connectSuccessArgs.prototype.getIsReconnect = function() {
    return this._isReconnect;
  };

  /**
  	 <div>
  	 Sets the connection type of the stream.
  	 </div>
  
  	@function setConnectionType
  	@param {fm.websync.connectionType} value
  	@return {void}
  */


  connectSuccessArgs.prototype.setConnectionType = function() {
    var value;
    value = arguments[0];
    return this._connectionType = value;
  };

  /**
  	 <div>
  	 Sets whether the connect call was automatically
  	 invoked following a stream failure.
  	 </div>
  
  	@function setIsReconnect
  	@param {fm.boolean} value
  	@return {void}
  */


  connectSuccessArgs.prototype.setIsReconnect = function() {
    var value;
    value = arguments[0];
    return this._isReconnect = value;
  };

  return connectSuccessArgs;

})(fm.websync.baseSuccessArgs);


/**
@class fm.websync.bindSuccessArgs
 <div>
 Arguments for bind success callbacks.
 </div>

@extends fm.websync.baseSuccessArgs
*/


fm.websync.bindSuccessArgs = (function(_super) {

  __extends(bindSuccessArgs, _super);

  /**
  	@ignore 
  	@description
  */


  bindSuccessArgs.prototype.__records = null;

  /**
  	@ignore 
  	@description
  */


  bindSuccessArgs.prototype._isRebind = false;

  /**
  	@ignore 
  	@description
  */


  function bindSuccessArgs() {
    this.setIsRebind = __bind(this.setIsRebind, this);

    this.getRecords = __bind(this.getRecords, this);

    this.getRecord = __bind(this.getRecord, this);

    this.getKeys = __bind(this.getKeys, this);

    this.getKey = __bind(this.getKey, this);

    this.getIsRebind = __bind(this.getIsRebind, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      bindSuccessArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    bindSuccessArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets whether the bind call was automatically
  	 invoked following a stream failure.
  	 </div>
  
  	@function getIsRebind
  	@return {fm.boolean}
  */


  bindSuccessArgs.prototype.getIsRebind = function() {
    return this._isRebind;
  };

  /**
  	 <div>
  	 Gets the record key to which the client was bound.
  	 Overrides <see cref="fm.websync.bindSuccessArgs.keys">fm.websync.bindSuccessArgs.keys</see>, <see cref="fm.websync.bindSuccessArgs.record">fm.websync.bindSuccessArgs.record</see>, and <see cref="fm.websync.bindSuccessArgs.records">fm.websync.bindSuccessArgs.records</see>.
  	 </div>
  
  	@function getKey
  	@return {fm.string}
  */


  bindSuccessArgs.prototype.getKey = function() {
    return fm.websync.extensible.sharedGetKey(this.__records);
  };

  /**
  	 <div>
  	 Gets the record keys to which the client was bound.
  	 Overrides <see cref="fm.websync.bindSuccessArgs.key">fm.websync.bindSuccessArgs.key</see>, <see cref="fm.websync.bindSuccessArgs.record">fm.websync.bindSuccessArgs.record</see>, and <see cref="fm.websync.bindSuccessArgs.records">fm.websync.bindSuccessArgs.records</see>.
  	 </div>
  
  	@function getKeys
  	@return {fm.array}
  */


  bindSuccessArgs.prototype.getKeys = function() {
    return fm.websync.extensible.sharedGetKeys(this.__records);
  };

  /**
  	 <div>
  	 Gets the record to which the client was bound.
  	 Overrides <see cref="fm.websync.bindSuccessArgs.records">fm.websync.bindSuccessArgs.records</see>, <see cref="fm.websync.bindSuccessArgs.key">fm.websync.bindSuccessArgs.key</see>, and <see cref="fm.websync.bindSuccessArgs.keys">fm.websync.bindSuccessArgs.keys</see>.
  	 </div>
  
  	@function getRecord
  	@return {fm.websync.record}
  */


  bindSuccessArgs.prototype.getRecord = function() {
    return fm.websync.extensible.sharedGetRecord(this.__records);
  };

  /**
  	 <div>
  	 Gets the records to which the client was bound.
  	 Overrides <see cref="fm.websync.bindSuccessArgs.record">fm.websync.bindSuccessArgs.record</see>, <see cref="fm.websync.bindSuccessArgs.key">fm.websync.bindSuccessArgs.key</see>, and <see cref="fm.websync.bindSuccessArgs.keys">fm.websync.bindSuccessArgs.keys</see>.
  	 </div>
  
  	@function getRecords
  	@return {fm.array}
  */


  bindSuccessArgs.prototype.getRecords = function() {
    return fm.websync.extensible.sharedGetRecords(this.__records);
  };

  /**
  	 <div>
  	 Sets whether the bind call was automatically
  	 invoked following a stream failure.
  	 </div>
  
  	@function setIsRebind
  	@param {fm.boolean} value
  	@return {void}
  */


  bindSuccessArgs.prototype.setIsRebind = function() {
    var value;
    value = arguments[0];
    return this._isRebind = value;
  };

  return bindSuccessArgs;

})(fm.websync.baseSuccessArgs);


/**
@class fm.websync.serviceSuccessArgs
 <div>
 Arguments for service success callbacks.
 </div>

@extends fm.websync.baseSuccessArgs
*/


fm.websync.serviceSuccessArgs = (function(_super) {

  __extends(serviceSuccessArgs, _super);

  /**
  	@ignore 
  	@description
  */


  serviceSuccessArgs.prototype.__channel = null;

  /**
  	@ignore 
  	@description
  */


  serviceSuccessArgs.prototype.__dataJson = null;

  /**
  	@ignore 
  	@description
  */


  function serviceSuccessArgs() {
    this.getData = __bind(this.getData, this);

    this.getTag = __bind(this.getTag, this);

    this.getDataJson = __bind(this.getDataJson, this);

    this.getChannel = __bind(this.getChannel, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      serviceSuccessArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    serviceSuccessArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the channel to which the data was sent.
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  serviceSuccessArgs.prototype.getChannel = function() {
    return this.__channel;
  };

  /**
  	 <div>
  	 Gets the data that was sent in JSON format.
  	 </div>
  
  	@function getDataJson
  	@return {fm.string}
  */


  serviceSuccessArgs.prototype.getDataJson = function() {
    return this.__dataJson;
  };

  /**
  	 <div>
  	 Gets the tag that identifies the contents of the payload.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  serviceSuccessArgs.prototype.getTag = function() {
    return fm.serializer.deserializeString(this.getExtensionValueJson("fm.tag"));
  };

  /**
  
  	@function getData
  	@return {fm.hash}
  */


  serviceSuccessArgs.prototype.getData = function() {
    return fm.json.deserialize(this.getDataJson.apply(this, arguments));
  };

  return serviceSuccessArgs;

})(fm.websync.baseSuccessArgs);


/**
@class fm.websync.unbindSuccessArgs
 <div>
 Arguments for unbind success callbacks.
 </div>

@extends fm.websync.baseSuccessArgs
*/


fm.websync.unbindSuccessArgs = (function(_super) {

  __extends(unbindSuccessArgs, _super);

  /**
  	@ignore 
  	@description
  */


  unbindSuccessArgs.prototype.__records = null;

  /**
  	@ignore 
  	@description
  */


  function unbindSuccessArgs() {
    this.getRecords = __bind(this.getRecords, this);

    this.getRecord = __bind(this.getRecord, this);

    this.getKeys = __bind(this.getKeys, this);

    this.getKey = __bind(this.getKey, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      unbindSuccessArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    unbindSuccessArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the record key from which the client was unbound.
  	 Overrides <see cref="fm.websync.unbindSuccessArgs.keys">fm.websync.unbindSuccessArgs.keys</see>, <see cref="fm.websync.unbindSuccessArgs.record">fm.websync.unbindSuccessArgs.record</see>, and <see cref="fm.websync.unbindSuccessArgs.records">fm.websync.unbindSuccessArgs.records</see>.
  	 </div>
  
  	@function getKey
  	@return {fm.string}
  */


  unbindSuccessArgs.prototype.getKey = function() {
    return fm.websync.extensible.sharedGetKey(this.__records);
  };

  /**
  	 <div>
  	 Gets the record keys from which the client was unbound.
  	 Overrides <see cref="fm.websync.unbindSuccessArgs.key">fm.websync.unbindSuccessArgs.key</see>, <see cref="fm.websync.unbindSuccessArgs.record">fm.websync.unbindSuccessArgs.record</see>, and <see cref="fm.websync.unbindSuccessArgs.records">fm.websync.unbindSuccessArgs.records</see>.
  	 </div>
  
  	@function getKeys
  	@return {fm.array}
  */


  unbindSuccessArgs.prototype.getKeys = function() {
    return fm.websync.extensible.sharedGetKeys(this.__records);
  };

  /**
  	 <div>
  	 Gets the record from which the client was unbound.
  	 Overrides <see cref="fm.websync.unbindSuccessArgs.records">fm.websync.unbindSuccessArgs.records</see>, <see cref="fm.websync.unbindSuccessArgs.key">fm.websync.unbindSuccessArgs.key</see>, and <see cref="fm.websync.unbindSuccessArgs.keys">fm.websync.unbindSuccessArgs.keys</see>.
  	 </div>
  
  	@function getRecord
  	@return {fm.websync.record}
  */


  unbindSuccessArgs.prototype.getRecord = function() {
    return fm.websync.extensible.sharedGetRecord(this.__records);
  };

  /**
  	 <div>
  	 Gets the records from which the client was unbound.
  	 Overrides <see cref="fm.websync.unbindSuccessArgs.record">fm.websync.unbindSuccessArgs.record</see>, <see cref="fm.websync.unbindSuccessArgs.key">fm.websync.unbindSuccessArgs.key</see>, and <see cref="fm.websync.unbindSuccessArgs.keys">fm.websync.unbindSuccessArgs.keys</see>.
  	 </div>
  
  	@function getRecords
  	@return {fm.array}
  */


  unbindSuccessArgs.prototype.getRecords = function() {
    return fm.websync.extensible.sharedGetRecords(this.__records);
  };

  return unbindSuccessArgs;

})(fm.websync.baseSuccessArgs);


/**
@class fm.websync.publishSuccessArgs
 <div>
 Arguments for publish success callbacks.
 </div>

@extends fm.websync.baseSuccessArgs
*/


fm.websync.publishSuccessArgs = (function(_super) {

  __extends(publishSuccessArgs, _super);

  /**
  	@ignore 
  	@description
  */


  publishSuccessArgs.prototype.__channel = null;

  /**
  	@ignore 
  	@description
  */


  publishSuccessArgs.prototype.__dataJson = null;

  /**
  	@ignore 
  	@description
  */


  function publishSuccessArgs() {
    this.getData = __bind(this.getData, this);

    this.getTag = __bind(this.getTag, this);

    this.getDataJson = __bind(this.getDataJson, this);

    this.getChannel = __bind(this.getChannel, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      publishSuccessArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    publishSuccessArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the channel to which the data was sent.
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  publishSuccessArgs.prototype.getChannel = function() {
    return this.__channel;
  };

  /**
  	 <div>
  	 Gets the data that was sent in JSON format.
  	 </div>
  
  	@function getDataJson
  	@return {fm.string}
  */


  publishSuccessArgs.prototype.getDataJson = function() {
    return this.__dataJson;
  };

  /**
  	 <div>
  	 Gets the tag that identifies the contents of the payload.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  publishSuccessArgs.prototype.getTag = function() {
    return fm.serializer.deserializeString(this.getExtensionValueJson("fm.tag"));
  };

  /**
  
  	@function getData
  	@return {fm.hash}
  */


  publishSuccessArgs.prototype.getData = function() {
    return fm.json.deserialize(this.getDataJson.apply(this, arguments));
  };

  return publishSuccessArgs;

})(fm.websync.baseSuccessArgs);


/**
@class fm.websync.subscribeReceiveArgs
 <div>
 Arguments for <see cref="fm.websync.subscribeArgs.onReceive">fm.websync.subscribeArgs.onReceive</see>.
 </div>

@extends fm.websync.baseReceiveArgs
*/


fm.websync.subscribeReceiveArgs = (function(_super) {

  __extends(subscribeReceiveArgs, _super);

  /**
  	@ignore 
  	@description
  */


  subscribeReceiveArgs.prototype.__channel = null;

  /**
  	@ignore 
  	@description
  */


  function subscribeReceiveArgs() {
    this.getWasSentByMe = __bind(this.getWasSentByMe, this);

    this.getPublishingClient = __bind(this.getPublishingClient, this);

    this.getChannel = __bind(this.getChannel, this);

    var channel, dataJson;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      subscribeReceiveArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    channel = arguments[0];
    dataJson = arguments[1];
    subscribeReceiveArgs.__super__.constructor.call(this, dataJson);
    this.__channel = channel;
  }

  /**
  	 <div>
  	 Gets the channel over which the data was published.
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  subscribeReceiveArgs.prototype.getChannel = function() {
    return this.__channel;
  };

  /**
  	 <div>
  	 Gets details about the client sending the publication.
  	 </div>
  
  	@function getPublishingClient
  	@return {fm.websync.publishingClient}
  */


  subscribeReceiveArgs.prototype.getPublishingClient = function() {
    return fm.websync.publishingClient.fromJson(this.getExtensionValueJson("fm.publishing"));
  };

  /**
  	 <div>
  	 Gets whether the data was sent by the current client.
  	 </div>
  
  	@function getWasSentByMe
  	@return {fm.boolean}
  */


  subscribeReceiveArgs.prototype.getWasSentByMe = function() {
    var _var0, _var1, _var2;
    _var0 = this.getPublishingClient();
    _var1 = this.getClient();
    _var2 = this.getPublishingClient().getClientId();
    return (((_var0 !== null && typeof _var0 !== 'undefined') && (_var1 !== null && typeof _var1 !== 'undefined')) && (this.getPublishingClient().getClientId() !== null)) && (_var2 === null ? _var2 === this.getClient().getClientId() : _var2.equals(this.getClient().getClientId()));
  };

  return subscribeReceiveArgs;

})(fm.websync.baseReceiveArgs);


/**
@class fm.websync.subscribeSuccessArgs
 <div>
 Arguments for subscribe success callbacks.
 </div>

@extends fm.websync.baseSuccessArgs
*/


fm.websync.subscribeSuccessArgs = (function(_super) {

  __extends(subscribeSuccessArgs, _super);

  /**
  	@ignore 
  	@description
  */


  subscribeSuccessArgs.prototype.__channels = null;

  /**
  	@ignore 
  	@description
  */


  subscribeSuccessArgs.prototype._isResubscribe = false;

  /**
  	@ignore 
  	@description
  */


  function subscribeSuccessArgs() {
    this.setIsResubscribe = __bind(this.setIsResubscribe, this);

    this.getTag = __bind(this.getTag, this);

    this.getIsResubscribe = __bind(this.getIsResubscribe, this);

    this.getChannels = __bind(this.getChannels, this);

    this.getChannel = __bind(this.getChannel, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      subscribeSuccessArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    subscribeSuccessArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the channel to which the client was subscribed.
  	 Must start with a forward slash (/).
  	 Overrides <see cref="fm.websync.subscribeSuccessArgs.channels">fm.websync.subscribeSuccessArgs.channels</see>.
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  subscribeSuccessArgs.prototype.getChannel = function() {
    return fm.websync.extensible.sharedGetChannel(this.__channels);
  };

  /**
  	 <div>
  	 Gets the channels to which the client was subscribed.
  	 Each must start with a forward slash (/).
  	 Overrides <see cref="fm.websync.subscribeSuccessArgs.channel">fm.websync.subscribeSuccessArgs.channel</see>.
  	 </div>
  
  	@function getChannels
  	@return {fm.array}
  */


  subscribeSuccessArgs.prototype.getChannels = function() {
    return fm.websync.extensible.sharedGetChannels(this.__channels);
  };

  /**
  	 <div>
  	 Gets whether the subscribe call was automatically
  	 invoked following a stream failure.
  	 </div>
  
  	@function getIsResubscribe
  	@return {fm.boolean}
  */


  subscribeSuccessArgs.prototype.getIsResubscribe = function() {
    return this._isResubscribe;
  };

  /**
  	 <div>
  	 Gets the tag associated with the subscribe request.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  subscribeSuccessArgs.prototype.getTag = function() {
    var _ref;
    return (_ref = fm.serializer.deserializeString(this.getExtensionValueJson("fm.tag"))) != null ? _ref : fm.stringExtensions.empty;
  };

  /**
  	 <div>
  	 Sets whether the subscribe call was automatically
  	 invoked following a stream failure.
  	 </div>
  
  	@function setIsResubscribe
  	@param {fm.boolean} value
  	@return {void}
  */


  subscribeSuccessArgs.prototype.setIsResubscribe = function() {
    var value;
    value = arguments[0];
    return this._isResubscribe = value;
  };

  return subscribeSuccessArgs;

})(fm.websync.baseSuccessArgs);


/**
@class fm.websync.unsubscribeSuccessArgs
 <div>
 Arguments for unsubscribe success callbacks.
 </div>

@extends fm.websync.baseSuccessArgs
*/


fm.websync.unsubscribeSuccessArgs = (function(_super) {

  __extends(unsubscribeSuccessArgs, _super);

  /**
  	@ignore 
  	@description
  */


  unsubscribeSuccessArgs.prototype.__channels = null;

  /**
  	@ignore 
  	@description
  */


  function unsubscribeSuccessArgs() {
    this.getTag = __bind(this.getTag, this);

    this.getChannels = __bind(this.getChannels, this);

    this.getChannel = __bind(this.getChannel, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      unsubscribeSuccessArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    unsubscribeSuccessArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the channel from which the client was unsubscribed.
  	 Must start with a forward slash (/).
  	 Overrides <see cref="fm.websync.unsubscribeSuccessArgs.channels">fm.websync.unsubscribeSuccessArgs.channels</see>.
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  unsubscribeSuccessArgs.prototype.getChannel = function() {
    return fm.websync.extensible.sharedGetChannel(this.__channels);
  };

  /**
  	 <div>
  	 Gets the channels from which the client was unsubscribed.
  	 Each must start with a forward slash (/).
  	 Overrides <see cref="fm.websync.unsubscribeSuccessArgs.channel">fm.websync.unsubscribeSuccessArgs.channel</see>.
  	 </div>
  
  	@function getChannels
  	@return {fm.array}
  */


  unsubscribeSuccessArgs.prototype.getChannels = function() {
    return fm.websync.extensible.sharedGetChannels(this.__channels);
  };

  /**
  	 <div>
  	 Gets the tag associated with the subscribe request.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  unsubscribeSuccessArgs.prototype.getTag = function() {
    var _ref;
    return (_ref = fm.serializer.deserializeString(this.getExtensionValueJson("fm.tag"))) != null ? _ref : fm.stringExtensions.empty;
  };

  return unsubscribeSuccessArgs;

})(fm.websync.baseSuccessArgs);


/**
@class fm.websync.publisherPublishResponseArgs
 <div>
 Arguments for <see cref="fm.websync.publisher.addOnPublishResponse">fm.websync.publisher.addOnPublishResponse</see>.
 </div>

@extends fm.websync.basePublisherResponseEventArgsGeneric
*/


fm.websync.publisherPublishResponseArgs = (function(_super) {

  __extends(publisherPublishResponseArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function publisherPublishResponseArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      publisherPublishResponseArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    publisherPublishResponseArgs.__super__.constructor.call(this);
  }

  return publisherPublishResponseArgs;

})(fm.websync.basePublisherResponseEventArgsGeneric);


/**
@class fm.websync.publisherPublishRequestArgs
 <div>
 Arguments for <see cref="fm.websync.publisher.addOnPublishRequest">fm.websync.publisher.addOnPublishRequest</see>.
 </div>

@extends fm.websync.basePublisherRequestEventArgsGeneric
*/


fm.websync.publisherPublishRequestArgs = (function(_super) {

  __extends(publisherPublishRequestArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function publisherPublishRequestArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      publisherPublishRequestArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    publisherPublishRequestArgs.__super__.constructor.call(this);
  }

  return publisherPublishRequestArgs;

})(fm.websync.basePublisherRequestEventArgsGeneric);


/**
@class fm.websync.deferredRetryConnectState
 <div>
 The state of a deferred retry call.
 </div>

@extends fm.object
*/


fm.websync.deferredRetryConnectState = (function(_super) {

  __extends(deferredRetryConnectState, _super);

  /**
  	@ignore 
  	@description
  */


  deferredRetryConnectState.prototype._backoffTimeout = 0;

  /**
  	@ignore 
  	@description
  */


  deferredRetryConnectState.prototype._connectArgs = null;

  /**
  	@ignore 
  	@description
  */


  function deferredRetryConnectState() {
    this.setConnectArgs = __bind(this.setConnectArgs, this);

    this.setBackoffTimeout = __bind(this.setBackoffTimeout, this);

    this.getConnectArgs = __bind(this.getConnectArgs, this);

    this.getBackoffTimeout = __bind(this.getBackoffTimeout, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      deferredRetryConnectState.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    deferredRetryConnectState.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the backoff interval.
  	 </div>
  
  	@function getBackoffTimeout
  	@return {fm.int}
  */


  deferredRetryConnectState.prototype.getBackoffTimeout = function() {
    return this._backoffTimeout;
  };

  /**
  	 <div>
  	 Gets the client connect arguments.
  	 </div>
  
  	@function getConnectArgs
  	@return {fm.websync.connectArgs}
  */


  deferredRetryConnectState.prototype.getConnectArgs = function() {
    return this._connectArgs;
  };

  /**
  	 <div>
  	 Sets the backoff interval.
  	 </div>
  
  	@function setBackoffTimeout
  	@param {fm.int} value
  	@return {void}
  */


  deferredRetryConnectState.prototype.setBackoffTimeout = function() {
    var value;
    value = arguments[0];
    return this._backoffTimeout = value;
  };

  /**
  	 <div>
  	 Sets the client connect arguments.
  	 </div>
  
  	@function setConnectArgs
  	@param {fm.websync.connectArgs} value
  	@return {void}
  */


  deferredRetryConnectState.prototype.setConnectArgs = function() {
    var value;
    value = arguments[0];
    return this._connectArgs = value;
  };

  return deferredRetryConnectState;

})(fm.object);


/**
@class fm.websync.deferredStreamState
 <div>
 The state of a deferred stream call.
 </div>

@extends fm.object
*/


fm.websync.deferredStreamState = (function(_super) {

  __extends(deferredStreamState, _super);

  /**
  	@ignore 
  	@description
  */


  deferredStreamState.prototype._connectArgs = null;

  /**
  	@ignore 
  	@description
  */


  deferredStreamState.prototype._receivedMessages = false;

  /**
  	@ignore 
  	@description
  */


  function deferredStreamState() {
    this.setReceivedMessages = __bind(this.setReceivedMessages, this);

    this.setConnectArgs = __bind(this.setConnectArgs, this);

    this.getReceivedMessages = __bind(this.getReceivedMessages, this);

    this.getConnectArgs = __bind(this.getConnectArgs, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      deferredStreamState.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    deferredStreamState.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the client connect arguments.
  	 </div>
  
  	@function getConnectArgs
  	@return {fm.websync.connectArgs}
  */


  deferredStreamState.prototype.getConnectArgs = function() {
    return this._connectArgs;
  };

  /**
  	 <div>
  	 Gets whether the client received messages.
  	 </div>
  
  	@function getReceivedMessages
  	@return {fm.boolean}
  */


  deferredStreamState.prototype.getReceivedMessages = function() {
    return this._receivedMessages;
  };

  /**
  	 <div>
  	 Sets the client connect arguments.
  	 </div>
  
  	@function setConnectArgs
  	@param {fm.websync.connectArgs} value
  	@return {void}
  */


  deferredStreamState.prototype.setConnectArgs = function() {
    var value;
    value = arguments[0];
    return this._connectArgs = value;
  };

  /**
  	 <div>
  	 Sets whether the client received messages.
  	 </div>
  
  	@function setReceivedMessages
  	@param {fm.boolean} value
  	@return {void}
  */


  deferredStreamState.prototype.setReceivedMessages = function() {
    var value;
    value = arguments[0];
    return this._receivedMessages = value;
  };

  return deferredStreamState;

})(fm.object);


/**
@class fm.websync.messageTransfer
 <div>
 Base class that defines methods for transferring messages over HTTP.
 </div>

@extends fm.object
*/


fm.websync.messageTransfer = (function(_super) {

  __extends(messageTransfer, _super);

  /**
  	@ignore 
  	@description
  */


  messageTransfer.prototype._messageTransferCallbackKey = null;

  /**
  	@ignore 
  	@description
  */


  function messageTransfer() {
    this.shutdown = __bind(this.shutdown, this);

    this.sendMessagesAsync = __bind(this.sendMessagesAsync, this);

    this.sendMessages = __bind(this.sendMessages, this);

    this.sendAsyncCallback = __bind(this.sendAsyncCallback, this);

    this.sendAsync = __bind(this.sendAsync, this);

    this.send = __bind(this.send, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      messageTransfer.__super__.constructor.call(this);
      this._messageTransferCallbackKey = "fm.websync.messageTransfer.callback";
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    messageTransfer.__super__.constructor.call(this);
    this._messageTransferCallbackKey = "fm.websync.messageTransfer.callback";
  }

  /**
  
  	@function raiseRequestCreated
  	@param {fm.websync.messageRequestArgs} requestArgs
  	@return {void}
  */


  messageTransfer.raiseRequestCreated = function() {
    var p, requestArgs, _var0;
    requestArgs = arguments[0];
    _var0 = requestArgs.getOnRequestCreated();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      p = new fm.websync.messageRequestCreatedArgs();
      p.setRequests(requestArgs.getMessages());
      p.setSender(requestArgs.getSender());
      return requestArgs.getOnRequestCreated()(p);
    }
  };

  /**
  
  	@function raiseResponseReceived
  	@param {fm.websync.messageResponseArgs} responseArgs
  	@return {void}
  */


  messageTransfer.raiseResponseReceived = function() {
    var p, responseArgs, _var0, _var1;
    responseArgs = arguments[0];
    _var0 = responseArgs.getException();
    _var1 = responseArgs.getRequestArgs().getOnResponseReceived();
    if ((_var0 === null || typeof _var0 === 'undefined') && (_var1 !== null && typeof _var1 !== 'undefined')) {
      p = new fm.websync.messageResponseReceivedArgs();
      p.setResponses(responseArgs.getMessages());
      p.setSender(responseArgs.getRequestArgs().getSender());
      return responseArgs.getRequestArgs().getOnResponseReceived()(p);
    }
  };

  /**
  	 <div>
  	 Sends messages synchronously.
  	 </div><param name="requestArgs">The message parameters.</param><returns>The resulting response.</returns>
  
  	@function send
  	@param {fm.websync.messageRequestArgs} requestArgs
  	@return {fm.websync.messageResponseArgs}
  */


  messageTransfer.prototype.send = function() {
    var args, args2, requestArgs;
    requestArgs = arguments[0];
    fm.websync.messageTransfer.raiseRequestCreated(requestArgs);
    try {
      args = this.sendMessages(requestArgs);
      fm.websync.messageTransfer.raiseResponseReceived(args);
    } catch (exception) {
      args2 = new fm.websync.messageResponseArgs(requestArgs);
      args2.setException(exception);
      args = args2;
    } finally {

    }
    return args;
  };

  /**
  	 <div>
  	 Sends messages asynchronously.
  	 </div><param name="requestArgs">The message parameters.</param><param name="callback">The callback to execute with the resulting response.</param>
  
  	@function sendAsync
  	@param {fm.websync.messageRequestArgs} requestArgs
  	@param {fm.singleAction} callback
  	@return {void}
  */


  messageTransfer.prototype.sendAsync = function() {
    var callback, p, requestArgs;
    requestArgs = arguments[0];
    callback = arguments[1];
    fm.websync.messageTransfer.raiseRequestCreated(requestArgs);
    requestArgs.setDynamicValue(this._messageTransferCallbackKey, callback);
    try {
      return this.sendMessagesAsync(requestArgs, this.sendAsyncCallback);
    } catch (exception) {
      p = new fm.websync.messageResponseArgs(requestArgs);
      p.setException(exception);
      return callback(p);
    } finally {

    }
  };

  /**
  
  	@function sendAsyncCallback
  	@param {fm.websync.messageResponseArgs} responseArgs
  	@return {void}
  */


  messageTransfer.prototype.sendAsyncCallback = function() {
    var dynamicValue, responseArgs;
    responseArgs = arguments[0];
    dynamicValue = responseArgs.getRequestArgs().getDynamicValue(this._messageTransferCallbackKey);
    fm.websync.messageTransfer.raiseResponseReceived(responseArgs);
    return dynamicValue(responseArgs);
  };

  /**
  	 <div>
  	 Sends a request synchronously.
  	 </div><param name="requestArgs">The request parameters.</param><returns>The response parameters.</returns>
  
  	@function sendMessages
  	@param {fm.websync.messageRequestArgs} requestArgs
  	@return {fm.websync.messageResponseArgs}
  */


  messageTransfer.prototype.sendMessages = function() {
    var requestArgs;
    return requestArgs = arguments[0];
  };

  /**
  	 <div>
  	 Sends a request asynchronously.
  	 </div><param name="requestArgs">The request parameters.</param><param name="callback">The callback to execute with the response parameters.</param>
  
  	@function sendMessagesAsync
  	@param {fm.websync.messageRequestArgs} requestArgs
  	@param {fm.singleAction} callback
  	@return {void}
  */


  messageTransfer.prototype.sendMessagesAsync = function() {
    var callback, requestArgs;
    requestArgs = arguments[0];
    return callback = arguments[1];
  };

  /**
  	 <div>
  	 Releases any resources and shuts down.
  	 </div>
  
  	@function shutdown
  	@return {void}
  */


  messageTransfer.prototype.shutdown = function() {};

  return messageTransfer;

}).call(this, fm.object);


/**
@class fm.websync.socketMessageTransfer
 <div>
 Base class that defines methods for transferring messages over HTTP.
 </div>

@extends fm.websync.messageTransfer
*/


fm.websync.socketMessageTransfer = (function(_super) {

  __extends(socketMessageTransfer, _super);

  /**
  	@ignore 
  	@description
  */


  socketMessageTransfer.prototype._handshakeTimeout = 0;

  /**
  	@ignore 
  	@description
  */


  socketMessageTransfer.prototype._onOpenFailure = null;

  /**
  	@ignore 
  	@description
  */


  socketMessageTransfer.prototype._onOpenSuccess = null;

  /**
  	@ignore 
  	@description
  */


  socketMessageTransfer.prototype._onRequestCreated = null;

  /**
  	@ignore 
  	@description
  */


  socketMessageTransfer.prototype._onResponseReceived = null;

  /**
  	@ignore 
  	@description
  */


  socketMessageTransfer.prototype._onStreamFailure = null;

  /**
  	@ignore 
  	@description
  */


  socketMessageTransfer.prototype._sender = null;

  /**
  	@ignore 
  	@description
  */


  socketMessageTransfer.prototype._streamTimeout = 0;

  /**
  	@ignore 
  	@description
  */


  function socketMessageTransfer() {
    this.setStreamTimeout = __bind(this.setStreamTimeout, this);

    this.setSender = __bind(this.setSender, this);

    this.setOnStreamFailure = __bind(this.setOnStreamFailure, this);

    this.setOnResponseReceived = __bind(this.setOnResponseReceived, this);

    this.setOnRequestCreated = __bind(this.setOnRequestCreated, this);

    this.setOnOpenSuccess = __bind(this.setOnOpenSuccess, this);

    this.setOnOpenFailure = __bind(this.setOnOpenFailure, this);

    this.setHandshakeTimeout = __bind(this.setHandshakeTimeout, this);

    this.open = __bind(this.open, this);

    this.getStreamTimeout = __bind(this.getStreamTimeout, this);

    this.getSender = __bind(this.getSender, this);

    this.getOnStreamFailure = __bind(this.getOnStreamFailure, this);

    this.getOnResponseReceived = __bind(this.getOnResponseReceived, this);

    this.getOnRequestCreated = __bind(this.getOnRequestCreated, this);

    this.getOnOpenSuccess = __bind(this.getOnOpenSuccess, this);

    this.getOnOpenFailure = __bind(this.getOnOpenFailure, this);

    this.getHandshakeTimeout = __bind(this.getHandshakeTimeout, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      socketMessageTransfer.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    socketMessageTransfer.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the timeout for the initial handshake.
  	 </div>
  
  	@function getHandshakeTimeout
  	@return {fm.int}
  */


  socketMessageTransfer.prototype.getHandshakeTimeout = function() {
    return this._handshakeTimeout;
  };

  /**
  	 <div>
  	 Gets the callback to invoke if the handshake fails.
  	 </div>
  
  	@function getOnOpenFailure
  	@return {fm.singleAction}
  */


  socketMessageTransfer.prototype.getOnOpenFailure = function() {
    return this._onOpenFailure;
  };

  /**
  	 <div>
  	 Gets the callback to invoke if the handshake succeeds.
  	 </div>
  
  	@function getOnOpenSuccess
  	@return {fm.singleAction}
  */


  socketMessageTransfer.prototype.getOnOpenSuccess = function() {
    return this._onOpenSuccess;
  };

  /**
  	 <div>
  	 Gets the callback to invoke when the handshake request is created.
  	 </div>
  
  	@function getOnRequestCreated
  	@return {fm.singleAction}
  */


  socketMessageTransfer.prototype.getOnRequestCreated = function() {
    return this._onRequestCreated;
  };

  /**
  	 <div>
  	 Gets the callback to invoke when the handshake response is received.
  	 </div>
  
  	@function getOnResponseReceived
  	@return {fm.singleAction}
  */


  socketMessageTransfer.prototype.getOnResponseReceived = function() {
    return this._onResponseReceived;
  };

  /**
  	 <div>
  	 Gets the callback to invoke if the stream errors out.
  	 </div>
  
  	@function getOnStreamFailure
  	@return {fm.singleAction}
  */


  socketMessageTransfer.prototype.getOnStreamFailure = function() {
    return this._onStreamFailure;
  };

  /**
  	 <div>
  	 Gets the sender of the messages.
  	 </div>
  
  	@function getSender
  	@return {fm.object}
  */


  socketMessageTransfer.prototype.getSender = function() {
    return this._sender;
  };

  /**
  	 <div>
  	 Gets the timeout for the stream.
  	 </div>
  
  	@function getStreamTimeout
  	@return {fm.int}
  */


  socketMessageTransfer.prototype.getStreamTimeout = function() {
    return this._streamTimeout;
  };

  /**
  	 <div>
  	 Opens the socket.
  	 </div><param name="headers">The headers to pass in with the initial handshake.</param>
  
  	@function open
  	@param {fm.nameValueCollection} headers
  	@return {void}
  */


  socketMessageTransfer.prototype.open = function() {
    var headers;
    return headers = arguments[0];
  };

  /**
  	 <div>
  	 Sets the timeout for the initial handshake.
  	 </div>
  
  	@function setHandshakeTimeout
  	@param {fm.int} value
  	@return {void}
  */


  socketMessageTransfer.prototype.setHandshakeTimeout = function() {
    var value;
    value = arguments[0];
    return this._handshakeTimeout = value;
  };

  /**
  	 <div>
  	 Sets the callback to invoke if the handshake fails.
  	 </div>
  
  	@function setOnOpenFailure
  	@param {fm.singleAction} value
  	@return {void}
  */


  socketMessageTransfer.prototype.setOnOpenFailure = function() {
    var value;
    value = arguments[0];
    return this._onOpenFailure = value;
  };

  /**
  	 <div>
  	 Sets the callback to invoke if the handshake succeeds.
  	 </div>
  
  	@function setOnOpenSuccess
  	@param {fm.singleAction} value
  	@return {void}
  */


  socketMessageTransfer.prototype.setOnOpenSuccess = function() {
    var value;
    value = arguments[0];
    return this._onOpenSuccess = value;
  };

  /**
  	 <div>
  	 Sets the callback to invoke when the handshake request is created.
  	 </div>
  
  	@function setOnRequestCreated
  	@param {fm.singleAction} value
  	@return {void}
  */


  socketMessageTransfer.prototype.setOnRequestCreated = function() {
    var value;
    value = arguments[0];
    return this._onRequestCreated = value;
  };

  /**
  	 <div>
  	 Sets the callback to invoke when the handshake response is received.
  	 </div>
  
  	@function setOnResponseReceived
  	@param {fm.singleAction} value
  	@return {void}
  */


  socketMessageTransfer.prototype.setOnResponseReceived = function() {
    var value;
    value = arguments[0];
    return this._onResponseReceived = value;
  };

  /**
  	 <div>
  	 Sets the callback to invoke if the stream errors out.
  	 </div>
  
  	@function setOnStreamFailure
  	@param {fm.singleAction} value
  	@return {void}
  */


  socketMessageTransfer.prototype.setOnStreamFailure = function() {
    var value;
    value = arguments[0];
    return this._onStreamFailure = value;
  };

  /**
  	 <div>
  	 Sets the sender of the messages.
  	 </div>
  
  	@function setSender
  	@param {fm.object} value
  	@return {void}
  */


  socketMessageTransfer.prototype.setSender = function() {
    var value;
    value = arguments[0];
    return this._sender = value;
  };

  /**
  	 <div>
  	 Sets the timeout for the stream.
  	 </div>
  
  	@function setStreamTimeout
  	@param {fm.int} value
  	@return {void}
  */


  socketMessageTransfer.prototype.setStreamTimeout = function() {
    var value;
    value = arguments[0];
    return this._streamTimeout = value;
  };

  return socketMessageTransfer;

})(fm.websync.messageTransfer);


/**
@class fm.websync.messageTransferFactory
 <div>
 Creates implementations of <see cref="fm.websync.messageTransfer">fm.websync.messageTransfer</see>.
 </div>

@extends fm.object
*/


fm.websync.messageTransferFactory = (function(_super) {

  __extends(messageTransferFactory, _super);

  /**
  	@ignore 
  	@description
  */


  messageTransferFactory._createHttpMessageTransfer = null;

  /**
  	@ignore 
  	@description
  */


  messageTransferFactory._createWebSocketMessageTransfer = null;

  /**
  	@ignore 
  	@description
  */


  function messageTransferFactory() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      messageTransferFactory.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    messageTransferFactory.__super__.constructor.call(this);
  }

  /**
  
  	@function defaultCreateHttpMessageTransfer
  	@return {fm.websync.messageTransfer}
  */


  messageTransferFactory.defaultCreateHttpMessageTransfer = function() {
    return new fm.websync.httpWebRequestTransfer();
  };

  /**
  
  	@function defaultCreateWebSocketMessageTransfer
  	@param {fm.string} requestUrl
  	@return {fm.websync.socketMessageTransfer}
  */


  messageTransferFactory.defaultCreateWebSocketMessageTransfer = function() {
    var requestUrl;
    requestUrl = arguments[0];
    return new fm.websync.webSocketTransfer(requestUrl);
  };

  /**
  	 <div>
  	 Gets the callback that creates an HTTP-based message transfer class.
  	 </div>
  
  	@function getCreateHttpMessageTransfer
  	@return {fm.emptyFunction}
  */


  messageTransferFactory.getCreateHttpMessageTransfer = function() {
    return fm.websync.messageTransferFactory._createHttpMessageTransfer;
  };

  /**
  	 <div>
  	 Gets the callback that creates a WebSocket-based message transfer class.
  	 </div>
  
  	@function getCreateWebSocketMessageTransfer
  	@return {fm.singleFunction}
  */


  messageTransferFactory.getCreateWebSocketMessageTransfer = function() {
    return fm.websync.messageTransferFactory._createWebSocketMessageTransfer;
  };

  /**
  	 <div>
  	 Gets an instance of the HTTP-based message transfer class.
  	 </div><returns></returns>
  
  	@function getHttpMessageTransfer
  	@return {fm.websync.messageTransfer}
  */


  messageTransferFactory.getHttpMessageTransfer = function() {
    var transfer, _var0, _var1;
    _var0 = fm.websync.messageTransferFactory.getCreateHttpMessageTransfer();
    if (_var0 === null || typeof _var0 === 'undefined') {
      messageTransferFactory.setCreateHttpMessageTransfer(messageTransferFactory.defaultCreateHttpMessageTransfer);
    }
    transfer = fm.websync.messageTransferFactory.getCreateHttpMessageTransfer()();
    _var1 = transfer;
    if (_var1 === null || typeof _var1 === 'undefined') {
      transfer = fm.websync.messageTransferFactory.defaultCreateHttpMessageTransfer();
    }
    return transfer;
  };

  /**
  	 <div>
  	 Gets an instance of the WebSocket-based message transfer class.
  	 </div><returns></returns>
  
  	@function getWebSocketMessageTransfer
  	@param {fm.string} requestUrl
  	@return {fm.websync.socketMessageTransfer}
  */


  messageTransferFactory.getWebSocketMessageTransfer = function() {
    var requestUrl, transfer, _var0, _var1;
    requestUrl = arguments[0];
    _var0 = fm.websync.messageTransferFactory.getCreateWebSocketMessageTransfer();
    if (_var0 === null || typeof _var0 === 'undefined') {
      messageTransferFactory.setCreateWebSocketMessageTransfer(messageTransferFactory.defaultCreateWebSocketMessageTransfer);
    }
    transfer = fm.websync.messageTransferFactory.getCreateWebSocketMessageTransfer()(requestUrl);
    _var1 = transfer;
    if (_var1 === null || typeof _var1 === 'undefined') {
      transfer = fm.websync.messageTransferFactory.defaultCreateWebSocketMessageTransfer(requestUrl);
    }
    return transfer;
  };

  /**
  	 <div>
  	 Sets the callback that creates an HTTP-based message transfer class.
  	 </div>
  
  	@function setCreateHttpMessageTransfer
  	@param {fm.emptyFunction} value
  	@return {void}
  */


  messageTransferFactory.setCreateHttpMessageTransfer = function() {
    var value;
    value = arguments[0];
    return messageTransferFactory._createHttpMessageTransfer = value;
  };

  /**
  	 <div>
  	 Sets the callback that creates a WebSocket-based message transfer class.
  	 </div>
  
  	@function setCreateWebSocketMessageTransfer
  	@param {fm.singleFunction} value
  	@return {void}
  */


  messageTransferFactory.setCreateWebSocketMessageTransfer = function() {
    var value;
    value = arguments[0];
    return messageTransferFactory._createWebSocketMessageTransfer = value;
  };

  return messageTransferFactory;

}).call(this, fm.object);


/**
@class fm.websync.webSocketCloseArgs
 <div>
 Close arguments for the <see cref="fm.websync.webSocket">fm.websync.webSocket</see> class.
 </div>

@extends fm.dynamic
*/


fm.websync.webSocketCloseArgs = (function(_super) {

  __extends(webSocketCloseArgs, _super);

  /**
  	@ignore 
  	@description
  */


  webSocketCloseArgs.prototype._onComplete = null;

  /**
  	@ignore 
  	@description
  */


  webSocketCloseArgs.prototype._reason = null;

  /**
  	@ignore 
  	@description
  */


  webSocketCloseArgs.prototype._statusCode = null;

  /**
  	@ignore 
  	@description
  */


  function webSocketCloseArgs() {
    this.setStatusCode = __bind(this.setStatusCode, this);

    this.setReason = __bind(this.setReason, this);

    this.setOnComplete = __bind(this.setOnComplete, this);

    this.getStatusCode = __bind(this.getStatusCode, this);

    this.getReason = __bind(this.getReason, this);

    this.getOnComplete = __bind(this.getOnComplete, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      webSocketCloseArgs.__super__.constructor.call(this);
      this.setStatusCode(fm.websync.webSocketStatusCode.Normal);
      this.setReason(fm.stringExtensions.empty);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    webSocketCloseArgs.__super__.constructor.call(this);
    this.setStatusCode(fm.websync.webSocketStatusCode.Normal);
    this.setReason(fm.stringExtensions.empty);
  }

  /**
  	 <div>
  	 Gets the callback to execute when the connection is closed.
  	 </div>
  
  	@function getOnComplete
  	@return {fm.singleAction}
  */


  webSocketCloseArgs.prototype.getOnComplete = function() {
    return this._onComplete;
  };

  /**
  	 <div>
  	 Gets the reason to send with the close frame.
  	 </div>
  
  	@function getReason
  	@return {fm.string}
  */


  webSocketCloseArgs.prototype.getReason = function() {
    return this._reason;
  };

  /**
  	 <div>
  	 Gets the status code to send with the close frame.
  	 </div>
  
  	@function getStatusCode
  	@return {fm.websync.webSocketStatusCode}
  */


  webSocketCloseArgs.prototype.getStatusCode = function() {
    return this._statusCode;
  };

  /**
  	 <div>
  	 Sets the callback to execute when the connection is closed.
  	 </div>
  
  	@function setOnComplete
  	@param {fm.singleAction} value
  	@return {void}
  */


  webSocketCloseArgs.prototype.setOnComplete = function() {
    var value;
    value = arguments[0];
    return this._onComplete = value;
  };

  /**
  	 <div>
  	 Sets the reason to send with the close frame.
  	 </div>
  
  	@function setReason
  	@param {fm.string} value
  	@return {void}
  */


  webSocketCloseArgs.prototype.setReason = function() {
    var value;
    value = arguments[0];
    return this._reason = value;
  };

  /**
  	 <div>
  	 Sets the status code to send with the close frame.
  	 </div>
  
  	@function setStatusCode
  	@param {fm.websync.webSocketStatusCode} value
  	@return {void}
  */


  webSocketCloseArgs.prototype.setStatusCode = function() {
    var value;
    value = arguments[0];
    return this._statusCode = value;
  };

  return webSocketCloseArgs;

})(fm.dynamic);


/**
@class fm.websync.webSocketCloseCompleteArgs
 <div>
 Arguments for <see cref="fm.websync.webSocketCloseArgs.onComplete">fm.websync.webSocketCloseArgs.onComplete</see>.
 </div>

@extends fm.dynamic
*/


fm.websync.webSocketCloseCompleteArgs = (function(_super) {

  __extends(webSocketCloseCompleteArgs, _super);

  /**
  	@ignore 
  	@description
  */


  webSocketCloseCompleteArgs.prototype._reason = null;

  /**
  	@ignore 
  	@description
  */


  webSocketCloseCompleteArgs.prototype._statusCode = null;

  /**
  	@ignore 
  	@description
  */


  function webSocketCloseCompleteArgs() {
    this.setStatusCode = __bind(this.setStatusCode, this);

    this.setReason = __bind(this.setReason, this);

    this.getStatusCode = __bind(this.getStatusCode, this);

    this.getReason = __bind(this.getReason, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      webSocketCloseCompleteArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    webSocketCloseCompleteArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the reason given for closing the connection.
  	 </div>
  
  	@function getReason
  	@return {fm.string}
  */


  webSocketCloseCompleteArgs.prototype.getReason = function() {
    return this._reason;
  };

  /**
  	 <div>
  	 Gets the status code associated with the close operation.
  	 </div>
  
  	@function getStatusCode
  	@return {fm.websync.webSocketStatusCode}
  */


  webSocketCloseCompleteArgs.prototype.getStatusCode = function() {
    return this._statusCode;
  };

  /**
  	 <div>
  	 Sets the reason given for closing the connection.
  	 </div>
  
  	@function setReason
  	@param {fm.string} value
  	@return {void}
  */


  webSocketCloseCompleteArgs.prototype.setReason = function() {
    var value;
    value = arguments[0];
    return this._reason = value;
  };

  /**
  	 <div>
  	 Sets the status code associated with the close operation.
  	 </div>
  
  	@function setStatusCode
  	@param {fm.websync.webSocketStatusCode} value
  	@return {void}
  */


  webSocketCloseCompleteArgs.prototype.setStatusCode = function() {
    var value;
    value = arguments[0];
    return this._statusCode = value;
  };

  return webSocketCloseCompleteArgs;

})(fm.dynamic);


/**
@class fm.websync.webSocketSendState
 <div>
 A wrapper for a WebSocket send request to support queueing.
 </div>

@extends fm.object
*/


fm.websync.webSocketSendState = (function(_super) {

  __extends(webSocketSendState, _super);

  /**
  	@ignore 
  	@description
  */


  webSocketSendState.prototype._requestBytes = null;

  /**
  	@ignore 
  	@description
  */


  webSocketSendState.prototype._sendArgs = null;

  /**
  	@ignore 
  	@description
  */


  function webSocketSendState() {
    this.setSendArgs = __bind(this.setSendArgs, this);

    this.setRequestBytes = __bind(this.setRequestBytes, this);

    this.getSendArgs = __bind(this.getSendArgs, this);

    this.getRequestBytes = __bind(this.getRequestBytes, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      webSocketSendState.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    webSocketSendState.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets request frame, in bytes.
  	 </div>
  
  	@function getRequestBytes
  	@return {fm.array}
  */


  webSocketSendState.prototype.getRequestBytes = function() {
    return this._requestBytes;
  };

  /**
  	 <div>
  	 Gets the arguments passed to the Send method.
  	 </div>
  
  	@function getSendArgs
  	@return {fm.websync.webSocketSendArgs}
  */


  webSocketSendState.prototype.getSendArgs = function() {
    return this._sendArgs;
  };

  /**
  	 <div>
  	 Sets request frame, in bytes.
  	 </div>
  
  	@function setRequestBytes
  	@param {fm.array} value
  	@return {void}
  */


  webSocketSendState.prototype.setRequestBytes = function() {
    var value;
    value = arguments[0];
    return this._requestBytes = value;
  };

  /**
  	 <div>
  	 Sets the arguments passed to the Send method.
  	 </div>
  
  	@function setSendArgs
  	@param {fm.websync.webSocketSendArgs} value
  	@return {void}
  */


  webSocketSendState.prototype.setSendArgs = function() {
    var value;
    value = arguments[0];
    return this._sendArgs = value;
  };

  return webSocketSendState;

})(fm.object);


/**
@class fm.websync.httpWebRequestTransfer
 <div>
 Defines methods for transferring messages using an instance of <see cref="fm.httpWebRequestTransfer">fm.httpWebRequestTransfer</see>.
 </div>

@extends fm.websync.messageTransfer
*/


fm.websync.httpWebRequestTransfer = (function(_super) {

  __extends(httpWebRequestTransfer, _super);

  /**
  	@ignore 
  	@description
  */


  httpWebRequestTransfer.prototype._callbackKey = null;

  /**
  	@ignore 
  	@description
  */


  httpWebRequestTransfer.prototype._httpTransfer = null;

  /**
  	@ignore 
  	@description
  */


  httpWebRequestTransfer.prototype._requestArgsKey = null;

  /**
  	@ignore 
  	@description
  */


  function httpWebRequestTransfer() {
    this.shutdown = __bind(this.shutdown, this);

    this.sendMessagesAsyncCallback = __bind(this.sendMessagesAsyncCallback, this);

    this.sendMessagesAsync = __bind(this.sendMessagesAsync, this);

    this.sendMessages = __bind(this.sendMessages, this);

    this.messageToHttpRequest = __bind(this.messageToHttpRequest, this);

    this.httpToMessageResponse = __bind(this.httpToMessageResponse, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      httpWebRequestTransfer.__super__.constructor.call(this);
      this._httpTransfer = fm.httpTransferFactory.getHttpTransfer();
      this._callbackKey = "fm.websync.httpWebRequestTransfer.callback";
      this._requestArgsKey = "fm.websync.httpWebRequestTransfer.requestArgs";
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    httpWebRequestTransfer.__super__.constructor.call(this);
    this._httpTransfer = fm.httpTransferFactory.getHttpTransfer();
    this._callbackKey = "fm.websync.httpWebRequestTransfer.callback";
    this._requestArgsKey = "fm.websync.httpWebRequestTransfer.requestArgs";
  }

  /**
  
  	@function httpToMessageResponse
  	@param {fm.httpResponseArgs} httpResponseArgs
  	@return {fm.websync.messageResponseArgs}
  */


  httpWebRequestTransfer.prototype.httpToMessageResponse = function() {
    var args2, args3, dynamicValue, httpResponseArgs, _var0;
    httpResponseArgs = arguments[0];
    dynamicValue = httpResponseArgs.getRequestArgs().getDynamicValue(this._requestArgsKey);
    args3 = new fm.websync.messageResponseArgs(dynamicValue);
    args3.setException(httpResponseArgs.getException());
    args3.setHeaders(httpResponseArgs.getHeaders());
    args2 = args3;
    if (!fm.stringExtensions.isNullOrEmpty(httpResponseArgs.getTextContent())) {
      args2.setMessages(fm.websync.message.fromJsonMultiple(httpResponseArgs.getTextContent()));
      return args2;
    }
    _var0 = httpResponseArgs.getBinaryContent();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      args2.setMessages(fm.websync.binaryMessage.fromBinaryMultiple(httpResponseArgs.getBinaryContent()));
    }
    return args2;
  };

  /**
  
  	@function messageToHttpRequest
  	@param {fm.websync.messageRequestArgs} requestArgs
  	@return {fm.httpRequestArgs}
  */


  httpWebRequestTransfer.prototype.messageToHttpRequest = function() {
    var args, args2, requestArgs, str, _i, _len, _var0;
    requestArgs = arguments[0];
    args2 = new fm.httpRequestArgs();
    args2.setMethod(fm.httpMethod.Post);
    args2.setOnRequestCreated(requestArgs.getOnHttpRequestCreated());
    args2.setOnResponseReceived(requestArgs.getOnHttpResponseReceived());
    args2.setSender(requestArgs.getSender());
    args2.setTimeout(requestArgs.getTimeout());
    args2.setUrl(requestArgs.getUrl());
    args = args2;
    args.setDynamicValue(this._requestArgsKey, requestArgs);
    _var0 = requestArgs.getHeaders().getAllKeys();
    for (_i = 0, _len = _var0.length; _i < _len; _i++) {
      str = _var0[_i];
      args.getHeaders().set(str, requestArgs.getHeaders().get(str));
    }
    if (requestArgs.getIsBinary()) {
      args.setBinaryContent(fm.websync.binaryMessage.toBinaryMultiple(requestArgs.getMessages()));
      args.getHeaders().set("Content-Type", "application/octet-stream");
      return args;
    }
    args.setTextContent(fm.websync.message.toJsonMultiple(requestArgs.getMessages()));
    args.getHeaders().set("Content-Type", "application/json");
    return args;
  };

  /**
  	 <div>
  	 Sends a request synchronously.
  	 </div><param name="requestArgs">The request parameters.</param><returns>The response parameters.</returns>
  
  	@function sendMessages
  	@param {fm.websync.messageRequestArgs} requestArgs
  	@return {fm.websync.messageResponseArgs}
  */


  httpWebRequestTransfer.prototype.sendMessages = function() {
    var args, httpResponseArgs, requestArgs;
    requestArgs = arguments[0];
    args = this.messageToHttpRequest(requestArgs);
    httpResponseArgs = this._httpTransfer.send(args);
    return this.httpToMessageResponse(httpResponseArgs);
  };

  /**
  	 <div>
  	 Sends a request asynchronously.
  	 </div><param name="requestArgs">The request parameters.</param><param name="callback">The callback to execute with the resulting response.</param>
  
  	@function sendMessagesAsync
  	@param {fm.websync.messageRequestArgs} requestArgs
  	@param {fm.singleAction} callback
  	@return {void}
  */


  httpWebRequestTransfer.prototype.sendMessagesAsync = function() {
    var args, callback, requestArgs;
    requestArgs = arguments[0];
    callback = arguments[1];
    args = this.messageToHttpRequest(requestArgs);
    args.setDynamicValue(this._callbackKey, callback);
    return this._httpTransfer.sendAsync(args, this.sendMessagesAsyncCallback);
  };

  /**
  
  	@function sendMessagesAsyncCallback
  	@param {fm.httpResponseArgs} httpResponseArgs
  	@return {void}
  */


  httpWebRequestTransfer.prototype.sendMessagesAsyncCallback = function() {
    var dynamicValue, httpResponseArgs;
    httpResponseArgs = arguments[0];
    dynamicValue = httpResponseArgs.getRequestArgs().getDynamicValue(this._callbackKey);
    return dynamicValue(this.httpToMessageResponse(httpResponseArgs));
  };

  /**
  	 <div>
  	 Releases any resources and shuts down.
  	 </div>
  
  	@function shutdown
  	@return {void}
  */


  httpWebRequestTransfer.prototype.shutdown = function() {
    try {
      return this._httpTransfer.shutdown();
    } catch (exception1) {

    } finally {

    }
  };

  return httpWebRequestTransfer;

})(fm.websync.messageTransfer);


/**
@class fm.websync.notifyingClient
 <div>
 Details about the client sending the notification data.
 </div>

@extends fm.serializable
*/


fm.websync.notifyingClient = (function(_super) {

  __extends(notifyingClient, _super);

  /**
  	@ignore 
  	@description
  */


  notifyingClient.prototype._boundRecords = null;

  /**
  	@ignore 
  	@description
  */


  notifyingClient.prototype._clientId = null;

  /**
  	@ignore 
  	@description
  */


  function notifyingClient() {
    this.toJson = __bind(this.toJson, this);

    this.setClientId = __bind(this.setClientId, this);

    this.setBoundRecords = __bind(this.setBoundRecords, this);

    this.getClientId = __bind(this.getClientId, this);

    this.getBoundRecords = __bind(this.getBoundRecords, this);

    var boundRecords, clientId;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      notifyingClient.__super__.constructor.call(this);
      this.setBoundRecords({});
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    if (arguments.length === 2) {
      clientId = arguments[0];
      boundRecords = arguments[1];
      notifyingClient.__super__.constructor.call(this);
      this.setClientId(clientId);
      this.setBoundRecords(boundRecords);
      return;
    }
    if (arguments.length === 0) {
      notifyingClient.__super__.constructor.call(this);
      this.setBoundRecords({});
      return;
    }
  }

  /**
  	 <div>
  	 Deserializes a JSON-formatted notifying client.
  	 </div><param name="notifyingClientJson">The JSON-formatted notifying client to deserialize.</param><returns>The notifying client.</returns>
  
  	@function fromJson
  	@param {fm.string} notifyingClientJson
  	@return {fm.websync.notifyingClient}
  */


  notifyingClient.fromJson = function() {
    var notifyingClientJson;
    notifyingClientJson = arguments[0];
    return fm.websync.serializer.deserializeNotifyingClient(notifyingClientJson);
  };

  /**
  	 <div>
  	 Serializes a notifying client to JSON.
  	 </div><param name="notifyingClient">The notifying client to serialize.</param><returns>The JSON-formatted notifying client.</returns>
  
  	@function toJson
  	@param {fm.websync.notifyingClient} notifyingClient
  	@return {fm.string}
  */


  notifyingClient.toJson = function() {
    var notifyingClient;
    notifyingClient = arguments[0];
    return fm.websync.serializer.serializeNotifyingClient(notifyingClient);
  };

  /**
  	 <div>
  	 Gets the notifying client's bound records.
  	 </div>
  
  	@function getBoundRecords
  	@return {fm.hash}
  */


  notifyingClient.prototype.getBoundRecords = function() {
    return this._boundRecords;
  };

  /**
  	 <div>
  	 Gets the notifying client's ID.
  	 </div>
  
  	@function getClientId
  	@return {fm.nullable}
  */


  notifyingClient.prototype.getClientId = function() {
    return this._clientId;
  };

  /**
  	 <div>
  	 Sets the notifying client's bound records.
  	 </div>
  
  	@function setBoundRecords
  	@param {fm.hash} value
  	@return {void}
  */


  notifyingClient.prototype.setBoundRecords = function() {
    var value;
    value = arguments[0];
    return this._boundRecords = value;
  };

  /**
  	 <div>
  	 Sets the notifying client's ID.
  	 </div>
  
  	@function setClientId
  	@param {fm.nullable} value
  	@return {void}
  */


  notifyingClient.prototype.setClientId = function() {
    var value;
    value = arguments[0];
    return this._clientId = value;
  };

  /**
  	 <div>
  	 Serializes this instance to JSON.
  	 </div><returns>The JSON-formatted notifying client.</returns>
  
  	@function toJson
  	@return {fm.string}
  */


  notifyingClient.prototype.toJson = function() {
    return fm.websync.notifyingClient.toJson(this);
  };

  return notifyingClient;

}).call(this, fm.serializable);


/**
@class fm.websync.baseMessage
 <div>
 Base class for WebSync client/publisher messages.
 </div>

@extends fm.websync.extensible
*/


fm.websync.baseMessage = (function(_super) {

  __extends(baseMessage, _super);

  /**
  	@ignore 
  	@description
  */


  baseMessage.prototype.__dataJson = null;

  /**
  	@ignore 
  	@description
  */


  baseMessage.prototype.__error = null;

  /**
  	@ignore 
  	@description
  */


  baseMessage.prototype.__successful = false;

  /**
  	@ignore 
  	@description
  */


  baseMessage.prototype.__timestamp = null;

  /**
  	@ignore 
  	@description
  */


  baseMessage.prototype._validate = false;

  /**
  	@ignore 
  	@description
  */


  function baseMessage() {
    this.setData = __bind(this.setData, this);

    this.getData = __bind(this.getData, this);

    this.setValidate = __bind(this.setValidate, this);

    this.setTimestamp = __bind(this.setTimestamp, this);

    this.setSuccessful = __bind(this.setSuccessful, this);

    this.setError = __bind(this.setError, this);

    this.setDataJson = __bind(this.setDataJson, this);

    this.setDataBytes = __bind(this.setDataBytes, this);

    this.getValidate = __bind(this.getValidate, this);

    this.getTimestamp = __bind(this.getTimestamp, this);

    this.getSuccessful = __bind(this.getSuccessful, this);

    this.getIsBinary = __bind(this.getIsBinary, this);

    this.getError = __bind(this.getError, this);

    this.getDataJson = __bind(this.getDataJson, this);

    this.getDataBytes = __bind(this.getDataBytes, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      baseMessage.__super__.constructor.call(this);
      this.setValidate(true);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    baseMessage.__super__.constructor.call(this);
    this.setValidate(true);
  }

  /**
  	 <div>
  	 Gets the data payload
  	 in binary format. (Overrides <see cref="fm.websync.baseMessage.dataJson">fm.websync.baseMessage.dataJson</see>.)
  	 </div>
  
  	@function getDataBytes
  	@return {fm.array}
  */


  baseMessage.prototype.getDataBytes = function() {
    var decoded, _var0, _var1;
    decoded = null;
    _var0 = new fm.holder(decoded);
    _var1 = fm.websync.crypto.tryBase64Decode(fm.serializer.deserializeString(this.__dataJson), _var0);
    decoded = _var0.getValue();
    _var1;

    return decoded;
  };

  /**
  	 <div>
  	 Gets the data payload
  	 in JSON format. (Overrides <see cref="fm.websync.baseMessage.dataBytes">fm.websync.baseMessage.dataBytes</see>.)
  	 </div>
  
  	@function getDataJson
  	@return {fm.string}
  */


  baseMessage.prototype.getDataJson = function() {
    return this.__dataJson;
  };

  /**
  	 <div>
  	 Gets the friendly error message if <see cref="fm.websync.baseMessage.successful">fm.websync.baseMessage.successful</see> is
  	 <c>false</c>.
  	 </div>
  
  	@function getError
  	@return {fm.string}
  */


  baseMessage.prototype.getError = function() {
    return this.__error;
  };

  /**
  	 <div>
  	 Gets whether or not the data is binary.
  	 </div>
  
  	@function getIsBinary
  	@return {fm.boolean}
  */


  baseMessage.prototype.getIsBinary = function() {
    var _var0;
    _var0 = this.getDataBytes();
    return _var0 !== null && typeof _var0 !== 'undefined';
  };

  /**
  	 <div>
  	 Gets the flag that indicates whether the request should be
  	 processed. If the message represents a response, this indicates whether the
  	 processing was successful. If set to <c>false</c>, the <see cref="fm.websync.baseMessage.error">fm.websync.baseMessage.error</see>
  	 property should be set to a friendly error message.
  	 </div>
  
  	@function getSuccessful
  	@return {fm.boolean}
  */


  baseMessage.prototype.getSuccessful = function() {
    return this.__successful;
  };

  /**
  	 <div>
  	 Gets the date/time the message was processed on the server (in UTC/GMT).
  	 </div>
  
  	@function getTimestamp
  	@return {fm.nullable}
  */


  baseMessage.prototype.getTimestamp = function() {
    return this.__timestamp;
  };

  /**
  	 <div>
  	 Gets whether to skip validation while deserializing, used internally.
  	 </div>
  
  	@function getValidate
  	@return {fm.boolean}
  */


  baseMessage.prototype.getValidate = function() {
    return this._validate;
  };

  /**
  	 <div>
  	 Sets the data payload
  	 in binary format. (Overrides <see cref="fm.websync.baseMessage.dataJson">fm.websync.baseMessage.dataJson</see>.)
  	 </div>
  
  	@function setDataBytes
  	@param {fm.array} value
  	@return {void}
  */


  baseMessage.prototype.setDataBytes = function() {
    var value;
    value = arguments[0];
    this.__dataJson = fm.serializer.serializeString(fm.websync.crypto.base64Encode(value));
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the data payload
  	 in JSON format. (Overrides <see cref="fm.websync.baseMessage.dataBytes">fm.websync.baseMessage.dataBytes</see>.)
  	 </div>
  
  	@function setDataJson
  	@param {fm.string} value
  	@return {void}
  */


  baseMessage.prototype.setDataJson = function() {
    var value, _var0;
    value = arguments[0];
    _var0 = value;
    if (!((!this.getValidate() || (_var0 === null || typeof _var0 === 'undefined')) || fm.serializer.isValidJson(value))) {
      throw new Error("The value is not valid JSON.");
    }
    this.__dataJson = value;
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the friendly error message if <see cref="fm.websync.baseMessage.successful">fm.websync.baseMessage.successful</see> is
  	 <c>false</c>.
  	 </div>
  
  	@function setError
  	@param {fm.string} value
  	@return {void}
  */


  baseMessage.prototype.setError = function() {
    var value;
    value = arguments[0];
    this.__error = value;
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the flag that indicates whether the request should be
  	 processed. If the message represents a response, this indicates whether the
  	 processing was successful. If set to <c>false</c>, the <see cref="fm.websync.baseMessage.error">fm.websync.baseMessage.error</see>
  	 property should be set to a friendly error message.
  	 </div>
  
  	@function setSuccessful
  	@param {fm.boolean} value
  	@return {void}
  */


  baseMessage.prototype.setSuccessful = function() {
    var value;
    value = arguments[0];
    this.__successful = value;
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the date/time the message was processed on the server (in UTC/GMT).
  	 </div>
  
  	@function setTimestamp
  	@param {fm.nullable} value
  	@return {void}
  */


  baseMessage.prototype.setTimestamp = function() {
    var value;
    value = arguments[0];
    this.__timestamp = value;
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets whether to skip validation while deserializing, used internally.
  	 </div>
  
  	@function setValidate
  	@param {fm.boolean} value
  	@return {void}
  */


  baseMessage.prototype.setValidate = function() {
    var value;
    value = arguments[0];
    return this._validate = value;
  };

  /**
  
  	@function getData
  	@return {fm.hash}
  */


  baseMessage.prototype.getData = function() {
    return fm.json.deserialize(this.getDataJson.apply(this, arguments));
  };

  /**
  
  	@function setData
  	@param {fm.hash} data
  	@return {}
  */


  baseMessage.prototype.setData = function() {
    var data;
    data = arguments[0];
    arguments[arguments.length - 1] = fm.json.serialize(arguments[arguments.length - 1]);
    return this.setDataJson.apply(this, arguments);
  };

  return baseMessage;

})(fm.websync.extensible);


/**
@class fm.websync.notification
 <div>
 The WebSync notification used for direct notifying.
 </div>

@extends fm.websync.baseMessage
*/


fm.websync.notification = (function(_super) {

  __extends(notification, _super);

  /**
  	@ignore 
  	@description
  */


  function notification() {
    this.toJson = __bind(this.toJson, this);

    this.setTag = __bind(this.setTag, this);

    this.setClientId = __bind(this.setClientId, this);

    this.getTag = __bind(this.getTag, this);

    this.getClientId = __bind(this.getClientId, this);

    var clientId, dataJson, tag;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      notification.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    if (arguments.length === 2) {
      clientId = arguments[0];
      dataJson = arguments[1];
      notification.call(this, clientId, dataJson, null);
      return;
    }
    if (arguments.length === 3) {
      clientId = arguments[0];
      dataJson = arguments[1];
      tag = arguments[2];
      notification.__super__.constructor.call(this);
      this.setClientId(clientId);
      this.setDataJson(dataJson);
      this.setTag(tag);
      return;
    }
    if (arguments.length === 0) {
      notification.__super__.constructor.call(this);
      return;
    }
    if (arguments.length === 1) {
      clientId = arguments[0];
      notification.__super__.constructor.call(this);
      this.setClientId(clientId);
      return;
    }
  }

  /**
  	 <div>
  	 Deserializes a notification from JSON.
  	 </div><param name="notificationJson">A JSON string to deserialize.</param><returns>A deserialized notification.</returns>
  
  	@function fromJson
  	@param {fm.string} notificationJson
  	@return {fm.websync.notification}
  */


  notification.fromJson = function() {
    var notificationJson;
    notificationJson = arguments[0];
    return fm.websync.serializer.deserializeNotification(notificationJson);
  };

  /**
  	 <div>
  	 Deserializes a list of notifications from JSON.
  	 </div><param name="notificationsJson">A JSON string to deserialize.</param><returns>A deserialized list of notifications.</returns>
  
  	@function fromJsonMultiple
  	@param {fm.string} notificationsJson
  	@return {fm.array}
  */


  notification.fromJsonMultiple = function() {
    var notificationsJson;
    notificationsJson = arguments[0];
    return fm.websync.serializer.deserializeNotificationArray(notificationsJson);
  };

  /**
  	 <div>
  	 Converts a Notification from its Message format.
  	 </div><param name="message">The message.</param><returns>The notification.</returns>
  
  	@function fromMessage
  	@param {fm.websync.message} message
  	@return {fm.websync.notification}
  */


  notification.fromMessage = function() {
    var message, notification, _var0;
    message = arguments[0];
    _var0 = message;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return null;
    }
    notification = new fm.websync.notification();
    notification.setClientId(message.getNotifyClientId());
    notification.setSuccessful(message.getSuccessful());
    notification.setError(message.getError());
    notification.setTimestamp(message.getTimestamp());
    notification.setDataJson(message.getDataJson());
    notification.setExtensions(message.getExtensions());
    return notification;
  };

  /**
  	 <div>
  	 Converts a set of Notifications from their Message formats.
  	 </div><param name="messages">The messages.</param><returns>The notifications.</returns>
  
  	@function fromMessages
  	@param {fm.array} messages
  	@return {fm.array}
  */


  notification.fromMessages = function() {
    var i, messages, notificationArray, _var0;
    messages = arguments[0];
    _var0 = messages;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return null;
    }
    notificationArray = [];
    i = 0;
    while (i < messages.length) {
      try {
        notificationArray[i] = fm.websync.notification.fromMessage(messages[i]);
      } finally {
        i++;
      }
    }
    return notificationArray;
  };

  /**
  	 <div>
  	 Serializes a notification to JSON.
  	 </div><param name="notification">A notification to serialize.</param><returns>A JSON-serialized notification.</returns>
  
  	@function toJson
  	@param {fm.websync.notification} notification
  	@return {fm.string}
  */


  notification.toJson = function() {
    var notification;
    notification = arguments[0];
    return fm.websync.serializer.serializeNotification(notification);
  };

  /**
  	 <div>
  	 Serializes a list of notifications to JSON.
  	 </div><param name="notifications">A list of notifications to serialize.</param><returns>A JSON-serialized array of notifications.</returns>
  
  	@function toJsonMultiple
  	@param {fm.array} notifications
  	@return {fm.string}
  */


  notification.toJsonMultiple = function() {
    var notifications;
    notifications = arguments[0];
    return fm.websync.serializer.serializeNotificationArray(notifications);
  };

  /**
  	 <div>
  	 Converts a Notification to its Message format.
  	 </div><param name="notification">The notification.</param><returns>The message.</returns>
  
  	@function toMessage
  	@param {fm.websync.notification} notification
  	@return {fm.websync.message}
  */


  notification.toMessage = function() {
    var message, notification, _var0;
    notification = arguments[0];
    _var0 = notification;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return null;
    }
    message = new fm.websync.message();
    message.setNotifyClientId(notification.getClientId());
    message.setSuccessful(notification.getSuccessful());
    message.setError(notification.getError());
    message.setTimestamp(notification.getTimestamp());
    message.setDataJson(notification.getDataJson());
    message.setExtensions(notification.getExtensions());
    return message;
  };

  /**
  	 <div>
  	 Converts a set of Notifications to their Message formats.
  	 </div><param name="notifications">The notifications.</param><returns>The messages.</returns>
  
  	@function toMessages
  	@param {fm.array} notifications
  	@return {fm.array}
  */


  notification.toMessages = function() {
    var i, messageArray, notifications, _var0;
    notifications = arguments[0];
    _var0 = notifications;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return null;
    }
    messageArray = [];
    i = 0;
    while (i < notifications.length) {
      try {
        messageArray[i] = fm.websync.notification.toMessage(notifications[i]);
      } finally {
        i++;
      }
    }
    return messageArray;
  };

  /**
  	 <div>
  	 Gets the client ID the publisher is targeting.
  	 </div>
  
  	@function getClientId
  	@return {fm.guid}
  */


  notification.prototype.getClientId = function() {
    var nullable;
    nullable = fm.serializer.deserializeGuid(this.getExtensionValueJson("fm.notify"));
    if (nullable !== null) {
      return nullable;
    }
    return fm.guid.empty;
  };

  /**
  	 <div>
  	 Gets the tag that identifies the contents of the payload.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  notification.prototype.getTag = function() {
    return fm.serializer.deserializeString(this.getExtensionValueJson("fm.tag"));
  };

  /**
  	 <div>
  	 Sets the client ID the publisher is targeting.
  	 </div>
  
  	@function setClientId
  	@param {fm.guid} value
  	@return {void}
  */


  notification.prototype.setClientId = function() {
    var value;
    value = arguments[0];
    this.setExtensionValueJson("fm.notify", fm.serializer.serializeGuid(value), false);
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the tag that identifies the contents of the payload.
  	 </div>
  
  	@function setTag
  	@param {fm.string} value
  	@return {void}
  */


  notification.prototype.setTag = function() {
    var value;
    value = arguments[0];
    this.setExtensionValueJson("fm.tag", fm.serializer.serializeString(value), false);
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Serializes the notification to JSON.
  	 </div><returns>The notification in JSON-serialized format.</returns>
  
  	@function toJson
  	@return {fm.string}
  */


  notification.prototype.toJson = function() {
    return fm.websync.notification.toJson(this);
  };

  return notification;

}).call(this, fm.websync.baseMessage);


/**
@class fm.websync.publisherResponseArgs
 <div>
 The internal representation of data received in response to a publisher request.
 </div>

@extends fm.object
*/


fm.websync.publisherResponseArgs = (function(_super) {

  __extends(publisherResponseArgs, _super);

  /**
  	@ignore 
  	@description
  */


  publisherResponseArgs.prototype._exception = null;

  /**
  	@ignore 
  	@description
  */


  publisherResponseArgs.prototype._responses = null;

  /**
  	@ignore 
  	@description
  */


  function publisherResponseArgs() {
    this.setResponses = __bind(this.setResponses, this);

    this.setResponse = __bind(this.setResponse, this);

    this.setException = __bind(this.setException, this);

    this.getResponses = __bind(this.getResponses, this);

    this.getResponse = __bind(this.getResponse, this);

    this.getException = __bind(this.getException, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      publisherResponseArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    publisherResponseArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the exception generated by the request.
  	 </div>
  
  	@function getException
  	@return {Error}
  */


  publisherResponseArgs.prototype.getException = function() {
    return this._exception;
  };

  /**
  	 <div>
  	 Gets the first response received from the server.
  	 </div>
  
  	@function getResponse
  	@return {fm.websync.message}
  */


  publisherResponseArgs.prototype.getResponse = function() {
    var _var0;
    _var0 = this.getResponses();
    if ((_var0 === null || typeof _var0 === 'undefined') || (this.getResponses().length === 0)) {
      return null;
    }
    return this.getResponses()[0];
  };

  /**
  	 <div>
  	 Gets the responses received from the server.
  	 </div>
  
  	@function getResponses
  	@return {fm.array}
  */


  publisherResponseArgs.prototype.getResponses = function() {
    return this._responses;
  };

  /**
  	 <div>
  	 Sets the exception generated by the request.
  	 </div>
  
  	@function setException
  	@param {Error} value
  	@return {void}
  */


  publisherResponseArgs.prototype.setException = function() {
    var value;
    value = arguments[0];
    return this._exception = value;
  };

  /**
  	 <div>
  	 Sets the first response received from the server.
  	 </div>
  
  	@function setResponse
  	@param {fm.websync.message} value
  	@return {void}
  */


  publisherResponseArgs.prototype.setResponse = function() {
    var value;
    value = arguments[0];
    return this.setResponses([value]);
  };

  /**
  	 <div>
  	 Sets the responses received from the server.
  	 </div>
  
  	@function setResponses
  	@param {fm.array} value
  	@return {void}
  */


  publisherResponseArgs.prototype.setResponses = function() {
    var value;
    value = arguments[0];
    return this._responses = value;
  };

  return publisherResponseArgs;

})(fm.object);


/**
@class fm.websync.baseClient
 <div>
 Base class for WebSync clients and publishers.
 </div>

@extends fm.dynamic
*/


fm.websync.baseClient = (function(_super) {

  __extends(baseClient, _super);

  /**
  	@ignore 
  	@description
  */


  baseClient.prototype.__domainName = null;

  /**
  	@ignore 
  	@description
  */


  baseClient.prototype._concurrencyMode = null;

  /**
  	@ignore 
  	@description
  */


  baseClient.prototype._disableBinary = false;

  /**
  	@ignore 
  	@description
  */


  baseClient.prototype._domainKey = null;

  /**
  	@ignore 
  	@description
  */


  baseClient._headers = null;

  /**
  	@ignore 
  	@description  <div>
  	 The default message for an invalid server response.
  	 </div>
  */


  baseClient._invalidResponseMessage = "Invalid response received from server.";

  /**
  	@ignore 
  	@description
  */


  baseClient.prototype._onHttpRequestCreated = null;

  /**
  	@ignore 
  	@description
  */


  baseClient.prototype._onHttpResponseReceived = null;

  /**
  	@ignore 
  	@description
  */


  baseClient.prototype._onRequestCreated = null;

  /**
  	@ignore 
  	@description
  */


  baseClient.prototype._onResponseReceived = null;

  /**
  	@ignore 
  	@description
  */


  baseClient.prototype._requestTimeout = 0;

  /**
  	@ignore 
  	@description
  */


  baseClient.prototype._requestUrl = null;

  /**
  	@ignore 
  	@description
  */


  function baseClient() {
    this.setRequestUrl = __bind(this.setRequestUrl, this);

    this.setRequestTimeout = __bind(this.setRequestTimeout, this);

    this.setDomainName = __bind(this.setDomainName, this);

    this.setDomainKey = __bind(this.setDomainKey, this);

    this.setDisableBinary = __bind(this.setDisableBinary, this);

    this.setConcurrencyMode = __bind(this.setConcurrencyMode, this);

    this.removeOnResponseReceived = __bind(this.removeOnResponseReceived, this);

    this.removeOnRequestCreated = __bind(this.removeOnRequestCreated, this);

    this.removeOnHttpResponseReceived = __bind(this.removeOnHttpResponseReceived, this);

    this.removeOnHttpRequestCreated = __bind(this.removeOnHttpRequestCreated, this);

    this.internalOnResponseReceived = __bind(this.internalOnResponseReceived, this);

    this.internalOnRequestCreated = __bind(this.internalOnRequestCreated, this);

    this.internalOnHttpResponseReceived = __bind(this.internalOnHttpResponseReceived, this);

    this.internalOnHttpRequestCreated = __bind(this.internalOnHttpRequestCreated, this);

    this.getRequestUrl = __bind(this.getRequestUrl, this);

    this.getRequestTimeout = __bind(this.getRequestTimeout, this);

    this.getDomainName = __bind(this.getDomainName, this);

    this.getDomainKey = __bind(this.getDomainKey, this);

    this.getDisableBinary = __bind(this.getDisableBinary, this);

    this.getConcurrencyMode = __bind(this.getConcurrencyMode, this);

    this.createHeadersNoCache = __bind(this.createHeadersNoCache, this);

    this.createHeaders = __bind(this.createHeaders, this);

    this.addOnResponseReceived = __bind(this.addOnResponseReceived, this);

    this.addOnRequestCreated = __bind(this.addOnRequestCreated, this);

    this.addOnHttpResponseReceived = __bind(this.addOnHttpResponseReceived, this);

    this.addOnHttpRequestCreated = __bind(this.addOnHttpRequestCreated, this);

    var requestUrl, _var0;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      baseClient.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    requestUrl = arguments[0];
    baseClient.__super__.constructor.call(this);
    _var0 = requestUrl;
    if (_var0 === null || typeof _var0 === 'undefined') {
      throw new Error("requestUrl");
    }
    this.setRequestUrl(requestUrl);
    this.setRequestTimeout(15000);
    this.setDomainKey(fm.websync.defaults.getDomainKey());
    this.setDomainName(fm.websync.defaults.getDomainName());
    this.setConcurrencyMode(fm.websync.concurrencyMode.Low);
  }

  /**
  	 <div>
  	 Takes a domain name and ensures it starts with http:// or https://.
  	 </div><param name="domainName">The domain name to sanitize.</param><returns>The sanitized domain name.</returns>
  
  	@function sanitizeDomainName
  	@param {fm.string} domainName
  	@return {fm.string}
  */


  baseClient.sanitizeDomainName = function() {
    var domainName, index;
    domainName = arguments[0];
    if (fm.stringExtensions.startsWith(domainName, "http://", fm.stringComparison.Ordinal)) {
      domainName = domainName.substring("http://".length);
    } else {
      if (fm.stringExtensions.startsWith(domainName, "https://", fm.stringComparison.Ordinal)) {
        domainName = domainName.substring("https://".length);
      }
    }
    index = fm.stringExtensions.indexOf(domainName, "/");
    if (index !== -1) {
      domainName = fm.stringExtensions.substring(domainName, 0, index);
    }
    return domainName;
  };

  /**
  
  	@function addOnHttpRequestCreated
  	@param {fm.singleAction} value
  	@return {void}
  */


  baseClient.prototype.addOnHttpRequestCreated = function() {
    var value;
    value = arguments[0];
    return this._onHttpRequestCreated = fm.delegate.combine(this._onHttpRequestCreated, value);
  };

  /**
  
  	@function addOnHttpResponseReceived
  	@param {fm.singleAction} value
  	@return {void}
  */


  baseClient.prototype.addOnHttpResponseReceived = function() {
    var value;
    value = arguments[0];
    return this._onHttpResponseReceived = fm.delegate.combine(this._onHttpResponseReceived, value);
  };

  /**
  
  	@function addOnRequestCreated
  	@param {fm.singleAction} value
  	@return {void}
  */


  baseClient.prototype.addOnRequestCreated = function() {
    var value;
    value = arguments[0];
    return this._onRequestCreated = fm.delegate.combine(this._onRequestCreated, value);
  };

  /**
  
  	@function addOnResponseReceived
  	@param {fm.singleAction} value
  	@return {void}
  */


  baseClient.prototype.addOnResponseReceived = function() {
    var value;
    value = arguments[0];
    return this._onResponseReceived = fm.delegate.combine(this._onResponseReceived, value);
  };

  /**
  	 <div>
  	 Creates an initial set of headers, including
  	 the domain key and domain name.
  	 </div><returns></returns>
  
  	@function createHeaders
  	@return {fm.nameValueCollection}
  */


  baseClient.prototype.createHeaders = function() {
    var _var0;
    if (this.getConcurrencyMode() === fm.websync.concurrencyMode.High) {
      _var0 = fm.websync.baseClient._headers;
      if (_var0 === null || typeof _var0 === 'undefined') {
        this._headers = this.createHeadersNoCache();
      }
      return fm.websync.baseClient._headers;
    }
    return this.createHeadersNoCache();
  };

  /**
  
  	@function createHeadersNoCache
  	@return {fm.nameValueCollection}
  */


  baseClient.prototype.createHeadersNoCache = function() {
    var values, _var0;
    values = new fm.nameValueCollection();
    if (this.getDomainName() !== fm.websync.defaults.getDomainName()) {
      values.set("X-FM-DomainName", this.getDomainName());
    }
    _var0 = this.getDomainKey();
    if ((_var0 === null ? _var0 !== fm.websync.defaults.getDomainKey() : !_var0.equals(fm.websync.defaults.getDomainKey()))) {
      values.set("X-FM-DomainKey", this.getDomainKey().toString());
    }
    return values;
  };

  /**
  	 <div>
  	 Gets a flag indicating the level of concurrency in the current process.
  	 The intended use of this property is to lighten the processor load when hundreds
  	 or thousands of instances are created in a single process for the purposes of
  	 generating load for testing.
  	 </div>
  
  	@function getConcurrencyMode
  	@return {fm.websync.concurrencyMode}
  */


  baseClient.prototype.getConcurrencyMode = function() {
    return this._concurrencyMode;
  };

  /**
  	 <div>
  	 Gets whether to disable the transmission of binary payloads
  	 as binary on the wire. If set to <c>true</c>, binary payloads will
  	 be sent over the wire as base64-encoded strings.
  	 </div>
  
  	@function getDisableBinary
  	@return {fm.boolean}
  */


  baseClient.prototype.getDisableBinary = function() {
    return this._disableBinary;
  };

  /**
  	 <div>
  	 Gets the domain key for sandboxing connections to the server.
  	 Defaults to "11111111-1111-1111-1111-111111111111". If you are using
  	 WebSync On-Demand, this should be set to the private domain key if you
  	 are attempting to use methods that have been secured in the Portal;
  	 otherwise, use the public domain key.
  	 </div>
  
  	@function getDomainKey
  	@return {fm.guid}
  */


  baseClient.prototype.getDomainKey = function() {
    return this._domainKey;
  };

  /**
  	 <div>
  	 Gets the domain name to send as the <tt>Referrer</tt> with each request.
  	 Defaults to "localhost". If you are using WebSync On-Demand, this field is only
  	 necessary if you are using the public domain key, in which case it should be set
  	 to equal the domain name entered in the Portal for the domain key (e.g.
  	 "frozenmountain.com").
  	 </div>
  
  	@function getDomainName
  	@return {fm.string}
  */


  baseClient.prototype.getDomainName = function() {
    return this.__domainName;
  };

  /**
  	 <div>
  	 Gets the number of milliseconds to wait for a standard request to
  	 return a response before it is aborted and another request is attempted.
  	 Defaults to 15000 (15 seconds).
  	 </div>
  
  	@function getRequestTimeout
  	@return {fm.int}
  */


  baseClient.prototype.getRequestTimeout = function() {
    return this._requestTimeout;
  };

  /**
  	 <div>
  	 Gets the absolute URL of the WebSync request handler, typically
  	 ending with websync.ashx.
  	 </div>
  
  	@function getRequestUrl
  	@return {fm.string}
  */


  baseClient.prototype.getRequestUrl = function() {
    return this._requestUrl;
  };

  /**
  	 <div>
  	 Wrapper for the <see cref="fm.websync.baseClient.addOnHttpRequestCreated">fm.websync.baseClient.addOnHttpRequestCreated</see> event.
  	 </div><param name="e">The event args.</param>
  
  	@function internalOnHttpRequestCreated
  	@param {fm.httpRequestCreatedArgs} e
  	@return {void}
  */


  baseClient.prototype.internalOnHttpRequestCreated = function() {
    var e, onHttpRequestCreated, _var0;
    e = arguments[0];
    onHttpRequestCreated = this._onHttpRequestCreated;
    _var0 = onHttpRequestCreated;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      return onHttpRequestCreated(e);
    }
  };

  /**
  	 <div>
  	 Wrapper for the <see cref="fm.websync.baseClient.addOnHttpResponseReceived">fm.websync.baseClient.addOnHttpResponseReceived</see> event.
  	 </div><param name="e">The event args.</param>
  
  	@function internalOnHttpResponseReceived
  	@param {fm.httpResponseReceivedArgs} e
  	@return {void}
  */


  baseClient.prototype.internalOnHttpResponseReceived = function() {
    var e, onHttpResponseReceived, _var0;
    e = arguments[0];
    onHttpResponseReceived = this._onHttpResponseReceived;
    _var0 = onHttpResponseReceived;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      return onHttpResponseReceived(e);
    }
  };

  /**
  	 <div>
  	 Wrapper for the <see cref="fm.websync.baseClient.addOnRequestCreated">fm.websync.baseClient.addOnRequestCreated</see> event.
  	 </div><param name="e">The event args.</param>
  
  	@function internalOnRequestCreated
  	@param {fm.websync.messageRequestCreatedArgs} e
  	@return {void}
  */


  baseClient.prototype.internalOnRequestCreated = function() {
    var e, onRequestCreated, _var0;
    e = arguments[0];
    onRequestCreated = this._onRequestCreated;
    _var0 = onRequestCreated;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      return onRequestCreated(e);
    }
  };

  /**
  	 <div>
  	 Wrapper for the <see cref="fm.websync.baseClient.addOnResponseReceived">fm.websync.baseClient.addOnResponseReceived</see> event.
  	 </div><param name="e">The event args.</param>
  
  	@function internalOnResponseReceived
  	@param {fm.websync.messageResponseReceivedArgs} e
  	@return {void}
  */


  baseClient.prototype.internalOnResponseReceived = function() {
    var e, onResponseReceived, _var0;
    e = arguments[0];
    onResponseReceived = this._onResponseReceived;
    _var0 = onResponseReceived;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      return onResponseReceived(e);
    }
  };

  /**
  
  	@function removeOnHttpRequestCreated
  	@param {fm.singleAction} value
  	@return {void}
  */


  baseClient.prototype.removeOnHttpRequestCreated = function() {
    var value;
    value = arguments[0];
    return this._onHttpRequestCreated = fm.delegate.remove(this._onHttpRequestCreated, value);
  };

  /**
  
  	@function removeOnHttpResponseReceived
  	@param {fm.singleAction} value
  	@return {void}
  */


  baseClient.prototype.removeOnHttpResponseReceived = function() {
    var value;
    value = arguments[0];
    return this._onHttpResponseReceived = fm.delegate.remove(this._onHttpResponseReceived, value);
  };

  /**
  
  	@function removeOnRequestCreated
  	@param {fm.singleAction} value
  	@return {void}
  */


  baseClient.prototype.removeOnRequestCreated = function() {
    var value;
    value = arguments[0];
    return this._onRequestCreated = fm.delegate.remove(this._onRequestCreated, value);
  };

  /**
  
  	@function removeOnResponseReceived
  	@param {fm.singleAction} value
  	@return {void}
  */


  baseClient.prototype.removeOnResponseReceived = function() {
    var value;
    value = arguments[0];
    return this._onResponseReceived = fm.delegate.remove(this._onResponseReceived, value);
  };

  /**
  	 <div>
  	 Sets a flag indicating the level of concurrency in the current process.
  	 The intended use of this property is to lighten the processor load when hundreds
  	 or thousands of instances are created in a single process for the purposes of
  	 generating load for testing.
  	 </div>
  
  	@function setConcurrencyMode
  	@param {fm.websync.concurrencyMode} value
  	@return {void}
  */


  baseClient.prototype.setConcurrencyMode = function() {
    var value;
    value = arguments[0];
    return this._concurrencyMode = value;
  };

  /**
  	 <div>
  	 Sets whether to disable the transmission of binary payloads
  	 as binary on the wire. If set to <c>true</c>, binary payloads will
  	 be sent over the wire as base64-encoded strings.
  	 </div>
  
  	@function setDisableBinary
  	@param {fm.boolean} value
  	@return {void}
  */


  baseClient.prototype.setDisableBinary = function() {
    var value;
    value = arguments[0];
    return this._disableBinary = value;
  };

  /**
  	 <div>
  	 Sets the domain key for sandboxing connections to the server.
  	 Defaults to "11111111-1111-1111-1111-111111111111". If you are using
  	 WebSync On-Demand, this should be set to the private domain key if you
  	 are attempting to use methods that have been secured in the Portal;
  	 otherwise, use the public domain key.
  	 </div>
  
  	@function setDomainKey
  	@param {fm.guid} value
  	@return {void}
  */


  baseClient.prototype.setDomainKey = function() {
    var value;
    value = arguments[0];
    return this._domainKey = value;
  };

  /**
  	 <div>
  	 Sets the domain name to send as the <tt>Referrer</tt> with each request.
  	 Defaults to "localhost". If you are using WebSync On-Demand, this field is only
  	 necessary if you are using the public domain key, in which case it should be set
  	 to equal the domain name entered in the Portal for the domain key (e.g.
  	 "frozenmountain.com").
  	 </div>
  
  	@function setDomainName
  	@param {fm.string} value
  	@return {void}
  */


  baseClient.prototype.setDomainName = function() {
    var value, _var0;
    value = arguments[0];
    _var0 = value;
    if (_var0 === null || typeof _var0 === 'undefined') {
      value = fm.websync.defaults.getDomainName();
    }
    return this.__domainName = fm.websync.baseClient.sanitizeDomainName(value);
  };

  /**
  	 <div>
  	 Sets the number of milliseconds to wait for a standard request to
  	 return a response before it is aborted and another request is attempted.
  	 Defaults to 15000 (15 seconds).
  	 </div>
  
  	@function setRequestTimeout
  	@param {fm.int} value
  	@return {void}
  */


  baseClient.prototype.setRequestTimeout = function() {
    var value;
    value = arguments[0];
    return this._requestTimeout = value;
  };

  /**
  	 <div>
  	 Sets the absolute URL of the WebSync request handler, typically
  	 ending with websync.ashx.
  	 </div>
  
  	@function setRequestUrl
  	@param {fm.string} value
  	@return {void}
  */


  baseClient.prototype.setRequestUrl = function() {
    var value;
    value = arguments[0];
    return this._requestUrl = value;
  };

  baseClient._headers = null;

  return baseClient;

}).call(this, fm.dynamic);


/**
@class fm.websync.baseAdvice
 <div>
 Base advice class used in <see cref="fm.websync.message">Messagesfm.websync.message</see> and for nested advice.
 </div>

@extends fm.serializable
*/


fm.websync.baseAdvice = (function(_super) {

  __extends(baseAdvice, _super);

  /**
  	@ignore 
  	@description
  */


  baseAdvice.prototype.__hosts = null;

  /**
  	@ignore 
  	@description
  */


  baseAdvice.prototype.__interval = null;

  /**
  	@ignore 
  	@description
  */


  baseAdvice.prototype.__reconnect = null;

  /**
  	@ignore 
  	@description
  */


  function baseAdvice() {
    this.toJson = __bind(this.toJson, this);

    this.setReconnect = __bind(this.setReconnect, this);

    this.setInterval = __bind(this.setInterval, this);

    this.setHosts = __bind(this.setHosts, this);

    this.getReconnect = __bind(this.getReconnect, this);

    this.getInterval = __bind(this.getInterval, this);

    this.getHosts = __bind(this.getHosts, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      baseAdvice.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    baseAdvice.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Deserializes a single base advice object from JSON.
  	 </div><param name="baseAdviceJson">The JSON base advice object to deserialize.</param><returns>The deserialized advice object.</returns>
  
  	@function fromJson
  	@param {fm.string} baseAdviceJson
  	@return {fm.websync.baseAdvice}
  */


  baseAdvice.fromJson = function() {
    var baseAdviceJson;
    baseAdviceJson = arguments[0];
    return fm.websync.serializer.deserializeBaseAdvice(baseAdviceJson);
  };

  /**
  	 <div>
  	 Serializes a single base advice object to JSON.
  	 </div><param name="baseAdvice">The base advice object to serialize.</param><returns>The serialized advice object.</returns>
  
  	@function toJson
  	@param {fm.websync.baseAdvice} baseAdvice
  	@return {fm.string}
  */


  baseAdvice.toJson = function() {
    var baseAdvice;
    baseAdvice = arguments[0];
    return fm.websync.serializer.serializeBaseAdvice(baseAdvice);
  };

  /**
  	 <div>
  	 Gets the list of host names that may be used as alternate servers.
  	 </div>
  
  	@function getHosts
  	@return {fm.array}
  */


  baseAdvice.prototype.getHosts = function() {
    return this.__hosts;
  };

  /**
  	 <div>
  	 Gets the interval to wait before following the reconnect advice.
  	 </div>
  
  	@function getInterval
  	@return {fm.nullable}
  */


  baseAdvice.prototype.getInterval = function() {
    return this.__interval;
  };

  /**
  	 <div>
  	 Gets how the client should attempt to re-establish a connection with the server.
  	 </div>
  
  	@function getReconnect
  	@return {fm.nullable}
  */


  baseAdvice.prototype.getReconnect = function() {
    return this.__reconnect;
  };

  /**
  	 <div>
  	 Sets the list of host names that may be used as alternate servers.
  	 </div>
  
  	@function setHosts
  	@param {fm.array} value
  	@return {void}
  */


  baseAdvice.prototype.setHosts = function() {
    var value;
    value = arguments[0];
    this.__hosts = value;
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the interval to wait before following the reconnect advice.
  	 </div>
  
  	@function setInterval
  	@param {fm.nullable} value
  	@return {void}
  */


  baseAdvice.prototype.setInterval = function() {
    var value;
    value = arguments[0];
    this.__interval = value;
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets how the client should attempt to re-establish a connection with the server.
  	 </div>
  
  	@function setReconnect
  	@param {fm.nullable} value
  	@return {void}
  */


  baseAdvice.prototype.setReconnect = function() {
    var value;
    value = arguments[0];
    this.__reconnect = value;
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Serializes the base advice object to JSON.
  	 </div><returns>The serialized advice object.</returns>
  
  	@function toJson
  	@return {fm.string}
  */


  baseAdvice.prototype.toJson = function() {
    return fm.websync.baseAdvice.toJson(this);
  };

  return baseAdvice;

}).call(this, fm.serializable);


/**
@class fm.websync.advice
 <div>
 Advice class used in <see cref="fm.websync.message">Messagesfm.websync.message</see>.
 </div>

@extends fm.websync.baseAdvice
*/


fm.websync.advice = (function(_super) {

  __extends(advice, _super);

  /**
  	@ignore 
  	@description
  */


  advice.prototype._callbackPolling = null;

  /**
  	@ignore 
  	@description
  */


  advice.prototype._longPolling = null;

  /**
  	@ignore 
  	@description
  */


  function advice() {
    this.toJson = __bind(this.toJson, this);

    this.setLongPolling = __bind(this.setLongPolling, this);

    this.setCallbackPolling = __bind(this.setCallbackPolling, this);

    this.getLongPolling = __bind(this.getLongPolling, this);

    this.getCallbackPolling = __bind(this.getCallbackPolling, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      advice.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    advice.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Deserializes a single advice object from JSON.
  	 </div><param name="adviceJson">The JSON advice object to deserialize.</param><returns>The deserialized advice object.</returns>
  
  	@function fromJson
  	@param {fm.string} adviceJson
  	@return {fm.websync.advice}
  */


  advice.fromJson = function() {
    var adviceJson;
    adviceJson = arguments[0];
    return fm.websync.serializer.deserializeAdvice(adviceJson);
  };

  /**
  	 <div>
  	 Serializes a single advice object to JSON.
  	 </div><param name="advice">The advice object to serialize.</param><returns>The serialized advice object.</returns>
  
  	@function toJson
  	@param {fm.websync.advice} advice
  	@return {fm.string}
  */


  advice.toJson = function() {
    var advice;
    advice = arguments[0];
    return fm.websync.serializer.serializeAdvice(advice);
  };

  /**
  	 <div>
  	 Gets advice specific to callback-polling clients.
  	 </div>
  
  	@function getCallbackPolling
  	@return {fm.websync.baseAdvice}
  */


  advice.prototype.getCallbackPolling = function() {
    return this._callbackPolling;
  };

  /**
  	 <div>
  	 Gets advice specific to long-polling clients.
  	 </div>
  
  	@function getLongPolling
  	@return {fm.websync.baseAdvice}
  */


  advice.prototype.getLongPolling = function() {
    return this._longPolling;
  };

  /**
  	 <div>
  	 Sets advice specific to callback-polling clients.
  	 </div>
  
  	@function setCallbackPolling
  	@param {fm.websync.baseAdvice} value
  	@return {void}
  */


  advice.prototype.setCallbackPolling = function() {
    var value;
    value = arguments[0];
    return this._callbackPolling = value;
  };

  /**
  	 <div>
  	 Sets advice specific to long-polling clients.
  	 </div>
  
  	@function setLongPolling
  	@param {fm.websync.baseAdvice} value
  	@return {void}
  */


  advice.prototype.setLongPolling = function() {
    var value;
    value = arguments[0];
    return this._longPolling = value;
  };

  /**
  	 <div>
  	 Serializes the advice object to JSON.
  	 </div><returns>The serialized advice object.</returns>
  
  	@function toJson
  	@return {fm.string}
  */


  advice.prototype.toJson = function() {
    return fm.websync.advice.toJson(this);
  };

  return advice;

}).call(this, fm.websync.baseAdvice);


/**
@class fm.websync.metaChannels
 <div>
 Contains the reserved Bayeux meta-channels and methods to assist in detecting them.
 </div>

@extends fm.object
*/


fm.websync.metaChannels = (function(_super) {

  __extends(metaChannels, _super);

  /**
  	@ignore 
  	@description  <div>
  	 The reserved channel for bind requests/responses.
  	 </div>
  */


  metaChannels._bind = "/meta/bind";

  /**
  	@ignore 
  	@description  <div>
  	 The reserved channel for connect requests/responses.
  	 </div>
  */


  metaChannels._connect = "/meta/connect";

  /**
  	@ignore 
  	@description  <div>
  	 The reserved channel for disconnect requests/responses.
  	 </div>
  */


  metaChannels._disconnect = "/meta/disconnect";

  /**
  	@ignore 
  	@description  <div>
  	 The reserved channel for handshake requests/responses.
  	 </div>
  */


  metaChannels._handshake = "/meta/handshake";

  /**
  	@ignore 
  	@description  <div>
  	 The reserved prefix for Bayeux meta-channels.
  	 </div>
  */


  metaChannels._metaPrefix = "/meta/";

  /**
  	@ignore 
  	@description  <div>
  	 The reserved channel for notify requests/responses.
  	 </div>
  */


  metaChannels._notify = "/meta/notify";

  /**
  	@ignore 
  	@description  <div>
  	 The reserved prefix for Bayeux service-channels.
  	 </div>
  */


  metaChannels._servicePrefix = "/service/";

  /**
  	@ignore 
  	@description  <div>
  	 The reserved channel for subscribe requests/responses.
  	 </div>
  */


  metaChannels._subscribe = "/meta/subscribe";

  /**
  	@ignore 
  	@description  <div>
  	 The reserved channel for unbind requests/responses.
  	 </div>
  */


  metaChannels._unbind = "/meta/unbind";

  /**
  	@ignore 
  	@description  <div>
  	 The reserved channel for unsubscribe requests/responses.
  	 </div>
  */


  metaChannels._unsubscribe = "/meta/unsubscribe";

  /**
  	@ignore 
  	@description
  */


  function metaChannels() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      metaChannels.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
  }

  /**
  	 <div>
  	 Converts a serviced channel into its original form.
  	 </div><param name="channel">The channel to convert.</param><returns>The channel without the service prefix.</returns>
  
  	@function convertChannelFromServiced
  	@param {fm.string} channel
  	@return {fm.string}
  */


  metaChannels.convertChannelFromServiced = function() {
    var channel;
    channel = arguments[0];
    if (!fm.websync.metaChannels.isServiceChannel(channel)) {
      return channel;
    }
    return channel.substring("/service/".length - 1);
  };

  /**
  	 <div>
  	 Converts a channel into its serviced equivalent.
  	 </div><param name="channel">The channel to convert.</param><returns>The channel with the service prefix.</returns>
  
  	@function convertChannelToServiced
  	@param {fm.string} channel
  	@return {fm.string}
  */


  metaChannels.convertChannelToServiced = function() {
    var channel, _var0;
    channel = arguments[0];
    _var0 = channel;
    if ((_var0 === null || typeof _var0 === 'undefined') || (channel.length < 1)) {
      return "/service/";
    }
    return fm.stringExtensions.concat("/service/", channel.substring(1));
  };

  /**
  	 <div>
  	 Gets the type of the message.
  	 </div><param name="bayeuxChannel">The bayeux channel.</param><returns>The type of the message.</returns>
  
  	@function getMessageType
  	@param {fm.string} bayeuxChannel
  	@return {fm.websync.messageType}
  */


  metaChannels.getMessageType = function() {
    var bayeuxChannel;
    bayeuxChannel = arguments[0];
    if (bayeuxChannel === "/meta/handshake") {
      return fm.websync.messageType.Connect;
    }
    if (bayeuxChannel === "/meta/connect") {
      return fm.websync.messageType.Stream;
    }
    if (bayeuxChannel === "/meta/disconnect") {
      return fm.websync.messageType.Disconnect;
    }
    if (bayeuxChannel === "/meta/bind") {
      return fm.websync.messageType.Bind;
    }
    if (bayeuxChannel === "/meta/unbind") {
      return fm.websync.messageType.Unbind;
    }
    if (bayeuxChannel === "/meta/subscribe") {
      return fm.websync.messageType.Subscribe;
    }
    if (bayeuxChannel === "/meta/unsubscribe") {
      return fm.websync.messageType.Unsubscribe;
    }
    if (bayeuxChannel === "/meta/notify") {
      return fm.websync.messageType.Notify;
    }
    if (fm.websync.metaChannels.isServiceChannel(bayeuxChannel)) {
      return fm.websync.messageType.Service;
    }
    if (!fm.websync.metaChannels.isMetaChannel(bayeuxChannel)) {
      return fm.websync.messageType.Publish;
    }
    return fm.websync.messageType.Unknown;
  };

  /**
  	 <div>
  	 Determines whether the specified channel name is a reserved Bayeux /meta channel.
  	 </div><param name="channel">The channel name to check.</param><returns>
  	 <c>true</c> if the specified channel name is a reserved Bayeux /meta channel; otherwise, <c>false</c>.
  	 </returns>
  
  	@function isMetaChannel
  	@param {fm.string} channel
  	@return {fm.boolean}
  */


  metaChannels.isMetaChannel = function() {
    var channel, _var0;
    channel = arguments[0];
    _var0 = channel;
    return (_var0 !== null && typeof _var0 !== 'undefined') && fm.stringExtensions.startsWith(channel, "/meta/", fm.stringComparison.Ordinal);
  };

  /**
  	 <div>
  	 Determines whether the specified channel name is a reserved Bayeux channel.
  	 </div><param name="channel">The channel name to check.</param><returns>
  	 <c>true</c> if the specified channel name is reserved; otherwise, <c>false</c>.
  	 </returns>
  
  	@function isReservedChannel
  	@param {fm.string} channel
  	@return {fm.boolean}
  */


  metaChannels.isReservedChannel = function() {
    var channel;
    channel = arguments[0];
    return fm.websync.metaChannels.isMetaChannel(channel) || fm.websync.metaChannels.isServiceChannel(channel);
  };

  /**
  	 <div>
  	 Determines whether the specified channel name is a reserved Bayeux /service channel.
  	 </div><param name="channel">The channel name to check.</param><returns>
  	 <c>true</c> if the specified channel name is a reserved Bayeux /service channel; otherwise, <c>false</c>.
  	 </returns>
  
  	@function isServiceChannel
  	@param {fm.string} channel
  	@return {fm.boolean}
  */


  metaChannels.isServiceChannel = function() {
    var channel, _var0;
    channel = arguments[0];
    _var0 = channel;
    return (_var0 !== null && typeof _var0 !== 'undefined') && fm.stringExtensions.startsWith(channel, "/service/", fm.stringComparison.Ordinal);
  };

  return metaChannels;

}).call(this, fm.object);


/**
@class fm.websync.client
 <div>
 <p>
 The WebSync client, used for subscribing to channels and receiving data, as well as
 publishing data to specific channels.
 </p>
 </div><div>
 <p>
 The WebSync client has 9 primary operations:
 </p>
 <ol>
 <li>
 Connect/Disconnect: Sets up/takes down a streaming connection to the server.
 </li>
 <li>
 Bind/Unbind: Attaches/detaches records to the client (e.g. display name, user ID).
 </li>
 <li>
 Subscribe/Unsubscribe: Opts in/out of receiving data published to a channel.
 </li>
 <li>
 Publish: Broadcasts data to any clients subscribed to the channel.
 </li>
 <li>
 Notify: Pushes data directly to a specific client (no subscription necessary).
 </li>
 <li>
 Service: Sends data to the server for traditional request/response processing.
 </li>
 </ol>
 <p>
 Each method (and the constructor) take a single "args" object. This object defines
 callback functions, configuration settings, and error handling information. It
 allows the client to default to sensible values while allowing easy overrides.
 </p>
 <p>
 The WebSync client is designed to be as robust and fault-tolerant as possible. If
 there are any failures in the streaming connection, the client will automatically
 reconnect and set up a new one.
 </p>
 <p>
 Maintaining a streaming connection lies at the heart of WebSync, and so special care
 is given to ensure that a streaming connection remains active, even in the presence
 of total network failure.
 </p>
 <p>
 Since WebSync clients often subscribe to channels to receive partial updates, it is
 highly recommended to do initial state load in the OnSuccess callback of the call
 to Subscribe. This way, (a) there are no missed
 partial updates between the state load and the subscription, and (b) in the event of
 connection failure and automatic reconnection/resubscription, the state will be
 automatically refreshed.
 </p>
 <p>
 When a connection is lost, <see cref="fm.websync.client.ConnectArgs">fm.websync.client.ConnectArgs</see>.OnStreamFailure will be called.
 This is an excellent time to update the UI to let your user know that the connection
 is temporarily offline and a new one is being established. The client will
 automatically re-attempt a connect.
 </p>
 <p>
 Shortly afterwards, either <see cref="fm.websync.client.ConnectArgs">fm.websync.client.ConnectArgs</see>.OnSuccess or
 <see cref="fm.websync.client.ConnectArgs">fm.websync.client.ConnectArgs</see>.OnFailure will be called, depending on whether or not
 the client could successfully negotiate a new connection with the server.
 If <see cref="fm.websync.client.ConnectArgs">fm.websync.client.ConnectArgs</see>.OnSuccess is called, the connection is officially
 re-established. If <see cref="fm.websync.client.ConnectArgs">fm.websync.client.ConnectArgs</see>.OnFailure is called, you should
 analyze the response, and if appropriate, set <see cref="fm.websync.baseFailureArgs.retry">fm.websync.baseFailureArgs.retry</see>
 to true or false, depending on whether you want to retry the connection. The default
 value of <see cref="fm.websync.baseFailureArgs.retry">fm.websync.baseFailureArgs.retry</see> is governed by <see cref="fm.websync.client.ConnectArgs">fm.websync.client.ConnectArgs</see>.RetryMode.
 Custom backoff algorithms can be defined using <see cref="fm.websync.client.ConnectArgs">fm.websync.client.ConnectArgs</see>.RetryBackoff.
 </p>
 <p>
 By the time <see cref="fm.websync.client.ConnectArgs">fm.websync.client.ConnectArgs</see>.OnSuccess is called, the client has a new
 client ID. Any pre-existing subscriptions or bindings performed outside the
 connect callback chain will be automatically recreated.
 </p>
 <p>
 Within a given OnSuccess or OnFailure callback, a boolean flag is always present to
 indicate whether the callback is being executed as part of an automatic reconnect.
 Refer to <see cref="fm.websync.connectSuccessArgs.isReconnect">fm.websync.connectSuccessArgs.isReconnect</see>,
 <see cref="fm.websync.connectFailureArgs.isReconnect">fm.websync.connectFailureArgs.isReconnect</see>,
 <see cref="fm.websync.subscribeSuccessArgs.isResubscribe">fm.websync.subscribeSuccessArgs.isResubscribe</see>,
 <see cref="fm.websync.subscribeFailureArgs.isResubscribe">fm.websync.subscribeFailureArgs.isResubscribe</see>,
 <see cref="fm.websync.bindSuccessArgs.isRebind">fm.websync.bindSuccessArgs.isRebind</see>, and
 <see cref="fm.websync.bindFailureArgs.isRebind">fm.websync.bindFailureArgs.isRebind</see>.
 </p>
 </div>

@extends fm.websync.baseClient
*/


fm.websync.client = (function(_super) {

  __extends(client, _super);

  /**
  	@ignore 
  	@description
  */


  client._argsKey = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._batchCounter = 0;

  /**
  	@ignore 
  	@description
  */


  client.prototype._batchCounterLock = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._boundRecords = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._boundRecordsLock = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._clientId = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._connectArgs = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._connectionType = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._counter = 0;

  /**
  	@ignore 
  	@description
  */


  client.prototype._customOnReceives = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._customOnReceivesLock = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._disableWebSockets = false;

  /**
  	@ignore 
  	@description
  */


  client.prototype._isConnected = false;

  /**
  	@ignore 
  	@description
  */


  client.prototype._isConnecting = false;

  /**
  	@ignore 
  	@description
  */


  client.prototype._isDisconnecting = false;

  /**
  	@ignore 
  	@description
  */


  client.prototype._lastBackoffIndex = 0;

  /**
  	@ignore 
  	@description
  */


  client.prototype._lastBackoffTimeout = 0;

  /**
  	@ignore 
  	@description
  */


  client.prototype._lastInterval = 0;

  /**
  	@ignore 
  	@description
  */


  client.prototype._lastReconnect = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onBindComplete = null;

  /**
  	@ignore 
  	@description
  */


  client._onBindEnd = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onBindFailure = null;

  /**
  	@ignore 
  	@description
  */


  client._onBindRequest = null;

  /**
  	@ignore 
  	@description
  */


  client._onBindResponse = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onBindSuccess = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onConnectComplete = null;

  /**
  	@ignore 
  	@description
  */


  client._onConnectEnd = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onConnectFailure = null;

  /**
  	@ignore 
  	@description
  */


  client._onConnectRequest = null;

  /**
  	@ignore 
  	@description
  */


  client._onConnectResponse = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onConnectSuccess = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onDisconnectComplete = null;

  /**
  	@ignore 
  	@description
  */


  client._onDisconnectEnd = null;

  /**
  	@ignore 
  	@description
  */


  client._onDisconnectRequest = null;

  /**
  	@ignore 
  	@description
  */


  client._onDisconnectResponse = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onNotify = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onNotifyComplete = null;

  /**
  	@ignore 
  	@description
  */


  client._onNotifyEnd = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onNotifyFailure = null;

  /**
  	@ignore 
  	@description
  */


  client._onNotifyRequest = null;

  /**
  	@ignore 
  	@description
  */


  client._onNotifyResponse = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onNotifySuccess = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onPublishComplete = null;

  /**
  	@ignore 
  	@description
  */


  client._onPublishEnd = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onPublishFailure = null;

  /**
  	@ignore 
  	@description
  */


  client._onPublishRequest = null;

  /**
  	@ignore 
  	@description
  */


  client._onPublishResponse = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onPublishSuccess = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onServerBind = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onServerSubscribe = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onServerUnbind = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onServerUnsubscribe = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onServiceComplete = null;

  /**
  	@ignore 
  	@description
  */


  client._onServiceEnd = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onServiceFailure = null;

  /**
  	@ignore 
  	@description
  */


  client._onServiceRequest = null;

  /**
  	@ignore 
  	@description
  */


  client._onServiceResponse = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onServiceSuccess = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onStreamFailure = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onSubscribeComplete = null;

  /**
  	@ignore 
  	@description
  */


  client._onSubscribeEnd = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onSubscribeFailure = null;

  /**
  	@ignore 
  	@description
  */


  client._onSubscribeRequest = null;

  /**
  	@ignore 
  	@description
  */


  client._onSubscribeResponse = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onSubscribeSuccess = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onUnbindComplete = null;

  /**
  	@ignore 
  	@description
  */


  client._onUnbindEnd = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onUnbindFailure = null;

  /**
  	@ignore 
  	@description
  */


  client._onUnbindRequest = null;

  /**
  	@ignore 
  	@description
  */


  client._onUnbindResponse = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onUnbindSuccess = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onUnsubscribeComplete = null;

  /**
  	@ignore 
  	@description
  */


  client._onUnsubscribeEnd = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onUnsubscribeFailure = null;

  /**
  	@ignore 
  	@description
  */


  client._onUnsubscribeRequest = null;

  /**
  	@ignore 
  	@description
  */


  client._onUnsubscribeResponse = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._onUnsubscribeSuccess = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._pendingReceives = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._queueActivated = false;

  /**
  	@ignore 
  	@description
  */


  client.prototype._queueLock = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._rebindCache = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._reconnectCache = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._reconnectCacheLock = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._requestQueue = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._requestTransfer = null;

  /**
  	@ignore 
  	@description
  */


  client._requestUrlCache = null;

  /**
  	@ignore 
  	@description
  */


  client._requestUrlCacheLock = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._responseArgs = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._resubscribeCache = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._serverTimeout = 0;

  /**
  	@ignore 
  	@description
  */


  client.prototype._sessionId = null;

  /**
  	@ignore 
  	@description
  */


  client._stateKey = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._stateLock = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._streamRequestTransfer = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._streamRequestUrl = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._subscribedChannels = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._subscribedChannelsLock = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._subscribedDynamicProperties = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._subscribedOnReceives = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._subscribedOnReceivesLock = null;

  /**
  	@ignore 
  	@description
  */


  client._supportedConnectionTypes = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._synchronous = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._threadCounters = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._threadCountersLock = null;

  /**
  	@ignore 
  	@description
  */


  client.prototype._token = null;

  /**
  	@ignore 
  	@description
  */


  function client() {
    this.webSocketStreamFailure = __bind(this.webSocketStreamFailure, this);

    this.webSocketOpenSuccess = __bind(this.webSocketOpenSuccess, this);

    this.webSocketOpenFailure = __bind(this.webSocketOpenFailure, this);

    this.unsubscribe = __bind(this.unsubscribe, this);

    this.unsetCustomOnReceiveWithTag = __bind(this.unsetCustomOnReceiveWithTag, this);

    this.unsetCustomOnReceive = __bind(this.unsetCustomOnReceive, this);

    this.unbind = __bind(this.unbind, this);

    this.subscribe = __bind(this.subscribe, this);

    this.streamDeferred = __bind(this.streamDeferred, this);

    this.streamCallback = __bind(this.streamCallback, this);

    this.stream = __bind(this.stream, this);

    this.startBatch = __bind(this.startBatch, this);

    this.setToken = __bind(this.setToken, this);

    this.setSynchronous = __bind(this.setSynchronous, this);

    this.setStreamRequestUrl = __bind(this.setStreamRequestUrl, this);

    this.setSessionId = __bind(this.setSessionId, this);

    this.setServerTimeout = __bind(this.setServerTimeout, this);

    this.setIsDisconnecting = __bind(this.setIsDisconnecting, this);

    this.setIsConnecting = __bind(this.setIsConnecting, this);

    this.setIsConnected = __bind(this.setIsConnected, this);

    this.setDisableWebSockets = __bind(this.setDisableWebSockets, this);

    this.setCustomOnReceiveWithTag = __bind(this.setCustomOnReceiveWithTag, this);

    this.setCustomOnReceive = __bind(this.setCustomOnReceive, this);

    this.setClientId = __bind(this.setClientId, this);

    this.service = __bind(this.service, this);

    this.sendMany = __bind(this.sendMany, this);

    this.sendCallback = __bind(this.sendCallback, this);

    this.send = __bind(this.send, this);

    this.retryConnectDeferred = __bind(this.retryConnectDeferred, this);

    this.retryConnect = __bind(this.retryConnect, this);

    this.restream = __bind(this.restream, this);

    this.removeSubscribedOnReceive = __bind(this.removeSubscribedOnReceive, this);

    this.removeSubscribedChannels = __bind(this.removeSubscribedChannels, this);

    this.removeOnUnsubscribeSuccess = __bind(this.removeOnUnsubscribeSuccess, this);

    this.removeOnUnsubscribeFailure = __bind(this.removeOnUnsubscribeFailure, this);

    this.removeOnUnsubscribeComplete = __bind(this.removeOnUnsubscribeComplete, this);

    this.removeOnUnbindSuccess = __bind(this.removeOnUnbindSuccess, this);

    this.removeOnUnbindFailure = __bind(this.removeOnUnbindFailure, this);

    this.removeOnUnbindComplete = __bind(this.removeOnUnbindComplete, this);

    this.removeOnSubscribeSuccess = __bind(this.removeOnSubscribeSuccess, this);

    this.removeOnSubscribeFailure = __bind(this.removeOnSubscribeFailure, this);

    this.removeOnSubscribeComplete = __bind(this.removeOnSubscribeComplete, this);

    this.removeOnStreamFailure = __bind(this.removeOnStreamFailure, this);

    this.removeOnServiceSuccess = __bind(this.removeOnServiceSuccess, this);

    this.removeOnServiceFailure = __bind(this.removeOnServiceFailure, this);

    this.removeOnServiceComplete = __bind(this.removeOnServiceComplete, this);

    this.removeOnServerUnsubscribe = __bind(this.removeOnServerUnsubscribe, this);

    this.removeOnServerUnbind = __bind(this.removeOnServerUnbind, this);

    this.removeOnServerSubscribe = __bind(this.removeOnServerSubscribe, this);

    this.removeOnServerBind = __bind(this.removeOnServerBind, this);

    this.removeOnPublishSuccess = __bind(this.removeOnPublishSuccess, this);

    this.removeOnPublishFailure = __bind(this.removeOnPublishFailure, this);

    this.removeOnPublishComplete = __bind(this.removeOnPublishComplete, this);

    this.removeOnNotifySuccess = __bind(this.removeOnNotifySuccess, this);

    this.removeOnNotifyFailure = __bind(this.removeOnNotifyFailure, this);

    this.removeOnNotifyComplete = __bind(this.removeOnNotifyComplete, this);

    this.removeOnNotify = __bind(this.removeOnNotify, this);

    this.removeOnDisconnectComplete = __bind(this.removeOnDisconnectComplete, this);

    this.removeOnConnectSuccess = __bind(this.removeOnConnectSuccess, this);

    this.removeOnConnectFailure = __bind(this.removeOnConnectFailure, this);

    this.removeOnConnectComplete = __bind(this.removeOnConnectComplete, this);

    this.removeOnBindSuccess = __bind(this.removeOnBindSuccess, this);

    this.removeOnBindFailure = __bind(this.removeOnBindFailure, this);

    this.removeOnBindComplete = __bind(this.removeOnBindComplete, this);

    this.removeBoundRecords = __bind(this.removeBoundRecords, this);

    this.reconnect = __bind(this.reconnect, this);

    this.receiveMessage = __bind(this.receiveMessage, this);

    this.raiseUnsubscribeSuccess = __bind(this.raiseUnsubscribeSuccess, this);

    this.raiseUnsubscribeFailure = __bind(this.raiseUnsubscribeFailure, this);

    this.raiseUnsubscribeComplete = __bind(this.raiseUnsubscribeComplete, this);

    this.raiseUnbindSuccess = __bind(this.raiseUnbindSuccess, this);

    this.raiseUnbindFailure = __bind(this.raiseUnbindFailure, this);

    this.raiseUnbindComplete = __bind(this.raiseUnbindComplete, this);

    this.raiseSubscribeSuccess = __bind(this.raiseSubscribeSuccess, this);

    this.raiseSubscribeFailure = __bind(this.raiseSubscribeFailure, this);

    this.raiseSubscribeDelivery = __bind(this.raiseSubscribeDelivery, this);

    this.raiseSubscribeComplete = __bind(this.raiseSubscribeComplete, this);

    this.raiseStreamFailure = __bind(this.raiseStreamFailure, this);

    this.raiseServiceSuccess = __bind(this.raiseServiceSuccess, this);

    this.raiseServiceFailure = __bind(this.raiseServiceFailure, this);

    this.raiseServiceComplete = __bind(this.raiseServiceComplete, this);

    this.raiseServerUnsubscribe = __bind(this.raiseServerUnsubscribe, this);

    this.raiseServerUnbind = __bind(this.raiseServerUnbind, this);

    this.raiseServerSubscribe = __bind(this.raiseServerSubscribe, this);

    this.raiseServerBind = __bind(this.raiseServerBind, this);

    this.raiseSendException = __bind(this.raiseSendException, this);

    this.raiseRetriable = __bind(this.raiseRetriable, this);

    this.raiseResponseEvent = __bind(this.raiseResponseEvent, this);

    this.raiseRequestEvent = __bind(this.raiseRequestEvent, this);

    this.raisePublishSuccess = __bind(this.raisePublishSuccess, this);

    this.raisePublishFailure = __bind(this.raisePublishFailure, this);

    this.raisePublishComplete = __bind(this.raisePublishComplete, this);

    this.raiseNotifySuccess = __bind(this.raiseNotifySuccess, this);

    this.raiseNotifyFailure = __bind(this.raiseNotifyFailure, this);

    this.raiseNotifyDelivery = __bind(this.raiseNotifyDelivery, this);

    this.raiseNotifyComplete = __bind(this.raiseNotifyComplete, this);

    this.raiseFunctionManual = __bind(this.raiseFunctionManual, this);

    this.raiseFunction = __bind(this.raiseFunction, this);

    this.raiseEvent = __bind(this.raiseEvent, this);

    this.raiseDisconnectComplete = __bind(this.raiseDisconnectComplete, this);

    this.raiseConnectSuccess = __bind(this.raiseConnectSuccess, this);

    this.raiseConnectFailure = __bind(this.raiseConnectFailure, this);

    this.raiseConnectComplete = __bind(this.raiseConnectComplete, this);

    this.raiseCompleteEvent = __bind(this.raiseCompleteEvent, this);

    this.raiseBindSuccess = __bind(this.raiseBindSuccess, this);

    this.raiseBindFailure = __bind(this.raiseBindFailure, this);

    this.raiseBindComplete = __bind(this.raiseBindComplete, this);

    this.raiseActionManual = __bind(this.raiseActionManual, this);

    this.raiseAction = __bind(this.raiseAction, this);

    this.publish = __bind(this.publish, this);

    this.processServerAction = __bind(this.processServerAction, this);

    this.processRequestUrl = __bind(this.processRequestUrl, this);

    this.processQueue = __bind(this.processQueue, this);

    this.processPendingReceives = __bind(this.processPendingReceives, this);

    this.processAdvice = __bind(this.processAdvice, this);

    this.preRaise = __bind(this.preRaise, this);

    this.postRaise = __bind(this.postRaise, this);

    this.performUnsubscribeCallback = __bind(this.performUnsubscribeCallback, this);

    this.performUnsubscribe = __bind(this.performUnsubscribe, this);

    this.performUnbindCallback = __bind(this.performUnbindCallback, this);

    this.performUnbind = __bind(this.performUnbind, this);

    this.performSubscribeCallback = __bind(this.performSubscribeCallback, this);

    this.performSubscribe = __bind(this.performSubscribe, this);

    this.performServiceCallback = __bind(this.performServiceCallback, this);

    this.performService = __bind(this.performService, this);

    this.performPublishCallback = __bind(this.performPublishCallback, this);

    this.performPublish = __bind(this.performPublish, this);

    this.performNotifyCallback = __bind(this.performNotifyCallback, this);

    this.performNotify = __bind(this.performNotify, this);

    this.performDisconnectCallback = __bind(this.performDisconnectCallback, this);

    this.performDisconnect = __bind(this.performDisconnect, this);

    this.performConnectCallback = __bind(this.performConnectCallback, this);

    this.performConnect = __bind(this.performConnect, this);

    this.performBindCallback = __bind(this.performBindCallback, this);

    this.performBind = __bind(this.performBind, this);

    this.notify = __bind(this.notify, this);

    this.inCallback = __bind(this.inCallback, this);

    this.inBatch = __bind(this.inBatch, this);

    this.getToken = __bind(this.getToken, this);

    this.getThreadId = __bind(this.getThreadId, this);

    this.getSynchronous = __bind(this.getSynchronous, this);

    this.getSubscribedChannels = __bind(this.getSubscribedChannels, this);

    this.getStreamRequestUrl = __bind(this.getStreamRequestUrl, this);

    this.getStreamRequestTimeout = __bind(this.getStreamRequestTimeout, this);

    this.getSessionId = __bind(this.getSessionId, this);

    this.getServerTimeout = __bind(this.getServerTimeout, this);

    this.getIsDisconnecting = __bind(this.getIsDisconnecting, this);

    this.getIsConnecting = __bind(this.getIsConnecting, this);

    this.getIsConnected = __bind(this.getIsConnected, this);

    this.getDisableWebSockets = __bind(this.getDisableWebSockets, this);

    this.getCustomOnReceiveWithTag = __bind(this.getCustomOnReceiveWithTag, this);

    this.getCustomOnReceive = __bind(this.getCustomOnReceive, this);

    this.getClientId = __bind(this.getClientId, this);

    this.getBoundRecords = __bind(this.getBoundRecords, this);

    this.endBatch = __bind(this.endBatch, this);

    this.disconnect = __bind(this.disconnect, this);

    this.connect = __bind(this.connect, this);

    this.clearSubscribedChannels = __bind(this.clearSubscribedChannels, this);

    this.clearBoundRecords = __bind(this.clearBoundRecords, this);

    this.checkSynchronous = __bind(this.checkSynchronous, this);

    this.bind = __bind(this.bind, this);

    this.addToQueue = __bind(this.addToQueue, this);

    this.addSubscribedOnReceive = __bind(this.addSubscribedOnReceive, this);

    this.addSubscribedChannels = __bind(this.addSubscribedChannels, this);

    this.addOnUnsubscribeSuccess = __bind(this.addOnUnsubscribeSuccess, this);

    this.addOnUnsubscribeFailure = __bind(this.addOnUnsubscribeFailure, this);

    this.addOnUnsubscribeComplete = __bind(this.addOnUnsubscribeComplete, this);

    this.addOnUnbindSuccess = __bind(this.addOnUnbindSuccess, this);

    this.addOnUnbindFailure = __bind(this.addOnUnbindFailure, this);

    this.addOnUnbindComplete = __bind(this.addOnUnbindComplete, this);

    this.addOnSubscribeSuccess = __bind(this.addOnSubscribeSuccess, this);

    this.addOnSubscribeFailure = __bind(this.addOnSubscribeFailure, this);

    this.addOnSubscribeComplete = __bind(this.addOnSubscribeComplete, this);

    this.addOnStreamFailure = __bind(this.addOnStreamFailure, this);

    this.addOnServiceSuccess = __bind(this.addOnServiceSuccess, this);

    this.addOnServiceFailure = __bind(this.addOnServiceFailure, this);

    this.addOnServiceComplete = __bind(this.addOnServiceComplete, this);

    this.addOnServerUnsubscribe = __bind(this.addOnServerUnsubscribe, this);

    this.addOnServerUnbind = __bind(this.addOnServerUnbind, this);

    this.addOnServerSubscribe = __bind(this.addOnServerSubscribe, this);

    this.addOnServerBind = __bind(this.addOnServerBind, this);

    this.addOnPublishSuccess = __bind(this.addOnPublishSuccess, this);

    this.addOnPublishFailure = __bind(this.addOnPublishFailure, this);

    this.addOnPublishComplete = __bind(this.addOnPublishComplete, this);

    this.addOnNotifySuccess = __bind(this.addOnNotifySuccess, this);

    this.addOnNotifyFailure = __bind(this.addOnNotifyFailure, this);

    this.addOnNotifyComplete = __bind(this.addOnNotifyComplete, this);

    this.addOnNotify = __bind(this.addOnNotify, this);

    this.addOnDisconnectComplete = __bind(this.addOnDisconnectComplete, this);

    this.addOnConnectSuccess = __bind(this.addOnConnectSuccess, this);

    this.addOnConnectFailure = __bind(this.addOnConnectFailure, this);

    this.addOnConnectComplete = __bind(this.addOnConnectComplete, this);

    this.addOnBindSuccess = __bind(this.addOnBindSuccess, this);

    this.addOnBindFailure = __bind(this.addOnBindFailure, this);

    this.addOnBindComplete = __bind(this.addOnBindComplete, this);

    this.addBoundRecords = __bind(this.addBoundRecords, this);

    this.activateStream = __bind(this.activateStream, this);

    var requestUrl, streamRequestUrl, _var0;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      client.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    if (arguments.length === 1) {
      requestUrl = arguments[0];
      client.call(this, requestUrl, requestUrl);
      return;
    }
    if (arguments.length === 2) {
      requestUrl = arguments[0];
      streamRequestUrl = arguments[1];
      client.__super__.constructor.call(this, requestUrl);
      this._counter = 0;
      this._lastBackoffTimeout = 0;
      this._lastBackoffIndex = -1;
      this._threadCounters = {};
      this._threadCountersLock = new fm.object();
      this._lastInterval = 0;
      this._lastReconnect = null;
      this._connectArgs = null;
      this._responseArgs = null;
      this._reconnectCacheLock = new fm.object();
      this._reconnectCache = [];
      this._rebindCache = {};
      this._resubscribeCache = {};
      this._boundRecordsLock = new fm.object();
      this._boundRecords = {};
      this._subscribedChannelsLock = new fm.object();
      this._subscribedChannels = {};
      this._subscribedOnReceivesLock = new fm.object();
      this._subscribedOnReceives = {};
      this._subscribedDynamicProperties = {};
      this._pendingReceives = {};
      this._customOnReceivesLock = new fm.object();
      this._customOnReceives = {};
      this._stateLock = new fm.object();
      this._queueLock = new fm.object();
      this._queueActivated = false;
      this._requestQueue = {};
      this._connectionType = fm.websync.connectionType.LongPolling;
      this._batchCounter = 0;
      this._batchCounterLock = new fm.object();
      _var0 = streamRequestUrl;
      if (_var0 === null || typeof _var0 === 'undefined') {
        throw new Error("streamRequestUrl");
      }
      this.setStreamRequestUrl(streamRequestUrl);
      this.setSynchronous(false);
      this.setToken(fm.websync.client.generateToken());
      this._requestTransfer = fm.websync.messageTransferFactory.getHttpMessageTransfer();
      return;
    }
  }

  /**
  
  	@function addOnBindEnd
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.addOnBindEnd = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onBindEnd = fm.delegate.combine(fm.websync.client._onBindEnd, value);
  };

  /**
  
  	@function addOnBindRequest
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.addOnBindRequest = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onBindRequest = fm.delegate.combine(fm.websync.client._onBindRequest, value);
  };

  /**
  
  	@function addOnBindResponse
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.addOnBindResponse = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onBindResponse = fm.delegate.combine(fm.websync.client._onBindResponse, value);
  };

  /**
  
  	@function addOnConnectEnd
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.addOnConnectEnd = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onConnectEnd = fm.delegate.combine(fm.websync.client._onConnectEnd, value);
  };

  /**
  
  	@function addOnConnectRequest
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.addOnConnectRequest = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onConnectRequest = fm.delegate.combine(fm.websync.client._onConnectRequest, value);
  };

  /**
  
  	@function addOnConnectResponse
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.addOnConnectResponse = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onConnectResponse = fm.delegate.combine(fm.websync.client._onConnectResponse, value);
  };

  /**
  
  	@function addOnDisconnectEnd
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.addOnDisconnectEnd = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onDisconnectEnd = fm.delegate.combine(fm.websync.client._onDisconnectEnd, value);
  };

  /**
  
  	@function addOnDisconnectRequest
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.addOnDisconnectRequest = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onDisconnectRequest = fm.delegate.combine(fm.websync.client._onDisconnectRequest, value);
  };

  /**
  
  	@function addOnDisconnectResponse
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.addOnDisconnectResponse = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onDisconnectResponse = fm.delegate.combine(fm.websync.client._onDisconnectResponse, value);
  };

  /**
  
  	@function addOnNotifyEnd
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.addOnNotifyEnd = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onNotifyEnd = fm.delegate.combine(fm.websync.client._onNotifyEnd, value);
  };

  /**
  
  	@function addOnNotifyRequest
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.addOnNotifyRequest = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onNotifyRequest = fm.delegate.combine(fm.websync.client._onNotifyRequest, value);
  };

  /**
  
  	@function addOnNotifyResponse
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.addOnNotifyResponse = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onNotifyResponse = fm.delegate.combine(fm.websync.client._onNotifyResponse, value);
  };

  /**
  
  	@function addOnPublishEnd
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.addOnPublishEnd = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onPublishEnd = fm.delegate.combine(fm.websync.client._onPublishEnd, value);
  };

  /**
  
  	@function addOnPublishRequest
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.addOnPublishRequest = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onPublishRequest = fm.delegate.combine(fm.websync.client._onPublishRequest, value);
  };

  /**
  
  	@function addOnPublishResponse
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.addOnPublishResponse = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onPublishResponse = fm.delegate.combine(fm.websync.client._onPublishResponse, value);
  };

  /**
  
  	@function addOnServiceEnd
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.addOnServiceEnd = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onServiceEnd = fm.delegate.combine(fm.websync.client._onServiceEnd, value);
  };

  /**
  
  	@function addOnServiceRequest
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.addOnServiceRequest = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onServiceRequest = fm.delegate.combine(fm.websync.client._onServiceRequest, value);
  };

  /**
  
  	@function addOnServiceResponse
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.addOnServiceResponse = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onServiceResponse = fm.delegate.combine(fm.websync.client._onServiceResponse, value);
  };

  /**
  
  	@function addOnSubscribeEnd
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.addOnSubscribeEnd = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onSubscribeEnd = fm.delegate.combine(fm.websync.client._onSubscribeEnd, value);
  };

  /**
  
  	@function addOnSubscribeRequest
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.addOnSubscribeRequest = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onSubscribeRequest = fm.delegate.combine(fm.websync.client._onSubscribeRequest, value);
  };

  /**
  
  	@function addOnSubscribeResponse
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.addOnSubscribeResponse = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onSubscribeResponse = fm.delegate.combine(fm.websync.client._onSubscribeResponse, value);
  };

  /**
  
  	@function addOnUnbindEnd
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.addOnUnbindEnd = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onUnbindEnd = fm.delegate.combine(fm.websync.client._onUnbindEnd, value);
  };

  /**
  
  	@function addOnUnbindRequest
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.addOnUnbindRequest = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onUnbindRequest = fm.delegate.combine(fm.websync.client._onUnbindRequest, value);
  };

  /**
  
  	@function addOnUnbindResponse
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.addOnUnbindResponse = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onUnbindResponse = fm.delegate.combine(fm.websync.client._onUnbindResponse, value);
  };

  /**
  
  	@function addOnUnsubscribeEnd
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.addOnUnsubscribeEnd = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onUnsubscribeEnd = fm.delegate.combine(fm.websync.client._onUnsubscribeEnd, value);
  };

  /**
  
  	@function addOnUnsubscribeRequest
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.addOnUnsubscribeRequest = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onUnsubscribeRequest = fm.delegate.combine(fm.websync.client._onUnsubscribeRequest, value);
  };

  /**
  
  	@function addOnUnsubscribeResponse
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.addOnUnsubscribeResponse = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onUnsubscribeResponse = fm.delegate.combine(fm.websync.client._onUnsubscribeResponse, value);
  };

  /**
  	 <div>
  	 Generates a new token based on the current date/time.
  	 </div><returns>The generated token.</returns>
  
  	@function generateToken
  	@return {fm.string}
  */


  client.generateToken = function() {
    var str;
    str = fm.intExtensions.toString(fm.dateTime.getUtcNow().getTicks());
    return fm.stringExtensions.substring(str, str.length - 12, 8);
  };

  /**
  
  	@function getChannelForPublish
  	@param {fm.websync.message} response
  	@param {fm.websync.publishArgs} publishArgs
  	@return {fm.string}
  */


  client.getChannelForPublish = function() {
    var publishArgs, response, _var0, _var1;
    response = arguments[0];
    publishArgs = arguments[1];
    _var0 = response;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return publishArgs.getChannel();
    }
    _var1 = response.getChannel();
    if (_var1 === null || typeof _var1 === 'undefined') {
      return publishArgs.getChannel();
    }
    return response.getChannel();
  };

  /**
  
  	@function getChannelForService
  	@param {fm.websync.message} response
  	@param {fm.websync.serviceArgs} serviceArgs
  	@return {fm.string}
  */


  client.getChannelForService = function() {
    var response, serviceArgs, _var0, _var1;
    response = arguments[0];
    serviceArgs = arguments[1];
    _var0 = response;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return serviceArgs.getChannel();
    }
    _var1 = response.getChannel();
    if (_var1 === null || typeof _var1 === 'undefined') {
      return serviceArgs.getChannel();
    }
    return response.getChannel();
  };

  /**
  
  	@function getChannelsForSubscribe
  	@param {fm.websync.message} response
  	@param {fm.websync.subscribeArgs} subscribeArgs
  	@return {fm.array}
  */


  client.getChannelsForSubscribe = function() {
    var response, subscribeArgs, _var0, _var1;
    response = arguments[0];
    subscribeArgs = arguments[1];
    _var0 = response;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return subscribeArgs.getChannels();
    }
    _var1 = response.getChannels();
    if (_var1 === null || typeof _var1 === 'undefined') {
      return subscribeArgs.getChannels();
    }
    return response.getChannels();
  };

  /**
  
  	@function getChannelsForUnsubscribe
  	@param {fm.websync.message} response
  	@param {fm.websync.unsubscribeArgs} unsubscribeArgs
  	@return {fm.array}
  */


  client.getChannelsForUnsubscribe = function() {
    var response, unsubscribeArgs, _var0, _var1;
    response = arguments[0];
    unsubscribeArgs = arguments[1];
    _var0 = response;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return unsubscribeArgs.getChannels();
    }
    _var1 = response.getChannels();
    if (_var1 === null || typeof _var1 === 'undefined') {
      return unsubscribeArgs.getChannels();
    }
    return response.getChannels();
  };

  /**
  
  	@function getDataJsonForNotify
  	@param {fm.websync.message} response
  	@param {fm.websync.notifyArgs} notifyArgs
  	@return {fm.string}
  */


  client.getDataJsonForNotify = function() {
    var notifyArgs, response, _var0, _var1;
    response = arguments[0];
    notifyArgs = arguments[1];
    _var0 = response;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return notifyArgs.getDataJson();
    }
    _var1 = response.getDataJson();
    if (_var1 === null || typeof _var1 === 'undefined') {
      return notifyArgs.getDataJson();
    }
    return response.getDataJson();
  };

  /**
  
  	@function getDataJsonForPublish
  	@param {fm.websync.message} response
  	@param {fm.websync.publishArgs} publishArgs
  	@return {fm.string}
  */


  client.getDataJsonForPublish = function() {
    var publishArgs, response, _var0, _var1;
    response = arguments[0];
    publishArgs = arguments[1];
    _var0 = response;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return publishArgs.getDataJson();
    }
    _var1 = response.getDataJson();
    if (_var1 === null || typeof _var1 === 'undefined') {
      return publishArgs.getDataJson();
    }
    return response.getDataJson();
  };

  /**
  
  	@function getDataJsonForService
  	@param {fm.websync.message} response
  	@param {fm.websync.serviceArgs} serviceArgs
  	@return {fm.string}
  */


  client.getDataJsonForService = function() {
    var response, serviceArgs, _var0, _var1;
    response = arguments[0];
    serviceArgs = arguments[1];
    _var0 = response;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return serviceArgs.getDataJson();
    }
    _var1 = response.getDataJson();
    if (_var1 === null || typeof _var1 === 'undefined') {
      return serviceArgs.getDataJson();
    }
    return response.getDataJson();
  };

  /**
  
  	@function getExtensions
  	@param {fm.websync.message} response
  	@param {fm.websync.extensible} methodArgs
  	@return {fm.websync.extensions}
  */


  client.getExtensions = function() {
    var methodArgs, response, _var0;
    response = arguments[0];
    methodArgs = arguments[1];
    _var0 = response;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      return response.getExtensions();
    }
    return methodArgs.getExtensions();
  };

  /**
  
  	@function getRecordsForBind
  	@param {fm.websync.message} response
  	@param {fm.websync.bindArgs} bindArgs
  	@return {fm.array}
  */


  client.getRecordsForBind = function() {
    var bindArgs, response, _var0, _var1;
    response = arguments[0];
    bindArgs = arguments[1];
    _var0 = response;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return bindArgs.getRecords();
    }
    _var1 = response.getRecords();
    if (_var1 === null || typeof _var1 === 'undefined') {
      return bindArgs.getRecords();
    }
    return response.getRecords();
  };

  /**
  
  	@function getRecordsForUnbind
  	@param {fm.websync.message} response
  	@param {fm.websync.unbindArgs} unbindArgs
  	@return {fm.array}
  */


  client.getRecordsForUnbind = function() {
    var response, unbindArgs, _var0, _var1;
    response = arguments[0];
    unbindArgs = arguments[1];
    _var0 = response;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return unbindArgs.getRecords();
    }
    _var1 = response.getRecords();
    if (_var1 === null || typeof _var1 === 'undefined') {
      return unbindArgs.getRecords();
    }
    return response.getRecords();
  };

  /**
  
  	@function getSubscribeKey
  	@param {fm.string} channel
  	@param {fm.string} tag
  	@return {fm.string}
  */


  client.getSubscribeKey = function() {
    var channel, tag, _var0;
    channel = arguments[0];
    tag = arguments[1];
    _var0 = tag;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return fm.stringExtensions.format("-1|{0}", channel);
    }
    return fm.stringExtensions.format("{0}|{1}{2}", fm.intExtensions.toString(tag.length), tag, channel);
  };

  /**
  
  	@function getTimestamp
  	@param {fm.websync.message} response
  	@return {fm.nullable}
  */


  client.getTimestamp = function() {
    var response, _var0;
    response = arguments[0];
    _var0 = response;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      return response.getTimestamp();
    }
    return null;
  };

  /**
  
  	@function removeOnBindEnd
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.removeOnBindEnd = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onBindEnd = fm.delegate.remove(fm.websync.client._onBindEnd, value);
  };

  /**
  
  	@function removeOnBindRequest
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.removeOnBindRequest = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onBindRequest = fm.delegate.remove(fm.websync.client._onBindRequest, value);
  };

  /**
  
  	@function removeOnBindResponse
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.removeOnBindResponse = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onBindResponse = fm.delegate.remove(fm.websync.client._onBindResponse, value);
  };

  /**
  
  	@function removeOnConnectEnd
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.removeOnConnectEnd = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onConnectEnd = fm.delegate.remove(fm.websync.client._onConnectEnd, value);
  };

  /**
  
  	@function removeOnConnectRequest
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.removeOnConnectRequest = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onConnectRequest = fm.delegate.remove(fm.websync.client._onConnectRequest, value);
  };

  /**
  
  	@function removeOnConnectResponse
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.removeOnConnectResponse = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onConnectResponse = fm.delegate.remove(fm.websync.client._onConnectResponse, value);
  };

  /**
  
  	@function removeOnDisconnectEnd
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.removeOnDisconnectEnd = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onDisconnectEnd = fm.delegate.remove(fm.websync.client._onDisconnectEnd, value);
  };

  /**
  
  	@function removeOnDisconnectRequest
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.removeOnDisconnectRequest = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onDisconnectRequest = fm.delegate.remove(fm.websync.client._onDisconnectRequest, value);
  };

  /**
  
  	@function removeOnDisconnectResponse
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.removeOnDisconnectResponse = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onDisconnectResponse = fm.delegate.remove(fm.websync.client._onDisconnectResponse, value);
  };

  /**
  
  	@function removeOnNotifyEnd
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.removeOnNotifyEnd = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onNotifyEnd = fm.delegate.remove(fm.websync.client._onNotifyEnd, value);
  };

  /**
  
  	@function removeOnNotifyRequest
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.removeOnNotifyRequest = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onNotifyRequest = fm.delegate.remove(fm.websync.client._onNotifyRequest, value);
  };

  /**
  
  	@function removeOnNotifyResponse
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.removeOnNotifyResponse = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onNotifyResponse = fm.delegate.remove(fm.websync.client._onNotifyResponse, value);
  };

  /**
  
  	@function removeOnPublishEnd
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.removeOnPublishEnd = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onPublishEnd = fm.delegate.remove(fm.websync.client._onPublishEnd, value);
  };

  /**
  
  	@function removeOnPublishRequest
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.removeOnPublishRequest = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onPublishRequest = fm.delegate.remove(fm.websync.client._onPublishRequest, value);
  };

  /**
  
  	@function removeOnPublishResponse
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.removeOnPublishResponse = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onPublishResponse = fm.delegate.remove(fm.websync.client._onPublishResponse, value);
  };

  /**
  
  	@function removeOnServiceEnd
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.removeOnServiceEnd = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onServiceEnd = fm.delegate.remove(fm.websync.client._onServiceEnd, value);
  };

  /**
  
  	@function removeOnServiceRequest
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.removeOnServiceRequest = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onServiceRequest = fm.delegate.remove(fm.websync.client._onServiceRequest, value);
  };

  /**
  
  	@function removeOnServiceResponse
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.removeOnServiceResponse = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onServiceResponse = fm.delegate.remove(fm.websync.client._onServiceResponse, value);
  };

  /**
  
  	@function removeOnSubscribeEnd
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.removeOnSubscribeEnd = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onSubscribeEnd = fm.delegate.remove(fm.websync.client._onSubscribeEnd, value);
  };

  /**
  
  	@function removeOnSubscribeRequest
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.removeOnSubscribeRequest = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onSubscribeRequest = fm.delegate.remove(fm.websync.client._onSubscribeRequest, value);
  };

  /**
  
  	@function removeOnSubscribeResponse
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.removeOnSubscribeResponse = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onSubscribeResponse = fm.delegate.remove(fm.websync.client._onSubscribeResponse, value);
  };

  /**
  
  	@function removeOnUnbindEnd
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.removeOnUnbindEnd = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onUnbindEnd = fm.delegate.remove(fm.websync.client._onUnbindEnd, value);
  };

  /**
  
  	@function removeOnUnbindRequest
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.removeOnUnbindRequest = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onUnbindRequest = fm.delegate.remove(fm.websync.client._onUnbindRequest, value);
  };

  /**
  
  	@function removeOnUnbindResponse
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.removeOnUnbindResponse = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onUnbindResponse = fm.delegate.remove(fm.websync.client._onUnbindResponse, value);
  };

  /**
  
  	@function removeOnUnsubscribeEnd
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.removeOnUnsubscribeEnd = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onUnsubscribeEnd = fm.delegate.remove(fm.websync.client._onUnsubscribeEnd, value);
  };

  /**
  
  	@function removeOnUnsubscribeRequest
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.removeOnUnsubscribeRequest = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onUnsubscribeRequest = fm.delegate.remove(fm.websync.client._onUnsubscribeRequest, value);
  };

  /**
  
  	@function removeOnUnsubscribeResponse
  	@param {fm.doubleAction} value
  	@return {void}
  */


  client.removeOnUnsubscribeResponse = function() {
    var value;
    value = arguments[0];
    return fm.websync.client._onUnsubscribeResponse = fm.delegate.remove(fm.websync.client._onUnsubscribeResponse, value);
  };

  /**
  
  	@function activateStream
  	@param {fm.websync.connectArgs} connectArgs
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.activateStream = function() {
    var args, connectArgs, responseArgs;
    connectArgs = arguments[0];
    responseArgs = arguments[1];
    this.raiseConnectSuccess(this._connectArgs, this._responseArgs);
    this.raiseConnectComplete(this._connectArgs, this._responseArgs);
    args = new fm.websync.clientConnectEndArgs();
    args.setMethodArgs(connectArgs);
    this.raiseCompleteEvent(fm.websync.client._onConnectEnd, args, responseArgs);
    this.processQueue(true);
    return this.stream(this._connectArgs, false);
  };

  /**
  
  	@function addBoundRecords
  	@param {fm.array} records
  	@return {void}
  */


  client.prototype.addBoundRecords = function() {
    var record, records, _i, _len, _results, _var0;
    records = arguments[0];
    _var0 = records;
    _results = [];
    for (_i = 0, _len = _var0.length; _i < _len; _i++) {
      record = _var0[_i];
      _results.push(this._boundRecords[record.getKey()] = record);
    }
    return _results;
  };

  /**
  
  	@function addOnBindComplete
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnBindComplete = function() {
    var value;
    value = arguments[0];
    return this._onBindComplete = fm.delegate.combine(this._onBindComplete, value);
  };

  /**
  
  	@function addOnBindFailure
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnBindFailure = function() {
    var value;
    value = arguments[0];
    return this._onBindFailure = fm.delegate.combine(this._onBindFailure, value);
  };

  /**
  
  	@function addOnBindSuccess
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnBindSuccess = function() {
    var value;
    value = arguments[0];
    return this._onBindSuccess = fm.delegate.combine(this._onBindSuccess, value);
  };

  /**
  
  	@function addOnConnectComplete
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnConnectComplete = function() {
    var value;
    value = arguments[0];
    return this._onConnectComplete = fm.delegate.combine(this._onConnectComplete, value);
  };

  /**
  
  	@function addOnConnectFailure
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnConnectFailure = function() {
    var value;
    value = arguments[0];
    return this._onConnectFailure = fm.delegate.combine(this._onConnectFailure, value);
  };

  /**
  
  	@function addOnConnectSuccess
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnConnectSuccess = function() {
    var value;
    value = arguments[0];
    return this._onConnectSuccess = fm.delegate.combine(this._onConnectSuccess, value);
  };

  /**
  
  	@function addOnDisconnectComplete
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnDisconnectComplete = function() {
    var value;
    value = arguments[0];
    return this._onDisconnectComplete = fm.delegate.combine(this._onDisconnectComplete, value);
  };

  /**
  
  	@function addOnNotify
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnNotify = function() {
    var value;
    value = arguments[0];
    return this._onNotify = fm.delegate.combine(this._onNotify, value);
  };

  /**
  
  	@function addOnNotifyComplete
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnNotifyComplete = function() {
    var value;
    value = arguments[0];
    return this._onNotifyComplete = fm.delegate.combine(this._onNotifyComplete, value);
  };

  /**
  
  	@function addOnNotifyFailure
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnNotifyFailure = function() {
    var value;
    value = arguments[0];
    return this._onNotifyFailure = fm.delegate.combine(this._onNotifyFailure, value);
  };

  /**
  
  	@function addOnNotifySuccess
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnNotifySuccess = function() {
    var value;
    value = arguments[0];
    return this._onNotifySuccess = fm.delegate.combine(this._onNotifySuccess, value);
  };

  /**
  
  	@function addOnPublishComplete
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnPublishComplete = function() {
    var value;
    value = arguments[0];
    return this._onPublishComplete = fm.delegate.combine(this._onPublishComplete, value);
  };

  /**
  
  	@function addOnPublishFailure
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnPublishFailure = function() {
    var value;
    value = arguments[0];
    return this._onPublishFailure = fm.delegate.combine(this._onPublishFailure, value);
  };

  /**
  
  	@function addOnPublishSuccess
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnPublishSuccess = function() {
    var value;
    value = arguments[0];
    return this._onPublishSuccess = fm.delegate.combine(this._onPublishSuccess, value);
  };

  /**
  
  	@function addOnServerBind
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnServerBind = function() {
    var value;
    value = arguments[0];
    return this._onServerBind = fm.delegate.combine(this._onServerBind, value);
  };

  /**
  
  	@function addOnServerSubscribe
  	@param {fm.singleFunction} value
  	@return {void}
  */


  client.prototype.addOnServerSubscribe = function() {
    var value;
    value = arguments[0];
    return this._onServerSubscribe = fm.delegate.combine(this._onServerSubscribe, value);
  };

  /**
  
  	@function addOnServerUnbind
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnServerUnbind = function() {
    var value;
    value = arguments[0];
    return this._onServerUnbind = fm.delegate.combine(this._onServerUnbind, value);
  };

  /**
  
  	@function addOnServerUnsubscribe
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnServerUnsubscribe = function() {
    var value;
    value = arguments[0];
    return this._onServerUnsubscribe = fm.delegate.combine(this._onServerUnsubscribe, value);
  };

  /**
  
  	@function addOnServiceComplete
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnServiceComplete = function() {
    var value;
    value = arguments[0];
    return this._onServiceComplete = fm.delegate.combine(this._onServiceComplete, value);
  };

  /**
  
  	@function addOnServiceFailure
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnServiceFailure = function() {
    var value;
    value = arguments[0];
    return this._onServiceFailure = fm.delegate.combine(this._onServiceFailure, value);
  };

  /**
  
  	@function addOnServiceSuccess
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnServiceSuccess = function() {
    var value;
    value = arguments[0];
    return this._onServiceSuccess = fm.delegate.combine(this._onServiceSuccess, value);
  };

  /**
  
  	@function addOnStreamFailure
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnStreamFailure = function() {
    var value;
    value = arguments[0];
    return this._onStreamFailure = fm.delegate.combine(this._onStreamFailure, value);
  };

  /**
  
  	@function addOnSubscribeComplete
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnSubscribeComplete = function() {
    var value;
    value = arguments[0];
    return this._onSubscribeComplete = fm.delegate.combine(this._onSubscribeComplete, value);
  };

  /**
  
  	@function addOnSubscribeFailure
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnSubscribeFailure = function() {
    var value;
    value = arguments[0];
    return this._onSubscribeFailure = fm.delegate.combine(this._onSubscribeFailure, value);
  };

  /**
  
  	@function addOnSubscribeSuccess
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnSubscribeSuccess = function() {
    var value;
    value = arguments[0];
    return this._onSubscribeSuccess = fm.delegate.combine(this._onSubscribeSuccess, value);
  };

  /**
  
  	@function addOnUnbindComplete
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnUnbindComplete = function() {
    var value;
    value = arguments[0];
    return this._onUnbindComplete = fm.delegate.combine(this._onUnbindComplete, value);
  };

  /**
  
  	@function addOnUnbindFailure
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnUnbindFailure = function() {
    var value;
    value = arguments[0];
    return this._onUnbindFailure = fm.delegate.combine(this._onUnbindFailure, value);
  };

  /**
  
  	@function addOnUnbindSuccess
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnUnbindSuccess = function() {
    var value;
    value = arguments[0];
    return this._onUnbindSuccess = fm.delegate.combine(this._onUnbindSuccess, value);
  };

  /**
  
  	@function addOnUnsubscribeComplete
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnUnsubscribeComplete = function() {
    var value;
    value = arguments[0];
    return this._onUnsubscribeComplete = fm.delegate.combine(this._onUnsubscribeComplete, value);
  };

  /**
  
  	@function addOnUnsubscribeFailure
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnUnsubscribeFailure = function() {
    var value;
    value = arguments[0];
    return this._onUnsubscribeFailure = fm.delegate.combine(this._onUnsubscribeFailure, value);
  };

  /**
  
  	@function addOnUnsubscribeSuccess
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.addOnUnsubscribeSuccess = function() {
    var value;
    value = arguments[0];
    return this._onUnsubscribeSuccess = fm.delegate.combine(this._onUnsubscribeSuccess, value);
  };

  /**
  
  	@function addSubscribedChannels
  	@param {fm.string} tag
  	@param {fm.array} channels
  	@return {void}
  */


  client.prototype.addSubscribedChannels = function() {
    var channels, list, str, tag, _i, _len, _results, _var0, _var1, _var2;
    tag = arguments[0];
    channels = arguments[1];
    list = null;
    _var0 = new fm.holder(list);
    _var1 = fm.hashExtensions.tryGetValue(this._subscribedChannels, tag, _var0);
    list = _var0.getValue();
    if (!_var1) {
      list = [];
      this._subscribedChannels[tag] = list;
    }
    _var2 = channels;
    _results = [];
    for (_i = 0, _len = _var2.length; _i < _len; _i++) {
      str = _var2[_i];
      _results.push(fm.arrayExtensions.add(list, str));
    }
    return _results;
  };

  /**
  
  	@function addSubscribedOnReceive
  	@param {fm.string} tag
  	@param {fm.array} channels
  	@param {fm.singleAction} onReceive
  	@param {fm.hash} dynamicProperties
  	@return {void}
  */


  client.prototype.addSubscribedOnReceive = function() {
    var channels, dictionary, dynamicProperties, onReceive, str, tag, _i, _len, _var0, _var1, _var2;
    tag = arguments[0];
    channels = arguments[1];
    onReceive = arguments[2];
    dynamicProperties = arguments[3];
    dictionary = null;
    _var0 = new fm.holder(dictionary);
    _var1 = fm.hashExtensions.tryGetValue(this._subscribedOnReceives, tag, _var0);
    dictionary = _var0.getValue();
    if (!_var1) {
      dictionary = {};
      this._subscribedOnReceives[tag] = dictionary;
    }
    _var2 = channels;
    for (_i = 0, _len = _var2.length; _i < _len; _i++) {
      str = _var2[_i];
      dictionary[str] = onReceive;
      this._subscribedDynamicProperties[fm.websync.client.getSubscribeKey(str, tag)] = dynamicProperties;
    }
    return this.processPendingReceives(channels);
  };

  /**
  
  	@function addToQueue
  	@param {fm.websync.clientRequest} request
  	@param {fm.string} url
  	@param {fm.boolean} synchronous
  	@return {void}
  */


  client.prototype.addToQueue = function() {
    var key, request, synchronous, url;
    request = arguments[0];
    url = arguments[1];
    synchronous = arguments[2];
    url = url != null ? url : this.getRequestUrl();
    key = fm.stringExtensions.format("{0}{1}", (synchronous ? "1" : "0"), url);
    if (!fm.hashExtensions.containsKey(this._requestQueue, key)) {
      this._requestQueue[key] = [];
    }
    return fm.arrayExtensions.add(this._requestQueue[key], request);
  };

  /**
  	 <div>
  	 Binds the client to a public or private data record so it is visible to other
  	 clients or just to the server.
  	 </div><div>
  	 <p>
  	 When the bind completes successfully, the OnSuccess callback
  	 will be invoked, passing in the bound record(s),
  	 <b>including any modifications made on the server</b>.
  	 </p>
  	 </div><param name="bindArgs">The bind arguments.
  	 See <see cref="fm.websync.bindArgs">fm.websync.bindArgs</see> for details.</param><returns>The client.</returns>
  
  	@function bind
  	@param {fm.websync.bindArgs} bindArgs
  	@return {fm.websync.client}
  */


  client.prototype.bind = function() {
    var bindArgs, record, _i, _len, _var0, _var1, _var2, _var3;
    bindArgs = arguments[0];
    _var0 = bindArgs.getRecords();
    if ((_var0 === null || typeof _var0 === 'undefined') || (bindArgs.getRecords().length === 0)) {
      throw new Error("Please specify the record(s) to bind.");
    }
    _var1 = bindArgs.getRecords();
    for (_i = 0, _len = _var1.length; _i < _len; _i++) {
      record = _var1[_i];
      _var2 = record.getKey();
      if (_var2 === null || typeof _var2 === 'undefined') {
        throw new Error("Each record must specify a key.");
      }
      _var3 = record.getValueJson();
      if (_var3 === null || typeof _var3 === 'undefined') {
        throw new Error("Each record must specify a value in JSON format.");
      }
    }
    this.performBind(bindArgs);
    return this;
  };

  /**
  
  	@function checkSynchronous
  	@param {fm.nullable} synchronous
  	@return {fm.boolean}
  */


  client.prototype.checkSynchronous = function() {
    var synchronous;
    synchronous = arguments[0];
    if (synchronous !== null) {
      return synchronous;
    }
    if (this.getSynchronous() !== null) {
      return this.getSynchronous();
    }
    return false;
  };

  /**
  
  	@function clearBoundRecords
  	@return {void}
  */


  client.prototype.clearBoundRecords = function() {
    return fm.hashExtensions.clear(this._boundRecords);
  };

  /**
  
  	@function clearSubscribedChannels
  	@return {void}
  */


  client.prototype.clearSubscribedChannels = function() {
    return fm.hashExtensions.clear(this._subscribedChannels);
  };

  /**
  	 <div>
  	 Sets up and maintains a streaming connection to the server.
  	 </div><div>
  	 <p>
  	 While this method will typically run asychronously, the WebSync client
  	 is designed to be used without (much) consideration for its asynchronous nature.
  	 To that end, any calls to methods that require an active connection, like
  	 bind, subscribe, and publish, will be
  	 queued automatically and executed once this method has completed successfully.
  	 </p>
  	 </div><param name="connectArgs">The connect arguments.
  	 See <see cref="fm.websync.client.ConnectArgs">fm.websync.client.ConnectArgs</see> for details.</param><returns>The client.</returns>
  
  	@function connect
  	@param {fm.websync.connectArgs} connectArgs
  	@return {fm.websync.client}
  */


  client.prototype.connect = function() {
    var connectArgs;
    if (arguments.length === 0) {
      return this.connect(new fm.websync.connectArgs());
      return;
    }
    if (arguments.length === 1) {
      connectArgs = arguments[0];
      this.performConnect(connectArgs);
      return this;
    }
  };

  /**
  	 <div>
  	 Takes down a streaming connection to the server and unsubscribes/unbinds the client.
  	 </div><div>
  	 <p>
  	 After the disconnect completes successfully,
  	 any further calls to methods that require an active connection, like
  	 bind, subscribe, and publish, will be
  	 queued automatically and executed only if/when the client reconnects.
  	 </p>
  	 </div><param name="disconnectArgs">The disconnect arguments.
  	 See <see cref="fm.websync.disconnectArgs">fm.websync.disconnectArgs</see> for details.</param><returns>The client.</returns>
  
  	@function disconnect
  	@param {fm.websync.disconnectArgs} disconnectArgs
  	@return {fm.websync.client}
  */


  client.prototype.disconnect = function() {
    var disconnectArgs;
    if (arguments.length === 0) {
      return this.disconnect(new fm.websync.disconnectArgs());
      return;
    }
    if (arguments.length === 1) {
      disconnectArgs = arguments[0];
      this.performDisconnect(disconnectArgs);
      return this;
    }
  };

  /**
  	 <div>
  	 Flags the end of a batch of requests and starts sending them to the server.
  	 </div><div>
  	 This is used in conjunction with <see cref="fm.websync.client.startBatch">fm.websync.client.startBatch</see>, which must
  	 be called first to flag the start of a batch of requests to be sent together
  	 to the server. Batching is used to optimize round-trips to the server by
  	 reducing the overhead associated with creating multiple HTTP requests.
  	 </div><returns>The client.</returns>
  
  	@function endBatch
  	@return {fm.websync.client}
  */


  client.prototype.endBatch = function() {
    var flag;
    flag = false;
    this._batchCounter--;
    if (this._batchCounter <= 0) {
      this._batchCounter = 0;
      flag = true;
    }
    if (flag) {
      this.processQueue(false);
    }
    return this;
  };

  /**
  	 <div>
  	 Gets a collection of all the records to which the client is currently bound.
  	 </div><returns>A collection of all the records to which the client is currently bound</returns>
  
  	@function getBoundRecords
  	@return {fm.hash}
  */


  client.prototype.getBoundRecords = function() {
    var dictionary, str, _i, _len, _var0;
    dictionary = {};
    _var0 = fm.hashExtensions.getKeys(this._boundRecords);
    for (_i = 0, _len = _var0.length; _i < _len; _i++) {
      str = _var0[_i];
      dictionary[str] = this._boundRecords[str].duplicate();
    }
    return dictionary;
  };

  /**
  	 <div>
  	 Gets the server-generated WebSync client ID. This value is only set if the client is
  	 connected, so reference it only after successfully connecting the client.
  	 </div>
  
  	@function getClientId
  	@return {fm.guid}
  */


  client.prototype.getClientId = function() {
    return this._clientId;
  };

  /**
  	 <div>
  	 Gets the callback invoked whenever messages are received on the specified
  	 channel.
  	 </div><param name="channel">The channel over which the messages are being received.</param><returns>The callback invoked when a message is received, if a callback
  	 is set; otherwise <c>null</c>.</returns>
  
  	@function getCustomOnReceive
  	@param {fm.string} channel
  	@return {fm.singleAction}
  */


  client.prototype.getCustomOnReceive = function() {
    var channel;
    channel = arguments[0];
    return this.getCustomOnReceiveWithTag(channel, fm.stringExtensions.empty);
  };

  /**
  	 <div>
  	 Gets the callback invoked whenever messages are received on the specified
  	 channel.  The tag denotes a specific callback.
  	 </div><param name="channel">The channel over which the messages are being received.</param><param name="tag">The identifier for the callback.</param><returns>The callback invoked when a message is received, if a callback
  	 is set; otherwise <c>null</c>.</returns>
  
  	@function getCustomOnReceiveWithTag
  	@param {fm.string} channel
  	@param {fm.string} tag
  	@return {fm.singleAction}
  */


  client.prototype.getCustomOnReceiveWithTag = function() {
    var action, channel, dictionary, tag, _var0, _var1, _var2, _var3, _var4, _var5;
    channel = arguments[0];
    tag = arguments[1];
    _var0 = channel;
    if (_var0 === null || typeof _var0 === 'undefined') {
      throw new Error("channel");
    }
    _var1 = tag;
    if (_var1 === null || typeof _var1 === 'undefined') {
      tag = fm.stringExtensions.empty;
    }
    action = null;
    dictionary = null;
    _var2 = new fm.holder(dictionary);
    _var3 = fm.hashExtensions.tryGetValue(this._customOnReceives, tag, _var2);
    dictionary = _var2.getValue();
    if (_var3) {
      _var4 = new fm.holder(action);
      _var5 = fm.hashExtensions.tryGetValue(dictionary, channel, _var4);
      action = _var4.getValue();
      _var5;

    }
    return action;
  };

  /**
  	 <div>
  	 Gets whether to disable WebSocket protocol support and use long-polling,
  	 even if the server is capable of accepting WebSocket requests.
  	 </div>
  
  	@function getDisableWebSockets
  	@return {fm.boolean}
  */


  client.prototype.getDisableWebSockets = function() {
    return this._disableWebSockets;
  };

  /**
  	 <div>
  	 Gets whether the client is currently connected.
  	 </div>
  
  	@function getIsConnected
  	@return {fm.boolean}
  */


  client.prototype.getIsConnected = function() {
    return this._isConnected;
  };

  /**
  	 <div>
  	 Gets whether the client is currently connecting.
  	 </div>
  
  	@function getIsConnecting
  	@return {fm.boolean}
  */


  client.prototype.getIsConnecting = function() {
    return this._isConnecting;
  };

  /**
  	 <div>
  	 Gets whether the client is currently disconnecting.
  	 </div>
  
  	@function getIsDisconnecting
  	@return {fm.boolean}
  */


  client.prototype.getIsDisconnecting = function() {
    return this._isDisconnecting;
  };

  /**
  	 <div>
  	 Gets the number of milliseconds before the server takes action to discover
  	 if this client is idling or still active.
  	 </div>
  
  	@function getServerTimeout
  	@return {fm.int}
  */


  client.prototype.getServerTimeout = function() {
    return this._serverTimeout;
  };

  /**
  	 <div>
  	 Gets the server-generated WebSync session ID. This value is only set if the client is
  	 connected.
  	 </div>
  
  	@function getSessionId
  	@return {fm.guid}
  */


  client.prototype.getSessionId = function() {
    return this._sessionId;
  };

  /**
  	 <div>
  	 Gets the number of milliseconds to wait for a stream request to
  	 return a response before it is aborted and another stream request is attempted.
  	 </div>
  
  	@function getStreamRequestTimeout
  	@return {fm.int}
  */


  client.prototype.getStreamRequestTimeout = function() {
    return this.getRequestTimeout() + this.getServerTimeout();
  };

  /**
  	 <div>
  	 Gets the absolute URL of the WebSync request handler for streaming connections, typically
  	 ending with websync.ashx.
  	 </div>
  
  	@function getStreamRequestUrl
  	@return {fm.string}
  */


  client.prototype.getStreamRequestUrl = function() {
    return this._streamRequestUrl;
  };

  /**
  	 <div>
  	 Gets a list of all the channels to which the client is currently subscribed.
  	 </div><param name="tag">The subscription tag identifier.</param><returns>
  	 A list of all the channels to which the client is currently subscribed
  	 </returns>
  
  	@function getSubscribedChannels
  	@param {fm.string} tag
  	@return {fm.array}
  */


  client.prototype.getSubscribedChannels = function() {
    var list, str, tag, _i, _len, _var0, _var1, _var2;
    if (arguments.length === 1) {
      tag = arguments[0];
      list = null;
      _var0 = new fm.holder(list);
      _var1 = fm.hashExtensions.tryGetValue(this._subscribedChannels, tag, _var0);
      list = _var0.getValue();
      _var1;

      _var2 = list;
      if (_var2 === null || typeof _var2 === 'undefined') {
        list = [];
      }
      return fm.arrayExtensions.toArray(list);
      return;
    }
    if (arguments.length === 0) {
      list = [];
      _var0 = fm.hashExtensions.getKeys(this._subscribedChannels);
      for (_i = 0, _len = _var0.length; _i < _len; _i++) {
        str = _var0[_i];
        fm.arrayExtensions.addRange(list, this._subscribedChannels[str]);
      }
      return fm.arrayExtensions.toArray(list);
    }
  };

  /**
  	 <div>
  	 Gets whether or not to execute client methods synchronously. This approach is not
  	 recommended for UI threads, as it will block until the request completes.
  	 Defaults to <c>false</c>.
  	 </div>
  
  	@function getSynchronous
  	@return {fm.nullable}
  */


  client.prototype.getSynchronous = function() {
    return this._synchronous;
  };

  /**
  
  	@function getThreadId
  	@return {fm.string}
  */


  client.prototype.getThreadId = function() {
    return fm.intExtensions.toString(fm.thread.getCurrentThread().getManagedThreadId());
  };

  /**
  	 <div>
  	 Gets the token sent with each request for load balancing purposes.
  	 </div>
  
  	@function getToken
  	@return {fm.string}
  */


  client.prototype.getToken = function() {
    return this._token;
  };

  /**
  	 <div>
  	 Gets whether or not requests are currently being batched.
  	 </div><returns>
  	 <c>true</c> if requests are being batched; otherwise <c>false</c>.</returns>
  
  	@function inBatch
  	@return {fm.boolean}
  */


  client.prototype.inBatch = function() {
    return this._batchCounter > 0;
  };

  /**
  
  	@function inCallback
  	@return {fm.boolean}
  */


  client.prototype.inCallback = function() {
    var threadId;
    threadId = this.getThreadId();
    return fm.hashExtensions.containsKey(this._threadCounters, threadId) && (this._threadCounters[threadId] > 0);
  };

  /**
  	 <div>
  	 Sends data to a specified client ID.
  	 </div><div>
  	 When the notify completes successfully, the OnSuccess callback
  	 will be invoked, passing in the
  	 channel and published data, <b>including any modifications made on the server</b>.
  	 </div><param name="notifyArgs">The notify arguments.
  	 See <see cref="fm.websync.notifyArgs">fm.websync.notifyArgs</see> for more details.</param><returns>The client.</returns>
  
  	@function notify
  	@param {fm.websync.notifyArgs} notifyArgs
  	@return {fm.websync.client}
  */


  client.prototype.notify = function() {
    var notifyArgs;
    notifyArgs = arguments[0];
    if (fm.stringExtensions.isNullOrEmpty(notifyArgs.getDataJson())) {
      throw new Error("Please specify the data to send.");
    }
    this.performNotify(notifyArgs);
    return this;
  };

  /**
  
  	@function performBind
  	@param {fm.websync.bindArgs} bindArgs
  	@return {void}
  */


  client.prototype.performBind = function() {
    var args, bindArgs, message, request, request2, synchronous;
    bindArgs = arguments[0];
    if (!(bindArgs.getAutoRebind() !== null)) {
      bindArgs.setAutoRebind(!this.inCallback());
    }
    args = new fm.websync.clientBindRequestArgs();
    args.setMethodArgs(bindArgs);
    if (this.raiseRequestEvent(fm.websync.client._onBindRequest, args)) {
      synchronous = this.checkSynchronous(bindArgs.getSynchronous());
      request2 = new fm.websync.clientRequest();
      message = new fm.websync.message("/meta/bind");
      message.setValidate(false);
      message.setRecords(bindArgs.getRecords());
      message.setExtensions(bindArgs.getExtensions());
      request2.setMessage(message);
      request2.setCallback(this.performBindCallback);
      request = request2;
      request.setDynamicValue(fm.websync.client._argsKey, bindArgs);
      this.addToQueue(request, bindArgs.getRequestUrl(), synchronous);
      return this.processQueue(false);
    }
  };

  /**
  
  	@function performBindCallback
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.performBindCallback = function() {
    var args, args2, args3, dynamicValue, flag, record, responseArgs, _i, _len, _var0, _var1;
    responseArgs = arguments[0];
    dynamicValue = responseArgs.getDynamicValue(fm.websync.client._argsKey);
    args = new fm.websync.clientBindResponseArgs();
    args.setMethodArgs(dynamicValue);
    this.raiseResponseEvent(fm.websync.client._onBindResponse, args, responseArgs);
    _var0 = responseArgs.getException();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      flag = this.raiseBindFailure(dynamicValue, responseArgs, false);
      this.raiseBindComplete(dynamicValue, responseArgs);
      args2 = new fm.websync.clientBindEndArgs();
      args2.setMethodArgs(dynamicValue);
      this.raiseCompleteEvent(fm.websync.client._onBindEnd, args2, responseArgs);
      if (flag) {
        dynamicValue.setIsRetry(true);
        return this.bind(dynamicValue);
      }
    } else {
      if (dynamicValue.getAutoRebind() === true) {
        fm.arrayExtensions.add(this._reconnectCache, dynamicValue);
        _var1 = responseArgs.getResponse().getRecords();
        for (_i = 0, _len = _var1.length; _i < _len; _i++) {
          record = _var1[_i];
          this._rebindCache[record.getKey()] = dynamicValue;
        }
      }
      this.addBoundRecords(responseArgs.getResponse().getRecords());
      this.raiseBindSuccess(dynamicValue, responseArgs);
      this.raiseBindComplete(dynamicValue, responseArgs);
      args3 = new fm.websync.clientBindEndArgs();
      args3.setMethodArgs(dynamicValue);
      return this.raiseCompleteEvent(fm.websync.client._onBindEnd, args3, responseArgs);
    }
  };

  /**
  
  	@function performConnect
  	@param {fm.websync.connectArgs} connectArgs
  	@return {void}
  */


  client.prototype.performConnect = function() {
    var args, args2, args4, args5, connectArgs, message, message2, request, request2, responseArgs, str, synchronous;
    connectArgs = arguments[0];
    args5 = new fm.websync.clientConnectRequestArgs();
    args5.setMethodArgs(connectArgs);
    if (this.raiseRequestEvent(fm.websync.client._onConnectRequest, args5)) {
      if (this.getIsConnecting() || this.getIsConnected()) {
        str = (this.getIsConnecting() ? "Already connecting." : "Already connected.");
        args2 = new fm.websync.clientResponseArgs(connectArgs.getDynamicProperties());
        message = new fm.websync.message("/meta/handshake");
        message.setExtensions(connectArgs.getExtensions());
        message.setTimestamp(fm.dateTime.getUtcNow());
        message.setSuccessful(false);
        message.setError(str);
        args2.setResponse(message);
        args2.setException(new Error(str));
        responseArgs = args2;
        args = new fm.websync.clientConnectResponseArgs();
        args.setMethodArgs(connectArgs);
        this.raiseResponseEvent(fm.websync.client._onConnectResponse, args, responseArgs);
        this.raiseConnectFailure(connectArgs, responseArgs, false);
        this.raiseConnectComplete(connectArgs, responseArgs);
        args4 = new fm.websync.clientConnectEndArgs();
        args4.setMethodArgs(connectArgs);
        this.raiseCompleteEvent(fm.websync.client._onConnectEnd, args4, responseArgs);
        return;
      }
      this.setIsConnecting(true);
      this._connectArgs = connectArgs;
      synchronous = this.checkSynchronous(connectArgs.getSynchronous());
      request2 = new fm.websync.clientRequest();
      message2 = new fm.websync.message("/meta/handshake");
      message2.setVersion("1.0");
      message2.setMinimumVersion("1.0");
      message2.setSupportedConnectionTypes(fm.websync.client._supportedConnectionTypes);
      message2.setExtensions(connectArgs.getExtensions());
      request2.setMessage(message2);
      request2.setCallback(this.performConnectCallback);
      request = request2;
      if ((connectArgs.getLastClientId() !== null) && (connectArgs.getLastSessionId() !== null)) {
        request.getMessage().setLastClientId(connectArgs.getLastClientId());
        request.getMessage().setLastSessionId(connectArgs.getLastSessionId());
      }
      request.setDynamicValue(fm.websync.client._argsKey, connectArgs);
      return this.send(request, connectArgs.getRequestUrl(), synchronous);
    }
  };

  /**
  
  	@function performConnectCallback
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.performConnectCallback = function() {
    var args, args3, bindArgs, dynamicValue, extensible, headers, i, index, list, p, responseArgs, retry, serverTimeout, sessionId, state, subscribeArgs, timeout, type, webSocketMessageTransfer, _i, _j, _len, _len1, _var0, _var1, _var2, _var3, _var4, _var5, _var6;
    responseArgs = arguments[0];
    dynamicValue = responseArgs.getDynamicValue(fm.websync.client._argsKey);
    args = new fm.websync.clientConnectResponseArgs();
    args.setMethodArgs(dynamicValue);
    this.raiseResponseEvent(fm.websync.client._onConnectResponse, args, responseArgs);
    _var0 = responseArgs.getException();
    if (_var0 === null || typeof _var0 === 'undefined') {
      this.setClientId(responseArgs.getResponse().getClientId());
      sessionId = responseArgs.getResponse().getSessionId();
      if (sessionId !== null) {
        this.setSessionId(sessionId);
      }
      serverTimeout = responseArgs.getResponse().getServerTimeout();
      if (serverTimeout !== null) {
        this.setServerTimeout(serverTimeout);
      } else {
        this.setServerTimeout(25000);
      }
      index = 2147483647;
      _var1 = responseArgs.getResponse().getSupportedConnectionTypes();
      for (_i = 0, _len = _var1.length; _i < _len; _i++) {
        type = _var1[_i];
        i = 0;
        while (i < fm.websync.client._supportedConnectionTypes.length) {
          try {
            if (fm.websync.client._supportedConnectionTypes[i] === type) {
              if (i < index) {
                index = i;
              }
              break;
            }
          } finally {
            i++;
          }
        }
      }
      if ((index < 0) || (index > fm.websync.client._supportedConnectionTypes.length)) {
        responseArgs.setException(new Error("Could not negotiate a connection type with the server."));
      } else {
        this._connectionType = fm.websync.client._supportedConnectionTypes[index];
      }
    }
    _var2 = responseArgs.getException();
    if (_var2 === null || typeof _var2 === 'undefined') {
      this._lastBackoffIndex = -1;
      this._lastBackoffTimeout = 0;
      list = [];
      fm.arrayExtensions.addRange(list, this._reconnectCache);
      fm.arrayExtensions.clear(this._reconnectCache);
      fm.hashExtensions.clear(this._rebindCache);
      fm.hashExtensions.clear(this._resubscribeCache);
      _var3 = list;
      for (_j = 0, _len1 = _var3.length; _j < _len1; _j++) {
        extensible = _var3[_j];
        bindArgs = fm.global.tryCast(extensible, fm.websync.bindArgs);
        _var4 = bindArgs;
        if (_var4 !== null && typeof _var4 !== 'undefined') {
          bindArgs.setIsRetry(false);
          bindArgs.setIsRebind(true);
          this.bind(bindArgs);
        } else {
          subscribeArgs = fm.global.tryCast(extensible, fm.websync.subscribeArgs);
          _var5 = subscribeArgs;
          if (_var5 !== null && typeof _var5 !== 'undefined') {
            subscribeArgs.setIsRetry(false);
            subscribeArgs.setIsResubscribe(true);
            this.subscribe(subscribeArgs);
            continue;
          }
        }
      }
      this.setIsConnecting(false);
      this.setIsConnected(true);
      this._responseArgs = responseArgs;
      if ((this._connectionType === fm.websync.connectionType.LongPolling) || this.getDisableWebSockets()) {
        this._connectionType = fm.websync.connectionType.LongPolling;
        this._streamRequestTransfer = fm.websync.messageTransferFactory.getHttpMessageTransfer();
        return this.activateStream(dynamicValue, responseArgs);
      } else {
        try {
          webSocketMessageTransfer = fm.websync.messageTransferFactory.getWebSocketMessageTransfer(this.processRequestUrl(this.getStreamRequestUrl()));
          webSocketMessageTransfer.setHandshakeTimeout(this.getRequestTimeout());
          webSocketMessageTransfer.setStreamTimeout(this.getStreamRequestTimeout());
          webSocketMessageTransfer.setOnRequestCreated(this.internalOnHttpRequestCreated);
          webSocketMessageTransfer.setOnResponseReceived(this.internalOnHttpResponseReceived);
          webSocketMessageTransfer.setOnOpenSuccess(this.webSocketOpenSuccess);
          webSocketMessageTransfer.setOnOpenFailure(this.webSocketOpenFailure);
          webSocketMessageTransfer.setOnStreamFailure(this.webSocketStreamFailure);
          webSocketMessageTransfer.setSender(this);
          headers = this.createHeaders();
          this._streamRequestTransfer = webSocketMessageTransfer;
          return webSocketMessageTransfer.open(headers);
        } catch (exception1) {
          this._connectionType = fm.websync.connectionType.LongPolling;
          this._streamRequestTransfer = fm.websync.messageTransferFactory.getHttpMessageTransfer();
          return this.activateStream(dynamicValue, responseArgs);
        } finally {

        }
      }
    } else {
      this.setIsConnecting(false);
      retry = false;
      switch (dynamicValue.getRetryMode()) {
        case fm.websync.connectRetryMode.Aggressive:
          retry = true;
          break;
        case fm.websync.connectRetryMode.Intelligent:
          retry = (responseArgs.getErrorCode() < 800) || (responseArgs.getErrorCode() > 899);
          break;
      }
      retry = this.raiseConnectFailure(dynamicValue, responseArgs, retry);
      this.raiseConnectComplete(dynamicValue, responseArgs);
      args3 = new fm.websync.clientConnectEndArgs();
      args3.setMethodArgs(dynamicValue);
      this.raiseCompleteEvent(fm.websync.client._onConnectEnd, args3, responseArgs);
      if (retry) {
        timeout = 0;
        _var6 = dynamicValue.getRetryBackoff();
        if (_var6 !== null && typeof _var6 !== 'undefined') {
          p = new fm.websync.backoffArgs();
          p.setIndex(this._lastBackoffIndex + 1);
          p.setLastTimeout(this._lastBackoffTimeout);
          timeout = dynamicValue.getRetryBackoff()(p);
        }
        if (timeout > 0) {
          state = new fm.websync.deferredRetryConnectState();
          state.setConnectArgs(dynamicValue);
          state.setBackoffTimeout(timeout);
          return fm.deferrer.defer(this.retryConnectDeferred, timeout, state);
        } else {
          return this.retryConnect(dynamicValue, timeout);
        }
      }
    }
  };

  /**
  
  	@function performDisconnect
  	@param {fm.websync.disconnectArgs} disconnectArgs
  	@return {void}
  */


  client.prototype.performDisconnect = function() {
    var args, disconnectArgs, message, request, request2, synchronous;
    disconnectArgs = arguments[0];
    args = new fm.websync.clientDisconnectRequestArgs();
    args.setMethodArgs(disconnectArgs);
    if (this.raiseRequestEvent(fm.websync.client._onDisconnectRequest, args)) {
      this.setIsDisconnecting(true);
      synchronous = this.checkSynchronous(disconnectArgs.getSynchronous());
      request2 = new fm.websync.clientRequest();
      message = new fm.websync.message("/meta/disconnect");
      message.setExtensions(disconnectArgs.getExtensions());
      request2.setMessage(message);
      request2.setCallback(this.performDisconnectCallback);
      request = request2;
      request.setDynamicValue(fm.websync.client._argsKey, disconnectArgs);
      this.addToQueue(request, disconnectArgs.getRequestUrl(), synchronous);
      return this.processQueue(false);
    }
  };

  /**
  
  	@function performDisconnectCallback
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.performDisconnectCallback = function() {
    var args, args3, dynamicValue, responseArgs, _var0, _var1;
    responseArgs = arguments[0];
    dynamicValue = responseArgs.getDynamicValue(fm.websync.client._argsKey);
    args = new fm.websync.clientDisconnectResponseArgs();
    args.setMethodArgs(dynamicValue);
    this.raiseResponseEvent(fm.websync.client._onDisconnectResponse, args, responseArgs);
    this.clearBoundRecords();
    this.clearSubscribedChannels();
    this.setIsDisconnecting(false);
    this.setIsConnected(false);
    try {
      _var0 = this._requestTransfer;
      if (_var0 !== null && typeof _var0 !== 'undefined') {
        this._requestTransfer.shutdown();
      }
      _var1 = this._streamRequestTransfer;
      if (_var1 !== null && typeof _var1 !== 'undefined') {
        this._streamRequestTransfer.shutdown();
      }
    } catch (exception1) {

    } finally {

    }
    this.raiseDisconnectComplete(dynamicValue, responseArgs);
    this._queueActivated = false;
    args3 = new fm.websync.clientDisconnectEndArgs();
    args3.setMethodArgs(dynamicValue);
    return this.raiseCompleteEvent(fm.websync.client._onDisconnectEnd, args3, responseArgs);
  };

  /**
  
  	@function performNotify
  	@param {fm.websync.notifyArgs} notifyArgs
  	@return {void}
  */


  client.prototype.performNotify = function() {
    var args, message, notifyArgs, request, request2, synchronous;
    notifyArgs = arguments[0];
    args = new fm.websync.clientNotifyRequestArgs();
    args.setMethodArgs(notifyArgs);
    if (this.raiseRequestEvent(fm.websync.client._onNotifyRequest, args)) {
      synchronous = this.checkSynchronous(notifyArgs.getSynchronous());
      request2 = new fm.websync.clientRequest();
      message = new fm.websync.message("/meta/notify");
      message.setValidate(false);
      message.setDataJson(notifyArgs.getDataJson());
      message.setExtensions(notifyArgs.getExtensions());
      request2.setMessage(message);
      request2.setCallback(this.performNotifyCallback);
      request = request2;
      request.setDynamicValue(fm.websync.client._argsKey, notifyArgs);
      this.addToQueue(request, notifyArgs.getRequestUrl(), synchronous);
      return this.processQueue(false);
    }
  };

  /**
  
  	@function performNotifyCallback
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.performNotifyCallback = function() {
    var args, args2, args3, dynamicValue, flag, responseArgs, _var0;
    responseArgs = arguments[0];
    dynamicValue = responseArgs.getDynamicValue(fm.websync.client._argsKey);
    args = new fm.websync.clientNotifyResponseArgs();
    args.setMethodArgs(dynamicValue);
    this.raiseResponseEvent(fm.websync.client._onNotifyResponse, args, responseArgs);
    _var0 = responseArgs.getException();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      flag = this.raiseNotifyFailure(dynamicValue, responseArgs, false);
      this.raiseNotifyComplete(dynamicValue, responseArgs);
      args2 = new fm.websync.clientNotifyEndArgs();
      args2.setMethodArgs(dynamicValue);
      this.raiseCompleteEvent(fm.websync.client._onNotifyEnd, args2, responseArgs);
      if (flag) {
        dynamicValue.setIsRetry(true);
        return this.notify(dynamicValue);
      }
    } else {
      this.raiseNotifySuccess(dynamicValue, responseArgs);
      this.raiseNotifyComplete(dynamicValue, responseArgs);
      args3 = new fm.websync.clientNotifyEndArgs();
      args3.setMethodArgs(dynamicValue);
      return this.raiseCompleteEvent(fm.websync.client._onNotifyEnd, args3, responseArgs);
    }
  };

  /**
  
  	@function performPublish
  	@param {fm.websync.publishArgs} publishArgs
  	@return {void}
  */


  client.prototype.performPublish = function() {
    var args, message, publishArgs, request, request2, synchronous;
    publishArgs = arguments[0];
    args = new fm.websync.clientPublishRequestArgs();
    args.setMethodArgs(publishArgs);
    if (this.raiseRequestEvent(fm.websync.client._onPublishRequest, args)) {
      synchronous = this.checkSynchronous(publishArgs.getSynchronous());
      request2 = new fm.websync.clientRequest();
      message = new fm.websync.message(publishArgs.getChannel());
      message.setValidate(false);
      message.setDataJson(publishArgs.getDataJson());
      message.setExtensions(publishArgs.getExtensions());
      request2.setMessage(message);
      request2.setCallback(this.performPublishCallback);
      request = request2;
      request.setDynamicValue(fm.websync.client._argsKey, publishArgs);
      this.addToQueue(request, publishArgs.getRequestUrl(), synchronous);
      return this.processQueue(false);
    }
  };

  /**
  
  	@function performPublishCallback
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.performPublishCallback = function() {
    var args, args2, args3, dynamicValue, flag, responseArgs, _var0;
    responseArgs = arguments[0];
    dynamicValue = responseArgs.getDynamicValue(fm.websync.client._argsKey);
    args = new fm.websync.clientPublishResponseArgs();
    args.setMethodArgs(dynamicValue);
    this.raiseResponseEvent(fm.websync.client._onPublishResponse, args, responseArgs);
    _var0 = responseArgs.getException();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      flag = this.raisePublishFailure(dynamicValue, responseArgs, false);
      this.raisePublishComplete(dynamicValue, responseArgs);
      args2 = new fm.websync.clientPublishEndArgs();
      args2.setMethodArgs(dynamicValue);
      this.raiseCompleteEvent(fm.websync.client._onPublishEnd, args2, responseArgs);
      if (flag) {
        dynamicValue.setIsRetry(true);
        return this.publish(dynamicValue);
      }
    } else {
      this.raisePublishSuccess(dynamicValue, responseArgs);
      this.raisePublishComplete(dynamicValue, responseArgs);
      args3 = new fm.websync.clientPublishEndArgs();
      args3.setMethodArgs(dynamicValue);
      return this.raiseCompleteEvent(fm.websync.client._onPublishEnd, args3, responseArgs);
    }
  };

  /**
  
  	@function performService
  	@param {fm.websync.serviceArgs} serviceArgs
  	@return {void}
  */


  client.prototype.performService = function() {
    var args, message, request, request2, serviceArgs, synchronous;
    serviceArgs = arguments[0];
    args = new fm.websync.clientServiceRequestArgs();
    args.setMethodArgs(serviceArgs);
    if (this.raiseRequestEvent(fm.websync.client._onServiceRequest, args)) {
      synchronous = this.checkSynchronous(serviceArgs.getSynchronous());
      request2 = new fm.websync.clientRequest();
      message = new fm.websync.message(fm.websync.metaChannels.convertChannelToServiced(serviceArgs.getChannel()));
      message.setValidate(false);
      message.setDataJson(serviceArgs.getDataJson());
      message.setExtensions(serviceArgs.getExtensions());
      request2.setMessage(message);
      request2.setCallback(this.performServiceCallback);
      request = request2;
      request.setDynamicValue(fm.websync.client._argsKey, serviceArgs);
      this.addToQueue(request, serviceArgs.getRequestUrl(), synchronous);
      return this.processQueue(false);
    }
  };

  /**
  
  	@function performServiceCallback
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.performServiceCallback = function() {
    var args, args2, args3, dynamicValue, flag, responseArgs, _var0;
    responseArgs = arguments[0];
    dynamicValue = responseArgs.getDynamicValue(fm.websync.client._argsKey);
    args = new fm.websync.clientServiceResponseArgs();
    args.setMethodArgs(dynamicValue);
    this.raiseResponseEvent(fm.websync.client._onServiceResponse, args, responseArgs);
    _var0 = responseArgs.getException();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      flag = this.raiseServiceFailure(dynamicValue, responseArgs, false);
      this.raiseServiceComplete(dynamicValue, responseArgs);
      args2 = new fm.websync.clientServiceEndArgs();
      args2.setMethodArgs(dynamicValue);
      this.raiseCompleteEvent(fm.websync.client._onServiceEnd, args2, responseArgs);
      if (flag) {
        dynamicValue.setIsRetry(true);
        return this.service(dynamicValue);
      }
    } else {
      this.raiseServiceSuccess(dynamicValue, responseArgs);
      this.raiseServiceComplete(dynamicValue, responseArgs);
      args3 = new fm.websync.clientServiceEndArgs();
      args3.setMethodArgs(dynamicValue);
      return this.raiseCompleteEvent(fm.websync.client._onServiceEnd, args3, responseArgs);
    }
  };

  /**
  
  	@function performSubscribe
  	@param {fm.websync.subscribeArgs} subscribeArgs
  	@return {void}
  */


  client.prototype.performSubscribe = function() {
    var args, message, request, request2, subscribeArgs, synchronous;
    subscribeArgs = arguments[0];
    if (!(subscribeArgs.getAutoResubscribe() !== null)) {
      subscribeArgs.setAutoResubscribe(!this.inCallback());
    }
    args = new fm.websync.clientSubscribeRequestArgs();
    args.setMethodArgs(subscribeArgs);
    if (this.raiseRequestEvent(fm.websync.client._onSubscribeRequest, args)) {
      synchronous = this.checkSynchronous(subscribeArgs.getSynchronous());
      request2 = new fm.websync.clientRequest();
      message = new fm.websync.message("/meta/subscribe");
      message.setValidate(false);
      message.setChannels(subscribeArgs.getChannels());
      message.setExtensions(subscribeArgs.getExtensions());
      request2.setMessage(message);
      request2.setCallback(this.performSubscribeCallback);
      request = request2;
      request.setDynamicValue(fm.websync.client._argsKey, subscribeArgs);
      this.addToQueue(request, subscribeArgs.getRequestUrl(), synchronous);
      return this.processQueue(false);
    }
  };

  /**
  
  	@function performSubscribeCallback
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.performSubscribeCallback = function() {
    var args, args2, args3, dynamicValue, flag, responseArgs, str, _i, _j, _len, _len1, _var0, _var1, _var2;
    responseArgs = arguments[0];
    dynamicValue = responseArgs.getDynamicValue(fm.websync.client._argsKey);
    args = new fm.websync.clientSubscribeResponseArgs();
    args.setMethodArgs(dynamicValue);
    this.raiseResponseEvent(fm.websync.client._onSubscribeResponse, args, responseArgs);
    _var0 = responseArgs.getException();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      flag = this.raiseSubscribeFailure(dynamicValue, responseArgs, false);
      this.raiseSubscribeComplete(dynamicValue, responseArgs);
      args2 = new fm.websync.clientSubscribeEndArgs();
      args2.setMethodArgs(dynamicValue);
      this.raiseCompleteEvent(fm.websync.client._onSubscribeEnd, args2, responseArgs);
      if (flag) {
        dynamicValue.setIsRetry(true);
        return this.subscribe(dynamicValue);
      }
    } else {
      if (dynamicValue.getAutoResubscribe() === true) {
        fm.arrayExtensions.add(this._reconnectCache, dynamicValue);
        _var1 = responseArgs.getResponse().getChannels();
        for (_i = 0, _len = _var1.length; _i < _len; _i++) {
          str = _var1[_i];
          this._resubscribeCache[fm.websync.client.getSubscribeKey(str, dynamicValue.getTag())] = dynamicValue;
        }
      }
      _var2 = responseArgs.getResponse().getChannels();
      for (_j = 0, _len1 = _var2.length; _j < _len1; _j++) {
        str = _var2[_j];
        this._subscribedDynamicProperties[fm.websync.client.getSubscribeKey(str, dynamicValue.getTag())] = dynamicValue.getDynamicProperties();
      }
      this.addSubscribedChannels(responseArgs.getResponse().getTag(), responseArgs.getResponse().getChannels());
      this.raiseSubscribeSuccess(dynamicValue, responseArgs);
      this.raiseSubscribeComplete(dynamicValue, responseArgs);
      this.addSubscribedOnReceive(responseArgs.getResponse().getTag(), responseArgs.getResponse().getChannels(), dynamicValue.getOnReceive(), dynamicValue.getDynamicProperties());
      args3 = new fm.websync.clientSubscribeEndArgs();
      args3.setMethodArgs(dynamicValue);
      return this.raiseCompleteEvent(fm.websync.client._onSubscribeEnd, args3, responseArgs);
    }
  };

  /**
  
  	@function performUnbind
  	@param {fm.websync.unbindArgs} unbindArgs
  	@return {void}
  */


  client.prototype.performUnbind = function() {
    var args, message, request, request2, synchronous, unbindArgs;
    unbindArgs = arguments[0];
    args = new fm.websync.clientUnbindRequestArgs();
    args.setMethodArgs(unbindArgs);
    if (this.raiseRequestEvent(fm.websync.client._onUnbindRequest, args)) {
      synchronous = this.checkSynchronous(unbindArgs.getSynchronous());
      request2 = new fm.websync.clientRequest();
      message = new fm.websync.message("/meta/unbind");
      message.setValidate(false);
      message.setRecords(unbindArgs.getRecords());
      message.setExtensions(unbindArgs.getExtensions());
      request2.setMessage(message);
      request2.setCallback(this.performUnbindCallback);
      request = request2;
      request.setDynamicValue(fm.websync.client._argsKey, unbindArgs);
      this.addToQueue(request, unbindArgs.getRequestUrl(), synchronous);
      return this.processQueue(false);
    }
  };

  /**
  
  	@function performUnbindCallback
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.performUnbindCallback = function() {
    var args, args2, args3, args4, dynamicValue, flag, i, list, record, responseArgs, _i, _len, _var0, _var1, _var2, _var3, _var4;
    responseArgs = arguments[0];
    dynamicValue = responseArgs.getDynamicValue(fm.websync.client._argsKey);
    args = new fm.websync.clientUnbindResponseArgs();
    args.setMethodArgs(dynamicValue);
    this.raiseResponseEvent(fm.websync.client._onUnbindResponse, args, responseArgs);
    _var0 = responseArgs.getException();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      flag = this.raiseUnbindFailure(dynamicValue, responseArgs, false);
      this.raiseUnbindComplete(dynamicValue, responseArgs);
      args2 = new fm.websync.clientUnbindEndArgs();
      args2.setMethodArgs(dynamicValue);
      this.raiseCompleteEvent(fm.websync.client._onUnbindEnd, args2, responseArgs);
      if (flag) {
        dynamicValue.setIsRetry(true);
        return this.unbind(dynamicValue);
      }
    } else {
      _var1 = responseArgs.getResponse().getRecords();
      for (_i = 0, _len = _var1.length; _i < _len; _i++) {
        record = _var1[_i];
        args3 = null;
        _var2 = new fm.holder(args3);
        _var3 = fm.hashExtensions.tryGetValue(this._rebindCache, record.getKey(), _var2);
        args3 = _var2.getValue();
        _var3;

        _var4 = args3;
        if (_var4 !== null && typeof _var4 !== 'undefined') {
          list = [];
          i = 0;
          while (i < fm.arrayExtensions.getCount(list)) {
            try {
              if (list[i].getKey() === record.getKey()) {
                list.removeAt(i);
                i--;
              }
            } finally {
              i++;
            }
          }
          args3.setRecords(fm.arrayExtensions.toArray(list));
          fm.hashExtensions.remove(this._rebindCache, record.getKey());
          if (!fm.hashExtensions.containsValue(this._rebindCache, args3)) {
            fm.arrayExtensions.remove(this._reconnectCache, args3);
          }
        }
      }
      this.removeBoundRecords(responseArgs.getResponse().getRecords());
      this.raiseUnbindSuccess(dynamicValue, responseArgs);
      this.raiseUnbindComplete(dynamicValue, responseArgs);
      args4 = new fm.websync.clientUnbindEndArgs();
      args4.setMethodArgs(dynamicValue);
      return this.raiseCompleteEvent(fm.websync.client._onUnbindEnd, args4, responseArgs);
    }
  };

  /**
  
  	@function performUnsubscribe
  	@param {fm.websync.unsubscribeArgs} unsubscribeArgs
  	@return {void}
  */


  client.prototype.performUnsubscribe = function() {
    var args, message, request, request2, synchronous, unsubscribeArgs;
    unsubscribeArgs = arguments[0];
    args = new fm.websync.clientUnsubscribeRequestArgs();
    args.setMethodArgs(unsubscribeArgs);
    if (this.raiseRequestEvent(fm.websync.client._onUnsubscribeRequest, args)) {
      synchronous = this.checkSynchronous(unsubscribeArgs.getSynchronous());
      request2 = new fm.websync.clientRequest();
      message = new fm.websync.message("/meta/unsubscribe");
      message.setValidate(false);
      message.setChannels(unsubscribeArgs.getChannels());
      message.setExtensions(unsubscribeArgs.getExtensions());
      request2.setMessage(message);
      request2.setCallback(this.performUnsubscribeCallback);
      request = request2;
      request.setDynamicValue(fm.websync.client._argsKey, unsubscribeArgs);
      this.addToQueue(request, unsubscribeArgs.getRequestUrl(), synchronous);
      return this.processQueue(false);
    }
  };

  /**
  
  	@function performUnsubscribeCallback
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.performUnsubscribeCallback = function() {
    var args, args2, args3, args4, dynamicValue, flag, list, responseArgs, str, subscribeKey, _i, _len, _var0, _var1, _var2, _var3, _var4;
    responseArgs = arguments[0];
    dynamicValue = responseArgs.getDynamicValue(fm.websync.client._argsKey);
    args = new fm.websync.clientUnsubscribeResponseArgs();
    args.setMethodArgs(dynamicValue);
    this.raiseResponseEvent(fm.websync.client._onUnsubscribeResponse, args, responseArgs);
    _var0 = responseArgs.getException();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      flag = this.raiseUnsubscribeFailure(dynamicValue, responseArgs, false);
      this.raiseUnsubscribeComplete(dynamicValue, responseArgs);
      args2 = new fm.websync.clientUnsubscribeEndArgs();
      args2.setMethodArgs(dynamicValue);
      this.raiseCompleteEvent(fm.websync.client._onUnsubscribeEnd, args2, responseArgs);
      if (flag) {
        dynamicValue.setIsRetry(true);
        return this.unsubscribe(dynamicValue);
      }
    } else {
      _var1 = responseArgs.getResponse().getChannels();
      for (_i = 0, _len = _var1.length; _i < _len; _i++) {
        str = _var1[_i];
        args3 = null;
        subscribeKey = fm.websync.client.getSubscribeKey(str, dynamicValue.getTag());
        _var2 = new fm.holder(args3);
        _var3 = fm.hashExtensions.tryGetValue(this._resubscribeCache, subscribeKey, _var2);
        args3 = _var2.getValue();
        _var3;

        _var4 = args3;
        if (_var4 !== null && typeof _var4 !== 'undefined') {
          list = [];
          fm.arrayExtensions.remove(list, str);
          args3.setChannels(fm.arrayExtensions.toArray(list));
          fm.hashExtensions.remove(this._resubscribeCache, subscribeKey);
          if (!fm.hashExtensions.containsValue(this._resubscribeCache, args3)) {
            fm.arrayExtensions.remove(this._reconnectCache, args3);
          }
        }
      }
      this.removeSubscribedChannels(responseArgs.getResponse().getTag(), responseArgs.getResponse().getChannels());
      this.removeSubscribedOnReceive(responseArgs.getResponse().getTag(), responseArgs.getResponse().getChannels());
      this.raiseUnsubscribeSuccess(dynamicValue, responseArgs);
      this.raiseUnsubscribeComplete(dynamicValue, responseArgs);
      args4 = new fm.websync.clientUnsubscribeEndArgs();
      args4.setMethodArgs(dynamicValue);
      return this.raiseCompleteEvent(fm.websync.client._onUnsubscribeEnd, args4, responseArgs);
    }
  };

  /**
  
  	@function postRaise
  	@param {fm.string} threadId
  	@return {void}
  */


  client.prototype.postRaise = function() {
    var num, threadId;
    threadId = arguments[0];
    if (this.getConcurrencyMode() === fm.websync.concurrencyMode.Low) {
      num = this._threadCounters[threadId];
      if (num === 1) {
        return fm.hashExtensions.remove(this._threadCounters, threadId);
      } else {
        return this._threadCounters[threadId] = num - 1;
      }
    } else {
      num = this._threadCounters[threadId];
      return this._threadCounters[threadId] = num - 1;
    }
  };

  /**
  
  	@function preRaise
  	@param {fm.string} threadId
  	@return {void}
  */


  client.prototype.preRaise = function() {
    var num, threadId;
    threadId = arguments[0];
    num = 0;
    if (fm.hashExtensions.containsKey(this._threadCounters, threadId)) {
      num = this._threadCounters[threadId];
    }
    return this._threadCounters[threadId] = num + 1;
  };

  /**
  
  	@function processAdvice
  	@param {fm.websync.baseAdvice} advice
  	@return {void}
  */


  client.prototype.processAdvice = function() {
    var advice;
    advice = arguments[0];
    if (advice.getInterval() !== null) {
      this._lastInterval = advice.getInterval();
    }
    if (advice.getReconnect() !== null) {
      return this._lastReconnect = advice.getReconnect();
    }
  };

  /**
  
  	@function processPendingReceives
  	@param {fm.array} channels
  	@return {void}
  */


  client.prototype.processPendingReceives = function() {
    var channels, list, message, str, _i, _len, _results, _var0, _var1, _var2, _var3, _var4;
    channels = arguments[0];
    _var0 = channels;
    _results = [];
    for (_i = 0, _len = _var0.length; _i < _len; _i++) {
      str = _var0[_i];
      list = null;
      _var1 = new fm.holder(list);
      _var2 = fm.hashExtensions.tryGetValue(this._pendingReceives, str, _var1);
      list = _var1.getValue();
      if (_var2) {
        fm.hashExtensions.remove(this._pendingReceives, str);
      }
      _var3 = list;
      if (_var3 !== null && typeof _var3 !== 'undefined') {
        _var4 = list;
        _results.push((function() {
          var _j, _len1, _results1;
          _results1 = [];
          for (_j = 0, _len1 = _var4.length; _j < _len1; _j++) {
            message = _var4[_j];
            _results1.push(this.receiveMessage(message));
          }
          return _results1;
        }).call(this));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  /**
  
  	@function processQueue
  	@param {fm.boolean} activate
  	@return {void}
  */


  client.prototype.processQueue = function() {
    var activate, requestQueue, requests, str, synchronous, url, _i, _len, _results, _var0;
    activate = arguments[0];
    if (activate) {
      this._queueActivated = true;
    }
    if (this._queueActivated && !this.inBatch()) {
      requestQueue = this._requestQueue;
      this._requestQueue = {};
      _var0 = fm.hashExtensions.getKeys(requestQueue);
      _results = [];
      for (_i = 0, _len = _var0.length; _i < _len; _i++) {
        str = _var0[_i];
        synchronous = fm.stringExtensions.substring(str, 0, 1) === "1";
        url = str.substring(1);
        requests = fm.arrayExtensions.toArray(requestQueue[str]);
        _results.push(this.sendMany(requests, url, synchronous));
      }
      return _results;
    }
  };

  /**
  
  	@function processRequestUrl
  	@param {fm.string} requestUrl
  	@return {fm.string}
  */


  client.prototype.processRequestUrl = function() {
    var flag, requestUrl, str, _var0, _var1;
    requestUrl = arguments[0];
    if (fm.stringExtensions.isNullOrEmpty(requestUrl)) {
      requestUrl = this.getRequestUrl();
    }
    flag = false;
    str = null;
    if (this.getConcurrencyMode() === fm.websync.concurrencyMode.High) {
      _var0 = new fm.holder(str);
      _var1 = fm.hashExtensions.tryGetValue(fm.websync.client._requestUrlCache, requestUrl, _var0);
      str = _var0.getValue();
      flag = _var1;
    }
    if (!flag) {
      str = requestUrl;
      str = fm.httpTransfer.addQueryToUrl(fm.httpTransfer.addQueryToUrl(fm.httpTransfer.addQueryToUrl(str, "token", this.getToken()), "src", fm.httpWebRequestTransfer.getPlatformCode()), "AspxAutoDetectCookieSupport", "1");
      if (this.getConcurrencyMode() !== fm.websync.concurrencyMode.High) {
        return str;
      }
      fm.websync.client._requestUrlCache[requestUrl] = str;
    }
    return str;
  };

  /**
  
  	@function processServerAction
  	@param {fm.websync.message} serverAction
  	@return {void}
  */


  client.prototype.processServerAction = function() {
    var onReceive, serverAction, _var0;
    serverAction = arguments[0];
    if (serverAction.getBayeuxChannel() === "/meta/bind") {
      this.addBoundRecords(serverAction.getRecords());
      return this.raiseServerBind(serverAction);
    } else {
      if (serverAction.getBayeuxChannel() === "/meta/unbind") {
        this.removeBoundRecords(serverAction.getRecords());
        return this.raiseServerUnbind(serverAction);
      } else {
        if (serverAction.getBayeuxChannel() === "/meta/subscribe") {
          this.addSubscribedChannels(serverAction.getTag(), serverAction.getChannels());
          onReceive = this.raiseServerSubscribe(serverAction);
          _var0 = onReceive;
          if (_var0 === null || typeof _var0 === 'undefined') {
            throw new Error(fm.stringExtensions.format("The server subscribed the client to [{0}], but the client did not supply a callback to handle received messages. A callback must be specified in the client's OnServerSubscribe event.", fm.stringExtensions.join(", ", serverAction.getChannels())));
          }
          return this.addSubscribedOnReceive(serverAction.getTag(), serverAction.getChannels(), onReceive, serverAction.getDynamicProperties());
        } else {
          if (serverAction.getBayeuxChannel() === "/meta/unsubscribe") {
            this.removeSubscribedChannels(serverAction.getTag(), serverAction.getChannels());
            this.raiseServerUnsubscribe(serverAction);
            return this.removeSubscribedOnReceive(serverAction.getTag(), serverAction.getChannels());
          }
        }
      }
    }
  };

  /**
  	 <div>
  	 Sends data to a specified channel.
  	 </div><div>
  	 When the publish completes successfully, the OnSuccess callback
  	 will be invoked, passing in the
  	 channel and published data, <b>including any modifications made on the server</b>.
  	 </div><param name="publishArgs">The publish arguments.
  	 See <see cref="fm.websync.publishArgs">fm.websync.publishArgs</see> for more details.</param><returns>The client.</returns>
  
  	@function publish
  	@param {fm.websync.publishArgs} publishArgs
  	@return {fm.websync.client}
  */


  client.prototype.publish = function() {
    var publishArgs;
    publishArgs = arguments[0];
    if (fm.stringExtensions.isNullOrEmpty(publishArgs.getChannel())) {
      throw new Error("Please specify the channel to which the data should be published.");
    }
    if (fm.stringExtensions.isNullOrEmpty(publishArgs.getDataJson())) {
      throw new Error("Please specify the data to send.");
    }
    this.performPublish(publishArgs);
    return this;
  };

  /**
  
  	@function raiseAction
  	@param {fm.singleAction} callback
  	@param {fm.object} args
  	@return {void}
  */


  client.prototype.raiseAction = function() {
    var args, callback;
    callback = arguments[0];
    args = arguments[1];
    return this.raiseActionManual(callback, args, false);
  };

  /**
  
  	@function raiseActionManual
  	@param {fm.singleAction} callback
  	@param {fm.object} args
  	@param {fm.boolean} manualThreadManagement
  	@return {void}
  */


  client.prototype.raiseActionManual = function() {
    var args, callback, exception, manualThreadManagement, threadId;
    callback = arguments[0];
    args = arguments[1];
    manualThreadManagement = arguments[2];
    if (manualThreadManagement) {
      try {
        return callback(args);
      } catch (exception1) {
        exception = exception1;
        return fm.asyncException.asyncThrow(exception);
      } finally {

      }
    } else {
      threadId = this.getThreadId();
      this.preRaise(threadId);
      try {
        return callback(args);
      } catch (exception2) {
        exception = exception2;
        return fm.asyncException.asyncThrow(exception);
      } finally {
        this.postRaise(threadId);
      }
    }
  };

  /**
  
  	@function raiseBindComplete
  	@param {fm.websync.bindArgs} bindArgs
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.raiseBindComplete = function() {
    var args, args2, bindArgs, onBindComplete, responseArgs, _var0, _var1;
    bindArgs = arguments[0];
    responseArgs = arguments[1];
    args2 = new fm.websync.bindCompleteArgs();
    args2.setExtensions(fm.websync.client.getExtensions(responseArgs.getResponse(), bindArgs));
    args2.setIsRebind(bindArgs.getIsRebind());
    args2.setTimestamp(fm.websync.client.getTimestamp(responseArgs.getResponse()));
    args2.setClient(this);
    args2.setDynamicProperties(bindArgs.getDynamicProperties());
    args = args2;
    onBindComplete = this._onBindComplete;
    _var0 = onBindComplete;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      this.raiseAction(onBindComplete, args);
    }
    _var1 = bindArgs.getOnComplete();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      return this.raiseAction(bindArgs.getOnComplete(), args);
    }
  };

  /**
  
  	@function raiseBindFailure
  	@param {fm.websync.bindArgs} bindArgs
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@param {fm.boolean} retry
  	@return {fm.boolean}
  */


  client.prototype.raiseBindFailure = function() {
    var args, args2, bindArgs, onBindFailure, responseArgs, retry, _var0, _var1;
    bindArgs = arguments[0];
    responseArgs = arguments[1];
    retry = arguments[2];
    args2 = new fm.websync.bindFailureArgs();
    args2.__records = fm.websync.client.getRecordsForBind(responseArgs.getResponse(), bindArgs);
    args2.setException(responseArgs.getException());
    args2.setExtensions(fm.websync.client.getExtensions(responseArgs.getResponse(), bindArgs));
    args2.setIsRebind(bindArgs.getIsRebind());
    args2.setTimestamp(fm.websync.client.getTimestamp(responseArgs.getResponse()));
    args2.setClient(this);
    args2.setDynamicProperties(bindArgs.getDynamicProperties());
    args = args2;
    onBindFailure = this._onBindFailure;
    _var0 = onBindFailure;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      this.raiseAction(onBindFailure, args);
    }
    _var1 = bindArgs.getOnFailure();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      retry = this.raiseRetriable(bindArgs.getOnFailure(), retry, args);
    }
    return retry;
  };

  /**
  
  	@function raiseBindSuccess
  	@param {fm.websync.bindArgs} bindArgs
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.raiseBindSuccess = function() {
    var args, args2, bindArgs, onBindSuccess, responseArgs, _var0, _var1;
    bindArgs = arguments[0];
    responseArgs = arguments[1];
    args2 = new fm.websync.bindSuccessArgs();
    args2.__records = fm.websync.client.getRecordsForBind(responseArgs.getResponse(), bindArgs);
    args2.setExtensions(fm.websync.client.getExtensions(responseArgs.getResponse(), bindArgs));
    args2.setIsRebind(bindArgs.getIsRebind());
    args2.setTimestamp(fm.websync.client.getTimestamp(responseArgs.getResponse()));
    args2.setClient(this);
    args2.setDynamicProperties(bindArgs.getDynamicProperties());
    args = args2;
    onBindSuccess = this._onBindSuccess;
    _var0 = onBindSuccess;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      this.raiseAction(onBindSuccess, args);
    }
    _var1 = bindArgs.getOnSuccess();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      return this.raiseAction(bindArgs.getOnSuccess(), args);
    }
  };

  /**
  
  	@function raiseCompleteEvent
  	@param {fm.doubleAction} eventMethod
  	@param {fm.object} args
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.raiseCompleteEvent = function() {
    var args, eventMethod, responseArgs;
    eventMethod = arguments[0];
    args = arguments[1];
    responseArgs = arguments[2];
    args.setException(responseArgs.getException());
    args.setResponse(responseArgs.getResponse());
    return this.raiseEvent(eventMethod, args);
  };

  /**
  
  	@function raiseConnectComplete
  	@param {fm.websync.connectArgs} connectArgs
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.raiseConnectComplete = function() {
    var args, args2, connectArgs, onConnectComplete, responseArgs, _var0, _var1;
    connectArgs = arguments[0];
    responseArgs = arguments[1];
    args2 = new fm.websync.connectCompleteArgs();
    args2.setExtensions(fm.websync.client.getExtensions(responseArgs.getResponse(), connectArgs));
    args2.setIsReconnect(connectArgs.getIsReconnect());
    args2.setTimestamp(fm.websync.client.getTimestamp(responseArgs.getResponse()));
    args2.setClient(this);
    args2.setDynamicProperties(connectArgs.getDynamicProperties());
    args = args2;
    onConnectComplete = this._onConnectComplete;
    _var0 = onConnectComplete;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      this.raiseAction(onConnectComplete, args);
    }
    _var1 = connectArgs.getOnComplete();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      return this.raiseAction(connectArgs.getOnComplete(), args);
    }
  };

  /**
  
  	@function raiseConnectFailure
  	@param {fm.websync.connectArgs} connectArgs
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@param {fm.boolean} retry
  	@return {fm.boolean}
  */


  client.prototype.raiseConnectFailure = function() {
    var args, args2, connectArgs, onConnectFailure, responseArgs, retry, _var0, _var1;
    connectArgs = arguments[0];
    responseArgs = arguments[1];
    retry = arguments[2];
    args2 = new fm.websync.connectFailureArgs();
    args2.setException(responseArgs.getException());
    args2.setExtensions(fm.websync.client.getExtensions(responseArgs.getResponse(), connectArgs));
    args2.setIsReconnect(connectArgs.getIsReconnect());
    args2.setTimestamp(fm.websync.client.getTimestamp(responseArgs.getResponse()));
    args2.setClient(this);
    args2.setDynamicProperties(connectArgs.getDynamicProperties());
    args = args2;
    onConnectFailure = this._onConnectFailure;
    _var0 = onConnectFailure;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      this.raiseAction(onConnectFailure, args);
    }
    _var1 = connectArgs.getOnFailure();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      retry = this.raiseRetriable(connectArgs.getOnFailure(), retry, args);
    }
    return retry;
  };

  /**
  
  	@function raiseConnectSuccess
  	@param {fm.websync.connectArgs} connectArgs
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.raiseConnectSuccess = function() {
    var args, args2, connectArgs, onConnectSuccess, responseArgs, _var0, _var1;
    connectArgs = arguments[0];
    responseArgs = arguments[1];
    args2 = new fm.websync.connectSuccessArgs();
    args2.setExtensions(fm.websync.client.getExtensions(responseArgs.getResponse(), connectArgs));
    args2.setConnectionType(this._connectionType);
    args2.setIsReconnect(connectArgs.getIsReconnect());
    args2.setTimestamp(fm.websync.client.getTimestamp(responseArgs.getResponse()));
    args2.setClient(this);
    args2.setDynamicProperties(connectArgs.getDynamicProperties());
    args = args2;
    onConnectSuccess = this._onConnectSuccess;
    _var0 = onConnectSuccess;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      this.raiseAction(onConnectSuccess, args);
    }
    _var1 = connectArgs.getOnSuccess();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      return this.raiseAction(connectArgs.getOnSuccess(), args);
    }
  };

  /**
  
  	@function raiseDisconnectComplete
  	@param {fm.websync.disconnectArgs} disconnectArgs
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.raiseDisconnectComplete = function() {
    var args, args2, disconnectArgs, onDisconnectComplete, responseArgs, _var0, _var1;
    disconnectArgs = arguments[0];
    responseArgs = arguments[1];
    args2 = new fm.websync.disconnectCompleteArgs();
    args2.setException(responseArgs.getException());
    args2.setExtensions(fm.websync.client.getExtensions(responseArgs.getResponse(), disconnectArgs));
    args2.setTimestamp(fm.websync.client.getTimestamp(responseArgs.getResponse()));
    args2.setClient(this);
    args2.setDynamicProperties(disconnectArgs.getDynamicProperties());
    args = args2;
    onDisconnectComplete = this._onDisconnectComplete;
    _var0 = onDisconnectComplete;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      this.raiseAction(onDisconnectComplete, args);
    }
    _var1 = disconnectArgs.getOnComplete();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      return this.raiseAction(disconnectArgs.getOnComplete(), args);
    }
  };

  /**
  
  	@function raiseEvent
  	@param {fm.doubleAction} eventMethod
  	@param {fm.object} args
  	@return {void}
  */


  client.prototype.raiseEvent = function() {
    var args, eventMethod, _var0;
    eventMethod = arguments[0];
    args = arguments[1];
    args.setClient(this);
    _var0 = eventMethod;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      try {
        return eventMethod(this, args);
      } catch (exception) {
        return fm.asyncException.asyncThrow(exception);
      } finally {

      }
    }
  };

  /**
  
  	@function raiseFunction
  	@param {fm.singleFunction} callback
  	@param {fm.object} args
  	@return {fm.object}
  */


  client.prototype.raiseFunction = function() {
    var args, callback;
    callback = arguments[0];
    args = arguments[1];
    return this.raiseFunctionManual(callback, args, false);
  };

  /**
  
  	@function raiseFunctionManual
  	@param {fm.singleFunction} callback
  	@param {fm.object} args
  	@param {fm.boolean} manualThreadManagement
  	@return {fm.object}
  */


  client.prototype.raiseFunctionManual = function() {
    var args, callback, exception, local, manualThreadManagement, threadId;
    callback = arguments[0];
    args = arguments[1];
    manualThreadManagement = arguments[2];
    if (manualThreadManagement) {
      try {
        return callback(args);
      } catch (exception1) {
        exception = exception1;
        fm.asyncException.asyncThrow(exception);
        return null;
      } finally {

      }
    }
    threadId = this.getThreadId();
    this.preRaise(threadId);
    try {
      local = callback(args);
    } catch (exception2) {
      exception = exception2;
      fm.asyncException.asyncThrow(exception);
      local = null;
    } finally {
      this.postRaise(threadId);
    }
    return local;
  };

  /**
  
  	@function raiseNotifyComplete
  	@param {fm.websync.notifyArgs} notifyArgs
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.raiseNotifyComplete = function() {
    var args, args2, notifyArgs, onNotifyComplete, responseArgs, _var0, _var1;
    notifyArgs = arguments[0];
    responseArgs = arguments[1];
    args2 = new fm.websync.notifyCompleteArgs();
    args2.setExtensions(fm.websync.client.getExtensions(responseArgs.getResponse(), notifyArgs));
    args2.setTimestamp(fm.websync.client.getTimestamp(responseArgs.getResponse()));
    args2.setClient(this);
    args2.setDynamicProperties(notifyArgs.getDynamicProperties());
    args = args2;
    onNotifyComplete = this._onNotifyComplete;
    _var0 = onNotifyComplete;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      this.raiseAction(onNotifyComplete, args);
    }
    _var1 = notifyArgs.getOnComplete();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      return this.raiseAction(notifyArgs.getOnComplete(), args);
    }
  };

  /**
  
  	@function raiseNotifyDelivery
  	@param {fm.singleAction} onReceive
  	@param {fm.websync.message} response
  	@return {void}
  */


  client.prototype.raiseNotifyDelivery = function() {
    var args, onReceive, response, _var0;
    onReceive = arguments[0];
    response = arguments[1];
    _var0 = onReceive;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      args = new fm.websync.notifyReceiveArgs(response.getDataJson());
      args.setExtensions(response.getExtensions());
      args.setTimestamp(fm.websync.client.getTimestamp(response));
      args.setClient(this);
      return this.raiseActionManual(onReceive, args, true);
    }
  };

  /**
  
  	@function raiseNotifyFailure
  	@param {fm.websync.notifyArgs} notifyArgs
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@param {fm.boolean} retry
  	@return {fm.boolean}
  */


  client.prototype.raiseNotifyFailure = function() {
    var args, args2, notifyArgs, onNotifyFailure, responseArgs, retry, _var0, _var1;
    notifyArgs = arguments[0];
    responseArgs = arguments[1];
    retry = arguments[2];
    args2 = new fm.websync.notifyFailureArgs();
    args2.__dataJson = fm.websync.client.getDataJsonForNotify(responseArgs.getResponse(), notifyArgs);
    args2.setException(responseArgs.getException());
    args2.setExtensions(fm.websync.client.getExtensions(responseArgs.getResponse(), notifyArgs));
    args2.setTimestamp(fm.websync.client.getTimestamp(responseArgs.getResponse()));
    args2.setClient(this);
    args2.setDynamicProperties(notifyArgs.getDynamicProperties());
    args = args2;
    onNotifyFailure = this._onNotifyFailure;
    _var0 = onNotifyFailure;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      this.raiseAction(onNotifyFailure, args);
    }
    _var1 = notifyArgs.getOnFailure();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      retry = this.raiseRetriable(notifyArgs.getOnFailure(), retry, args);
    }
    return retry;
  };

  /**
  
  	@function raiseNotifySuccess
  	@param {fm.websync.notifyArgs} notifyArgs
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.raiseNotifySuccess = function() {
    var args, args2, notifyArgs, onNotifySuccess, responseArgs, _var0, _var1;
    notifyArgs = arguments[0];
    responseArgs = arguments[1];
    args2 = new fm.websync.notifySuccessArgs();
    args2.__dataJson = fm.websync.client.getDataJsonForNotify(responseArgs.getResponse(), notifyArgs);
    args2.setExtensions(fm.websync.client.getExtensions(responseArgs.getResponse(), notifyArgs));
    args2.setTimestamp(fm.websync.client.getTimestamp(responseArgs.getResponse()));
    args2.setClient(this);
    args2.setDynamicProperties(notifyArgs.getDynamicProperties());
    args = args2;
    onNotifySuccess = this._onNotifySuccess;
    _var0 = onNotifySuccess;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      this.raiseAction(onNotifySuccess, args);
    }
    _var1 = notifyArgs.getOnSuccess();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      return this.raiseAction(notifyArgs.getOnSuccess(), args);
    }
  };

  /**
  
  	@function raisePublishComplete
  	@param {fm.websync.publishArgs} publishArgs
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.raisePublishComplete = function() {
    var args, args2, onPublishComplete, publishArgs, responseArgs, _var0, _var1;
    publishArgs = arguments[0];
    responseArgs = arguments[1];
    args2 = new fm.websync.publishCompleteArgs();
    args2.setExtensions(fm.websync.client.getExtensions(responseArgs.getResponse(), publishArgs));
    args2.setTimestamp(fm.websync.client.getTimestamp(responseArgs.getResponse()));
    args2.setClient(this);
    args2.setDynamicProperties(publishArgs.getDynamicProperties());
    args = args2;
    onPublishComplete = this._onPublishComplete;
    _var0 = onPublishComplete;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      this.raiseAction(onPublishComplete, args);
    }
    _var1 = publishArgs.getOnComplete();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      return this.raiseAction(publishArgs.getOnComplete(), args);
    }
  };

  /**
  
  	@function raisePublishFailure
  	@param {fm.websync.publishArgs} publishArgs
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@param {fm.boolean} retry
  	@return {fm.boolean}
  */


  client.prototype.raisePublishFailure = function() {
    var args, args2, onPublishFailure, publishArgs, responseArgs, retry, _var0, _var1;
    publishArgs = arguments[0];
    responseArgs = arguments[1];
    retry = arguments[2];
    args2 = new fm.websync.publishFailureArgs();
    args2.__channel = fm.websync.client.getChannelForPublish(responseArgs.getResponse(), publishArgs);
    args2.__dataJson = fm.websync.client.getDataJsonForPublish(responseArgs.getResponse(), publishArgs);
    args2.setException(responseArgs.getException());
    args2.setExtensions(fm.websync.client.getExtensions(responseArgs.getResponse(), publishArgs));
    args2.setTimestamp(fm.websync.client.getTimestamp(responseArgs.getResponse()));
    args2.setClient(this);
    args2.setDynamicProperties(publishArgs.getDynamicProperties());
    args = args2;
    onPublishFailure = this._onPublishFailure;
    _var0 = onPublishFailure;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      this.raiseAction(onPublishFailure, args);
    }
    _var1 = publishArgs.getOnFailure();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      retry = this.raiseRetriable(publishArgs.getOnFailure(), retry, args);
    }
    return retry;
  };

  /**
  
  	@function raisePublishSuccess
  	@param {fm.websync.publishArgs} publishArgs
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.raisePublishSuccess = function() {
    var args, args2, onPublishSuccess, publishArgs, responseArgs, _var0, _var1;
    publishArgs = arguments[0];
    responseArgs = arguments[1];
    args2 = new fm.websync.publishSuccessArgs();
    args2.__channel = fm.websync.client.getChannelForPublish(responseArgs.getResponse(), publishArgs);
    args2.__dataJson = fm.websync.client.getDataJsonForPublish(responseArgs.getResponse(), publishArgs);
    args2.setExtensions(fm.websync.client.getExtensions(responseArgs.getResponse(), publishArgs));
    args2.setTimestamp(fm.websync.client.getTimestamp(responseArgs.getResponse()));
    args2.setClient(this);
    args2.setDynamicProperties(publishArgs.getDynamicProperties());
    args = args2;
    onPublishSuccess = this._onPublishSuccess;
    _var0 = onPublishSuccess;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      this.raiseAction(onPublishSuccess, args);
    }
    _var1 = publishArgs.getOnSuccess();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      return this.raiseAction(publishArgs.getOnSuccess(), args);
    }
  };

  /**
  
  	@function raiseRequestEvent
  	@param {fm.doubleAction} eventMethod
  	@param {fm.object} args
  	@return {fm.boolean}
  */


  client.prototype.raiseRequestEvent = function() {
    var args, eventMethod;
    eventMethod = arguments[0];
    args = arguments[1];
    this.raiseEvent(eventMethod, args);
    return !args.getCancel();
  };

  /**
  
  	@function raiseResponseEvent
  	@param {fm.doubleAction} eventMethod
  	@param {fm.object} args
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.raiseResponseEvent = function() {
    var args, eventMethod, responseArgs;
    eventMethod = arguments[0];
    args = arguments[1];
    responseArgs = arguments[2];
    args.setException(responseArgs.getException());
    args.setResponse(responseArgs.getResponse());
    return this.raiseEvent(eventMethod, args);
  };

  /**
  
  	@function raiseRetriable
  	@param {fm.singleAction} callback
  	@param {fm.boolean} retry
  	@param {fm.object} args
  	@return {fm.boolean}
  */


  client.prototype.raiseRetriable = function() {
    var args, callback, retry;
    callback = arguments[0];
    retry = arguments[1];
    args = arguments[2];
    args.setRetry(retry);
    this.raiseAction(callback, args);
    return args.getRetry();
  };

  /**
  
  	@function raiseSendException
  	@param {fm.websync.clientSendState} state
  	@param {Error} exception
  	@return {void}
  */


  client.prototype.raiseSendException = function() {
    var exception, p, request, state, _i, _len, _results, _var0;
    state = arguments[0];
    exception = arguments[1];
    _var0 = state.getRequests();
    _results = [];
    for (_i = 0, _len = _var0.length; _i < _len; _i++) {
      request = _var0[_i];
      p = new fm.websync.clientResponseArgs(request.getDynamicProperties());
      p.setException(exception);
      _results.push(request.getCallback()(p));
    }
    return _results;
  };

  /**
  
  	@function raiseServerBind
  	@param {fm.websync.message} serverAction
  	@return {void}
  */


  client.prototype.raiseServerBind = function() {
    var args, onServerBind, serverAction, _var0;
    serverAction = arguments[0];
    onServerBind = this._onServerBind;
    _var0 = onServerBind;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      args = new fm.websync.serverBindArgs();
      args.__records = serverAction.getRecords();
      args.setExtensions(serverAction.getExtensions());
      args.setTimestamp(serverAction.getTimestamp());
      args.setClient(this);
      return this.raiseAction(onServerBind, args);
    }
  };

  /**
  
  	@function raiseServerSubscribe
  	@param {fm.websync.message} serverAction
  	@return {fm.singleAction}
  */


  client.prototype.raiseServerSubscribe = function() {
    var args, onServerSubscribe, serverAction, _var0;
    serverAction = arguments[0];
    onServerSubscribe = this._onServerSubscribe;
    _var0 = onServerSubscribe;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      args = new fm.websync.serverSubscribeArgs();
      args.__channels = serverAction.getChannels();
      args.setExtensions(serverAction.getExtensions());
      args.setTimestamp(serverAction.getTimestamp());
      args.setClient(this);
      return this.raiseFunction(onServerSubscribe, args);
    }
    return null;
  };

  /**
  
  	@function raiseServerUnbind
  	@param {fm.websync.message} serverAction
  	@return {void}
  */


  client.prototype.raiseServerUnbind = function() {
    var args, onServerUnbind, serverAction, _var0;
    serverAction = arguments[0];
    onServerUnbind = this._onServerUnbind;
    _var0 = onServerUnbind;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      args = new fm.websync.serverUnbindArgs();
      args.__records = serverAction.getRecords();
      args.setExtensions(serverAction.getExtensions());
      args.setTimestamp(serverAction.getTimestamp());
      args.setClient(this);
      return this.raiseAction(onServerUnbind, args);
    }
  };

  /**
  
  	@function raiseServerUnsubscribe
  	@param {fm.websync.message} serverAction
  	@return {void}
  */


  client.prototype.raiseServerUnsubscribe = function() {
    var args, onServerUnsubscribe, serverAction, _var0;
    serverAction = arguments[0];
    onServerUnsubscribe = this._onServerUnsubscribe;
    _var0 = onServerUnsubscribe;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      args = new fm.websync.serverUnsubscribeArgs();
      args.__channels = serverAction.getChannels();
      args.setExtensions(serverAction.getExtensions());
      args.setTimestamp(serverAction.getTimestamp());
      args.setClient(this);
      return this.raiseAction(onServerUnsubscribe, args);
    }
  };

  /**
  
  	@function raiseServiceComplete
  	@param {fm.websync.serviceArgs} serviceArgs
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.raiseServiceComplete = function() {
    var args, args2, onServiceComplete, responseArgs, serviceArgs, _var0, _var1;
    serviceArgs = arguments[0];
    responseArgs = arguments[1];
    args2 = new fm.websync.serviceCompleteArgs();
    args2.setExtensions(fm.websync.client.getExtensions(responseArgs.getResponse(), serviceArgs));
    args2.setTimestamp(fm.websync.client.getTimestamp(responseArgs.getResponse()));
    args2.setClient(this);
    args2.setDynamicProperties(serviceArgs.getDynamicProperties());
    args = args2;
    onServiceComplete = this._onServiceComplete;
    _var0 = onServiceComplete;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      this.raiseAction(onServiceComplete, args);
    }
    _var1 = serviceArgs.getOnComplete();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      return this.raiseAction(serviceArgs.getOnComplete(), args);
    }
  };

  /**
  
  	@function raiseServiceFailure
  	@param {fm.websync.serviceArgs} serviceArgs
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@param {fm.boolean} retry
  	@return {fm.boolean}
  */


  client.prototype.raiseServiceFailure = function() {
    var args, args2, onServiceFailure, responseArgs, retry, serviceArgs, _var0, _var1;
    serviceArgs = arguments[0];
    responseArgs = arguments[1];
    retry = arguments[2];
    args2 = new fm.websync.serviceFailureArgs();
    args2.__channel = fm.websync.client.getChannelForService(responseArgs.getResponse(), serviceArgs);
    args2.__dataJson = fm.websync.client.getDataJsonForService(responseArgs.getResponse(), serviceArgs);
    args2.setException(responseArgs.getException());
    args2.setExtensions(fm.websync.client.getExtensions(responseArgs.getResponse(), serviceArgs));
    args2.setTimestamp(fm.websync.client.getTimestamp(responseArgs.getResponse()));
    args2.setClient(this);
    args2.setDynamicProperties(serviceArgs.getDynamicProperties());
    args = args2;
    onServiceFailure = this._onServiceFailure;
    _var0 = onServiceFailure;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      this.raiseAction(onServiceFailure, args);
    }
    _var1 = serviceArgs.getOnFailure();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      retry = this.raiseRetriable(serviceArgs.getOnFailure(), retry, args);
    }
    return retry;
  };

  /**
  
  	@function raiseServiceSuccess
  	@param {fm.websync.serviceArgs} serviceArgs
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.raiseServiceSuccess = function() {
    var args, args2, onServiceSuccess, responseArgs, serviceArgs, _var0, _var1;
    serviceArgs = arguments[0];
    responseArgs = arguments[1];
    args2 = new fm.websync.serviceSuccessArgs();
    args2.__channel = fm.websync.client.getChannelForService(responseArgs.getResponse(), serviceArgs);
    args2.__dataJson = fm.websync.client.getDataJsonForService(responseArgs.getResponse(), serviceArgs);
    args2.setExtensions(fm.websync.client.getExtensions(responseArgs.getResponse(), serviceArgs));
    args2.setTimestamp(fm.websync.client.getTimestamp(responseArgs.getResponse()));
    args2.setClient(this);
    args2.setDynamicProperties(serviceArgs.getDynamicProperties());
    args = args2;
    onServiceSuccess = this._onServiceSuccess;
    _var0 = onServiceSuccess;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      this.raiseAction(onServiceSuccess, args);
    }
    _var1 = serviceArgs.getOnSuccess();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      return this.raiseAction(serviceArgs.getOnSuccess(), args);
    }
  };

  /**
  
  	@function raiseStreamFailure
  	@param {fm.websync.connectArgs} connectArgs
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.raiseStreamFailure = function() {
    var args, args2, connectArgs, onStreamFailure, responseArgs, _var0, _var1;
    connectArgs = arguments[0];
    responseArgs = arguments[1];
    args2 = new fm.websync.streamFailureArgs();
    args2.setException(responseArgs.getException());
    args2.setExtensions(fm.websync.client.getExtensions(responseArgs.getResponse(), connectArgs));
    args2.setTimestamp(fm.websync.client.getTimestamp(responseArgs.getResponse()));
    args2.setClient(this);
    args2.setDynamicProperties(connectArgs.getDynamicProperties());
    args = args2;
    onStreamFailure = this._onStreamFailure;
    _var0 = onStreamFailure;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      this.raiseAction(onStreamFailure, args);
    }
    _var1 = connectArgs.getOnStreamFailure();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      return this.raiseAction(connectArgs.getOnStreamFailure(), args);
    }
  };

  /**
  
  	@function raiseSubscribeComplete
  	@param {fm.websync.subscribeArgs} subscribeArgs
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.raiseSubscribeComplete = function() {
    var args, args2, onSubscribeComplete, responseArgs, subscribeArgs, _var0, _var1;
    subscribeArgs = arguments[0];
    responseArgs = arguments[1];
    args2 = new fm.websync.subscribeCompleteArgs();
    args2.setExtensions(fm.websync.client.getExtensions(responseArgs.getResponse(), subscribeArgs));
    args2.setIsResubscribe(subscribeArgs.getIsResubscribe());
    args2.setTimestamp(fm.websync.client.getTimestamp(responseArgs.getResponse()));
    args2.setClient(this);
    args2.setDynamicProperties(subscribeArgs.getDynamicProperties());
    args = args2;
    onSubscribeComplete = this._onSubscribeComplete;
    _var0 = onSubscribeComplete;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      this.raiseAction(onSubscribeComplete, args);
    }
    _var1 = subscribeArgs.getOnComplete();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      return this.raiseAction(subscribeArgs.getOnComplete(), args);
    }
  };

  /**
  
  	@function raiseSubscribeDelivery
  	@param {fm.singleAction} onReceive
  	@param {fm.hash} dynamicProperties
  	@param {fm.websync.message} response
  	@return {void}
  */


  client.prototype.raiseSubscribeDelivery = function() {
    var args, dynamicProperties, onReceive, response, _var0;
    onReceive = arguments[0];
    dynamicProperties = arguments[1];
    response = arguments[2];
    _var0 = onReceive;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      args = new fm.websync.subscribeReceiveArgs(response.getBayeuxChannel(), response.getDataJson());
      args.setExtensions(response.getExtensions());
      args.setTimestamp(fm.websync.client.getTimestamp(response));
      args.setClient(this);
      args.setDynamicProperties(dynamicProperties);
      return this.raiseActionManual(onReceive, args, true);
    }
  };

  /**
  
  	@function raiseSubscribeFailure
  	@param {fm.websync.subscribeArgs} subscribeArgs
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@param {fm.boolean} retry
  	@return {fm.boolean}
  */


  client.prototype.raiseSubscribeFailure = function() {
    var args, args2, onSubscribeFailure, responseArgs, retry, subscribeArgs, _var0, _var1;
    subscribeArgs = arguments[0];
    responseArgs = arguments[1];
    retry = arguments[2];
    args2 = new fm.websync.subscribeFailureArgs();
    args2.__channels = fm.websync.client.getChannelsForSubscribe(responseArgs.getResponse(), subscribeArgs);
    args2.setException(responseArgs.getException());
    args2.setExtensions(fm.websync.client.getExtensions(responseArgs.getResponse(), subscribeArgs));
    args2.setIsResubscribe(subscribeArgs.getIsResubscribe());
    args2.setTimestamp(fm.websync.client.getTimestamp(responseArgs.getResponse()));
    args2.setClient(this);
    args2.setDynamicProperties(subscribeArgs.getDynamicProperties());
    args = args2;
    onSubscribeFailure = this._onSubscribeFailure;
    _var0 = onSubscribeFailure;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      this.raiseAction(onSubscribeFailure, args);
    }
    _var1 = subscribeArgs.getOnFailure();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      retry = this.raiseRetriable(subscribeArgs.getOnFailure(), retry, args);
    }
    return retry;
  };

  /**
  
  	@function raiseSubscribeSuccess
  	@param {fm.websync.subscribeArgs} subscribeArgs
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.raiseSubscribeSuccess = function() {
    var args, args2, onSubscribeSuccess, responseArgs, subscribeArgs, _var0, _var1;
    subscribeArgs = arguments[0];
    responseArgs = arguments[1];
    args2 = new fm.websync.subscribeSuccessArgs();
    args2.__channels = fm.websync.client.getChannelsForSubscribe(responseArgs.getResponse(), subscribeArgs);
    args2.setExtensions(fm.websync.client.getExtensions(responseArgs.getResponse(), subscribeArgs));
    args2.setIsResubscribe(subscribeArgs.getIsResubscribe());
    args2.setTimestamp(fm.websync.client.getTimestamp(responseArgs.getResponse()));
    args2.setClient(this);
    args2.setDynamicProperties(subscribeArgs.getDynamicProperties());
    args = args2;
    onSubscribeSuccess = this._onSubscribeSuccess;
    _var0 = onSubscribeSuccess;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      this.raiseAction(onSubscribeSuccess, args);
    }
    _var1 = subscribeArgs.getOnSuccess();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      return this.raiseAction(subscribeArgs.getOnSuccess(), args);
    }
  };

  /**
  
  	@function raiseUnbindComplete
  	@param {fm.websync.unbindArgs} unbindArgs
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.raiseUnbindComplete = function() {
    var args, args2, onUnbindComplete, responseArgs, unbindArgs, _var0, _var1;
    unbindArgs = arguments[0];
    responseArgs = arguments[1];
    args2 = new fm.websync.unbindCompleteArgs();
    args2.setExtensions(fm.websync.client.getExtensions(responseArgs.getResponse(), unbindArgs));
    args2.setTimestamp(fm.websync.client.getTimestamp(responseArgs.getResponse()));
    args2.setClient(this);
    args2.setDynamicProperties(unbindArgs.getDynamicProperties());
    args = args2;
    onUnbindComplete = this._onUnbindComplete;
    _var0 = onUnbindComplete;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      this.raiseAction(onUnbindComplete, args);
    }
    _var1 = unbindArgs.getOnComplete();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      return this.raiseAction(unbindArgs.getOnComplete(), args);
    }
  };

  /**
  
  	@function raiseUnbindFailure
  	@param {fm.websync.unbindArgs} unbindArgs
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@param {fm.boolean} retry
  	@return {fm.boolean}
  */


  client.prototype.raiseUnbindFailure = function() {
    var args, args2, onUnbindFailure, responseArgs, retry, unbindArgs, _var0, _var1;
    unbindArgs = arguments[0];
    responseArgs = arguments[1];
    retry = arguments[2];
    args2 = new fm.websync.unbindFailureArgs();
    args2.__records = fm.websync.client.getRecordsForUnbind(responseArgs.getResponse(), unbindArgs);
    args2.setException(responseArgs.getException());
    args2.setExtensions(fm.websync.client.getExtensions(responseArgs.getResponse(), unbindArgs));
    args2.setTimestamp(fm.websync.client.getTimestamp(responseArgs.getResponse()));
    args2.setClient(this);
    args2.setDynamicProperties(unbindArgs.getDynamicProperties());
    args = args2;
    onUnbindFailure = this._onUnbindFailure;
    _var0 = onUnbindFailure;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      this.raiseAction(onUnbindFailure, args);
    }
    _var1 = unbindArgs.getOnFailure();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      retry = this.raiseRetriable(unbindArgs.getOnFailure(), retry, args);
    }
    return retry;
  };

  /**
  
  	@function raiseUnbindSuccess
  	@param {fm.websync.unbindArgs} unbindArgs
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.raiseUnbindSuccess = function() {
    var args, args2, onUnbindSuccess, responseArgs, unbindArgs, _var0, _var1;
    unbindArgs = arguments[0];
    responseArgs = arguments[1];
    args2 = new fm.websync.unbindSuccessArgs();
    args2.__records = fm.websync.client.getRecordsForUnbind(responseArgs.getResponse(), unbindArgs);
    args2.setExtensions(fm.websync.client.getExtensions(responseArgs.getResponse(), unbindArgs));
    args2.setTimestamp(fm.websync.client.getTimestamp(responseArgs.getResponse()));
    args2.setClient(this);
    args2.setDynamicProperties(unbindArgs.getDynamicProperties());
    args = args2;
    onUnbindSuccess = this._onUnbindSuccess;
    _var0 = onUnbindSuccess;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      this.raiseAction(onUnbindSuccess, args);
    }
    _var1 = unbindArgs.getOnSuccess();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      return this.raiseAction(unbindArgs.getOnSuccess(), args);
    }
  };

  /**
  
  	@function raiseUnsubscribeComplete
  	@param {fm.websync.unsubscribeArgs} unsubscribeArgs
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.raiseUnsubscribeComplete = function() {
    var args, args2, onUnsubscribeComplete, responseArgs, unsubscribeArgs, _var0, _var1;
    unsubscribeArgs = arguments[0];
    responseArgs = arguments[1];
    args2 = new fm.websync.unsubscribeCompleteArgs();
    args2.setExtensions(fm.websync.client.getExtensions(responseArgs.getResponse(), unsubscribeArgs));
    args2.setTimestamp(fm.websync.client.getTimestamp(responseArgs.getResponse()));
    args2.setClient(this);
    args2.setDynamicProperties(unsubscribeArgs.getDynamicProperties());
    args = args2;
    onUnsubscribeComplete = this._onUnsubscribeComplete;
    _var0 = onUnsubscribeComplete;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      this.raiseAction(onUnsubscribeComplete, args);
    }
    _var1 = unsubscribeArgs.getOnComplete();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      return this.raiseAction(unsubscribeArgs.getOnComplete(), args);
    }
  };

  /**
  
  	@function raiseUnsubscribeFailure
  	@param {fm.websync.unsubscribeArgs} unsubscribeArgs
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@param {fm.boolean} retry
  	@return {fm.boolean}
  */


  client.prototype.raiseUnsubscribeFailure = function() {
    var args, args2, onUnsubscribeFailure, responseArgs, retry, unsubscribeArgs, _var0, _var1;
    unsubscribeArgs = arguments[0];
    responseArgs = arguments[1];
    retry = arguments[2];
    args2 = new fm.websync.unsubscribeFailureArgs();
    args2.__channels = fm.websync.client.getChannelsForUnsubscribe(responseArgs.getResponse(), unsubscribeArgs);
    args2.setException(responseArgs.getException());
    args2.setExtensions(fm.websync.client.getExtensions(responseArgs.getResponse(), unsubscribeArgs));
    args2.setTimestamp(fm.websync.client.getTimestamp(responseArgs.getResponse()));
    args2.setClient(this);
    args2.setDynamicProperties(unsubscribeArgs.getDynamicProperties());
    args = args2;
    onUnsubscribeFailure = this._onUnsubscribeFailure;
    _var0 = onUnsubscribeFailure;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      this.raiseAction(onUnsubscribeFailure, args);
    }
    _var1 = unsubscribeArgs.getOnFailure();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      retry = this.raiseRetriable(unsubscribeArgs.getOnFailure(), retry, args);
    }
    return retry;
  };

  /**
  
  	@function raiseUnsubscribeSuccess
  	@param {fm.websync.unsubscribeArgs} unsubscribeArgs
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.raiseUnsubscribeSuccess = function() {
    var args, args2, onUnsubscribeSuccess, responseArgs, unsubscribeArgs, _var0, _var1;
    unsubscribeArgs = arguments[0];
    responseArgs = arguments[1];
    args2 = new fm.websync.unsubscribeSuccessArgs();
    args2.__channels = fm.websync.client.getChannelsForUnsubscribe(responseArgs.getResponse(), unsubscribeArgs);
    args2.setExtensions(fm.websync.client.getExtensions(responseArgs.getResponse(), unsubscribeArgs));
    args2.setTimestamp(fm.websync.client.getTimestamp(responseArgs.getResponse()));
    args2.setClient(this);
    args2.setDynamicProperties(unsubscribeArgs.getDynamicProperties());
    args = args2;
    onUnsubscribeSuccess = this._onUnsubscribeSuccess;
    _var0 = onUnsubscribeSuccess;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      this.raiseAction(onUnsubscribeSuccess, args);
    }
    _var1 = unsubscribeArgs.getOnSuccess();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      return this.raiseAction(unsubscribeArgs.getOnSuccess(), args);
    }
  };

  /**
  
  	@function receiveMessage
  	@param {fm.websync.message} message
  	@return {void}
  */


  client.prototype.receiveMessage = function() {
    var dictionary, dictionary2, dictionary3, i, list, list2, list3, message, onNotify, onReceive, serverAction, str, str2, _i, _j, _k, _l, _len, _len1, _len2, _len3, _results, _var0, _var1, _var2, _var3, _var4, _var5, _var6, _var7, _var8;
    message = arguments[0];
    if (message.getBayeuxChannel() === "/meta/notify") {
      if (message.getTag() === "fm.server") {
        serverAction = fm.websync.message.fromJson(message.getDataJson());
        return this.processServerAction(serverAction);
      } else {
        onNotify = this._onNotify;
        _var0 = onNotify;
        if (_var0 !== null && typeof _var0 !== 'undefined') {
          return this.raiseNotifyDelivery(onNotify, message);
        }
      }
    } else {
      list = [];
      list2 = [];
      _var1 = fm.hashExtensions.getKeys(this._customOnReceives);
      for (_i = 0, _len = _var1.length; _i < _len; _i++) {
        str = _var1[_i];
        dictionary = this._customOnReceives[str];
        _var2 = fm.hashExtensions.getKeys(dictionary);
        for (_j = 0, _len1 = _var2.length; _j < _len1; _j++) {
          str2 = _var2[_j];
          if (str2 === message.getChannel()) {
            fm.arrayExtensions.add(list, dictionary[str2]);
            fm.arrayExtensions.add(list2, {});
          }
        }
      }
      _var3 = fm.hashExtensions.getKeys(this._subscribedOnReceives);
      for (_k = 0, _len2 = _var3.length; _k < _len2; _k++) {
        str = _var3[_k];
        dictionary2 = this._subscribedOnReceives[str];
        _var4 = fm.hashExtensions.getKeys(dictionary2);
        for (_l = 0, _len3 = _var4.length; _l < _len3; _l++) {
          str2 = _var4[_l];
          if (str2 === message.getChannel()) {
            fm.arrayExtensions.add(list, dictionary2[str2]);
            dictionary3 = null;
            _var5 = new fm.holder(dictionary3);
            _var6 = fm.hashExtensions.tryGetValue(this._subscribedDynamicProperties, fm.websync.client.getSubscribeKey(str2, str), _var5);
            dictionary3 = _var5.getValue();
            if (!_var6) {
              dictionary3 = {};
            }
            fm.arrayExtensions.add(list2, dictionary3);
          }
        }
      }
      if (fm.arrayExtensions.getCount(list) === 0) {
        list3 = null;
        _var7 = new fm.holder(list3);
        _var8 = fm.hashExtensions.tryGetValue(this._pendingReceives, message.getChannel(), _var7);
        list3 = _var7.getValue();
        if (!_var8) {
          list3 = [];
          this._pendingReceives[message.getChannel()] = list3;
        }
        fm.arrayExtensions.add(list3, message);
        return;
      }
      i = 0;
      _results = [];
      while (i < fm.arrayExtensions.getCount(list)) {
        try {
          onReceive = list[i];
          dictionary3 = null;
          if (i < fm.arrayExtensions.getCount(list2)) {
            dictionary3 = list2[i];
          }
          _results.push(this.raiseSubscribeDelivery(onReceive, dictionary3, message));
        } finally {
          i++;
        }
      }
      return _results;
    }
  };

  /**
  
  	@function reconnect
  	@param {fm.websync.connectArgs} connectArgs
  	@return {fm.websync.client}
  */


  client.prototype.reconnect = function() {
    var connectArgs;
    connectArgs = arguments[0];
    this.clearBoundRecords();
    this.clearSubscribedChannels();
    this.setIsConnected(false);
    this._queueActivated = false;
    connectArgs.setIsReconnect(true);
    connectArgs.setLastClientId(this.getClientId());
    connectArgs.setLastSessionId(this.getSessionId());
    this.connect(connectArgs);
    return this;
  };

  /**
  
  	@function removeBoundRecords
  	@param {fm.array} records
  	@return {void}
  */


  client.prototype.removeBoundRecords = function() {
    var record, records, _i, _len, _results, _var0;
    records = arguments[0];
    _var0 = records;
    _results = [];
    for (_i = 0, _len = _var0.length; _i < _len; _i++) {
      record = _var0[_i];
      _results.push(fm.hashExtensions.remove(this._boundRecords, record.getKey()));
    }
    return _results;
  };

  /**
  
  	@function removeOnBindComplete
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnBindComplete = function() {
    var value;
    value = arguments[0];
    return this._onBindComplete = fm.delegate.remove(this._onBindComplete, value);
  };

  /**
  
  	@function removeOnBindFailure
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnBindFailure = function() {
    var value;
    value = arguments[0];
    return this._onBindFailure = fm.delegate.remove(this._onBindFailure, value);
  };

  /**
  
  	@function removeOnBindSuccess
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnBindSuccess = function() {
    var value;
    value = arguments[0];
    return this._onBindSuccess = fm.delegate.remove(this._onBindSuccess, value);
  };

  /**
  
  	@function removeOnConnectComplete
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnConnectComplete = function() {
    var value;
    value = arguments[0];
    return this._onConnectComplete = fm.delegate.remove(this._onConnectComplete, value);
  };

  /**
  
  	@function removeOnConnectFailure
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnConnectFailure = function() {
    var value;
    value = arguments[0];
    return this._onConnectFailure = fm.delegate.remove(this._onConnectFailure, value);
  };

  /**
  
  	@function removeOnConnectSuccess
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnConnectSuccess = function() {
    var value;
    value = arguments[0];
    return this._onConnectSuccess = fm.delegate.remove(this._onConnectSuccess, value);
  };

  /**
  
  	@function removeOnDisconnectComplete
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnDisconnectComplete = function() {
    var value;
    value = arguments[0];
    return this._onDisconnectComplete = fm.delegate.remove(this._onDisconnectComplete, value);
  };

  /**
  
  	@function removeOnNotify
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnNotify = function() {
    var value;
    value = arguments[0];
    return this._onNotify = fm.delegate.remove(this._onNotify, value);
  };

  /**
  
  	@function removeOnNotifyComplete
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnNotifyComplete = function() {
    var value;
    value = arguments[0];
    return this._onNotifyComplete = fm.delegate.remove(this._onNotifyComplete, value);
  };

  /**
  
  	@function removeOnNotifyFailure
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnNotifyFailure = function() {
    var value;
    value = arguments[0];
    return this._onNotifyFailure = fm.delegate.remove(this._onNotifyFailure, value);
  };

  /**
  
  	@function removeOnNotifySuccess
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnNotifySuccess = function() {
    var value;
    value = arguments[0];
    return this._onNotifySuccess = fm.delegate.remove(this._onNotifySuccess, value);
  };

  /**
  
  	@function removeOnPublishComplete
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnPublishComplete = function() {
    var value;
    value = arguments[0];
    return this._onPublishComplete = fm.delegate.remove(this._onPublishComplete, value);
  };

  /**
  
  	@function removeOnPublishFailure
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnPublishFailure = function() {
    var value;
    value = arguments[0];
    return this._onPublishFailure = fm.delegate.remove(this._onPublishFailure, value);
  };

  /**
  
  	@function removeOnPublishSuccess
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnPublishSuccess = function() {
    var value;
    value = arguments[0];
    return this._onPublishSuccess = fm.delegate.remove(this._onPublishSuccess, value);
  };

  /**
  
  	@function removeOnServerBind
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnServerBind = function() {
    var value;
    value = arguments[0];
    return this._onServerBind = fm.delegate.remove(this._onServerBind, value);
  };

  /**
  
  	@function removeOnServerSubscribe
  	@param {fm.singleFunction} value
  	@return {void}
  */


  client.prototype.removeOnServerSubscribe = function() {
    var value;
    value = arguments[0];
    return this._onServerSubscribe = fm.delegate.remove(this._onServerSubscribe, value);
  };

  /**
  
  	@function removeOnServerUnbind
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnServerUnbind = function() {
    var value;
    value = arguments[0];
    return this._onServerUnbind = fm.delegate.remove(this._onServerUnbind, value);
  };

  /**
  
  	@function removeOnServerUnsubscribe
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnServerUnsubscribe = function() {
    var value;
    value = arguments[0];
    return this._onServerUnsubscribe = fm.delegate.remove(this._onServerUnsubscribe, value);
  };

  /**
  
  	@function removeOnServiceComplete
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnServiceComplete = function() {
    var value;
    value = arguments[0];
    return this._onServiceComplete = fm.delegate.remove(this._onServiceComplete, value);
  };

  /**
  
  	@function removeOnServiceFailure
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnServiceFailure = function() {
    var value;
    value = arguments[0];
    return this._onServiceFailure = fm.delegate.remove(this._onServiceFailure, value);
  };

  /**
  
  	@function removeOnServiceSuccess
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnServiceSuccess = function() {
    var value;
    value = arguments[0];
    return this._onServiceSuccess = fm.delegate.remove(this._onServiceSuccess, value);
  };

  /**
  
  	@function removeOnStreamFailure
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnStreamFailure = function() {
    var value;
    value = arguments[0];
    return this._onStreamFailure = fm.delegate.remove(this._onStreamFailure, value);
  };

  /**
  
  	@function removeOnSubscribeComplete
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnSubscribeComplete = function() {
    var value;
    value = arguments[0];
    return this._onSubscribeComplete = fm.delegate.remove(this._onSubscribeComplete, value);
  };

  /**
  
  	@function removeOnSubscribeFailure
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnSubscribeFailure = function() {
    var value;
    value = arguments[0];
    return this._onSubscribeFailure = fm.delegate.remove(this._onSubscribeFailure, value);
  };

  /**
  
  	@function removeOnSubscribeSuccess
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnSubscribeSuccess = function() {
    var value;
    value = arguments[0];
    return this._onSubscribeSuccess = fm.delegate.remove(this._onSubscribeSuccess, value);
  };

  /**
  
  	@function removeOnUnbindComplete
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnUnbindComplete = function() {
    var value;
    value = arguments[0];
    return this._onUnbindComplete = fm.delegate.remove(this._onUnbindComplete, value);
  };

  /**
  
  	@function removeOnUnbindFailure
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnUnbindFailure = function() {
    var value;
    value = arguments[0];
    return this._onUnbindFailure = fm.delegate.remove(this._onUnbindFailure, value);
  };

  /**
  
  	@function removeOnUnbindSuccess
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnUnbindSuccess = function() {
    var value;
    value = arguments[0];
    return this._onUnbindSuccess = fm.delegate.remove(this._onUnbindSuccess, value);
  };

  /**
  
  	@function removeOnUnsubscribeComplete
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnUnsubscribeComplete = function() {
    var value;
    value = arguments[0];
    return this._onUnsubscribeComplete = fm.delegate.remove(this._onUnsubscribeComplete, value);
  };

  /**
  
  	@function removeOnUnsubscribeFailure
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnUnsubscribeFailure = function() {
    var value;
    value = arguments[0];
    return this._onUnsubscribeFailure = fm.delegate.remove(this._onUnsubscribeFailure, value);
  };

  /**
  
  	@function removeOnUnsubscribeSuccess
  	@param {fm.singleAction} value
  	@return {void}
  */


  client.prototype.removeOnUnsubscribeSuccess = function() {
    var value;
    value = arguments[0];
    return this._onUnsubscribeSuccess = fm.delegate.remove(this._onUnsubscribeSuccess, value);
  };

  /**
  
  	@function removeSubscribedChannels
  	@param {fm.string} tag
  	@param {fm.array} channels
  	@return {void}
  */


  client.prototype.removeSubscribedChannels = function() {
    var channels, list, str, tag, _i, _len, _var0, _var1, _var2;
    tag = arguments[0];
    channels = arguments[1];
    list = null;
    _var0 = new fm.holder(list);
    _var1 = fm.hashExtensions.tryGetValue(this._subscribedChannels, tag, _var0);
    list = _var0.getValue();
    if (_var1) {
      _var2 = channels;
      for (_i = 0, _len = _var2.length; _i < _len; _i++) {
        str = _var2[_i];
        fm.arrayExtensions.remove(list, str);
      }
      if (fm.arrayExtensions.getCount(list) === 0) {
        return fm.hashExtensions.remove(this._subscribedChannels, tag);
      }
    }
  };

  /**
  
  	@function removeSubscribedOnReceive
  	@param {fm.string} tag
  	@param {fm.array} channels
  	@return {void}
  */


  client.prototype.removeSubscribedOnReceive = function() {
    var channels, dictionary, str, tag, _i, _len, _var0, _var1, _var2;
    tag = arguments[0];
    channels = arguments[1];
    dictionary = null;
    _var0 = new fm.holder(dictionary);
    _var1 = fm.hashExtensions.tryGetValue(this._subscribedOnReceives, tag, _var0);
    dictionary = _var0.getValue();
    if (_var1) {
      _var2 = channels;
      for (_i = 0, _len = _var2.length; _i < _len; _i++) {
        str = _var2[_i];
        fm.hashExtensions.remove(dictionary, str);
        fm.hashExtensions.remove(this._subscribedDynamicProperties, fm.websync.client.getSubscribeKey(str, tag));
      }
      if (fm.hashExtensions.getCount(dictionary) === 0) {
        return fm.hashExtensions.remove(this._subscribedOnReceives, tag);
      }
    }
  };

  /**
  
  	@function restream
  	@param {fm.websync.connectArgs} connectArgs
  	@param {fm.boolean} receivedMessages
  	@return {void}
  */


  client.prototype.restream = function() {
    var connectArgs, receivedMessages, state;
    connectArgs = arguments[0];
    receivedMessages = arguments[1];
    if ((this.getConcurrencyMode() === fm.websync.concurrencyMode.Low) && (this._lastInterval > 0)) {
      state = new fm.websync.deferredStreamState();
      state.setConnectArgs(connectArgs);
      state.setReceivedMessages(receivedMessages);
      return fm.deferrer.defer(this.streamDeferred, this._lastInterval, state);
    } else {
      return this.stream(connectArgs, receivedMessages);
    }
  };

  /**
  
  	@function retryConnect
  	@param {fm.websync.connectArgs} connectArgs
  	@param {fm.int} backoffTimeout
  	@return {void}
  */


  client.prototype.retryConnect = function() {
    var backoffTimeout, connectArgs;
    connectArgs = arguments[0];
    backoffTimeout = arguments[1];
    this._lastBackoffIndex++;
    this._lastBackoffTimeout = backoffTimeout;
    connectArgs.setIsRetry(true);
    return this.connect(connectArgs);
  };

  /**
  
  	@function retryConnectDeferred
  	@param {fm.object} s
  	@return {void}
  */


  client.prototype.retryConnectDeferred = function() {
    var s, state;
    s = arguments[0];
    state = s;
    return this.retryConnect(state.getConnectArgs(), state.getBackoffTimeout());
  };

  /**
  
  	@function send
  	@param {fm.websync.clientRequest} request
  	@param {fm.string} url
  	@param {fm.boolean} synchronous
  	@return {void}
  */


  client.prototype.send = function() {
    var request, synchronous, url;
    request = arguments[0];
    url = arguments[1];
    synchronous = arguments[2];
    return this.sendMany([request], url, synchronous);
  };

  /**
  
  	@function sendCallback
  	@param {fm.websync.messageResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.sendCallback = function() {
    var advice, args2, dynamicValue, list, longPolling, message, message2, p, request, responseArgs, serverActions, _i, _j, _len, _len1, _results, _var0, _var1, _var2, _var3, _var4, _var5, _var6, _var7, _var8, _var9;
    responseArgs = arguments[0];
    dynamicValue = responseArgs.getRequestArgs().getDynamicValue(fm.websync.client._stateKey);
    _var0 = responseArgs.getException();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      return this.raiseSendException(dynamicValue, responseArgs.getException());
    } else {
      _var1 = responseArgs.getMessages();
      if ((_var1 === null || typeof _var1 === 'undefined') || (responseArgs.getMessages().length === 0)) {
        return this.raiseSendException(dynamicValue, new Error("Invalid response received from server."));
      } else {
        list = [];
        _var2 = responseArgs.getMessages();
        for (_i = 0, _len = _var2.length; _i < _len; _i++) {
          message = _var2[_i];
          advice = message.getAdvice();
          _var3 = advice;
          if (_var3 !== null && typeof _var3 !== 'undefined') {
            this.processAdvice(advice);
            longPolling = advice.getLongPolling();
            _var4 = longPolling;
            if (_var4 !== null && typeof _var4 !== 'undefined') {
              this.processAdvice(longPolling);
            }
          }
          if (!dynamicValue.getIsStream() || (message.getBayeuxChannel() === "/meta/connect")) {
            if (fm.stringExtensions.isNullOrEmpty(message.getId())) {
              this.raiseSendException(dynamicValue, new Error(message.getError()));
              return;
            }
            request = null;
            _var5 = new fm.holder(request);
            _var6 = fm.hashExtensions.tryGetValue(dynamicValue.getRequestMapping(), message.getId(), _var5);
            request = _var5.getValue();
            if (!_var6) {
              this.raiseSendException(dynamicValue, new Error(message.getError()));
              return;
            }
            p = new fm.websync.clientResponseArgs(request.getDynamicProperties());
            p.setResponse(message);
            p.setException((message.getSuccessful() ? null : new Error(message.getError())));
            request.getCallback()(p);
          } else {
            fm.arrayExtensions.add(list, message);
          }
        }
        if (fm.arrayExtensions.getCount(list) > 0) {
          args2 = new fm.websync.clientResponseArgs(dynamicValue.getRequests()[0].getDynamicProperties());
          args2.setResponses(fm.arrayExtensions.toArray(list));
          dynamicValue.getRequests()[0].getCallback()(args2);
        }
        _var7 = responseArgs.getMessages();
        _results = [];
        for (_j = 0, _len1 = _var7.length; _j < _len1; _j++) {
          message = _var7[_j];
          serverActions = message.getServerActions();
          _var8 = serverActions;
          if (_var8 !== null && typeof _var8 !== 'undefined') {
            _var9 = serverActions;
            _results.push((function() {
              var _k, _len2, _results1;
              _results1 = [];
              for (_k = 0, _len2 = _var9.length; _k < _len2; _k++) {
                message2 = _var9[_k];
                _results1.push(this.processServerAction(message2));
              }
              return _results1;
            }).call(this));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    }
  };

  /**
  
  	@function sendMany
  	@param {fm.array} requests
  	@param {fm.string} url
  	@param {fm.boolean} synchronous
  	@return {void}
  */


  client.prototype.sendMany = function() {
    var args3, dictionary, flag, list, num, request, requestArgs, requests, responseArgs, state, synchronous, transfer, url, _i, _len, _var0, _var1, _var2, _var3;
    requests = arguments[0];
    url = arguments[1];
    synchronous = arguments[2];
    flag = false;
    if (requests.length === 1) {
      flag = requests[0].getMessage().getBayeuxChannel() === "/meta/connect";
    }
    dictionary = {};
    list = [];
    _var0 = requests;
    for (_i = 0, _len = _var0.length; _i < _len; _i++) {
      request = _var0[_i];
      _var1 = this.getClientId();
      if (!(!(_var1 === null ? _var1 !== fm.guid.empty : !_var1.equals(fm.guid.empty)) || request.getMessage().isConnect())) {
        request.getMessage().setClientId(this.getClientId());
        request.getMessage().setSessionId(this.getSessionId());
      }
      if (this.getDisableBinary()) {
        request.getMessage().setDisableBinary(this.getDisableBinary());
      }
      _var2 = new fm.holder(this._counter);
      _var3 = fm.interlocked.increment(_var2);
      this._counter = _var2.getValue();
      request.getMessage().setId(fm.intExtensions.toString(_var3));
      fm.arrayExtensions.add(list, request.getMessage());
      dictionary[request.getMessage().getId()] = request;
    }
    url = this.processRequestUrl(url);
    num = (flag ? this.getStreamRequestTimeout() : this.getRequestTimeout());
    transfer = (flag ? this._streamRequestTransfer : this._requestTransfer);
    args3 = new fm.websync.messageRequestArgs(this.createHeaders());
    args3.setMessages(fm.arrayExtensions.toArray(list));
    args3.setOnRequestCreated(this.internalOnRequestCreated);
    args3.setOnResponseReceived(this.internalOnResponseReceived);
    args3.setOnHttpRequestCreated(this.internalOnHttpRequestCreated);
    args3.setOnHttpResponseReceived(this.internalOnHttpResponseReceived);
    args3.setSender(this);
    args3.setTimeout(num);
    args3.setUrl(url);
    requestArgs = args3;
    state = new fm.websync.clientSendState();
    state.setRequests(requests);
    state.setRequestMapping(dictionary);
    state.setIsStream(flag);
    requestArgs.setDynamicValue(fm.websync.client._stateKey, state);
    if (synchronous) {
      responseArgs = transfer.send(requestArgs);
      return this.sendCallback(responseArgs);
    } else {
      return transfer.sendAsync(requestArgs, this.sendCallback);
    }
  };

  /**
  	 <div>
  	 Services data to a specified channel.
  	 </div><div>
  	 <p>
  	 Servicing allows the client to send data to the server in a traditional
  	 request/response fashion. Data is not broadcast and the state of the
  	 client remains unchanged after service calls.
  	 </p>
  	 <p>
  	 When the service completes successfully, the OnSuccess callback
  	 will be invoked, passing in the
  	 channel and serviced data, <b>including any modifications made on the server</b>.
  	 </p>
  	 </div><param name="serviceArgs">The service arguments.
  	 See <see cref="fm.websync.serviceArgs">fm.websync.serviceArgs</see> for more details.</param><returns>The client.</returns>
  
  	@function service
  	@param {fm.websync.serviceArgs} serviceArgs
  	@return {fm.websync.client}
  */


  client.prototype.service = function() {
    var serviceArgs;
    serviceArgs = arguments[0];
    if (fm.stringExtensions.isNullOrEmpty(serviceArgs.getChannel())) {
      throw new Error("Please specify the channel to which the data should be serviced.");
    }
    if (fm.stringExtensions.isNullOrEmpty(serviceArgs.getDataJson())) {
      throw new Error("Please specify the data to send.");
    }
    this.performService(serviceArgs);
    return this;
  };

  /**
  	 <div>
  	 Sets the server-generated WebSync client ID. This value is only set if the client is
  	 connected, so reference it only after successfully connecting the client.
  	 </div>
  
  	@function setClientId
  	@param {fm.guid} value
  	@return {void}
  */


  client.prototype.setClientId = function() {
    var value;
    value = arguments[0];
    return this._clientId = value;
  };

  /**
  	 <div>
  	 Sets a callback to be invoked whenever messages are received on the specified
  	 channel.
  	 </div><div>
  	 <p>
  	 This method does <b>not</b> subscribe you to a channel. Rather, it caches a
  	 callback to be executed when messages are received on a particular
  	 channel.
  	 </p>
  	 </div><param name="channel">The channel over which the messages will be received.</param><param name="onReceive">The callback to invoke when a message is received.</param>
  
  	@function setCustomOnReceive
  	@param {fm.string} channel
  	@param {fm.singleAction} onReceive
  	@return {void}
  */


  client.prototype.setCustomOnReceive = function() {
    var channel, onReceive;
    channel = arguments[0];
    onReceive = arguments[1];
    return this.setCustomOnReceiveWithTag(channel, fm.stringExtensions.empty, onReceive);
  };

  /**
  	 <div>
  	 Sets a callback to be invoked whenever messages are received on the specified
  	 channel. The tag allows multiple callbacks to be registered for
  	 the same channel.
  	 </div><div>
  	 <p>
  	 This method does <b>not</b> subscribe you to a channel. Rather, it caches a
  	 callback to be executed when messages are received on a particular
  	 channel.
  	 </p>
  	 </div><param name="channel">The channel over which the messages will be received.</param><param name="tag">The identifier for this callback.</param><param name="onReceive">The callback to invoke when a message is received.</param>
  
  	@function setCustomOnReceiveWithTag
  	@param {fm.string} channel
  	@param {fm.string} tag
  	@param {fm.singleAction} onReceive
  	@return {void}
  */


  client.prototype.setCustomOnReceiveWithTag = function() {
    var channel, dictionary, onReceive, tag, _var0, _var1, _var2, _var3, _var4;
    channel = arguments[0];
    tag = arguments[1];
    onReceive = arguments[2];
    _var0 = channel;
    if (_var0 === null || typeof _var0 === 'undefined') {
      throw new Error("channel");
    }
    _var1 = onReceive;
    if (_var1 === null || typeof _var1 === 'undefined') {
      throw new Error("onReceive");
    }
    _var2 = tag;
    if (_var2 === null || typeof _var2 === 'undefined') {
      tag = fm.stringExtensions.empty;
    }
    dictionary = null;
    _var3 = new fm.holder(dictionary);
    _var4 = fm.hashExtensions.tryGetValue(this._customOnReceives, tag, _var3);
    dictionary = _var3.getValue();
    if (!_var4) {
      dictionary = {};
      this._customOnReceives[tag] = dictionary;
    }
    dictionary[channel] = onReceive;
    return this.processPendingReceives([channel]);
  };

  /**
  	 <div>
  	 Sets whether to disable WebSocket protocol support and use long-polling,
  	 even if the server is capable of accepting WebSocket requests.
  	 </div>
  
  	@function setDisableWebSockets
  	@param {fm.boolean} value
  	@return {void}
  */


  client.prototype.setDisableWebSockets = function() {
    var value;
    value = arguments[0];
    return this._disableWebSockets = value;
  };

  /**
  	 <div>
  	 Sets whether the client is currently connected.
  	 </div>
  
  	@function setIsConnected
  	@param {fm.boolean} value
  	@return {void}
  */


  client.prototype.setIsConnected = function() {
    var value;
    value = arguments[0];
    return this._isConnected = value;
  };

  /**
  	 <div>
  	 Sets whether the client is currently connecting.
  	 </div>
  
  	@function setIsConnecting
  	@param {fm.boolean} value
  	@return {void}
  */


  client.prototype.setIsConnecting = function() {
    var value;
    value = arguments[0];
    return this._isConnecting = value;
  };

  /**
  	 <div>
  	 Sets whether the client is currently disconnecting.
  	 </div>
  
  	@function setIsDisconnecting
  	@param {fm.boolean} value
  	@return {void}
  */


  client.prototype.setIsDisconnecting = function() {
    var value;
    value = arguments[0];
    return this._isDisconnecting = value;
  };

  /**
  	 <div>
  	 Sets the number of milliseconds before the server takes action to discover
  	 if this client is idling or still active.
  	 </div>
  
  	@function setServerTimeout
  	@param {fm.int} value
  	@return {void}
  */


  client.prototype.setServerTimeout = function() {
    var value;
    value = arguments[0];
    return this._serverTimeout = value;
  };

  /**
  	 <div>
  	 Sets the server-generated WebSync session ID. This value is only set if the client is
  	 connected.
  	 </div>
  
  	@function setSessionId
  	@param {fm.guid} value
  	@return {void}
  */


  client.prototype.setSessionId = function() {
    var value;
    value = arguments[0];
    return this._sessionId = value;
  };

  /**
  	 <div>
  	 Sets the absolute URL of the WebSync request handler for streaming connections, typically
  	 ending with websync.ashx.
  	 </div>
  
  	@function setStreamRequestUrl
  	@param {fm.string} value
  	@return {void}
  */


  client.prototype.setStreamRequestUrl = function() {
    var value;
    value = arguments[0];
    return this._streamRequestUrl = value;
  };

  /**
  	 <div>
  	 Sets whether or not to execute client methods synchronously. This approach is not
  	 recommended for UI threads, as it will block until the request completes.
  	 Defaults to <c>false</c>.
  	 </div>
  
  	@function setSynchronous
  	@param {fm.nullable} value
  	@return {void}
  */


  client.prototype.setSynchronous = function() {
    var value;
    value = arguments[0];
    return this._synchronous = value;
  };

  /**
  	 <div>
  	 Sets the token sent with each request for load balancing purposes.
  	 </div>
  
  	@function setToken
  	@param {fm.string} value
  	@return {void}
  */


  client.prototype.setToken = function() {
    var value;
    value = arguments[0];
    return this._token = value;
  };

  /**
  	 <div>
  	 Flags the start of a batch of requests to be sent together to the server.
  	 </div><div>
  	 This is used in conjunction with <see cref="fm.websync.client.endBatch">fm.websync.client.endBatch</see>, which flags
  	 the end of a batch of requests and starts sending them to the server. Batching
  	 is used to optimize round-trips to the server by reducing the overhead
  	 associated with creating multiple HTTP requests.
  	 </div><returns>The client.</returns>
  
  	@function startBatch
  	@return {fm.websync.client}
  */


  client.prototype.startBatch = function() {
    this._batchCounter++;
    return this;
  };

  /**
  
  	@function stream
  	@param {fm.websync.connectArgs} connectArgs
  	@param {fm.boolean} receivedMessages
  	@return {void}
  */


  client.prototype.stream = function() {
    var connectArgs, message, receivedMessages, request, request2;
    connectArgs = arguments[0];
    receivedMessages = arguments[1];
    request2 = new fm.websync.clientRequest();
    message = new fm.websync.message("/meta/connect");
    message.setConnectionType(this._connectionType);
    message.setAcknowledgement(receivedMessages);
    request2.setMessage(message);
    request2.setCallback(this.streamCallback);
    request = request2;
    request.setDynamicValue(fm.websync.client._argsKey, connectArgs);
    return this.send(request, this.getStreamRequestUrl(), false);
  };

  /**
  
  	@function streamCallback
  	@param {fm.websync.clientResponseArgs} responseArgs
  	@return {void}
  */


  client.prototype.streamCallback = function() {
    var dynamicValue, message, responseArgs, threadId, _i, _len, _var0, _var1, _var2;
    responseArgs = arguments[0];
    dynamicValue = responseArgs.getDynamicValue(fm.websync.client._argsKey);
    if ((this.getIsConnected() && !this.getIsConnecting()) && !this.getIsDisconnecting()) {
      _var0 = responseArgs.getException();
      if (_var0 !== null && typeof _var0 !== 'undefined') {
        _var1 = responseArgs.getResponses();
        if (_var1 !== null && typeof _var1 !== 'undefined') {
          if ((this._lastReconnect !== null) && (this._lastReconnect === fm.websync.reconnect.Retry)) {
            return this.restream(dynamicValue, false);
          } else {
            this.raiseStreamFailure(dynamicValue, responseArgs);
            return this.reconnect(dynamicValue);
          }
        } else {
          this.raiseStreamFailure(dynamicValue, responseArgs);
          return this.reconnect(dynamicValue);
        }
      } else {
        if ((responseArgs.getResponses().length === 1) && (responseArgs.getResponses()[0].getBayeuxChannel() === "/meta/connect")) {
          return this.restream(dynamicValue, false);
        } else {
          threadId = this.getThreadId();
          this.preRaise(threadId);
          try {
            _var2 = responseArgs.getResponses();
            for (_i = 0, _len = _var2.length; _i < _len; _i++) {
              message = _var2[_i];
              this.receiveMessage(message);
            }
          } finally {
            this.postRaise(threadId);
          }
          return this.restream(dynamicValue, true);
        }
      }
    }
  };

  /**
  
  	@function streamDeferred
  	@param {fm.object} s
  	@return {void}
  */


  client.prototype.streamDeferred = function() {
    var s, state;
    s = arguments[0];
    state = s;
    return this.stream(state.getConnectArgs(), state.getReceivedMessages());
  };

  /**
  	 <div>
  	 Subscribes the client to receive messages on one or more channels.
  	 </div><div>
  	 When the subscribe completes successfully, the OnSuccess callback
  	 will be invoked, passing in the subscribed
  	 channel(s), <b>including any modifications made on the server</b>.
  	 </div><param name="subscribeArgs">The subscribe arguments.
  	 See <see cref="fm.websync.subscribeArgs">fm.websync.subscribeArgs</see> for details.</param><returns>The client.</returns>
  
  	@function subscribe
  	@param {fm.websync.subscribeArgs} subscribeArgs
  	@return {fm.websync.client}
  */


  client.prototype.subscribe = function() {
    var subscribeArgs, _var0, _var1, _var2;
    subscribeArgs = arguments[0];
    _var0 = subscribeArgs.getChannels();
    if ((_var0 === null || typeof _var0 === 'undefined') || (subscribeArgs.getChannels().length === 0)) {
      throw new Error("Please specify the channel(s) to subscribe.");
    }
    _var1 = subscribeArgs.getOnReceive();
    if (_var1 === null || typeof _var1 === 'undefined') {
      throw new Error("Please specify an on-receive callback.");
    }
    _var2 = subscribeArgs.getTag();
    if (_var2 === null || typeof _var2 === 'undefined') {
      subscribeArgs.setTag(fm.stringExtensions.empty);
    }
    this.performSubscribe(subscribeArgs);
    return this;
  };

  /**
  	 <div>
  	 Unbinds the client from a public or private data record so it is no longer visible
  	 by other clients or the server.
  	 </div><div>
  	 When the unbind completes successfully, the OnSuccess callback
  	 will be invoked, passing in the unbound
  	 record(s), <b>including any modifications made on the server</b>.
  	 </div><param name="unbindArgs">The unbind arguments.
  	 See <see cref="fm.websync.unbindArgs">fm.websync.unbindArgs</see> for details.</param><returns>The client.</returns>
  
  	@function unbind
  	@param {fm.websync.unbindArgs} unbindArgs
  	@return {fm.websync.client}
  */


  client.prototype.unbind = function() {
    var record, unbindArgs, _i, _len, _var0, _var1, _var2;
    unbindArgs = arguments[0];
    _var0 = unbindArgs.getRecords();
    if ((_var0 === null || typeof _var0 === 'undefined') || (unbindArgs.getRecords().length === 0)) {
      throw new Error("Please specify the record(s) to unbind.");
    }
    _var1 = unbindArgs.getRecords();
    for (_i = 0, _len = _var1.length; _i < _len; _i++) {
      record = _var1[_i];
      _var2 = record.getKey();
      if (_var2 === null || typeof _var2 === 'undefined') {
        throw new Error("Each record must specify a key.");
      }
    }
    this.performUnbind(unbindArgs);
    return this;
  };

  /**
  	 <div>
  	 Unsets a callback invoked whenever messages are received on the specified
  	 channel.
  	 </div><div>
  	 <p>
  	 This method does <b>not</b> unsubscribe you from a channel. Rather, it stop the
  	 callback from executing when messages are received on a particular
  	 channel.
  	 </p>
  	 </div><param name="channel">The channel over which the messages are being received.</param><returns>
  	 <c>true</c> if the callback was previously set; otherwise, <c>false</c>.</returns>
  
  	@function unsetCustomOnReceive
  	@param {fm.string} channel
  	@return {fm.boolean}
  */


  client.prototype.unsetCustomOnReceive = function() {
    var channel;
    channel = arguments[0];
    return this.unsetCustomOnReceiveWithTag(channel, fm.stringExtensions.empty);
  };

  /**
  	 <div>
  	 Unsets a callback invoked whenever messages are received on the specified
  	 channel.  The tag denotes a specific callback.
  	 </div><div>
  	 <p>
  	 This method does <b>not</b> unsubscribe you from a channel. Rather, it stop the
  	 callback from executing when messages are received on a particular
  	 channel.
  	 </p>
  	 </div><param name="channel">The channel over which the messages are being received.</param><param name="tag">The identifier for this callback.</param><returns>
  	 <c>true</c> if the callback was previously set; otherwise, <c>false</c>.</returns>
  
  	@function unsetCustomOnReceiveWithTag
  	@param {fm.string} channel
  	@param {fm.string} tag
  	@return {fm.boolean}
  */


  client.prototype.unsetCustomOnReceiveWithTag = function() {
    var channel, dictionary, tag, _var0, _var1, _var2, _var3;
    channel = arguments[0];
    tag = arguments[1];
    _var0 = channel;
    if (_var0 === null || typeof _var0 === 'undefined') {
      throw new Error("channel");
    }
    _var1 = tag;
    if (_var1 === null || typeof _var1 === 'undefined') {
      tag = fm.stringExtensions.empty;
    }
    dictionary = null;
    _var2 = new fm.holder(dictionary);
    _var3 = fm.hashExtensions.tryGetValue(this._customOnReceives, tag, _var2);
    dictionary = _var2.getValue();
    if (_var3) {
      if (fm.hashExtensions.remove(dictionary, channel)) {
        if (fm.hashExtensions.getCount(dictionary) === 0) {
          fm.hashExtensions.remove(this._customOnReceives, tag);
        }
        return true;
      }
      return false;
    }
    return false;
  };

  /**
  	 <div>
  	 Unsubscribes the client from receiving messages on one or more channels.
  	 </div><div>
  	 When the unsubscribe completes successfully, the OnSuccess callback
  	 will be invoked, passing in the
  	 unsubscribed channel(s), <b>including any modifications made on the server</b>.
  	 </div><param name="unsubscribeArgs">The unsubscribe arguments.
  	 See <see cref="fm.websync.unsubscribeArgs">fm.websync.unsubscribeArgs</see> for details.</param><returns>The client.</returns>
  
  	@function unsubscribe
  	@param {fm.websync.unsubscribeArgs} unsubscribeArgs
  	@return {fm.websync.client}
  */


  client.prototype.unsubscribe = function() {
    var unsubscribeArgs, _var0, _var1;
    unsubscribeArgs = arguments[0];
    _var0 = unsubscribeArgs.getChannels();
    if ((_var0 === null || typeof _var0 === 'undefined') || (unsubscribeArgs.getChannels().length === 0)) {
      throw new Error("Please specify the channel(s) to unsubscribe.");
    }
    _var1 = unsubscribeArgs.getTag();
    if (_var1 === null || typeof _var1 === 'undefined') {
      unsubscribeArgs.setTag(fm.stringExtensions.empty);
    }
    this.performUnsubscribe(unsubscribeArgs);
    return this;
  };

  /**
  
  	@function webSocketOpenFailure
  	@param {fm.websync.socketOpenFailureArgs} e
  	@return {void}
  */


  client.prototype.webSocketOpenFailure = function() {
    var e;
    e = arguments[0];
    this._connectionType = fm.websync.connectionType.LongPolling;
    this._streamRequestTransfer = fm.websync.messageTransferFactory.getHttpMessageTransfer();
    return this.activateStream(this._connectArgs, this._responseArgs);
  };

  /**
  
  	@function webSocketOpenSuccess
  	@param {fm.websync.socketOpenSuccessArgs} e
  	@return {void}
  */


  client.prototype.webSocketOpenSuccess = function() {
    var e;
    e = arguments[0];
    return this.activateStream(this._connectArgs, this._responseArgs);
  };

  /**
  
  	@function webSocketStreamFailure
  	@param {fm.websync.socketStreamFailureArgs} e
  	@return {void}
  */


  client.prototype.webSocketStreamFailure = function() {
    var e, responseArgs;
    e = arguments[0];
    responseArgs = new fm.websync.clientResponseArgs(this._responseArgs.getDynamicProperties());
    responseArgs.setException(new Error(fm.stringExtensions.format("WebSocket stream error. {0}", e.getException().message)));
    return this.streamCallback(responseArgs);
  };

  client._supportedConnectionTypes = [fm.websync.connectionType.WebSocket, fm.websync.connectionType.LongPolling];

  client._argsKey = "fm.args";

  client._stateKey = "fm.state";

  client._requestUrlCache = {};

  client._requestUrlCacheLock = new fm.object();

  return client;

}).call(this, fm.websync.baseClient);


/**
@class fm.websync.clientSendState
 <div>
 The internal state of a client request batch sent to the server.
 </div>

@extends fm.object
*/


fm.websync.clientSendState = (function(_super) {

  __extends(clientSendState, _super);

  /**
  	@ignore 
  	@description
  */


  clientSendState.prototype._isStream = false;

  /**
  	@ignore 
  	@description
  */


  clientSendState.prototype._requestMapping = null;

  /**
  	@ignore 
  	@description
  */


  clientSendState.prototype._requests = null;

  /**
  	@ignore 
  	@description
  */


  function clientSendState() {
    this.setRequests = __bind(this.setRequests, this);

    this.setRequestMapping = __bind(this.setRequestMapping, this);

    this.setIsStream = __bind(this.setIsStream, this);

    this.getRequests = __bind(this.getRequests, this);

    this.getRequestMapping = __bind(this.getRequestMapping, this);

    this.getIsStream = __bind(this.getIsStream, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientSendState.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientSendState.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets whether this is a streaming request.
  	 </div>
  
  	@function getIsStream
  	@return {fm.boolean}
  */


  clientSendState.prototype.getIsStream = function() {
    return this._isStream;
  };

  /**
  	 <div>
  	 Gets the mapping of request IDs to requests.
  	 </div>
  
  	@function getRequestMapping
  	@return {fm.hash}
  */


  clientSendState.prototype.getRequestMapping = function() {
    return this._requestMapping;
  };

  /**
  	 <div>
  	 Gets the requests to be sent to the server.
  	 </div>
  
  	@function getRequests
  	@return {fm.array}
  */


  clientSendState.prototype.getRequests = function() {
    return this._requests;
  };

  /**
  	 <div>
  	 Sets whether this is a streaming request.
  	 </div>
  
  	@function setIsStream
  	@param {fm.boolean} value
  	@return {void}
  */


  clientSendState.prototype.setIsStream = function() {
    var value;
    value = arguments[0];
    return this._isStream = value;
  };

  /**
  	 <div>
  	 Sets the mapping of request IDs to requests.
  	 </div>
  
  	@function setRequestMapping
  	@param {fm.hash} value
  	@return {void}
  */


  clientSendState.prototype.setRequestMapping = function() {
    var value;
    value = arguments[0];
    return this._requestMapping = value;
  };

  /**
  	 <div>
  	 Sets the requests to be sent to the server.
  	 </div>
  
  	@function setRequests
  	@param {fm.array} value
  	@return {void}
  */


  clientSendState.prototype.setRequests = function() {
    var value;
    value = arguments[0];
    return this._requests = value;
  };

  return clientSendState;

})(fm.object);


/**
@class fm.websync.clientRequest
 <div>
 Internal class used to hold details about a client request queued for
 delivery to the server.
 </div>

@extends fm.dynamic
*/


fm.websync.clientRequest = (function(_super) {

  __extends(clientRequest, _super);

  /**
  	@ignore 
  	@description
  */


  clientRequest.prototype._callback = null;

  /**
  	@ignore 
  	@description
  */


  clientRequest.prototype._message = null;

  /**
  	@ignore 
  	@description
  */


  function clientRequest() {
    this.setMessage = __bind(this.setMessage, this);

    this.setCallback = __bind(this.setCallback, this);

    this.getMessage = __bind(this.getMessage, this);

    this.getCallback = __bind(this.getCallback, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      clientRequest.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    clientRequest.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the callback to invoke after receiving a response from the server.
  	 </div>
  
  	@function getCallback
  	@return {fm.singleAction}
  */


  clientRequest.prototype.getCallback = function() {
    return this._callback;
  };

  /**
  	 <div>
  	 Gets the request the client wishes to send to the server.
  	 </div>
  
  	@function getMessage
  	@return {fm.websync.message}
  */


  clientRequest.prototype.getMessage = function() {
    return this._message;
  };

  /**
  	 <div>
  	 Sets the callback to invoke after receiving a response from the server.
  	 </div>
  
  	@function setCallback
  	@param {fm.singleAction} value
  	@return {void}
  */


  clientRequest.prototype.setCallback = function() {
    var value;
    value = arguments[0];
    return this._callback = value;
  };

  /**
  	 <div>
  	 Sets the request the client wishes to send to the server.
  	 </div>
  
  	@function setMessage
  	@param {fm.websync.message} value
  	@return {void}
  */


  clientRequest.prototype.setMessage = function() {
    var value;
    value = arguments[0];
    return this._message = value;
  };

  return clientRequest;

})(fm.dynamic);


/**
@class fm.websync.defaults
 <div>
 A collection of read-only default values for WebSync.
 </div>

@extends fm.object
*/


fm.websync.defaults = (function(_super) {

  __extends(defaults, _super);

  /**
  	@ignore 
  	@description
  */


  defaults.__domainKey = null;

  /**
  	@ignore 
  	@description
  */


  defaults.__domainName = null;

  /**
  	@ignore 
  	@description
  */


  function defaults() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      defaults.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    defaults.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the default domain key ("11111111-1111-1111-1111-111111111111").
  	 </div>
  
  	@function getDomainKey
  	@return {fm.guid}
  */


  defaults.getDomainKey = function() {
    return fm.websync.defaults.__domainKey;
  };

  /**
  	 <div>
  	 Gets the default domain name ("localhost").
  	 </div>
  
  	@function getDomainName
  	@return {fm.string}
  */


  defaults.getDomainName = function() {
    return fm.websync.defaults.__domainName;
  };

  defaults.__domainKey = new fm.guid("11111111-1111-1111-1111-111111111111");

  defaults.__domainName = "localhost";

  return defaults;

}).call(this, fm.object);


/**
@class fm.websync.publishingClient
 <div>
 Details about the client sending the publication data.
 </div>

@extends fm.serializable
*/


fm.websync.publishingClient = (function(_super) {

  __extends(publishingClient, _super);

  /**
  	@ignore 
  	@description
  */


  publishingClient.prototype._boundRecords = null;

  /**
  	@ignore 
  	@description
  */


  publishingClient.prototype._clientId = null;

  /**
  	@ignore 
  	@description
  */


  function publishingClient() {
    this.toJson = __bind(this.toJson, this);

    this.setClientId = __bind(this.setClientId, this);

    this.setBoundRecords = __bind(this.setBoundRecords, this);

    this.getClientId = __bind(this.getClientId, this);

    this.getBoundRecords = __bind(this.getBoundRecords, this);

    var boundRecords, clientId;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      publishingClient.__super__.constructor.call(this);
      this.setBoundRecords({});
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    if (arguments.length === 2) {
      clientId = arguments[0];
      boundRecords = arguments[1];
      publishingClient.__super__.constructor.call(this);
      this.setClientId(clientId);
      this.setBoundRecords(boundRecords);
      return;
    }
    if (arguments.length === 0) {
      publishingClient.__super__.constructor.call(this);
      this.setBoundRecords({});
      return;
    }
  }

  /**
  	 <div>
  	 Deserializes a JSON-formatted publishing client.
  	 </div><param name="publishingClientJson">The JSON-formatted publishing client to deserialize.</param><returns>The publishing client.</returns>
  
  	@function fromJson
  	@param {fm.string} publishingClientJson
  	@return {fm.websync.publishingClient}
  */


  publishingClient.fromJson = function() {
    var publishingClientJson;
    publishingClientJson = arguments[0];
    return fm.websync.serializer.deserializePublishingClient(publishingClientJson);
  };

  /**
  	 <div>
  	 Serializes a publishing client to JSON.
  	 </div><param name="publishingClient">The publishing client to serialize.</param><returns>The JSON-formatted publishing client.</returns>
  
  	@function toJson
  	@param {fm.websync.publishingClient} publishingClient
  	@return {fm.string}
  */


  publishingClient.toJson = function() {
    var publishingClient;
    publishingClient = arguments[0];
    return fm.websync.serializer.serializePublishingClient(publishingClient);
  };

  /**
  	 <div>
  	 Gets the client's bound records.
  	 </div>
  
  	@function getBoundRecords
  	@return {fm.hash}
  */


  publishingClient.prototype.getBoundRecords = function() {
    return this._boundRecords;
  };

  /**
  	 <div>
  	 Gets the client's ID.
  	 </div>
  
  	@function getClientId
  	@return {fm.nullable}
  */


  publishingClient.prototype.getClientId = function() {
    return this._clientId;
  };

  /**
  	 <div>
  	 Sets the client's bound records.
  	 </div>
  
  	@function setBoundRecords
  	@param {fm.hash} value
  	@return {void}
  */


  publishingClient.prototype.setBoundRecords = function() {
    var value;
    value = arguments[0];
    return this._boundRecords = value;
  };

  /**
  	 <div>
  	 Sets the client's ID.
  	 </div>
  
  	@function setClientId
  	@param {fm.nullable} value
  	@return {void}
  */


  publishingClient.prototype.setClientId = function() {
    var value;
    value = arguments[0];
    return this._clientId = value;
  };

  /**
  	 <div>
  	 Serializes this instance to JSON.
  	 </div><returns>The JSON-formatted publishing client.</returns>
  
  	@function toJson
  	@return {fm.string}
  */


  publishingClient.prototype.toJson = function() {
    return fm.websync.publishingClient.toJson(this);
  };

  return publishingClient;

}).call(this, fm.serializable);


/**
@class fm.websync.extensions
 <div>
 The extensions library that wraps the Bayeux Ext field, used with instances of classes
 that derive from <see cref="fm.websync.extensible">fm.websync.extensible</see>.
 </div>

@extends fm.dynamic
*/


fm.websync.extensions = (function(_super) {

  __extends(extensions, _super);

  /**
  	@ignore 
  	@description
  */


  extensions.prototype._extensionJsons = null;

  /**
  	@ignore 
  	@description
  */


  function extensions() {
    this.setValue = __bind(this.setValue, this);

    this.getValue = __bind(this.getValue, this);

    this.toJson = __bind(this.toJson, this);

    this.setValueJson = __bind(this.setValueJson, this);

    this.setExtensionJsons = __bind(this.setExtensionJsons, this);

    this.getValueJson = __bind(this.getValueJson, this);

    this.getNames = __bind(this.getNames, this);

    this.getExtensionJsons = __bind(this.getExtensionJsons, this);

    this.getCount = __bind(this.getCount, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      extensions.__super__.constructor.call(this);
      this.setExtensionJsons({});
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    extensions.__super__.constructor.call(this);
    this.setExtensionJsons({});
  }

  /**
  	 <div>
  	 Deserializes a single extensions library from JSON.
  	 </div><param name="extensionsJson">The JSON extensions library to deserialize.</param><returns>The deserialized extensions library.</returns>
  
  	@function fromJson
  	@param {fm.string} extensionsJson
  	@return {fm.websync.extensions}
  */


  extensions.fromJson = function() {
    var extensionsJson;
    extensionsJson = arguments[0];
    return fm.websync.serializer.deserializeExtensions(extensionsJson);
  };

  /**
  	 <div>
  	 Serializes a single extensions library to JSON.
  	 </div><param name="extensions">The extensions library to serialize.</param><returns>The serialized extensions library.</returns>
  
  	@function toJson
  	@param {fm.websync.extensions} extensions
  	@return {fm.string}
  */


  extensions.toJson = function() {
    var extensions;
    extensions = arguments[0];
    return fm.websync.serializer.serializeExtensions(extensions);
  };

  /**
  	 <div>
  	 Gets the number of extensions in the library.
  	 </div>
  
  	@function getCount
  	@return {fm.int}
  */


  extensions.prototype.getCount = function() {
    return fm.hashExtensions.getCount(this.getExtensionJsons());
  };

  /**
  
  	@function getExtensionJsons
  	@return {fm.hash}
  */


  extensions.prototype.getExtensionJsons = function() {
    return this._extensionJsons;
  };

  /**
  	 <div>
  	 Gets the names of the extensions in the library.
  	 </div>
  
  	@function getNames
  	@return {fm.array}
  */


  extensions.prototype.getNames = function() {
    var list;
    list = [];
    fm.arrayExtensions.addRange(list, fm.hashExtensions.getKeys(this.getExtensionJsons()));
    return list;
  };

  /**
  	 <div>
  	 Gets a serialized value stored in the extensions.
  	 </div><param name="name">Fully-qualified extension name.</param><returns>The extension value (in JSON format).</returns>
  
  	@function getValueJson
  	@param {fm.string} name
  	@return {fm.string}
  */


  extensions.prototype.getValueJson = function() {
    var name;
    name = arguments[0];
    if (fm.hashExtensions.containsKey(this.getExtensionJsons(), name)) {
      return this.getExtensionJsons()[name];
    }
    return null;
  };

  /**
  
  	@function setExtensionJsons
  	@param {fm.hash} value
  	@return {void}
  */


  extensions.prototype.setExtensionJsons = function() {
    var value;
    value = arguments[0];
    return this._extensionJsons = value;
  };

  /**
  	 <div>
  	 Stores a serialized value in the extensions.  Must be valid JSON.
  	 </div><param name="name">Fully-qualified extension name.</param><param name="valueJson">The extension value in valid JSON format.</param><param name="validate">Whether or not to validate the JSON.</param>
  
  	@function setValueJson
  	@param {fm.string} name
  	@param {fm.string} valueJson
  	@param {fm.boolean} validate
  	@return {void}
  */


  extensions.prototype.setValueJson = function() {
    var name, validate, valueJson, _var0;
    if (arguments.length === 3) {
      name = arguments[0];
      valueJson = arguments[1];
      validate = arguments[2];
      _var0 = valueJson;
      if (_var0 === null || typeof _var0 === 'undefined') {
        if (fm.hashExtensions.containsKey(this.getExtensionJsons(), name)) {
          fm.hashExtensions.remove(this.getExtensionJsons(), name);
        }
      } else {
        if (!(!validate || fm.serializer.isValidJson(valueJson))) {
          throw new Error("The value is not valid JSON.");
        }
        this.getExtensionJsons()[name] = valueJson;
      }
      this.setIsDirty(true);
      return;
    }
    if (arguments.length === 2) {
      name = arguments[0];
      valueJson = arguments[1];
      this.setValueJson(name, valueJson, true);
    }
  };

  /**
  	 <div>
  	 Serializes the extensions library to JSON.
  	 </div><returns>The serialized extensions library.</returns>
  
  	@function toJson
  	@return {fm.string}
  */


  extensions.prototype.toJson = function() {
    return fm.websync.extensions.toJson(this);
  };

  /**
  
  	@function getValue
  	@param {fm.string} name
  	@return {fm.hash}
  */


  extensions.prototype.getValue = function() {
    var name;
    name = arguments[0];
    return fm.json.deserialize(this.getValueJson.apply(this, arguments));
  };

  /**
  
  	@function setValue
  	@param {fm.string} name
  	@param {fm.string} valueJson
  	@param {fm.hash} value
  	@return {}
  */


  extensions.prototype.setValue = function() {
    var name, value, valueJson;
    if (arguments.length === 3) {
      name = arguments[0];
      valueJson = arguments[1];
      value = arguments[2];
      arguments[arguments.length - 1] = fm.json.serialize(arguments[arguments.length - 1]);
      this.setValueJson.apply(this, arguments);
      return;
    }
    if (arguments.length === 2) {
      name = arguments[0];
      value = arguments[1];
      arguments[arguments.length - 1] = fm.json.serialize(arguments[arguments.length - 1]);
      this.setValueJson.apply(this, arguments);
    }
  };

  return extensions;

}).call(this, fm.dynamic);


/**
@class fm.websync.message
 <div>
 The WebSync message used for all <see cref="fm.websync.client">fm.websync.client</see> requests/responses.
 </div>

@extends fm.websync.baseMessage
*/


fm.websync.message = (function(_super) {

  __extends(message, _super);

  /**
  	@ignore 
  	@description
  */


  message.prototype.__advice = null;

  /**
  	@ignore 
  	@description
  */


  message.prototype.__bayeuxChannel = null;

  /**
  	@ignore 
  	@description
  */


  message.prototype.__channels = null;

  /**
  	@ignore 
  	@description
  */


  message.prototype.__clientId = null;

  /**
  	@ignore 
  	@description
  */


  message.prototype.__connectionType = null;

  /**
  	@ignore 
  	@description
  */


  message.prototype.__id = null;

  /**
  	@ignore 
  	@description
  */


  message.prototype.__minimumVersion = null;

  /**
  	@ignore 
  	@description
  */


  message.prototype.__records = null;

  /**
  	@ignore 
  	@description
  */


  message.prototype.__supportedConnectionTypes = null;

  /**
  	@ignore 
  	@description
  */


  message.prototype.__version = null;

  /**
  	@ignore 
  	@description
  */


  function message() {
    this.toJson = __bind(this.toJson, this);

    this.setVersion = __bind(this.setVersion, this);

    this.setTag = __bind(this.setTag, this);

    this.setSupportedConnectionTypes = __bind(this.setSupportedConnectionTypes, this);

    this.setSessionId = __bind(this.setSessionId, this);

    this.setServerTimeout = __bind(this.setServerTimeout, this);

    this.setServerActions = __bind(this.setServerActions, this);

    this.setRecords = __bind(this.setRecords, this);

    this.setRecord = __bind(this.setRecord, this);

    this.setPublishingClient = __bind(this.setPublishingClient, this);

    this.setNotifyingClient = __bind(this.setNotifyingClient, this);

    this.setNotifyClientId = __bind(this.setNotifyClientId, this);

    this.setMinimumVersion = __bind(this.setMinimumVersion, this);

    this.setLastSessionId = __bind(this.setLastSessionId, this);

    this.setLastClientId = __bind(this.setLastClientId, this);

    this.setKeys = __bind(this.setKeys, this);

    this.setKey = __bind(this.setKey, this);

    this.setId = __bind(this.setId, this);

    this.setDisableBinary = __bind(this.setDisableBinary, this);

    this.setConnectionType = __bind(this.setConnectionType, this);

    this.setClientId = __bind(this.setClientId, this);

    this.setChannels = __bind(this.setChannels, this);

    this.setChannel = __bind(this.setChannel, this);

    this.setBayeuxChannel = __bind(this.setBayeuxChannel, this);

    this.setAdvice = __bind(this.setAdvice, this);

    this.setAcknowledgement = __bind(this.setAcknowledgement, this);

    this.isUnsubscribingFrom = __bind(this.isUnsubscribingFrom, this);

    this.isUnsubscribe = __bind(this.isUnsubscribe, this);

    this.isUnbindingFrom = __bind(this.isUnbindingFrom, this);

    this.isUnbind = __bind(this.isUnbind, this);

    this.isSubscribingTo = __bind(this.isSubscribingTo, this);

    this.isSubscribe = __bind(this.isSubscribe, this);

    this.isService = __bind(this.isService, this);

    this.isPublish = __bind(this.isPublish, this);

    this.isNotify = __bind(this.isNotify, this);

    this.isDisconnect = __bind(this.isDisconnect, this);

    this.isConnect = __bind(this.isConnect, this);

    this.isBindingTo = __bind(this.isBindingTo, this);

    this.isBind = __bind(this.isBind, this);

    this.getVersion = __bind(this.getVersion, this);

    this.getType = __bind(this.getType, this);

    this.getTag = __bind(this.getTag, this);

    this.getSupportedConnectionTypes = __bind(this.getSupportedConnectionTypes, this);

    this.getSessionId = __bind(this.getSessionId, this);

    this.getServerTimeout = __bind(this.getServerTimeout, this);

    this.getServerActions = __bind(this.getServerActions, this);

    this.getRecords = __bind(this.getRecords, this);

    this.getRecord = __bind(this.getRecord, this);

    this.getPublishingClient = __bind(this.getPublishingClient, this);

    this.getNotifyingClient = __bind(this.getNotifyingClient, this);

    this.getNotifyClientId = __bind(this.getNotifyClientId, this);

    this.getMinimumVersion = __bind(this.getMinimumVersion, this);

    this.getLastSessionId = __bind(this.getLastSessionId, this);

    this.getLastClientId = __bind(this.getLastClientId, this);

    this.getKeys = __bind(this.getKeys, this);

    this.getKey = __bind(this.getKey, this);

    this.getId = __bind(this.getId, this);

    this.getDisableBinary = __bind(this.getDisableBinary, this);

    this.getConnectionType = __bind(this.getConnectionType, this);

    this.getClientId = __bind(this.getClientId, this);

    this.getChannels = __bind(this.getChannels, this);

    this.getChannel = __bind(this.getChannel, this);

    this.getBayeuxChannel = __bind(this.getBayeuxChannel, this);

    this.getAdvice = __bind(this.getAdvice, this);

    this.getAcknowledgement = __bind(this.getAcknowledgement, this);

    var bayeuxChannel;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      message.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    if (arguments.length === 1) {
      bayeuxChannel = arguments[0];
      message.__super__.constructor.call(this);
      this.setValidate(false);
      this.setBayeuxChannel(bayeuxChannel);
      this.setValidate(true);
      return;
    }
    if (arguments.length === 0) {
      message.__super__.constructor.call(this);
      return;
    }
  }

  /**
  	 <div>
  	 Deserializes a message from JSON.
  	 </div><param name="messageJson">A JSON string to deserialize.</param><returns>A deserialized message.</returns>
  
  	@function fromJson
  	@param {fm.string} messageJson
  	@return {fm.websync.message}
  */


  message.fromJson = function() {
    var messageJson;
    messageJson = arguments[0];
    return fm.websync.serializer.deserializeMessage(messageJson);
  };

  /**
  	 <div>
  	 Deserializes a list of messages from JSON.
  	 </div><param name="messagesJson">A JSON string to deserialize.</param><returns>A deserialized list of messages.</returns>
  
  	@function fromJsonMultiple
  	@param {fm.string} messagesJson
  	@return {fm.array}
  */


  message.fromJsonMultiple = function() {
    var messagesJson;
    messagesJson = arguments[0];
    return fm.websync.serializer.deserializeMessageArray(messagesJson);
  };

  /**
  	 <div>
  	 Serializes a message to JSON.
  	 </div><param name="message">A message to serialize.</param><returns>A JSON-serialized message.</returns>
  
  	@function toJson
  	@param {fm.websync.message} message
  	@return {fm.string}
  */


  message.toJson = function() {
    var message;
    message = arguments[0];
    return fm.websync.serializer.serializeMessage(message);
  };

  /**
  	 <div>
  	 Serializes a list of messages to JSON.
  	 </div><param name="messages">A list of messages to serialize.</param><returns>A JSON-serialized array of messages.</returns>
  
  	@function toJsonMultiple
  	@param {fm.array} messages
  	@return {fm.string}
  */


  message.toJsonMultiple = function() {
    var messages;
    messages = arguments[0];
    return fm.websync.serializer.serializeMessageArray(messages);
  };

  /**
  	 <div>
  	 Gets the acknowledgement flag, used internally for stream requests following message delivery.
  	 </div>
  
  	@function getAcknowledgement
  	@return {fm.nullable}
  */


  message.prototype.getAcknowledgement = function() {
    return fm.serializer.deserializeBoolean(this.getExtensionValueJson("fm.ack"));
  };

  /**
  	 <div>
  	 Gets details on how the client should reconnect, used internally.
  	 </div>
  
  	@function getAdvice
  	@return {fm.websync.advice}
  */


  message.prototype.getAdvice = function() {
    return this.__advice;
  };

  /**
  	 <div>
  	 Gets the Bayeux message channel.
  	 </div>
  
  	@function getBayeuxChannel
  	@return {fm.string}
  */


  message.prototype.getBayeuxChannel = function() {
    return this.__bayeuxChannel;
  };

  /**
  	 <div>
  	 Gets the channel to which the current client is publishing, subscribing, or unsubscribing.
  	 Overrides <see cref="fm.websync.message.channels">fm.websync.message.channels</see>.
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  message.prototype.getChannel = function() {
    return fm.websync.extensible.sharedGetChannel(this.__channels);
  };

  /**
  	 <div>
  	 Gets the channels to which the current client is subscribing or unsubscribing.
  	 Overrides <see cref="fm.websync.message.channel">fm.websync.message.channel</see>.
  	 </div>
  
  	@function getChannels
  	@return {fm.array}
  */


  message.prototype.getChannels = function() {
    return fm.websync.extensible.sharedGetChannels(this.__channels);
  };

  /**
  	 <div>
  	 Gets the unique identifier of the current client associated with the request/response.
  	 </div>
  
  	@function getClientId
  	@return {fm.nullable}
  */


  message.prototype.getClientId = function() {
    return this.__clientId;
  };

  /**
  	 <div>
  	 Gets the type of connection the client is using, used internally.
  	 </div>
  
  	@function getConnectionType
  	@return {fm.nullable}
  */


  message.prototype.getConnectionType = function() {
    return this.__connectionType;
  };

  /**
  	 <div>
  	 Gets whether binary is disabled.
  	 </div>
  
  	@function getDisableBinary
  	@return {fm.nullable}
  */


  message.prototype.getDisableBinary = function() {
    return fm.serializer.deserializeBoolean(this.getExtensionValueJson("fm.dbin"));
  };

  /**
  	 <div>
  	 Gets the unique message identifier.
  	 </div>
  
  	@function getId
  	@return {fm.string}
  */


  message.prototype.getId = function() {
    return this.__id;
  };

  /**
  	 <div>
  	 Gets the record key to which the current client is binding or unbinding.
  	 Overrides <see cref="fm.websync.message.keys">fm.websync.message.keys</see>, <see cref="fm.websync.message.record">fm.websync.message.record</see>, and <see cref="fm.websync.message.records">fm.websync.message.records</see>.
  	 </div>
  
  	@function getKey
  	@return {fm.string}
  */


  message.prototype.getKey = function() {
    return fm.websync.extensible.sharedGetKey(this.__records);
  };

  /**
  	 <div>
  	 Gets the record keys to which the current client is binding or unbinding.
  	 Overrides <see cref="fm.websync.message.key">fm.websync.message.key</see>, <see cref="fm.websync.message.record">fm.websync.message.record</see>, and <see cref="fm.websync.message.records">fm.websync.message.records</see>.
  	 </div>
  
  	@function getKeys
  	@return {fm.array}
  */


  message.prototype.getKeys = function() {
    return fm.websync.extensible.sharedGetKeys(this.__records);
  };

  /**
  	 <div>
  	 Gets the last used client ID.
  	 </div>
  
  	@function getLastClientId
  	@return {fm.nullable}
  */


  message.prototype.getLastClientId = function() {
    return fm.serializer.deserializeGuid(this.getExtensionValueJson("fm.lcid"));
  };

  /**
  	 <div>
  	 Gets the last used session ID.
  	 </div>
  
  	@function getLastSessionId
  	@return {fm.nullable}
  */


  message.prototype.getLastSessionId = function() {
    return fm.serializer.deserializeGuid(this.getExtensionValueJson("fm.lsid"));
  };

  /**
  	 <div>
  	 Gets the minimum supported server version, used internally.
  	 </div>
  
  	@function getMinimumVersion
  	@return {fm.string}
  */


  message.prototype.getMinimumVersion = function() {
    return this.__minimumVersion;
  };

  /**
  	 <div>
  	 Gets the ID of the client which the current client is notifying.
  	 </div>
  
  	@function getNotifyClientId
  	@return {fm.nullable}
  */


  message.prototype.getNotifyClientId = function() {
    return fm.serializer.deserializeGuid(this.getExtensionValueJson("fm.notify"));
  };

  /**
  	 <div>
  	 Gets the notifying client details, used internally.
  	 </div>
  
  	@function getNotifyingClient
  	@return {fm.websync.notifyingClient}
  */


  message.prototype.getNotifyingClient = function() {
    return fm.websync.serializer.deserializeNotifyingClient(this.getExtensionValueJson("fm.notifying"));
  };

  /**
  	 <div>
  	 Gets the publishing client details, used internally.
  	 </div>
  
  	@function getPublishingClient
  	@return {fm.websync.publishingClient}
  */


  message.prototype.getPublishingClient = function() {
    return fm.websync.serializer.deserializePublishingClient(this.getExtensionValueJson("fm.publishing"));
  };

  /**
  	 <div>
  	 Gets the record to which the current client is binding or unbinding.
  	 Overrides <see cref="fm.websync.message.records">fm.websync.message.records</see>, <see cref="fm.websync.message.key">fm.websync.message.key</see>, and <see cref="fm.websync.message.keys">fm.websync.message.keys</see>.
  	 </div>
  
  	@function getRecord
  	@return {fm.websync.record}
  */


  message.prototype.getRecord = function() {
    return fm.websync.extensible.sharedGetRecord(this.__records);
  };

  /**
  	 <div>
  	 Gets the records to which the current client is binding or unbinding.
  	 Overrides <see cref="fm.websync.message.record">fm.websync.message.record</see>, <see cref="fm.websync.message.key">fm.websync.message.key</see>, and <see cref="fm.websync.message.keys">fm.websync.message.keys</see>.
  	 </div>
  
  	@function getRecords
  	@return {fm.array}
  */


  message.prototype.getRecords = function() {
    return fm.websync.extensible.sharedGetRecords(this.__records);
  };

  /**
  	 <div>
  	 Gets the server actions, used internally.
  	 </div>
  
  	@function getServerActions
  	@return {fm.array}
  */


  message.prototype.getServerActions = function() {
    var extensionValueJson, messageArray, _var0;
    extensionValueJson = this.getExtensionValueJson("fm.server");
    if (!fm.stringExtensions.isNullOrEmpty(extensionValueJson)) {
      messageArray = fm.websync.message.fromJsonMultiple(extensionValueJson);
      _var0 = messageArray;
      if (_var0 !== null && typeof _var0 !== 'undefined') {
        return messageArray;
      }
    }
    return null;
  };

  /**
  	 <div>
  	 Gets the server timeout, used internally.
  	 </div>
  
  	@function getServerTimeout
  	@return {fm.nullable}
  */


  message.prototype.getServerTimeout = function() {
    return fm.serializer.deserializeInteger(this.getExtensionValueJson("fm.timeout"));
  };

  /**
  	 <div>
  	 Gets the session ID associated with the message, used internally.
  	 </div>
  
  	@function getSessionId
  	@return {fm.nullable}
  */


  message.prototype.getSessionId = function() {
    return fm.serializer.deserializeGuid(this.getExtensionValueJson("fm.sessionId"));
  };

  /**
  	 <div>
  	 Gets the connection types supported by an endpoint, used internally.
  	 </div>
  
  	@function getSupportedConnectionTypes
  	@return {fm.array}
  */


  message.prototype.getSupportedConnectionTypes = function() {
    return this.__supportedConnectionTypes;
  };

  /**
  	 <div>
  	 Gets the tag associated with the request.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  message.prototype.getTag = function() {
    var _ref;
    return (_ref = fm.serializer.deserializeString(this.getExtensionValueJson("fm.tag"))) != null ? _ref : fm.stringExtensions.empty;
  };

  /**
  	 <div>
  	 Gets the type of the message.
  	 </div>
  
  	@function getType
  	@return {fm.websync.messageType}
  */


  message.prototype.getType = function() {
    return fm.websync.metaChannels.getMessageType(this.getBayeuxChannel());
  };

  /**
  	 <div>
  	 Gets the current server version, used internally.
  	 </div>
  
  	@function getVersion
  	@return {fm.string}
  */


  message.prototype.getVersion = function() {
    return this.__version;
  };

  /**
  	 <div>
  	 Detects whether this is a bind request/response.
  	 </div><returns></returns>
  
  	@function isBind
  	@return {fm.boolean}
  */


  message.prototype.isBind = function() {
    return this.getType() === fm.websync.messageType.Bind;
  };

  /**
  	 <div>
  	 Determines whether or not the current message represents a bind
  	 request/response for a particular key.
  	 </div><param name="key">The key to test.</param><returns>
  	 <c>true</c> if the message represents a bind request/response
  	 for the specified key; otherwise <c>false</c>.</returns>
  
  	@function isBindingTo
  	@param {fm.string} key
  	@return {fm.boolean}
  */


  message.prototype.isBindingTo = function() {
    var key, record, _i, _len, _var0, _var1;
    key = arguments[0];
    if (this.getType() === fm.websync.messageType.Bind) {
      _var0 = this.getRecords();
      if (_var0 === null || typeof _var0 === 'undefined') {
        return false;
      }
      _var1 = this.getRecords();
      for (_i = 0, _len = _var1.length; _i < _len; _i++) {
        record = _var1[_i];
        if (record.getKey() === key) {
          return true;
        }
      }
    }
    return false;
  };

  /**
  	 <div>
  	 Detects whether this is a connect request/response.
  	 </div><returns></returns>
  
  	@function isConnect
  	@return {fm.boolean}
  */


  message.prototype.isConnect = function() {
    return this.getType() === fm.websync.messageType.Connect;
  };

  /**
  	 <div>
  	 Detects whether this is a disconnect request/response.
  	 </div><returns></returns>
  
  	@function isDisconnect
  	@return {fm.boolean}
  */


  message.prototype.isDisconnect = function() {
    return this.getType() === fm.websync.messageType.Disconnect;
  };

  /**
  	 <div>
  	 Detects whether this is a notify request/response.
  	 </div><returns></returns>
  
  	@function isNotify
  	@return {fm.boolean}
  */


  message.prototype.isNotify = function() {
    return this.getType() === fm.websync.messageType.Notify;
  };

  /**
  	 <div>
  	 Detects whether this is a publish request/response.
  	 </div><returns></returns>
  
  	@function isPublish
  	@return {fm.boolean}
  */


  message.prototype.isPublish = function() {
    return this.getType() === fm.websync.messageType.Publish;
  };

  /**
  	 <div>
  	 Detects whether this is a service request/response.
  	 </div><returns></returns>
  
  	@function isService
  	@return {fm.boolean}
  */


  message.prototype.isService = function() {
    return this.getType() === fm.websync.messageType.Service;
  };

  /**
  	 <div>
  	 Detects whether this is a subscribe request/response.
  	 </div><returns></returns>
  
  	@function isSubscribe
  	@return {fm.boolean}
  */


  message.prototype.isSubscribe = function() {
    return this.getType() === fm.websync.messageType.Subscribe;
  };

  /**
  	 <div>
  	 Determines whether or not the current message represents a subscribe
  	 request/response for a particular channel.
  	 </div><param name="channel">The channel to test.</param><returns>
  	 <c>true</c> if the message represents a subscribe request/response
  	 for the specified channel; otherwise <c>false</c>.</returns>
  
  	@function isSubscribingTo
  	@param {fm.string} channel
  	@return {fm.boolean}
  */


  message.prototype.isSubscribingTo = function() {
    var channel, str, _i, _len, _var0, _var1;
    channel = arguments[0];
    if (this.getType() === fm.websync.messageType.Subscribe) {
      _var0 = this.getChannels();
      if (_var0 === null || typeof _var0 === 'undefined') {
        return false;
      }
      _var1 = this.getChannels();
      for (_i = 0, _len = _var1.length; _i < _len; _i++) {
        str = _var1[_i];
        if (str === channel) {
          return true;
        }
      }
    }
    return false;
  };

  /**
  	 <div>
  	 Detects whether this is a bind request/response.
  	 </div><returns></returns>
  
  	@function isUnbind
  	@return {fm.boolean}
  */


  message.prototype.isUnbind = function() {
    return this.getType() === fm.websync.messageType.Unbind;
  };

  /**
  	 <div>
  	 Determines whether or not the current message represents an unbind
  	 request/response for a particular key.
  	 </div><param name="key">The key to test.</param><returns>
  	 <c>true</c> if the message represents an unbind request/response
  	 for the specified key; otherwise <c>false</c>.</returns>
  
  	@function isUnbindingFrom
  	@param {fm.string} key
  	@return {fm.boolean}
  */


  message.prototype.isUnbindingFrom = function() {
    var key, record, _i, _len, _var0, _var1;
    key = arguments[0];
    if (this.getType() === fm.websync.messageType.Unbind) {
      _var0 = this.getRecords();
      if (_var0 === null || typeof _var0 === 'undefined') {
        return false;
      }
      _var1 = this.getRecords();
      for (_i = 0, _len = _var1.length; _i < _len; _i++) {
        record = _var1[_i];
        if (record.getKey() === key) {
          return true;
        }
      }
    }
    return false;
  };

  /**
  	 <div>
  	 Detects whether this is an unsubscribe request/response.
  	 </div><returns></returns>
  
  	@function isUnsubscribe
  	@return {fm.boolean}
  */


  message.prototype.isUnsubscribe = function() {
    return this.getType() === fm.websync.messageType.Unsubscribe;
  };

  /**
  	 <div>
  	 Determines whether or not the current message represents an unsubscribe
  	 request/response for a particular channel.
  	 </div><param name="channel">The channel to test.</param><returns>
  	 <c>true</c> if the message represents an unsubscribe request/response
  	 for the specified channel; otherwise <c>false</c>.</returns>
  
  	@function isUnsubscribingFrom
  	@param {fm.string} channel
  	@return {fm.boolean}
  */


  message.prototype.isUnsubscribingFrom = function() {
    var channel, str, _i, _len, _var0, _var1;
    channel = arguments[0];
    if (this.getType() === fm.websync.messageType.Unsubscribe) {
      _var0 = this.getChannels();
      if (_var0 === null || typeof _var0 === 'undefined') {
        return false;
      }
      _var1 = this.getChannels();
      for (_i = 0, _len = _var1.length; _i < _len; _i++) {
        str = _var1[_i];
        if (str === channel) {
          return true;
        }
      }
    }
    return false;
  };

  /**
  	 <div>
  	 Sets the acknowledgement flag, used internally for stream requests following message delivery.
  	 </div>
  
  	@function setAcknowledgement
  	@param {fm.nullable} value
  	@return {void}
  */


  message.prototype.setAcknowledgement = function() {
    var value;
    value = arguments[0];
    this.setExtensionValueJson("fm.ack", fm.serializer.serializeBoolean(value), false);
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets details on how the client should reconnect, used internally.
  	 </div>
  
  	@function setAdvice
  	@param {fm.websync.advice} value
  	@return {void}
  */


  message.prototype.setAdvice = function() {
    var value;
    value = arguments[0];
    this.__advice = value;
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the Bayeux message channel.
  	 </div>
  
  	@function setBayeuxChannel
  	@param {fm.string} value
  	@return {void}
  */


  message.prototype.setBayeuxChannel = function() {
    var value;
    value = arguments[0];
    this.__bayeuxChannel = value;
    if (fm.websync.metaChannels.isServiceChannel(value)) {
      this.setChannel(fm.websync.metaChannels.convertChannelFromServiced(value));
    } else {
      if (!fm.websync.metaChannels.isMetaChannel(value)) {
        this.setChannel(value);
      }
    }
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the channel to which the current client is publishing, subscribing, or unsubscribing.
  	 Overrides <see cref="fm.websync.message.channels">fm.websync.message.channels</see>.
  	 </div>
  
  	@function setChannel
  	@param {fm.string} value
  	@return {void}
  */


  message.prototype.setChannel = function() {
    var value;
    value = arguments[0];
    this.__channels = fm.websync.extensible.sharedSetChannel(value, this.getValidate());
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the channels to which the current client is subscribing or unsubscribing.
  	 Overrides <see cref="fm.websync.message.channel">fm.websync.message.channel</see>.
  	 </div>
  
  	@function setChannels
  	@param {fm.array} value
  	@return {void}
  */


  message.prototype.setChannels = function() {
    var value;
    value = arguments[0];
    this.__channels = fm.websync.extensible.sharedSetChannels(value, this.getValidate());
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the unique identifier of the current client associated with the request/response.
  	 </div>
  
  	@function setClientId
  	@param {fm.nullable} value
  	@return {void}
  */


  message.prototype.setClientId = function() {
    var value;
    value = arguments[0];
    this.__clientId = value;
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the type of connection the client is using, used internally.
  	 </div>
  
  	@function setConnectionType
  	@param {fm.nullable} value
  	@return {void}
  */


  message.prototype.setConnectionType = function() {
    var value;
    value = arguments[0];
    this.__connectionType = value;
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets whether binary is disabled.
  	 </div>
  
  	@function setDisableBinary
  	@param {fm.nullable} value
  	@return {void}
  */


  message.prototype.setDisableBinary = function() {
    var value;
    value = arguments[0];
    this.setExtensionValueJson("fm.dbin", fm.serializer.serializeBoolean(value), false);
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the unique message identifier.
  	 </div>
  
  	@function setId
  	@param {fm.string} value
  	@return {void}
  */


  message.prototype.setId = function() {
    var value;
    value = arguments[0];
    this.__id = value;
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the record key to which the current client is binding or unbinding.
  	 Overrides <see cref="fm.websync.message.keys">fm.websync.message.keys</see>, <see cref="fm.websync.message.record">fm.websync.message.record</see>, and <see cref="fm.websync.message.records">fm.websync.message.records</see>.
  	 </div>
  
  	@function setKey
  	@param {fm.string} value
  	@return {void}
  */


  message.prototype.setKey = function() {
    var value;
    value = arguments[0];
    this.__records = fm.websync.extensible.sharedSetKey(value, this.getValidate());
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the record keys to which the current client is binding or unbinding.
  	 Overrides <see cref="fm.websync.message.key">fm.websync.message.key</see>, <see cref="fm.websync.message.record">fm.websync.message.record</see>, and <see cref="fm.websync.message.records">fm.websync.message.records</see>.
  	 </div>
  
  	@function setKeys
  	@param {fm.array} value
  	@return {void}
  */


  message.prototype.setKeys = function() {
    var value;
    value = arguments[0];
    this.__records = fm.websync.extensible.sharedSetKeys(value, this.getValidate());
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the last used client ID.
  	 </div>
  
  	@function setLastClientId
  	@param {fm.nullable} value
  	@return {void}
  */


  message.prototype.setLastClientId = function() {
    var value;
    value = arguments[0];
    this.setExtensionValueJson("fm.lcid", fm.serializer.serializeGuid(value), false);
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the last used session ID.
  	 </div>
  
  	@function setLastSessionId
  	@param {fm.nullable} value
  	@return {void}
  */


  message.prototype.setLastSessionId = function() {
    var value;
    value = arguments[0];
    this.setExtensionValueJson("fm.lsid", fm.serializer.serializeGuid(value), false);
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the minimum supported server version, used internally.
  	 </div>
  
  	@function setMinimumVersion
  	@param {fm.string} value
  	@return {void}
  */


  message.prototype.setMinimumVersion = function() {
    var value;
    value = arguments[0];
    this.__minimumVersion = value;
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the ID of the client which the current client is notifying.
  	 </div>
  
  	@function setNotifyClientId
  	@param {fm.nullable} value
  	@return {void}
  */


  message.prototype.setNotifyClientId = function() {
    var value;
    value = arguments[0];
    this.setExtensionValueJson("fm.notify", fm.serializer.serializeGuid(value), false);
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the notifying client details, used internally.
  	 </div>
  
  	@function setNotifyingClient
  	@param {fm.websync.notifyingClient} value
  	@return {void}
  */


  message.prototype.setNotifyingClient = function() {
    var value;
    value = arguments[0];
    this.setExtensionValueJson("fm.notifying", fm.websync.serializer.serializeNotifyingClient(value), false);
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the publishing client details, used internally.
  	 </div>
  
  	@function setPublishingClient
  	@param {fm.websync.publishingClient} value
  	@return {void}
  */


  message.prototype.setPublishingClient = function() {
    var value;
    value = arguments[0];
    this.setExtensionValueJson("fm.publishing", fm.websync.serializer.serializePublishingClient(value), false);
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the record to which the current client is binding or unbinding.
  	 Overrides <see cref="fm.websync.message.records">fm.websync.message.records</see>, <see cref="fm.websync.message.key">fm.websync.message.key</see>, and <see cref="fm.websync.message.keys">fm.websync.message.keys</see>.
  	 </div>
  
  	@function setRecord
  	@param {fm.websync.record} value
  	@return {void}
  */


  message.prototype.setRecord = function() {
    var value;
    value = arguments[0];
    this.__records = fm.websync.extensible.sharedSetRecord(value, this.getValidate());
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the records to which the current client is binding or unbinding.
  	 Overrides <see cref="fm.websync.message.record">fm.websync.message.record</see>, <see cref="fm.websync.message.key">fm.websync.message.key</see>, and <see cref="fm.websync.message.keys">fm.websync.message.keys</see>.
  	 </div>
  
  	@function setRecords
  	@param {fm.array} value
  	@return {void}
  */


  message.prototype.setRecords = function() {
    var value;
    value = arguments[0];
    this.__records = fm.websync.extensible.sharedSetRecords(value, this.getValidate());
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the server actions, used internally.
  	 </div>
  
  	@function setServerActions
  	@param {fm.array} value
  	@return {void}
  */


  message.prototype.setServerActions = function() {
    var value;
    value = arguments[0];
    this.setExtensionValueJson("fm.server", fm.websync.message.toJsonMultiple(value), false);
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the server timeout, used internally.
  	 </div>
  
  	@function setServerTimeout
  	@param {fm.nullable} value
  	@return {void}
  */


  message.prototype.setServerTimeout = function() {
    var value;
    value = arguments[0];
    this.setExtensionValueJson("fm.timeout", fm.serializer.serializeInteger(value), false);
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the session ID associated with the message, used internally.
  	 </div>
  
  	@function setSessionId
  	@param {fm.nullable} value
  	@return {void}
  */


  message.prototype.setSessionId = function() {
    var value;
    value = arguments[0];
    this.setExtensionValueJson("fm.sessionId", fm.serializer.serializeGuid(value), false);
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the connection types supported by an endpoint, used internally.
  	 </div>
  
  	@function setSupportedConnectionTypes
  	@param {fm.array} value
  	@return {void}
  */


  message.prototype.setSupportedConnectionTypes = function() {
    var value;
    value = arguments[0];
    this.__supportedConnectionTypes = value;
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the tag associated with the request.
  	 </div>
  
  	@function setTag
  	@param {fm.string} value
  	@return {void}
  */


  message.prototype.setTag = function() {
    var value;
    value = arguments[0];
    this.setExtensionValueJson("fm.tag", fm.serializer.serializeString(value != null ? value : fm.stringExtensions.empty), false);
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the current server version, used internally.
  	 </div>
  
  	@function setVersion
  	@param {fm.string} value
  	@return {void}
  */


  message.prototype.setVersion = function() {
    var value;
    value = arguments[0];
    this.__version = value;
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Serializes the message to JSON.
  	 </div><returns>The message in JSON-serialized format.</returns>
  
  	@function toJson
  	@return {fm.string}
  */


  message.prototype.toJson = function() {
    return fm.websync.message.toJson(this);
  };

  return message;

}).call(this, fm.websync.baseMessage);


/**
@class fm.websync.publication
 <div>
 The WebSync publication used for direct publishing.
 </div>

@extends fm.websync.baseMessage
*/


fm.websync.publication = (function(_super) {

  __extends(publication, _super);

  /**
  	@ignore 
  	@description
  */


  publication.prototype.__channel = null;

  /**
  	@ignore 
  	@description
  */


  function publication() {
    this.toJson = __bind(this.toJson, this);

    this.setTag = __bind(this.setTag, this);

    this.setChannel = __bind(this.setChannel, this);

    this.getTag = __bind(this.getTag, this);

    this.getChannel = __bind(this.getChannel, this);

    var channel, dataJson, tag;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      publication.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    if (arguments.length === 2) {
      channel = arguments[0];
      dataJson = arguments[1];
      publication.call(this, channel, dataJson, null);
      return;
    }
    if (arguments.length === 3) {
      channel = arguments[0];
      dataJson = arguments[1];
      tag = arguments[2];
      publication.__super__.constructor.call(this);
      this.setChannel(channel);
      this.setDataJson(dataJson);
      this.setTag(tag);
      return;
    }
    if (arguments.length === 0) {
      publication.__super__.constructor.call(this);
      return;
    }
    if (arguments.length === 1) {
      channel = arguments[0];
      publication.__super__.constructor.call(this);
      this.setChannel(channel);
      return;
    }
  }

  /**
  	 <div>
  	 Deserializes a publication from JSON.
  	 </div><param name="publicationJson">A JSON string to deserialize.</param><returns>A deserialized publication.</returns>
  
  	@function fromJson
  	@param {fm.string} publicationJson
  	@return {fm.websync.publication}
  */


  publication.fromJson = function() {
    var publicationJson;
    publicationJson = arguments[0];
    return fm.websync.serializer.deserializePublication(publicationJson);
  };

  /**
  	 <div>
  	 Deserializes a list of publications from JSON.
  	 </div><param name="publicationsJson">A JSON string to deserialize.</param><returns>A deserialized list of publications.</returns>
  
  	@function fromJsonMultiple
  	@param {fm.string} publicationsJson
  	@return {fm.array}
  */


  publication.fromJsonMultiple = function() {
    var publicationsJson;
    publicationsJson = arguments[0];
    return fm.websync.serializer.deserializePublicationArray(publicationsJson);
  };

  /**
  	 <div>
  	 Converts a Publication from its Message format.
  	 </div><param name="message">The message.</param><returns>The publication.</returns>
  
  	@function fromMessage
  	@param {fm.websync.message} message
  	@return {fm.websync.publication}
  */


  publication.fromMessage = function() {
    var message, publication, _var0;
    message = arguments[0];
    _var0 = message;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return null;
    }
    publication = new fm.websync.publication();
    publication.setChannel(message.getBayeuxChannel());
    publication.setSuccessful(message.getSuccessful());
    publication.setError(message.getError());
    publication.setTimestamp(message.getTimestamp());
    publication.setDataJson(message.getDataJson());
    publication.setExtensions(message.getExtensions());
    return publication;
  };

  /**
  	 <div>
  	 Converts a set of Publications from their Message formats.
  	 </div><param name="messages">The messages.</param><returns>The publications.</returns>
  
  	@function fromMessages
  	@param {fm.array} messages
  	@return {fm.array}
  */


  publication.fromMessages = function() {
    var i, messages, publicationArray, _var0;
    messages = arguments[0];
    _var0 = messages;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return null;
    }
    publicationArray = [];
    i = 0;
    while (i < messages.length) {
      try {
        publicationArray[i] = fm.websync.publication.fromMessage(messages[i]);
      } finally {
        i++;
      }
    }
    return publicationArray;
  };

  /**
  	 <div>
  	 Serializes a publication to JSON.
  	 </div><param name="publication">A publication to serialize.</param><returns>A JSON-serialized publication.</returns>
  
  	@function toJson
  	@param {fm.websync.publication} publication
  	@return {fm.string}
  */


  publication.toJson = function() {
    var publication;
    publication = arguments[0];
    return fm.websync.serializer.serializePublication(publication);
  };

  /**
  	 <div>
  	 Serializes a list of publications to JSON.
  	 </div><param name="publications">A list of publications to serialize.</param><returns>A JSON-serialized array of publications.</returns>
  
  	@function toJsonMultiple
  	@param {fm.array} publications
  	@return {fm.string}
  */


  publication.toJsonMultiple = function() {
    var publications;
    publications = arguments[0];
    return fm.websync.serializer.serializePublicationArray(publications);
  };

  /**
  	 <div>
  	 Converts a Publication to its Message format.
  	 </div><param name="publication">The publication.</param><returns>The message.</returns>
  
  	@function toMessage
  	@param {fm.websync.publication} publication
  	@return {fm.websync.message}
  */


  publication.toMessage = function() {
    var message, publication, _var0;
    publication = arguments[0];
    _var0 = publication;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return null;
    }
    message = new fm.websync.message();
    message.setBayeuxChannel(publication.getChannel());
    message.setSuccessful(publication.getSuccessful());
    message.setError(publication.getError());
    message.setTimestamp(publication.getTimestamp());
    message.setDataJson(publication.getDataJson());
    message.setExtensions(publication.getExtensions());
    return message;
  };

  /**
  	 <div>
  	 Converts a set of Publications to their Message formats.
  	 </div><param name="publications">The publications.</param><returns>The messages.</returns>
  
  	@function toMessages
  	@param {fm.array} publications
  	@return {fm.array}
  */


  publication.toMessages = function() {
    var i, messageArray, publications, _var0;
    publications = arguments[0];
    _var0 = publications;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return null;
    }
    messageArray = [];
    i = 0;
    while (i < publications.length) {
      try {
        messageArray[i] = fm.websync.publication.toMessage(publications[i]);
      } finally {
        i++;
      }
    }
    return messageArray;
  };

  /**
  	 <div>
  	 Gets the channel the publisher is targeting.
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  publication.prototype.getChannel = function() {
    return this.__channel;
  };

  /**
  	 <div>
  	 Gets the tag that identifies the contents of the payload.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  publication.prototype.getTag = function() {
    return fm.serializer.deserializeString(this.getExtensionValueJson("fm.tag"));
  };

  /**
  	 <div>
  	 Sets the channel the publisher is targeting.
  	 </div>
  
  	@function setChannel
  	@param {fm.string} value
  	@return {void}
  */


  publication.prototype.setChannel = function() {
    var error, value, _var0, _var1, _var2;
    value = arguments[0];
    _var0 = value;
    if (_var0 === null || typeof _var0 === 'undefined') {
      this.__channel = value;
      return this.setIsDirty(true);
    } else {
      error = null;
      _var1 = new fm.holder(error);
      _var2 = fm.websync.extensible.validateChannel(value, _var1);
      error = _var1.getValue();
      if (!(!this.getValidate() || _var2)) {
        throw new Error(fm.stringExtensions.format("Invalid channel. {0}", error));
      }
      this.__channel = value;
      return this.setIsDirty(true);
    }
  };

  /**
  	 <div>
  	 Sets the tag that identifies the contents of the payload.
  	 </div>
  
  	@function setTag
  	@param {fm.string} value
  	@return {void}
  */


  publication.prototype.setTag = function() {
    var value;
    value = arguments[0];
    this.setExtensionValueJson("fm.tag", fm.serializer.serializeString(value), false);
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Serializes the publication to JSON.
  	 </div><returns>The publication in JSON-serialized format.</returns>
  
  	@function toJson
  	@return {fm.string}
  */


  publication.prototype.toJson = function() {
    return fm.websync.publication.toJson(this);
  };

  return publication;

}).call(this, fm.websync.baseMessage);


/**
@class fm.websync.publisher
 <div>
 <p>
 The WebSync publisher, used for publishing data rapidly and efficiently.
 </p>
 </div><div>
 <p>
 When developing real-time applications, it is often most efficient and secure to
 publish data from a server, a web service, or in general, a source that doesn't
 require the ability to subscribe to channels.  The <see cref="fm.websync.publisher">fm.websync.publisher</see> is
 designed to do just that.
 </p>
 <p>
 A common use case for the <see cref="fm.websync.publisher">fm.websync.publisher</see> is to send out data as it
 arrives from a real-time feed (e.g. stock data, sports scores, news articles, etc.).
 Wherever the feed is located, the <see cref="fm.websync.publisher">fm.websync.publisher</see> can be used to send
 out the data rapidly to any subscribed clients.
 </p>
 <p>
 For security reasons, WebSync Server blocks Publisher requests by default. To
 enable direct publication, make sure "allowPublishers" is enabled in web.config.
 </p>
 <p>
 The publisher always runs synchronously.
 </p>
 <p>
 There are multiple overloads for the "Publish" method. For batch
 publications, use the overloads that take a collection of
 <see cref="fm.websync.publication">Publicationsfm.websync.publication</see>. They will be automatically batched and
 delivered in a single round-trip.
 </p>
 </div>

@extends fm.websync.baseClient
*/


fm.websync.publisher = (function(_super) {

  __extends(publisher, _super);

  /**
  	@ignore 
  	@description
  */


  publisher._onNotifyRequest = null;

  /**
  	@ignore 
  	@description
  */


  publisher._onNotifyResponse = null;

  /**
  	@ignore 
  	@description
  */


  publisher._onPublishRequest = null;

  /**
  	@ignore 
  	@description
  */


  publisher._onPublishResponse = null;

  /**
  	@ignore 
  	@description
  */


  publisher._requestUrlCache = null;

  /**
  	@ignore 
  	@description
  */


  publisher._requestUrlCacheLock = null;

  /**
  	@ignore 
  	@description
  */


  function publisher() {
    this.send = __bind(this.send, this);

    this.raiseResponseEvent = __bind(this.raiseResponseEvent, this);

    this.raiseRequestEvent = __bind(this.raiseRequestEvent, this);

    this.raiseEvent = __bind(this.raiseEvent, this);

    this.publishMany = __bind(this.publishMany, this);

    this.publish = __bind(this.publish, this);

    this.processRequestUrl = __bind(this.processRequestUrl, this);

    this.performPublish = __bind(this.performPublish, this);

    this.performNotify = __bind(this.performNotify, this);

    this.notifyMany = __bind(this.notifyMany, this);

    this.notify = __bind(this.notify, this);

    var requestUrl;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      publisher.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    requestUrl = arguments[0];
    publisher.__super__.constructor.call(this, requestUrl);
  }

  /**
  
  	@function addOnNotifyRequest
  	@param {fm.doubleAction} value
  	@return {void}
  */


  publisher.addOnNotifyRequest = function() {
    var value;
    value = arguments[0];
    return fm.websync.publisher._onNotifyRequest = fm.delegate.combine(fm.websync.publisher._onNotifyRequest, value);
  };

  /**
  
  	@function addOnNotifyResponse
  	@param {fm.doubleAction} value
  	@return {void}
  */


  publisher.addOnNotifyResponse = function() {
    var value;
    value = arguments[0];
    return fm.websync.publisher._onNotifyResponse = fm.delegate.combine(fm.websync.publisher._onNotifyResponse, value);
  };

  /**
  
  	@function addOnPublishRequest
  	@param {fm.doubleAction} value
  	@return {void}
  */


  publisher.addOnPublishRequest = function() {
    var value;
    value = arguments[0];
    return fm.websync.publisher._onPublishRequest = fm.delegate.combine(fm.websync.publisher._onPublishRequest, value);
  };

  /**
  
  	@function addOnPublishResponse
  	@param {fm.doubleAction} value
  	@return {void}
  */


  publisher.addOnPublishResponse = function() {
    var value;
    value = arguments[0];
    return fm.websync.publisher._onPublishResponse = fm.delegate.combine(fm.websync.publisher._onPublishResponse, value);
  };

  /**
  
  	@function removeOnNotifyRequest
  	@param {fm.doubleAction} value
  	@return {void}
  */


  publisher.removeOnNotifyRequest = function() {
    var value;
    value = arguments[0];
    return fm.websync.publisher._onNotifyRequest = fm.delegate.remove(fm.websync.publisher._onNotifyRequest, value);
  };

  /**
  
  	@function removeOnNotifyResponse
  	@param {fm.doubleAction} value
  	@return {void}
  */


  publisher.removeOnNotifyResponse = function() {
    var value;
    value = arguments[0];
    return fm.websync.publisher._onNotifyResponse = fm.delegate.remove(fm.websync.publisher._onNotifyResponse, value);
  };

  /**
  
  	@function removeOnPublishRequest
  	@param {fm.doubleAction} value
  	@return {void}
  */


  publisher.removeOnPublishRequest = function() {
    var value;
    value = arguments[0];
    return fm.websync.publisher._onPublishRequest = fm.delegate.remove(fm.websync.publisher._onPublishRequest, value);
  };

  /**
  
  	@function removeOnPublishResponse
  	@param {fm.doubleAction} value
  	@return {void}
  */


  publisher.removeOnPublishResponse = function() {
    var value;
    value = arguments[0];
    return fm.websync.publisher._onPublishResponse = fm.delegate.remove(fm.websync.publisher._onPublishResponse, value);
  };

  /**
  	 <div>
  	 Sends a notification synchronously over HTTP.
  	 </div><div>
  	 This method always executes synchronously and returns the
  	 <see cref="fm.websync.notification">fm.websync.notification</see> it automatically creates.
  	 </div><param name="clientId">The client to which the data should be sent.</param><param name="dataJson">The data to deliver (in JSON format).</param><param name="tag">The tag that identifies the contents of the payload.</param><returns>The generated notification.</returns>
  
  	@function notify
  	@param {fm.guid} clientId
  	@param {fm.string} dataJson
  	@param {fm.string} tag
  	@return {fm.websync.notification}
  */


  publisher.prototype.notify = function() {
    var clientId, dataJson, notification, notificationArray, tag, _var0;
    if (arguments.length === 3) {
      clientId = arguments[0];
      dataJson = arguments[1];
      tag = arguments[2];
      return this.notify(new fm.websync.notification(clientId, dataJson, tag));
      return;
    }
    if (arguments.length === 1) {
      notification = arguments[0];
      notificationArray = this.notifyMany([notification]);
      _var0 = notificationArray;
      if ((_var0 === null || typeof _var0 === 'undefined') || (notificationArray.length === 0)) {
        return null;
      }
      return notificationArray[0];
      return;
    }
    if (arguments.length === 2) {
      clientId = arguments[0];
      dataJson = arguments[1];
      return this.notify(new fm.websync.notification(clientId, dataJson));
    }
  };

  /**
  	 <div>
  	 Sends an array of notifications synchronously over HTTP.
  	 </div><div>
  	 This method always executes synchronously and returns the
  	 <see cref="fm.websync.notification">Notificationsfm.websync.notification</see> it sends.
  	 </div><param name="notifications">The notifications to send.</param><returns>The completed notifications.</returns>
  
  	@function notifyMany
  	@param {fm.array} notifications
  	@return {fm.array}
  */


  publisher.prototype.notifyMany = function() {
    var notifications, _var0;
    notifications = arguments[0];
    _var0 = notifications;
    if ((_var0 === null || typeof _var0 === 'undefined') || (notifications.length === 0)) {
      throw new Error("Please specify the notification(s) to send.");
    }
    return this.performNotify(notifications);
  };

  /**
  
  	@function performNotify
  	@param {fm.array} requestNotifications
  	@return {fm.array}
  */


  publisher.prototype.performNotify = function() {
    var args, args3, notificationArray, requestMessages, requestNotifications, responseArgs, _var0;
    requestNotifications = arguments[0];
    args3 = new fm.websync.publisherNotifyRequestArgs();
    args3.setRequests(requestNotifications);
    if (this.raiseRequestEvent(fm.websync.publisher._onNotifyRequest, args3)) {
      requestMessages = fm.websync.notification.toMessages(requestNotifications);
      responseArgs = this.send(requestMessages, this.getRequestUrl());
      notificationArray = fm.websync.notification.fromMessages(responseArgs.getResponses());
      args = new fm.websync.publisherNotifyResponseArgs();
      args.setRequests(requestNotifications);
      args.setResponses(notificationArray);
      this.raiseResponseEvent(fm.websync.publisher._onNotifyResponse, args, responseArgs);
      _var0 = responseArgs.getException();
      if (_var0 !== null && typeof _var0 !== 'undefined') {
        throw responseArgs.getException();
      }
      return notificationArray;
    }
    return null;
  };

  /**
  
  	@function performPublish
  	@param {fm.array} requestPublications
  	@return {fm.array}
  */


  publisher.prototype.performPublish = function() {
    var args, args3, publicationArray, requestMessages, requestPublications, responseArgs, _var0;
    requestPublications = arguments[0];
    args3 = new fm.websync.publisherPublishRequestArgs();
    args3.setRequests(requestPublications);
    if (this.raiseRequestEvent(fm.websync.publisher._onPublishRequest, args3)) {
      requestMessages = fm.websync.publication.toMessages(requestPublications);
      responseArgs = this.send(requestMessages, this.getRequestUrl());
      publicationArray = fm.websync.publication.fromMessages(responseArgs.getResponses());
      args = new fm.websync.publisherPublishResponseArgs();
      args.setRequests(requestPublications);
      args.setResponses(publicationArray);
      this.raiseResponseEvent(fm.websync.publisher._onPublishResponse, args, responseArgs);
      _var0 = responseArgs.getException();
      if (_var0 !== null && typeof _var0 !== 'undefined') {
        throw responseArgs.getException();
      }
      return publicationArray;
    }
    return null;
  };

  /**
  
  	@function processRequestUrl
  	@param {fm.string} requestUrl
  	@return {fm.string}
  */


  publisher.prototype.processRequestUrl = function() {
    var flag, requestUrl, str, _var0, _var1;
    requestUrl = arguments[0];
    if (fm.stringExtensions.isNullOrEmpty(requestUrl)) {
      requestUrl = this.getRequestUrl();
    }
    flag = false;
    str = null;
    if (this.getConcurrencyMode() === fm.websync.concurrencyMode.High) {
      _var0 = new fm.holder(str);
      _var1 = fm.hashExtensions.tryGetValue(fm.websync.publisher._requestUrlCache, requestUrl, _var0);
      str = _var0.getValue();
      flag = _var1;
    }
    if (!flag) {
      str = requestUrl;
      str = fm.httpTransfer.addQueryToUrl(fm.httpTransfer.addQueryToUrl(str, "src", fm.httpWebRequestTransfer.getPlatformCode()), "AspxAutoDetectCookieSupport", "1");
      if (this.getConcurrencyMode() !== fm.websync.concurrencyMode.High) {
        return str;
      }
      fm.websync.publisher._requestUrlCache[requestUrl] = str;
    }
    return str;
  };

  /**
  	 <div>
  	 Sends a publication synchronously over HTTP.
  	 </div><div>
  	 This method always executes synchronously and returns the
  	 <see cref="fm.websync.publication">fm.websync.publication</see> it automatically creates.
  	 </div><param name="channel">The channel to which the data should be sent.</param><param name="dataJson">The data to send (in JSON format).</param><param name="tag">The tag that identifies the contents of the payload.</param><returns>The generated publication.</returns>
  
  	@function publish
  	@param {fm.string} channel
  	@param {fm.string} dataJson
  	@param {fm.string} tag
  	@return {fm.websync.publication}
  */


  publisher.prototype.publish = function() {
    var channel, dataJson, publication, publicationArray, tag, _var0;
    if (arguments.length === 3) {
      channel = arguments[0];
      dataJson = arguments[1];
      tag = arguments[2];
      return this.publish(new fm.websync.publication(channel, dataJson, tag));
      return;
    }
    if (arguments.length === 1) {
      publication = arguments[0];
      publicationArray = this.publishMany([publication]);
      _var0 = publicationArray;
      if ((_var0 === null || typeof _var0 === 'undefined') || (publicationArray.length === 0)) {
        return null;
      }
      return publicationArray[0];
      return;
    }
    if (arguments.length === 2) {
      channel = arguments[0];
      dataJson = arguments[1];
      return this.publish(new fm.websync.publication(channel, dataJson));
    }
  };

  /**
  	 <div>
  	 Sends an array of publications synchronously over HTTP.
  	 </div><div>
  	 This method always executes synchronously and returns the
  	 <see cref="fm.websync.publication">Publicationsfm.websync.publication</see> it sends.
  	 </div><param name="publications">The publications to send.</param><returns>The completed publications.</returns>
  
  	@function publishMany
  	@param {fm.array} publications
  	@return {fm.array}
  */


  publisher.prototype.publishMany = function() {
    var publications, _var0;
    publications = arguments[0];
    _var0 = publications;
    if ((_var0 === null || typeof _var0 === 'undefined') || (publications.length === 0)) {
      throw new Error("Please specify the publication(s) to send.");
    }
    return this.performPublish(publications);
  };

  /**
  
  	@function raiseEvent
  	@param {fm.doubleAction} eventMethod
  	@param {fm.object} args
  	@return {void}
  */


  publisher.prototype.raiseEvent = function() {
    var args, eventMethod, _var0;
    eventMethod = arguments[0];
    args = arguments[1];
    args.setPublisher(this);
    _var0 = eventMethod;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      return eventMethod(this, args);
    }
  };

  /**
  
  	@function raiseRequestEvent
  	@param {fm.doubleAction} eventMethod
  	@param {fm.object} args
  	@return {fm.boolean}
  */


  publisher.prototype.raiseRequestEvent = function() {
    var args, eventMethod;
    eventMethod = arguments[0];
    args = arguments[1];
    this.raiseEvent(eventMethod, args);
    return !args.getCancel();
  };

  /**
  
  	@function raiseResponseEvent
  	@param {fm.doubleAction} eventMethod
  	@param {fm.object} args
  	@param {fm.websync.publisherResponseArgs} responseArgs
  	@return {void}
  */


  publisher.prototype.raiseResponseEvent = function() {
    var args, eventMethod, responseArgs;
    eventMethod = arguments[0];
    args = arguments[1];
    responseArgs = arguments[2];
    args.setException(responseArgs.getException());
    return this.raiseEvent(eventMethod, args);
  };

  /**
  
  	@function send
  	@param {fm.array} requestMessages
  	@param {fm.string} url
  	@return {fm.websync.publisherResponseArgs}
  */


  publisher.prototype.send = function() {
    var args2, args3, args4, args5, args6, httpMessageTransfer, message, requestArgs, requestMessages, url, _i, _len, _var0, _var1, _var2;
    requestMessages = arguments[0];
    url = arguments[1];
    url = this.processRequestUrl(url);
    _var0 = requestMessages;
    for (_i = 0, _len = _var0.length; _i < _len; _i++) {
      message = _var0[_i];
      if (this.getDisableBinary()) {
        message.setDisableBinary(this.getDisableBinary());
      }
    }
    args6 = new fm.websync.messageRequestArgs(this.createHeaders());
    args6.setMessages(requestMessages);
    args6.setOnRequestCreated(this.internalOnRequestCreated);
    args6.setOnResponseReceived(this.internalOnResponseReceived);
    args6.setOnHttpRequestCreated(this.internalOnHttpRequestCreated);
    args6.setOnHttpResponseReceived(this.internalOnHttpResponseReceived);
    args6.setSender(this);
    args6.setTimeout(this.getRequestTimeout());
    args6.setUrl(url);
    requestArgs = args6;
    httpMessageTransfer = fm.websync.messageTransferFactory.getHttpMessageTransfer();
    args2 = httpMessageTransfer.send(requestArgs);
    try {
      httpMessageTransfer.shutdown();
    } catch (exception1) {

    } finally {

    }
    _var1 = args2.getException();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      args3 = new fm.websync.publisherResponseArgs();
      args3.setException(args2.getException());
      return args3;
    }
    _var2 = args2.getMessages();
    if ((_var2 === null || typeof _var2 === 'undefined') || (args2.getMessages().length === 0)) {
      args4 = new fm.websync.publisherResponseArgs();
      args4.setException(new Error("Invalid response received from server."));
      return args4;
    }
    args5 = new fm.websync.publisherResponseArgs();
    args5.setResponses(args2.getMessages());
    return args5;
  };

  publisher._requestUrlCache = {};

  publisher._requestUrlCacheLock = new fm.object();

  return publisher;

}).call(this, fm.websync.baseClient);


/**
@class fm.websync.record
 <div>
 A key-value record for binding to a client.
 </div>

@extends fm.dynamic
*/


fm.websync.record = (function(_super) {

  __extends(record, _super);

  /**
  	@ignore 
  	@description
  */


  record.prototype.__key = null;

  /**
  	@ignore 
  	@description
  */


  record.prototype.__priv = false;

  /**
  	@ignore 
  	@description
  */


  record.prototype.__valueJson = null;

  /**
  	@ignore 
  	@description
  */


  record.prototype._validate = false;

  /**
  	@ignore 
  	@description
  */


  function record() {
    this.setValue = __bind(this.setValue, this);

    this.getValue = __bind(this.getValue, this);

    this.toJson = __bind(this.toJson, this);

    this.setValueJson = __bind(this.setValueJson, this);

    this.setValidate = __bind(this.setValidate, this);

    this.setPrivate = __bind(this.setPrivate, this);

    this.setKey = __bind(this.setKey, this);

    this.getValueJson = __bind(this.getValueJson, this);

    this.getValidate = __bind(this.getValidate, this);

    this.getPrivate = __bind(this.getPrivate, this);

    this.getKey = __bind(this.getKey, this);

    this.getHashCode = __bind(this.getHashCode, this);

    this.equals = __bind(this.equals, this);

    this.duplicate = __bind(this.duplicate, this);

    var key, priv, valueJson;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      record.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    if (arguments.length === 1) {
      key = arguments[0];
      record.call(this, key, null);
      return;
    }
    if (arguments.length === 2) {
      key = arguments[0];
      valueJson = arguments[1];
      record.call(this, key, valueJson, false);
      return;
    }
    if (arguments.length === 3) {
      key = arguments[0];
      valueJson = arguments[1];
      priv = arguments[2];
      record.__super__.constructor.call(this);
      this.setValidate(true);
      this.setKey(key);
      this.setValueJson(valueJson);
      this.setPrivate(priv);
      return;
    }
  }

  /**
  	 <div>
  	 Deserializes a record from JSON.
  	 </div><param name="recordJson">A JSON string to deserialize.</param><returns>A deserialized record.</returns>
  
  	@function fromJson
  	@param {fm.string} recordJson
  	@return {fm.websync.record}
  */


  record.fromJson = function() {
    var recordJson;
    recordJson = arguments[0];
    return fm.websync.serializer.deserializeRecord(recordJson);
  };

  /**
  	 <div>
  	 Deserializes a list of records from JSON.
  	 </div><param name="recordsJson">A JSON string to deserialize.</param><returns>A deserialized list of records.</returns>
  
  	@function fromJsonMultiple
  	@param {fm.string} recordsJson
  	@return {fm.array}
  */


  record.fromJsonMultiple = function() {
    var recordsJson;
    recordsJson = arguments[0];
    return fm.websync.serializer.deserializeRecordArray(recordsJson);
  };

  /**
  	 <div>
  	 Serializes a record to JSON.
  	 </div><param name="record">A record to serialize.</param><returns>A JSON-serialized record.</returns>
  
  	@function toJson
  	@param {fm.websync.record} record
  	@return {fm.string}
  */


  record.toJson = function() {
    var record;
    record = arguments[0];
    return fm.websync.serializer.serializeRecord(record);
  };

  /**
  	 <div>
  	 Serializes a list of records to JSON.
  	 </div><param name="records">A list of records to serialize.</param><returns>A JSON-serialized array of records.</returns>
  
  	@function toJsonMultiple
  	@param {fm.array} records
  	@return {fm.string}
  */


  record.toJsonMultiple = function() {
    var records;
    records = arguments[0];
    return fm.websync.serializer.serializeRecordArray(records);
  };

  /**
  	 <div>
  	 Creates a deep clone of this record.
  	 </div><returns>A deep clone of this record.</returns>
  
  	@function duplicate
  	@return {fm.websync.record}
  */


  record.prototype.duplicate = function() {
    return new fm.websync.record(this.getKey(), this.getValueJson(), this.getPrivate());
  };

  /**
  	 <div>
  	 Determines whether the specified object is equal to this instance.
  	 </div><param name="obj">The object to compare with this instance.</param><returns>
  	 <c>true</c> if the specified object is equal to this instance; otherwise, <c>false</c>.
  	 </returns>
  
  	@function equals
  	@param {fm.object} obj
  	@return {fm.boolean}
  */


  record.prototype.equals = function() {
    var obj, record;
    obj = arguments[0];
    record = fm.global.tryCast(obj, fm.websync.record);
    return record === this;
  };

  /**
  	 <div>
  	 Returns a hash code for this instance.
  	 </div><returns>
  	 A hash code for this instance, suitable for use in hashing algorithms and data structures like a hash table.
  	 </returns>
  
  	@function getHashCode
  	@return {fm.int}
  */


  record.prototype.getHashCode = function() {
    var num, _var0, _var1;
    num = 17;
    _var0 = this.getKey();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      num = (num * 23) + this.getKey().hashCode();
    }
    _var1 = this.getValueJson();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      num = (num * 23) + this.getValueJson().hashCode();
    }
    return (num * 23) + this.getPrivate().hashCode();
  };

  /**
  	 <div>
  	 Gets the key used to locate the value.
  	 </div>
  
  	@function getKey
  	@return {fm.string}
  */


  record.prototype.getKey = function() {
    return this.__key;
  };

  /**
  	 <div>
  	 Gets the flag that indicates whether or not the record is (to be) hidden from other
  	 clients. If <c>true</c>, the record will only be visible to the source client
  	 and the server. If <c>false</c> or <c>null</c>, the record will be publicly
  	 visible to other clients. Defaults to <c>null</c>.
  	 </div>
  
  	@function getPrivate
  	@return {fm.boolean}
  */


  record.prototype.getPrivate = function() {
    return this.__priv;
  };

  /**
  	 <div>
  	 Gets whether to skip validation while deserializing.
  	 </div>
  
  	@function getValidate
  	@return {fm.boolean}
  */


  record.prototype.getValidate = function() {
    return this._validate;
  };

  /**
  	 <div>
  	 Gets the record value.  This must be valid JSON.
  	 </div>
  
  	@function getValueJson
  	@return {fm.string}
  */


  record.prototype.getValueJson = function() {
    return this.__valueJson;
  };

  /**
  	 <div>
  	 Sets the key used to locate the value.
  	 </div>
  
  	@function setKey
  	@param {fm.string} value
  	@return {void}
  */


  record.prototype.setKey = function() {
    var value, _var0;
    value = arguments[0];
    _var0 = value;
    if (_var0 === null || typeof _var0 === 'undefined') {
      throw new Error("key cannot be null.");
    }
    this.__key = value;
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the flag that indicates whether or not the record is (to be) hidden from other
  	 clients. If <c>true</c>, the record will only be visible to the source client
  	 and the server. If <c>false</c> or <c>null</c>, the record will be publicly
  	 visible to other clients. Defaults to <c>null</c>.
  	 </div>
  
  	@function setPrivate
  	@param {fm.boolean} value
  	@return {void}
  */


  record.prototype.setPrivate = function() {
    var value;
    value = arguments[0];
    this.__priv = value;
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets whether to skip validation while deserializing.
  	 </div>
  
  	@function setValidate
  	@param {fm.boolean} value
  	@return {void}
  */


  record.prototype.setValidate = function() {
    var value;
    value = arguments[0];
    return this._validate = value;
  };

  /**
  	 <div>
  	 Sets the record value.  This must be valid JSON.
  	 </div>
  
  	@function setValueJson
  	@param {fm.string} value
  	@return {void}
  */


  record.prototype.setValueJson = function() {
    var value, _var0;
    value = arguments[0];
    _var0 = value;
    if (!((!this.getValidate() || (_var0 === null || typeof _var0 === 'undefined')) || fm.serializer.isValidJson(value))) {
      throw new Error("The value is not valid JSON.");
    }
    this.__valueJson = value;
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Serializes the record to JSON.
  	 </div><returns>The record in JSON-serialized format.</returns>
  
  	@function toJson
  	@return {fm.string}
  */


  record.prototype.toJson = function() {
    return fm.websync.record.toJson(this);
  };

  /**
  
  	@function getValue
  	@return {fm.hash}
  */


  record.prototype.getValue = function() {
    return fm.json.deserialize(this.getValueJson.apply(this, arguments));
  };

  /**
  
  	@function setValue
  	@param {fm.hash} value
  	@return {}
  */


  record.prototype.setValue = function() {
    var value;
    value = arguments[0];
    arguments[arguments.length - 1] = fm.json.serialize(arguments[arguments.length - 1]);
    return this.setValueJson.apply(this, arguments);
  };

  return record;

}).call(this, fm.dynamic);


/**
@class fm.websync.serializer
 <div>
 Provides methods for serializing/deserializing WebSync objects.
 </div>

@extends fm.object
*/


fm.websync.serializer = (function(_super) {

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
  
  	@function createAdvice
  	@return {fm.websync.advice}
  */


  serializer.createAdvice = function() {
    return new fm.websync.advice();
  };

  /**
  
  	@function createBaseAdvice
  	@return {fm.websync.baseAdvice}
  */


  serializer.createBaseAdvice = function() {
    return new fm.websync.baseAdvice();
  };

  /**
  
  	@function createBoundRecords
  	@return {fm.hash}
  */


  serializer.createBoundRecords = function() {
    return {};
  };

  /**
  
  	@function createExtensions
  	@return {fm.websync.extensions}
  */


  serializer.createExtensions = function() {
    return new fm.websync.extensions();
  };

  /**
  
  	@function createMessage
  	@return {fm.websync.message}
  */


  serializer.createMessage = function() {
    return new fm.websync.message();
  };

  /**
  
  	@function createNotification
  	@return {fm.websync.notification}
  */


  serializer.createNotification = function() {
    return new fm.websync.notification();
  };

  /**
  
  	@function createNotifyingClient
  	@return {fm.websync.notifyingClient}
  */


  serializer.createNotifyingClient = function() {
    return new fm.websync.notifyingClient();
  };

  /**
  
  	@function createPublication
  	@return {fm.websync.publication}
  */


  serializer.createPublication = function() {
    return new fm.websync.publication();
  };

  /**
  
  	@function createPublishingClient
  	@return {fm.websync.publishingClient}
  */


  serializer.createPublishingClient = function() {
    return new fm.websync.publishingClient();
  };

  /**
  
  	@function createRecord
  	@return {fm.websync.record}
  */


  serializer.createRecord = function() {
    return new fm.websync.record("key");
  };

  /**
  
  	@function createSubscribedClient
  	@return {fm.websync.subscribedClient}
  */


  serializer.createSubscribedClient = function() {
    return new fm.websync.subscribedClient();
  };

  /**
  
  	@function createSubscription
  	@return {fm.websync.subscription}
  */


  serializer.createSubscription = function() {
    return new fm.websync.subscription("/");
  };

  /**
  	 <div>
  	 Deserializes advice from JSON.
  	 </div><param name="adviceJson">The advice (in JSON) to deserialize.</param><returns>The deserialized advice.</returns>
  
  	@function deserializeAdvice
  	@param {fm.string} adviceJson
  	@return {fm.websync.advice}
  */


  serializer.deserializeAdvice = function() {
    var adviceJson;
    adviceJson = arguments[0];
    return fm.serializer.deserializeObjectFast(adviceJson, serializer.createAdvice, serializer.deserializeAdviceCallback);
  };

  /**
  
  	@function deserializeAdviceCallback
  	@param {fm.websync.advice} advice
  	@param {fm.string} name
  	@param {fm.string} valueJson
  	@return {void}
  */


  serializer.deserializeAdviceCallback = function() {
    var advice, name, valueJson;
    advice = arguments[0];
    name = arguments[1];
    valueJson = arguments[2];
    switch (name) {
      case "long-polling":
        advice.setLongPolling(fm.websync.serializer.deserializeBaseAdvice(valueJson));
        return;
      case "callback-polling":
        advice.setCallbackPolling(fm.websync.serializer.deserializeBaseAdvice(valueJson));
        return;
    }
    return fm.websync.serializer.deserializeBaseAdviceCallback(advice, name, valueJson);
  };

  /**
  	 <div>
  	 Deserializes base advice from JSON.
  	 </div><param name="baseAdviceJson">The base advice (in JSON) to deserialize.</param><returns>The deserialized base advice.</returns>
  
  	@function deserializeBaseAdvice
  	@param {fm.string} baseAdviceJson
  	@return {fm.websync.baseAdvice}
  */


  serializer.deserializeBaseAdvice = function() {
    var baseAdviceJson;
    baseAdviceJson = arguments[0];
    return fm.serializer.deserializeObjectFast(baseAdviceJson, serializer.createBaseAdvice, serializer.deserializeBaseAdviceCallback);
  };

  /**
  
  	@function deserializeBaseAdviceCallback
  	@param {fm.websync.baseAdvice} advice
  	@param {fm.string} name
  	@param {fm.string} valueJson
  	@return {void}
  */


  serializer.deserializeBaseAdviceCallback = function() {
    var advice, name, str, valueJson, _var0;
    advice = arguments[0];
    name = arguments[1];
    valueJson = arguments[2];
    str = name;
    _var0 = str;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      if (!(str === "hosts")) {
        if (str === "interval") {
          return advice.setInterval(fm.serializer.deserializeInteger(valueJson));
        } else {
          if (str === "reconnect") {
            return advice.setReconnect(fm.websync.serializer.deserializeReconnect(valueJson));
          }
        }
      } else {
        return advice.setHosts(fm.serializer.deserializeStringArray(valueJson));
      }
    }
  };

  /**
  	 <div>
  	 Deserializes a bound records dictionary from JSON.
  	 </div><param name="boundRecordsJson">The bound records (in JSON) to deserialize.</param><returns>The deserialized bound records.</returns>
  
  	@function deserializeBoundRecords
  	@param {fm.string} boundRecordsJson
  	@return {fm.hash}
  */


  serializer.deserializeBoundRecords = function() {
    var boundRecordsJson;
    boundRecordsJson = arguments[0];
    return fm.serializer.deserializeObject(boundRecordsJson, serializer.createBoundRecords, serializer.deserializeBoundRecordsCallback);
  };

  /**
  
  	@function deserializeBoundRecordsCallback
  	@param {fm.hash} boundRecords
  	@param {fm.string} name
  	@param {fm.string} valueJson
  	@return {void}
  */


  serializer.deserializeBoundRecordsCallback = function() {
    var boundRecords, name, valueJson;
    boundRecords = arguments[0];
    name = arguments[1];
    valueJson = arguments[2];
    return boundRecords[name] = new fm.websync.record(name, fm.serializer.deserializeRaw(valueJson));
  };

  /**
  	 <div>
  	 Deserializes a Bayeux connection type from JSON.
  	 </div><param name="connectionTypeJson">The Bayeux connection type (in JSON) to deserialize.</param><returns>The deserialized Bayeux connection type.</returns>
  
  	@function deserializeConnectionType
  	@param {fm.string} connectionTypeJson
  	@return {fm.websync.connectionType}
  */


  serializer.deserializeConnectionType = function() {
    var connectionTypeJson;
    connectionTypeJson = arguments[0];
    switch (fm.serializer.deserializeString(connectionTypeJson)) {
      case "long-polling":
        return fm.websync.connectionType.LongPolling;
      case "callback-polling":
        return fm.websync.connectionType.CallbackPolling;
      case "websocket":
        return fm.websync.connectionType.WebSocket;
      case "iframe":
        return fm.websync.connectionType.IFrame;
      case "flash":
        return fm.websync.connectionType.Flash;
    }
    throw new Error("Unknown connection type.");
  };

  /**
  	 <div>
  	 Deserializes a list of Bayeux connection types from JSON.
  	 </div><param name="connectionTypesJson">The list of Bayeux connection types (in JSON) to deserialize.</param><returns>The deserialized Bayeux connection types.</returns>
  
  	@function deserializeConnectionTypeArray
  	@param {fm.string} connectionTypesJson
  	@return {fm.array}
  */


  serializer.deserializeConnectionTypeArray = function() {
    var connectionTypesJson, i, strArray, typeArray;
    connectionTypesJson = arguments[0];
    if (((fm.stringExtensions.isNullOrEmpty(connectionTypesJson) || (connectionTypesJson === "null")) || ((connectionTypesJson.length < 2) || (connectionTypesJson.charAt(0) !== '['))) || (connectionTypesJson.charAt(connectionTypesJson.length - 1) !== ']')) {
      return null;
    }
    connectionTypesJson = fm.stringExtensions.substring(connectionTypesJson, 1, connectionTypesJson.length - 2);
    strArray = fm.stringExtensions.split(connectionTypesJson, [',']);
    typeArray = [];
    i = 0;
    while (i < strArray.length) {
      try {
        typeArray[i] = fm.websync.serializer.deserializeConnectionType(strArray[i]);
      } finally {
        i++;
      }
    }
    return typeArray;
  };

  /**
  	 <div>
  	 Deserializes an extensions library from a JSON object.
  	 </div><param name="extensionsJson">A JSON object to deserialize.</param><returns>A deserialized extensions library.</returns>
  
  	@function deserializeExtensions
  	@param {fm.string} extensionsJson
  	@return {fm.websync.extensions}
  */


  serializer.deserializeExtensions = function() {
    var extensionsJson;
    extensionsJson = arguments[0];
    return fm.serializer.deserializeObjectFast(extensionsJson, serializer.createExtensions, serializer.deserializeExtensionsCallback);
  };

  /**
  
  	@function deserializeExtensionsCallback
  	@param {fm.websync.extensions} extensions
  	@param {fm.string} name
  	@param {fm.string} valueJson
  	@return {void}
  */


  serializer.deserializeExtensionsCallback = function() {
    var extensions, name, valueJson;
    extensions = arguments[0];
    name = arguments[1];
    valueJson = arguments[2];
    return extensions.setValueJson(name, fm.serializer.deserializeRaw(valueJson), false);
  };

  /**
  	 <div>
  	 Deserializes a message from JSON.
  	 </div><param name="messageJson">The message (in JSON) to deserialize.</param><returns>The deserialized message.</returns>
  
  	@function deserializeMessage
  	@param {fm.string} messageJson
  	@return {fm.websync.message}
  */


  serializer.deserializeMessage = function() {
    var messageJson;
    messageJson = arguments[0];
    return fm.serializer.deserializeObjectFast(messageJson, serializer.createMessage, serializer.deserializeMessageCallback);
  };

  /**
  	 <div>
  	 Deserializes a list of messages from JSON.
  	 </div><param name="messagesJson">The messages (in JSON) to deserialize.</param><returns>The deserialized messages.</returns>
  
  	@function deserializeMessageArray
  	@param {fm.string} messagesJson
  	@return {fm.array}
  */


  serializer.deserializeMessageArray = function() {
    var list, messagesJson, _var0;
    messagesJson = arguments[0];
    list = fm.serializer.deserializeObjectArrayFast(messagesJson, serializer.createMessage, serializer.deserializeMessageCallback);
    _var0 = list;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return null;
    }
    return fm.arrayExtensions.toArray(list);
  };

  /**
  
  	@function deserializeMessageCallback
  	@param {fm.websync.message} message
  	@param {fm.string} name
  	@param {fm.string} valueJson
  	@return {void}
  */


  serializer.deserializeMessageCallback = function() {
    var message, name, nullable, str, valueJson;
    message = arguments[0];
    name = arguments[1];
    valueJson = arguments[2];
    message.setValidate(false);
    switch (name) {
      case "advice":
        message.setAdvice(fm.websync.serializer.deserializeAdvice(valueJson));
        break;
      case "binding":
        message.setRecords(fm.websync.serializer.deserializeRecordArray(valueJson));
        break;
      case "channel":
        message.setBayeuxChannel(fm.serializer.deserializeString(valueJson));
        break;
      case "clientId":
        message.setClientId(fm.serializer.deserializeGuid(valueJson));
        break;
      case "connectionType":
        message.setConnectionType(fm.websync.serializer.deserializeConnectionType(valueJson));
        break;
      case "data":
        message.setDataJson(fm.serializer.deserializeRaw(valueJson));
        break;
      case "error":
        message.setError(fm.serializer.deserializeString(valueJson));
        break;
      case "ext":
        message.setExtensions(fm.websync.serializer.deserializeExtensions(valueJson));
        break;
      case "id":
        message.setId(fm.serializer.deserializeString(valueJson));
        break;
      case "minimumVersion":
        message.setMinimumVersion(fm.serializer.deserializeString(valueJson));
        break;
      case "subscription":
        if (!fm.stringExtensions.startsWith(valueJson, "[")) {
          str = fm.serializer.deserializeString(valueJson);
          if (!fm.stringExtensions.isNullOrEmpty(str)) {
            message.setChannels([str]);
          }
          break;
        }
        message.setChannels(fm.serializer.deserializeStringArray(valueJson));
        break;
      case "successful":
        nullable = fm.serializer.deserializeBoolean(valueJson);
        message.setSuccessful(nullable === true);
        break;
      case "supportedConnectionTypes":
        message.setSupportedConnectionTypes(fm.websync.serializer.deserializeConnectionTypeArray(valueJson));
        break;
      case "timestamp":
        message.setTimestamp(fm.websync.serializer.deserializeTimestamp(valueJson));
        break;
      case "version":
        message.setVersion(fm.serializer.deserializeString(valueJson));
        break;
    }
    return message.setValidate(true);
  };

  /**
  	 <div>
  	 Deserializes a notification from JSON.
  	 </div><param name="notificationJson">The notification (in JSON) to deserialize.</param><returns>The deserialized notification.</returns>
  
  	@function deserializeNotification
  	@param {fm.string} notificationJson
  	@return {fm.websync.notification}
  */


  serializer.deserializeNotification = function() {
    var notificationJson;
    notificationJson = arguments[0];
    return fm.serializer.deserializeObjectFast(notificationJson, serializer.createNotification, serializer.deserializeNotificationCallback);
  };

  /**
  	 <div>
  	 Deserializes a list of Bayeux notifications from JSON.
  	 </div><param name="notificationsJson">The Bayeux notifications (in JSON) to deserialize.</param><returns>The deserialized Bayeux notifications.</returns>
  
  	@function deserializeNotificationArray
  	@param {fm.string} notificationsJson
  	@return {fm.array}
  */


  serializer.deserializeNotificationArray = function() {
    var list, notificationsJson, _var0;
    notificationsJson = arguments[0];
    list = fm.serializer.deserializeObjectArrayFast(notificationsJson, serializer.createNotification, serializer.deserializeNotificationCallback);
    _var0 = list;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return null;
    }
    return fm.arrayExtensions.toArray(list);
  };

  /**
  
  	@function deserializeNotificationCallback
  	@param {fm.websync.notification} notification
  	@param {fm.string} name
  	@param {fm.string} valueJson
  	@return {void}
  */


  serializer.deserializeNotificationCallback = function() {
    var name, notification, nullable, str, valueJson, _var0;
    notification = arguments[0];
    name = arguments[1];
    valueJson = arguments[2];
    notification.setValidate(false);
    str = name;
    _var0 = str;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      if (!(str === "data")) {
        if (str === "ext") {
          notification.setExtensions(fm.websync.serializer.deserializeExtensions(valueJson));
        } else {
          if (str === "successful") {
            nullable = fm.serializer.deserializeBoolean(valueJson);
            notification.setSuccessful(nullable === true);
          } else {
            if (str === "error") {
              notification.setError(fm.serializer.deserializeString(valueJson));
            } else {
              if (str === "timestamp") {
                notification.setTimestamp(fm.websync.serializer.deserializeTimestamp(valueJson));
              }
            }
          }
        }
      } else {
        notification.setDataJson(fm.serializer.deserializeRaw(valueJson));
      }
    }
    return notification.setValidate(true);
  };

  /**
  	 <div>
  	 Deserializes a notifying client from JSON.
  	 </div><param name="notifyingClientJson">The notifying client (in JSON) to deserialize.</param><returns>The deserialized notifying client.</returns>
  
  	@function deserializeNotifyingClient
  	@param {fm.string} notifyingClientJson
  	@return {fm.websync.notifyingClient}
  */


  serializer.deserializeNotifyingClient = function() {
    var notifyingClientJson;
    notifyingClientJson = arguments[0];
    return fm.serializer.deserializeObjectFast(notifyingClientJson, serializer.createNotifyingClient, serializer.deserializeNotifyingClientCallback);
  };

  /**
  
  	@function deserializeNotifyingClientCallback
  	@param {fm.websync.notifyingClient} notifyingClient
  	@param {fm.string} name
  	@param {fm.string} valueJson
  	@return {void}
  */


  serializer.deserializeNotifyingClientCallback = function() {
    var name, notifyingClient, str, valueJson, _var0;
    notifyingClient = arguments[0];
    name = arguments[1];
    valueJson = arguments[2];
    str = name;
    _var0 = str;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      if (!(str === "clientId")) {
        if (str === "boundRecords") {
          return notifyingClient.setBoundRecords(fm.websync.serializer.deserializeBoundRecords(valueJson));
        }
      } else {
        return notifyingClient.setClientId(fm.serializer.deserializeGuid(valueJson));
      }
    }
  };

  /**
  	 <div>
  	 Deserializes a publication from JSON.
  	 </div><param name="publicationJson">The publication (in JSON) to deserialize.</param><returns>The deserialized publication.</returns>
  
  	@function deserializePublication
  	@param {fm.string} publicationJson
  	@return {fm.websync.publication}
  */


  serializer.deserializePublication = function() {
    var publicationJson;
    publicationJson = arguments[0];
    return fm.serializer.deserializeObjectFast(publicationJson, serializer.createPublication, serializer.deserializePublicationCallback);
  };

  /**
  	 <div>
  	 Deserializes a list of publications from JSON.
  	 </div><param name="publicationsJson">The publications (in JSON) to deserialize.</param><returns>The deserialized publications.</returns>
  
  	@function deserializePublicationArray
  	@param {fm.string} publicationsJson
  	@return {fm.array}
  */


  serializer.deserializePublicationArray = function() {
    var list, publicationsJson, _var0;
    publicationsJson = arguments[0];
    list = fm.serializer.deserializeObjectArrayFast(publicationsJson, serializer.createPublication, serializer.deserializePublicationCallback);
    _var0 = list;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return null;
    }
    return fm.arrayExtensions.toArray(list);
  };

  /**
  
  	@function deserializePublicationCallback
  	@param {fm.websync.publication} publication
  	@param {fm.string} name
  	@param {fm.string} valueJson
  	@return {void}
  */


  serializer.deserializePublicationCallback = function() {
    var name, nullable, publication, str, valueJson, _var0;
    publication = arguments[0];
    name = arguments[1];
    valueJson = arguments[2];
    publication.setValidate(false);
    str = name;
    _var0 = str;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      if (!(str === "channel")) {
        if (str === "data") {
          publication.setDataJson(fm.serializer.deserializeRaw(valueJson));
        } else {
          if (str === "ext") {
            publication.setExtensions(fm.websync.serializer.deserializeExtensions(valueJson));
          } else {
            if (str === "successful") {
              nullable = fm.serializer.deserializeBoolean(valueJson);
              publication.setSuccessful(nullable === true);
            } else {
              if (str === "error") {
                publication.setError(fm.serializer.deserializeString(valueJson));
              } else {
                if (str === "timestamp") {
                  publication.setTimestamp(fm.websync.serializer.deserializeTimestamp(valueJson));
                }
              }
            }
          }
        }
      } else {
        publication.setChannel(fm.serializer.deserializeString(valueJson));
      }
    }
    return publication.setValidate(true);
  };

  /**
  	 <div>
  	 Deserializes a publishing client from JSON.
  	 </div><param name="publishingClientJson">The publishing client (in JSON) to deserialize.</param><returns>The deserialized publishing client.</returns>
  
  	@function deserializePublishingClient
  	@param {fm.string} publishingClientJson
  	@return {fm.websync.publishingClient}
  */


  serializer.deserializePublishingClient = function() {
    var publishingClientJson;
    publishingClientJson = arguments[0];
    return fm.serializer.deserializeObjectFast(publishingClientJson, serializer.createPublishingClient, serializer.deserializePublishingClientCallback);
  };

  /**
  
  	@function deserializePublishingClientCallback
  	@param {fm.websync.publishingClient} publishingClient
  	@param {fm.string} name
  	@param {fm.string} valueJson
  	@return {void}
  */


  serializer.deserializePublishingClientCallback = function() {
    var name, publishingClient, str, valueJson, _var0;
    publishingClient = arguments[0];
    name = arguments[1];
    valueJson = arguments[2];
    str = name;
    _var0 = str;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      if (!(str === "clientId")) {
        if (str === "boundRecords") {
          return publishingClient.setBoundRecords(fm.websync.serializer.deserializeBoundRecords(valueJson));
        }
      } else {
        return publishingClient.setClientId(fm.serializer.deserializeGuid(valueJson));
      }
    }
  };

  /**
  	 <div>
  	 Deserializes a reconnect from JSON.
  	 </div><param name="reconnectJson">The reconnect (in JSON) to deserialize.</param><returns></returns>
  
  	@function deserializeReconnect
  	@param {fm.string} reconnectJson
  	@return {fm.websync.reconnect}
  */


  serializer.deserializeReconnect = function() {
    var reconnectJson;
    reconnectJson = arguments[0];
    switch (fm.serializer.deserializeString(reconnectJson)) {
      case "retry":
        return fm.websync.reconnect.Retry;
      case "handshake":
        return fm.websync.reconnect.Handshake;
      case "none":
        return fm.websync.reconnect.None;
    }
    throw new Error("Unknown reconnect advice.");
  };

  /**
  	 <div>
  	 Deserializes a record from JSON.
  	 </div><param name="recordJson">The record (in JSON) to deserialize.</param><returns>The deserialized record.</returns>
  
  	@function deserializeRecord
  	@param {fm.string} recordJson
  	@return {fm.websync.record}
  */


  serializer.deserializeRecord = function() {
    var recordJson;
    recordJson = arguments[0];
    return fm.serializer.deserializeObjectFast(recordJson, serializer.createRecord, serializer.deserializeRecordCallback);
  };

  /**
  	 <div>
  	 Deserializes a list of records from JSON.
  	 </div><param name="recordsJson">The records (in JSON) to deserialize.</param><returns>The deserialized records.</returns>
  
  	@function deserializeRecordArray
  	@param {fm.string} recordsJson
  	@return {fm.array}
  */


  serializer.deserializeRecordArray = function() {
    var list, recordsJson, _var0;
    recordsJson = arguments[0];
    list = fm.serializer.deserializeObjectArrayFast(recordsJson, serializer.createRecord, serializer.deserializeRecordCallback);
    _var0 = list;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return null;
    }
    return fm.arrayExtensions.toArray(list);
  };

  /**
  
  	@function deserializeRecordCallback
  	@param {fm.websync.record} record
  	@param {fm.string} name
  	@param {fm.string} valueJson
  	@return {void}
  */


  serializer.deserializeRecordCallback = function() {
    var name, nullable, record, str, valueJson, _var0;
    record = arguments[0];
    name = arguments[1];
    valueJson = arguments[2];
    record.setValidate(false);
    str = name;
    _var0 = str;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      if (!(str === "key")) {
        if (str === "private") {
          nullable = fm.serializer.deserializeBoolean(valueJson);
          record.setPrivate(nullable === true);
        } else {
          if (str === "value") {
            record.setValueJson(fm.serializer.deserializeRaw(valueJson));
          }
        }
      } else {
        record.setKey(fm.serializer.deserializeString(valueJson));
      }
    }
    return record.setValidate(true);
  };

  /**
  	 <div>
  	 Deserializes a subscribed client from JSON.
  	 </div><param name="subscribedClientJson">The subscribed client (in JSON) to deserialize.</param><returns>The deserialized subscribed client.</returns>
  
  	@function deserializeSubscribedClient
  	@param {fm.string} subscribedClientJson
  	@return {fm.websync.subscribedClient}
  */


  serializer.deserializeSubscribedClient = function() {
    var subscribedClientJson;
    subscribedClientJson = arguments[0];
    return fm.serializer.deserializeObjectFast(subscribedClientJson, serializer.createSubscribedClient, serializer.deserializeSubscribedClientCallback);
  };

  /**
  	 <div>
  	 Deserializes the subscribed client objects from JSON.
  	 </div><param name="subscribedClientsJson">The JSON-encoded subscribed clients objects to deserialize.</param><returns>The deserialized subscribed client objects.</returns>
  
  	@function deserializeSubscribedClientArray
  	@param {fm.string} subscribedClientsJson
  	@return {fm.array}
  */


  serializer.deserializeSubscribedClientArray = function() {
    var list, subscribedClientsJson, _var0;
    subscribedClientsJson = arguments[0];
    list = fm.serializer.deserializeObjectArrayFast(subscribedClientsJson, serializer.createSubscribedClient, serializer.deserializeSubscribedClientCallback);
    _var0 = list;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return null;
    }
    return fm.arrayExtensions.toArray(list);
  };

  /**
  
  	@function deserializeSubscribedClientCallback
  	@param {fm.websync.subscribedClient} subscribedClient
  	@param {fm.string} name
  	@param {fm.string} valueJson
  	@return {void}
  */


  serializer.deserializeSubscribedClientCallback = function() {
    var name, str, subscribedClient, valueJson, _var0;
    subscribedClient = arguments[0];
    name = arguments[1];
    valueJson = arguments[2];
    str = name;
    _var0 = str;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      if (!(str === "clientId")) {
        if (str === "boundRecords") {
          return subscribedClient.setBoundRecords(fm.websync.serializer.deserializeBoundRecords(valueJson));
        }
      } else {
        return subscribedClient.setClientId(fm.serializer.deserializeGuid(valueJson));
      }
    }
  };

  /**
  
  	@function deserializeSubscription
  	@param {fm.string} subscriptionJson
  	@return {fm.websync.subscription}
  */


  serializer.deserializeSubscription = function() {
    var subscriptionJson;
    subscriptionJson = arguments[0];
    return fm.serializer.deserializeObjectFast(subscriptionJson, serializer.createSubscription, serializer.deserializeSubscriptionCallback);
  };

  /**
  
  	@function deserializeSubscriptionArray
  	@param {fm.string} subscriptionsJson
  	@return {fm.array}
  */


  serializer.deserializeSubscriptionArray = function() {
    var list, subscriptionsJson, _var0;
    subscriptionsJson = arguments[0];
    list = fm.serializer.deserializeObjectArrayFast(subscriptionsJson, serializer.createSubscription, serializer.deserializeSubscriptionCallback);
    _var0 = list;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return null;
    }
    return fm.arrayExtensions.toArray(list);
  };

  /**
  
  	@function deserializeSubscriptionCallback
  	@param {fm.websync.subscription} subscription
  	@param {fm.string} name
  	@param {fm.string} valueJson
  	@return {void}
  */


  serializer.deserializeSubscriptionCallback = function() {
    var name, str, subscription, valueJson, _var0;
    subscription = arguments[0];
    name = arguments[1];
    valueJson = arguments[2];
    str = name;
    _var0 = str;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      if (!(str === "channel")) {
        if (str === "tag") {
          return subscription.setTag(fm.serializer.deserializeString(valueJson));
        }
      } else {
        return subscription.setChannel(fm.serializer.deserializeString(valueJson));
      }
    }
  };

  /**
  	 <div>
  	 Converts a timestamp from a Bayeux JSON string to a DateTime object.
  	 </div><param name="timestampJson">The timestamp as a Bayeux JSON string.</param><returns>The timestamp as a DateTime object.</returns>
  
  	@function deserializeTimestamp
  	@param {fm.string} timestampJson
  	@return {fm.dateTime}
  */


  serializer.deserializeTimestamp = function() {
    var intResult, num2, num3, num4, num5, num6, s, str, str10, str2, str3, str5, str6, str7, str8, strArray, timestampJson, utcNow, _var0, _var1, _var10, _var11, _var2, _var3, _var4, _var5, _var6, _var7, _var8, _var9;
    timestampJson = arguments[0];
    str = fm.serializer.deserializeString(timestampJson);
    utcNow = fm.dateTime.getUtcNow();
    if (!fm.stringExtensions.isNullOrEmpty(str)) {
      strArray = fm.stringExtensions.split(str, ['T']);
      if (strArray.length !== 2) {
        return utcNow;
      }
      str2 = strArray[0];
      str3 = strArray[1];
      strArray = fm.stringExtensions.split(str2, ['-']);
      if (strArray.length !== 3) {
        return utcNow;
      }
      s = strArray[0];
      str5 = strArray[1];
      str6 = strArray[2];
      strArray = fm.stringExtensions.split(str3, [':']);
      if (strArray.length !== 3) {
        return utcNow;
      }
      str7 = strArray[0];
      str8 = strArray[1];
      strArray = fm.stringExtensions.split(strArray[2], ['.']);
      if (strArray.length !== 2) {
        return utcNow;
      }
      str10 = strArray[0];
      intResult = 0;
      num2 = 0;
      num3 = 0;
      num4 = 0;
      num5 = 0;
      num6 = 0;
      _var0 = new fm.holder(intResult);
      _var1 = fm.parseAssistant.tryParseInteger(s, _var0);
      intResult = _var0.getValue();
      _var2 = new fm.holder(num2);
      _var3 = fm.parseAssistant.tryParseInteger(str5, _var2);
      num2 = _var2.getValue();
      _var4 = new fm.holder(num3);
      _var5 = fm.parseAssistant.tryParseInteger(str6, _var4);
      num3 = _var4.getValue();
      _var6 = new fm.holder(num4);
      _var7 = fm.parseAssistant.tryParseInteger(str7, _var6);
      num4 = _var6.getValue();
      _var8 = new fm.holder(num5);
      _var9 = fm.parseAssistant.tryParseInteger(str8, _var8);
      num5 = _var8.getValue();
      _var10 = new fm.holder(num6);
      _var11 = fm.parseAssistant.tryParseInteger(str10, _var10);
      num6 = _var10.getValue();
      if ((((_var1 && _var3) && (_var5 && _var7)) && _var9) && _var11) {
        utcNow = new fm.dateTime(intResult, num2, num3, num4, num5, num6);
      }
    }
    return utcNow;
  };

  /**
  	 <div>
  	 Serializes advice to JSON.
  	 </div><param name="advice">The advice to serialize.</param><returns>The serialized advice.</returns>
  
  	@function serializeAdvice
  	@param {fm.websync.advice} advice
  	@return {fm.string}
  */


  serializer.serializeAdvice = function() {
    var advice;
    advice = arguments[0];
    return fm.serializer.serializeObjectFast(advice, serializer.serializeAdviceCallback);
  };

  /**
  
  	@function serializeAdviceCallback
  	@param {fm.websync.advice} advice
  	@param {fm.hash} jsonObject
  	@return {void}
  */


  serializer.serializeAdviceCallback = function() {
    var advice, jsonObject, _var0, _var1;
    advice = arguments[0];
    jsonObject = arguments[1];
    fm.websync.serializer.serializeBaseAdviceCallback(advice, jsonObject);
    _var0 = advice.getCallbackPolling();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      jsonObject["callback-polling"] = fm.websync.serializer.serializeBaseAdvice(advice.getCallbackPolling());
    }
    _var1 = advice.getLongPolling();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      return jsonObject["long-polling"] = fm.websync.serializer.serializeBaseAdvice(advice.getLongPolling());
    }
  };

  /**
  	 <div>
  	 Serializes base advice to JSON.
  	 </div><param name="baseAdvice">The base advice to serialize.</param><returns>The serialized base advice.</returns>
  
  	@function serializeBaseAdvice
  	@param {fm.websync.baseAdvice} baseAdvice
  	@return {fm.string}
  */


  serializer.serializeBaseAdvice = function() {
    var baseAdvice;
    baseAdvice = arguments[0];
    return fm.serializer.serializeObjectFast(baseAdvice, serializer.serializeBaseAdviceCallback);
  };

  /**
  
  	@function serializeBaseAdviceCallback
  	@param {fm.websync.baseAdvice} baseAdvice
  	@param {fm.hash} jsonObject
  	@return {void}
  */


  serializer.serializeBaseAdviceCallback = function() {
    var baseAdvice, jsonObject, _var0;
    baseAdvice = arguments[0];
    jsonObject = arguments[1];
    _var0 = baseAdvice.getHosts();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      jsonObject["hosts"] = fm.serializer.serializeStringArray(baseAdvice.getHosts());
    }
    if (baseAdvice.getInterval() !== null) {
      jsonObject["interval"] = fm.serializer.serializeInteger(baseAdvice.getInterval());
    }
    if (baseAdvice.getReconnect() !== null) {
      return jsonObject["reconnect"] = fm.websync.serializer.serializeReconnect(baseAdvice.getReconnect());
    }
  };

  /**
  	 <div>
  	 Serializes a bound records dictionary to JSON.
  	 </div><param name="boundRecords">The bound records to serialize.</param><returns>The serialized bound records.</returns>
  
  	@function serializeBoundRecords
  	@param {fm.hash} boundRecords
  	@return {fm.string}
  */


  serializer.serializeBoundRecords = function() {
    var boundRecords;
    boundRecords = arguments[0];
    return fm.serializer.serializeObject(boundRecords, serializer.serializeBoundRecordsCallback);
  };

  /**
  
  	@function serializeBoundRecordsCallback
  	@param {fm.hash} boundRecords
  	@param {fm.hash} jsonObject
  	@return {void}
  */


  serializer.serializeBoundRecordsCallback = function() {
    var boundRecords, jsonObject, str, _i, _len, _results, _var0;
    boundRecords = arguments[0];
    jsonObject = arguments[1];
    _var0 = fm.hashExtensions.getKeys(boundRecords);
    _results = [];
    for (_i = 0, _len = _var0.length; _i < _len; _i++) {
      str = _var0[_i];
      _results.push(jsonObject[str] = fm.serializer.serializeRaw(boundRecords[str].getValueJson()));
    }
    return _results;
  };

  /**
  	 <div>
  	 Serializes a Bayeux connection type to JSON.
  	 </div><param name="connectionType">The Bayeux connection type to serialize.</param><returns>The serialized Bayeux connection type.</returns>
  
  	@function serializeConnectionType
  	@param {fm.websync.connectionType} connectionType
  	@return {fm.string}
  */


  serializer.serializeConnectionType = function() {
    var connectionType, str;
    connectionType = arguments[0];
    str = null;
    switch (connectionType) {
      case fm.websync.connectionType.WebSocket:
        str = "websocket";
        break;
      case fm.websync.connectionType.LongPolling:
        str = "long-polling";
        break;
      case fm.websync.connectionType.CallbackPolling:
        str = "callback-polling";
        break;
      case fm.websync.connectionType.IFrame:
        str = "iframe";
        break;
      case fm.websync.connectionType.Flash:
        str = "flash";
        break;
    }
    return fm.serializer.serializeString(str);
  };

  /**
  	 <div>
  	 Serializes a list of Bayeux connection types to JSON.
  	 </div><param name="connectionTypes">The list of Bayeux connection types to serialize.</param><returns>The serialized Bayeux connection types.</returns>
  
  	@function serializeConnectionTypeArray
  	@param {fm.array} connectionTypes
  	@return {fm.string}
  */


  serializer.serializeConnectionTypeArray = function() {
    var connectionTypes, i, strArray;
    connectionTypes = arguments[0];
    strArray = [];
    i = 0;
    while (i < connectionTypes.length) {
      try {
        strArray[i] = fm.websync.serializer.serializeConnectionType(connectionTypes[i]);
      } finally {
        i++;
      }
    }
    return fm.stringExtensions.concat("[", fm.stringExtensions.join(",", strArray), "]");
  };

  /**
  	 <div>
  	 Serializes an extensions library to a JSON object.
  	 </div><param name="extensions">An extensions library to serialize.</param><returns>A serialized JSON object.</returns>
  
  	@function serializeExtensions
  	@param {fm.websync.extensions} extensions
  	@return {fm.string}
  */


  serializer.serializeExtensions = function() {
    var extensions;
    extensions = arguments[0];
    return fm.serializer.serializeObjectFast(extensions, serializer.serializeExtensionsCallback);
  };

  /**
  
  	@function serializeExtensionsCallback
  	@param {fm.websync.extensions} extensions
  	@param {fm.hash} jsonObject
  	@return {void}
  */


  serializer.serializeExtensionsCallback = function() {
    var extensions, jsonObject, str, _i, _len, _results, _var0;
    extensions = arguments[0];
    jsonObject = arguments[1];
    _var0 = extensions.getNames();
    _results = [];
    for (_i = 0, _len = _var0.length; _i < _len; _i++) {
      str = _var0[_i];
      _results.push(jsonObject[str] = fm.serializer.serializeRaw(extensions.getValueJson(str)));
    }
    return _results;
  };

  /**
  	 <div>
  	 Serializes a message to JSON.
  	 </div><param name="message">The message to serialize.</param><returns>The serialized message.</returns>
  
  	@function serializeMessage
  	@param {fm.websync.message} message
  	@return {fm.string}
  */


  serializer.serializeMessage = function() {
    var message;
    message = arguments[0];
    return fm.serializer.serializeObjectFast(message, serializer.serializeMessageCallback);
  };

  /**
  	 <div>
  	 Serializes a list of messages to JSON.
  	 </div><param name="messages">The messages to serialize.</param><returns>The serialized messages.</returns>
  
  	@function serializeMessageArray
  	@param {fm.array} messages
  	@return {fm.string}
  */


  serializer.serializeMessageArray = function() {
    var messages;
    messages = arguments[0];
    return fm.serializer.serializeObjectArrayFast(messages, serializer.serializeMessageCallback);
  };

  /**
  
  	@function serializeMessageCallback
  	@param {fm.websync.message} message
  	@param {fm.hash} jsonObject
  	@return {void}
  */


  serializer.serializeMessageCallback = function() {
    var jsonObject, message, _var0, _var1, _var2, _var3, _var4, _var5, _var6, _var7, _var8, _var9;
    message = arguments[0];
    jsonObject = arguments[1];
    if (message.getClientId() !== null) {
      jsonObject["clientId"] = fm.serializer.serializeGuid(message.getClientId());
    }
    if (message.getTimestamp() !== null) {
      jsonObject["timestamp"] = fm.websync.serializer.serializeTimestamp(message.getTimestamp());
    }
    _var0 = message.getAdvice();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      jsonObject["advice"] = fm.websync.serializer.serializeAdvice(message.getAdvice());
    }
    _var1 = message.getRecords();
    if ((_var1 !== null && typeof _var1 !== 'undefined') && ((message.getType() === fm.websync.messageType.Bind) || (message.getType() === fm.websync.messageType.Unbind))) {
      jsonObject["binding"] = fm.websync.serializer.serializeRecordArray(message.getRecords());
    }
    _var2 = message.getBayeuxChannel();
    if (_var2 !== null && typeof _var2 !== 'undefined') {
      jsonObject["channel"] = fm.serializer.serializeString(message.getBayeuxChannel());
    }
    if (message.getConnectionType() !== null) {
      jsonObject["connectionType"] = fm.websync.serializer.serializeConnectionType(message.getConnectionType());
    }
    _var3 = message.getDataJson();
    if (_var3 !== null && typeof _var3 !== 'undefined') {
      jsonObject["data"] = fm.serializer.serializeRaw(message.getDataJson());
    }
    _var4 = message.getError();
    if (_var4 !== null && typeof _var4 !== 'undefined') {
      jsonObject["error"] = fm.serializer.serializeString(message.getError());
    }
    if (message.getExtensions().getCount() > 0) {
      jsonObject["ext"] = fm.websync.serializer.serializeExtensions(message.getExtensions());
    }
    _var5 = message.getId();
    if (_var5 !== null && typeof _var5 !== 'undefined') {
      jsonObject["id"] = fm.serializer.serializeString(message.getId());
    }
    _var6 = message.getMinimumVersion();
    if (_var6 !== null && typeof _var6 !== 'undefined') {
      jsonObject["minimumVersion"] = fm.serializer.serializeString(message.getMinimumVersion());
    }
    _var7 = message.getChannels();
    if ((_var7 !== null && typeof _var7 !== 'undefined') && ((message.getType() === fm.websync.messageType.Subscribe) || (message.getType() === fm.websync.messageType.Unsubscribe))) {
      jsonObject["subscription"] = fm.serializer.serializeStringArray(message.getChannels());
    }
    if (message.getSuccessful()) {
      jsonObject["successful"] = fm.serializer.serializeBoolean(message.getSuccessful());
    }
    _var8 = message.getSupportedConnectionTypes();
    if (_var8 !== null && typeof _var8 !== 'undefined') {
      jsonObject["supportedConnectionTypes"] = fm.websync.serializer.serializeConnectionTypeArray(message.getSupportedConnectionTypes());
    }
    _var9 = message.getVersion();
    if (_var9 !== null && typeof _var9 !== 'undefined') {
      return jsonObject["version"] = fm.serializer.serializeString(message.getVersion());
    }
  };

  /**
  	 <div>
  	 Serializes a notification to JSON.
  	 </div><param name="notification">The notification to serialize.</param><returns>The serialized notification.</returns>
  
  	@function serializeNotification
  	@param {fm.websync.notification} notification
  	@return {fm.string}
  */


  serializer.serializeNotification = function() {
    var notification;
    notification = arguments[0];
    return fm.serializer.serializeObjectFast(notification, serializer.serializeNotificationCallback);
  };

  /**
  	 <div>
  	 Serializes a list of notifications to JSON.
  	 </div><param name="notifications">The notifications to serialize.</param><returns>The serialized notifications.</returns>
  
  	@function serializeNotificationArray
  	@param {fm.array} notifications
  	@return {fm.string}
  */


  serializer.serializeNotificationArray = function() {
    var notifications;
    notifications = arguments[0];
    return fm.serializer.serializeObjectArrayFast(notifications, serializer.serializeNotificationCallback);
  };

  /**
  
  	@function serializeNotificationCallback
  	@param {fm.websync.notification} notification
  	@param {fm.hash} jsonObject
  	@return {void}
  */


  serializer.serializeNotificationCallback = function() {
    var jsonObject, notification, _var0, _var1;
    notification = arguments[0];
    jsonObject = arguments[1];
    _var0 = notification.getError();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      jsonObject["error"] = fm.serializer.serializeString(notification.getError());
    }
    if (notification.getSuccessful()) {
      jsonObject["successful"] = fm.serializer.serializeBoolean(notification.getSuccessful());
    }
    if (notification.getTimestamp() !== null) {
      jsonObject["timestamp"] = fm.websync.serializer.serializeTimestamp(notification.getTimestamp());
    }
    if (notification.getExtensions().getCount() > 0) {
      jsonObject["ext"] = fm.websync.serializer.serializeExtensions(notification.getExtensions());
    }
    _var1 = notification.getDataJson();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      return jsonObject["data"] = fm.serializer.serializeRaw(notification.getDataJson());
    }
  };

  /**
  	 <div>
  	 Serializes a notifying client to JSON.
  	 </div><param name="notifyingClient">The notifying client to serialize.</param><returns>The serialized notifying client.</returns>
  
  	@function serializeNotifyingClient
  	@param {fm.websync.notifyingClient} notifyingClient
  	@return {fm.string}
  */


  serializer.serializeNotifyingClient = function() {
    var notifyingClient;
    notifyingClient = arguments[0];
    return fm.serializer.serializeObjectFast(notifyingClient, serializer.serializeNotifyingClientCallback);
  };

  /**
  
  	@function serializeNotifyingClientCallback
  	@param {fm.websync.notifyingClient} notifyingClient
  	@param {fm.hash} jsonObject
  	@return {void}
  */


  serializer.serializeNotifyingClientCallback = function() {
    var jsonObject, notifyingClient, _var0;
    notifyingClient = arguments[0];
    jsonObject = arguments[1];
    if (notifyingClient.getClientId() !== null) {
      jsonObject["clientId"] = fm.serializer.serializeGuid(notifyingClient.getClientId());
    }
    _var0 = notifyingClient.getBoundRecords();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      return jsonObject["boundRecords"] = fm.websync.serializer.serializeBoundRecords(notifyingClient.getBoundRecords());
    }
  };

  /**
  	 <div>
  	 Serializes a publication to JSON.
  	 </div><param name="publication">The publication to serialize.</param><returns>The serialized publication.</returns>
  
  	@function serializePublication
  	@param {fm.websync.publication} publication
  	@return {fm.string}
  */


  serializer.serializePublication = function() {
    var publication;
    publication = arguments[0];
    return fm.serializer.serializeObjectFast(publication, serializer.serializePublicationCallback);
  };

  /**
  	 <div>
  	 Serializes a list of publications to JSON.
  	 </div><param name="publications">The publications to serialize.</param><returns>The serialized publications.</returns>
  
  	@function serializePublicationArray
  	@param {fm.array} publications
  	@return {fm.string}
  */


  serializer.serializePublicationArray = function() {
    var publications;
    publications = arguments[0];
    return fm.serializer.serializeObjectArrayFast(publications, serializer.serializePublicationCallback);
  };

  /**
  
  	@function serializePublicationCallback
  	@param {fm.websync.publication} publication
  	@param {fm.hash} jsonObject
  	@return {void}
  */


  serializer.serializePublicationCallback = function() {
    var jsonObject, publication, _var0, _var1, _var2;
    publication = arguments[0];
    jsonObject = arguments[1];
    _var0 = publication.getChannel();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      jsonObject["channel"] = fm.serializer.serializeString(publication.getChannel());
    }
    _var1 = publication.getError();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      jsonObject["error"] = fm.serializer.serializeString(publication.getError());
    }
    if (publication.getSuccessful()) {
      jsonObject["successful"] = fm.serializer.serializeBoolean(publication.getSuccessful());
    }
    if (publication.getTimestamp() !== null) {
      jsonObject["timestamp"] = fm.websync.serializer.serializeTimestamp(publication.getTimestamp());
    }
    if (publication.getExtensions().getCount() > 0) {
      jsonObject["ext"] = fm.websync.serializer.serializeExtensions(publication.getExtensions());
    }
    _var2 = publication.getDataJson();
    if (_var2 !== null && typeof _var2 !== 'undefined') {
      return jsonObject["data"] = fm.serializer.serializeRaw(publication.getDataJson());
    }
  };

  /**
  	 <div>
  	 Serializes a publishing client to JSON.
  	 </div><param name="publishingClient">The publishing client to serialize.</param><returns>The serialized publishing client.</returns>
  
  	@function serializePublishingClient
  	@param {fm.websync.publishingClient} publishingClient
  	@return {fm.string}
  */


  serializer.serializePublishingClient = function() {
    var publishingClient;
    publishingClient = arguments[0];
    return fm.serializer.serializeObjectFast(publishingClient, serializer.serializePublishingClientCallback);
  };

  /**
  
  	@function serializePublishingClientCallback
  	@param {fm.websync.publishingClient} publishingClient
  	@param {fm.hash} jsonObject
  	@return {void}
  */


  serializer.serializePublishingClientCallback = function() {
    var jsonObject, publishingClient, _var0;
    publishingClient = arguments[0];
    jsonObject = arguments[1];
    if (publishingClient.getClientId() !== null) {
      jsonObject["clientId"] = fm.serializer.serializeGuid(publishingClient.getClientId());
    }
    _var0 = publishingClient.getBoundRecords();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      return jsonObject["boundRecords"] = fm.websync.serializer.serializeBoundRecords(publishingClient.getBoundRecords());
    }
  };

  /**
  	 <div>
  	 Serializes a reconnect to JSON.
  	 </div><param name="reconnect">The reconnect to serialize.</param><returns></returns>
  
  	@function serializeReconnect
  	@param {fm.websync.reconnect} reconnect
  	@return {fm.string}
  */


  serializer.serializeReconnect = function() {
    var reconnect, str;
    reconnect = arguments[0];
    str = null;
    switch (reconnect) {
      case fm.websync.reconnect.Retry:
        str = "retry";
        break;
      case fm.websync.reconnect.Handshake:
        str = "handshake";
        break;
      case fm.websync.reconnect.None:
        str = "none";
        break;
    }
    return fm.serializer.serializeString(str);
  };

  /**
  	 <div>
  	 Serializes a record to JSON.
  	 </div><param name="record">The record to serialize.</param><returns>The serialized record.</returns>
  
  	@function serializeRecord
  	@param {fm.websync.record} record
  	@return {fm.string}
  */


  serializer.serializeRecord = function() {
    var record;
    record = arguments[0];
    return fm.serializer.serializeObjectFast(record, serializer.serializeRecordCallback);
  };

  /**
  	 <div>
  	 Serializes a list of records to JSON.
  	 </div><param name="records">The records to serialize.</param><returns>The serialized records.</returns>
  
  	@function serializeRecordArray
  	@param {fm.array} records
  	@return {fm.string}
  */


  serializer.serializeRecordArray = function() {
    var records;
    records = arguments[0];
    return fm.serializer.serializeObjectArrayFast(records, serializer.serializeRecordCallback);
  };

  /**
  
  	@function serializeRecordCallback
  	@param {fm.websync.record} record
  	@param {fm.hash} jsonObject
  	@return {void}
  */


  serializer.serializeRecordCallback = function() {
    var jsonObject, record, _var0, _var1;
    record = arguments[0];
    jsonObject = arguments[1];
    _var0 = record.getKey();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      jsonObject["key"] = fm.serializer.serializeString(record.getKey());
    }
    if (record.getPrivate()) {
      jsonObject["private"] = fm.serializer.serializeBoolean(record.getPrivate());
    }
    _var1 = record.getValueJson();
    if (_var1 !== null && typeof _var1 !== 'undefined') {
      return jsonObject["value"] = fm.serializer.serializeRaw(record.getValueJson());
    }
  };

  /**
  	 <div>
  	 Serializes a subscribed client to JSON.
  	 </div><param name="subscribedClient">The subscribed client to serialize.</param><returns>The serialized subscribed client.</returns>
  
  	@function serializeSubscribedClient
  	@param {fm.websync.subscribedClient} subscribedClient
  	@return {fm.string}
  */


  serializer.serializeSubscribedClient = function() {
    var subscribedClient;
    subscribedClient = arguments[0];
    return fm.serializer.serializeObjectFast(subscribedClient, serializer.serializeSubscribedClientCallback);
  };

  /**
  	 <div>
  	 Serializes an array of subscribed client objects to JSON.
  	 </div><param name="subscribedClients">The subscribed client objects to serialize.</param><returns>The subscribed client objects as a JSON array.</returns>
  
  	@function serializeSubscribedClientArray
  	@param {fm.array} subscribedClients
  	@return {fm.string}
  */


  serializer.serializeSubscribedClientArray = function() {
    var subscribedClients;
    subscribedClients = arguments[0];
    return fm.serializer.serializeObjectArrayFast(subscribedClients, serializer.serializeSubscribedClientCallback);
  };

  /**
  
  	@function serializeSubscribedClientCallback
  	@param {fm.websync.subscribedClient} subscribedClient
  	@param {fm.hash} jsonObject
  	@return {void}
  */


  serializer.serializeSubscribedClientCallback = function() {
    var jsonObject, subscribedClient, _var0;
    subscribedClient = arguments[0];
    jsonObject = arguments[1];
    jsonObject["clientId"] = fm.serializer.serializeGuid(subscribedClient.getClientId());
    _var0 = subscribedClient.getBoundRecords();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      return jsonObject["boundRecords"] = fm.websync.serializer.serializeBoundRecords(subscribedClient.getBoundRecords());
    }
  };

  /**
  
  	@function serializeSubscription
  	@param {fm.websync.subscription} subscription
  	@return {fm.string}
  */


  serializer.serializeSubscription = function() {
    var subscription;
    subscription = arguments[0];
    return fm.serializer.serializeObjectFast(subscription, serializer.serializeSubscriptionCallback);
  };

  /**
  
  	@function serializeSubscriptionArray
  	@param {fm.array} subscriptions
  	@return {fm.string}
  */


  serializer.serializeSubscriptionArray = function() {
    var subscriptions;
    subscriptions = arguments[0];
    return fm.serializer.serializeObjectArrayFast(subscriptions, serializer.serializeSubscriptionCallback);
  };

  /**
  
  	@function serializeSubscriptionCallback
  	@param {fm.websync.subscription} subscription
  	@param {fm.hash} jsonObject
  	@return {void}
  */


  serializer.serializeSubscriptionCallback = function() {
    var jsonObject, subscription, _var0;
    subscription = arguments[0];
    jsonObject = arguments[1];
    jsonObject["channel"] = fm.serializer.serializeString(subscription.getChannel());
    _var0 = subscription.getTag();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      return jsonObject["tag"] = fm.serializer.serializeString(subscription.getTag());
    }
  };

  /**
  	 <div>
  	 Serializes a timestamp into Bayeux JSON format.
  	 </div><param name="timestamp">The timestamp as a DateTime object.</param><returns>The timestamp as a Bayeux JSON string.</returns>
  
  	@function serializeTimestamp
  	@param {fm.nullable} timestamp
  	@return {fm.string}
  */


  serializer.serializeTimestamp = function() {
    var str, str2, str3, str4, str5, str6, str7, timestamp;
    timestamp = arguments[0];
    str = null;
    if (timestamp !== null) {
      str2 = fm.intExtensions.toString(timestamp.getYear());
      str3 = fm.intExtensions.toString(timestamp.getMonth());
      str4 = fm.intExtensions.toString(timestamp.getDay());
      str5 = fm.intExtensions.toString(timestamp.getHour());
      str6 = fm.intExtensions.toString(timestamp.getMinute());
      str7 = fm.intExtensions.toString(timestamp.getSecond());
      while (str2.length < 4) {
        str2 = fm.stringExtensions.concat("0", str2);
      }
      while (str3.length < 2) {
        str3 = fm.stringExtensions.concat("0", str3);
      }
      while (str4.length < 2) {
        str4 = fm.stringExtensions.concat("0", str4);
      }
      while (str5.length < 2) {
        str5 = fm.stringExtensions.concat("0", str5);
      }
      while (str6.length < 2) {
        str6 = fm.stringExtensions.concat("0", str6);
      }
      while (str7.length < 2) {
        str7 = fm.stringExtensions.concat("0", str7);
      }
      str = fm.stringExtensions.format("{0}-{1}-{2}T{3}:{4}:{5}.00", [str2, str3, str4, str5, str6, str7]);
    }
    return fm.serializer.serializeString(str);
  };

  return serializer;

}).call(this, fm.object);


/**
@class fm.websync.splitter

@extends fm.object
*/


fm.websync.splitter = (function(_super) {

  __extends(splitter, _super);

  /**
  	@ignore 
  	@description
  */


  function splitter() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      splitter.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    splitter.__super__.constructor.call(this);
  }

  /**
  
  	@function split
  	@param {fm.string} str
  	@param {fm.string} delimiter
  	@return {fm.array}
  */


  splitter.split = function() {
    var ch, ch2, delimiter, i, list, num2, startIndex, str, _var0, _var1;
    str = arguments[0];
    delimiter = arguments[1];
    _var0 = str;
    if (_var0 === null || typeof _var0 === 'undefined') {
      throw new Error("String cannot be null.");
    }
    _var1 = delimiter;
    if (_var1 === null || typeof _var1 === 'undefined') {
      throw new Error("Delimiter cannot be null.");
    }
    if (delimiter.length === 0) {
      return [str];
    }
    startIndex = 0;
    num2 = 0;
    list = [];
    i = 0;
    while (i < str.length) {
      try {
        ch = str.charAt(i);
        ch2 = delimiter.charAt(num2);
        if (ch === ch2) {
          if (num2 === (delimiter.length - 1)) {
            fm.arrayExtensions.add(list, fm.stringExtensions.substring(str, startIndex, (i - num2) - startIndex));
            startIndex = i + 1;
            num2 = 0;
          } else {
            num2++;
          }
        } else {
          num2 = 0;
        }
      } finally {
        i++;
      }
    }
    fm.arrayExtensions.add(list, str.substring(startIndex));
    return fm.arrayExtensions.toArray(list);
  };

  return splitter;

}).call(this, fm.object);


/**
@class fm.websync.subscription
 <div>
 A channel/tag identifier for a client subscription.
 </div>

@extends fm.dynamic
*/


fm.websync.subscription = (function(_super) {

  __extends(subscription, _super);

  /**
  	@ignore 
  	@description
  */


  subscription.prototype.__channel = null;

  /**
  	@ignore 
  	@description
  */


  subscription.prototype.__tag = null;

  /**
  	@ignore 
  	@description
  */


  function subscription() {
    this.toJson = __bind(this.toJson, this);

    this.setTag = __bind(this.setTag, this);

    this.setChannel = __bind(this.setChannel, this);

    this.getTag = __bind(this.getTag, this);

    this.getHashCode = __bind(this.getHashCode, this);

    this.getChannel = __bind(this.getChannel, this);

    this.equals = __bind(this.equals, this);

    this.duplicate = __bind(this.duplicate, this);

    var channel, tag;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      subscription.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    if (arguments.length === 2) {
      channel = arguments[0];
      tag = arguments[1];
      subscription.__super__.constructor.call(this);
      this.setChannel(channel);
      this.setTag(tag);
      return;
    }
    if (arguments.length === 1) {
      channel = arguments[0];
      subscription.__super__.constructor.call(this);
      this.setChannel(channel);
      return;
    }
  }

  /**
  	 <div>
  	 Deserializes a subscription from JSON.
  	 </div><param name="subscriptionJson">A JSON string to deserialize.</param><returns>A deserialized subscription.</returns>
  
  	@function fromJson
  	@param {fm.string} subscriptionJson
  	@return {fm.websync.subscription}
  */


  subscription.fromJson = function() {
    var subscriptionJson;
    subscriptionJson = arguments[0];
    return fm.websync.serializer.deserializeSubscription(subscriptionJson);
  };

  /**
  	 <div>
  	 Deserializes a list of subscriptions from JSON.
  	 </div><param name="subscriptionsJson">A JSON string to deserialize.</param><returns>A deserialized list of subscriptions.</returns>
  
  	@function fromJsonMultiple
  	@param {fm.string} subscriptionsJson
  	@return {fm.array}
  */


  subscription.fromJsonMultiple = function() {
    var subscriptionsJson;
    subscriptionsJson = arguments[0];
    return fm.websync.serializer.deserializeSubscriptionArray(subscriptionsJson);
  };

  /**
  	 <div>
  	 Serializes a subscription to JSON.
  	 </div><param name="subscription">A subscription to serialize.</param><returns>A JSON-serialized subscription.</returns>
  
  	@function toJson
  	@param {fm.websync.subscription} subscription
  	@return {fm.string}
  */


  subscription.toJson = function() {
    var subscription;
    subscription = arguments[0];
    return fm.websync.serializer.serializeSubscription(subscription);
  };

  /**
  	 <div>
  	 Serializes a list of subscriptions to JSON.
  	 </div><param name="subscriptions">A list of subscriptions to serialize.</param><returns>A JSON-serialized array of subscriptions.</returns>
  
  	@function toJsonMultiple
  	@param {fm.array} subscriptions
  	@return {fm.string}
  */


  subscription.toJsonMultiple = function() {
    var subscriptions;
    subscriptions = arguments[0];
    return fm.websync.serializer.serializeSubscriptionArray(subscriptions);
  };

  /**
  	 <div>
  	 Creates a deep clone of this subscription.
  	 </div><returns>A deep clone of this subscription.</returns>
  
  	@function duplicate
  	@return {fm.websync.subscription}
  */


  subscription.prototype.duplicate = function() {
    return new fm.websync.subscription(this.getChannel(), this.getTag());
  };

  /**
  	 <div>
  	 Determines whether the specified <see cref="fm.websync.subscription">fm.websync.subscription</see> is equal to this instance.
  	 </div><param name="obj">The <see cref="fm.websync.subscription">fm.websync.subscription</see> to compare with this instance.</param><returns>
  	 <c>true</c> if the specified <see cref="fm.websync.subscription">fm.websync.subscription</see> is equal to this instance; otherwise, <c>false</c>.
  	 </returns>
  
  	@function equals
  	@param {fm.object} obj
  	@return {fm.boolean}
  */


  subscription.prototype.equals = function() {
    var obj, subscription;
    obj = arguments[0];
    subscription = fm.global.tryCast(obj, fm.websync.subscription);
    return subscription === this;
  };

  /**
  	 <div>
  	 Gets the subscription channel.
  	 </div>
  
  	@function getChannel
  	@return {fm.string}
  */


  subscription.prototype.getChannel = function() {
    return this.__channel;
  };

  /**
  	 <div>
  	 Returns a hash code for this instance.
  	 </div><returns>
  	 A hash code for this instance, suitable for use in hashing algorithms and data structures like a hash table.
  	 </returns>
  
  	@function getHashCode
  	@return {fm.int}
  */


  subscription.prototype.getHashCode = function() {
    var num, _var0;
    num = 17;
    num = (num * 23) + this.getChannel().hashCode();
    _var0 = this.getTag();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      num = (num * 23) + this.getTag().hashCode();
    }
    return num;
  };

  /**
  	 <div>
  	 Gets the identifier for the subscription.
  	 </div>
  
  	@function getTag
  	@return {fm.string}
  */


  subscription.prototype.getTag = function() {
    var _ref;
    return (_ref = this.__tag) != null ? _ref : fm.stringExtensions.empty;
  };

  /**
  	 <div>
  	 Sets the subscription channel.
  	 </div>
  
  	@function setChannel
  	@param {fm.string} value
  	@return {void}
  */


  subscription.prototype.setChannel = function() {
    var value, _var0;
    value = arguments[0];
    _var0 = value;
    if (_var0 === null || typeof _var0 === 'undefined') {
      throw new Error("channel cannot be null.");
    }
    this.__channel = value;
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Sets the identifier for the subscription.
  	 </div>
  
  	@function setTag
  	@param {fm.string} value
  	@return {void}
  */


  subscription.prototype.setTag = function() {
    var value;
    value = arguments[0];
    this.__tag = value != null ? value : fm.stringExtensions.empty;
    return this.setIsDirty(true);
  };

  /**
  	 <div>
  	 Serializes the record to JSON.
  	 </div><returns>The record in JSON-serialized format.</returns>
  
  	@function toJson
  	@return {fm.string}
  */


  subscription.prototype.toJson = function() {
    return fm.websync.subscription.toJson(this);
  };

  return subscription;

}).call(this, fm.dynamic);


/**
@class fm.websync.subscribedClient
 <div>
 Details about the client subscribed to the channel.
 </div>

@extends fm.serializable
*/


fm.websync.subscribedClient = (function(_super) {

  __extends(subscribedClient, _super);

  /**
  	@ignore 
  	@description
  */


  subscribedClient.prototype._boundRecords = null;

  /**
  	@ignore 
  	@description
  */


  subscribedClient.prototype._clientId = null;

  /**
  	@ignore 
  	@description
  */


  function subscribedClient() {
    this.toJson = __bind(this.toJson, this);

    this.setClientId = __bind(this.setClientId, this);

    this.setBoundRecords = __bind(this.setBoundRecords, this);

    this.getClientId = __bind(this.getClientId, this);

    this.getBoundRecords = __bind(this.getBoundRecords, this);

    var boundRecords, clientId;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      subscribedClient.__super__.constructor.call(this);
      this.setBoundRecords({});
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    if (arguments.length === 2) {
      clientId = arguments[0];
      boundRecords = arguments[1];
      subscribedClient.__super__.constructor.call(this);
      this.setClientId(clientId);
      this.setBoundRecords(boundRecords);
      return;
    }
    if (arguments.length === 0) {
      subscribedClient.__super__.constructor.call(this);
      this.setBoundRecords({});
      return;
    }
  }

  /**
  	 <div>
  	 Deserializes a JSON-formatted subscribed client.
  	 </div><param name="subscribedClientJson">The JSON-formatted subscribed client to deserialize.</param><returns>The subscribed client.</returns>
  
  	@function fromJson
  	@param {fm.string} subscribedClientJson
  	@return {fm.websync.subscribedClient}
  */


  subscribedClient.fromJson = function() {
    var subscribedClientJson;
    subscribedClientJson = arguments[0];
    return fm.websync.serializer.deserializeSubscribedClient(subscribedClientJson);
  };

  /**
  	 <div>
  	 Deserializes a JSON-formatted array of subscribed clients.
  	 </div><param name="subscribedClientsJson">The JSON-formatted array of subscribed clients to deserialize.</param><returns>The array of subscribed clients.</returns>
  
  	@function fromJsonMultiple
  	@param {fm.string} subscribedClientsJson
  	@return {fm.array}
  */


  subscribedClient.fromJsonMultiple = function() {
    var subscribedClientsJson;
    subscribedClientsJson = arguments[0];
    return fm.websync.serializer.deserializeSubscribedClientArray(subscribedClientsJson);
  };

  /**
  	 <div>
  	 Serializes a subscribed client to JSON.
  	 </div><param name="subscribedClient">The subscribed client to serialize.</param><returns>The JSON-formatted subscribed client.</returns>
  
  	@function toJson
  	@param {fm.websync.subscribedClient} subscribedClient
  	@return {fm.string}
  */


  subscribedClient.toJson = function() {
    var subscribedClient;
    subscribedClient = arguments[0];
    return fm.websync.serializer.serializeSubscribedClient(subscribedClient);
  };

  /**
  	 <div>
  	 Serializes an array of subscribed clients to JSON.
  	 </div><param name="subscribedClients">The array of subscribed clients to serialize.</param><returns>The JSON-formatted array of subscribed clients.</returns>
  
  	@function toJsonMultiple
  	@param {fm.array} subscribedClients
  	@return {fm.string}
  */


  subscribedClient.toJsonMultiple = function() {
    var subscribedClients;
    subscribedClients = arguments[0];
    return fm.websync.serializer.serializeSubscribedClientArray(subscribedClients);
  };

  /**
  	 <div>
  	 Gets the client's locally-cached bound records.
  	 </div>
  
  	@function getBoundRecords
  	@return {fm.hash}
  */


  subscribedClient.prototype.getBoundRecords = function() {
    return this._boundRecords;
  };

  /**
  	 <div>
  	 Gets the client's ID.
  	 </div>
  
  	@function getClientId
  	@return {fm.guid}
  */


  subscribedClient.prototype.getClientId = function() {
    return this._clientId;
  };

  /**
  	 <div>
  	 Sets the client's locally-cached bound records.
  	 </div>
  
  	@function setBoundRecords
  	@param {fm.hash} value
  	@return {void}
  */


  subscribedClient.prototype.setBoundRecords = function() {
    var value;
    value = arguments[0];
    return this._boundRecords = value;
  };

  /**
  	 <div>
  	 Sets the client's ID.
  	 </div>
  
  	@function setClientId
  	@param {fm.guid} value
  	@return {void}
  */


  subscribedClient.prototype.setClientId = function() {
    var value;
    value = arguments[0];
    return this._clientId = value;
  };

  /**
  	 <div>
  	 Serializes this instance to JSON.
  	 </div><returns>The JSON-formatted subscribed client.</returns>
  
  	@function toJson
  	@return {fm.string}
  */


  subscribedClient.prototype.toJson = function() {
    return fm.websync.subscribedClient.toJson(this);
  };

  return subscribedClient;

}).call(this, fm.serializable);


/**
@class fm.websync.webSocketOpenArgs
 <div>
 Open arguments for the <see cref="fm.websync.webSocket">fm.websync.webSocket</see> class.
 </div>

@extends fm.dynamic
*/


fm.websync.webSocketOpenArgs = (function(_super) {

  __extends(webSocketOpenArgs, _super);

  /**
  	@ignore 
  	@description
  */


  webSocketOpenArgs.prototype._handshakeTimeout = 0;

  /**
  	@ignore 
  	@description
  */


  webSocketOpenArgs.prototype._headers = null;

  /**
  	@ignore 
  	@description
  */


  webSocketOpenArgs.prototype._onFailure = null;

  /**
  	@ignore 
  	@description
  */


  webSocketOpenArgs.prototype._onReceive = null;

  /**
  	@ignore 
  	@description
  */


  webSocketOpenArgs.prototype._onRequestCreated = null;

  /**
  	@ignore 
  	@description
  */


  webSocketOpenArgs.prototype._onResponseReceived = null;

  /**
  	@ignore 
  	@description
  */


  webSocketOpenArgs.prototype._onStreamFailure = null;

  /**
  	@ignore 
  	@description
  */


  webSocketOpenArgs.prototype._onSuccess = null;

  /**
  	@ignore 
  	@description
  */


  webSocketOpenArgs.prototype._sender = null;

  /**
  	@ignore 
  	@description
  */


  webSocketOpenArgs.prototype._streamTimeout = 0;

  /**
  	@ignore 
  	@description
  */


  function webSocketOpenArgs() {
    this.setStreamTimeout = __bind(this.setStreamTimeout, this);

    this.setSender = __bind(this.setSender, this);

    this.setOnSuccess = __bind(this.setOnSuccess, this);

    this.setOnStreamFailure = __bind(this.setOnStreamFailure, this);

    this.setOnResponseReceived = __bind(this.setOnResponseReceived, this);

    this.setOnRequestCreated = __bind(this.setOnRequestCreated, this);

    this.setOnReceive = __bind(this.setOnReceive, this);

    this.setOnFailure = __bind(this.setOnFailure, this);

    this.setHeaders = __bind(this.setHeaders, this);

    this.setHandshakeTimeout = __bind(this.setHandshakeTimeout, this);

    this.getStreamTimeout = __bind(this.getStreamTimeout, this);

    this.getSender = __bind(this.getSender, this);

    this.getOnSuccess = __bind(this.getOnSuccess, this);

    this.getOnStreamFailure = __bind(this.getOnStreamFailure, this);

    this.getOnResponseReceived = __bind(this.getOnResponseReceived, this);

    this.getOnRequestCreated = __bind(this.getOnRequestCreated, this);

    this.getOnReceive = __bind(this.getOnReceive, this);

    this.getOnFailure = __bind(this.getOnFailure, this);

    this.getHeaders = __bind(this.getHeaders, this);

    this.getHandshakeTimeout = __bind(this.getHandshakeTimeout, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      webSocketOpenArgs.__super__.constructor.call(this);
      this.setHandshakeTimeout(15000);
      this.setStreamTimeout(40000);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    webSocketOpenArgs.__super__.constructor.call(this);
    this.setHandshakeTimeout(15000);
    this.setStreamTimeout(40000);
  }

  /**
  	 <div>
  	 Gets the timeout for the handshake.
  	 </div>
  
  	@function getHandshakeTimeout
  	@return {fm.int}
  */


  webSocketOpenArgs.prototype.getHandshakeTimeout = function() {
    return this._handshakeTimeout;
  };

  /**
  	 <div>
  	 Gets headers to send with the handshake request.
  	 </div>
  
  	@function getHeaders
  	@return {fm.nameValueCollection}
  */


  webSocketOpenArgs.prototype.getHeaders = function() {
    return this._headers;
  };

  /**
  	 <div>
  	 Gets the callback to invoke when a connection could not be established.
  	 </div>
  
  	@function getOnFailure
  	@return {fm.singleAction}
  */


  webSocketOpenArgs.prototype.getOnFailure = function() {
    return this._onFailure;
  };

  /**
  	 <div>
  	 Gets the callback to invoke when a message is received.
  	 </div>
  
  	@function getOnReceive
  	@return {fm.singleAction}
  */


  webSocketOpenArgs.prototype.getOnReceive = function() {
    return this._onReceive;
  };

  /**
  	 <div>
  	 Gets the callback to invoke before the handshake request is sent.
  	 </div>
  
  	@function getOnRequestCreated
  	@return {fm.singleAction}
  */


  webSocketOpenArgs.prototype.getOnRequestCreated = function() {
    return this._onRequestCreated;
  };

  /**
  	 <div>
  	 Gets the callback to invoke after the handshake response is received.
  	 </div>
  
  	@function getOnResponseReceived
  	@return {fm.singleAction}
  */


  webSocketOpenArgs.prototype.getOnResponseReceived = function() {
    return this._onResponseReceived;
  };

  /**
  	 <div>
  	 Gets the callback to invoke when a successful connection breaks down.
  	 </div>
  
  	@function getOnStreamFailure
  	@return {fm.singleAction}
  */


  webSocketOpenArgs.prototype.getOnStreamFailure = function() {
    return this._onStreamFailure;
  };

  /**
  	 <div>
  	 Gets the callback to invoke when a successful connection has been established.
  	 </div>
  
  	@function getOnSuccess
  	@return {fm.singleAction}
  */


  webSocketOpenArgs.prototype.getOnSuccess = function() {
    return this._onSuccess;
  };

  /**
  	 <div>
  	 Gets the sender of the request.
  	 </div>
  
  	@function getSender
  	@return {fm.object}
  */


  webSocketOpenArgs.prototype.getSender = function() {
    return this._sender;
  };

  /**
  	 <div>
  	 Gets the timeout for the stream.
  	 </div>
  
  	@function getStreamTimeout
  	@return {fm.int}
  */


  webSocketOpenArgs.prototype.getStreamTimeout = function() {
    return this._streamTimeout;
  };

  /**
  	 <div>
  	 Sets the timeout for the handshake.
  	 </div>
  
  	@function setHandshakeTimeout
  	@param {fm.int} value
  	@return {void}
  */


  webSocketOpenArgs.prototype.setHandshakeTimeout = function() {
    var value;
    value = arguments[0];
    return this._handshakeTimeout = value;
  };

  /**
  	 <div>
  	 Sets headers to send with the handshake request.
  	 </div>
  
  	@function setHeaders
  	@param {fm.nameValueCollection} value
  	@return {void}
  */


  webSocketOpenArgs.prototype.setHeaders = function() {
    var value;
    value = arguments[0];
    return this._headers = value;
  };

  /**
  	 <div>
  	 Sets the callback to invoke when a connection could not be established.
  	 </div>
  
  	@function setOnFailure
  	@param {fm.singleAction} value
  	@return {void}
  */


  webSocketOpenArgs.prototype.setOnFailure = function() {
    var value;
    value = arguments[0];
    return this._onFailure = value;
  };

  /**
  	 <div>
  	 Sets the callback to invoke when a message is received.
  	 </div>
  
  	@function setOnReceive
  	@param {fm.singleAction} value
  	@return {void}
  */


  webSocketOpenArgs.prototype.setOnReceive = function() {
    var value;
    value = arguments[0];
    return this._onReceive = value;
  };

  /**
  	 <div>
  	 Sets the callback to invoke before the handshake request is sent.
  	 </div>
  
  	@function setOnRequestCreated
  	@param {fm.singleAction} value
  	@return {void}
  */


  webSocketOpenArgs.prototype.setOnRequestCreated = function() {
    var value;
    value = arguments[0];
    return this._onRequestCreated = value;
  };

  /**
  	 <div>
  	 Sets the callback to invoke after the handshake response is received.
  	 </div>
  
  	@function setOnResponseReceived
  	@param {fm.singleAction} value
  	@return {void}
  */


  webSocketOpenArgs.prototype.setOnResponseReceived = function() {
    var value;
    value = arguments[0];
    return this._onResponseReceived = value;
  };

  /**
  	 <div>
  	 Sets the callback to invoke when a successful connection breaks down.
  	 </div>
  
  	@function setOnStreamFailure
  	@param {fm.singleAction} value
  	@return {void}
  */


  webSocketOpenArgs.prototype.setOnStreamFailure = function() {
    var value;
    value = arguments[0];
    return this._onStreamFailure = value;
  };

  /**
  	 <div>
  	 Sets the callback to invoke when a successful connection has been established.
  	 </div>
  
  	@function setOnSuccess
  	@param {fm.singleAction} value
  	@return {void}
  */


  webSocketOpenArgs.prototype.setOnSuccess = function() {
    var value;
    value = arguments[0];
    return this._onSuccess = value;
  };

  /**
  	 <div>
  	 Sets the sender of the request.
  	 </div>
  
  	@function setSender
  	@param {fm.object} value
  	@return {void}
  */


  webSocketOpenArgs.prototype.setSender = function() {
    var value;
    value = arguments[0];
    return this._sender = value;
  };

  /**
  	 <div>
  	 Sets the timeout for the stream.
  	 </div>
  
  	@function setStreamTimeout
  	@param {fm.int} value
  	@return {void}
  */


  webSocketOpenArgs.prototype.setStreamTimeout = function() {
    var value;
    value = arguments[0];
    return this._streamTimeout = value;
  };

  return webSocketOpenArgs;

})(fm.dynamic);


/**
@class fm.websync.webSocketOpenFailureArgs
 <div>
 Arguments for <see cref="fm.websync.webSocketOpenArgs.onFailure">fm.websync.webSocketOpenArgs.onFailure</see>.
 </div>

@extends fm.websync.socketOpenFailureArgs
*/


fm.websync.webSocketOpenFailureArgs = (function(_super) {

  __extends(webSocketOpenFailureArgs, _super);

  /**
  	@ignore 
  	@description
  */


  webSocketOpenFailureArgs.prototype._statusCode = null;

  /**
  	@ignore 
  	@description
  */


  function webSocketOpenFailureArgs() {
    this.setStatusCode = __bind(this.setStatusCode, this);

    this.getStatusCode = __bind(this.getStatusCode, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      webSocketOpenFailureArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    webSocketOpenFailureArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the status code associated with the failure to connect.
  	 </div>
  
  	@function getStatusCode
  	@return {fm.websync.webSocketStatusCode}
  */


  webSocketOpenFailureArgs.prototype.getStatusCode = function() {
    return this._statusCode;
  };

  /**
  	 <div>
  	 Sets the status code associated with the failure to connect.
  	 </div>
  
  	@function setStatusCode
  	@param {fm.websync.webSocketStatusCode} value
  	@return {void}
  */


  webSocketOpenFailureArgs.prototype.setStatusCode = function() {
    var value;
    value = arguments[0];
    return this._statusCode = value;
  };

  return webSocketOpenFailureArgs;

})(fm.websync.socketOpenFailureArgs);


/**
@class fm.websync.webSocketOpenSuccessArgs
 <div>
 Arguments for <see cref="fm.websync.webSocketOpenArgs.onSuccess">fm.websync.webSocketOpenArgs.onSuccess</see>.
 </div>

@extends fm.websync.socketOpenSuccessArgs
*/


fm.websync.webSocketOpenSuccessArgs = (function(_super) {

  __extends(webSocketOpenSuccessArgs, _super);

  /**
  	@ignore 
  	@description
  */


  function webSocketOpenSuccessArgs() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      webSocketOpenSuccessArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    webSocketOpenSuccessArgs.__super__.constructor.call(this);
  }

  return webSocketOpenSuccessArgs;

})(fm.websync.socketOpenSuccessArgs);


/**
@class fm.websync.webSocketReceiveArgs
 <div>
 Arguments for <see cref="fm.websync.webSocketOpenArgs.onReceive">fm.websync.webSocketOpenArgs.onReceive</see>.
 </div>

@extends fm.dynamic
*/


fm.websync.webSocketReceiveArgs = (function(_super) {

  __extends(webSocketReceiveArgs, _super);

  /**
  	@ignore 
  	@description
  */


  webSocketReceiveArgs.prototype._binaryMessage = null;

  /**
  	@ignore 
  	@description
  */


  webSocketReceiveArgs.prototype._textMessage = null;

  /**
  	@ignore 
  	@description
  */


  function webSocketReceiveArgs() {
    this.setTextMessage = __bind(this.setTextMessage, this);

    this.setBinaryMessage = __bind(this.setBinaryMessage, this);

    this.getTextMessage = __bind(this.getTextMessage, this);

    this.getIsText = __bind(this.getIsText, this);

    this.getBinaryMessage = __bind(this.getBinaryMessage, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      webSocketReceiveArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    webSocketReceiveArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the message received from the server as binary data.
  	 </div>
  
  	@function getBinaryMessage
  	@return {fm.array}
  */


  webSocketReceiveArgs.prototype.getBinaryMessage = function() {
    return this._binaryMessage;
  };

  /**
  	 <div>
  	 Gets whether or not the received message is text.
  	 </div>
  
  	@function getIsText
  	@return {fm.boolean}
  */


  webSocketReceiveArgs.prototype.getIsText = function() {
    var _var0;
    _var0 = this.getTextMessage();
    return _var0 !== null && typeof _var0 !== 'undefined';
  };

  /**
  	 <div>
  	 Gets the message received from the server as text data.
  	 </div>
  
  	@function getTextMessage
  	@return {fm.string}
  */


  webSocketReceiveArgs.prototype.getTextMessage = function() {
    return this._textMessage;
  };

  /**
  	 <div>
  	 Sets the message received from the server as binary data.
  	 </div>
  
  	@function setBinaryMessage
  	@param {fm.array} value
  	@return {void}
  */


  webSocketReceiveArgs.prototype.setBinaryMessage = function() {
    var value;
    value = arguments[0];
    return this._binaryMessage = value;
  };

  /**
  	 <div>
  	 Sets the message received from the server as text data.
  	 </div>
  
  	@function setTextMessage
  	@param {fm.string} value
  	@return {void}
  */


  webSocketReceiveArgs.prototype.setTextMessage = function() {
    var value;
    value = arguments[0];
    return this._textMessage = value;
  };

  return webSocketReceiveArgs;

})(fm.dynamic);


/**
@class fm.websync.webSocketRequest
 <div>
 Defines a transfer request for <see cref="fm.websync.webSocketTransfer">fm.websync.webSocketTransfer</see>.
 </div>

@extends fm.object
*/


fm.websync.webSocketRequest = (function(_super) {

  __extends(webSocketRequest, _super);

  /**
  	@ignore 
  	@description
  */


  webSocketRequest.prototype._args = null;

  /**
  	@ignore 
  	@description
  */


  webSocketRequest.prototype._callback = null;

  /**
  	@ignore 
  	@description
  */


  function webSocketRequest() {
    this.setCallback = __bind(this.setCallback, this);

    this.setArgs = __bind(this.setArgs, this);

    this.getCallback = __bind(this.getCallback, this);

    this.getArgs = __bind(this.getArgs, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      webSocketRequest.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    webSocketRequest.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the request arguments.
  	 </div>
  
  	@function getArgs
  	@return {fm.websync.messageRequestArgs}
  */


  webSocketRequest.prototype.getArgs = function() {
    return this._args;
  };

  /**
  	 <div>
  	 Gets the callback to execute when the request completes.
  	 </div>
  
  	@function getCallback
  	@return {fm.singleAction}
  */


  webSocketRequest.prototype.getCallback = function() {
    return this._callback;
  };

  /**
  	 <div>
  	 Sets the request arguments.
  	 </div>
  
  	@function setArgs
  	@param {fm.websync.messageRequestArgs} value
  	@return {void}
  */


  webSocketRequest.prototype.setArgs = function() {
    var value;
    value = arguments[0];
    return this._args = value;
  };

  /**
  	 <div>
  	 Sets the callback to execute when the request completes.
  	 </div>
  
  	@function setCallback
  	@param {fm.singleAction} value
  	@return {void}
  */


  webSocketRequest.prototype.setCallback = function() {
    var value;
    value = arguments[0];
    return this._callback = value;
  };

  return webSocketRequest;

})(fm.object);


/**
@class fm.websync.webSocketSendArgs
 <div>
 Send arguments for the <see cref="fm.websync.webSocket">fm.websync.webSocket</see> class.
 </div>

@extends fm.dynamic
*/


fm.websync.webSocketSendArgs = (function(_super) {

  __extends(webSocketSendArgs, _super);

  /**
  	@ignore 
  	@description
  */


  webSocketSendArgs.prototype._binaryMessage = null;

  /**
  	@ignore 
  	@description
  */


  webSocketSendArgs.prototype._textMessage = null;

  /**
  	@ignore 
  	@description
  */


  webSocketSendArgs.prototype._timeout = 0;

  /**
  	@ignore 
  	@description
  */


  function webSocketSendArgs() {
    this.setTimeout = __bind(this.setTimeout, this);

    this.setTextMessage = __bind(this.setTextMessage, this);

    this.setBinaryMessage = __bind(this.setBinaryMessage, this);

    this.getTimeout = __bind(this.getTimeout, this);

    this.getTextMessage = __bind(this.getTextMessage, this);

    this.getIsText = __bind(this.getIsText, this);

    this.getBinaryMessage = __bind(this.getBinaryMessage, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      webSocketSendArgs.__super__.constructor.call(this);
      this.setTimeout(15000);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    webSocketSendArgs.__super__.constructor.call(this);
    this.setTimeout(15000);
  }

  /**
  	 <div>
  	 Gets the message to send as binary data.
  	 </div>
  
  	@function getBinaryMessage
  	@return {fm.array}
  */


  webSocketSendArgs.prototype.getBinaryMessage = function() {
    return this._binaryMessage;
  };

  /**
  	 <div>
  	 Gets whether or not the message should be sent as text.
  	 </div>
  
  	@function getIsText
  	@return {fm.boolean}
  */


  webSocketSendArgs.prototype.getIsText = function() {
    var _var0;
    _var0 = this.getTextMessage();
    return _var0 !== null && typeof _var0 !== 'undefined';
  };

  /**
  	 <div>
  	 Gets the message to send as text data.
  	 </div>
  
  	@function getTextMessage
  	@return {fm.string}
  */


  webSocketSendArgs.prototype.getTextMessage = function() {
    return this._textMessage;
  };

  /**
  	 <div>
  	 Gets the timeout for the request.
  	 </div>
  
  	@function getTimeout
  	@return {fm.int}
  */


  webSocketSendArgs.prototype.getTimeout = function() {
    return this._timeout;
  };

  /**
  	 <div>
  	 Sets the message to send as binary data.
  	 </div>
  
  	@function setBinaryMessage
  	@param {fm.array} value
  	@return {void}
  */


  webSocketSendArgs.prototype.setBinaryMessage = function() {
    var value;
    value = arguments[0];
    return this._binaryMessage = value;
  };

  /**
  	 <div>
  	 Sets the message to send as text data.
  	 </div>
  
  	@function setTextMessage
  	@param {fm.string} value
  	@return {void}
  */


  webSocketSendArgs.prototype.setTextMessage = function() {
    var value;
    value = arguments[0];
    return this._textMessage = value;
  };

  /**
  	 <div>
  	 Sets the timeout for the request.
  	 </div>
  
  	@function setTimeout
  	@param {fm.int} value
  	@return {void}
  */


  webSocketSendArgs.prototype.setTimeout = function() {
    var value;
    value = arguments[0];
    return this._timeout = value;
  };

  return webSocketSendArgs;

})(fm.dynamic);


/**
@class fm.websync.webSocketStreamFailureArgs
 <div>
 Arguments for <see cref="fm.websync.webSocketOpenArgs.onStreamFailure">fm.websync.webSocketOpenArgs.onStreamFailure</see>.
 </div>

@extends fm.websync.socketStreamFailureArgs
*/


fm.websync.webSocketStreamFailureArgs = (function(_super) {

  __extends(webSocketStreamFailureArgs, _super);

  /**
  	@ignore 
  	@description
  */


  webSocketStreamFailureArgs.prototype._statusCode = null;

  /**
  	@ignore 
  	@description
  */


  function webSocketStreamFailureArgs() {
    this.setStatusCode = __bind(this.setStatusCode, this);

    this.getStatusCode = __bind(this.getStatusCode, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      webSocketStreamFailureArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    webSocketStreamFailureArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the status code associated with the stream failure.
  	 </div>
  
  	@function getStatusCode
  	@return {fm.websync.webSocketStatusCode}
  */


  webSocketStreamFailureArgs.prototype.getStatusCode = function() {
    return this._statusCode;
  };

  /**
  	 <div>
  	 Sets the status code associated with the stream failure.
  	 </div>
  
  	@function setStatusCode
  	@param {fm.websync.webSocketStatusCode} value
  	@return {void}
  */


  webSocketStreamFailureArgs.prototype.setStatusCode = function() {
    var value;
    value = arguments[0];
    return this._statusCode = value;
  };

  return webSocketStreamFailureArgs;

})(fm.websync.socketStreamFailureArgs);


/**
@class fm.websync.webSocketTransfer
 <div>
 Defines methods for transferring messages using the WebSocket protocol.
 </div>

@extends fm.websync.socketMessageTransfer
*/


fm.websync.webSocketTransfer = (function(_super) {

  __extends(webSocketTransfer, _super);

  /**
  	@ignore 
  	@description
  */


  webSocketTransfer.prototype._activeRequest = null;

  /**
  	@ignore 
  	@description
  */


  webSocketTransfer.prototype._webSocket = null;

  /**
  	@ignore 
  	@description
  */


  function webSocketTransfer() {
    this.streamFailure = __bind(this.streamFailure, this);

    this.shutdown = __bind(this.shutdown, this);

    this.setWebSocket = __bind(this.setWebSocket, this);

    this.sendMessagesAsync = __bind(this.sendMessagesAsync, this);

    this.sendMessages = __bind(this.sendMessages, this);

    this.receive = __bind(this.receive, this);

    this.open = __bind(this.open, this);

    this.getWebSocket = __bind(this.getWebSocket, this);

    this.connectSuccess = __bind(this.connectSuccess, this);

    this.connectFailure = __bind(this.connectFailure, this);

    var requestUrl;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      webSocketTransfer.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    requestUrl = arguments[0];
    webSocketTransfer.__super__.constructor.call(this);
    requestUrl = requestUrl.replace("https://", "wss://");
    requestUrl = requestUrl.replace("http://", "ws://");
    this.setWebSocket(new fm.websync.webSocket(requestUrl));
  }

  /**
  
  	@function connectFailure
  	@param {fm.websync.webSocketOpenFailureArgs} e
  	@return {void}
  */


  webSocketTransfer.prototype.connectFailure = function() {
    var e, _var0;
    e = arguments[0];
    _var0 = this.getOnOpenFailure();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      return this.getOnOpenFailure()(e);
    }
  };

  /**
  
  	@function connectSuccess
  	@param {fm.websync.webSocketOpenSuccessArgs} e
  	@return {void}
  */


  webSocketTransfer.prototype.connectSuccess = function() {
    var e, _var0;
    e = arguments[0];
    _var0 = this.getOnOpenSuccess();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      return this.getOnOpenSuccess()(e);
    }
  };

  /**
  
  	@function getWebSocket
  	@return {fm.websync.webSocket}
  */


  webSocketTransfer.prototype.getWebSocket = function() {
    return this._webSocket;
  };

  /**
  	 <div>
  	 Opens the WebSocket connection.
  	 </div>
  
  	@function open
  	@param {fm.nameValueCollection} headers
  	@return {void}
  */


  webSocketTransfer.prototype.open = function() {
    var headers, openArgs;
    headers = arguments[0];
    openArgs = new fm.websync.webSocketOpenArgs();
    openArgs.setHandshakeTimeout(this.getHandshakeTimeout());
    openArgs.setHeaders(headers);
    openArgs.setOnSuccess(this.connectSuccess);
    openArgs.setOnFailure(this.connectFailure);
    openArgs.setOnStreamFailure(this.streamFailure);
    openArgs.setOnRequestCreated(this.getOnRequestCreated());
    openArgs.setOnResponseReceived(this.getOnResponseReceived());
    openArgs.setOnReceive(this.receive);
    openArgs.setSender(this.getSender());
    return this.getWebSocket().open(openArgs);
  };

  /**
  
  	@function receive
  	@param {fm.websync.webSocketReceiveArgs} e
  	@return {void}
  */


  webSocketTransfer.prototype.receive = function() {
    var e, messageArray, p;
    e = arguments[0];
    if (e.getIsText()) {
      messageArray = fm.websync.message.fromJsonMultiple(e.getTextMessage());
    } else {
      messageArray = fm.websync.binaryMessage.fromBinaryMultiple(e.getBinaryMessage());
    }
    p = new fm.websync.messageResponseArgs(this._activeRequest.getArgs());
    p.setHeaders(new fm.nameValueCollection());
    p.setMessages(messageArray);
    return this._activeRequest.getCallback()(p);
  };

  /**
  	 <div>
  	 Sends a request synchronously.
  	 </div><param name="requestArgs">The request parameters.</param><returns>The response parameters.</returns>
  
  	@function sendMessages
  	@param {fm.websync.messageRequestArgs} requestArgs
  	@return {fm.websync.messageResponseArgs}
  */


  webSocketTransfer.prototype.sendMessages = function() {
    var requestArgs;
    requestArgs = arguments[0];
    throw new Error("Synchronous WebSockets are not supported.");
  };

  /**
  	 <div>
  	 Sends a request asynchronously.
  	 </div><param name="requestArgs">The request parameters.</param><param name="callback">The callback to execute with the resulting response.</param>
  
  	@function sendMessagesAsync
  	@param {fm.websync.messageRequestArgs} requestArgs
  	@param {fm.singleAction} callback
  	@return {void}
  */


  webSocketTransfer.prototype.sendMessagesAsync = function() {
    var args2, callback, request, request2, requestArgs, sendArgs;
    requestArgs = arguments[0];
    callback = arguments[1];
    request2 = new fm.websync.webSocketRequest();
    request2.setArgs(requestArgs);
    request2.setCallback(callback);
    request = request2;
    args2 = new fm.websync.webSocketSendArgs();
    args2.setTimeout(request.getArgs().getTimeout());
    sendArgs = args2;
    if (request.getArgs().getIsBinary()) {
      sendArgs.setBinaryMessage(fm.websync.binaryMessage.toBinaryMultiple(request.getArgs().getMessages()));
    } else {
      sendArgs.setTextMessage(fm.websync.message.toJsonMultiple(request.getArgs().getMessages()));
    }
    this._activeRequest = request;
    return this.getWebSocket().send(sendArgs);
  };

  /**
  
  	@function setWebSocket
  	@param {fm.websync.webSocket} value
  	@return {void}
  */


  webSocketTransfer.prototype.setWebSocket = function() {
    var value;
    value = arguments[0];
    return this._webSocket = value;
  };

  /**
  	 <div>
  	 Releases any resources and shuts down.
  	 </div>
  
  	@function shutdown
  	@return {void}
  */


  webSocketTransfer.prototype.shutdown = function() {
    return this.getWebSocket().close();
  };

  /**
  
  	@function streamFailure
  	@param {fm.websync.webSocketStreamFailureArgs} e
  	@return {void}
  */


  webSocketTransfer.prototype.streamFailure = function() {
    var e, _var0;
    e = arguments[0];
    _var0 = this.getOnStreamFailure();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      return this.getOnStreamFailure()(e);
    }
  };

  return webSocketTransfer;

})(fm.websync.socketMessageTransfer);



(function() {
  var client, deleteActiveClient, deleteCookie, deleteCookieClient, insertActiveClient, insertCookie, insertCookieClient, selectActiveClients, selectCookieClient, selectCookies, _activeClients, _cookiePrefix;
  client = fm.websync.client;
  client.addOnConnectRequest(function(c, e) {
    var args;
    args = e.getMethodArgs();
    if (!args.getIsReconnect() && !args.getLastClientId() && !args.getLastSessionId()) {
      client = selectCookieClient();
      if (client) {
        args.setLastClientId(client.clientId);
        args.setLastSessionId(client.sessionId);
        if (client.token) {
          c.setToken(client.token);
        }
        deleteCookieClient(client.clientId);
      }
    }
  });
  client.addOnConnectEnd(function(c, e) {
    var args;
    if (!e.getException()) {
      args = e.getMethodArgs();
      if (args.getLastClientId()) {
        deleteActiveClient(args.getLastClientId());
      }
      insertActiveClient({
        clientId: c.getClientId(),
        sessionId: c.getSessionId(),
        token: c.getToken()
      });
    }
  });
  client.addOnDisconnectEnd(function(c, e) {
    if (!e.getException()) {
      deleteActiveClient(c.getClientId());
    }
  });
  fm.util.observe(window, 'beforeunload', function() {
    var activeClient, activeClients, _i, _len;
    activeClients = selectActiveClients();
    for (_i = 0, _len = activeClients.length; _i < _len; _i++) {
      activeClient = activeClients[_i];
      insertCookieClient(activeClient);
    }
  });
  _activeClients = [];
  selectActiveClients = function() {
    return _activeClients;
  };
  insertActiveClient = function(client) {
    _activeClients.push(client);
  };
  deleteActiveClient = function(clientId) {
    var activeClient, i, _i, _len;
    for (i = _i = 0, _len = _activeClients.length; _i < _len; i = ++_i) {
      activeClient = _activeClients[i];
      if (activeClient.clientId.equals(clientId)) {
        _activeClients.splice(i, 1);
        return;
      }
    }
  };
  _cookiePrefix = 'fm-websync-';
  selectCookieClient = function() {
    var cookieClient, cookieName, cookieValue, cookies;
    cookies = selectCookies();
    cookieClient = null;
    for (cookieName in cookies) {
      cookieValue = cookies[cookieName];
      if (fm.stringExtensions.startsWith(cookieName, _cookiePrefix)) {
        cookieValue = fm.json.deserialize(cookieValue);
        cookieClient = {
          clientId: new fm.guid(cookieValue.clientId),
          sessionId: new fm.guid(cookieValue.sessionId),
          token: cookieValue.token
        };
      }
    }
    return cookieClient;
  };
  insertCookieClient = function(client) {
    var cookieValue;
    cookieValue = {
      clientId: client.clientId.toString(),
      sessionId: client.sessionId.toString(),
      token: client.token
    };
    insertCookie(_cookiePrefix + client.clientId.toString(), fm.json.serialize(cookieValue), 60);
  };
  deleteCookieClient = function(clientId) {
    deleteCookie(_cookiePrefix + clientId.toString());
  };
  selectCookies = function() {
    var cookie, cookieSplit, cookies, equalsIndex, _i, _len;
    cookies = {};
    cookieSplit = document.cookie.split(';');
    for (_i = 0, _len = cookieSplit.length; _i < _len; _i++) {
      cookie = cookieSplit[_i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1, cookie.length);
      }
      equalsIndex = cookie.indexOf('=');
      if (equalsIndex >= 0) {
        cookies[cookie.substring(0, equalsIndex)] = cookie.substring(equalsIndex + 1, cookie.length);
      }
    }
    return cookies;
  };
  insertCookie = function(name, value, seconds) {
    var date, expires;
    expires = '';
    if (seconds) {
      date = new Date();
      date.setTime(date.getTime() + (seconds * 1000));
      expires = '; expires=' + date.toGMTString();
    }
    document.cookie = name + '=' + value + expires + '; path=/';
  };
  return deleteCookie = function(name) {
    insertCookie(name, '', -1);
  };
})();



(function() {
  var client, methodName, oldClient, oldConstructor, oldPrototype, prop, _created, _fn, _i, _len, _ref;
  client = fm.websync.client;
  _ref = ['connect', 'disconnect', 'subscribe', 'unsubscribe', 'bind', 'unbind', 'publish', 'notify', 'service'];
  _fn = function(methodName) {
    var method;
    method = client.prototype[methodName];
    return client.prototype[methodName] = function() {
      var i, obj, record, _j, _len1, _ref1;
      if (arguments.length === 1 && fm.util.isPlainObject(arguments[0])) {
        obj = arguments[0];
        if (obj.record) {
          obj.record = new fm.websync.record(obj.record);
        }
        if (obj.records) {
          _ref1 = obj.records;
          for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
            record = _ref1[i];
            obj.records[i] = new fm.websync.record(obj.records[i]);
          }
        }
        return method.call(this, new fm.websync[methodName + 'Args'](obj));
      } else {
        return method.apply(this, arguments);
      }
    };
  };
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    methodName = _ref[_i];
    _fn(methodName);
  }
  oldConstructor = client.prototype.constructor;
  oldPrototype = client.prototype;
  oldClient = client;
  _created = false;
  fm.websync.client.enableMultiple = false;
  fm.websync.client = function() {
    var c;
    if (_created && !client.enableMultiple) {
      throw Error('To create multiple instances of the JavaScript client, set fm.websync.client.enableMultiple to true.');
    } else {
      _created = true;
      oldConstructor.apply(this, arguments);
      c = this;
      fm.util.observe(window, 'beforeunload', function() {
        var autoDisconnect, autoDisconnectConfig;
        autoDisconnect = c._autoDisconnect;
        if (autoDisconnect) {
          autoDisconnectConfig = c._autoDisconnectConfig;
          if (autoDisconnectConfig) {
            c.disconnect(autoDisconnectConfig);
          } else {
            c.disconnect();
          }
        }
      });
      return c;
    }
  };
  fm.websync.client.prototype = oldPrototype;
  for (prop in oldClient) {
    fm.websync.client[prop] = oldClient[prop];
  }
  client = fm.websync.client;
  client.prototype.setDisableCORS = function(disableCORS) {
    return this._disableCORS = disableCORS;
  };
  client.prototype.getDisableCORS = function() {
    return this._disableCORS || false;
  };
  client.prototype.setDisablePostMessage = function(disablePostMessage) {
    return this._disablePostMessage = disablePostMessage;
  };
  client.prototype.getDisablePostMessage = function() {
    return this._disablePostMessage || false;
  };
  client.prototype.setForceJSONP = function(forceJSONP) {
    return this._forceJSONP = forceJSONP;
  };
  client.prototype.getForceJSONP = function() {
    return this._forceJSONP || false;
  };
  return client.prototype.setAutoDisconnect = function(autoDisconnectConfig) {
    this._autoDisconnect = true;
    return this._autoDisconnectConfig = autoDisconnectConfig;
  };
})();
