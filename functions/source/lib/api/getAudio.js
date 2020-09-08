import 'source-map-support/register';
import { S3 } from 'aws-sdk';
const s3 = new S3({ apiVersion: '2006-03-01' });
const extractBucketProps = (uri) => [process.env.BUCKET_NAME, uri.replace(`s3://${process.env.BUCKET_NAME}/`, '')];
export const handler = async (event) => {
    const queryStringParameters = event.queryStringParameters || {};
    console.log(queryStringParameters);
    const uri = queryStringParameters.uri;
    const [bucket, key] = extractBucketProps(decodeURIComponent(uri));
    const baseParams = {
        Bucket: bucket,
        Key: key,
    };
    const data = await s3.headObject(baseParams).promise();
    const response = s3.getSignedUrl('getObject', {
        ...baseParams,
        Expires: 600
    });
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            uri: response,
            contentType: data.ContentType
        })
    };
};
//# sourceMappingURL=getAudio.js.map