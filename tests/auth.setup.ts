import path from 'path';
import {regenerateAuthState } from '../helper/auth.helper';

export default async function globalSetup() {
  await regenerateAuthState();
}