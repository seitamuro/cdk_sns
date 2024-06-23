import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambda_event_sources from "aws-cdk-lib/aws-lambda-event-sources";
import * as lambda_nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkSnsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambda_role = new iam.Role(this, "lambda_role", {
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaSQSQueueExecutionRole"
        ),
      ],
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    const lambda_function = new lambda_nodejs.NodejsFunction(
      this,
      "lambda_function",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "handler",
        entry: "function/consumer.ts",
        role: lambda_role,
      }
    );

    const sns_topic = new sns.Topic(this, "sample_sns", {
      topicName: "sample_sns",
      fifo: false,
    });

    const sample_sqs = new sqs.Queue(this, "sample_sqs", {});

    sns_topic.addSubscription(
      new subscriptions.SqsSubscription(sample_sqs, {})
    );
    lambda_function.addEventSource(
      new lambda_event_sources.SqsEventSource(sample_sqs)
    );
  }
}
