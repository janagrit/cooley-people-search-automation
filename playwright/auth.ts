import path from 'path';

// Storage state written by tests/vanilla/auth.setup.ts and reused by the
// vanilla-dashboard project so authenticated tests skip the login UI.
export const authFile = path.resolve(__dirname, '.auth/user.json');
