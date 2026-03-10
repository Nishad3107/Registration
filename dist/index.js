"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const path_1 = __importDefault(require("path"));
const knex_1 = __importDefault(require("knex"));
const cors_1 = __importDefault(require("cors"));
// Load knex configuration
const knexConfig = require('../knexfile');
// Initialize knex for development environment
const db = (0, knex_1.default)(knexConfig.development);
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// -------- MIDDLEWARE --------
app.use((0, cors_1.default)());
app.use(express_1.default.json()); // For API endpoints
app.use(express_1.default.urlencoded({ extended: true })); // For form submissions
app.use(express_1.default.static(path_1.default.join(__dirname, '../views')));
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Session middleware
// Note: In production, you'd use a proper session store and a long, random secret.
app.use((0, express_session_1.default)({
    secret: 'a-super-secret-key-that-should-be-in-env',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 3600000 } // 1 hour
}));
// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        next();
    }
    else {
        res.redirect('/login');
    }
};
// -------- ROUTES --------
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../views/index.html'));
});
// -------- AUTHENTICATION ROUTES --------
// Show signup page
app.get('/signup', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../views/signup.html'));
});
// Handle signup
app.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }
    try {
        const [existingUser] = yield db('organizers').where('email', email);
        if (existingUser) {
            return res.status(400).json({ error: 'An account with this email already exists.' });
        }
        const password_hash = yield bcryptjs_1.default.hash(password, 10);
        const [newOrganizerId] = yield db('organizers').insert({ email, password_hash });
        req.session.userId = newOrganizerId;
        res.redirect('/dashboard');
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred during signup.' });
    }
}));
// Show login page
app.get('/login', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../views/login.html'));
});
// Handle login
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }
    try {
        const [organizer] = yield db('organizers').where('email', email);
        if (organizer && (yield bcryptjs_1.default.compare(password, organizer.password_hash))) {
            req.session.userId = organizer.id;
            res.redirect('/dashboard');
        }
        else {
            res.status(401).json({ error: 'Invalid email or password.' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred during login.' });
    }
}));
// Handle logout
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/dashboard');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});
// -------- FORM ROUTES --------
// Show the page to create a new form
app.get('/forms/new', isAuthenticated, (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../views/new-form.html'));
});
// Generate a unique slug from a title
const generateSlug = (title) => __awaiter(void 0, void 0, void 0, function* () {
    let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let isUnique = false;
    while (!isUnique) {
        const [existing] = yield db('forms').where('slug', slug);
        if (existing) {
            slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
        }
        else {
            isUnique = true;
        }
    }
    return slug;
});
// Handle the creation of a new form
app.post('/forms', isAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, fields } = req.body;
    const organizer_id = req.session.userId;
    if (!title || !fields) {
        return res.status(400).send('Title and fields are required.');
    }
    try {
        const slug = yield generateSlug(title);
        yield db('forms').insert({
            organizer_id,
            title,
            description,
            slug,
            fields: JSON.stringify(fields)
        });
        res.redirect('/dashboard');
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Error creating the form.');
    }
}));
// View a specific form
app.get('/forms/:slug', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [form] = yield db('forms').where('slug', req.params.slug);
        if (!form) {
            return res.status(404).send('Form not found.');
        }
        res.sendFile(path_1.default.join(__dirname, '../views/view-form.html'));
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving form.');
    }
}));
// Handle submission for a specific form
app.post('/forms/submit/:formId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const formId = parseInt(req.params.formId, 10);
        const submissionData = req.body;
        const [form] = yield db('forms').where('id', formId);
        if (!form) {
            return res.status(404).json({ message: 'The target form does not exist.' });
        }
        yield db('submissions').insert({
            form_id: formId,
            data: JSON.stringify(submissionData)
        });
        res.status(201).json({
            message: `Registration successful! Your submission has been recorded.`
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to record submission.' });
    }
}));
// View submissions for a form
app.get('/forms/:formId/submissions', isAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const formId = parseInt(req.params.formId, 10);
        const [form] = yield db('forms').where('id', formId).andWhere('organizer_id', req.session.userId);
        if (!form) {
            return res.status(404).send('Form not found or you do not have permission to view it.');
        }
        res.sendFile(path_1.default.join(__dirname, '../views/view-submissions.html'));
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving submissions.');
    }
}));
// -------- PROTECTED ROUTES --------
app.get('/dashboard', isAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [user] = yield db('organizers').where('id', req.session.userId);
        if (!user) {
            return res.redirect('/login');
        }
        res.sendFile(path_1.default.join(__dirname, '../views/dashboard.html'));
    }
    catch (error) {
        console.error(error);
        res.redirect('/login');
    }
}));
// -------- API ROUTES --------
// API endpoint for dashboard data
app.get('/api/dashboard', isAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [user] = yield db('organizers').where('id', req.session.userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        const forms = yield db('forms').where('organizer_id', req.session.userId);
        res.json({ user, forms });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching dashboard data' });
    }
}));
// API endpoint for form data
app.get('/api/forms/:slug', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [form] = yield db('forms').where('slug', req.params.slug);
        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }
        const fields = JSON.parse(form.fields);
        res.json({ form, fields });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving form' });
    }
}));
// API endpoint for submissions data
app.get('/api/forms/:formId/submissions', isAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const formId = parseInt(req.params.formId, 10);
        const [form] = yield db('forms').where('id', formId).andWhere('organizer_id', req.session.userId);
        if (!form) {
            return res.status(404).json({ error: 'Form not found or you do not have permission to view it.' });
        }
        const submissions = yield db('submissions').where('form_id', formId);
        const fields = JSON.parse(form.fields);
        res.json({ form, submissions, fields });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving submissions' });
    }
}));
// -------- SERVER START --------
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
