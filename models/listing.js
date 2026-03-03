const mongoose = require("mongoose");
// const { listingSchema } = require("../schema");
const Schema=mongoose.Schema;
const Review=require("./review.js")
const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  price: Number,
  location: String,
  country: String,
   geometry: {
  type: {
    type: String,
    enum: ["Point"],
    default: "Point"
  },
  coordinates: {
    type: [Number],
    default: [77.5946, 12.9716]   // Default = Bangalore
  }
},
  reviews:[{
type: Schema.Types.ObjectId,
ref:"Review",
  },
  ],
  owner:{
type:Schema.Types.ObjectId,
ref:"User",
  },
 image: {
  url: String,
  filename: String
},});

  listingSchema.post("findOneAndDelete",async (listing)=>{
    if(listing){
      await Review.deleteMany({_id:{$in: listing.reviews }});
    }

  });



module.exports = mongoose.model("Listing", listingSchema);
