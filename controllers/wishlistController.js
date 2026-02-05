import Wishlist from "../models/addToWishlistModel.js"
import Product from "../models/productModel.js"
import User from "../models/userModel.js";

export const addToWishList = async (req, res) => {
    const userId = req.user.id;  //
    const { productId } = req.body; //

    const product = await Product.findById(productId);
    if (!product) {
        return res.status(400).json({ message: " Product not found" });
    }

    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
        wishlist = await Wishlist.create({ userId, products: productId })
    } else {
        if (wishlist.products.includes(productId)) {
            return res.status(400).json({ message: " Product already in wishlist" })
        }
        wishlist.products.push(productId);
        await wishlist.save();
    }
    res.status(200).json({ message: "Product is successfully added on the wishlist" })
}

//get wishlist 
export const getWishlist=async(req, res)=>{
    const userId=req.user.id;
    const wishlist=await Wishlist.findOne({userId}).populate("products");
    res.status(200).json({message : "Wishlist successfully fetched", data:wishlist});
}

//remove from wishlist
export const removeProductFromWhishlist= async(req, res)=>{
    const userId=req.user.id;
    const {productId} =req.body;

   const existingProduct=await Wishlist.findOne({products :productId});
   if(!existingProduct){
     return res.status(400).json({ message: "ProdcutId not found" })
   }
    const wishlist=await Wishlist.findOneAndUpdate({userId}, {$pull : {products :productId}}, {new :true});

    if(!wishlist){
         return res.status(400).json({ message: "Wishlist not found" })

    }
    res.status(200).json({message : "Product is successfully removed from the wishlist", data:wishlist});
}

