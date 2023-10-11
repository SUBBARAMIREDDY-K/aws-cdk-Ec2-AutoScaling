#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Ec2AutoScalingStack } from '../lib/ec2-auto_scaling-stack';

const app = new cdk.App();
new Ec2AutoScalingStack(app, 'Ec2AutoScalingStack', {
  
  env: { account: '652065397850', region: 'ap-south-1' },

  
});