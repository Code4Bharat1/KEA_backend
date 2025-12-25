// import User from '../models/user.models.js';
// import Resume from '../models/resume.models.js';
// import JobApplication from '../models/JobApplication.models.js';
// import SavedJob from '../models/savedJob.models.js';
// import EventRegistration from '../models/EventRegistration.models.js'; // Fixed: lowercase
// import Connection from '../models/connection.models.js';
// import Activity from '../models/activity.models.js';
// import Notification from '../models/notification.models.js';

// // Get current user
// export const getMe = async (req, res, next) => {
//   try {
//     const user = await User.findById(req.user._id).select('-password');
//     res.json(user);
//   } catch (err) { 
//     next(err); 
//   }
// };

// // Update current user
// export const updateMe = async (req, res, next) => {
//   try {
//     const updateData = {};

//     if (req.body.name) updateData.name = req.body.name;
//     if (req.body.email) updateData.email = req.body.email;
//     if (req.body.avatar) updateData.avatar = req.body.avatar;

//     if (req.body.profile) {
//       for (const key of Object.keys(req.body.profile)) {
//         updateData[`profile.${key}`] = req.body.profile[key];
//       }
//     }

//     const user = await User.findByIdAndUpdate(
//       req.user._id,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     ).select('-password');

//     res.json(user);
//   } catch (err) {
//     next(err);
//   }
// };


// // Get dashboard stats
// export const getDashboardStats = async (req, res, next) => {
//   try {
//     const userId = req.user._id;
    
//     const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
//     const [
//       applications,
//       savedJobs,
//       eventsRegistered,
//       connections,
//       lastMonthApplications,
//       lastMonthSavedJobs,
//       lastMonthEvents,
//       lastMonthConnections
//     ] = await Promise.all([
//       // Current counts
//       JobApplication.countDocuments({ user: userId }),
//       SavedJob.countDocuments({ user: userId }),
//       EventRegistration.countDocuments({ user: userId }),
//       Connection.countDocuments({ user: userId }),
      
//       // Last month stats for comparison
//       JobApplication.countDocuments({ 
//         user: userId, 
//         createdAt: { $lt: thirtyDaysAgo }
//       }),
//       SavedJob.countDocuments({ 
//         user: userId, 
//         createdAt: { $lt: thirtyDaysAgo }
//       }),
//       EventRegistration.countDocuments({ 
//         user: userId, 
//         createdAt: { $lt: thirtyDaysAgo }
//       }),
//       Connection.countDocuments({ 
//         user: userId, 
//         createdAt: { $lt: thirtyDaysAgo }
//       }),
//     ]);

//     const calculateChange = (current, previous) => {
//       if (previous === 0) return current > 0 ? 100 : 0;
//       return Math.round(((current - previous) / previous) * 100);
//     };

//     res.json({
//       applications: applications || 0,
//       savedJobs: savedJobs || 0,
//       eventsRegistered: eventsRegistered || 0,
//       connections: connections || 0,
//       applicationsChange: calculateChange(applications, lastMonthApplications),
//       savedJobsChange: calculateChange(savedJobs, lastMonthSavedJobs),
//       eventsChange: calculateChange(eventsRegistered, lastMonthEvents),
//       connectionsChange: calculateChange(connections, lastMonthConnections),
//     });
//   } catch (err) {
//     console.error('Dashboard stats error:', err);
//     // Return default values if models don't exist yet
//     res.json({
//       applications: 0,
//       savedJobs: 0,
//       eventsRegistered: 0,
//       connections: 0,
//       applicationsChange: 0,
//       savedJobsChange: 0,
//       eventsChange: 0,
//       connectionsChange: 0,
//     });
//   }
// };

// // Get recent activity
// export const getRecentActivity = async (req, res, next) => {
//   try {
//     const userId = req.user._id;
    
//     const activities = await Activity.find({ user: userId })
//       .sort({ createdAt: -1 })
//       .limit(10);
    
//     res.json(activities);
//   } catch (err) {
//     console.error('Recent activity error:', err);
//     res.json([]);
//   }
// };

// // Get user notifications
// export const getUserNotifications = async (req, res, next) => {
//   try {
//     const userId = req.user._id;
//     const { limit = 10, unreadOnly = false } = req.query;
    
//     const query = { recipient: userId };
    
//     if (unreadOnly === 'true') {
//       query.read = false;
//     }
    
//     const notifications = await Notification.find(query)
//       .sort({ createdAt: -1 })
//       .limit(parseInt(limit));
    
//     res.json(notifications);
//   } catch (err) {
//     console.error('Notifications error:', err);
//     res.json([]);
//   }
// };

// // Mark notification as read
// export const markNotificationRead = async (req, res, next) => {
//   try {
//     const notification = await Notification.findByIdAndUpdate(
//       req.params.id,
//       { read: true },
//       { new: true }
//     );
    
//     if (!notification) {
//       return res.status(404).json({ message: 'Notification not found' });
//     }
    
//     res.json(notification);
//   } catch (err) {
//     next(err);
//   }
// };

// // Upload resume
// export const uploadResume = async (req, res, next) => {
//   try {
//     // console.log('=== Resume Upload Request ===');
//     // console.log('User:', req.user._id);
//     // console.log('File:', req.file);
//     // console.log('Body:', req.body);

//     if (!req.file) {
//       // console.log('❌ No file in request');
//       return res.status(400).json({ message: 'No file provided' });
//     }
    
//     const resume = await Resume.create({ 
//       user: req.user._id, 
//       title: req.body.title || 'Resume', 
//       file: req.file.filename,
//       originalName: req.file.originalname,
//       mimeType: req.file.mimetype,
//       size: req.file.size
//     });
    
//     // console.log('✅ Resume saved to DB:', resume);
//     // console.log(`📁 File saved at: uploads/${req.file.filename}`);
//     // console.log(`🔗 Accessible at: http://localhost:5000/uploads/${req.file.filename}`);

//     // Create activity
//     await Activity.create({
//       user: req.user._id,
//       type: 'document_download',
//       title: 'Resume uploaded',
//       description: `Uploaded ${req.file.originalname}`
//     }).catch(err => console.log('⚠️ Activity creation failed:', err));
    
