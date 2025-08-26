const express = require('express')
const router = express.Router()
const connectDB = require('../db');
const dayjs = require('dayjs');
const {ObjectId} = require('mongodb')

async function getPostAndComments(postId) {
    let personalPost = null;
    let postcomments = [];
    try {
        const db = await connectDB();
        // Find the post
        personalPost = await db.collection('post').findOne({ _id: new ObjectId(postId) });
        if (personalPost) {
            personalPost.createdAt = dayjs(personalPost.createdAt).format('DD/MM/YYYY -- HH:mm');
            // Count comments
            const CommentCount = await db.collection('postcomment').countDocuments({ postId: +postId });
            personalPost.CommentCount = CommentCount;
        }
        // Get comments
        postcomments = await db.collection('postcomment')
            .find({ postId: new ObjectId(postId) })
            .sort({ createdAt : -1})
            .toArray();
        console.log(postcomments[0])
        postcomments = postcomments.map(post => ({
            ...post,
            createdAt: dayjs(post.createdAt).format('DD/MM/YYYY -- HH:mm')
        }));
    } catch (error) {
        console.log(error);
    }
    const customTitle = personalPost ? `${personalPost.title} | ` : 'Not found';
    return { personalPost, postcomments, customTitle };
}

router.get('/new', (req, res) => {
    res.render('postDiscuss');
});

router.post('/new', async (req, res) => {
    const { title, content, from, accepted } = req.body ?? {};
    try {
        if (!title || !content || !from) {
            throw new Error('missed some data');
        } else if (accepted != 'on') {
            throw new Error('Disagree terms');
        }
        const db = await connectDB();
        await db.collection('post').insertOne({
            title,
            content,
            from,
            createdAt: new Date()
        });
        res.redirect('/p/new/done');
    } catch (error) {
        console.log(error);
        let errormessage = 'Something has wrong';
        if (error.message === 'missed some data') {
            errormessage = "Please type all field";
        } else if (error.message === "Disagree terms") {
            errormessage = "Please read & check for accept terms";
        }
        res.render('postDiscuss', { errormessage, value: { title, content, from } });
    }
});

router.get('/new/done', (req, res) => {
    res.render('postdone');
});

router.get('/:postId', async (req, res) => {
    const { postId } = req.params;
    const postData = await getPostAndComments(postId);
    res.render('postId', postData);
});

router.post('/:postId/comment', async (req, res) => {
    const { postId } = req.params;
    const { content, from } = req.body ?? {};
    try {
        if (!content || !from) {
            throw new Error('missed some data');
        }
        const db = await connectDB();
        await db.collection('postcomment').insertOne({
            content,
            from,
            createdAt: new Date(),
            postId: new ObjectId(postId)
        });
        res.redirect(`/p/${postId}`);
    } catch (error) {
        console.log(error);
        let errormessage = 'Something has wrong';
        if (error.message === 'missed some data') {
            errormessage = "Please type all field";
        }
        const postData = await getPostAndComments(postId);
        return res.render('postId', { ...postData, errormessage, value: { content, from } });
    }
});

module.exports = router;