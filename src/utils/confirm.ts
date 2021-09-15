/**
 * Confirm action.
 */
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

export async function confirm(msg: string) {
  return new Promise<boolean>(resolve => {
    rl.question(msg, answer => {
      rl.close();
      resolve(answer === 'y');
    });
  });
}
