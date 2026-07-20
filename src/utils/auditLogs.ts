import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export type AuditEventType = 'login' | 'signup' | 'test_start' | 'test_submit' | 'admin_action' | 'security_event';

export const logAuditEvent = async (
  userId: string,
  event: AuditEventType,
  details: any = {}
) => {
  try {
    await addDoc(collection(db, 'audit_logs'), {
      userId,
      event,
      details,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    });
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
};