//     res.json(resume);
//   } catch (err) { 
//     console.error('❌ Upload error:', err);
//     next(err); 
//   }
// };

// // Get user's resumes
// export const getMyResumes = async (req, res, next) => {
//   try {
//     // console.log('📋 Fetching resumes for user:', req.user._id);
//     const resumes = await Resume.find({ user: req.user._id })
//       .sort({ createdAt: -1 });
//     // console.log(`✅ Found ${resumes.length} resumes`);
//     res.json(resumes);
//   } catch (err) {
//     console.error('❌ Error fetching resumes:', err);
//     next(err);
//   }
// };

// // Delete resume
// export const deleteResume = async (req, res, next) => {
//   try {
//     const resume = await Resume.findOneAndDelete({
//       _id: req.params.id,
//       user: req.user._id
//     });
    
//     if (!resume) {
//       return res.status(404).json({ message: 'Resume not found' });
//     }
    
//     res.json({ message: 'Resume deleted successfully' });
//   } catch (err) {
//     next(err);
//   }
// };

// // List all members (public)
// export const listMembers = async (req, res, next) => {
//   try {
//     const { search, category, location, page = 1, limit = 20 } = req.query;
    
//     const query = { 
//       membershipStatus: 'active',
//       role: 'user' 
//     };
    
//     // Add search filter
//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { 'profile.headline': { $regex: search, $options: 'i' } },
//         { 'profile.bio': { $regex: search, $options: 'i' } }
//       ];
//     }
    
//     // Add category filter
//     if (category) {
//       query['profile.category'] = category;
//     }
    
//     // Add location filter
//     if (location) {
//       query['profile.location'] = { $regex: location, $options: 'i' };
//     }
    
//     const skip = (page - 1) * limit;
    
//     const [members, total] = await Promise.all([
//       User.find(query)
//         .select('-password')
//         .limit(parseInt(limit))
//         .skip(skip)
//         .sort({ createdAt: -1 }),
//       User.countDocuments(query)
//     ]);
    
//     res.json({
//       members,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         pages: Math.ceil(total / limit)
//       }
//     });
//   } catch (err) { 
//     next(err); 
//   }
// };

// // Get single member (public)
// export const getMember = async (req, res, next) => {
//   try {
//     const member = await User.findById(req.params.id)
//       .select('-password');
      
//     if (!member) {
//       return res.status(404).json({ message: 'Member not found' });
//     }
    
//     res.json(member);
//   } catch (err) { 
//     next(err); 
//   }
// };

// // Save a job
// export const saveJob = async (req, res, next) => {
//   try {
//     const { jobId } = req.body;
    
//     // Check if already saved
//     const existing = await SavedJob.findOne({
//       user: req.user._id,
//       job: jobId
//     });
    
//     if (existing) {
//       return res.status(400).json({ message: 'Job already saved' });
//     }
    
//     const savedJob = await SavedJob.create({
//       user: req.user._id,
//       job: jobId
//     });
    
//     // Create activity
//     await Activity.create({
//       user: req.user._id,
//       type: 'job_application',
//       title: 'Job saved',
//       description: 'You saved a job posting',
//       relatedId: jobId,
//       relatedModel: 'Job'
//     }).catch(err => console.log('⚠️ Activity creation failed:', err));
    
//     res.json(savedJob);
//   } catch (err) {
//     next(err);
//   }
// };

// // Get saved jobs
// export const getSavedJobs = async (req, res, next) => {
//   try {
//     const savedJobs = await SavedJob.find({ user: req.user._id })
//       .populate('job')
//       .sort({ createdAt: -1 });
//     res.json(savedJobs);
//   } catch (err) {
//     next(err);
//   }
// };

// // Apply for a job
// export const applyForJob = async (req, res, next) => {
//   try {
//     const { jobId, coverLetter, resumeId } = req.body;
    
//     // Check if already applied
//     const existing = await JobApplication.findOne({
//       user: req.user._id,
//       job: jobId
//     });
    
//     if (existing) {
//       return res.status(400).json({ message: 'Already applied for this job' });
//     }
    
//     const application = await JobApplication.create({
//       user: req.user._id,
//       job: jobId,
//       coverLetter,
//       resume: resumeId,
//       status: 'pending'
//     });
    
//     // Create activity
//     await Activity.create({
//       user: req.user._id,
//       type: 'job_application',
//       title: 'Applied for job',
//       description: 'You applied for a new position',
//       relatedId: jobId,
//       relatedModel: 'Job'
//     }).catch(err => console.log('⚠️ Activity creation failed:', err));
    
//     res.json(application);
//   } catch (err) {
//     next(err);
//   }
// };

// // Get my job applications
// export const getMyApplications = async (req, res, next) => {
//   try {
//     const applications = await JobApplication.find({ user: req.user._id })
//       .populate('job')
//       .sort({ createdAt: -1 });
//     res.json(applications);
//   } catch (err) {
//     next(err);
//   }
// };

// // Register for an event
// export const registerForEvent = async (req, res, next) => {
//   try {
//     const { eventId } = req.body;
    
//     // Check if already registered
//     const existing = await EventRegistration.findOne({
//       user: req.user._id,
//       event: eventId
//     });
    
//     if (existing) {
//       return res.status(400).json({ message: 'Already registered for this event' });
//     }
    
//     const registration = await EventRegistration.create({
//       user: req.user._id,
//       event: eventId,
//       status: 'confirmed'
//     });
    
//     // Create activity
//     await Activity.create({
//       user: req.user._id,
//       type: 'event_registration',
//       title: 'Registered for event',
//       description: 'You registered for a new event',
//       relatedId: eventId,
//       relatedModel: 'Event'
//     }).catch(err => console.log('⚠️ Activity creation failed:', err));
    
//     res.json(registration);
//   } catch (err) {
//     next(err);
//   }
// };

// // Get my event registrations
// export const getMyEventRegistrations = async (req, res, next) => {
//   try {
//     const registrations = await EventRegistration.find({ user: req.user._id })
//       .populate('event')
//       .sort({ createdAt: -1 });
//     res.json(registrations);
//   } catch (err) {
//     next(err);
//   }
// };

// // Connect with another user
// export const connectWithUser = async (req, res, next) => {
//   try {
//     const { userId } = req.body;
    
