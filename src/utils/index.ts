export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function getCookie(name: string): string | null | undefined {
  const matches = document.cookie.match(
    new RegExp(
      "(?:^|; )" +
        // eslint-disable-next-line no-useless-escape
        name.replace(/([\.$?*|{}()\[\]\\\/\+^])/g, "\\$1") +
        "=([^;]*)"
    )
  );
  return matches ? decodeURIComponent(matches[1]) : null;
}

export interface CookieOptions {
  path?: string;
  domain?: string;
  expires?: Date | number | string;
  maxAge?: number;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): void {
  const defaultOptions: CookieOptions = {
    path: "/",
    secure: window.location.protocol === "https:",
    sameSite: "lax",
  };

  const mergedOptions: CookieOptions = { ...defaultOptions, ...options };
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (mergedOptions.expires) {
    let expiresDate: Date;

    if (typeof mergedOptions.expires === "number") {
      // Число дней
      expiresDate = new Date();
      expiresDate.setDate(expiresDate.getDate() + mergedOptions.expires);
    } else if (typeof mergedOptions.expires === "string") {
      // Строка даты
      expiresDate = new Date(mergedOptions.expires);
    } else {
      // Объект Date
      expiresDate = mergedOptions.expires;
    }

    cookieString += `; expires=${expiresDate.toUTCString()}`;
  }

  if (mergedOptions.maxAge !== undefined) {
    cookieString += `; max-age=${mergedOptions.maxAge}`;
  }

  if (mergedOptions.path) {
    cookieString += `; path=${mergedOptions.path}`;
  }

  // Обработка domain
  if (mergedOptions.domain) {
    cookieString += `; domain=${mergedOptions.domain}`;
  }

  // Обработка secure
  if (mergedOptions.secure) {
    cookieString += "; secure";
  }

  // Обработка sameSite
  if (mergedOptions.sameSite) {
    cookieString += `; samesite=${mergedOptions.sameSite}`;

    // Для sameSite=none требуется secure
    if (mergedOptions.sameSite === "none" && !mergedOptions.secure) {
      console.warn('Cookie with sameSite="none" must also be marked as secure');
    }
  }

  // httpOnly не может быть установлен через JavaScript
  // Это серверный флаг, но добавим для полноты интерфейса
  if (mergedOptions.httpOnly) {
    console.warn(
      "httpOnly flag cannot be set via JavaScript. It must be set server-side."
    );
  }

  document.cookie = cookieString;
}

export function deleteCookie(name: string): void {
  setCookie(name, "", {
    maxAge: -1,
  });
}
