'use strict';
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid/v4');

const productsTable = process.env.PRODUCTS_TABLE;
// Create a response
function response(statusCode, message) {
  return {
    statusCode: statusCode,
    body: JSON.stringify(message)
  };
}
function sortByDate(a, b) {
  if (a.createdAt > b.createdAt) {
    return -1;
  } else return 1;
}
// Create a post
module.exports.createProduct = (event, context, callback) => {
  const reqBody = JSON.parse(event.body);


  const product = {
    id: uuid(),
    createdAt: new Date().toISOString(),
    userId: 1,
    title: reqBody.title,
    body: reqBody.body
  };

  return db
    .put({
      TableName: productsTable,
      Item: product
    })
    .promise()
    .then(() => {
      callback(null, response(201, product));
    })
    .catch((err) => response(null, response(err.statusCode, err)));
};
// Get all posts
module.exports.getAllProducts = (event, context, callback) => {
  return db
    .scan({
      TableName: productsTable
    })
    .promise()
    .then((res) => {
      callback(null, response(200, res.Items.sort(sortByDate)));
    })
    .catch((err) => callback(null, response(err.statusCode, err)));
};


// Delete a post
module.exports.deleteProduct = (event, context, callback) => {
  const id = event.pathParameters.id;
  const params = {
    Key: {
      id: id
    },
    TableName: productsTable
  };
  return db
    .delete(params)
    .promise()
    .then(() =>
      callback(null, response(200, { message: 'Post deleted successfully' }))
    )
    .catch((err) => callback(null, response(err.statusCode, err)));
};