//     if (userId === req.user._id.toString()) {
//       return res.status(400).json({ message: 'Cannot connect with yourself' });
//     }
    
//     // Check if already connected
//     const existing = await Connection.findOne({
//       user: req.user._id,
//       connectedUser: userId
//     });
    
//     if (existing) {
//       return res.status(400).json({ message: 'Already connected' });
//     }
    
//     const connection = await Connection.create({
//       user: req.user._id,
//       connectedUser: userId,
//       status: 'pending'
//     });
    
//     // Create activity
//     await Activity.create({
//       user: req.user._id,
//       type: 'connection',
//       title: 'Connection request sent',
//       description: 'You sent a connection request',
//       relatedId: userId,
//       relatedModel: 'User'
//     }).catch(err => console.log('⚠️ Activity creation failed:', err));
    
//     res.json(connection);
//   } catch (err) {
//     next(err);
//   }
// };

// // Get my connections
// export const getMyConnections = async (req, res, next) => {
//   try {
//     const connections = await Connection.find({ 
//       user: req.user._id,
//       status: 'accepted'
//     })
//       .populate('connectedUser', '-password')
//       .sort({ createdAt: -1 });
//     res.json(connections);
//   } catch (err) {
//     next(err);
//   }
// };

// export default {
//   getMe,
//   updateMe,
//   getDashboardStats,
//   getRecentActivity,
//   getUserNotifications,
//   markNotificationRead,
//   uploadResume,
//   getMyResumes,
//   deleteResume,
//   listMembers,
//   getMember,
//   saveJob,
//   getSavedJobs,
//   applyForJob,
//   getMyApplications,
//   registerForEvent,
//   getMyEventRegistrations,
//   connectWithUser,
//   getMyConnections
// };


// import User from '../models/user.models.js';
// import Resume from '../models/resume.models.js';
// import JobApplication from '../models/JobApplication.models.js';
// import SavedJob from '../models/savedJob.models.js';
// import EventRegistration from '../models/EventRegistration.models.js';
// import Connection from '../models/connection.models.js';
// import Activity from '../models/activity.models.js';
// import Notification from '../models/notification.models.js';

// // Get current user
// export const getMe = async (req, res, next) => {
//   try {
//     const user = await User.findById(req.user._id).select('-password');
//     res.json(user);
//   } catch (err) { 
//     next(err); 
//   }
// };

// // Update current user
// export const updateMe = async (req, res, next) => {
//   try {
//     const updateData = {};

//     // Update basic fields
//     if (req.body.name) updateData.name = req.body.name;
//     if (req.body.email) updateData.email = req.body.email;
//     if (req.body.avatar) updateData.avatar = req.body.avatar;

//     // Update profile fields
//     if (req.body.profile) {
//       // Basic profile fields
//       if (req.body.profile.phone !== undefined) updateData['profile.phone'] = req.body.profile.phone;
//       if (req.body.profile.countryCode !== undefined) updateData['profile.countryCode'] = req.body.profile.countryCode;
//       if (req.body.profile.location !== undefined) updateData['profile.location'] = req.body.profile.location;
//       if (req.body.profile.nativeAddition !== undefined) updateData['profile.nativeAddition'] = req.body.profile.nativeAddition;
//       if (req.body.profile.headline !== undefined) updateData['profile.headline'] = req.body.profile.headline;
//       if (req.body.profile.bio !== undefined) updateData['profile.bio'] = req.body.profile.bio;
//       if (req.body.profile.company !== undefined) updateData['profile.company'] = req.body.profile.company;
//       if (req.body.profile.position !== undefined) updateData['profile.position'] = req.body.profile.position;
//       if (req.body.profile.yearsOfExperience !== undefined) updateData['profile.yearsOfExperience'] = req.body.profile.yearsOfExperience;
//       if (req.body.profile.category !== undefined) updateData['profile.category'] = req.body.profile.category;
//       if (req.body.profile.country !== undefined) updateData['profile.country'] = req.body.profile.country;
//       if (req.body.profile.branch !== undefined) updateData['profile.branch'] = req.body.profile.branch;
//       if (req.body.profile.avatar !== undefined) updateData['profile.avatar'] = req.body.profile.avatar;
//       if (req.body.profile.resumeUrl !== undefined) updateData['profile.resumeUrl'] = req.body.profile.resumeUrl;
      
//       // Array fields
//       if (req.body.profile.skills !== undefined) updateData['profile.skills'] = req.body.profile.skills;
//       if (req.body.profile.experience !== undefined) updateData['profile.experience'] = req.body.profile.experience;
//       if (req.body.profile.education !== undefined) updateData['profile.education'] = req.body.profile.education;
      
//       // Social links
//       if (req.body.profile.socialLinks) {
//         if (req.body.profile.socialLinks.linkedin !== undefined) updateData['profile.socialLinks.linkedin'] = req.body.profile.socialLinks.linkedin;
//         if (req.body.profile.socialLinks.github !== undefined) updateData['profile.socialLinks.github'] = req.body.profile.socialLinks.github;
//         if (req.body.profile.socialLinks.twitter !== undefined) updateData['profile.socialLinks.twitter'] = req.body.profile.socialLinks.twitter;
//         if (req.body.profile.socialLinks.website !== undefined) updateData['profile.socialLinks.website'] = req.body.profile.socialLinks.website;
//       }
//     }

//     const user = await User.findByIdAndUpdate(
//       req.user._id,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     ).select('-password');

//     // Create activity
//     await Activity.create({
//       user: req.user._id,
//       type: 'profile_update',
//       title: 'Profile updated',
//       description: 'You updated your profile information'
//     }).catch(err => console.log('⚠️ Activity creation failed:', err));

//     res.json(user);
//   } catch (err) {
//     next(err);
//   }
// };

// // Get dashboard stats
// export const getDashboardStats = async (req, res, next) => {
//   try {
//     const userId = req.user._id;
    
//     const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
//     const [
//       applications,
//       savedJobs,
//       eventsRegistered,
//       connections,
//       lastMonthApplications,
//       lastMonthSavedJobs,
//       lastMonthEvents,
//       lastMonthConnections
//     ] = await Promise.all([
//       // Current counts
//       JobApplication.countDocuments({ user: userId }),
//       SavedJob.countDocuments({ user: userId }),
//       EventRegistration.countDocuments({ user: userId }),
//       Connection.countDocuments({ user: userId }),
      
