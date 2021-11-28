const mongoose = require ('mongoose');


const FeedSchema = new mongoose.Schema({



    
    user: {
        type: mongoose.Schema.Types.ObjectID,          //connects post to user
        ref: 'user'
    },

    text: {
        type: String,
        required: true
    },

    name: {             //name of the user so we can keep post if the account is deleted
        type: String
    },
    avatar:{
        type: String
    },
  
  
            upvote: [
                {
                    user: {
                        type: mongoose.Schema.Types.ObjectID,            // user can only vote up or down on a post once. Number cannot increase
                        ref: 'user'
                    }
                }
            ],
            downvote: [
                {
                    user: {
                        type: mongoose.Schema.Types.ObjectID,            // user can only vote up or down on a post once. Number cannot increase
                        ref: 'user'
                    }
                }
            ],

      
    answer: [             
        {
            user: {
                type: mongoose.Schema.Types.ObjectID,         
                ref: 'user'
            } ,
            text: {
                type: String,
                required: true

            },
            avatar: {
                type: String
            },
            date: {
                type: Date,
                default: Date.now
            },
            commentANSW: [               
                {
                  
                    user: {
                        type: mongoose.Schema.Types.ObjectID,         
                        ref: 'user'
                    } ,
                    text: {
                        type: String,
                        required: true
        
                    },
                    avatar: {
                        type: String
                    },
                    date: {
                        type: Date,
                        default: Date.now
                    },
                        comANSWvote: [
                        {
                            user: {
                                type: mongoose.Schema.Types.ObjectID,            // user can only vote up or down on a post once. Number cannot increase
                                ref: 'user'
                            }
                        }
                                    ],
                }
                
            ],

           

        
       
                 upvoteANS: [
                    {
                        user: {
                            type: mongoose.Schema.Types.ObjectID,            // user can only vote up or down on a post once. Number cannot increase
                            ref: 'user'
                        }
                    }
                ],
                downvoteANS: [
                    {
                        user: {
                            type: mongoose.Schema.Types.ObjectID,            // user can only vote up or down on a post once. Number cannot increase
                            ref: 'user'
                        }
                    }
                ],
            
            
    
        supervote: [

            {
                user: {
                    type: mongoose.Schema.Types.ObjectID,
                    ref: 'user'
                }
    
            }
    
    
    
        ],
    
    
    
    
    }
    ],  
    comment: [               
        {
            user: {
                type: mongoose.Schema.Types.ObjectID,         
                ref: 'user'
            } ,
            text: {
                type: String,
                required: true

            },
            avatar: {
                type: String
            },
            date: {
                type: Date,
                default: Date.now
            },
            Comvote: [
                {
                    user: {
                        type: mongoose.Schema.Types.ObjectID,            // user can only vote up or down on a post once. Number cannot increase
                        ref: 'user'
                    }
                }
            ],
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
    

});

module.exports = Feed = mongoose.model('feed',FeedSchema );