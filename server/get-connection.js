const redis = require("redis");
const client = redis.createClient();

 try {
    client.on("error", function(error) {
        console.log("Error encountered: ", error)
    });
    client.on("connect", function(error){
        console.log("Redis Connection Established");
    })
    
 } catch (error) {
    console.log(error)
 }