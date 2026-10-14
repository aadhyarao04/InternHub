import notificationService from '../services/notification.service.js';
import { sendSuccess } from '../utils/response.js';

export const getNotifications = async (req, res, next) => {
  try {
    const data = await notificationService.getUserNotifications(req.user.id, req.query);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const data = await notificationService.getUnreadCount(req.user.id);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const data = await notificationService.markAsRead(req.user.id, req.params.id);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const data = await notificationService.markAllAsRead(req.user.id);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const data = await notificationService.deleteNotification(req.user.id, req.params.id);
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