//       // Last month stats for comparison
//       JobApplication.countDocuments({ 
//         user: userId, 
//         createdAt: { $lt: thirtyDaysAgo }
//       }),
//       SavedJob.countDocuments({ 
//         user: userId, 
//         createdAt: { $lt: thirtyDaysAgo }
//       }),
//       EventRegistration.countDocuments({ 
//         user: userId, 
//         createdAt: { $lt: thirtyDaysAgo }
//       }),
//       Connection.countDocuments({ 
//         user: userId, 
//         createdAt: { $lt: thirtyDaysAgo }
//       }),
//     ]);

//     const calculateChange = (current, previous) => {
//       if (previous === 0) return current > 0 ? 100 : 0;
//       return Math.round(((current - previous) / previous) * 100);
//     };

//     res.json({
//       applications: applications || 0,
//       savedJobs: savedJobs || 0,
//       eventsRegistered: eventsRegistered || 0,
//       connections: connections || 0,
//       applicationsChange: calculateChange(applications, lastMonthApplications),
//       savedJobsChange: calculateChange(savedJobs, lastMonthSavedJobs),
//       eventsChange: calculateChange(eventsRegistered, lastMonthEvents),
//       connectionsChange: calculateChange(connections, lastMonthConnections),
//     });
//   } catch (err) {
//     console.error('Dashboard stats error:', err);
//     // Return default values if models don't exist yet
//     res.json({
//       applications: 0,
//       savedJobs: 0,
//       eventsRegistered: 0,
//       connections: 0,
//       applicationsChange: 0,
//       savedJobsChange: 0,
//       eventsChange: 0,
//       connectionsChange: 0,
//     });
//   }
// };

// // Get recent activity
// export const getRecentActivity = async (req, res, next) => {
//   try {
//     const userId = req.user._id;
    
//     const activities = await Activity.find({ user: userId })
//       .sort({ createdAt: -1 })
//       .limit(10);
    
//     res.json(activities);
//   } catch (err) {
//     console.error('Recent activity error:', err);
//     res.json([]);
//   }
// };

// // Get user notifications
// export const getUserNotifications = async (req, res, next) => {
//   try {
//     const userId = req.user._id;
//     const { limit = 10, unreadOnly = false } = req.query;
    
//     const query = { recipient: userId };
    
//     if (unreadOnly === 'true') {
//       query.read = false;
//     }
    
//     const notifications = await Notification.find(query)
//       .sort({ createdAt: -1 })
//       .limit(parseInt(limit));
    
//     res.json(notifications);
//   } catch (err) {
//     console.error('Notifications error:', err);
//     res.json([]);
//   }
// };

// // Mark notification as read
// export const markNotificationRead = async (req, res, next) => {
//   try {
//     const notification = await Notification.findByIdAndUpdate(
//       req.params.id,
//       { read: true },
//       { new: true }
//     );
    
//     if (!notification) {
//       return res.status(404).json({ message: 'Notification not found' });
//     }
    
//     res.json(notification);
//   } catch (err) {
//     next(err);
//   }
// };

// // Upload resume
// export const uploadResume = async (req, res, next) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: 'No file provided' });
//     }

//     // Check file size (5MB limit)
//     if (req.file.size > 5 * 1024 * 1024) {
//       return res.status(400).json({ message: 'File size exceeds 5MB limit' });
//     }

//     // Check file type
//     const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
//     if (!allowedTypes.includes(req.file.mimetype)) {
//       return res.status(400).json({ message: 'Invalid file type. Only PDF, DOC, and DOCX are allowed' });
//     }
    
//     const resume = await Resume.create({ 
//       user: req.user._id, 
//       title: req.body.title || 'Resume', 
//       file: req.file.filename,
//       originalName: req.file.originalname,
//       mimeType: req.file.mimetype,
//       size: req.file.size
//     });
    
//     // Update user profile with resume URL
//     await User.findByIdAndUpdate(
//       req.user._id,
//       { 
//         $set: { 
//           'profile.resumeUrl': `/uploads/${req.file.filename}` 
//         } 
//       }
//     );

//     // Create activity
//     await Activity.create({
//       user: req.user._id,
//       type: 'document_upload',
//       title: 'Resume uploaded',
//       description: `Uploaded ${req.file.originalname}`
//     }).catch(err => console.log('⚠️ Activity creation failed:', err));
    
//     res.json({
//       message: 'Resume uploaded successfully',
//       resumeUrl: `/uploads/${req.file.filename}`,
//       resume
//     });
//   } catch (err) { 
//     console.error('❌ Upload error:', err);
//     next(err); 
//   }
// };

// // Get user's resumes
// export const getMyResumes = async (req, res, next) => {
//   try {
//     const resumes = await Resume.find({ user: req.user._id })
//       .sort({ createdAt: -1 });
//     res.json(resumes);
//   } catch (err) {
//     console.error('❌ Error fetching resumes:', err);
//     next(err);
//   }
// };

// // Delete resume
// export const deleteResume = async (req, res, next) => {
//   try {
//     const resume = await Resume.findOneAndDelete({
//       _id: req.params.id,
//       user: req.user._id
//     });
    
//     if (!resume) {
//       return res.status(404).json({ message: 'Resume not found' });
//     }

//     // Update user profile to remove resume URL
//     await User.findByIdAndUpdate(
//       req.user._id,
//       { 
//         $unset: { 'profile.resumeUrl': '' } 
//       }
//     );

//     // Create activity
//     await Activity.create({
//       user: req.user._id,
//       type: 'document_delete',
//       title: 'Resume deleted',
//       description: 'You deleted your resume'
//     }).catch(err => console.log('⚠️ Activity creation failed:', err));
    
//     res.json({ message: 'Resume deleted successfully' });
//   } catch (err) {
//     next(err);
//   }
// };

// // List all members (public)
// export const listMembers = async (req, res, next) => {
//   try {
//     const { search, category, location, country, page = 1, limit = 20 } = req.query;
    
//     const query = { 
//       membershipStatus: 'active',
//       role: 'user' 
//     };
    
