import 'source-map-support/register';
import { S3 } from 'aws-sdk';
const s3 = new S3({ apiVersion: '2006-03-01' });
const extractBucketProps = (uri) => [process.env.BUCKET, uri.replace(`s3://${process.env.BUCKET}/`, '')];
export const handler = async (event) => {
    const queryStringParameters = event.queryStringParameters || {};
    console.log(queryStringParameters);
    const uri = queryStringParameters.uri;
    const [bucket, key] = extractBucketProps(decodeURIComponent(uri));
    console.log(key);
    const baseParams = {
        Bucket: bucket,
        Key: key,
    };
    const data = await s3.getObject(baseParams).promise();
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            uri: data.Body.toString(),
        })
    };
};
//# sourceMappingURL=getSentiments.js.map