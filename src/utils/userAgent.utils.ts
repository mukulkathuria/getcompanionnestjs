interface userAgentDetailsType {
  browser: null | string;
  version: null | string;
  os: null | string;
  device: null | string;
}

export function isEqualObject(obj1: object, obj2: object) {
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
      return obj1 === obj2;
  }

  let keys1 = Object.keys(obj1);
  let keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
      return false;
  }

  for (let key of keys1) {
      if (!keys2.includes(key) || !isEqualObject(obj1[key], obj2[key])) {
          return false;
      }
  }
  return true;
}


export const getUserAgentDetails = (userAgent: string) => {
  const userAgentDetails: userAgentDetailsType = {
    browser: null,
    version: null,
    os: null,
    device: null,
  };

  if (userAgent.includes('Chrome')) {
    userAgentDetails.browser = 'Chrome';
    userAgentDetails.version = userAgent.split('Chrome/')[1].split(' ')[0];
  } else if (userAgent.includes('Firefox')) {
    userAgentDetails.browser = 'Firefox';
    userAgentDetails.version = userAgent.split('Firefox/')[1];
  } else if (userAgent.includes('Safari')) {
    userAgentDetails.browser = 'Safari';
    userAgentDetails.version = userAgent.split('Version/')[1].split(' ')[0];
  } else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
    userAgentDetails.browser = 'Internet Explorer';
    userAgentDetails.version = userAgent.includes('MSIE')
      ? userAgent.split('MSIE ')[1].split(';')[0]
      : userAgent.split('rv:')[1].split(')')[0];
  } else if (userAgent.includes('Postman')) {
    userAgentDetails.browser = 'Postman';
    userAgentDetails.version = userAgent.split('PostmanRuntime/')[1];
  } else {
    userAgentDetails.browser = 'Unknown';
  }

  if (userAgent.includes('Windows')) {
    userAgentDetails.os = 'Windows';
  } else if (userAgent.includes('Macintosh')) {
    userAgentDetails.os = 'Mac OS';
  } else if (userAgent.includes('Linux')) {
    userAgentDetails.os = 'Linux';
  } else if (userAgent.includes('iPhone')) {
    userAgentDetails.os = 'iOS (iPhone)';
  } else if (userAgent.includes('iPad')) {
    userAgentDetails.os = 'iOS (iPad)';
  } else if (userAgent.includes('Android')) {
    userAgentDetails.os = 'Android';
  } else {
    userAgentDetails.os = 'Unknown OS';
  }

  if (userAgent.includes('Mobile')) {
    userAgentDetails.device = 'Mobile';
  } else if (userAgent.includes('Postman')) {
    userAgentDetails.device = 'Postman';
  } else {
    userAgentDetails.device = 'Desktop';
  }

  return userAgentDetails;
};
