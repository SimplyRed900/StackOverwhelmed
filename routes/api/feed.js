const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const request = require('superagent');
const auth = require('../../middleware/auth');


const Feed = require('../../modules/Feed');
const User = require('../../modules/User');
const Profile = require('../../modules/Profile');

// @route       GET api/feed
// @description Test route
// @access      Private             //this section is for posts to be added to the feed by a user
router.post('/',[auth,[
    check('text','Text Required').not().isEmpty()
]],
async  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    try{
    const user = await User.findById(req.user.id).select('-password');

    const newFeedPOST = new Feed({
        text: req.body.maxChar(text),
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
    });

    const feedP = await newFeedPOST.save();

    res.json(feedP);

    }
    catch (err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
    

});




// @route       GET api/feed
// @description get all posts
// @access      Private         //why? because you cant see the posts page unless you have an account

router.get('/', auth,async (req,res) => {


    try{

                const feedposts = await Feed.find().sort({
                    date: -1                //most recent first
                });
                res.json(feedposts);

    } catch (err)
    {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});





// @route       GET api/feed/:id
// @description get feed posts by ID
// @access      Private         //why? because you cant see the posts page unless you have an account

router.get('/:id', auth,async (req,res) => {


    try{

                const feedpost = await Feed.findById(req.params.id);

                if (!feedpost){
                    return res.status(404).json({msg: 'Post not found'});
                }


                res.json(feedpost);

    } catch (err)
    {
        console.error(err.message);


        if (err.kind === 'ObjectId'){
            return res.status(404).json({msg: 'Post not found'});
        }


        res.status(500).send('Server Error');
    }
});




// @route       DELETE api/feed/:id
// @description delete post from user based on their ID
// @access      Private         //why? because you cant see the posts page unless you have an account

router.get('/:id', auth,async (req,res) => {


    try{

                const feedpost = await Feed.findById(req.params.id);
                
                if (!feedpost){
                    return res.status(404).json({msg: 'Post not found'});
                }
                        //check user

                        if(feedpost.user.toString() !== req.user.id){

                            return res.status(401).json({msg: 'User not authorized'});
                        }
                            await feedpost.remove();

                        res.json({msg: 'Feed Post removed'});



    } catch (err)
    {
        if (err.kind === 'ObjectId'){
            return res.status(404).json({msg: 'Post not found'});
        }
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});




// @route       PUT api/feed/votes/:id
// @description vote on a post
// @access      Private        

router.put('/comment/vote/:id', auth, async (req,res) =>{                   //this forces only comments or answers to have votes allowed
    try{

            const feedpost = await Feed.findById(req.params.id);

            // Check if the post has been voted on by this user
           

            if(feedpost.votes.filter(vote => vote.user.toString() === req.user.id).length > 0){          //if greater than 0, then theyve used their vote

                    return res.status(400).json({msg: 'You have exceeded your limit of votes for this post'});
            }
            feedpost.votes.unshift({user: req.user.id});

            await feedpost.save();              //saves this value back into the database linked to the post id

            res.json(feedpost.votes);


    }
    catch (err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});






//the following will remove the upvote and downvote and save that value back into the array








// @route       PUT api/feed/undownvote/:id
// @description unvote on a post
// @access      Private                             //if this doesnt work then remove one and change Feed.js in modules to just "votes:"

router.put('/comment/unvote/:id', auth, async (req,res) =>{             //this forces only comments or answers to have votes allowed
    try{

            const feedpost = await Feed.findById(req.params.id);

            // Check if the post has been voted on by this user
           

            if(feedpost.votes.filter(vote => vote.user.toString() === req.user.id).length ===0){          //if greater than 0, then theyve used their downvote

                    return res.status(400).json({msg: 'You have not used your downvote yet for this post'});
                                }
            
               const removeIndex = feedpost.votes.map(vote => vote.user.toString()).indexOf(req.user.id);

               feedpost.votes.splice(removeIndex, 1);

            await feedpost.save();              //saves this value back into the database linked to the post id

            res.json(feedpost.votes);


    }
    catch (err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});





//HERE WE WILL ALLOW ANSWERS TO SPECIFIC POSTS







// @route       POST api/feed/comment/:id
// @description Respond or comment on post
// @access      Private        

router.post('/comment/:id',[auth,[
    check('text','Text Required').not().isEmpty()
]],
async  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }


    try{
const user = await User.findById(req.user.id).select('-password');
const feedcom = await Feed.findById(req.params.id);



    const newcomment =  {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
    }


    feedcom.comments.unshift(newcomment);
 
    await feedcom.save();

    res.json(feedcom.comments);

    }
    catch (err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
    

});







// @route       DELETE api/feed/comment/:id/:COMMENT_ID             //need to find which comment to delete
// @description Respond or comment on post
// @access      Private        

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {



    try{

        const feedcom = await Feed.findById(req.params.id);  

        //get comment from post (pull out comment)

        const comment = feedcom.comments.find(comment => comment.id === req.params.comment_id);


            // Make sure comment exists

        if(!comment){
            return res.status(404).json({msg: 'Comment does not exist'});
        }

        //make sure that the user who made the comment is the one deleting it


        if(comment.user.toString() !== req.user.id){
            return res.status(401).json({msg: 'User not authorized to delete comment'});
        }

        //get index to remove comment
        const removeIndex = feedcom.comments.map(comment => comment.user.toString()).indexOf(req.user.id);

        feedcom.comments.splice(removeIndex, 1);

     await feedcom.save();              //saves this value back into the database linked to the post id

     res.json(feedcom.comments);


    }catch(err)
    {
        console.error(err.message);
        res.status(500).send('Server Error');
    }


}
    

);











+function maxChar(element)
{
    var max_chars = 280;

    if(element.value.length > max_chars) {
        element.value = element.value.substr(0, max_chars);
        return res.status(401).json({msg: 'Text has surpassed limit of characters'});

    }
}


//the person who originally posted their question will be able to vote on their favorite answer

 

// @route       PUT api/feed/bestanswer/user/:id           //vote on the best response to YOUR post
// @description vote on best response
// @access      Private        

router.put('/comment/supervote/:id', auth, async (req,res) =>{                   
    try{

            const feedpost = await Feed.findById(req.params.id);

            // Check if the post has been voted on by this user
           
            
            if(user.feedP.id = user.feedpost.id){ 
            





            if(feedpost.bestanswer.filter(vote => vote.user.toString() === req.user.id).length > 0){          //if greater than 0, then theyve used their best answer vote

                    return res.status(400).json({msg: 'You have exceeded your limit of best answer votes for this post'});
            }
            feedpost.bestanswer.unshift({user: req.user.id});

            await feedpost.save();              //saves this value back into the database linked to the post id

            res.json(feedpost.votes);


    }
}
    catch (err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});






//the following will remove the supervote or superdownnvote and save that value back into the array








// @route       PUT api/feed/unsupervote/User/:id
// @description Unsupervote a comment on your post
// @access      Private                             //if this doesnt work then remove one and change Feed.js in modules to just "votes:"

router.put('/comment/unsupervote/:id', auth, async (req,res) =>{             //this forces only comments or answers to have votes allowed
    try{

            const feedpost = await Feed.findById(req.params.id);

            // Check if the post has been voted on by this user
           


            if(user.feedP.id = user.feedpost.id){ 


            if(feedpost.supervotes.filter(vote => vote.user.toString() === req.user.id).length ===0){          //if greater than 0, then theyve used their downvote

                    return res.status(400).json({msg: 'You have not used your downvote yet for this post'});
                                }
            
               const removeIndex = feedpost.supervotes.map(vote => vote.user.toString()).indexOf(req.user.id);

               feedpost.supervotes.splice(removeIndex, 1);

            await feedpost.save();              //saves this value back into the database linked to the post id

            res.json(feedpost.supervotes);


    }
}
    catch (err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});





















// export route
module.exports = router;