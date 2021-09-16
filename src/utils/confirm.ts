/**
 * Confirm action.
 */
import readline from 'readline';

export async function confirm(msg: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  const question = (msg: string) => new Promise(resolve => rl.question(msg, resolve));
  try {
    const answer = await question(msg);
    return answer === 'y';
  } finally {
    rl.close();
  }
}
