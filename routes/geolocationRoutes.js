//Routes File that handles all the GET and POST requests

const express= require('express');
const { distance_post } = require('../controllers/geolocationController');
const router = express.Router();
const geolocationController= require('../controllers/geolocationController');

//API 4
router.get('/popularsearch', geolocationController.popular_search);
//API 2
router.get('/findDest/source=:source&destination=:dest',geolocationController.find_dest);
//API 5
router.get('/distance', geolocationController.distance_get);
router.post('/distance',geolocationController.distance_post);

module.exports = router;   

