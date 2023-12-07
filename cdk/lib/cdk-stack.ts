import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigw from 'aws-cdk-lib/aws-apigateway'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface BreatheEasyThailandSettings extends cdk.StackProps {
  permissionsBoundaryPolicyName: string;
  subDomain: string;
}

export class CdkStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: BreatheEasyThailandSettings
  ) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'CdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
    const lambdaEnvVars = {
      NODE_ENV: 'production',
      // AWS specific var to reuse TCP connection
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    };
    const bundling = {
      externalModules: ['aws-sdk'],
    };

    // API GW
    const api = new apigw.RestApi(this, 'apigw', {
      description: `${props.stackName}-apigw`,
      restApiName: `${props.stackName}-apigw`,
      deployOptions: {
          stageName: 'api', // must be same as default route handing in Cloud Front Distribution below
      },
      deploy: true, // always deploy,
      // set up CORS
      defaultCorsPreflightOptions: {
          allowHeaders: ['Content-Type', 'Access-Control-Allow-Origin', 'Access-Control-Request-Method', 'Access-Control-Request-Headers', 'Authorization'],
          allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'DELETE'],
          allowCredentials: true,
          allowOrigins: ['*'], // Allow all. Could be [ 'http://localhost:3000', 'https://${fullDomain}' ],
      },
    })
    api.addUsagePlan('apigw-rate-limits', {
        name: `${props.stackName}-apigw-rate-limits`,
        throttle: {
            rateLimit: 10,
            burstLimit: 5,
        },
    })

    const clientDistribution = new cloudfront.Distribution(this, 'client-distribution', {
      defaultBehavior: {
          origin: new origins.RestApiOrigin(api),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          originRequestPolicy: new cloudfront.OriginRequestPolicy(this, 'request-policy', {
              queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
          }),
      },
      additionalBehaviors: {
          '/api/*': {
              // must be same as default stage name above in ApiGW
              origin: new origins.HttpOrigin(`${api.restApiId}.execute-api.${props!.env!.region}.amazonaws.com`, {
                  // should be empty so we don't add extra path info
                  // else it won't match in the API-GW stage
                  originPath: '/',
              }),
              viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
              allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
              cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          },
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
  })

    const webhookLambda = new nodejs.NodejsFunction(
      this,
      'line-webhook-lambda',
      {
        functionName: `${props.stackName}-line-webhook-lambda`,
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: './functions/lambdas.ts',
        handler: 'lineWebhookHandler',
        environment: lambdaEnvVars,
        timeout: cdk.Duration.minutes(1),
        bundling,
      }
    );

    //messageLambda here
    const messageLambda = new nodejs.NodejsFunction(
      this,
      'line-message-lambda',
      {
        functionName: `${props.stackName}-line-message-lambda`,
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: './functions/lambdas.ts',
        handler: 'lineMessageHandler',
        environment: lambdaEnvVars,
        timeout: cdk.Duration.minutes(1),
        bundling,
      }
    );
    //followLambda here
    const followLambda = new nodejs.NodejsFunction(
      this,
      'line-follow-lambda',
      {
        functionName: `${props.stackName}-line-follow-lambda`,
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: './functions/lambdas.ts',
        handler: 'lineFollowHandler',
        environment: lambdaEnvVars,
        timeout: cdk.Duration.minutes(1),
        bundling,
      }
    );

    const bedrockApiCallLambda = new nodejs.NodejsFunction(
      this,
      'bedrock-api-call-lambda',
      {
        functionName: `${props.stackName}-bedrock-api-call-lambda`,
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: './functions/lambdas.ts',
        handler: 'bedrockApiCallHandler',
        environment: lambdaEnvVars,
        timeout: cdk.Duration.minutes(1),
        bundling,
      }
    );

    // API Gateway handle webhook method
    const webhookApi = api.root.addResource('webhook')
    webhookApi.addMethod('POST', new apigw.LambdaIntegration(webhookLambda, { proxy: true }))

    // API Gateway message method
    const messageApi = api.root.addResource('message')
    messageApi.addMethod('POST', new apigw.LambdaIntegration(messageLambda, { proxy: true }))

    // API Gateway follow method
    const followApi = api.root.addResource('follow')
    followApi.addMethod('POST', new apigw.LambdaIntegration(followLambda, { proxy: true }))

    // API Gateway bedrock method
    const bedrockApi = api.root.addResource('bedrock')
    bedrockApi.addMethod('POST', new apigw.LambdaIntegration(bedrockApiCallLambda, { proxy: true }))
      
    new cdk.CfnOutput(this, 'serverUrl', {
      value: `https://${clientDistribution.domainName}`,
  })
  }
}
