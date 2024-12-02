const express = require('express');
const Article = require('../model/article.model.js');
const Comment = require('../model/comment.model.js');
const Notification = require('../model/notification.model.js');
const verifyToken = require('../middleware/verifyToken.js');
const isAdmin = require('../middleware/isAdmin.js');
const isWriter = require('../middleware/isWriter.js');
const router = express.Router();
const cloudinary = require('../utils/cloudinaryConfig.js');
const multer = require('multer');
const isAdminWriter = require('../middleware/isAdminWriter.js');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create a utility function at the top of your article routes file
const createArticleNotification = async (articleId) => {
  try {
    const article = await Article.findById(articleId)
      .populate('author', 'username email');
    
    if (article && article.status === 'published') {
      // Create notification as before
      const notification = new Notification({
        article: articleId,
        type: 'article'
      });
      await notification.save();

      // Send email to all confirmed subscribers
      const subscribers = await Subscription.find({ confirmed: true });
      const emailPromises = subscribers.map(subscriber =>
        transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: subscriber.email,
          subject: `New Article: ${article.title}`,
          html: `
            <h2>${article.title}</h2>
            <p><strong>College:</strong> ${article.college}</p>
            <p><strong>Author:</strong> ${article.author.username}</p>
            <p><strong>Posted:</strong> ${new Date(article.createdAt).toLocaleDateString()}</p>
            <p>${article.description}</p>
            <a href="${process.env.FRONTEND_URL}/articles/${article._id}" 
               style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 9999px; text-decoration: none; display: inline-block;">
              Read More
            </a>
          `
        })
      );

      await Promise.all(emailPromises);
    }
  } catch (error) {
    console.error('Error in notification/email process:', error);
  }
};

// create an article
router.post('/create-post', verifyToken, isWriter, upload.single('coverImg'), async (req, res) => {
  try {
    const { title, description, content, college, category, status } = req.body;
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ error: 'Cover image is required' });
    }

    // Convert buffer to base64
    const fileStr = req.file.buffer.toString('base64');
    const fileType = req.file.mimetype;
    
    // Create upload string
    const uploadStr = `data:${fileType};base64,${fileStr}`;

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(uploadStr, {
      upload_preset: 'df7xwzi0', // your upload preset
    });

    // Create article with Cloudinary URL
    const newArticle = new Article({
      title,
      description,
      content,
      coverImg: uploadResponse.secure_url,
      college,
      category,
      author: userId,
      status: status || 'pending'
    });

    await newArticle.save();
    if (status === 'published') {
      await createArticleNotification(newArticle._id);
    }
    
    res.status(201).json({
      message: 'Article created successfully',
      article: newArticle
    });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ 
      message: 'Error creating article',
      error: error
    });
  }
});

// get all articles
router.get('/', async (req, res) => {
  try {
    const {
      search,
      college,
      category,
      status = 'published',
      sortBy = 'createdAt',
      sortOrder = -1,
      page = 1,
      pageSize = 12
    } = req.query;

    let query = { status }

    if (search) {
      query = {
        ...query,
        $or: [
          { title: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } }
        ]
      }
    }

    if (college) {
      query.college = college
    }

    if (category) {
      query.category = category
    }

    console.log('MongoDB Query:', query);

    // Get total count for pagination
    const total = await Article.countDocuments(query);

    // Apply pagination
    const articles = await Article.find(query)
      .populate('author', 'email username')
      .sort({ [sortBy]: parseInt(sortOrder) })
      .skip((parseInt(page) - 1) * parseInt(pageSize))
      .limit(parseInt(pageSize));

    console.log('Found articles:', articles.length);

    // Return both the articles and total count
    res.status(200).json({
      articles,
      total
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ message: "Error fetching articles" })
  }
});
// get all articles

// get single article by id
router.get("/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Article.findById(postId).populate('author', 'email username');

    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }

    // No need to parse the content, just send it as is
    const postWithContent = {
      ...post.toObject(),
      content: post.content
    };

    const comments = await Comment.find({ postId: postId }).populate('user', "username email");

    res.status(200).send({ 
      post: postWithContent, 
      comments 
    });

  } catch (error) {
    console.error("Error fetching single post: ", error);
    res.status(500).send({ message: "Error fetching single post" });
  }
});

