import Notification from '../models/Notification.js';
import { AppError } from '../middleware/errorHandler.js';

let ioInstance = null;

export const setSocketIO = (io) => {
  ioInstance = io;
};

export const createNotification = async ({ userId, type, title, message, relatedEntity = {} }) => {
  const notification = await Notification.create({
    userId,
    type,
    title,
    message,
    relatedEntity: {
      entityType: relatedEntity.type || '',
      id: relatedEntity.id || null
    }
  });

  // Emit real-time notification via Socket.IO if active
  if (ioInstance) {
    ioInstance.to(userId.toString()).emit('notification:new', notification);
  }

  return notification;
};

export const getUserNotifications = async (userId, query = {}) => {
  const { page = 1, limit = 20, unreadOnly } = query;
  const filter = { userId };
  if (unreadOnly === 'true') filter.isRead = false;

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const total = await Notification.countDocuments(filter);

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10));

  const unreadCount = await Notification.countDocuments({ userId, isRead: false });

  return {
    notifications,
    unreadCount,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      pages: Math.ceil(total / parseInt(limit, 10))
    }
  };
};

export const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({ userId, isRead: false });
  return { unreadCount: count };
};

export const markAsRead = async (userId, notificationId) => {
  const notification = await Notification.findOne({ _id: notificationId, userId });
  if (!notification) throw new AppError('Notification not found or unauthorized.', 404);

  notification.isRead = true;
  await notification.save();
  return notification;
};

export const markAllAsRead = async (userId) => {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
  return { message: 'All notifications marked as read.' };
};

export const deleteNotification = async (userId, notificationId) => {
  const notification = await Notification.findOneAndDelete({ _id: notificationId, userId });
  if (!notification) throw new AppError('Notification not found or unauthorized.', 404);
  return { message: 'Notification deleted successfully.' };
};

export default {
  setSocketIO,
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
