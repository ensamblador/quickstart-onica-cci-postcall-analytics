import { Comprehend } from 'aws-sdk';
const comprehend = new Comprehend();
const extractBucketParams = (event) => event.Records
    .map(({ s3 }) => ({
    name: s3.bucket.name,
    key: s3.object.key,
}));
export const handler = async (event) => {
    console.log("creating call resolution classifier...");
    try {
        const objectParams = extractBucketParams(event);
        var createCallResolutionClassifierParams = {
            DataAccessRoleArn: process.env.DATA_ACCESS_ROLE,
            DocumentClassifierName: process.env.CLASSIFIER_NAME,
            InputDataConfig: {
                S3Uri: `s3://${process.env.CALL_RESOLUTION_BUCKET}/${objectParams[0].key}`
            },
            LanguageCode: 'en'
        };
        await comprehend.createDocumentClassifier(createCallResolutionClassifierParams).promise()
            .then(data => {
            console.log(`classifier created successfully with arn: ${data.DocumentClassifierArn}`);
        });
    }
    catch (error) {
        if (error.code === 'ResourceInUseException') { }
        else {
            console.error('Failed:', error);
            throw error;
        }
    }
};
//# sourceMappingURL=callResolutionClassifier.js.map