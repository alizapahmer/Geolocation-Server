const Distance = require('../models/distance');
const request = require('request');
const axios = require('axios');
const mongoose= require('mongoose');
const { runInNewContext } = require('vm');

//Included in this file: popular_search, find_dest, distance_get, distance_post

//returns source, destination and number of hits for the most popular search
const popular_search = (req,res)=>{
    Distance.find({},{ source: 1, destination: 1, hits: 1, _id: 0 }).sort({ hits: -1}).limit(1)
    .then((result)=>{ 
    res.send(result[0])
    })
    .catch((err)=>{
        console.log(err)
    })
};
//find the distance beween two cities
const find_dest = (req,res)=>{
   if (!req.params.source || !req.params.dest){
        res.send("Error, please enter a valid start and end location")
        }
    //sort the values so we can track source-destination in both directions
   //change the values to uppercase so it is not case-sensative
    else{ 
        let combination = [((req.params.source).toUpperCase()), ((req.params.dest).toUpperCase())].sort()
        source = combination[0];
        dest = combination[1];
        //check if it exsists in the database
        Distance.findOne( {source: source, destination: dest } ).select('distance -_id')
        .then((result)=>{
            //if it does exist, send the result and update the number of hits 
            if(result){ 
                res.send(result)
                Distance.findOneAndUpdate( { source: source, destination: dest }, {$inc: {hits:1}}, {new: true})
                .catch((err)=> {
                    console.log("error " + err);
                });  
            }
            //otherwise, make a call to the google maps API and calculate the distance
            //if the values are not accepted as locations, throw an error
            else{
                axios.get('https://maps.googleapis.com/maps/api/distancematrix/json?origins='+source+'&destinations='+dest+'&key= YOUR API KEY')
                .then(response => {
                    if (!response.data.rows[0].elements[0].distance){
                        res.send('Invalid Locations, please try again')
                    }
                    else{
                        const distResult = response.data.rows[0].elements[0].distance.text
                        const distance = parseInt(distResult.replace(/,/, ''))
                        res.send({'distance': distance});
                        const combo= new Distance (
                        {
                        source: source,
                        destination: dest,
                        distance: distance,
                        hits: 1
                        });
                        //if we are connected to the databse, then save the new information
                        if(mongoose.connection.readyState==1){
                            combo.save()
                        }
                    }
                })
                .catch((err)=>{
                    res.send(err)
                }) 
            }
        })
        .catch((err)=>{
            res.send(err);
        })
    }
};


//render the interactive user view called create. This function call will generate the POST request
const distance_get = (req, res) => {
    res.render('create');
};  
//POST- gets information from the users form and uploads to the database with a POST request
const distance_post = (req,res)=>{
    //create a new document from the information recieved from create.ejs
    let combination = [((req.body.source).toUpperCase()), ((req.body.destination).toUpperCase())].sort()
    const combo= new Distance(
        {
        source: combination[0],
        destination: combination[1],
        distance: req.body.distance,
        hits: 1
        });
    try{
        res.send(combo)
        combo.save()
    }
    catch{
        res.send(err)
    };
}

module.exports = {
    popular_search,
    find_dest,
    distance_get,
    distance_post
}
