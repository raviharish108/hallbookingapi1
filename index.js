
import express from "express";
import {MongoClient} from "mongodb";
import * as dotenv from "dotenv";
import cors from "cors";
dotenv.config();
let date_ob = new Date();
let hours = date_ob.getHours();
let minutes = date_ob.getMinutes();
//const url="mongodb://127.0.0.1:27017";
const mongo_url=process.env.URL;
const PORT=process.env.PORT;
const app=express();
app.use (express.json());
app.use(cors());
//......................... for mongo db connection
          async function createConnection(){
          const client=new MongoClient(mongo_url);
          await client.connect();
          console.log("mongo is connected👍👍👍");
          return client;
}
//..........................
         
          const client= await createConnection();
//...................
           app.get("/",function(req,res){
            res.send("helloworld")
           })          
/// ...............................1st requirement for creating room
            app.post('/createroom',async function (req,res){
            const new_room=req.body;
            const present=req.body.room_id
            const room_=await client.db("mongodb").collection("room").findOne({room_id:present})
            
            if(room_){
                res.send("this room id is already used you give some other room_id")
            }
            else{
            const room=await client.db("mongodb").collection("room").insertOne(new_room);
             res.send(room);
             }
          })
          
//.........................
           app.get('/rooms',async function(req,res){
            const rooms= await client.db("mongodb").collection("room").find().toArray();
            res.send(rooms);
           })
//............................

             app.get('/getroom/:id',async function(req,res){
                const {id}=req.params
              const getroom= await client.db("mongodb").collection("room").findOne({room_id:id});
              res.send(getroom);
              })


// ...........................2nd requirement for booking room
            app.post('/booking',async function (req,res){
            const name=req.body.name;
            const date=req.body.date;
            const start_time=(hours + ":" + minutes);
            const end_time=req.body.end_time;   
           const room_id=req.body.room_id
                const new_booking={"name":name,"date":date,"start_time":start_time,"end_time":end_time,"room_id":room_id};
                const booking=await client.db("mongodb").collection("hotelbooking").insertOne(new_booking);
                console.log(booking);
                 res.send(booking);
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
app.get("/customerdata/:id",async function(req,res){
    const {id}=req.params;
   const getbook=await client.db("mongodb").collection("hotelbooking").findOne({room_id:id});
   
   res.send (getbook);
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