import express from "express"
import { sendToClaude } from "./utils/sendToClaude.js"
const app = express()

const PORT = 8080

app.use(express.json())

app.use((request, response, next)=>{
    request.url = `/api/${request.body.events[0].type}`
    console.log("sending to: " + request.url)
    next()
})

app.post('/api/message', async (request, response, next)=> {
    console.log(request.url)
    console.log("message received, awaiting Claude...")
    const reply = await sendToClaude(request.body.events.message.text)
    const replyObject = {
        "replyToken": request.body.events.replyToken,
        "messages" : [
            {
                "type": "text",
                "text": "reply"
            }
        ]
    }
    
    response.send(replyObject)
})


app.post('/api/follow', (request, response) => {
    console.log("received follow")
})


app.listen(PORT, ()=>{console.log(`Server listening on port: ${PORT}`)})


