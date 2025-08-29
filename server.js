const express = require('express');
const connectDB = require('./config/db');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();

// connect db
connectDB();

// init middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API Running'));

app.use(helmet());

// ✅ tell express to trust proxy headers
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
const cors = require('cors');

app.use(cors({
  origin: ['https://dev-gram-front-ix9h.vercel.app'], // or '*' during testing
  credentials: true
}));


app.use('/api', limiter);

app.use('/api/users', require('./routes/api/users'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on Port ${PORT}`));
