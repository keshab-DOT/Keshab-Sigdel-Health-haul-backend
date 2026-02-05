import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    productDescription: { type: String, required: true },
    productPrice: { type: Number, required: true },
    productTotalStockQuantity: { type: Number, required: true },
    productImageUrl: { type: String },
    totalRating: { type: Number},
    category: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref:'User', required: true } //references from user model
},{timestamps:true});


const Product=mongoose.model("Product", productSchema);

export default Product;