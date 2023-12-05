const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
// List the existing dishes
function list(req, res, next) {
    res.send({ data: dishes })
}

function validateBodyData(req, res, next){
    if (req.body.data) {
        next();
    } else {
        next({
            status: 400,
            message: 'request body must have a data key'
        })
    }
}

// Validates properties are present w/in data
function validatorFor(prop) {
    return function (req, res, next) {
        if(req.body.data[prop]) {
            next();
        } else {
            next({
                status: 400,
                message: `Dish must include a ${prop}`
            })
        }
    }
}

//Validates price's datatype = number && > 0
function validatePrice(req, res, next){
    if((req.body.data.price) < 0 || typeof(req.body.data.price ) !== 'number'){
            next({
                status: 400,
                message: `price`
            })
        } else {
            next();
        }
}

//validate dish doesn't already exist
function validateNewDishObj(req, res, next) {
    if (dishes.some(d => 
        d.name === req.body.data.name &&
        d.description === req.body.data.description &&
        d.price === req.body.data.price &&
        d.image_url === req.body.data.image_url
        )) {
            next({
                status: 400,
                message: `we already have that dish object`
            })
        } else {
            next();
        }
}

function create(req, res, next) {
    let newDishObj = {
        id: nextId(),
        name: req.body.data.name,
        description: req.body.data.description,
        price: Number(req.body.data.price),
        image_url: req.body.data.image_url
    }
    dishes.push(newDishObj);
    res.status(201).send({ data: newDishObj })
}

//validate dish exists
function validateDishExists(req, res, next) { 
    const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  return next({
    status: 404,
    message: `Dish does not exist: ${dishId}.`,
  });
  }

// validates route's params matches dishId
function validatesDishIdRoute(req, res, next) { 
    const { dishId } = req.params;
    const { data: { id } = {} } = req.body;

    if (!id || id === dishId) {
        return next();
    }
    return next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
    
  }

function update(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    const { data: { id, name, description, price, image_url } = {} } = req.body;

    if (foundDish) {
        foundDish.name = name;
        foundDish.description = description;
        foundDish.price = price;
        foundDish.image_url = image_url;
        res.json({ data: foundDish });
    }
}

// list the dishes based on the id
function read(req, res, next){
    res.send({ data: res.locals.dish })
}

// Delete the dishes based on the id
function destroy(req, res, next){
    const { dishId } = req.params;
    const index = dishes.indexOf((dish) => dish.id === dishId);
    if (index < 0) {
        next({
            status: 400,
            message: `Dish's ${dishId} doesn't match dish.id`
        })
    } else {
        dishes.splice(index, 1);
        res.sendStatus(204);
        
    }
}
function methodNotAllowed(req, res, next) {
    next({
        status: 405,
        message: `method ${req.method} is not allowed on path ${req.originalUrl}`
    })
}

module.exports = {
    list,
    create: [
        validateBodyData,
        validatorFor('name'),
        validatorFor('description'),
        validatorFor('price'),
        validatePrice,
        validatorFor('image_url'),
        validateNewDishObj,
        create
    ],
    update: [validateDishExists,
             validatorFor('name'),
             validatorFor('description'),
             validatorFor('price'),
             validatePrice,
             validatorFor('image_url'),
             validatesDishIdRoute, 
             update
    ],
    read: [validateDishExists, read],
    destroy: [validateDishExists, destroy],
    methodNotAllowed 
}