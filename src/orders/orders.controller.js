const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function list(req, res, next) {
    res.send({ data: orders })
}

function validateBodyDataExists(req, res, next){
    if(req.body.data) {
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
        } else{
            next({
                status: 400,
                message: `Order must include a ${prop}`
            })
        }
    }
}

function validateNewOrderObj(req, res, next) {
    if(orders.some(o => 
        o.deliverTo === req.body.data.deliverTo &&
        o.mobileNumber === req.body.data.mobileNumber &&
        o.status === req.body.data.status &&
        o.dishes === req.body.data.dishes
        )) {
            next({
                status: 400,
                message: `order already exists`
            })
        } else {
            next();
        }
}

function create(req, res, next) {
    let newOrderObj = {
        id: nextId(),
        deliverTo: req.body.data.deliverTo,
        mobileNumber: req.body.data.mobileNumber,
        status: req.body.data.status,
        dishes: req.body.data.dishes
    }
    orders.push(newOrderObj);
    res.status(201).send({ data: newOrderObj})
}

function validateOrderExists(req, res, next) {
    let { id } = req.params;
    let index = orders.findIndex(o => o.id === id);
    if (index < 0) {
        next({
            status: 404,
            message: `Order does not exist: ${id}`
        })
    } else {
        res.locals.index = index;
        next();
    }
}

function update(req, res, next) {
    const { index } = res.locals;
    const updatedData = req.body.data;
    const updatedOrder = {
        ...orders[index],
        ...updatedData
    }
    orders[index] = updatedOrder;
    res.status(200).send({ data: updatedOrder})
}

function read(req, res, next) {
    res.send({ data: orders[res.locals.index]})
}

function destroy(req, res, next) {
    let { index } = res.locals;
    orders.splice(index, 1);

}

function methodNotAllowed(req, res, next) {
    next({
        status: 405,
        message: `method ${req.method} us not allowed on path ${req.originalUrl}`
    })
}

module.exports = {
    list, 
    create: [
        validateBodyDataExists,
        validatorFor('deliverTo'),
        validatorFor('mobileNumber'),
        validatorFor('status'),
        validatorFor('dishes'),
        validateNewOrderObj,
        create
    ],
    update: [validateOrderExists, update],
    read: [validateOrderExists, read],
    destroy: [validateOrderExists, destroy],
    methodNotAllowed
}