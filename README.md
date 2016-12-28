# lulo Cognito User Pool Group

lulo Cognito User Pool Group creates Groups for Amazon Cognito User Pools

lulo Cognito User Pools is a [lulo](https://github.com/carlnordenfelt/lulo) plugin

# Installation
```
npm install lulo-plugin-cognito-user-pool-group --save
```

## Usage
### Properties
* GroupName: Name of the group. Required. Update requires replacement.
* UserPoolId: Id of the User Pool. Required. Update requires replacement.
* For further properties, see the [AWS SDK Documentation for CognitoIdentityServiceProvider::createUserPool](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#createGroup-property)

### Return Values
When the logical ID of this resource is provided to the Ref intrinsic function, Ref returns the **GroupName**.

`{ "Ref": "UserPoolGroup" }`

### Required IAM Permissions
The Custom Resource Lambda requires the following permissions for this plugin to work:
```
{
   "Effect": "Allow",
   "Action": [
       "cognito-idp:CreateGroup",
       "cognito-idp:UpdateGroup",
       "cognito-idp:DeleteGroup"
   ],
   "Resource": "*"
}
```

## License
[The MIT License (MIT)](/LICENSE)

## Change Log
[Change Log](/CHANGELOG.md)
