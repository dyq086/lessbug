/*
 * @Author: yongqing
 * @Date:   2019-07-01 17:34:55
 * @Last Modified by:   yongqing
 * @Last Modified time: 2019-07-18 15:53:22
/**
 * 发送数据
 * @param  {[type]} url    [description]
 * @param  {[type]} params [description]
 * @return {[type]}        [description]
 */
export const sendData = function(url, params) {
    if (window.XMLHttpRequest) {
        var xhr = new XMLHttpRequest();
        xhr.open('post', url, true); // 上报给node中间层处理
        xhr.setRequestHeader('Content-Type', 'application/json'); // 设置请求头
        xhr.send(JSON.stringify(params)); // 发送参数
    }
}