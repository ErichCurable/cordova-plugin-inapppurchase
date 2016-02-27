'use strict';

/*!
 *
 * Author: Alex Disler (alexdisler.com)
 * github.com/alexdisler/cordova-plugin-inapppurchase
 *
 * Licensed under the MIT license. Please see README for more information.
 *
 */

var utils = {};

utils.errors = {
  101: 'invalid argument - productIds must be an array of strings',
  102: 'invalid argument - productId must be a string'
};

utils.validArrayOfStrings = function (val) {
  return val && Array.isArray(val) && val.length > 0 && !val.find(function (i) {
    return !i.length || typeof i !== 'string';
  });
};

utils.validString = function (val) {
  return val && val.length && typeof val === 'string';
};
'use strict';

/*!
 *
 * Author: Alex Disler (alexdisler.com)
 * github.com/alexdisler/cordova-plugin-inapppurchase
 *
 * Licensed under the MIT license. Please see README for more information.
 *
 */

var inAppPurchase = { utils: utils };

var nativeCall = function nativeCall(name) {
  var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

  return new Promise(function (resolve, reject) {
    window.cordova.exec(function (res) {
      resolve(res);
    }, function (err) {
      reject(err);
    }, 'InAppBillingV3', name, args);
  });
};

inAppPurchase.getProducts = function (productIds) {
  return new Promise(function (resolve, reject) {
    if (!inAppPurchase.utils.validArrayOfStrings(productIds)) {
      reject(new Error(inAppPurchase.utils.errors[101]));
    } else {
      nativeCall('init', []).then(function () {
        return nativeCall('getSkuDetails', productIds);
      }).then(function (items) {
        var arr = items.map(function (val) {
          return {
            productId: val.productId,
            title: val.title,
            description: val.description,
            price: val.price
          };
        });
        resolve(arr);
      }).catch(reject);
    }
  });
};

inAppPurchase.buy = function (productId) {
  return new Promise(function (resolve, reject) {
    if (!inAppPurchase.utils.validString(productId)) {
      reject(new Error(inAppPurchase.utils.errors[102]));
    } else {
      nativeCall('buy', [productId]).then(function (res) {
        resolve({
          signature: res.signature, // <- Android only
          productId: res.productId,
          transactionId: res.purchaseToken,
          receipt: JSON.stringify({
            orderId: res.orderId,
            packageName: res.packageName,
            productId: res.productId,
            purchaseTime: res.purchaseTime,
            purchaseState: res.purchaseState,
            purchaseToken: res.purchaseToken
          })
        });
      }).catch(reject);
    }
  });
};

inAppPurchase.consume = function (transactionId) {
  return new Promise(function (resolve, reject) {
    if (!inAppPurchase.utils.validString(transactionId)) {
      reject(new Error(inAppPurchase.utils.errors[102]));
    } else {
      nativeCall('consumePurchase', [transactionId]).then(resolve).catch(reject);
    }
  });
};

inAppPurchase.restorePurchases = function () {
  return nativeCall('restorePurchases', []).then(function (purchases) {
    var arr = [];
    if (purchases) {
      arr = purchases.map(function (val) {
        return {
          productId: val.productId,
          state: val.state,
          date: val.date,
          token: val.token, // <- Android only
          type: val.type };
      });
    }
    // <- Android only
    return arr;
  });
};

module.exports = inAppPurchase;