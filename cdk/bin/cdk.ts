#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';

const stackName: string = process.env.HACKATHON_STACK_NAME || 'breathe-easy-thailand'
if (!(stackName && stackName.trim() && stackName.trim().length > 0)) {
  console.error(`PARAMETER $HACKATHON_STACK_NAME NOT SET, got: '${stackName}'`)
  process.exit(1)
}

const settings = {
    env: {
      account: process.env.CDK_HACKATHON_ACCOUNT || 'NOT_SET',
      region: process.env.CDK_HACKATHON_REGION || 'NOT_SET',
    },
    stackName: stackName,
    permissionsBoundaryPolicyName: 'ScopePermissions',
    subDomain: stackName.toLowerCase(),
    // in later sessions we will add more settings
}

const app = new cdk.App();
new CdkStack(app, 'CdkStack', settings);
