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

    const consumer_function = new lambda_nodejs.NodejsFunction(
      this,
      "all_function",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "handler",
        entry: "function/consumer.ts",
        role: lambda_role,
      }
    );
    const apple_function = new lambda_nodejs.NodejsFunction(
      this,
      "apple_function",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "handler",
        entry: "function/consumer.ts",
        role: lambda_role,
      }
    );
    const orange_function = new lambda_nodejs.NodejsFunction(
      this,
      "orange_function",
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
    const apple_sqs = new sqs.Queue(this, "apple_sqs", {});
    const orange_sqs = new sqs.Queue(this, "orange_sqs", {});

    sns_topic.addSubscription(new subscriptions.SqsSubscription(sample_sqs));
    sns_topic.addSubscription(
      new subscriptions.SqsSubscription(apple_sqs, {
        filterPolicy: {
          fruit: sns.SubscriptionFilter.stringFilter({
            allowlist: ["apple"],
          }),
        },
      })
    );
    sns_topic.addSubscription(
      new subscriptions.SqsSubscription(orange_sqs, {
        filterPolicy: {
          fruit: sns.SubscriptionFilter.stringFilter({
            allowlist: ["orange"],
          }),
        },
      })
    );

    consumer_function.addEventSource(
      new lambda_event_sources.SqsEventSource(sample_sqs)
    );
    apple_function.addEventSource(
      new lambda_event_sources.SqsEventSource(apple_sqs)
    );
    orange_function.addEventSource(
      new lambda_event_sources.SqsEventSource(orange_sqs)
    );
  }
}
