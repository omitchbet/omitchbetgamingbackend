import { generateSHA256, generateSignature } from "./jsonWebToken.js";

function sortObjectRecursive(obj) {
  var keys = Object.keys(obj).sort();
  var sortedObject = {};
  keys.forEach((key) => {
    let value = obj[key];
    if (value instanceof Object || value instanceof Array) {
      sortedObject[key] = sortObjectRecursive(value);
    } else {
      sortedObject[key] = value;
    }
  });
  return sortedObject;
}

function implodeRecursive(obj, separator = "") {
  var str = "";

  for (let key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }

    let value = obj[key];
    if (value instanceof Object || value instanceof Array) {
      str += implodeRecursive(value, separator) + separator;
    } else {
      str += value + separator;
    }
  }

  return str.substring(0, str.length - separator.length);
}

export function generateEvenbetSig(allParams) {
  // Step 1. Get the required data
  //   var allParams = {}; // Query parameters
  const SECRET_KEY = "fj9PRuavNPRjofMjmtoPDFZePEYyF8"; // Your secret key

  // Step 2. Delete the parameter 'clientId' from array with query parameters
  if (allParams.hasOwnProperty("clientId")) {
    delete allParams["clientId"];
  }

  // Step 3. Sort the parameters
  allParams = sortObjectRecursive(allParams);

  // Step 4. Concatenate the parameters into a string
  var paramString = implodeRecursive(allParams);

  // Step 5. Add a secret key to the string
  paramString = paramString + SECRET_KEY;

  // Step 6. Generate a signature using the SHA256 algorithm
  var sign = generateSHA256(paramString);

  return sign;
}
