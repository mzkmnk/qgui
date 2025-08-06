import { Test, TestingModule } from '@nestjs/testing';
import { CommandFilterService } from './command-filter.service';

describe('CommandFilterService', () => {
  let service: CommandFilterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommandFilterService],
    }).compile();

    service = module.get<CommandFilterService>(CommandFilterService);
  });

  it('インスタンスが作成される', () => {
    expect(service).toBeDefined();
  });

  describe('isSafe', () => {
    it('危険なコマンドをブロックする', () => {
      const dangerous = [
        'rm -rf /',
        'sudo rm -rf',
        'mkfs',
        'dd if=/dev/zero of=/dev/sda',
        'chmod -R 777 /',
        'chown -R root /',
        ':(){ :|:& };:', // fork bomb
        'rm -rf ~',
        'rm -rf .',
        'rm -rf *',
      ];

      dangerous.forEach((cmd) => {
        expect(service.isSafe(cmd)).toBe(false);
      });
    });

    it('安全なコマンドを許可する', () => {
      const safe = [
        'ls',
        'pwd',
        'cd /home/user',
        'git status',
        'npm install',
        'echo "Hello World"',
        'cat file.txt',
        'grep pattern file.txt',
        'mkdir new-folder',
        'cp file1 file2',
      ];

      safe.forEach((cmd) => {
        expect(service.isSafe(cmd)).toBe(true);
      });
    });

    it('sudoコマンドをブロックする', () => {
      const sudoCommands = [
        'sudo ls',
        'sudo apt-get update',
        'sudo systemctl restart',
        'sudo -i',
      ];

      sudoCommands.forEach((cmd) => {
        expect(service.isSafe(cmd)).toBe(false);
      });
    });

    it('システムファイル変更コマンドをブロックする', () => {
      const systemCommands = [
        'mkfs.ext4 /dev/sda1',
        'fdisk /dev/sda',
        'parted /dev/sda',
        'mount /dev/sda1 /mnt',
        'umount /mnt',
      ];

      systemCommands.forEach((cmd) => {
        expect(service.isSafe(cmd)).toBe(false);
      });
    });

    it('空文字列やnullは安全とみなす', () => {
      expect(service.isSafe('')).toBe(true);
      expect(service.isSafe(null as unknown as string)).toBe(true);
      expect(service.isSafe(undefined as unknown as string)).toBe(true);
    });
  });

  describe('sanitize', () => {
    it('危険なコマンドを無害化する', () => {
      expect(service.sanitize('rm -rf /')).toBe('# Dangerous command blocked');
      expect(service.sanitize('sudo rm -rf')).toBe(
        '# Dangerous command blocked',
      );
    });

    it('安全なコマンドはそのまま返す', () => {
      expect(service.sanitize('ls -la')).toBe('ls -la');
      expect(service.sanitize('git status')).toBe('git status');
    });
  });
});