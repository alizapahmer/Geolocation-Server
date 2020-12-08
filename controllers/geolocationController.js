const Distance = require('../models/distance');
const request = require('request');
const axios = require('axios');
const mongoose= require('mongoose');

//Included in this file: popular_search, find_dest, distance_get, distance_post

//return the top result after sorting descending. Result is an array of one item, so we extract the data from the array
const popular_search = (req,res)=>{
    Distance.find({},{ source: 1, destination: 1, hits: 1, _id: 0 }).sort({ hits: -1}).limit(1)
    .then((result)=>{ 
    res.send(result[0])
    })
    .catch((err)=>{
        console.log(err)
    })
};

const find_dest = (req,res)=>{
     //parse the source and dest from the URL
     //sort the values so we can track source-destination in both directions
    //change the values to uppercase so it is not case-sensative
    let combination = [((req.params.source).toUpperCase()), ((req.params.dest).toUpperCase())].sort()
    source = combination[0];
    dest = combination[1];
     //check if it exsists in the database
    Distance.findOne( {source: source, destination: dest } ).select('distance -_id')
    .then((result)=>{
       if(result){ //if it does update the number of hits and send the result 
        Distance.findOneAndUpdate( { source: source, destination: dest }, {$inc: {hits:1}}, {new: true})
        .then((result))
        .catch((err)=> {
         console.log("error " + err);
         });
        res.send(result)
        }
        else{ //otherwise, make a call to the google maps API and calculate the distance
            //if the values are not accepted as locations, throw an error
        axios.get('https://maps.googleapis.com/maps/api/distancematrix/json?origins='+source+'&destinations='+dest+'&key=AIzaSyCYQyExRU_lUN9QtYoTa5w1nfsACiwoz44')
        .then(response => {
            const distResult = response.data.rows[0].elements[0].distance.text
            const distance = parseInt(distResult.replace(/,/, ''))
            const combo= new Distance ( //create a new instance of Distance 
                {
                source: source,
                destination: dest,
                distance: distance,
                hits: 1
                }
            );
            //if we are connected to the databse, then save the new information
            if(mongoose.connection.readyState==1){
             combo.save()
            }
        res.send({'distance': distance});
        }).catch((err)=>{
            res.send(err, ' error: location not found, please try again')
        }) 
        }
    })
};


//render the interactive user view called create. This function call will generate the POST request
const distance_get = (req, res) => {
    res.render('create');
};  
//POST- gets information from the users form and uploads to the database with a POST request
const distance_post = (req,res)=>{
    //create a new document from the information recieved from create.ejs
    const combo = new Distance(req.body);
    combo.save()
    .then((result)=>{
        res.send(combo)
    })
    .catch((err)=>{
        console.log(err)
    });
}

module.exports = {
    popular_search,
    find_dest,
    distance_get,
    distance_post
}
