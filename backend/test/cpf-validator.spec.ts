function validarCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');

  if (digits.length !== 11) return false;

  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i], 10) * (10 - i);
  }
  let digit1 = (sum * 10) % 11;
  if (digit1 === 10) digit1 = 0;
  if (digit1 !== parseInt(digits[9], 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i], 10) * (11 - i);
  }
  let digit2 = (sum * 10) % 11;
  if (digit2 === 10) digit2 = 0;
  if (digit2 !== parseInt(digits[10], 10)) return false;

  return true;
}

function apenasDigitos(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

function formatarCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

describe('CPF Validator', () => {
  describe('validarCpf', () => {
    it('should return true for valid CPF', () => {
      expect(validarCpf('52998224725')).toBe(true);
      expect(validarCpf('12345678901')).toBe(false);
    });

    it('should return false for CPF with all same digits', () => {
      expect(validarCpf('11111111111')).toBe(false);
      expect(validarCpf('22222222222')).toBe(false);
    });

    it('should return false for CPF with wrong length', () => {
      expect(validarCpf('123')).toBe(false);
      expect(validarCpf('123456789012')).toBe(false);
    });

    it('should return false for CPF with invalid check digits', () => {
      expect(validarCpf('12345678900')).toBe(false);
      expect(validarCpf('52998224724')).toBe(false);
    });
  });

  describe('apenasDigitos', () => {
    it('should remove non-digit characters', () => {
      expect(apenasDigitos('123.456.789-01')).toBe('12345678901');
      expect(apenasDigitos('123 456 789 01')).toBe('12345678901');
      expect(apenasDigitos('12345678901')).toBe('12345678901');
    });
  });

  describe('formatarCpf', () => {
    it('should format CPF with dots and dash', () => {
      expect(formatarCpf('52998224725')).toBe('529.982.247-25');
      expect(formatarCpf('529.982.247-25')).toBe('529.982.247-25');
    });

    it('should return original if not 11 digits', () => {
      expect(formatarCpf('123')).toBe('123');
    });
  });
});