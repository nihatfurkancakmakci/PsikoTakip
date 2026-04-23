import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EncryptionService } from './encryption.service';

const mockConfig = {
  getOrThrow: jest.fn().mockReturnValue('test-32-byte-encryption-key12345'),
};

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncryptionService,
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();
    service = module.get<EncryptionService>(EncryptionService);
  });

  it('şifreler ve şifre çözer (round-trip)', () => {
    const plain = 'Gizli seans notu içeriği - KVKK uyumlu';
    const { encrypted, iv } = service.encrypt(plain);
    expect(encrypted).not.toBe(plain);
    expect(iv).toHaveLength(32);
    const decrypted = service.decrypt(encrypted, iv);
    expect(decrypted).toBe(plain);
  });

  it('her şifreleme farklı IV üretir', () => {
    const text = 'aynı metin';
    const { iv: iv1 } = service.encrypt(text);
    const { iv: iv2 } = service.encrypt(text);
    expect(iv1).not.toBe(iv2);
  });

  it('yanlış IV ile şifre çözme hata fırlatır', () => {
    const { encrypted } = service.encrypt('test');
    expect(() => service.decrypt(encrypted, 'a'.repeat(32))).toThrow();
  });
});
