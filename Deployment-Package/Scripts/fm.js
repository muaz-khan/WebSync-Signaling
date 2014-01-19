
/*
 * Vendor: Frozen Mountain Software
 * Title: FM Core for JavaScript
 * Version: 2.2.0
 * Copyright Frozen Mountain Software 2011+
 */

if (typeof global !== 'undefined' && !global.window) { global.window = global; global.document = { cookie: '' }; }

if (!window.fm) { window.fm = {}; }

var __bind =  function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

var __hasProp =  {}.hasOwnProperty;

var __extends =  function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

/*
    http://www.JSON.org/json2.js
    2011-02-23

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSONFM
            method, its toJSONFM method will be called and the result will be
            stringified. A toJSONFM method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSONFM method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSONFM = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false, regexp: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSONFM, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    "use strict";

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSONFM !== 'function') {

        Date.prototype.toJSONFM = function (key) {

            return isFinite(this.valueOf()) ?
                this.getUTCFullYear()     + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate())      + 'T' +
                f(this.getUTCHours())     + ':' +
                f(this.getUTCMinutes())   + ':' +
                f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSONFM      =
            Number.prototype.toJSONFM  =
            Boolean.prototype.toJSONFM = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSONFM method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSONFM === 'function') {
            value = value.toJSONFM(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' : gap ?
                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                    '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' : gap ?
                '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());


fm.util = (function() {
  var _this = this;

  function util() {}

  util._xdCache = {};

  util.isArray = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };

  util.isPlainObject = function(obj) {
    var key, x;
    if (!obj || Object.prototype.toString.call(obj) !== '[object Object]' || obj.nodeType || obj === obj.window) {
      return false;
    }
    try {
      if (obj.constructor && !Object.prototype.hasOwnProperty.call(obj, "constructor") && !Object.prototype.hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf")) {
        return false;
      }
    } catch (error) {
      return false;
    }
    for (key in obj) {
      x = 0;
    }
    return key === void 0 || Object.prototype.hasOwnProperty.call(obj, key);
  };

  util.canAttachProperties = function(instance, obj) {
    var key, setter, setterName, value;
    for (key in obj) {
      value = obj[key];
      setterName = 'set' + key.charAt(0).toUpperCase() + key.substring(1);
      setter = instance[setterName];
      if (!setter || Object.prototype.toString.call(setter) !== '[object Function]') {
        return false;
      }
    }
    return true;
  };

  util.attachProperties = function(instance, obj) {
    var key, setter, setterName, value, _results;
    _results = [];
    for (key in obj) {
      value = obj[key];
      setterName = 'set' + key.charAt(0).toUpperCase() + key.substring(1);
      setter = instance[setterName];
      _results.push(setter.call(instance, value));
    }
    return _results;
  };

  util.isIE = function() {
    return !!document.protocol;
  };

  util.isIE6 = function() {
    return util.isIE() && !window.XMLHttpRequest;
  };

  util.isIE7 = function() {
    return util.isIE() && window.XMLHttpRequest && !document.implementation;
  };

  util.isIE8 = function() {
    return util.isIE() && document.implementation && document.implementation.hasFeature && !document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");
  };

  util.isIE9 = function() {
    return util.isIE() && document.implementation && document.implementation.hasFeature && document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");
  };

  util.isXD = function(url1, url2) {
    var handlerHost, host1, host2, thisHost;
    try {
      if (url2) {
        host1 = util.getHost(url1);
        host2 = util.getHost(url2);
        return util.compareHost(host1, host2);
      } else {
        if (!util._xdCache[url1]) {
          handlerHost = util.getHost(url1);
          thisHost = util.getHost();
          util._xdCache[url1] = util.compareHost(handlerHost, thisHost) ? 'y' : 'n';
        }
        return util._xdCache[url1] === 'y';
      }
    } catch (error) {
      return false;
    }
  };

  util.getHost = function(url) {
    var parsed;
    if (!url) {
      return util.getCurrentHost();
    }
    parsed = util.parseUrl(url);
    if (!parsed.protocol) {
      return util.getCurrentHost();
    }
    return parsed;
  };

  util.compareHost = function(host1, host2) {
    return host1.server !== host2.server || ((host1.port || host2.port) && host1.port !== host2.port);
  };

  util.getCurrentHost = function() {
    var l;
    l = document.location;
    return {
      protocol: l.protocol,
      server: l.hostname,
      port: l.port
    };
  };

  util.parseUrl = function(url) {
    var parts;
    parts = /(((http|ws)s?:)\/\/)?([\-\w\.\*]+)+(:(\d+))?(\/([^\?]*(\?\S+)?)?)?/i.exec(url);
    if (parts.length < 6) {
      throw new Error('Invalid URL (' + url + ').');
    }
    return {
      prefix: parts[1],
      protocol: parts[2],
      server: parts[4],
      postfix: parts[5],
      port: parts[6],
      path: parts[7]
    };
  };

  util.absolutizeUrl = function(url) {
    var base, l, parsed;
    if (!url) {
      return url;
    }
    parsed = util.parseUrl(url);
    if (parsed.protocol) {
      if (parsed.server.indexOf('*') === -1) {
        return url;
      }
      url = parsed.prefix + util.wildcard(parsed.server);
      if (parsed.postfix) {
        url += parsed.postfix;
      }
      if (parsed.path) {
        url += parsed.path;
      }
      return url;
    }
    l = document.location;
    base = l.protocol + '//' + l.host;
    if (url.charAt(0) === '/') {
      return base + url;
    } else {
      return base + l.pathname.substring(0, l.pathname.lastIndexOf('/') + 1) + url;
    }
  };

  util.wildcard = function(str) {
    return str.replace('*', util.getWildcard());
  };

  util._chars = 'abcdefghijklmnopqrstuvwxyz';

  util.getWildcard = function() {
    if (!util._wildcard) {
      util._wildcard = util.randomChar(util._chars);
    }
    return util._wildcard;
  };

  util.randomChar = function(str) {
    if (!str) {
      return str;
    }
    return str.charAt(Math.floor(Math.random() * str.length));
  };

  util.observe = function(element, event, handler) {
    if (element.addEventListener) {
      return element.addEventListener(event, handler, false);
    } else if (element.attachEvent) {
      return element.attachEvent('on' + event, handler);
    } else {
      return element['on' + event] = handler;
    }
  };

  util.unobserve = function(element, event, handler) {
    if (element.removeEventListener) {
      return element.removeEventListener(event, handler, false);
    } else {
      return element.detachEvent('on' + event, handler);
    }
  };

  util.extend = function(dest, src) {
    var key;
    for (key in src) {
      dest[key] = src[key];
    }
    return dest;
  };

  util.logging = true;

  util.log = function(text) {
    var div;
    if (!util.logging) {
      return;
    }
    if (!document.body) {
      util.addOnLoad(function() {
        return util.log(text);
      });
      return;
    }
    if (!util._logContainer) {
      util._logContainer = document.createElement('div');
      util._logContainer.className = 'fm-log';
      util._logContainer.style.position = 'absolute';
      util._logContainer.style.zIndex = 99999;
      util._logContainer.style.right = '5px';
      util._logContainer.style.top = '5px';
      document.body.appendChild(util._logContainer);
    }
    div = document.createElement('div');
    div.innerHTML = text;
    return util._logContainer.appendChild(div);
  };

  util._loadFunctions = [];

  util.addOnLoad = function(fn) {
    if (util._readyRun) {
      return window.setTimeout(fn, 1);
    } else {
      return util._loadFunctions.push(fn);
    }
  };

  util.ready = function() {
    if (util._readyRun) {
      return;
    }
    util._readyRun = true;
    return window.setTimeout(function() {
      var loadFunction, _i, _len, _ref, _results;
      _ref = util._loadFunctions;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        loadFunction = _ref[_i];
        _results.push(loadFunction());
      }
      return _results;
    }, 1);
  };

  util.bindReady = function() {
    var topLevel;
    if (util._readyBound) {
      return;
    }
    util._readyBound = true;
    if (document.addEventListener) {
      return document.addEventListener("DOMContentLoaded", function() {
        document.removeEventListener("DOMContentLoaded", arguments.callee, false);
        return util.ready();
      }, false);
    } else if (document.attachEvent) {
      document.attachEvent("onreadystatechange", function() {
        if (document.readyState === "complete") {
          document.detachEvent("onreadystatechange", arguments.callee);
          return util.ready();
        }
      });
      try {
        topLevel = window.frameElement === null;
      } catch (_error) {}
      if (document.documentElement.doScroll && topLevel) {
        return (function() {
          if (util._loaded) {
            return;
          }
          try {
            document.documentElement.doScroll("left");
          } catch (error) {
            window.setTimeout(arguments.callee, 0);
            return;
          }
          return util.ready();
        })();
      }
    } else {
      return util.ready();
    }
  };

  if (!util._loaded) {
    util.addOnLoad(function() {
      return util._loaded = true;
    });
  }

  util.bindReady();

  return util;

}).call(this);



fm.object = (function() {

  function object() {}

  return object;

})();



fm.global = (function() {

  function global() {}

  global.tryCast = function(x, t) {
    if (!x || x instanceof t) {
      return x;
    }
    return null;
  };

  global.tryCastArray = function(x) {
    if (!x || x instanceof Array) {
      return x;
    }
    return null;
  };

  global.tryCastObject = function(x) {
    if (!x || x instanceof Object) {
      return x;
    }
    return null;
  };

  global.tryCastString = function(x) {
    if (!x || typeof x === "string") {
      return x;
    }
  };

  global.tryCastInt = function(x) {
    if (!x || !isNaN(parseInt(x))) {
      return x;
    }
    return null;
  };

  global.tryCastFloat = function(x) {
    if (!x || !isNaN(parseFloat(x))) {
      return x;
    }
    return null;
  };

  return global;

}).call(this);



fm.stringComparison = {
  CurrentCulture: 0,
  CurrentCultureIgnoreCase: 1,
  InvariantCulture: 2,
  InvariantCultureIgnoreCase: 3,
  Ordinal: 4,
  OrdinalIgnoreCase: 5
};


var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

fm.dateTime = (function() {

  function dateTime() {
    this.getSecond = __bind(this.getSecond, this);

    this.getMinute = __bind(this.getMinute, this);

    this.getHour = __bind(this.getHour, this);

    this.getDay = __bind(this.getDay, this);

    this.getMonth = __bind(this.getMonth, this);

    this.getYear = __bind(this.getYear, this);

    this.toUniversalTime = __bind(this.toUniversalTime, this);

    this.getTicks = __bind(this.getTicks, this);

    var day, hour, minute, month, second, year;
    if (arguments.length === 1) {
      this._date = arguments[0];
    } else if (arguments.length === 6) {
      year = arguments[0];
      month = arguments[1];
      day = arguments[2];
      hour = arguments[3];
      minute = arguments[4];
      second = arguments[5];
      this._date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    } else {
      throw new Error('Unknown argument set.');
    }
  }

  dateTime.getNow = function() {
    return new fm.dateTime(new Date());
  };

  dateTime.getUtcNow = function() {
    return new fm.dateTime(new Date());
  };

  dateTime.prototype.getTicks = function() {
    return 621355968000000000 + this._date.getTime() * 10000;
  };

  dateTime.prototype.toUniversalTime = function() {
    return new fm.dateTime(this._date);
  };

  dateTime.prototype.getYear = function() {
    return this._date.getUTCFullYear();
  };

  dateTime.prototype.getMonth = function() {
    return this._date.getUTCMonth() + 1;
  };

  dateTime.prototype.getDay = function() {
    return this._date.getUTCDate();
  };

  dateTime.prototype.getHour = function() {
    return this._date.getUTCHours();
  };

  dateTime.prototype.getMinute = function() {
    return this._date.getUTCMinutes();
  };

  dateTime.prototype.getSecond = function() {
    return this._date.getUTCSeconds();
  };

  return dateTime;

}).call(this);


var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

fm.nameValueCollection = (function() {

  function nameValueCollection() {
    this.getAllKeys = __bind(this.getAllKeys, this);

    this.getKeys = __bind(this.getKeys, this);

    var n, v, _ref;
    this._value = {};
    if (arguments.length === 1) {
      _ref = arguments[0];
      for (n in _ref) {
        v = _ref[n];
        this._value[n] = v;
      }
    }
  }

  nameValueCollection.prototype.source = function() {
    return this._value;
  };

  nameValueCollection.prototype.get = function(name) {
    var n;
    for (n in this._value) {
      if (n.toLowerCase() === name.toLowerCase()) {
        return this._value[n];
      }
    }
    return null;
  };

  nameValueCollection.prototype.set = function(name, value) {
    var n;
    for (n in this._value) {
      if (n.toLowerCase() === name.toLowerCase()) {
        this._value[n] = value;
        return;
      }
    }
    return this._value[name] = value;
  };

  nameValueCollection.prototype.getCount = function() {
    var i, n;
    i = 0;
    for (n in this._value) {
      i++;
    }
    return i;
  };

  nameValueCollection.prototype.toHash = function() {
    return this._value;
  };

  nameValueCollection.prototype.getKeys = function() {
    return this.getAllKeys();
  };

  nameValueCollection.prototype.getAllKeys = function() {
    var k, keys;
    keys = [];
    for (k in this._value) {
      keys.push(k);
    }
    return keys;
  };

  return nameValueCollection;

})();



fm.stringBuilder = (function() {

  function stringBuilder() {
    this._value = '';
    if (arguments.length === 1) {
      this._value = arguments[0];
    }
  }

  stringBuilder.prototype.append = function(s) {
    this._value = this._value + s;
    return this;
  };

  stringBuilder.prototype.toString = function() {
    return this._value;
  };

  stringBuilder.prototype.getLength = function() {
    return this._value.length;
  };

  stringBuilder.prototype.remove = function(startIndex, length) {
    this._value = this._value.substring(0, startIndex) + this._value.substring(startIndex + length);
    return this;
  };

  return stringBuilder;

})();



fm.uri = (function() {

  function uri() {}

  uri.tryCreate = function(uriString, uriKind, result) {
    result.setValue(uriString);
    return true;
  };

  uri.tryCreate = function(baseUri, relativeUri, result) {
    if (baseUri.indexOf('/', baseUri.length - '/'.length) === -1) {
      baseUri += '/';
    }
    if (relativeUri.indexOf('/') === 0) {
      relativeUri = relativeUri.substring(1);
    }
    result.setValue(baseUri + relativeUri);
    return true;
  };

  uri.escapeDataString = function(s) {
    return encodeURIComponent(s);
  };

  return uri;

})();



fm.guid = (function() {

  function guid() {
    if (arguments.length === 0) {
      this._guid = '00000000-0000-0000-0000-000000000000';
    } else {
      this._guid = arguments[0];
    }
  }

  guid.prototype.equals = function(guid) {
    return guid.toString() === this._guid;
  };

  guid.prototype.toString = function() {
    return this._guid;
  };

  guid.empty = new guid();

  return guid;

})();



fm.holder = (function() {

  function holder(value) {
    this._value = value;
  }

  holder.prototype.getValue = function() {
    return this._value;
  };

  holder.prototype.setValue = function(value) {
    return this._value = value;
  };

  return holder;

})();



fm.interlocked = (function() {

  function interlocked() {}

  interlocked.increment = function(holder) {
    var value;
    value = holder.getValue();
    value++;
    holder.setValue(value);
    return value;
  };

  interlocked.compareExchange = function(holder, value, comparand) {
    var initial;
    initial = holder.getValue();
    if (initial === comparand) {
      holder.setValue(value);
    }
    return initial;
  };

  return interlocked;

})();



fm.delegate = (function() {

  function delegate() {}

  delegate.combine = function(a, b) {
    var chain, f, fn, self, _i, _j, _len, _len1, _ref, _ref1;
    if (!a) {
      return b;
    }
    if (!b) {
      return a;
    }
    self = this;
    chain = [];
    fn = function() {
      var f, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = chain.length; _i < _len; _i++) {
        f = chain[_i];
        _results.push(f.apply(self, arguments));
      }
      return _results;
    };
    if (a._chain) {
      _ref = a._chain;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        f = _ref[_i];
        chain.push(f);
      }
    } else {
      chain.push(a);
    }
    if (b._chain) {
      _ref1 = b._chain;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        f = _ref1[_j];
        chain.push(f);
      }
    } else {
      chain.push(b);
    }
    fn._chain = chain;
    return fn;
  };

  delegate.remove = function(source, value) {
    var f, i, _i, _len, _ref;
    if (!source || source === value) {
      return null;
    }
    if (source._chain) {
      _ref = source._chain;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        f = _ref[i];
        if (f === value) {
          source._chain.splice(i, 1);
          break;
        }
      }
    }
    return source;
  };

  return delegate;

})();


var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

fm.stack = (function() {

  function stack() {
    this.peek = __bind(this.peek, this);

    this.pop = __bind(this.pop, this);

    this.push = __bind(this.push, this);
    this._list = [];
  }

  stack.prototype.push = function(o) {
    return this._list.push(o);
  };

  stack.prototype.pop = function(o) {
    return this._list.pop();
  };

  stack.prototype.peek = function() {
    if (this._list.length === 0) {
      return null;
    }
    return this._list[this._list.length - 1];
  };

  return stack;

})();


var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

fm.thread = (function() {

  thread._lastThreadId = 0;

  function thread() {
    this.getManagedThreadId = __bind(this.getManagedThreadId, this);
    this._id = ++fm.thread._lastThreadId;
  }

  thread.prototype.getManagedThreadId = function() {
    return this._id;
  };

  thread.getCurrentThread = function() {
    if (!thread._thread) {
      thread._thread = new fm.thread();
    }
    return thread._thread;
  };

  return thread;

}).call(this);



fm.deferrer = (function() {

  function deferrer() {}

  deferrer.defer = function(callback, timeout, state) {
    var _this = this;
    return window.setTimeout(function() {
      return callback(state);
    }, timeout);
  };

  return deferrer;

})();



fm.dateTimeStyles = {
  AssumeUniversal: 1,
  AdjustToUniversal: 2
};



fm.dateTimeFormatInfo = (function() {

  function dateTimeFormatInfo() {}

  dateTimeFormatInfo.getInvariantInfo = function() {
    return new fm.dateTimeFormatInfo();
  };

  return dateTimeFormatInfo;

}).call(this);



fm.convert = (function() {

  function convert() {}

  convert.toInt32 = function(s) {
    return s.charCodeAt();
  };

  return convert;

}).call(this);



fm.parseAssistant = (function() {

  function parseAssistant() {}

  parseAssistant.tryParseInteger = function(s, h) {
    if (isNaN(parseInt(s))) {
      return false;
    }
    h.setValue(parseInt(s));
    return true;
  };

  parseAssistant.tryParseLong = function(s, h) {
    if (isNaN(parseInt(s))) {
      return false;
    }
    h.setValue(parseInt(s));
    return true;
  };

  parseAssistant.tryParseFloat = function(s, h) {
    if (isNaN(parseFloat(s))) {
      return false;
    }
    h.setValue(parseFloat(s));
    return true;
  };

  parseAssistant.tryParseDouble = function(s, h) {
    if (isNaN(parseFloat(s))) {
      return false;
    }
    h.setValue(parseFloat(s));
    return true;
  };

  parseAssistant.tryParseDecimal = function(s, h) {
    if (isNaN(parseFloat(s))) {
      return false;
    }
    h.setValue(parseFloat(s));
    return true;
  };

  parseAssistant.tryParseBoolean = function(s, h) {
    if (s.toLowerCase() === "true" || s.toLowerCase() === "y" || s === "1") {
      h.setValue(true);
    } else {
      h.setValue(false);
    }
    return true;
  };

  parseAssistant.tryParseGuid = function(s, h) {
    if (!(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(s))) {
      return false;
    }
    h.setValue(new fm.guid(s));
    return true;
  };

  return parseAssistant;

}).call(this);



fm.stringExtensions = (function() {

  function stringExtensions() {}

  stringExtensions.empty = '';

  stringExtensions.concat = function(strs) {
    var sb, str, _i, _len;
    sb = new fm.stringBuilder();
    for (_i = 0, _len = strs.length; _i < _len; _i++) {
      str = strs[_i];
      sb.append(str);
    }
    return sb.toString();
  };

  stringExtensions.toString = function() {
    return arguments[0];
  };

  stringExtensions.trim = function(s) {
    return s.replace(/^\s+|\s+$/g, '');
  };

  stringExtensions.concat = function() {
    var s, x, _i, _j, _len, _len1, _ref;
    s = '';
    if (arguments.length === 1 && fm.util.isArray(arguments[0])) {
      _ref = arguments[0];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        x = _ref[_i];
        s = s + x;
      }
    } else {
      for (_j = 0, _len1 = arguments.length; _j < _len1; _j++) {
        x = arguments[_j];
        s = s + x;
      }
    }
    return s;
  };

  stringExtensions.join = function(separator, array) {
    var i, sb, str, _i, _len;
    sb = new fm.stringBuilder();
    for (i = _i = 0, _len = array.length; _i < _len; i = ++_i) {
      str = array[i];
      if (i > 0) {
        sb.append(separator);
      }
      sb.append(str);
    }
    return sb.toString();
  };

  stringExtensions.split = function(s, chars) {
    var c, i, splits, start, _i, _j, _len, _ref;
    splits = [];
    start = 0;
    for (i = _i = 0, _ref = s.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      for (_j = 0, _len = chars.length; _j < _len; _j++) {
        c = chars[_j];
        if (c === s.charAt(i)) {
          splits.push(s.substring(start, i));
          start = i + 1;
        }
      }
    }
    splits.push(s.substring(start, s.length));
    return splits;
  };

  stringExtensions.isNullOrEmpty = function(s) {
    return s === null || s === "";
  };

  stringExtensions.indexOf = function() {
    var s, str, stringComparison;
    str = arguments[0];
    s = arguments[1];
    if (arguments.length > 2) {
      stringComparison = arguments[2];
      if (stringComparison === fm.stringComparison.CurrentCultureIgnoreCase || stringComparison === fm.stringComparison.InvariantCultureIgnoreCase || stringComparison === fm.stringComparison.OrdinalIgnoreCase) {
        return str.toLowerCase().indexOf(s.toLowerCase());
      }
    }
    return str.indexOf(s);
  };

  stringExtensions.startsWith = function() {
    var s, str, stringComparison;
    str = arguments[0];
    s = arguments[1];
    if (arguments.length > 2) {
      stringComparison = arguments[2];
      if (stringComparison === fm.stringComparison.CurrentCultureIgnoreCase || stringComparison === fm.stringComparison.InvariantCultureIgnoreCase || stringComparison === fm.stringComparison.OrdinalIgnoreCase) {
        return str.toLowerCase().indexOf(s.toLowerCase()) === 0;
      }
    }
    return str.indexOf(s) === 0;
  };

  stringExtensions.endsWith = function() {
    var s, str, stringComparison;
    str = arguments[0];
    s = arguments[1];
    if (arguments.length > 2) {
      stringComparison = arguments[2];
      if (stringComparison === fm.stringComparison.CurrentCultureIgnoreCase || stringComparison === fm.stringComparison.InvariantCultureIgnoreCase || stringComparison === fm.stringComparison.OrdinalIgnoreCase) {
        return str.toLowerCase().indexOf(s.toLowerCase(), str.length - s.length) !== -1;
      }
    }
    return str.indexOf(s, str.length - s.length) !== -1;
  };

  stringExtensions.format = function() {
    var args, format, formatter, i, _i, _ref;
    format = arguments[0];
    args = [];
    for (i = _i = 1, _ref = arguments.length - 1; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
      args.push(arguments[i] ? arguments[i] : '');
    }
    formatter = function(match, number) {
      if (args[number] != null) {
        return args[number];
      }
      return match;
    };
    return format.replace(/{(\d+)}/g, formatter);
  };

  stringExtensions.toLower = function() {
    return arguments[0].toLowerCase();
  };

  stringExtensions.getLength = function() {
    return arguments[0].length;
  };

  stringExtensions.getChars = function(str) {
    var chars, i, _i, _ref;
    chars = [];
    for (i = _i = 0, _ref = str.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      chars.push(str[i]);
    }
    return new chars;
  };

  stringExtensions.substring = function(str, startIndex, length) {
    return str.substring(startIndex, startIndex + length);
  };

  return stringExtensions;

}).call(this);



fm.arrayExtensions = (function() {

  function arrayExtensions() {}

  arrayExtensions.getCount = function(array) {
    return array.length;
  };

  arrayExtensions.add = function(array, value) {
    return array.push(value);
  };

  arrayExtensions.remove = function(array, value) {
    var i, obj, _i, _len;
    for (i = _i = 0, _len = array.length; _i < _len; i = ++_i) {
      obj = array[i];
      if (obj === value) {
        array.splice(i, 1);
        return true;
      }
    }
    return false;
  };

  arrayExtensions.toArray = function(array) {
    return array;
  };

  arrayExtensions.clear = function(array) {
    return array.splice(0, array.length);
  };

  arrayExtensions.addRange = function(array, values) {
    var v, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = values.length; _i < _len; _i++) {
      v = values[_i];
      _results.push(array.push(v));
    }
    return _results;
  };

  arrayExtensions.contains = function(array, value) {
    var obj, _i, _len;
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      obj = array[_i];
      if (obj === value) {
        return true;
      }
    }
    return false;
  };

  return arrayExtensions;

}).call(this);



fm.hashExtensions = (function() {

  function hashExtensions() {}

  hashExtensions.getCount = function(obj) {
    var i, k;
    i = 0;
    for (k in obj) {
      i++;
    }
    return i;
  };

  hashExtensions.getKeys = function(obj) {
    var k, keys;
    keys = [];
    for (k in obj) {
      keys.push(k);
    }
    return keys;
  };

  hashExtensions.getValues = function(obj) {
    var k, v, values;
    values = [];
    for (k in obj) {
      v = obj[k];
      values.push(v);
    }
    return values;
  };

  hashExtensions.tryGetValue = function(obj, key, holder) {
    if (hashExtensions.containsKey(obj, key)) {
      holder.setValue(obj[key]);
      return true;
    }
    return false;
  };

  hashExtensions.containsKey = function(obj, key) {
    if (key in obj) {
      return true;
    } else {
      return false;
    }
  };

  hashExtensions.containsValue = function(obj, value) {
    var k, v;
    for (k in obj) {
      v = obj[k];
      if (v === value) {
        return true;
      }
    }
    return false;
  };

  hashExtensions.add = function(obj, key, value) {
    return obj[key] = value;
  };

  hashExtensions.remove = function(obj, key) {
    return delete obj[key];
  };

  hashExtensions.clear = function(obj) {
    var key, _results;
    _results = [];
    for (key in obj) {
      _results.push(delete obj[key]);
    }
    return _results;
  };

  return hashExtensions;

}).call(this);



fm.intExtensions = (function() {

  function intExtensions() {}

  intExtensions.toString = function() {
    return arguments[0].toString();
  };

  return intExtensions;

})();



fm.xhr = (function() {
  var _this = this;

  function xhr() {}

  xhr._count = 0;

  xhr._current = {};

  fm.util.observe(window, 'unload', function() {
    var c, x, _ref;
    _ref = xhr._current;
    for (c in _ref) {
      x = _ref[c];
      try {
        x._abortingOnUnload = true;
        x.abort();
      } catch (_error) {}
    }
  });

  xhr.failureHandler = function(options, message) {
    if (options.onFailure) {
      return options.onFailure({
        message: message
      });
    }
  };

  xhr.successHandler = function(options, x) {
    var headerString, headers, line, name, parts, value, _i, _len, _ref;
    if (options.onSuccess) {
      headers = {};
      headerString = x.getAllResponseHeaders();
      if (headerString) {
        _ref = headerString.split(/\r?\n/);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          line = _ref[_i];
          parts = line.split(':');
          if (parts.length !== 2) {
            continue;
          }
          name = parts[0].replace(/\s+$/, '');
          value = parts[1].replace(/^\s+/, '');
          headers[name] = value;
        }
        return options.onSuccess({
          content: x.responseText,
          statusCode: x.status,
          headers: headers
        });
      } else {
        return options.onSuccess({
          content: x.responseText,
          statusCode: x.status,
          headers: {}
        });
      }
    }
  };

  xhr.handler = function(options, x) {
    if (x._aborting) {
      return xhr.failureHandler(options, 'XHR request timed out.');
    } else {
      if (options.onResponseReceived) {
        options.onResponseReceived(x);
      }
      return xhr.successHandler(options, x);
    }
  };

  xhr.send = function(options) {
    var c, name, url, value, x, xhrTimeout, _ref;
    options = fm.util.extend({
      sync: false,
      url: '',
      method: 'POST',
      content: null,
      headers: {},
      timeout: 15000,
      abortOnUnload: false,
      cacheBusterParameterName: '_cb',
      onRequestCreated: function() {},
      onResponseReceived: function() {},
      onFailure: function() {},
      onSuccess: function() {}
    }, options || {});
    try {
      if (window.XMLHttpRequest) {
        x = new XMLHttpRequest();
      } else {
        try {
          x = new ActiveXObject('MSXML2.XMLHTTP.3.0');
        } catch (_error) {}
        if (!x) {
          try {
            x = new ActiveXObject('Microsoft.XMLHTTP');
          } catch (_error) {}
        }
      }
      if (!x) {
        return false;
      }
      url = options.url;
      url = url + (url.indexOf('?') === -1 ? '?' : '&') + options.cacheBusterParameterName + '=' + (new Date()).getTime();
      x.open(options.method, url, !options.sync);
      _ref = options.headers;
      for (name in _ref) {
        value = _ref[name];
        if (name.toLowerCase() !== 'referer' && name.toLowerCase() !== 'origin') {
          x.setRequestHeader(name, value);
        }
      }
      if ('withCredentials' in x) {
        x.withCredentials = true;
      }
      if (options.onRequestCreated) {
        options.onRequestCreated(x);
      }
      if (options.abortOnUnload) {
        c = ++xhr._count;
        xhr._current[c] = x;
      }
      if (!options.sync) {
        x.onreadystatechange = function() {
          if (x.readyState > 3 && !x._abortingOnUnload) {
            clearTimeout(xhrTimeout);
            try {
              x.onreadystatechange = null;
            } catch (ex) {
              x.onreadystatechange = function() {};
            }
            if (x.status > 0) {
              xhr.handler(options, x);
            } else {
              xhr.failureHandler(options, 'Invalid XHR response.');
            }
            if (options.abortOnUnload) {
              return delete xhr._current[c];
            }
          }
        };
      }
      if (options.content) {
        x.send(options.content);
      } else {
        x.send();
      }
      xhrTimeout = window.setTimeout(function() {
        try {
          x._aborting = true;
          return x.abort();
        } catch (_error) {}
      }, options.timeout);
      if (options.sync) {
        xhr.handler(options, x);
        if (options.abortOnUnload) {
          delete xhr._xhrCurrent[c];
        }
      }
      return true;
    } catch (error) {
      return xhr.failureHandler(options, 'XHR request failed. ' + (error.message || error.error || error.description || error));
    }
  };

  return xhr;

}).call(this);



fm.postMessage = (function() {

  function postMessage() {}

  postMessage._cache = {};

  postMessage.createFrame = function(options, callback) {
    var activateFrame, callbacks, frame, loadTimeout, record;
    record = postMessage._cache[options.url];
    if (!record) {
      frame = document.createElement('iframe');
      frame.style.display = 'none';
      document.body.appendChild(frame);
      callbacks = [callback];
      postMessage._cache[options.url] = record = {
        frame: frame,
        callbacks: callbacks
      };
      loadTimeout = window.setTimeout(function() {
        var _results;
        frame.loading = false;
        frame.loaded = false;
        frame.timedOut = true;
        _results = [];
        while (callbacks.length > 0) {
          _results.push(callbacks.shift()(null));
        }
        return _results;
      }, options.timeout);
      activateFrame = null;
      frame.loading = true;
      fm.util.observe(frame, 'load', function() {
        var pongTimeout, receivePong;
        if (frame.timedOut) {
          return;
        }
        clearTimeout(loadTimeout);
        receivePong = function(e) {
          if (e.source === frame.contentWindow && e.data === 'pong') {
            if (frame.timedOut) {
              return;
            }
            clearTimeout(pongTimeout);
            frame.loading = false;
            frame.loaded = true;
            frame.timedOut = false;
            postMessage.listen(options, frame);
            while (callbacks.length > 0) {
              callbacks.shift()(frame);
            }
            return fm.util.unobserve(window, 'message', receivePong);
          }
        };
        pongTimeout = window.setTimeout(function() {
          frame.loading = false;
          frame.loaded = false;
          frame.timedOut = true;
          while (callbacks.length > 0) {
            callbacks.shift()(null);
          }
          if (receivePong) {
            return fm.util.unobserve(window, 'message', receivePong);
          }
        }, 500);
        fm.util.observe(window, 'message', receivePong);
        return frame.contentWindow.postMessage('ping', postMessage.getOrigin(options.url));
      });
      return frame.src = fm.httpTransfer.addQueryToUrl(options.url, 'type', 'pmf');
    } else {
      if (record.frame.loading) {
        return record.callbacks.push(callback);
      } else {
        return window.setTimeout(function() {
          if (record.frame.loaded) {
            return callback(record.frame);
          } else {
            return callback(null);
          }
        }, 1);
      }
    }
  };

  postMessage._optionsCounter = 0;

  postMessage._optionsCache = {};

  postMessage.getOrigin = function(url) {
    return /\w+:\/\/[^/]+/.exec(url)[0];
  };

  postMessage.send = function(options) {
    options = fm.util.extend({
      url: '',
      onFailure: function() {},
      onSuccess: function() {},
      onRequestCreated: function() {},
      onResponseReceived: function() {}
    }, options || {});
    return postMessage.createFrame(options, function(frame) {
      if (frame) {
        options.id = ++postMessage._optionsCounter;
        postMessage._optionsCache[options.id] = options;
        return frame.contentWindow.postMessage(fm.json.serialize(options), postMessage.getOrigin(options.url));
      } else {
        if (options.onFailure) {
          return options.onFailure({
            message: 'Could not initialize postMessage frame.'
          });
        }
      }
    });
  };

  postMessage.listen = function(options, frame) {
    return fm.util.observe(window, 'message', function(e) {
      if (e.source === frame.contentWindow) {
        try {
          e = fm.json.deserialize(e.data);
        } catch (err) {
          return;
        }
        if (!e.id) {
          return;
        }
        options = postMessage._optionsCache[e.id];
        if (!options) {
          return;
        }
        if (e.type === 1 || e.type === 2) {
          delete postMessage._optionsCache[e.id];
        }
        if (e.type === 1) {
          if (options.onFailure) {
            return options.onFailure(e);
          }
        } else if (e.type === 2) {
          if (options.onSuccess) {
            return options.onSuccess(e);
          }
        } else if (e.type === 3) {
          if (options.onRequestCreated) {
            return options.onRequestCreated(null);
          }
        } else if (e.type === 4) {
          if (options.onResponseReceived) {
            return options.onResponseReceived(null);
          }
        }
      }
    });
  };

  return postMessage;

}).call(this);



fm.jsonp = (function() {

  function jsonp() {}

  jsonp.send = function(options) {};

  jsonp._scriptFrame = null;

  jsonp._scriptFrameLoaded = false;

  jsonp._callbackCount = 0;

  jsonp._cb = {};

  jsonp._pastScriptFrames = [];

  jsonp._scriptFrameDestroyer = null;

  jsonp.maxUrlLength = 2048;

  jsonp.getNextCallback = function(options) {
    var name, namespace;
    name = 'cb' + (jsonp._callbackCount++);
    namespace = 'fm.jsonp._cb.';
    jsonp._cb[name] = function(response) {
      var content;
      try {
        if (options.onResponseReceived) {
          options.onResponseReceived(null);
        }
        if (options.onSuccess) {
          if (options.robustResponse) {
            content = response[options.contentParameterName];
            if (!content) {
              content = '';
            } else if (typeof content !== 'string') {
              content = fm.json.serialize(content);
            }
            return options.onSuccess({
              content: content,
              statusCode: response[options.statusCodeParameterName] || 200,
              headers: response[options.headersParameterName] || {}
            });
          } else {
            content = response;
            if (!content) {
              content = '';
            } else if (typeof content !== 'string') {
              content = fm.json.serialize(content);
            }
            return options.onSuccess({
              content: content,
              statusCode: 200,
              headers: {}
            });
          }
        }
      } catch (error) {
        throw error;
      } finally {
        jsonp.cleanup((options.useFrame ? 'parent.' : '') + namespace + name, options.useFrame);
      }
    };
    return (options.useFrame ? 'parent.' : '') + namespace + name;
  };

  jsonp.failureHandler = function(options, callbackName, message) {
    if (options.onFailure) {
      options.onFailure({
        message: message
      });
    }
    return jsonp.cleanup(callbackName, options.useFrame);
  };

  jsonp.send = function(options) {
    var callbackName, container, doc, script, url;
    try {
      options = fm.util.extend({
        url: '',
        method: 'POST',
        content: null,
        headers: {},
        timeout: 15000,
        canSegmentJsonArray: false,
        robustResponse: false,
        callbackParameterName: 'jsonp',
        contentParameterName: 'content',
        methodParameterName: 'method',
        headersParameterName: 'headers',
        statusCodeParameterName: 'statusCode',
        cacheBusterParameterName: '_cb',
        onRequestCreated: function() {},
        onResponseReceived: function() {},
        onFailure: function() {},
        onSuccess: function() {}
      }, options || {});
      options.useFrame = true;
      callbackName = jsonp.getNextCallback(options);
      if (options.useFrame) {
        if (!jsonp._scriptFrameDestroyer) {
          jsonp._scriptFrameDestroyer = window.setInterval(function() {
            var prop, _i, _len, _ref;
            if (jsonp._scriptFrame !== null) {
              jsonp._pastScriptFrames.push(jsonp._scriptFrame);
              jsonp._scriptFrame = null;
              jsonp._scriptFrameLoaded = false;
              if (jsonp._pastScriptFrames.length === 2) {
                _ref = jsonp._pastScriptFrames[0];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                  prop = _ref[_i];
                  delete jsonp._pastScriptFrames[0][prop];
                }
                document.body.removeChild(jsonp._pastScriptFrames[0]);
                return jsonp._pastScriptFrames.splice(0, 1);
              }
            }
          }, 300000);
        }
      }
      container = document.getElementsByTagName('head')[0];
      if (options.useFrame) {
        if (!jsonp._scriptFrame) {
          jsonp._scriptFrame = document.createElement('iframe');
          jsonp._scriptFrame.style.display = 'none';
          jsonp._scriptFrame.src = 'ignore_this_404.htm';
          document.body.appendChild(jsonp._scriptFrame);
        }
        doc = jsonp._scriptFrame.contentWindow.document;
        if (!doc) {
          throw 'Could not create script frame.';
        }
        script = doc.createElement('script');
      } else {
        script = document.createElement('script');
      }
      script.type = 'text/javascript';
      script.charset = 'utf-8';
      script.id = callbackName;
      url = options.url;
      url = fm.httpTransfer.addQueryToUrl(url, options.methodParameterName, options.method);
      url = fm.httpTransfer.addQueryToUrl(url, options.headersParameterName, fm.json.serialize(options.headers));
      url = fm.httpTransfer.addQueryToUrl(url, options.callbackParameterName, callbackName);
      url = fm.httpTransfer.addQueryToUrl(url, options.cacheBusterParameterName, (new Date()).getTime());
      url = fm.httpTransfer.addQueryToUrl(url, options.contentParameterName, options.content);
      if (url.length > jsonp.maxUrlLength) {
        alert('URL length ' + url.length + ' exceeds maximum for JSON-P (' + jsonp.maxUrlLength + ').');
      }
      script.src = url;
      if (options.onRequestCreated) {
        options.onRequestCreated(null);
      }
      window.setTimeout(function() {
        if (jsonp.callbackExists(callbackName)) {
          return jsonp.failureHandler(options, callbackName, 'JSONP request timed out.');
        }
      }, options.timeout);
      if (options.useFrame) {
        if (!jsonp._scriptFrameLoaded) {
          return fm.util.observe(jsonp._scriptFrame, 'load', function() {
            window.setTimeout(function() {
              try {
                container = jsonp._scriptFrame.contentWindow.document.body;
                return container.appendChild(script);
              } catch (error) {
                return jsonp.failureHandler(options, callbackName, 'JSONP request failed. Could not access script frame.');
              }
            }, 10);
            return jsonp._scriptFrameLoaded = true;
          });
        } else {
          try {
            container = jsonp._scriptFrame.contentWindow.document.body;
            return container.appendChild(script);
          } catch (error) {
            return jsonp.failureHandler(options, callbackName, 'JSONP request failed. Could not access script frame.');
          }
        }
      } else {
        return container.appendChild(script);
      }
    } catch (error) {
      return jsonp.failureHandler(options, callbackName, 'JSONP request failed. ' + (error.message || error.error || error.description || error));
    }
  };

  jsonp.cleanup = function(callbackName, useFrame) {
    var doc, i, name, parts, script, scriptFrames, _i, _ref;
    parts = callbackName.split('.');
    name = parts[parts.length - 1];
    jsonp._cb[name] = null;
    delete jsonp._cb[name];
    try {
      if (useFrame) {
        scriptFrames = jsonp._pastScriptFrames.concat([]);
        if (jsonp._scriptFrame !== null) {
          scriptFrames.push(jsonp._scriptFrame);
        }
        for (i = _i = _ref = scriptFrames.length - 1; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) {
          doc = scriptFrames[i].contentWindow.document;
          if (doc) {
            script = doc.getElementById(callbackName);
          }
          if (script) {
            break;
          }
        }
        if (script) {
          return doc.body.removeChild(script);
        }
      } else {
        script = document.getElementById(callbackName);
        if (script) {
          return document.getElementsByTagName('head')[0].removeChild(script);
        }
      }
    } catch (error) {
      if (window && window.console && window.console.error) {
        return window.console.error('Could not remove script element. ' + (error.message || error.error || error.description || error));
      }
    }
  };

  jsonp.callbackExists = function(callbackName) {
    var name, parts;
    parts = callbackName.split('.');
    name = parts[parts.length - 1];
    return name in jsonp._cb;
  };

  return jsonp;

}).call(this);



fm.json = (function() {

  function json() {}

  json.useMicrosoftDateFormat = true;

  json._dateRegex = /\/Date\((\d+[\-|\+]?\d{0,4})\)\//;

  json._reviver = function(key, value) {
    var delim, parts, ticks, ticksAndZone;
    if (value && typeof value === 'string' && json._dateRegex.test(value)) {
      ticksAndZone = value.match(json._dateRegex)[1];
      delim = ticksAndZone.indexOf('-') > -1 ? '-' : '+';
      parts = ticksAndZone.split(delim);
      ticks = parseInt(parts[0], 10);
      return new Date(ticks);
    }
    return value;
  };

  Date.prototype.toJSONFM = function(key) {
    if (isFinite(this.valueOf())) {
      return '/Date(' + this.getTime() + '-0000)/';
    } else {
      return null;
    }
  };

  json.deserialize = function() {
    if (arguments.length === 0 || arguments[0] === null || arguments[0] === '') {
      return null;
    }
    if (json.useMicrosoftDateFormat) {
      return JSON.parse(arguments[0], json._reviver);
    }
    return JSON.parse.apply(json, arguments);
  };

  json.serialize = function() {
    var booleanToJSON, dateToJSON, j, numberToJSON, stringToJSON;
    if (json.useMicrosoftDateFormat) {
      dateToJSON = Date.prototype.toJSON;
      stringToJSON = String.prototype.toJSON;
      numberToJSON = Number.prototype.toJSON;
      booleanToJSON = Boolean.prototype.toJSON;
      Date.prototype.toJSON = Date.prototype.toJSONFM;
      String.prototype.toJSON = String.prototype.toJSONFM;
      Number.prototype.toJSON = Number.prototype.toJSONFM;
      Boolean.prototype.toJSON = Boolean.prototype.toJSONFM;
      j = JSON.stringify.apply(json, arguments).replace(/\//g, '\\/');
      Date.prototype.toJSON = dateToJSON;
      String.prototype.toJSON = stringToJSON;
      Number.prototype.toJSON = numberToJSON;
      Boolean.prototype.toJSON = booleanToJSON;
      return j;
    }
    return JSON.stringify.apply(json, arguments);
  };

  return json;

}).call(this);



fm.asyncException = (function() {

  function asyncException() {}

  asyncException.asyncThrow = function(ex) {
    return window.setTimeout(function() {
      throw ex;
    }, 1);
  };

  return asyncException;

}).call(this);


var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

fm.timeoutTimer = (function() {

  function timeoutTimer() {
    this._timerCallback = __bind(this._timerCallback, this);

    this.stop = __bind(this.stop, this);

    this.start = __bind(this.start, this);

  }

  timeoutTimer.prototype._timer = null;

  timeoutTimer.prototype._callback = null;

  timeoutTimer.prototype._state = null;

  timeoutTimer.prototype.start = function(timeout, callback, state) {
    if (this._timer) {
      throw new Error('Timer is currently active.');
    }
    this._callback = callback;
    this._state = state;
    return this._timer = setTimeout(this._timerCallback, timeout);
  };

  timeoutTimer.prototype.stop = function() {
    if (!this._timer) {
      return false;
    }
    clearTimeout(this._timer);
    this._timer = null;
    return true;
  };

  timeoutTimer.prototype._timerCallback = function() {
    if (this.stop() && this._callback) {
      return this._callback(this._state);
    }
  };

  return timeoutTimer;

})();


/**
@class fm.httpMethod
 <div>
 The method used by an HTTP request.
 </div>

@extends fm.enum
*/

