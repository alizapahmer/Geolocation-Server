const express = require('express');
const mongoose= require('mongoose');
const app= express();
const port=8080;
const geolocationRoutes = require('./routes/geolocationRoutes') 
app.use(express.urlencoded({extended: true}));
mongoose.set('useFindAndModify', false);
app.set('view engine', 'ejs');

//connection link to database
const dbURI = 'mongodb+srv://aliza_aron:ALpa3006@cluster0.tt8n8.mongodb.net/geolocation?retryWrites=true&w=majority';

//connect to Database
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology:true})
	.then((result)=>console.log("connected to db"))
	.catch((err)=>console.log("error! am not connected"));

app.listen(port);

//geolocation routes
app.use(geolocationRoutes)

app.get('/hello', (req, res) => {
    res.send(res.statusCode)
});


//API #3, health API, uses npm health check to monitor 
app.get('/health',(req,res)=>{
healthCheckMongodb.do({
   url:dbURI
 })
   .then(response => {
     if (response.health == false){
        console.log("got here") 
        res.status(500) 
        res.send(500) 
     }
     res.end() 
   })
})
