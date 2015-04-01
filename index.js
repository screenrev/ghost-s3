// TODO > set custom url for s3 file (for cloudflare cdn purpose - cname stuff)
'use strict';

// # S3 storage module for Ghost blog http://ghost.org/
var fs = require('fs');
var path = require('path');
var nodefn = require('when/node/function');
var when = require('when');
var readFile = nodefn.lift(fs.readFile);
var unlink = nodefn.lift(fs.unlink);
var AWS = require('aws-sdk');
var config;


module.exports = function(options) {
    options = options || {};

    if (options.config) {
        config = options.config;
        AWS.config.update(config);
    }
    if (options.errors) errors = options.errors;

    return module.exports;
};


// ### Save
// Saves the image to S3
// - image is the express image object
// - returns a promise which ultimately returns the full url to the uploaded image
module.exports.save = function(image) {
    if (!config) return when.reject('ghost-s3 is not configured');

    var targetDir = getTargetDir();
    var targetFilename = getTargetName(image, targetDir);
    var awsPath = 'https://s3.amazonaws.com/' + config.bucket + '/';
    
    // In case using third party CDN (cloudflare-s3 integration, etc)
    var cdnPath = config.cdnPath ? config.cdnPath : awsPath

    return readFile(image.path)
    .then(function(buffer) {
        var s3 = new AWS.S3();

        return nodefn.call(s3.putObject.bind(s3), {
            Bucket: config.bucket,
            Key: targetFilename,
            Body: buffer,
            ContentType: image.type,
            CacheControl: 'max-age=' + (30 * 24 * 60 * 60) // 1 month
        });
    })
    .then(function(result) {
        return unlink(image.path);
    })
    .then(function() {
        return when.resolve(cdnPath + targetFilename);
    })
    .catch(function(err) {
        unlink(image.path);
        errors.logError(err);
        throw err;
    });
};


// middleware for serving the files
module.exports.serve = function() {
    // a no-op, these are absolute URLs
    return function (req, res, next) {
        next();
    };
};


var MONTHS = [
    '01', '02', '03', '04', '05', '06',
    '07', '08', '09', '10', '11', '12'
];
var getTargetDir = function() {
    var now = new Date();
    var prefix = config.prefixPath ? config.prefixPath : ''
    return path.join(prefix, now.getFullYear() + '', 
        MONTHS[now.getMonth()]) + '/';
};


var getTargetName = function(image, targetDir) {
    var ext = path.extname(image.name),
        name = path.basename(image.name, ext).replace(/\W/g, '_');

    return targetDir + name + '-' + Date.now() + ext;
};


// default error handler
var errors = {
    logError: function(error) {
        console.log('error in ghost-s3', error);
    }
};