fm.httpMethod = {
  /**
  	@type {fm.httpMethod}
  	@description  <div>
  	 Indicates a GET request.
  	 </div>
  */

  Get: 1,
  /**
  	@type {fm.httpMethod}
  	@description  <div>
  	 Indicates a POST request.
  	 </div>
  */

  Post: 2,
  /**
  	@type {fm.httpMethod}
  	@description  <div>
  	 Indicates a PUT request.
  	 </div>
  */

  Put: 3,
  /**
  	@type {fm.httpMethod}
  	@description  <div>
  	 Indicates a DELETE request.
  	 </div>
  */

  Delete: 4
};


/**
@class fm.backoffMode
 <div>
 The algorithm to use when calculating sleep time between failed requests.
 </div>

@extends fm.enum
*/

fm.backoffMode = {
  /**
  	@type {fm.backoffMode}
  	@description  <div>
  	 Indicates that the backoff algorithm uses an additive calculation
  	 where the current backoff is equal to the previously calculated
  	 backoff plus the specified backoff in milliseconds.
  	 </div>
  */

  Additive: 1,
  /**
  	@type {fm.backoffMode}
  	@description  <div>
  	 Indicates that the backoff algorithm uses a constant calculation
  	 where the current backoff is always equal to exactly the specified
  	 backoff in milliseconds.
  	 </div>
  */

  Constant: 2,
  /**
  	@type {fm.backoffMode}
  	@description  <div>
  	 Indicates that no backoff interval exists between failed requests.
  	 </div>
  */

  None: 3
};


