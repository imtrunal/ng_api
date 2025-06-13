const Statistics = require("../Model/statistics");


async function incrementTotalCount(field, count) {
  try {
    await Statistics.findOneAndUpdate(
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
    await Statistics.findOneAndUpdate(
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
