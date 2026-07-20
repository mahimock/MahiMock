const fs = require('fs');
let code = fs.readFileSync('src/pages/Login.tsx', 'utf8');

code = code.replace("import { signInWithEmailAndPassword } from 'firebase/auth';", "import { signInWithEmailAndPassword } from 'firebase/auth';\nimport { sendWelcomeBackNotification } from '../utils/sendWelcomeNotification';");

code = code.replace("await signInWithEmailAndPassword(auth, email, password);", "const userCred = await signInWithEmailAndPassword(auth, email, password);\n      await sendWelcomeBackNotification(userCred.user);");

code = code.replace("await signInWithGoogle();", "const user = await signInWithGoogle();\n      if (user) await sendWelcomeBackNotification(user);");

fs.writeFileSync('src/pages/Login.tsx', code);
