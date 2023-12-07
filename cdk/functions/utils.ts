import * as lambda from 'aws-lambda'
export type LambdaResult = Promise<lambda.APIGatewayProxyStructuredResultV2>
export type LambdaEvent = lambda.APIGatewayProxyEventV2

export const responseToApiGw = (status: number, bodyObject: any): lambda.APIGatewayProxyStructuredResultV2 => {
    // API GW expects a specific structure of response from a Lambda integration
    return responseToApiGwWithText(status, JSON.stringify(bodyObject))
}

export const responseToApiGwWithText = (status: number, bodyText: string): lambda.APIGatewayProxyStructuredResultV2 => {
    // API GW expects a specific structure of response from a Lambda integration
    // See https://aws.amazon.com/premiumsupport/knowledge-center/malformed-502-api-gateway/
    return {
        statusCode: status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Authorization': 'Bearer tkCVGnCNOsoJ0gLNY3c12sfN9p7mapzHcOSGtZ/IypvXNrUGdLPildySRWACcZeUyjicS0q+2wSr82Fbxonc1san15HZFn0WPxBeUZ+dOM6Y64zVT3nwkHq4CkgVDPaJpFq8nrvl5pndKQxzEgt2ggdB04t89/1O/w1cDnyilFU='
        },
        isBase64Encoded: false,
        body: bodyText,
    }
}
