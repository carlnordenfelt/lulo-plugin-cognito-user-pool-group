'use strict';

var aws = require('aws-sdk');
var cognitoIdentityServiceProvider = new aws.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18' });

var pub = {};

pub.schema = {
    Precedence: { type: 'integer' }
};

pub.validate = function (event) {
    if (!event.ResourceProperties.GroupName) {
        throw new Error('Missing required property GroupName');
    }
    if (!event.ResourceProperties.UserPoolId) {
        throw new Error('Missing required property UserPoolId');
    }
};

pub.create = function (event, _context, callback) {
    delete event.ResourceProperties.ServiceToken;
    var params = event.ResourceProperties;
    cognitoIdentityServiceProvider.createGroup(params, function (error, response) {
        if (error) {
            return callback(error);
        }
        var data = {
            physicalResourceId: response.Group.GroupName
        };
        callback(null, data);
    });
};

pub.update = function (event, context, callback) {
    if (event.ResourceProperties.GroupName !== event.OldResourceProperties.GroupName ||
        event.ResourceProperties.UserPoolId !== event.OldResourceProperties.UserPoolId) {
        var deleteEvent = {
            ResourceProperties: {
                GroupName: event.OldResourceProperties.GroupName,
                UserPoolId: event.OldResourceProperties.UserPoolId
            }
        };
        pub.delete(deleteEvent, context, function (error) {
            if (error) {
                return callback(error);
            }
            pub.create(event, context, callback);
        });
    } else {
        delete event.ResourceProperties.ServiceToken;
        var params = event.ResourceProperties;
        cognitoIdentityServiceProvider.updateGroup(params, function (error) {
            return callback(error);
        });
    }
};

pub.delete = function (event, _context, callback) {
    if (!/[\w-]+_[0-9a-zA-Z]+/.test(event.ResourceProperties.UserPoolId)) {
        return callback();
    }
    var params = {
        GroupName: event.ResourceProperties.GroupName,
        UserPoolId: event.ResourceProperties.UserPoolId
    };
    cognitoIdentityServiceProvider.deleteGroup(params, function (error) {
        if (error && error.code !== 'ResourceNotFoundException') {
            return callback(error);
        }
        return callback();
    });
};

module.exports = pub;
