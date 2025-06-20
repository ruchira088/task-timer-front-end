#!/usr/bin/env node
import * as cdk from "aws-cdk-lib"
import {TaskTimerStack} from "../lib/task-timer-stack"
import path from "path"

const app = new cdk.App()

new TaskTimerStack(
  app,
  "TaskTimerStack",
  "timer.ruchij.com",
  path.resolve(__dirname, "../../out/"),
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: "us-east-1"
    }
  }
)