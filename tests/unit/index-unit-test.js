'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');

describe('Index unit tests', function () {
    var subject;
    var createGroupStub = sinon.stub();
    var updateGroupStub = sinon.stub();
    var deleteGroupStub = sinon.stub();
    var event;

    before(function () {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        var awsSdkStub = {
            CognitoIdentityServiceProvider: function () {
                this.createGroup = createGroupStub;
                this.updateGroup = updateGroupStub;
                this.deleteGroup = deleteGroupStub;
            }
        };

        mockery.registerMock('aws-sdk', awsSdkStub);
        subject = require('../../src/index');
    });
    beforeEach(function () {
        createGroupStub.reset().resetBehavior();
        createGroupStub.yields(undefined, { Group: { GroupName: 'GroupName' } });
        updateGroupStub.reset().resetBehavior();
        updateGroupStub.yields();
        deleteGroupStub.reset().resetBehavior();
        deleteGroupStub.yields();
        event = {
            ResourceProperties: {
                GroupName: 'GroupName',
                UserPoolId: 'eu-west-1_EXAMPLE'
            }
        };
    });
    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });

    describe('validate', function () {
        it('should succeed', function (done) {
            subject.validate(event);
            done();
        });
        it('should fail if GroupName is not set', function (done) {
            delete event.ResourceProperties.GroupName;
            function fn () {
                subject.validate(event);
            }
            expect(fn).to.throw(/Missing required property GroupName/);
            done();
        });
        it('should fail if UserPoolId is not set', function (done) {
            delete event.ResourceProperties.UserPoolId;
            function fn () {
                subject.validate(event);
            }
            expect(fn).to.throw(/Missing required property UserPoolId/);
            done();
        });
    });

    describe('create', function () {
        it('should succeed', function (done) {
            subject.create(event, {}, function (error, response) {
                expect(error).to.equal(null);
                expect(createGroupStub.calledOnce).to.equal(true);
                expect(updateGroupStub.called).to.equal(false);
                expect(deleteGroupStub.called).to.equal(false);
                expect(response.physicalResourceId).to.equal('GroupName');
                done();
            });
        });
        it('should fail due to createGroup error', function (done) {
            createGroupStub.yields('createGroup');
            subject.create(event, {}, function (error, response) {
                expect(error).to.equal('createGroup');
                expect(createGroupStub.calledOnce).to.equal(true);
                expect(updateGroupStub.called).to.equal(false);
                expect(deleteGroupStub.called).to.equal(false);
                expect(response).to.equal(undefined);
                done();
            });
        });
    });

    describe('update', function () {
        it('should succeed with same GroupName & UserPoolId', function (done) {
            event.PhysicalResourceId = 'GroupName';
            event.OldResourceProperties = event.ResourceProperties;
            subject.update(event, {}, function (error) {
                expect(error).to.equal(undefined);
                expect(updateGroupStub.calledOnce).to.equal(true);
                expect(createGroupStub.called).to.equal(false);
                expect(deleteGroupStub.called).to.equal(false);
                done();
            });
        });
        it('should fail due to updateGroup error', function (done) {
            updateGroupStub.yields('updateGroup');
            event.OldResourceProperties = event.ResourceProperties;
            subject.update(event, {}, function (error) {
                expect(error).to.equal('updateGroup');
                expect(updateGroupStub.calledOnce).to.equal(true);
                expect(createGroupStub.called).to.equal(false);
                expect(deleteGroupStub.called).to.equal(false);
                done();
            });
        });
        it('should succeed with different GroupName', function (done) {
            event.PhysicalResourceId = 'GroupName';
            event.OldResourceProperties = {
                GroupName: 'GroupName2',
                UserPoolId: 'eu-west-1_EXAMPLE'
            };
            subject.update(event, {}, function (error, response) {
                expect(error).to.equal(null);
                expect(updateGroupStub.called).to.equal(false);
                expect(createGroupStub.calledOnce).to.equal(true);
                expect(deleteGroupStub.calledOnce).to.equal(true);
                expect(response.physicalResourceId).to.equal('GroupName');
                done();
            });
        });
        it('should succeed with different UserPoolId', function (done) {
            event.PhysicalResourceId = 'GroupName';
            event.OldResourceProperties = {
                GroupName: 'GroupName',
                UserPoolId: 'eu-west-1_EXAMPLE2'
            };
            subject.update(event, {}, function (error, response) {
                expect(error).to.equal(null);
                expect(updateGroupStub.called).to.equal(false);
                expect(createGroupStub.calledOnce).to.equal(true);
                expect(deleteGroupStub.calledOnce).to.equal(true);
                expect(response.physicalResourceId).to.equal('GroupName');
                done();
            });
        });
        it('should fail due to deleteGroup error', function (done) {
            deleteGroupStub.yields('deleteGroup');
            event.OldResourceProperties = {
                GroupName: 'GroupName',
                UserPoolId: 'eu-west-1_EXAMPLE2'
            };
            subject.update(event, {}, function (error) {
                expect(error).to.equal('deleteGroup');
                expect(updateGroupStub.called).to.equal(false);
                expect(createGroupStub.called).to.equal(false);
                expect(deleteGroupStub.calledOnce).to.equal(true);
                done();
            });
        });
        it('should fail due to createGroup error', function (done) {
            createGroupStub.yields('createGroup');
            event.OldResourceProperties = {
                GroupName: 'GroupName',
                UserPoolId: 'eu-west-1_EXAMPLE2'
            };
            subject.update(event, {}, function (error) {
                expect(error).to.equal('createGroup');
                expect(updateGroupStub.called).to.equal(false);
                expect(createGroupStub.calledOnce).to.equal(true);
                expect(deleteGroupStub.calledOnce).to.equal(true);
                done();
            });
        });
    });

    describe('delete', function () {
        it('should succeed', function (done) {
            subject.delete(event, {}, function (error) {
                expect(error).to.equal(undefined);
                expect(deleteGroupStub.calledOnce).to.equal(true);
                expect(createGroupStub.called).to.equal(false);
                expect(updateGroupStub.called).to.equal(false);
                done();
            });
        });
        it('should succeed if group is not found', function (done) {
            deleteGroupStub.yields({ code: 'ResourceNotFoundException'} );
            subject.delete(event, {}, function (error) {
                expect(error).to.equal(undefined);
                expect(deleteGroupStub.calledOnce).to.equal(true);
                expect(createGroupStub.called).to.equal(false);
                expect(updateGroupStub.called).to.equal(false);
                done();
            });
        });
        it('should fail due to deleteGroup error', function (done) {
            deleteGroupStub.yields('deleteGroup');
            subject.delete(event, {}, function (error) {
                expect(error).to.equal('deleteGroup');
                expect(deleteGroupStub.calledOnce).to.equal(true);
                expect(createGroupStub.called).to.equal(false);
                expect(updateGroupStub.called).to.equal(false);
                done();
            });
        });
        it('should not call delete if User Pool Id is invalid', function (done) {
            event.ResourceProperties.UserPoolId = 'Invalid';
            subject.delete(event, {}, function (error) {
                expect(error).to.equal(undefined);
                expect(deleteGroupStub.called).to.equal(false);
                expect(createGroupStub.called).to.equal(false);
                expect(updateGroupStub.called).to.equal(false);
                done();
            });
        });
    });
});
