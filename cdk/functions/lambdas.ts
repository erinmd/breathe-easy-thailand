import * as lambda from 'aws-lambda'
import { responseToApiGwWithText, responseToApiGw } from './utils'
import axios from "axios"
import { claudeResponse } from './chatFunction'

type LambdaEvent = lambda.APIGatewayProxyEventV2

type requestBody = {
    destination: string,
    events: any
}

export const lineWebhookHandler = async (event: LambdaEvent) => {
    const request: requestBody = JSON.parse(event.body!)
    const requestType = request.events[0].type
    console.log("webhookHandler called")
    try{
        const { data }  = await axios.post(`https://d18dt97iuezgri.cloudfront.net/api/${requestType}`, request)
        console.log("sending to: " + requestType)
        const reply = {
            "replyToken": request.events[0].replyToken,
            "messages" : [
                {
                    "type": "text",
                    "text": data
                }
            ]
        }
        const formattedReply = responseToApiGw(200, reply)
        axios.post('https://api.line.me/v2/bot/message/reply', formattedReply)
        return formattedReply
    } catch (error) {
        return responseToApiGw(400, `${error}`)
    }
}

export const lineMessageHandler = async (event: LambdaEvent) => {
    const request: requestBody = JSON.parse(event.body!)
    const message: string = request.events[0].message.text
    console.log("messageHandler called")
    try {
        const claudeReply = await claudeResponse(message)
        return responseToApiGw(200, claudeReply)
    } catch (e) {
        console.log("Claude request failed:" + e)
        return responseToApiGw(400, "error")
    }
}

export const lineFollowHandler = async (event: LambdaEvent) => {
    const request: requestBody = JSON.parse(event.body!)
    const reply = {
        "replyToken": request.events[0].replyToken,
        "messages" : [
            {
                "type": "text",
                "text": "Hello! Welcome to your clean air future. Please ask me any questions about the new clean air legislation, or tell me your postcode and ask about the air quality in your area! You can make a change at https://thailandcan.org"
            }
        ]
    }
    return responseToApiGw(200, reply)
}

export const bedrockApiCallHandler = async (event: LambdaEvent) => {
    
}

