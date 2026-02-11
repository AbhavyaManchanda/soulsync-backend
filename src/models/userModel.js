const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false // This prevents the password from being returned in API responses
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

// --- ENCRYPTION MIDDLEWARE ---
// Hash the password before saving the user document
//ensures that your business logic (hashing) is decoupled from your controller.
userSchema.pre('save', async function() {
  // 1. Only run this function if password was actually modified
  if (!this.isModified('password')) return ;

  // 2. Hash the password
  this.password = await bcrypt.hash(this.password, 12);

  // 3. Delete passwordConfirm field
  this.passwordConfirm = undefined;

  // next(); // No need to call next() in pre('save') when using async/await
});


// --- INSTANCE METHOD ---
// We'll use this later to check if a password is correct during login
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;