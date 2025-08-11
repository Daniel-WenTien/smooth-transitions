const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes for each page
app.get('/', (req, res) => {
    res.render('layout', {
        page: 'welcome',
        pageIndex: 0,
        title: 'Welcome - Smooth Transitions'
    });
});

app.get('/animations', (req, res) => {
    res.render('layout', {
        page: 'animations',
        pageIndex: 1,
        title: 'Smooth Animations'
    });
});

app.get('/effects', (req, res) => {
    res.render('layout', {
        page: 'effects',
        pageIndex: 2,
        title: 'Multiple Effects'
    });
});

app.get('/interaction', (req, res) => {
    res.render('layout', {
        page: 'interaction',
        pageIndex: 3,
        title: 'Touch & Click'
    });
});

app.get('/ready', (req, res) => {
    res.render('layout', {
        page: 'ready',
        pageIndex: 4,
        title: 'Ready to Use'
    });
});

// API route for AJAX transitions
app.get('/api/page/:pageId', (req, res) => {
    const pageId = req.params.pageId;
    const pages = ['welcome', 'animations', 'effects', 'interaction', 'ready'];
    
    if (pages.includes(pageId)) {
        res.render(`pages/${pageId}`, (err, html) => {
            if (err) {
                return res.status(404).json({ error: 'Page not found' });
            }
            res.json({ html, pageId });
        });
    } else {
        res.status(404).json({ error: 'Page not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});