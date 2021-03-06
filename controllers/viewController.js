const Tour = require('../models/tourModel')
const User = require('../models/userModel')
const Booking = require('../models/bookingModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('./../utils/appError')

exports.getOverview = catchAsync(async (req, res, next) => {
    // 1. Get tour data from collection
    const tours = await Tour.find()
    // 2. Build template in overview.pug
    // 3. Render that template using tour data from 1.
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    })
})

exports.getTour = catchAsync(async (req, res, next) => {
    // 1. Get the data for the requested tour including reviews and guides
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        select: 'review rating user'
    })
    if(!tour) {
            return next(new AppError('There is no tour with that name.', 404))
    }

    // 2. Build template in tour.png
    // 3. Render template using tour data
    res.status(200)
        .set('Content-Security-Policy', 'connect-src https://*.tiles.mapbox.com https://api.mapbox.com https://events.mapbox.com')
        .render('tour', {
            title: `${tour.name} Tour`,
            tour
        })
})

exports.getLoginForm = (req, res) => {
    res.status(200)
        .set('Content-Security-Policy', "connect-src 'self' https://cdnjs.cloudflare.com")
        .render('login', {
            title: 'Log into your account'
        })
}

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your account'
    })
}

exports.getMyTours = catchAsync(async (req, res, next) => {
    // 1. Find all bookings
    const bookings = await Booking.find({ user: req.user.id })
    // 2. Find tours with the returned Ids
    const tourIDs = bookings.map(el => el.tour.id)
    const tours = await Tour.find({ _id: { $in: tourIDs }})
    res.status(200).render('overview', {
        title: 'My Tours',
        tours
    })
})

exports.updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    }, { new: true, runValidators: true })
    res.status(200).render('account', {
        title: 'Your account',
        user: updatedUser
    })
})