const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res, next) {
    res.send({ data: dishes })
}

function validateBodyDataExists(req, res, next){
    if (req.body.data) {
        next();
    } else {
        next({
            status: 400,
            message: 'request body must have a data key'
        })
    }
}

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
function validatePrice(req, res, next){
    if(Number(req.body.data.price) < 0) {
            next({
                status: 400,
                message: `price`
            })
        } else {
            next();
        }
}

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
    let { id } = req.params;
    let index = dishes.findIndex(d => d.id === id);
    //findIndex returns -1 if the index isnt found
    if (index < 0) {
        next({
            status: 404,
            message: `Dish does not exist: ${id}`
        })
    } else {
        //located and saved in res.locals as res.locals.index
        res.locals.index = index;
        next();
    }
}

function validatesDishIdRoute(req, res, next) {
    const dishId = req.params.dishId;
    const {data: {id} = {}} = req.body;

    if (dishId !== id) {
        next({
            status: 400,
            message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
        })
    } else {
        next();
    }
}

function update(req, res, next) {
    const { index } = res.locals;
    const updatedData = req.body.data;
    const { id: dishId } = dishes[index];
    const { price } = updatedData;

    if (price !== undefined && price < 0) {
        return next({
          status: 400,
          message: 'Price cannot be less than zero.'
        });
      }

    if (!dishId) {
        return next({
            status: 404,
            message: `Dish does not exist: ${dishId}`
        });
    }

    // if (updatedData.id && updatedData.id !== dishId) {
    //     return next({
    //         status: 400,
    //         message: `Dish id does not match route id. Dish: ${updatedData.id}, Route: ${dishId}`
    //     });
    // }

    const updatedDish = {
        ...dishes[index],
        ...updatedData
    };

    dishes[index] = updatedDish;

    res.status(200).send({ data: updatedDish });
}

function read(req, res, next){
    res.send({ data: dishes[res.locals.index] })
}

function destroy(req, res, next){
    let { index } = res.locals;
    dishes.splice(index, 1);
    res.status(204).send();
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
        validateBodyDataExists,
        validatorFor('name'),
        validatorFor('description'),
        validatorFor('price'),
        validatePrice,
        validatorFor('image_url'),
        validateNewDishObj,
        create
    ],
    update: [validateDishExists,validatorFor('name'),
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