/**
@class fm.jsonCheckerMode

@extends fm.enum
*/

fm.jsonCheckerMode = {
  /**
  	@type {fm.jsonCheckerMode}
  	@description
  */

  Array: 1,
  /**
  	@type {fm.jsonCheckerMode}
  	@description
  */

  Done: 2,
  /**
  	@type {fm.jsonCheckerMode}
  	@description
  */

  Key: 3,
  /**
  	@type {fm.jsonCheckerMode}
  	@description
  */

  Object: 4,
  /**
  	@type {fm.jsonCheckerMode}
  	@description
  */

  String: 5
};


/**
@class fm.logLevel
 <div>
 The level at which to log.
 </div>

@extends fm.enum
*/

fm.logLevel = {
  /**
  	@type {fm.logLevel}
  	@description  <div>
  	 Logs messages relevant to development and troubleshooting.
  	 </div>
  */

  Debug: 1,
  /**
  	@type {fm.logLevel}
  	@description  <div>
  	 Logs messages relevant to expected use.
  	 </div>
  */

  Info: 2,
  /**
  	@type {fm.logLevel}
  	@description  <div>
  	 Logs messages relevant to potential pit-falls.
  	 </div>
  */

  Warn: 3,
  /**
  	@type {fm.logLevel}
  	@description  <div>
  	 Logs messages relevant to errors that allow program execution to continue.
  	 </div>
  */

  Error: 4,
  /**
  	@type {fm.logLevel}
  	@description  <div>
  	 Logs messages relevant to errors that require the program to terminate.
  	 </div>
  */

  Fatal: 5
};


/**
@class fm.stringType

@extends fm.enum
*/

fm.stringType = {
  /**
  	@type {fm.stringType}
  	@description
  */

  None: 1,
  /**
  	@type {fm.stringType}
  	@description
  */

  Single: 2,
  /**
  	@type {fm.stringType}
  	@description
  */

  Double: 3
};


/**
@class fm.serializable
 <div>
 Base definition for classes that allow serialization to/from JSON.
 </div>

@extends fm.object
*/


