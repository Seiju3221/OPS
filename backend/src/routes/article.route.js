const express = require('express');
const Article = require('../model/article.model.js');
const Comment = require('../model/comment.model.js');
const verifyToken = require('../middleware/verifyToken.js');
const isAdmin = require('../middleware/isAdmin.js');
const router = express.Router();

// create an article
router.post("/create-post", verifyToken, isAdmin, async (req, res) => {
  try {
    const newPost = new Article({...req.body, author: req.userId})
    await newPost.save();
    res.status(201).send({
      message: "Post created successfully",
      post: newPost
    })
  } catch (error) {
    console.error("Error creating post: ", error);
    res.status(500).send({ message: "Error creating post" })
  }
});

// get all articles
router.get('/', async (req, res) => {
  try {
    const {search, category, location} = req.query;

    let query = {}

    if(search) {
      query = {
        ...query,
        $or: [
          {title: {$regex: search, $options: "i"}},
          {content: {$regex: search, $options: "i"}}
        ]
      }
    }

    if(category) {
      query = {
        ...query,
        category
      }
    }

    if(location) {
      query = {
        ...query,
        location
      }
    }

    const posts = await Article.find(query).populate('author', 'email').sort({createdAt: -1});
    res.status(200).send(posts)
  } catch (error) {
    console.error("Error creating post. error");
    res.status(500).send({ message: "Error creating post" })
  }
});

// get single article by id
router.get("/:id", async (req, res) => {
  try {
    const postId = req.params.id
    const post = await Article.findById(postId);
    if(!post) {
      return res.status(404).send({ message: "Post not found" })
    }

    const comments = await Comment.find({postId: postId}).populate('user', "username email")
    res.status(200).send({
      post, comments
    })
  } catch (error) {
    console.error("Error fetching single post: ", error);
    res.status(500).send({ message: "Error fetching single post" })
  }
});

// update an article
router.patch("/update-post/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const postId = req.params.id;
    const updatedPost = await Article.findByIdAndUpdate(postId, {
      ...req.body
    }, {new: true});

    if (!updatedPost) {
      return res.status(404).send({ message: "Post not found" });
    }
    res.status(200).send({
      message: "Post updated successfully",
      post: updatedPost
    })
  } catch (error) {
    console.error("Error updating post: ", error);
    res.status(500).send({ message: "Error updating post" })
  }
});

// delete an article
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Article.findByIdAndDelete(postId);
    if(!post) {
      return res.status(404).send({ message: "Post not found" });
    }

    // delete related comments
    await Comment.deleteMany({postId: postId})

    res.status(200).send({
      message: "Post deleted successfully",
      post: post
    })
  } catch (error) {
    console.error("Error deleting post: ", error);
    res.status(500).send({ message: "Error deleting post" })
  }
})

// related posts
router.get("/related/:id",  async (req, res) => {
  try {
    const {id} = req.params;
    if(!id) {
      return res.status(400).send({ message: "Post id is required" })
    }

    const article = await Article.findById(id);

    if(!article) {
      return res.status(404).send({ message: "Post is not found" })
    }

    const titleRegex = new RegExp(article.title.split(' ').join("|"), "i");

    const relatedQuery = {
      _id: {$ne: id}, // exclude the current post by id
      title: {$regex: titleRegex}
    }

    const relatedPost = await Article.find(relatedQuery)
    res.status(200).send(relatedPost);

  } catch (error) {
    console.error("Error fetching related post: ", error);
    res.status(500).send({ message: "Error fetching related post" })
  }
})

module.exports = router;