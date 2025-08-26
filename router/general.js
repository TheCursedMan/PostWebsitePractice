const express = require('express');
const router = express.Router();
const connectDB = require('../db');
const dayjs = require('dayjs');
var localizedFormat = require("dayjs/plugin/localizedFormat");


dayjs.extend(localizedFormat)

router.get('/' , async (req , res)=>{
    let allPosts = [];

    try{
        const db = await connectDB()
        allPosts = await db.collection('post').aggregate([
                        {
                            $lookup: {
                                from: 'postcomment', // collection name
                                localField: 'idPost',
                                foreignField: 'postId',
                                as: 'comments'
                            }
                        },
                        {
                            $addFields: {
                                CommentCount: { $size: '$comments' }
                            }
                        },
                        {
                            $project: {
                                idPost: 1,
                                title: 1,
                                from: 1,
                                createdAt: 1,
                                CommentCount: 1
                            }
                        },
                        { $sort: { idPost: 1 } }
                    ]).toArray();
        allPosts = allPosts.map(post =>{
            const createdAt = dayjs(post.createdAt).format('L -- LT')
            const idStr = post._id.toHexString();
            return {...post , createdAt}
        });
        console.log(allPosts[0])
    }
    catch(error){
        console.log(error.message)
    }
    
    res.render('homepage' , {allPosts})
})

module.exports = router;