//     // Add search filter
//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { 'profile.headline': { $regex: search, $options: 'i' } },
//         { 'profile.bio': { $regex: search, $options: 'i' } },
//         { 'profile.nativeAddition': { $regex: search, $options: 'i' } }
//       ];
//     }
    
//     // Add category filter
//     if (category) {
//       query['profile.category'] = category;
//     }
    
//     // Add location filter
//     if (location) {
//       query['profile.location'] = { $regex: location, $options: 'i' };
//     }

//     // Add country filter
//     if (country) {
//       query['profile.country'] = country;
//     }
    
//     const skip = (page - 1) * limit;
    
//     const [members, total] = await Promise.all([
//       User.find(query)
//         .select('-password')
//         .limit(parseInt(limit))
//         .skip(skip)
//         .sort({ createdAt: -1 }),
//       User.countDocuments(query)
//     ]);
    
//     res.json({
//       members,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         pages: Math.ceil(total / limit)
//       }
//     });
//   } catch (err) { 
//     next(err); 
//   }
// };

// // Get single member (public)
// export const getMember = async (req, res, next) => {
//   try {
//     const member = await User.findById(req.params.id)
//       .select('-password');
      
//     if (!member) {
//       return res.status(404).json({ message: 'Member not found' });
//     }
    
//     res.json(member);
//   } catch (err) { 
//     next(err); 
//   }
// };

// // Save a job
// export const saveJob = async (req, res, next) => {
//   try {
//     const { jobId } = req.body;
    
//     // Check if already saved
//     const existing = await SavedJob.findOne({
//       user: req.user._id,
//       job: jobId
//     });
    
//     if (existing) {
//       return res.status(400).json({ message: 'Job already saved' });
//     }
    
//     const savedJob = await SavedJob.create({
//       user: req.user._id,
//       job: jobId
//     });
    
//     // Create activity
//     await Activity.create({
//       user: req.user._id,
//       type: 'job_save',
//       title: 'Job saved',
//       description: 'You saved a job posting',
//       relatedId: jobId,
//       relatedModel: 'Job'
//     }).catch(err => console.log('⚠️ Activity creation failed:', err));
    
//     res.json(savedJob);
//   } catch (err) {
//     next(err);
//   }
// };

// // Get saved jobs
// export const getSavedJobs = async (req, res, next) => {
//   try {
//     const savedJobs = await SavedJob.find({ user: req.user._id })
//       .populate('job')
//       .sort({ createdAt: -1 });
//     res.json(savedJobs);
//   } catch (err) {
//     next(err);
//   }
// };

// // Apply for a job
// export const applyForJob = async (req, res, next) => {
//   try {
//     const { jobId, coverLetter, resumeId } = req.body;
    
//     // Check if already applied
//     const existing = await JobApplication.findOne({
//       user: req.user._id,
//       job: jobId
//     });
    
//     if (existing) {
//       return res.status(400).json({ message: 'Already applied for this job' });
//     }
    
//     const application = await JobApplication.create({
//       user: req.user._id,
//       job: jobId,
//       coverLetter,
//       resume: resumeId,
//       status: 'pending'
//     });
    
//     // Create activity
//     await Activity.create({
//       user: req.user._id,
//       type: 'job_application',
//       title: 'Applied for job',
//       description: 'You applied for a new position',
//       relatedId: jobId,
//       relatedModel: 'Job'
//     }).catch(err => console.log('⚠️ Activity creation failed:', err));
    
//     res.json(application);
//   } catch (err) {
//     next(err);
//   }
// };

// // Get my job applications
// export const getMyApplications = async (req, res, next) => {
//   try {
//     const applications = await JobApplication.find({ user: req.user._id })
//       .populate('job')
//       .sort({ createdAt: -1 });
//     res.json(applications);
//   } catch (err) {
//     next(err);
//   }
// };

// // Register for an event
// export const registerForEvent = async (req, res, next) => {
//   try {
//     const { eventId } = req.body;
    
//     // Check if already registered
//     const existing = await EventRegistration.findOne({
//       user: req.user._id,
//       event: eventId
//     });
    
//     if (existing) {
//       return res.status(400).json({ message: 'Already registered for this event' });
//     }
    
//     const registration = await EventRegistration.create({
//       user: req.user._id,
//       event: eventId,
//       status: 'confirmed'
//     });
    
//     // Create activity
//     await Activity.create({
//       user: req.user._id,
//       type: 'event_registration',
//       title: 'Registered for event',
//       description: 'You registered for a new event',
//       relatedId: eventId,
//       relatedModel: 'Event'
//     }).catch(err => console.log('⚠️ Activity creation failed:', err));
    
//     res.json(registration);
//   } catch (err) {
//     next(err);
//   }
// };

// // Get my event registrations
// export const getMyEventRegistrations = async (req, res, next) => {
//   try {
//     const registrations = await EventRegistration.find({ user: req.user._id })
//       .populate('event')
//       .sort({ createdAt: -1 });
//     res.json(registrations);
//   } catch (err) {
//     next(err);
//   }
// };

// // Connect with another user
// export const connectWithUser = async (req, res, next) => {
//   try {
//     const { userId } = req.body;
    
//     if (userId === req.user._id.toString()) {
//       return res.status(400).json({ message: 'Cannot connect with yourself' });
//     }
    
//     // Check if already connected
//     const existing = await Connection.findOne({
//       user: req.user._id,
//       connectedUser: userId
//     });
    
//     if (existing) {
//       return res.status(400).json({ message: 'Already connected' });
//     }
    
//     const connection = await Connection.create({
//       user: req.user._id,
//       connectedUser: userId,
//       status: 'pending'
//     });
    
//     // Create activity
//     await Activity.create({
//       user: req.user._id,
//       type: 'connection',
//       title: 'Connection request sent',
//       description: 'You sent a connection request',
//       relatedId: userId,
//       relatedModel: 'User'
//     }).catch(err => console.log('⚠️ Activity creation failed:', err));
    
//     res.json(connection);
//   } catch (err) {
//     next(err);
//   }
// };

// // Get my connections
// export const getMyConnections = async (req, res, next) => {
//   try {
//     const connections = await Connection.find({ 
//       user: req.user._id,
//       status: 'accepted'
//     })
//       .populate('connectedUser', '-password')
//       .sort({ createdAt: -1 });
//     res.json(connections);
//   } catch (err) {
//     next(err);
//   }
// };

