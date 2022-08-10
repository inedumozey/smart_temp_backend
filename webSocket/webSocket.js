
require("dotenv").config();

function webSocket(io, Notification){
    io.on('connection', socket=>{
        console.log("someoneffff inoo")
    })  
    
    // console.log(io)
    Notification.watch().
        on('change', data=>{
          
            if(data.operationType === 'insert'){
                //get the data
                const info = {
                    id: data.fullDocument._id,
                    title: data.fullDocument.title,
                    body: data.fullDocument.body,
                    isRead: data.fullDocument.isRead,
                    createdAt: data.fullDocument.createdAt,
                    updatedAt: data.fullDocument.updatedAt,
                }
                
                io.on('connection', socket=>{
                    console.log("someoneffff in")
                })  
                
            }
        })
}

module.exports = webSocket