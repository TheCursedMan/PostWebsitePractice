const express = require('express');
const db = require('../db')
const router = express.Router();
const dayjs = require('dayjs');
var localizedFormat = require("dayjs/plugin/localizedFormat");


dayjs.extend(localizedFormat)

router.get('/' , async (req , res)=>{
    let allPosts = [];
    try{
        allPosts = await db.select('post.idPost' , 'post.title' , 'post.from' , 'post.createdAt')
                            .count('postcomment.idComment as CommentCount')
                            .from('post')
                            .leftJoin('postcomment' , 'post.idPost' , 'postcomment.postId')
                            .groupBy('post.idPost')
                            .orderBy('post.idPost' , 'asc')
        allPosts = allPosts.map(post =>{
            const createdAt = dayjs(post.createdAt).format('L -- LT')
            return {...post , createdAt}
        });
                            
    }
    catch(error){
        console.log(error.message)
    }
    
    res.render('homepage' , {allPosts})
})

module.exports = router;