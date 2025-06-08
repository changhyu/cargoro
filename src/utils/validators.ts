// 유효성 검증 유틸리티
export const validators = {
  // 이메일 검증
  isEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // 전화번호 검증 (한국)
  isPhoneNumber: (phone: string): boolean => {
    // 하이픈 제거
    const cleanPhone = phone.replace(/-/g, '');

    // 정확한 패턴 매칭: 01X-XXXX-XXXX 또는 01X-XXX-XXXX
    // 010은 무조건 11자리, 나머지는 10자리 또는 11자리
    const phoneRegex = /^01[0-9]\d{7,8}$/;

    if (!phoneRegex.test(cleanPhone)) {
      return false;
    }

    // 010은 반드시 11자리여야 함
    if (cleanPhone.startsWith('010') && cleanPhone.length !== 11) {
      return false;
    }

    // 전체 길이는 10자리 또는 11자리여야 함
    if (cleanPhone.length !== 10 && cleanPhone.length !== 11) {
      return false;
    }

    return true;
  },

  // 비밀번호 강도 검증
  isStrongPassword: (password: string): boolean => {
    // 최소 8자
    if (password.length < 8) return false;

    // 대문자 포함
    if (!/[A-Z]/.test(password)) return false;

    // 소문자 포함
    if (!/[a-z]/.test(password)) return false;

    // 숫자 포함
    if (!/\d/.test(password)) return false;

    // 특수문자 포함
    if (!/[@$!%*?&#]/.test(password)) return false;

    return true;
  },

  // URL 검증
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // 신용카드 번호 검증 (Luhn 알고리즘)
  isValidCreditCard: (cardNumber: string): boolean => {
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  },
};

// 배열 유틸리티
export const arrayUtils = {
  // 중복 제거
  unique: <T>(arr: T[]): T[] => {
    return [...new Set(arr)];
  },

  // 배열 섞기
  shuffle: <T>(arr: T[]): T[] => {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  },

  // 청크로 나누기
  chunk: <T>(arr: T[], size: number): T[][] => {
    if (size <= 0) throw new Error('청크 크기는 0보다 커야 합니다');

    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  },

  // 그룹화
  groupBy: <T, K extends string | number>(arr: T[], getKey: (item: T) => K): Record<K, T[]> => {
    return arr.reduce(
      (groups, item) => {
        const key = getKey(item);
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(item);
        return groups;
      },
      {} as Record<K, T[]>
    );
  },

  // 교집합
  intersection: <T>(arr1: T[], arr2: T[]): T[] => {
    const set2 = new Set(arr2);
    return arr1.filter(x => set2.has(x));
  },

  // 차집합
  difference: <T>(arr1: T[], arr2: T[]): T[] => {
    const set2 = new Set(arr2);
    return arr1.filter(x => !set2.has(x));
  },
};

// 객체 유틸리티
export const objectUtils = {
  // 깊은 복사
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as T;
    if (obj instanceof Array) {
      return obj.map(item => objectUtils.deepClone(item)) as T;
    }
    if (obj instanceof Object) {
      const clonedObj: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = objectUtils.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
    return obj;
  },

  // 객체 병합
  deepMerge: <T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T => {
    if (!sources.length) return target;

    const source = sources.shift();
    if (!source) return target;

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          objectUtils.deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return objectUtils.deepMerge(target, ...sources);
  },

  // 객체에서 특정 키 선택
  pick: <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  },

  // 객체에서 특정 키 제외
  omit: <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result as Omit<T, K>;
  },
};
