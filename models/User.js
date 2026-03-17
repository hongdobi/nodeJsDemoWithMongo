const mongoose = require('mongoose');
const { hashPassword, verifyPassword } = require('../lib/password');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        maxlength: 50,
    },
    email: {
        type: String,
        trim: true,
        unique: 1,
    },
    password: {
        type: String,
        minlength: 5,
    },
    lastname: {
        type: String,
        maxlength: 50,
    },
    role: {
        type: Number,
        default: 0,
    },
    image: String,
    token: {
        type: String,
    },
    tokenExp: {
        type: Number,
    },
});

userSchema.pre('save', function () {
    if (!this.isModified('password')) return;

    return hashPassword(this.password).then((hashed) => {
        this.password = hashed;
    });
});

userSchema.methods.comparePassword = function (plainPassword) {
    return verifyPassword(plainPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = { User };