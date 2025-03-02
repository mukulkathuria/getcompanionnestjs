export const OTPData = {
  data: {},

  get(userId: string) {
    if (!userId) {
      return { error: 'UserId is required' };
    } else if (userId && OTPData.data[userId]) {
      return { data: OTPData.data[userId] };
    }
    return { data: null };
  },

  set(key: string, value: any, ttl?: number) {
    if (!key || !value) {
      return { error: 'invalid values' };
    }
    const date = new Date().setSeconds(new Date().getSeconds() + ttl || 600);
    OTPData.data[key] = {
      ...value,
      exp: date.valueOf(),
    };
    return { success: true };
  },

  checkValidOTP(userId: string, otp: string) {
    if (!userId || !OTPData.data[userId]) {
      return { error: 'invalid user' };
    } else if (OTPData.data[userId].otp !== otp) {
      return { error: 'OTP mismatched' };
    }
    delete OTPData.data[userId];
    return { success: true };
  },

  removeExpiredData(id: string) {
    if (!id) {
      return { error: 'Not valid data' };
    } else if (OTPData.data[id] && OTPData.data[id]?.exp < Date.now()) {
      delete OTPData.data[id];
      return { success: true };
    }
    return { data: true };
  },

  removeTempData(id: string) {
    if (!id) {
      return { error: 'Not Valid' };
    }
    delete OTPData.data[id];
    return { success: true };
  },
};
