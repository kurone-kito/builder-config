import { afterEach, describe, expect, it, vi } from 'vitest';
import { main } from './builder.mjs';

const mocks = vi.hoisted(() => ({
  createBuildTasks: vi.fn().mockResolvedValue({ run: vi.fn() }),
  isNativeError: vi.fn(),
  parseArgs: vi.fn(),
  usage: vi.fn(),
}));

vi.mock('node:util/types', () => ({ isNativeError: mocks.isNativeError }));

vi.mock('./listr2/createBuildTasks.mjs', () => ({
  createBuildTasks: mocks.createBuildTasks,
}));

vi.mock('./utils/parseArgs.mjs', () => ({ parseArgs: mocks.parseArgs }));

vi.mock('./utils/usage.mjs', () => ({ usage: mocks.usage }));

describe('main', () => {
  afterEach(() => vi.clearAllMocks());

  it('should call usage when --help option is passed', async () => {
    mocks.parseArgs.mockReturnValue({ help: true });
    await main('--help');
    expect(mocks.usage).toHaveBeenCalled();
  });

  it('should call usage when -h option is passed', async () => {
    mocks.parseArgs.mockReturnValue({ help: true });
    await main('-h');
    expect(mocks.usage).toHaveBeenCalled();
  });

  it('should call createBuildTasks when arguments are parsed successfully', async () => {
    const args = { help: false };
    mocks.parseArgs.mockReturnValue(args);
    await main();
    expect(mocks.createBuildTasks).toHaveBeenCalledWith(args);
  });

  it('should call the run method of the task returned by createBuildTasks', async () => {
    const run = vi.fn();
    mocks.createBuildTasks.mockResolvedValue({ run });
    mocks.parseArgs.mockReturnValue({ help: false });
    await main();
    expect(run).toHaveBeenCalled();
  });

  it('should output an error message to the console when an error occurs', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const error = new Error('test error');
    mocks.parseArgs.mockImplementation(() => {
      throw error;
    });
    mocks.isNativeError.mockReturnValue(true);
    await main();
    expect(consoleErrorSpy).toHaveBeenCalledWith('test error');
    consoleErrorSpy.mockRestore();
  });

  it('should not output an error message to the console if it is not a native error', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const error = new Error('test error');
    mocks.parseArgs.mockImplementation(() => {
      throw error;
    });
    mocks.isNativeError.mockReturnValue(false);
    await main();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should exit the process with an error code when an error occurs', async () => {
    const error = new Error('test error');
    mocks.parseArgs.mockImplementation(() => {
      throw error;
    });
    await main();
    expect(process.exitCode).toBe(1);
  });
});
