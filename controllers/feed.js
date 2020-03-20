const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const Post = require("../models/post")
exports.getPosts = (req, res, next) => {
   const currentPage = req.query.page || 1;
   const perPage = 2;
   let totalItems ;
   Post.find().countDocuments()
   .then(count =>{
     totalItems = count;
     return Post.find()
     .skip( (currentPage -1) * perPage)
     .limit(perPage)
   }) 
   .then(posts=>{
    res.status(200).json({
      message:'posts fetched Successfull',
      posts:posts,
      totalItems:totalItems
    })
  })
   .catch(error=>{
    if(!error.statusCode){
      error.statusCode = 500;
    }
    next(error);
  });
 
};

exports.createPost = (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422 // statusCode custom name
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  console.log(title + " " + content)

  if(!req.file){
    const error = new Error('No Image provided');
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path; //path genereted by multer which stores path to image
  // Create post in db
  const post = new Post({
    title: title,
    content: content,
    //imageUrl:'images/duck.jpeg',
    imageUrl:imageUrl,
    creator: { name: "kartik" }
  });
  post.save()
  .then(result=>{
    console.log(result);
    res.status(201).json({
      message: 'Post created successfully!',
      post: result
    });
  })
  .catch(error=>{
    if(!error.statusCode){
      error.statusCode = 500;
    }
    next(error);
  });
};

exports.getPost = (req,res,next)=>{
    const postId =  req.params.postId;
    Post.findById(postId)
    .then(post=>{
      if(!post){
        const error = new Error("Post not found");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({message:'post fetched',post:post})
    })
    .catch(error=>{
      if(!error.statusCode){
        error.statusCode = 500;
      }
      next(error);
    })
}

exports.updatePost = (req,res,next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422 // statusCode custom name
    throw error;
  }
     const postId  = req.params.postId;
     const title   = req.body.title;
     const content = req.body.content;
     const imageUrl =req.body.image;;
     if(req.file){
       imageUrl =  req.file.path;
     }
     if(!imageUrl){
      const error = new Error("Post not found");
      error.statusCode = 422;
        throw error;
    }
    Post.findById(postId)
    .then(post =>{
      if(!post){
        const error = new Error('Post not Found');
        error.statusCode = 404 // statusCode custom name
        throw error;
      }
       if(imageUrl!== post.imageUrl){
         clearImage(post.imageUrl)
       }
       post.title = title;
       post.imageUrl = imageUrl;
       post.content = content;
       return post.save();
    })
    .then(result=>{
      res.status(200).json({message:"Updated",post:result})
    })
    .catch(error =>{
      if(!error.statusCode){
        error.statusCode = 500;
      }
      next(error);
    })
}

exports.deletePost = (req,res,next)=>{
    const postId = req.params.postId;
    Post.findById(postId)
    .then(post=>{
      if(!post){
        const error = new Error('Post not Found');
        error.statusCode = 404 // statusCode custom name
        throw error;
      }
       //check user loggedin
      clearImage(post.imageUrl);
       return Post.findByIdAndRemove(postId)
       .then(result=>{
         console.log(result)
         res.status(200).json({message:"Deleted"})
       })
    })
    .catch(error=>{
      if(!error.statusCode){
        error.statusCode = 500;
      }
      next(error);
    })
}

const clearImage =  filepath => {
  filepath = path.join(__dirname,'..',filepath);
  fs.unlink(filepath, err=>console.log(err));
}