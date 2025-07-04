const express = require('express');
const { body, validationResult } = require('express-validator');
const Test = require('../models/Test');
const Question = require('../models/Question');
const Result = require('../models/Result');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();


router.get('/', auth, async (req, res) => {
  try {
    const { type, subject, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };

    if (type) query.type = type;
    if (subject) query.subject = subject;

    if (req.user.role === 'student') {
      query.allowedCenters = req.user.center;
      query.startDate = { $lte: new Date() };
      query.endDate = { $gte: new Date() };
    }

    // Fetch all fields except questions
    const testsRaw = await Test.find(query)
      .populate('createdBy', 'name')
      .select('-questions') // ✅ Only exclude questions
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .lean();

    // Count questions without returning them
    const tests = await Promise.all(
      testsRaw.map(async (test) => {
        const questionCount = await Test.aggregate([
          { $match: { _id: test._id } },
          { $project: { count: { $size: '$questions' } } }
        ]);
        return {
          ...test,
          questionCount: questionCount[0]?.count || 0
        };
      })
    );

    const total = await Test.countDocuments(query);

    res.json({
      tests,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get tests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/:id', auth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('questions')
      .populate('createdBy', 'name')
      .populate('allowedCenters', 'name');

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    console.log(req, 'User role checking for test access');
    console.log(test);
    
    
    // Check if student has access to this test
    if (req.user.role === 'student') {
      const hasAccess = test.allowedCenters.some(center => 
        // console.log(`Checking center access: ${center._id} vs ${req.user.center}`),
        
        center._id.toString() === req.user.center.toString()
      );
      
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied to this test' });
      }

      // Check if test is active
      const now = new Date();
      if (now < test.startDate || now > test.endDate) {
        return res.status(403).json({ message: 'Test is not available at this time' });
      }
      const safeTest = {
        _id: test._id,
        title: test.title,
        description: test.description,
        type: test.type,
        subject: test.subject,
        difficulty: test.difficulty,
        duration: test.duration,
        totalMarks: test.totalMarks,
        startDate: test.startDate,
        endDate: test.endDate,
        createdBy: test.createdBy,
        allowedCenters: test.allowedCenters,
        questionCount: test.questions?.length || 0, // ✅ only send count
        instructions: test.instructions, // ✅ include instructions
        negativeMarking: test.negativeMarking,
        createdAt: test.createdAt,
        
        // ❌ exclude full question details
      };

      return res.json({ test: safeTest });
    }

    res.json({ test });
  } catch (error) {
    console.error('Get test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create test
router.post('/', auth, authorize('contentadmin', 'trainer', 'superadmin'), [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('type').isIn(['JEE', 'NEET', 'Mock', 'Practice']).withMessage('Invalid test type'),
  body('subject').isIn(['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Mixed']).withMessage('Invalid subject'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  body('totalMarks').isInt({ min: 1 }).withMessage('Total marks must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const testData = {
      ...req.body,
      createdBy: req.user._id
    };

    const test = new Test(testData);
    await test.save();

    res.status(201).json({
      message: 'Test created successfully',
      test
    });
  } catch (error) {
    console.error('Create test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /tests/:id/add-questions
router.patch('/:id/add-questions', async (req, res) => {
  const { id } = req.params;
  const { questionIds } = req.body;

  await Test.findByIdAndUpdate(id, {
    $addToSet: { questions: { $each: questionIds } }
  });

  res.json({ success: true });
});


// Update test
router.put('/:id', auth, authorize('contentadmin', 'trainer', 'superadmin'), async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Check if user can edit this test
    if (req.user.role === 'trainer' && test.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedTest = await Test.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('questions').populate('createdBy', 'name');

    res.json({ message: 'Test updated successfully', test: updatedTest });
  } catch (error) {
    console.error('Update test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/add-question',auth, authorize('contentadmin', 'superadmin'), async (req, res) => {
  const { questionId } = req.body;
  const test = await Test.findById(req.params.id);
  if (!test) return res.status(404).json({ error: 'Not found' });
  if (!test.questions.includes(questionId)) test.questions.push(questionId);
  await test.save();
  res.json({ success: true });
});

// Delete test
router.delete('/:id', auth, authorize('contentadmin', 'superadmin'), async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    await Test.findByIdAndDelete(req.params.id);
    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Delete test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// get the tests questions
router.get('/:id/questions', auth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).populate('questions');
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.json({ questions: test.questions });
  } catch (error) {
    console.error('Get test questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;