// update an article
router.patch("/update-post/:id", verifyToken, isAdminWriter, upload.single('coverImg'), async (req, res) => {
  
  if (req.file) {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        message: "Invalid file type. Only JPEG, PNG and GIF are allowed." 
      });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      return res.status(400).json({ 
        message: "File too large. Maximum size is 5MB." 
      });
    }
  }

  try {
    const postId = req.params.id;
    
    // Log incoming request data for debugging
    console.log('Request body:', req.body);
    console.log('File:', req.file);

    // Initialize updateData with the parsed body
    let updateData = {};
    
    // Handle string fields
    ['title', 'description', 'college', 'category', 'status'].forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Handle content separately since it might be JSON
    if (req.body.content) {
      try {
        updateData.content = typeof req.body.content === 'object' 
          ? JSON.stringify(req.body.content)
          : req.body.content;
      } catch (err) {
        console.error('Error processing content:', err);
        updateData.content = req.body.content;
      }
    }
    
    // Convert the college to uppercase if it exists
    if (updateData.college) {
      updateData.college = updateData.college.toUpperCase();
    }

    // Handle image upload if a new image is provided
    if (req.file) {
      try {
        // Convert buffer to base64
        const fileStr = req.file.buffer.toString('base64');
        const fileType = req.file.mimetype;
        
        // Create upload string
        const uploadStr = `data:${fileType};base64,${fileStr}`;

        console.log('Attempting to upload to Cloudinary...');
        
        // Upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(uploadStr, {
          upload_preset: 'df7xwzi0',
        });

        console.log('Cloudinary upload response:', uploadResponse);

        // Add the new image URL to updateData
        updateData.coverImg = uploadResponse.secure_url;

        // Try to delete old image
        try {
          const oldPost = await Article.findById(postId);
          if (oldPost && oldPost.coverImg) {
            const oldImagePublicId = oldPost.coverImg.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(oldImagePublicId);
          }
        } catch (deleteError) {
          console.error('Error deleting old image:', deleteError);
          // Continue with update even if delete fails
        }
      } catch (uploadError) {
        console.error("Error uploading image to Cloudinary:", uploadError);
        return res.status(400).json({ 
          message: "Error uploading image",
          error: uploadError.message 
        });
      }
    }

    console.log('Final update data:', updateData);

    const oldArticle = await Article.findById(postId);
    const wasPublished = oldArticle.status === 'published';
    const willBePublished = updateData.status === 'published';
    
    const updatedPost = await Article.findByIdAndUpdate(
      postId,
      updateData,
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    if (!wasPublished && willBePublished) {
      await createArticleNotification(postId);
    }

    res.status(200).json({
      message: "Post updated successfully",
      post: updatedPost
    });
  } catch (error) {
    console.error("Error updating post: ", error);
    res.status(500).json({ 
      message: "Error updating post",
      error: error.message 
    });
  }
});

// delete an article
router.delete("/:id", verifyToken, isAdminWriter, async (req, res) => {
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
      title: {$regex: titleRegex},
      status: 'published' // only show published articles
    }

    const relatedPost = await Article.find(relatedQuery)
      .populate('author', 'username email')
      .sort({ createdAt: -1 }) // Optional: sort by newest first
      .limit(5); // Optional: limit the number of related posts

    res.status(200).send(relatedPost);

  } catch (error) {
    console.error("Error fetching related post: ", error);
    res.status(500).send({ message: "Error fetching related post" })
  }
});

// article like
router.post("/:id/like", verifyToken, async (req, res) => {
  try {
    const articleId = req.params.id;
    const userId = req.user._id;

    const article = await Article.findById(articleId);
    
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    await article.toggleLike(userId);

    res.json({
      message: "Like toggled successfully",
      likeCount: article.likeCount,
      isLiked: article.likes.includes(userId)
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Error toggling like" });
  }
});

// revision or rejection
router.patch("/review/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, revisionMessage, rejectionMessage } = req.body;
    
    console.log('Received review request:', {
      id,
      status,
      revisionMessage,
      rejectionMessage,
      user: req.user
    });

    if (!['revision', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status. Must be either 'revision' or 'rejected'" 
      });
    }

    // Validate article existence first
    const article = await Article.findById(id);
    if (!article) {
      console.log('Article not found:', id);
      return res.status(404).json({ message: "Article not found" });
    }

    const updateData = {
      status,
      reviewedBy: req.user.username,
      ...(status === 'revision' ? {
        revisionMessage,
        revisionDate: new Date()
      } : {
        rejectionMessage,
        rejectionDate: new Date()
      })
    };

    console.log('Updating article with:', updateData);

    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    console.log('Updated article:', updatedArticle);

    res.status(200).json({
      message: `Article ${status === 'revision' ? 'sent for revision' : 'rejected'} successfully`,
      article: updatedArticle
    });

  } catch (error) {
    console.error("Error updating article status:", error);
    res.status(500).json({ 
      message: "Error updating article status",
      error: error.message 
    });
  }
});

module.exports = router;