// export default {
//   getMe,
//   updateMe,
//   getDashboardStats,
//   getRecentActivity,
//   getUserNotifications,
//   markNotificationRead,
//   uploadResume,
//   getMyResumes,
//   deleteResume,
//   listMembers,
//   getMember,
//   saveJob,
//   getSavedJobs,
//   applyForJob,
//   getMyApplications,
//   registerForEvent,
//   getMyEventRegistrations,
//   connectWithUser,
//   getMyConnections
// };

import User from '../models/user.models.js';
import Resume from '../models/resume.models.js';
import JobApplication from '../models/JobApplication.models.js';
import SavedJob from '../models/savedJob.models.js';
import EventRegistration from '../models/EventRegistration.models.js';
import Connection from '../models/connection.models.js';
import Activity from '../models/activity.models.js';
import Notification from '../models/notification.models.js';

// Helper function to format Date to YYYY/MM
const formatDateToYYYYMM = (date) => {
  if (!date) return '';
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  return `${year}/${month}`;
};

// Get current user
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    // Convert the user object to JSON and modify date formats for frontend
    const userObj = user.toObject();
    
    // Convert experience dates to YYYY/MM format for frontend
    if (userObj.profile?.experience) {
      userObj.profile.experience = userObj.profile.experience.map(exp => ({
        ...exp,
        from: exp.from ? formatDateToYYYYMM(exp.from) : '',
        to: exp.to ? formatDateToYYYYMM(exp.to) : ''
      }));
    }
    
    // Convert education dates to YYYY/MM format for frontend
    if (userObj.profile?.education) {
      userObj.profile.education = userObj.profile.education.map(edu => ({
        ...edu,
        from: edu.from ? formatDateToYYYYMM(edu.from) : '',
        to: edu.to ? formatDateToYYYYMM(edu.to) : ''
      }));
    }
    
    // FIXED: "Other" category handling
    const allowedCategories = [
      'Software Engineering',
      'Civil Engineering',
      'Mechanical Engineering',
      'Electrical Engineering',
      'Electronics Engineering',
      'Chemical Engineering',
      'Computer Engineering',
      'Architecture',
      'Other'
    ];
    
    const userCategory = userObj.profile?.category || '';
    const userOtherCategory = userObj.profile?.otherCategory || '';
    
    console.log('DEBUG getMe - User category:', userCategory);
    console.log('DEBUG getMe - User otherCategory:', userOtherCategory);
    
    // Logic for frontend display
    if (userCategory && !allowedCategories.includes(userCategory)) {
      // Agar category allowed list me nahi hai (like "builder")
      userObj.profile.otherCategory = userCategory;
      userObj.profile.category = 'Other';
    } else if (userCategory === 'Other' && userOtherCategory) {
      // Agar category "Other" hai aur otherCategory me value hai
      userObj.profile.otherCategory = userOtherCategory;
      userObj.profile.category = 'Other';
    }
    
    console.log('DEBUG getMe - Final category for frontend:', userObj.profile?.category);
    console.log('DEBUG getMe - Final otherCategory for frontend:', userObj.profile?.otherCategory);
    
    res.json(userObj);
  } catch (err) { 
    next(err); 
  }
};

