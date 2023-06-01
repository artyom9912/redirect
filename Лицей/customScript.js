var interval = undefined;
var isActionRequestsSend = false;
var promoMakeRedirect =
    function (externalUrl) {
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;
        var isAndroid = new RegExp(/android/, 'i').test(userAgent);
        var isRefferrerIsSame = document.referrer.indexOf(window.location.host) !== -1;
        if (typeof externalUrl === 'string' && externalUrl.length > 0) {
            if (isAndroid) {
                document.location = externalUrl;
            } else {
                window.location.replace(externalUrl);
            }
        } else if (!isRefferrerIsSame && history.length > 1) {
            history.go(-1);
        } else {
            window.open('', '');
            window.close();
        }
    }

var promoGetCookie = function (key) {
    if (typeof key === 'string' && key.length > 0) {
        var cookie = document.cookie;
        if (!cookie) {
            return null;
        }
        var obj = cookie.split(';').map(item => item.trim()).reduce((result, item) => {
            var [k, v] = item.split('=');
            return Object.assign({}, result, {[k]: v});
        }, {});
        return obj[key];
    }
    return null;
}
var promoDeleteCookie = function (key) {
    if (typeof key === 'string' && key.length > 0) {
        document.cookie = key +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
}
var promoMakeRequest = function (promoPageViewId, url, callback, data) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/promopageview/' + promoPageViewId + '/' + url);
    xhr.timeout = 10000;
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
    xhr.onload = function() {
        if (typeof callback === 'function') {
            callback(xhr.status);
        } else {
            promoMakeRedirect();
        }
    }
    xhr.ontimeout = function() {
        promoMakeRedirect();
    }
    xhr.onerror = function() {
        promoMakeRedirect();
    }
}
var promoMakeIsAliveRequest = function (promoPageViewId) {
    promoMakeRequest(promoPageViewId, 'isAlive', function (status) {
        if (status === 404 ||status === 409) {
            clearInterval(interval);
            promoDeleteCookie('rtk_redirect_session_id');

            if (!isActionRequestsSend) {
                promoMakeRedirect();
            }
        }
    })
}
var promoMakeActionRequest = function (promoPageViewId, url, callback, data) {
    if (!isActionRequestsSend) {
        isActionRequestsSend = true;
        clearInterval(interval);

        promoMakeRequest(promoPageViewId, url, function (status) {
            if (typeof callback === 'function' && status === 200) {
                callback(status);
            }

        }, data)
    }
}
var promoIsAlive = function (promoPageViewId) {
    interval = setInterval(function loop() {
        promoMakeIsAliveRequest(promoPageViewId, 'isAlive');
        return loop;
    }(), 5000);
}
var promoInit = function () {
    var promoPageViewId = promoGetCookie('rtk_redirect_session_id')
    if (typeof promoPageViewId === 'string' && promoPageViewId.length > 0) {
        promoIsAlive(promoPageViewId);
    }
}
var promoClick = function (actionId, callback, data) {
    var promoPageViewId = promoGetCookie('rtk_redirect_session_id')
    if (typeof promoPageViewId === 'string' && promoPageViewId.length > 0) {
        promoMakeActionRequest(promoPageViewId, 'button/' + actionId, callback, data);
    }
}

// SEND ISALIVE
promoInit();

// CLOSE FUNCTION
var closeHandler = function() {
    var promoPageViewId = promoGetCookie('rtk_redirect_session_id')
    if (typeof promoPageViewId === 'string' && promoPageViewId.length > 0) {
        promoMakeActionRequest(promoPageViewId, 'closed', function() {
            promoMakeRedirect();
        });
    }
}

var promoGetInitialParams = function(buttonId) {
    let params = promoGetCookie('rtk_redirect_initial_params')

    if (params) {
        let decoded = decodeURIComponent(params)
        params = JSON.parse(decoded);
    }

    if (params[buttonId]) {
        return params[buttonId];
    }

    return {};
}
// CLICK HANDLERS
    var clickHandlers = [
{
   meta: 'Смена ТП',
   
    buttonId: 3530,
   
    initialParams: promoGetInitialParams(3530),
   
    callback: function(callback) {
        promoClick(3530, function() {
            promoMakeRedirect();
        });
    }
       
},
{
    meta: 'Отказаться',
   
    buttonId: 3531,
   
    initialParams: promoGetInitialParams(3531),
   
    callback: function() {
        promoClick(3531, function() {
            promoMakeRedirect();
        });
    }
       
},
]