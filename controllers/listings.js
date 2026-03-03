const Listing= require("../models/listing");
const axios = require("axios");

module.exports.index=async (req, res) => {
  const listings = await Listing.find({});
  res.render("listings/index", { listings });
};

module.exports.renderNewForm=(req, res) => {
 
  res.render("listings/new");
};
module.exports.showListing=async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate({path:"reviews",
    populate:{
      path:"author",
    },
  }).populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

// module.exports.createListing = async (req, res, next) => {
//   let url = req.file.path;
//   let filename = req.file.filename;

//   const newListing = new Listing(req.body.listing);
//   newListing.owner = req.user._id;
//   newListing.image = { url, filename };

//   await newListing.save();   // 🔥 THIS WAS MISSING

//   req.flash("success", "New listing created!");
//   res.redirect(`/listings/${newListing._id}`);
// };
module.exports.editListing=async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  } let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs",{listing,originalImageUrl});
};

// module.exports.updateListing = async (req, res) => {
//     let { id } = req.params;

//     let listing = await Listing.findByIdAndUpdate(
//         id,
//         { ...req.body.listing },
//         { new: true, runValidators: true }
//     );

//     if (req.file) {
//         let url = req.file.path;
//         let filename = req.file.filename;
//         listing.image = { url, filename };
//         await listing.save();
//     }

//     req.flash("success", "Listing Updated!");
//     res.redirect(`/listings/${id}`);
// };
module.exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { location } = req.body.listing;

    // 🔹 Geocode updated location
    const response = await axios.get(
      "https://us1.locationiq.com/v1/search.php",
      {
        params: {
          key: process.env.LOCATIONIQ_KEY,
          q: location,
          format: "json"
        }
      }
    );

    if (!response.data || response.data.length === 0) {
      req.flash("error", "Invalid location");
      return res.redirect(`/listings/${id}/edit`);
    }

    const lat = Number(response.data[0].lat);
    const lon = Number(response.data[0].lon);

    const listing = await Listing.findById(id);

    // Update basic fields
    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.price = req.body.listing.price;
    listing.location = location;
    listing.country = req.body.listing.country;

    // 🔥 Update geometry
    listing.geometry = {
      type: "Point",
      coordinates: [lon, lat]
    };

    await listing.save();

    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);

  } catch (err) {
    next(err);
  }
};
module.exports.deleteListing=async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
  };

module.exports.createListing = async (req, res, next) => {
  try {
    let url = req.file.path;
    let filename = req.file.filename;

    const { location } = req.body.listing;

    // 🔹 Call LocationIQ to get coordinates
    const geoData = await axios.get(
      "https://us1.locationiq.com/v1/search.php",
      {
        params: {
          key: process.env.LOCATIONIQ_KEY,
          q: location,
          format: "json"
        }
      }
    );

    if (!geoData.data || geoData.data.length === 0) {
      req.flash("error", "Invalid location");
      return res.redirect("/listings/new");
    }

    const lat = Number(geoData.data[0].lat);
    const lon = Number(geoData.data[0].lon);

    const newListing = new Listing(req.body.listing);

    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    // 🔥 THIS IS WHAT YOU WERE MISSING
    newListing.geometry = {
      type: "Point",
      coordinates: [lon, lat]   // longitude first
    };

    await newListing.save();

    req.flash("success", "New listing created!");
    res.redirect(`/listings/${newListing._id}`);

  } catch (err) {
    next(err);
  }
};