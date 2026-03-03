const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
// const {reviewSchema}=require("../schema.js");
// const ExpressError=require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing=require("../models/listing.js")
const {validateReview,isLoggedIn, isReviewAuthor}=require("../middleware.js");
const reviewController=require("../controllers/reviews.js");
//reviews
//post route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));

// router.delete("/:reviewId", wrapAsync(async (req, res) => {
//     let { id, reviewId } = req.params;

//     // Remove review reference from Listing
//     await Listing.findByIdAndUpdate(id, {
//         $pull: { reviews: reviewId }
//     });

//     // Delete review from Review collection
//     await Review.findByIdAndDelete(reviewId);

//     res.redirect(`/listings/${id}`);
// }));
// router.delete("/:reviewId/remove-ref",isLoggedIn,isReviewAuthor, wrapAsync(async (req, res) => {
//     let { id, reviewId } = req.params;

//     // Remove review reference from Listing
//     await Listing.findByIdAndUpdate(id, {
//         $pull: { reviews: reviewId }
//     });

//     res.redirect(`/listings/${id}`);
// }));
// router.delete("/:reviewId", wrapAsync(async (req, res) => {
//     let { id, reviewId } = req.params;

//     // Delete review from Review collection
//     await Review.findByIdAndDelete(reviewId);
//     req.flash("success","Review Deleted!");

//     res.redirect(`/listings/${id}`);
// }));
router.delete("/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.deleteReview)
);
module.exports=router;