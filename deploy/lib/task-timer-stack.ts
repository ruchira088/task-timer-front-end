import path from "path"
import {aws_s3 as s3, Duration, RemovalPolicy, Stack, StackProps} from "aws-cdk-lib"
import {Construct} from "constructs"
import {BucketAccessControl} from "aws-cdk-lib/aws-s3"
import {Distribution, OriginAccessIdentity, ViewerProtocolPolicy} from "aws-cdk-lib/aws-cloudfront"
import {ARecord, HostedZone, RecordTarget} from "aws-cdk-lib/aws-route53"
import {Certificate, CertificateValidation} from "aws-cdk-lib/aws-certificatemanager"
import {S3BucketOrigin} from "aws-cdk-lib/aws-cloudfront-origins"
import {CloudFrontTarget} from "aws-cdk-lib/aws-route53-targets"
import {BucketDeployment, Source} from "aws-cdk-lib/aws-s3-deployment"

const DOMAIN_NAME = "ruchij.com"

export class TaskTimerStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    domain: string,
    props?: StackProps) {
    super(scope, id, props)

    if (!domain.endsWith(DOMAIN_NAME)) {
      throw new Error(`Domain must end with ${DOMAIN_NAME}`)
    }

    const s3Bucket = new s3.Bucket(this, "Bucket", {
      bucketName: "task-timer.ruchij.com",
      accessControl: BucketAccessControl.PRIVATE,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    })

    const originAccessIdentity = new OriginAccessIdentity(this, "OriginAccessIdentity")
    s3Bucket.grantRead(originAccessIdentity)

    const hostedZone = HostedZone.fromLookup(this, "HostedZone", {domainName: DOMAIN_NAME})

    const certificate = new Certificate(this, "Certificate", {
      domainName: domain,
      validation: CertificateValidation.fromDns(hostedZone)
    })

    const cloudfrontDistribution = new Distribution(this, "Distribution", {
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessIdentity(s3Bucket, {originAccessIdentity}),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      },
      defaultRootObject: "index.html",
      domainNames: [domain],
      certificate,
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: Duration.minutes(5)
        }
      ]
    })

    new BucketDeployment(this, "Deploy", {
      sources: [Source.asset(path.resolve(__dirname, "../../out/"))],
      destinationBucket: s3Bucket,
      distribution: cloudfrontDistribution,
      distributionPaths: ["/*"]
    })

    new ARecord(this, "AliasRecord", {
      recordName: domain,
      zone: hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(cloudfrontDistribution))
    })
  }
}
