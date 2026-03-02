import Category from "../models/categoryModel.js";

// Create category
export const createCategory = async (req, res) => {
  const { categoryName } = req.body;

  let categoryImageUrl;
  if (req.file) {
    categoryImageUrl = req.file.filename;
  }

  const existingCategory = await Category.findOne({ categoryName });
  if (existingCategory) {
    return res.status(400).json({ message: "Category name must be unique" });
  }

  const category = await Category.create({ categoryName, categoryImageUrl });
  res.status(200).json({ message: "Category created successfully", data: category });
};

// Fetch all categories
export const getAllCategory = async (req, res) => {
  const category = await Category.find();
  res.status(200).json({ message: "Category fetched successfully", data: category });
};

// Fetch single category
export const fetchSingleCategory = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  res.status(200).json({ message: "Single category fetched successfully", data: category });
};

// Update category
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { categoryName } = req.body;

  let updateData = { categoryName };
  if (req.file) {
    updateData.categoryImageUrl = req.file.filename;
  }

  const updatedCategory = await Category.findByIdAndUpdate(id, updateData, { new: true });
  if (!updatedCategory) {
    return res.status(404).json({ message: "Category not found" });
  }
  res.status(200).json({ message: "Category updated successfully", data: updatedCategory });
};

// Delete category
export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  res.status(200).json({ message: "Category deleted successfully" });
};