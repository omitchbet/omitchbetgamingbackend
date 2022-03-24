export const checkExist = async (fieldValue, model) => {
  const response = await model.findOne({ fieldValue });

  if (response) return true;
  else return false;
};
