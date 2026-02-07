import { post } from './api';
import type { ContactSubmission, ContactFormData } from '@/types';

export const contactApi = {
  submit: (data: ContactFormData) => post<ContactSubmission>('/contact', data),
};
