import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user_route.js';
import authRoutes from './routes/auth.route.js';
import postRoutes from'./routes/post.route.js';
import cookieParser from 'cookie-parser';
import commentRoutes from './routes/comment.route.js'



// Load environment variables from .env file
dotenv.config();


// MongoDB Connection
mongoose.connect(process.env.MONGO)
.then(() => {
    console.log('Mongodb is connected ')

})
.catch((err) => {
    console.log(err)
});

// Initialize Express
const app = express();

app.use(express.json());

app.use(cookieParser());



  
app.listen(3000, () => {
    console.log('server is running on port 3000')
})


app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/post', postRoutes);
app.use('/api/comment', commentRoutes)


app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message = err.message || 'internal srver error';
    res.status(statusCode).json({
        success: false,
        statusCode,
        message
    });
});