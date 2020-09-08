import { Comprehend } from 'aws-sdk';
const comprehend = new Comprehend();
const extractBucketParams = (event) => event.Records
    .map(({ s3 }) => ({
    name: s3.bucket.name,
    key: s3.object.key,
}));
export const handler = async (event) => {
    console.log("creating call motivation classifier...");
    try {
        const objectParams = extractBucketParams(event);
        const createCallMotivationClassifierParams = {
            DataAccessRoleArn: process.env.DATA_ACCESS_ROLE,
            DocumentClassifierName: process.env.CLASSIFIER_NAME,
            InputDataConfig: {
                S3Uri: `s3://${process.env.CALL_MOTIVATION_INPUT}/${objectParams[0].key}`
            },
            LanguageCode: 'en'
        };
        await comprehend.createDocumentClassifier(createCallMotivationClassifierParams).promise()
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
//# sourceMappingURL=createMotivationClassifier.js.map