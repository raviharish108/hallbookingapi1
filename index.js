
import express from "express"
import {MongoClient} from "mongodb"
import * as dotenv from "dotenv"
dotenv.config();
//const url="mongodb://127.0.0.1:27017";
const mongo_url=process.env.url;
const PORT=3000;
//......................... for mongo db connection
          async function createConnection(){
          const client=new MongoClient(mongo_url);
          await client.connect();
          console.log("mongo is connected👍👍👍");
          return client;
}
//..........................
          const app=express();
          app.use (express.json());
          const client= await createConnection();
//...................
           app.get("/",function(req,res){
            res.send("helloworld")
           })          
/// ...............................1st requirement for creating room
            app.post('/createroom',async function (req,res){
            const new_room=req.body;
            const room=await client.db("mongodb").collection("room").insertOne(new_room);
             res.send(room);
          })

// ...........................2nd requirement for booking room
            app.post('/booking',async function (req,res){
            const name=req.body.name;
            const initial_name=await client.db("mongodb").collection("hotelbooking").findOne({"name":name});
  
   
 //.......................for current date and time time 
                 let date_ob = new Date();
                 let date = ("0" + date_ob.getDate()).slice(-2);
                 let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
                let year = date_ob.getFullYear();
                 let hours = date_ob.getHours();
                 let minutes = date_ob.getMinutes();
                 let seconds = date_ob.getSeconds();
                 let current_date=year + "-" + month + "-" + date ; 
                 const presentroom=await client.db("mongodb").collection("hotelbooking").findOne({"date":current_date});
                 let start_time=hours + ":" + minutes + ":" + seconds;
                let end_time=(req.body.hours+hours) + ":" + minutes + ":" + seconds;
                let room_id=req.body.room_id
                //.................
            if(initial_name){
                   res.send("this room is already booked")
             }
            else if(presentroom.room_id===room_id){
                     res.send("this room is already booked for in this date");
              }
            else{
                const new_booking={"name":name,"date":current_date,"start_time":start_time,"end_time":end_time,"room_id":room_id};

                const booking=await client.db("mongodb").collection("hotelbooking").insertOne(new_booking);
                console.log(booking);
                 res.send(booking);
                }
                } 
                )


// 3rd requirement for all rooms with booked data
// 
app.get('/roomsbookeddatawith',async function (req,res){
    const rooms=await client.db("mongodb").collection("room").find().toArray();
    const booking=await client.db("mongodb").collection("hotelbooking").find().toArray();
    const room_id=booking.map(value=>value.room_id)
    let booked=[];
   const bookeddata=booking.map(value=>{
    const roomname=value.room_id;
    let bookedstatus="no";
   for (let i=0;i<room_id.length;i++){
    if(room_id[i]===value.room_id){
        bookedstatus="yes";
    }
   }
   const customername=value.name;
   const Date=value.date;
   const start_time=value.start_time;
   const end_time=value.end_time;
   const bookedd={"roomname":roomname,"bookedstatues":bookedstatus,"customername":customername,"Date":Date,"start_time":start_time,"end_time":end_time};
 booked.push(bookedd);
})
console.log(booked);
res.send(booked);
})
////.......4th requirement customer data with booking
app.get("/customerdata",async function(req,res){
    let customer_data=[];
    const bookingarray=await client.db("mongodb").collection("hotelbooking").find().toArray();
    bookingarray.map((element)=>{
       
        customer_data.push({"custome_name":element.name,"room_id":element.room_id,"date":element.date,"start_time":element.start_time,"end_time":element.end_time})
    })
   console.log(customer_data);
   res.send(customer_data);
})
app.delete("/checkout/:id",async function(req,res){
    const {id}=req.params;
    console.log(id);
    const deleteroom=await client.db("mongodb").collection("hotelbooking").deleteOne({ room_id:id });
    res.send(deleteroom)
    console.log(deleteroom)
})
app.listen(PORT,()=>{
    console.log("port is connected");
})