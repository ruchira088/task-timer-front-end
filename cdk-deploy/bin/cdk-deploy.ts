#!/usr/bin/env node
import { deployReactSpa } from "react-app-cdk-deploy"

deployReactSpa({
  stackName: "TaskTimerFrontEndStack",
  domainName: "timer.ruchij.com",
  artifactBucket: "task-timer-bundles.ruchij.com"
}).catch((error) => {
  console.error(error)
  process.exit(1)
})
