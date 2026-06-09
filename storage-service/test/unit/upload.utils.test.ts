import path from 'path';
import { getStoredRelativePath } from '../../src/utils/upload';

describe('upload utils', () => {
  it('getStoredRelativePath monta caminho relativo em uploads/user-images', () => {
    const relative = getStoredRelativePath('foto-teste.png');
    expect(relative).toBe(path.join('uploads', 'user-images', 'foto-teste.png'));
  });
});
