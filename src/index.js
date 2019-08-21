/*
 * @Author: yongqing
 * @Date:   2019-05-30 09:43:35
 * @Last Modified by:   yongqing
 * @Last Modified time: 2019-08-21 12:24:17
 */

import { sendData } from './sdk/utils'
import catchError from './sdk/catch-error'
import performance from './sdk/performance';
const MobileDetect = require('mobile-detect');
const md = new MobileDetect(navigator.userAgent);
const defaultHost = (process.env.NODE_ENV === 'development' ? 'http://localhost:7001' : 'http://api-monitor.dyq086.cn');
const extend = require('lodash/extend');

/**
 * 获取地理位置信息
 * @type {[type]}
 */
var _hmt = _hmt || [];
(function() {
    var hm = document.createElement("script");
    hm.src = "http://pv.sohu.com/cityjson?ie=utf-8";
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(hm, s);
    hm.onload = function(e) {}
})();

const lessBug = {
    install(Vue, option) {
        this.initCatchError(Vue, option);
    },
    init(option) {
        this.initCatchError(null, option)
    },
    initCatchError(Vue, option) {
        catchError.init({
            url: `${option.host}/api/v1/report_js_error`,
            jsError: true,
            vueError: true,
            resourceError: true,
            ajaxError: true,
            filters: ['sockjs-node', '/api/v1/report_js_error'], // 过滤器，命中的不上报
            category: ['js', 'resource', 'ajax'],
            callback: this.sendMiddleware,
            $vue: Vue
        });
    },
    /**
     * 发送数据处理
     * @param  {[type]} data   [description]
     * @param  {[type]} config [description]
     * @return {[type]}        [description]
     */
    sendMiddleware(data, config) {
        let flag = config.filters.some((item) => {
            return JSON.stringify(data).indexOf(item) > -1
        })
        if (flag) {
            return;
        }
        let {
            name,
            type,
            message,
            script_URI,
            line_no,
            column_no,
            stack,
            category,
            title,
            response,
            responseURL,
            status,
            statusText,
        } = data;
        let cityjson = {};
        if (typeof returnCitySN == 'object') {
            cityjson = returnCitySN;
        }

        let { language } = window.navigator || {}
        //获取手机系统信息
        let props = {
            title: document.title,
            referrer: document.referrer,
            origin: window.location.origin,
            mobile: md.mobile(),
            userAgent: md.ua,
            os: md.os(),
            version: (md.os() == "iOS" ? md.version('iPhone') : md.version('Android')),
            cookies: document.cookie,
            winWith: window.screen.width,
            windHeight: window.screen.height,
            language,
            time: +new Date(),
            env: process.env.NODE_ENV
        }
        let params = extend(data, props, cityjson);
        sendData(config.url, params)

    }
}


export default lessBug;