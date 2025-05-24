const TotalCounts = require('../model/Statistics');

async function incrementTotalCount(field, count) {
  try {
    await TotalCounts.findOneAndUpdate(
      {},
      { $inc: { [field]: count } },
      { new: true, upsert: true }
    );
  } catch (error) {
    console.error(`Error incrementing ${field}:`, error);
  }
}

async function decrementTotalCount(field, count) {
  try {
    await TotalCounts.findOneAndUpdate(
      {},
      { $inc: { [field]: count } },
      { new: true, upsert: true }
    );
  } catch (error) {
    console.error(`Error decrementing ${field}:`, error);
  }
}

module.exports = {
  incrementTotalCount,
  decrementTotalCount,
};
