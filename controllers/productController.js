import Product from "../models/productModel.js"

//creat product api
export const createProduct = async (req, res) => {
    const userId=req.user.id;
    const { productName, productDescription, productPrice, productTotalStockQuantity, totalRating, category } = req.body;

    
    let productImageUrl;
    if (req.file) {
        productImageUrl = `${req.file.filename}`
    }

    const existingProducts= await Product.findOne({productName})
    if(existingProducts){
         res.status(400).json({ message: "Product name must be unique "})
    }

    const products = await Product.create({
        productName,
        productDescription,
        productPrice,
        productTotalStockQuantity,
        productImageUrl,
        totalRating,
        category,
        userId
    })
    res.status(200).json({ message: "Product created successfully", data: products })
}

//fetch all products
export const getAllProducts = async (req, res) => {
    const products = await Product.find();
    res.status(200).json({ message: "Product fetch successfully", data: products })

}


//single product
export const fetchSingleProduct = async (req, res) => {
    const { id } = req.params;
    const products = await Product.findById(id);
    if (!products) {
        return res.status(404).json({ message: "Product not found" })
    }
    res.status(200).json({ message: " Single product fetch successfull", data: products })
}

//update product
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { productName, productDescription, productPrice, productTotalStockQuantity, totalRating, category } = req.body;
    let productImageUrl;
    if (req.file) {
        productImageUrl = `${req.file.filename}`
    }

    const updateProduct = await Product.findByIdAndUpdate(id, { productName, productDescription, productPrice, productTotalStockQuantity, totalRating, category, productImageUrl }, { new: true })
    if (!updateProduct) {
        return res.status(404).json({ message: "Product not found" })
    }
    res.status(200).json({ message: "Product update successfully", data: updateProduct })
}

//delete product
export const deleteProduct= async(req, res)=>{
    const{id}=req.params;
    const products= await Product.findByIdAndDelete(id);
    if(!products){
        return res.status(404).json({ message: "Product not found" })
    }
    res.status(200).json({ message: "Product deleted successfully"})

}

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;

  if (!category) {
    return res.status(400).json({ message: "Category is required" });
  }

  // Use case-insensitive regex to match category
  const products = await Product.find({ category: { $regex: new RegExp(`^${category}$`, "i") } });

  if (products.length === 0) {
    return res.status(404).json({ message: `No products found for category: ${category}` });
  }

  res.status(200).json({ message: "Products fetched successfully", data: products });
};