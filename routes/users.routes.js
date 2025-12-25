// import express from 'express';
// import { auth } from '../middleware/auth.middleware.js';
// import upload from '../utils/upload.js';
// import UserController from '../controllers/user.controller.js';

// const router = express.Router();

// // Profile
// router.get('/me', auth, UserController.getMe);
// router.put('/me', auth, UserController.updateMe);

// // Dashboard
// router.get('/dashboard/stats', auth, UserController.getDashboardStats);
// router.get('/dashboard/activity', auth, UserController.getRecentActivity);

// // Notifications
// router.get('/notifications', auth, UserController.getUserNotifications);
// router.patch('/notifications/:id/read', auth, UserController.markNotificationRead);

// // Resume
// router.post('/me/resume', auth, upload.single('file'), UserController.uploadResume);
// router.get('/me/resumes', auth, UserController.getMyResumes);
// router.delete('/me/resumes/:id', auth, UserController.deleteResume);

// // Jobs
// router.post('/jobs/save', auth, UserController.saveJob);
// router.get('/jobs/saved', auth, UserController.getSavedJobs);
// router.post('/jobs/apply', auth, UserController.applyForJob);
// router.get('/jobs/applications', auth, UserController.getMyApplications);

// // Events
// router.post('/events/register', auth, UserController.registerForEvent);
// router.get('/events/registrations', auth, UserController.getMyEventRegistrations);

// // Connections
// router.post('/connections', auth, UserController.connectWithUser);
// router.get('/connections', auth, UserController.getMyConnections);

// // Public routes
// router.get('/members', UserController.listMembers);
// router.get('/members/:id', UserController.getMember);

// export default router;


// import express from 'express';
// import { auth } from '../middleware/auth.middleware.js';
// import upload from '../utils/upload.js';
// import {
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
// } from '../controllers/user.controller.js';

// const router = express.Router();

// // Profile
// router.get('/me', auth, getMe);
// router.put('/me', auth, updateMe);

// // Dashboard
// router.get('/dashboard/stats', auth, getDashboardStats);
// router.get('/dashboard/activity', auth, getRecentActivity);

// // Notifications
// router.get('/notifications', auth, getUserNotifications);
// router.patch('/notifications/:id/read', auth, markNotificationRead);

// // Resume
// router.post('/me/resume', auth, upload.single('resume'), uploadResume);
// router.get('/me/resumes', auth, getMyResumes);
// router.delete('/me/resumes/:id', auth, deleteResume);

// // Jobs
// router.post('/jobs/save', auth, saveJob);
// router.get('/jobs/saved', auth, getSavedJobs);
// router.post('/jobs/apply', auth, applyForJob);
// router.get('/jobs/applications', auth, getMyApplications);

// // Events
// router.post('/events/register', auth, registerForEvent);
// router.get('/events/registrations', auth, getMyEventRegistrations);

// // Connections
// router.post('/connections', auth, connectWithUser);
// router.get('/connections', auth, getMyConnections);

// // Public routes
// router.get('/members', listMembers);
// router.get('/members/:id', getMember);

// export default router;


import express from 'express';
import { auth } from '../middleware/auth.middleware.js';
import upload from '../utils/upload.js';
import {
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
} from '../controllers/user.controller.js';

const router = express.Router();

// Profile
router.get('/me', auth, getMe);
router.put('/me', auth, updateMe);

// Dashboard
router.get('/dashboard/stats', auth, getDashboardStats);
router.get('/dashboard/activity', auth, getRecentActivity);

// Notifications
router.get('/notifications', auth, getUserNotifications);
router.patch('/notifications/:id/read', auth, markNotificationRead);

// Resume
router.post('/me/resume', auth, upload.single('resume'), uploadResume);
router.get('/me/resumes', auth, getMyResumes);
router.delete('/me/resumes/:id', auth, deleteResume);

// Jobs
router.post('/jobs/save', auth, saveJob);
router.get('/jobs/saved', auth, getSavedJobs);
router.post('/jobs/apply', auth, applyForJob);
router.get('/jobs/applications', auth, getMyApplications);

// Events
router.post('/events/register', auth, registerForEvent);
router.get('/events/registrations', auth, getMyEventRegistrations);

// Connections
router.post('/connections', auth, connectWithUser);
router.get('/connections', auth, getMyConnections);

// Public routes
router.get('/members', listMembers);
router.get('/members/:id', getMember);

export default router;