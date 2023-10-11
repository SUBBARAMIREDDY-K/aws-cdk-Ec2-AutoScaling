import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import { readFileSync } from 'fs';

export class Ec2AutoScalingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const demoVPC = new ec2.Vpc(this, 'demoVPC', {
      vpcName: 'demoVPC',
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      natGateways:0,
    });
    
    //Security Group

    const demoSG = new ec2.SecurityGroup(this,'demoSG',{
      vpc: demoVPC,
      securityGroupName: 'Allow http traffic',
      allowAllOutbound:true,
    })
    // Ingress for SG
    demoSG.addIngressRule(ec2.Peer.anyIpv4(),ec2.Port.tcp(80),'allow http traffic')
    demoSG.addIngressRule(ec2.Peer.anyIpv4(),ec2.Port.tcp(22),'allow SSH')

    const userScript = readFileSync('./lib/userdata.sh','utf8');


    //Ec2 Launch Template

    const launchtemplate = new ec2.LaunchTemplate(this,"Ec2LaunchTemplate",{
      launchTemplateName: "webserverlaunchTemplate",
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2,ec2.InstanceSize.MICRO),
      keyName: 'terraform-key',
      associatePublicIpAddress: true,
      instanceMetadataTags:true,
      securityGroup:demoSG,
      userData: ec2.UserData.forLinux(),
    })

    launchtemplate.userData?.addCommands(userScript);


    cdk.Tags.of(launchtemplate).add("Schedule","Indian-hours");
    
   const asg =  new autoscaling.AutoScalingGroup(this, 'ASG', {
      vpc: demoVPC,
      launchTemplate: launchtemplate,
      autoScalingGroupName: "webserver-asg",
      desiredCapacity:1,
      minCapacity:1,
      maxCapacity:1,
    });

    new autoscaling.ScheduledAction(this,"webserver-scaleup",{
      autoScalingGroup: asg,
      schedule: autoscaling.Schedule.expression("*/5 * * * *"),
      // desiredCapacity:2,
      maxCapacity: 4,
      minCapacity: 1
    })

    new autoscaling.ScheduledAction(this,"webserver-scaledown",{
      autoScalingGroup: asg,
      schedule: autoscaling.Schedule.expression("*/3 * * * *"),
      maxCapacity: 0,
      minCapacity: 0
    })
    
  }
}
