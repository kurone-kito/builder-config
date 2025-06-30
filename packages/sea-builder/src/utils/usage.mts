/** Display help message. */
export const usage = (): void =>
  console.log(
    'Usage: sea-builder --targets=<target>[,<target>[,...]] [--node=<version>] <output>',
  );
