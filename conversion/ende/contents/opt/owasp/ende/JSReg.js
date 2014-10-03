/* ========================================================================= //
#?
#? DESCRIPTION
#?      This file is a copy from (30-mar-10):
#?          http://www.businessinfo.co.uk/labs/jsreg/JSReg.js
#?
#? VERSION
#?      @(#) JSReg.js 3.2 12/06/09 15:11:25
#?
#? AUTHOR
#?      17-jul-09 Achim Hoffmann, mailto: EnDe (at) my (dash) stp (dot) net
#?
 * ========================================================================= */

/*
 * JSReg
 * Version 3.8.0.12
 * BSD License Template
 *
 * Copyright (c) 2009, Gareth Heyes.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *        notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 *        copyright notice, this list of conditions and the following
 *        disclaimer in the documentation and/or other materials provided
 *        with the distribution.
 *     * Neither the name of Gareth Heyes nor the names of its
 *        contributors may be used to endorse or promote products derived
 *        from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
(function(){		
    var JSReg_Environment = function() {    	
        var msg = '', line, parseTree = [], protection = '$';
        function error(d){
            if (RegExp.lastMatch) {
                msg += '\n' + RegExp.lastMatch;
            }
            if (RegExp.lastParen) {
                msg += '\n' + RegExp.lastParen;
            }                          
            
            throw {
                description: d,
                msg: msg,
                line: line,
                parseTree: parseTree
            };
        }
        function objWhitelist(obj, list, noprototype) {          	
        	list = list.split(',');
        	for(var i=0;i<list.length;i++) {
        		var prop = list[i];
        		if(noprototype) {
        			obj[protection+prop+protection] = generateSafeFunc(obj, prop);
        		} else {
        			obj.prototype[protection+prop+protection] = generateSafeFunc(obj, prop);
        		}
        	}
        	return obj;
        }
        function constWhitelist(obj, list, transObj) {
        	list = list.split(',');
        	for(var i=0;i<list.length;i++) {
        		var prop = list[i];  
        		if(transObj) {
        			transObj[protection+prop+protection] = obj[prop];
        		} else {
        			obj[protection+prop+protection] = obj[prop];
        		}
        	}        	
        }
        function generateSafeFunc(obj, func, noArgsAllowed){
            var $window$ = generateSafeFunc[protection+'window'+protection];             
            return function(){
            	            	
            	if(typeof obj['window'] == 'undefined' && obj['window'] === obj) {            		            
            		return $window$;
            	}  
            	            	
                for (var j = 0; j < arguments.length; j++) {
                    if (arguments[j] === null) {
                        return $window$;
                    }
                }
                var that = this, args = arguments;
                if (!that[func] && obj !== window.window) {
                    return $window$;
                }
                var result;
                result = (obj === window ? window : that)[func].apply(that, args);
                var win = (function(){                    
                	return this;
                    
                })();
                if (result === win) {
                    return $window$;
                }                
                return result;
            };
        }
        	var newLines = /[\r\n]+/, 
			unicode = /\\u[0-9a-fA-F]{4}/, 
			natives = /(?:eval|setTimeout|setInterval|Function|window|alert)/, 
			endStatement = /(?:(?:^\s*|\s*$)|[,]|[;\n\r]+)/, spaces = /\s*/, 
			variable = new RegExp("(?:(?:[a-zA-Z$_]|" + unicode.source + ")(?:[a-zA-Z0-9_$]|(?:" + unicode.source + "))*)"), 
			operators = /(?:[!][=]{0,2}|[%][=]?|[&]{1,2}|[&][=]|[*][=]?|[+]{1,2}|[+][=]|[\-]{1,2}|[\-][=]|[\/][=]?|[<]{1,2}[=]?|[=]{1,3}|[>]{1,3}[=]?|[\^][=]?|[|][=]?|[|]{2})/, 
			functionCalls = new RegExp(spaces.source + '(?:' + variable.source + ')' + spaces.source + '[(]'), 
			functionDec = new RegExp(spaces.source + '(?:function' + spaces.source + '(?:' + variable.source + ')?)' + spaces.source + '[(](?:' + spaces.source + variable.source + spaces.source + ')?(?:[,]' + spaces.source + variable.source + spaces.source + ')*' + '[)]' + spaces.source + '[{]'), 
			statements = new RegExp('(?:(?:\\s+(?:in(?:stanceof)?)\\s+)|' + spaces.source + '\\b(?:this|Infinity|NaN|void|do|else|case|default|return|var|continue|undefined|null|new|typeof|throw|break|try|finally|true|false)\\b' + spaces.source + '|' + spaces.source + '\\b(?:if|else\\s' + spaces.source + 'if|with|switch|catch)\\b' + spaces.source + '[(])'), 
			objects = new RegExp('[.]?' + spaces.source + '(?:' + variable.source + '(?:[.]' + variable.source + ')*)'), 
			regexpObj = new RegExp("(?:[\\/](?:\\[(?:\\\\[\\]]|[^\\]])+\\]|\\\\[\\/]|[^\\/*])(?:\\[(?:\\\\[\\]]|[^\\]])+|\\\\[\\/]|[^\\/])*?[\\/](?:[gmi]*))"), 
			regexps = new RegExp('(?:' + endStatement.source + '|' + operators.source + '|[(]+)?' + spaces.source + regexpObj.source + spaces.source + '(?:' + endStatement.source + '|' + operators.source + '|[)]+|(?=' + spaces.source + '[\\[.\\}]))'), 
			strings = new RegExp("(?:(?:['](?:\\\\{2}|\\\\[']|\\\\[\\r\\n]|[^'])*['])|(?:[\"](?:\\\\{2}|\\\\[\"]|\\\\[\\r\\n]|[^\"])*[\"]))"), 						
			squareOpen = new RegExp(spaces.source+"[\\[]"),
			squareClose = new RegExp(spaces.source+"[\\]]"), 
			loops = new RegExp(spaces.source + '\\b(?:for|while)\\b' + spaces.source + '[\\(](?:' + strings.source + '|' + regexps.source + '|[\\(].*?[\\)]|[^\\(\\)])+' + spaces.source + '[\\)]?\\s*[\\{]?'), 
			numbers = new RegExp('(?:[0][xX][0-9a-fA-F]*)|(?:[0]|[1-9]\\d+)?(?:[.]?\\d+)+(?:[eE][+-]?\\d+)?'), 
			objectIdentifiers = new RegExp('[,\\{]' + spaces.source + '(?:' + strings.source + '|' + numbers.source + '|' + variable.source + ')' + spaces.source + '(?=[:])'), 
			inInstanceofOperator = new RegExp("\\s*in(?:stanceof)?(?=[\\/\\d\"'\\[\\s\\(\\{])"), 
			comments = new RegExp('(' + strings.source + '|' + numbers.source + '|' + regexpObj.source + '(?:' + operators.source + ')?(?![*\\/])' + '|' + spaces.source + "(?:[\\/](?:\\\\[\\/]|[^\\/*])(?:\\\\[\\/]|[^\\/])*?[\\/](?:[gmi]*))" + spaces.source + ')' + '|((?:^\s*[\\-]{2}[>]|[<][!][\\-]{2}).*(?=[\\r\\n]?)|[\\/]{2}.*(?=[\\r\\n]?))|([\\/][*](?:[\\s]|.)*?[*][\\/])', 'gm'), 
			mainRegExp = new RegExp('(' + newLines.source + ')|(' + loops.source + ')|(' + inInstanceofOperator.source + ')|' + '(' + statements.source + ')|(' + objectIdentifiers.source + ')|(' + strings.source + ')|' + '(' + regexps.source + ')|' + '(' + numbers.source + ')|' + '(' + squareOpen.source + ')|' + '(' + squareClose.source + ')|' + '(' + functionDec.source + ')|' + '(' + functionCalls.source + ')' + '|(' + objects.source + ')', 'g'), 
		Parser = function(){
            this.init();
        };       
        var allowedProperties = /\b(?:length|global|ignoreCase|input|multiline|source|lastIndex)\b/;
        Parser.prototype = {
            doc: null,
            win: null,
            windowExtensions: [],
            objectExtensions: [],
            debugObjects: {},
            extendObject: function(name, value) {
            	this.objectExtensions.push({
                    name: name,
                    value: value
                });
            },
            extendWindow: function(name, value){
                this.windowExtensions.push({
                    name: name,
                    value: value
                });
            },
            getWindow: function(){
                return this.win;
            },
            setDocument: function(obj){
                this.doc = obj;
            },
            setWindow: function(obj){
                this.win = obj;
            },
            addSymbol: function(symbol){
                if (new RegExp('^['+protection+']' + natives.source + '['+protection+']$').test(symbol)) {
                    return;
                }
                if (!new RegExp('^['+protection+']' + variable.source + '['+protection+']$').test(symbol)) {                	
                    error('Parser error:Invalid symbol');
                    return;
                }
                if (typeof this.symbolsMap[symbol] == "undefined") {
                    this.symbols.push(symbol);
                    this.symbolsMap[symbol] = true;
                }
            },
            setDebugObjects: function(obj){
                this.debugObjects = obj;
            },
            addGlobals: function(symbols){
                var code = '';
                for (var i = 0; i < symbols.length; i++) {
                    code += protection+'window'+protection+'.' + symbols[i] + '=' + symbols[i] + ';';
                }
                return code;
            },
            extractSymbols: function(code){
                if (this.symbols.length) {
                    var symbols = this.symbols;
                    if (symbols.length) {
                        var originalCode = code;
                        var symbolsList = [];
                        for (var i = 0; i < symbols.length; i++) {
                            var found = 0;
                            for (var j = 0; j < this.extractedSymbols.length; j++) {
                                if (this.extractedSymbols[j] == symbols[i]) {
                                    found = 1;
                                    break;
                                }
                            }
                            if (!found) {
                                symbolsList.push(symbols[i]);
                            }
                        }
                        if (symbolsList.length) {
                            code = 'var ' + symbolsList.join(',') + ';';
                            code += this.addGlobals(symbolsList) + '\n';
                            code += originalCode;
                            this.extractedSymbols.push(symbolsList);
                        }
                    }
                }
                return code;
            },
            init: function(){            	
                this.symbols = [];
                this.symbolsMap = {};
                this.extractedSymbols = [];
                this.maxLoops = 20;
                this.loopNumber = 0;
                this.maxFuncCalls = 20;
                parseTree = [];
            },
            removeComments: function(code){
                code = code.replace(comments, function($0, $1, $2){
                    if ($1 !== undefined && $1.length) {
                        return $1;
                    } else {
                        return '';
                    }
                });
                return code;
            },
            'eval': function(code, thisObject){               	            	            	           
                if (this.debugObjects.onStart) {
                    this.debugObjects.onStart();
                }
                parseTree = [];
                if (this.debugObjects.clearTree) {
                    this.debugObjects.clearTree();
                }               
                if (typeof thisObject == 'undefined') {
                    thisObject = {};
                }
                var that = this;
                var result;
                try {
                    execCode.apply(thisObject, []);
                } 
                catch (e) {
                    if (that.debugObjects.errorHandler) {
                        that.debugObjects.errorHandler(e, that);
                    }
                }                               
                
                function execCode() {                	                    
                	var freshWindow = that.environment.contentWindow;                	
                    arguments.callee.root = true;
                    var maxLoops = that.maxLoops;
                    var maxLoopCounter = 0;
                    var maxFuncCalls = that.maxFuncCalls;
                    var setTimeoutIDS = {};
                    var setIntervalIDS = {};
                    var JSREG_FUNC = {
                        'gp': function(){                      		
							var exp = arguments[arguments.length-1];							
							if(typeof exp == 'undefined') {
								return;
							}
							var contents = [].slice.call(arguments,0);
							if (/[^\d]/.test(exp) || exp === '') {
                                if (new RegExp("^" + allowedProperties.source + protection).test(exp)) {
                                    return exp;
                                }                                
                                return protection + exp + protection;
                            } else {                            	
                                return +exp;
                            }
                        },
                        getThis: function(obj){                         	                        	                        	
                        	if(typeof obj['window'] == 'undefined' && obj['window'] !== obj) {
                        		return obj;
                        	} else {
                        		return $window$;
                        	}                        	                           
                        },
                        checkMaxLoop: function(){
                            if (maxLoopCounter >= maxLoops) {
                                if (freshWindow.confirm('This script is looping a lot, click ok to stop the loop.')) {
                                    error("Parser error: Maximum amount of loops hit.");
                                    return false;
                                } else {
                                    maxLoopCounter = 0;
                                    return true;
                                }
                            } else {
                                maxLoopCounter++;
                                return true;
                            }
                        },
                        checkMaxFunctCalls: function(funct){
                            var Static;
                            if (Static === undefined) {
                                Static = {};
                            }
                            Static = funct || arguments.callee.caller;
                            Static.counter = ++Static.counter || 1;
                            if (Static.counter > maxFuncCalls) {
                                if (freshWindow.confirm('A function is recuring often, click ok to stop the function.')) {
                                	freshWindow = null;
                                	error("Parser error: Maximum amount of function calls hit.");                                	
                                	return false;
                                } else {                                	
                                	Static.counter = 0;
                                    return true;
                                }
                            } else {
                                return true;
                            }
                        }
                    };                                  
                    
                    var $document$ = {}, $window$ = {};
                    generateSafeFunc.$window$ = $window$; 
                    
                    var $Function$ = function(){
                        if(!JSREG_FUNC.checkMaxFunctCalls()) {
                        	return;
                        }
                        var func;
                        var parser = that;
                        var converted = "func=" + parser.rewrite(freshWindow.Function.apply(this, arguments) + '');
                        parser.checkSyntax(converted);
                        converted = parser.removeComments(converted);
                        converted = parser.extractSymbols(converted);
                        if (parser.debugObjects.functionCode) {
                            parser.debugObjects.functionCode(converted);
                        }
                        if (parser.debugObjects.doNotFunctionEval) {
                            return converted;
                        } else {
                            return eval(converted);
                        }
                    };
                    $Function$.$constructor$ = $Function$;
                    $window$.$Function$ = $Function$;
                    
                    var Object = freshWindow.Object;
                    Object.$constructor$ = $Function$;
                    Object.prototype.$constructor$ = Object;
                    Object.prototype.$hasOwnProperty$ = function(prop){
                        return this.hasOwnProperty(protection + prop + protection);
                    };
                    Object.prototype.$valueOf$ = generateSafeFunc(freshWindow.Object, 'valueOf');
                    Object.prototype.$toString$ = generateSafeFunc(freshWindow.Object, 'toString');
                    
                    Object.prototype.JSREG_ITEM = function() {
                    	var val = this.toString();
                        if (/[^\d]/.test(val)) {
                            return '$' + val + '$';
                        } else {
                            return +val;
                        }                    	
                    }
                    var $Object$ = Object;
                    $window$.$Object$ = $Object$;
                    
                    var $Error$ = freshWindow.Error;
                    
                    var Boolean = freshWindow.Boolean;
                    Boolean.$constructor$ = $Function$;
                    Boolean.prototype.$constructor$ = Boolean;
                    var $Boolean$ = Boolean;
                    $window$.$Boolean$ = $Boolean$;
                    
                    var Function = freshWindow.Function;
                    Function.prototype.$constructor$ = $Function$;
                    Function.prototype.$call$ = generateSafeFunc(freshWindow.Function, 'call');
                    Function.prototype.$apply$ = generateSafeFunc(freshWindow.Function, 'apply');
                                        
                    var String = objWhitelist(freshWindow.String,'charAt,charCodeAt,concat,indexOf,lastIndexOf,localeCompare,match,replace,search,slice,split,substr,substring,toLocaleLowerCase,toLocaleString,toLocaleUpperCase,toLowerCase,toUpperCase');
                    String.$fromCharCode$ = generateSafeFunc(freshWindow.String, 'fromCharCode');
                    String.prototype.$constructor$ = String;
                    String.$constructor$ = $Function$;                    
                    var $String$ = String;
                    $window$.$String$ = $String$;
                                        
                    var Array = objWhitelist(freshWindow.Array,'sort,join,pop,push,reverse,shift,slice,splice,unshift,concat');                    
                    Array.prototype.$constructor$ = Array;
                    Array.$constructor$ = $Function$;                    
                    var $Array$ = freshWindow.Array;
                    $window$.$Array$ = $Array$;
                                        
                    var RegExp = objWhitelist(freshWindow.RegExp,'compile,exec,test');
                    RegExp.prototype.$constructor$ = RegExp;
                    RegExp.prototype.$prototype$ = RegExp.prototype;
                    RegExp.$lastMatch$ = RegExp.lastMatch;
                    RegExp.$lastParen$ = RegExp.lastParen;
                    RegExp.$leftContext$ = RegExp.leftContext;
                    RegExp.$rightContext$ = RegExp.rightContext;
                    RegExp.$constructor$ = $Function$;                    
                    var $RegExp$ = RegExp;
                    $window$.$RegExp$ = $RegExp$;
                                        
                    var Number = objWhitelist(freshWindow.Number,'toExponential,toFixed,toPrecision');
                    constWhitelist(Number, 'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY');                                      
                    Number.$constructor$ = $Function$;
                    var $Number$ = Number;
                    $window$.$Number$ = $Number$;
                                        
                    var Date = objWhitelist(freshWindow.Date,'getDate,getDay,getFullYear,getHours,getMilliseconds,getMinutes,getMonth,getSeconds,getTime,getTimezoneOffset,getUTCDate,getUTCDay,getUTCFullYear,getUTCHours,getUTCMilliseconds,getUTCMinutes,getUTCMonth,getUTCSeconds,getYear,setDate,setFullYear,setHours,setMilliseconds,setMinutes,setMonth,setSeconds,setTime,setUTCDate,setUTCFullYear,setUTCHours,setUTCMilliseconds,setUTCMinutes,setUTCMonth,setUTCSeconds,setYear,toDateString,toGMTString,toLocaleDateString,toLocaleString,toLocaleTimeString,toTimeString,toUTCString');                    
                    Date.prototype.$constructor$ = Date;
                    Date.$constructor$ = $Function$;
                    var $Date$ = Date;
                    $window$.$Date$ = $Date$;                    
                    var Math = objWhitelist(freshWindow.Math,'abs,acos,asin,atan,atan2,ceil,cos,exp,floor,log,max,min,pow,random,round,sin,sqrt,tan', true);
                    constWhitelist(Math, 'E,LN10,LN2,LOG10E,LOG2E,PI,SQRT1_2,SQRT2');                                                                                                  
                    Math.$constructor$ = Object;
                    var $Math$ = Math;
                    $window$.$Math$ = $Math$;                    
                    constWhitelist(freshWindow,'decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,escape,isFinite,isNaN,parseFloat,parseInt,unescape', $window$);                    
                    var $clearInterval$ = function(id){
                    	if(!JSREG_FUNC.checkMaxFunctCalls()) {
                        	return;
                        }
                        id = +id;
                        if (typeof setIntervalIDS[id] == 'undefined') {
                            return null;
                        }
                        return freshWindow.clearInterval(id);
                    };
                    $window$.$clearInterval$ = $clearInterval$;
                    var $clearTimeout$ = function(id){
                    	if(!JSREG_FUNC.checkMaxFunctCalls()) {
                        	return;
                        }
                        id = +id;
                        if (typeof setTimeoutIDS[id] == 'undefined') {
                            return null;
                        }
                        return freshWindow.clearTimeout(id);
                    };
                    $window$.$clearTimeout$ = $clearTimeout$;
                    var $setTimeout$ = function(func, time){
                    	if(!JSREG_FUNC.checkMaxFunctCalls()) {
                        	return;
                        }
                        time = +time;
                        if (time && time >= 0) {
                            if (typeof func !== 'function') {
                                func = $Function$(func);
                            }
                            var id = +freshWindow.setTimeout(func, time);
                            setTimeoutIDS[id] = true;
                            return id;
                        } else {
                            error("Parser error:Incorrect second arguments supplied.");
                        }
                    };                    
                    $window$.$setTimeout$ = $setTimeout$;
                    var $setInterval$ = function(func, time){
                    	if(!JSREG_FUNC.checkMaxFunctCalls()) {
                        	return;
                        }
                        time = +time;
                        if (time && time >= 0) {
                            if (typeof func !== 'function') {
                                func = $Function$(func);
                            }
                            var id = +freshWindow.setInterval(func, time);
                            setIntervalIDS[id] = true;
                            return id;
                        } else {
                            error("Parser error:Incorrect second arguments supplied.");
                        }
                    };
                    $window$.$setInterval$ = $setInterval$;
                    var $alert$ = function(str){
                    	if(!JSREG_FUNC.checkMaxFunctCalls()) {
                        	return;
                        }
                        freshWindow.alert(str);
                    };
                    $window$.$alert$ = $alert$;
                    var $eval$ = function(str){
                    	if(!JSREG_FUNC.checkMaxFunctCalls()) {
                        	return;
                        }
                        var parser = that;
                        if (typeof str == 'string') {
                            var converted = parser.rewrite(str);
                            converted = parser.removeComments(converted);
                            parser.checkSyntax(converted);
                        } else {
                            converted = str;
                        }
                        converted = parser.extractSymbols(converted);
                        if (parser.debugObjects.evalCode) {
                            parser.debugObjects.evalCode(converted);
                        }
                        if (parser.debugObjects.evalCode) {
                            parser.debugObjects.evalCode(converted);
                        }
                        
                        if (parser.debugObjects.doNotEval) {
                            return converted;
                        } else {
                            with ($window$) {
                                converted = eval(converted);
                            }
                            return converted;
                        }
                    };
                    $window$.$eval$ = $eval$;                    
                    if (that.doc) {
                        $document$ = that.doc;
                    }
                    if (that.win) {
                        $window$ = that.win;
                    }
                    
                    for (var i = 0; i < that.windowExtensions.length; i++) {
                        var winProp = that.windowExtensions[i];
                        $window$[winProp.name] = winProp.value;
                    }
                    for (var i = 0; i < that.objectExtensions.length; i++) {
                        var objProp = that.objectExtensions[i];
                        Object.prototype[objProp.name] = objProp.value;
                    }
                    winProp = null;
                    
                    that.code = code;
                    code = that.removeComments(code);
                    if (that.debugObjects.converted) {
                        that.debugObjects.converted(code);
                    }
                    that.checkSyntax(code);
                    var converted = that.rewrite(code);
                    if (that.debugObjects.converted) {
                        that.debugObjects.converted(converted);
                    }
                    that.checkSyntax(converted);
                    converted = that.extractSymbols(converted);
                    if (that.debugObjects.converted) {
                        that.debugObjects.converted(converted);
                    }
                    var undefined = freshWindow.undefined;
                    var NaN = freshWindow.NaN;
                    var Infinity = freshWindow.Infinity;
                    var __this__ = $window$;                    
                    if (that.debugObjects.doNotMainEval) {
                        result = converted;
                    } else {
                    	
                    	if($window$['window'] === $window$) {
                    		error("Window is leaking");
                    	}
                    	
                        with ($window$) {
                            result = eval(converted);
                        }
                    }
                    if (that.debugObjects.parseTree) {
                        that.debugObjects.parseTree(parseTree);
                    }
                    if (that.debugObjects.result) {
                        that.debugObjects.result(result);
                    }
                    that.setWindow($window$);
                };
                if (that.debugObjects.onComplete) {
                    that.debugObjects.onComplete();
                }
               
                return result;
            },
            rewriteFilters: {
            		functionCalls:function($functionCalls) {            	
		            	parseTree.push("Function calls(" + $functionCalls + ")");
		                $functionCalls = $functionCalls.replace(new RegExp('(' + unicode.source + ')', 'g'), function(m){
		                    return String.fromCharCode(parseInt(m.replace(/\\u/, ''), 16));
		                });
		                $functionCalls = $functionCalls.replace(new RegExp(spaces.source, 'g'), '');
		                var funcName = protection + $functionCalls.slice(0, -1).replace(new RegExp(spaces.source, 'g'), '') + protection;
		                this.addSymbol(funcName);
						this.rewrite.previousMatch = 'functionCalls';
		                return funcName + '(';
            		}
            },
            rewrite: function rewrite(code){
                var that = this;
                var converted = code.replace(mainRegExp, function($0, $newLines, $loops, $inInstanceofOperator, $statements, $objectIdentifiers, $strings, $regexps, $numbers, $squareOpen, $squareClose, $functionDec, $functionCalls, $objects){
					if ($functionCalls !== undefined && $functionCalls.length) {                        
						return that.rewriteFilters['functionCalls'].apply(that,[$functionCalls]);
                    } else if ($functionDec !== undefined && $functionDec.length) {
                        parseTree.push("Function Declarations(" + $functionDec + ")");                        
						$functionDec = $functionDec.replace(new RegExp('^(' + spaces.source + 'function' + spaces.source + ')(' + variable.source + ')?(' + spaces.source + '[(].+)'), function($0, funcStatement, funcName, funcEnd){
                            if (funcName !== undefined && funcName.length) {
                                funcName = protection + funcName + protection;
                                that.addSymbol(funcName);
                            } else {
                                funcName = '';
                            }
                            if (funcEnd != '(){') {
                                funcEnd = that.rewrite(funcEnd);
                            }
                            return funcStatement + funcName + funcEnd;
                        });
						rewrite.previousMatch = 'functionDec';
                        return $functionDec + 'if(!JSREG_FUNC.checkMaxFunctCalls()){return false};var __this__=JSREG_FUNC.getThis(this);var $arguments$=[].slice.call(arguments,0);';
                    } else if ($newLines !== undefined && $newLines.length) {                        
						parseTree.push("New lines");
						rewrite.previousMatch = 'newLines';
                        return $newLines;
					} else if ($squareOpen !== undefined && $squareOpen.length) {
                        parseTree.push("Square open(" + $squareOpen + ")");                        																						
						rewrite.previousMatch = 'squareOpen';
						return $squareOpen + 'JSREG_FUNC.gp(';
                    } else if ($squareClose !== undefined && $squareClose.length) {
                        parseTree.push("Square close(" + $squareClose + ")");                        																						
						rewrite.previousMatch = 'squareClose';
						return  ')' + $squareClose;						
                    } else if ($inInstanceofOperator !== undefined && $inInstanceofOperator.length) {
                        parseTree.push("in/instanceof Operator(" + $inInstanceofOperator + ")");
                        rewrite.previousMatch = 'inInstanceofOperator';
						return $inInstanceofOperator.replace(/(.*)(in(?:stanceof)?)/, function($0, $1, $2){
                            if ($2 == 'instanceof') {
                                return $1 + ' ' + $2;
                            } else {
                                return $1 + '.JSREG_ITEM()' + $2 + ' ';
                            }
                        });
                    } else if ($objectIdentifiers !== undefined && $objectIdentifiers.length) {
                        parseTree.push("Object identifiers(" + $objectIdentifiers + ")");
                        $objectIdentifiers = $objectIdentifiers.replace(new RegExp('([{,]' + spaces.source + ')(' + strings.source + '|' + numbers.source + '|' + variable.source + ')(' + spaces.source + ')'), function($0, $start, $ident, $end){
                            if (/[^\d]/.test($ident)) {
                                if (new RegExp('^' + spaces.source + variable.source + spaces.source + protection).test($ident)) {
                                    $ident = $ident.replace(new RegExp('(' + unicode.source + ')', 'g'), function(m){
                                        return String.fromCharCode(parseInt(m.replace(/\\u/, ''), 16));
                                    });
                                    if (!allowedProperties.test($ident)) {
                                        $ident = protection + $ident + protection;
                                    }
                                } else {
                                    $ident = $ident.split('');
                                    $ident[1] = protection + $ident[1];
                                    $ident[$ident.length - 1] = protection + $ident[$ident.length - 1];
                                    $ident = $ident.join('');
                                }
                            } else {
                                $ident = +$ident;
                            }
							rewrite.previousMatch = 'objectIdentifiers';
                            return $start + $ident + $end;
                        });
                        return $objectIdentifiers;
                    } else if ($numbers !== undefined && $numbers.length) {
                        parseTree.push("Numbers(" + $numbers + ")");
                        rewrite.previousMatch = 'numbers';
						return $numbers;                        
                    } else if ($loops !== undefined && $loops.length) {						
                        parseTree.push("Loops(" + $loops + ")");
                        $loops = $loops.replace(new RegExp(spaces.source + '\\b(for|while)\\b' + spaces.source + '[(](.*)[)]' + spaces.source + '([{}]?)'), function($0, type, statement, brace){
                            var a, b, c = '';                            
                            var matches = 0;
                            var converted = '';
                            if (type == 'for') {
                                var forLoop = new RegExp('^' + spaces.source + '((?:' + strings.source + '|' + regexps.source + '|[^;])*?)[;]' + spaces.source + spaces.source + '((?:' + strings.source + '|' + regexps.source + '|[^;])*?)[;]' + spaces.source + spaces.source + '((?:' + strings.source + '|' + regexps.source + '|[^;])*?)' + spaces.source + protection);
                                if (!forLoop.test(statement)) {
                                    var replacedStatement = '';
                                    statement.replace(new RegExp("((?:var\\s+)?[\\s\\(]*(?:" + variable.source + ")[\\)\\s]+)in(.+)"), function($0, prop, obj){
                                        replacedStatement = that.rewrite(prop) + ' in ' + that.rewrite(obj);
                                    });
                                    if (replacedStatement == '') {
                                        error('Parser error:Failed to match for..in loop');
                                    }
                                    var replacement = '';
                                    statement = 'for(' + replacedStatement + ')' + brace;                                    
                                    statement.replace(new RegExp("^for\\((?:var\\s+)?.*?(" + variable.source + ").*?\\sin\\s"), function($0, variable){
                                        if (/^[$]/.test(variable) && /[$]$/.test(variable)) {
                                            replacement = variable + "=(" + variable + "+'').replace(/^[$]/,'').replace(/[$]$/,'');\n";
                                        }
                                    });
                                    statement += replacement;
                                    return statement;
                                }                                
                                statement.replace(forLoop, function($0, s1, s2, s3){
                                    a = that.rewrite(s1);
                                    b = that.rewrite(s2);
                                    c = that.rewrite(s3);
                                });
                                statement = that.rewrite(statement);                                                                                                                                                               
                                converted = 'for(' + statement + ')' + brace;
                            } else {                                
                                statement = that.rewrite(statement);
                                converted = 'while(' + statement + ')' + brace;
                            }
                            that.loopNumber++;
                            return converted;
                        });
						rewrite.previousMatch = 'loops';
                        return $loops;
                    } else if ($statements !== undefined && $statements.length) {
                        parseTree.push("Statements(" + $statements + ")");
                        rewrite.previousMatch = 'statements';
						if (/\s*this\s*/.test($statements)) {
                            return '__this__';
                        }
                        return $statements + ' ';
                    } else if ($regexps !== undefined && $regexps.length) {                        
                    	parseTree.push("RegExps(" + $regexps + ")");
                    	rewrite.previousMatch = 'regexps';
                    	return $regexps;                    							                      
                    } else if ($strings !== undefined && $strings.length) {
                        parseTree.push("Strings(" + $strings + ")");
                        return $strings;                        
                    } else if ($objects !== undefined && $objects.length) {
                        parseTree.push("Objects(" + $objects + ")");
                        $objects = $objects.replace(/([\\]u[0-9a-f]{4})/g, function(m){
                            return String.fromCharCode(parseInt(m.replace(/\\u/, ''), 16));
                        });
                        var beginDot = /^\s*[.]/.test($objects);
                        if (beginDot) {
                            $objects = $objects.replace(/^(\s*)[.]/, '$1');
                        }
                        $objects = $objects.split('.');
                        for (var i = 0; i < $objects.length; i++) {
                            if (i == 0) {
                                if ($objects[i].replace(/[\s\n]/g, '') == 'this' && $objects.length > 1) {
                                    $objects[i] = '__this__';
                                    continue;
                                }
                                var objName = protection + $objects[i].replace(new RegExp(spaces.source, 'g'), '') + protection;
                                if (!beginDot) {
                                    that.addSymbol(objName);
                                }
                                $objects[i] = objName;
                            } else {
                                if (allowedProperties.test($objects[i].replace(/[\s\n]/g, ''))) {
                                    $objects[i] = $objects[i].replace(/[\s\n]/g, '');
                                    continue;
                                }
                                $objects[i] = protection + $objects[i].replace(new RegExp(spaces.source, 'g'), '') + protection;
                            }
                        }
                        $objects = $objects.join(".");
                        if (beginDot) {
                            if (new RegExp('^[$]' + allowedProperties.source + '[$]$').test($objects)) {
                                $objects = $objects.replace(/[\s\n]/g, '');
                                $objects = $objects.replace(/^[$]|[$]$/g, '');
                            }
                            $objects = '.' + $objects;
                        }
                        return $objects;
                    } else {
                        return $0;
                    }
                });
                return converted;
            },
            checkSyntax: function(code){            	
                try {
                    throw new Error()
                } 
                catch (e) {
                    var relativeLineNumber = e.lineNumber
                }
                try {
                    code = new Function(code);
                } 
                catch (e) {                	
                    msg = e.message;
                    line = (e.lineNumber - relativeLineNumber - 1);
                    error("Syntax error");
                }
            },
            runCheck: function(){
                this.assert(this.removeComments('//test'), '', 1);
                this.assert(this.removeComments('//test\n'), '\n', 2);
                this.assert(this.removeComments('<!--test'), '', 3);
                this.assert(this.removeComments('<!--test\n'), '\n', 4);
                this.assert(this.removeComments('/*\n\r\t test*/'), '', 5);
                this.assert(this.removeComments('(/**/2+2/**/);'), '(2+2);', 6);                                             
                this.assert(this.rewrite("alert(1)"), "$alert$(1)", 11);                                
            },
            assert: function(op1, op2, id){
                if (op1 != op2) {
                    id = +id;
                    var msg = 'result:\n' + op1 + '\n' + 'expected:\n' + op2 + '\nid:\n' + id;
                    if (this.debugObjects.errorLog) {
                        this.debugObjects.errorLog(msg);
                    } else {                    
                        alert(msg);
                    }
                    
                    error("Parser error:Something went wrong. The RegExps are allowing data they shouldn't");
                }
                this.init();
            }
        };
        
        return new Parser;
    };
    window.JSReg = {
        create: function(callback){    	    	    		
	    	var iframe = document.createElement('iframe');
	        iframe.style.width = '1px';
	        iframe.style.height = '1px';
	        iframe.frameborder = "0";
	        iframe.style.position = 'absolute';
	        iframe.style.left = '-100px';
	        iframe.style.top = '-100px';
	        document.body.appendChild(iframe);
	        var code = "(function(JSREG){ return window.JSReg = JSREG();})(" + JSReg_Environment + ")";
	        if (window.opera) {
	            iframe.contentWindow.Function(code)();
	        } else {
	        	iframe.contentWindow.document.open();
	            iframe.contentWindow.document.write('<script type="text/javascript">' + code + '<\/script>');
	            iframe.contentWindow.document.close();
	        }
	        var obj = iframe.contentWindow.JSReg;
	        if (!obj) {
	            iframe.contentWindow.Function(code)();
	            obj = iframe.contentWindow.JSReg;
	        }
	        obj.environment = iframe;
	        return obj;
        }        
    };
    
})();
