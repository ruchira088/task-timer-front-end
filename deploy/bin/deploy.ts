#!/usr/bin/env node
import * as cdk from "aws-cdk-lib"
import {TaskTimerStack} from "../lib/task-timer-stack"

const app = new cdk.App()

new TaskTimerStack(
  app,
  "TaskTimerStack",
  "timer.ruchij.com",
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: "us-east-1"
    }
  }
)