// Update current user
export const updateMe = async (req, res, next) => {
  try {
    console.log('DEBUG updateMe - Request body:', JSON.stringify(req.body, null, 2));
    
    const updateData = {};

    // Helper function to convert YYYY/MM to Date
    const convertYYYYMMtoDate = (dateString) => {
      if (!dateString || dateString.toLowerCase() === 'present') return null;
      
      // If already in YYYY/MM format
      if (dateString.match(/^\d{4}\/\d{2}$/)) {
        const [year, month] = dateString.split('/');
        return new Date(year, month - 1, 1); // Create date with 1st day of month
      }
      
      // If in YYYY-MM format
      if (dateString.match(/^\d{4}-\d{2}$/)) {
        const [year, month] = dateString.split('-');
        return new Date(year, month - 1, 1);
      }
      
      // If full date string, try to parse
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date;
      }
      
      return null;
    };

    // Update basic fields
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.email) updateData.email = req.body.email;
    if (req.body.avatar) updateData.avatar = req.body.avatar;

    // Update profile fields
    if (req.body.profile) {
      console.log('DEBUG updateMe - Profile data received:', JSON.stringify(req.body.profile, null, 2));
      
      // Basic profile fields
      if (req.body.profile.phone !== undefined) updateData['profile.phone'] = req.body.profile.phone;
      if (req.body.profile.countryCode !== undefined) updateData['profile.countryCode'] = req.body.profile.countryCode;
      if (req.body.profile.location !== undefined) updateData['profile.location'] = req.body.profile.location;
      if (req.body.profile.nativeAddition !== undefined) updateData['profile.nativeAddition'] = req.body.profile.nativeAddition;
      if (req.body.profile.headline !== undefined) updateData['profile.headline'] = req.body.profile.headline;
      if (req.body.profile.bio !== undefined) updateData['profile.bio'] = req.body.profile.bio;
      if (req.body.profile.company !== undefined) updateData['profile.company'] = req.body.profile.company;
      if (req.body.profile.position !== undefined) updateData['profile.position'] = req.body.profile.position;
      if (req.body.profile.yearsOfExperience !== undefined) updateData['profile.yearsOfExperience'] = req.body.profile.yearsOfExperience;
      if (req.body.profile.country !== undefined) updateData['profile.country'] = req.body.profile.country;
      if (req.body.profile.branch !== undefined) updateData['profile.branch'] = req.body.profile.branch;
      if (req.body.profile.avatar !== undefined) updateData['profile.avatar'] = req.body.profile.avatar;
      if (req.body.profile.resumeUrl !== undefined) updateData['profile.resumeUrl'] = req.body.profile.resumeUrl;
      
      // FIXED: Handle category with "Other" option
      if (req.body.profile.category !== undefined) {
        const categoryFromFrontend = req.body.profile.category;
        const otherCategoryFromFrontend = req.body.profile.otherCategory || '';
        
        console.log('DEBUG: Frontend category:', categoryFromFrontend);
        console.log('DEBUG: Frontend otherCategory:', otherCategoryFromFrontend);
        
        if (categoryFromFrontend === 'Other' && otherCategoryFromFrontend.trim()) {
          // Agar "Other" select hai aur custom text hai, to custom text save karo
          updateData['profile.category'] = otherCategoryFromFrontend.trim();
          updateData['profile.otherCategory'] = otherCategoryFromFrontend.trim();
          console.log('DEBUG: Saving custom category:', otherCategoryFromFrontend.trim());
        } else if (categoryFromFrontend === 'Other') {
          // Agar "Other" select hai but custom text nahi hai
          updateData['profile.category'] = 'Other';
          updateData['profile.otherCategory'] = '';
          console.log('DEBUG: Saving as "Other" without custom text');
        } else {
          // Agar predefined category hai
          updateData['profile.category'] = categoryFromFrontend;
          updateData['profile.otherCategory'] = '';
          console.log('DEBUG: Saving predefined category:', categoryFromFrontend);
        }
      }
      
      // Array fields
      if (req.body.profile.skills !== undefined) updateData['profile.skills'] = req.body.profile.skills;
      
      // Handle experience dates
      if (req.body.profile.experience !== undefined) {
        const formattedExperience = req.body.profile.experience.map(exp => ({
          company: exp.company,
          position: exp.position,
          from: convertYYYYMMtoDate(exp.from),
          to: convertYYYYMMtoDate(exp.to),
          description: exp.description || ''
        }));
        updateData['profile.experience'] = formattedExperience;
      }
      
      // Handle education dates
      if (req.body.profile.education !== undefined) {
        const formattedEducation = req.body.profile.education.map(edu => ({
          institution: edu.institution,
          degree: edu.degree,
          from: convertYYYYMMtoDate(edu.from),
          to: convertYYYYMMtoDate(edu.to)
        }));
        updateData['profile.education'] = formattedEducation;
      }
      
      // Social links
      if (req.body.profile.socialLinks) {
        if (req.body.profile.socialLinks.linkedin !== undefined) updateData['profile.socialLinks.linkedin'] = req.body.profile.socialLinks.linkedin;
        if (req.body.profile.socialLinks.github !== undefined) updateData['profile.socialLinks.github'] = req.body.profile.socialLinks.github;
        if (req.body.profile.socialLinks.twitter !== undefined) updateData['profile.socialLinks.twitter'] = req.body.profile.socialLinks.twitter;
        if (req.body.profile.socialLinks.website !== undefined) updateData['profile.socialLinks.website'] = req.body.profile.socialLinks.website;
      }
    }

    console.log('DEBUG updateMe - Final updateData:', JSON.stringify(updateData, null, 2));
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    console.log('DEBUG updateMe - Updated user category:', user.profile?.category);
    console.log('DEBUG updateMe - Updated user otherCategory:', user.profile?.otherCategory);
    
    // Create activity
    await Activity.create({
      user: req.user._id,
      type: 'profile_update',
      title: 'Profile updated',
      description: 'You updated your profile information'
    }).catch(err => console.log('⚠️ Activity creation failed:', err));

    res.json(user);
  } catch (err) {
    console.error('ERROR in updateMe:', err);
    next(err);
  }
};

// Get dashboard stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const [
      applications,
      savedJobs,
      eventsRegistered,
      connections,
      lastMonthApplications,
      lastMonthSavedJobs,
      lastMonthEvents,
      lastMonthConnections
    ] = await Promise.all([
      // Current counts
      JobApplication.countDocuments({ user: userId }),
      SavedJob.countDocuments({ user: userId }),
      EventRegistration.countDocuments({ user: userId }),
      Connection.countDocuments({ user: userId }),
      
      // Last month stats for comparison
      JobApplication.countDocuments({ 
        user: userId, 
        createdAt: { $lt: thirtyDaysAgo }
      }),
      SavedJob.countDocuments({ 
        user: userId, 
        createdAt: { $lt: thirtyDaysAgo }
      }),
      EventRegistration.countDocuments({ 
        user: userId, 
        createdAt: { $lt: thirtyDaysAgo }
      }),
      Connection.countDocuments({ 
        user: userId, 
        createdAt: { $lt: thirtyDaysAgo }
      }),
    ]);

    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    res.json({
      applications: applications || 0,
      savedJobs: savedJobs || 0,
      eventsRegistered: eventsRegistered || 0,
      connections: connections || 0,
      applicationsChange: calculateChange(applications, lastMonthApplications),
      savedJobsChange: calculateChange(savedJobs, lastMonthSavedJobs),
      eventsChange: calculateChange(eventsRegistered, lastMonthEvents),
      connectionsChange: calculateChange(connections, lastMonthConnections),
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    // Return default values if models don't exist yet
    res.json({
      applications: 0,
      savedJobs: 0,
      eventsRegistered: 0,
      connections: 0,
      applicationsChange: 0,
      savedJobsChange: 0,
      eventsChange: 0,
      connectionsChange: 0,
    });
  }
};

// Get recent activity
export const getRecentActivity = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const activities = await Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json(activities);
  } catch (err) {
    console.error('Recent activity error:', err);
    res.json([]);
  }
};

// Get user notifications
export const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { limit = 10, unreadOnly = false } = req.query;
    
    const query = { recipient: userId };
    
    if (unreadOnly === 'true') {
      query.read = false;
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json(notifications);
  } catch (err) {
    console.error('Notifications error:', err);
    res.json([]);
  }
};

// Mark notification as read
export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (err) {
    next(err);
  }
};

// Upload resume
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // Check file size (5MB limit)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: 'File size exceeds 5MB limit' });
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Invalid file type. Only PDF, DOC, and DOCX are allowed' });
    }
    
    const resume = await Resume.create({ 
      user: req.user._id, 
      title: req.body.title || 'Resume', 
      file: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size
    });
    
    // Update user profile with resume URL
    await User.findByIdAndUpdate(
      req.user._id,
      { 
        $set: { 
          'profile.resumeUrl': `/uploads/${req.file.filename}` 
        } 
      }
    );

    // Create activity
    await Activity.create({
      user: req.user._id,
      type: 'document_upload',
      title: 'Resume uploaded',
      description: `Uploaded ${req.file.originalname}`
    }).catch(err => console.log('⚠️ Activity creation failed:', err));
    
    res.json({
      message: 'Resume uploaded successfully',
      resumeUrl: `/uploads/${req.file.filename}`,
      resume
    });
  } catch (err) { 
    console.error('❌ Upload error:', err);
    next(err); 
  }
};

