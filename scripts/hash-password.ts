// Prints an ADMIN_PASSWORD_HASH value: pnpm admin:hash 'your password'
import { hashPassword } from "../src/lib/password";

const password = process.argv[2];
if (!password || password.length < 12) {
  console.error("Usage: pnpm admin:hash '<password of at least 12 characters>'");
  process.exit(1);
}
hashPassword(password).then((h) => console.log(h));
