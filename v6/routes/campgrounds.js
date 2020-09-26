var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");

//INDEX Route- Show all campgrounds
router.get("/campgrounds", function(req,res){
	console.log(req.user);
	//get all campgrounds from db
	Campground.find({}, function(err, allCampgrounds){
		if(err){
			console.log(err);
		} else {
			res.render("campgrounds/campgrounds", {campgrounds:allCampgrounds});
		}
	});
	
	
});
//CREATE Route- add new campground to dB
router.post("/campgrounds", isLoggedIn, function(req,res){
		//get form data and add to campgrounds array.
	var name= req.body.name;
	var image= req.body.image;
	var desc= req.body.description;
	var author= {
		id: req.user._id,
		username: req.user.username
	};
	var newCampground = {name: name , image: image, description: desc, author: author}
	//create a new campground and move to db
	Campground.create(newCampground, function(err, newlyCreated){
			if(err){
		console.log(err);
	} else {
	//redirect to campgrounds page.
	console.log(newlyCreated);	
	res.redirect("/campgrounds"); } 
	});
	
	}); 
	
//NEW Route- show form page to create a new campground
router.get("/campgrounds/new", isLoggedIn, function(req,res){
		res.render("campgrounds/new");
	});
//SHOW Route- show more info of one campground
router.get("/campgrounds/:id", function(req,res){
	 //find the campground with provided ID
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
			if(err){
		console.log(err);
	} else {
		//render show template with that campground. 
	res.render("campgrounds/show", {campground: foundCampground});
	} 
	
	}); 

});

//edit campground route
router.get("/campgrounds/:id/edit", checkCampgroundOwnership, function(req,res ){
	Campground.findById(req.params.id, function(err, foundCampground){
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});


//update campground route
router.put("/campgrounds/:id",checkCampgroundOwnership, function(req,res){
	//find and update the correct campgrounds
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
	if(err){
		res.redirect("/campgrounds");
	} else {
		//rediect to show page
		res.redirect("/campgrounds/" + req.params.id);
	}
	});
});


//destroy campground route
router.delete("/campgrounds/:id",checkCampgroundOwnership, function(req,res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds");
		}
	})
});

//middleware function
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

function checkCampgroundOwnership(req, res, next) {
	//is user logged in?
	if(req.isAuthenticated()){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err){
			//otherwise redirect.
			res.redirect("back")
		} else {
			//does user own the campground?
			if(foundCampground.author.id.equals(req.user._id)) {
				next();
			//if not redirect
			} else {
				res.redirect("back")
			}
	
		}
	});
	} else {
		console.log("login first");
		res.redirect("back");
	}
}

module.exports = router;