// Get user's resumes
export const getMyResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(resumes);
  } catch (err) {
    console.error('❌ Error fetching resumes:', err);
    next(err);
  }
};

// Delete resume
export const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Update user profile to remove resume URL
    await User.findByIdAndUpdate(
      req.user._id,
      { 
        $unset: { 'profile.resumeUrl': '' } 
      }
    );

    // Create activity
    await Activity.create({
      user: req.user._id,
      type: 'document_delete',
      title: 'Resume deleted',
      description: 'You deleted your resume'
    }).catch(err => console.log('⚠️ Activity creation failed:', err));
    
    res.json({ message: 'Resume deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// List all members (public)
export const listMembers = async (req, res, next) => {
  try {
    const { search, category, location, country, page = 1, limit = 20 } = req.query;
    
    const query = { 
      membershipStatus: 'active',
      role: 'user' 
    };
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'profile.headline': { $regex: search, $options: 'i' } },
        { 'profile.bio': { $regex: search, $options: 'i' } },
        { 'profile.nativeAddition': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add category filter
    if (category) {
      query['profile.category'] = category;
    }
    
    // Add location filter
    if (location) {
      query['profile.location'] = { $regex: location, $options: 'i' };
    }

    // Add country filter
    if (country) {
      query['profile.country'] = country;
    }
    
    const skip = (page - 1) * limit;
    
    const [members, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ createdAt: -1 }),
      User.countDocuments(query)
    ]);
    
    res.json({
      members,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) { 
    next(err); 
  }
};

// Get single member (public)
export const getMember = async (req, res, next) => {
  try {
    const member = await User.findById(req.params.id)
      .select('-password');
      
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    res.json(member);
  } catch (err) { 
    next(err); 
  }
};

// Save a job
export const saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.body;
    
    // Check if already saved
    const existing = await SavedJob.findOne({
      user: req.user._id,
      job: jobId
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Job already saved' });
    }
    
    const savedJob = await SavedJob.create({
      user: req.user._id,
      job: jobId
    });
    
    // Create activity
    await Activity.create({
      user: req.user._id,
      type: 'job_save',
      title: 'Job saved',
      description: 'You saved a job posting',
      relatedId: jobId,
      relatedModel: 'Job'
    }).catch(err => console.log('⚠️ Activity creation failed:', err));
    
    res.json(savedJob);
  } catch (err) {
    next(err);
  }
};

// Get saved jobs
export const getSavedJobs = async (req, res, next) => {
  try {
    const savedJobs = await SavedJob.find({ user: req.user._id })
      .populate('job')
      .sort({ createdAt: -1 });
    res.json(savedJobs);
  } catch (err) {
    next(err);
  }
};

// Apply for a job
export const applyForJob = async (req, res, next) => {
  try {
    const { jobId, coverLetter, resumeId } = req.body;
    
    // Check if already applied
    const existing = await JobApplication.findOne({
      user: req.user._id,
      job: jobId
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }
    
    const application = await JobApplication.create({
      user: req.user._id,
      job: jobId,
      coverLetter,
      resume: resumeId,
      status: 'pending'
    });
    
    // Create activity
    await Activity.create({
      user: req.user._id,
      type: 'job_application',
      title: 'Applied for job',
      description: 'You applied for a new position',
      relatedId: jobId,
      relatedModel: 'Job'
    }).catch(err => console.log('⚠️ Activity creation failed:', err));
    
    res.json(application);
  } catch (err) {
    next(err);
  }
};

// Get my job applications
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await JobApplication.find({ user: req.user._id })
      .populate('job')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    next(err);
  }
};

// Register for an event
export const registerForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.body;
    
    // Check if already registered
    const existing = await EventRegistration.findOne({
      user: req.user._id,
      event: eventId
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }
    
    const registration = await EventRegistration.create({
      user: req.user._id,
      event: eventId,
      status: 'confirmed'
    });
    
    // Create activity
    await Activity.create({
      user: req.user._id,
      type: 'event_registration',
      title: 'Registered for event',
      description: 'You registered for a new event',
      relatedId: eventId,
      relatedModel: 'Event'
    }).catch(err => console.log('⚠️ Activity creation failed:', err));
    
    res.json(registration);
  } catch (err) {
    next(err);
  }
};

// Get my event registrations
export const getMyEventRegistrations = async (req, res, next) => {
  try {
    const registrations = await EventRegistration.find({ user: req.user._id })
      .populate('event')
      .sort({ createdAt: -1 });
    res.json(registrations);
  } catch (err) {
    next(err);
  }
};

// Connect with another user
export const connectWithUser = async (req, res, next) => {
  try {
    const { userId } = req.body;
    
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot connect with yourself' });
    }
    
    // Check if already connected
    const existing = await Connection.findOne({
      user: req.user._id,
      connectedUser: userId
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Already connected' });
    }
    
    const connection = await Connection.create({
      user: req.user._id,
      connectedUser: userId,
      status: 'pending'
    });
    
    // Create activity
    await Activity.create({
      user: req.user._id,
      type: 'connection',
      title: 'Connection request sent',
      description: 'You sent a connection request',
      relatedId: userId,
      relatedModel: 'User'
    }).catch(err => console.log('⚠️ Activity creation failed:', err));
    
    res.json(connection);
  } catch (err) {
    next(err);
  }
};

// Get my connections
export const getMyConnections = async (req, res, next) => {
  try {
    const connections = await Connection.find({ 
      user: req.user._id,
      status: 'accepted'
    })
      .populate('connectedUser', '-password')
      .sort({ createdAt: -1 });
    res.json(connections);
  } catch (err) {
    next(err);
  }
};

export default {
  getMe,
  updateMe,
  getDashboardStats,
  getRecentActivity,
  getUserNotifications,
  markNotificationRead,
  uploadResume,
  getMyResumes,
  deleteResume,
  listMembers,
  getMember,
  saveJob,
  getSavedJobs,
  applyForJob,
  getMyApplications,
  registerForEvent,
  getMyEventRegistrations,
  connectWithUser,
  getMyConnections
};