/*
 * @Author: yongqing
 * @Date:   2019-07-01 17:19:55
 * @Last Modified by:   yongqing
 * @Last Modified time: 2019-07-18 16:26:41
 */

/**
 * 异常抛出处理模块
 * @type {Object}
 */
//全局window 缓存避免受污染
let _window =
    typeof window !== 'undefined' ?
    window :
    typeof global !== 'undefined' ?
    global :
    typeof self !== 'undefined' ?
    self : {};
import { getTagAttributes } from './utils'
const isFunction = require('lodash/isFunction');
const assignIn = require('lodash/assignIn');


const handleError = (function(_win) {
    return {
        init(options) {
            let defaultConfig = {
                url: '',
                jsError: true,
                resourceError: true,
                ajaxError: true,
                vueError: true,
                consoleError: false, // console.error默认不处理
                scriptError: false, // 跨域js错误，默认不处理，因为没有任何信息
                autoReport: true,
                filters: [], // 过滤器，命中的不上报
                category: ['js', 'resource', 'ajax'],
                callback: function(data) {

                }
            }
            let config = assignIn(defaultConfig, options);
            if (config.jsError) {
                _hanlderWindowError(config);
            }

            if (config.vueError) {
                _hanlderVueError(config);
            }

            if (config.resourceError) {
                _hanlderReourceError(config);

            }
            if (config.ajaxError) {
                _handleAjaxError(config);
            }
        }
    }


    /**
     * 处理window.error异常
     * @return {[type]} [description]
     */
    function _hanlderWindowError(config) {
        let windowError = _win.onerror;
        _window.onerror = function(errorMessage, scriptURI, lineNo, columnNo, error) {
            let key = errorMessage.match(/(\w+)/g) || []
            let errorObj = {
                name: key.length > 0 && key[0],
                type: key.length > 1 && key[1],
                message: errorMessage || null,
                script_URI: scriptURI || null,
                line_no: lineNo || null,
                column_no: columnNo || null,
                stack: error && error.stack ? error.stack : null,
                category: 'js'

            };
            config.callback.call(this, errorObj, config);
            windowError && windowError.apply(this, arguments)
        }
    }

    /**
     * 处理vue错误
     * @param  {[type]} config [description]
     * @return {[type]}        [description]
     */
    function _hanlderVueError(config) {
        const vue = _win.Vue || config.$vue;
        if (!vue || !vue.config) {
            return false;
        }
        const _oldVueError = vue.config.errorHandler;
        vue.config.errorHandler = function(error, vm, info) {
            let {
                message, // 异常信息
                name, // 异常名称
                script, // 异常脚本url
                line, // 异常行号
                column, // 异常列号
                stack // 异常堆栈信息
            } = error;
            let key = message.match(/(\w+)/g) || []
            let errorObj = {
                name: key.length > 0 && key[0],
                type: key.length > 1 && key[1],
                message: message || null,
                script_URI: script || null,
                line_no: line || null,
                column_no: column || null,
                stack: stack || null,
                category: 'js'

            };
            console.error(error);
            config.callback.call(this, errorObj, config);
            if (_oldVueError && isFunction(_oldVueError)) {
                _oldVueError.call(this, error, vm, info);
            }
        }
    }

    /**
     * 资源加载错误
     * @return {[type]} [description]
     */
    function _hanlderReourceError(config) {
        window.addEventListener('error', function(event) {
            if (event) {
                let target = event.target || event.srcElement;
                let isElementTarget = target instanceof HTMLScriptElement || target instanceof HTMLLinkElement || target instanceof HTMLImageElement;
                if (!isElementTarget) return; // js error不再处理
                let url = target.src || target.href;
                let errorObj = {
                    message: target.outerHTML,
                    resource_url: url,
                    category: 'resource'
                }
                config.callback.call(this, errorObj, config);

            }
        }, true) //捕获
    }

    function _handleAjaxError(config) {
        var xmlhttp = _window.XMLHttpRequest;
        var _oldSend = xmlhttp.prototype.send;
        var _handleEvent = function(event, arg) {
            if (event && event.currentTarget && (event.currentTarget.status !== 200)) {
                let request = {};
                if (arg && arg.length > 0) { //为POST 方法
                    request = {
                        methods: 'POST',
                        url: event.target.responseURL,
                        body: arg
                    }
                } else {
                    request = {
                        methods: 'GET',
                        url: event.target.responseURL,
                    }
                }
                const errorObj = {
                    message: event.target.responseURL,
                    response: {
                        response: event.target.response,
                        responseURL: event.target.responseURL,
                        status: event.target.status,
                        statusText: event.target.statusText,
                    },
                    request,
                    category: 'ajax'
                };
                if (event.target.responseURL) {
                    config.callback.call(this, errorObj, config);
                }
            }
        }
        xmlhttp.prototype.send = function() {
            let arg = arguments;
            if (this['addEventListener']) {
                this['addEventListener']('error', (e) => _handleEvent(e, arg[0]))
                this['addEventListener']('load', (e) => _handleEvent(e, arg[0]));
                this['addEventListener']('abort', (e) => _handleEvent(e, arg[0]));
            } else {
                var _oldStateChange = this['onreadystatechange'];
                this['onreadystatechange'] = function(event) {
                    if (this.readyState === 4) {
                        _handleEvent(event);
                    }
                    _oldStateChange && _oldStateChange.apply(this, arguments);
                };
            }
            return _oldSend.apply(this, arguments);
        }

    }

})(_window)

export default handleError