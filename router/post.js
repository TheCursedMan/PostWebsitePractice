const express = require('express')
const router = express.Router()
const db = require('../db');
const dayjs = require('dayjs');

async function getPostAndComments(postId){
    let personalPost;
    let postcomments = [];
    try{
        const singleData = await db.select('post.*')
                                .count('postcomment.idComment as CommentCount')
                                .from('post')
                                .leftJoin('postcomment' , 'post.idPost' , 'postcomment.postId')
                                .where('idPost' , postId.toString())
                                .groupBy('post.idPost')
        personalPost = singleData[0];
        personalPost.createdAt = dayjs(personalPost.createdAt).format('DD/MM/YYYY -- HH:mm')
        console.log(personalPost);

        //it will return with array but variable is object it may use this method to solve
        // new parameter = function()
        // personalPost = parameter[0];
        
        postcomments = await db.select('*')
                                .from('postcomment')
                                .where('postId' , postId.toString())
                                .orderBy('createdAt' , 'desc')
        postcomments = postcomments.map(post =>{
            const createdAt = dayjs(post.createdAt).format('DD/MM/YYYY -- HH:mm')
            return {...post , createdAt}
        })
                                
    }catch(error)
    {
        console.log(error)
    }

    const customTitle = !!personalPost ? `${personalPost.title} | ` : 'Not found' ;
    return {personalPost , postcomments, customTitle};
}

router.get('/new' , (req,res)=>{
    res.render('postDiscuss')
})

router.post('/new' , async (req,res)=>{
    console.log(req.body)
    const {title , content , from , accepted} = req.body ?? {};
    try{    
        //validation
        if(!title || !content || !from ){
            throw new Error('missed some data')
        }
        else if(accepted != 'on'){
            throw new Error('Disagree terms')
        }

        //create post
        await db.insert({title , content , from , createdAt: new Date()}).into('post')
        res.redirect('/p/new/done') 

    }catch(error){
        console.log(error)
        let errormessage = 'Something has wrong'
        if(error.message === 'missed some data' ){
            errormessage = "Please type all field"
        }
        else if(error.message = "Disagree term"){
            errormessage = "Please read & check for accept terms"
        }
        res.render('postDiscuss' , {errormessage , value: {title , content , from }})
    }
})

router.get('/new/done', (req, res)=>{
    res.render('postdone')
})


router.get('/:postId', async (req ,res)=>{
    const {postId} = req.params;
    const postData = await getPostAndComments(postId);
    res.render('postId' , postData)
})

router.post('/:postId/comment' ,async (req , res)=>{
    const {postId} = req.params;
    console.log('Post ID:' + postId)
    const {content , from } = req.body ?? {};
    try{    
        //validation
        if(!content || !from ){
            throw new Error('missed some data')
        }
        //create post
        await db.insert({content , from , createdAt: new Date(), postId: +postId} ).into('postcomment')
        res.redirect(`/p/${postId}`) 

    }catch(error){
        console.log(error)
        let errormessage = 'Something has wrong'
        if(error.message === 'missed some data' ){
            errormessage = "Please type all field"
        }
        const postData = await getPostAndComments(postId);
        return res.render('postId' , {...postData ,errormessage , value: {content , from }})
    }
})


module.exports = router;