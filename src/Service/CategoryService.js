const { SubCategory, Category } = require("../Model/category");

const findById = async (id) => {
    try {
        const category = await Category.findById(id).populate('subcategories', 'name');
        if (!category) throw new Error("Category not found");
        return category;
    } catch (error) {
        throw new Error(error.message || "Failed to fetch Category");
    }
};

const addBulk = async (categoriesData) => {
    try {
        const createdCategories = [];

        for (const cat of categoriesData) {
            const createdSubs = await SubCategory.insertMany(cat.subcategories);
            const subcategoryIds = createdSubs.map(sub => sub._id);

            const newCategory = await Category.create({
                name: cat.name,
                subcategories: subcategoryIds
            });

            const populatedCategory = await findById(newCategory._id);
            createdCategories.push(populatedCategory);
        }

        return createdCategories;
    } catch (error) {
        throw new Error(error.message || "Failed to add bulk categories");
    }
};

const add = async (name, subcategories) => {
    try {
        const createdSubs = await SubCategory.insertMany(subcategories);
        const subcategoryIds = createdSubs.map(sub => sub._id);

        const newCategory = await Category.create({
            name,
            subcategories: subcategoryIds
        });

        return await findById(newCategory._id);
    } catch (error) {
        throw new Error(error.message || "Failed to add Data");
    }
};

const findAllCategory = async () => {
    try {
        return await Category.find().populate('subcategories', 'name icon');
    } catch (error) {
        throw new Error(error.message || "Failed to fetch categories");
    }
};

const updateName = async (id, name) => {
    try {
        const updated = await Category.findByIdAndUpdate(
            id,
            { name },
            { new: true, runValidators: true }
        ).populate('subcategories', 'name');

        if (!updated) throw new Error("Category not found");
        return updated;
    } catch (error) {
        throw new Error(error.message || "Failed to update name");
    }
};

const deleteCategory = async (id) => {
    try {
        const category = await findById(id);

        await SubCategory.deleteMany({ _id: { $in: category.subcategories } });
        await category.deleteOne();

        return category;
    } catch (error) {
        throw new Error(error.message || "Failed to delete category");
    }
};

const addNewSubCategory = async (id, subcategories) => {
    try {
        const category = await findById(id);
        
        const newSubs = await SubCategory.insertMany(subcategories);
        const newSubIds = newSubs.map(sub => sub._id);

        category.subcategories.push(...newSubIds);
        await category.save();

        return await findById(id);
    } catch (error) {
        throw new Error(error.message || "Failed to add subcategories");
    }
};

const removeSubCategory = async (id, subId) => {
    try {
        const category = await findById(id);

        category.subcategories = category.subcategories.filter(
            sub => sub.toString() !== subId
        );
        await category.save();

        await SubCategory.findByIdAndDelete(subId);

        return await findById(id);
    } catch (error) {
        throw new Error(error.message || "Failed to remove subcategory");
    }
};

module.exports = {
    addBulk,
    add,
    findAllCategory,
    findById,
    updateName,
    deleteCategory,
    addNewSubCategory,
    removeSubCategory
};