fm.serializable = (function(_super) {

  __extends(serializable, _super);

  /**
  	@ignore 
  	@description
  */


  serializable.prototype.__serialized = null;

  /**
  	@ignore 
  	@description
  */


  serializable.prototype._isDirty = false;

  /**
  	@ignore 
  	@description
  */


  serializable.prototype._isSerialized = false;

  /**
  	@ignore 
  	@description
  */


  function serializable() {
    this.setSerialized = __bind(this.setSerialized, this);

    this.setIsSerialized = __bind(this.setIsSerialized, this);

    this.setIsDirty = __bind(this.setIsDirty, this);

    this.getSerialized = __bind(this.getSerialized, this);

    this.getIsSerialized = __bind(this.getIsSerialized, this);

    this.getIsDirty = __bind(this.getIsDirty, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      serializable.__super__.constructor.call(this);
      this.setIsSerialized(false);
      this.setIsDirty(false);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    serializable.__super__.constructor.call(this);
    this.setIsSerialized(false);
    this.setIsDirty(false);
  }

  /**
  	 <div>
  	 Gets a value indicating whether this instance is dirty.
  	 </div>
  
  	@function getIsDirty
  	@return {fm.boolean}
  */


  serializable.prototype.getIsDirty = function() {
    return this._isDirty;
  };

  /**
  	 <div>
  	 Gets a value indicating whether this instance is serialized.
  	 </div>
  
  	@function getIsSerialized
  	@return {fm.boolean}
  */


  serializable.prototype.getIsSerialized = function() {
    return this._isSerialized;
  };

  /**
  	 <div>
  	 Gets the serialized value of this instance.
  	 </div>
  
  	@function getSerialized
  	@return {fm.string}
  */


  serializable.prototype.getSerialized = function() {
    return this.__serialized;
  };

  /**
  	 <div>
  	 Sets a value indicating whether this instance is dirty.
  	 </div>
  
  	@function setIsDirty
  	@param {fm.boolean} value
  	@return {void}
  */


  serializable.prototype.setIsDirty = function() {
    var value;
    value = arguments[0];
    return this._isDirty = value;
  };

  /**
  	 <div>
  	 Sets a value indicating whether this instance is serialized.
  	 </div>
  
  	@function setIsSerialized
  	@param {fm.boolean} value
  	@return {void}
  */


  serializable.prototype.setIsSerialized = function() {
    var value;
    value = arguments[0];
    return this._isSerialized = value;
  };

  /**
  	 <div>
  	 Sets the serialized value of this instance.
  	 </div>
  
  	@function setSerialized
  	@param {fm.string} value
  	@return {void}
  */


  serializable.prototype.setSerialized = function() {
    var value;
    value = arguments[0];
    this.__serialized = value;
    this.setIsSerialized(true);
    return this.setIsDirty(false);
  };

  return serializable;

})(fm.object);


/**
@class fm.dynamic
 <div>
 Supplies class instances with a key-value
 mapping to support dynamic property storage.
 </div>

@extends fm.serializable
*/


fm.dynamic = (function(_super) {

  __extends(dynamic, _super);

  /**
  	@ignore 
  	@description
  */


  dynamic.prototype.__dynamicProperties = null;

  /**
  	@ignore 
  	@description
  */


  function dynamic() {
    this.unsetDynamicValue = __bind(this.unsetDynamicValue, this);

    this.setDynamicValue = __bind(this.setDynamicValue, this);

    this.setDynamicProperties = __bind(this.setDynamicProperties, this);

    this.getDynamicValue = __bind(this.getDynamicValue, this);

    this.getDynamicProperties = __bind(this.getDynamicProperties, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      dynamic.__super__.constructor.call(this);
      this.__dynamicProperties = {};
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    dynamic.__super__.constructor.call(this);
    this.__dynamicProperties = {};
  }

  /**
  	 <div>
  	 Gets the dynamic properties on this instance.
  	 </div>
  
  	@function getDynamicProperties
  	@return {fm.hash}
  */


  dynamic.prototype.getDynamicProperties = function() {
    return this.__dynamicProperties;
  };

  /**
  	 <div>
  	 Gets a property value from the local cache.
  	 </div><param name="key">The property key. This key is used internally only, but should be namespaced to avoid conflict with third-party extensions.</param><returns>The stored value, if found; otherwise null.</returns>
  
  	@function getDynamicValue
  	@param {fm.string} key
  	@return {fm.object}
  */


  dynamic.prototype.getDynamicValue = function() {
    var key, obj2, _var0, _var1;
    key = arguments[0];
    obj2 = null;
    _var0 = new fm.holder(obj2);
    _var1 = fm.hashExtensions.tryGetValue(this.getDynamicProperties(), key, _var0);
    obj2 = _var0.getValue();
    if (_var1) {
      return obj2;
    }
    return null;
  };

  /**
  	 <div>
  	 Sets the dynamic properties on this instance.
  	 </div>
  
  	@function setDynamicProperties
  	@param {fm.hash} value
  	@return {void}
  */


  dynamic.prototype.setDynamicProperties = function() {
    var value;
    value = arguments[0];
    return this.__dynamicProperties = value != null ? value : {};
  };

  /**
  	 <div>
  	 Sets a property value in the local cache.
  	 </div><param name="key">The property key. This key is used internally only, but should be namespaced to avoid conflict with third-party extensions.</param><param name="value">The property value. This can be any object that needs to be stored for future use.</param>
  
  	@function setDynamicValue
  	@param {fm.string} key
  	@param {fm.object} value
  	@return {void}
  */


  dynamic.prototype.setDynamicValue = function() {
    var key, value;
    key = arguments[0];
    value = arguments[1];
    return this.getDynamicProperties()[key] = value;
  };

  /**
  	 <div>
  	 Unsets a property value in the local cache.
  	 </div><param name="key">The property key. This key is used internally only, but should be namespaced to avoid conflict with third-party extensions.</param><returns>
  	 <c>true</c> if the value was removed; otherwise, <c>false</c>.</returns>
  
  	@function unsetDynamicValue
  	@param {fm.string} key
  	@return {fm.boolean}
  */


  dynamic.prototype.unsetDynamicValue = function() {
    var key;
    key = arguments[0];
    return fm.hashExtensions.remove(this.getDynamicProperties(), key);
  };

  return dynamic;

})(fm.serializable);


/**
@class fm.httpResponseReceivedArgs
 <div>
 Arguments passed into callbacks when an HTTP response is received.
 </div>

@extends fm.object
*/


fm.httpResponseReceivedArgs = (function(_super) {

  __extends(httpResponseReceivedArgs, _super);

  /**
  	@ignore 
  	@description
  */


  httpResponseReceivedArgs.prototype._requestArgs = null;

  /**
  	@ignore 
  	@description
  */


  httpResponseReceivedArgs.prototype._response = null;

  /**
  	@ignore 
  	@description
  */


  httpResponseReceivedArgs.prototype._sender = null;

  /**
  	@ignore 
  	@description
  */


  function httpResponseReceivedArgs() {
    this.setSender = __bind(this.setSender, this);

    this.setResponse = __bind(this.setResponse, this);

    this.setRequestArgs = __bind(this.setRequestArgs, this);

    this.getSender = __bind(this.getSender, this);

    this.getResponse = __bind(this.getResponse, this);

    this.getRequestArgs = __bind(this.getRequestArgs, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      httpResponseReceivedArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    httpResponseReceivedArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the original request arguments.
  	 </div>
  
  	@function getRequestArgs
  	@return {fm.httpRequestArgs}
  */


  httpResponseReceivedArgs.prototype.getRequestArgs = function() {
    return this._requestArgs;
  };

  /**
  	 <div>
  	 Gets the incoming HTTP response received from the server.
  	 </div>
  
  	@function getResponse
  	@return {fm.webResponse}
  */


  httpResponseReceivedArgs.prototype.getResponse = function() {
    return this._response;
  };

  /**
  	 <div>
  	 Gets the sender of the request, either a client or publisher.
  	 </div>
  
  	@function getSender
  	@return {fm.object}
  */


  httpResponseReceivedArgs.prototype.getSender = function() {
    return this._sender;
  };

  /**
  	 <div>
  	 Sets the original request arguments.
  	 </div>
  
  	@function setRequestArgs
  	@param {fm.httpRequestArgs} value
  	@return {void}
  */


  httpResponseReceivedArgs.prototype.setRequestArgs = function() {
    var value;
    value = arguments[0];
    return this._requestArgs = value;
  };

  /**
  	 <div>
  	 Sets the incoming HTTP response received from the server.
  	 </div>
  
  	@function setResponse
  	@param {fm.webResponse} value
  	@return {void}
  */


  httpResponseReceivedArgs.prototype.setResponse = function() {
    var value;
    value = arguments[0];
    return this._response = value;
  };

  /**
  	 <div>
  	 Sets the sender of the request, either a client or publisher.
  	 </div>
  
  	@function setSender
  	@param {fm.object} value
  	@return {void}
  */


  httpResponseReceivedArgs.prototype.setSender = function() {
    var value;
    value = arguments[0];
    return this._sender = value;
  };

  return httpResponseReceivedArgs;

})(fm.object);


/**
@class fm.callbackState
 <div>
 A wrapper for a callback and state object.
 </div>

@extends fm.object
*/


fm.callbackState = (function(_super) {

  __extends(callbackState, _super);

  /**
  	@ignore 
  	@description
  */


  callbackState.prototype._callback = null;

  /**
  	@ignore 
  	@description
  */


  callbackState.prototype._state = null;

  /**
  	@ignore 
  	@description
  */


  function callbackState() {
    this.setState = __bind(this.setState, this);

    this.setCallback = __bind(this.setCallback, this);

    this.getState = __bind(this.getState, this);

    this.getCallback = __bind(this.getCallback, this);

    this.execute = __bind(this.execute, this);

    var callback, state;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      callbackState.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    callback = arguments[0];
    state = arguments[1];
    callbackState.__super__.constructor.call(this);
    this.setCallback(callback);
    this.setState(state);
  }

  /**
  	 <div>
  	 Executes the callback, passing in the state as a parameter.
  	 </div>
  
  	@function execute
  	@return {void}
  */


  callbackState.prototype.execute = function() {
    var _var0;
    _var0 = this.getCallback();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      return this.getCallback()(this.getState());
    }
  };

  /**
  	 <div>
  	 Gets the callback.
  	 </div>
  
  	@function getCallback
  	@return {fm.singleAction}
  */


  callbackState.prototype.getCallback = function() {
    return this._callback;
  };

  /**
  	 <div>
  	 Gets the state.
  	 </div>
  
  	@function getState
  	@return {fm.object}
  */


  callbackState.prototype.getState = function() {
    return this._state;
  };

  /**
  	 <div>
  	 Sets the callback.
  	 </div>
  
  	@function setCallback
  	@param {fm.singleAction} value
  	@return {void}
  */


  callbackState.prototype.setCallback = function() {
    var value;
    value = arguments[0];
    return this._callback = value;
  };

  /**
  	 <div>
  	 Sets the state.
  	 </div>
  
  	@function setState
  	@param {fm.object} value
  	@return {void}
  */


  callbackState.prototype.setState = function() {
    var value;
    value = arguments[0];
    return this._state = value;
  };

  return callbackState;

})(fm.object);


/**
@class fm.logProvider
 <div>
 Base class for all logging provider implementations.
 Provides logging for 5 key levels - Debug, Info, Warn,
 Error, and Fatal.
 </div>

@extends fm.object
*/


fm.logProvider = (function(_super) {

  __extends(logProvider, _super);

  /**
  	@ignore 
  	@description
  */


  function logProvider() {
    this.warnFormat = __bind(this.warnFormat, this);

    this.warn = __bind(this.warn, this);

    this.log = __bind(this.log, this);

    this.isEnabled = __bind(this.isEnabled, this);

    this.infoFormat = __bind(this.infoFormat, this);

    this.info = __bind(this.info, this);

    this.getIsWarnEnabled = __bind(this.getIsWarnEnabled, this);

    this.getIsInfoEnabled = __bind(this.getIsInfoEnabled, this);

    this.getIsFatalEnabled = __bind(this.getIsFatalEnabled, this);

    this.getIsErrorEnabled = __bind(this.getIsErrorEnabled, this);

    this.getIsDebugEnabled = __bind(this.getIsDebugEnabled, this);

    this.fatalFormat = __bind(this.fatalFormat, this);

    this.fatal = __bind(this.fatal, this);

    this.errorFormat = __bind(this.errorFormat, this);

    this.error = __bind(this.error, this);

    this.debugFormat = __bind(this.debugFormat, this);

    this.debug = __bind(this.debug, this);

    this._log = __bind(this._log, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      logProvider.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    logProvider.__super__.constructor.call(this);
  }

  /**
  
  	@function _log
  	@param {fm.logLevel} level
  	@param {fm.string} message
  	@param {Error} ex
  	@return {void}
  */


  logProvider.prototype._log = function() {
    var ex, level, message;
    if (arguments.length === 2) {
      level = arguments[0];
      message = arguments[1];
      if (this.isEnabled(level)) {
        this.log(level, message);
      }
      return;
    }
    if (arguments.length === 3) {
      level = arguments[0];
      message = arguments[1];
      ex = arguments[2];
      if (this.isEnabled(level)) {
        this.log(level, message, ex);
      }
    }
  };

  /**
  	 <div>
  	 Logs a debug-level message.
  	 </div><param name="message">The message.</param><param name="ex">The exception.</param>
  
  	@function debug
  	@param {fm.string} message
  	@param {Error} ex
  	@return {void}
  */


  logProvider.prototype.debug = function() {
    var ex, message;
    if (arguments.length === 2) {
      message = arguments[0];
      ex = arguments[1];
      this._log(fm.logLevel.Debug, message, ex);
      return;
    }
    if (arguments.length === 1) {
      message = arguments[0];
      this._log(fm.logLevel.Debug, message);
    }
  };

  /**
  	 <div>
  	 Logs a debug-level message.
  	 </div><param name="format">A composite format string.</param><param name="args">An array containing zero or more objects to format.</param>
  
  	@function debugFormat
  	@param {fm.string} format
  	@param {fm.array} args
  	@return {void}
  */


  logProvider.prototype.debugFormat = function() {
    var args, format;
    format = arguments[0];
    args = arguments[1];
    return this.debug(fm.stringExtensions.format(format, args));
  };

  /**
  	 <div>
  	 Logs an error-level message.
  	 </div><param name="message">The message.</param><param name="ex">The exception.</param>
  
  	@function error
  	@param {fm.string} message
  	@param {Error} ex
  	@return {void}
  */


  logProvider.prototype.error = function() {
    var ex, message;
    if (arguments.length === 2) {
      message = arguments[0];
      ex = arguments[1];
      this._log(fm.logLevel.Error, message, ex);
      return;
    }
    if (arguments.length === 1) {
      message = arguments[0];
      this._log(fm.logLevel.Error, message);
    }
  };

  /**
  	 <div>
  	 Logs an error-level message.
  	 </div><param name="format">A composite format string.</param><param name="args">An array containing zero or more objects to format.</param>
  
  	@function errorFormat
  	@param {fm.string} format
  	@param {fm.array} args
  	@return {void}
  */


  logProvider.prototype.errorFormat = function() {
    var args, format;
    format = arguments[0];
    args = arguments[1];
    return this.error(fm.stringExtensions.format(format, args));
  };

  /**
  	 <div>
  	 Logs a fatal-level message.
  	 </div><param name="message">The message.</param><param name="ex">The exception.</param>
  
  	@function fatal
  	@param {fm.string} message
  	@param {Error} ex
  	@return {void}
  */


  logProvider.prototype.fatal = function() {
    var ex, message;
    if (arguments.length === 1) {
      message = arguments[0];
      this._log(fm.logLevel.Fatal, message);
      return;
    }
    if (arguments.length === 2) {
      message = arguments[0];
      ex = arguments[1];
      this._log(fm.logLevel.Fatal, message, ex);
    }
  };

  /**
  	 <div>
  	 Logs a fatal-level message.
  	 </div><param name="format">A composite format string.</param><param name="args">An array containing zero or more objects to format.</param>
  
  	@function fatalFormat
  	@param {fm.string} format
  	@param {fm.array} args
  	@return {void}
  */


  logProvider.prototype.fatalFormat = function() {
    var args, format;
    format = arguments[0];
    args = arguments[1];
    return this.fatal(fm.stringExtensions.format(format, args));
  };

  /**
  	 <div>
  	 Gets a value indicating whether logging is enabled for debug-level messages.
  	 </div><value>
  	 <c>true</c> if logging is enabled for debug-level messages; otherwise, <c>false</c>.
  	 </value>
  
  	@function getIsDebugEnabled
  	@return {fm.boolean}
  */


  logProvider.prototype.getIsDebugEnabled = function() {
    return this.isEnabled(fm.logLevel.Debug);
  };

  /**
  	 <div>
  	 Gets a value indicating whether logging is enabled for error-level messages.
  	 </div><value>
  	 <c>true</c> if logging is enabled for error-level messages; otherwise, <c>false</c>.
  	 </value>
  
  	@function getIsErrorEnabled
  	@return {fm.boolean}
  */


  logProvider.prototype.getIsErrorEnabled = function() {
    return this.isEnabled(fm.logLevel.Error);
  };

  /**
  	 <div>
  	 Gets a value indicating whether logging is enabled for fatal-level messages.
  	 </div><value>
  	 <c>true</c> if logging is enabled for fatal-level messages; otherwise, <c>false</c>.
  	 </value>
  
  	@function getIsFatalEnabled
  	@return {fm.boolean}
  */


  logProvider.prototype.getIsFatalEnabled = function() {
    return this.isEnabled(fm.logLevel.Fatal);
  };

  /**
  	 <div>
  	 Gets a value indicating whether logging is enabled for info-level messages.
  	 </div><value>
  	 <c>true</c> if logging is enabled for info-level messages; otherwise, <c>false</c>.
  	 </value>
  
  	@function getIsInfoEnabled
  	@return {fm.boolean}
  */


  logProvider.prototype.getIsInfoEnabled = function() {
    return this.isEnabled(fm.logLevel.Info);
  };

  /**
  	 <div>
  	 Gets a value indicating whether logging is enabled for warn-level messages.
  	 </div><value>
  	 <c>true</c> if logging is enabled for warn-level messages; otherwise, <c>false</c>.
  	 </value>
  
  	@function getIsWarnEnabled
  	@return {fm.boolean}
  */


  logProvider.prototype.getIsWarnEnabled = function() {
    return this.isEnabled(fm.logLevel.Warn);
  };

  /**
  	 <div>
  	 Logs an info-level message.
  	 </div><param name="message">The message.</param><param name="ex">The exception.</param>
  
  	@function info
  	@param {fm.string} message
  	@param {Error} ex
  	@return {void}
  */


  logProvider.prototype.info = function() {
    var ex, message;
    if (arguments.length === 1) {
      message = arguments[0];
      this._log(fm.logLevel.Info, message);
      return;
    }
    if (arguments.length === 2) {
      message = arguments[0];
      ex = arguments[1];
      this._log(fm.logLevel.Info, message, ex);
    }
  };

  /**
  	 <div>
  	 Logs an info-level message.
  	 </div><param name="format">A composite format string.</param><param name="args">An array containing zero or more objects to format.</param>
  
  	@function infoFormat
  	@param {fm.string} format
  	@param {fm.array} args
  	@return {void}
  */


  logProvider.prototype.infoFormat = function() {
    var args, format;
    format = arguments[0];
    args = arguments[1];
    return this.info(fm.stringExtensions.format(format, args));
  };

  /**
  	 <div>
  	 Determines whether logging is enabled for the specified log level.
  	 </div><param name="level">The log level.</param><returns>
  	 <c>true</c> if logging is enabled for the specified log level; otherwise, <c>false</c>.
  	 </returns>
  
  	@function isEnabled
  	@param {fm.logLevel} level
  	@return {fm.boolean}
  */


  logProvider.prototype.isEnabled = function() {
    var level;
    return level = arguments[0];
  };

  /**
  	 <div>
  	 Logs a message at the specified log level.
  	 </div><param name="level">The log level.</param><param name="message">The message.</param><param name="ex">The exception.</param>
  
  	@function log
  	@param {fm.logLevel} level
  	@param {fm.string} message
  	@param {Error} ex
  	@return {void}
  */


  logProvider.prototype.log = function() {
    var ex, level, message;
    if (arguments.length === 3) {
      level = arguments[0];
      message = arguments[1];
      ex = arguments[2];
      return;
    }
    if (arguments.length === 2) {
      level = arguments[0];
      message = arguments[1];
    }
  };

  /**
  	 <div>
  	 Logs a warn-level message.
  	 </div><param name="message">The message.</param><param name="ex">The exception.</param>
  
  	@function warn
  	@param {fm.string} message
  	@param {Error} ex
  	@return {void}
  */


  logProvider.prototype.warn = function() {
    var ex, message;
    if (arguments.length === 2) {
      message = arguments[0];
      ex = arguments[1];
      this._log(fm.logLevel.Warn, message, ex);
      return;
    }
    if (arguments.length === 1) {
      message = arguments[0];
      this._log(fm.logLevel.Warn, message);
    }
  };

  /**
  	 <div>
  	 Logs a warn-level message.
  	 </div><param name="format">A composite format string.</param><param name="args">An array containing zero or more objects to format.</param>
  
  	@function warnFormat
  	@param {fm.string} format
  	@param {fm.array} args
  	@return {void}
  */


  logProvider.prototype.warnFormat = function() {
    var args, format;
    format = arguments[0];
    args = arguments[1];
    return this.warn(fm.stringExtensions.format(format, args));
  };

  return logProvider;

})(fm.object);


/**
@class fm.httpRequestArgs
 <div>
 Arguments for sending an HTTP request.
 </div>

@extends fm.dynamic
*/


fm.httpRequestArgs = (function(_super) {

  __extends(httpRequestArgs, _super);

  /**
  	@ignore 
  	@description
  */


  httpRequestArgs.prototype._binaryContent = null;

  /**
  	@ignore 
  	@description
  */


  httpRequestArgs.prototype._headers = null;

  /**
  	@ignore 
  	@description
  */


  httpRequestArgs.prototype._method = null;

  /**
  	@ignore 
  	@description
  */


  httpRequestArgs.prototype._onRequestCreated = null;

  /**
  	@ignore 
  	@description
  */


  httpRequestArgs.prototype._onResponseReceived = null;

  /**
  	@ignore 
  	@description
  */


  httpRequestArgs.prototype._sender = null;

  /**
  	@ignore 
  	@description
  */


  httpRequestArgs.prototype._textContent = null;

  /**
  	@ignore 
  	@description
  */


  httpRequestArgs.prototype._timeout = 0;

  /**
  	@ignore 
  	@description
  */


  httpRequestArgs.prototype._url = null;

  /**
  	@ignore 
  	@description
  */


  function httpRequestArgs() {
    this.setUrl = __bind(this.setUrl, this);

    this.setTimeout = __bind(this.setTimeout, this);

    this.setTextContent = __bind(this.setTextContent, this);

    this.setSender = __bind(this.setSender, this);

    this.setOnResponseReceived = __bind(this.setOnResponseReceived, this);

    this.setOnRequestCreated = __bind(this.setOnRequestCreated, this);

    this.setMethod = __bind(this.setMethod, this);

    this.setHeaders = __bind(this.setHeaders, this);

    this.setBinaryContent = __bind(this.setBinaryContent, this);

    this.getUrl = __bind(this.getUrl, this);

    this.getTimeout = __bind(this.getTimeout, this);

    this.getTextContent = __bind(this.getTextContent, this);

    this.getSender = __bind(this.getSender, this);

    this.getOnResponseReceived = __bind(this.getOnResponseReceived, this);

    this.getOnRequestCreated = __bind(this.getOnRequestCreated, this);

    this.getMethod = __bind(this.getMethod, this);

    this.getHeaders = __bind(this.getHeaders, this);

    this.getBinaryContent = __bind(this.getBinaryContent, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      httpRequestArgs.__super__.constructor.call(this);
      this.setTimeout(15000);
      this.setMethod(fm.httpMethod.Post);
      this.setHeaders(new fm.nameValueCollection());
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    httpRequestArgs.__super__.constructor.call(this);
    this.setTimeout(15000);
    this.setMethod(fm.httpMethod.Post);
    this.setHeaders(new fm.nameValueCollection());
  }

  /**
  	 <div>
  	 Gets the binary content to transfer over HTTP.
  	 Overrides <see cref="fm.httpRequestArgs.textContent">fm.httpRequestArgs.textContent</see>.
  	 </div>
  
  	@function getBinaryContent
  	@return {fm.array}
  */


  httpRequestArgs.prototype.getBinaryContent = function() {
    return this._binaryContent;
  };

  /**
  	 <div>
  	 Gets the headers to transfer over HTTP.
  	 </div>
  
  	@function getHeaders
  	@return {fm.nameValueCollection}
  */


  httpRequestArgs.prototype.getHeaders = function() {
    return this._headers;
  };

  /**
  	 <div>
  	 Gets the HTTP method.
  	 </div>
  
  	@function getMethod
  	@return {fm.httpMethod}
  */


  httpRequestArgs.prototype.getMethod = function() {
    return this._method;
  };

  /**
  	 <div>
  	 Gets the callback to invoke once the outgoing HTTP request is created.
  	 See <see cref="fm.httpRequestCreatedArgs">fm.httpRequestCreatedArgs</see> for callback argument details.
  	 </div>
  
  	@function getOnRequestCreated
  	@return {fm.singleAction}
  */


  httpRequestArgs.prototype.getOnRequestCreated = function() {
    return this._onRequestCreated;
  };

  /**
  	 <div>
  	 Gets the callback to invoke once the incoming HTTP response has been
  	 received. See <see cref="fm.httpResponseReceivedArgs">fm.httpResponseReceivedArgs</see> for callback argument details.
  	 </div>
  
  	@function getOnResponseReceived
  	@return {fm.singleAction}
  */


  httpRequestArgs.prototype.getOnResponseReceived = function() {
    return this._onResponseReceived;
  };

  /**
  	 <div>
  	 Gets the sender of the content, either a client or publisher.
  	 </div>
  
  	@function getSender
  	@return {fm.object}
  */


  httpRequestArgs.prototype.getSender = function() {
    return this._sender;
  };

  /**
  	 <div>
  	 Gets the text content to transfer over HTTP.
  	 </div>
  
  	@function getTextContent
  	@return {fm.string}
  */


  httpRequestArgs.prototype.getTextContent = function() {
    return this._textContent;
  };

  /**
  	 <div>
  	 Gets the number of milliseconds to wait before timing out the HTTP transfer.
  	 Defaults to 15000 (15 seconds).
  	 </div>
  
  	@function getTimeout
  	@return {fm.int}
  */


  httpRequestArgs.prototype.getTimeout = function() {
    return this._timeout;
  };

  /**
  	 <div>
  	 Gets the target URL for the HTTP request.
  	 </div>
  
  	@function getUrl
  	@return {fm.string}
  */


  httpRequestArgs.prototype.getUrl = function() {
    return this._url;
  };

  /**
  	 <div>
  	 Sets the binary content to transfer over HTTP.
  	 Overrides <see cref="fm.httpRequestArgs.textContent">fm.httpRequestArgs.textContent</see>.
  	 </div>
  
  	@function setBinaryContent
  	@param {fm.array} value
  	@return {void}
  */


  httpRequestArgs.prototype.setBinaryContent = function() {
    var value;
    value = arguments[0];
    return this._binaryContent = value;
  };

  /**
  	 <div>
  	 Sets the headers to transfer over HTTP.
  	 </div>
  
  	@function setHeaders
  	@param {fm.nameValueCollection} value
  	@return {void}
  */


  httpRequestArgs.prototype.setHeaders = function() {
    var value;
    value = arguments[0];
    return this._headers = value;
  };

  /**
  	 <div>
  	 Sets the HTTP method.
  	 </div>
  
  	@function setMethod
  	@param {fm.httpMethod} value
  	@return {void}
  */


  httpRequestArgs.prototype.setMethod = function() {
    var value;
    value = arguments[0];
    return this._method = value;
  };

  /**
  	 <div>
  	 Sets the callback to invoke once the outgoing HTTP request is created.
  	 See <see cref="fm.httpRequestCreatedArgs">fm.httpRequestCreatedArgs</see> for callback argument details.
  	 </div>
  
  	@function setOnRequestCreated
  	@param {fm.singleAction} value
  	@return {void}
  */


  httpRequestArgs.prototype.setOnRequestCreated = function() {
    var value;
    value = arguments[0];
    return this._onRequestCreated = value;
  };

  /**
  	 <div>
  	 Sets the callback to invoke once the incoming HTTP response has been
  	 received. See <see cref="fm.httpResponseReceivedArgs">fm.httpResponseReceivedArgs</see> for callback argument details.
  	 </div>
  
  	@function setOnResponseReceived
  	@param {fm.singleAction} value
  	@return {void}
  */


  httpRequestArgs.prototype.setOnResponseReceived = function() {
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


  httpRequestArgs.prototype.setSender = function() {
    var value;
    value = arguments[0];
    return this._sender = value;
  };

  /**
  	 <div>
  	 Sets the text content to transfer over HTTP.
  	 </div>
  
  	@function setTextContent
  	@param {fm.string} value
  	@return {void}
  */


  httpRequestArgs.prototype.setTextContent = function() {
    var value;
    value = arguments[0];
    return this._textContent = value;
  };

  /**
  	 <div>
  	 Sets the number of milliseconds to wait before timing out the HTTP transfer.
  	 Defaults to 15000 (15 seconds).
  	 </div>
  
  	@function setTimeout
  	@param {fm.int} value
  	@return {void}
  */


  httpRequestArgs.prototype.setTimeout = function() {
    var value;
    value = arguments[0];
    return this._timeout = value;
  };

  /**
  	 <div>
  	 Sets the target URL for the HTTP request.
  	 </div>
  
  	@function setUrl
  	@param {fm.string} value
  	@return {void}
  */


  httpRequestArgs.prototype.setUrl = function() {
    var value;
    value = arguments[0];
    return this._url = value;
  };

  return httpRequestArgs;

})(fm.dynamic);


/**
@class fm.httpRequestCreatedArgs
 <div>
 Arguments passed into callbacks when an HTTP request is created.
 </div>

@extends fm.object
*/


fm.httpRequestCreatedArgs = (function(_super) {

  __extends(httpRequestCreatedArgs, _super);

  /**
  	@ignore 
  	@description
  */


  httpRequestCreatedArgs.prototype._request = null;

  /**
  	@ignore 
  	@description
  */


  httpRequestCreatedArgs.prototype._requestArgs = null;

  /**
  	@ignore 
  	@description
  */


  httpRequestCreatedArgs.prototype._sender = null;

  /**
  	@ignore 
  	@description
  */


  function httpRequestCreatedArgs() {
    this.setSender = __bind(this.setSender, this);

    this.setRequestArgs = __bind(this.setRequestArgs, this);

    this.setRequest = __bind(this.setRequest, this);

    this.getSender = __bind(this.getSender, this);

    this.getRequestArgs = __bind(this.getRequestArgs, this);

    this.getRequest = __bind(this.getRequest, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      httpRequestCreatedArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    httpRequestCreatedArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the outgoing HTTP request about to be sent to the server.
  	 </div>
  
  	@function getRequest
  	@return {fm.webRequest}
  */


  httpRequestCreatedArgs.prototype.getRequest = function() {
    return this._request;
  };

  /**
  	 <div>
  	 Gets the original request arguments.
  	 </div>
  
  	@function getRequestArgs
  	@return {fm.httpRequestArgs}
  */


  httpRequestCreatedArgs.prototype.getRequestArgs = function() {
    return this._requestArgs;
  };

  /**
  	 <div>
  	 Gets the sender of the request, either a client or publisher.
  	 </div>
  
  	@function getSender
  	@return {fm.object}
  */


  httpRequestCreatedArgs.prototype.getSender = function() {
    return this._sender;
  };

  /**
  	 <div>
  	 Sets the outgoing HTTP request about to be sent to the server.
  	 </div>
  
  	@function setRequest
  	@param {fm.webRequest} value
  	@return {void}
  */


  httpRequestCreatedArgs.prototype.setRequest = function() {
    var value;
    value = arguments[0];
    return this._request = value;
  };

  /**
  	 <div>
  	 Sets the original request arguments.
  	 </div>
  
  	@function setRequestArgs
  	@param {fm.httpRequestArgs} value
  	@return {void}
  */


  httpRequestCreatedArgs.prototype.setRequestArgs = function() {
    var value;
    value = arguments[0];
    return this._requestArgs = value;
  };

  /**
  	 <div>
  	 Sets the sender of the request, either a client or publisher.
  	 </div>
  
  	@function setSender
  	@param {fm.object} value
  	@return {void}
  */


  httpRequestCreatedArgs.prototype.setSender = function() {
    var value;
    value = arguments[0];
    return this._sender = value;
  };

  return httpRequestCreatedArgs;

})(fm.object);


/**
@class fm.httpResponseArgs
 <div>
 Arguments for receiving an HTTP response.
 </div>

@extends fm.object
*/


fm.httpResponseArgs = (function(_super) {

  __extends(httpResponseArgs, _super);

  /**
  	@ignore 
  	@description
  */


  httpResponseArgs.prototype._binaryContent = null;

  /**
  	@ignore 
  	@description
  */


  httpResponseArgs.prototype._exception = null;

  /**
  	@ignore 
  	@description
  */


  httpResponseArgs.prototype._headers = null;

  /**
  	@ignore 
  	@description
  */


  httpResponseArgs.prototype._requestArgs = null;

  /**
  	@ignore 
  	@description
  */


  httpResponseArgs.prototype._statusCode = 0;

  /**
  	@ignore 
  	@description
  */


  httpResponseArgs.prototype._textContent = null;

  /**
  	@ignore 
  	@description
  */


  function httpResponseArgs() {
    this.setTextContent = __bind(this.setTextContent, this);

    this.setStatusCode = __bind(this.setStatusCode, this);

    this.setRequestArgs = __bind(this.setRequestArgs, this);

    this.setHeaders = __bind(this.setHeaders, this);

    this.setException = __bind(this.setException, this);

    this.setBinaryContent = __bind(this.setBinaryContent, this);

    this.getTextContent = __bind(this.getTextContent, this);

    this.getStatusCode = __bind(this.getStatusCode, this);

    this.getRequestArgs = __bind(this.getRequestArgs, this);

    this.getHeaders = __bind(this.getHeaders, this);

    this.getException = __bind(this.getException, this);

    this.getBinaryContent = __bind(this.getBinaryContent, this);

    var requestArgs;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      httpResponseArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    requestArgs = arguments[0];
    httpResponseArgs.__super__.constructor.call(this);
    this.setRequestArgs(requestArgs);
    this.setHeaders(new fm.nameValueCollection());
  }

  /**
  	 <div>
  	 Gets the binary content read from the HTTP response.
  	 </div>
  
  	@function getBinaryContent
  	@return {fm.array}
  */


  httpResponseArgs.prototype.getBinaryContent = function() {
    return this._binaryContent;
  };

  /**
  	 <div>
  	 Gets the exception generated while completing the request.
  	 </div>
  
  	@function getException
  	@return {Error}
  */


  httpResponseArgs.prototype.getException = function() {
    return this._exception;
  };

  /**
  	 <div>
  	 Gets the headers read from the HTTP response.
  	 </div>
  
  	@function getHeaders
  	@return {fm.nameValueCollection}
  */


  httpResponseArgs.prototype.getHeaders = function() {
    return this._headers;
  };

  /**
  	 <div>
  	 Gets the original <see cref="fm.httpRequestArgs">fm.httpRequestArgs</see>.
  	 </div>
  
  	@function getRequestArgs
  	@return {fm.httpRequestArgs}
  */


  httpResponseArgs.prototype.getRequestArgs = function() {
    return this._requestArgs;
  };

  /**
  	 <div>
  	 Gets the status code read from the HTTP response.
  	 </div>
  
  	@function getStatusCode
  	@return {fm.int}
  */


  httpResponseArgs.prototype.getStatusCode = function() {
    return this._statusCode;
  };

  /**
  	 <div>
  	 Gets the text content read from the HTTP response.
  	 </div>
  
  	@function getTextContent
  	@return {fm.string}
  */


  httpResponseArgs.prototype.getTextContent = function() {
    return this._textContent;
  };

  /**
  	 <div>
  	 Sets the binary content read from the HTTP response.
  	 </div>
  
  	@function setBinaryContent
  	@param {fm.array} value
  	@return {void}
  */


  httpResponseArgs.prototype.setBinaryContent = function() {
    var value;
    value = arguments[0];
    return this._binaryContent = value;
  };

  /**
  	 <div>
  	 Sets the exception generated while completing the request.
  	 </div>
  
  	@function setException
  	@param {Error} value
  	@return {void}
  */


  httpResponseArgs.prototype.setException = function() {
    var value;
    value = arguments[0];
    return this._exception = value;
  };

  /**
  	 <div>
  	 Sets the headers read from the HTTP response.
  	 </div>
  
  	@function setHeaders
  	@param {fm.nameValueCollection} value
  	@return {void}
  */


  httpResponseArgs.prototype.setHeaders = function() {
    var value;
    value = arguments[0];
    return this._headers = value;
  };

  /**
  	 <div>
  	 Sets the original <see cref="fm.httpRequestArgs">fm.httpRequestArgs</see>.
  	 </div>
  
  	@function setRequestArgs
  	@param {fm.httpRequestArgs} value
  	@return {void}
  */


  httpResponseArgs.prototype.setRequestArgs = function() {
    var value;
    value = arguments[0];
    return this._requestArgs = value;
  };

  /**
  	 <div>
  	 Sets the status code read from the HTTP response.
  	 </div>
  
  	@function setStatusCode
  	@param {fm.int} value
  	@return {void}
  */


  httpResponseArgs.prototype.setStatusCode = function() {
    var value;
    value = arguments[0];
    return this._statusCode = value;
  };

  /**
  	 <div>
  	 Sets the text content read from the HTTP response.
  	 </div>
  
  	@function setTextContent
  	@param {fm.string} value
  	@return {void}
  */


  httpResponseArgs.prototype.setTextContent = function() {
    var value;
    value = arguments[0];
    return this._textContent = value;
  };

  return httpResponseArgs;

})(fm.object);


/**
@class fm.httpSendFinishArgs
 <div>
 Arguments for <see cref="fm.httpTransfer.addOnSendStart">fm.httpTransfer.addOnSendStart</see>.
 </div>

@extends fm.object
*/


fm.httpSendFinishArgs = (function(_super) {

  __extends(httpSendFinishArgs, _super);

  /**
  	@ignore 
  	@description
  */


  httpSendFinishArgs.prototype._requestBinaryContent = null;

  /**
  	@ignore 
  	@description
  */


  httpSendFinishArgs.prototype._requestTextContent = null;

  /**
  	@ignore 
  	@description
  */


  httpSendFinishArgs.prototype._responseBinaryContent = null;

  /**
  	@ignore 
  	@description
  */


  httpSendFinishArgs.prototype._responseHeaders = null;

  /**
  	@ignore 
  	@description
  */


  httpSendFinishArgs.prototype._responseTextContent = null;

  /**
  	@ignore 
  	@description
  */


  httpSendFinishArgs.prototype._sender = null;

  /**
  	@ignore 
  	@description
  */


  function httpSendFinishArgs() {
    this.setSender = __bind(this.setSender, this);

    this.setResponseTextContent = __bind(this.setResponseTextContent, this);

    this.setResponseHeaders = __bind(this.setResponseHeaders, this);

    this.setResponseBinaryContent = __bind(this.setResponseBinaryContent, this);

    this.setRequestTextContent = __bind(this.setRequestTextContent, this);

    this.setRequestBinaryContent = __bind(this.setRequestBinaryContent, this);

    this.getSender = __bind(this.getSender, this);

    this.getResponseTextContent = __bind(this.getResponseTextContent, this);

    this.getResponseHeaders = __bind(this.getResponseHeaders, this);

    this.getResponseBinaryContent = __bind(this.getResponseBinaryContent, this);

    this.getRequestTextContent = __bind(this.getRequestTextContent, this);

    this.getRequestBinaryContent = __bind(this.getRequestBinaryContent, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      httpSendFinishArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    httpSendFinishArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the binary content of the request.
  	 </div>
  
  	@function getRequestBinaryContent
  	@return {fm.array}
  */


  httpSendFinishArgs.prototype.getRequestBinaryContent = function() {
    return this._requestBinaryContent;
  };

  /**
  	 <div>
  	 Gets the text content of the request.
  	 </div>
  
  	@function getRequestTextContent
  	@return {fm.string}
  */


  httpSendFinishArgs.prototype.getRequestTextContent = function() {
    return this._requestTextContent;
  };

  /**
  	 <div>
  	 Gets the binary content of the response.
  	 </div>
  
  	@function getResponseBinaryContent
  	@return {fm.array}
  */


  httpSendFinishArgs.prototype.getResponseBinaryContent = function() {
    return this._responseBinaryContent;
  };

  /**
  	 <div>
  	 Gets the headers of the response.
  	 </div>
  
  	@function getResponseHeaders
  	@return {fm.nameValueCollection}
  */


  httpSendFinishArgs.prototype.getResponseHeaders = function() {
    return this._responseHeaders;
  };

  /**
  	 <div>
  	 Gets the binary content of the response.
  	 </div>
  
  	@function getResponseTextContent
  	@return {fm.string}
  */


  httpSendFinishArgs.prototype.getResponseTextContent = function() {
    return this._responseTextContent;
  };

  /**
  	 <div>
  	 Gets the sender of the request, either a client or publisher.
  	 </div>
  
  	@function getSender
  	@return {fm.object}
  */


  httpSendFinishArgs.prototype.getSender = function() {
    return this._sender;
  };

  /**
  	 <div>
  	 Sets the binary content of the request.
  	 </div>
  
  	@function setRequestBinaryContent
  	@param {fm.array} value
  	@return {void}
  */


  httpSendFinishArgs.prototype.setRequestBinaryContent = function() {
    var value;
    value = arguments[0];
    return this._requestBinaryContent = value;
  };

  /**
  	 <div>
  	 Sets the text content of the request.
  	 </div>
  
  	@function setRequestTextContent
  	@param {fm.string} value
  	@return {void}
  */


  httpSendFinishArgs.prototype.setRequestTextContent = function() {
    var value;
    value = arguments[0];
    return this._requestTextContent = value;
  };

  /**
  	 <div>
  	 Sets the binary content of the response.
  	 </div>
  
  	@function setResponseBinaryContent
  	@param {fm.array} value
  	@return {void}
  */


  httpSendFinishArgs.prototype.setResponseBinaryContent = function() {
    var value;
    value = arguments[0];
    return this._responseBinaryContent = value;
  };

  /**
  	 <div>
  	 Sets the headers of the response.
  	 </div>
  
  	@function setResponseHeaders
  	@param {fm.nameValueCollection} value
  	@return {void}
  */


  httpSendFinishArgs.prototype.setResponseHeaders = function() {
    var value;
    value = arguments[0];
    return this._responseHeaders = value;
  };

  /**
  	 <div>
  	 Sets the binary content of the response.
  	 </div>
  
  	@function setResponseTextContent
  	@param {fm.string} value
  	@return {void}
  */


  httpSendFinishArgs.prototype.setResponseTextContent = function() {
    var value;
    value = arguments[0];
    return this._responseTextContent = value;
  };

  /**
  	 <div>
  	 Sets the sender of the request, either a client or publisher.
  	 </div>
  
  	@function setSender
  	@param {fm.object} value
  	@return {void}
  */


  httpSendFinishArgs.prototype.setSender = function() {
    var value;
    value = arguments[0];
    return this._sender = value;
  };

  return httpSendFinishArgs;

})(fm.object);


/**
@class fm.httpSendStartArgs
 <div>
 Arguments for <see cref="fm.httpTransfer.addOnSendStart">fm.httpTransfer.addOnSendStart</see>.
 </div>

@extends fm.object
*/


fm.httpSendStartArgs = (function(_super) {

  __extends(httpSendStartArgs, _super);

  /**
  	@ignore 
  	@description
  */


  httpSendStartArgs.prototype._requestBinaryContent = null;

  /**
  	@ignore 
  	@description
  */


  httpSendStartArgs.prototype._requestTextContent = null;

  /**
  	@ignore 
  	@description
  */


  httpSendStartArgs.prototype._sender = null;

  /**
  	@ignore 
  	@description
  */


  function httpSendStartArgs() {
    this.setSender = __bind(this.setSender, this);

    this.setRequestTextContent = __bind(this.setRequestTextContent, this);

    this.setRequestBinaryContent = __bind(this.setRequestBinaryContent, this);

    this.getSender = __bind(this.getSender, this);

    this.getRequestTextContent = __bind(this.getRequestTextContent, this);

    this.getRequestBinaryContent = __bind(this.getRequestBinaryContent, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      httpSendStartArgs.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    httpSendStartArgs.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Gets the binary content of the request.
  	 </div>
  
  	@function getRequestBinaryContent
  	@return {fm.array}
  */


  httpSendStartArgs.prototype.getRequestBinaryContent = function() {
    return this._requestBinaryContent;
  };

  /**
  	 <div>
  	 Gets the text content of the request.
  	 </div>
  
  	@function getRequestTextContent
  	@return {fm.string}
  */


  httpSendStartArgs.prototype.getRequestTextContent = function() {
    return this._requestTextContent;
  };

  /**
  	 <div>
  	 Gets the sender of the request, either a client or publisher.
  	 </div>
  
  	@function getSender
  	@return {fm.object}
  */


  httpSendStartArgs.prototype.getSender = function() {
    return this._sender;
  };

  /**
  	 <div>
  	 Sets the binary content of the request.
  	 </div>
  
  	@function setRequestBinaryContent
  	@param {fm.array} value
  	@return {void}
  */


  httpSendStartArgs.prototype.setRequestBinaryContent = function() {
    var value;
    value = arguments[0];
    return this._requestBinaryContent = value;
  };

  /**
  	 <div>
  	 Sets the text content of the request.
  	 </div>
  
  	@function setRequestTextContent
  	@param {fm.string} value
  	@return {void}
  */


  httpSendStartArgs.prototype.setRequestTextContent = function() {
    var value;
    value = arguments[0];
    return this._requestTextContent = value;
  };

  /**
  	 <div>
  	 Sets the sender of the request, either a client or publisher.
  	 </div>
  
  	@function setSender
  	@param {fm.object} value
  	@return {void}
  */


  httpSendStartArgs.prototype.setSender = function() {
    var value;
    value = arguments[0];
    return this._sender = value;
  };

  return httpSendStartArgs;

})(fm.object);


/**
@class fm.log
 <div>
 Log utility class.
 </div>

@extends fm.object
*/


fm.log = (function(_super) {

  __extends(log, _super);

  /**
  	@ignore 
  	@description
  */


  log.__provider = null;

  /**
  	@ignore 
  	@description
  */


  function log() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      log.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    log.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Logs a debug-level message.
  	 </div><param name="message">The message.</param><param name="ex">The exception.</param>
  
  	@function debug
  	@param {fm.string} message
  	@param {Error} ex
  	@return {void}
  */


  log.debug = function() {
    var ex, message;
    if (arguments.length === 1) {
      message = arguments[0];
      fm.log.getProvider().debug(message);
      return;
    }
    if (arguments.length === 2) {
      message = arguments[0];
      ex = arguments[1];
      fm.log.getProvider().debug(message, ex);
    }
  };

  /**
  	 <div>
  	 Logs a debug-level message.
  	 </div><param name="format">A composite format string.</param><param name="args">An array containing zero or more objects to format.</param>
  
  	@function debugFormat
  	@param {fm.string} format
  	@param {fm.array} args
  	@return {void}
  */


  log.debugFormat = function() {
    var args, format;
    format = arguments[0];
    args = arguments[1];
    return fm.log.getProvider().debugFormat(format, args);
  };

  /**
  	 <div>
  	 Logs an error-level message.
  	 </div><param name="message">The message.</param><param name="ex">The exception.</param>
  
  	@function error
  	@param {fm.string} message
  	@param {Error} ex
  	@return {void}
  */


  log.error = function() {
    var ex, message;
    if (arguments.length === 2) {
      message = arguments[0];
      ex = arguments[1];
      fm.log.getProvider().error(message, ex);
      return;
    }
    if (arguments.length === 1) {
      message = arguments[0];
      fm.log.getProvider().error(message);
    }
  };

  /**
  	 <div>
  	 Logs an error-level message.
  	 </div><param name="format">A composite format string.</param><param name="args">An array containing zero or more objects to format.</param>
  
  	@function errorFormat
  	@param {fm.string} format
  	@param {fm.array} args
  	@return {void}
  */


  log.errorFormat = function() {
    var args, format;
    format = arguments[0];
    args = arguments[1];
    return fm.log.getProvider().errorFormat(format, args);
  };

  /**
  	 <div>
  	 Logs a fatal-level message.
  	 </div><param name="message">The message.</param><param name="ex">The exception.</param>
  
  	@function fatal
  	@param {fm.string} message
  	@param {Error} ex
  	@return {void}
  */


  log.fatal = function() {
    var ex, message;
    if (arguments.length === 1) {
      message = arguments[0];
      fm.log.getProvider().fatal(message);
      return;
    }
    if (arguments.length === 2) {
      message = arguments[0];
      ex = arguments[1];
      fm.log.getProvider().fatal(message, ex);
    }
  };

  /**
  	 <div>
  	 Logs a fatal-level message.
  	 </div><param name="format">A composite format string.</param><param name="args">An array containing zero or more objects to format.</param>
  
  	@function fatalFormat
  	@param {fm.string} format
  	@param {fm.array} args
  	@return {void}
  */


  log.fatalFormat = function() {
    var args, format;
    format = arguments[0];
    args = arguments[1];
    return fm.log.getProvider().fatalFormat(format, args);
  };

  /**
  	 <div>
  	 Gets a value indicating whether logging is enabled for debug-level messages.
  	 </div><value>
  	 <c>true</c> if logging is enabled for debug-level messages; otherwise, <c>false</c>.
  	 </value>
  
  	@function getIsDebugEnabled
  	@return {fm.boolean}
  */


  log.getIsDebugEnabled = function() {
    return fm.log.getProvider().getIsDebugEnabled();
  };

  /**
  	 <div>
  	 Gets a value indicating whether logging is enabled for error-level messages.
  	 </div><value>
  	 <c>true</c> if logging is enabled for error-level messages; otherwise, <c>false</c>.
  	 </value>
  
  	@function getIsErrorEnabled
  	@return {fm.boolean}
  */


  log.getIsErrorEnabled = function() {
    return fm.log.getProvider().getIsErrorEnabled();
  };

  /**
  	 <div>
  	 Gets a value indicating whether logging is enabled for fatal-level messages.
  	 </div><value>
  	 <c>true</c> if logging is enabled for fatal-level messages; otherwise, <c>false</c>.
  	 </value>
  
  	@function getIsFatalEnabled
  	@return {fm.boolean}
  */


  log.getIsFatalEnabled = function() {
    return fm.log.getProvider().getIsFatalEnabled();
  };

  /**
  	 <div>
  	 Gets a value indicating whether logging is enabled for info-level messages.
  	 </div><value>
  	 <c>true</c> if logging is enabled for info-level messages; otherwise, <c>false</c>.
  	 </value>
  
  	@function getIsInfoEnabled
  	@return {fm.boolean}
  */


  log.getIsInfoEnabled = function() {
    return fm.log.getProvider().getIsInfoEnabled();
  };

  /**
  	 <div>
  	 Gets a value indicating whether logging is enabled for warn-level messages.
  	 </div><value>
  	 <c>true</c> if logging is enabled for warn-level messages; otherwise, <c>false</c>.
  	 </value>
  
  	@function getIsWarnEnabled
  	@return {fm.boolean}
  */


  log.getIsWarnEnabled = function() {
    return fm.log.getProvider().getIsWarnEnabled();
  };

  /**
  	 <div>
  	 Gets the log provider to use.
  	 </div>
  
  	@function getProvider
  	@return {fm.logProvider}
  */


  log.getProvider = function() {
    var _var0;
    _var0 = fm.log.__provider;
    if (_var0 === null || typeof _var0 === 'undefined') {
      log.__provider = new fm.nullLogProvider();
    }
    return fm.log.__provider;
  };

  /**
  	 <div>
  	 Logs an info-level message.
  	 </div><param name="message">The message.</param><param name="ex">The exception.</param>
  
  	@function info
  	@param {fm.string} message
  	@param {Error} ex
  	@return {void}
  */


  log.info = function() {
    var ex, message;
    if (arguments.length === 1) {
      message = arguments[0];
      fm.log.getProvider().info(message);
      return;
    }
    if (arguments.length === 2) {
      message = arguments[0];
      ex = arguments[1];
      fm.log.getProvider().info(message, ex);
    }
  };

  /**
  	 <div>
  	 Logs an info-level message.
  	 </div><param name="format">A composite format string.</param><param name="args">An array containing zero or more objects to format.</param>
  
  	@function infoFormat
  	@param {fm.string} format
  	@param {fm.array} args
  	@return {void}
  */


  log.infoFormat = function() {
    var args, format;
    format = arguments[0];
    args = arguments[1];
    return fm.log.getProvider().infoFormat(format, args);
  };

  /**
  	 <div>
  	 Sets the log provider to use.
  	 </div>
  
  	@function setProvider
  	@param {fm.logProvider} value
  	@return {void}
  */


  log.setProvider = function() {
    var value, _var0;
    value = arguments[0];
    _var0 = value;
    if (_var0 === null || typeof _var0 === 'undefined') {
      value = new fm.nullLogProvider();
    }
    return log.__provider = value;
  };

  /**
  	 <div>
  	 Logs a warn-level message.
  	 </div><param name="message">The message.</param><param name="ex">The exception.</param>
  
  	@function warn
  	@param {fm.string} message
  	@param {Error} ex
  	@return {void}
  */


  log.warn = function() {
    var ex, message;
    if (arguments.length === 2) {
      message = arguments[0];
      ex = arguments[1];
      fm.log.getProvider().warn(message, ex);
      return;
    }
    if (arguments.length === 1) {
      message = arguments[0];
      fm.log.getProvider().warn(message);
    }
  };

  /**
  	 <div>
  	 Logs a warn-level message.
  	 </div><param name="format">A composite format string.</param><param name="args">An array containing zero or more objects to format.</param>
  
  	@function warnFormat
  	@param {fm.string} format
  	@param {fm.array} args
  	@return {void}
  */


  log.warnFormat = function() {
    var args, format;
    format = arguments[0];
    args = arguments[1];
    return fm.log.getProvider().warnFormat(format, args);
  };

  return log;

}).call(this, fm.object);


/**
@class fm.stringAssistant
 <div>
 Contains methods for string manipulation.
 </div>

@extends fm.object
*/


fm.stringAssistant = (function(_super) {

  __extends(stringAssistant, _super);

  /**
  	@ignore 
  	@description
  */


  function stringAssistant() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      stringAssistant.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    stringAssistant.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Creates a subarray from an existing array.
  	 </div><param name="array">The source array.</param><param name="offset">The offset into the source array.</param><param name="count">The number of elements to copy into the subarray.</param><returns>The subarray.</returns>
  
  	@function subArray
  	@param {fm.array} array
  	@param {fm.int} offset
  	@param {fm.int} count
  	@return {fm.array}
  */


  stringAssistant.subArray = function() {
    var array, count, i, offset, strArray;
    if (arguments.length === 2) {
      array = arguments[0];
      offset = arguments[1];
      return fm.stringAssistant.subArray(array, offset, array.length - offset);
      return;
    }
    if (arguments.length === 3) {
      array = arguments[0];
      offset = arguments[1];
      count = arguments[2];
      strArray = [];
      i = 0;
      while (i < count) {
        try {
          strArray[i] = array[offset + i];
        } finally {
          i++;
        }
      }
      return strArray;
    }
  };

  return stringAssistant;

}).call(this, fm.object);


/**
@class fm.httpTransfer
 <div>
 Base class that defines methods for transferring content over HTTP.
 </div>

@extends fm.object
*/


fm.httpTransfer = (function(_super) {

  __extends(httpTransfer, _super);

  /**
  	@ignore 
  	@description
  */


  httpTransfer.prototype._httpTransferCallbackKey = null;

  /**
  	@ignore 
  	@description
  */


  httpTransfer._onSendFinish = null;

  /**
  	@ignore 
  	@description
  */


  httpTransfer._onSendStart = null;

  /**
  	@ignore 
  	@description
  */


  function httpTransfer() {
    this.startRequest = __bind(this.startRequest, this);

    this.shutdown = __bind(this.shutdown, this);

    this.sendTextAsync = __bind(this.sendTextAsync, this);

    this.sendText = __bind(this.sendText, this);

    this.sendBinaryAsync = __bind(this.sendBinaryAsync, this);

    this.sendBinary = __bind(this.sendBinary, this);

    this.sendAsyncCallback = __bind(this.sendAsyncCallback, this);

    this.sendAsync = __bind(this.sendAsync, this);

    this.send = __bind(this.send, this);

    this.raiseOnSendStart = __bind(this.raiseOnSendStart, this);

    this.raiseOnSendFinish = __bind(this.raiseOnSendFinish, this);

    this.finishRequest = __bind(this.finishRequest, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      httpTransfer.__super__.constructor.call(this);
      this._httpTransferCallbackKey = "fm.httpTransfer.callback";
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    httpTransfer.__super__.constructor.call(this);
    this._httpTransferCallbackKey = "fm.httpTransfer.callback";
  }

  /**
  
  	@function addOnSendFinish
  	@param {fm.singleAction} value
  	@return {void}
  */


  httpTransfer.addOnSendFinish = function() {
    var value;
    value = arguments[0];
    return fm.httpTransfer._onSendFinish = fm.delegate.combine(fm.httpTransfer._onSendFinish, value);
  };

  /**
  
  	@function addOnSendStart
  	@param {fm.singleAction} value
  	@return {void}
  */


  httpTransfer.addOnSendStart = function() {
    var value;
    value = arguments[0];
    return fm.httpTransfer._onSendStart = fm.delegate.combine(fm.httpTransfer._onSendStart, value);
  };

  /**
  	 <div>
  	 Escapes and adds a query parameter as a key/value pair to a URL.
  	 </div><param name="url">The URL with the query to which the key/value should be added.</param><param name="key">The key of the query parameter to add.</param><param name="value">The value of the query parameter to add.</param><returns>The original URL with the query parameter added.</returns>
  
  	@function addQueryToUrl
  	@param {fm.string} url
  	@param {fm.string} key
  	@param {fm.string} value
  	@return {fm.string}
  */


  httpTransfer.addQueryToUrl = function() {
    var key, url, value, _var0;
    if (arguments.length === 2) {
      url = arguments[0];
      key = arguments[1];
      return fm.httpTransfer.addQueryToUrl(url, key, null);
      return;
    }
    if (arguments.length === 3) {
      url = arguments[0];
      key = arguments[1];
      value = arguments[2];
      if (fm.stringExtensions.isNullOrEmpty(key)) {
        return url;
      }
      _var0 = value;
      if (_var0 === null || typeof _var0 === 'undefined') {
        value = fm.stringExtensions.empty;
      }
      key = fm.uri.escapeDataString(key);
      value = fm.uri.escapeDataString(value);
      return fm.stringExtensions.concat([url, (fm.stringExtensions.indexOf(url, "?", fm.stringComparison.OrdinalIgnoreCase) === -1 ? "?" : "&"), key, "=", value]);
    }
  };

  /**
  
  	@function removeOnSendFinish
  	@param {fm.singleAction} value
  	@return {void}
  */


  httpTransfer.removeOnSendFinish = function() {
    var value;
    value = arguments[0];
    return fm.httpTransfer._onSendFinish = fm.delegate.remove(fm.httpTransfer._onSendFinish, value);
  };

  /**
  
  	@function removeOnSendStart
  	@param {fm.singleAction} value
  	@return {void}
  */


  httpTransfer.removeOnSendStart = function() {
    var value;
    value = arguments[0];
    return fm.httpTransfer._onSendStart = fm.delegate.remove(fm.httpTransfer._onSendStart, value);
  };

  /**
  
  	@function finishRequest
  	@param {fm.httpResponseArgs} responseArgs
  	@return {void}
  */


  httpTransfer.prototype.finishRequest = function() {
    var exception, innerException, reader, responseArgs, str, stream, _var0, _var1, _var2, _var3;
    responseArgs = arguments[0];
    _var0 = responseArgs.getException();
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      innerException = fm.global.tryCast(responseArgs.getException(), Error);
      _var1 = innerException;
      if (_var1 !== null && typeof _var1 !== 'undefined') {
        try {
          _var2 = innerException.getResponse();
          if (_var2 !== null && typeof _var2 !== 'undefined') {
            stream = innerException.getResponse().getResponseStream();
            try {
              reader = new fm.streamReader(stream);
              try {
                str = reader.readToEnd();
                if (!fm.stringExtensions.isNullOrEmpty(str)) {
                  responseArgs.setException(new Error(str, innerException, innerException.getStatus(), innerException.getResponse()));
                }
              } finally {
                reader.close();
              }
            } finally {
              stream.close();
            }
          }
        } catch (exception1) {

        } finally {

        }
      } else {
        exception = fm.global.tryCast(responseArgs.getException(), Error);
        _var3 = exception;
        if (_var3 !== null && typeof _var3 !== 'undefined') {
          try {
            responseArgs.setException(new Error(fm.stringExtensions.format("Security error (possible cross-domain restrictions). {0}", exception.message), exception));
          } catch (exception3) {
            responseArgs.setException(exception);
          } finally {

          }
        }
      }
    }
    return this.raiseOnSendFinish(responseArgs);
  };

  /**
  
  	@function raiseOnSendFinish
  	@param {fm.httpResponseArgs} responseArgs
  	@return {void}
  */


  httpTransfer.prototype.raiseOnSendFinish = function() {
    var onSendFinish, p, responseArgs, _var0;
    responseArgs = arguments[0];
    onSendFinish = fm.httpTransfer._onSendFinish;
    _var0 = onSendFinish;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      p = new fm.httpSendFinishArgs();
      p.setSender(responseArgs.getRequestArgs().getSender());
      p.setRequestBinaryContent(responseArgs.getRequestArgs().getBinaryContent());
      p.setRequestTextContent(responseArgs.getRequestArgs().getTextContent());
      p.setResponseBinaryContent(responseArgs.getBinaryContent());
      p.setResponseTextContent(responseArgs.getTextContent());
      p.setResponseHeaders(responseArgs.getHeaders());
      return onSendFinish(p);
    }
  };

  /**
  
  	@function raiseOnSendStart
  	@param {fm.httpRequestArgs} requestArgs
  	@return {void}
  */


  httpTransfer.prototype.raiseOnSendStart = function() {
    var onSendStart, p, requestArgs, _var0;
    requestArgs = arguments[0];
    onSendStart = fm.httpTransfer._onSendStart;
    _var0 = onSendStart;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      p = new fm.httpSendStartArgs();
      p.setSender(requestArgs.getSender());
      p.setRequestBinaryContent(requestArgs.getBinaryContent());
      p.setRequestTextContent(requestArgs.getTextContent());
      return onSendStart(p);
    }
  };

  /**
  	 <div>
  	 Sends a request synchronously.
  	 </div><param name="requestArgs">The request parameters.</param><returns>The resulting response.</returns>
  
  	@function send
  	@param {fm.httpRequestArgs} requestArgs
  	@return {fm.httpResponseArgs}
  */


  httpTransfer.prototype.send = function() {
    var args, args2, requestArgs, _var0;
    requestArgs = arguments[0];
    this.startRequest(requestArgs);
    try {
      _var0 = requestArgs.getBinaryContent();
      if (_var0 !== null && typeof _var0 !== 'undefined') {
        args = this.sendBinary(requestArgs);
      } else {
        args = this.sendText(requestArgs);
      }
    } catch (exception) {
      args2 = new fm.httpResponseArgs(requestArgs);
      args2.setException(exception);
      args = args2;
    } finally {

    }
    this.finishRequest(args);
    return args;
  };

  /**
  	 <div>
  	 Sends a request asynchronously.
  	 </div><param name="requestArgs">The request parameters.</param><param name="callback">The callback to execute with the resulting response.</param>
  
  	@function sendAsync
  	@param {fm.httpRequestArgs} requestArgs
  	@param {fm.singleAction} callback
  	@return {void}
  */


  httpTransfer.prototype.sendAsync = function() {
    var callback, p, requestArgs, _var0;
    requestArgs = arguments[0];
    callback = arguments[1];
    this.startRequest(requestArgs);
    requestArgs.setDynamicValue(this._httpTransferCallbackKey, callback);
    try {
      _var0 = requestArgs.getBinaryContent();
      if (_var0 !== null && typeof _var0 !== 'undefined') {
        return this.sendBinaryAsync(requestArgs, this.sendAsyncCallback);
      } else {
        return this.sendTextAsync(requestArgs, this.sendAsyncCallback);
      }
    } catch (exception) {
      p = new fm.httpResponseArgs(requestArgs);
      p.setException(exception);
      return callback(p);
    } finally {

    }
  };

  /**
  
  	@function sendAsyncCallback
  	@param {fm.httpResponseArgs} responseArgs
  	@return {void}
  */


  httpTransfer.prototype.sendAsyncCallback = function() {
    var dynamicValue, responseArgs;
    responseArgs = arguments[0];
    dynamicValue = responseArgs.getRequestArgs().getDynamicValue(this._httpTransferCallbackKey);
    this.finishRequest(responseArgs);
    return dynamicValue(responseArgs);
  };

  /**
  	 <div>
  	 Sends binary content synchronously using the specified arguments.
  	 </div><param name="requestArgs">The request arguments.</param><returns>The response arguments from the server.</returns>
  
  	@function sendBinary
  	@param {fm.httpRequestArgs} requestArgs
  	@return {fm.httpResponseArgs}
  */


  httpTransfer.prototype.sendBinary = function() {
    var requestArgs;
    return requestArgs = arguments[0];
  };

  /**
  	 <div>
  	 Sends binary content asynchronously using the specified arguments.
  	 </div><param name="requestArgs">The request arguments.</param><param name="callback">The callback to execute on success or failure.</param>
  
  	@function sendBinaryAsync
  	@param {fm.httpRequestArgs} requestArgs
  	@param {fm.singleAction} callback
  	@return {void}
  */


  httpTransfer.prototype.sendBinaryAsync = function() {
    var callback, requestArgs;
    requestArgs = arguments[0];
    return callback = arguments[1];
  };

  /**
  	 <div>
  	 Sends text content synchronously using the specified arguments.
  	 </div><param name="requestArgs">The request arguments.</param><returns>The response arguments from the server.</returns>
  
  	@function sendText
  	@param {fm.httpRequestArgs} requestArgs
  	@return {fm.httpResponseArgs}
  */


  httpTransfer.prototype.sendText = function() {
    var requestArgs;
    return requestArgs = arguments[0];
  };

  /**
  	 <div>
  	 Sends text content asynchronously using the specified arguments.
  	 </div><param name="requestArgs">The request arguments.</param><param name="callback">The callback to execute on success or failure.</param>
  
  	@function sendTextAsync
  	@param {fm.httpRequestArgs} requestArgs
  	@param {fm.singleAction} callback
  	@return {void}
  */


  httpTransfer.prototype.sendTextAsync = function() {
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


  httpTransfer.prototype.shutdown = function() {};

  /**
  
  	@function startRequest
  	@param {fm.httpRequestArgs} requestArgs
  	@return {void}
  */


  httpTransfer.prototype.startRequest = function() {
    var requestArgs;
    requestArgs = arguments[0];
    return this.raiseOnSendStart(requestArgs);
  };

  return httpTransfer;

}).call(this, fm.object);


/**
@class fm.httpTransferFactory
 <div>
 Creates implementations of <see cref="fm.httpTransfer">fm.httpTransfer</see>.
 </div>

@extends fm.object
*/


fm.httpTransferFactory = (function(_super) {

  __extends(httpTransferFactory, _super);

  /**
  	@ignore 
  	@description
  */


  httpTransferFactory._createHttpTransfer = null;

  /**
  	@ignore 
  	@description
  */


  function httpTransferFactory() {
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      httpTransferFactory.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    httpTransferFactory.__super__.constructor.call(this);
  }

  /**
  
  	@function defaultCreateHttpTransfer
  	@return {fm.httpTransfer}
  */


  httpTransferFactory.defaultCreateHttpTransfer = function() {
    return new fm.httpWebRequestTransfer();
  };

  /**
  	 <div>
  	 Gets the callback that creates an HTTP-based transfer class.
  	 </div>
  
  	@function getCreateHttpTransfer
  	@return {fm.emptyFunction}
  */


  httpTransferFactory.getCreateHttpTransfer = function() {
    return fm.httpTransferFactory._createHttpTransfer;
  };

  /**
  	 <div>
  	 Gets an instance of the HTTP-based transfer class.
  	 </div><returns></returns>
  
  	@function getHttpTransfer
  	@return {fm.httpTransfer}
  */


  httpTransferFactory.getHttpTransfer = function() {
    var transfer, _var0, _var1;
    _var0 = fm.httpTransferFactory.getCreateHttpTransfer();
    if (_var0 === null || typeof _var0 === 'undefined') {
      httpTransferFactory.setCreateHttpTransfer(httpTransferFactory.defaultCreateHttpTransfer);
    }
    transfer = fm.httpTransferFactory.getCreateHttpTransfer()();
    _var1 = transfer;
    if (_var1 === null || typeof _var1 === 'undefined') {
      transfer = fm.httpTransferFactory.defaultCreateHttpTransfer();
    }
    return transfer;
  };

  /**
  	 <div>
  	 Sets the callback that creates an HTTP-based transfer class.
  	 </div>
  
  	@function setCreateHttpTransfer
  	@param {fm.emptyFunction} value
  	@return {void}
  */


  httpTransferFactory.setCreateHttpTransfer = function() {
    var value;
    value = arguments[0];
    return httpTransferFactory._createHttpTransfer = value;
  };

  return httpTransferFactory;

}).call(this, fm.object);


/**
@class fm.jsonChecker
 <div>
 JsonChecker is a Pushdown Automaton that very quickly determines if a
 JSON text is syntactically correct. It could be used to filter inputs
 to a system, or to verify that the outputs of a system are
 syntactically correct.
 </div><div>
 This implementation is a C# port of the original
 <a href="http://www.json.org/JSON_checker/">JSON_checker</a> program
 written in C.
 </div>

@extends fm.object
*/


fm.jsonChecker = (function(_super) {

  __extends(jsonChecker, _super);

  /**
  	@ignore 
  	@description
  */


  jsonChecker.prototype.__depth = 0;

  /**
  	@ignore 
  	@description
  */


  jsonChecker.prototype.__offset = 0;

  /**
  	@ignore 
  	@description
  */


  jsonChecker.prototype.__stack = null;

  /**
  	@ignore 
  	@description
  */


  jsonChecker.prototype.__state = 0;

  /**
  	@ignore 
  	@description
  */


  jsonChecker._ascii_class = null;

  /**
  	@ignore 
  	@description
  */


  jsonChecker._state_transition_table = null;

  /**
  	@ignore 
  	@description
  */


  function jsonChecker() {
    this.push = __bind(this.push, this);

    this.pop = __bind(this.pop, this);

    this.onError = __bind(this.onError, this);

    this.finalCheck = __bind(this.finalCheck, this);

    this.checkString = __bind(this.checkString, this);

    this.check = __bind(this.check, this);

    var depth;
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      jsonChecker.call(this, 0);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    if (arguments.length === 0) {
      jsonChecker.call(this, 0);
      return;
    }
    if (arguments.length === 1) {
      depth = arguments[0];
      jsonChecker.__super__.constructor.call(this);
      if (depth < 0) {
        throw new Error("depth");
      }
      this.__state = 0;
      this.__depth = depth;
      this.__stack = new fm.stack(depth);
      this.push(fm.jsonCheckerMode.Done);
      return;
    }
  }

  /**
  
  	@function check
  	@param {fm.int} ch
  	@return {void}
  */


  jsonChecker.prototype.check = function() {
    var ch, mode, num, num2;
    ch = arguments[0];
    if (ch < 0) {
      this.onError();
    }
    if (ch >= 128) {
      num = 30;
    } else {
      num = fm.jsonChecker._ascii_class[ch];
      if (num <= -1) {
        this.onError();
      }
    }
    num2 = fm.jsonChecker._state_transition_table[this.__state][num];
    if (num2 >= 0) {
      this.__state = num2;
      return this.__offset = this.__offset + 1;
    } else {
      if (num2 === -9) {
        this.pop(fm.jsonCheckerMode.Key);
        this.__state = 1;
      } else {
        if (num2 === -8) {
          this.pop(fm.jsonCheckerMode.Object);
          this.__state = 1;
        } else {
          if (num2 === -7) {
            this.pop(fm.jsonCheckerMode.Array);
            this.__state = 1;
          } else {
            if (num2 === -6) {
              this.push(fm.jsonCheckerMode.Key);
              this.__state = 2;
            } else {
              if (num2 === -5) {
                this.push(fm.jsonCheckerMode.Array);
                this.__state = 6;
              } else {
                if (num2 === -4) {
                  mode = this.__stack.peek();
                  if (mode === fm.jsonCheckerMode.Key) {
                    this.__state = 4;
                  } else {
                    if ((mode === fm.jsonCheckerMode.Array) || (mode === fm.jsonCheckerMode.Object)) {
                      this.__state = 1;
                    } else {
                      if (mode === fm.jsonCheckerMode.Done) {
                        this.push(fm.jsonCheckerMode.String);
                        this.__state = 7;
                      } else {
                        if (mode === fm.jsonCheckerMode.String) {
                          this.pop(fm.jsonCheckerMode.String);
                          this.__state = 1;
                        } else {
                          this.onError();
                        }
                      }
                    }
                  }
                } else {
                  if (num2 === -3) {
                    mode = this.__stack.peek();
                    if (mode === fm.jsonCheckerMode.Object) {
                      this.pop(fm.jsonCheckerMode.Object);
                      this.push(fm.jsonCheckerMode.Key);
                      this.__state = 3;
                    } else {
                      if (mode === fm.jsonCheckerMode.Array) {
                        this.__state = 5;
                      } else {
                        this.onError();
                      }
                    }
                  } else {
                    if (num2 === -2) {
                      this.pop(fm.jsonCheckerMode.Key);
                      this.push(fm.jsonCheckerMode.Object);
                      this.__state = 5;
                    } else {
                      this.onError();
                    }
                  }
                }
              }
            }
          }
        }
      }
      return this.__offset = this.__offset + 1;
    }
  };

  /**
  	 <div>
  	 Checks if the specified string is valid JSON.
  	 </div><param name="str">The string to check.</param><returns></returns>
  
  	@function checkString
  	@param {fm.string} str
  	@return {fm.boolean}
  */


  jsonChecker.prototype.checkString = function() {
    var decimalResult, doubleResult, i, str, _var0, _var1, _var2, _var3;
    str = arguments[0];
    doubleResult = 0;
    decimalResult = 0;
    _var0 = new fm.holder(doubleResult);
    _var1 = fm.parseAssistant.tryParseDouble(str, _var0);
    doubleResult = _var0.getValue();
    _var2 = new fm.holder(decimalResult);
    _var3 = fm.parseAssistant.tryParseDecimal(str, _var2);
    decimalResult = _var2.getValue();
    if ((((str === "true") || (str === "false")) || ((str === "null") || _var1)) || _var3) {
      return true;
    }
    try {
      i = 0;
      while (i < str.length) {
        try {
          this.check(fm.convert.toInt32(str.charAt(i)));
        } finally {
          i++;
        }
      }
      this.finalCheck();
      return true;
    } catch (exception1) {
      return false;
    } finally {

    }
  };

  /**
  
  	@function finalCheck
  	@return {void}
  */


  jsonChecker.prototype.finalCheck = function() {
    if (this.__state !== 1) {
      this.onError();
    }
    return this.pop(fm.jsonCheckerMode.Done);
  };

  /**
  
  	@function onError
  	@return {void}
  */


  jsonChecker.prototype.onError = function() {
    throw new Error(fm.stringExtensions.format("Invalid JSON text at character offset {0}.", fm.intExtensions.toString(this.__offset, "N0")));
  };

  /**
  
  	@function pop
  	@param {fm.jsonCheckerMode} mode
  	@return {void}
  */


  jsonChecker.prototype.pop = function() {
    var mode;
    mode = arguments[0];
    if (this.__stack.pop() !== mode) {
      return this.onError();
    }
  };

  /**
  
  	@function push
  	@param {fm.jsonCheckerMode} mode
  	@return {void}
  */


  jsonChecker.prototype.push = function() {
    var mode;
    mode = arguments[0];
    if ((this.__depth > 0) && (this.__stack.getCount() >= this.__depth)) {
      this.onError();
    }
    return this.__stack.push(mode);
  };

  jsonChecker._ascii_class = [-1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 1, -1, -1, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 30, 8, 30, 30, 30, 30, 30, 30, 30, 30, 11, 7, 12, 13, 10, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 6, 30, 30, 30, 30, 30, 30, 28, 28, 28, 28, 29, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 4, 9, 5, 30, 30, 30, 16, 17, 18, 19, 20, 21, 30, 30, 30, 30, 30, 22, 30, 23, 30, 30, 30, 24, 25, 26, 27, 30, 30, 30, 30, 30, 2, 30, 3, 30, 30];

  jsonChecker._state_transition_table = [[0, 0, -6, -1, -5, -1, -1, -1, -4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [1, 1, -1, -8, -1, -7, -1, -3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [2, 2, -1, -9, -1, -1, -1, -1, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [3, 3, -1, -1, -1, -1, -1, -1, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [4, 4, -1, -1, -1, -1, -2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [5, 5, -6, -1, -5, -1, -1, -1, 7, -1, -1, -1, 13, -1, 14, 15, -1, -1, -1, -1, -1, 23, -1, 27, -1, -1, 20, -1, -1, -1, -1], [6, 6, -6, -1, -5, -7, -1, -1, 7, -1, -1, -1, 13, -1, 14, 15, -1, -1, -1, -1, -1, 23, -1, 27, -1, -1, 20, -1, -1, -1, -1], [7, -1, 7, 7, 7, 7, 7, 7, -4, 8, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7], [-1, -1, -1, -1, -1, -1, -1, -1, 7, 7, 7, -1, -1, -1, -1, -1, -1, 7, -1, -1, -1, 7, -1, 7, 7, -1, 7, 9, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 10, 10, 10, 10, 10, 10, 10, 10, -1, -1, -1, -1, -1, -1, 10, 10, -1], [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 11, 11, 11, 11, 11, 11, 11, 11, -1, -1, -1, -1, -1, -1, 11, 11, -1], [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 12, 12, 12, 12, 12, 12, 12, 12, -1, -1, -1, -1, -1, -1, 12, 12, -1], [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7, 7, 7, 7, 7, 7, 7, 7, -1, -1, -1, -1, -1, -1, 7, 7, -1], [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 14, 15, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [1, 1, -1, -8, -1, -7, -1, -3, -1, -1, -1, -1, -1, 16, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [1, 1, -1, -8, -1, -7, -1, -3, -1, -1, -1, -1, -1, 16, 15, 15, -1, -1, -1, -1, 17, -1, -1, -1, -1, -1, -1, -1, -1, 17, -1], [1, 1, -1, -8, -1, -7, -1, -3, -1, -1, -1, -1, -1, -1, 16, 16, -1, -1, -1, -1, 17, -1, -1, -1, -1, -1, -1, -1, -1, 17, -1], [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 18, 18, -1, 19, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 19, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [1, 1, -1, -8, -1, -7, -1, -3, -1, -1, -1, -1, -1, -1, 19, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 21, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 22, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 24, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 25, -1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 26, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 28, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 29, -1, -1, -1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, -1, -1, -1, -1, -1, -1, -1, -1]];

  return jsonChecker;

})(fm.object);


/**
@class fm.nullLogProvider
 <div>
 An implementation of a logging provider that does nothing.
 </div>

@extends fm.logProvider
*/


fm.nullLogProvider = (function(_super) {

  __extends(nullLogProvider, _super);

  /**
  	@ignore 
  	@description
  */


  function nullLogProvider() {
    this.log = __bind(this.log, this);

    this.isEnabled = __bind(this.isEnabled, this);
    if (arguments.length === 1 && fm.util.isPlainObject(arguments[0]) && fm.util.canAttachProperties(this, arguments[0])) {
      nullLogProvider.__super__.constructor.call(this);
      fm.util.attachProperties(this, arguments[0]);
      return;
    }
    nullLogProvider.__super__.constructor.call(this);
  }

  /**
  	 <div>
  	 Returns <c>false</c>.
  	 </div><param name="level">The log level.</param><returns>
  	 <c>false</c>.
  	 </returns>
  
  	@function isEnabled
  	@param {fm.logLevel} level
  	@return {fm.boolean}
  */


  nullLogProvider.prototype.isEnabled = function() {
    var level;
    level = arguments[0];
    return false;
  };

  /**
  	 <div>
  	 Ignores a message at the specified log level.
  	 </div><param name="level">The log level.</param><param name="message">The message.</param><param name="ex">The exception.</param>
  
  	@function log
  	@param {fm.logLevel} level
  	@param {fm.string} message
  	@param {Error} ex
  	@return {void}
  */


  nullLogProvider.prototype.log = function() {
    var ex, level, message;
    if (arguments.length === 2) {
      level = arguments[0];
      message = arguments[1];
      return;
    }
    if (arguments.length === 3) {
      level = arguments[0];
      message = arguments[1];
      ex = arguments[2];
    }
  };

  return nullLogProvider;

})(fm.logProvider);


/**
@class fm.serializer
 <div>
 Provides methods for serializing/deserializing .NET value types
 as well as facilities for converting objects and arrays if
 appropriate callbacks are supplied to assist with the conversion.
 </div>

@extends fm.object
*/


fm.serializer = (function(_super) {

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
  
  	@function charToUnicodeString
  	@param {fm.char} value
  	@return {fm.string}
  */


  serializer.charToUnicodeString = function() {
    var ch, ch2, ch3, ch4, value;
    value = arguments[0];
    ch = fm.serializer.intToHex((value >> 12) & '');
    ch2 = fm.serializer.intToHex((value >> 8) & '');
    ch3 = fm.serializer.intToHex((value >> 4) & '');
    ch4 = fm.serializer.intToHex(value & '');
    return fm.stringExtensions.concat(["\\u", ch, ch2, ch3, ch4]);
  };

  /**
  	 <div>
  	 Deserializes a boolean value.
  	 </div><param name="valueJson">The boolean JSON to deserialize.</param><returns>The deserialized boolean value.</returns>
  
  	@function deserializeBoolean
  	@param {fm.string} valueJson
  	@return {fm.nullable}
  */


  serializer.deserializeBoolean = function() {
    var boolResult, valueJson, _var0, _var1;
    valueJson = arguments[0];
    if (!fm.stringExtensions.isNullOrEmpty(valueJson)) {
      valueJson = fm.stringExtensions.trim(valueJson);
      if (valueJson === "null") {
        return null;
      }
      boolResult = false;
      _var0 = new fm.holder(boolResult);
      _var1 = fm.parseAssistant.tryParseBoolean(valueJson, _var0);
      boolResult = _var0.getValue();
      if (_var1) {
        return boolResult;
      }
    }
    return null;
  };

  /**
  	 <div>
  	 Deserializes a boolean array from JSON.
  	 </div><param name="arrayJson">A JSON-serialized boolean array.</param><returns>An array of boolean values.</returns>
  
  	@function deserializeBooleanArray
  	@param {fm.string} arrayJson
  	@return {fm.array}
  */


  serializer.deserializeBooleanArray = function() {
    var arrayJson, flagArray, i, strArray;
    arrayJson = arguments[0];
    if (fm.stringExtensions.isNullOrEmpty(arrayJson)) {
      return null;
    }
    arrayJson = fm.stringExtensions.trim(arrayJson);
    if (arrayJson === "null") {
      return null;
    }
    flagArray = null;
    if (arrayJson.charAt(0) === '[') {
      arrayJson = fm.stringExtensions.substring(arrayJson, 1, arrayJson.length - 2);
      if (fm.stringExtensions.isNullOrEmpty(arrayJson)) {
        flagArray = [];
      } else {
        strArray = fm.stringExtensions.split(arrayJson, [',']);
        flagArray = [];
        i = 0;
        while (i < strArray.length) {
          try {
            flagArray[i] = fm.serializer.deserializeBoolean(fm.stringExtensions.trim(strArray[i]));
          } finally {
            i++;
          }
        }
      }
    }
    return flagArray;
  };

  /**
  	 <div>
  	 Deserializes a decimal value.
  	 </div><param name="valueJson">The decimal JSON to deserialize.</param><returns>The deserialized decimal value.</returns>
  
  	@function deserializeDecimal
  	@param {fm.string} valueJson
  	@return {fm.nullable}
  */


  serializer.deserializeDecimal = function() {
    var decimalResult, valueJson, _var0, _var1;
    valueJson = arguments[0];
    if (!fm.stringExtensions.isNullOrEmpty(valueJson)) {
      valueJson = fm.stringExtensions.trim(valueJson);
      if (valueJson === "null") {
        return null;
      }
      decimalResult = 0;
      _var0 = new fm.holder(decimalResult);
      _var1 = fm.parseAssistant.tryParseDecimal(valueJson, _var0);
      decimalResult = _var0.getValue();
      if (_var1) {
        return decimalResult;
      }
    }
    return null;
  };

  /**
  	 <div>
  	 Deserializes a decimal array from JSON.
  	 </div><param name="arrayJson">A JSON-serialized decimal array.</param><returns>An array of decimal values.</returns>
  
  	@function deserializeDecimalArray
  	@param {fm.string} arrayJson
  	@return {fm.array}
  */


  serializer.deserializeDecimalArray = function() {
    var arrayJson, i, numArray, strArray;
    arrayJson = arguments[0];
    if (fm.stringExtensions.isNullOrEmpty(arrayJson)) {
      return null;
    }
    arrayJson = fm.stringExtensions.trim(arrayJson);
    if (arrayJson === "null") {
      return null;
    }
    numArray = null;
    if (arrayJson.charAt(0) === '[') {
      arrayJson = fm.stringExtensions.substring(arrayJson, 1, arrayJson.length - 2);
      if (fm.stringExtensions.isNullOrEmpty(arrayJson)) {
        numArray = [];
      } else {
        strArray = fm.stringExtensions.split(arrayJson, [',']);
        numArray = [];
        i = 0;
        while (i < strArray.length) {
          try {
            numArray[i] = fm.serializer.deserializeDecimal(fm.stringExtensions.trim(strArray[i]));
          } finally {
            i++;
          }
        }
      }
    }
    return numArray;
  };

  /**
  	 <div>
  	 Deserializes a double value.
  	 </div><param name="valueJson">The double JSON to deserialize.</param><returns>The deserialized double value.</returns>
  
  	@function deserializeDouble
  	@param {fm.string} valueJson
  	@return {fm.nullable}
  */


  serializer.deserializeDouble = function() {
    var doubleResult, valueJson, _var0, _var1;
    valueJson = arguments[0];
    if (!fm.stringExtensions.isNullOrEmpty(valueJson)) {
      valueJson = fm.stringExtensions.trim(valueJson);
      if (valueJson === "null") {
        return null;
      }
      doubleResult = 0;
      _var0 = new fm.holder(doubleResult);
      _var1 = fm.parseAssistant.tryParseDouble(valueJson, _var0);
      doubleResult = _var0.getValue();
      if (_var1) {
        return doubleResult;
      }
    }
    return null;
  };

  /**
  	 <div>
  	 Deserializes a double array from JSON.
  	 </div><param name="arrayJson">A JSON-serialized double array.</param><returns>An array of double values.</returns>
  
  	@function deserializeDoubleArray
  	@param {fm.string} arrayJson
  	@return {fm.array}
  */


  serializer.deserializeDoubleArray = function() {
    var arrayJson, i, numArray, strArray;
    arrayJson = arguments[0];
    if (fm.stringExtensions.isNullOrEmpty(arrayJson)) {
      return null;
    }
    arrayJson = fm.stringExtensions.trim(arrayJson);
    if (arrayJson === "null") {
      return null;
    }
    numArray = null;
    if (arrayJson.charAt(0) === '[') {
      arrayJson = fm.stringExtensions.substring(arrayJson, 1, arrayJson.length - 2);
      if (fm.stringExtensions.isNullOrEmpty(arrayJson)) {
        numArray = [];
      } else {
        strArray = fm.stringExtensions.split(arrayJson, [',']);
        numArray = [];
        i = 0;
        while (i < strArray.length) {
          try {
            numArray[i] = fm.serializer.deserializeDouble(fm.stringExtensions.trim(strArray[i]));
          } finally {
            i++;
          }
        }
      }
    }
    return numArray;
  };

  /**
  	 <div>
  	 Deserializes a float value.
  	 </div><param name="valueJson">The float JSON to deserialize.</param><returns>The deserialized float value.</returns>
  
  	@function deserializeFloat
  	@param {fm.string} valueJson
  	@return {fm.nullable}
  */


  serializer.deserializeFloat = function() {
    var floatResult, valueJson, _var0, _var1;
    valueJson = arguments[0];
    if (!fm.stringExtensions.isNullOrEmpty(valueJson)) {
      valueJson = fm.stringExtensions.trim(valueJson);
      if (valueJson === "null") {
        return null;
      }
      floatResult = 0;
      _var0 = new fm.holder(floatResult);
      _var1 = fm.parseAssistant.tryParseFloat(valueJson, _var0);
      floatResult = _var0.getValue();
      if (_var1) {
        return floatResult;
      }
    }
    return null;
  };

  /**
  	 <div>
  	 Deserializes a float array from JSON.
  	 </div><param name="arrayJson">A JSON-serialized float array.</param><returns>An array of float values.</returns>
  
  	@function deserializeFloatArray
  	@param {fm.string} arrayJson
  	@return {fm.array}
  */


  serializer.deserializeFloatArray = function() {
    var arrayJson, i, numArray, strArray;
    arrayJson = arguments[0];
    if (fm.stringExtensions.isNullOrEmpty(arrayJson)) {
      return null;
    }
    arrayJson = fm.stringExtensions.trim(arrayJson);
    if (arrayJson === "null") {
      return null;
    }
    numArray = null;
    if (arrayJson.charAt(0) === '[') {
      arrayJson = fm.stringExtensions.substring(arrayJson, 1, arrayJson.length - 2);
      if (fm.stringExtensions.isNullOrEmpty(arrayJson)) {
        numArray = [];
      } else {
        strArray = fm.stringExtensions.split(arrayJson, [',']);
        numArray = [];
        i = 0;
        while (i < strArray.length) {
          try {
            numArray[i] = fm.serializer.deserializeFloat(fm.stringExtensions.trim(strArray[i]));
          } finally {
            i++;
          }
        }
      }
    }
    return numArray;
  };

  /**
  	 <div>
  	 Deserializes a globally unique identifier.
  	 </div><param name="valueJson">The GUID JSON to deserialize.</param><returns>The deserialized GUID.</returns>
  
  	@function deserializeGuid
  	@param {fm.string} valueJson
  	@return {fm.nullable}
  */


  serializer.deserializeGuid = function() {
    var empty, valueJson, _var0, _var1;
    valueJson = arguments[0];
    if (!fm.stringExtensions.isNullOrEmpty(valueJson)) {
      valueJson = fm.stringExtensions.trim(valueJson);
      if (valueJson === "null") {
        return null;
      }
      empty = fm.guid.empty;
      _var0 = new fm.holder(empty);
      _var1 = fm.parseAssistant.tryParseGuid(fm.serializer.deserializeString(valueJson), _var0);
      empty = _var0.getValue();
      if (_var1) {
        return empty;
      }
    }
    return null;
  };

  /**
  	 <div>
  	 Deserializes a GUID array from JSON.
  	 </div><param name="arrayJson">A JSON-serialized GUID array.</param><returns>An array of GUID values.</returns>
  
  	@function deserializeGuidArray
  	@param {fm.string} arrayJson
  	@return {fm.array}
  */


  serializer.deserializeGuidArray = function() {
    var arrayJson, guidArray, i, strArray;
    arrayJson = arguments[0];
    if (fm.stringExtensions.isNullOrEmpty(arrayJson)) {
      return null;
    }
    arrayJson = fm.stringExtensions.trim(arrayJson);
    if (arrayJson === "null") {
      return null;
    }
    guidArray = null;
    if (arrayJson.charAt(0) === '[') {
      arrayJson = fm.stringExtensions.substring(arrayJson, 1, arrayJson.length - 2);
      if (fm.stringExtensions.isNullOrEmpty(arrayJson)) {
        guidArray = [];
      } else {
        strArray = fm.stringExtensions.split(arrayJson, [',']);
        guidArray = [];
        i = 0;
        while (i < strArray.length) {
          try {
            guidArray[i] = fm.serializer.deserializeGuid(fm.stringExtensions.trim(strArray[i]));
          } finally {
            i++;
          }
        }
      }
    }
    return guidArray;
  };

  /**
  	 <div>
  	 Deserializes an integer value.
  	 </div><param name="valueJson">The integer JSON to deserialize.</param><returns>The deserialized integer value.</returns>
  
  	@function deserializeInteger
  	@param {fm.string} valueJson
  	@return {fm.nullable}
  */


  serializer.deserializeInteger = function() {
    var intResult, valueJson, _var0, _var1;
    valueJson = arguments[0];
    if (!fm.stringExtensions.isNullOrEmpty(valueJson)) {
      valueJson = fm.stringExtensions.trim(valueJson);
      if (valueJson === "null") {
        return null;
      }
      intResult = 0;
      _var0 = new fm.holder(intResult);
      _var1 = fm.parseAssistant.tryParseInteger(valueJson, _var0);
      intResult = _var0.getValue();
      if (_var1) {
        return intResult;
      }
    }
    return null;
  };

  /**
  	 <div>
  	 Deserializes a integer array from JSON.
  	 </div><param name="arrayJson">A JSON-serialized integer array.</param><returns>An array of integer values.</returns>
  
  	@function deserializeIntegerArray
  	@param {fm.string} arrayJson
  	@return {fm.array}
  */


  serializer.deserializeIntegerArray = function() {
    var arrayJson, i, numArray, strArray;
    arrayJson = arguments[0];
    if (fm.stringExtensions.isNullOrEmpty(arrayJson)) {
      return null;
    }
    arrayJson = fm.stringExtensions.trim(arrayJson);
    if (arrayJson === "null") {
      return null;
    }
    numArray = null;
    if (arrayJson.charAt(0) === '[') {
      arrayJson = fm.stringExtensions.substring(arrayJson, 1, arrayJson.length - 2);
      if (fm.stringExtensions.isNullOrEmpty(arrayJson)) {
        numArray = [];
      } else {
        strArray = fm.stringExtensions.split(arrayJson, [',']);
        numArray = [];
        i = 0;
        while (i < strArray.length) {
          try {
            numArray[i] = fm.serializer.deserializeInteger(fm.stringExtensions.trim(strArray[i]));
          } finally {
            i++;
          }
        }
      }
    }
    return numArray;
  };

  /**
  	 <div>
  	 Deserializes a long value.
  	 </div><param name="valueJson">The long JSON to deserialize.</param><returns>The deserialized long value.</returns>
  
  	@function deserializeLong
  	@param {fm.string} valueJson
  	@return {fm.nullable}
  */


  serializer.deserializeLong = function() {
    var longResult, valueJson, _var0, _var1;
    valueJson = arguments[0];
    if (!fm.stringExtensions.isNullOrEmpty(valueJson)) {
      valueJson = fm.stringExtensions.trim(valueJson);
      if (valueJson === "null") {
        return null;
      }
      longResult = 0;
      _var0 = new fm.holder(longResult);
      _var1 = fm.parseAssistant.tryParseLong(valueJson, _var0);
      longResult = _var0.getValue();
      if (_var1) {
        return longResult;
      }
    }
    return null;
  };

  /**
  	 <div>
  	 Deserializes a long array from JSON.
  	 </div><param name="arrayJson">A JSON-serialized long array.</param><returns>An array of long values.</returns>
  
  	@function deserializeLongArray
  	@param {fm.string} arrayJson
  	@return {fm.array}
  */


  serializer.deserializeLongArray = function() {
    var arrayJson, i, numArray, strArray;
    arrayJson = arguments[0];
    if (fm.stringExtensions.isNullOrEmpty(arrayJson)) {
      return null;
    }
    arrayJson = fm.stringExtensions.trim(arrayJson);
    if (arrayJson === "null") {
      return null;
    }
    numArray = null;
    if (arrayJson.charAt(0) === '[') {
      arrayJson = fm.stringExtensions.substring(arrayJson, 1, arrayJson.length - 2);
      if (fm.stringExtensions.isNullOrEmpty(arrayJson)) {
        numArray = [];
      } else {
        strArray = fm.stringExtensions.split(arrayJson, [',']);
        numArray = [];
        i = 0;
        while (i < strArray.length) {
          try {
            numArray[i] = fm.serializer.deserializeLong(fm.stringExtensions.trim(strArray[i]));
          } finally {
            i++;
          }
        }
      }
    }
    return numArray;
  };

  /**
  	 <div>
  	 Deserializes a JSON string into a target object type.
  	 </div><typeparam name="T">The type of the object to deserialize.</typeparam><param name="json">The JSON-encoded string.</param><param name="creator">The method used for creating a new object.</param><param name="callback">The method used for deserializing a property.</param><returns>The deserialized object.</returns>
  
  	@function deserializeObject
  	@param {fm.string} json
  	@param {fm.emptyFunction} creator
  	@param {fm.deserializeCallback} callback
  	@return {fm.object}
  */


  serializer.deserializeObject = function() {
    var callback, ch, creator, flag, flag2, flag3, i, json, none, num, num2, num3, num5, startIndex, str2, target, type2, valueJson, _var0;
    json = arguments[0];
    creator = arguments[1];
    callback = arguments[2];
    _var0 = json;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return null;
    }
    json = fm.stringExtensions.trim(json);
    if ((json === "null") || (json.length < 2)) {
      return null;
    }
    target = creator();
    if (((json.charAt(0) === '{') && (json.charAt(json.length - 1) === '}')) && (json.length > 2)) {
      json = fm.stringExtensions.concat(fm.stringExtensions.substring(json, 1, json.length - 2), ",");
      num = 0;
      num2 = 0;
      flag = false;
      num3 = -2;
      none = fm.stringType.None;
      startIndex = 0;
      num5 = 0;
      valueJson = fm.stringExtensions.empty;
      str2 = fm.stringExtensions.empty;
      i = 0;
      while (i < json.length) {
        try {
          ch = json.charAt(i);
          flag2 = num3 === (i - 1);
          flag3 = false;
          if (!flag) {
            switch (ch) {
              case '[':
                num2++;
                flag3 = true;
                break;
              case ']':
                num2--;
                flag3 = true;
                break;
              case '{':
                num++;
                flag3 = true;
                break;
              case '}':
                num--;
                flag3 = true;
                break;
            }
          }
          if (!flag3) {
            if (flag && !((ch !== '\\') || flag2)) {
              num3 = i;
              flag3 = true;
            }
            if (!flag3) {
              if ((num === 0) && (num2 === 0)) {
                switch (ch) {
                  case ',':
                    if (!flag) {
                      str2 = fm.stringExtensions.trim(fm.stringExtensions.substring(json, num5, i - num5));
                      callback(target, fm.serializer.deserializeString(valueJson), str2);
                      startIndex = i + 1;
                    }
                    flag3 = true;
                    break;
                  case ':':
                    if (!flag) {
                      valueJson = fm.stringExtensions.trim(fm.stringExtensions.substring(json, startIndex, i - startIndex));
                      num5 = i + 1;
                    }
                    flag3 = true;
                    break;
                }
              }
              if (!flag3 && (((ch === '\'') || (ch === '"')) && !flag2)) {
                type2 = (ch === '"' ? fm.stringType.Double : fm.stringType.Single);
                if (!flag) {
                  flag = true;
                  none = type2;
                } else {
                  if (none === type2) {
                    flag = false;
                    none = fm.stringType.None;
                  }
                }
                flag3 = true;
              }
            }
          }
        } finally {
          i++;
        }
      }
    }
    return target;
  };

  /**
  	 <div>
  	 Deserializes a JSON string into an array of target object types.
  	 </div><typeparam name="T">The type of the object to deserialize.</typeparam><param name="json">The JSON-encoded string.</param><param name="creator">The method used for creating an object.</param><param name="callback">The method used for deserializing an object.</param><returns>An array of deserialized objects.</returns>
  
  	@function deserializeObjectArray
  	@param {fm.string} json
  	@param {fm.emptyFunction} creator
  	@param {fm.deserializeCallback} callback
  	@return {fm.array}
  */


  serializer.deserializeObjectArray = function() {
    var callback, creator, item, json, list, list2, str, _i, _len, _var0, _var1;
    json = arguments[0];
    creator = arguments[1];
    callback = arguments[2];
    list = fm.serializer.deserializeRawArray(json);
    _var0 = list;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return null;
    }
    list2 = [];
    _var1 = list;
    for (_i = 0, _len = _var1.length; _i < _len; _i++) {
      str = _var1[_i];
      item = fm.serializer.deserializeObject(str, creator, callback);
      fm.arrayExtensions.add(list2, item);
    }
    return list2;
  };

  /**
  	 <div>
  	 Deserializes a JSON string into an array of <see cref="fm.serializable">fm.serializable</see> target object types.
  	 </div><typeparam name="T">The type of the object to deserialize.</typeparam><param name="json">The JSON-encoded string.</param><param name="creator">The method used for creating an object.</param><param name="callback">The method used for deserializing an object.</param><returns>An array of deserialized objects.</returns>
  
  	@function deserializeObjectArrayFast
  	@param {fm.string} json
  	@param {fm.emptyFunction} creator
  	@param {fm.deserializeCallback} callback
  	@return {fm.array}
  */


  serializer.deserializeObjectArrayFast = function() {
    var callback, creator, item, json, list, list2, str, _i, _len, _var0, _var1;
    json = arguments[0];
    creator = arguments[1];
    callback = arguments[2];
    list = fm.serializer.deserializeRawArray(json);
    _var0 = list;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return null;
    }
    list2 = [];
    _var1 = list;
    for (_i = 0, _len = _var1.length; _i < _len; _i++) {
      str = _var1[_i];
      item = fm.serializer.deserializeObject(str, creator, callback);
      item.setSerialized(str);
      fm.arrayExtensions.add(list2, item);
    }
    return list2;
  };

  /**
  	 <div>
  	 Deserializes a JSON string into a <see cref="fm.serializable">fm.serializable</see> target object type.
  	 </div><typeparam name="T">The type of the object to deserialize.</typeparam><param name="json">The JSON-encoded string.</param><param name="creator">The method used for creating a new object.</param><param name="callback">The method used for deserializing a property.</param><returns>The deserialized object.</returns>
  
  	@function deserializeObjectFast
  	@param {fm.string} json
  	@param {fm.emptyFunction} creator
  	@param {fm.deserializeCallback} callback
  	@return {fm.object}
  */


  serializer.deserializeObjectFast = function() {
    var callback, creator, json, local, _var0;
    json = arguments[0];
    creator = arguments[1];
    callback = arguments[2];
    local = fm.serializer.deserializeObject(json, creator, callback);
    _var0 = local;
    if (_var0 !== null && typeof _var0 !== 'undefined') {
      local.setSerialized(json);
    }
    return local;
  };

  /**
  	 <div>
  	 Deserializes a piece of raw JSON.
  	 </div><param name="dataJson">The raw data.</param><returns>The deserialized data.</returns>
  
  	@function deserializeRaw
  	@param {fm.string} dataJson
  	@return {fm.string}
  */


  serializer.deserializeRaw = function() {
    var dataJson;
    dataJson = arguments[0];
    if (fm.stringExtensions.isNullOrEmpty(dataJson)) {
      return null;
    }
    return fm.stringExtensions.trim(dataJson);
  };

  /**
  	 <div>
  	 Deserializes a raw array from JSON.
  	 </div><param name="json">A JSON-serialized raw array.</param><returns>An array of raw values.</returns>
  
  	@function deserializeRawArray
  	@param {fm.string} json
  	@return {fm.array}
  */


  serializer.deserializeRawArray = function() {
    var ch, flag, flag2, i, json, list, none, num, num3, startIndex, type2, _var0;
    json = arguments[0];
    _var0 = json;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return null;
    }
    json = fm.stringExtensions.trim(json);
    if ((json === "null") || (json.length < 2)) {
      return null;
    }
    list = [];
    if (((json.charAt(0) === '[') && (json.charAt(json.length - 1) === ']')) && (json.length > 2)) {
      num = 0;
      startIndex = 0;
      flag = false;
      num3 = -2;
      none = fm.stringType.None;
      i = 1;
      while (i < (json.length - 1)) {
        try {
          ch = json.charAt(i);
          flag2 = num3 === (i - 1);
          if (!flag) {
            switch (ch) {
              case '{':
                if (num === 0) {
                  startIndex = i;
                }
                num++;
                break;
              case '}':
                num--;
                if (num === 0) {
                  fm.arrayExtensions.add(list, fm.stringExtensions.substring(json, startIndex, (i - startIndex) + 1));
                }
                break;
            }
          }
          if (flag && !((ch !== '\\') || flag2)) {
            num3 = i;
          } else {
            if (((ch === '\'') || (ch === '"')) && !flag2) {
              type2 = (ch === '"' ? fm.stringType.Double : fm.stringType.Single);
              if (!flag) {
                flag = true;
                none = type2;
              } else {
                if (none === type2) {
                  flag = false;
                  none = fm.stringType.None;
                }
              }
            }
          }
        } finally {
          i++;
        }
      }
    }
    return list;
  };

  /**
  	 <div>
  	 Deserializes a string.
  	 </div><param name="valueJson">The string to deserialize.</param><returns>The deserialized string value.</returns>
  
  	@function deserializeString
  	@param {fm.string} valueJson
  	@return {fm.string}
  */


  serializer.deserializeString = function() {
    var valueJson;
    valueJson = arguments[0];
    if (fm.stringExtensions.isNullOrEmpty(valueJson)) {
      return null;
    }
    valueJson = fm.stringExtensions.trim(valueJson);
    if (valueJson === "null") {
      return null;
    }
    return fm.serializer.unescapeString(fm.serializer.trimQuotes(valueJson));
  };

  /**
  	 <div>
  	 Deserializes a simple string array from JSON (no commas in strings).
  	 </div><param name="arrayJson">A JSON-serialized string array.</param><returns>An array of string values.</returns>
  
  	@function deserializeStringArray
  	@param {fm.string} arrayJson
  	@return {fm.array}
  */


  serializer.deserializeStringArray = function() {
    var arrayJson, i, strArray;
    arrayJson = arguments[0];
    if (fm.stringExtensions.isNullOrEmpty(arrayJson)) {
      return null;
    }
    arrayJson = fm.stringExtensions.trim(arrayJson);
    if (arrayJson === "null") {
      return null;
    }
    if (arrayJson.charAt(0) === '[') {
      arrayJson = fm.stringExtensions.substring(arrayJson, 1, arrayJson.length - 2);
      if (fm.stringExtensions.isNullOrEmpty(arrayJson)) {
        strArray = [];
      } else {
        strArray = fm.stringExtensions.split(arrayJson, [',']);
        i = 0;
        while (i < strArray.length) {
          try {
            strArray[i] = fm.serializer.unescapeString(fm.serializer.trimQuotes(fm.stringExtensions.trim(strArray[i])));
          } finally {
            i++;
          }
        }
      }
      return strArray;
    }
    return [arrayJson];
  };

  /**
  	 <div>
  	 Escapes any special characters in a string.
  	 </div><param name="text">The string without escaped characters.</param><returns>The escaped string.</returns>
  
  	@function escapeString
  	@param {fm.string} text
  	@return {fm.string}
  */


  serializer.escapeString = function() {
    var builder, ch, i, text;
    text = arguments[0];
    builder = new fm.stringBuilder();
    i = 0;
    while (i < text.length) {
      try {
        ch = text.charAt(i);
        if (ch > '~') {
          builder.append(fm.serializer.charToUnicodeString(ch));
        } else {
          if (ch === '\b') {
            builder.append("\\b");
          } else {
            if (ch === '\f') {
              builder.append("\\f");
            } else {
              if (ch === '\n') {
                builder.append("\\n");
              } else {
                if (ch === '\r') {
                  builder.append("\\r");
                } else {
                  if (ch === '\t') {
                    builder.append("\\t");
                  } else {
                    if (ch === '"') {
                      builder.append("\\\"");
                    } else {
                      if (ch === '/') {
                        builder.append("\\/");
                      } else {
                        if (ch === '\\') {
                          builder.append("\\\\");
                        } else {
                          builder.append(ch.toString());
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      } finally {
        i++;
      }
    }
    return builder.toString();
  };

  /**
  
  	@function intToHex
  	@param {fm.int} value
  	@return {fm.char}
  */


  serializer.intToHex = function() {
    var value;
    value = arguments[0];
    if (value <= 9) {
      return value + 48;
    }
    return (value - 10) + 97;
  };

  /**
  	 <div>
  	 Determines whether the specified JSON string is valid.
  	 </div><param name="json">The JSON string to validate.</param><returns>True if the JSON string is valid; false otherwise.</returns>
  
  	@function isValidJson
  	@param {fm.string} json
  	@return {fm.boolean}
  */


  serializer.isValidJson = function() {
    var json;
    json = arguments[0];
    return new fm.jsonChecker().checkString(json);
  };

  /**
  	 <div>
  	 Serializes a boolean value.
  	 </div><param name="value">The boolean to serialize.</param><returns>The serialized boolean value.</returns>
  
  	@function serializeBoolean
  	@param {fm.nullable} value
  	@return {fm.string}
  */


  serializer.serializeBoolean = function() {
    var value;
    value = arguments[0];
    if (!(value !== null)) {
      return "null";
    }
    if (value) {
      return "true";
    }
    return "false";
  };

  /**
  	 <div>
  	 Serializes a boolean array to JSON.
  	 </div><param name="array">An array of boolean values.</param><returns>A JSON-serialized boolean array.</returns>
  
  	@function serializeBooleanArray
  	@param {fm.array} array
  	@return {fm.string}
  */


  serializer.serializeBooleanArray = function() {
    var array, i, strArray, _var0;
    array = arguments[0];
    _var0 = array;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return "null";
    }
    strArray = [];
    i = 0;
    while (i < array.length) {
      try {
        strArray[i] = fm.serializer.serializeBoolean(array[i]);
      } finally {
        i++;
      }
    }
    return fm.stringExtensions.concat("[", fm.stringExtensions.join(",", strArray), "]");
  };

  /**
  	 <div>
  	 Serializes a decimal value.
  	 </div><param name="value">The decimal to serialize.</param><returns>The serialized decimal value.</returns>
  
  	@function serializeDecimal
  	@param {fm.nullable} value
  	@return {fm.string}
  */


  serializer.serializeDecimal = function() {
    var value;
    value = arguments[0];
    if (!(value !== null)) {
      return "null";
    }
    return value.toString();
  };

  /**
  	 <div>
  	 Serializes a decimal array to JSON.
  	 </div><param name="array">An array of decimal values.</param><returns>A JSON-serialized decimal array.</returns>
  
  	@function serializeDecimalArray
  	@param {fm.array} array
  	@return {fm.string}
  */


  serializer.serializeDecimalArray = function() {
    var array, i, strArray, _var0;
    array = arguments[0];
    _var0 = array;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return "null";
    }
    strArray = [];
    i = 0;
    while (i < array.length) {
      try {
        strArray[i] = fm.serializer.serializeDecimal(array[i]);
      } finally {
        i++;
      }
    }
    return fm.stringExtensions.concat("[", fm.stringExtensions.join(",", strArray), "]");
  };

  /**
  	 <div>
  	 Serializes a double value.
  	 </div><param name="value">The double to serialize.</param><returns>The serialized double value.</returns>
  
  	@function serializeDouble
  	@param {fm.nullable} value
  	@return {fm.string}
  */


  serializer.serializeDouble = function() {
    var value;
    value = arguments[0];
    if (!(value !== null)) {
      return "null";
    }
    return value.toString();
  };

  /**
  	 <div>
  	 Serializes a double array to JSON.
  	 </div><param name="array">An array of double values.</param><returns>A JSON-serialized double array.</returns>
  
  	@function serializeDoubleArray
  	@param {fm.array} array
  	@return {fm.string}
  */


  serializer.serializeDoubleArray = function() {
    var array, i, strArray, _var0;
    array = arguments[0];
    _var0 = array;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return "null";
    }
    strArray = [];
    i = 0;
    while (i < array.length) {
      try {
        strArray[i] = fm.serializer.serializeDouble(array[i]);
      } finally {
        i++;
      }
    }
    return fm.stringExtensions.concat("[", fm.stringExtensions.join(",", strArray), "]");
  };

  /**
  	 <div>
  	 Serializes a float value.
  	 </div><param name="value">The float to serialize.</param><returns>The serialized float value.</returns>
  
  	@function serializeFloat
  	@param {fm.nullable} value
  	@return {fm.string}
  */


  serializer.serializeFloat = function() {
    var value;
    value = arguments[0];
    if (!(value !== null)) {
      return "null";
    }
    return value.toString();
  };

  /**
  	 <div>
  	 Serializes a float array to JSON.
  	 </div><param name="array">An array of float values.</param><returns>A JSON-serialized float array.</returns>
  
  	@function serializeFloatArray
  	@param {fm.array} array
  	@return {fm.string}
  */


  serializer.serializeFloatArray = function() {
    var array, i, strArray, _var0;
    array = arguments[0];
    _var0 = array;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return "null";
    }
    strArray = [];
    i = 0;
    while (i < array.length) {
      try {
        strArray[i] = fm.serializer.serializeFloat(array[i]);
      } finally {
        i++;
      }
    }
    return fm.stringExtensions.concat("[", fm.stringExtensions.join(",", strArray), "]");
  };

  /**
  	 <div>
  	 Serializes a globally unique identifier.
  	 </div><param name="value">The GUID to serialize.</param><returns>The serialized GUID.</returns>
  
  	@function serializeGuid
  	@param {fm.nullable} value
  	@return {fm.string}
  */


  serializer.serializeGuid = function() {
    var value;
    value = arguments[0];
    if (!(value !== null)) {
      return "null";
    }
    return fm.stringExtensions.concat("\"", value.toString(), "\"");
  };

  /**
  	 <div>
  	 Serializes a GUID array to JSON.
  	 </div><param name="array">An array of GUID values.</param><returns>A JSON-serialized GUID array.</returns>
  
  	@function serializeGuidArray
  	@param {fm.array} array
  	@return {fm.string}
  */


  serializer.serializeGuidArray = function() {
    var array, i, strArray, _var0;
    array = arguments[0];
    _var0 = array;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return "null";
    }
    strArray = [];
    i = 0;
    while (i < array.length) {
      try {
        strArray[i] = fm.serializer.serializeGuid(array[i]);
      } finally {
        i++;
      }
    }
    return fm.stringExtensions.concat("[", fm.stringExtensions.join(",", strArray), "]");
  };

  /**
  	 <div>
  	 Serializes an integer value.
  	 </div><param name="value">The integer to serialize.</param><returns>The serialized integer value.</returns>
  
  	@function serializeInteger
  	@param {fm.nullable} value
  	@return {fm.string}
  */


  serializer.serializeInteger = function() {
    var value;
    value = arguments[0];
    if (!(value !== null)) {
      return "null";
    }
    return fm.intExtensions.toString(value);
  };

  /**
  	 <div>
  	 Serializes a integer array to JSON.
  	 </div><param name="array">An array of integer values.</param><returns>A JSON-serialized integer array.</returns>
  
  	@function serializeIntegerArray
  	@param {fm.array} array
  	@return {fm.string}
  */


  serializer.serializeIntegerArray = function() {
    var array, i, strArray, _var0;
    array = arguments[0];
    _var0 = array;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return "null";
    }
    strArray = [];
    i = 0;
    while (i < array.length) {
      try {
        strArray[i] = fm.serializer.serializeInteger(array[i]);
      } finally {
        i++;
      }
    }
    return fm.stringExtensions.concat("[", fm.stringExtensions.join(",", strArray), "]");
  };

  /**
  	 <div>
  	 Serializes a long value.
  	 </div><param name="value">The long to serialize.</param><returns>The serialized long value.</returns>
  
  	@function serializeLong
  	@param {fm.nullable} value
  	@return {fm.string}
  */


  serializer.serializeLong = function() {
    var value;
    value = arguments[0];
    if (!(value !== null)) {
      return "null";
    }
    return fm.intExtensions.toString(value);
  };

  /**
  	 <div>
  	 Serializes a long array to JSON.
  	 </div><param name="array">An array of long values.</param><returns>A JSON-serialized long array.</returns>
  
  	@function serializeLongArray
  	@param {fm.array} array
  	@return {fm.string}
  */


  serializer.serializeLongArray = function() {
    var array, i, strArray, _var0;
    array = arguments[0];
    _var0 = array;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return "null";
    }
    strArray = [];
    i = 0;
    while (i < array.length) {
      try {
        strArray[i] = fm.serializer.serializeLong(array[i]);
      } finally {
        i++;
      }
    }
    return fm.stringExtensions.concat("[", fm.stringExtensions.join(",", strArray), "]");
  };

  /**
  	 <div>
  	 Serializes an object into a JSON string.
  	 </div><typeparam name="T">The type of the object to serialize.</typeparam><param name="source">The object being serialized.</param><param name="callback">The method used for serializing properties.</param><returns>The object as a JSON string.</returns>
  
  	@function serializeObject
  	@param {fm.object} source
  	@param {fm.serializeCallback} callback
  	@return {fm.string}
  */


  serializer.serializeObject = function() {
    var callback, jsonObject, list, source, str, _i, _len, _var0, _var1;
    source = arguments[0];
    callback = arguments[1];
    _var0 = source;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return "null";
    }
    jsonObject = {};
    callback(source, jsonObject);
    list = [];
    _var1 = fm.hashExtensions.getKeys(jsonObject);
    for (_i = 0, _len = _var1.length; _i < _len; _i++) {
      str = _var1[_i];
      fm.arrayExtensions.add(list, fm.stringExtensions.concat(fm.serializer.serializeString(str), ":", jsonObject[str]));
    }
    return fm.stringExtensions.concat("{", fm.stringExtensions.join(",", fm.arrayExtensions.toArray(list)), "}");
  };

  /**
  	 <div>
  	 Serializes an object array into a JSON string.
  	 </div><typeparam name="T">The type of the object to serialize.</typeparam><param name="objects">The object array being serialized.</param><param name="callback">The method used for serializing objects.</param><returns>The object array as a JSON string.</returns>
  
  	@function serializeObjectArray
  	@param {fm.array} objects
  	@param {fm.serializeCallback} callback
  	@return {fm.string}
  */


  serializer.serializeObjectArray = function() {
    var callback, i, objects, strArray, _var0;
    objects = arguments[0];
    callback = arguments[1];
    _var0 = objects;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return "null";
    }
    if (objects.length === 0) {
      return "[]";
    }
    strArray = [];
    i = 0;
    while (i < objects.length) {
      try {
        strArray[i] = fm.serializer.serializeObject(objects[i], callback);
      } finally {
        i++;
      }
    }
    return fm.stringExtensions.concat("[", fm.stringExtensions.join(",", strArray), "]");
  };

  /**
  	 <div>
  	 Serializes a <see cref="fm.serializable">fm.serializable</see> object array into a JSON string.
  	 </div><typeparam name="T">The type of the object to serialize.</typeparam><param name="objects">The object array being serialized.</param><param name="callback">The method used for serializing objects.</param><returns>The object array as a JSON string.</returns>
  
  	@function serializeObjectArrayFast
  	@param {fm.array} objects
  	@param {fm.serializeCallback} callback
  	@return {fm.string}
  */


  serializer.serializeObjectArrayFast = function() {
    var callback, i, objects, strArray, _var0;
    objects = arguments[0];
    callback = arguments[1];
    _var0 = objects;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return "null";
    }
    if (objects.length === 0) {
      return "[]";
    }
    strArray = [];
    i = 0;
    while (i < objects.length) {
      try {
        strArray[i] = fm.serializer.serializeObjectFast(objects[i], callback);
      } finally {
        i++;
      }
    }
    return fm.stringExtensions.concat("[", fm.stringExtensions.join(",", strArray), "]");
  };

  /**
  	 <div>
  	 Serializes a <see cref="fm.serializable">fm.serializable</see> object into a JSON string.
  	 </div><typeparam name="T">The type of the object to serialize.</typeparam><param name="source">The object being serialized.</param><param name="callback">The method used for serializing properties.</param><returns>The object as a JSON string.</returns>
  
  	@function serializeObjectFast
  	@param {fm.object} source
  	@param {fm.serializeCallback} callback
  	@return {fm.string}
  */


  serializer.serializeObjectFast = function() {
    var callback, source, _var0;
    source = arguments[0];
    callback = arguments[1];
    _var0 = source;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return "null";
    }
    if (!(source.getIsSerialized() && !source.getIsDirty())) {
      source.setSerialized(fm.serializer.serializeObject(source, callback));
    }
    return source.getSerialized();
  };

  /**
  	 <div>
  	 Serializes a piece of raw JSON.
  	 </div><param name="dataJson">The raw data.</param><returns>The serialized data.</returns>
  
  	@function serializeRaw
  	@param {fm.string} dataJson
  	@return {fm.string}
  */


  serializer.serializeRaw = function() {
    var dataJson;
    dataJson = arguments[0];
    return dataJson;
  };

  /**
  	 <div>
  	 Serializes a raw array to JSON.
  	 </div><param name="jsons">An array of raw values.</param><returns>A JSON-serialized raw array.</returns>
  
  	@function serializeRawArray
  	@param {fm.array} jsons
  	@return {fm.string}
  */


  serializer.serializeRawArray = function() {
    var jsons, _var0;
    jsons = arguments[0];
    _var0 = jsons;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return "null";
    }
    return fm.stringExtensions.concat("[", fm.stringExtensions.join(",", jsons), "]");
  };

  /**
  	 <div>
  	 Serializes a string.
  	 </div><param name="value">The string to serialize.</param><returns>The serialized string value.</returns>
  
  	@function serializeString
  	@param {fm.string} value
  	@return {fm.string}
  */


  serializer.serializeString = function() {
    var value, _var0;
    value = arguments[0];
    _var0 = value;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return "null";
    }
    return fm.stringExtensions.concat("\"", fm.serializer.escapeString(value), "\"");
  };

  /**
  	 <div>
  	 Serializes a string array to JSON.
  	 </div><param name="array">An array of string values.</param><returns>A JSON-serialized string array.</returns>
  
  	@function serializeStringArray
  	@param {fm.array} array
  	@return {fm.string}
  */


  serializer.serializeStringArray = function() {
    var array, i, strArray, _var0;
    array = arguments[0];
    _var0 = array;
    if (_var0 === null || typeof _var0 === 'undefined') {
      return "null";
    }
    strArray = [];
    i = 0;
    while (i < array.length) {
      try {
        strArray[i] = fm.serializer.serializeString(array[i]);
      } finally {
        i++;
      }
    }
    return fm.stringExtensions.concat("[", fm.stringExtensions.join(",", strArray), "]");
  };

  /**
  	 <div>
  	 Trims the quotes from a JavaScript string value.
  	 </div><param name="value">The JavaScript string value.</param><returns>The string without quotes.</returns>
  
  	@function trimQuotes
  	@param {fm.string} value
  	@return {fm.string}
  */


  serializer.trimQuotes = function() {
    var ch, ch2, value;
    value = arguments[0];
    if (value.length > 1) {
      ch = value.charAt(0);
      ch2 = value.charAt(value.length - 1);
      if ((ch === ch2) && ((ch === '\'') || (ch === '"'))) {
        value = fm.stringExtensions.substring(value, 1, value.length - 2);
      }
    }
    return value;
  };

  /**
  	 <div>
  	 Unescapes any special characters from a string.
  	 </div><param name="text">The string with escaped characters.</param><returns>The unescaped string.</returns>
  
  	@function unescapeString
  	@param {fm.string} text
  	@return {fm.string}
  */


  serializer.unescapeString = function() {
    var builder, ch, ch2, i, text;
    text = arguments[0];
    builder = new fm.stringBuilder();
    i = 0;
    while (i < text.length) {
      try {
        ch = text.charAt(i);
        if (ch === '\\') {
          if (i === (text.length - 1)) {
            continue;
          }
          ch2 = text.charAt(i + 1);
          switch (ch2) {
            case 'b':
              builder.append("\b");
              break;
            case 'f':
              builder.append("\f");
              break;
            case 'n':
              builder.append("\n");
              break;
            case 'r':
              builder.append("\r");
              break;
            case 't':
              builder.append("\t");
              break;
            case '/':
              builder.append("/");
              break;
            case 'u':
              if (i < (text.length - 5)) {
                builder.append(fm.serializer.unicodeStringToChar(fm.stringExtensions.substring(text, i, 6)).toString());
                i = i + 4;
              } else {
                builder.append(ch2.toString());
              }
              break;
            case 'x':
              if (i < (text.length - 3)) {
                builder.append(fm.serializer.unicodeStringToChar(fm.stringExtensions.substring(text, i, 4)).toString());
                i = i + 2;
              } else {
                builder.append(ch2.toString());
              }
              break;
            default:
              builder.append(ch2.toString());
              break;
          }
          i++;
          continue;
        }
        builder.append(ch.toString());
      } finally {
        i++;
      }
    }
    return builder.toString();
  };

  /**
  
  	@function unicodeStringToChar
  	@param {fm.string} value
  	@return {fm.char}
  */


  serializer.unicodeStringToChar = function() {
    var value;
    value = arguments[0];
    if (value.length < 2) {
      throw new Error("Unicode string has invalid length.");
    }
    return fm.convert.toInt32(value.substring(2), 16);
  };

  return serializer;

}).call(this, fm.object);


var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

fm.httpWebRequestTransfer = (function(_super) {

  __extends(httpWebRequestTransfer, _super);

  function httpWebRequestTransfer() {
    this.sendInternal = __bind(this.sendInternal, this);

    this.process = __bind(this.process, this);

    this.sendText = __bind(this.sendText, this);

    this.sendTextAsync = __bind(this.sendTextAsync, this);
    return httpWebRequestTransfer.__super__.constructor.apply(this, arguments);
  }

  httpWebRequestTransfer._corsFailCache = {};

  httpWebRequestTransfer._pmFailCache = {};

  httpWebRequestTransfer.getPlatformCode = function() {
    return 'js';
  };

  httpWebRequestTransfer.setDisableCORS = function(disableCORS) {
    return httpWebRequestTransfer._disableCORS = disableCORS;
  };

  httpWebRequestTransfer.getDisableCORS = function() {
    return httpWebRequestTransfer._disableCORS || false;
  };

  httpWebRequestTransfer.setDisablePostMessage = function(disablePostMessage) {
    return httpWebRequestTransfer._disablePostMessage = disablePostMessage;
  };

  httpWebRequestTransfer.getDisablePostMessage = function() {
    return httpWebRequestTransfer._disablePostMessage || false;
  };

  httpWebRequestTransfer.setForceJSONP = function(forceJSONP) {
    return httpWebRequestTransfer._forceJSONP = forceJSONP;
  };

  httpWebRequestTransfer.getForceJSONP = function() {
    return httpWebRequestTransfer._forceJSONP || false;
  };

  httpWebRequestTransfer.prototype.sendTextAsync = function(requestArgs, callback) {
    var _this = this;
    return fm.util.addOnLoad(function() {
      return _this.process(requestArgs, callback);
    });
  };

  httpWebRequestTransfer.prototype.sendText = function(requestArgs) {
    return this.process(requestArgs, null);
  };

  httpWebRequestTransfer.prototype.process = function(requestArgs, callback) {
    var cors, disableCORS, disablePostMessage, fn, forceJSONP, hwrt, pm, url;
    hwrt = fm.httpWebRequestTransfer;
    url = requestArgs.getUrl();
    if (!requestArgs._processed) {
      url = fm.util.absolutizeUrl(url);
      requestArgs.setUrl(url);
      requestArgs._processed = true;
    }
    disableCORS = hwrt.getDisableCORS() || requestArgs.getSender().getDisableCORS();
    disablePostMessage = hwrt.getDisablePostMessage() || requestArgs.getSender().getDisablePostMessage();
    forceJSONP = hwrt.getForceJSONP() || requestArgs.getSender().getForceJSONP();
    fn = fm.xhr.send;
    cors = false;
    pm = false;
    if (fm.util.isXD(url)) {
      if (!disableCORS && hwrt.canCORS() && !hwrt._corsFailCache[url]) {
        cors = true;
      } else if (!disablePostMessage && hwrt.canPostMessage() && !hwrt._pmFailCache[url]) {
        pm = true;
        fn = fm.postMessage.send;
      } else {
        fn = fm.jsonp.send;
      }
    }
    if (forceJSONP) {
      fn = fm.jsonp.send;
    }
    return this.sendInternal(fn, cors, pm, requestArgs, callback);
  };

  httpWebRequestTransfer.prototype.sendInternal = function(fn, cors, pm, requestArgs, callback) {
    var method, options, responseArgs, self, url,
      _this = this;
    self = this;
    responseArgs = new fm.httpResponseArgs(requestArgs);
    responseArgs.setException(new Error('Environment does not support synchronous requests.'));
    url = requestArgs.getUrl();
    method = 'GET';
    switch (requestArgs.getMethod()) {
      case fm.httpMethod.Put:
        method = 'PUT';
        break;
      case fm.httpMethod.Post:
        method = 'POST';
        break;
      case fm.httpMethod.Delete:
        method = 'DELETE';
    }
    options = {
      sync: (callback ? false : true),
      url: url,
      method: method,
      content: requestArgs.getTextContent(),
      headers: requestArgs.getHeaders().toHash(),
      timeout: requestArgs.getTimeout(),
      robustResponse: true,
      onRequestCreated: function(request) {
        var args, onRequestCreated;
        onRequestCreated = requestArgs.getOnRequestCreated();
        if (onRequestCreated) {
          args = new fm.httpRequestCreatedArgs();
          args.setRequestArgs(requestArgs);
          args.setSender(requestArgs.getSender());
          args.setRequest(request);
          return onRequestCreated(args);
        }
      },
      onResponseReceived: function(response) {
        var args, onResponseReceived;
        onResponseReceived = requestArgs.getOnResponseReceived();
        if (onResponseReceived) {
          args = new fm.httpResponseReceivedArgs();
          args.setRequestArgs(requestArgs);
          args.setSender(requestArgs.getSender());
          args.setResponse(response);
          return onResponseReceived(args);
        }
      },
      onSuccess: function(e) {
        if (e.statusCode === 0 && cors) {
          fm.httpWebRequestTransfer._corsFailCache[url] = true;
          if (callback) {
            self.sendTextAsync(requestArgs, callback);
          } else {
            responseArgs = self.sendText(requestArgs);
          }
          return;
        }
        responseArgs.setException(null);
        responseArgs.setTextContent(e.content);
        responseArgs.setStatusCode(e.statusCode);
        responseArgs.setHeaders(new fm.nameValueCollection(e.headers));
        if (callback) {
          return callback(responseArgs);
        }
      },
      onFailure: function(e) {
        var exception;
        if (cors) {
          fm.httpWebRequestTransfer._corsFailCache[url] = true;
          if (callback) {
            self.sendTextAsync(requestArgs, callback);
          } else {
            responseArgs = self.sendText(requestArgs);
          }
          return;
        } else if (pm) {
          fm.httpWebRequestTransfer._pmFailCache[url] = true;
          if (callback) {
            self.sendTextAsync(requestArgs, callback);
          } else {
            responseArgs = self.sendText(requestArgs);
          }
          return;
        }
        exception = new Error(e.message);
        responseArgs.setException(exception);
        if (callback) {
          return callback(responseArgs);
        }
      }
    };
    fn(options);
    return responseArgs;
  };

  httpWebRequestTransfer.canCORS = function() {
    return window.XMLHttpRequest && ('withCredentials' in new XMLHttpRequest());
  };

  httpWebRequestTransfer.canPostMessage = function() {
    if (fm.util.isIE6() || fm.util.isIE7()) {
      return false;
    }
    if (window.postMessage) {
      return true;
    } else {
      return false;
    }
  };

  return httpWebRequestTransfer;

}).call(this, fm.httpTransfer);



(function() {
  return fm.httpTransfer.addQueryToUrl = function() {
    var key, url, value, _var0;
    if (arguments.length === 2) {
      url = arguments[0];
      key = arguments[1];
      return fm.httpTransfer.addQueryToUrl(url, key, null);
      return;
    }
    if (arguments.length === 3) {
      url = arguments[0];
      key = arguments[1];
      value = arguments[2];
      if (fm.stringExtensions.isNullOrEmpty(key)) {
        return url;
      }
      _var0 = value;
      if (_var0 === null || typeof _var0 === 'undefined') {
        value = fm.stringExtensions.empty;
      }
      return fm.stringExtensions.concat([url, (fm.stringExtensions.indexOf(url, "?", fm.stringComparison.OrdinalIgnoreCase) === -1 ? "?" : "&"), key, "=", value]);
    }
  };
})();
