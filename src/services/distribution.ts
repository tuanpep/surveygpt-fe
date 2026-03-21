import { api } from './api';

export interface QRCodeOutput {
  svg: string;
  pngUrl?: string;
}

export interface EmbedCodeOutput {
  html: string;
  js: string;
}

export interface EmailList {
  id: string;
  name: string;
  contactCount: number;
  status: string;
  createdAt: string;
}

export interface EmailContact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: string;
}

export interface SendEmailsInput {
  listId: string;
  subject: string;
  body: string;
  scheduleAt?: string;
}

export interface SendEmailsOutput {
  jobId: string;
}

export async function getQRCode(surveyId: string): Promise<QRCodeOutput> {
  return api.get(`surveys/${surveyId}/qr-code`).json<QRCodeOutput>();
}

export async function getEmbedCode(
  surveyId: string,
  mode: 'popup' | 'embedded' | 'fullpage' = 'popup'
): Promise<EmbedCodeOutput> {
  return api.get(`surveys/${surveyId}/embed-code`, {
    searchParams: { mode },
  }).json<EmbedCodeOutput>();
}

export async function getEmailLists(): Promise<EmailList[]> {
  return api.get('email-lists').json<EmailList[]>();
}

export async function createEmailList(
  name: string,
  contacts: { email: string; firstName?: string; lastName?: string }[]
): Promise<EmailList> {
  return api.post('email-lists', { json: { name, contacts } }).json<EmailList>();
}

export async function deleteEmailList(id: string): Promise<void> {
  await api.delete(`email-lists/${id}`);
}

export async function sendSurveyEmails(
  surveyId: string,
  input: SendEmailsInput
): Promise<SendEmailsOutput> {
  return api.post(`surveys/${surveyId}/send-emails`, { json: input }).json<SendEmailsOutput>();
}
