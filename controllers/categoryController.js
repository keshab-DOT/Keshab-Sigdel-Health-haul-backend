import Category from "../models/categoryModel.js";

// Create category API with image upload
export const createCategory = async (req, res) => {
    const userId = req.user.id;
    const { categoryName } = req.body;

    let categoryImageUrl;
    if (req.file) {
        categoryImageUrl = req.file.filename;  
    }

    console.log(categoryImageUrl)
    const existingCategory = await Category.findOne({ categoryName });
    if (existingCategory) {
        return res.status(400).json({ message: "Category name must be unique" });
    }

    const category = await Category.create({
        categoryName,
        categoryImageUrl, 
        userId
    });

    res.status(200).json({ message: "Category created successfully", data: category });
};



//fetch all category
export const getAllCategory = async (req, res) => {
    const category = await Category.find();
    res.status(200).json({ message: "Category fetch successfully", data: category })

}


//single product
export const fetchSingleCategory = async (req, res) => {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
        return res.status(404).json({ message: "Category not found" })
    }
    res.status(200).json({ message: " Single product fetch successfull", data: category })
}

//update product
export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { categoryName } = req.body;

    const updateCategory = await Category.findByIdAndUpdate(id, { categoryName }, { new: true })
    if (!updateCategory) {
        return res.status(404).json({ message: "Category not found" })
    }
    res.status(200).json({ message: "Category update successfully", data: updateCategory })
}

//delete product
export const deleteCategory= async(req, res)=>{
    const{id}=req.params;
    const category= await Category.findByIdAndDelete(id);
    if(!category){
        return res.status(404).json({ message: "Category not found" })
    }
    res.status(200).json({ message: "Category deleted successfully"})

}

//mongodb atlas login
//ani try to replace the local url to online